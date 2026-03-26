'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock } from 'react-icons/fi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

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
    try {
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (signInData.user) {
        await fetchProfile();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/icon.png"
            alt="Valet Partner Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your valet partner account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon={<FiMail />}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              error={errors.email?.message}
            />
            
            <Input
              label="Password"
              type="password"
              icon={<FiLock />}
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={errors.password?.message}
            />

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>

            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/register')}
                className="text-teal-600 dark:text-teal-400 font-semibold"
              >
                Register
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
