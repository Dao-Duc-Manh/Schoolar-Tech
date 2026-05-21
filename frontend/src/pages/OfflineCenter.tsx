import { useState } from 'react';

const initialDownloads = [
  { id: 1, name: 'Kiến trúc Bền vững',     type: 'video',    size: '1.2 GB', progress: 100, status: 'completed' },
  { id: 2, name: 'Toán cao cấp - Chương 5', type: 'document', size: '45 MB',  progress: 45,  status: 'downloading' },
  { id: 3, name: 'Vật lý đại cương',        type: 'video',    size: '890 MB', progress: 0,   status: 'pending' },
  { id: 4, name: 'Tài liệu tham khảo SQL',  type: 'document', size: '12 MB',  progress: 0,   status: 'pending' },
];

const initialCurriculum = [
  { id: 1, name: 'Lập trình Python',    lessons: 24, size: '2.4 GB', downloaded: true },
  { id: 2, name: 'Cơ sở dữ liệu',      lessons: 18, size: '1.8 GB', downloaded: true },
  { id: 3, name: 'Mạng máy tính',       lessons: 20, size: '2.1 GB', downloaded: false },
  { id: 4, name: 'Trí tuệ nhân tạo',   lessons: 30, size: '3.2 GB', downloaded: false },
];

export default function OfflineCenter() {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [curriculum, setCurriculum] = useState(initialCurriculum);
  const [storageUsed, setStorageUsed] = useState(12.4);
  const storageTotal = 64;

  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; icon: string; color: string } | null>(null);

  const showToast = (msg: string, icon = 'check_circle', color = 'bg-teal-600') => {
    setToast({ msg, icon, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Tải xuống khoá học
  const handleDownloadCourse = (id: number, name: string, size: string) => {
    setCurriculum(prev => prev.map(c => c.id === id ? { ...c, downloaded: true } : c));
    const gb = parseFloat(size);
    setStorageUsed(prev => Math.min(storageTotal, +(prev + gb).toFixed(1)));
    showToast(`Đã tải xuống "${name}"`);
  };

  // Tải ngay banner
  const handleDownloadNew = () => {
    setDownloads(prev => prev.map(d =>
      d.id === 3 ? { ...d, status: 'downloading', progress: 0 } : d
    ));
    showToast('Bắt đầu tải "Vật lý đại cương"...', 'download', 'bg-blue-600');
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setDownloads(prev => prev.map(d =>
        d.id === 3
          ? prog >= 100
            ? { ...d, status: 'completed', progress: 100 }
            : { ...d, progress: prog }
          : d
      ));
      if (prog >= 100) {
        clearInterval(interval);
        setStorageUsed(prev => +(prev + 0.89).toFixed(2));
        showToast('Đã tải xong "Vật lý đại cương"!');
      }
    }, 600);
  };

  // Đồng bộ
  const handleSync = () => {
    setSyncing(true);
    showToast('Đang đồng bộ nội dung mới...', 'sync', 'bg-blue-600');
    setTimeout(() => {
      setSyncing(false);
      showToast('Đồng bộ hoàn tất!');
    }, 2500);
  };

  // Bật/tắt offline mode
  const handleToggleOffline = () => {
    const next = !offlineMode;
    setOfflineMode(next);
    showToast(
      next ? 'Đã bật chế độ Offline — dữ liệu di động được tiết kiệm.' : 'Đã tắt chế độ Offline.',
      next ? 'wifi_off' : 'wifi',
      next ? 'bg-gray-700' : 'bg-blue-600'
    );
  };

  // Dọn dẹp bộ nhớ
  const handleCleanup = () => {
    const freed = 4.2;
    setStorageUsed(prev => +(Math.max(0, prev - freed)).toFixed(1));
    showToast(`Đã giải phóng ${freed} GB bộ nhớ.`, 'delete_sweep', 'bg-purple-600');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-24">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white text-sm font-semibold transition-all ${toast.color}`}>
          <span className={`material-symbols-outlined text-base ${toast.icon === 'sync' && syncing ? 'animate-spin' : ''}`}>{toast.icon}</span>
          {toast.msg}
        </div>
      )}

      {/* Notification Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600">notifications_active</span>
          <div>
            <p className="font-bold text-sm text-blue-600">Nội dung mới sẵn sàng</p>
            <p className="text-xs text-gray-500">Bài giảng mới về 'Kiến trúc Bền vững' đã sẵn sàng để tải xuống.</p>
          </div>
        </div>
        <button
          onClick={handleDownloadNew}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider whitespace-nowrap underline underline-offset-2"
        >
          Tải ngay
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Offline Center</h1>
          <p className="text-gray-500 max-w-lg text-sm">
            Quản lý tải xuống và đồng bộ chương trình học. Tiếp tục học kể cả khi không có internet.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>
            {syncing ? 'sync' : 'add_circle'}
          </span>
          {syncing ? 'Đang đồng bộ...' : 'Tải xuống mới'}
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
                <span className="text-gray-500">Đã dùng</span>
                <span className="text-blue-600 font-bold">{storageUsed} GB / {storageTotal} GB</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${storageUsed / storageTotal > 0.8 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                ></div>
              </div>
              {storageUsed / storageTotal > 0.8 && (
                <p className="text-xs text-red-500 font-medium">⚠️ Bộ nhớ sắp đầy. Hãy dọn dẹp bớt.</p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Videos</p>
                  <p className="text-lg font-bold text-gray-900">8.2 GB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Resources</p>
                  <p className="text-lg font-bold text-gray-900">{(storageUsed - 8.2).toFixed(1)} GB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Trạng thái Đồng bộ</h3>
            <div className="space-y-3">
              {downloads.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    item.status === 'completed'   ? 'bg-teal-50' :
                    item.status === 'downloading' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <span className={`material-symbols-outlined ${
                    item.status === 'completed'   ? 'text-teal-600' :
                    item.status === 'downloading' ? 'text-blue-600 animate-pulse' : 'text-gray-400'
                  }`}>
                    {item.status === 'completed' ? 'check_circle' : item.status === 'downloading' ? 'sync' : 'schedule'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    {item.status === 'downloading' ? (
                      <div className="mt-1.5">
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                        </div>
                        <p className="text-[10px] text-blue-600 mt-1 font-medium">{item.progress}%</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {item.status === 'completed' ? `✓ ${item.size}` : item.size}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curriculum + Quick Actions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg">Chương trình học có sẵn</h3>
              <p className="text-sm text-gray-500">Nhấn "Tải xuống" để học offline khi không có internet</p>
            </div>
            <div className="divide-y divide-gray-100">
              {curriculum.map(course => (
                <div key={course.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${course.downloaded ? 'bg-teal-100' : 'bg-gray-100'}`}>
                      <span className={`material-symbols-outlined ${course.downloaded ? 'text-teal-600' : 'text-gray-400'}`}>
                        {course.downloaded ? 'check_circle' : 'video_library'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{course.name}</h4>
                      <p className="text-sm text-gray-500">{course.lessons} bài học • {course.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !course.downloaded && handleDownloadCourse(course.id, course.name, course.size)}
                    disabled={course.downloaded}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
                      course.downloaded
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {course.downloaded ? 'Đã tải' : 'Tải xuống'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleToggleOffline}
              className={`p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-95 ${
                offlineMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <span className={`material-symbols-outlined mb-2 block ${offlineMode ? 'text-white' : 'text-blue-600'}`}>
                {offlineMode ? 'wifi_off' : 'wifi'}
              </span>
              <p className={`font-bold ${offlineMode ? 'text-white' : 'text-gray-900'}`}>
                Chế độ Offline
              </p>
              <p className={`text-xs mt-0.5 ${offlineMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {offlineMode ? 'Đang bật — tiết kiệm dữ liệu' : 'Bật để tiết kiệm dữ liệu'}
              </p>
            </button>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all text-left active:scale-95 disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-teal-600 mb-2 block ${syncing ? 'animate-spin' : ''}`}>sync</span>
              <p className="font-bold text-gray-900">Đồng bộ ngay</p>
              <p className="text-xs text-gray-500 mt-0.5">{syncing ? 'Đang đồng bộ...' : 'Cập nhật nội dung mới'}</p>
            </button>

            <button
              onClick={handleCleanup}
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all text-left active:scale-95"
            >
              <span className="material-symbols-outlined text-purple-600 mb-2 block">delete_sweep</span>
              <p className="font-bold text-gray-900">Dọn dẹp</p>
              <p className="text-xs text-gray-500 mt-0.5">Giải phóng ~4.2 GB bộ nhớ</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
