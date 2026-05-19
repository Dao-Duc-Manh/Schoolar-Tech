import type { CourseGrade, GradeComponent, RetakeAttempt, Semester, Student } from '@/types/grades';
import { calculateFinalScoreFromComponents, determineGradeStatus, getGradeScale } from '@/utils/gradeUtils';

interface RawCourseGrade {
  id: string;
  semesterId: string;
  courseCode: string;
  courseName: string;
  section: string;
  credits: number;
  components: GradeComponent[];
  note?: string;
  teacherNote?: string;
  retakeHistory: RetakeAttempt[];
  officialFinal10?: number;
}

const semesters: Semester[] = [
  { id: 'sem-2022-1', name: 'Học kỳ 1', academicYear: '2022 - 2023', order: 1 },
  { id: 'sem-2022-2', name: 'Học kỳ 2', academicYear: '2022 - 2023', order: 2 },
  { id: 'sem-2023-summer', name: 'Học kỳ hè', academicYear: '2022 - 2023', order: 3 },
  { id: 'sem-2023-1', name: 'Học kỳ 1', academicYear: '2023 - 2024', order: 4 },
  { id: 'sem-2023-2', name: 'Học kỳ 2', academicYear: '2023 - 2024', order: 5 },
];

export const mockGradesStudent: Student = {
  id: 'student_001',
  fullName: 'Nguyễn Văn A',
  studentCode: '20220001',
  major: 'Công nghệ Thông tin',
  faculty: 'Khoa Công nghệ số',
  cohort: 'K18',
};

const rawCourses: RawCourseGrade[] = [
  {
    id: 'course-001',
    semesterId: 'sem-2022-1',
    courseCode: 'MTH101',
    courseName: 'Toán cao cấp',
    section: 'MTH101-01',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 9, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 8, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Bài tập', type: 'practice', score: 8.5, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 9, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Nắm chắc kiến thức nền, nên tiếp tục giữ nhịp tự học.',
    note: 'Đạt chuẩn đầu ra học phần.',
    retakeHistory: [],
  },
  {
    id: 'course-002',
    semesterId: 'sem-2022-1',
    courseCode: 'PHY101',
    courseName: 'Vật lý đại cương',
    section: 'PHY101-03',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 6, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 3.5, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Thực hành', type: 'practice', score: 4, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 3.6, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Cần ôn lại phần cơ học và điện từ học trước kỳ thi lại.',
    note: 'Chưa đạt điều kiện qua môn, cần đăng ký thi lại.',
    retakeHistory: [],
  },
  {
    id: 'course-003',
    semesterId: 'sem-2022-1',
    courseCode: 'ENG101',
    courseName: 'Tiếng Anh 1',
    section: 'ENG101-07',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 8.5, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 7, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Bài tập', type: 'practice', score: 7.5, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 7.8, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Kỹ năng đọc hiểu ổn, nên luyện thêm speaking.',
    note: 'Hoàn thành đúng tiến độ.',
    retakeHistory: [],
  },
  {
    id: 'course-004',
    semesterId: 'sem-2022-2',
    courseCode: 'MAT201',
    courseName: 'Đại số tuyến tính',
    section: 'MAT201-02',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 8, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 5.5, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Bài tập', type: 'practice', score: 6, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 5.8, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Có thể cải thiện phần ma trận và vector bằng luyện đề thêm.',
    note: 'Đạt mức qua môn.',
    retakeHistory: [],
  },
  {
    id: 'course-005',
    semesterId: 'sem-2022-2',
    courseCode: 'STA201',
    courseName: 'Xác suất thống kê',
    section: 'STA201-05',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 7, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 3.5, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Bài tập', type: 'practice', score: 4, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 3.5, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Sau thi lại vẫn chưa đạt, nên học lại để củng cố nền tảng thống kê.',
    note: 'Đã thi lại nhưng chưa đạt.',
    retakeHistory: [
      { id: 'r1', attemptNo: 1, examDate: '2023-08-15', score10: 3.8, note: 'Thi lại lần 1 chưa đạt.' },
    ],
    officialFinal10: 3.8,
  },
  {
    id: 'course-006',
    semesterId: 'sem-2022-2',
    courseCode: 'CSD202',
    courseName: 'Cấu trúc dữ liệu',
    section: 'CSD202-01',
    credits: 4,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 9, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 8.2, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Lab', type: 'practice', score: 8.6, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 8.3, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Làm bài lab tốt, có thể tham gia đội tuyển cấu trúc dữ liệu.',
    note: 'Điểm tốt, đủ điều kiện học học phần nâng cao.',
    retakeHistory: [],
  },
  {
    id: 'course-007',
    semesterId: 'sem-2023-summer',
    courseCode: 'RES205',
    courseName: 'Phương pháp nghiên cứu khoa học',
    section: 'RES205-02',
    credits: 2,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 8.5, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 7.8, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Bài tập', type: 'practice', score: 8, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 8.4, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Biết cách trình bày báo cáo khoa học mạch lạc.',
    note: 'Hoàn thành học kỳ hè đúng tiến độ.',
    retakeHistory: [],
  },
  {
    id: 'course-008',
    semesterId: 'sem-2023-1',
    courseCode: 'WEB301',
    courseName: 'Lập trình Web',
    section: 'WEB301-09',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 9.5, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 8.7, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Lab', type: 'practice', score: 9.2, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 9.1, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Rất tốt ở phần React và tổ chức component.',
    note: 'Đề cử tham gia dự án web nhóm.',
    retakeHistory: [],
  },
  {
    id: 'course-009',
    semesterId: 'sem-2023-1',
    courseCode: 'DB301',
    courseName: 'Cơ sở dữ liệu',
    section: 'DB301-04',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 7.8, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 4.8, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Lab', type: 'practice', score: 5.2, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 4.5, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Đã qua môn nhưng cần củng cố phần tối ưu truy vấn SQL.',
    note: 'Điểm sát ngưỡng D, cần chú ý nền tảng.',
    retakeHistory: [],
  },
  {
    id: 'course-010',
    semesterId: 'sem-2023-2',
    courseCode: 'NET302',
    courseName: 'Mạng máy tính',
    section: 'NET302-02',
    credits: 3,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 8.2, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 6.5, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Lab', type: 'practice', score: 6.8, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 7.1, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Khả năng thực hành khá tốt, nên đào sâu thêm routing và switching.',
    note: 'Hoàn thành tốt.',
    retakeHistory: [],
  },
  {
    id: 'course-011',
    semesterId: 'sem-2023-2',
    courseCode: 'OS302',
    courseName: 'Hệ điều hành',
    section: 'OS302-01',
    credits: 4,
    components: [
      { id: 'c1', label: 'Chuyên cần', type: 'attendance', score: 8.7, maxScore: 10, weight: 10 },
      { id: 'c2', label: 'Giữa kỳ', type: 'midterm', score: 7.4, maxScore: 10, weight: 20 },
      { id: 'c3', label: 'Lab', type: 'practice', score: 7.8, maxScore: 10, weight: 20 },
      { id: 'c4', label: 'Cuối kỳ', type: 'final', score: 8, maxScore: 10, weight: 50 },
    ],
    teacherNote: 'Hiểu tốt quản lý tiến trình và deadlock.',
    note: 'Có thể đăng ký học phần chuyên sâu hệ phân tán.',
    retakeHistory: [],
  },
];

export const mockSemesters = semesters;

export const mockCourseGrades: CourseGrade[] = rawCourses.map((course) => {
  const finalScore10 = 'officialFinal10' in course && typeof course.officialFinal10 === 'number'
    ? course.officialFinal10
    : calculateFinalScoreFromComponents(course.components);
  const scale = getGradeScale(finalScore10);

  return {
    id: course.id,
    semesterId: course.semesterId,
    courseCode: course.courseCode,
    courseName: course.courseName,
    section: course.section,
    credits: course.credits,
    components: course.components,
    finalScore10,
    letterGrade: scale.letter,
    gradePoint: scale.gradePoint,
    status: determineGradeStatus({ finalScore10, retakeHistory: course.retakeHistory }),
    note: course.note,
    teacherNote: course.teacherNote,
    retakeHistory: course.retakeHistory,
  };
});
