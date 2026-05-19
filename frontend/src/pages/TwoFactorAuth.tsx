import { useState } from 'react';

export default function TwoFactorAuth() {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('2FA Code:', code);
    // Handle 2FA verification
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 w-full max-w-md relative overflow-hidden">
        {/* AI Texture Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 opacity-20 rounded-bl-full -mr-16 -mt-16"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-blue-600 text-3xl">
                security
              </span>
            </div>
            <h2 className="font-bold text-2xl text-gray-900 text-center">
              Xác thực 2 lớp (2FA)
            </h2>
            <p className="text-gray-500 text-sm text-center mt-3 leading-relaxed">
              Nhập mã bảo mật 6 chữ số từ ứng dụng xác thực của bạn để tiếp tục truy cập vào hệ thống.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 ml-1">
                Mã xác thực
              </label>
              <div className="relative">
                <input
                  className="w-full h-14 bg-gray-100 border-none rounded-lg text-center text-2xl font-bold tracking-[0.5em] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:bg-gray-50 transition-all"
                  id="2fa-code"
                  maxLength={6}
                  placeholder="000 000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  type="text"
                />
              </div>
            </div>

            {/* Confirm Button */}
            <button
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              type="submit"
            >
              Xác nhận
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 flex flex-col items-center space-y-4">
            <a className="text-blue-600 font-semibold text-sm hover:underline decoration-2 underline-offset-4 transition-all" href="/verify-2fa">
              Sử dụng mã dự phòng
            </a>
            <div className="w-full h-[1px] bg-gray-200 opacity-50"></div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">help_outline</span>
              Bạn gặp sự cố khi đăng nhập?{' '}
              <a className="text-blue-600 hover:text-blue-700 font-medium" href="/settings">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed bottom-8 text-center w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Giao thức Bảo mật Atheneum
        </p>
      </div>
    </div>
  );
}