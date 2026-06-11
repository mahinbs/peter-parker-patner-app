'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock } from 'react-icons/fi';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { GradientButton, DarkInput } from '../../components/ui';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError) setError(signInError.message);
    else if (signInData.user) {
      await fetchProfile();
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 safe-bottom">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-4 bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shadow-xl p-3">
            <Image src="/icon.png" alt="" width={56} height={56} className="object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F1415] tracking-tight">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-2">Sign in to your valet partner account</p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-3">
          <DarkInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<FiMail size={18} />}
            error={errors.email?.message as string}
            {...(register('email', {
              required: 'Email is required',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
            }) as any)}
          />
          <DarkInput
            label="Password"
            type="password"
            placeholder="Your password"
            leftIcon={<FiLock size={18} />}
            error={errors.password?.message as string}
            {...(register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            }) as any)}
          />

          {error && (
            <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="pt-2">
            <GradientButton type="submit" fullWidth size="lg" loading={loading}>
              Sign in
            </GradientButton>
          </div>

          <p className="text-center text-sm text-neutral-500 pt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-[#34C0CA] font-semibold"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
