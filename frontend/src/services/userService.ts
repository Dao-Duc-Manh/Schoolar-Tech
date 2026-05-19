import apiClient from './api';
import type { AuthUser } from './authService';

export interface UserProfile extends AuthUser {
  code: string;
  studentCode: string;
  phone: string;
  department: string;
  hometown: string;
  currentAddress: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  faculty: string;
  major: string;
  className: string;
  cohort: string;
  accountStatus: 'Đang hoạt động' | 'Tạm khóa';
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    academic: boolean;
    security: boolean;
  };
  themePreference: 'light' | 'dark' | 'system';
}

export interface ProfileUpdateRequest {
  id: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  items: Array<{ field: string; label: string; oldValue: string; newValue: string }>;
  requestedProfile: Record<string, string>;
}

export interface ProfilePayload {
  fullName: string;
  email: string;
  phone: string;
  hometown: string;
  currentAddress: string;
  notificationPreferences: UserProfile['notificationPreferences'];
  themePreference: UserProfile['themePreference'];
}

export const userService = {
  async getProfile(): Promise<{ profile: UserProfile; updateRequests: ProfileUpdateRequest[] }> {
    const response = await apiClient.get('/user/profile');
    return response.data.data;
  },

  async updateProfile(payload: ProfilePayload): Promise<{ profile: UserProfile; request?: ProfileUpdateRequest; message: string }> {
    const response = await apiClient.patch('/user/profile', payload);
    return { ...response.data.data, message: response.data.message };
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const response = await apiClient.patch('/user/change-password', payload);
    return response.data;
  },
};
