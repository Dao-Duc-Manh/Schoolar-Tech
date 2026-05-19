import apiClient from './api';

export type StudentLearningStatus = 'Active' | 'At Risk' | 'Completed' | 'Inactive';

export interface TeacherStudentRow {
  id: string;
  studentId: string;
  courseClassId: string;
  courseId: string;
  fullName: string;
  studentCode: string;
  email: string;
  phone: string;
  className: string;
  courseName: string;
  courseCode: string;
  progress: number;
  gpa: number;
  averageScore: number;
  status: StudentLearningStatus;
  riskLevel: string;
  riskReason: string;
  missingAssignments: number;
  lastActivityAt: string;
}

export interface TeacherStudentsResponse {
  data: TeacherStudentRow[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    atRisk: number;
    averageProgress: number;
  };
  filters: {
    classes: Array<{ id: string; name: string; courseName: string }>;
    courses: Array<{ id: string; name: string }>;
  };
}

export const teacherStudentsService = {
  async list(params: Record<string, string | number | undefined> = {}): Promise<TeacherStudentsResponse> {
    const response = await apiClient.get('/teacher/students', { params });
    return { data: response.data.data, stats: response.data.stats, filters: response.data.filters };
  },
  async detail(studentId: string) {
    const response = await apiClient.get(`/teacher/students/${studentId}`);
    return response.data.data;
  },
  async progress(studentId: string) {
    const response = await apiClient.get(`/teacher/students/${studentId}/progress`);
    return response.data.data;
  },
  async grades(studentId: string) {
    const response = await apiClient.get(`/teacher/students/${studentId}/grades`);
    return response.data.data;
  },
  async notes(studentId: string) {
    const response = await apiClient.get(`/teacher/students/${studentId}/notes`);
    return response.data.data;
  },
  async addNote(studentId: string, payload: { noteType: string; content: string; isPrivate: boolean }) {
    const response = await apiClient.post(`/teacher/students/${studentId}/notes`, payload);
    return response.data.data;
  },
  async sendNotification(payload: { recipientIds: string[]; title: string; content: string; notificationType: string }) {
    const response = await apiClient.post('/teacher/notifications', payload);
    return response.data;
  },
  async updateStatus(studentId: string, payload: { courseId?: string; status: StudentLearningStatus; riskLevel?: string; riskReason?: string }) {
    const response = await apiClient.patch(`/teacher/students/${studentId}/status`, payload);
    return response.data.data;
  },
  async aiAnalyze(studentId: string) {
    const response = await apiClient.post('/ai/analyze-student', { studentId });
    return response.data.data;
  },
  exportUrl(params: URLSearchParams) {
    return `${import.meta.env.VITE_API_URL}/teacher/students/export?${params.toString()}`;
  },
};
