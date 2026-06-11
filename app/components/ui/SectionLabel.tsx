'use client';

import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <p className={`text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-1 mb-2 ${className}`}>
      {children}
    </p>
  );
}
