import { useState } from 'react';

const mockTeacherData = {
  name: 'TS. Nguyễn Văn A',
  department: 'Khoa Công nghệ Thông tin',
  title: 'Giảng viên chính',
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
];

const mockGradingTasks = [
  { id: 1, title: 'Bài luận cuối kỳ - Nhóm 4', urgent: true },
  { id: 2, title: 'Thực hành Java - Tuần 8', urgent: false },
  { id: 3, title: 'Quiz Chương 5', urgent: false },
];

export default function TeacherDashboardV2() {
  const [stats] = useState({
    classes: 4,
    students: 105,
    avgGpa: 3.65,
  });

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
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-blue-100 rounded-lg text-blue-600 material-symbols-outlined">school</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.classes}</p>
          <p className="text-xs text-gray-500">Lớp học đang dạy</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-green-100 rounded-lg text-green-600 material-symbols-outlined">group</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
          <p className="text-xs text-gray-500">Tổng sinh viên</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-teal-100 rounded-lg text-teal-600 material-symbols-outlined">trending_up</span>
            <span className="text-xs font-medium text-teal-600">Tăng 0.2</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgGpa}</p>
          <p className="text-xs text-gray-500">GPA Trung bình</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-purple-100 rounded-lg text-purple-600 material-symbols-outlined">assignment</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
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
                <div className={`h-32 ${cls.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'} relative`}>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                      {cls.code}
                    </span>
                    <h4 className="font-bold text-lg mt-1">{cls.name}</h4>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-[10px] font-bold">
                        +{cls.students - 2}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Tiến độ</p>
                      <p className="text-sm font-bold text-teal-600">{cls.progress}%</p>
                    </div>
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
            <div className="space-y-4">
              {mockGradingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-red-500' : 'bg-blue-300'}`}></div>
                    <p className="text-xs font-semibold">{task.title}</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-purple-600">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-600 hover:text-white transition-all">
              Phân tích chuyên sâu
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-900">Bạn</span> đã cập nhật tài liệu <span className="text-blue-600">AI202</span> • 2 giờ trước
                </p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></div>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-900">AI Copilot</span> đã hoàn thành chấm nháp <span className="text-purple-600">12 bài tập</span> • 5 giờ trước
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}