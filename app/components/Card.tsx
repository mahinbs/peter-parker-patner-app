'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  className = '', 
  onClick,
  padding = 'md' 
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const Component = onClick ? motion.div : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-[var(--color-surface)] border border-[var(--neutral-200)] rounded-2xl shadow-[var(--shadow-card)]
        ${paddingClasses[padding]} transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-[var(--shadow-card-hover)]' : ''}
        ${className} card-premium
      `}
    >
      {children}
    </Component>
  );
}

