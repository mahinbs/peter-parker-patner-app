'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUser, FiCheckCircle } from 'react-icons/fi';
import { HiQrcode } from 'react-icons/hi';
import MobileContainer from '../../../components/MobileContainer';
import { DarkCard, GradientButton, DarkInput } from '../../../components/ui';

export default function AddUPIPage() {
  const router = useRouter();
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateUPI = (id: string) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUPI(upiId) || !name.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => router.push('/settings'), 1500);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <MobileContainer>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center mb-4 shadow-lg">
            <FiCheckCircle className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F1415]">UPI ID added</h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-xs">
            Your UPI ID has been verified and saved.
          </p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-[#13191C] flex items-center justify-center text-white active:scale-95 transition shrink-0 shadow-md"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-neutral-500">Payment</p>
            <h1 className="text-xl font-extrabold text-[#0F1415] leading-tight">Add UPI ID</h1>
          </div>
        </div>

        <DarkCard glow>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shrink-0">
              <HiQrcode className="text-white w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">UPI payouts</p>
              <p className="text-[11px] text-white/85">Receive payments directly to your UPI</p>
            </div>
          </div>
        </DarkCard>

        <form onSubmit={handleSubmit} className="space-y-3">
          <DarkInput
            label="UPI ID"
            placeholder="username@paytm"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            required
            leftIcon={<HiQrcode className="w-5 h-5" />}
            helperText="Examples: yourname@paytm, yourname@okhdfcbank, yourname@upi"
          />
          <DarkInput
            label="Account holder name"
            placeholder="As per bank records"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            leftIcon={<FiUser size={18} />}
          />

          <DarkCard className="!p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/85 mb-2">Why UPI?</p>
            <ul className="text-xs text-white/85 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#66BD59] mt-1.5 shrink-0" />
                <span>Instant payments to your UPI account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#66BD59] mt-1.5 shrink-0" />
                <span>No bank account details required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#66BD59] mt-1.5 shrink-0" />
                <span>Secure, verified transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#66BD59] mt-1.5 shrink-0" />
                <span>24/7 payouts available</span>
              </li>
            </ul>
          </DarkCard>

          <div className="pt-2">
            <GradientButton
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={!upiId || !name}
            >
              Add UPI ID
            </GradientButton>
          </div>
        </form>
      </div>
    </MobileContainer>
  );
}
