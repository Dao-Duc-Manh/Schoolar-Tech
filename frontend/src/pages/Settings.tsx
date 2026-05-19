import { useEffect, useState } from 'react';
import { ChangePasswordForm } from '@/components/Settings/ChangePasswordForm';
import { userService, type ProfilePayload, type ProfileUpdateRequest, type UserProfile } from '@/services/userService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const roleLabel: Record<string, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
  admin: 'Quản trị viên',
};

export function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [form, setForm] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getProfile();
      setProfile(response.profile);
      setRequests(response.updateRequests);
      setForm({
        fullName: response.profile.fullName,
        email: response.profile.email,
        phone: response.profile.phone || '',
        hometown: response.profile.hometown || '',
        currentAddress: response.profile.currentAddress || '',
        notificationPreferences: response.profile.notificationPreferences,
        themePreference: response.profile.themePreference,
      });
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Không thể tải cài đặt tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateField = <K extends keyof ProfilePayload>(field: K, value: ProfilePayload[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const validateForm = () => {
    if (!form) return 'Biểu mẫu chưa sẵn sàng.';
    if (form.fullName.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự.';
    if (!emailRegex.test(form.email.trim())) return 'Email không đúng định dạng.';
    if (form.phone.trim() && !phoneRegex.test(form.phone.trim())) return 'Số điện thoại không hợp lệ.';
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    setError(validationError);
    setMessage('');
    if (validationError || !form) return;

    setSaving(true);
    try {
      const response = await userService.updateProfile(form);
      setMessage(response.message);
      await loadProfile();
    } catch (saveError: any) {
      setError(saveError.response?.data?.message || 'Không thể lưu thay đổi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-56 rounded-[32px] bg-surface-container" /><div className="h-96 rounded-[32px] bg-surface-container" /></div>;
  }

  if (error && !form) {
    return <div className="rounded-[28px] bg-red-50 p-6 text-error">{error}</div>;
  }

  if (!profile || !form) return null;

  const pendingRequest = requests.find((request) => request.status === 'pending');

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Cài đặt tài khoản</p>
            <h1 className="mt-4 font-headline text-4xl font-extrabold tracking-tight">Quản lý hồ sơ và bảo mật</h1>
            <p className="mt-3 max-w-2xl text-white/80 leading-7">
              Cập nhật thông tin cá nhân, đổi mật khẩu và tùy chỉnh thông báo. Sinh viên gửi yêu cầu cập nhật để admin duyệt trước khi thay đổi thông tin quan trọng.
            </p>
          </div>
          <div className="rounded-[28px] bg-white/10 px-6 py-5 backdrop-blur border border-white/10 min-w-[240px]">
            <p className="text-sm text-white/70">Tài khoản</p>
            <p className="mt-1 text-2xl font-bold">{profile.fullName}</p>
            <p className="mt-2 text-sm text-white/80">{profile.accountId} • {roleLabel[profile.role]}</p>
          </div>
        </div>
      </section>

      {pendingRequest && (
        <div className="rounded-[24px] bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-200">
          <p className="font-bold">Yêu cầu cập nhật đang chờ duyệt</p>
          <p className="mt-1 text-sm">Admin sẽ kiểm tra yêu cầu của bạn trước khi cập nhật vào hồ sơ chính thức.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">Thông tin cá nhân</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Những trường sinh viên thay đổi sẽ được gửi duyệt.</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary">{roleLabel[profile.role]}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Họ tên" value={form.fullName} onChange={(value) => updateField('fullName', value)} disabled={profile.role === 'student'} />
          <Field label="Email" value={form.email} onChange={(value) => updateField('email', value)} type="email" />
          <Field label="Số điện thoại" value={form.phone} onChange={(value) => updateField('phone', value)} />
          <Field label="Quê quán" value={form.hometown} onChange={(value) => updateField('hometown', value)} />
          <label className="md:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ hiện tại</span>
            <textarea
              value={form.currentAddress}
              onChange={(event) => updateField('currentAddress', event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl bg-surface-container-low p-5">
            <h3 className="font-headline font-bold text-on-surface">Cài đặt thông báo</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(['email', 'inApp', 'academic', 'security'] as const).map((key) => (
                <label key={key} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-on-surface-variant">
                  {key === 'email' ? 'Email' : key === 'inApp' ? 'Trong ứng dụng' : key === 'academic' ? 'Học vụ' : 'Bảo mật'}
                  <input
                    type="checkbox"
                    checked={form.notificationPreferences[key]}
                    onChange={(event) => updateField('notificationPreferences', { ...form.notificationPreferences, [key]: event.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-surface-container-low p-5">
            <h3 className="font-headline font-bold text-on-surface">Chế độ hiển thị</h3>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateField('themePreference', mode)}
                  className={`rounded-2xl px-3 py-3 text-sm font-bold transition ${form.themePreference === mode ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-primary-50'}`}
                >
                  {mode === 'light' ? 'Sáng' : mode === 'dark' ? 'Tối' : 'Hệ thống'}
                </button>
              ))}
            </div>
          </section>
        </div>

        {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-error">{error}</p>}
        {message && <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}

        <button type="submit" disabled={saving || !!pendingRequest} className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? 'Đang lưu...' : profile.role === 'student' ? 'Gửi yêu cầu cập nhật' : 'Lưu thay đổi'}
        </button>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
