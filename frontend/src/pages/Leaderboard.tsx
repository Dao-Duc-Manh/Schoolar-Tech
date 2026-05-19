import { useState } from 'react';

// Mock data for leaderboard
const mockStudents = [
  {
    rank: 1,
    name: 'Lê Minh Anh',
    major: 'Kinh tế Đối ngoại',
    lessons: 42,
    points: 5200,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdOvNiich6wi6S-9G2G50wp8y0WvDP0u33eIby1lmutXpXsdZF1StY0szv769QzunPceGV-1uIXqL-xMLNZB4TZSfRkgl5iTGiyhxgTp0th-boPqoUaifw6W8yuvmQHAMXNSwFXXnn0QdSeSGkGazA1mc7gimUsUtf8kz3ev22YloyjPa75_qPwSo_sp_9hEB8eLWtjCaPyxDRAKqHI91ctMLO24t0n-9h2Rn2oTxmfMjKdkCLpPZ0HgRRFw_JrBLXtpoLdP6ugVY',
  },
  {
    rank: 2,
    name: 'Nguyễn Quốc Huy',
    major: 'Khoa học Máy tính',
    lessons: 38,
    points: 4850,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASzUbn8-cOkWXH1fmp0RhYjM7TMRMpiwAe0b8jCeVFiLj0UDBGSFZkW6_qNehZCkhUvufodfYunFWfK3zHkVDJn9ugVoi6DI_pYCegJf4HKjTkR0Z8lfNp1d_f0H9L9ce8McO0pfLEtUKFrUJDJ0e2nt0siWPEMN1h3788Go9j9g1iGdOpCNK3Aaa8i18ZDMFJbEEfY-e9O9DdrmsOw6cnX1xQO5OfXzgyHjnmI01pqoatwWlp4PKHIsuBJBsococc4Ozyt6mdkhU',
  },
  {
    rank: 3,
    name: 'Phạm Thảo Vy',
    major: 'Ngôn ngữ Anh',
    lessons: 35,
    points: 4100,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVbLpPiSbleas6b4WKVlZVrC48JImxpUrfLmORXNb1K32_NXD2RKNlm1hmuIAk7-YmR3hCWELH0X2SkviuAXsBH9upitFxSTMRoimL0JLrL1D649LCWJP794N_ezzcsVhfOgNyDojbx3in98nY6kkDty_5p7UuZ4pTroPDxZKrI-LX5jv492ni1Xlho2hvRES4BlEkbxMqQ5IuY5Lq-DWVJXho9p8NkpjAM5oHs5tNnCY7DzXYy1HwgrrKUvRrY2VYJ3GVnpTSkKs',
  },
  {
    rank: 4,
    name: 'Vũ Thành Trung',
    major: 'Marketing',
    lessons: 30,
    points: 3750,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnjz4agdDd1xZgdca1NfTuZsU0b_dWLuUtLuso0uFVZB_ZMjElNATIOfKndDbP_In9LwsWY8K2CnW2kasIp0FiA3TDHoEjtdL9aoVhPqFUY68bWAvLR8liDXG_vwcbev2VJFbVK76WWY3h5uEK9T0qnJNNSUwZkWyKiqybRQDhPW4-vSji_Nll_aDoyIV6TKNBANBlSX_QbXkoLy8hTOsiaScKBdZzddXG-9dS3jKMMocxkCdoprbL1TPC-5fR5zMPdCI5QZsN9Wc',
  },
  {
    rank: 5,
    name: 'Đặng Mỹ Linh',
    major: 'Tài chính',
    lessons: 28,
    points: 3200,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWoTaknYng9rKc1BFJuqAnLmTkxu9Ggf8zD88VztaxgbpeNipjm7mgRQ9xUGplk9cSh02WKXXZzeJ_rVQJKW4DneSqiwoxlzcFWjn6kBiL8K6Em23Yp99DCqa_bCfksH75055jEj8ttdHlJY_x_W5ZLMvQlKoDLF31IXgR7F_dVzOCEqRRGjz0tqxGHvX-EcgS94XKM_GPgv0ndYiwJsdLTzTelHKw7lTniVISruERzevgp_h363WLQGU9Sw6U31eEMBe13dVLZ84',
  },
];

const rewards = [
  { icon: 'eco', name: 'Mầm non Kiên trì', unlocked: true },
  { icon: 'auto_awesome', name: 'Chiến binh Bóng đêm', unlocked: false },
  { icon: 'shield', name: 'Hộ vệ Tập trung', unlocked: true },
  { icon: 'hotel_class', name: 'Huyền thoại Ngoại tuyến', unlocked: false },
];

export default function Leaderboard() {
  const [currentUser] = useState({
    name: 'Trần Hoàng Nam',
    major: 'Sinh viên năm 3 • CNTT',
    rank: 12,
    points: 2450,
    isPro: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA39kQ4s-KCv6cw_jjkDr5CtJG6SguWT6njdQBfHdd7j5Rwf_dYv91_DQSVyiBFsCmF5moPHoVM1YE6xFjJYIROCy3H_nCzkwpc59e1d1M5qABgd8NaGzjV67D7ezGiWwiKCGCuqUwWmwNVu2psmoZ5Y7c5FuHJfxHRgZr4j-0iv9hgA5Vg_qgb6zKVL1154wgFXbWbjDBiPud4p3m-VK5L8r1_saTh0K6rV0VlUeRDhCNvMAqEnnaCVT22doeZpECIsfUBqqIJCsw',
  });

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-[#FFD700]';
      case 2:
        return 'bg-[#C0C0C0]';
      case 3:
        return 'bg-[#CD7C32]';
      default:
        return 'bg-surface-container';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Bảng xếp hạng Học tập Ngoại tuyến
            </h1>
            <p className="text-gray-600">
              Khen thưởng sự tự giác của bạn khi học tập không có kết nối internet.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Cập nhật lần cuối
              </p>
              <p className="text-sm font-semibold text-gray-700">2 giờ trước (Offline)</p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-md font-bold shadow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">sync</span>
              Đồng bộ ngay
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Personal Stats Card */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <img
                    alt="User Profile"
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                    src={currentUser.avatar}
                  />
                  {currentUser.isPro && (
                    <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Pro
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentUser.name}</h3>
                  <p className="text-sm text-gray-500">{currentUser.major}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Thứ hạng hiện tại
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                      #{currentUser.rank}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-blue-600 text-4xl">
                    trending_up
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Điểm tích lũy Offline
                    </p>
                    <p className="text-3xl font-black text-purple-600">
                      {currentUser.points.toLocaleString()}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-purple-600 text-4xl">
                    offline_bolt
                  </span>
                </div>
              </div>
            </div>

            {/* Offline Rewards */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">
                  workspace_premium
                </span>
                Phần thưởng Offline
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {rewards.map((reward, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-4 bg-gray-100 rounded-lg text-center transition-colors cursor-default ${
                      !reward.unlocked ? 'opacity-40 grayscale' : 'hover:bg-blue-50'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl mb-2 ${
                        reward.unlocked
                          ? 'text-teal-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {reward.icon}
                    </span>
                    <p className="text-xs font-bold leading-tight">{reward.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-xl font-bold">Top sinh viên tích cực</h3>
              <p className="text-sm text-gray-500">
                Dựa trên số lượng bài học hoàn thành ngoại tuyến tuần này
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-4 w-16">Thứ hạng</th>
                    <th className="px-8 py-4">Sinh viên</th>
                    <th className="px-8 py-4">Bài học</th>
                    <th className="px-8 py-4 text-right">Điểm Offline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockStudents.map((student) => (
                    <tr
                      key={student.rank}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-8 py-5">
                        <div
                          className={`w-8 h-8 rounded-full ${getRankColor(
                            student.rank
                          )} text-gray-900 font-black flex items-center justify-center text-sm shadow-sm`}
                        >
                          {student.rank}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover"
                            src={student.avatar}
                          />
                          <div>
                            <p className="font-bold">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.major}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {student.lessons} bài
                          </span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600"
                              style={{
                                width: `${(student.lessons / 42) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-blue-600">
                        {student.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 text-center">
              <button className="text-blue-600 font-bold hover:underline">
                Xem tất cả bảng xếp hạng
              </button>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="col-span-12 bg-purple-50/50 backdrop-blur-sm p-8 rounded-xl flex items-center gap-8 border border-purple-100">
            <div className="bg-purple-600 p-4 rounded-full">
              <span className="material-symbols-outlined text-white text-4xl">
                psychology
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-purple-600 mb-1">
                Gợi ý từ AI: Tăng hiệu suất ngoại tuyến
              </h4>
              <p className="text-gray-500 italic">
                "Dựa trên thói quen của bạn, học vào khung giờ 20:00 - 22:00
                khi ngắt kết nối internet giúp bạn hoàn thành thêm 3 bài học mỗi
                tối. Hãy thử hôm nay để thăng hạng!"
              </p>
            </div>
            <button className="text-purple-600 border-2 border-purple-600 px-6 py-2 rounded-md font-bold hover:bg-purple-600 hover:text-white transition-all">
              Thiết lập mục tiêu
            </button>
          </div>
        </div>
      </div>
  );
}