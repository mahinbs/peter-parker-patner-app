'use client';

import type { ReactNode } from 'react';
import GradientButton from './GradientButton';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center px-6 py-12 ${className}`}>
      {icon && (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#34C0CA]/15 to-[#66BD59]/15 border border-[#66BD59]/25 flex items-center justify-center mb-5 text-[#66BD59]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#0F1415]">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 mt-2 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <GradientButton onClick={onAction} className="mt-6">
          {actionLabel}
        </GradientButton>
      )}
    </div>
  );
}
