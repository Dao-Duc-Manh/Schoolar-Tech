import { useEffect, useState } from 'react';

interface SecurityPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function SecurityPasswordModal({ isOpen, onClose, onConfirm }: SecurityPasswordModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // keep isVisible in sync with isOpen
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsClosing(false);
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Chỉ đồng bộ state sau khi render, tránh setState đồng bộ gây warning/cascade
    const t = window.setTimeout(() => {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  const closeWithTransition = () => {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 180);
  };

  const handleConfirm = () => {
    onConfirm?.();
    closeWithTransition();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px] transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeWithTransition();
      }}
    >
      <section
        aria-labelledby="security-password-title"
        aria-describedby="security-password-message"
        aria-modal="true"
        className={`relative w-[min(420px,80vw)] rounded-2xl border border-white/80 bg-gradient-to-b from-white to-slate-50 px-6 pb-6 pt-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition-all duration-200 max-[480px]:px-5 max-[480px]:pb-5 ${
          isClosing ? 'translate-y-2 scale-[0.98] opacity-0' : 'translate-y-0 scale-100 opacity-100'
        }`}
        role="dialog"
      >
        <button
          type="button"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-2xl leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Close password warning"
          onClick={closeWithTransition}
        >
          ×
        </button>

        <div className="mx-auto mb-4 flex items-center justify-center gap-3 pr-6">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-base font-extrabold text-amber-700 shadow-[0_0_0_5px_rgba(245,158,11,0.14)]">
            !
          </span>
          <h2 id="security-password-title" className="font-headline text-xl font-bold leading-tight text-slate-950 max-[480px]:text-lg">
            Change your password
          </h2>
        </div>

        <p id="security-password-message" className="mx-auto max-w-[340px] text-sm leading-6 text-slate-600 max-[480px]:text-[14px]">
          The password you just used was found in a data breach. Password Manager recommends changing this password now.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex min-h-11 min-w-28 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:translate-y-0 active:scale-[0.98]"
          onClick={handleConfirm}
        >
          OK
        </button>
      </section>
    </div>
  );
}
