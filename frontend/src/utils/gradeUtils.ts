import type { CourseGrade, GPAResult, GradeComponent, GradeScale, GradeStatus } from '@/types/grades';

export const GRADE_SCALES: GradeScale[] = [
  { letter: 'A', min: 8.5, max: 10, gradePoint: 4 },
  { letter: 'B+', min: 8.0, max: 8.4, gradePoint: 3.5 },
  { letter: 'B', min: 7.0, max: 7.9, gradePoint: 3 },
  { letter: 'C+', min: 6.5, max: 6.9, gradePoint: 2.5 },
  { letter: 'C', min: 5.5, max: 6.4, gradePoint: 2 },
  { letter: 'D+', min: 5.0, max: 5.4, gradePoint: 1.5 },
  { letter: 'D', min: 4.0, max: 4.9, gradePoint: 1 },
  { letter: 'F', min: 0, max: 3.9, gradePoint: 0 },
];

export function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateFinalScoreFromComponents(components: GradeComponent[]) {
  const weightedScore = components.reduce((total, component) => {
    const normalized = (component.score / component.maxScore) * 10;
    return total + normalized * (component.weight / 100);
  }, 0);

  return roundOne(weightedScore);
}

export function getGradeScale(score10: number): GradeScale {
  return GRADE_SCALES.find((scale) => score10 >= scale.min && score10 <= scale.max) || GRADE_SCALES[GRADE_SCALES.length - 1];
}

export function convertScore10ToLetter(score10: number) {
  return getGradeScale(score10).letter;
}

export function determineGradeStatus(course: Pick<CourseGrade, 'finalScore10' | 'retakeHistory'>): GradeStatus {
  if (course.finalScore10 >= 4) return 'passed';
  if (course.retakeHistory.length > 0) return 'relearn';
  return 'retake';
}

export function calculateGPA(courses: CourseGrade[]): GPAResult {
  const attemptedCredits = courses.reduce((total, course) => total + course.credits, 0);
  const earnedCredits = calculateEarnedCredits(courses);
  const totalGradePoints = courses.reduce((total, course) => total + course.gradePoint * course.credits, 0);
  const value = attemptedCredits > 0 ? roundOne(totalGradePoints / attemptedCredits) : 0;

  return {
    value,
    attemptedCredits,
    earnedCredits,
    classification: getAcademicClassification(value),
  };
}

export function calculateEarnedCredits(courses: CourseGrade[]) {
  return courses.reduce((total, course) => total + (course.status === 'passed' ? course.credits : 0), 0);
}

export function calculateCompletedCourses(courses: CourseGrade[]) {
  return courses.filter((course) => course.status === 'passed').length;
}

export function calculateStatusCount(courses: CourseGrade[], status: GradeStatus) {
  return courses.filter((course) => course.status === status).length;
}

export function getAcademicClassification(gpa: number) {
  if (gpa >= 3.6) return 'Xuất sắc';
  if (gpa >= 3.2) return 'Giỏi';
  if (gpa >= 2.5) return 'Khá';
  if (gpa >= 2) return 'Trung bình';
  return 'Cảnh báo học vụ';
}

export function buildGradeFormula(components: GradeComponent[]) {
  return components
    .map((component) => `${component.label} (${component.score}/${component.maxScore}) x ${component.weight}%`)
    .join(' + ');
}
