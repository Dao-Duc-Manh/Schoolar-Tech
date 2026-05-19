import { useState } from 'react';

const mockClassData = {
  code: 'CS202',
  name: 'Cấu trúc Dữ liệu',
  semester: 'Học kỳ 1 • 2023-2024',
  room: 'Phòng A102',
  students: 45,
  gpa: 3.12,
};

const mockStudents = [
  { id: '20225001', name: 'Lê Minh Anh', attendance: 95, midterm: 8.5, final: 9.0, status: 'good' },
  { id: '20225002', name: 'Nguyễn Quốc Huy', attendance: 88, midterm: 7.5, final: 8.0, status: 'good' },
  { id: '20225003', name: 'Phạm Thảo Vy', attendance: 92, midterm: 8.0, final: 8.5, status: 'good' },
  { id: '20225004', name: 'Vũ Thành Trung', attendance: 75, midterm: 6.0, final: 6.5, status: 'warning' },
  { id: '20225005', name: 'Đặng Mỹ Linh', attendance: 98, midterm: 9.0, final: 9.5, status: 'excellent' },
];

export default function ClassManagement() {
  const [students] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Quản lý Lớp học - <span className="text-blue-600">{mockClassData.code}</span>
          </h1>
          <p className="text-gray-500 mt-2">
            {mockClassData.name} • {mockClassData.semester} • {mockClassData.room} • {mockClassData.students} Sinh viên
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white text-blue-600 font-bold text-sm rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all">
            <span className="material-symbols-outlined mr-2 text-lg">download</span> Xuất báo cáo
          </button>
          <button className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            <span className="material-symbols-outlined mr-2 text-lg">mail</span> Gửi thông báo
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* AI Insights */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-purple-50/50 backdrop-blur-sm p-8 rounded-3xl border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <span className="material-symbols-outlined text-purple-600">psychology</span>
                </div>
                <h2 className="font-bold text-lg">AI Insights</h2>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-1 rounded-full uppercase">Live</span>
            </div>

            {/* Risk Prediction */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-gray-600">Dự đoán rủi ro rớt môn</span>
                  <span className="text-2xl font-black text-red-500">12%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 w-[12%]"></div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 italic">
                  Dựa trên kết quả bài kiểm tra giữa kỳ và chuyên cần.
                </p>
              </div>

              {/* Grade Distribution */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Phổ điểm dự kiến</h3>
                <div className="flex items-end space-x-2 h-32">
                  {['F', 'D', 'C', 'B', 'A'].map((grade, i) => (
                    <div key={grade} className="flex-1 bg-gray-200 rounded-t-md group relative" style={{ height: [20, 35, 60, 85, 45][i] + '%' }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100">{grade}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 px-1">
                  <span>Yếu</span>
                  <span>Trung bình</span>
                  <span>Giỏi</span>
                </div>
              </div>

              {/* Suggestion */}
              <div className="bg-blue-50 p-4 rounded-2xl">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-bold">Gợi ý:</span> 5 sinh viên có dấu hiệu sụt giảm chuyên cần trong 2 tuần qua. Hãy thử gửi tin nhắn nhắc nhở.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <span className="text-gray-500 text-xs font-medium">GPA Lớp</span>
              <p className="text-2xl font-black mt-1">{mockClassData.gpa}</p>
              <div className="flex items-center text-teal-600 text-[10px] font-bold mt-1">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +0.2
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <span className="text-gray-500 text-xs font-medium">Chuyên cần TB</span>
              <p className="text-2xl font-black mt-1">89%</p>
              <div className="flex items-center text-teal-600 text-[10px] font-bold mt-1">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span> +5%
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">Danh sách Sinh viên</h3>
                <p className="text-sm text-gray-500">{mockClassData.students} sinh viên đăng ký</p>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">STT</th>
                  <th className="px-6 py-4">Sinh viên</th>
                  <th className="px-6 py-4">Chuyên cần</th>
                  <th className="px-6 py-4">Giữa kỳ</th>
                  <th className="px-6 py-4">Cuối kỳ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{student.attendance}%</td>
                    <td className="px-6 py-4">{student.midterm}</td>
                    <td className="px-6 py-4">{student.final}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'excellent' ? 'bg-teal-100 text-teal-700' :
                        student.status === 'good' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status === 'excellent' ? 'Xuất sắc' :
                         student.status === 'good' ? 'Tốt' : 'Cần chú ý'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}