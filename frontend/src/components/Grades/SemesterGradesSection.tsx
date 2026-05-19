import type { CourseGrade, GPAResult, Semester } from '@/types/grades';
import { GradesTable } from './GradesTable';

interface SemesterGradesSectionProps {
  semester: Semester;
  courses: CourseGrade[];
  gpa: GPAResult;
  retakeCount: number;
  relearnCount: number;
  expanded: boolean;
  onToggle: () => void;
  onSelectCourse: (course: CourseGrade) => void;
}

export function SemesterGradesSection({
  semester,
  courses,
  gpa,
  retakeCount,
  relearnCount,
  expanded,
  onToggle,
  onSelectCourse,
}: SemesterGradesSectionProps) {
  return (
    <section className="rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 flex flex-col gap-4 text-left hover:bg-surface-container-low transition-colors lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{semester.academicYear}</p>
          <h2 className="mt-2 text-2xl font-headline font-bold text-on-surface">{semester.name}</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
          <SemesterChip label="Tín chỉ" value={String(gpa.attemptedCredits)} />
          <SemesterChip label="GPA học kỳ" value={gpa.value.toFixed(1)} />
          <SemesterChip label="Thi lại" value={String(retakeCount)} />
          <SemesterChip label="Học lại" value={String(relearnCount)} />
          <span className="material-symbols-outlined text-on-surface-variant">{expanded ? 'expand_less' : 'expand_more'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 animate-enter-soft">
          <GradesTable courses={courses} onSelectCourse={onSelectCourse} />
        </div>
      )}
    </section>
  );
}

function SemesterChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container px-4 py-2 min-w-[96px]">
      <p className="text-[11px] uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-bold text-on-surface">{value}</p>
    </div>
  );
}
