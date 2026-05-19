import { editableProfileDefaults, mockProfileUpdateRequests, mockStudentProfile } from '@/mock/settingsData';
import type {
  AdminReviewAction,
  EditableProfileFields,
  ProfileUpdateItem,
  ProfileUpdateRequest,
  StudentProfile,
} from '@/types/settings';

interface SettingsDb {
  profile: StudentProfile;
  requests: ProfileUpdateRequest[];
}

const STORAGE_KEY = 'scholar-tech-settings-db';
const REQUEST_LABELS: Record<keyof EditableProfileFields, string> = {
  hometown: 'Quê quán',
  currentAddress: 'Địa chỉ hiện tại',
  phone: 'Số điện thoại',
  email: 'Email',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function seedDb(): SettingsDb {
  return {
    profile: mockStudentProfile,
    requests: mockProfileUpdateRequests,
  };
}

function readDb(): SettingsDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seedDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw) as SettingsDb;
  } catch {
    const fallback = seedDb();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeDb(db: SettingsDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function getEditableProfile(profile: StudentProfile): EditableProfileFields {
  return {
    hometown: profile.hometown,
    currentAddress: profile.currentAddress,
    phone: profile.phone,
    email: profile.email,
  };
}

function buildUpdateItems(current: EditableProfileFields, next: EditableProfileFields): ProfileUpdateItem[] {
  return (Object.keys(current) as Array<keyof EditableProfileFields>)
    .filter((field) => current[field] !== next[field])
    .map((field) => ({
      field,
      label: REQUEST_LABELS[field],
      oldValue: current[field],
      newValue: next[field],
    }));
}

function applyApprovedChanges(profile: StudentProfile, requestedProfile: EditableProfileFields): StudentProfile {
  return {
    ...profile,
    hometown: requestedProfile.hometown,
    currentAddress: requestedProfile.currentAddress,
    phone: requestedProfile.phone,
    email: requestedProfile.email,
  };
}

export const settingsService = {
  async getStudentProfile(): Promise<StudentProfile> {
    await delay(250);
    return readDb().profile;
  },

  async getUpdateRequests(): Promise<ProfileUpdateRequest[]> {
    await delay(300);
    return readDb().requests.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },

  async createUpdateRequest(payload: EditableProfileFields): Promise<ProfileUpdateRequest> {
    await delay(500);

    const db = readDb();
    const currentEditableProfile = getEditableProfile(db.profile);
    const existingPending = db.requests.find((request) => request.status === 'pending');

    if (existingPending) {
      throw new Error('Bạn đang có một yêu cầu cập nhật thông tin chờ admin duyệt.');
    }

    const items = buildUpdateItems(currentEditableProfile, payload);
    if (items.length === 0) {
      throw new Error('Không có thay đổi nào để gửi duyệt.');
    }

    const now = new Date().toISOString();
    const request: ProfileUpdateRequest = {
      id: `REQ-${Date.now()}`,
      studentId: db.profile.id,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      requestedProfile: payload,
      items,
    };

    db.requests.unshift(request);
    writeDb(db);
    return request;
  },

  async cancelUpdateRequest(requestId: string): Promise<void> {
    await delay(250);

    const db = readDb();
    const target = db.requests.find((request) => request.id === requestId);

    if (!target) {
      throw new Error('Không tìm thấy yêu cầu cần hủy.');
    }

    if (target.status !== 'pending') {
      throw new Error('Chỉ có thể hủy yêu cầu đang chờ duyệt.');
    }

    db.requests = db.requests.filter((request) => request.id !== requestId);
    writeDb(db);
  },

  async getAdminProfileUpdateRequests(): Promise<ProfileUpdateRequest[]> {
    await delay(200);
    return readDb().requests;
  },

  async approveRequest(requestId: string, action: AdminReviewAction): Promise<ProfileUpdateRequest> {
    await delay(350);

    const db = readDb();
    const request = db.requests.find((item) => item.id === requestId);
    if (!request) {
      throw new Error('Không tìm thấy yêu cầu cần duyệt.');
    }

    request.status = 'approved';
    request.reviewedBy = action.reviewerName;
    request.reviewedAt = new Date().toISOString();
    request.adminNote = action.note;
    request.updatedAt = request.reviewedAt;
    db.profile = applyApprovedChanges(db.profile, request.requestedProfile);
    writeDb(db);

    return request;
  },

  async rejectRequest(requestId: string, action: AdminReviewAction): Promise<ProfileUpdateRequest> {
    await delay(350);

    const db = readDb();
    const request = db.requests.find((item) => item.id === requestId);
    if (!request) {
      throw new Error('Không tìm thấy yêu cầu cần từ chối.');
    }

    request.status = 'rejected';
    request.reviewedBy = action.reviewerName;
    request.reviewedAt = new Date().toISOString();
    request.adminNote = action.note;
    request.updatedAt = request.reviewedAt;
    writeDb(db);

    return request;
  },

  getEditableProfileDefaults(profile?: StudentProfile): EditableProfileFields {
    return profile ? getEditableProfile(profile) : editableProfileDefaults;
  },
};
