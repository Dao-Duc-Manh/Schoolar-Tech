import apiClient from './api';

export type UserRole = 'admin' | 'super_admin' | 'lecturer' | 'teacher' | 'student' | 'career_officer';

export interface AuthUser {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  lastLogin?: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken?: string;
    token?: string;
    redirectPath: string;
  };
  message?: string;
}

interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
    redirectPath: string;
  };
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login', payload);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Bỏ qua lỗi logout - vẫn xóa session local
    }
  },

  async getCurrentUser(): Promise<MeResponse> {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};
