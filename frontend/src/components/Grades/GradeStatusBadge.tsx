import type { GradeStatus } from '@/types/grades';

const config: Record<GradeStatus, { label: string; className: string }> = {
  passed: { label: 'Đạt', className: 'bg-tertiary/10 text-tertiary' },
  retake: { label: 'Thi lại', className: 'bg-orange-100 text-orange-700' },
  relearn: { label: 'Học lại', className: 'bg-error-container text-error' },
};

export function GradeStatusBadge({ status }: { status: GradeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${config[status].className}`}>
      {config[status].label}
    </span>
  );
}
