import { useEffect, useState } from 'react';
import { learningService } from '@/services/learningService';

export function DaiNamAdminCenterPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [d, s, c, r] = await Promise.all([learningService.adminDashboard(), learningService.adminStudents(), learningService.pendingCertificates(), learningService.reports()]);
    setDashboard(d); setStudents(s); setCerts(c); setReports(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải Admin LMS...</div>;

  return <div className="space-y-6 pb-24"><section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white"><p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Dai Nam Admin LMS</p><h1 className="mt-4 text-4xl font-extrabold">Quản trị đào tạo toàn hệ thống</h1><p className="mt-3 text-white/80">Quản lý sinh viên, giảng viên, môn học, điểm, chứng chỉ, thành tích và báo cáo AI.</p></section><section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">{Object.entries(dashboard).filter(([, v]) => typeof v !== 'string').map(([k, v]) => <Metric key={k} label={k} value={v as any} />)}</section><section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="text-xl font-bold">AI báo cáo quản trị</h2><p className="mt-3 rounded-2xl bg-primary-50 p-4 text-sm leading-6">{dashboard.aiInsight}</p><p className="mt-3 text-sm text-on-surface-variant">{reports.aiSummary}</p></section><section className="grid gap-6 xl:grid-cols-2"><div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="text-xl font-bold">Sinh viên</h2><div className="mt-4 space-y-3">{students.slice(0, 8).map((item) => <div key={item.id} className="rounded-2xl bg-surface-container-low p-4"><p className="font-bold">{item.fullName}</p><p className="text-sm text-on-surface-variant">GPA {item.analytics.gpa} • {item.analytics.weakCourses.length} cảnh báo</p></div>)}</div></div><div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="text-xl font-bold">Chứng chỉ chờ duyệt</h2><div className="mt-4 space-y-3">{certs.length === 0 ? <p className="text-sm text-on-surface-variant">Không có chứng chỉ chờ duyệt.</p> : certs.map((cert) => <div key={cert.id} className="rounded-2xl bg-surface-container-low p-4"><p className="font-bold">{cert.name}</p><p className="text-sm text-on-surface-variant">{cert.student?.fullName} • {cert.issuer}</p><div className="mt-3 flex gap-2"><button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white" onClick={async () => { await learningService.reviewCertificate(cert.id, 'approved'); await load(); }}>Duyệt</button><button className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-error" onClick={async () => { await learningService.reviewCertificate(cert.id, 'rejected', 'Minh chứng chưa hợp lệ'); await load(); }}>Từ chối</button></div></div>)}</div></div></section></div>;
}

function Metric({ label, value }: { label: string; value: any }) { return <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><p className="text-xs font-bold uppercase text-on-surface-variant">{label}</p><p className="mt-2 text-3xl font-extrabold text-primary">{value}</p></div>; }
