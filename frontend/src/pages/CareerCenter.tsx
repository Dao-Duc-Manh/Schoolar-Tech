import { useEffect, useState } from 'react';
import { careerService, statusClasses, type CareerJob, type CareerProfile, type CareerStatus } from '@/services/careerService';

const statuses: CareerStatus[] = ['Submitted', 'Reviewing', 'Need Update', 'Approved', 'Matched', 'Sent To Employer', 'Interviewing', 'Hired', 'Rejected'];

export function CareerCenterDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [profiles, setProfiles] = useState<CareerProfile[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [selected, setSelected] = useState<CareerProfile | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [tab, setTab] = useState<'profiles' | 'jobs'>('profiles');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [jobForm, setJobForm] = useState<any>({ companyName: '', title: '', industry: '', description: '', requirements: '', requiredSkills: '', requiredGpa: 0, location: '', jobType: 'internship', deadline: '', status: 'active' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [nextStats, nextProfiles, nextJobs] = await Promise.all([careerService.dashboard(), careerService.profiles({ q: query, status }), careerService.jobs()]);
      setStats(nextStats); setProfiles(nextProfiles); setJobs(nextJobs);
    } catch (loadError: any) { setError(loadError.response?.data?.message || 'Không thể tải Career Center.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const run = async (fn: () => Promise<any>, success: string) => {
    setMessage(''); setError('');
    try { const result = await fn(); setMessage(success); await load(); return result; }
    catch (actionError: any) { setError(actionError.response?.data?.message || 'Thao tác thất bại.'); }
  };

  const openDetail = async (id: string) => {
    const detail = await careerService.profile(id);
    setSelected(detail);
    setMatches([]);
  };

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải Career Center...</div>;

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Career Center</p>
        <h1 className="mt-4 font-headline text-4xl font-extrabold tracking-tight">Hỗ trợ thực tập và việc làm</h1>
        <p className="mt-3 max-w-2xl text-white/80">Duyệt hồ sơ nghề nghiệp, góp ý CV, quản lý tin tuyển dụng và ghép sinh viên với công việc phù hợp.</p>
      </section>

      {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-error">{error}</div>}
      {message && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</div>}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        {stats && Object.entries(stats).map(([key, value]) => <div key={key} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><p className="text-xs font-bold uppercase text-on-surface-variant">{key}</p><p className="mt-2 text-3xl font-extrabold text-primary">{String(value)}</p></div>)}
      </section>

      <div className="flex flex-wrap gap-3"><button className={`rounded-2xl px-5 py-3 font-bold ${tab === 'profiles' ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setTab('profiles')}>Hồ sơ sinh viên</button><button className={`rounded-2xl px-5 py-3 font-bold ${tab === 'jobs' ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => setTab('jobs')}>Quản lý việc làm</button></div>

      {tab === 'profiles' && <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr,220px,120px]"><input className="input" placeholder="Tìm tên, mã SV, vị trí..." value={query} onChange={(e) => setQuery(e.target.value)} /><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select><button className="rounded-2xl bg-primary font-bold text-white" onClick={load}>Lọc</button></div>
        <div className="overflow-x-auto"><table className="min-w-[920px] w-full text-sm"><thead><tr className="text-left text-on-surface-variant"><th className="p-3">Sinh viên</th><th>Ngành</th><th>GPA</th><th>Kỹ năng chính</th><th>Score</th><th>Trạng thái</th><th>Ngày gửi</th><th></th></tr></thead><tbody>{profiles.length === 0 ? <tr><td className="p-8 text-center text-on-surface-variant" colSpan={8}>Chưa có hồ sơ nào được gửi.</td></tr> : profiles.map((profile) => <tr key={profile.id} className="border-t border-outline-variant/20"><td className="p-3 font-bold">{profile.student?.fullName}<p className="text-xs font-normal text-on-surface-variant">{profile.student?.studentCode}</p></td><td>{profile.student?.major}</td><td>{profile.academic?.gpa}</td><td>{profile.skills.slice(0, 3).map((skill) => skill.skillName).join(', ') || 'Chưa có'}</td><td className="font-extrabold text-primary">{profile.careerReadinessScore}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[profile.status]}`}>{profile.status}</span></td><td>{profile.submittedAt ? new Date(profile.submittedAt).toLocaleDateString('vi-VN') : '-'}</td><td><button className="rounded-xl bg-primary-50 px-3 py-2 font-bold text-primary" onClick={() => openDetail(profile.id)}>Xem</button></td></tr>)}</tbody></table></div>
      </section>}

      {tab === 'jobs' && <section className="grid gap-6 xl:grid-cols-[420px,1fr]"><form className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30" onSubmit={(e) => { e.preventDefault(); run(() => careerService.createJob({ ...jobForm, requiredSkills: String(jobForm.requiredSkills).split(',').map((s) => s.trim()).filter(Boolean) }), 'Đã tạo job.'); }}><h2 className="font-headline text-xl font-bold">Tạo tin tuyển dụng</h2><div className="mt-4 space-y-3">{['companyName','title','industry','location','deadline'].map((key) => <input key={key} className="input" placeholder={key} value={jobForm[key]} onChange={(e) => setJobForm({ ...jobForm, [key]: e.target.value })} />)}<input className="input" placeholder="requiredSkills: React, JavaScript" value={jobForm.requiredSkills} onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })} /><textarea className="input min-h-24" placeholder="Mô tả" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /><button className="rounded-2xl bg-primary px-5 py-3 font-bold text-white">Thêm job</button></div></form><div className="space-y-3">{jobs.map((job) => <div key={job.id} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-bold">{job.title}</h3><p className="text-sm text-on-surface-variant">{job.companyName} • {job.location} • {job.status}</p><p className="mt-2 text-sm">{job.requiredSkills?.join(', ')}</p></div><div className="flex gap-2"><button className="rounded-xl bg-primary-50 px-3 py-2 text-sm font-bold text-primary" onClick={() => run(() => careerService.matchStudents(job.id), 'Đã phân tích sinh viên phù hợp.')}>Match</button><button className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-error" onClick={() => run(() => careerService.deleteJob(job.id), 'Đã đóng job.')}>Đóng</button></div></div></div>)}</div></section>}

      {selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-8 max-w-5xl rounded-[32px] bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><div><h2 className="font-headline text-2xl font-extrabold">{selected.student?.fullName}</h2><p className="text-sm text-on-surface-variant">{selected.student?.studentCode} • GPA {selected.academic?.gpa} • Score {selected.careerReadinessScore}</p></div><button className="text-2xl" onClick={() => setSelected(null)}>×</button></div><p className="mt-5 rounded-2xl bg-surface-container-low p-4 text-sm leading-6">{selected.aiSummary || 'Chưa có AI summary.'}</p><div className="mt-5 grid gap-4 md:grid-cols-2"><Info title="Kỹ năng" value={selected.skills.map((s) => s.skillName).join(', ') || 'Chưa có'} /><Info title="Dự án" value={selected.projects.map((p) => p.title).join(', ') || 'Chưa có'} /><Info title="Kinh nghiệm" value={selected.experiences.map((e) => `${e.position} - ${e.companyName}`).join(', ') || 'Chưa có'} /><Info title="CV" value={selected.cvFileUrl || 'Chưa upload'} /></div><div className="mt-6 flex flex-wrap gap-3">{statuses.map((s) => <button key={s} className="rounded-2xl bg-surface-container-low px-4 py-2 text-sm font-bold hover:bg-primary-50" onClick={() => run(async () => { const updated = await careerService.updateStatus(selected.id, { status: s, note: `Cập nhật sang ${s}` }); setSelected(updated); return updated; }, `Đã chuyển ${s}.`)}>{s}</button>)}<button className="rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white" onClick={async () => setMatches(await careerService.matchJobs(selected.id))}>Ghép job</button></div>{matches.length > 0 && <div className="mt-5 space-y-3">{matches.map((m) => <div key={m.job.id} className="rounded-2xl bg-primary-50 p-4"><p className="font-bold">{m.job.title} • {m.matchScore}%</p><p className="mt-1 text-sm">{m.matchReason}</p></div>)}</div>}<div className="mt-6"><h3 className="font-bold">Lịch sử xử lý</h3>{selected.supportLogs?.map((log) => <p key={log.id} className="mt-2 rounded-2xl bg-surface-container-low p-3 text-sm">{log.action} • {log.note} • {new Date(log.createdAt).toLocaleString('vi-VN')}</p>)}</div></div></div>}
    </div>
  );

}

function Info({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl bg-surface-container-low p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">{title}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
