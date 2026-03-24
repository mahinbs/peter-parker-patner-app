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
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const password = watch('password');

  const handleDetailsSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${data.phone}`,
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
    const { phone } = watch();
    const { error, data } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otpString,
      type: 'sms'
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // After verification, we could set a password if needed, but for now let's create a profile
      const { name, email, city, operatingArea } = watch();
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
          city,
          zone: operatingArea,
          role: 'partner',
        });
      }
      router.push('/kyc/identity');
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
                  Verify Phone Number
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

        </Card>
      </div>
    </div>
  );
}
