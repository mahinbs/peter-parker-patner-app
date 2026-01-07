'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store/useAuthStore';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/icon.png"
            alt="Valet Partner Logo"
            width={160}
            height={160}
            className="mx-auto"
          />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Valet Partner</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
