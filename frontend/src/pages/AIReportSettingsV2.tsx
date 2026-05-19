import { useState } from 'react';

const criteriaDefinitions = [
  {
    id: 'engagement',
    name: 'Mức độ tương tác',
    description: 'Đo lường tần suất và chất lượng tham gia lớp học.',
    icon: 'groups',
    color: 'blue',
  },
  {
    id: 'academic',
    name: 'Kết quả học tập',
    description: 'Điểm số bài tập, kiểm tra và tiến độ hoàn thành khóa học.',
    icon: 'school',
    color: 'teal',
  },
  {
    id: 'sentiment',
    name: 'Tâm lý & Tập trung',
    description: 'Phân tích thái độ qua văn bản và mức độ tập trung thị giác.',
    icon: 'psychology',
    color: 'purple',
  },
];

export default function AIReportSettingsV2() {
  const [weights, setWeights] = useState({
    engagement: 30,
    academic: 50,
    sentiment: 20,
  });

  const [customLogic, setCustomLogic] = useState({
    engagement: '',
    sentiment: '',
  });

  const handleWeightChange = (id: string, value: number) => {
    setWeights(prev => ({ ...prev, [id]: value }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Tùy chỉnh Tiêu chí Báo cáo AI
        </h1>
        <p className="text-gray-500 max-w-2xl leading-relaxed">
          Điều chỉnh các thông số và trọng số để AI cung cấp phân tích học thuật chính xác nhất theo phương pháp giảng dạy của bạn.
        </p>
      </div>

      {/* Weightage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {criteriaDefinitions.map((criteria) => (
          <div
            key={criteria.id}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-lg ${
                criteria.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                criteria.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <span className="material-symbols-outlined text-3xl">{criteria.icon}</span>
              </div>
              <input
                className={`w-16 bg-gray-100 border-none rounded-lg text-center font-bold focus:ring-2 transition-all ${
                  criteria.color === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                  criteria.color === 'teal' ? 'text-teal-600 focus:ring-teal-500' :
                  'text-purple-600 focus:ring-purple-500'
                }`}
                max={100}
                min={0}
                type="number"
                value={weights[criteria.id as keyof typeof weights]}
                onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value) || 0)}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{criteria.name}</h3>
            <p className="text-sm text-gray-500 mb-6 h-10 overflow-hidden">{criteria.description}</p>
            <input
              className={`w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer ${
                criteria.color === 'blue' ? 'accent-blue-600' :
                criteria.color === 'teal' ? 'accent-teal-600' :
                'accent-purple-600'
              }`}
              max={100}
              min={0}
              type="range"
              value={weights[criteria.id as keyof typeof weights]}
              onChange={(e) => handleWeightChange(criteria.id, parseInt(e.target.value))}
            />
            <div className="flex justify-between text-xs font-medium text-gray-400 mt-3">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Weight Warning */}
      {totalWeight !== 100 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">warning</span>
          <p className="text-red-700">
            Tổng trọng số hiện tại: <strong>{totalWeight}%</strong>. Tổng trọng số nên bằng 100% để đảm bảo kết quả phân tích chính xác.
          </p>
        </div>
      )}

      {totalWeight === 100 && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          <p className="text-green-700">
            Tổng trọng số: <strong>100%</strong>. Cấu hình hợp lệ!
          </p>
        </div>
      )}

      {/* Custom Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600">description</span>
            <h2 className="text-2xl font-bold text-gray-900">Định nghĩa tiêu chí</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-bold text-gray-900 mb-3">Logic cho "Tương tác"</label>
              <textarea
                className="w-full bg-white border-none rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 text-gray-600 leading-relaxed"
                placeholder="Ví dụ: Ưu tiên số lượng câu hỏi trong box chat, thời gian duy trì tab bài học liên tục > 10 phút, và tương tác với các câu đố nhanh (Pop-quizzes)."
                rows={4}
                value={customLogic.engagement}
                onChange={(e) => setCustomLogic(prev => ({ ...prev, engagement: e.target.value }))}
              ></textarea>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <label className="block text-sm font-bold text-gray-900 mb-3">Logic cho "Tâm lý & Tập trung"</label>
              <textarea
                className="w-full bg-white border-none rounded-lg p-4 text-sm focus:ring-2 focus:ring-purple-500 text-gray-600 leading-relaxed"
                placeholder="Ví dụ: AI cần phát hiện các từ khóa cảm xúc tiêu cực trong phản hồi bài tập. Sử dụng dữ liệu eye-tracking để đánh giá sự tập trung vào bài giảng video."
                rows={4}
                value={customLogic.sentiment}
                onChange={(e) => setCustomLogic(prev => ({ ...prev, sentiment: e.target.value }))}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="space-y-6">
          <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">save</span>
            Lưu cài đặt
          </button>
          <button className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">
            Khôi phục mặc định
          </button>
        </div>
      </div>
    </div>
  );
}