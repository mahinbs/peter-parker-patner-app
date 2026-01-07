'use client';

import { ReactNode } from 'react';
import MobileLayout from './MobileLayout';

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <>
      {/* Mobile View (sm-md) - No changes, full screen */}
      <div className="block lg:hidden">
        <MobileLayout>{children}</MobileLayout>
      </div>

      {/* Desktop/Laptop View (lg+) - Centered mobile container */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:min-h-screen lg:bg-gradient-to-br from-[var(--neutral-100)] to-[var(--neutral-200)] lg:p-6">
        <div className="w-full max-w-md h-full max-h-[900px] bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-[var(--neutral-200)]">
          <div className="h-full overflow-y-auto">
            <MobileLayout>{children}</MobileLayout>
          </div>
        </div>
      </div>
    </>
  );
}

