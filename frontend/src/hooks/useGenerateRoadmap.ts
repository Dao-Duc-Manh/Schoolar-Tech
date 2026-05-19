import { useCallback, useRef, useState } from 'react';
import { roadmapService } from '@/services/roadmapService';
import type { LearningRoadmap, RoadmapGenerateRequest, RoadmapGenerateResponse, RoadmapRequestState } from '@/types/roadmap';

export function useGenerateRoadmap() {
  const [status, setStatus] = useState<RoadmapRequestState>('idle');
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [message, setMessage] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const lastPayloadRef = useRef<RoadmapGenerateRequest | null>(null);

  const generate = useCallback(async (payload: RoadmapGenerateRequest) => {
    lastPayloadRef.current = payload;
    setStatus('loading');
    setMessage('');
    setIsExisting(false);

    try {
      const response = await roadmapService.generate(payload);
      setMessage(response.message || '');
      setIsExisting(response.existing);

      if (response.status === 'no_recommendation' || !response.roadmap) {
        setRoadmap(null);
        setStatus('no_recommendation');
        return response;
      }

      setRoadmap(response.roadmap);
      setStatus('success');
      return response;
    } catch (error: any) {
      setRoadmap(null);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Không thể tạo lộ trình học tập lúc này.');
      return null;
    }
  }, []);

  const retry = useCallback(async () => {
    if (!lastPayloadRef.current) return null;
    return generate(lastPayloadRef.current);
  }, [generate]);

  const reset = useCallback(() => {
    setStatus('idle');
    setRoadmap(null);
    setMessage('');
    setIsExisting(false);
  }, []);

  return {
    status,
    roadmap,
    message,
    isExisting,
    isLoading: status === 'loading',
    generate,
    retry,
    reset,
  } satisfies {
    status: RoadmapRequestState;
    roadmap: LearningRoadmap | null;
    message: string;
    isExisting: boolean;
    isLoading: boolean;
    generate: (payload: RoadmapGenerateRequest) => Promise<RoadmapGenerateResponse | null>;
    retry: () => Promise<RoadmapGenerateResponse | null>;
    reset: () => void;
  };
}
