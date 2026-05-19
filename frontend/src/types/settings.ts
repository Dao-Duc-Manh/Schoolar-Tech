export type UpdateRequestStatus = 'pending' | 'approved' | 'rejected';

export interface StudentProfile {
  id: string;
  fullName: string;
  studentCode: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  hometown: string;
  currentAddress: string;
  phone: string;
  email: string;
  faculty: string;
  major: string;
  className: string;
  cohort: string;
  accountStatus: 'Đang hoạt động' | 'Tạm khóa';
}

export interface EditableProfileFields {
  hometown: string;
  currentAddress: string;
  phone: string;
  email: string;
}

export interface ProfileUpdateItem {
  field: keyof EditableProfileFields;
  label: string;
  oldValue: string;
  newValue: string;
}

export interface ProfileUpdateRequest {
  id: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  status: UpdateRequestStatus;
  items: ProfileUpdateItem[];
  requestedProfile: EditableProfileFields;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface AdminReviewAction {
  reviewerId: string;
  reviewerName: string;
  note?: string;
}
