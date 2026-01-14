import * as React from 'react';
import { cn } from './utils';
import { Label } from './label';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  isDark?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className,
  isDark = false,
  type = 'text',
  ...props
}: FormInputProps) {
  const inputId = React.useId();

  const baseInputClass = cn(
    'w-full h-10 px-3 rounded-md border text-sm transition-colors',
    'focus:outline-none focus:ring-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600 focus:ring-[#fb2c36] focus:border-[#fb2c36]'
      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-[#fb2c36] focus:border-[#fb2c36]',
    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
    className
  );

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={labelClass}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={baseInputClass}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
