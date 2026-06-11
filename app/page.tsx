'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store/useAuthStore';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
    else router.push('/auth/login');
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shadow-xl p-3 mb-5">
          <Image src="/icon.png" alt="" width={64} height={64} className="object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#34C0CA] to-[#66BD59] bg-clip-text text-transparent">
          Valet Partner
        </h1>
        <div className="mt-6 w-10 h-10 border-4 border-neutral-200 border-t-[#66BD59] rounded-full animate-spin" />
      </div>
    </div>
  );
}
