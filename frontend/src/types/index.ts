// Type definitions for Scholar Tech API

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'lecturer' | 'student';
  department?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  description?: string;
  semester?: string;
  schedule?: Record<string, any>;
  capacity: number;
  currentEnrollment: number;
  teacherId: string;
  teacher?: User;
  status: 'active' | 'inactive' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  classId: string;
  user?: User;
  class?: Class;
  studentCode?: string;
  enrollmentDate?: string;
  status: 'active' | 'dropped' | 'completed';
  midtermGrade?: number;
  finalGrade?: number;
  attendance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentName: string;
  assessmentType: 'quiz' | 'assignment' | 'midterm' | 'final';
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  gradeDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  classId: string;
  documentType: 'material' | 'assignment' | 'resource';
  downloads: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}
