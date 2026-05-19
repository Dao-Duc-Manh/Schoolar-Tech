import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    id, 
    ...props 
  }, ref) => {
    const inputId = id || (props.name as string);

    const baseClasses = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200';

    return (
      <div className="w-full space-y-1">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${baseClasses}
            ${error ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-transparent' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}
            ${className}
          `.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-help`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
