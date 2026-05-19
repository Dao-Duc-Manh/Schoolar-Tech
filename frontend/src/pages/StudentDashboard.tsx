import { useState } from 'react';

// Mock data
const studentData = {
  name: 'Trần Hoàng Nam',
  studentId: '20225023',
  major: 'Công nghệ Thông tin',
  year: 3,
  gpa: 3.65,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA39kQ4s-KCv6cw_jjkDr5CtJG6SguWT6njdQBfHdd7j5Rwf_dYv91_DQSVyiBFsCmF5moPHoVM1YE6xFjJYIROCy3H_nCzkwpc59e1d1M5qABgd8NaGzjV67D7ezGiWwiKCGCuqUwWmwNVu2psmoZ5Y7c5FuHJfxHRgZr4j-0iv9hgA5Vg_qgb6zKVL1154wgFXbWbjDBiPud4p3m-VK5L8r1_saTh0K6rV0VlUeRDhCNvMAqEnnaCVT22doeZpECIsfUBqqIJCsw',
};

const courses = [
  {
    id: 1,
    name: 'Lập trình Web nâng cao',
    code: 'CSW301',
    progress: 75,
    nextLesson: 'React Hooks',
    due: 'Hôm nay',
    color: 'blue',
  },
  {
    id: 2,
    name: 'Cơ sở dữ liệu',
    code: 'DBA301',
    progress: 60,
    nextLesson: 'SQL Performance',
    due: 'Ngày mai',
    color: 'green',
  },
  {
    id: 3,
    name: 'An toàn mạng máy tính',
    code: 'NET301',
    progress: 45,
    nextLesson: 'Firewall',
    due: '25/04',
    color: 'red',
  },
  {
    id: 4,
    name: 'Phát triển ứng dụng di động',
    code: 'MOB301',
    progress: 30,
    nextLesson: 'Flutter Basics',
    due: '28/04',
    color: 'purple',
  },
];

const upcomingdeadlines = [
  {
    id: 1,
    title: 'Báo cáo cuối kỳ',
    course: 'Lập trình Web',
    dueDate: '23/04/2024',
    daysLeft: 2,
  },
  {
    id: 2,
    title: 'Thi cuối kỳ',
    course: 'Cơ sở dữ liệu',
    dueDate: '25/04/2024',
    daysLeft: 4,
  },
  {
    id: 3,
    title: 'Bài tập lớn',
    course: 'An toàn mạng',
    dueDate: '28/04/2024',
    daysLeft: 7,
  },
];

const activities = [
  {
    id: 1,
    type: 'achievement',
    title: 'Hoàn thành 10 bài học liên tiếp',
    time: '2 giờ trước',
  },
  {
    id: 2,
    type: 'message',
    from: 'Th.S. Nguyễn Văn A',
    title: 'Đã chấm bài tập tuần 12',
    time: '5 giờ trước',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Nhắc nhở: Nộp báo cáo Web',
    time: 'Hôm nay',
  },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600';
      case 'green':
        return 'bg-green-600';
      case 'red':
        return 'bg-red-600';
      case 'purple':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src={studentData.avatar}
                alt={studentData.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {studentData.name}
                </h1>
                <p className="text-gray-500">
                  {studentData.major} • Năm {studentData.year} • GPA:{' '}
                  <span className="font-bold text-green-600">
                    {studentData.gpa.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="material-symbols-outlined text-gray-600">
                  notifications
                </span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <span className="material-symbols-outlined text-gray-600">
                  settings
                </span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <span className="material-symbols-outlined text-blue-600">
                school
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">4</p>
              <p className="text-xs text-gray-500">Môn học đang học</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">28</p>
              <p className="text-xs text-gray-500">Bài đã hoàn thành</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <span className="material-symbols-outlined text-purple-600">
                emoji_events
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
              <p className="text-xs text-gray-500">Điểm tích lũy</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl">
              <span className="material-symbols-outlined text-orange-600">
                schedule
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
              <p className="text-xs text-gray-500">Deadline sắp tới</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Khóa học
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lịch học
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Courses List */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1 h-12 rounded-full ${getColorClass(
                        course.color
                      )}`}
                    ></div>
                    <div>
                      <h3 className="font-bold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{course.due}</span>
                </div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">{course.nextLesson}</span>
                  <span className="font-medium text-gray-900">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getColorClass(course.color)} rounded-full`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Deadlines */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">
                  alarm
                </span>
                Deadline sắp tới
              </h3>
              <div className="space-y-3">
                {upcomingdeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-500">{deadline.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {deadline.dueDate}
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          deadline.daysLeft <= 2
                            ? 'text-red-600'
                            : deadline.daysLeft <= 4
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {deadline.daysLeft} ngày
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">
                  history
                </span>
                Hoạt động gần đây
              </h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-gray-600">
                        {activity.type === 'achievement'
                          ? 'emoji_events'
                          : activity.type === 'message'
                          ? 'mail'
                          : 'notifications'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined">psychology</span>
                  <span className="font-bold">Trợ lý AI</span>
                </div>
                <p className="text-sm text-purple-100 mb-4">
                  Bạn cần hỗ trợ gì hôm nay? Tôi có thể giúp bạn lập kế hoạch học tập,
                  giải đáp thắc mắc về bài giảng.
                </p>
                <button className="w-full bg-white text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  Bắt đầu chat
                </button>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-8 text-8xl opacity-20">
                auto_awesome
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}