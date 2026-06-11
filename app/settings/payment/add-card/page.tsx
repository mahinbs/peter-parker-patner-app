'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiLock, FiCheckCircle, FiUser, FiChevronDown } from 'react-icons/fi';
import MobileContainer from '../../../components/MobileContainer';
import { DarkCard, GradientButton, DarkInput } from '../../../components/ui';

export default function AddCardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const validateCard = () => {
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length !== 16) return false;
    if (!formData.cardHolderName.trim()) return false;
    if (!formData.expiryMonth || !formData.expiryYear) return false;
    if (formData.cvv.length !== 3) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;
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
          <h1 className="text-2xl font-extrabold text-[#0F1415]">Card added</h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-xs">
            Your card has been securely saved for payouts.
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
            <h1 className="text-xl font-extrabold text-[#0F1415] leading-tight">Add card</h1>
          </div>
        </div>

        <DarkCard glow>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shrink-0">
              <FiCreditCard className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Debit / credit card</p>
              <p className="text-[11px] text-white/85">Used to receive payouts</p>
            </div>
          </div>
        </DarkCard>

        <form onSubmit={handleSubmit} className="space-y-3">
          <DarkInput
            label="Card number"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={e => setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
            maxLength={19}
            required
            leftIcon={<FiCreditCard size={18} />}
          />
          <DarkInput
            label="Cardholder name"
            placeholder="Name as on card"
            value={formData.cardHolderName}
            onChange={e => setFormData(prev => ({ ...prev, cardHolderName: e.target.value }))}
            required
            leftIcon={<FiUser size={18} />}
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-semibold text-[#0F1415] mb-2">Month</label>
              <div className="relative">
                <select
                  value={formData.expiryMonth}
                  onChange={e => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  className="w-full px-3 py-3.5 pr-8 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-[#0F1415] appearance-none outline-none focus:border-[#34C0CA]"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, '0');
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F1415] mb-2">Year</label>
              <div className="relative">
                <select
                  value={formData.expiryYear}
                  onChange={e => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                  className="w-full px-3 py-3.5 pr-8 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-[#0F1415] appearance-none outline-none focus:border-[#34C0CA]"
                  required
                >
                  <option value="">YY</option>
                  {Array.from({ length: 20 }, (_, i) => {
                    const y = new Date().getFullYear() + i;
                    return (
                      <option key={y} value={String(y).slice(-2)}>
                        {String(y).slice(-2)}
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <DarkInput
              label="CVV"
              placeholder="123"
              type="password"
              value={formData.cvv}
              onChange={e =>
                setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))
              }
              maxLength={3}
              required
            />
          </div>

          <DarkCard className="!p-3 mt-1">
            <div className="flex items-center gap-2 text-xs">
              <FiLock className="text-[#66BD59]" size={14} />
              <span className="text-white/90 font-semibold">Encrypted & secure</span>
            </div>
            <p className="text-[11px] text-white/85 mt-1">
              Your card details are encrypted. We never store your CVV.
            </p>
          </DarkCard>

          <div className="pt-2">
            <GradientButton
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={!validateCard()}
            >
              Add card
            </GradientButton>
          </div>
        </form>
      </div>
    </MobileContainer>
  );
}
