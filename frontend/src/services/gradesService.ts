import { mockCourseGrades, mockGradesStudent, mockSemesters } from '@/mock/gradesData';
import type { CourseGrade, GradesSummary, SemesterGradesData, StudentGradesResponse } from '@/types/grades';
import { calculateGPA, calculateStatusCount } from '@/utils/gradeUtils';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldMockFail = false;

async function maybeFail() {
  if (shouldMockFail) {
    throw new Error('Không thể tải dữ liệu bảng điểm.');
  }
}

export const gradesService = {
  async getStudentGrades(studentId: string): Promise<StudentGradesResponse> {
    await delay(450);
    await maybeFail();

    return {
      student: { ...mockGradesStudent, id: studentId || mockGradesStudent.id },
      semesters: mockSemesters,
      courses: mockCourseGrades,
    };
  },

  async getStudentSummary(studentId: string): Promise<GradesSummary> {
    await delay(350);
    await maybeFail();
    void studentId;

    const courses = mockCourseGrades;
    const latestSemesterId = mockSemesters[mockSemesters.length - 1]?.id;
    const latestSemesterCourses = courses.filter((course) => course.semesterId === latestSemesterId);

    return {
      totalCreditsAttempted: courses.reduce((total, course) => total + course.credits, 0),
      totalCreditsEarned: calculateGPA(courses).earnedCredits,
      completedCourses: courses.filter((course) => course.status === 'passed').length,
      retakeCourses: calculateStatusCount(courses, 'retake'),
      relearnCourses: calculateStatusCount(courses, 'relearn'),
      semesterGPA: calculateGPA(latestSemesterCourses),
      cumulativeGPA: calculateGPA(courses),
    };
  },

  async getStudentSemesters(studentId: string): Promise<SemesterGradesData[]> {
    await delay(300);
    await maybeFail();
    void studentId;

    return mockSemesters.map((semester) => {
      const courses = mockCourseGrades.filter((course) => course.semesterId === semester.id);
      const gpa = calculateGPA(courses);

      return {
        semester,
        courses,
        gpa,
        retakeCount: calculateStatusCount(courses, 'retake'),
        relearnCount: calculateStatusCount(courses, 'relearn'),
      };
    });
  },

  async getCourseDetail(studentId: string, courseId: string): Promise<CourseGrade> {
    await delay(250);
    await maybeFail();
    void studentId;

    const course = mockCourseGrades.find((item) => item.id === courseId);
    if (!course) {
      throw new Error('Không tìm thấy chi tiết học phần.');
    }

    return course;
  },
};
