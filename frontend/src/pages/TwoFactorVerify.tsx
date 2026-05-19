import { useState, useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function TwoFactorVerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-submit when complete
    if (newCode.join('').length === 6 && newCode.every((digit) => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    // In a real app, this would verify with the backend
    console.log('Verifying code:', fullCode);
    navigate('/dashboard');
  };

  const handleResend = () => {
    // Resend the code
    console.log('Resending code...');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-primary items-center justify-center p-12">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #0040a1 0%, #0056d2 50%, #7531ff 100%)',
          }}
        />

        <div className="relative z-10 max-w-xl text-white">
          <div className="mb-12">
            <span className="text-secondary-100 font-headline font-bold tracking-widest uppercase text-xs">
              Bảo mật 2 lớp
            </span>
            <h1 className="mt-4 font-headline text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight">
              Xác thực <br />
              <span className="text-tertiary-100">Two-Factor.</span>
            </h1>
          </div>
          <p className="text-lg text-primary-100 leading-relaxed font-light mb-8">
            Chúng tôi đã gửi mã xác thực 6 số đến thiết bị của bạn. Mã này sẽ hết hạn sau 5 phút.
          </p>

          {/* Verification Method Info */}
          <div
            className="p-6 rounded-xl flex items-start gap-4 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-3 rounded-lg" style={{ background: 'rgba(104, 250, 221, 0.2)' }}>
              <span className="material-symbols-outlined text-tertiary-100" style={{ fontVariationSettings: "'FILL' 1" }}>
                phone_android
              </span>
            </div>
            <div>
              <p className="font-headline font-bold text-white mb-1">Mã được gửi đến</p>
              <p className="text-sm text-white/80">•••• •••• 1234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          <header className="mb-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Xác thực 2 bước
            </div>
            <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">
              Nhập mã xác thực
            </h2>
            <p className="text-on-surface-variant">
              Nhập 6 chữ số được gửi đến thiết bị của bạn.
            </p>
          </header>

          {/* Code Input */}
          <div className="space-y-8">
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-surface-container-highest rounded-xl border-2 border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              ))}
            </div>

            <button
              className="w-full py-4 rounded-xl bg-primary text-white font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              onClick={() => handleVerify(code.join(''))}
            >
              Xác nhận
            </button>

            <div className="text-center">
              <p className="text-on-surface-variant text-sm">
                Không nhận được mã?{' '}
                <button onClick={handleResend} className="text-primary font-bold hover:underline">
                  Gửi lại
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}