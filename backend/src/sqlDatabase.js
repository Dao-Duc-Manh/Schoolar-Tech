const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const STRONG_TEST_PASSWORD = process.env.SEED_TEST_PASSWORD || 'DaiNam@Test2026';

function createSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: process.env.DATABASE_DIALECT || 'postgres',
      logging: process.env.NODE_ENV === 'development' ? false : false,
    });
  }

  return new Sequelize(
    process.env.DB_NAME || 'scholar_tech_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: false,
    }
  );
}

function defineModels(sequelize) {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false, field: 'full_name' },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    role: { type: DataTypes.STRING(40), allowNull: false },
    avatar: DataTypes.STRING(500),
    phone: DataTypes.STRING(30),
    status: { type: DataTypes.STRING(30), defaultValue: 'active' },
  }, { tableName: 'users', underscored: true });

  const Student = sequelize.define('Student', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    studentCode: { type: DataTypes.STRING(60), allowNull: false, unique: true, field: 'student_code' },
    faculty: DataTypes.STRING(255),
    major: DataTypes.STRING(255),
    className: { type: DataTypes.STRING(120), field: 'class_name' },
    courseYear: { type: DataTypes.STRING(40), field: 'course_year' },
    gpa: { type: DataTypes.FLOAT, defaultValue: 0 },
    academicStatus: { type: DataTypes.STRING(60), defaultValue: 'Đang học', field: 'academic_status' },
  }, { tableName: 'students', underscored: true });

  const Teacher = sequelize.define('Teacher', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    teacherCode: { type: DataTypes.STRING(60), allowNull: false, unique: true, field: 'teacher_code' },
    faculty: DataTypes.STRING(255),
    position: DataTypes.STRING(120),
    degree: DataTypes.STRING(120),
  }, { tableName: 'teachers', underscored: true });

  const Course = sequelize.define('Course', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    courseCode: { type: DataTypes.STRING(60), allowNull: false, unique: true, field: 'course_code' },
    name: { type: DataTypes.STRING(255), allowNull: false },
    credits: { type: DataTypes.INTEGER, defaultValue: 3 },
    faculty: DataTypes.STRING(255),
    major: DataTypes.STRING(255),
    description: DataTypes.TEXT,
  }, { tableName: 'courses', underscored: true });

  const Class = sequelize.define('Class', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    major: DataTypes.STRING(255),
    courseYear: { type: DataTypes.STRING(40), field: 'course_year' },
  }, { tableName: 'classes', underscored: true });

  const CourseEnrollment = sequelize.define('CourseEnrollment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, field: 'student_id' },
    teacherId: { type: DataTypes.UUID, allowNull: false, field: 'teacher_id' },
    courseId: { type: DataTypes.UUID, allowNull: false, field: 'course_id' },
    classId: { type: DataTypes.UUID, allowNull: false, field: 'class_id' },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    missingAssignments: { type: DataTypes.INTEGER, defaultValue: 0, field: 'missing_assignments' },
    learningStatus: { type: DataTypes.STRING(40), defaultValue: 'Active', field: 'learning_status' },
    riskLevel: { type: DataTypes.STRING(40), defaultValue: 'low', field: 'risk_level' },
    riskReason: { type: DataTypes.TEXT, field: 'risk_reason' },
    lastActivityAt: { type: DataTypes.DATE, field: 'last_activity_at' },
  }, { tableName: 'course_enrollments', underscored: true });

  const Grade = sequelize.define('Grade', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.UUID, allowNull: false, field: 'course_id' },
    attendanceScore: { type: DataTypes.FLOAT, defaultValue: 0, field: 'attendance_score' },
    assignmentScore: { type: DataTypes.FLOAT, defaultValue: 0, field: 'assignment_score' },
    midtermScore: { type: DataTypes.FLOAT, defaultValue: 0, field: 'midterm_score' },
    finalScore: { type: DataTypes.FLOAT, defaultValue: 0, field: 'final_score' },
    totalScore: { type: DataTypes.FLOAT, defaultValue: 0, field: 'total_score' },
    letterGrade: { type: DataTypes.STRING(10), field: 'letter_grade' },
    status: DataTypes.STRING(60),
    isLocked: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_locked' },
  }, { tableName: 'grades', underscored: true });

  const Certificate = sequelize.define('Certificate', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, field: 'student_id' },
    name: { type: DataTypes.STRING(255), allowNull: false },
    issuer: DataTypes.STRING(255),
    issueDate: { type: DataTypes.DATEONLY, field: 'issue_date' },
    expiryDate: { type: DataTypes.DATEONLY, field: 'expiry_date' },
    fileUrl: { type: DataTypes.STRING(500), field: 'file_url' },
    status: { type: DataTypes.STRING(40), defaultValue: 'pending' },
    reviewedBy: { type: DataTypes.UUID, field: 'reviewed_by' },
    reviewNote: { type: DataTypes.TEXT, field: 'review_note' },
  }, { tableName: 'certificates', underscored: true });

  const Achievement = sequelize.define('Achievement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, field: 'student_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    organization: DataTypes.STRING(255),
    achievementDate: { type: DataTypes.DATEONLY, field: 'achievement_date' },
    description: DataTypes.TEXT,
    fileUrl: { type: DataTypes.STRING(500), field: 'file_url' },
    status: { type: DataTypes.STRING(40), defaultValue: 'pending' },
    reviewedBy: { type: DataTypes.UUID, field: 'reviewed_by' },
    reviewNote: { type: DataTypes.TEXT, field: 'review_note' },
  }, { tableName: 'achievements', underscored: true });

  const CareerProfile = sequelize.define('CareerProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'student_id' },
    careerObjective: { type: DataTypes.TEXT, field: 'career_objective' },
    desiredPosition: { type: DataTypes.STRING(255), field: 'desired_position' },
    desiredIndustry: { type: DataTypes.STRING(255), field: 'desired_industry' },
    desiredLocation: { type: DataTypes.STRING(255), field: 'desired_location' },
    portfolioUrl: { type: DataTypes.STRING(500), field: 'portfolio_url' },
    githubUrl: { type: DataTypes.STRING(500), field: 'github_url' },
    linkedinUrl: { type: DataTypes.STRING(500), field: 'linkedin_url' },
    cvFileUrl: { type: DataTypes.STRING(500), field: 'cv_file_url' },
    aiSummary: { type: DataTypes.TEXT, field: 'ai_summary' },
    academicScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'academic_score' },
    skillScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'skill_score' },
    projectScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'project_score' },
    certificateScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'certificate_score' },
    achievementScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'achievement_score' },
    experienceScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'experience_score' },
    careerReadinessScore: { type: DataTypes.INTEGER, defaultValue: 0, field: 'career_readiness_score' },
    status: { type: DataTypes.STRING(60), defaultValue: 'Draft' },
    consentToShare: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'consent_to_share' },
    showGpa: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_gpa' },
    submittedAt: { type: DataTypes.DATE, field: 'submitted_at' },
  }, { tableName: 'career_profiles', underscored: true });

  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING(60), defaultValue: 'system' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  }, { tableName: 'notifications', underscored: true, updatedAt: false });

  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, field: 'user_id' },
    action: { type: DataTypes.STRING(255), allowNull: false },
    targetTable: { type: DataTypes.STRING(120), field: 'target_table' },
    targetId: { type: DataTypes.STRING(120), field: 'target_id' },
    note: DataTypes.TEXT,
  }, { tableName: 'activity_logs', underscored: true, updatedAt: false });

  const TeacherStudentNote = sequelize.define('TeacherStudentNote', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    teacherId: { type: DataTypes.UUID, allowNull: false, field: 'teacher_id' },
    studentId: { type: DataTypes.UUID, allowNull: false, field: 'student_id' },
    noteType: { type: DataTypes.STRING(40), defaultValue: 'Academic', field: 'note_type' },
    content: { type: DataTypes.TEXT, allowNull: false },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_private' },
  }, { tableName: 'teacher_student_notes', underscored: true });

  User.hasOne(Student, { foreignKey: 'userId' });
  Student.belongsTo(User, { foreignKey: 'userId' });
  User.hasOne(Teacher, { foreignKey: 'userId' });
  Teacher.belongsTo(User, { foreignKey: 'userId' });
  Student.hasMany(Grade, { foreignKey: 'studentId' });
  Grade.belongsTo(Student, { foreignKey: 'studentId' });
  Course.hasMany(Grade, { foreignKey: 'courseId' });
  Grade.belongsTo(Course, { foreignKey: 'courseId' });
  Student.hasOne(CareerProfile, { foreignKey: 'studentId' });
  CareerProfile.belongsTo(Student, { foreignKey: 'studentId' });
  Student.hasMany(Certificate, { foreignKey: 'studentId' });
  Certificate.belongsTo(Student, { foreignKey: 'studentId' });
  Student.hasMany(Achievement, { foreignKey: 'studentId' });
  Achievement.belongsTo(Student, { foreignKey: 'studentId' });
  CourseEnrollment.belongsTo(Student, { foreignKey: 'studentId' });
  CourseEnrollment.belongsTo(Teacher, { foreignKey: 'teacherId' });
  CourseEnrollment.belongsTo(Course, { foreignKey: 'courseId' });
  CourseEnrollment.belongsTo(Class, { foreignKey: 'classId' });

  return { User, Student, Teacher, Course, Class, CourseEnrollment, Grade, Certificate, Achievement, CareerProfile, Notification, ActivityLog, TeacherStudentNote, Op };
}

function gradeMeta(totalScore) {
  const rounded = Math.round(Number(totalScore) * 10) / 10;
  return {
    totalScore: rounded,
    letterGrade: rounded >= 8.5 ? 'A' : rounded >= 8 ? 'B+' : rounded >= 7 ? 'B' : rounded >= 6.5 ? 'C+' : rounded >= 5.5 ? 'C' : rounded >= 5 ? 'D+' : rounded >= 4 ? 'D' : 'F',
    status: rounded >= 5 ? 'Đạt' : rounded >= 4 ? 'Thi lại' : 'Học lại',
  };
}

async function seedSql(models) {
  const { User, Student, Teacher, Course, Class, CourseEnrollment, Grade, Certificate, Achievement, CareerProfile, Notification } = models;
  const existing = await User.count();
  if (existing > 0) return;

  const passwordHash = await bcrypt.hash(STRONG_TEST_PASSWORD, 10);
  const [studentUser, teacherUser, adminUser, careerUser, superUser] = await Promise.all([
    User.create({ fullName: 'Nguyễn Văn A', email: 'student1@school.edu.vn', passwordHash, role: 'student', phone: '0912345678' }),
    User.create({ fullName: 'Trần Thị B', email: 'lecturer1@school.edu.vn', passwordHash, role: 'lecturer', phone: '0987654321' }),
    User.create({ fullName: 'Lê Thu C', email: 'admin1@school.edu.vn', passwordHash, role: 'admin' }),
    User.create({ fullName: 'Phạm Minh Career', email: 'career1@school.edu.vn', passwordHash, role: 'career_officer' }),
    User.create({ fullName: 'Đại Nam Super Admin', email: 'super1@school.edu.vn', passwordHash, role: 'super_admin' }),
  ]);

  const student = await Student.create({ userId: studentUser.id, studentCode: 'student1', faculty: 'Khoa Công nghệ thông tin', major: 'Công nghệ thông tin', className: 'CNTT K16', courseYear: '2023-2027', gpa: 2.82, academicStatus: 'Đang học' });
  const teacher = await Teacher.create({ userId: teacherUser.id, teacherCode: 'lecturer1', faculty: 'Khoa Công nghệ thông tin', position: 'Giảng viên', degree: 'Thạc sĩ' });
  await Teacher.create({ userId: adminUser.id, teacherCode: 'admin1', faculty: 'Quản trị hệ thống', position: 'Admin', degree: 'N/A' });
  const classroom = await Class.create({ name: 'CNTT K16', major: 'Công nghệ thông tin', courseYear: '2023-2027' });
  const web = await Course.create({ courseCode: 'WEB301', name: 'Lập trình Web', credits: 3, faculty: 'Khoa Công nghệ thông tin', major: 'Công nghệ thông tin', description: 'Xây dựng ứng dụng web hiện đại với React và API.' });
  const db = await Course.create({ courseCode: 'DB301', name: 'Cơ sở dữ liệu', credits: 3, faculty: 'Khoa Công nghệ thông tin', major: 'Công nghệ thông tin', description: 'Thiết kế CSDL quan hệ và SQL.' });
  await CourseEnrollment.bulkCreate([
    { studentId: student.id, teacherId: teacher.id, courseId: web.id, classId: classroom.id, progress: 64, missingAssignments: 1, learningStatus: 'Active', lastActivityAt: new Date() },
    { studentId: student.id, teacherId: teacher.id, courseId: db.id, classId: classroom.id, progress: 42, missingAssignments: 3, learningStatus: 'At Risk', riskLevel: 'high', riskReason: 'Tiến độ thấp và còn thiếu bài tập', lastActivityAt: new Date() },
  ]);
  await Grade.bulkCreate([
    { studentId: student.id, courseId: web.id, attendanceScore: 8.5, assignmentScore: 7.2, midtermScore: 6.4, finalScore: 6.8, ...gradeMeta(6.9), isLocked: false },
    { studentId: student.id, courseId: db.id, attendanceScore: 8, assignmentScore: 5.8, midtermScore: 5.2, finalScore: 5.6, ...gradeMeta(5.7), isLocked: false },
  ]);
  await CareerProfile.create({ studentId: student.id, careerObjective: 'Trở thành Frontend Developer trong lĩnh vực giáo dục số.', desiredPosition: 'Frontend Intern', desiredIndustry: 'EdTech', desiredLocation: 'Hà Nội', githubUrl: 'https://github.com/student1', aiSummary: 'Sinh viên có nền tảng web và cơ sở dữ liệu, cần bổ sung dự án thực tế.', academicScore: 70, skillScore: 55, projectScore: 40, certificateScore: 20, achievementScore: 20, experienceScore: 10, careerReadinessScore: 55, status: 'Submitted', consentToShare: true, submittedAt: new Date() });
  await Certificate.create({ studentId: student.id, name: 'JavaScript Fundamentals', issuer: 'Dai Nam Online', issueDate: '2026-01-15', fileUrl: '/uploads/sample-certificate.pdf', status: 'approved', reviewedBy: adminUser.id, reviewNote: 'Hợp lệ' });
  await Achievement.create({ studentId: student.id, title: 'Top 10 cuộc thi thiết kế website cấp khoa', organization: 'Đại Nam University', achievementDate: '2026-02-20', description: 'Dự án website học tập.', status: 'approved', reviewedBy: adminUser.id, reviewNote: 'Hợp lệ' });
  await Notification.bulkCreate([
    { userId: studentUser.id, title: 'Chào mừng đến Đại Nam LMS', content: 'Tài khoản học tập số của bạn đã sẵn sàng.', type: 'system' },
    { userId: adminUser.id, title: 'SQL database đã seed dữ liệu', content: 'Dữ liệu mẫu đã được tạo trong database.', type: 'system' },
  ]);
}

async function initSqlDatabase() {
  const sequelize = createSequelize();
  const models = defineModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await seedSql(models);
  return { sequelize, models, seedPassword: STRONG_TEST_PASSWORD };
}

module.exports = { initSqlDatabase, STRONG_TEST_PASSWORD };
