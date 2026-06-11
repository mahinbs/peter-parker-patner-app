'use client';

import type { ReactNode, MouseEventHandler } from 'react';

interface DarkCardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  noPadding?: boolean;
  glow?: boolean;
}

/**
 * Signature dark card surface — the panel used everywhere on the white page bg.
 * Matches user-app's design system.
 */
export default function DarkCard({
  children,
  className = '',
  onClick,
  noPadding = false,
  glow = false,
}: DarkCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#13191C] border border-white/10 shadow-xl text-white overflow-hidden ${
        noPadding ? '' : 'p-4'
      } ${onClick ? 'cursor-pointer active:scale-[0.99] transition' : ''} ${
        glow ? 'shadow-[0_8px_32px_-8px_rgba(102,189,89,0.35)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
