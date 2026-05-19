export type GradeStatus = 'passed' | 'retake' | 'relearn';

export interface Student {
  id: string;
  fullName: string;
  studentCode: string;
  major: string;
  faculty: string;
  cohort: string;
}

export interface Semester {
  id: string;
  name: string;
  academicYear: string;
  order: number;
}

export interface GradeComponent {
  id: string;
  label: string;
  type: 'attendance' | 'midterm' | 'practice' | 'final';
  score: number;
  maxScore: number;
  weight: number;
}

export interface GradeScale {
  letter: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
  min: number;
  max: number;
  gradePoint: number;
}

export interface RetakeAttempt {
  id: string;
  attemptNo: number;
  examDate: string;
  score10: number;
  note?: string;
}

export interface CourseGrade {
  id: string;
  semesterId: string;
  courseCode: string;
  courseName: string;
  section: string;
  credits: number;
  components: GradeComponent[];
  finalScore10: number;
  letterGrade: GradeScale['letter'];
  gradePoint: number;
  status: GradeStatus;
  note?: string;
  teacherNote?: string;
  retakeHistory: RetakeAttempt[];
}

export interface GPAResult {
  value: number;
  attemptedCredits: number;
  earnedCredits: number;
  classification: string;
}

export interface SemesterGradesData {
  semester: Semester;
  courses: CourseGrade[];
  gpa: GPAResult;
  retakeCount: number;
  relearnCount: number;
}

export interface GradesSummary {
  totalCreditsAttempted: number;
  totalCreditsEarned: number;
  completedCourses: number;
  retakeCourses: number;
  relearnCourses: number;
  semesterGPA: GPAResult;
  cumulativeGPA: GPAResult;
}

export interface StudentGradesResponse {
  student: Student;
  semesters: Semester[];
  courses: CourseGrade[];
}
