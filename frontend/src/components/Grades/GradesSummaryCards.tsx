import type { GradesSummary } from '@/types/grades';
import { GPAOverviewCard } from './GPAOverviewCard';

export function GradesSummaryCards({ summary }: { summary: GradesSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      <GPAOverviewCard title="Tổng tín chỉ đã học" value={String(summary.totalCreditsAttempted)} icon="library_books" tone="primary" />
      <GPAOverviewCard title="Tín chỉ đã đạt" value={String(summary.totalCreditsEarned)} icon="verified" tone="tertiary" />
      <GPAOverviewCard title="Môn đã hoàn thành" value={String(summary.completedCourses)} icon="check_circle" tone="tertiary" />
      <GPAOverviewCard title="Môn thi lại" value={String(summary.retakeCourses)} icon="cycle" tone="secondary" />
      <GPAOverviewCard title="Môn học lại" value={String(summary.relearnCourses)} icon="warning" tone="neutral" />
      <GPAOverviewCard title="GPA học kỳ" value={summary.semesterGPA.value.toFixed(1)} subtitle={summary.semesterGPA.classification} icon="monitoring" tone="primary" />
      <GPAOverviewCard title="GPA tích lũy" value={summary.cumulativeGPA.value.toFixed(1)} subtitle={summary.cumulativeGPA.classification} icon="school" tone="secondary" />
    </div>
  );
}
