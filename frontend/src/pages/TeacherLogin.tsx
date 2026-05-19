import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function TeacherLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('lecturer1@school.edu.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectPath = await login(email, password);
      navigate(redirectPath || '/lecturer/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Narrative */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-primary items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full opacity-40 mix-blend-luminosity"
            style={{
              background: 'linear-gradient(135deg, #0040a1 0%, #0056d2 50%, #7531ff 100%)',
            }}
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-xl text-white">
          <div className="mb-12">
            <span className="text-secondary-100 font-headline font-bold tracking-widest uppercase text-xs">
              Thư viện số Atheneum
            </span>
            <h1 className="mt-4 font-headline text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight">
              Tri thức là <br />
              <span className="text-tertiary-100">Sự khai sáng.</span>
            </h1>
          </div>
          <p className="text-lg text-primary-100 leading-relaxed font-light mb-8">
            Bước vào thánh đường học thuật nơi trí tuệ nhân tạo giao thoa cùng truyền thống giáo dục.
            Cổng thông tin dành riêng cho Giảng viên và Cán bộ nghiên cứu.
          </p>

          {/* Floating Glass Feature Card */}
          <div
            className="p-6 rounded-xl flex items-start gap-4 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-3 rounded-lg" style={{ background: 'rgba(117, 49, 255, 0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <div>
              <p className="font-headline font-bold text-white mb-1">Xác thực Bảo mật Cao</p>
              <p className="text-sm text-white/80">
                Hệ thống bảo mật đa lớp bảo vệ các công trình nghiên cứu và dữ liệu học thuật quan trọng của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 p-8 opacity-20">
          <span className="material-symbols-outlined text-[12rem]">account_balance</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface">
        {/* Mobile Brand Header */}
        <div className="md:hidden self-start mb-12">
          <span className="text-2xl font-headline font-extrabold tracking-tighter text-primary">Atheneum</span>
        </div>

        <div className="w-full max-w-md">
          <header className="mb-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">school</span>
              Dành cho Giảng viên
            </div>
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">Đăng nhập</h2>
            <p className="text-on-surface-variant">Truy cập vào kho lưu trữ kỹ thuật số và công cụ giảng dạy.</p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all text-sm font-semibold border border-transparent hover:border-outline-variant/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all text-sm font-semibold border border-transparent hover:border-outline-variant/30"
              >
                <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-surface-container-highest"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-widest">
                hoặc tài khoản nội bộ
              </span>
              <div className="flex-grow border-t border-surface-container-highest"></div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="group">
                <label
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1"
                  htmlFor="email"
                >
                  Mã số Giảng viên / Email
                </label>
                <input
                  className="w-full px-5 py-4 rounded-xl bg-surface-container-highest border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
                  id="email"
                  name="email"
                  placeholder="giangvien@truongdaihoc.edu.vn"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="group">
                <label
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    className="w-full px-5 py-4 rounded-xl bg-surface-container-highest border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-error text-sm">{error}</div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-5 h-5 rounded border-2 border-outline-variant peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                  <span className="material-symbols-outlined absolute inset-0 text-white text-sm scale-0 peer-checked:scale-100 flex items-center justify-center transition-transform">
                    check
                  </span>
                </div>
                <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-on-surface">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link className="text-sm font-semibold text-primary hover:text-primary-700 transition-colors" to="/forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-700 text-white font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-on-surface-variant">
              Bạn là sinh viên?
              <Link className="text-secondary font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/login">
                Đăng nhập tại đây
              </Link>
            </p>
          </footer>
        </div>

        {/* Secondary Footer */}
        <div className="mt-auto pt-12 flex gap-6 text-xs font-medium text-outline">
          <a className="hover:text-on-surface transition-colors" href="/settings">
            Chính sách bảo mật
          </a>
          <a className="hover:text-on-surface transition-colors" href="/settings">
            Liêm chính học thuật
          </a>
          <a className="hover:text-on-surface transition-colors" href="/settings">
            Hỗ trợ kỹ thuật
          </a>
        </div>
      </div>
    </div>
  );
}