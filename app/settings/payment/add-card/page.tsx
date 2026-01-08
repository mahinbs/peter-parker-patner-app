'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import MobileContainer from '../../../components/MobileContainer';

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
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
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
    
    if (!validateCard()) {
      alert('Please fill all card details correctly');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <MobileContainer>
        <div className="p-4 space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex p-6 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <FiCheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Card Added Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your card has been added and verified.
              </p>
            </div>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-900 dark:text-gray-100" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Add Card
          </h1>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/20">
                <FiCreditCard className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Debit/Credit Card
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Secure payment method for payouts
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                required
                icon={<FiCreditCard size={18} />}
              />

              <Input
                label="Card Holder Name"
                placeholder="Name as on card"
                value={formData.cardHolderName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = String(i + 1).padStart(2, '0');
                      return (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 20 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={String(year).slice(-2)}>
                          {String(year).slice(-2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-1">
                  <Input
                    label="CVV"
                    placeholder="123"
                    type="password"
                    value={formData.cvv}
                    onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    maxLength={3}
                    required
                    icon={<FiLock size={18} />}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  disabled={!validateCard() || isSubmitting}
                >
                  Add Card
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm flex items-center gap-2">
              <FiLock size={16} />
              Secure & Encrypted
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your card details are encrypted and securely stored. We never store your CVV.
            </p>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

