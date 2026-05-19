import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  mssv: string;
  attendance: number;
  gpa: number;
  status: 'normal' | 'attention';
  initial: string;
}

// Mock data for the class
const mockClassData = {
  id: 'CS202',
  code: 'CS202',
  name: 'Cấu trúc Dữ liệu',
  semester: 'Học kỳ 1',
  year: '2023-2024',
  room: 'A102',
  studentCount: 45,
};

const mockStudents: Student[] = [
  { id: '1', name: 'Lê Thành Trung', email: 'trung.lt@student.edu.vn', mssv: '20120456', attendance: 98, gpa: 3.85, status: 'normal', initial: 'LT' },
  { id: '2', name: 'Nguyễn Hoàng Nam', email: 'nam.nh@student.edu.vn', mssv: '20120122', attendance: 72, gpa: 2.10, status: 'attention', initial: 'NH' },
  { id: '3', name: 'Trần Minh Anh', email: 'anh.tm@student.edu.vn', mssv: '20120988', attendance: 100, gpa: 4.00, status: 'normal', initial: 'TM' },
  { id: '4', name: 'Phạm Văn Đức', email: 'duc.pv@student.edu.vn', mssv: '20120512', attendance: 92, gpa: 3.25, status: 'normal', initial: 'PV' },
];

export function ClassesPage() {
  const { id: _classId } = useParams();
  const { user: _currentUser } = useAuthStore();
  const [students] = useState<Student[]>(mockStudents);
  const classData = mockClassData;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <nav className="flex text-xs text-on-surface-variant mb-2 space-x-2">
            <span>Lớp học</span>
            <span>/</span>
            <span className="text-primary font-medium">Chi tiết lớp</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Quản lý Lớp học - <span className="text-primary-600">{classData.code}: {classData.name}</span>
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl font-body">
            {classData.semester} • {classData.year} • Phòng {classData.room} • {classData.studentCount} Sinh viên
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-surface-container-lowest text-primary font-bold text-sm rounded-xl shadow-sm border border-outline-variant/15 hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined mr-2 text-lg">download</span> Xuất báo cáo
          </button>
          <button className="flex items-center px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-90 transition-all">
            <span className="material-symbols-outlined mr-2 text-lg">mail</span> Gửi thông báo lớp
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* AI Insights Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Analytics Card */}
          <section
            className="p-8 rounded-3xl border border-secondary-container/10"
            style={{ background: 'rgba(117, 49, 255, 0.05)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/20 rounded-lg mr-3">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <h2 className="font-headline font-bold text-lg">AI Insights</h2>
              </div>
              <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-1 rounded-full uppercase tracking-tighter">
                Live Analysis
              </span>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-on-surface-variant">Dự đoán rủi ro rớt môn</span>
                  <span className="text-2xl font-black text-error">12%</span>
                </div>
                <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[12%]"></div>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2 italic">
                  Dựa trên kết quả bài kiểm tra giữa kỳ và chuyên cần.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/15">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Phổ điểm dự kiến</h3>
                <div className="flex items-end space-x-2 h-32">
                  {['F', 'D', 'C', 'B', 'A'].map((grade, idx) => (
                    <div
                      key={grade}
                      className={`flex-1 bg-surface-container-highest rounded-t-md group relative ${
                        grade === 'C' ? 'bg-primary/40' : grade === 'B' ? 'bg-primary/80' : grade === 'A' ? 'bg-secondary' : ''
                      }`}
                      style={{ height: [20, 35, 60, 85, 45][idx] + '%' }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">
                        {grade}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant px-1">
                  <span>Yếu</span>
                  <span>Trung bình</span>
                  <span>Giỏi</span>
                </div>
              </div>
              <div className="bg-primary-50 p-4 rounded-2xl">
                <p className="text-xs text-primary-700 leading-relaxed">
                  <span className="font-bold">Gợi ý:</span> 5 sinh viên có dấu hiệu sụt giảm chuyên cần trong 2 tuần qua. Hãy thử gửi tin nhắn nhắc nhở.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/15">
              <span className="text-on-surface-variant text-xs font-medium">GPA Lớp</span>
              <p className="text-2xl font-black mt-1">3.12</p>
              <div className="flex items-center text-tertiary-600 text-[10px] font-bold mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +0.2
              </div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/15">
              <span className="text-on-surface-variant text-xs font-medium">Chuyên cần</span>
              <p className="text-2xl font-black mt-1">94%</p>
              <div className="flex items-center text-error text-[10px] font-bold mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_down</span> -2%
              </div>
            </div>
          </div>
        </div>

        {/* Student Table Section */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/15 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h2 className="font-headline font-bold text-lg">Danh sách Sinh viên</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
                </button>
                <button className="p-2 bg-surface-container-low rounded-lg hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">sort</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Sinh viên
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                      MSSV
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                      Chuyên cần
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">
                      GPA
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {students.map((student) => (
                    <StudentRow key={student.id} student={student} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-low/20">
              <p className="text-xs text-on-surface-variant">
                Hiển thị 4 trong tổng số {classData.studentCount} sinh viên
              </p>
              <div className="flex space-x-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white transition-all">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white transition-all text-xs">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white transition-all text-xs">
                  3
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white transition-all">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Row Component
function StudentRow({ student }: { student: Student }) {
  return (
    <tr className="hover:bg-surface-container-low transition-all group">
      <td className="px-6 py-4">
        <div className="flex items-center cursor-pointer">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${
              student.status === 'attention'
                ? 'bg-error-container text-error'
                : 'bg-primary-100 text-primary-600'
            }`}
          >
            {student.initial}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
              {student.name}
            </p>
            <p className="text-[11px] text-on-surface-variant">{student.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-center font-medium">{student.mssv}</td>
      <td className="px-6 py-4 text-center">
        <span
          className={`text-sm font-bold ${
            student.attendance >= 90
              ? 'text-tertiary-600'
              : student.attendance >= 80
              ? 'text-on-surface'
              : 'text-error'
          }`}
        >
          {student.attendance}%
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-bold">{student.gpa}</span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            student.status === 'attention'
              ? 'bg-error-container text-error'
              : 'bg-tertiary-100 text-tertiary-700'
          }`}
        >
          {student.status === 'attention' ? 'Cần chú ý' : 'Bình thường'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-1">
          <button
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-lg transition-all"
            title="Nhắn tin"
          >
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          </button>
          <button
            className="p-2 text-secondary hover:bg-white rounded-lg transition-all"
            title="Gắn cờ AI"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              flag
            </span>
          </button>
          <button
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-white rounded-lg transition-all"
            title="Xem hồ sơ"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
          </button>
        </div>
      </td>
    </tr>
  );
}