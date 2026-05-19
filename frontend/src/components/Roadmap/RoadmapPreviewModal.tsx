import { RoadmapDetails } from './RoadmapDetails';
import { RoadmapSkeleton } from './RoadmapSkeleton';
import type { LearningRoadmap, RoadmapRequestState } from '@/types/roadmap';

interface RoadmapPreviewModalProps {
  open: boolean;
  status: RoadmapRequestState;
  roadmap: LearningRoadmap | null;
  message: string;
  onClose: () => void;
  onRetry: () => void;
  onStartNow: () => void;
  onSaveForLater: () => void;
}

export function RoadmapPreviewModal({
  open,
  status,
  roadmap,
  message,
  onClose,
  onRetry,
  onStartNow,
  onSaveForLater,
}: RoadmapPreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 sm:p-6">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] bg-surface shadow-2xl animate-enter-soft">
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Roadmap Preview</p>
            <h2 className="mt-2 text-2xl font-headline font-bold text-on-surface">Lộ trình gợi ý bởi AI</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-surface-container p-2 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 sm:px-8">
          {status === 'loading' && <RoadmapSkeleton />}

          {status === 'error' && (
            <div className="rounded-3xl border border-error/20 bg-error-container px-6 py-8 text-center">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
              <h3 className="mt-4 text-xl font-bold text-on-surface">Không thể tạo lộ trình</h3>
              <p className="mt-3 text-on-surface-variant">{message || 'Đã có lỗi xảy ra khi gọi gợi ý từ AI.'}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={onRetry} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white">
                  Thử lại
                </button>
                <button type="button" onClick={onClose} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
                  Đóng
                </button>
              </div>
            </div>
          )}

          {status === 'no_recommendation' && (
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low px-6 py-8 text-center">
              <span className="material-symbols-outlined text-primary text-4xl">tips_and_updates</span>
              <h3 className="mt-4 text-xl font-bold text-on-surface">Chưa có khuyến nghị phù hợp</h3>
              <p className="mt-3 text-on-surface-variant">{message || 'AI chưa có đủ dữ liệu để đề xuất lộ trình mới.'}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={onRetry} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white">
                  Thử lại
                </button>
                <button type="button" onClick={onClose} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
                  Để sau
                </button>
              </div>
            </div>
          )}

          {status === 'success' && roadmap && (
            <div className="space-y-6">
              <RoadmapDetails roadmap={roadmap} />

              <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-outline-variant/10 bg-surface/95 px-1 pt-6 backdrop-blur">
                <button type="button" onClick={onSaveForLater} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
                  Lưu để học sau
                </button>
                <button type="button" onClick={onStartNow} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/20">
                  Bắt đầu ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
