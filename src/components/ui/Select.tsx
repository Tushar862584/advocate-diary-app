import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder = '-- Select an option --',
      error,
      helperText,
      fullWidth = true,
      className = '',
      containerClassName = '',
      labelClassName = '',
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label className={`mb-1 block text-sm font-medium ${labelClassName}`}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={`rounded-md border border-gray-300 p-2 ${
            fullWidth ? 'w-full' : ''
          } ${disabled ? 'bg-gray-100 text-gray-500' : ''} ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
); 