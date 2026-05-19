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

      // Backend trả token theo data.token (không phải accessToken)
      const tokenFromBackend = (response as any)?.data?.token ?? (response as any)?.data?.accessToken;
      if (tokenFromBackend) {
        sessionStorage.setItem('accessToken', tokenFromBackend);
      }

      const user = normalizeUser((response as any)?.data?.user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        // backend hiện tại không trả redirectPath
        redirectPath: (response as any)?.data?.redirectPath ?? null,
      });
      return (response as any)?.data?.redirectPath ?? null;

    } catch (error: any) {
      const message = error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ.';
      set({ error: message, isLoading: false, user: null, isAuthenticated: false, redirectPath: null });
      throw error;
    }
  },

  register: async (_fullName, _email, _password) => {
    const message = 'Đăng ký công khai không khả dụng trong môi trường hiện tại.';
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
    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      set({
        user: normalizeUser(response.data.user),
        isAuthenticated: true,
        isLoading: false,
        error: null,
        redirectPath: response.data.redirectPath,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null, redirectPath: null });
    }
  },
}));
