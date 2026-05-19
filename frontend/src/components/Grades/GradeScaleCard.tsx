import { GRADE_SCALES } from '@/utils/gradeUtils';

export function GradeScaleCard() {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary">grading</span>
        <h3 className="text-xl font-bold text-on-surface">Thang điểm quy đổi</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {GRADE_SCALES.map((scale) => (
          <div key={scale.letter} className="rounded-2xl bg-surface-container p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-primary">{scale.letter}</span>
              <span className="text-xs font-bold text-on-surface-variant">Hệ 4: {scale.gradePoint.toFixed(1)}</span>
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">
              {scale.min.toFixed(1)} - {scale.max.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
