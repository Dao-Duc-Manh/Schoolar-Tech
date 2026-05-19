import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  open: boolean;
  type?: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
}

const toneClasses: Record<ToastType, string> = {
  success: 'border-tertiary/20 bg-white text-on-surface',
  error: 'border-error/20 bg-white text-on-surface',
  info: 'border-primary/20 bg-white text-on-surface',
};

const iconByType: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

export function Toast({ open, type = 'info', title, description, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return undefined;

    const timeoutId = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed right-6 top-20 z-[80] max-w-sm animate-toast-in">
      <div className={`rounded-2xl border px-4 py-3 shadow-2xl ${toneClasses[type]}`}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">{iconByType[type]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{title}</p>
            {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
