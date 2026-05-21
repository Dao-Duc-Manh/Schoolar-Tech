import { create } from 'zustand';
import { authService, type AuthUser, type UserRole } from '@/services/authService';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  redirectPath: string | null;
  login: (identifier: string, password: string) => Promise<string | null>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

const validRoles: UserRole[] = ['admin', 'super_admin', 'lecturer', 'teacher', 'student', 'career_officer'];

const normalizeUser = (user: AuthUser): AuthUser => ({
  ...user,
  role: validRoles.includes(user.role) ? user.role : 'student',
  fullName: user.fullName?.trim() || user.email || 'Người dùng',
  email: user.email || '',
});

/** Trả về đường dẫn dashboard mặc định theo role */
const getDefaultRedirect = (role?: UserRole | null): string => {
  if (role === 'admin' || role === 'super_admin') return '/admin/dashboard';
  if (role === 'career_officer') return '/career/dashboard';
  if (role === 'lecturer' || role === 'teacher') return '/lecturer/dashboard';
  return '/student/dashboard';
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  redirectPath: null,

  clearError: () => set({ error: null }),

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ identifier, password });

      // Backend có thể trả token theo field "token" hoặc "accessToken"
      const token = response?.data?.token ?? response?.data?.accessToken;
      if (token) {
        sessionStorage.setItem('accessToken', token);
      }

      const rawUser = (response as any)?.data?.user;
      if (!rawUser) throw new Error('Không nhận được thông tin người dùng.');

      const user = normalizeUser(rawUser);
      // Dùng redirectPath từ backend nếu có, không thì tự tính theo role
      const redirectPath = response?.data?.redirectPath || getDefaultRedirect(user.role);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        redirectPath,
      });

      return redirectPath;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Thông tin đăng nhập không hợp lệ.';
      set({ error: message, isLoading: false, user: null, isAuthenticated: false, redirectPath: null });
      throw error;
    }
  },

  register: async (_fullName, _email, _password) => {
    const message = 'Đăng ký công khai không khả dụng. Vui lòng liên hệ bộ phận học vụ.';
    set({ error: message, isLoading: false });
    throw new Error(message);
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      sessionStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, error: null, redirectPath: null });
    }
  },

  initializeAuth: async () => {
    // Chỉ thử restore session nếu có token trong sessionStorage hoặc cookie
    const hasToken = !!sessionStorage.getItem('accessToken');
    // Cookie-based auth vẫn thử ngay cả khi không có sessionStorage token
    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      const rawUser = response?.data?.user;
      if (!rawUser) throw new Error('No user');

      const user = normalizeUser(rawUser);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        redirectPath: response.data.redirectPath || getDefaultRedirect(user.role),
      });
    } catch {
      if (hasToken) sessionStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null, redirectPath: null });
    }
  },
}));
