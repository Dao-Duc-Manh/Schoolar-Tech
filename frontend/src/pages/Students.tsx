import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { teacherStudentsService, type StudentLearningStatus, type TeacherStudentRow, type TeacherStudentsResponse } from '@/services/teacherStudentsService';

type ModalType = 'profile' | 'progress' | 'grades' | 'message' | 'note' | 'ai' | null;

const statusConfig: Record<StudentLearningStatus, { label: string; className: string }> = {
  Active: { label: 'Đang học', className: 'bg-emerald-100 text-emerald-700' },
  'At Risk': { label: 'Nguy cơ', className: 'bg-red-100 text-red-700' },
  Completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-700' },
  Inactive: { label: 'Không hoạt động', className: 'bg-slate-100 text-slate-700' },
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Chưa có';

export function StudentsPage() {
  const [rows, setRows] = useState<TeacherStudentRow[]>([]);
  const [stats, setStats] = useState<TeacherStudentsResponse['stats'] | null>(null);
  const [filterOptions, setFilterOptions] = useState<TeacherStudentsResponse['filters']>({ classes: [], courses: [] });
  const [filters, setFilters] = useState({ q: '', classId: '', courseId: '', status: '', minProgress: '', minGpa: '' });
  const [sort, setSort] = useState<{ by: keyof TeacherStudentRow; dir: 'asc' | 'desc' }>({ by: 'fullName', dir: 'asc' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeStudent, setActiveStudent] = useState<TeacherStudentRow | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherStudentsService.list({ ...filters, sortBy: sort.by, sortDir: sort.dir });
      setRows(response.data);
      setStats(response.stats);
      setFilterOptions(response.filters);
      setPage(1);
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Không thể tải danh sách sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [sort.by, sort.dir]);

  const uniqueRows = useMemo(() => rows, [rows]);
  const pagedRows = uniqueRows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(uniqueRows.length / pageSize));
  const selectedStudentIds = Array.from(new Set(selectedIds.map((rowId) => rows.find((row) => row.id === rowId)?.studentId).filter(Boolean))) as string[];

  const openModal = async (type: ModalType, student: TeacherStudentRow) => {
    setActiveStudent(student);
    setModal(type);
    setDetailData(null);
    setActionLoading(true);
    try {
      if (type === 'profile') setDetailData(await teacherStudentsService.detail(student.studentId));
      if (type === 'progress') setDetailData(await teacherStudentsService.progress(student.studentId));
      if (type === 'grades') setDetailData(await teacherStudentsService.grades(student.studentId));
      if (type === 'note') setDetailData(await teacherStudentsService.notes(student.studentId));
      if (type === 'ai') setDetailData(await teacherStudentsService.aiAnalyze(student.studentId));
    } catch (modalError: any) {
      setError(modalError.response?.data?.message || 'Không thể tải dữ liệu chi tiết.');
      setModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ q: '', classId: '', courseId: '', status: '', minProgress: '', minGpa: '' });
    setTimeout(loadStudents, 0);
  };

  const toggleSort = (by: keyof TeacherStudentRow) => {
    setSort((current) => ({ by, dir: current.by === by && current.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const exportStudents = () => {
    window.open(teacherStudentsService.exportUrl(new URLSearchParams(filters)), '_blank');
  };

  const markAtRisk = async (students = selectedStudentIds) => {
    if (students.length === 0) return;
    setActionLoading(true);
    try {
      await Promise.all(students.map((studentId) => teacherStudentsService.updateStatus(studentId, { status: 'At Risk', riskLevel: 'high', riskReason: 'Giảng viên đánh dấu cần hỗ trợ.' })));
      setToast('Đã đánh dấu sinh viên có nguy cơ học yếu.');
      setSelectedIds([]);
      await loadStudents();
    } catch (actionError: any) {
      setError(actionError.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-13rem)] space-y-6 pb-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Teacher LMS</p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">Students Management</h1>
          <p className="mt-2 text-on-surface-variant">Manage student enrollments, academic progress and learning performance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={exportStudents}>Export Excel</button>
          <button className="btn-secondary" onClick={() => { setActiveStudent(null); setModal('message'); }}>Send Notification</button>
          <button className="btn-primary">Add Student</button>
          <button className="btn-secondary" onClick={loadStudents}>Filter</button>
        </div>
      </header>

      {toast && <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">{toast}</div>}
      {error && <div className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-error">{error}</div>}

      <StudentStatsCards stats={stats} />
      <StudentFilters filters={filters} options={filterOptions} onChange={setFilters} onApply={loadStudents} onReset={resetFilters} />

      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary/20 bg-primary-50 px-5 py-4 shadow-lg shadow-primary/10">
          <p className="text-sm font-bold text-primary">Đã chọn {selectedIds.length} dòng sinh viên</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => { setActiveStudent(null); setModal('message'); }}>Send Notification</button>
            <button className="btn-secondary" onClick={exportStudents}>Export Selected</button>
            <button className="btn-secondary" onClick={() => markAtRisk()}>Mark At Risk</button>
            <button className="btn-ghost" onClick={() => setSelectedIds([])}>Clear Selection</button>
          </div>
        </div>
      )}

      <StudentsTable
        rows={pagedRows}
        allRows={uniqueRows}
        selectedIds={selectedIds}
        loading={loading}
        sort={sort}
        onSelect={setSelectedIds}
        onSort={toggleSort}
        onOpen={openModal}
        onMarkAtRisk={(student) => markAtRisk([student.studentId])}
      />

      {!loading && uniqueRows.length > 0 && (
        <div className="flex items-center justify-between rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-outline-variant/30">
          <p className="text-sm text-on-surface-variant">Page {page} / {totalPages} • {uniqueRows.length} records</p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
          </div>
        </div>
      )}

      {modal === 'profile' && <StudentDetailModal loading={actionLoading} student={activeStudent} data={detailData} onClose={() => setModal(null)} />}
      {modal === 'progress' && <StudentProgressModal loading={actionLoading} student={activeStudent} data={detailData} onClose={() => setModal(null)} />}
      {modal === 'grades' && <StudentGradesModal loading={actionLoading} student={activeStudent} data={detailData} onClose={() => setModal(null)} />}
      {modal === 'message' && <SendNotificationModal student={activeStudent} selectedStudentIds={selectedStudentIds} onClose={() => setModal(null)} onSent={(msg: string) => { setToast(msg); setModal(null); setSelectedIds([]); }} />}
      {modal === 'note' && <TeacherNoteModal loading={actionLoading} student={activeStudent} notes={detailData || []} onClose={() => setModal(null)} onSaved={(msg: string) => { setToast(msg); activeStudent && openModal('note', activeStudent); }} />}
      {modal === 'ai' && <AIStudentAnalysisPanel loading={actionLoading} student={activeStudent} data={detailData} onClose={() => setModal(null)} />}
    </div>
  );
}

function StudentStatsCards({ stats }: { stats: TeacherStudentsResponse['stats'] | null }) {
  const cards = [
    { label: 'Total Students', value: stats?.totalStudents ?? '-', icon: 'groups', tone: 'bg-blue-50 text-blue-700' },
    { label: 'Active Students', value: stats?.activeStudents ?? '-', icon: 'verified', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'At Risk', value: stats?.atRisk ?? '-', icon: 'warning', tone: 'bg-red-50 text-red-700' },
    { label: 'Average Progress', value: stats ? `${stats.averageProgress}%` : '-', icon: 'trending_up', tone: 'bg-violet-50 text-violet-700' },
  ];
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="group rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-on-surface-variant">{card.label}</p><p className="mt-3 text-4xl font-extrabold text-on-surface">{card.value}</p></div><span className={`grid h-12 w-12 place-items-center rounded-2xl ${card.tone}`}><span className="material-symbols-outlined">{card.icon}</span></span></div></div>)}</section>;
}

function StudentFilters({ filters, options, onChange, onApply, onReset }: { filters: any; options: TeacherStudentsResponse['filters']; onChange: (value: any) => void; onApply: () => void; onReset: () => void }) {
  return <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input className="input xl:col-span-2" placeholder="Search name, student code, email" value={filters.q} onChange={(e) => onChange({ ...filters, q: e.target.value })} /><select className="input" value={filters.classId} onChange={(e) => onChange({ ...filters, classId: e.target.value })}><option value="">All classes</option>{options.classes.map((item) => <option key={item.id} value={item.id}>{item.name} • {item.courseName}</option>)}</select><select className="input" value={filters.courseId} onChange={(e) => onChange({ ...filters, courseId: e.target.value })}><option value="">All courses</option>{options.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="input" value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}><option value="">All status</option><option>Active</option><option>At Risk</option><option>Completed</option><option>Inactive</option></select><div className="flex gap-2"><input className="input" placeholder="Min progress" type="number" value={filters.minProgress} onChange={(e) => onChange({ ...filters, minProgress: e.target.value })} /><input className="input" placeholder="Min GPA" type="number" step="0.1" value={filters.minGpa} onChange={(e) => onChange({ ...filters, minGpa: e.target.value })} /></div></div><div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onReset}>Reset Filter</button><button className="btn-primary" onClick={onApply}>Apply Filter</button></div></section>;
}

function StudentsTable({ rows, allRows, selectedIds, loading, sort, onSelect, onSort, onOpen, onMarkAtRisk }: { rows: TeacherStudentRow[]; allRows: TeacherStudentRow[]; selectedIds: string[]; loading: boolean; sort: any; onSelect: (ids: string[]) => void; onSort: (by: keyof TeacherStudentRow) => void; onOpen: (type: ModalType, row: TeacherStudentRow) => void; onMarkAtRisk: (row: TeacherStudentRow) => void }) {
  const toggleAll = (checked: boolean) => onSelect(checked ? allRows.map((row) => row.id) : []);
  const toggleOne = (id: string) => onSelect(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  if (loading) return <div className="rounded-[28px] bg-white p-8 shadow-sm animate-pulse">Loading students...</div>;
  if (rows.length === 0) return <div className="rounded-[28px] bg-white p-12 text-center shadow-sm ring-1 ring-outline-variant/30"><span className="material-symbols-outlined text-5xl text-outline">school</span><p className="mt-3 font-bold">Chưa có sinh viên phù hợp</p><p className="text-sm text-on-surface-variant">Thử reset bộ lọc hoặc chọn lớp học khác.</p></div>;

  return <section className="rounded-[28px] bg-white shadow-sm ring-1 ring-outline-variant/30"><div className="hidden overflow-x-auto xl:block"><table className="min-w-[1180px] w-full text-sm"><thead><tr className="border-b border-outline-variant/30 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant"><th className="p-4"><input type="checkbox" checked={selectedIds.length === allRows.length && allRows.length > 0} onChange={(e) => toggleAll(e.target.checked)} /></th><Sortable label="Student" by="fullName" sort={sort} onSort={onSort} /><th>Code</th><th>Email</th><th>Class</th><th>Course</th><Sortable label="Progress" by="progress" sort={sort} onSort={onSort} /><Sortable label="GPA" by="gpa" sort={sort} onSort={onSort} /><Sortable label="Status" by="status" sort={sort} onSort={onSort} /><th>Missing</th><th>Last active</th><th className="pr-4">Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-outline-variant/20 hover:bg-primary-50/40"><td className="p-4"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleOne(row.id)} /></td><td><div className="flex items-center gap-3"><Avatar name={row.fullName} /><div><p className="font-bold text-on-surface">{row.fullName}</p><p className="text-xs text-on-surface-variant">{row.phone || 'No phone'}</p></div></div></td><td>{row.studentCode}</td><td>{row.email}</td><td>{row.className}</td><td>{row.courseName}</td><td><Progress value={row.progress} /></td><td className="font-extrabold text-primary">{row.gpa}</td><td><StatusBadge status={row.status} /></td><td className={row.missingAssignments > 0 ? 'font-bold text-error' : 'text-on-surface-variant'}>{row.missingAssignments}</td><td>{formatDate(row.lastActivityAt)}</td><td className="pr-4"><ActionButtons row={row} onOpen={onOpen} onMarkAtRisk={onMarkAtRisk} /></td></tr>)}</tbody></table></div><div className="grid gap-4 p-4 xl:hidden">{rows.map((row) => <StudentMobileCard key={row.id} row={row} checked={selectedIds.includes(row.id)} onCheck={() => toggleOne(row.id)} onOpen={onOpen} onMarkAtRisk={onMarkAtRisk} />)}</div></section>;
}

function Sortable({ label, by, sort, onSort }: { label: string; by: keyof TeacherStudentRow; sort: any; onSort: (by: keyof TeacherStudentRow) => void }) { return <th className="cursor-pointer py-4" onClick={() => onSort(by)}>{label} {sort.by === by ? (sort.dir === 'asc' ? '↑' : '↓') : ''}</th>; }
function Avatar({ name }: { name: string }) { return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-100 text-xs font-extrabold text-primary">{getInitials(name)}</span>; }
function Progress({ value }: { value: number }) { return <div className="min-w-28"><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${value < 50 ? 'bg-red-500' : value < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${value}%` }} /></div><p className="mt-1 text-xs font-semibold text-on-surface-variant">{value}%</p></div>; }
function StatusBadge({ status }: { status: StudentLearningStatus }) { return <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[status].className}`}>{statusConfig[status].label}</span>; }
function ActionButtons({ row, onOpen, onMarkAtRisk }: { row: TeacherStudentRow; onOpen: (type: ModalType, row: TeacherStudentRow) => void; onMarkAtRisk: (row: TeacherStudentRow) => void }) { return <div className="flex flex-wrap gap-1"><button className="table-action" onClick={() => onOpen('profile', row)}>Profile</button><button className="table-action" onClick={() => onOpen('progress', row)}>Progress</button><button className="table-action" onClick={() => onOpen('grades', row)}>Grades</button><button className="table-action" onClick={() => onOpen('message', row)}>Message</button><button className="table-action" onClick={() => onOpen('note', row)}>Note</button><button className="table-action" onClick={() => onOpen('ai', row)}>AI</button><button className="table-action text-error" onClick={() => onMarkAtRisk(row)}>Risk</button></div>; }
function StudentMobileCard({ row, checked, onCheck, onOpen, onMarkAtRisk }: { row: TeacherStudentRow; checked: boolean; onCheck: () => void; onOpen: (type: ModalType, row: TeacherStudentRow) => void; onMarkAtRisk: (row: TeacherStudentRow) => void }) { return <div className="rounded-3xl bg-surface-container-low p-4"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><Avatar name={row.fullName} /><div><p className="font-bold">{row.fullName}</p><p className="text-xs text-on-surface-variant">{row.studentCode} • {row.email}</p></div></div><input type="checkbox" checked={checked} onChange={onCheck} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-on-surface-variant">Course</p><p className="font-bold">{row.courseName}</p></div><div><p className="text-xs text-on-surface-variant">GPA</p><p className="font-bold text-primary">{row.gpa}</p></div><div><p className="text-xs text-on-surface-variant">Progress</p><Progress value={row.progress} /></div><div><p className="text-xs text-on-surface-variant">Status</p><StatusBadge status={row.status} /></div></div><div className="mt-4"><ActionButtons row={row} onOpen={onOpen} onMarkAtRisk={onMarkAtRisk} /></div></div>; }

function BaseModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"><div className="mx-auto my-8 max-w-5xl rounded-[32px] bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between gap-4"><h2 className="font-headline text-2xl font-extrabold">{title}</h2><button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 text-2xl" onClick={onClose}>×</button></div>{children}</div></div>; }
function StudentDetailModal({ loading, student, data, onClose }: any) { return <BaseModal title={`Student Profile${student ? ` • ${student.fullName}` : ''}`} onClose={onClose}>{loading ? <p>Loading...</p> : <div className="grid gap-5 lg:grid-cols-[1fr,1fr]"><div className="rounded-3xl bg-surface-container-low p-5"><h3 className="font-bold">Personal information</h3><p className="mt-3 text-sm">{data.student.fullName} • {data.student.studentCode}</p><p className="text-sm text-on-surface-variant">{data.student.email} • {data.student.phone || 'No phone'}</p><p className="text-sm text-on-surface-variant">{data.student.faculty} • {data.student.major} • {data.student.className}</p></div><div className="rounded-3xl bg-primary-50 p-5"><h3 className="font-bold">Academic summary</h3><p className="mt-3 text-4xl font-extrabold text-primary">GPA {data.officialProfile.analytics.gpa}</p><p className="text-sm text-on-surface-variant">Completed credits {data.officialProfile.analytics.completedCredits}</p></div><div className="rounded-3xl bg-white p-5 ring-1 ring-outline-variant/30"><h3 className="font-bold">Certificates</h3>{data.certificates.length === 0 ? <p className="mt-2 text-sm text-on-surface-variant">No certificates.</p> : data.certificates.map((item: any) => <p key={item.id} className="mt-2 text-sm">{item.name} • {item.status}</p>)}</div><div className="rounded-3xl bg-white p-5 ring-1 ring-outline-variant/30"><h3 className="font-bold">Achievements</h3>{data.achievements.length === 0 ? <p className="mt-2 text-sm text-on-surface-variant">No achievements.</p> : data.achievements.map((item: any) => <p key={item.id} className="mt-2 text-sm">{item.title} • {item.status}</p>)}</div></div>}</BaseModal>; }
function StudentProgressModal({ loading, student, data, onClose }: any) { return <BaseModal title={`Learning Progress${student ? ` • ${student.fullName}` : ''}`} onClose={onClose}>{loading ? <p>Loading...</p> : <div className="space-y-5">{data.map((course: any) => <div key={course.course.id} className="rounded-3xl bg-surface-container-low p-5"><h3 className="font-bold">{course.course.name}</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{course.lessons.map((lesson: any) => <div key={lesson.id} className="rounded-2xl bg-white p-4"><p className="font-semibold">{lesson.title}</p><Progress value={lesson.progress.progressPercent} /><p className="mt-2 text-xs text-on-surface-variant">{lesson.progress.status} • {lesson.progress.timeSpent} phút học</p></div>)}</div></div>)}</div>}</BaseModal>; }
function StudentGradesModal({ loading, student, data, onClose }: any) { return <BaseModal title={`Grades${student ? ` • ${student.fullName}` : ''}`} onClose={onClose}>{loading ? <p>Loading...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead><tr className="text-left text-on-surface-variant"><th className="p-3">Course</th><th>Attendance</th><th>Assignment</th><th>Midterm</th><th>Final</th><th>Total</th><th>Letter</th><th>Status</th></tr></thead><tbody>{data.map((grade: any) => <tr key={grade.id} className="border-t"><td className="p-3 font-bold">{grade.course?.name}</td><td>{grade.attendanceScore}</td><td>{grade.assignmentScore}</td><td>{grade.midtermScore}</td><td>{grade.finalScore}</td><td className={grade.totalScore < 5.5 ? 'font-extrabold text-error' : 'font-extrabold text-primary'}>{grade.totalScore}</td><td>{grade.letterGrade}</td><td>{grade.status}</td></tr>)}</tbody></table></div>}</BaseModal>; }
function SendNotificationModal({ student, selectedStudentIds, onClose, onSent }: any) { const [title, setTitle] = useState('Nhắc nhở học tập'); const [content, setContent] = useState('Vui lòng hoàn thành bài học/bài tập còn thiếu trong tuần này.'); const [type, setType] = useState('Reminder'); const recipients = student ? [student.studentId] : selectedStudentIds; const send = async () => { await teacherStudentsService.sendNotification({ recipientIds: recipients, title, content, notificationType: type }); onSent('Đã gửi thông báo thành công.'); }; return <BaseModal title="Send Notification" onClose={onClose}><div className="space-y-4"><p className="text-sm text-on-surface-variant">Recipients: {student?.fullName || `${recipients.length} selected students`}</p><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /><textarea className="input min-h-32" value={content} onChange={(e) => setContent(e.target.value)} /><select className="input" value={type} onChange={(e) => setType(e.target.value)}><option>Reminder</option><option>Warning</option><option>Assignment</option><option>General</option></select><button className="btn-primary" onClick={send} disabled={recipients.length === 0}>Send</button></div></BaseModal>; }
function TeacherNoteModal({ loading, student, notes, onClose, onSaved }: any) { const [content, setContent] = useState(''); const [noteType, setNoteType] = useState('Academic'); const save = async () => { if (!student) return; await teacherStudentsService.addNote(student.studentId, { noteType, content, isPrivate: true }); setContent(''); onSaved('Đã thêm ghi chú sinh viên.'); }; return <BaseModal title={`Teacher Notes${student ? ` • ${student.fullName}` : ''}`} onClose={onClose}>{loading ? <p>Loading...</p> : <div className="grid gap-5 lg:grid-cols-[1fr,1fr]"><div className="space-y-3"><select className="input" value={noteType} onChange={(e) => setNoteType(e.target.value)}><option>Academic</option><option>Behavior</option><option>Support</option><option>Warning</option></select><textarea className="input min-h-40" placeholder="Write private teacher note..." value={content} onChange={(e) => setContent(e.target.value)} /><button className="btn-primary" onClick={save}>Save Note</button></div><div className="space-y-3">{notes.length === 0 ? <p className="text-sm text-on-surface-variant">No notes yet.</p> : notes.map((note: any) => <div key={note.id} className="rounded-2xl bg-surface-container-low p-4"><p className="text-xs font-bold uppercase text-primary">{note.noteType}</p><p className="mt-2 text-sm">{note.content}</p><p className="mt-2 text-xs text-on-surface-variant">{formatDate(note.createdAt)}</p></div>)}</div></div>}</BaseModal>; }
function AIStudentAnalysisPanel({ loading, student, data, onClose }: any) { return <BaseModal title={`AI Analyze${student ? ` • ${student.fullName}` : ''}`} onClose={onClose}>{loading ? <p>AI is analyzing...</p> : <div className="space-y-5"><div className="rounded-3xl bg-primary-50 p-5"><p className="font-bold text-primary">Risk level: {data.riskLevel}</p><p className="mt-2 text-sm leading-6">{data.analysisSummary}</p></div><div className="grid gap-5 md:grid-cols-2"><div><h3 className="font-bold">Weak points</h3>{data.weakPoints.length === 0 ? <p className="mt-2 text-sm text-on-surface-variant">No major weak points.</p> : data.weakPoints.map((item: string) => <p key={item} className="mt-2 rounded-2xl bg-red-50 p-3 text-sm text-error">{item}</p>)}</div><div><h3 className="font-bold">Recommendations</h3>{data.recommendations.map((item: string) => <p key={item} className="mt-2 rounded-2xl bg-surface-container-low p-3 text-sm">{item}</p>)}</div></div><p className="text-xs text-on-surface-variant">AI chỉ đưa ra gợi ý. Giảng viên là người quyết định hỗ trợ/chấm điểm.</p></div>}</BaseModal>; }
