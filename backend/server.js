require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { initSqlDatabase } = require('./src/sqlDatabase');

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const AUTH_COOKIE_NAME = 'scholartech_session';
const IS_PROD = process.env.NODE_ENV === 'production';
const SCHOOL_DOMAINS = ['@truongdaihoc.edu.vn', '@school.edu.vn'];
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 25;
const LOGIN_LOCK_AFTER_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const ROADMAP_DURATION_DAYS = 14;
const CAREER_DATA_DIR = path.join(__dirname, 'data');
const CAREER_DATA_FILE = path.join(CAREER_DATA_DIR, 'career-db.json');
const LEARNING_DATA_FILE = path.join(CAREER_DATA_DIR, 'learning-db.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'career');

fs.mkdirSync(CAREER_DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/i.test(origin);
    return callback(null, isAllowed);
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
      cb(null, `${req.user?.id || 'anonymous'}-${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Chỉ cho phép upload PDF, JPG hoặc PNG.'), allowed.includes(file.mimetype));
  },
});

let users = [];
let classes = [];
let lecturerGrades = [];
let notifications = [];
let profileUpdateRequests = [];
const roadmapStore = new Map();
const auditLogs = [];
const failedLoginLogs = [];
const loginRateLimitStore = new Map();
const accountSecurityStore = new Map();
let careerDb = {
  careerProfiles: [],
  careerSkills: [],
  studentProjects: [],
  studentExperiences: [],
  careerReviews: [],
  jobs: [],
  jobMatches: [],
  careerSupportLogs: [],
};
let learningDb = {
  faculties: [],
  majors: [],
  semesters: [],
  courses: [],
  courseClasses: [],
  lessons: [],
  lessonProgress: [],
  assignments: [],
  questions: [],
  submissions: [],
  answers: [],
  grades: [],
  gradeHistories: [],
  certificates: [],
  achievements: [],
  studentProfiles: [],
  aiLogs: [],
  activityLogs: [],
  teacherStudentNotes: [],
  studentLearningStatuses: [],
  teacherNotifications: [],
  studentAiAnalyses: [],
};
let sqlDb = null;

const normalizeIdentifier = (value = '') => value.toLowerCase().trim();
const isSchoolEmail = (email) => SCHOOL_DOMAINS.some((domain) => email.endsWith(domain));

const parseCookies = (cookieHeader = '') => Object.fromEntries(
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return [part, ''];
      return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
    })
);

const setSessionCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
  });
};

const attachUserMethods = (user) => {
  user.comparePassword = async (password) => bcrypt.compare(password, user.passwordHash);
  user.toSafeJSON = function toSafeJSON() {
    const { passwordHash, comparePassword, ...rest } = this;
    return rest;
  };
  return user;
};

const createUserRecord = async ({ id, accountId, fullName, email, password, role, status = 'active', phone = '', department = '', address = '', hometown = '' }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return attachUserMethods({
    id,
    accountId,
    fullName,
    email: normalizeIdentifier(email),
    passwordHash,
    role,
    status,
    phone,
    department,
    address,
    hometown,
    notificationPreferences: {
      email: true,
      inApp: true,
      academic: true,
      security: true,
    },
    themePreference: 'light',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null,
  });
};

const toPublicUser = (user) => ({
  id: user.id,
  accountId: user.accountId,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
  phone: user.phone || '',
  department: user.department || '',
  address: user.address || '',
  hometown: user.hometown || '',
  notificationPreferences: user.notificationPreferences || { email: true, inApp: true, academic: true, security: true },
  themePreference: user.themePreference || 'light',
});

const toSqlPublicUser = (user, profile = null) => ({
  id: user.id,
  accountId: profile?.studentCode || profile?.teacherCode || user.email,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  phone: user.phone || '',
  avatar: user.avatar || '',
  lastLogin: user.updatedAt || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getSqlUserProfile = async (user) => {
  if (!sqlDb) return null;
  if (user.role === 'student') return sqlDb.models.Student.findOne({ where: { userId: user.id } });
  if (['lecturer', 'teacher', 'admin', 'super_admin'].includes(user.role)) return sqlDb.models.Teacher.findOne({ where: { userId: user.id } });
  return null;
};

const sqlStudentByUserId = async (userId) => sqlDb.models.Student.findOne({ where: { userId }, include: [{ model: sqlDb.models.User }] });
const sqlStudentPayload = (student) => ({
  id: student.id,
  userId: student.userId,
  fullName: student.User?.fullName || '',
  email: student.User?.email || '',
  phone: student.User?.phone || '',
  studentCode: student.studentCode,
  faculty: student.faculty,
  major: student.major,
  className: student.className,
  courseYear: student.courseYear,
  gpa: student.gpa,
  academicStatus: student.academicStatus,
});

const sqlCalculateCareerScore = async (studentId, profile = null) => {
  const [grades, certificates, achievements] = await Promise.all([
    sqlDb.models.Grade.findAll({ where: { studentId } }),
    sqlDb.models.Certificate.findAll({ where: { studentId, status: 'approved' } }),
    sqlDb.models.Achievement.findAll({ where: { studentId, status: 'approved' } }),
  ]);
  const avg = grades.length ? grades.reduce((sum, grade) => sum + Number(grade.totalScore || 0), 0) / grades.length : 0;
  const academicScore = Math.min(100, Math.round((avg / 10) * 100));
  const certificateScore = Math.min(100, certificates.length * 25);
  const achievementScore = Math.min(100, achievements.length * 25);
  const profileCompletion = profile ? [profile.desiredPosition, profile.desiredIndustry, profile.desiredLocation, profile.githubUrl, profile.linkedinUrl, profile.cvFileUrl].filter(Boolean).length * 10 : 0;
  const skillScore = Math.min(100, profileCompletion + grades.filter((grade) => Number(grade.totalScore) >= 8).length * 15);
  const projectScore = Math.min(100, profile?.githubUrl ? 40 : 0);
  const experienceScore = Math.min(100, profile?.portfolioUrl ? 30 : 0);
  const careerReadinessScore = Math.round(academicScore * 0.35 + skillScore * 0.2 + projectScore * 0.1 + certificateScore * 0.15 + achievementScore * 0.1 + experienceScore * 0.1);
  return { academicScore, skillScore, projectScore, certificateScore, achievementScore, experienceScore, careerReadinessScore };
};

const sqlTeacherStudentRows = async (teacherUserId, query = {}) => {
  const teacher = await sqlDb.models.Teacher.findOne({ where: { userId: teacherUserId } });
  if (!teacher) return [];
  const enrollments = await sqlDb.models.CourseEnrollment.findAll({
    where: { teacherId: teacher.id },
    include: [
      { model: sqlDb.models.Student, include: [{ model: sqlDb.models.User }] },
      { model: sqlDb.models.Course },
      { model: sqlDb.models.Class },
    ],
  });
  const rows = [];
  for (const enrollment of enrollments) {
    const grade = await sqlDb.models.Grade.findOne({ where: { studentId: enrollment.studentId, courseId: enrollment.courseId }, include: [{ model: sqlDb.models.Course }] });
    rows.push({
      id: `${enrollment.studentId}_${enrollment.courseId}`,
      studentId: enrollment.studentId,
      courseClassId: enrollment.id,
      courseId: enrollment.courseId,
      fullName: enrollment.Student?.User?.fullName || '',
      studentCode: enrollment.Student?.studentCode || '',
      email: enrollment.Student?.User?.email || '',
      phone: enrollment.Student?.User?.phone || '',
      className: enrollment.Class?.name || enrollment.Student?.className || '',
      courseName: enrollment.Course?.name || '',
      courseCode: enrollment.Course?.courseCode || '',
      progress: enrollment.progress || 0,
      gpa: enrollment.Student?.gpa || 0,
      averageScore: grade?.totalScore || 0,
      status: enrollment.learningStatus || 'Active',
      riskLevel: enrollment.riskLevel || 'low',
      riskReason: enrollment.riskReason || '',
      missingAssignments: enrollment.missingAssignments || 0,
      lastActivityAt: enrollment.lastActivityAt || enrollment.updatedAt,
    });
  }
  const search = String(query.q || '').toLowerCase().trim();
  return rows
    .filter((row) => (!search ? true : `${row.fullName} ${row.studentCode} ${row.email}`.toLowerCase().includes(search)))
    .filter((row) => (!query.courseId ? true : row.courseId === query.courseId))
    .filter((row) => (!query.status ? true : row.status === query.status))
    .filter((row) => (!query.minProgress ? true : row.progress >= Number(query.minProgress)))
    .filter((row) => (!query.minGpa ? true : row.gpa >= Number(query.minGpa)));
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const validatePhone = (phone) => !phone || /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(phone).trim());
const validateStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(password || ''));
const careerRoles = ['admin', 'career_officer'];

const saveCareerDb = () => {
  fs.writeFileSync(CAREER_DATA_FILE, JSON.stringify(careerDb, null, 2));
};

const loadCareerDb = () => {
  if (!fs.existsSync(CAREER_DATA_FILE)) {
    saveCareerDb();
    return;
  }
  try {
    careerDb = { ...careerDb, ...JSON.parse(fs.readFileSync(CAREER_DATA_FILE, 'utf8')) };
  } catch {
    saveCareerDb();
  }
};

const requireCareerAccess = (req, res, next) => {
  if (!req.user || !careerRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập Career Center.' });
  }
  return next();
};

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getStudentAcademicSnapshot = (studentId) => {
  const grades = [
    { courseCode: 'WEB301', courseName: 'Lập trình Web', score10: 9.1, letter: 'A' },
    { courseCode: 'DB301', courseName: 'Cơ sở dữ liệu', score10: 8.2, letter: 'B+' },
    { courseCode: 'SE401', courseName: 'Công nghệ phần mềm', score10: 8.6, letter: 'A' },
  ];
  const gpa = Math.round((grades.reduce((sum, grade) => sum + grade.score10, 0) / grades.length / 2.5) * 100) / 100;
  return {
    studentId,
    gpa,
    grades,
    topCourses: grades.filter((grade) => grade.score10 >= 8).map((grade) => grade.courseName),
  };
};

const calculateCareerScores = (profile) => {
  const academic = getStudentAcademicSnapshot(profile.studentId);
  const skills = careerDb.careerSkills.filter((skill) => skill.careerProfileId === profile.id);
  const projects = careerDb.studentProjects.filter((project) => project.careerProfileId === profile.id);
  const experiences = careerDb.studentExperiences.filter((experience) => experience.careerProfileId === profile.id);
  const hasCv = !!profile.cvFileUrl;
  const linkCount = [profile.portfolioUrl, profile.githubUrl, profile.linkedinUrl, profile.personalWebsite].filter(Boolean).length;
  const requiredFields = [profile.desiredPosition, profile.desiredIndustry, profile.desiredLocation, profile.shortTermGoal, profile.longTermGoal, hasCv, linkCount > 0, skills.length > 0, projects.length > 0];

  const academicScore = Math.min(100, Math.round((academic.gpa / 4) * 100));
  const skillScore = Math.min(100, skills.length * 14 + projects.length * 12);
  const certificateScore = Math.min(100, (profile.certificates || []).filter((item) => item.status === 'approved').length * 25 + (profile.certificates || []).length * 10);
  const achievementScore = Math.min(100, (profile.achievements || []).length * 20);
  const experienceScore = Math.min(100, experiences.length * 30);
  const profileCompletionScore = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);
  const careerReadinessScore = Math.round(academicScore * 0.2 + skillScore * 0.22 + certificateScore * 0.12 + achievementScore * 0.1 + experienceScore * 0.16 + profileCompletionScore * 0.2);

  return { academicScore, skillScore, certificateScore, achievementScore, experienceScore, profileCompletionScore, careerReadinessScore };
};

const enrichCareerProfile = (profile) => {
  const student = users.find((user) => user.id === profile.studentId);
  const academic = getStudentAcademicSnapshot(profile.studentId);
  const scores = calculateCareerScores(profile);
  Object.assign(profile, scores, { updatedAt: profile.updatedAt || new Date().toISOString() });
  return {
    ...profile,
    student: student ? buildProfileResponse(student) : null,
    academic,
    skills: careerDb.careerSkills.filter((skill) => skill.careerProfileId === profile.id),
    projects: careerDb.studentProjects.filter((project) => project.careerProfileId === profile.id),
    experiences: careerDb.studentExperiences.filter((experience) => experience.careerProfileId === profile.id),
    reviews: careerDb.careerReviews.filter((review) => review.careerProfileId === profile.id),
    supportLogs: careerDb.careerSupportLogs.filter((log) => log.careerProfileId === profile.id),
    matches: careerDb.jobMatches.filter((match) => match.careerProfileId === profile.id),
  };
};

const getOrCreateCareerProfile = (studentId) => {
  let profile = careerDb.careerProfiles.find((item) => item.studentId === studentId);
  if (!profile) {
    const now = new Date().toISOString();
    profile = {
      id: makeId('career_profile'),
      studentId,
      careerObjective: '',
      desiredPosition: '',
      desiredIndustry: '',
      desiredLocation: '',
      shortTermGoal: '',
      longTermGoal: '',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      personalWebsite: '',
      cvFileUrl: '',
      aiSummary: '',
      aiSuggestions: null,
      certificates: [],
      achievements: [],
      status: 'Draft',
      consentToShare: false,
      allowEmployerView: false,
      showGpa: true,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
    };
    careerDb.careerProfiles.push(profile);
    saveCareerDb();
  }
  return profile;
};

const createCareerLog = ({ studentId, careerProfileId, officerId, action, note }) => {
  const log = { id: makeId('career_log'), studentId, careerProfileId, officerId, action, note: note || '', createdAt: new Date().toISOString() };
  careerDb.careerSupportLogs.unshift(log);
  return log;
};

const generateCareerAi = (profile) => {
  const enriched = enrichCareerProfile(profile);
  const skillNames = enriched.skills.map((skill) => skill.skillName).slice(0, 6);
  const projectCount = enriched.projects.length;
  const expCount = enriched.experiences.length;
  const position = profile.desiredPosition || 'vị trí thực tập phù hợp';
  return {
    summary: `${enriched.student?.fullName || 'Sinh viên'} định hướng ${position}, GPA ${enriched.academic.gpa}/4.0, nổi bật ở ${enriched.academic.topCourses.join(', ') || 'các học phần chuyên ngành'}. Hồ sơ có ${skillNames.length ? `kỹ năng ${skillNames.join(', ')}` : 'nền tảng kỹ năng đang được bổ sung'}, ${projectCount} dự án cá nhân và ${expCount} kinh nghiệm liên quan.`,
    suggestions: {
      strengths: [enriched.academic.gpa >= 3.2 ? 'Nền tảng học tập tốt' : 'Có dữ liệu học tập rõ ràng', projectCount > 0 ? 'Đã có dự án để chứng minh năng lực' : 'Có thể nhanh chóng cải thiện bằng dự án cá nhân'],
      gaps: [!profile.cvFileUrl ? 'Cần upload CV PDF' : '', skillNames.length < 4 ? 'Nên bổ sung thêm kỹ năng chuyên môn' : '', projectCount < 2 ? 'Nên thêm ít nhất 2 dự án có link GitHub/demo' : ''].filter(Boolean),
      certificates: ['Chứng chỉ tiếng Anh hoặc chứng chỉ chuyên ngành liên quan', 'Chứng chỉ Git/GitHub, Web hoặc Cloud cơ bản'],
      skillsToLearn: ['Kỹ năng phỏng vấn', 'Viết CV theo vị trí mục tiêu', 'Làm việc nhóm Agile/Scrum'],
      suitableRoles: [position, 'Frontend Intern', 'Software Engineer Intern', 'IT Support Intern'],
    },
  };
};

const calculateJobMatch = (profile, job) => {
  const enriched = enrichCareerProfile(profile);
  const skills = enriched.skills.map((skill) => skill.skillName.toLowerCase());
  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const matchedSkills = requiredSkills.filter((skill) => skills.includes(String(skill).toLowerCase()));
  const skillRatio = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0.5;
  const gpaOk = !job.requiredGpa || enriched.academic.gpa >= Number(job.requiredGpa);
  const industryOk = !profile.desiredIndustry || job.industry.toLowerCase().includes(profile.desiredIndustry.toLowerCase()) || profile.desiredIndustry.toLowerCase().includes(job.industry.toLowerCase());
  const score = Math.min(100, Math.round(skillRatio * 45 + (gpaOk ? 20 : 5) + (industryOk ? 15 : 5) + Math.min(enriched.projects.length * 5, 10) + Math.min(enriched.experiences.length * 5, 10)));

  return {
    matchScore: score,
    matchReason: `${enriched.student?.fullName || 'Sinh viên'} phù hợp ${score}% với ${job.title} nhờ ${matchedSkills.length ? `kỹ năng ${matchedSkills.join(', ')}` : 'định hướng nghề nghiệp và nền tảng học tập'}${gpaOk ? ', GPA đạt yêu cầu' : ', GPA cần cải thiện để đạt yêu cầu'}.`,
    missingRequirements: requiredSkills.filter((skill) => !matchedSkills.includes(skill)),
    recommendation: score >= 75 ? 'Nên giới thiệu sinh viên cho doanh nghiệp.' : score >= 55 ? 'Có thể giới thiệu sau khi bổ sung một số điểm còn thiếu.' : 'Chưa nên giới thiệu ở thời điểm hiện tại.',
  };
};

const saveLearningDb = () => {
  fs.writeFileSync(LEARNING_DATA_FILE, JSON.stringify(learningDb, null, 2));
};

const loadLearningDb = () => {
  if (!fs.existsSync(LEARNING_DATA_FILE)) {
    saveLearningDb();
    return;
  }
  try {
    learningDb = { ...learningDb, ...JSON.parse(fs.readFileSync(LEARNING_DATA_FILE, 'utf8')) };
  } catch {
    saveLearningDb();
  }
};

const teacherRoles = ['lecturer', 'teacher'];
const adminRoles = ['admin', 'super_admin'];
const systemAdminRoles = ['admin', 'super_admin'];
const requireTeacherAccess = (req, res, next) => {
  if (!req.user || !teacherRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền giảng viên.' });
  }
  return next();
};
const requireAdminAccess = (req, res, next) => {
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền quản trị.' });
  }
  return next();
};

const logActivity = ({ userId, action, targetTable, targetId, detail }) => {
  learningDb.activityLogs.unshift({ id: makeId('activity'), userId, action, targetTable, targetId, detail: detail || '', createdAt: new Date().toISOString() });
  saveLearningDb();
};

const getStudentUser = (studentId) => users.find((user) => user.id === studentId && user.role === 'student');
const getTeacherClasses = (teacherId) => learningDb.courseClasses.filter((item) => item.teacherId === teacherId);
const getStudentCourseClasses = (studentId) => learningDb.courseClasses.filter((item) => item.studentIds.includes(studentId));
const getCoursePayload = (courseClass) => {
  const course = learningDb.courses.find((item) => item.id === courseClass.courseId);
  const teacher = users.find((user) => user.id === courseClass.teacherId);
  const semester = learningDb.semesters.find((item) => item.id === courseClass.semesterId);
  const lessons = learningDb.lessons.filter((lesson) => lesson.courseId === courseClass.courseId).sort((a, b) => a.orderIndex - b.orderIndex);
  return { ...courseClass, course, teacher: teacher ? toPublicUser(teacher) : null, semester, lessons };
};
const calculateGradeTotal = (grade) => {
  const weights = grade.weights || { attendanceScore: 0.1, assignmentScore: 0.2, midtermScore: 0.3, finalScore: 0.4, practiceScore: 0 };
  const total = Object.entries(weights).reduce((sum, [field, weight]) => sum + Number(grade[field] || 0) * Number(weight), 0);
  const rounded = Math.round(total * 10) / 10;
  const letterGrade = rounded >= 8.5 ? 'A' : rounded >= 8 ? 'B+' : rounded >= 7 ? 'B' : rounded >= 6.5 ? 'C+' : rounded >= 5.5 ? 'C' : rounded >= 5 ? 'D+' : rounded >= 4 ? 'D' : 'F';
  const status = rounded >= 5 ? 'Đạt' : rounded >= 4 ? 'Thi lại' : 'Học lại';
  return { totalScore: rounded, letterGrade, status };
};
const getStudentGrades = (studentId) => learningDb.grades.filter((grade) => grade.studentId === studentId).map((grade) => ({
  ...grade,
  course: learningDb.courses.find((course) => course.id === grade.courseId),
  semester: learningDb.semesters.find((semester) => semester.id === grade.semesterId),
}));
const buildStudentAnalytics = (studentId) => {
  const grades = getStudentGrades(studentId);
  const average = grades.length ? Math.round((grades.reduce((sum, grade) => sum + Number(grade.totalScore || 0), 0) / grades.length) * 10) / 10 : 0;
  const gpa = Math.round((average / 2.5) * 100) / 100;
  const weakCourses = grades.filter((grade) => Number(grade.totalScore || 0) < 6.5);
  const strongCourses = grades.filter((grade) => Number(grade.totalScore || 0) >= 8);
  const completedCredits = grades.filter((grade) => grade.status === 'Đạt').reduce((sum, grade) => sum + Number(grade.course?.credits || 0), 0);
  return { grades, average, gpa, weakCourses, strongCourses, completedCredits, remainingCredits: Math.max(0, 120 - completedCredits) };
};
const generateStudentRecommendation = (studentId) => {
  const analytics = buildStudentAnalytics(studentId);
  const weak = analytics.weakCourses[0];
  const focus = weak?.course?.name || 'Lập trình Web';
  return {
    summary: weak
      ? `Dựa trên kết quả môn ${focus}, bạn nên ôn lại các bài nền tảng và làm thêm quiz luyện tập trong tuần này.`
      : `Bạn đang duy trì kết quả tốt. AI đề xuất tiếp tục hoàn thành bài học đúng tiến độ và bổ sung chứng chỉ chuyên môn.`,
    focusCourses: analytics.weakCourses.map((grade) => grade.course?.name).filter(Boolean),
    tasks: ['Ôn lại bài học có quiz dưới 70%', 'Làm 2 bài luyện tập bổ sung', 'Hỏi AI các khái niệm chưa rõ', 'Cập nhật chứng chỉ/thành tích vào profile'],
    riskLevel: analytics.weakCourses.length >= 2 ? 'high' : analytics.weakCourses.length === 1 ? 'medium' : 'low',
  };
};
const buildOfficialStudentProfile = (studentId) => {
  const student = getStudentUser(studentId);
  const analytics = buildStudentAnalytics(studentId);
  const approvedCertificates = learningDb.certificates.filter((item) => item.studentId === studentId && item.status === 'approved');
  const approvedAchievements = learningDb.achievements.filter((item) => item.studentId === studentId && item.status === 'approved');
  const profile = learningDb.studentProfiles.find((item) => item.studentId === studentId) || { publicVisibility: false, showGpa: true, careerObjective: '' };
  const academicScore = Math.min(100, Math.round((analytics.gpa / 4) * 100));
  const certificateScore = Math.min(100, approvedCertificates.length * 25);
  const achievementScore = Math.min(100, approvedAchievements.length * 25);
  const skillScore = Math.min(100, analytics.strongCourses.length * 18 + approvedCertificates.length * 10);
  const careerReadinessScore = Math.round(academicScore * 0.45 + skillScore * 0.25 + certificateScore * 0.15 + achievementScore * 0.15);
  const aiSummary = `${student?.fullName || 'Sinh viên'} là sinh viên Trường Đại Nam có GPA ${analytics.gpa}/4.0, nổi bật ở ${analytics.strongCourses.map((grade) => grade.course?.name).join(', ') || 'các học phần đang học'}. Hồ sơ có ${approvedCertificates.length} chứng chỉ đã duyệt và ${approvedAchievements.length} thành tích đã duyệt.`;
  return { student: student ? buildProfileResponse(student) : null, analytics, approvedCertificates, approvedAchievements, profile, scores: { academicScore, skillScore, certificateScore, achievementScore, careerReadinessScore }, aiSummary };
};

const teacherCanAccessStudent = (teacherId, studentId) => getTeacherClasses(teacherId).some((courseClass) => courseClass.studentIds.includes(studentId));
const getTeacherStudentRows = (teacherId) => {
  const teacherClasses = getTeacherClasses(teacherId);
  const rows = [];
  teacherClasses.forEach((courseClass) => {
    const payload = getCoursePayload(courseClass);
    courseClass.studentIds.forEach((studentId) => {
      const student = getStudentUser(studentId);
      if (!student) return;
      const lessons = payload.lessons || [];
      const progressValues = lessons.map((lesson) => learningDb.lessonProgress.find((item) => item.studentId === studentId && item.lessonId === lesson.id)?.progressPercent || 0);
      const progress = Math.round(progressValues.reduce((sum, value) => sum + value, 0) / Math.max(1, progressValues.length));
      const analytics = buildStudentAnalytics(studentId);
      const grade = analytics.grades.find((item) => item.courseId === courseClass.courseId);
      const statusRecord = learningDb.studentLearningStatuses.find((item) => item.studentId === studentId && item.courseId === courseClass.courseId && item.teacherId === teacherId);
      const assignments = learningDb.assignments.filter((item) => item.courseClassId === courseClass.id);
      const submittedAssignmentIds = learningDb.submissions.filter((item) => item.studentId === studentId).map((item) => item.assignmentId);
      const missingAssignments = assignments.filter((item) => !submittedAssignmentIds.includes(item.id)).length;
      const computedStatus = statusRecord?.status || (progress < 35 || Number(grade?.totalScore || 0) < 5.5 || missingAssignments >= 2 ? 'At Risk' : progress >= 100 ? 'Completed' : 'Active');
      rows.push({
        id: `${studentId}_${courseClass.id}`,
        studentId,
        courseClassId: courseClass.id,
        courseId: courseClass.courseId,
        fullName: student.fullName,
        studentCode: student.accountId,
        email: student.email,
        phone: student.phone || '',
        className: payload.course?.className || payload.classId || 'CNTT K16',
        courseName: payload.course?.name || '',
        courseCode: payload.course?.courseCode || '',
        progress,
        gpa: analytics.gpa,
        averageScore: grade?.totalScore || analytics.average,
        status: computedStatus,
        riskLevel: statusRecord?.riskLevel || (computedStatus === 'At Risk' ? 'high' : 'low'),
        riskReason: statusRecord?.riskReason || '',
        missingAssignments,
        lastActivityAt: statusRecord?.lastActivityAt || learningDb.lessonProgress.filter((item) => item.studentId === studentId).sort((a, b) => +new Date(b.completedAt || 0) - +new Date(a.completedAt || 0))[0]?.completedAt || student.lastLogin || student.updatedAt,
        academicStatus: buildProfileResponse(student).accountStatus,
      });
    });
  });
  return rows;
};
const getTeacherStudentDetail = (teacherId, studentId) => {
  if (!teacherCanAccessStudent(teacherId, studentId)) return null;
  const student = getStudentUser(studentId);
  const rows = getTeacherStudentRows(teacherId).filter((row) => row.studentId === studentId);
  const officialProfile = buildOfficialStudentProfile(studentId);
  return { student: student ? buildProfileResponse(student) : null, rows, officialProfile, certificates: learningDb.certificates.filter((item) => item.studentId === studentId), achievements: learningDb.achievements.filter((item) => item.studentId === studentId) };
};
const analyzeTeacherStudent = (teacherId, studentId) => {
  const detail = getTeacherStudentDetail(teacherId, studentId);
  if (!detail) return null;
  const rows = detail.rows;
  const weakRows = rows.filter((row) => row.status === 'At Risk' || row.averageScore < 6 || row.progress < 50);
  const summary = weakRows.length
    ? `Sinh viên ${detail.student.fullName} có ${weakRows.length} môn cần hỗ trợ. Tiến độ thấp nhất ${Math.min(...rows.map((row) => row.progress))}%, điểm trung bình hiện tại ${detail.officialProfile.analytics.average}.`
    : `Sinh viên ${detail.student.fullName} đang duy trì tiến độ ổn định với GPA ${detail.officialProfile.analytics.gpa}.`;
  return {
    analysisSummary: summary,
    weakPoints: weakRows.map((row) => `${row.courseName}: tiến độ ${row.progress}%, điểm ${row.averageScore}`),
    recommendations: weakRows.length ? ['Nhắc hoàn thành bài học chưa xong', 'Giao thêm quiz luyện tập', 'Hẹn trao đổi 1-1 trong tuần', 'Gợi ý ôn lại tài liệu nền tảng'] : ['Tiếp tục theo dõi tiến độ', 'Khuyến khích làm thêm dự án/chứng chỉ'],
    riskLevel: weakRows.length >= 2 ? 'high' : weakRows.length === 1 ? 'medium' : 'low',
  };
};

const buildProfileResponse = (user) => ({
  ...toPublicUser(user),
  code: user.accountId,
  studentCode: user.accountId,
  dateOfBirth: user.dateOfBirth || '2003-01-01',
  gender: user.gender || 'Khác',
  faculty: user.department || 'Khoa Công nghệ thông tin',
  major: user.role === 'student' ? 'Công nghệ thông tin' : user.department || 'Đào tạo',
  className: user.role === 'student' ? 'CNTT K16' : 'Phòng đào tạo',
  cohort: user.role === 'student' ? '2023 - 2027' : 'N/A',
  currentAddress: user.address || 'Chưa cập nhật',
  accountStatus: user.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa',
});

const buildUpdateItems = (currentProfile, nextProfile) => {
  const labels = { hometown: 'Quê quán', currentAddress: 'Địa chỉ hiện tại', phone: 'Số điện thoại', email: 'Email' };
  return Object.keys(labels)
    .filter((field) => String(currentProfile[field] || '') !== String(nextProfile[field] || ''))
    .map((field) => ({ field, label: labels[field], oldValue: currentProfile[field] || '', newValue: nextProfile[field] || '' }));
};

const getDashboardPath = (role) => {
  if (role === 'super_admin') return '/admin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'career_officer') return '/career/dashboard';
  if (role === 'lecturer') return '/lecturer/dashboard';
  return '/student/dashboard';
};

const signSessionToken = (user) => jwt.sign(
  {
    sub: user.id,
    role: user.role,
    email: user.email,
    status: user.status,
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const getRoadmapKey = (userId, targetCourseId) => `${userId}:${targetCourseId}`;

const pushAuditLog = ({ actorId, actorRole, action, targetType, targetId, detail }) => {
  auditLogs.unshift({
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    actorId,
    actorRole,
    action,
    targetType,
    targetId,
    detail,
    createdAt: new Date().toISOString(),
  });
};

const pushFailedLoginLog = ({ identifier, ip }) => {
  failedLoginLogs.unshift({
    id: `fail_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    identifier,
    ip,
    createdAt: new Date().toISOString(),
  });
};

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = loginRateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    loginRateLimitStore.set(ip, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (current.count >= LOGIN_RATE_LIMIT_MAX) {
    return res.status(429).json({ success: false, message: 'Yêu cầu đăng nhập tạm thời bị giới hạn. Vui lòng thử lại sau.' });
  }

  current.count += 1;
  loginRateLimitStore.set(ip, current);
  return next();
};

const registerFailedAttempt = (identifier) => {
  const key = normalizeIdentifier(identifier);
  const record = accountSecurityStore.get(key) || { failedCount: 0, lockedUntil: 0 };
  record.failedCount += 1;
  if (record.failedCount >= LOGIN_LOCK_AFTER_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOGIN_LOCK_MS;
  }
  accountSecurityStore.set(key, record);
};

const clearFailedAttempts = (identifier) => {
  accountSecurityStore.delete(normalizeIdentifier(identifier));
};

const isIdentifierLocked = (identifier) => {
  const record = accountSecurityStore.get(normalizeIdentifier(identifier));
  if (!record) return false;
  if (record.lockedUntil <= Date.now()) {
    accountSecurityStore.delete(normalizeIdentifier(identifier));
    return false;
  }
  return true;
};

const findUserByIdentifier = (identifier) => {
  const normalized = normalizeIdentifier(identifier);
  return users.find((user) => user.email === normalized || normalizeIdentifier(user.accountId) === normalized);
};

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const bearer = req.headers.authorization?.replace('Bearer ', '');
    const token = cookies[AUTH_COOKIE_NAME] || bearer;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tiếp tục.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (sqlDb) {
      const user = await sqlDb.models.User.findByPk(payload.sub);
      if (!user || user.status !== 'active') {
        clearSessionCookie(res);
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ.' });
      }
      const profile = await getSqlUserProfile(user);
      req.user = toSqlPublicUser(user, profile);
      req.sqlUser = user;
      req.sqlProfile = profile;
      return next();
    }
    const user = users.find((item) => item.id === payload.sub && item.status === 'active');
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ.' });
    }

    req.user = toPublicUser(user);
    req.userRecord = user;
    return next();
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập tài nguyên này.' });
  }
  return next();
};

const requireOwnershipOrRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tiếp tục.' });
  }
  if (roles.includes(req.user.role) || req.user.id === req.params.id || req.user.id === req.query.userId) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập tài nguyên này.' });
};

const buildUserClassCount = (user) => {
  if (user.role === 'lecturer') {
    return classes.filter((classroom) => classroom.teacherId === user.id).length;
  }
  if (user.role === 'student') {
    return classes.filter((classroom) => classroom.studentIds.includes(user.id)).length;
  }
  return 0;
};

const buildClassResponse = (classroom) => {
  const lecturer = users.find((user) => user.id === classroom.teacherId && user.role === 'lecturer');
  const students = classroom.studentIds
    .map((studentId) => users.find((user) => user.id === studentId && user.role === 'student'))
    .filter(Boolean);

  return {
    ...classroom,
    lecturer: lecturer ? toPublicUser(lecturer) : null,
    teacher: lecturer ? toPublicUser(lecturer) : null,
    students: students.map((student) => toPublicUser(student)),
    studentCount: students.length,
  };
};

const buildMockRoadmap = ({ targetCourseId, weakTopics, weeklyStudyHours, examScore }) => {
  const prioritizedTopics = weakTopics.slice(0, 3);

  return {
    id: `roadmap-${Date.now()}`,
    title: 'Lộ trình phục hồi nền tảng Vật lý Lượng tử Nâng cao',
    targetCourseId,
    durationInDays: ROADMAP_DURATION_DAYS,
    recommendedModules: [
      {
        id: 'module-wave-particle',
        title: 'Ôn tập nền tảng về Tính lưỡng tính Sóng-Hạt',
        focusArea: prioritizedTopics[0] || 'Tính lưỡng tính Sóng-Hạt',
        estimatedHours: 2,
        whyRecommended: 'Bạn mất điểm ở nhóm câu hỏi yêu cầu diễn giải hiện tượng sóng-hạt.',
      },
      {
        id: 'module-wave-function',
        title: 'Làm chủ trực giác về Hàm sóng',
        focusArea: prioritizedTopics[1] || 'Hàm sóng',
        estimatedHours: 2,
        whyRecommended: 'Tiến độ học lý thuyết tốt nhưng bài mô phỏng hàm sóng còn chậm hơn trung bình.',
      },
      {
        id: 'module-uncertainty',
        title: 'Ứng dụng Nguyên lý bất định vào bài tập ngắn',
        focusArea: prioritizedTopics[2] || 'Nguyên lý bất định',
        estimatedHours: 2,
        whyRecommended: 'Nhóm chủ đề này ảnh hưởng trực tiếp đến điểm kiểm tra gần nhất của bạn.',
      },
    ],
    recommendedLabs: [
      {
        id: 'lab-double-slit',
        title: 'Mô phỏng khe đôi và hiện tượng giao thoa',
        format: 'interactive-simulation',
        durationMinutes: 45,
        outcome: 'Củng cố trực giác về hành vi sóng-hạt trong thí nghiệm tiêu biểu.',
      },
      {
        id: 'lab-wave-packet',
        title: 'Thực hành trực quan hóa wave packet',
        format: 'guided-lab',
        durationMinutes: 40,
        outcome: 'Hiểu rõ cách hàm sóng biến đổi theo thời gian và điều kiện biên.',
      },
    ],
    milestones: [
      { id: 'm1', day: 4, title: 'Khóa lại nền tảng lý thuyết', description: 'Hoàn thành 2 module đầu và đạt ít nhất 80% ở mini quiz.' },
      { id: 'm2', day: 9, title: 'Làm được bài tập ứng dụng ngắn', description: 'Tự giải 3 bài tập bất định và giải thích cách chọn công thức.' },
      { id: 'm3', day: 14, title: 'Sẵn sàng cho bài đánh giá tiếp theo', description: 'Hoàn tất review toàn bộ chủ đề yếu với kế hoạch 6 giờ học mỗi tuần.' },
    ],
    dailyTasks: [
      { id: 't1', day: 1, title: 'Xem lại video nền tảng về Sóng-Hạt', durationMinutes: 35, taskType: 'video-review', relatedTopic: 'Tính lưỡng tính Sóng-Hạt' },
      { id: 't2', day: 2, title: 'Ghi chú 5 ý chính về Hàm sóng', durationMinutes: 30, taskType: 'note-taking', relatedTopic: 'Hàm sóng' },
      { id: 't3', day: 3, title: 'Làm mini quiz 8 câu', durationMinutes: 25, taskType: 'quiz', relatedTopic: 'Tính lưỡng tính Sóng-Hạt' },
      { id: 't4', day: 5, title: 'Thực hiện lab khe đôi', durationMinutes: 45, taskType: 'lab', relatedTopic: 'Tính lưỡng tính Sóng-Hạt' },
      { id: 't5', day: 7, title: 'Giải 2 bài tập mẫu về hàm sóng', durationMinutes: 40, taskType: 'problem-solving', relatedTopic: 'Hàm sóng' },
      { id: 't6', day: 10, title: 'Ôn nhanh công thức của Nguyên lý bất định', durationMinutes: 20, taskType: 'flashcard', relatedTopic: 'Nguyên lý bất định' },
      { id: 't7', day: 12, title: 'Làm bài luyện tập tổng hợp', durationMinutes: 45, taskType: 'practice-test', relatedTopic: 'Tổng hợp chủ đề yếu' },
      { id: 't8', day: 14, title: 'Tự đánh giá và cập nhật kế hoạch tuần tới', durationMinutes: 20, taskType: 'reflection', relatedTopic: 'Tối ưu tiến độ học' },
    ],
    aiReasoningSummary: `AI ưu tiên lộ trình này vì điểm bài kiểm tra gần nhất của bạn ở mức ${examScore}/100. Với ${weeklyStudyHours} giờ học mỗi tuần, lộ trình ${ROADMAP_DURATION_DAYS} ngày giúp tăng dần độ khó nhưng vẫn giữ nhịp học đều.`,
    createdAt: new Date().toISOString(),
  };
};

const seedLearningDefaults = () => {
  if (learningDb.courses.length > 0) return;
  const now = new Date().toISOString();
  learningDb.faculties = [{ id: 'faculty_it', name: 'Khoa Công nghệ thông tin', description: 'Đào tạo kỹ sư công nghệ thông tin Trường Đại Nam' }];
  learningDb.majors = [{ id: 'major_it', facultyId: 'faculty_it', name: 'Công nghệ thông tin', description: 'Phát triển phần mềm, dữ liệu và AI' }];
  learningDb.semesters = [{ id: 'sem_2025_1', name: 'HK1 2025-2026', startDate: '2025-09-01', endDate: '2026-01-15', status: 'active' }];
  learningDb.courses = [
    { id: 'course_web301', courseCode: 'WEB301', name: 'Lập trình Web', credits: 3, facultyId: 'faculty_it', majorId: 'major_it', description: 'Xây dựng ứng dụng web hiện đại với React và API.', learningOutcomes: ['Thiết kế UI responsive', 'Tích hợp REST API', 'Quản lý state frontend'] },
    { id: 'course_db301', courseCode: 'DB301', name: 'Cơ sở dữ liệu', credits: 3, facultyId: 'faculty_it', majorId: 'major_it', description: 'Thiết kế CSDL quan hệ, SQL và tối ưu truy vấn.', learningOutcomes: ['Thiết kế ERD', 'Viết SQL', 'Chuẩn hóa dữ liệu'] },
    { id: 'course_ai202', courseCode: 'AI202', name: 'Nhập môn Trí tuệ nhân tạo', credits: 3, facultyId: 'faculty_it', majorId: 'major_it', description: 'Nền tảng AI, machine learning và ứng dụng trong giáo dục.', learningOutcomes: ['Hiểu thuật toán AI cơ bản', 'Ứng dụng AI hỗ trợ học tập'] },
  ];
  learningDb.courseClasses = [
    { id: 'cc_web301_k16', courseId: 'course_web301', classId: 'class-1', teacherId: 'u_lecturer_1', semesterId: 'sem_2025_1', studentIds: ['u_student_1', 'u_student_legacy'] },
    { id: 'cc_db301_k16', courseId: 'course_db301', classId: 'class-1', teacherId: 'u_lecturer_1', semesterId: 'sem_2025_1', studentIds: ['u_student_1'] },
  ];
  learningDb.lessons = [
    { id: 'lesson_web_1', courseId: 'course_web301', title: 'React Component và Props', content: 'Component giúp chia UI thành các khối tái sử dụng.', videoUrl: 'https://example.com/react-components', documentUrl: '/uploads/sample-react.pdf', orderIndex: 1 },
    { id: 'lesson_web_2', courseId: 'course_web301', title: 'API Integration với Axios', content: 'Gọi REST API, xử lý loading/error và bảo mật token.', videoUrl: 'https://example.com/api-integration', documentUrl: '/uploads/sample-api.pdf', orderIndex: 2 },
    { id: 'lesson_db_1', courseId: 'course_db301', title: 'SELECT, JOIN, GROUP BY', content: 'Truy vấn dữ liệu quan hệ và tổng hợp kết quả.', videoUrl: 'https://example.com/sql', documentUrl: '/uploads/sample-sql.pdf', orderIndex: 1 },
  ];
  learningDb.lessonProgress = [
    { id: 'progress_web_1', studentId: 'u_student_1', lessonId: 'lesson_web_1', status: 'completed', progressPercent: 100, timeSpent: 42, completedAt: now },
    { id: 'progress_web_2', studentId: 'u_student_1', lessonId: 'lesson_web_2', status: 'in_progress', progressPercent: 45, timeSpent: 18, completedAt: null },
  ];
  learningDb.assignments = [
    { id: 'assign_web_quiz_1', courseClassId: 'cc_web301_k16', title: 'Quiz React Component', type: 'quiz', description: 'Kiểm tra nhanh về component, props và state.', startTime: '2026-04-01T00:00:00.000Z', endTime: '2026-05-30T23:59:59.000Z', duration: 30, maxScore: 10, weight: 0.2, status: 'open' },
  ];
  learningDb.questions = [
    { id: 'q_web_1', assignmentId: 'assign_web_quiz_1', questionText: 'Props trong React dùng để làm gì?', questionType: 'multiple_choice', options: ['Truyền dữ liệu vào component', 'Kết nối database', 'Build production', 'Tạo server'], correctAnswer: 'Truyền dữ liệu vào component', score: 5 },
    { id: 'q_web_2', assignmentId: 'assign_web_quiz_1', questionText: 'Hook nào quản lý state cục bộ?', questionType: 'multiple_choice', options: ['useState', 'useRouter', 'useDb', 'useServer'], correctAnswer: 'useState', score: 5 },
  ];
  learningDb.grades = [
    { id: 'grade_web_student1', studentId: 'u_student_1', courseId: 'course_web301', semesterId: 'sem_2025_1', attendanceScore: 8.5, assignmentScore: 7.2, midtermScore: 6.4, finalScore: 6.8, practiceScore: 8, weights: { attendanceScore: 0.1, assignmentScore: 0.2, midtermScore: 0.3, finalScore: 0.4 }, isLocked: false, ...calculateGradeTotal({ attendanceScore: 8.5, assignmentScore: 7.2, midtermScore: 6.4, finalScore: 6.8, weights: { attendanceScore: 0.1, assignmentScore: 0.2, midtermScore: 0.3, finalScore: 0.4 } }) },
    { id: 'grade_db_student1', studentId: 'u_student_1', courseId: 'course_db301', semesterId: 'sem_2025_1', attendanceScore: 8, assignmentScore: 5.8, midtermScore: 5.2, finalScore: 5.6, practiceScore: 6, weights: { attendanceScore: 0.1, assignmentScore: 0.2, midtermScore: 0.3, finalScore: 0.4 }, isLocked: false, ...calculateGradeTotal({ attendanceScore: 8, assignmentScore: 5.8, midtermScore: 5.2, finalScore: 5.6, weights: { attendanceScore: 0.1, assignmentScore: 0.2, midtermScore: 0.3, finalScore: 0.4 } }) },
  ];
  learningDb.studentProfiles = [{ id: 'profile_student1', studentId: 'u_student_1', careerObjective: 'Trở thành Frontend Developer trong lĩnh vực edtech.', aiSummary: '', skills: ['React', 'SQL', 'Teamwork'], publicVisibility: false, showGpa: true, updatedAt: now }];
  saveLearningDb();
};

const seedData = async () => {
  users = await Promise.all([
    createUserRecord({ id: 'u_student_1', accountId: 'student1', fullName: 'Nguyễn Văn A', email: 'student1@school.edu.vn', password: '123456', role: 'student' }),
    createUserRecord({ id: 'u_lecturer_1', accountId: 'lecturer1', fullName: 'Trần Thị B', email: 'lecturer1@school.edu.vn', password: '123456', role: 'lecturer' }),
    createUserRecord({ id: 'u_admin_1', accountId: 'admin1', fullName: 'Lê Thu C', email: 'admin1@school.edu.vn', password: '123456', role: 'admin' }),
    createUserRecord({ id: 'u_super_admin_1', accountId: 'super1', fullName: 'Đại Nam Super Admin', email: 'super1@school.edu.vn', password: '123456', role: 'super_admin' }),
    createUserRecord({ id: 'u_career_1', accountId: 'career1', fullName: 'Phạm Minh Career', email: 'career1@school.edu.vn', password: '123456', role: 'career_officer' }),
    createUserRecord({ id: 'u_student_legacy', accountId: 'sv001', fullName: 'Nguyễn Văn A', email: 'sv001@truongdaihoc.edu.vn', password: '123456', role: 'student' }),
    createUserRecord({ id: 'u_lecturer_legacy', accountId: 'gv001', fullName: 'Trần Thị B', email: 'gv001@truongdaihoc.edu.vn', password: '123456', role: 'lecturer' }),
    createUserRecord({ id: 'u_admin_legacy', accountId: 'cb001', fullName: 'Lê Thu C', email: 'cb001@truongdaihoc.edu.vn', password: '123456', role: 'admin' }),
  ]);

  classes = [
    {
      id: 'class-1',
      code: 'CS101',
      name: 'Lập trình cơ bản',
      semester: 'HK1 2025-2026',
      room: 'A101',
      teacherId: 'u_lecturer_1',
      studentIds: ['u_student_1', 'u_student_legacy'],
      capacity: 45,
      notes: 'Lớp thí điểm blended learning',
      createdAt: new Date().toISOString(),
    },
  ];

  lecturerGrades = [];
  notifications = users.flatMap((user) => [
    {
      id: `notif_${user.id}_security`,
      userId: user.id,
      title: 'Kiểm tra bảo mật tài khoản',
      message: 'Hãy đổi mật khẩu định kỳ và không chia sẻ thông tin đăng nhập cho người khác.',
      detail: 'Scholar Tech khuyến nghị bật xác thực hai lớp và dùng mật khẩu mạnh để bảo vệ tài khoản học vụ của bạn.',
      type: 'security',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: `notif_${user.id}_welcome`,
      userId: user.id,
      title: 'Chào mừng đến Scholar Tech',
      message: 'Tài khoản của bạn đã sẵn sàng để sử dụng.',
      detail: 'Bạn có thể theo dõi lớp học, tài liệu, điểm số và các thông báo quan trọng trong hệ thống.',
      type: 'system',
      read: user.role === 'admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
  ]);
  profileUpdateRequests = [];
};

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Scholar Tech backend is running.',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', time: new Date().toISOString() });
});

app.post('/api/auth/login', rateLimitLogin, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.' });
    }

    if (isIdentifierLocked(identifier)) {
      pushFailedLoginLog({ identifier: normalizeIdentifier(identifier), ip });
      return res.status(429).json({ success: false, message: 'Yêu cầu đăng nhập tạm thời bị khóa. Vui lòng thử lại sau.' });
    }

    if (sqlDb) {
      const normalizedIdentifier = normalizeIdentifier(identifier);
      let user = await sqlDb.models.User.findOne({ where: { email: normalizedIdentifier } });
      let profile = null;
      if (!user) {
        const student = await sqlDb.models.Student.findOne({ where: { studentCode: normalizedIdentifier }, include: [{ model: sqlDb.models.User }] });
        if (student) {
          user = student.User;
          profile = student;
        }
      }
      if (!user) {
        const teacher = await sqlDb.models.Teacher.findOne({ where: { teacherCode: normalizedIdentifier }, include: [{ model: sqlDb.models.User }] });
        if (teacher) {
          user = teacher.User;
          profile = teacher;
        }
      }
      if (!profile && user) profile = await getSqlUserProfile(user);
      const isValidSqlPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
      if (!user || !isValidSqlPassword || user.status !== 'active') {
        registerFailedAttempt(identifier);
        pushFailedLoginLog({ identifier: normalizedIdentifier, ip });
        return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ.' });
      }
      user.updatedAt = new Date();
      await user.save();
      const token = signSessionToken({ id: user.id, role: user.role, email: user.email, status: user.status });
      setSessionCookie(res, token);
      await sqlDb.models.ActivityLog.create({ userId: user.id, action: 'auth.login', targetTable: 'sessions', targetId: user.id, note: `Login from ${ip}` });
      return res.json({
        success: true,
        data: { user: toSqlPublicUser(user, profile), accessToken: token, redirectPath: getDashboardPath(user.role) },
        message: 'Đăng nhập thành công.',
      });
    }

    const user = findUserByIdentifier(identifier);
    const isValid = user ? await user.comparePassword(password) : false;

    if (!user || !isValid || user.status !== 'active') {
      registerFailedAttempt(identifier);
      pushFailedLoginLog({ identifier: normalizeIdentifier(identifier), ip });
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ.' });
    }

    clearFailedAttempts(identifier);
    user.lastLogin = new Date().toISOString();
    user.updatedAt = user.lastLogin;

    const token = signSessionToken(user);
    setSessionCookie(res, token);

    if (user.role === 'admin') {
      pushAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'auth.login',
        targetType: 'session',
        targetId: user.id,
        detail: `Admin login từ IP ${ip}`,
      });
    }

    return res.json({
      success: true,
      data: {
        user: toPublicUser(user),
        token,          // để frontend lưu vào sessionStorage (fallback cho Authorization header)
        accessToken: token,
        redirectPath: getDashboardPath(user.role),
      },
      message: 'Đăng nhập thành công.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Không thể xử lý yêu cầu đăng nhập.' });
  }
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  if (req.user?.role === 'admin') {
    pushAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'auth.logout',
      targetType: 'session',
      targetId: req.user.id,
      detail: 'Admin logout',
    });
  }

  clearSessionCookie(res);
  return res.json({ success: true, message: 'Đăng xuất thành công.' });
});

app.post('/api/logout', authMiddleware, (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true, message: 'Đăng xuất thành công.' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      redirectPath: getDashboardPath(req.user.role),
    },
  });
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Notification.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] })
      .then((items) => res.json({ success: true, data: items.map((item) => ({ id: item.id, title: item.title, message: item.content, detail: item.content, type: item.type, read: item.isRead, createdAt: item.createdAt })), unreadCount: items.filter((item) => !item.isRead).length }))
      .catch(() => res.status(500).json({ success: false, message: 'Không thể tải thông báo.' }));
  }
  const data = notifications
    .filter((notification) => notification.userId === req.user.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  res.json({ success: true, data, unreadCount: data.filter((notification) => !notification.read).length });
});

app.patch('/api/notifications/:id/read', authMiddleware, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Notification.findOne({ where: { id: req.params.id, userId: req.user.id } }).then(async (notification) => {
      if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
      await notification.update({ isRead: true });
      return res.json({ success: true, data: { id: notification.id, title: notification.title, message: notification.content, detail: notification.content, type: notification.type, read: notification.isRead, createdAt: notification.createdAt }, message: 'Đã đánh dấu thông báo là đã đọc.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể cập nhật thông báo.' }));
  }
  const notification = notifications.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
  }

  notification.read = true;
  notification.readAt = new Date().toISOString();
  return res.json({ success: true, data: notification, message: 'Đã đánh dấu thông báo là đã đọc.' });
});

app.patch('/api/notifications/read-all', authMiddleware, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Notification.update({ isRead: true }, { where: { userId: req.user.id } }).then(async () => {
      const items = await sqlDb.models.Notification.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
      return res.json({ success: true, data: items, unreadCount: 0, message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể cập nhật thông báo.' }));
  }
  const now = new Date().toISOString();
  notifications = notifications.map((notification) => (
    notification.userId === req.user.id ? { ...notification, read: true, readAt: notification.readAt || now } : notification
  ));

  const data = notifications.filter((notification) => notification.userId === req.user.id);
  return res.json({ success: true, data, unreadCount: 0, message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
});

app.get('/api/user/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      profile: buildProfileResponse(req.userRecord),
      updateRequests: profileUpdateRequests
        .filter((request) => request.studentId === req.user.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    },
  });
});

app.patch('/api/user/profile', authMiddleware, (req, res) => {
  const { fullName, email, phone, currentAddress, hometown, notificationPreferences, themePreference } = req.body || {};
  const user = req.userRecord;
  const nextEmail = email ? normalizeIdentifier(email) : user.email;
  const nextPhone = phone !== undefined ? String(phone).trim() : user.phone;

  if (!fullName || String(fullName).trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Họ tên phải có ít nhất 2 ký tự.' });
  }
  if (!validateEmail(nextEmail)) {
    return res.status(400).json({ success: false, message: 'Email không đúng định dạng.' });
  }
  if (!validatePhone(nextPhone)) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ.' });
  }
  if (nextEmail !== user.email && users.some((item) => item.id !== user.id && item.email === nextEmail)) {
    return res.status(409).json({ success: false, message: 'Email đã được sử dụng bởi tài khoản khác.' });
  }

  const now = new Date().toISOString();
  const nextNotificationPreferences = notificationPreferences && typeof notificationPreferences === 'object'
    ? { ...user.notificationPreferences, ...notificationPreferences }
    : user.notificationPreferences;
  const nextThemePreference = ['light', 'dark', 'system'].includes(themePreference) ? themePreference : user.themePreference;
  const preferenceChanged = JSON.stringify(nextNotificationPreferences) !== JSON.stringify(user.notificationPreferences) || nextThemePreference !== user.themePreference;
  user.notificationPreferences = nextNotificationPreferences;
  user.themePreference = nextThemePreference;

  if (user.role === 'student') {
    const currentProfile = buildProfileResponse(user);
    const requestedProfile = {
      hometown: String(hometown || currentProfile.hometown || '').trim(),
      currentAddress: String(currentAddress || currentProfile.currentAddress || '').trim(),
      phone: nextPhone,
      email: nextEmail,
    };
    const items = buildUpdateItems(currentProfile, requestedProfile);
    const existingPending = profileUpdateRequests.find((request) => request.studentId === user.id && request.status === 'pending');

    if (existingPending) {
      return res.status(409).json({ success: false, message: 'Bạn đang có yêu cầu cập nhật chờ admin duyệt.' });
    }
    if (items.length === 0 && String(fullName).trim() === user.fullName) {
      if (preferenceChanged) {
        user.updatedAt = now;
        return res.json({ success: true, data: { profile: buildProfileResponse(user) }, message: 'Đã lưu cài đặt thông báo và hiển thị.' });
      }
      return res.status(400).json({ success: false, message: 'Không có thay đổi nào để lưu.' });
    }

    const request = {
      id: `REQ-${Date.now()}`,
      studentId: user.id,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      requestedProfile,
      items,
    };
    profileUpdateRequests.unshift(request);
    notifications.unshift({
      id: `notif_${Date.now()}_${user.id}`,
      userId: user.id,
      title: 'Yêu cầu cập nhật đã được gửi',
      message: 'Thông tin của bạn đang chờ admin duyệt.',
      detail: 'Bạn sẽ nhận được thông báo khi yêu cầu cập nhật hồ sơ được xử lý.',
      type: 'profile',
      read: false,
      createdAt: now,
    });

    return res.status(202).json({ success: true, data: { profile: buildProfileResponse(user), request }, message: 'Đã gửi yêu cầu cập nhật thông tin chờ admin duyệt.' });
  }

  user.fullName = String(fullName).trim();
  user.email = nextEmail;
  user.phone = nextPhone;
  user.address = String(currentAddress || '').trim();
  user.hometown = String(hometown || '').trim();
  user.updatedAt = now;

  return res.json({ success: true, data: { profile: buildProfileResponse(user) }, message: 'Đã cập nhật hồ sơ thành công.' });
});

app.patch('/api/user/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = req.userRecord;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' });
  }
  if (!validateStrongPassword(newPassword)) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.' });
  }

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  attachUserMethods(user);
  user.updatedAt = new Date().toISOString();
  notifications.unshift({
    id: `notif_${Date.now()}_${user.id}`,
    userId: user.id,
    title: 'Mật khẩu đã được thay đổi',
    message: 'Nếu bạn không thực hiện thao tác này, hãy liên hệ admin ngay.',
    detail: 'Thay đổi mật khẩu được ghi nhận từ phiên đăng nhập hiện tại.',
    type: 'security',
    read: false,
    createdAt: user.updatedAt,
  });

  return res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
});

app.get('/api/student/profile', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then((student) => {
      if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ sinh viên.' });
      return res.json({ success: true, data: sqlStudentPayload(student) });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải hồ sơ sinh viên.' }));
  }
  res.json({ success: true, data: buildOfficialStudentProfile(req.user.id) });
});

app.get('/api/student/grades', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
      const grades = await sqlDb.models.Grade.findAll({ where: { studentId: student.id }, include: [{ model: sqlDb.models.Course }] });
      return res.json({ success: true, data: { studentId: student.id, grades } });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải điểm.' }));
  }
  res.json({ success: true, data: { studentId: req.user.id, ...buildStudentAnalytics(req.user.id) } });
});

app.get('/api/student/dashboard', authMiddleware, requireRole('student'), (req, res) => {
  const courseClasses = getStudentCourseClasses(req.user.id).map(getCoursePayload);
  const analytics = buildStudentAnalytics(req.user.id);
  const assignments = learningDb.assignments.filter((assignment) => courseClasses.some((courseClass) => courseClass.id === assignment.courseClassId));
  const recommendation = generateStudentRecommendation(req.user.id);
  const lowGradeWarnings = analytics.weakCourses.map((grade) => ({ courseName: grade.course?.name, totalScore: grade.totalScore, status: grade.status }));
  res.json({
    success: true,
    data: {
      greeting: `Chào mừng trở lại, ${req.user.fullName}`,
      overview: {
        currentCourses: courseClasses.length,
        weeklyProgress: Math.round((learningDb.lessonProgress.filter((item) => item.studentId === req.user.id).reduce((sum, item) => sum + item.progressPercent, 0) / Math.max(1, learningDb.lessonProgress.filter((item) => item.studentId === req.user.id).length))),
        currentGpa: analytics.gpa,
        pendingAssignments: assignments.length,
        upcomingTests: assignments.filter((item) => new Date(item.endTime) > new Date()).length,
        lowGradeWarnings,
      },
      aiAdvisor: recommendation,
      courses: courseClasses.map((courseClass) => {
        const grade = analytics.grades.find((item) => item.courseId === courseClass.courseId);
        const lessons = courseClass.lessons || [];
        const progressItems = lessons.map((lesson) => learningDb.lessonProgress.find((item) => item.studentId === req.user.id && item.lessonId === lesson.id)?.progressPercent || 0);
        const progress = Math.round(progressItems.reduce((sum, value) => sum + value, 0) / Math.max(1, progressItems.length));
        return { ...courseClass, progress, currentScore: grade?.totalScore || null, status: grade?.status || 'Đang học' };
      }),
    },
  });
});

app.get('/api/student/courses', authMiddleware, requireRole('student'), (req, res) => {
  res.json({ success: true, data: getStudentCourseClasses(req.user.id).map(getCoursePayload) });
});

app.get('/api/student/courses/:id', authMiddleware, requireRole('student'), (req, res) => {
  const courseClass = getStudentCourseClasses(req.user.id).find((item) => item.id === req.params.id || item.courseId === req.params.id);
  if (!courseClass) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học của bạn.' });
  const payload = getCoursePayload(courseClass);
  res.json({ success: true, data: { ...payload, assignments: learningDb.assignments.filter((item) => item.courseClassId === courseClass.id), progress: learningDb.lessonProgress.filter((item) => item.studentId === req.user.id) } });
});

app.patch('/api/student/lessons/:id/progress', authMiddleware, requireRole('student'), (req, res) => {
  const lesson = learningDb.lessons.find((item) => item.id === req.params.id);
  if (!lesson) return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
  const courseClass = getStudentCourseClasses(req.user.id).find((item) => item.courseId === lesson.courseId);
  if (!courseClass) return res.status(403).json({ success: false, message: 'Bạn không có quyền học bài này.' });
  let progress = learningDb.lessonProgress.find((item) => item.studentId === req.user.id && item.lessonId === lesson.id);
  if (!progress) {
    progress = { id: makeId('progress'), studentId: req.user.id, lessonId: lesson.id, status: 'not_started', progressPercent: 0, timeSpent: 0, completedAt: null };
    learningDb.lessonProgress.push(progress);
  }
  progress.progressPercent = Math.min(100, Number(req.body.progressPercent ?? progress.progressPercent));
  progress.timeSpent += Number(req.body.timeSpent || 0);
  progress.status = progress.progressPercent >= 100 ? 'completed' : progress.progressPercent > 0 ? 'in_progress' : 'not_started';
  progress.completedAt = progress.status === 'completed' ? new Date().toISOString() : null;
  saveLearningDb();
  res.json({ success: true, data: progress, message: 'Đã lưu tiến độ học tập.' });
});

app.get('/api/student/ai-recommendations', authMiddleware, requireRole('student'), (req, res) => {
  const recommendation = generateStudentRecommendation(req.user.id);
  learningDb.aiLogs.unshift({ id: makeId('ai_log'), userId: req.user.id, prompt: 'student-recommendations', response: recommendation.summary, featureType: 'student_ai_recommendation', createdAt: new Date().toISOString() });
  saveLearningDb();
  res.json({ success: true, data: recommendation });
});

app.post('/api/student/certificates', authMiddleware, requireRole('student'), upload.single('file'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      const certificate = await sqlDb.models.Certificate.create({ studentId: student.id, name: req.body.name || '', issuer: req.body.issuer || '', issueDate: req.body.issueDate || null, expiryDate: req.body.expiryDate || null, fileUrl: req.file ? `/uploads/career/${req.file.filename}` : '', status: 'pending' });
      const admins = await sqlDb.models.User.findAll({ where: { role: ['admin', 'super_admin'] } });
      await Promise.all(admins.map((admin) => sqlDb.models.Notification.create({ userId: admin.id, title: 'Chứng chỉ chờ duyệt', content: `${req.user.fullName} vừa upload chứng chỉ.`, type: 'academic' })));
      return res.status(201).json({ success: true, data: certificate, message: 'Đã gửi chứng chỉ chờ duyệt.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể lưu chứng chỉ.' }));
  }
  const now = new Date().toISOString();
  const certificate = { id: makeId('certificate'), studentId: req.user.id, name: req.body.name || '', issuer: req.body.issuer || '', issueDate: req.body.issueDate || '', expiryDate: req.body.expiryDate || '', certificateCode: req.body.certificateCode || '', fileUrl: req.file ? `/uploads/career/${req.file.filename}` : '', status: 'pending', reviewedBy: null, reviewNote: '', createdAt: now, updatedAt: now };
  learningDb.certificates.unshift(certificate);
  users.filter((user) => systemAdminRoles.includes(user.role)).forEach((user) => notifications.unshift({ id: makeId('notif'), userId: user.id, title: 'Chứng chỉ chờ duyệt', message: `${req.user.fullName} vừa upload chứng chỉ.`, detail: certificate.name, type: 'academic', read: false, createdAt: now }));
  saveLearningDb();
  res.status(201).json({ success: true, data: certificate, message: 'Đã gửi chứng chỉ chờ duyệt.' });
});

app.post('/api/student/achievements', authMiddleware, requireRole('student'), upload.single('file'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      const achievement = await sqlDb.models.Achievement.create({ studentId: student.id, title: req.body.title || '', organization: req.body.organization || '', achievementDate: req.body.achievementDate || null, description: req.body.description || '', fileUrl: req.file ? `/uploads/career/${req.file.filename}` : '', status: 'pending' });
      const admins = await sqlDb.models.User.findAll({ where: { role: ['admin', 'super_admin'] } });
      await Promise.all(admins.map((admin) => sqlDb.models.Notification.create({ userId: admin.id, title: 'Thành tích chờ duyệt', content: `${req.user.fullName} vừa upload thành tích.`, type: 'academic' })));
      return res.status(201).json({ success: true, data: achievement, message: 'Đã gửi thành tích chờ duyệt.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể lưu thành tích.' }));
  }
  const now = new Date().toISOString();
  const achievement = { id: makeId('achievement'), studentId: req.user.id, title: req.body.title || '', organization: req.body.organization || '', achievementDate: req.body.achievementDate || '', description: req.body.description || '', fileUrl: req.file ? `/uploads/career/${req.file.filename}` : '', status: 'pending', reviewedBy: null, reviewNote: '', createdAt: now, updatedAt: now };
  learningDb.achievements.unshift(achievement);
  users.filter((user) => systemAdminRoles.includes(user.role)).forEach((user) => notifications.unshift({ id: makeId('notif'), userId: user.id, title: 'Thành tích chờ duyệt', message: `${req.user.fullName} vừa upload thành tích.`, detail: achievement.title, type: 'academic', read: false, createdAt: now }));
  saveLearningDb();
  res.status(201).json({ success: true, data: achievement, message: 'Đã gửi thành tích chờ duyệt.' });
});

app.get('/api/student/career-profile', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên.' });
      const [profile] = await sqlDb.models.CareerProfile.findOrCreate({ where: { studentId: student.id }, defaults: { status: 'Draft', showGpa: true, consentToShare: false } });
      return res.json({ success: true, data: profile });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải hồ sơ nghề nghiệp.' }));
  }
  const profile = getOrCreateCareerProfile(req.user.id);
  res.json({ success: true, data: enrichCareerProfile(profile) });
});

app.post('/api/student/career-profile', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      const [profile] = await sqlDb.models.CareerProfile.findOrCreate({ where: { studentId: student.id }, defaults: { status: 'Draft', showGpa: true, consentToShare: false } });
      await profile.update(req.body || {});
      return res.json({ success: true, data: profile, message: 'Đã tạo hồ sơ nghề nghiệp.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tạo hồ sơ nghề nghiệp.' }));
  }
  const profile = getOrCreateCareerProfile(req.user.id);
  Object.assign(profile, req.body || {}, { studentId: req.user.id, updatedAt: new Date().toISOString() });
  Object.assign(profile, calculateCareerScores(profile));
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã tạo hồ sơ nghề nghiệp.' });
});

app.patch('/api/student/career-profile', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      const [profile] = await sqlDb.models.CareerProfile.findOrCreate({ where: { studentId: student.id }, defaults: { status: 'Draft', showGpa: true, consentToShare: false } });
      const allowed = ['careerObjective', 'desiredPosition', 'desiredIndustry', 'desiredLocation', 'portfolioUrl', 'githubUrl', 'linkedinUrl', 'cvFileUrl', 'showGpa'];
      const payload = {};
      allowed.forEach((field) => { if (req.body[field] !== undefined) payload[field] = req.body[field]; });
      await profile.update(payload);
      const scores = await sqlCalculateCareerScore(student.id, profile);
      await profile.update(scores);
      return res.json({ success: true, data: profile, message: 'Đã lưu hồ sơ nghề nghiệp.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể lưu hồ sơ nghề nghiệp.' }));
  }
  const profile = getOrCreateCareerProfile(req.user.id);
  const allowedFields = ['careerObjective', 'desiredPosition', 'desiredIndustry', 'desiredLocation', 'shortTermGoal', 'longTermGoal', 'portfolioUrl', 'githubUrl', 'linkedinUrl', 'personalWebsite', 'allowEmployerView', 'showGpa', 'certificates', 'achievements'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });
  if (profile.status !== 'Draft') profile.status = 'Submitted';
  profile.updatedAt = new Date().toISOString();
  Object.assign(profile, calculateCareerScores(profile));
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã lưu hồ sơ nghề nghiệp.' });
});

app.post('/api/student/career-profile/submit', authMiddleware, requireRole('student'), (req, res) => {
  if (sqlDb) {
    return sqlStudentByUserId(req.user.id).then(async (student) => {
      if (!req.body?.consentToShare) return res.status(400).json({ success: false, message: 'Bạn cần đồng ý chia sẻ hồ sơ với nhà trường.' });
      const [profile] = await sqlDb.models.CareerProfile.findOrCreate({ where: { studentId: student.id }, defaults: {} });
      const scores = await sqlCalculateCareerScore(student.id, profile);
      await profile.update({ ...scores, status: 'Submitted', consentToShare: true, submittedAt: new Date() });
      const admins = await sqlDb.models.User.findAll({ where: { role: ['admin', 'super_admin', 'career_officer'] } });
      await Promise.all(admins.map((admin) => sqlDb.models.Notification.create({ userId: admin.id, title: 'Hồ sơ nghề nghiệp mới', content: `${req.user.fullName} đã gửi hồ sơ nghề nghiệp.`, type: 'career' })));
      return res.json({ success: true, data: profile, message: 'Đã gửi hồ sơ lên nhà trường.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể gửi hồ sơ nghề nghiệp.' }));
  }
  const { consentToShare, allowEmployerView = false } = req.body || {};
  if (!consentToShare) {
    return res.status(400).json({ success: false, message: 'Bạn cần đồng ý chia sẻ hồ sơ với nhà trường.' });
  }
  const profile = getOrCreateCareerProfile(req.user.id);
  const now = new Date().toISOString();
  Object.assign(profile, { status: 'Submitted', consentToShare: true, allowEmployerView: !!allowEmployerView, submittedAt: now, updatedAt: now }, calculateCareerScores(profile));
  users.filter((user) => careerRoles.includes(user.role)).forEach((user) => {
    notifications.unshift({ id: makeId('notif'), userId: user.id, title: 'Hồ sơ nghề nghiệp mới', message: `${req.user.fullName} đã gửi hồ sơ nghề nghiệp.`, detail: 'Vui lòng vào Career Center để xem xét và hỗ trợ sinh viên.', type: 'career', read: false, createdAt: now });
  });
  createCareerLog({ studentId: req.user.id, careerProfileId: profile.id, officerId: req.user.id, action: 'student.submit', note: 'Sinh viên gửi hồ sơ lên nhà trường.' });
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã gửi hồ sơ lên nhà trường hỗ trợ việc làm.' });
});

app.post('/api/student/career-profile/generate-ai-summary', authMiddleware, requireRole('student'), (req, res) => {
  const profile = getOrCreateCareerProfile(req.user.id);
  const ai = generateCareerAi(profile);
  profile.aiSummary = ai.summary;
  profile.aiSuggestions = ai.suggestions;
  profile.updatedAt = new Date().toISOString();
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã tạo AI Profile Summary.' });
});

app.get('/api/student/career-profile/preview', authMiddleware, requireRole('student'), (req, res) => {
  res.json({ success: true, data: enrichCareerProfile(getOrCreateCareerProfile(req.user.id)) });
});

app.get('/api/student/career-profile/export-pdf', authMiddleware, requireRole('student'), (req, res) => {
  res.json({ success: true, message: 'Tính năng xuất PDF đã sẵn sàng để nối renderer PDF.', data: enrichCareerProfile(getOrCreateCareerProfile(req.user.id)) });
});

app.post('/api/student/cv/upload', authMiddleware, requireRole('student'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file CV.' });
  const profile = getOrCreateCareerProfile(req.user.id);
  profile.cvFileUrl = `/uploads/career/${req.file.filename}`;
  profile.updatedAt = new Date().toISOString();
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), fileUrl: profile.cvFileUrl, message: 'Đã upload CV.' });
});

const studentCareerChildRoutes = [
  ['career-skills', 'careerSkills', 'careerProfileId', ['skillName', 'skillType', 'level']],
  ['projects', 'studentProjects', 'careerProfileId', ['title', 'description', 'role', 'technologies', 'projectUrl', 'githubUrl', 'fileUrl', 'startDate', 'endDate']],
  ['experiences', 'studentExperiences', 'careerProfileId', ['companyName', 'position', 'description', 'employmentType', 'startDate', 'endDate']],
];

studentCareerChildRoutes.forEach(([route, storeKey, profileKey, fields]) => {
  app.post(`/api/student/${route}`, authMiddleware, requireRole('student'), (req, res) => {
    const profile = getOrCreateCareerProfile(req.user.id);
    const now = new Date().toISOString();
    const item = { id: makeId(route), studentId: req.user.id, [profileKey]: profile.id, createdAt: now, updatedAt: now };
    fields.forEach((field) => { item[field] = req.body[field] ?? ''; });
    careerDb[storeKey].push(item);
    Object.assign(profile, calculateCareerScores(profile), { updatedAt: now });
    saveCareerDb();
    res.status(201).json({ success: true, data: item, profile: enrichCareerProfile(profile), message: 'Đã thêm dữ liệu.' });
  });

  app.patch(`/api/student/${route}/:id`, authMiddleware, requireRole('student'), (req, res) => {
    const profile = getOrCreateCareerProfile(req.user.id);
    const item = careerDb[storeKey].find((entry) => entry.id === req.params.id && entry.studentId === req.user.id && entry[profileKey] === profile.id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu.' });
    fields.forEach((field) => { if (req.body[field] !== undefined) item[field] = req.body[field]; });
    item.updatedAt = new Date().toISOString();
    Object.assign(profile, calculateCareerScores(profile), { updatedAt: item.updatedAt });
    saveCareerDb();
    res.json({ success: true, data: item, profile: enrichCareerProfile(profile), message: 'Đã cập nhật dữ liệu.' });
  });

  app.delete(`/api/student/${route}/:id`, authMiddleware, requireRole('student'), (req, res) => {
    const profile = getOrCreateCareerProfile(req.user.id);
    const before = careerDb[storeKey].length;
    careerDb[storeKey] = careerDb[storeKey].filter((entry) => !(entry.id === req.params.id && entry.studentId === req.user.id && entry[profileKey] === profile.id));
    if (careerDb[storeKey].length === before) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu.' });
    Object.assign(profile, calculateCareerScores(profile), { updatedAt: new Date().toISOString() });
    saveCareerDb();
    res.json({ success: true, profile: enrichCareerProfile(profile), message: 'Đã xóa dữ liệu.' });
  });
});

app.get('/api/student/job-matches', authMiddleware, requireRole('student'), (req, res) => {
  res.json({ success: true, data: careerDb.jobMatches.filter((match) => match.studentId === req.user.id) });
});

app.get('/api/lecturer/classes', authMiddleware, requireRole('lecturer'), (req, res) => {
  const assignedClasses = classes.filter((classroom) => classroom.teacherId === req.user.id).map(buildClassResponse);
  res.json({ success: true, data: assignedClasses });
});

app.post('/api/lecturer/grades', authMiddleware, requireRole('lecturer'), (req, res) => {
  const { classId, studentId, assessmentName, score } = req.body || {};
  const classroom = classes.find((item) => item.id === classId && item.teacherId === req.user.id);

  if (!classroom || !classroom.studentIds.includes(studentId)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền nhập điểm cho học phần này.' });
  }

  const grade = {
    id: `grade_${Date.now()}`,
    classId,
    studentId,
    assessmentName,
    score,
    createdAt: new Date().toISOString(),
    lecturerId: req.user.id,
  };

  lecturerGrades.push(grade);

  return res.status(201).json({ success: true, data: grade, message: 'Đã ghi nhận điểm thành công.' });
});

app.get('/api/teacher/dashboard', authMiddleware, requireTeacherAccess, (req, res) => {
  const teacherClasses = getTeacherClasses(req.user.id).map(getCoursePayload);
  const studentIds = new Set(teacherClasses.flatMap((item) => item.studentIds));
  const assignments = learningDb.assignments.filter((assignment) => teacherClasses.some((item) => item.id === assignment.courseClassId));
  const submissions = learningDb.submissions.filter((submission) => assignments.some((assignment) => assignment.id === submission.assignmentId));
  const atRiskStudents = [...studentIds].map((studentId) => ({ student: getStudentUser(studentId), analytics: buildStudentAnalytics(studentId) })).filter((item) => item.analytics.weakCourses.length > 0);
  res.json({ success: true, data: { totalClasses: teacherClasses.length, totalStudents: studentIds.size, pendingGrading: submissions.filter((item) => item.status === 'submitted').length, assignments: assignments.length, atRiskStudents: atRiskStudents.length, aiInsight: `AI phát hiện ${atRiskStudents.length} sinh viên cần hỗ trợ học tập trong các lớp bạn phụ trách.` } });
});

app.get('/api/teacher/classes', authMiddleware, requireTeacherAccess, (req, res) => {
  res.json({ success: true, data: getTeacherClasses(req.user.id).map(getCoursePayload) });
});

app.get('/api/teacher/classes/:id/students', authMiddleware, requireTeacherAccess, (req, res) => {
  const courseClass = getTeacherClasses(req.user.id).find((item) => item.id === req.params.id);
  if (!courseClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp bạn phụ trách.' });
  const data = courseClass.studentIds.map((studentId) => ({ student: buildProfileResponse(getStudentUser(studentId)), analytics: buildStudentAnalytics(studentId) }));
  res.json({ success: true, data });
});

app.get('/api/teacher/students', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id, req.query).then((rows) => {
      const stats = {
        totalStudents: new Set(rows.map((row) => row.studentId)).size,
        activeStudents: new Set(rows.filter((row) => row.status === 'Active').map((row) => row.studentId)).size,
        atRisk: new Set(rows.filter((row) => row.status === 'At Risk').map((row) => row.studentId)).size,
        averageProgress: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length) : 0,
      };
      const filters = { classes: rows.map((row) => ({ id: row.courseClassId, name: row.className, courseName: row.courseName })), courses: rows.map((row) => ({ id: row.courseId, name: row.courseName })) };
      return res.json({ success: true, data: rows, stats, filters });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải danh sách sinh viên từ SQL.' }));
  }
  const { q = '', classId = '', courseId = '', status = '', minProgress = '', minGpa = '', sortBy = 'fullName', sortDir = 'asc' } = req.query;
  const search = String(q).toLowerCase().trim();
  let rows = getTeacherStudentRows(req.user.id)
    .filter((row) => (!search ? true : `${row.fullName} ${row.studentCode} ${row.email}`.toLowerCase().includes(search)))
    .filter((row) => (!classId ? true : row.courseClassId === classId || row.className === classId))
    .filter((row) => (!courseId ? true : row.courseId === courseId))
    .filter((row) => (!status ? true : row.status === status))
    .filter((row) => (!minProgress ? true : row.progress >= Number(minProgress)))
    .filter((row) => (!minGpa ? true : row.gpa >= Number(minGpa)));

  rows = rows.sort((a, b) => {
    const direction = sortDir === 'desc' ? -1 : 1;
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
    return String(av).localeCompare(String(bv), 'vi') * direction;
  });

  const uniqueStudents = new Set(rows.map((row) => row.studentId));
  const stats = {
    totalStudents: uniqueStudents.size,
    activeStudents: new Set(rows.filter((row) => row.status === 'Active').map((row) => row.studentId)).size,
    atRisk: new Set(rows.filter((row) => row.status === 'At Risk').map((row) => row.studentId)).size,
    averageProgress: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length) : 0,
  };
  const filters = {
    classes: getTeacherClasses(req.user.id).map(getCoursePayload).map((item) => ({ id: item.id, name: item.classId || 'CNTT K16', courseName: item.course?.name })),
    courses: getTeacherClasses(req.user.id).map(getCoursePayload).map((item) => ({ id: item.courseId, name: item.course?.name })),
  };
  res.json({ success: true, data: rows, stats, filters });
});

app.get('/api/teacher/students/export', authMiddleware, requireTeacherAccess, (req, res) => {
  const rows = getTeacherStudentRows(req.user.id);
  const header = ['Ho ten', 'Ma sinh vien', 'Email', 'Lop', 'Mon hoc', 'Tien do', 'GPA', 'Trang thai', 'Bai tap thieu', 'Hoat dong gan nhat'];
  const csv = [header.join(','), ...rows.map((row) => [row.fullName, row.studentCode, row.email, row.className, row.courseName, `${row.progress}%`, row.gpa, row.status, row.missingAssignments, row.lastActivityAt].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="teacher-students.csv"');
  res.send(csv);
});

app.get('/api/teacher/students/:id', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id).then(async (rows) => {
      if (!rows.some((row) => row.studentId === req.params.id)) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên thuộc lớp bạn phụ trách.' });
      const student = await sqlDb.models.Student.findByPk(req.params.id, { include: [{ model: sqlDb.models.User }] });
      const [grades, certificates, achievements, notes] = await Promise.all([
        sqlDb.models.Grade.findAll({ where: { studentId: req.params.id }, include: [{ model: sqlDb.models.Course }] }),
        sqlDb.models.Certificate.findAll({ where: { studentId: req.params.id } }),
        sqlDb.models.Achievement.findAll({ where: { studentId: req.params.id } }),
        sqlDb.models.TeacherStudentNote.findAll({ where: { studentId: req.params.id } }),
      ]);
      return res.json({ success: true, data: { student: sqlStudentPayload(student), rows: rows.filter((row) => row.studentId === req.params.id), grades, certificates, achievements, notes } });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải chi tiết sinh viên.' }));
  }
  const detail = getTeacherStudentDetail(req.user.id, req.params.id);
  if (!detail) return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên thuộc lớp bạn phụ trách.' });
  res.json({ success: true, data: detail });
});

app.get('/api/teacher/students/:id/progress', authMiddleware, requireTeacherAccess, (req, res) => {
  if (!teacherCanAccessStudent(req.user.id, req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền xem tiến độ sinh viên này.' });
  const classes = getTeacherClasses(req.user.id).filter((courseClass) => courseClass.studentIds.includes(req.params.id)).map(getCoursePayload);
  const data = classes.map((courseClass) => ({
    course: courseClass.course,
    lessons: courseClass.lessons.map((lesson) => ({ ...lesson, progress: learningDb.lessonProgress.find((item) => item.studentId === req.params.id && item.lessonId === lesson.id) || { status: 'not_started', progressPercent: 0, timeSpent: 0 } })),
  }));
  res.json({ success: true, data });
});

app.get('/api/teacher/students/:id/grades', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id).then(async (rows) => {
      const courseIds = rows.filter((row) => row.studentId === req.params.id).map((row) => row.courseId);
      if (courseIds.length === 0) return res.status(403).json({ success: false, message: 'Bạn không có quyền xem điểm sinh viên này.' });
      const grades = await sqlDb.models.Grade.findAll({ where: { studentId: req.params.id, courseId: courseIds }, include: [{ model: sqlDb.models.Course }] });
      return res.json({ success: true, data: grades });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải điểm sinh viên.' }));
  }
  if (!teacherCanAccessStudent(req.user.id, req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền xem điểm sinh viên này.' });
  const allowedCourseIds = getTeacherClasses(req.user.id).filter((courseClass) => courseClass.studentIds.includes(req.params.id)).map((courseClass) => courseClass.courseId);
  res.json({ success: true, data: getStudentGrades(req.params.id).filter((grade) => allowedCourseIds.includes(grade.courseId)) });
});

app.get('/api/teacher/students/:id/notes', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id).then(async (rows) => {
      if (!rows.some((row) => row.studentId === req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền xem ghi chú sinh viên này.' });
      const notes = await sqlDb.models.TeacherStudentNote.findAll({ where: { studentId: req.params.id }, order: [['createdAt', 'DESC']] });
      return res.json({ success: true, data: notes });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể tải ghi chú.' }));
  }
  if (!teacherCanAccessStudent(req.user.id, req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền xem ghi chú sinh viên này.' });
  res.json({ success: true, data: learningDb.teacherStudentNotes.filter((note) => note.studentId === req.params.id && (note.teacherId === req.user.id || systemAdminRoles.includes(req.user.role))).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) });
});

app.post('/api/teacher/students/:id/notes', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id).then(async (rows) => {
      if (!rows.some((row) => row.studentId === req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền ghi chú sinh viên này.' });
      const teacher = await sqlDb.models.Teacher.findOne({ where: { userId: req.user.id } });
      const note = await sqlDb.models.TeacherStudentNote.create({ teacherId: teacher.id, studentId: req.params.id, noteType: req.body.noteType || 'Academic', content: req.body.content || '', isPrivate: req.body.isPrivate !== false });
      await sqlDb.models.ActivityLog.create({ userId: req.user.id, action: 'teacher.student.note.create', targetTable: 'teacher_student_notes', targetId: note.id, note: note.noteType });
      return res.status(201).json({ success: true, data: note, message: 'Đã thêm ghi chú sinh viên.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể thêm ghi chú.' }));
  }
  if (!teacherCanAccessStudent(req.user.id, req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền ghi chú sinh viên này.' });
  const now = new Date().toISOString();
  const note = { id: makeId('teacher_note'), teacherId: req.user.id, studentId: req.params.id, noteType: req.body.noteType || 'Academic', content: String(req.body.content || '').trim(), isPrivate: req.body.isPrivate !== false, createdAt: now, updatedAt: now };
  if (!note.content) return res.status(400).json({ success: false, message: 'Nội dung ghi chú không được trống.' });
  learningDb.teacherStudentNotes.unshift(note);
  logActivity({ userId: req.user.id, action: 'teacher.student.note.create', targetTable: 'teacher_student_notes', targetId: note.id, detail: note.noteType });
  res.status(201).json({ success: true, data: note, message: 'Đã thêm ghi chú sinh viên.' });
});

app.post('/api/teacher/notifications', authMiddleware, requireTeacherAccess, (req, res) => {
  if (sqlDb) {
    return sqlTeacherStudentRows(req.user.id).then(async (rows) => {
      const allowed = new Set(rows.map((row) => row.studentId));
      const recipientIds = (Array.isArray(req.body.recipientIds) ? req.body.recipientIds : []).filter((id) => allowed.has(id));
      if (recipientIds.length === 0) return res.status(400).json({ success: false, message: 'Không có sinh viên hợp lệ để gửi thông báo.' });
      const students = await sqlDb.models.Student.findAll({ where: { id: recipientIds } });
      const records = await Promise.all(students.map((student) => sqlDb.models.Notification.create({ userId: student.userId, title: req.body.title || 'Thông báo từ giảng viên', content: req.body.content || '', type: req.body.notificationType || 'General' })));
      await sqlDb.models.ActivityLog.create({ userId: req.user.id, action: 'teacher.notification.send', targetTable: 'notifications', targetId: records.map((item) => item.id).join(','), note: `${records.length} recipients` });
      return res.status(201).json({ success: true, data: records, message: 'Đã gửi thông báo thành công.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể gửi thông báo.' }));
  }
  const recipientIds = Array.isArray(req.body.recipientIds) ? req.body.recipientIds : req.body.recipientId ? [req.body.recipientId] : [];
  const validRecipients = recipientIds.filter((studentId) => teacherCanAccessStudent(req.user.id, studentId));
  if (validRecipients.length === 0) return res.status(400).json({ success: false, message: 'Không có sinh viên hợp lệ để gửi thông báo.' });
  const now = new Date().toISOString();
  const created = validRecipients.map((studentId) => {
    const record = { id: makeId('teacher_notification'), senderId: req.user.id, recipientId: studentId, title: req.body.title || 'Thông báo từ giảng viên', content: req.body.content || '', notificationType: req.body.notificationType || 'General', isRead: false, createdAt: now };
    learningDb.teacherNotifications.unshift(record);
    notifications.unshift({ id: makeId('notif'), userId: studentId, title: record.title, message: record.content, detail: record.content, type: 'academic', read: false, createdAt: now });
    return record;
  });
  logActivity({ userId: req.user.id, action: 'teacher.notification.send', targetTable: 'teacher_notifications', targetId: created.map((item) => item.id).join(','), detail: `${created.length} recipients` });
  saveLearningDb();
  res.status(201).json({ success: true, data: created, message: 'Đã gửi thông báo thành công.' });
});

app.patch('/api/teacher/students/:id/status', authMiddleware, requireTeacherAccess, (req, res) => {
  if (!teacherCanAccessStudent(req.user.id, req.params.id)) return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật trạng thái sinh viên này.' });
  const courseId = req.body.courseId || getTeacherClasses(req.user.id).find((courseClass) => courseClass.studentIds.includes(req.params.id))?.courseId;
  let statusRecord = learningDb.studentLearningStatuses.find((item) => item.studentId === req.params.id && item.courseId === courseId && item.teacherId === req.user.id);
  const now = new Date().toISOString();
  if (!statusRecord) {
    statusRecord = { id: makeId('learning_status'), studentId: req.params.id, courseId, teacherId: req.user.id, status: 'Active', riskLevel: 'low', riskReason: '', lastActivityAt: now, updatedAt: now };
    learningDb.studentLearningStatuses.push(statusRecord);
  }
  statusRecord.status = req.body.status || statusRecord.status;
  statusRecord.riskLevel = req.body.riskLevel || (statusRecord.status === 'At Risk' ? 'high' : 'low');
  statusRecord.riskReason = req.body.riskReason || statusRecord.riskReason;
  statusRecord.updatedAt = now;
  logActivity({ userId: req.user.id, action: 'teacher.student.status.update', targetTable: 'student_learning_status', targetId: statusRecord.id, detail: statusRecord.status });
  res.json({ success: true, data: statusRecord, message: 'Đã cập nhật trạng thái sinh viên.' });
});

app.post('/api/teacher/courses/:id/lessons', authMiddleware, requireTeacherAccess, (req, res) => {
  const courseClass = getTeacherClasses(req.user.id).find((item) => item.courseId === req.params.id || item.id === req.params.id);
  if (!courseClass) return res.status(403).json({ success: false, message: 'Bạn không phụ trách môn học này.' });
  const lesson = { id: makeId('lesson'), courseId: courseClass.courseId, title: req.body.title || '', content: req.body.content || '', videoUrl: req.body.videoUrl || '', documentUrl: req.body.documentUrl || '', orderIndex: learningDb.lessons.filter((item) => item.courseId === courseClass.courseId).length + 1 };
  learningDb.lessons.push(lesson);
  logActivity({ userId: req.user.id, action: 'teacher.lesson.create', targetTable: 'lessons', targetId: lesson.id });
  res.status(201).json({ success: true, data: lesson, message: 'Đã tạo bài giảng.' });
});

app.post('/api/teacher/assignments', authMiddleware, requireTeacherAccess, (req, res) => {
  const courseClass = getTeacherClasses(req.user.id).find((item) => item.id === req.body.courseClassId);
  if (!courseClass) return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp học này.' });
  const assignment = { id: makeId('assignment'), courseClassId: courseClass.id, title: req.body.title || '', type: req.body.type || 'quiz', description: req.body.description || '', startTime: req.body.startTime || new Date().toISOString(), endTime: req.body.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), duration: Number(req.body.duration || 45), maxScore: Number(req.body.maxScore || 10), weight: Number(req.body.weight || 0.1), status: 'open' };
  learningDb.assignments.unshift(assignment);
  courseClass.studentIds.forEach((studentId) => notifications.unshift({ id: makeId('notif'), userId: studentId, title: 'Có bài kiểm tra/bài tập mới', message: assignment.title, detail: assignment.description, type: 'academic', read: false, createdAt: new Date().toISOString() }));
  logActivity({ userId: req.user.id, action: 'teacher.assignment.create', targetTable: 'assignments', targetId: assignment.id });
  res.status(201).json({ success: true, data: assignment, message: 'Đã tạo bài kiểm tra/bài tập.' });
});

app.get('/api/teacher/submissions', authMiddleware, requireTeacherAccess, (req, res) => {
  const classIds = getTeacherClasses(req.user.id).map((item) => item.id);
  const assignmentIds = learningDb.assignments.filter((item) => classIds.includes(item.courseClassId)).map((item) => item.id);
  res.json({ success: true, data: learningDb.submissions.filter((item) => assignmentIds.includes(item.assignmentId)) });
});

app.patch('/api/teacher/submissions/:id/grade', authMiddleware, requireTeacherAccess, (req, res) => {
  const submission = learningDb.submissions.find((item) => item.id === req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp.' });
  const assignment = learningDb.assignments.find((item) => item.id === submission.assignmentId);
  const ownsClass = getTeacherClasses(req.user.id).some((item) => item.id === assignment?.courseClassId);
  if (!ownsClass) return res.status(403).json({ success: false, message: 'Bạn không có quyền chấm bài này.' });
  submission.totalScore = Number(req.body.totalScore || 0);
  submission.teacherFeedback = req.body.teacherFeedback || '';
  submission.status = 'graded';
  logActivity({ userId: req.user.id, action: 'teacher.submission.grade', targetTable: 'submissions', targetId: submission.id, detail: `Score ${submission.totalScore}` });
  res.json({ success: true, data: submission, message: 'Đã chấm bài.' });
});

app.get('/api/teacher/ai-analysis/:classId', authMiddleware, requireTeacherAccess, (req, res) => {
  const courseClass = getTeacherClasses(req.user.id).find((item) => item.id === req.params.classId);
  if (!courseClass) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp bạn phụ trách.' });
  const students = courseClass.studentIds.map((studentId) => ({ student: getStudentUser(studentId), analytics: buildStudentAnalytics(studentId) }));
  const weakStudents = students.filter((item) => item.analytics.weakCourses.length > 0);
  const response = { summary: `AI phát hiện ${weakStudents.length}/${students.length} sinh viên có nguy cơ điểm thấp. Nên ôn lại các chủ đề có quiz dưới 70%.`, weakStudents: weakStudents.map((item) => ({ id: item.student.id, fullName: item.student.fullName, weakCourses: item.analytics.weakCourses.map((grade) => grade.course?.name) })), suggestedActions: ['Tổ chức buổi phụ đạo', 'Tạo quiz luyện tập bổ sung', 'Gửi thông báo nhắc học bài'] };
  learningDb.aiLogs.unshift({ id: makeId('ai_log'), userId: req.user.id, prompt: `class-analysis:${req.params.classId}`, response: response.summary, featureType: 'teacher_class_analysis', createdAt: new Date().toISOString() });
  saveLearningDb();
  res.json({ success: true, data: response });
});

app.get('/api/admin/dashboard', authMiddleware, requireAdminAccess, (req, res) => {
  const studentUsers = users.filter((user) => user.role === 'student');
  const teacherUsers = users.filter((user) => teacherRoles.includes(user.role));
  const grades = learningDb.grades;
  const failingRate = grades.length ? Math.round((grades.filter((grade) => ['Thi lại', 'Học lại'].includes(grade.status)).length / grades.length) * 100) : 0;
  res.json({ success: true, data: { totalStudents: studentUsers.length, totalTeachers: teacherUsers.length, totalCourses: learningDb.courses.length, totalClasses: learningDb.courseClasses.length, pendingCertificates: learningDb.certificates.filter((item) => item.status === 'pending').length, pendingAchievements: learningDb.achievements.filter((item) => item.status === 'pending').length, failingRate, aiInsight: `AI cảnh báo ${failingRate}% bản ghi điểm đang ở trạng thái thi lại/học lại. Nên rà soát môn có tỷ lệ rớt cao.` } });
});

app.get('/api/admin/overview', authMiddleware, requireAdminAccess, (req, res) => {
  const totalLecturers = users.filter((user) => user.role === 'lecturer').length;
  const totalStudents = users.filter((user) => user.role === 'student').length;
  const recentLogins = users.filter((user) => {
    if (!user.lastLogin) return false;
    return Date.now() - new Date(user.lastLogin).getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  res.json({
    success: true,
    data: {
      totalAccounts: users.length,
      totalTeachers: totalLecturers,
      totalLecturers,
      totalStudents,
      totalClasses: classes.length,
      recentLogins,
    },
  });
});

app.get('/api/admin/students', authMiddleware, requireAdminAccess, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Student.findAll({ include: [{ model: sqlDb.models.User }] })
      .then((students) => res.json({ success: true, data: students.map(sqlStudentPayload) }))
      .catch(() => res.status(500).json({ success: false, message: 'Không thể tải danh sách sinh viên.' }));
  }
  res.json({ success: true, data: users.filter((user) => user.role === 'student').map((user) => ({ ...toPublicUser(user), analytics: buildStudentAnalytics(user.id) })) });
});

app.get('/api/admin/teachers', authMiddleware, requireAdminAccess, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Teacher.findAll({ include: [{ model: sqlDb.models.User }] })
      .then((teachers) => res.json({ success: true, data: teachers.map((teacher) => ({ id: teacher.id, userId: teacher.userId, teacherCode: teacher.teacherCode, faculty: teacher.faculty, position: teacher.position, degree: teacher.degree, fullName: teacher.User?.fullName, email: teacher.User?.email })) }))
      .catch(() => res.status(500).json({ success: false, message: 'Không thể tải danh sách giảng viên.' }));
  }
  res.json({ success: true, data: users.filter((user) => teacherRoles.includes(user.role)).map(toPublicUser) });
});

app.get('/api/admin/courses', authMiddleware, requireAdminAccess, (req, res) => {
  res.json({ success: true, data: learningDb.courses });
});

app.post('/api/admin/courses', authMiddleware, requireAdminAccess, (req, res) => {
  const course = { id: makeId('course'), courseCode: String(req.body.courseCode || '').trim().toUpperCase(), name: String(req.body.name || '').trim(), credits: Number(req.body.credits || 3), facultyId: req.body.facultyId || 'faculty_it', majorId: req.body.majorId || 'major_it', description: req.body.description || '', learningOutcomes: Array.isArray(req.body.learningOutcomes) ? req.body.learningOutcomes : [] };
  if (!course.courseCode || !course.name) return res.status(400).json({ success: false, message: 'Mã môn và tên môn là bắt buộc.' });
  learningDb.courses.unshift(course);
  logActivity({ userId: req.user.id, action: 'admin.course.create', targetTable: 'courses', targetId: course.id });
  res.status(201).json({ success: true, data: course, message: 'Đã tạo môn học.' });
});

app.patch('/api/admin/courses/:id', authMiddleware, requireAdminAccess, (req, res) => {
  const course = learningDb.courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy môn học.' });
  Object.assign(course, req.body || {});
  logActivity({ userId: req.user.id, action: 'admin.course.update', targetTable: 'courses', targetId: course.id });
  res.json({ success: true, data: course, message: 'Đã cập nhật môn học.' });
});

app.get('/api/admin/certificates/pending', authMiddleware, requireAdminAccess, (req, res) => {
  res.json({ success: true, data: learningDb.certificates.filter((item) => item.status === 'pending').map((item) => ({ ...item, student: toPublicUser(getStudentUser(item.studentId)) })) });
});

app.patch('/api/admin/certificates/:id/review', authMiddleware, requireAdminAccess, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Certificate.findByPk(req.params.id).then(async (certificate) => {
      if (!certificate) return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ.' });
      await certificate.update({ status: req.body.status === 'rejected' ? 'rejected' : 'approved', reviewedBy: req.user.id, reviewNote: req.body.reviewNote || '' });
      const student = await sqlDb.models.Student.findByPk(certificate.studentId);
      if (student) await sqlDb.models.Notification.create({ userId: student.userId, title: 'Kết quả duyệt chứng chỉ', content: `Chứng chỉ ${certificate.name} đã ${certificate.status === 'approved' ? 'được duyệt' : 'bị từ chối'}.`, type: 'academic' });
      return res.json({ success: true, data: certificate, message: 'Đã duyệt chứng chỉ.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể duyệt chứng chỉ.' }));
  }
  const certificate = learningDb.certificates.find((item) => item.id === req.params.id);
  if (!certificate) return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ.' });
  certificate.status = req.body.status === 'rejected' ? 'rejected' : 'approved';
  certificate.reviewedBy = req.user.id;
  certificate.reviewNote = req.body.reviewNote || '';
  certificate.updatedAt = new Date().toISOString();
  notifications.unshift({ id: makeId('notif'), userId: certificate.studentId, title: 'Kết quả duyệt chứng chỉ', message: `Chứng chỉ ${certificate.name} đã ${certificate.status === 'approved' ? 'được duyệt' : 'bị từ chối'}.`, detail: certificate.reviewNote, type: 'academic', read: false, createdAt: certificate.updatedAt });
  logActivity({ userId: req.user.id, action: `admin.certificate.${certificate.status}`, targetTable: 'certificates', targetId: certificate.id });
  res.json({ success: true, data: certificate, message: 'Đã duyệt chứng chỉ.' });
});

app.get('/api/admin/achievements/pending', authMiddleware, requireAdminAccess, (req, res) => {
  res.json({ success: true, data: learningDb.achievements.filter((item) => item.status === 'pending').map((item) => ({ ...item, student: toPublicUser(getStudentUser(item.studentId)) })) });
});

app.patch('/api/admin/achievements/:id/review', authMiddleware, requireAdminAccess, (req, res) => {
  if (sqlDb) {
    return sqlDb.models.Achievement.findByPk(req.params.id).then(async (achievement) => {
      if (!achievement) return res.status(404).json({ success: false, message: 'Không tìm thấy thành tích.' });
      await achievement.update({ status: req.body.status === 'rejected' ? 'rejected' : 'approved', reviewedBy: req.user.id, reviewNote: req.body.reviewNote || '' });
      const student = await sqlDb.models.Student.findByPk(achievement.studentId);
      if (student) await sqlDb.models.Notification.create({ userId: student.userId, title: 'Kết quả duyệt thành tích', content: `Thành tích ${achievement.title} đã ${achievement.status === 'approved' ? 'được duyệt' : 'bị từ chối'}.`, type: 'academic' });
      return res.json({ success: true, data: achievement, message: 'Đã duyệt thành tích.' });
    }).catch(() => res.status(500).json({ success: false, message: 'Không thể duyệt thành tích.' }));
  }
  const achievement = learningDb.achievements.find((item) => item.id === req.params.id);
  if (!achievement) return res.status(404).json({ success: false, message: 'Không tìm thấy thành tích.' });
  achievement.status = req.body.status === 'rejected' ? 'rejected' : 'approved';
  achievement.reviewedBy = req.user.id;
  achievement.reviewNote = req.body.reviewNote || '';
  achievement.updatedAt = new Date().toISOString();
  notifications.unshift({ id: makeId('notif'), userId: achievement.studentId, title: 'Kết quả duyệt thành tích', message: `Thành tích ${achievement.title} đã ${achievement.status === 'approved' ? 'được duyệt' : 'bị từ chối'}.`, detail: achievement.reviewNote, type: 'academic', read: false, createdAt: achievement.updatedAt });
  logActivity({ userId: req.user.id, action: `admin.achievement.${achievement.status}`, targetTable: 'achievements', targetId: achievement.id });
  res.json({ success: true, data: achievement, message: 'Đã duyệt thành tích.' });
});

app.get('/api/admin/reports', authMiddleware, requireAdminAccess, (req, res) => {
  const byCourse = learningDb.courses.map((course) => {
    const grades = learningDb.grades.filter((grade) => grade.courseId === course.id);
    const average = grades.length ? Math.round((grades.reduce((sum, grade) => sum + grade.totalScore, 0) / grades.length) * 10) / 10 : 0;
    return { course, average, failCount: grades.filter((grade) => ['Thi lại', 'Học lại'].includes(grade.status)).length };
  });
  res.json({ success: true, data: { byCourse, aiSummary: 'AI đề xuất tăng bài thực hành cho các môn có điểm trung bình dưới 6.5 và tổ chức phụ đạo cho nhóm sinh viên nguy cơ.' } });
});

app.get('/api/admin/logs', authMiddleware, requireAdminAccess, (req, res) => {
  res.json({ success: true, data: learningDb.activityLogs.slice(0, 200) });
});

app.get('/api/admin/career-profiles', authMiddleware, requireAdminAccess, async (req, res) => {
  if (!sqlDb) return res.json({ success: true, data: careerDb.careerProfiles.filter((profile) => profile.consentToShare).map(enrichCareerProfile) });
  try {
    const profiles = await sqlDb.models.CareerProfile.findAll({ where: { consentToShare: true }, include: [{ model: sqlDb.models.Student, include: [{ model: sqlDb.models.User }] }], order: [['updatedAt', 'DESC']] });
    res.json({ success: true, data: profiles });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể tải hồ sơ nghề nghiệp.' });
  }
});

app.get('/api/admin/career-profiles/:id', authMiddleware, requireAdminAccess, async (req, res) => {
  if (!sqlDb) {
    const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare);
    return profile ? res.json({ success: true, data: enrichCareerProfile(profile) }) : res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  }
  try {
    const profile = await sqlDb.models.CareerProfile.findOne({ where: { id: req.params.id, consentToShare: true }, include: [{ model: sqlDb.models.Student, include: [{ model: sqlDb.models.User }] }] });
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    res.json({ success: true, data: profile });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể tải hồ sơ.' });
  }
});

app.patch('/api/admin/career-profiles/:id/status', authMiddleware, requireAdminAccess, async (req, res) => {
  if (!sqlDb) return res.status(501).json({ success: false, message: 'Endpoint SQL chưa khả dụng cho fallback.' });
  try {
    const profile = await sqlDb.models.CareerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    await profile.update({ status: req.body.status || profile.status });
    await sqlDb.models.ActivityLog.create({ userId: req.user.id, action: 'admin.career_profile.status', targetTable: 'career_profiles', targetId: profile.id, note: profile.status });
    res.json({ success: true, data: profile, message: 'Đã cập nhật trạng thái hồ sơ.' });
  } catch {
    res.status(500).json({ success: false, message: 'Không thể cập nhật hồ sơ.' });
  }
});

app.get('/api/admin/users', authMiddleware, requireRole('admin'), (req, res) => {
  const search = String(req.query.q || '').toLowerCase().trim();
  const role = String(req.query.role || '').trim();

  const data = users
    .filter((user) => (role ? user.role === role : true))
    .filter((user) => (!search ? true : user.fullName.toLowerCase().includes(search) || user.email.includes(search) || user.accountId.toLowerCase().includes(search)))
    .map((user) => ({
      ...toPublicUser(user),
      classCount: buildUserClassCount(user),
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));

  res.json({ success: true, data });
});

app.patch('/api/admin/users/:id/role', authMiddleware, requireRole('admin'), (req, res) => {
  const { role } = req.body || {};
  const allowedRoles = ['student', 'lecturer', 'admin'];
  const user = users.find((item) => item.id === req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ.' });
  }

  user.role = role;
  user.updatedAt = new Date().toISOString();

  pushAuditLog({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'admin.user.role.patch',
    targetType: 'user',
    targetId: user.id,
    detail: `Cập nhật role thành ${role}`,
  });

  res.json({ success: true, data: toPublicUser(user), message: 'Đã cập nhật vai trò.' });
});

app.get('/api/admin/audit-logs', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ success: true, data: auditLogs });
});

app.post('/api/admin/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body || {};
    const normalizedEmail = normalizeIdentifier(email);

    if (!fullName || !normalizedEmail || !password || !['student', 'lecturer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu tạo tài khoản không hợp lệ.' });
    }

    if (!isSchoolEmail(normalizedEmail) || findUserByIdentifier(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Không thể tạo tài khoản với dữ liệu hiện tại.' });
    }

    const prefix = role === 'lecturer' ? 'lecturer' : 'student';
    const user = await createUserRecord({
      id: `user_${Date.now()}`,
      accountId: `${prefix}_${Date.now()}`,
      fullName,
      email: normalizedEmail,
      password,
      role,
    });

    users.push(user);
    pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.user.create', targetType: 'user', targetId: user.id, detail: `Tạo tài khoản ${role}` });
    return res.status(201).json({ success: true, data: { ...toPublicUser(user), classCount: 0 }, message: 'Tạo tài khoản thành công.' });
  } catch {
    return res.status(500).json({ success: false, message: 'Không thể tạo tài khoản.' });
  }
});

app.put('/api/admin/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = users.find((item) => item.id === req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const { fullName, email, password, role } = req.body || {};
    if (fullName) user.fullName = String(fullName).trim();
    if (email) user.email = normalizeIdentifier(email);
    if (password) user.passwordHash = await bcrypt.hash(password, 10);
    if (role && ['student', 'lecturer', 'admin'].includes(role)) user.role = role;
    user.updatedAt = new Date().toISOString();

    pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.user.update', targetType: 'user', targetId: user.id, detail: 'Cập nhật thông tin tài khoản' });
    return res.json({ success: true, data: { ...toPublicUser(user), classCount: buildUserClassCount(user) }, message: 'Cập nhật tài khoản thành công.' });
  } catch {
    return res.status(500).json({ success: false, message: 'Không thể cập nhật tài khoản.' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
  }

  users = users.filter((item) => item.id !== req.params.id);
  pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.user.delete', targetType: 'user', targetId: req.params.id, detail: 'Xóa tài khoản' });
  res.json({ success: true, message: 'Đã xóa tài khoản.' });
});

app.get('/api/admin/classes', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ success: true, data: classes.map(buildClassResponse) });
});

app.post('/api/admin/classes', authMiddleware, requireRole('admin'), (req, res) => {
  const { code, name, semester, room, teacherId, studentIds = [], capacity = 40, notes = '' } = req.body || {};
  const lecturer = teacherId ? users.find((user) => user.id === teacherId && user.role === 'lecturer') : null;
  if (!code || !name || !semester || (teacherId && !lecturer)) {
    return res.status(400).json({ success: false, message: 'Dữ liệu lớp học không hợp lệ.' });
  }

  const classroom = {
    id: `class_${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    semester: String(semester).trim(),
    room: String(room || 'Chưa phân phòng').trim(),
    teacherId: teacherId || null,
    studentIds: Array.isArray(studentIds) ? studentIds : [],
    capacity: Number(capacity) || 40,
    notes: String(notes || '').trim(),
    createdAt: new Date().toISOString(),
  };

  classes.push(classroom);
  pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.class.create', targetType: 'class', targetId: classroom.id, detail: `Tạo lớp ${classroom.code}` });
  res.status(201).json({ success: true, data: buildClassResponse(classroom), message: 'Đã tạo lớp học.' });
});

app.put('/api/admin/classes/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const classroom = classes.find((item) => item.id === req.params.id);
  if (!classroom) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học.' });
  }

  const { code, name, semester, room, teacherId, studentIds, capacity, notes } = req.body || {};
  if (code) classroom.code = String(code).trim().toUpperCase();
  if (name) classroom.name = String(name).trim();
  if (semester) classroom.semester = String(semester).trim();
  if (room) classroom.room = String(room).trim();
  if (teacherId !== undefined) classroom.teacherId = teacherId || null;
  if (studentIds) classroom.studentIds = Array.isArray(studentIds) ? studentIds : classroom.studentIds;
  if (capacity) classroom.capacity = Number(capacity) || classroom.capacity;
  if (notes !== undefined) classroom.notes = String(notes).trim();

  pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.class.update', targetType: 'class', targetId: classroom.id, detail: `Cập nhật lớp ${classroom.code}` });
  res.json({ success: true, data: buildClassResponse(classroom), message: 'Đã cập nhật lớp học.' });
});

app.delete('/api/admin/classes/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const classroom = classes.find((item) => item.id === req.params.id);
  if (!classroom) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học.' });
  }

  classes = classes.filter((item) => item.id !== req.params.id);
  pushAuditLog({ actorId: req.user.id, actorRole: req.user.role, action: 'admin.class.delete', targetType: 'class', targetId: req.params.id, detail: `Xóa lớp ${classroom.code}` });
  res.json({ success: true, message: 'Đã xóa lớp học.' });
});

app.post('/api/roadmap/generate', authMiddleware, requireRole('student'), (req, res) => {
  const { targetCourseId, weakTopics = [], weeklyStudyHours = 0, examScore = 0 } = req.body || {};
  const userId = req.user.id;

  if (!targetCourseId) {
    return res.status(400).json({ success: false, message: 'Thiếu targetCourseId.' });
  }

  const roadmapKey = getRoadmapKey(userId, targetCourseId);
  if (roadmapStore.has(roadmapKey)) {
    return res.json({ success: true, status: 'existing', existing: true, roadmap: roadmapStore.get(roadmapKey), message: 'Đã tìm thấy lộ trình hiện tại của bạn.' });
  }

  if (!Array.isArray(weakTopics) || weakTopics.length === 0 || weeklyStudyHours <= 0) {
    return res.json({ success: true, status: 'no_recommendation', existing: false, roadmap: null, message: 'Hiện chưa đủ dữ liệu để đề xuất lộ trình mới.' });
  }

  const roadmap = buildMockRoadmap({ targetCourseId, weakTopics, weeklyStudyHours, examScore });
  roadmapStore.set(roadmapKey, roadmap);
  return res.status(201).json({ success: true, status: 'success', existing: false, roadmap, message: 'Đã tạo lộ trình học tập cá nhân hóa.' });
});

app.get('/api/roadmap/current', authMiddleware, requireRole('student'), (req, res) => {
  const targetCourseId = String(req.query.targetCourseId || '');
  if (!targetCourseId) {
    return res.status(400).json({ success: false, message: 'Thiếu targetCourseId.' });
  }

  const roadmap = roadmapStore.get(getRoadmapKey(req.user.id, targetCourseId));
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Chưa có lộ trình hiện tại cho học phần này.' });
  }

  res.json({ success: true, roadmap });
});

app.get('/api/career/dashboard', authMiddleware, requireCareerAccess, (req, res) => {
  const sharedProfiles = careerDb.careerProfiles.filter((profile) => profile.consentToShare && profile.status !== 'Draft');
  const countByStatus = (status) => sharedProfiles.filter((profile) => profile.status === status).length;
  res.json({
    success: true,
    data: {
      totalSubmitted: sharedProfiles.length,
      pendingReview: countByStatus('Submitted') + countByStatus('Reviewing'),
      needUpdate: countByStatus('Need Update'),
      approved: countByStatus('Approved'),
      matched: countByStatus('Matched'),
      interviewing: countByStatus('Interviewing'),
      hired: countByStatus('Hired'),
    },
  });
});

app.get('/api/career/profiles', authMiddleware, requireCareerAccess, (req, res) => {
  const search = String(req.query.q || '').toLowerCase().trim();
  const status = String(req.query.status || '').trim();
  const minScore = Number(req.query.minScore || 0);
  const data = careerDb.careerProfiles
    .filter((profile) => profile.consentToShare && profile.status !== 'Draft')
    .map(enrichCareerProfile)
    .filter((profile) => (!status ? true : profile.status === status))
    .filter((profile) => (!minScore ? true : profile.careerReadinessScore >= minScore))
    .filter((profile) => (!search ? true : `${profile.student?.fullName} ${profile.student?.accountId} ${profile.desiredPosition} ${profile.desiredIndustry}`.toLowerCase().includes(search)))
    .sort((a, b) => +new Date(b.submittedAt || b.updatedAt) - +new Date(a.submittedAt || a.updatedAt));
  res.json({ success: true, data });
});

app.get('/api/career/profiles/:id', authMiddleware, requireCareerAccess, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare && item.status !== 'Draft');
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ nghề nghiệp.' });
  res.json({ success: true, data: enrichCareerProfile(profile) });
});

app.patch('/api/career/profiles/:id/review', authMiddleware, requireCareerAccess, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  const { status = 'Reviewing', comment = '' } = req.body || {};
  const allowed = ['Reviewing', 'Need Update', 'Approved', 'Rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Trạng thái review không hợp lệ.' });
  const now = new Date().toISOString();
  profile.status = status;
  profile.updatedAt = now;
  careerDb.careerReviews.unshift({ id: makeId('career_review'), careerProfileId: profile.id, reviewerId: req.user.id, status, comment, reviewedAt: now, createdAt: now });
  createCareerLog({ studentId: profile.studentId, careerProfileId: profile.id, officerId: req.user.id, action: `review.${status}`, note: comment });
  notifications.unshift({ id: makeId('notif'), userId: profile.studentId, title: 'Cập nhật hồ sơ nghề nghiệp', message: `Hồ sơ của bạn chuyển sang trạng thái ${status}.`, detail: comment || 'Vui lòng kiểm tra Career Profile để xem chi tiết.', type: 'career', read: false, createdAt: now });
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã cập nhật review hồ sơ.' });
});

app.patch('/api/career/profiles/:id/status', authMiddleware, requireCareerAccess, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  const allowed = ['Submitted', 'Reviewing', 'Need Update', 'Approved', 'Matched', 'Sent To Employer', 'Interviewing', 'Hired', 'Rejected'];
  const { status, note = '' } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
  profile.status = status;
  profile.updatedAt = new Date().toISOString();
  createCareerLog({ studentId: profile.studentId, careerProfileId: profile.id, officerId: req.user.id, action: `status.${status}`, note });
  notifications.unshift({ id: makeId('notif'), userId: profile.studentId, title: 'Trạng thái hỗ trợ việc làm đã thay đổi', message: `Hồ sơ chuyển sang ${status}.`, detail: note || 'Nhà trường đã cập nhật trạng thái hỗ trợ việc làm.', type: 'career', read: false, createdAt: profile.updatedAt });
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã cập nhật trạng thái.' });
});

app.post('/api/career/profiles/:id/comment', authMiddleware, requireCareerAccess, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  const note = String(req.body?.comment || '').trim();
  createCareerLog({ studentId: profile.studentId, careerProfileId: profile.id, officerId: req.user.id, action: 'comment', note });
  notifications.unshift({ id: makeId('notif'), userId: profile.studentId, title: 'Góp ý từ Career Center', message: 'Nhà trường đã gửi góp ý cho hồ sơ/CV của bạn.', detail: note, type: 'career', read: false, createdAt: new Date().toISOString() });
  saveCareerDb();
  res.json({ success: true, data: enrichCareerProfile(profile), message: 'Đã gửi góp ý.' });
});

app.post('/api/career/profiles/:id/match-jobs', authMiddleware, requireCareerAccess, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.params.id && item.consentToShare);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  const matches = careerDb.jobs.filter((job) => job.status === 'active').map((job) => ({ job, ...calculateJobMatch(profile, job) })).sort((a, b) => b.matchScore - a.matchScore);
  res.json({ success: true, data: matches });
});

app.get('/api/career/jobs', authMiddleware, requireCareerAccess, (req, res) => {
  res.json({ success: true, data: careerDb.jobs.filter((job) => !job.deletedAt).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) });
});

app.post('/api/career/jobs', authMiddleware, requireCareerAccess, (req, res) => {
  const now = new Date().toISOString();
  const job = { id: makeId('job'), companyName: '', title: '', industry: '', description: '', requirements: '', requiredSkills: [], requiredGpa: 0, location: '', jobType: 'internship', deadline: '', status: 'draft', createdBy: req.user.id, createdAt: now, updatedAt: now, ...req.body };
  if (!job.title || !job.companyName) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên công việc và công ty.' });
  if (typeof job.requiredSkills === 'string') job.requiredSkills = job.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean);
  careerDb.jobs.unshift(job);
  saveCareerDb();
  res.status(201).json({ success: true, data: job, message: 'Đã tạo tin tuyển dụng.' });
});

app.get('/api/career/jobs/:id', authMiddleware, requireCareerAccess, (req, res) => {
  const job = careerDb.jobs.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!job) return res.status(404).json({ success: false, message: 'Không tìm thấy job.' });
  res.json({ success: true, data: job });
});

app.patch('/api/career/jobs/:id', authMiddleware, requireCareerAccess, (req, res) => {
  const job = careerDb.jobs.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!job) return res.status(404).json({ success: false, message: 'Không tìm thấy job.' });
  Object.assign(job, req.body || {}, { updatedAt: new Date().toISOString() });
  if (typeof job.requiredSkills === 'string') job.requiredSkills = job.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean);
  saveCareerDb();
  res.json({ success: true, data: job, message: 'Đã cập nhật job.' });
});

app.delete('/api/career/jobs/:id', authMiddleware, requireCareerAccess, (req, res) => {
  const job = careerDb.jobs.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!job) return res.status(404).json({ success: false, message: 'Không tìm thấy job.' });
  job.deletedAt = new Date().toISOString();
  job.status = 'closed';
  saveCareerDb();
  res.json({ success: true, message: 'Đã xóa mềm job.' });
});

app.post('/api/career/jobs/:id/match-students', authMiddleware, requireCareerAccess, (req, res) => {
  const job = careerDb.jobs.find((item) => item.id === req.params.id && !item.deletedAt);
  if (!job) return res.status(404).json({ success: false, message: 'Không tìm thấy job.' });
  const matches = careerDb.careerProfiles.filter((profile) => profile.consentToShare && ['Submitted', 'Reviewing', 'Approved', 'Matched'].includes(profile.status)).map((profile) => ({ profile: enrichCareerProfile(profile), ...calculateJobMatch(profile, job) })).sort((a, b) => b.matchScore - a.matchScore);
  res.json({ success: true, data: matches });
});

app.post('/api/career/jobs/:id/send-student/:studentId', authMiddleware, requireCareerAccess, (req, res) => {
  const job = careerDb.jobs.find((item) => item.id === req.params.id && !item.deletedAt);
  const profile = careerDb.careerProfiles.find((item) => item.studentId === req.params.studentId && item.consentToShare);
  if (!job || !profile) return res.status(404).json({ success: false, message: 'Không tìm thấy job hoặc hồ sơ sinh viên.' });
  const ai = calculateJobMatch(profile, job);
  const now = new Date().toISOString();
  const match = { id: makeId('job_match'), jobId: job.id, studentId: profile.studentId, careerProfileId: profile.id, matchScore: ai.matchScore, matchReason: ai.matchReason, missingRequirements: ai.missingRequirements, recommendation: ai.recommendation, status: 'sent_to_employer', createdAt: now, updatedAt: now };
  careerDb.jobMatches.unshift(match);
  profile.status = 'Sent To Employer';
  profile.updatedAt = now;
  createCareerLog({ studentId: profile.studentId, careerProfileId: profile.id, officerId: req.user.id, action: 'job.send_student', note: `Giới thiệu tới ${job.companyName} - ${job.title}` });
  notifications.unshift({ id: makeId('notif'), userId: profile.studentId, title: 'Bạn được giới thiệu tới doanh nghiệp', message: `Nhà trường đã giới thiệu bạn cho vị trí ${job.title}.`, detail: ai.matchReason, type: 'career', read: false, createdAt: now });
  saveCareerDb();
  res.json({ success: true, data: match, message: 'Đã gửi sinh viên cho job.' });
});

app.post('/api/ai/generate-career-summary', authMiddleware, (req, res) => {
  const profile = req.user.role === 'student' ? getOrCreateCareerProfile(req.user.id) : careerDb.careerProfiles.find((item) => item.id === req.body?.careerProfileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  res.json({ success: true, data: generateCareerAi(profile) });
});

app.post('/api/ai/student-chat', authMiddleware, requireRole('student'), (req, res) => {
  const question = String(req.body?.message || '').trim();
  const recommendation = generateStudentRecommendation(req.user.id);
  const analytics = buildStudentAnalytics(req.user.id);
  const response = question
    ? `AI Đại Nam: Với câu hỏi "${question}", mình gợi ý bạn liên hệ lại dữ liệu học tập hiện tại. GPA của bạn là ${analytics.gpa}/4.0. ${recommendation.summary}`
    : recommendation.summary;
  learningDb.aiLogs.unshift({ id: makeId('ai_log'), userId: req.user.id, prompt: question, response, featureType: 'student_chat', createdAt: new Date().toISOString() });
  saveLearningDb();
  res.json({ success: true, data: { response, recommendations: recommendation.tasks } });
});

app.post('/api/ai/generate-study-plan', authMiddleware, requireRole('student'), (req, res) => {
  const recommendation = generateStudentRecommendation(req.user.id);
  const plan = { title: 'Lộ trình học 7 ngày', focusCourses: recommendation.focusCourses, days: recommendation.tasks.map((task, index) => ({ day: index + 1, task, durationMinutes: 45 })) };
  learningDb.aiLogs.unshift({ id: makeId('ai_log'), userId: req.user.id, prompt: 'generate-study-plan', response: JSON.stringify(plan), featureType: 'study_plan', createdAt: new Date().toISOString() });
  saveLearningDb();
  res.json({ success: true, data: plan });
});

app.post('/api/ai/analyze-student-result', authMiddleware, (req, res) => {
  const studentId = req.user.role === 'student' ? req.user.id : req.body?.studentId;
  if (req.user.role !== 'student' && !systemAdminRoles.includes(req.user.role) && !teacherRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Không có quyền phân tích.' });
  res.json({ success: true, data: { analytics: buildStudentAnalytics(studentId), recommendation: generateStudentRecommendation(studentId) } });
});

app.post('/api/ai/analyze-student', authMiddleware, requireTeacherAccess, (req, res) => {
  const studentId = req.body?.studentId;
  if (!studentId || !teacherCanAccessStudent(req.user.id, studentId)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền phân tích sinh viên này.' });
  }
  const analysis = analyzeTeacherStudent(req.user.id, studentId);
  const now = new Date().toISOString();
  const record = { id: makeId('student_ai_analysis'), studentId, teacherId: req.user.id, analysisSummary: analysis.analysisSummary, weakPoints: analysis.weakPoints, recommendations: analysis.recommendations, riskLevel: analysis.riskLevel, createdAt: now };
  learningDb.studentAiAnalyses.unshift(record);
  learningDb.aiLogs.unshift({ id: makeId('ai_log'), userId: req.user.id, prompt: `analyze-student:${studentId}`, response: analysis.analysisSummary, featureType: 'teacher_student_analysis', createdAt: now });
  saveLearningDb();
  res.json({ success: true, data: record });
});

app.post('/api/ai/generate-quiz', authMiddleware, requireTeacherAccess, (req, res) => {
  const topic = req.body?.topic || 'React Component';
  const difficulty = req.body?.difficulty || 'trung bình';
  const questions = [
    { questionText: `Giải thích khái niệm ${topic}?`, questionType: 'essay', difficulty, score: 5 },
    { questionText: `${topic} thường được ứng dụng trong tình huống nào?`, questionType: 'multiple_choice', options: ['Ứng dụng thực tế', 'Không dùng', 'Chỉ backend', 'Chỉ thiết kế ảnh'], correctAnswer: 'Ứng dụng thực tế', difficulty, score: 5 },
  ];
  res.json({ success: true, data: { topic, difficulty, questions, note: 'AI chỉ gợi ý, giảng viên cần duyệt trước khi công bố.' } });
});

app.post('/api/ai/analyze-class-result', authMiddleware, requireTeacherAccess, (req, res) => {
  const classId = req.body?.classId;
  const courseClass = getTeacherClasses(req.user.id).find((item) => item.id === classId) || getTeacherClasses(req.user.id)[0];
  if (!courseClass) return res.status(404).json({ success: false, message: 'Không có lớp để phân tích.' });
  const students = courseClass.studentIds.map((studentId) => ({ student: getStudentUser(studentId), analytics: buildStudentAnalytics(studentId) }));
  res.json({ success: true, data: { summary: `Lớp có ${students.filter((item) => item.analytics.weakCourses.length > 0).length} sinh viên cần hỗ trợ.`, students } });
});

app.post('/api/ai/generate-profile-summary', authMiddleware, (req, res) => {
  const studentId = req.user.role === 'student' ? req.user.id : req.body?.studentId;
  if (req.user.role !== 'student' && !systemAdminRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Không có quyền tạo profile summary.' });
  const officialProfile = buildOfficialStudentProfile(studentId);
  let profile = learningDb.studentProfiles.find((item) => item.studentId === studentId);
  if (!profile) {
    profile = { id: makeId('student_profile'), studentId, careerObjective: '', skills: [], publicVisibility: false, showGpa: true, updatedAt: new Date().toISOString() };
    learningDb.studentProfiles.push(profile);
  }
  profile.aiSummary = officialProfile.aiSummary;
  profile.updatedAt = new Date().toISOString();
  saveLearningDb();
  res.json({ success: true, data: officialProfile });
});

app.post('/api/ai/analyze-career-readiness', authMiddleware, (req, res) => {
  const profile = req.user.role === 'student' ? getOrCreateCareerProfile(req.user.id) : careerDb.careerProfiles.find((item) => item.id === req.body?.careerProfileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  res.json({ success: true, data: calculateCareerScores(profile) });
});

app.post('/api/ai/suggest-career-path', authMiddleware, (req, res) => {
  const profile = req.user.role === 'student' ? getOrCreateCareerProfile(req.user.id) : careerDb.careerProfiles.find((item) => item.id === req.body?.careerProfileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  res.json({ success: true, data: generateCareerAi(profile).suggestions });
});

app.post('/api/ai/match-student-to-job', authMiddleware, (req, res) => {
  const profile = careerDb.careerProfiles.find((item) => item.id === req.body?.careerProfileId && (req.user.role === 'student' ? item.studentId === req.user.id : careerRoles.includes(req.user.role)));
  const job = careerDb.jobs.find((item) => item.id === req.body?.jobId && !item.deletedAt);
  if (!profile || !job) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ hoặc job.' });
  res.json({ success: true, data: calculateJobMatch(profile, job) });
});

app.post('/api/ai/improve-cv-feedback', authMiddleware, (req, res) => {
  const profile = req.user.role === 'student' ? getOrCreateCareerProfile(req.user.id) : careerDb.careerProfiles.find((item) => item.id === req.body?.careerProfileId);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
  const enriched = enrichCareerProfile(profile);
  res.json({ success: true, data: { feedback: [`CV nên nhấn mạnh ${enriched.skills.slice(0, 3).map((skill) => skill.skillName).join(', ') || 'kỹ năng chính'}.`, 'Bổ sung link dự án có README rõ ràng.', 'Mô tả kết quả đạt được bằng số liệu nếu có.'] } });
});

app.use('/api/admin', authMiddleware, requireRole('admin'));
app.use('/api/lecturer', authMiddleware, requireRole('lecturer'));
app.use('/api/student', authMiddleware, requireRole('student'));

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.', path: req.originalUrl });
});

seedData().then(async () => {
  try {
    sqlDb = await initSqlDatabase();
    console.log('✅ SQL database connected and synchronized');
    console.log(`ℹ️ Seed users use password: ${sqlDb.seedPassword}`);
  } catch (error) {
    console.error('⚠️ SQL database unavailable, falling back to legacy in-memory/json stores:', error.message);
  }
  loadCareerDb();
  loadLearningDb();
  seedLearningDefaults();
  if (careerDb.jobs.length === 0) {
    careerDb.jobs.push({
      id: 'job_frontend_intern_1',
      companyName: 'Scholar Tech Partner',
      title: 'Frontend Intern',
      industry: 'Công nghệ phần mềm',
      description: 'Tham gia phát triển giao diện web giáo dục bằng React.',
      requirements: 'Nắm HTML, CSS, JavaScript, React cơ bản; có tinh thần học hỏi.',
      requiredSkills: ['React', 'JavaScript', 'CSS'],
      requiredGpa: 2.6,
      location: 'Hồ Chí Minh',
      jobType: 'internship',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'active',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveCareerDb();
  }
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
