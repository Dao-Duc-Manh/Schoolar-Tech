import type { CourseGrade } from '@/types/grades';
import { GradeStatusBadge } from './GradeStatusBadge';

interface GradesTableProps {
  courses: CourseGrade[];
  onSelectCourse: (course: CourseGrade) => void;
}

export function GradesTable({ courses, onSelectCourse }: GradesTableProps) {
  return (
    <>
      <div className="hidden lg:block overflow-x-auto rounded-3xl border border-outline-variant/10">
        <table className="min-w-[1280px] w-full text-sm">
          <thead className="sticky top-0 bg-surface-container-low z-10">
            <tr className="text-left text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="px-4 py-3 font-bold">Mã môn</th>
              <th className="px-4 py-3 font-bold">Tên môn học</th>
              <th className="px-4 py-3 font-bold">Học phần</th>
              <th className="px-4 py-3 font-bold">TC</th>
              <th className="px-4 py-3 font-bold">Chuyên cần</th>
              <th className="px-4 py-3 font-bold">Giữa kỳ</th>
              <th className="px-4 py-3 font-bold">Thực hành / Lab</th>
              <th className="px-4 py-3 font-bold">Cuối kỳ</th>
              <th className="px-4 py-3 font-bold">Tổng kết 10</th>
              <th className="px-4 py-3 font-bold">Điểm chữ</th>
              <th className="px-4 py-3 font-bold">Kết quả</th>
              <th className="px-4 py-3 font-bold">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
            {courses.map((course) => {
              const attendance = course.components.find((item) => item.type === 'attendance');
              const midterm = course.components.find((item) => item.type === 'midterm');
              const practice = course.components.find((item) => item.type === 'practice');
              const final = course.components.find((item) => item.type === 'final');

              return (
                <tr key={course.id} className="hover:bg-surface-container cursor-pointer transition-colors" onClick={() => onSelectCourse(course)}>
                  <td className="px-4 py-4 font-semibold text-primary">{course.courseCode}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">{course.courseName}</p>
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">{course.section}</td>
                  <td className="px-4 py-4 font-semibold">{course.credits}</td>
                  <td className="px-4 py-4">{attendance?.score.toFixed(1)}</td>
                  <td className="px-4 py-4">{midterm?.score.toFixed(1)}</td>
                  <td className="px-4 py-4">{practice?.score.toFixed(1)}</td>
                  <td className="px-4 py-4">{final?.score.toFixed(1)}</td>
                  <td className="px-4 py-4 font-bold text-on-surface">{course.finalScore10.toFixed(1)}</td>
                  <td className="px-4 py-4 font-bold text-secondary">{course.letterGrade}</td>
                  <td className="px-4 py-4"><GradeStatusBadge status={course.status} /></td>
                  <td className="px-4 py-4 text-on-surface-variant">{course.note || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {courses.map((course) => {
          const attendance = course.components.find((item) => item.type === 'attendance');
          const midterm = course.components.find((item) => item.type === 'midterm');
          const practice = course.components.find((item) => item.type === 'practice');
          const final = course.components.find((item) => item.type === 'final');

          return (
            <article key={course.id} className="rounded-3xl bg-surface-container p-5" onClick={() => onSelectCourse(course)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{course.courseCode}</p>
                  <h4 className="mt-1 text-lg font-bold text-on-surface">{course.courseName}</h4>
                  <p className="mt-1 text-sm text-on-surface-variant">{course.section} • {course.credits} tín chỉ</p>
                </div>
                <GradeStatusBadge status={course.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <GradeMetric label="Chuyên cần" value={attendance?.score.toFixed(1) || '-'} />
                <GradeMetric label="Giữa kỳ" value={midterm?.score.toFixed(1) || '-'} />
                <GradeMetric label="Thực hành" value={practice?.score.toFixed(1) || '-'} />
                <GradeMetric label="Cuối kỳ" value={final?.score.toFixed(1) || '-'} />
                <GradeMetric label="Tổng kết" value={course.finalScore10.toFixed(1)} highlight />
                <GradeMetric label="Điểm chữ" value={course.letterGrade} highlight />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function GradeMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest px-3 py-3">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`mt-1 font-bold ${highlight ? 'text-primary' : 'text-on-surface'}`}>{value}</p>
    </div>
  );
}
