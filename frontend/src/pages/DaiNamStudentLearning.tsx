import { useEffect, useState } from 'react';
import { learningService } from '@/services/learningService';

export function DaiNamStudentLearningPage() {
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [aiMessage, setAiMessage] = useState('Tôi nên ôn gì trong tuần này?');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([learningService.studentDashboard(), learningService.studentProfile()])
      .then(([dashboard, nextProfile]) => { setData(dashboard); setProfile(nextProfile); })
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải dữ liệu học tập.'))
      .finally(() => setLoading(false));
  }, []);

  const askAi = async () => {
    const result = await learningService.studentAiChat(aiMessage);
    setAiResponse(result.response);
  };

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải nền tảng học tập Đại Nam...</div>;
  if (error) return <div className="rounded-[28px] bg-red-50 p-6 text-error">{error}</div>;

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[34px] bg-gradient-to-br from-blue-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Đại Nam Digital Learning</p>
        <h1 className="mt-4 font-headline text-4xl font-extrabold tracking-tight">{data.greeting}</h1>
        <p className="mt-3 max-w-3xl text-white/80">Học bài, làm quiz, xem điểm, nhận cố vấn AI và tự động xây dựng profile năng lực cá nhân.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Môn đang học" value={data.overview.currentCourses} />
        <Metric label="Tiến độ tuần" value={`${data.overview.weeklyProgress}%`} />
        <Metric label="GPA hiện tại" value={data.overview.currentGpa} />
        <Metric label="Bài tập" value={data.overview.pendingAssignments} />
        <Metric label="Bài kiểm tra" value={data.overview.upcomingTests} />
        <Metric label="Career Score" value={profile.scores.careerReadinessScore} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
          <h2 className="font-headline text-xl font-bold">AI cố vấn học tập</h2>
          <p className="mt-3 rounded-2xl bg-primary-50 p-4 text-sm leading-6 text-on-surface-variant">{data.aiAdvisor.summary}</p>
          <div className="mt-4 flex gap-3"><input className="input" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} /><button className="rounded-2xl bg-primary px-5 py-3 font-bold text-white" onClick={askAi}>Hỏi AI</button></div>
          {aiResponse && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6">{aiResponse}</p>}
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
          <h2 className="font-headline text-xl font-bold">Profile năng lực tự động</h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">{profile.aiSummary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label="Academic" value={profile.scores.academicScore} /><Metric label="Skill" value={profile.scores.skillScore} /></div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
        <h2 className="font-headline text-xl font-bold">Môn học hiện tại</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {data.courses.map((item: any) => <div key={item.id} className="rounded-3xl bg-surface-container-low p-5"><div className="flex justify-between gap-4"><div><h3 className="font-bold">{item.course.name}</h3><p className="text-sm text-on-surface-variant">{item.teacher?.fullName} • {item.course.credits} tín chỉ</p></div><span className="font-extrabold text-primary">{item.currentScore ?? '-'}</span></div><div className="mt-4 h-2 rounded-full bg-white"><div className="h-2 rounded-full bg-primary" style={{ width: `${item.progress}%` }} /></div><p className="mt-2 text-xs font-semibold text-on-surface-variant">Tiến độ {item.progress}% • {item.status}</p></div>)}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p><p className="mt-2 text-3xl font-extrabold text-primary">{value}</p></div>;
}
