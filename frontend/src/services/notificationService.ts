import apiClient from './api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  detail: string;
  type: 'security' | 'system' | 'profile' | 'academic' | 'career';
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export const notificationService = {
  async list(): Promise<{ data: NotificationItem[]; unreadCount: number }> {
    const response = await apiClient.get('/notifications');
    return { data: response.data.data, unreadCount: response.data.unreadCount };
  },

  async markRead(id: string): Promise<NotificationItem> {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllRead(): Promise<{ data: NotificationItem[]; unreadCount: number }> {
    const response = await apiClient.patch('/notifications/read-all');
    return { data: response.data.data, unreadCount: response.data.unreadCount };
  },
};
