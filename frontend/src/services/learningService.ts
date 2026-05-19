import apiClient from './api';

export const learningService = {
  async studentDashboard() {
    const response = await apiClient.get('/student/dashboard');
    return response.data.data;
  },
  async studentCourses() {
    const response = await apiClient.get('/student/courses');
    return response.data.data;
  },
  async studentGrades() {
    const response = await apiClient.get('/student/grades');
    return response.data.data;
  },
  async studentProfile() {
    const response = await apiClient.get('/student/profile');
    return response.data.data;
  },
  async studentAiChat(message: string) {
    const response = await apiClient.post('/ai/student-chat', { message });
    return response.data.data;
  },
  async studyPlan() {
    const response = await apiClient.post('/ai/generate-study-plan');
    return response.data.data;
  },
  async uploadCertificate(formData: FormData) {
    const response = await apiClient.post('/student/certificates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data;
  },
  async uploadAchievement(formData: FormData) {
    const response = await apiClient.post('/student/achievements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data;
  },
  async teacherDashboard() {
    const response = await apiClient.get('/teacher/dashboard');
    return response.data.data;
  },
  async teacherClasses() {
    const response = await apiClient.get('/teacher/classes');
    return response.data.data;
  },
  async teacherAiAnalysis(classId: string) {
    const response = await apiClient.get(`/teacher/ai-analysis/${classId}`);
    return response.data.data;
  },
  async generateQuiz(payload: { topic: string; difficulty: string }) {
    const response = await apiClient.post('/ai/generate-quiz', payload);
    return response.data.data;
  },
  async adminDashboard() {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },
  async adminStudents() {
    const response = await apiClient.get('/admin/students');
    return response.data.data;
  },
  async adminCourses() {
    const response = await apiClient.get('/admin/courses');
    return response.data.data;
  },
  async pendingCertificates() {
    const response = await apiClient.get('/admin/certificates/pending');
    return response.data.data;
  },
  async reviewCertificate(id: string, status: 'approved' | 'rejected', reviewNote = '') {
    const response = await apiClient.patch(`/admin/certificates/${id}/review`, { status, reviewNote });
    return response.data.data;
  },
  async pendingAchievements() {
    const response = await apiClient.get('/admin/achievements/pending');
    return response.data.data;
  },
  async reviewAchievement(id: string, status: 'approved' | 'rejected', reviewNote = '') {
    const response = await apiClient.patch(`/admin/achievements/${id}/review`, { status, reviewNote });
    return response.data.data;
  },
  async reports() {
    const response = await apiClient.get('/admin/reports');
    return response.data.data;
  },
};
