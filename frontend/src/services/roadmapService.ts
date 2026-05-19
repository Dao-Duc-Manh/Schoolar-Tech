import apiClient from './api';
import type { LearningRoadmap, RoadmapGenerateRequest, RoadmapGenerateResponse } from '@/types/roadmap';

export const roadmapService = {
  async generate(payload: RoadmapGenerateRequest): Promise<RoadmapGenerateResponse> {
    const response = await apiClient.post('/roadmap/generate', payload);
    return response.data;
  },

  async getCurrent(params: Pick<RoadmapGenerateRequest, 'userId' | 'targetCourseId'>): Promise<LearningRoadmap> {
    const response = await apiClient.get('/roadmap/current', { params });
    return response.data.roadmap;
  },
};
