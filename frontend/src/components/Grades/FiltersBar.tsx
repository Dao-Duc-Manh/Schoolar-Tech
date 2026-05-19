import { Input } from '@/components/Common';
import type { GradeStatus, Semester } from '@/types/grades';

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  semesterFilter: string;
  onSemesterFilterChange: (value: string) => void;
  statusFilter: 'all' | GradeStatus;
  onStatusFilterChange: (value: 'all' | GradeStatus) => void;
  semesters: Semester[];
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export function FiltersBar({
  search,
  onSearchChange,
  semesterFilter,
  onSemesterFilterChange,
  statusFilter,
  onStatusFilterChange,
  semesters,
  onExportPdf,
  onExportExcel,
}: FiltersBarProps) {
  return (
    <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-4 md:grid-cols-3 flex-1">
          <div className="md:col-span-2">
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm theo tên môn hoặc mã môn"
              label="Tìm kiếm học phần"
            />
          </div>

          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-gray-700">Lọc theo học kỳ</span>
            <select
              value={semesterFilter}
              onChange={(event) => onSemesterFilterChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả học kỳ</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} - {semester.academicYear}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onExportPdf} className="rounded-2xl bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-primary hover:text-white transition-all">
            Xuất PDF
          </button>
          <button type="button" onClick={onExportExcel} className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20">
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đạt', value: 'passed' },
          { label: 'Thi lại', value: 'retake' },
          { label: 'Học lại', value: 'relearn' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusFilterChange(option.value as 'all' | GradeStatus)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              statusFilter === option.value
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
