import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const roleLabel: Record<string, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
  teacher: 'Giảng viên',
  admin: 'Quản trị viên',
  super_admin: 'Super Admin',
  career_officer: 'Cán bộ hỗ trợ việc làm',
};

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

export function UserMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-2 flex items-center gap-2 rounded-full border-l border-outline-variant/30 pl-3 transition hover:opacity-90"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 shadow-sm ring-2 ring-white">
          <span className="text-xs font-extrabold text-primary-600">{getInitials(user.fullName || user.email)}</span>
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-sm font-bold text-on-surface">{user.fullName}</span>
          <span className="block text-[11px] text-on-surface-variant">{roleLabel[user.role] || user.role}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-outline-variant/40 bg-white p-2 shadow-2xl shadow-slate-900/15 animate-enter-soft">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-white">
            <p className="truncate text-sm font-bold">{user.fullName}</p>
            <p className="mt-1 truncate text-xs text-white/80">{user.accountId || roleLabel[user.role] || user.role}</p>
          </div>
          <div className="py-2">
            <Link className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container hover:text-primary" to="/profile" onClick={() => setOpen(false)}>
              <span className="material-symbols-outlined text-lg">account_circle</span>
              Hồ sơ cá nhân
            </Link>
            <Link className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container hover:text-primary" to="/settings" onClick={() => setOpen(false)}>
              <span className="material-symbols-outlined text-lg">settings</span>
              Cài đặt tài khoản
            </Link>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-error transition hover:bg-red-50" onClick={handleLogout}>
              <span className="material-symbols-outlined text-lg">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
