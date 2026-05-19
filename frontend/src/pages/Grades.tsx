import { useEffect, useMemo, useState } from 'react';
import { Alert } from '@/components/Common';
import { FiltersBar } from '@/components/Grades/FiltersBar';
import { GradeDetailModal } from '@/components/Grades/GradeDetailModal';
import { GradeScaleCard } from '@/components/Grades/GradeScaleCard';
import { GradesSummaryCards } from '@/components/Grades/GradesSummaryCards';
import { SemesterGradesSection } from '@/components/Grades/SemesterGradesSection';
import { Toast } from '@/components/Common/Toast';
import { gradesService } from '@/services/gradesService';
import type { CourseGrade, GradeStatus, GradesSummary, SemesterGradesData, Student } from '@/types/grades';

type StatusFilter = 'all' | GradeStatus;

export function GradesPage() {
  const studentId = 'student_001';
  const [student, setStudent] = useState<Student | null>(null);
  const [summary, setSummary] = useState<GradesSummary | null>(null);
  const [semesterData, setSemesterData] = useState<SemesterGradesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseGrade | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseGrade | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);

  const loadGrades = async () => {
    setLoading(true);
    setError('');

    try {
      const [gradesResponse, summaryResponse, semesterResponse] = await Promise.all([
        gradesService.getStudentGrades(studentId),
        gradesService.getStudentSummary(studentId),
        gradesService.getStudentSemesters(studentId),
      ]);

      setStudent(gradesResponse.student);
      setSummary(summaryResponse);
      setSemesterData(semesterResponse);
      setExpandedSemesters(
        semesterResponse.reduce<Record<string, boolean>>((accumulator, item) => {
          accumulator[item.semester.id] = true;
          return accumulator;
        }, {})
      );
    } catch (loadError: any) {
      setError(loadError.message || 'Không thể tải dữ liệu bảng điểm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const filteredSemesters = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return semesterData
      .filter((item) => (semesterFilter === 'all' ? true : item.semester.id === semesterFilter))
      .map((item) => {
        const filteredCourses = item.courses.filter((course) => {
          const matchesSearch = !keyword
            ? true
            : course.courseName.toLowerCase().includes(keyword) || course.courseCode.toLowerCase().includes(keyword);
          const matchesStatus = statusFilter === 'all' ? true : course.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        return {
          ...item,
          courses: filteredCourses,
        };
      })
      .filter((item) => item.courses.length > 0);
  }, [search, semesterData, semesterFilter, statusFilter]);

  const openCourseDetail = async (course: CourseGrade) => {
    setSelectedCourse(course);
    setCourseDetail(null);
    setCourseError('');
    setCourseLoading(true);

    try {
      const detail = await gradesService.getCourseDetail(studentId, course.id);
      setCourseDetail(detail);
    } catch (detailError: any) {
      setCourseError(detailError.message || 'Không thể tải chi tiết học phần.');
    } finally {
      setCourseLoading(false);
    }
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    setToast({
      type: 'info',
      title: `Đã tạo yêu cầu xuất ${format}`,
      description: `Chức năng xuất ${format} đang dùng mock, file sẽ được tích hợp backend ở bước sau.`,
    });
  };

  const totalFilteredCourses = filteredSemesters.reduce((total, item) => total + item.courses.length, 0);

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-primary to-secondary p-8 text-white shadow-2xl shadow-primary/10 animate-enter-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Bảng điểm sinh viên</p>
            <h1 className="mt-4 text-4xl font-headline font-extrabold tracking-tight">Điểm số học tập</h1>
            <p className="mt-3 max-w-2xl text-white/80 leading-7">
              Theo dõi điểm thành phần, điểm tổng kết hệ 10, điểm chữ A/B+/B/C+/C/D+/D/F và xác định rõ môn nào cần thi lại hoặc học lại.
            </p>
          </div>

          {student && (
            <div className="rounded-[28px] bg-white/10 px-6 py-5 backdrop-blur border border-white/10 min-w-[280px]">
              <p className="text-sm text-white/70">Sinh viên</p>
              <p className="mt-1 text-2xl font-bold">{student.fullName}</p>
              <p className="mt-2 text-sm text-white/80">{student.studentCode} • {student.major}</p>
              <p className="mt-1 text-sm text-white/70">{student.faculty} • {student.cohort}</p>
            </div>
          )}
        </div>
      </section>

      {loading && <GradesLoadingSkeleton />}

      {!loading && error && (
        <Alert type="error" className="rounded-3xl">
          <div className="space-y-3">
            <p className="font-semibold">Không thể tải dữ liệu điểm số.</p>
            <p>{error}</p>
            <button type="button" onClick={loadGrades} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-error shadow-sm">
              Tải lại
            </button>
          </div>
        </Alert>
      )}

      {!loading && !error && student && summary && (
        <>
          <GradesSummaryCards summary={summary} />

          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            semesterFilter={semesterFilter}
            onSemesterFilterChange={setSemesterFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            semesters={semesterData.map((item) => item.semester)}
            onExportPdf={() => handleExport('PDF')}
            onExportExcel={() => handleExport('Excel')}
          />

          <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
            <div className="space-y-6 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Bảng điểm theo học kỳ</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">Đang hiển thị {totalFilteredCourses} học phần phù hợp với bộ lọc hiện tại.</p>
                </div>
              </div>

              {filteredSemesters.length === 0 ? (
                <div className="rounded-[32px] border border-dashed border-outline-variant/30 bg-surface-container-low px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                  <h3 className="mt-4 text-xl font-bold text-on-surface">Không có dữ liệu phù hợp</h3>
                  <p className="mt-2 text-on-surface-variant">Hãy thử đổi từ khóa tìm kiếm hoặc bộ lọc học kỳ / trạng thái.</p>
                </div>
              ) : (
                filteredSemesters.map((item) => (
                  <SemesterGradesSection
                    key={item.semester.id}
                    semester={item.semester}
                    courses={item.courses}
                    gpa={item.gpa}
                    retakeCount={item.retakeCount}
                    relearnCount={item.relearnCount}
                    expanded={expandedSemesters[item.semester.id] ?? true}
                    onToggle={() =>
                      setExpandedSemesters((current) => ({
                        ...current,
                        [item.semester.id]: !current[item.semester.id],
                      }))
                    }
                    onSelectCourse={openCourseDetail}
                  />
                ))
              )}
            </div>

            <div className="space-y-6">
              <GradeScaleCard />

              <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary">analytics</span>
                  <h3 className="text-xl font-bold text-on-surface">Tổng kết học vụ</h3>
                </div>

                <div className="space-y-4 text-sm text-on-surface-variant leading-7">
                  <p>
                    GPA học kỳ hiện tại là <strong className="text-on-surface">{summary.semesterGPA.value.toFixed(1)}</strong>,
                    GPA tích lũy đạt <strong className="text-on-surface">{summary.cumulativeGPA.value.toFixed(1)}</strong> - xếp loại{' '}
                    <strong className="text-on-surface">{summary.cumulativeGPA.classification}</strong>.
                  </p>
                  <p>
                    Sinh viên hiện có <strong className="text-on-surface">{summary.retakeCourses}</strong> môn cần thi lại và{' '}
                    <strong className="text-on-surface">{summary.relearnCourses}</strong> môn cần học lại.
                  </p>
                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="font-semibold text-on-surface">Quy ước hiển thị trạng thái</p>
                    <ul className="mt-3 space-y-2">
                      <li><span className="font-semibold text-tertiary">Đạt</span>: điểm tổng kết từ 4.0 trở lên.</li>
                      <li><span className="font-semibold text-orange-700">Thi lại</span>: chưa đạt và chưa có lần thi lại.</li>
                      <li><span className="font-semibold text-error">Học lại</span>: đã thi lại nhưng vẫn chưa đạt.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <GradeDetailModal
        open={!!selectedCourse}
        loading={courseLoading}
        error={courseError}
        course={courseDetail}
        onClose={() => {
          setSelectedCourse(null);
          setCourseDetail(null);
          setCourseError('');
        }}
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

function GradesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="rounded-3xl bg-surface-container h-32"></div>
        ))}
      </div>

      <div className="rounded-3xl bg-surface-container h-32"></div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[32px] bg-surface-container h-48"></div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-[32px] bg-surface-container h-72"></div>
          <div className="rounded-[32px] bg-surface-container h-56"></div>
        </div>
      </div>
    </div>
  );
}
