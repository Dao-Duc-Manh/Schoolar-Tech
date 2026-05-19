import { useState } from 'react';

const mockStats = {
  avgGpa: 3.42,
  attendance: 94.8,
  excellentRate: 28.5,
  aiEngagement: 82,
};

const mockGradeDistribution = [
  { range: '0-5.0', old: 30, current: 20 },
  { range: '5.1-6.5', old: 25, current: 28 },
  { range: '6.6-8.0', old: 35, current: 38 },
  { range: '8.1-10', old: 10, current: 14 },
];

const mockStudents = [
  { id: 1, name: 'Lê Minh Anh', gpa: 3.95, attendance: 98, status: 'excellent' },
  { id: 2, name: 'Nguyễn Quốc Huy', gpa: 3.78, attendance: 95, status: 'excellent' },
  { id: 3, name: 'Phạm Thảo Vy', gpa: 3.65, attendance: 92, status: 'good' },
  { id: 4, name: 'Vũ Thành Trung', gpa: 3.42, attendance: 88, status: 'good' },
  { id: 5, name: 'Đặng Mỹ Linh', gpa: 3.21, attendance: 85, status: 'average' },
];

export default function SemesterReport() {
  const [_selectedPeriod] = useState('hk1-2024');

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Báo cáo Tổng kết Học kỳ 1 - 2024
        </h2>
        <p className="text-gray-500 max-w-2xl">
          Phân tích chuyên sâu về hiệu suất học tập, mức độ tham gia và dự báo
          xu hướng sinh viên dựa trên nền tảng AI Scholar Tech.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-blue-100 rounded-lg text-blue-600 material-symbols-outlined">
              grade
            </span>
            <span className="text-teal-600 text-xs font-bold">+0.4 so với HK trước</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">GPA Trung bình Lớp</p>
            <h3 className="text-4xl font-bold text-gray-900">{mockStats.avgGpa}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-purple-100 rounded-lg text-purple-600 material-symbols-outlined">
              event_available
            </span>
            <span className="text-teal-600 text-xs font-bold">+2.1%</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Tỷ lệ chuyên cần</p>
            <h3 className="text-4xl font-bold text-gray-900">{mockStats.attendance}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-teal-100 rounded-lg text-teal-600 material-symbols-outlined">
              workspace_premium
            </span>
            <span className="text-red-500 text-xs font-bold">-1.2%</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Tỷ lệ Giỏi/Xuất sắc</p>
            <h3 className="text-4xl font-bold text-gray-900">{mockStats.excellentRate}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 hover:-translate-y-1 transition-transform border border-purple-100">
          <div className="flex justify-between items-start">
            <span className="p-3 bg-purple-100 rounded-lg text-purple-600 material-symbols-outlined">
              bolt
            </span>
            <span className="text-purple-600 text-xs font-bold">Cao (Optimum)</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Mức độ tương tác AI</p>
            <h3 className="text-4xl font-bold text-gray-900">{mockStats.aiEngagement}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Distribution */}
        <div className="bg-white p-8 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-lg">Phổ điểm so với kỳ trước</h4>
            <span className="material-symbols-outlined text-gray-400 cursor-pointer">
              more_vert
            </span>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 pt-10">
            {mockGradeDistribution.map((item, index) => (
              <div key={index} className="flex-grow flex flex-col items-center gap-2 group">
                <div className="w-full flex gap-1 items-end h-full">
                  <div
                    className="w-1/2 bg-gray-300 rounded-t-sm"
                    style={{ height: `${item.old}%` }}
                  ></div>
                  <div
                    className="w-1/2 bg-blue-600 rounded-t-sm"
                    style={{ height: `${item.current}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
              <span className="text-xs text-gray-500">HK trước</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              <span className="text-xs text-gray-500">HK này</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">psychology</span>
            <h4 className="font-bold text-lg">AI Insights</h4>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-gray-900 mb-2">Xu hướng cải thiện</p>
              <p className="text-xs text-gray-500">
                So với học kỳ trước, tỷ lệ sinh viên đạt điểm cao (8.1-10) tăng 4%.
                Điều này cho thấy hiệu quả của phương pháp giảng dạy kết hợp AI.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-gray-900 mb-2">Khuyến nghị</p>
              <p className="text-xs text-gray-500">
                Cần chú ý nhóm sinh viên ở mức 5.1-6.5, nên tăng cường tài liệu bổ
                trợ và buổi tư vấn học tập cá nhân.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-bold text-lg">Danh sách sinh viên xuất sắc</h4>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">STT</th>
              <th className="px-6 py-4">Sinh viên</th>
              <th className="px-6 py-4">GPA</th>
              <th className="px-6 py-4">Chuyên cần</th>
              <th className="px-6 py-4">Xếp loại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{index + 1}</td>
                <td className="px-6 py-4 font-medium">{student.name}</td>
                <td className="px-6 py-4">{student.gpa}</td>
                <td className="px-6 py-4">{student.attendance}%</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.status === 'excellent'
                        ? 'bg-teal-100 text-teal-700'
                        : student.status === 'good'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {student.status === 'excellent'
                      ? 'Xuất sắc'
                      : student.status === 'good'
                      ? 'Tốt'
                      : 'Trung bình'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}