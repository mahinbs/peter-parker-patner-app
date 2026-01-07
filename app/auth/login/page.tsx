'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiPhone, FiLock } from 'react-icons/fi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Image from 'next/image';

interface LoginForm {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const handlePhoneSubmit = (data: LoginForm) => {
    // Simulate OTP send
    setStep('otp');
  };

  const handleOTPSubmit = () => {
    setStep('password');
  };

  const handlePasswordSubmit = (data: LoginForm) => {
    // Simulate login
    router.push('/kyc/status');
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
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
          {step === 'phone' && (
            <form onSubmit={handleSubmit(handlePhoneSubmit)} className="space-y-6">
              <Input
                label="Phone Number"
                type="tel"
                icon={<FiPhone />}
                placeholder="Enter your phone number"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number',
                  },
                })}
                error={errors.phone?.message}
              />
              <Button type="submit" fullWidth>
                Send OTP
              </Button>
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
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Enter OTP
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a 6-digit code to your phone
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-gray-800"
                  />
                ))}
              </div>
              <Button onClick={handleOTPSubmit} fullWidth>
                Verify OTP
              </Button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-sm text-teal-600 dark:text-teal-400"
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-6">
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
              <Button type="submit" fullWidth>
                Sign In
              </Button>
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="w-full text-center text-sm text-teal-600 dark:text-teal-400"
              >
                Back
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

