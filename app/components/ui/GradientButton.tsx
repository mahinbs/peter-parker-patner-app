'use client';

import type { ReactNode } from 'react';
import { HiArrowRight } from 'react-icons/hi';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  withArrow?: boolean;
  className?: string;
}

export default function GradientButton({
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  size = 'md',
  disabled = false,
  loading = false,
  withArrow = true,
  className = '',
}: GradientButtonProps) {
  const sizing = {
    sm: { padY: 'py-2', text: 'text-sm', chip: 'w-6 h-6', chipPad: 'pr-1.5 pl-4' },
    md: { padY: 'py-2.5', text: 'text-sm', chip: 'w-7 h-7', chipPad: 'pr-2 pl-5' },
    lg: { padY: 'py-3.5', text: 'text-base', chip: 'w-9 h-9', chipPad: 'pr-2 pl-6' },
  }[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative bg-gradient-to-r from-[#34C0CA] to-[#66BD59] text-white font-semibold rounded-full ${
        withArrow ? sizing.chipPad : 'px-5'
      } ${sizing.padY} inline-flex items-center justify-between gap-3 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{
        boxShadow:
          '0 8px 24px -8px rgba(52,192,202,0.55), 0 12px 32px -12px rgba(102,189,89,0.4)',
      }}
    >
      {loading ? (
        <span className={`${sizing.text} mx-auto flex items-center gap-2`}>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          <span className={`${sizing.text} ${fullWidth && withArrow ? 'mx-auto' : ''}`}>{children}</span>
          {withArrow && (
            <span
              className={`${sizing.chip} rounded-full bg-white flex items-center justify-center shrink-0`}
            >
              <HiArrowRight className="w-4 h-4 text-[#0F1415]" />
            </span>
          )}
        </>
      )}
    </button>
  );
}
