import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const menuByRole = {
  admin: [
    { label: 'Admin Center', path: '/admin/dashboard', icon: 'admin_panel_settings' },
    { label: 'Đại Nam LMS', path: '/admin/lms', icon: 'analytics' },
    { label: 'Career Center', path: '/admin/career-center', icon: 'work' },
  ],
  super_admin: [
    { label: 'Admin Center', path: '/admin/dashboard', icon: 'admin_panel_settings' },
    { label: 'Đại Nam LMS', path: '/admin/lms', icon: 'analytics' },
    { label: 'Career Center', path: '/admin/career-center', icon: 'work' },
  ],
  career_officer: [
    { label: 'Career Dashboard', path: '/career/dashboard', icon: 'work' },
    { label: 'Hồ sơ sinh viên', path: '/career/profiles', icon: 'badge' },
    { label: 'Việc làm', path: '/career/jobs', icon: 'business_center' },
  ],
  lecturer: [
    { label: 'Tổng quan', path: '/lecturer/dashboard', icon: 'dashboard' },
    { label: 'Teacher LMS', path: '/teacher/lms', icon: 'psychology' },
    { label: 'Lớp học', path: '/classes', icon: 'school' },
    { label: 'Sinh viên', path: '/students', icon: 'group' },
    { label: 'Tài liệu', path: '/materials', icon: 'menu_book' },
  ],
  teacher: [
    { label: 'Tổng quan', path: '/lecturer/dashboard', icon: 'dashboard' },
    { label: 'Teacher LMS', path: '/teacher/lms', icon: 'psychology' },
    { label: 'Lớp học', path: '/classes', icon: 'school' },
    { label: 'Sinh viên', path: '/students', icon: 'group' },
    { label: 'Tài liệu', path: '/materials', icon: 'menu_book' },
  ],
  student: [
    { label: 'Tổng quan', path: '/student/dashboard', icon: 'dashboard' },
    { label: 'Đại Nam Learning', path: '/student/learning', icon: 'auto_stories' },
    { label: 'Điểm số', path: '/grades', icon: 'grade' },
    { label: 'Tài liệu', path: '/materials', icon: 'menu_book' },
    { label: 'Hồ sơ nghề nghiệp', path: '/student/career-profile', icon: 'badge' },
    { label: 'Cài đặt', path: '/settings', icon: 'settings' },
  ],
};

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const visibleItems = menuByRole[user.role] ?? menuByRole.student;
  const displayName = user.fullName?.trim() || user.email || 'Người dùng';

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto bg-surface-container-low shadow-[30px_0_50px_rgba(0,0,0,0.04)] z-30">
      <div className="flex min-h-full flex-col py-6 pr-4 font-body text-sm">
        <div className="px-6 mb-8">
          <h2 className="text-lg font-extrabold text-primary">Academic Atheneum</h2>
          <p className="text-xs text-on-surface-variant">Offline Learning</p>
        </div>
        <nav className="space-y-1 flex-1">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-6 py-3 hover:bg-surface-container hover:translate-x-1 transition-all ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-600 font-semibold rounded-r-full'
                    : 'text-on-surface-variant'
                }
              `}
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info at Bottom */}
        <div className="px-6 pt-4 border-t border-outline-variant/20">
          <div className="text-xs text-on-surface-variant mb-1">Đăng nhập với</div>
          <div className="text-sm font-bold text-on-surface break-words">{displayName}</div>
          <div className="text-xs text-on-surface-variant capitalize">
            {user.role === 'super_admin' ? 'Super Admin' : user.role === 'career_officer' ? 'Cán bộ hỗ trợ việc làm' : user.role === 'lecturer' || user.role === 'teacher' ? 'Giảng viên' : user.role === 'student' ? 'Sinh viên' : 'Quản trị'}
          </div>
        </div>
      </div>
    </aside>
  );
}
