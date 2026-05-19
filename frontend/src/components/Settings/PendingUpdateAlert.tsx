import { Alert, Button } from '@/components/Common';
import type { ProfileUpdateRequest } from '@/types/settings';

interface PendingUpdateAlertProps {
  request: ProfileUpdateRequest;
  onCancel: () => void;
  isCancelling: boolean;
}

export function PendingUpdateAlert({ request, onCancel, isCancelling }: PendingUpdateAlertProps) {
  return (
    <Alert type="warning" className="rounded-3xl border-none">
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-on-surface">Bạn đang có một yêu cầu cập nhật thông tin chờ admin duyệt.</p>
          <p className="mt-1 text-sm text-on-surface-variant">Mã yêu cầu: {request.id} • Gửi lúc {new Date(request.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="danger" size="sm" isLoading={isCancelling} onClick={onCancel}>
            Hủy yêu cầu đang chờ
          </Button>
        </div>
      </div>
    </Alert>
  );
}
