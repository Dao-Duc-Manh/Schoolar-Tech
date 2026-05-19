import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecurityPasswordModal } from '@/components/Common';
import { useAuthStore } from '@/stores/authStore';

const isPasswordBreachWarning = (error: unknown) => {
  const response = (error as { response?: { data?: { code?: string; message?: string } } }).response?.data;
  const message = response?.message?.toLowerCase() ?? '';
  const code = response?.code?.toLowerCase() ?? '';

  return code.includes('breach') || message.includes('data breach') || message.includes('password breach');
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      const redirectPath = await login(identifier, password);
      navigate(redirectPath || '/student/dashboard');
    } catch (loginError) {
      if (isPasswordBreachWarning(loginError)) {
        setShowSecurityWarning(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <SecurityPasswordModal
        isOpen={showSecurityWarning}
        onClose={() => setShowSecurityWarning(false)}
      />

      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden items-center justify-center p-12 bg-primary">
        <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, #0040a1 0%, #0056d2 50%, #7531ff 100%)' }} />
        <div className="relative z-10 max-w-xl text-white">
          <span className="text-secondary-100 font-headline font-bold tracking-widest uppercase text-xs">Scholar Tech</span>
          <h1 className="mt-4 font-headline text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight">
            Cổng học vụ số
            <br />
            <span className="text-tertiary-100">an toàn và tập trung.</span>
          </h1>
          <p className="mt-6 text-lg text-primary-100 leading-relaxed font-light">
            Đăng nhập bằng tài khoản học vụ của bạn để truy cập bảng điểm, tài liệu, lớp học phụ trách và các công cụ học tập trên Scholar Tech.
          </p>

          <div className="mt-10 rounded-2xl bg-white/10 p-6 backdrop-blur border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="font-headline font-bold text-white mb-1">Xác thực từ hệ thống trung tâm</p>
                <p className="text-sm text-white/80">
                  Quyền truy cập được xác định từ tài khoản thực trên hệ thống. Giao diện công khai không hiển thị luồng quản trị riêng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          <header className="mb-8 text-left">
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">Đăng nhập</h2>
            <p className="text-on-surface-variant">Nhập email trường hoặc mã tài khoản cùng mật khẩu để tiếp tục.</p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1" htmlFor="identifier">
                  Email hoặc mã tài khoản
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="student1@school.edu.vn hoặc student1"
                  className="w-full px-5 py-4 rounded-xl bg-surface-container-highest border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl bg-surface-container-highest border-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline/50"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary-700"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            {error && !showSecurityWarning && <div className="p-3 rounded-lg bg-error-container text-error text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-headline font-bold text-lg shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Đăng nhập'}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <div className="p-3 rounded-lg bg-surface-container-low">
              <p className="text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                Nếu không nhớ tài khoản hoặc mật khẩu, vui lòng liên hệ bộ phận hỗ trợ học vụ.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
