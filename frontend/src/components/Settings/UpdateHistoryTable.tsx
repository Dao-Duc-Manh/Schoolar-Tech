import type { ProfileUpdateRequest } from '@/types/settings';
import { StatusBadge } from './StatusBadge';

export function UpdateHistoryTable({ requests }: { requests: ProfileUpdateRequest[] }) {
  return (
    <section className="rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined">history</span>
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Lịch sử yêu cầu cập nhật</h2>
          <p className="text-sm text-on-surface-variant mt-1">Toàn bộ log thay đổi cũ → mới, trạng thái duyệt và phản hồi từ admin.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl bg-surface-container p-6 text-center text-on-surface-variant">Chưa có lịch sử cập nhật thông tin.</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-3xl border border-outline-variant/10">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-surface-container-low sticky top-0 z-10">
                <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3 font-bold">Mã yêu cầu</th>
                  <th className="px-4 py-3 font-bold">Thời gian gửi</th>
                  <th className="px-4 py-3 font-bold">Trường sửa</th>
                  <th className="px-4 py-3 font-bold">Giá trị cũ</th>
                  <th className="px-4 py-3 font-bold">Giá trị mới</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Người duyệt</th>
                  <th className="px-4 py-3 font-bold">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
                {requests.flatMap((request) =>
                  request.items.map((item, index) => (
                    <tr key={`${request.id}-${item.field}-${index}`}>
                      <td className="px-4 py-4 font-semibold text-primary">{request.id}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{new Date(request.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4 font-medium text-on-surface">{item.label}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{item.oldValue}</td>
                      <td className="px-4 py-4 text-on-surface">{item.newValue}</td>
                      <td className="px-4 py-4"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-4 text-on-surface-variant">{request.reviewedBy || 'Chưa có'}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{request.adminNote || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:hidden">
            {requests.map((request) => (
              <article key={request.id} className="rounded-3xl bg-surface-container p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{request.id}</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{new Date(request.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                <div className="space-y-3">
                  {request.items.map((item) => (
                    <div key={`${request.id}-${item.field}`} className="rounded-2xl bg-surface-container-lowest px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
                      <p className="mt-2 text-sm text-on-surface-variant line-through">{item.oldValue}</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{item.newValue}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Người duyệt</p>
                    <p className="mt-2 text-sm text-on-surface">{request.reviewedBy || 'Chưa có'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ghi chú</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{request.adminNote || '-'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
