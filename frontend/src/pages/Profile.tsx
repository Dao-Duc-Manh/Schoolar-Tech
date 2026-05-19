import { useEffect, useState } from 'react';
import { userService, type UserProfile } from '@/services/userService';

const roleLabel: Record<string, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
  admin: 'Quản trị viên',
};

const getInitials = (name?: string) => {
  const parts = (name || 'User').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
};

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getProfile()
      .then((response) => setProfile(response.profile))
      .catch((profileError) => setError(profileError.response?.data?.message || 'Không thể tải hồ sơ.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-[28px] bg-white p-8 shadow-sm animate-pulse">Đang tải hồ sơ...</div>;
  if (error) return <div className="rounded-[28px] bg-red-50 p-6 text-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="space-y-6 pb-20">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/20">
            {getInitials(profile.fullName)}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Hồ sơ cá nhân</p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight">{profile.fullName}</h1>
            <p className="mt-2 text-white/80">{profile.accountId || profile.code} • {roleLabel[profile.role]}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Info label="Email" value={profile.email} />
        <Info label="Số điện thoại" value={profile.phone || 'Chưa cập nhật'} />
        <Info label="Vai trò" value={roleLabel[profile.role]} />
        <Info label="Khoa/Đơn vị" value={profile.faculty || profile.department || 'Chưa cập nhật'} />
        <Info label="Địa chỉ" value={profile.currentAddress || 'Chưa cập nhật'} />
        <Info label="Trạng thái" value={profile.accountStatus || profile.status} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-outline-variant/30">
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-2 break-words text-base font-bold text-on-surface">{value}</p>
    </div>
  );
}
