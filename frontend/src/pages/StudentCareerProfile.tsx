import { useEffect, useState } from 'react';
import { careerService, statusClasses, type CareerProfile } from '@/services/careerService';

const emptyProfile = {
  desiredPosition: '', desiredIndustry: '', desiredLocation: '', shortTermGoal: '', longTermGoal: '', portfolioUrl: '', githubUrl: '', linkedinUrl: '', personalWebsite: '', allowEmployerView: false, showGpa: true,
};

export function StudentCareerProfilePage() {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [form, setForm] = useState<any>(emptyProfile);
  const [skill, setSkill] = useState({ skillName: '', skillType: 'technical', level: 'khá' });
  const [project, setProject] = useState({ title: '', description: '', role: '', technologies: '', projectUrl: '', githubUrl: '', startDate: '', endDate: '' });
  const [experience, setExperience] = useState({ companyName: '', position: '', employmentType: 'internship', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [consent, setConsent] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await careerService.getStudentProfile();
      setProfile(data);
      setForm({ ...emptyProfile, ...data });
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Không thể tải hồ sơ nghề nghiệp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (action: () => Promise<CareerProfile>, success: string) => {
    setSaving(true); setError(''); setMessage('');
    try { const next = await action(); setProfile(next); setForm({ ...emptyProfile, ...next }); setMessage(success); }
    catch (actionError: any) { setError(actionError.response?.data?.message || 'Thao tác thất bại.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-[32px] bg-white p-8 shadow-sm animate-pulse">Đang tải hồ sơ nghề nghiệp...</div>;
  if (error && !profile) return <div className="rounded-[28px] bg-red-50 p-6 text-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[34px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Career Profile</p>
            <h1 className="mt-4 font-headline text-4xl font-extrabold tracking-tight">Hồ sơ nghề nghiệp sinh viên</h1>
            <p className="mt-3 max-w-2xl text-white/80">Xây dựng hồ sơ dựa trên học tập, kỹ năng, dự án, CV và gửi nhà trường hỗ trợ kết nối thực tập, việc làm.</p>
          </div>
          <div className="rounded-[28px] bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-sm text-white/70">{profile.student?.fullName}</p>
            <p className="mt-1 text-sm text-white/70">{profile.student?.studentCode} • GPA {profile.academic?.gpa}/4.0</p>
            <div className="mt-4 flex items-end gap-3"><span className="text-5xl font-extrabold">{profile.careerReadinessScore}</span><span className="mb-2 text-sm text-white/70">/100 Career Score</span></div>
            <div className="mt-4 h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-emerald-300" style={{ width: `${profile.profileCompletionScore}%` }} /></div>
            <p className="mt-2 text-xs text-white/70">Hoàn thiện {profile.profileCompletionScore}% • Chỉ mang tính tham khảo.</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-4 py-2 text-sm font-bold ${statusClasses[profile.status]}`}>{profile.status}</span>
        {message && <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">{message}</span>}
        {error && <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-error">{error}</span>}
      </div>

      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
        <h2 className="font-headline text-xl font-bold">Mục tiêu nghề nghiệp và liên kết</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Vị trí mong muốn" value={form.desiredPosition} onChange={(v) => setForm({ ...form, desiredPosition: v })} />
          <Field label="Lĩnh vực mong muốn" value={form.desiredIndustry} onChange={(v) => setForm({ ...form, desiredIndustry: v })} />
          <Field label="Địa điểm mong muốn" value={form.desiredLocation} onChange={(v) => setForm({ ...form, desiredLocation: v })} />
          <Field label="Portfolio URL" value={form.portfolioUrl} onChange={(v) => setForm({ ...form, portfolioUrl: v })} />
          <Field label="GitHub URL" value={form.githubUrl} onChange={(v) => setForm({ ...form, githubUrl: v })} />
          <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={(v) => setForm({ ...form, linkedinUrl: v })} />
          <TextArea label="Mục tiêu ngắn hạn" value={form.shortTermGoal} onChange={(v) => setForm({ ...form, shortTermGoal: v })} />
          <TextArea label="Mục tiêu dài hạn" value={form.longTermGoal} onChange={(v) => setForm({ ...form, longTermGoal: v })} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={saving} onClick={() => run(() => careerService.saveStudentProfile(form), 'Đã lưu hồ sơ.')} className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50">Lưu hồ sơ</button>
          <button disabled={saving} onClick={() => run(() => careerService.generateSummary(), 'Đã tạo AI Summary.')} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">Tạo lại bằng AI</button>
          <button onClick={() => setConfirmOpen(true)} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500">Gửi hồ sơ lên nhà trường</button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ListCard title="Kỹ năng" items={profile.skills} onDelete={(id: string) => run(() => careerService.deleteSkill(id), 'Đã xóa kỹ năng.')} render={(item: any) => `${item.skillName} • ${item.skillType} • ${item.level}`}>
          <div className="grid gap-2 sm:grid-cols-3"><input className="input" placeholder="React" value={skill.skillName} onChange={(e) => setSkill({ ...skill, skillName: e.target.value })} /><select className="input" value={skill.skillType} onChange={(e) => setSkill({ ...skill, skillType: e.target.value })}><option value="technical">Chuyên môn</option><option value="soft">Kỹ năng mềm</option></select><select className="input" value={skill.level} onChange={(e) => setSkill({ ...skill, level: e.target.value })}><option>Cơ bản</option><option>Khá</option><option>Tốt</option><option>Thành thạo</option></select></div>
          <AddButton onClick={() => run(() => careerService.addSkill(skill), 'Đã thêm kỹ năng.')} />
        </ListCard>
        <ListCard title="Dự án cá nhân" items={profile.projects} onDelete={(id: string) => run(() => careerService.deleteProject(id), 'Đã xóa dự án.')} render={(item: any) => `${item.title} • ${item.technologies}`}>
          <Field label="Tên dự án" value={project.title} onChange={(v) => setProject({ ...project, title: v })} /><TextArea label="Mô tả" value={project.description} onChange={(v) => setProject({ ...project, description: v })} /><Field label="Công nghệ" value={project.technologies} onChange={(v) => setProject({ ...project, technologies: v })} />
          <AddButton onClick={() => run(() => careerService.addProject(project), 'Đã thêm dự án.')} />
        </ListCard>
        <ListCard title="Kinh nghiệm" items={profile.experiences} onDelete={(id: string) => run(() => careerService.deleteExperience(id), 'Đã xóa kinh nghiệm.')} render={(item: any) => `${item.position} • ${item.companyName}`}>
          <Field label="Công ty/Tổ chức" value={experience.companyName} onChange={(v) => setExperience({ ...experience, companyName: v })} /><Field label="Vị trí" value={experience.position} onChange={(v) => setExperience({ ...experience, position: v })} /><TextArea label="Mô tả" value={experience.description} onChange={(v) => setExperience({ ...experience, description: v })} />
          <AddButton onClick={() => run(() => careerService.addExperience(experience), 'Đã thêm kinh nghiệm.')} />
        </ListCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="font-headline text-xl font-bold">CV và minh chứng</h2><input className="mt-4 block w-full text-sm" type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && run(() => careerService.uploadCv(e.target.files![0]), 'Đã upload CV.')} />{profile.cvFileUrl && <a className="mt-3 inline-block text-sm font-bold text-primary" href={profile.cvFileUrl} target="_blank">Xem CV hiện tại</a>}</div>
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="font-headline text-xl font-bold">AI Profile Summary</h2><p className="mt-3 text-sm leading-6 text-on-surface-variant">{profile.aiSummary || 'Chưa có summary. Bấm “Tạo lại bằng AI” để tạo gợi ý.'}</p>{profile.aiSuggestions?.gaps?.length > 0 && <ul className="mt-4 list-disc pl-5 text-sm text-on-surface-variant">{profile.aiSuggestions.gaps.map((gap: string) => <li key={gap}>{gap}</li>)}</ul>}</div>
      </section>

      {confirmOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-[min(480px,90vw)] rounded-[28px] bg-white p-6 shadow-2xl"><h3 className="text-xl font-bold">Xác nhận chia sẻ hồ sơ</h3><p className="mt-3 text-sm leading-6 text-on-surface-variant">Tôi đồng ý cho nhà trường sử dụng hồ sơ nghề nghiệp của tôi để hỗ trợ kết nối thực tập, việc làm và giới thiệu đến doanh nghiệp phù hợp.</p><label className="mt-4 flex gap-3 text-sm font-semibold"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Tôi đồng ý chia sẻ hồ sơ với nhà trường.</label><div className="mt-6 flex justify-end gap-3"><button className="rounded-2xl px-4 py-2 font-bold" onClick={() => setConfirmOpen(false)}>Hủy</button><button disabled={!consent} className="rounded-2xl bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-40" onClick={() => { setConfirmOpen(false); run(() => careerService.submitProfile(true, form.allowEmployerView), 'Đã gửi nhà trường.'); }}>Gửi hồ sơ</button></div></div></div>}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span><input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span><textarea className="input min-h-24" value={value || ''} onChange={(e) => onChange(e.target.value)} /></label>; }
function AddButton({ onClick }: { onClick: () => void }) { return <button className="mt-3 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white" onClick={onClick}>Thêm</button>; }
function ListCard({ title, items, render, onDelete, children }: any) { return <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30"><h2 className="font-headline text-xl font-bold">{title}</h2><div className="mt-4 space-y-2">{items.length === 0 ? <p className="text-sm text-on-surface-variant">Chưa có dữ liệu.</p> : items.map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-sm"><span>{render(item)}</span><button className="text-error" onClick={() => onDelete(item.id)}>Xóa</button></div>)}</div><div className="mt-5 space-y-3">{children}</div></div>; }
