import type { StudentProfile } from '@/types/settings';

export function StudentProfileCard({ profile }: { profile: StudentProfile }) {
  const profileRows = [
    ['Họ và tên', profile.fullName],
    ['Mã sinh viên', profile.studentCode],
    ['Ngày sinh', profile.dateOfBirth],
    ['Giới tính', profile.gender],
    ['Quê quán', profile.hometown],
    ['Địa chỉ hiện tại', profile.currentAddress],
    ['Số điện thoại', profile.phone],
    ['Email', profile.email],
    ['Khoa', profile.faculty],
    ['Ngành', profile.major],
    ['Lớp', profile.className],
    ['Khóa học', profile.cohort],
    ['Trạng thái tài khoản', profile.accountStatus],
  ] as const;

  return (
    <section className="rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined">badge</span>
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Thông tin sinh viên</h2>
          <p className="text-sm text-on-surface-variant mt-1">Dữ liệu hồ sơ chính thức đang có hiệu lực trong hệ thống.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profileRows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-surface-container p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
            <p className="mt-2 text-sm font-semibold text-on-surface leading-6 break-words">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
