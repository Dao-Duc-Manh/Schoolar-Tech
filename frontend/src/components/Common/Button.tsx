import { forwardRef, type ReactNode } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'px-3 py-1.5 text-sm h-9',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    };

    const variantClasses: Record<'primary' | 'secondary' | 'outline' | 'danger' | 'ghost', string> = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size!]} ${variantClasses[variant!]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1zm10 0a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1zM4 9a1 1 0 011 1v4a1 1 0 11-2 0V10a1 1 0 011-1zm10 0a1 1 0 011 1v4a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

