import { useState } from 'react';

const mockGradingTasks = {
  pending: 8,
  aiConfidence: 94,
  timeSaved: '~4.5 Giờ',
};

const mockPsychologyData = [
  { label: 'Hứng thú cao', value: '64%', type: 'positive' },
  { label: 'Nguy cơ Burnout', value: '12%', type: 'warning' },
  { label: 'Tương tác nhóm', value: 'TĂNG 18%', type: 'positive' },
];

const mockDeadlines = [
  { date: 'OCT', day: 24, title: 'Hạn chót chấm điểm Portfolio', remaining: '12 Đồ án còn lại' },
  { date: 'OCT', day: 28, title: 'Nộp điểm cuối kỳ', remaining: 'Chỉ còn 4 ngày' },
  { date: 'NOV', day: 2, title: 'Họp phụ huynh', remaining: 'Online meeting' },
];

export default function TeacherComprehensive() {
  const [stats] = useState({
    classes: 4,
    students: 105,
    avgGpa: 3.65,
  });

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển Giảng viên Toàn diện</h1>
          <p className="text-gray-500">Tổng quan hoạt động giảng dạy và quản lý lớp học</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          + Tạo lớp mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <p className="text-2xl font-bold text-gray-900 mt-2">{mockGradingTasks.pending}</p>
          <p className="text-xs text-gray-500">Đồ án chờ chấm</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* AI Grading Assistant */}
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-purple-600">magic_button</span>
            <h3 className="text-xl font-bold">Trợ lý Chấm điểm AI</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <p className="text-gray-600 mb-6 text-lg">
                Bạn có <span className="font-bold text-gray-900">{mockGradingTasks.pending} đồ án</span> chưa được chấm điểm. AI đã hoàn thành bản thảo nhận xét và dự kiến điểm số cho toàn bộ lớp.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Độ tin cậy AI</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-[94%] h-full bg-purple-500"></div>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{mockGradingTasks.aiConfidence}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Thời gian tiết kiệm</p>
                  <p className="text-lg font-bold text-teal-600">{mockGradingTasks.timeSaved}</p>
                </div>
              </div>
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-transform flex items-center gap-3">
                <span className="material-symbols-outlined">magic_button</span>
                Áp dụng phản hồi AI
              </button>
            </div>
            <div className="w-full md:w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center p-6 border border-gray-200">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-gray-900">{mockGradingTasks.pending}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-tighter">Đồ án chờ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Psychology Panel */}
        <div className="col-span-12 lg:col-span-4 bg-purple-50/50 backdrop-blur-sm rounded-xl p-8 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-purple-600">psychology</span>
            <h3 className="text-xl font-bold">Tâm lý & Tương tác</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Phân tích hành vi dựa trên tần suất nộp bài, thảo luận diễn đàn và thời gian đọc tài liệu.
          </p>
          <div className="space-y-4">
            {mockPsychologyData.map((item, index) => (
              <div key={index} className="bg-white/60 p-4 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                  item.type === 'positive' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.value} SINH VIÊN
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-4xl">analytics</span>
            </div>
          </div>
        </div>

        {/* Deadlines */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Lịch trình sắp tới</h3>
            <span className="material-symbols-outlined text-gray-400">calendar_today</span>
          </div>
          <div className="space-y-4">
            {mockDeadlines.map((deadline, index) => (
              <div key={index} className="flex gap-4 items-start p-3 hover:bg-gray-50 transition-colors rounded-lg group cursor-pointer">
                <div className="w-12 h-12 rounded bg-blue-50 flex flex-col items-center justify-center border border-blue-100 shrink-0">
                  <span className="text-xs font-bold text-blue-600">{deadline.date}</span>
                  <span className="text-lg font-bold text-gray-900">{deadline.day}</span>
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight group-hover:text-blue-600 transition-colors">{deadline.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{deadline.remaining}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}