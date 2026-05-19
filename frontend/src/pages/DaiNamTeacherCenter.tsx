import { useEffect, useState } from 'react';
import { learningService } from '@/services/learningService';

export function DaiNamTeacherCenterPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([learningService.teacherDashboard(), learningService.teacherClasses()])
      .then(([d, c]) => { setDashboard(d); setClasses(c); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải Teacher Center...</div>;

  return <div className="space-y-6 pb-24"><section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Teacher Center</p><h1 className="mt-4 text-4xl font-extrabold">Giảng viên kiểm tra - đánh giá với AI</h1><p className="mt-3 text-white/80">Quản lý lớp, theo dõi tiến độ, tạo đề và phân tích sinh viên yếu.</p></section><section className="grid gap-4 md:grid-cols-5"><Metric label="Lớp" value={dashboard.totalClasses} /><Metric label="Sinh viên" value={dashboard.totalStudents} /><Metric label="Bài cần chấm" value={dashboard.pendingGrading} /><Metric label="Bài tập" value={dashboard.assignments} /><Metric label="Nguy cơ" value={dashboard.atRiskStudents} /></section><section className="grid gap-6 xl:grid-cols-2"><div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="text-xl font-bold">Lớp đang dạy</h2><div className="mt-4 space-y-3">{classes.map((item) => <button key={item.id} className="block w-full rounded-2xl bg-surface-container-low p-4 text-left" onClick={async () => setAnalysis(await learningService.teacherAiAnalysis(item.id))}><p className="font-bold">{item.course.name}</p><p className="text-sm text-on-surface-variant">{item.studentIds.length} sinh viên • {item.semester?.name}</p></button>)}</div></div><div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="text-xl font-bold">AI hỗ trợ giảng viên</h2><button className="mt-4 rounded-2xl bg-primary px-5 py-3 font-bold text-white" onClick={async () => setQuiz(await learningService.generateQuiz({ topic: 'React Component', difficulty: 'trung bình' }))}>Tạo đề gợi ý</button>{analysis && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm">{analysis.summary}</p>}{quiz && <div className="mt-4 space-y-2">{quiz.questions.map((q: any, i: number) => <p key={i} className="rounded-2xl bg-surface-container-low p-3 text-sm">{q.questionText}</p>)}</div>}</div></section></div>;
}

function Metric({ label, value }: { label: string; value: any }) { return <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><p className="text-xs font-bold uppercase text-on-surface-variant">{label}</p><p className="mt-2 text-3xl font-extrabold text-primary">{value}</p></div>; }
