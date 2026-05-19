import type { ProfileUpdateRequest } from '@/types/settings';
import { StatusBadge } from './StatusBadge';

export function UpdateRequestStatusCard({ request }: { request: ProfileUpdateRequest | null }) {
  return (
    <section className="rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
          <span className="material-symbols-outlined">task_alt</span>
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Trạng thái yêu cầu hiện tại</h2>
          <p className="text-sm text-on-surface-variant mt-1">Theo dõi yêu cầu cập nhật gần nhất và phản hồi từ admin.</p>
        </div>
      </div>

      {!request ? (
        <div className="rounded-3xl bg-surface-container p-6 text-center text-on-surface-variant">
          Chưa có yêu cầu cập nhật nào được ghi nhận.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between rounded-3xl bg-surface-container p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mã yêu cầu</p>
              <p className="mt-2 text-lg font-bold text-on-surface">{request.id}</p>
              <p className="mt-2 text-sm text-on-surface-variant">Ngày gửi: {new Date(request.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="space-y-3">
            {request.items.map((item) => (
              <div key={item.field} className="rounded-2xl border border-outline-variant/10 bg-surface-container-low px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
                <p className="mt-3 text-sm text-on-surface-variant line-through">{item.oldValue}</p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{item.newValue}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Người duyệt</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{request.reviewedBy || 'Chưa có'}</p>
            </div>
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phản hồi admin</p>
              <p className="mt-2 text-sm text-on-surface-variant">{request.adminNote || 'Chưa có phản hồi thêm.'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
