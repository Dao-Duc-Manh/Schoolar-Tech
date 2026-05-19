import { useEffect, useRef, useState } from 'react';
import { notificationService, type NotificationItem } from '@/services/notificationService';

const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(new Date(value));

export function NotificationDropdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = items.filter((item) => !item.read).length;

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationService.list();
      setItems(response.data);
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSelected(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((current) => !current);
    if (!open) loadNotifications();
  };

  const handleSelect = async (notification: NotificationItem) => {
    setSelected(notification);
    if (notification.read) return;

    try {
      const updated = await notificationService.markRead(notification.id);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
    } catch {
      setError('Không thể cập nhật trạng thái thông báo.');
    }
  };

  const handleReadAll = async () => {
    try {
      const response = await notificationService.markAllRead();
      setItems(response.data);
    } catch {
      setError('Không thể đánh dấu tất cả là đã đọc.');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button className="relative p-2 hover:bg-surface-container transition rounded-full" title="Thông báo" onClick={handleOpen}>
        <span className="material-symbols-outlined text-primary">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-red-500 px-1.5 text-center text-[11px] font-bold leading-5 text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-outline-variant/40 bg-white shadow-2xl shadow-slate-900/15 animate-enter-soft">
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
            <div>
              <h3 className="font-headline text-base font-bold text-on-surface">Thông báo</h3>
              <p className="text-xs text-on-surface-variant">{unreadCount} chưa đọc</p>
            </div>
            <button className="text-xs font-bold text-primary hover:text-primary-700 disabled:opacity-40" onClick={handleReadAll} disabled={!unreadCount}>
              Đánh dấu tất cả
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading && <div className="p-5 text-sm text-on-surface-variant">Đang tải thông báo...</div>}
            {!loading && error && <div className="p-5 text-sm text-error">{error}</div>}
            {!loading && !error && items.length === 0 && <div className="p-8 text-center text-sm text-on-surface-variant">Bạn chưa có thông báo nào</div>}
            {!loading && !error && items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-primary-50 ${!item.read ? 'bg-primary-50/60' : 'bg-white'}`}
              >
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? 'bg-outline-variant' : 'bg-red-500'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-on-surface">{item.title}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-on-surface-variant">{item.message}</span>
                  <span className="mt-2 block text-[11px] font-semibold text-outline">{formatTime(item.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="border-t border-outline-variant/20 bg-slate-50 px-5 py-4">
              <p className="text-sm font-bold text-on-surface">{selected.title}</p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{selected.detail || selected.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
