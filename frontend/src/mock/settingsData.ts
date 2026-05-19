import type { EditableProfileFields, ProfileUpdateRequest, StudentProfile } from '@/types/settings';

export const mockStudentProfile: StudentProfile = {
  id: 'student_001',
  fullName: 'Nguyễn Văn A',
  studentCode: 'SV2026001',
  dateOfBirth: '2005-09-21',
  gender: 'Nam',
  hometown: 'Điện Biên',
  currentAddress: 'Số 25, ngõ 18, Cầu Giấy, Hà Nội',
  phone: '0901234567',
  email: 'nguyenvana@student.edu.vn',
  faculty: 'Khoa Công nghệ số',
  major: 'Công nghệ thông tin',
  className: 'CNTT K16',
  cohort: '2023 - 2027',
  accountStatus: 'Đang hoạt động',
};

export const editableProfileDefaults: EditableProfileFields = {
  hometown: mockStudentProfile.hometown,
  currentAddress: mockStudentProfile.currentAddress,
  phone: mockStudentProfile.phone,
  email: mockStudentProfile.email,
};

export const mockProfileUpdateRequests: ProfileUpdateRequest[] = [
  {
    id: 'REQ-2026-001',
    studentId: 'student_001',
    createdAt: '2026-04-20T09:15:00.000Z',
    updatedAt: '2026-04-20T09:15:00.000Z',
    status: 'pending',
    requestedProfile: {
      hometown: 'Điện Biên',
      currentAddress: 'Tòa B2, Ký túc xá Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
      phone: '0988888888',
      email: 'vana.update@student.edu.vn',
    },
    items: [
      {
        field: 'currentAddress',
        label: 'Địa chỉ hiện tại',
        oldValue: 'Số 25, ngõ 18, Cầu Giấy, Hà Nội',
        newValue: 'Tòa B2, Ký túc xá Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
      },
      {
        field: 'phone',
        label: 'Số điện thoại',
        oldValue: '0901234567',
        newValue: '0988888888',
      },
      {
        field: 'email',
        label: 'Email',
        oldValue: 'nguyenvana@student.edu.vn',
        newValue: 'vana.update@student.edu.vn',
      },
    ],
  },
  {
    id: 'REQ-2026-000',
    studentId: 'student_001',
    createdAt: '2026-03-12T08:20:00.000Z',
    updatedAt: '2026-03-13T10:15:00.000Z',
    status: 'approved',
    reviewedBy: 'Phòng CTSV - Trần Minh Châu',
    reviewedAt: '2026-03-13T10:15:00.000Z',
    requestedProfile: {
      hometown: 'Điện Biên',
      currentAddress: 'Số 25, ngõ 18, Cầu Giấy, Hà Nội',
      phone: '0901234567',
      email: 'nguyenvana@student.edu.vn',
    },
    items: [
      {
        field: 'hometown',
        label: 'Quê quán',
        oldValue: 'Sơn La',
        newValue: 'Điện Biên',
      },
    ],
  },
  {
    id: 'REQ-2026-00A',
    studentId: 'student_001',
    createdAt: '2026-02-10T14:00:00.000Z',
    updatedAt: '2026-02-11T09:00:00.000Z',
    status: 'rejected',
    reviewedBy: 'Phòng CTSV - Lê Quang Huy',
    reviewedAt: '2026-02-11T09:00:00.000Z',
    adminNote: 'Email yêu cầu cập nhật chưa dùng đúng tên miền sinh viên của nhà trường.',
    requestedProfile: {
      hometown: 'Điện Biên',
      currentAddress: 'Số 25, ngõ 18, Cầu Giấy, Hà Nội',
      phone: '0901234567',
      email: 'vana.personal@gmail.com',
    },
    items: [
      {
        field: 'email',
        label: 'Email',
        oldValue: 'nguyenvana@student.edu.vn',
        newValue: 'vana.personal@gmail.com',
      },
    ],
  },
];
