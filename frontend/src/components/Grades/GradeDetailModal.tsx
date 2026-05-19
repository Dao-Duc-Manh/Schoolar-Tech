import type { ReactNode } from 'react';
import type { CourseGrade } from '@/types/grades';
import { buildGradeFormula } from '@/utils/gradeUtils';
import { GradeStatusBadge } from './GradeStatusBadge';

interface GradeDetailModalProps {
  open: boolean;
  loading: boolean;
  error: string;
  course: CourseGrade | null;
  onClose: () => void;
}

export function GradeDetailModal({ open, loading, error, course, onClose }: GradeDetailModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] bg-surface shadow-2xl animate-enter-soft">
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Chi tiết điểm học phần</p>
            <h2 className="mt-2 text-2xl font-headline font-bold text-on-surface">{course?.courseName || 'Đang tải...'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-surface-container p-2 text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
          {loading && <DetailSkeleton />}

          {!loading && error && (
            <div className="rounded-3xl border border-error/20 bg-error-container px-6 py-8 text-center">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
              <p className="mt-4 text-on-surface-variant">{error}</p>
            </div>
          )}

          {!loading && !error && course && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="Mã môn" value={course.courseCode} />
                <MetricCard label="Lớp học phần" value={course.section} />
                <MetricCard label="Điểm tổng kết" value={course.finalScore10.toFixed(1)} />
                <MetricCard label="Điểm chữ" value={course.letterGrade} badge={<GradeStatusBadge status={course.status} />} />
              </div>

              <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Điểm thành phần và tỷ trọng</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant">
                        <th className="pb-3 font-bold">Thành phần</th>
                        <th className="pb-3 font-bold">Điểm</th>
                        <th className="pb-3 font-bold">Điểm tối đa</th>
                        <th className="pb-3 font-bold">Tỷ trọng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {course.components.map((component) => (
                        <tr key={component.id}>
                          <td className="py-3 font-medium text-on-surface">{component.label}</td>
                          <td className="py-3">{component.score.toFixed(1)}</td>
                          <td className="py-3">{component.maxScore.toFixed(1)}</td>
                          <td className="py-3">{component.weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Công thức tính điểm tổng kết</h3>
                <p className="rounded-2xl bg-surface-container px-4 py-4 text-sm leading-7 text-on-surface-variant">
                  {buildGradeFormula(course.components)} = <strong className="text-on-surface">{course.finalScore10.toFixed(1)}</strong>
                </p>
              </section>

              <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6">
                <h3 className="text-lg font-bold text-on-surface mb-4">Lịch sử thi lại</h3>
                {course.retakeHistory.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Chưa có lần thi lại nào được ghi nhận.</p>
                ) : (
                  <div className="space-y-3">
                    {course.retakeHistory.map((attempt) => (
                      <div key={attempt.id} className="rounded-2xl bg-surface-container p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-on-surface">Lần thi lại {attempt.attemptNo}</p>
                          <p className="text-sm text-on-surface-variant">Ngày thi: {attempt.examDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-secondary">{attempt.score10.toFixed(1)}</p>
                          <p className="text-sm text-on-surface-variant">{attempt.note || 'Không có ghi chú thêm'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Ghi chú từ giảng viên</h3>
                  <p className="text-sm leading-7 text-on-surface-variant">{course.teacherNote || 'Chưa có nhận xét từ giảng viên.'}</p>
                </div>
                <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6">
                  <h3 className="text-lg font-bold text-on-surface mb-3">Ghi chú học vụ</h3>
                  <p className="text-sm leading-7 text-on-surface-variant">{course.note || 'Không có ghi chú học vụ.'}</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, badge }: { label: string; value: string; badge?: ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-black text-on-surface">{value}</p>
      {badge && <div className="mt-3">{badge}</div>}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-3xl bg-surface-container h-28"></div>
        ))}
      </div>
      <div className="rounded-3xl bg-surface-container h-48"></div>
      <div className="rounded-3xl bg-surface-container h-28"></div>
      <div className="rounded-3xl bg-surface-container h-32"></div>
    </div>
  );
}
