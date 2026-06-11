'use client';

import type { ReactNode } from 'react';
import { HiChevronRight } from 'react-icons/hi';

interface ListRowProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  iconBg?: string;
  iconColor?: string;
  destructive?: boolean;
  className?: string;
}

export default function ListRow({
  icon,
  label,
  description,
  trailing,
  onClick,
  iconBg = 'rgba(52,192,202,0.15)',
  iconColor = '#34C0CA',
  destructive = false,
  className = '',
}: ListRowProps) {
  const content = (
    <>
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: destructive ? 'rgba(239,68,68,0.15)' : iconBg,
            color: destructive ? '#EF4444' : iconColor,
          }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${destructive ? 'text-[#EF4444]' : 'text-white'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-white/85 leading-tight mt-0.5">{description}</p>
        )}
      </div>
      {trailing ?? (onClick && <HiChevronRight className="w-5 h-5 text-white/85 shrink-0" />)}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 py-3 active:opacity-70 transition ${className}`}
      >
        {content}
      </button>
    );
  }
  return <div className={`flex items-center gap-3 py-3 ${className}`}>{content}</div>;
}
