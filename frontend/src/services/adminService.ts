import apiClient from './api';

export type UserRole = 'admin' | 'lecturer' | 'student';
export type ManagedRole = 'lecturer' | 'student';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  classCount: number;
}

export interface AdminOverview {
  totalAccounts: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  recentLogins: number;
}

export interface AdminClass {
  id: string;
  code: string;
  name: string;
  semester: string;
  room: string;
  teacherId: string | null;
  studentIds: string[];
  capacity: number;
  notes: string;
  createdAt: string;
  teacher: Omit<AdminUser, 'classCount'> | null;
  students: Array<Omit<AdminUser, 'classCount'>>;
  studentCount: number;
}

export interface SaveUserPayload {
  fullName: string;
  email: string;
  password?: string;
  role: ManagedRole;
}

export interface SaveClassPayload {
  code: string;
  name: string;
  semester: string;
  room: string;
  teacherId: string | null;
  studentIds: string[];
  capacity: number;
  notes: string;
}

const unwrap = async <T>(request: Promise<any>) => {
  const response = await request;
  return response.data.data as T;
};

export const adminService = {
  getOverview() {
    return unwrap<AdminOverview>(apiClient.get('/admin/overview'));
  },

  listUsers() {
    return unwrap<AdminUser[]>(apiClient.get('/admin/users'));
  },

  createUser(payload: SaveUserPayload) {
    return unwrap<AdminUser>(apiClient.post('/admin/users', payload));
  },

  updateUser(userId: string, payload: SaveUserPayload) {
    return unwrap<AdminUser>(apiClient.put(`/admin/users/${userId}`, payload));
  },

  deleteUser(userId: string) {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  listClasses() {
    return unwrap<AdminClass[]>(apiClient.get('/admin/classes'));
  },

  createClass(payload: SaveClassPayload) {
    return unwrap<AdminClass>(apiClient.post('/admin/classes', payload));
  },

  updateClass(classId: string, payload: SaveClassPayload) {
    return unwrap<AdminClass>(apiClient.put(`/admin/classes/${classId}`, payload));
  },

  deleteClass(classId: string) {
    return apiClient.delete(`/admin/classes/${classId}`);
  },
};
