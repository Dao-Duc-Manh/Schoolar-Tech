import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapService } from '@/services/roadmapService';
import { RoadmapDetails } from '@/components/Roadmap/RoadmapDetails';
import { RoadmapSkeleton } from '@/components/Roadmap/RoadmapSkeleton';
import { ROADMAP_GENERATION_MOCK_REQUEST, type LearningRoadmap } from '@/types/roadmap';

type LoadState = 'loading' | 'success' | 'error' | 'no_recommendation';

export default function RoadmapCurrentPage() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [message, setMessage] = useState('');

  const loadRoadmap = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const currentRoadmap = await roadmapService.getCurrent({
        userId: ROADMAP_GENERATION_MOCK_REQUEST.userId,
        targetCourseId: ROADMAP_GENERATION_MOCK_REQUEST.targetCourseId,
      });
      setRoadmap(currentRoadmap);
      setStatus('success');
    } catch (error: any) {
      setRoadmap(null);
      if (error.response?.status === 404) {
        setStatus('no_recommendation');
        setMessage(error.response?.data?.message || 'Bạn chưa có lộ trình học tập nào.');
        return;
      }

      setStatus('error');
      setMessage(error.response?.data?.message || 'Không thể tải lộ trình hiện tại.');
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      <section className="flex flex-col gap-4 rounded-[32px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10 animate-enter-soft">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">Current Roadmap</p>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">Lộ trình học tập hiện tại</h1>
        <p className="max-w-2xl text-white/80">
          Đây là bản kế hoạch cá nhân hóa mà AI vừa tổng hợp từ kết quả bài kiểm tra, tiến độ học phần và quỹ thời gian học trong tuần của bạn.
        </p>
      </section>

      {status === 'loading' && <RoadmapSkeleton />}

      {status === 'error' && (
        <section className="rounded-3xl border border-error/20 bg-error-container px-6 py-8 text-center">
          <span className="material-symbols-outlined text-error text-4xl">error</span>
          <h2 className="mt-4 text-2xl font-bold text-on-surface">Không thể tải lộ trình</h2>
          <p className="mt-3 text-on-surface-variant">{message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={loadRoadmap} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white">
              Tải lại
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
              Về dashboard
            </button>
          </div>
        </section>
      )}

      {status === 'no_recommendation' && (
        <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-low px-6 py-8 text-center">
          <span className="material-symbols-outlined text-primary text-4xl">tips_and_updates</span>
          <h2 className="mt-4 text-2xl font-bold text-on-surface">Chưa có lộ trình hiện tại</h2>
          <p className="mt-3 text-on-surface-variant">{message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white">
              Quay lại dashboard
            </button>
          </div>
        </section>
      )}

      {status === 'success' && roadmap && (
        <div className="space-y-6 animate-enter-soft">
          <RoadmapDetails roadmap={roadmap} />

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="rounded-2xl bg-surface-container px-5 py-3 font-semibold text-on-surface-variant">
              Lưu để học sau
            </button>
            <button type="button" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/20">
              Bắt đầu ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
