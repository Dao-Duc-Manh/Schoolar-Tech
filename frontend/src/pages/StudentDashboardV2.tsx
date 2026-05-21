import { useState } from 'react';


const mockTasks = [
  { id: 1, title: 'Nộp Báo cáo Thí nghiệm', subject: 'Cơ học Lượng tử', due: 'Hết hạn hôm nay', urgent: true },
  { id: 2, title: 'Bài tập Đọc', subject: 'Đạo đức trong AI', due: 'Còn 2 ngày', urgent: false },
  { id: 3, title: 'Ôn tập Giữa kỳ', subject: 'Đại số Tuyến tính', due: 'Còn 5 ngày', urgent: false },
];


const mockCourses = [
  {
    id: 1,
    title: 'Vật lý Lượng tử Nâng cao',
    instructor: 'GS. Elena Vance',
    category: 'Khoa học Khó',
    progress: 64,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIaIZtlitSSde52FoPQTnaHXFNQ6FkIDnYKeXZ5u7SKMh6RIdvQmE5tLvmYtc3pMUu10dXc7Txzi_J-xqy33kiQZrBan9-3h4AEGoPPylXKgY7vr8cMvwVxL0eJlJrR3_Pwxg5aC2uw7iuU-XrD0Dppf7aRwYdwsgR_AFIRbvJZJCMIxNNMNxrkQI7Y9BPvV-rV-a48CMLaPdQnuS9sqiMsSRURArzdqqGL36u7qsruUxUjaIwjW2lp-yNoAskY124jNOEEnoqtEY',
  },
  {
    id: 2,
    title: 'Đạo đức trong AI',
    instructor: 'TS. Nguyễn Thị Mai',
    category: 'Công nghệ',
    progress: 45,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB21RUzUITmRi9WB4T6nUcoSuBzCzUdBC1xmDOX_ej02qKHEo5oQwqnTMk3GflUszDNzLNFtMG2d3UV2vHklmLO6-q81EO4hR9rIDuGRVXpKwKKekuXPlrJqF6ApfSkO4y2u9PhLKRxv_t3AwAoIt4VeRI3PUIRQ2v2iJVMN0I8CmxDSjBRy6iXNDp9r0HZMB79BbWNqck_LxCf7vuQjuELvm688bSbFg9EdhD3Q89IO26UvejSPIBU8Ukj1qElMlmKMwL8PIl9se8',
  },
  {
    id: 3,
    title: 'Đại số Tuyến tính',
    instructor: 'PGS. Trần Văn B',
    category: 'Toán học',
    progress: 78,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj6bPnzU4r8vH2mL1nK5oP7qR9sT4uV6wX0yZ8aB3cD5eF7gH9iJ1kL2nM4oP6qR8sT0uV2wX4yZ6aB8cD0eF2gH4iJ6kL8nM0oP2qR4sT6uV8wX',
  },
];

export default function StudentDashboardV2() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="Tìm khóa học, tài liệu, hoặc sự giúp đỡ từ AI..."
            type="text"
          />
        </div>
        <nav className="hidden lg:flex items-center gap-6">
          <a className="text-blue-700 font-bold border-b-2 border-blue-700 pb-1 text-sm" href="/student-dashboard-v2">Bảng điều khiển</a>
          <a className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors" href="/materials">Khóa học</a>
          <a className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors" href="/materials">Thư viện</a>
          <a className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors" href="/student-dashboard">Phòng học</a>
        </nav>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Advisor Section */}
        <div className="md:col-span-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <span className="material-symbols-outlined text-teal-300">auto_awesome</span>
              </div>
              <span className="font-bold text-lg">Thông tin từ Cố vấn AI</span>
            </div>
            <h3 className="text-3xl font-bold mb-4 leading-tight">
              "Dựa trên bài kiểm tra trước, bạn nên tập trung vào Tính lưỡng tính Sóng-Hạt."
            </h3>
            <p className="text-blue-100 mb-8 max-w-xl">
              Tôi nhận thấy bạn dành nhiều thời gian hơn 20% cho các phòng thí nghiệm trực quan. Tôi đã tuyển chọn 3 mô phỏng tương tác để giúp bạn nắm vững các chủ đề bài giảng tuần tới.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAIChat(true)}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Bắt đầu Lộ trình Gợi ý
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-sm border border-white/20 hover:bg-white/20 transition-all">
                Xem Phân tích
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity hidden lg:block">
            <span className="material-symbols-outlined text-[180px]">psychology</span>
          </div>
        </div>

        {/* Tasks Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm flex-1 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-lg">Nhiệm vụ sắp tới</h4>
              <span className="text-blue-600 text-xs font-bold cursor-pointer hover:underline">Xem tất cả</span>
            </div>
            <div className="space-y-4">
              {mockTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    task.urgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined">
                      {task.urgent ? 'event_busy' : 'menu_book'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.subject} • {task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-2xl tracking-tight">Lộ trình Học tập Hiện tại</h4>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-2 shadow-sm hover:shadow-xl transition-shadow group border border-gray-100"
            >

              <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                <img
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={course.image}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase">
                  {course.category}
                </div>
              </div>
              <div className="px-4 pb-6">
                <h5 className="font-bold text-lg mb-1">{course.title}</h5>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span> {course.instructor}
                </p>
                <div className="space-y-3 mb-6 bg-blue-50 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Tiến độ học tập</span>
                    <span className="text-lg font-black text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-sm">
                    <div className="bg-blue-600 h-full rounded-full shadow-[0_0_8px_rgba(0,86,210,0.3)]" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">Đã lưu từ phiên học trước</p>
                </div>
                <a
                  href="/student/learning"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  Làm bài tập ngay
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chat Modal (simplified) */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-end p-6">
          <div className="bg-white rounded-3xl w-full max-w-md h-[600px] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <div>
                  <p className="font-bold text-white">AI Assistant</p>
                  <p className="text-xs text-white/80">Always ready to help</p>
                </div>
              </div>
              <button onClick={() => setShowAIChat(false)} className="text-white hover:bg-white/20 p-2 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
              <div className="bg-blue-50 p-3 rounded-2xl rounded-tl-none mb-4">
                <p className="text-sm">Chào bạn! Tôi là trợ lý AI của bạn. Bạn cần hỗ trợ gì hôm nay?</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500"
                />
                <button className="bg-blue-600 text-white p-2 rounded-full">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}