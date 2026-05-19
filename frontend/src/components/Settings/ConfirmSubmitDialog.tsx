import type { ProfileUpdateItem } from '@/types/settings';

interface ConfirmSubmitDialogProps {
  open: boolean;
  items: ProfileUpdateItem[];
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmSubmitDialog({ open, items, submitting, onClose, onConfirm }: ConfirmSubmitDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-surface shadow-2xl animate-enter-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Xác nhận gửi yêu cầu</p>
            <h2 className="mt-2 text-2xl font-headline font-bold text-on-surface">Kiểm tra lại thay đổi trước khi gửi</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-surface-container p-2 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-on-surface-variant">Thông tin dưới đây sẽ được gửi sang admin nhà trường để duyệt. Hồ sơ chính thức chưa thay đổi cho đến khi yêu cầu được chấp thuận.</p>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.field} className="rounded-2xl bg-surface-container p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{item.label}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-on-surface-variant">Giá trị hiện tại</p>
                    <p className="mt-1 text-sm text-on-surface-variant line-through">{item.oldValue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Giá trị đề xuất</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{item.newValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-outline-variant/10 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
            Quay lại chỉnh sửa
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/20 disabled:opacity-60">
            {submitting ? 'Đang gửi yêu cầu...' : 'Xác nhận gửi yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  );
}
