import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useGenerateRoadmap } from '@/hooks/useGenerateRoadmap';
import { RoadmapPreviewModal } from '@/components/Roadmap/RoadmapPreviewModal';
import { Toast } from '@/components/Common/Toast';
import { ROADMAP_GENERATION_MOCK_REQUEST, type RoadmapGenerateResponse } from '@/types/roadmap';

// Types
interface Class {
  id: string;
  code: string;
  name: string;
  studentCount: number;
  progress: number;
  color: string;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const [classes] = useState<Class[]>([
    { id: '1', code: 'CS101', name: 'Lập trình cơ bản', studentCount: 35, progress: 65, color: 'primary' },
    { id: '2', code: 'AI202', name: 'Trí tuệ nhân tạo', studentCount: 28, progress: 42, color: 'secondary' },
    { id: '3', code: 'DB301', name: 'Cơ sở dữ liệu', studentCount: 32, progress: 78, color: 'tertiary' },
  ]);

  const [stats] = useState({
    totalClasses: 12,
    totalStudents: 458,
    pendingGrading: 24,
    averageGPA: 3.65,
  });

  const [aiInsights] = useState([
    { id: '1', type: 'mood', text: 'Hầu hết sinh viên đang rất hào hứng với bài Lab 04 vừa qua.', percentage: 88 },
    { id: '2', type: 'suggestion', text: 'Bài luận cuối kỳ - Nhóm 4', priority: 'high' },
    { id: '3', type: 'suggestion', text: 'Thực hành Java - Tuần 8', priority: 'medium' },
    { id: '4', type: 'suggestion', text: 'Kiểm tra 15p - Giải thuật', priority: 'medium' },
  ]);

  const [recentActivity] = useState([
    { id: '1', user: 'Bạn', action: 'đã cập nhật tài liệu cho lớp', target: 'AI202', time: '2 giờ trước', type: 'primary' },
    { id: '2', user: 'AI Copilot', action: 'đã hoàn thành chấm nháp 12 bài tập', target: '', time: '5 giờ trước', type: 'secondary' },
  ]);

  // Check if lecturer or student
  const isTeacher = user?.role === 'lecturer' || user?.role === 'admin';

  if (!isTeacher) {
    return <StudentDashboard />;
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">
          Chào mừng trở lại, {user?.fullName?.split(' ')[0] || 'GV'}
        </h1>
        <p className="text-on-surface-variant">Hôm nay là một ngày tuyệt vời để truyền cảm hứng. AI Copilot đã sẵn sàng hỗ trợ bạn.</p>
      </div>

      {/* Bento Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <span className="material-symbols-outlined">school</span>
            </span>
            <span className="text-xs font-medium text-tertiary-600">+2 lớp mới</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Số lớp đang dạy</p>
          <h3 className="text-2xl font-bold mt-1">{stats.totalClasses}</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </span>
            <span className="text-xs font-medium text-on-surface-variant">Tháng này</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Tổng sinh viên</p>
          <h3 className="text-2xl font-bold mt-1">{stats.totalStudents}</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-error-container text-error rounded-lg">
              <span className="material-symbols-outlined">assignment_late</span>
            </span>
            <span className="text-xs font-bold text-error">Ưu tiên</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Bài tập cần chấm</p>
          <h3 className="text-2xl font-bold mt-1">{stats.pendingGrading}</h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-none">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-tertiary-100 text-tertiary-600 rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </span>
            <span className="text-xs font-medium text-tertiary-600">Tăng 0.2</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">GPA Trung bình</p>
          <h3 className="text-2xl font-bold mt-1">{stats.averageGPA}</h3>
        </div>
      </div>

      {/* Dashboard Layout: Insights & Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Classes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Danh sách lớp học hiện tại</h2>
            <Link to="/classes" className="text-primary font-bold text-sm hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>

        {/* Right Column: AI Insights Panel */}
        <div className="space-y-6">
          {/* Glass Panel */}
          <div
            className="p-6 rounded-2xl border-none"
            style={{ background: 'rgba(117, 49, 255, 0.1)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
              <h2 className="text-lg font-bold text-on-surface tracking-tight">AI Copilot Insights</h2>
            </div>

            <div className="space-y-6">
              {/* Mood Analysis */}
              <div className="bg-white/40 p-4 rounded-xl">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Tâm trạng lớp học</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary-100 flex items-center justify-center text-tertiary-600">
                    <span className="material-symbols-outlined">sentiment_very_satisfied</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Tích cực ({aiInsights[0].percentage}%)</p>
                    <p className="text-[11px] text-on-surface-variant leading-tight">
                      {aiInsights[0].text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grading Suggestions */}
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                  Gợi ý chấm điểm
                </p>
                <div className="space-y-3">
                  {aiInsights.slice(1).map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-center justify-between p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            insight.priority === 'high' ? 'bg-error' : 'bg-primary-200'
                          }`}
                        ></div>
                        <p className="text-xs font-semibold">{insight.text}</p>
                      </div>
                      <span className="material-symbols-outlined text-sm text-outline group-hover:text-primary">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/semester-report')}
              className="w-full mt-8 py-3 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all"
            >
              Phân tích chuyên sâu
            </button>
          </div>

          {/* Faculty Quick Links */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex space-x-3">
                  <div
                    className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      activity.type === 'primary' ? 'bg-primary' : 'bg-primary-200'
                    }`}
                  ></div>
                  <p className="text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface">{activity.user}</span> {activity.action}{' '}
                    {activity.target && <span className="text-primary">{activity.target}</span>}{' '}
                    {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="group bg-secondary p-5 rounded-2xl shadow-xl shadow-secondary/40 text-white flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          onClick={() => document.getElementById('ai-chat')?.classList.toggle('hidden')}
        >
          <span
            className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
          <span className="font-bold pr-2 tracking-tight">Hỏi AI</span>
        </button>
      </div>
    </div>
  );
}

// Class Card Component
function ClassCard({ cls }: { cls: Class }) {
  return (
    <div className="bg-surface-container-lowest group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl cursor-pointer">
      <div
        className={`h-32 relative ${
          cls.color === 'primary'
            ? 'bg-primary-600'
            : cls.color === 'secondary'
            ? 'bg-secondary-600'
            : 'bg-tertiary-600'
        }`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container text-[10px] flex items-center justify-center font-bold text-on-surface-variant">
              +{cls.studentCount - 3}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase font-bold">Tiến độ</p>
            <p className="text-sm font-bold text-tertiary-600">{cls.progress}%</p>
          </div>
        </div>
        <Link
          to={`/classes/${cls.id}`}
          className="w-full py-2 bg-surface-container text-on-surface font-semibold rounded-lg hover:bg-primary hover:text-white transition-all block text-center"
        >
          Quản lý lớp học
        </Link>
      </div>
    </div>
  );
}

// Student Dashboard Component
function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { status, roadmap, message, isLoading, generate, retry, reset } = useGenerateRoadmap();
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);
  const [courses] = useState([
    {
      id: '1',
      name: 'Vật lý Lượng tử Nâng cao',
      instructor: 'GS. Elena Vance',
      progress: 64,
      category: 'Khoa học Khó',
      color: 'primary',
    },
    {
      id: '2',
      name: 'Đạo đức trong Trí tuệ Nhân tạo',
      instructor: 'TS. Marcus Thorne',
      progress: 92,
      category: 'Nhân văn & Công nghệ',
      color: 'secondary',
    },
    {
      id: '3',
      name: 'Đại số Tuyến tính Ứng dụng',
      instructor: 'GS. Sarah Chen',
      progress: 28,
      category: 'Nền tảng',
      color: 'tertiary',
    },
  ]);

  const [weeklyProgress] = useState([40, 70, 90, 60, 85, 30, 15]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'Sinh viên';

  const finalizeRoadmapAction = (response: RoadmapGenerateResponse | null) => {
    if (!response) {
      setToast({
        type: 'error',
        title: 'Không thể tạo lộ trình',
        description: 'Hệ thống gặp lỗi khi gọi gợi ý AI. Bạn có thể thử lại.',
      });
      return;
    }

    if (response.status === 'existing' && response.roadmap) {
      setIsRoadmapModalOpen(false);
      setToast({
        type: 'info',
        title: 'Đã mở lộ trình hiện có',
        description: response.message || 'Lộ trình đã tồn tại nên hệ thống chuyển bạn đến bản hiện tại.',
      });
      navigate('/roadmap/current');
      return;
    }

    if (response.status === 'success' && response.roadmap) {
      setToast({
        type: 'success',
        title: 'Đã tạo lộ trình cá nhân hóa',
        description: 'AI đã chuẩn bị lộ trình mới dựa trên điểm số, tiến độ và chủ đề yếu của bạn.',
      });
      return;
    }

    if (response.status === 'no_recommendation') {
      setToast({
        type: 'info',
        title: 'Chưa có khuyến nghị mới',
        description: response.message || 'Hiện chưa đủ dữ liệu để tạo lộ trình mới.',
      });
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsRoadmapModalOpen(true);
    const response = await generate(ROADMAP_GENERATION_MOCK_REQUEST);
    finalizeRoadmapAction(response);
  };

  const handleRetryRoadmap = async () => {
    const response = await retry();
    finalizeRoadmapAction(response);
  };

  const handleCloseRoadmapModal = () => {
    setIsRoadmapModalOpen(false);
    if (status !== 'loading') {
      reset();
    }
  };

  const handleStartNow = () => {
    setIsRoadmapModalOpen(false);
    setToast({
      type: 'success',
      title: 'Bắt đầu lộ trình',
      description: 'Danh sách task gợi ý đã sẵn sàng cho phiên học hiện tại của bạn.',
    });
    navigate('/roadmap/current');
  };

  const handleSaveForLater = () => {
    setIsRoadmapModalOpen(false);
    setToast({
      type: 'info',
      title: 'Đã lưu để học sau',
      description: 'Bạn có thể mở lại lộ trình hiện tại bất cứ lúc nào từ dashboard.',
    });
    reset();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight cursor-pointer">
            Chào mừng trở lại, {firstName}
          </h2>
          <p className="text-on-surface-variant body-md max-w-lg">
            Bạn đã hoàn thành 85% mục tiêu hàng tuần. Cố vấn AI của bạn đã chuẩn bị những thông tin mới cho học phần Vật lý Lượng tử Nâng cao.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center gap-4 border border-outline-variant/20">
            <div className="w-12 h-12 rounded-full border-4 border-tertiary-100 flex items-center justify-center text-xs font-bold text-tertiary-600">
              85%
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mục tiêu Tuần</p>
              <p className="text-sm font-semibold">12/14 Học phần</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Advisor Card */}
      <div className="bg-gradient-to-br from-primary to-primary-600 rounded-3xl p-8 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(117, 49, 255, 0.2)', backdropFilter: 'blur(20px)' }}
            >
              <span className="material-symbols-outlined text-secondary-100">auto_awesome</span>
            </div>
            <span className="font-headline font-bold text-lg">Thông tin từ Cố vấn AI</span>
          </div>
          <h3 className="text-3xl font-headline font-bold mb-4 leading-tight">
            "Dựa trên bài kiểm tra trước, bạn nên tập trung vào Tính lưỡng tính Sóng-Hạt."
          </h3>
          <p className="text-primary-100 mb-8 max-w-xl">
            Tôi nhận thấy bạn dành nhiều thời gian hơn 20% cho các phòng thí nghiệm trực quan. Tôi đã tuyển chọn 3 mô phỏng tương tác để giúp bạn nắm vững các chủ đề bài giảng tuần tới.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateRoadmap}
              disabled={isLoading}
              className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'sync' : 'play_circle'}
              </span>
              {isLoading ? 'Đang tạo lộ trình...' : 'Bắt đầu Lộ trình Gợi ý'}
            </button>
            <button
              onClick={() => navigate('/semester-report')}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              Xem Phân tích
            </button>
          </div>
        </div>
        <div
          className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"
          style={{ background: 'rgba(117, 49, 255, 0.3)' }}
        ></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Course Cards */}
        <div className="md:col-span-12">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-headline font-bold text-2xl tracking-tight">Lộ trình Học tập Hiện tại</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface-container-high hover:bg-primary hover:text-white'}`}
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface-container-high hover:bg-primary hover:text-white'}`}
              >
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="md:col-span-6 bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-headline font-bold text-lg">Sự chuyên cần Học tập</h4>
              <p className="text-xs text-on-surface-variant">Số giờ tập trung trong 7 ngày qua</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-xs font-bold py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary">
              <option>Tuần này</option>
              <option>Tuần trước</option>
            </select>
          </div>

          <div className="flex items-end justify-between h-48 gap-2">
            {['TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'CN'].map((day, idx) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-3">
                <div
                  className={`w-full rounded-t-lg relative group h-[${
                    weeklyProgress[idx]
                  }%] ${
                    day === 'TH4'
                      ? 'bg-primary'
                      : 'bg-primary-200 group-hover:bg-primary transition-colors'
                  }`}
                ></div>
                <span
                  className={`text-[10px] font-bold ${
                    day === 'TH4' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Online Friends */}
        <div className="md:col-span-6 bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
          <h4 className="font-headline font-bold text-lg mb-6">Bạn học đang trực tuyến</h4>
          <div className="flex flex-wrap gap-6">
            {['Alex', 'Maya', 'Leo'].map((name) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {name[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-tertiary-100 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xs font-semibold">{name}</span>
              </div>
            ))}
            <button
              onClick={() => setToast({ type: 'info', title: 'Tính năng học nhóm', description: 'Tính năng mời thành viên đang được phát triển.' })}
              className="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-tertiary-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-tertiary-600">Bắt đầu Học nhóm</p>
              <p className="text-xs text-on-surface-variant">Phòng thí nghiệm Cơ học Lượng tử - 15:00</p>
            </div>
            <button
              onClick={() => setToast({ type: 'info', title: 'Đang tham gia phòng học nhóm...', description: 'Tính năng phòng học nhóm đang được phát triển.' })}
              className="bg-tertiary-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Tham gia Phòng
            </button>
          </div>
        </div>
      </div>

      <RoadmapPreviewModal
        open={isRoadmapModalOpen}
        status={status}
        roadmap={roadmap}
        message={message}
        onClose={handleCloseRoadmapModal}
        onRetry={handleRetryRoadmap}
        onStartNow={handleStartNow}
        onSaveForLater={handleSaveForLater}
      />

      <Toast
        open={!!toast}
        type={toast?.type}
        title={toast?.title || ''}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

// Course Card Component
function CourseCard({ course }: { course: any }) {
  const navigate = useNavigate();
  const colorClass =
    course.color === 'primary'
      ? 'bg-primary-600'
      : course.color === 'secondary'
      ? 'bg-secondary-600'
      : 'bg-tertiary-600';

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-2 shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
      <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
        <div className={`w-full h-full ${colorClass}`}></div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-on-surface uppercase">
          {course.category}
        </div>
      </div>
      <div className="px-4 pb-6">
        <h5 className="font-bold text-lg mb-1">{course.name}</h5>
        <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">person</span> {course.instructor}
        </p>
        <div className="space-y-3 mb-6 bg-surface-container-low p-3 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tiến độ học tập</span>
            <span className={`text-lg font-black ${
              course.color === 'primary' ? 'text-primary-600' : course.color === 'secondary' ? 'text-secondary-600' : 'text-tertiary-600'
            }`}>
              {course.progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                course.color === 'primary'
                  ? 'bg-primary-600'
                  : course.color === 'secondary'
                  ? 'bg-secondary-600'
                  : 'bg-tertiary-600'
              }`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-on-surface-variant italic">
            {course.progress >= 90 ? 'Sắp hoàn thành!' : 'Đã lưu từ phiên học trước'}
          </p>
        </div>
        <button
          onClick={() => navigate('/student/learning')}
          className={`w-full py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all ${
            course.color === 'primary'
              ? 'bg-primary-600'
              : course.color === 'secondary'
              ? 'bg-secondary-600'
              : 'bg-tertiary-600'
          }`}
        >
          <span className="material-symbols-outlined text-sm">play_arrow</span>
          Học tiếp
        </button>
      </div>
    </div>
  );
}
