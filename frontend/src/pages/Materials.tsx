import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'doc' | 'slide';
  subject: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  downloads: number;
}

const mockMaterials: Material[] = [
  { id: '1', name: 'Bài giảng Tuần 1 - Giới thiệu', type: 'pdf', subject: 'Lập trình Web nâng cao', size: '2.4 MB', uploadedAt: '15/04/2024', uploadedBy: 'GV. Trần Thị B', downloads: 42 },
  { id: '2', name: 'Slide React Hooks & State Management', type: 'slide', subject: 'Lập trình Web nâng cao', size: '5.1 MB', uploadedAt: '18/04/2024', uploadedBy: 'GV. Trần Thị B', downloads: 38 },
  { id: '3', name: 'Bài tập thực hành SQL - Tuần 3', type: 'doc', subject: 'Cơ sở dữ liệu', size: '840 KB', uploadedAt: '20/04/2024', uploadedBy: 'GV. Nguyễn Văn C', downloads: 55 },
  { id: '4', name: 'Video hướng dẫn - JOIN trong SQL', type: 'video', subject: 'Cơ sở dữ liệu', size: '128 MB', uploadedAt: '22/04/2024', uploadedBy: 'GV. Nguyễn Văn C', downloads: 61 },
  { id: '5', name: 'Tài liệu Firewall & Network Security', type: 'pdf', subject: 'An toàn mạng', size: '3.7 MB', uploadedAt: '23/04/2024', uploadedBy: 'GV. Phạm Minh D', downloads: 29 },
  { id: '6', name: 'Flutter Basics - Getting Started', type: 'slide', subject: 'Phát triển ứng dụng di động', size: '4.2 MB', uploadedAt: '24/04/2024', uploadedBy: 'GV. Lê Hoàng E', downloads: 47 },
];

const typeConfig = {
  pdf: { icon: 'picture_as_pdf', color: 'text-red-500 bg-red-50', label: 'PDF' },
  video: { icon: 'play_circle', color: 'text-blue-500 bg-blue-50', label: 'Video' },
  doc: { icon: 'description', color: 'text-green-500 bg-green-50', label: 'Tài liệu' },
  slide: { icon: 'slideshow', color: 'text-orange-500 bg-orange-50', label: 'Slides' },
};

export function MaterialsPage() {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'lecturer' || user?.role === 'teacher' || user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState('');

  const subjects = ['all', ...Array.from(new Set(mockMaterials.map(m => m.subject)))];

  const filtered = mockMaterials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || m.subject === filterSubject;
    const matchType = filterType === 'all' || m.type === filterType;
    return matchSearch && matchSubject && matchType;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-1">Tài liệu học tập</h1>
          <p className="text-on-surface-variant">
            {isTeacher
              ? 'Quản lý và chia sẻ tài liệu cho sinh viên'
              : 'Tài liệu từ giảng viên của bạn'}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => showToast('Tính năng upload đang được phát triển')}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">upload</span>
            Tải lên tài liệu
          </button>
        )}
      </div>

      {/* Stats (teacher view) */}
      {isTeacher && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng tài liệu', value: mockMaterials.length, icon: 'folder', color: 'text-primary bg-primary/10' },
            { label: 'Lượt tải', value: mockMaterials.reduce((s, m) => s + m.downloads, 0), icon: 'download', color: 'text-green-600 bg-green-50' },
            { label: 'Môn học', value: subjects.length - 1, icon: 'school', color: 'text-orange-500 bg-orange-50' },
            { label: 'Tuần này', value: 3, icon: 'calendar_today', color: 'text-blue-500 bg-blue-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <span className={`material-symbols-outlined p-2 rounded-lg ${stat.color}`}>{stat.icon}</span>
              <div>
                <p className="text-on-surface-variant text-xs">{stat.label}</p>
                <p className="text-xl font-bold text-on-surface">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50 text-lg">search</span>
          <input
            type="text"
            placeholder="Tìm tài liệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả môn học</option>
          {subjects.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả loại</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="slide">Slides</option>
          <option value="doc">Tài liệu</option>
        </select>
      </div>

      {/* Material List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">folder_open</span>
          <p>Không tìm thấy tài liệu phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(material => {
            const cfg = typeConfig[material.type];
            return (
              <div
                key={material.id}
                className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start"
              >
                <div className={`p-3 rounded-xl ${cfg.color} flex-shrink-0`}>
                  <span className="material-symbols-outlined text-2xl">{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-on-surface truncate">{material.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">{material.subject}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-outline">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {material.uploadedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">data_usage</span>
                      {material.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">download</span>
                      {material.downloads} lượt
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Bởi {material.uploadedBy}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => showToast(`Đang tải xuống "${material.name}"...`)}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Tải xuống"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                  </button>
                  {isTeacher && (
                    <button
                      onClick={() => showToast('Tính năng xóa đang được phát triển')}
                      className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
