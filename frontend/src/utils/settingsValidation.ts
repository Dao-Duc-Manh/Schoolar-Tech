import type { EditableProfileFields } from '@/types/settings';

export type EditableFieldErrors = Partial<Record<keyof EditableProfileFields, string>>;

const PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEditableProfile(values: EditableProfileFields): EditableFieldErrors {
  const errors: EditableFieldErrors = {};

  if (!values.hometown.trim()) {
    errors.hometown = 'Vui lòng nhập quê quán.';
  }

  if (!values.currentAddress.trim()) {
    errors.currentAddress = 'Vui lòng nhập địa chỉ hiện tại.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.';
  } else if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Số điện thoại phải đúng định dạng Việt Nam.';
  }

  if (!values.email.trim()) {
    errors.email = 'Vui lòng nhập email.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Email không đúng định dạng.';
  }

  return errors;
}
