import type { UpdateRequestStatus } from '@/types/settings';

const statusConfig: Record<UpdateRequestStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Đã duyệt', className: 'bg-tertiary/10 text-tertiary' },
  rejected: { label: 'Từ chối', className: 'bg-error-container text-error' },
};

export function StatusBadge({ status }: { status: UpdateRequestStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusConfig[status].className}`}>{statusConfig[status].label}</span>;
}
