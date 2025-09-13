import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition',
          error 
            ? 'border-error focus:ring-error' 
            : 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
