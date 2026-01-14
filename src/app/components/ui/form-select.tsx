import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';
import { Label } from './label';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  isDark?: boolean;
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  required = false,
  disabled = false,
  error,
  className,
  isDark = false,
}: FormSelectProps) {
  const selectId = React.useId();

  const baseSelectClass = cn(
    'w-full h-10 pl-3 pr-10 rounded-md border text-sm appearance-none transition-colors',
    'focus:outline-none focus:ring-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white focus:ring-[#fb2c36] focus:border-[#fb2c36]'
      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#fb2c36] focus:border-[#fb2c36]',
    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
    className
  );

  const labelClass = cn(
    'flex items-center gap-1',
    isDark ? 'text-gray-400' : 'text-gray-700'
  );

  const chevronClass = cn(
    'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none',
    isDark ? 'text-gray-500' : 'text-gray-400'
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId} className={labelClass}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={baseSelectClass}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className={chevronClass} />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
