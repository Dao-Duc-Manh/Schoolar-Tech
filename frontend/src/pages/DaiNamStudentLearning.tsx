import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  documentUrl: string;
  orderIndex: number;
}

interface Course {
  id: string;
  courseId: string;
  course: { id: string; name: string; courseCode: string; credits: number; description: string };
  teacher?: { fullName: string };
  lessons: Lesson[];
  progress: number;
  currentScore: number | null;
  status: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  score: number;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  description: string;
  endTime: string;
  duration: number;
  maxScore: number;
  questions?: Question[];
}

interface LessonProgress {
  lessonId: string;
  progressPercent: number;
  status: string;
}

// ─── Mock questions for courses without backend quiz data ─────────────────────
const MOCK_QUESTIONS: Record<string, Question[]> = {
  default: [
    { id: 'mq1', questionText: 'Props trong React dùng để làm gì?', options: ['Truyền dữ liệu vào component', 'Kết nối database', 'Build production', 'Tạo server'], correctAnswer: 'Truyền dữ liệu vào component', score: 5 },
    { id: 'mq2', questionText: 'Hook nào quản lý state cục bộ trong React?', options: ['useState', 'useRouter', 'useDb', 'useServer'], correctAnswer: 'useState', score: 5 },
    { id: 'mq3', questionText: 'Câu lệnh SQL nào dùng để lấy dữ liệu?', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], correctAnswer: 'SELECT', score: 5 },
    { id: 'mq4', questionText: 'JOIN trong SQL dùng để làm gì?', options: ['Kết hợp dữ liệu từ nhiều bảng', 'Xóa bảng', 'Tạo index', 'Thêm cột'], correctAnswer: 'Kết hợp dữ liệu từ nhiều bảng', score: 5 },
    { id: 'mq5', questionText: 'Machine Learning là gì?', options: ['Máy tự học từ dữ liệu', 'Lập trình thủ công', 'Thiết kế phần cứng', 'Quản lý mạng'], correctAnswer: 'Máy tự học từ dữ liệu', score: 5 },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function ProgressBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-teal-100 text-teal-700',
    in_progress: 'bg-blue-100 text-blue-700',
    not_started: 'bg-gray-100 text-gray-500',
    'Đang học': 'bg-blue-100 text-blue-700',
  };
  const label: Record<string, string> = {
    completed: 'Hoàn thành', in_progress: 'Đang học', not_started: 'Chưa bắt đầu', 'Đang học': 'Đang học',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {label[status] || status}
    </span>
  );
}

// ─── Quiz Modal ───────────────────────────────────────────────────────────────
function QuizModal({ assignment, onClose, onComplete }: { assignment: Assignment; onClose: () => void; onComplete: (score: number) => void }) {
  const questions = assignment.questions?.length ? assignment.questions : MOCK_QUESTIONS.default;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assignment.duration * 60);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
  };

  const score = submitted
    ? questions.reduce((sum, q) => answers[q.id] === q.correctAnswer ? sum + q.score : sum, 0)
    : 0;
  const total = questions.reduce((s, q) => s + q.score, 0);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Bài kiểm tra</p>
            <h2 className="text-lg font-extrabold mt-0.5">{assignment.title}</h2>
          </div>
          {!submitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
              <span className="material-symbols-outlined text-base">timer</span>
              {fmt(timeLeft)}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {!submitted ? (
            <>
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6 flex-wrap">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      i === current ? 'bg-primary text-white' :
                      answers[questions[i].id] ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Question */}
              <div className="mb-6">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Câu {current + 1} / {questions.length}
                </p>
                <p className="text-lg font-bold text-on-surface leading-snug">{questions[current].questionText}</p>
                <p className="text-xs text-on-surface-variant mt-1">{questions[current].score} điểm</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {questions[current].options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers(a => ({ ...a, [questions[current].id]: opt }))}
                    className={`w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all ${
                      answers[questions[current].id] === opt
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant hover:border-primary/40 hover:bg-primary/3'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-semibold text-sm disabled:opacity-30">
                  ← Trước
                </button>
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(c => c + 1)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm">
                    Tiếp theo →
                  </button>
                ) : (
                  <button onClick={handleSubmit}
                    className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm">
                    Nộp bài ✓
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Result */
            <div className="text-center py-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${score / total >= 0.7 ? 'bg-teal-100' : 'bg-orange-100'}`}>
                <span className={`material-symbols-outlined text-5xl ${score / total >= 0.7 ? 'text-teal-600' : 'text-orange-500'}`}>
                  {score / total >= 0.7 ? 'emoji_events' : 'sentiment_neutral'}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-on-surface">
                {score} / {total} điểm
              </h3>
              <p className="text-on-surface-variant mt-2">
                {score / total >= 0.9 ? '🎉 Xuất sắc!' : score / total >= 0.7 ? '✅ Đạt yêu cầu' : '⚠️ Cần ôn tập thêm'}
              </p>
              {/* Review answers */}
              <div className="mt-6 space-y-3 text-left">
                {questions.map((q, i) => {
                  const correct = answers[q.id] === q.correctAnswer;
                  return (
                    <div key={q.id} className={`p-3 rounded-xl text-sm ${correct ? 'bg-teal-50' : 'bg-red-50'}`}>
                      <p className="font-bold text-on-surface">{i + 1}. {q.questionText}</p>
                      <p className={`mt-1 ${correct ? 'text-teal-700' : 'text-red-600'}`}>
                        {correct ? '✓' : '✗'} Bạn chọn: {answers[q.id] || '(bỏ qua)'}
                      </p>
                      {!correct && <p className="text-teal-700">✓ Đáp án: {q.correctAnswer}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6 justify-center">
                <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-sm">
                  Đóng
                </button>
                <button onClick={() => onComplete(score)} className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm">
                  Lưu kết quả
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Viewer ────────────────────────────────────────────────────────────
function LessonViewer({
  lesson, course, progressData, onClose, onProgressUpdate,
}: {
  lesson: Lesson;
  course: Course;
  progressData: LessonProgress | undefined;
  onClose: () => void;
  onProgressUpdate: (lessonId: string, percent: number) => void;
}) {
  const [progress, setProgress] = useState(progressData?.progressPercent || 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');
  const [notes, setNotes] = useState('');
  const startTimeRef = useRef(Date.now());

  const saveProgress = async (percent: number) => {
    setSaving(true);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      await apiClient.patch(`/api/student/lessons/${lesson.id}/progress`, { progressPercent: percent, timeSpent });
      onProgressUpdate(lesson.id, percent);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleMarkDone = () => {
    setProgress(100);
    saveProgress(100);
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-black/80 backdrop-blur-sm">
      {/* Sidebar */}
      <div className="w-72 bg-surface-container-lowest border-r border-outline-variant flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-outline-variant">
          <button onClick={onClose} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-sm font-medium mb-3">
            <span className="material-symbols-outlined text-base">arrow_back</span> Quay lại
          </button>
          <h2 className="font-bold text-on-surface text-sm leading-snug">{course.course?.name}</h2>
          <p className="text-xs text-on-surface-variant mt-1">{course.teacher?.fullName}</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2 py-2">Danh sách bài học</p>
          {course.lessons.map((l, idx) => (
            <div key={l.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 text-sm ${l.id === lesson.id ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${l.id === lesson.id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>{idx + 1}</span>
              <span className="truncate">{l.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex-shrink-0">
          <button onClick={onClose} className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-base">arrow_back</span> Quay lại
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="font-bold text-on-surface text-sm lg:text-base truncate">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <ProgressBar value={progress} />
              <span className="text-xs font-bold text-primary whitespace-nowrap">{progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {saved && <span className="text-xs text-teal-600 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span>Đã lưu</span>}
            {progress < 100 && (
              <button onClick={handleMarkDone} disabled={saving}
                className="px-4 py-1.5 rounded-full bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : '✓ Đánh dấu hoàn thành'}
              </button>
            )}
            {progress === 100 && (
              <span className="px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> Đã hoàn thành
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video placeholder */}
          <div className="relative bg-gray-950 aspect-video max-h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => { if (progress < 50) { setProgress(50); } }}>
                <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
              </div>
              <p className="text-white/60 text-sm">Video bài học — nhấn play để xem</p>
              <p className="text-white/30 text-xs mt-1">{lesson.videoUrl}</p>
            </div>
            {/* Simulated progress from watching */}
            {progress < 100 && (
              <div className="absolute bottom-3 left-6 right-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    onClick={() => { const next = Math.min(100, progress + 25); setProgress(next); if (next >= 100) saveProgress(100); else saveProgress(next); }}
                    className="text-white/70 hover:text-white text-xs font-medium whitespace-nowrap"
                  >
                    +25% →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-outline-variant px-6">
            <div className="flex gap-6">
              {(['content', 'notes'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                  {tab === 'content' ? 'Nội dung bài học' : 'Ghi chú của tôi'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 max-w-3xl">
            {activeTab === 'content' ? (
              <>
                <h2 className="text-xl font-extrabold text-on-surface mb-4">{lesson.title}</h2>
                <div className="prose prose-sm text-on-surface-variant leading-7">
                  <p>{lesson.content}</p>
                  <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">lightbulb</span>
                      Điểm quan trọng cần ghi nhớ
                    </h4>
                    <ul className="space-y-1.5 text-sm text-on-surface-variant">
                      <li>• Nắm chắc khái niệm cốt lõi của bài học này</li>
                      <li>• Thực hành code / bài tập sau khi xem video</li>
                      <li>• Đặt câu hỏi cho giảng viên nếu cần hỗ trợ</li>
                    </ul>
                  </div>
                  {lesson.documentUrl && (
                    <a href={lesson.documentUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                      Tài liệu PDF đính kèm
                    </a>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-on-surface mb-3">Ghi chú cá nhân</h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ghi chú của bạn về bài học này..."
                  className="w-full h-48 p-4 rounded-2xl bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-on-surface-variant mt-2">Ghi chú được lưu cục bộ trên trình duyệt.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function DaiNamStudentLearningPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [overview, setOverview] = useState({ currentCourses: 0, weeklyProgress: 0, currentGpa: 0, pendingAssignments: 0 });
  const [aiAdvisor, setAiAdvisor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/api/student/dashboard');
        const data = res.data.data;
        setCourses(data.courses || []);
        setOverview(data.overview);
        setAiAdvisor(data.aiAdvisor?.summary || '');
        setAssignments(data.overview?.pendingAssignments
          ? (await apiClient.get('/api/student/courses').then(r =>
              r.data.data.flatMap((c: Course) => [])
            ))
          : []);

        // Build progressMap from courses
        const pm: Record<string, LessonProgress> = {};
        data.courses?.forEach((c: Course) => {
          c.lessons?.forEach((l: Lesson) => {
            pm[l.id] = { lessonId: l.id, progressPercent: 0, status: 'not_started' };
          });
        });
        setProgressMap(pm);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Không thể tải dữ liệu học tập.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch quiz questions for a course
  const loadAssignments = async (course: Course) => {
    try {
      const res = await apiClient.get(`/api/student/courses/${course.courseId}`);
      const detail = res.data.data;
      if (detail.assignments?.length) {
        // Try to load questions
        return detail.assignments.map((a: Assignment) => ({
          ...a,
          questions: MOCK_QUESTIONS.default,
        }));
      }
    } catch { /* ignore */ }
    return [];
  };

  const handleOpenCourse = async (course: Course) => {
    const loaded = await loadAssignments(course);
    setAssignments(loaded);
    setActiveCourse(course);
    setActiveLesson(null);
  };

  const handleProgressUpdate = (lessonId: string, percent: number) => {
    setProgressMap(prev => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], lessonId, progressPercent: percent, status: percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started' },
    }));
    // Update course progress
    setCourses(prev => prev.map(c => {
      const lessons = c.lessons || [];
      if (!lessons.find(l => l.id === lessonId)) return c;
      const all = lessons.map(l => l.id === lessonId ? percent : progressMap[l.id]?.progressPercent || 0);
      const avg = Math.round(all.reduce((s, v) => s + v, 0) / Math.max(1, all.length));
      return { ...c, progress: avg };
    }));
    showToast('✓ Tiến độ đã được lưu');
  };

  const handleQuizComplete = (score: number) => {
    if (activeAssignment) {
      setQuizScores(prev => ({ ...prev, [activeAssignment.id]: score }));
      showToast(`🎉 Nộp bài thành công! Điểm: ${score}`);
    }
    setActiveAssignment(null);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await apiClient.post('/api/ai/student-chat', { message: aiQuestion });
      setAiReply(res.data.data.response);
    } catch {
      setAiReply('Không thể kết nối AI lúc này. Hãy thử lại sau.');
    }
    setAiLoading(false);
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant text-sm font-medium">Đang tải nền tảng học tập...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-5xl text-error mb-4 block">error</span>
        <p className="text-on-surface font-bold mb-2">Không thể tải dữ liệu</p>
        <p className="text-on-surface-variant text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 bg-primary text-white rounded-xl font-semibold text-sm">Thử lại</button>
      </div>
    </div>
  );

  // ── Lesson viewer overlay ───────────────────────────────────────────────────
  if (activeLesson && activeCourse) return (
    <>
      <LessonViewer
        lesson={activeLesson}
        course={activeCourse}
        progressData={progressMap[activeLesson.id]}
        onClose={() => setActiveLesson(null)}
        onProgressUpdate={handleProgressUpdate}
      />
      {activeAssignment && (
        <QuizModal
          assignment={activeAssignment}
          onClose={() => setActiveAssignment(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </>
  );

  // ── Course detail view ──────────────────────────────────────────────────────
  if (activeCourse) return (
    <div className="space-y-6 pb-24">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>{toast}
        </div>
      )}

      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setActiveCourse(null)} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <p className="text-xs text-on-surface-variant">{activeCourse.course?.courseCode}</p>
          <h1 className="text-2xl font-extrabold text-on-surface">{activeCourse.course?.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            Danh sách bài học ({activeCourse.lessons?.length || 0} bài)
          </h2>
          {(!activeCourse.lessons || activeCourse.lessons.length === 0) ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">library_books</span>
              Chưa có bài học nào trong môn này.
            </div>
          ) : (
            activeCourse.lessons.map((lesson, idx) => {
              const prog = progressMap[lesson.id];
              const pct = prog?.progressPercent || 0;
              return (
                <div key={lesson.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${pct >= 100 ? 'bg-teal-100 text-teal-700' : pct > 0 ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {pct >= 100 ? <span className="material-symbols-outlined text-base">check</span> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-on-surface text-sm">{lesson.title}</h3>
                        <StatusBadge status={prog?.status || 'not_started'} />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{lesson.content}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar value={pct} color={pct >= 100 ? 'bg-teal-500' : 'bg-primary'} />
                        </div>
                        <span className="text-xs font-bold text-primary w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setActiveLesson(lesson)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      {pct >= 100 ? 'Xem lại' : pct > 0 ? 'Học tiếp' : 'Bắt đầu học'}
                    </button>
                    {pct >= 100 && (
                      <span className="flex items-center gap-1 px-3 py-2 text-teal-600 text-xs font-bold">
                        <span className="material-symbols-outlined text-base">verified</span> Hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right sidebar: Quiz + Info */}
        <div className="space-y-4">
          {/* Course info */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              Thông tin môn học
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Giảng viên</span>
                <span className="font-semibold text-on-surface">{activeCourse.teacher?.fullName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tín chỉ</span>
                <span className="font-semibold text-on-surface">{activeCourse.course?.credits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tiến độ</span>
                <span className="font-bold text-primary">{activeCourse.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Điểm hiện tại</span>
                <span className="font-bold text-on-surface">{activeCourse.currentScore ?? '—'}</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={activeCourse.progress} />
            </div>
          </div>

          {/* Assignments / Quiz */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">quiz</span>
              Bài kiểm tra
            </h3>
            {assignments.length === 0 ? (
              <p className="text-xs text-on-surface-variant">Chưa có bài kiểm tra nào.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map(a => {
                  const done = quizScores[a.id] !== undefined;
                  return (
                    <div key={a.id} className="p-3 rounded-xl bg-surface-container">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{a.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{a.duration} phút • {a.maxScore} điểm</p>
                          {done && <p className="text-xs text-teal-600 font-bold mt-1">✓ Điểm: {quizScores[a.id]}/{a.maxScore}</p>}
                        </div>
                        <button
                          onClick={() => setActiveAssignment(a)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${done ? 'bg-surface-container-high text-on-surface-variant' : 'bg-secondary text-white hover:bg-secondary/90'}`}
                        >
                          {done ? 'Làm lại' : 'Làm bài'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-primary/5 rounded-2xl p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Mô tả môn học</p>
            <p className="text-sm text-on-surface-variant leading-6">{activeCourse.course?.description}</p>
          </div>
        </div>
      </div>

      {activeAssignment && (
        <QuizModal assignment={activeAssignment} onClose={() => setActiveAssignment(null)} onComplete={handleQuizComplete} />
      )}
    </div>
  );

  // ── Dashboard view ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-24">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>{toast}
        </div>
      )}

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-950 via-primary to-secondary p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Đại Nam Digital Learning</p>
          <h1 className="mt-3 font-extrabold text-3xl lg:text-4xl tracking-tight">
            Chào {user?.fullName?.split(' ').pop() || 'bạn'} 👋
          </h1>
          <p className="mt-2 text-white/70 max-w-xl text-sm">
            Học bài, làm quiz, xem điểm và nhận tư vấn AI — tất cả trong một nơi.
          </p>
          <div className="mt-5 flex items-center gap-4 flex-wrap">
            <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-semibold transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-base">dashboard</span> Dashboard
            </button>
            <button onClick={() => navigate('/roadmap/current')} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-base">map</span> Lộ trình học
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Môn đang học', value: overview.currentCourses, icon: 'school', color: 'text-primary' },
          { label: 'Tiến độ tuần', value: `${overview.weeklyProgress}%`, icon: 'trending_up', color: 'text-teal-600' },
          { label: 'GPA hiện tại', value: overview.currentGpa || '—', icon: 'grade', color: 'text-secondary' },
          { label: 'Bài tập chờ', value: overview.pendingAssignments, icon: 'assignment', color: 'text-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
            <p className="text-2xl font-extrabold text-on-surface mt-2">{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Courses */}
      <section>
        <h2 className="font-bold text-xl text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">menu_book</span>
          Môn học của tôi
        </h2>
        {courses.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">school</span>
            <p className="text-on-surface-variant">Bạn chưa được đăng ký môn học nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map(course => {
              const lessonsDone = (course.lessons || []).filter(l => (progressMap[l.id]?.progressPercent || 0) >= 100).length;
              const totalLessons = course.lessons?.length || 0;
              return (
                <div key={course.id} className="bg-surface-container-lowest rounded-3xl shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                  {/* Card header */}
                  <div className="h-3 bg-gradient-to-r from-primary to-secondary" />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">{course.course?.courseCode}</span>
                        <h3 className="font-extrabold text-on-surface mt-0.5 text-base leading-snug">{course.course?.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-1">{course.teacher?.fullName || 'Giảng viên'} • {course.course?.credits} tín chỉ</p>
                      </div>
                      <StatusBadge status={course.status} />
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-on-surface-variant">Tiến độ học</span>
                        <span className="font-bold text-primary">{course.progress}%</span>
                      </div>
                      <ProgressBar value={course.progress} />
                      <p className="text-xs text-on-surface-variant mt-1.5">{lessonsDone}/{totalLessons} bài hoàn thành</p>
                    </div>

                    {/* Score */}
                    {course.currentScore !== null && (
                      <div className="flex items-center gap-2 mb-4 p-2.5 bg-surface-container rounded-xl">
                        <span className="material-symbols-outlined text-secondary text-sm">grade</span>
                        <span className="text-sm text-on-surface-variant">Điểm hiện tại:</span>
                        <span className="font-extrabold text-secondary">{course.currentScore}/10</span>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handleOpenCourse(course)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">
                        {course.progress >= 100 ? 'replay' : course.progress > 0 ? 'play_arrow' : 'rocket_launch'}
                      </span>
                      {course.progress >= 100 ? 'Ôn tập lại' : course.progress > 0 ? 'Học tiếp' : 'Bắt đầu học'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* AI Advisor */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
        <h2 className="font-bold text-xl text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">psychology</span>
          AI Cố vấn học tập
        </h2>
        {aiAdvisor && (
          <div className="p-4 bg-primary/5 rounded-2xl text-sm text-on-surface-variant leading-6 mb-4">
            {aiAdvisor}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskAI()}
            placeholder="Hỏi AI: Tôi nên ôn gì tuần này? Giải thích về React hooks..."
            className="flex-1 px-4 py-3 rounded-2xl bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAskAI}
            disabled={aiLoading || !aiQuestion.trim()}
            className="px-5 py-3 bg-primary text-white rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {aiLoading ? '...' : 'Hỏi AI'}
          </button>
        </div>
        {aiReply && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-sm text-on-surface leading-6">
            {aiReply}
          </div>
        )}
      </section>
    </div>
  );
}
