import { Button, Input } from '@/components/Common';
import type { EditableProfileFields, StudentProfile } from '@/types/settings';
import type { EditableFieldErrors } from '@/utils/settingsValidation';

interface EditableProfileFormProps {
  profile: StudentProfile;
  values: EditableProfileFields;
  errors: EditableFieldErrors;
  disabled: boolean;
  submitting: boolean;
  onChange: (field: keyof EditableProfileFields, value: string) => void;
  onSubmit: () => void;
}

export function EditableProfileForm({
  profile,
  values,
  errors,
  disabled,
  submitting,
  onChange,
  onSubmit,
}: EditableProfileFormProps) {
  return (
    <section className="rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
          <span className="material-symbols-outlined">edit_note</span>
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Gửi yêu cầu cập nhật thông tin</h2>
          <p className="text-sm text-on-surface-variant mt-1">Sinh viên chỉ được tạo yêu cầu thay đổi. Dữ liệu chính thức chỉ đổi sau khi admin duyệt.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Input label="Họ và tên" value={profile.fullName} disabled readOnly />
        <Input label="Mã sinh viên" value={profile.studentCode} disabled readOnly />
        <Input label="Ngành" value={profile.major} disabled readOnly />
        <Input label="Lớp" value={profile.className} disabled readOnly />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Input
          label="Quê quán"
          value={values.hometown}
          onChange={(event) => onChange('hometown', event.target.value)}
          error={errors.hometown}
          disabled={submitting}
        />
        <Input
          label="Số điện thoại"
          value={values.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          error={errors.phone}
          disabled={submitting}
        />
        <div className="xl:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ hiện tại</label>
          <textarea
            value={values.currentAddress}
            onChange={(event) => onChange('currentAddress', event.target.value)}
            disabled={submitting}
            className={`w-full min-h-28 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              errors.currentAddress
                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.currentAddress && <p className="text-sm text-red-600 mt-1">{errors.currentAddress}</p>}
        </div>
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          error={errors.email}
          disabled={submitting}
          helperText="Email sẽ cần admin duyệt trước khi cập nhật vào hồ sơ chính thức."
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="primary" isLoading={submitting} disabled={disabled} onClick={onSubmit}>
          Gửi yêu cầu cập nhật
        </Button>
      </div>
    </section>
  );
}
