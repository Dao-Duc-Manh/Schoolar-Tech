import { useEffect, useState } from 'react';
import {
  adminService,
  type AdminClass,
  type AdminOverview,
  type AdminUser,
  type ManagedRole,
  type SaveClassPayload,
} from '@/services/adminService';
import { useAuthStore } from '@/stores/authStore';

type RoleFilter = 'all' | ManagedRole;

const emptyUserForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'student' as ManagedRole,
};

const emptyClassForm: SaveClassPayload = {
  code: '',
  name: '',
  semester: '',
  room: '',
  teacherId: null,
  studentIds: [],
  capacity: 40,
  notes: '',
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Chưa đăng nhập';
  return new Date(value).toLocaleString('vi-VN');
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [classForm, setClassForm] = useState<SaveClassPayload>(emptyClassForm);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [overviewData, usersData, classesData] = await Promise.all([
        adminService.getOverview(),
        adminService.listUsers(),
        adminService.listClasses(),
      ]);

      setOverview(overviewData);
      setUsers(usersData);
      setClasses(classesData);
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const managedUsers = users.filter((managedUser) => managedUser.role !== 'admin');
  const teachers = managedUsers.filter((managedUser) => managedUser.role === 'lecturer');
  const students = managedUsers.filter((managedUser) => managedUser.role === 'student');
  const filteredUsers = managedUsers.filter((managedUser) => {
    const matchesRole = roleFilter === 'all' ? true : managedUser.role === roleFilter;
    const keyword = userSearch.trim().toLowerCase();
    const matchesSearch = !keyword
      ? true
      : managedUser.fullName.toLowerCase().includes(keyword) || managedUser.email.toLowerCase().includes(keyword);

    return matchesRole && matchesSearch;
  });

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUser(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        ...(userForm.password ? { password: userForm.password } : {}),
      };

      if (editingUserId) {
        await adminService.updateUser(editingUserId, payload);
        setSuccess('Đã cập nhật tài khoản.');
      } else {
        await adminService.createUser({ ...payload, password: userForm.password });
        setSuccess('Đã tạo tài khoản mới.');
      }

      setUserForm(emptyUserForm);
      setEditingUserId(null);
      await loadData();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Không thể lưu tài khoản.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleEditUser = (managedUser: AdminUser) => {
    setEditingUserId(managedUser.id);
    setUserForm({
      fullName: managedUser.fullName,
      email: managedUser.email,
      password: '',
      role: managedUser.role as ManagedRole,
    });
  };

  const handleDeleteUser = async (managedUser: AdminUser) => {
    const confirmed = window.confirm(`Xoá tài khoản ${managedUser.fullName}?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await adminService.deleteUser(managedUser.id);
      setSuccess('Đã xoá tài khoản.');
      if (editingUserId === managedUser.id) {
        setEditingUserId(null);
        setUserForm(emptyUserForm);
      }
      await loadData();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Không thể xoá tài khoản.');
    }
  };

  const handleClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingClass(true);
    setError('');
    setSuccess('');

    try {
      const payload: SaveClassPayload = {
        ...classForm,
        teacherId: classForm.teacherId || null,
        studentIds: [...new Set(classForm.studentIds)],
      };

      if (editingClassId) {
        await adminService.updateClass(editingClassId, payload);
        setSuccess('Đã cập nhật lớp học.');
      } else {
        await adminService.createClass(payload);
        setSuccess('Đã tạo lớp học mới.');
      }

      setEditingClassId(null);
      setClassForm(emptyClassForm);
      await loadData();
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Không thể lưu lớp học.');
    } finally {
      setSavingClass(false);
    }
  };

  const handleEditClass = (managedClass: AdminClass) => {
    setEditingClassId(managedClass.id);
    setClassForm({
      code: managedClass.code,
      name: managedClass.name,
      semester: managedClass.semester,
      room: managedClass.room,
      teacherId: managedClass.teacherId,
      studentIds: managedClass.studentIds,
      capacity: managedClass.capacity,
      notes: managedClass.notes,
    });
  };

  const handleDeleteClass = async (managedClass: AdminClass) => {
    const confirmed = window.confirm(`Xoá lớp ${managedClass.code} - ${managedClass.name}?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await adminService.deleteClass(managedClass.id);
      setSuccess('Đã xoá lớp học.');
      if (editingClassId === managedClass.id) {
        setEditingClassId(null);
        setClassForm(emptyClassForm);
      }
      await loadData();
    } catch (deleteError: any) {
      setError(deleteError.response?.data?.message || 'Không thể xoá lớp học.');
    }
  };

  const toggleStudent = (studentId: string) => {
    setClassForm((current) => {
      const exists = current.studentIds.includes(studentId);
      return {
        ...current,
        studentIds: exists
          ? current.studentIds.filter((item) => item !== studentId)
          : [...current.studentIds, studentId],
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Đang tải trung tâm quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <section className="rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-950 via-primary to-secondary text-white shadow-2xl shadow-primary/10">
        <div className="grid lg:grid-cols-[1.4fr,0.8fr] gap-8 p-8 lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-[0.24em] uppercase">
              <span className="material-symbols-outlined text-sm">shield_person</span>
              Admin Center
            </span>
            <h1 className="mt-5 text-4xl lg:text-5xl font-black tracking-tight max-w-3xl">
              Quản lý tập trung tài khoản sinh viên, giảng viên và toàn bộ lớp học.
            </h1>
            <p className="mt-4 text-white/80 max-w-2xl leading-7">
              Một màn hình duy nhất để cấp tài khoản, phân công giảng viên, đưa sinh viên vào lớp và giữ bức tranh vận hành học vụ luôn rõ ràng.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/10 backdrop-blur p-6 border border-white/10 min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white/70">Phiên quản trị đang hoạt động</p>
                <p className="text-xl font-bold break-words">{user?.fullName || 'Quản trị viên'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-white/80">
              <div className="flex flex-col gap-1 rounded-2xl bg-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Tài khoản quản trị</span>
                <span className="font-semibold break-all sm:max-w-[60%] sm:text-right">{user?.email}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl bg-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Lớp đang quản lý</span>
                <span className="font-semibold">{overview?.totalClasses || 0}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl bg-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span>Đăng nhập gần đây</span>
                <span className="font-semibold">{overview?.recentLogins || 0} tài khoản</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(error || success) && (
        <div className="space-y-3">
          {error && <div className="rounded-2xl bg-error-container text-error px-4 py-3 text-sm font-medium">{error}</div>}
          {success && <div className="rounded-2xl bg-tertiary/10 text-tertiary px-4 py-3 text-sm font-medium">{success}</div>}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="groups" label="Tổng tài khoản" value={overview?.totalAccounts || 0} accent="primary" />
        <StatCard icon="school" label="Sinh viên" value={overview?.totalStudents || 0} accent="tertiary" />
        <StatCard icon="co_present" label="Giảng viên" value={overview?.totalTeachers || 0} accent="secondary" />
        <StatCard icon="domain" label="Lớp học" value={overview?.totalClasses || 0} accent="default" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6 min-w-0">
          <div className="rounded-[28px] bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
            <div className="p-6 border-b border-outline-variant/10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Quản lý tài khoản</h2>
                <p className="text-sm text-on-surface-variant mt-1">Tạo, chỉnh sửa và thu hồi tài khoản sinh viên hoặc giảng viên.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'student', 'lecturer'] as RoleFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRoleFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      roleFilter === filter
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {filter === 'all' ? 'Tất cả' : filter === 'student' ? 'Sinh viên' : 'Giảng viên'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-outline-variant/10">
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUserSubmit}>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Họ và tên</span>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                    value={userForm.fullName}
                    onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Ví dụ: Nguyễn Thị Lan"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Email trường</span>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                    value={userForm.email}
                    onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="ten@truongdaihoc.edu.vn"
                    type="email"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Vai trò</span>
                  <select
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                    value={userForm.role}
                    onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as ManagedRole }))}
                  >
                    <option value="student">Sinh viên</option>
                    <option value="lecturer">Giảng viên</option>
                  </select>
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">
                    {editingUserId ? 'Mật khẩu mới (tuỳ chọn)' : 'Mật khẩu khởi tạo'}
                  </span>
                  <input
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                    value={userForm.password}
                    onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={editingUserId ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
                    type="password"
                    required={!editingUserId}
                  />
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button
                    className="px-5 py-3 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 disabled:opacity-60"
                    type="submit"
                    disabled={savingUser}
                  >
                    {savingUser ? 'Đang lưu...' : editingUserId ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
                  </button>
                  {(editingUserId || userForm.fullName || userForm.email || userForm.password !== '') && (
                    <button
                      className="px-5 py-3 rounded-2xl bg-surface-container font-semibold text-on-surface-variant"
                      type="button"
                      onClick={() => {
                        setEditingUserId(null);
                        setUserForm(emptyUserForm);
                      }}
                    >
                      Làm mới form
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Danh sách tài khoản</h3>
                  <p className="text-sm text-on-surface-variant">{filteredUsers.length} tài khoản phù hợp bộ lọc hiện tại.</p>
                </div>
                <input
                  className="w-full md:w-72 rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Tìm theo tên hoặc email"
                />
              </div>

              <div className="min-w-0 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                      <th className="pb-3 font-bold">Người dùng</th>
                      <th className="pb-3 font-bold">Vai trò</th>
                      <th className="pb-3 font-bold">Số lớp</th>
                      <th className="pb-3 font-bold">Đăng nhập gần nhất</th>
                      <th className="pb-3 font-bold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((managedUser) => (
                      <tr key={managedUser.id} className="border-b border-outline-variant/10 last:border-0">
                        <td className="py-4 pr-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface">{managedUser.fullName}</p>
                            <p className="text-sm text-on-surface-variant break-all">{managedUser.email}</p>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <RoleBadge role={managedUser.role} />
                        </td>
                        <td className="py-4 pr-4 text-on-surface-variant">{managedUser.classCount}</td>
                        <td className="py-4 pr-4 text-sm text-on-surface-variant">{formatDateTime(managedUser.lastLogin)}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-2 rounded-xl bg-surface-container text-sm font-semibold text-on-surface"
                              type="button"
                              onClick={() => handleEditUser(managedUser)}
                            >
                              Sửa
                            </button>
                            <button
                              className="px-3 py-2 rounded-xl bg-error-container text-sm font-semibold text-error"
                              type="button"
                              onClick={() => handleDeleteUser(managedUser)}
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div className="rounded-[28px] bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
            <div className="p-6 border-b border-outline-variant/10">
              <h2 className="text-2xl font-bold text-on-surface">Quản lý lớp học</h2>
              <p className="text-sm text-on-surface-variant mt-1">Tạo lớp, gán giảng viên phụ trách và thêm sinh viên trực tiếp từ trung tâm admin.</p>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={handleClassSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Mã lớp</span>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40 uppercase"
                      value={classForm.code}
                      onChange={(event) => setClassForm((current) => ({ ...current, code: event.target.value }))}
                      placeholder="VD: CS102"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Tên lớp</span>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                      value={classForm.name}
                      onChange={(event) => setClassForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="VD: Nhập môn AI"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Học kỳ</span>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                      value={classForm.semester}
                      onChange={(event) => setClassForm((current) => ({ ...current, semester: event.target.value }))}
                      placeholder="VD: HK1 2025-2026"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Phòng học</span>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                      value={classForm.room}
                      onChange={(event) => setClassForm((current) => ({ ...current, room: event.target.value }))}
                      placeholder="VD: A205"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Giảng viên phụ trách</span>
                    <select
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                      value={classForm.teacherId || ''}
                      onChange={(event) => setClassForm((current) => ({ ...current, teacherId: event.target.value || null }))}
                    >
                      <option value="">Chưa phân công</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Sức chứa</span>
                    <input
                      className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40"
                      value={classForm.capacity}
                      onChange={(event) => setClassForm((current) => ({ ...current, capacity: Number(event.target.value) || 0 }))}
                      min={1}
                      type="number"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Ghi chú vận hành</span>
                  <textarea
                    className="w-full rounded-2xl bg-surface-container px-4 py-3 outline-none border border-transparent focus:border-primary/40 min-h-24"
                    value={classForm.notes}
                    onChange={(event) => setClassForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Thông tin thêm cho ban đào tạo hoặc bộ môn"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Chọn sinh viên vào lớp</span>
                    <span className="text-xs text-on-surface-variant">Đã chọn {classForm.studentIds.length}</span>
                  </div>

                  <div className="max-h-56 overflow-auto rounded-3xl bg-surface-container p-3 grid gap-2">
                    {students.length === 0 && (
                      <p className="text-sm text-on-surface-variant px-2 py-3">Chưa có sinh viên nào để gán vào lớp.</p>
                    )}
                    {students.map((student) => {
                      const checked = classForm.studentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 cursor-pointer transition ${
                            checked ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-lowest border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 pr-4">
                            <p className="font-medium text-on-surface">{student.fullName}</p>
                            <p className="text-xs text-on-surface-variant break-all">{student.email}</p>
                          </div>
                          <input
                            checked={checked}
                            className="h-4 w-4 accent-primary"
                            onChange={() => toggleStudent(student.id)}
                            type="checkbox"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    className="px-5 py-3 rounded-2xl bg-secondary text-white font-semibold shadow-lg shadow-secondary/20 disabled:opacity-60"
                    type="submit"
                    disabled={savingClass}
                  >
                    {savingClass ? 'Đang lưu...' : editingClassId ? 'Cập nhật lớp' : 'Tạo lớp'}
                  </button>
                  {(editingClassId || classForm.code || classForm.name || classForm.studentIds.length > 0) && (
                    <button
                      className="px-5 py-3 rounded-2xl bg-surface-container font-semibold text-on-surface-variant"
                      type="button"
                      onClick={() => {
                        setEditingClassId(null);
                        setClassForm(emptyClassForm);
                      }}
                    >
                      Làm mới form
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            {classes.map((managedClass) => (
              <article key={managedClass.id} className="rounded-[28px] bg-surface-container-lowest border border-outline-variant/10 shadow-sm p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                        {managedClass.code}
                      </span>
                      <span className="text-xs text-on-surface-variant break-words">Tạo lúc {formatDateTime(managedClass.createdAt)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-on-surface">{managedClass.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {managedClass.semester} • {managedClass.room} • Sức chứa {managedClass.capacity}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-xl bg-surface-container text-sm font-semibold text-on-surface"
                      type="button"
                      onClick={() => handleEditClass(managedClass)}
                    >
                      Sửa lớp
                    </button>
                    <button
                      className="px-3 py-2 rounded-xl bg-error-container text-sm font-semibold text-error"
                      type="button"
                      onClick={() => handleDeleteClass(managedClass)}
                    >
                      Xoá lớp
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Giảng viên phụ trách</p>
                    <p className="font-semibold text-on-surface">{managedClass.teacher?.fullName || 'Chưa phân công'}</p>
                    {managedClass.teacher?.email && (
                      <p className="text-sm text-on-surface-variant mt-1">{managedClass.teacher.email}</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Sinh viên trong lớp</p>
                    <p className="font-semibold text-on-surface">{managedClass.studentCount} sinh viên</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {managedClass.students.map((student) => (
                        <span key={student.id} className="px-3 py-1 rounded-full bg-surface-container-lowest text-xs text-on-surface-variant">
                          {student.fullName}
                        </span>
                      ))}
                      {managedClass.students.length === 0 && (
                        <span className="text-sm text-on-surface-variant">Chưa có sinh viên nào trong lớp.</span>
                      )}
                    </div>
                  </div>
                </div>

                {managedClass.notes && (
                  <div className="mt-4 rounded-2xl bg-secondary/10 text-on-surface px-4 py-3 text-sm leading-6">
                    {managedClass.notes}
                  </div>
                )}
              </article>
            ))}

            {classes.length === 0 && (
              <div className="rounded-[28px] bg-surface-container-lowest border border-dashed border-outline-variant/30 p-10 text-center text-on-surface-variant">
                Chưa có lớp học nào. Hãy tạo lớp đầu tiên từ form bên trên.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: number;
  accent: 'primary' | 'secondary' | 'tertiary' | 'default';
}) {
  const accentClass =
    accent === 'primary'
      ? 'bg-primary/10 text-primary'
      : accent === 'secondary'
      ? 'bg-secondary/10 text-secondary'
      : accent === 'tertiary'
      ? 'bg-tertiary/10 text-tertiary'
      : 'bg-surface-container text-on-surface';

  return (
    <div className="rounded-[28px] bg-surface-container-lowest border border-outline-variant/10 shadow-sm p-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="mt-5 text-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-3xl font-black text-on-surface">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: ManagedRole | 'admin' }) {
  const className =
    role === 'student'
      ? 'bg-tertiary/10 text-tertiary'
      : role === 'lecturer'
      ? 'bg-primary/10 text-primary'
      : 'bg-secondary/10 text-secondary';

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      <span className="material-symbols-outlined text-sm">
        {role === 'student' ? 'school' : role === 'lecturer' ? 'co_present' : 'admin_panel_settings'}
      </span>
      {role === 'student' ? 'Sinh viên' : role === 'lecturer' ? 'Giảng viên' : 'Quản trị'}
    </span>
  );
}
