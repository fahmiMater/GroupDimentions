import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder = 'اختر...',
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white',
          error 
            ? 'border-error focus:ring-error' 
            : 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option 
            key={index} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
