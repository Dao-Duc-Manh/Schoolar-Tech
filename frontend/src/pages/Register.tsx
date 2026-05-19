import { RegisterForm } from '@/components/Auth';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-primary items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full opacity-40 mix-blend-luminosity"
            style={{
              background: 'linear-gradient(135deg, #005145 0%, #209d8a 50%, #5b00df 100%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-xl text-white">
          <span className="text-secondary-100 font-headline font-bold tracking-widest uppercase text-xs">
            Thư viện số Atheneum
          </span>
          <h1 className="mt-4 font-headline text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight">
            Tham gia <br />
            <span className="text-tertiary-100">cộng đồng.</span>
          </h1>
          <p className="mt-4 text-lg text-primary-100 leading-relaxed font-light">
            Đăng ký bằng tài khoản do Trường Đại học cấp để bắt đầu hành trình học tập của bạn.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 p-8 opacity-20">
          <span className="material-symbols-outlined text-[12rem]">school</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface">
        <div className="md:hidden self-start mb-8">
          <span className="text-2xl font-headline font-extrabold tracking-tighter text-primary">Atheneum</span>
        </div>
        <div className="w-full max-w-md">
          <header className="mb-8 text-left">
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-on-surface-variant text-sm">
              Đăng ký bằng email do Trường cấp. Role sẽ được gán tự động.
            </p>
          </header>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}