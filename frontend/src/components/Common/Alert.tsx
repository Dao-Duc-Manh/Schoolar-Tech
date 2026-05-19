import type { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

interface TypeConfig {
  className: string;
  icon: string;
}

const typeConfigs: Record<AlertType, TypeConfig> = {
  success: { className: 'bg-green-50 border-l-4 border-green-400 p-4 rounded-r shadow-sm', icon: '✓' },
  error: { className: 'bg-red-50 border-l-4 border-red-400 p-4 rounded-r shadow-sm', icon: '⚠' },
  warning: { className: 'bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm', icon: '⚠' },
  info: { className: 'bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r shadow-sm', icon: 'ℹ' },
};

export function Alert({ 
  type = 'info', 
  children, 
  onClose, 
  className = '' 
}: AlertProps) {
  const config = typeConfigs[type];

  return (
    <div className={`flex items-start gap-3 ${config.className} ${className}`}>
      <span className="text-xl font-bold flex-shrink-0 mt-0.5 opacity-80">{config.icon}</span>
      <div className="flex-1 min-w-0 break-words">
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto -mt-0.5 text-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all flex-shrink-0"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

