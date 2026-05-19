export interface RoadmapGenerateRequest {
  userId: string;
  targetCourseId: string;
  weakTopics: string[];
  weeklyStudyHours: number;
  examScore: number;
}

export interface RecommendedModule {
  id: string;
  title: string;
  focusArea: string;
  estimatedHours: number;
  whyRecommended: string;
}

export interface RecommendedLab {
  id: string;
  title: string;
  format: string;
  durationMinutes: number;
  outcome: string;
}

export interface RoadmapMilestone {
  id: string;
  day: number;
  title: string;
  description: string;
}

export interface DailyTask {
  id: string;
  day: number;
  title: string;
  durationMinutes: number;
  taskType: string;
  relatedTopic: string;
}

export interface LearningRoadmap {
  id: string;
  title: string;
  targetCourseId: string;
  durationInDays: number;
  recommendedModules: RecommendedModule[];
  recommendedLabs: RecommendedLab[];
  milestones: RoadmapMilestone[];
  dailyTasks: DailyTask[];
  aiReasoningSummary: string;
  createdAt: string;
}

export interface RoadmapGenerateResponse {
  success: boolean;
  status: 'success' | 'existing' | 'no_recommendation';
  existing: boolean;
  roadmap: LearningRoadmap | null;
  message?: string;
}

export type RoadmapRequestState = 'idle' | 'loading' | 'success' | 'error' | 'no_recommendation';

export const ROADMAP_GENERATION_MOCK_REQUEST: RoadmapGenerateRequest = {
  userId: 'user_001',
  targetCourseId: 'quantum-advanced',
  weakTopics: ['Tính lưỡng tính Sóng-Hạt', 'Hàm sóng', 'Nguyên lý bất định'],
  weeklyStudyHours: 6,
  examScore: 72,
};
