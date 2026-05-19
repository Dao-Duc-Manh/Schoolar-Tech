import { useState } from 'react';
import { userService } from '@/services/userService';

const isStrongPassword = (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!isStrongPassword(newPassword)) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword({ currentPassword, newPassword });
      setMessage(response.message || 'Đổi mật khẩu thành công.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (changeError: any) {
      setError(changeError.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-outline-variant/30">
      <div className="mb-5">
        <h2 className="font-headline text-xl font-bold text-on-surface">Đổi mật khẩu</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Dùng mật khẩu mạnh để bảo vệ tài khoản học vụ.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} />
        <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} />
        <PasswordField label="Nhập lại mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} />
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-error">{error}</p>}
      {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
      </button>
    </form>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        required
      />
    </label>
  );
}
