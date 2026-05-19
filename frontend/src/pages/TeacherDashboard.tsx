import { useState } from 'react';

const mockTeacherData = {
  name: 'TS. Nguyễn Văn A',
  department: 'Khoa Công nghệ Thông tin',
  title: 'Giảng viên chính',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClOfYntBo3z4xzg0Be1Lh0QEsXs8mXzmQr6YBnJy1gdlfyG2z_cHRgaWXPvpJH9aU-fE-7oMKI5lrfui6E7URf1Qki4p9pN90MhaDPguG8EEW_psixya5EDVezTvkE99OzLxhLVObQiETSXpjy3P_6IqaSGg3sRc0b3fvrA2UtCH5KZmBOYrEkh9hfkPZ5uTFfNbSlnPhh7dWbmUCb0SnxIFV3blSvAjroKHCGXxDDwKE0y2VHAs2Uxtsp8XwtPUSiKLGCMiQn3GU',
};

const mockClasses = [
  {
    id: 1,
    code: 'CS101',
    name: 'Lập trình cơ bản',
    progress: 65,
    students: 35,
    color: 'blue',
  },
  {
    id: 2,
    code: 'AI202',
    name: 'Trí tuệ nhân tạo',
    progress: 42,
    students: 20,
    color: 'purple',
  },
  {
    id: 3,
    code: 'DB301',
    name: 'Cơ sở dữ liệu',
    progress: 78,
    students: 28,
    color: 'green',
  },
  {
    id: 4,
    code: 'NET201',
    name: 'Mạng máy tính',
    progress: 55,
    students: 22,
    color: 'red',
  },
];

const mockGradingTasks = [
  { id: 1, title: 'Bài luận cuối kỳ - Nhóm 4', urgent: true },
  { id: 2, title: 'Thực hành Java - Tuần 8', urgent: false },
  { id: 3, title: 'Kiểm tra 15p - Giải thuật', urgent: false },
];

const mockActivities = [
  { id: 1, user: 'Bạn', action: 'đã cập nhật tài liệu', target: 'AI202', time: '2 giờ trước' },
  { id: 2, user: 'AI Copilot', action: 'đã hoàn thành chấm nháp', target: '12 bài tập', time: '5 giờ trước' },
];

export default function TeacherDashboard() {
  const [stats] = useState({
    classes: 4,
    students: 105,
    avgGpa: 3.65,
  });

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600';
      case 'purple':
        return 'bg-purple-600';
      case 'green':
        return 'bg-green-600';
      case 'red':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Giảng viên</h1>
          <p className="text-gray-500">Chào mừng, {mockTeacherData.name}</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          + Tạo lớp mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-blue-600">school</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.classes}</p>
          <p className="text-xs text-gray-500">Lớp học đang dạy</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-green-600">group</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.students}</p>
          <p className="text-xs text-gray-500">Tổng sinh viên</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-teal-600">trending_up</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgGpa}</p>
          <p className="text-xs text-gray-500">GPA Trung bình</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-purple-600">assignment</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          <p className="text-xs text-gray-500">Cần chấm điểm</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Danh sách lớp học hiện tại</h2>
            <button className="text-blue-600 font-bold text-sm hover:underline">Xem tất cả</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl"
              >
                <div className={`h-32 ${getColorClass(cls.color)} relative`}>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                      {cls.code}
                    </span>
                    <h4 className="font-bold text-lg mt-1">{cls.name}</h4>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-gray-500">{cls.students} sinh viên</div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Tiến độ</p>
                      <p className="text-sm font-bold text-teal-600">{cls.progress}%</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full ${getColorClass(cls.color)} rounded-full`}
                      style={{ width: `${cls.progress}%` }}
                    ></div>
                  </div>
                  <button className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                    Quản lý lớp học
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-purple-50/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-purple-600">psychology</span>
              <h2 className="text-lg font-bold">AI Copilot Insights</h2>
            </div>
            <div className="space-y-6">
              {/* Mood Analysis */}
              <div className="bg-white/40 p-4 rounded-xl">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">
                  Tâm trạng lớp học
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <span className="material-symbols-outlined">sentiment_very_satisfied</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Tích cực (88%)</p>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Hầu hết sinh viên đang rất hào hứng với bài Lab 04 vừa qua.
                    </p>
                  </div>
                </div>
              </div>
              {/* Grading Suggestions */}
              <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">
                  Gợi ý chấm điểm
                </p>
                <div className="space-y-3">
                  {mockGradingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.urgent ? 'bg-red-500' : 'bg-blue-200'
                          }`}
                        ></div>
                        <p className="text-xs font-semibold">{task.title}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-blue-600">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-600 hover:text-white transition-all">
              Phân tích chuyên sâu
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-gray-900">{activity.user}</span> {activity.action}{' '}
                    <span className="text-blue-600">{activity.target}</span> • {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}