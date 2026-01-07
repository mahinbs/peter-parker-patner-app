'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-[12px] transition-all duration-200 flex items-center justify-center gap-2 shadow-[var(--shadow-sm)]';
  
  const variantClasses = {
    primary:
      'bg-gradient-to-br from-[var(--color-primary-accent)] to-[var(--color-secondary-accent)] text-white shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-[1px]',
    secondary:
      'bg-[var(--color-primary-accent-light)] text-[var(--color-primary-dark)] border border-[var(--neutral-200)] hover:bg-[var(--color-secondary-accent-light)]',
    outline:
      'border-2 border-[var(--color-primary-accent)] text-[var(--color-primary-accent)] hover:bg-[var(--color-primary-accent-light)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[var(--shadow-md)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

