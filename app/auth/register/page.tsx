'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiMail, FiMapPin, FiLock } from 'react-icons/fi';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { GradientButton, DarkInput } from '../../components/ui';

interface RegisterForm {
  name: string;
  phone: string;
  email: string;
  city: string;
  operatingArea: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'otp' | 'password'>('details');
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetailsSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStep('otp');
  };

  const handleOTPSubmit = async () => {
    setLoading(true);
    setError(null);
    const { email } = watch();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.join(''),
      type: 'email',
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStep('password');
  };

  const handlePasswordSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: data.password });
      if (authError) throw authError;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: data.name,
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          zone: data.operatingArea,
          role: 'partner',
        });
      }
      router.push('/kyc/identity');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 7) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 safe-bottom">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-4 bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shadow-xl p-3">
            <Image src="/icon.png" alt="" width={56} height={56} className="object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F1415] tracking-tight">Join as partner</h1>
          <p className="text-sm text-neutral-500 mt-2">Create your valet partner account</p>
        </div>

        {step === 'details' && (
          <form onSubmit={handleSubmit(handleDetailsSubmit)} className="space-y-3">
            <DarkInput
              label="Full name"
              placeholder="Your name"
              leftIcon={<FiUser size={18} />}
              error={errors.name?.message as string}
              {...(register('name', { required: 'Name is required' }) as any)}
            />
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
              label="Phone"
              type="tel"
              placeholder="10-digit number"
              leftIcon={<FiPhone size={18} />}
              error={errors.phone?.message as string}
              {...(register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[0-9]{10}$/, message: '10-digit phone number' },
              }) as any)}
            />
            <DarkInput
              label="City"
              placeholder="Your city"
              leftIcon={<FiMapPin size={18} />}
              error={errors.city?.message as string}
              {...(register('city', { required: 'City is required' }) as any)}
            />
            <DarkInput
              label="Operating area"
              placeholder="Zone you serve"
              leftIcon={<FiMapPin size={18} />}
              error={errors.operatingArea?.message as string}
              {...(register('operatingArea', { required: 'Operating area is required' }) as any)}
            />

            {error && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="pt-2">
              <GradientButton type="submit" fullWidth size="lg" loading={loading}>
                Continue
              </GradientButton>
            </div>

            <p className="text-center text-sm text-neutral-500 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-[#34C0CA] font-semibold"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F1415]">Verify email</h2>
              <p className="text-sm text-neutral-500 mt-1">
                We sent an 8-digit code to {watch('email')}
              </p>
            </div>
            <div className="flex gap-1.5 justify-center overflow-x-auto py-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOTPChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-9 h-12 text-center text-lg font-bold bg-neutral-50 border border-neutral-200 rounded-xl text-[#0F1415] outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15"
                />
              ))}
            </div>
            {error && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <GradientButton onClick={handleOTPSubmit} fullWidth size="lg" loading={loading}>
              Verify OTP
            </GradientButton>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full text-center text-sm text-neutral-500 mt-2"
            >
              Back
            </button>
          </div>
        )}

        {step === 'password' && (
          <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F1415]">Set password</h2>
              <p className="text-sm text-neutral-500 mt-1 mb-4">
                Choose a password for your account
              </p>
            </div>
            <DarkInput
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              leftIcon={<FiLock size={18} />}
              error={errors.password?.message as string}
              {...(register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              }) as any)}
            />
            <DarkInput
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              leftIcon={<FiLock size={18} />}
              error={errors.confirmPassword?.message as string}
              {...(register('confirmPassword', {
                required: 'Confirm your password',
                validate: (val: string) => (watch('password') === val ? true : "Passwords don't match"),
              }) as any)}
            />
            {error && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <div className="pt-2">
              <GradientButton type="submit" fullWidth size="lg" loading={loading}>
                Complete signup
              </GradientButton>
            </div>
            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full text-center text-sm text-neutral-500 mt-2"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
