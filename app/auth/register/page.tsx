'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiMail, FiMapPin, FiLock } from 'react-icons/fi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

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
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']); // 8 digits
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetailsSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    // Use Email OTP like the user app
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
  };

  const handleOTPSubmit = async () => {
    setLoading(true);
    setError(null);
    const otpString = otp.join('');
    const { email } = watch();
    
    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: otpString,
      type: 'email'
    });
    
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // After verification, move to password step
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Set Password
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password
      });
      if (authError) throw authError;

      // 2. Create/Update Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          zone: data.operatingArea,
          role: 'partner',
        });
        if (profileError) throw profileError;
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

    if (value && index < 7) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Join as Partner</h1>
          <p className="text-gray-600">Create your valet partner account</p>
        </div>

        <Card>
          {step === 'details' && (
            <form onSubmit={handleSubmit(handleDetailsSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={<FiUser />}
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
                })}
                error={errors.name?.message}
              />
              <Input
                label="Email"
                type="email"
                icon={<FiMail />}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email',
                  },
                })}
                error={errors.email?.message}
              />
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
              <Input
                label="City"
                type="text"
                icon={<FiMapPin />}
                placeholder="Enter your city"
                {...register('city', {
                  required: 'City is required',
                })}
                error={errors.city?.message}
              />
              <Input
                label="Operating Area"
                type="text"
                icon={<FiMapPin />}
                placeholder="Enter your operating area"
                {...register('operatingArea', {
                  required: 'Operating area is required',
                })}
                error={errors.operatingArea?.message}
              />
              <Button type="submit" fullWidth loading={loading}>
                Continue
              </Button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="text-teal-600 dark:text-teal-400 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Verify Email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent an 8-digit code to {watch('email')}
                </p>
              </div>
              <div className="flex gap-1 justify-center overflow-x-auto py-2 no-scrollbar">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-9 h-12 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-gray-800 flex-shrink-0"
                  />
                ))}
              </div>
              <Button onClick={handleOTPSubmit} fullWidth loading={loading}>
                Verify OTP
              </Button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full text-center text-sm text-teal-600 dark:text-teal-400"
              >
                Back
              </button>
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Set Password
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a password for your account
                </p>
              </div>
              <Input
                label="Password"
                type="password"
                icon={<FiLock />}
                placeholder="Enter password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={errors.password?.message}
              />
              <Input
                label="Confirm Password"
                type="password"
                icon={<FiLock />}
                placeholder="Confirm password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val: string) => {
                    if (watch('password') != val) {
                      return "Your passwords do not match";
                    }
                  },
                })}
                error={errors.confirmPassword?.message}
              />
              <Button type="submit" fullWidth loading={loading}>
                Complete Signup
              </Button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
