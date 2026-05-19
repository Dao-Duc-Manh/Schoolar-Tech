import apiClient from './api';

export type CareerStatus = 'Draft' | 'Submitted' | 'Reviewing' | 'Need Update' | 'Approved' | 'Matched' | 'Sent To Employer' | 'Interviewing' | 'Hired' | 'Rejected';

export interface CareerSkill { id: string; skillName: string; skillType: string; level: string }
export interface StudentProject { id: string; title: string; description: string; role: string; technologies: string; projectUrl: string; githubUrl: string; startDate: string; endDate: string }
export interface StudentExperience { id: string; companyName: string; position: string; description: string; employmentType: string; startDate: string; endDate: string }
export interface CareerJob { id: string; companyName: string; title: string; industry: string; description: string; requirements: string; requiredSkills: string[]; requiredGpa: number; location: string; jobType: string; deadline: string; status: 'draft' | 'active' | 'closed' }

export interface CareerProfile {
  id: string;
  studentId: string;
  student?: any;
  academic?: { gpa: number; grades: any[]; topCourses: string[] };
  careerObjective: string;
  desiredPosition: string;
  desiredIndustry: string;
  desiredLocation: string;
  shortTermGoal: string;
  longTermGoal: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  personalWebsite: string;
  cvFileUrl: string;
  aiSummary: string;
  aiSuggestions?: any;
  certificates: any[];
  achievements: any[];
  status: CareerStatus;
  consentToShare: boolean;
  allowEmployerView: boolean;
  showGpa: boolean;
  academicScore: number;
  skillScore: number;
  certificateScore: number;
  achievementScore: number;
  experienceScore: number;
  profileCompletionScore: number;
  careerReadinessScore: number;
  submittedAt?: string;
  updatedAt: string;
  skills: CareerSkill[];
  projects: StudentProject[];
  experiences: StudentExperience[];
  reviews?: any[];
  supportLogs?: any[];
  matches?: any[];
}

export const statusClasses: Record<CareerStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Submitted: 'bg-blue-100 text-blue-700',
  Reviewing: 'bg-indigo-100 text-indigo-700',
  'Need Update': 'bg-amber-100 text-amber-800',
  Approved: 'bg-emerald-100 text-emerald-700',
  Matched: 'bg-cyan-100 text-cyan-700',
  'Sent To Employer': 'bg-purple-100 text-purple-700',
  Interviewing: 'bg-orange-100 text-orange-700',
  Hired: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export const careerService = {
  async getStudentProfile(): Promise<CareerProfile> {
    const response = await apiClient.get('/student/career-profile');
    return response.data.data;
  },
  async saveStudentProfile(payload: Partial<CareerProfile>): Promise<CareerProfile> {
    const response = await apiClient.patch('/student/career-profile', payload);
    return response.data.data;
  },
  async submitProfile(consentToShare: boolean, allowEmployerView: boolean): Promise<CareerProfile> {
    const response = await apiClient.post('/student/career-profile/submit', { consentToShare, allowEmployerView });
    return response.data.data;
  },
  async generateSummary(): Promise<CareerProfile> {
    const response = await apiClient.post('/student/career-profile/generate-ai-summary');
    return response.data.data;
  },
  async uploadCv(file: File): Promise<CareerProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/student/cv/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data;
  },
  async addSkill(payload: Partial<CareerSkill>) { const response = await apiClient.post('/student/career-skills', payload); return response.data.profile as CareerProfile; },
  async deleteSkill(id: string) { const response = await apiClient.delete(`/student/career-skills/${id}`); return response.data.profile as CareerProfile; },
  async addProject(payload: Partial<StudentProject>) { const response = await apiClient.post('/student/projects', payload); return response.data.profile as CareerProfile; },
  async deleteProject(id: string) { const response = await apiClient.delete(`/student/projects/${id}`); return response.data.profile as CareerProfile; },
  async addExperience(payload: Partial<StudentExperience>) { const response = await apiClient.post('/student/experiences', payload); return response.data.profile as CareerProfile; },
  async deleteExperience(id: string) { const response = await apiClient.delete(`/student/experiences/${id}`); return response.data.profile as CareerProfile; },
  async dashboard() { const response = await apiClient.get('/career/dashboard'); return response.data.data; },
  async profiles(params?: Record<string, string>) { const response = await apiClient.get('/career/profiles', { params }); return response.data.data as CareerProfile[]; },
  async profile(id: string) { const response = await apiClient.get(`/career/profiles/${id}`); return response.data.data as CareerProfile; },
  async reviewProfile(id: string, payload: { status: CareerStatus; comment?: string }) { const response = await apiClient.patch(`/career/profiles/${id}/review`, payload); return response.data.data as CareerProfile; },
  async updateStatus(id: string, payload: { status: CareerStatus; note?: string }) { const response = await apiClient.patch(`/career/profiles/${id}/status`, payload); return response.data.data as CareerProfile; },
  async comment(id: string, comment: string) { const response = await apiClient.post(`/career/profiles/${id}/comment`, { comment }); return response.data.data as CareerProfile; },
  async matchJobs(profileId: string) { const response = await apiClient.post(`/career/profiles/${profileId}/match-jobs`); return response.data.data; },
  async jobs() { const response = await apiClient.get('/career/jobs'); return response.data.data as CareerJob[]; },
  async createJob(payload: Partial<CareerJob>) { const response = await apiClient.post('/career/jobs', payload); return response.data.data as CareerJob; },
  async updateJob(id: string, payload: Partial<CareerJob>) { const response = await apiClient.patch(`/career/jobs/${id}`, payload); return response.data.data as CareerJob; },
  async deleteJob(id: string) { await apiClient.delete(`/career/jobs/${id}`); },
  async matchStudents(jobId: string) { const response = await apiClient.post(`/career/jobs/${jobId}/match-students`); return response.data.data; },
  async sendStudent(jobId: string, studentId: string) { const response = await apiClient.post(`/career/jobs/${jobId}/send-student/${studentId}`); return response.data.data; },
};
