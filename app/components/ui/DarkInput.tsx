'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface DarkInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

/**
 * Light-themed input that forwards its ref so react-hook-form's `register()`
 * can wire up validation. Spread any native <input> props onto it.
 */
const DarkInput = forwardRef<HTMLInputElement, DarkInputProps>(function DarkInput(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconClick,
    className = '',
    required,
    ...inputProps
  },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#0F1415] mb-2">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          required={required}
          className={`w-full ${leftIcon ? 'pl-12' : 'pl-4'} ${rightIcon ? 'pr-12' : 'pr-4'} py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15 text-base text-[#0F1415] placeholder-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400 transition ${
            error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/15' : ''
          } ${className}`}
          {...inputProps}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 active:scale-95 transition"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#EF4444]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
});

export default DarkInput;
