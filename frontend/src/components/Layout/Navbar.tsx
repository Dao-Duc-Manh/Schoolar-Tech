import { Link, useNavigate } from 'react-router-dom';
import { NotificationDropdown } from './NotificationDropdown';
import { UserMenu } from './UserMenu';
import { useAuthStore } from '@/stores/authStore';

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const homePath = user?.role === 'admin' || user?.role === 'super_admin' ? '/admin/dashboard' : user?.role === 'career_officer' ? '/career/dashboard' : user?.role === 'lecturer' || user?.role === 'teacher' ? '/lecturer/dashboard' : '/student/dashboard';
  const navLinks = user?.role === 'admin' || user?.role === 'super_admin'
    ? [
        { to: '/admin/dashboard', label: 'Admin Center' },
        { to: '/admin/lms', label: 'Đại Nam LMS' },
        { to: '/admin/career-center', label: 'Career Center' },
      ]
    : user?.role === 'career_officer'
    ? [
        { to: '/career/dashboard', label: 'Career Center' },
        { to: '/career/jobs', label: 'Việc làm' },
      ]
    : user?.role === 'lecturer' || user?.role === 'teacher'
    ? [
        { to: '/lecturer/dashboard', label: 'Dashboard' },
        { to: '/teacher/lms', label: 'Teacher LMS' },
        { to: '/classes', label: 'Lớp học' },
        { to: '/materials', label: 'Tài liệu' },
      ]
    : [
        { to: '/student/dashboard', label: 'Dashboard' },
        { to: '/student/learning', label: 'Đại Nam Learning' },
        { to: '/grades', label: 'Điểm số' },
        { to: '/materials', label: 'Tài liệu' },
        { to: '/student/career-profile', label: 'Nghề nghiệp' },
      ];

  return (
    <nav className="w-full sticky top-0 z-40 bg-surface-container-lowest shadow-sm font-headline tracking-tight">
      <div className="flex justify-between items-center px-4 sm:px-8 h-16 w-full max-w-[1440px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to={homePath} className="text-xl font-bold text-primary hover:opacity-80 transition">
            Trang chủ
          </Link>
          <div className="text-xl font-bold text-primary hidden sm:block">Scholar Tech</div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to={homePath} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
            Trang chủ
          </Link>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-on-surface-variant hover:text-primary text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button className="p-2 hover:bg-surface-container transition rounded-full" title="Cài đặt" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined text-primary">settings</span>
          </button>
          {user && <UserMenu />}
        </div>
      </div>
    </nav>
  );
}
