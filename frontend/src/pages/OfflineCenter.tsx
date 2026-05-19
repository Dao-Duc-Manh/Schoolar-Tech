import { useState } from 'react';

const mockDownloads = [
  { id: 1, name: 'Kiến trúc Bền vững', type: 'video', size: '1.2 GB', progress: 100, status: 'completed' },
  { id: 2, name: 'Toán cao cấp - Chương 5', type: 'document', size: '45 MB', progress: 45, status: 'downloading' },
  { id: 3, name: 'Vật lý đại cương', type: 'video', size: '890 MB', progress: 0, status: 'pending' },
  { id: 4, name: 'Tài liệu tham khảo SQL', type: 'document', size: '12 MB', progress: 0, status: 'pending' },
];

const mockCurriculum = [
  { id: 1, name: 'Lập trình Python', lessons: 24, size: '2.4 GB', downloaded: true },
  { id: 2, name: 'Cơ sở dữ liệu', lessons: 18, size: '1.8 GB', downloaded: true },
  { id: 3, name: 'Mạng máy tính', lessons: 20, size: '2.1 GB', downloaded: false },
  { id: 4, name: 'Trí tuệ nhân tạo', lessons: 30, size: '3.2 GB', downloaded: false },
];

export default function OfflineCenter() {
  const [downloads] = useState(mockDownloads);
  const [storageUsed] = useState(12.4);
  const [storageTotal] = useState(64);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Notification Banner */}
      <div className="mb-8 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600">notifications_active</span>
          <div>
            <p className="font-bold text-sm text-blue-600">Nội dung mới sẵn sàng</p>
            <p className="text-xs text-gray-500">Bài giảng mới về 'Kiến trúc Bền vững' đã sẵn sàng để tải xuống.</p>
          </div>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
          Tải ngay
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Offline Center</h1>
          <p className="text-gray-500 max-w-lg">
            Manage your curriculum downloads and synchronization. Keep learning even without an internet connection.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          Tải xuống mới
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Storage Management */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Quản lý Bộ nhớ</h3>
              <span className="material-symbols-outlined text-blue-600">storage</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Storage Used</span>
                <span className="text-blue-600 font-bold">{storageUsed} GB / {storageTotal} GB</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(storageUsed / storageTotal) * 100}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Videos</p>
                  <p className="text-lg font-bold text-gray-900">8.2 GB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Resources</p>
                  <p className="text-lg font-bold text-gray-900">4.2 GB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Trạng thái Đồng bộ</h3>
            <div className="space-y-4">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    item.status === 'completed'
                      ? 'bg-teal-50'
                      : item.status === 'downloading'
                      ? 'bg-blue-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      item.status === 'completed'
                        ? 'text-teal-600'
                        : item.status === 'downloading'
                        ? 'text-blue-600 animate-pulse'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.status === 'completed'
                      ? 'check_circle'
                      : item.status === 'downloading'
                      ? 'sync'
                      : 'schedule'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    {item.status === 'downloading' ? (
                      <div className="mt-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {item.status === 'completed' ? `Hoàn thành: ${item.size}` : item.size}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg">Chương trình học có sẵn</h3>
              <p className="text-sm text-gray-500">Danh sách khóa học có thể tải xuống</p>
            </div>
            <div className="divide-y divide-gray-100">
              {mockCurriculum.map((course) => (
                <div key={course.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      course.downloaded ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        course.downloaded ? 'text-teal-600' : 'text-gray-400'
                      }`}>
                        {course.downloaded ? 'check_circle' : 'video_library'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{course.name}</h4>
                      <p className="text-sm text-gray-500">{course.lessons} bài học • {course.size}</p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    course.downloaded
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {course.downloaded ? 'Đã tải' : 'Tải xuống'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left">
              <span className="material-symbols-outlined text-blue-600 mb-2">wifi_off</span>
              <p className="font-bold text-gray-900">Chế độ Offline</p>
              <p className="text-xs text-gray-500">Bật để tiết kiệm dữ liệu</p>
            </button>
            <button className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left">
              <span className="material-symbols-outlined text-teal-600 mb-2">sync</span>
              <p className="font-bold text-gray-900">Đồng bộ ngay</p>
              <p className="text-xs text-gray-500">Cập nhật nội dung mới</p>
            </button>
            <button className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left">
              <span className="material-symbols-outlined text-purple-600 mb-2">delete_sweep</span>
              <p className="font-bold text-gray-900">Dọn dẹp</p>
              <p className="text-xs text-gray-500">Giải phóng bộ nhớ</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}