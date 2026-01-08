'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import MobileContainer from '../../../components/MobileContainer';

export default function AddUPIPage() {
  const router = useRouter();
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateUPI = (id: string) => {
    // UPI ID format: username@paytm or username@upi
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiPattern.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUPI(upiId)) {
      alert('Please enter a valid UPI ID (e.g., username@paytm)');
      return;
    }

    if (!name.trim()) {
      alert('Please enter your name');
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
                UPI ID Added Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your UPI ID has been added and verified.
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
            Add UPI ID
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
                  UPI Payment Method
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive payments directly to your UPI ID
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="UPI ID"
                placeholder="username@paytm or username@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                icon={<FiCreditCard size={18} />}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                Format: yourname@paytm, yourname@phonepe, yourname@googlepay, etc.
              </p>

              <Input
                label="Account Holder Name"
                placeholder="Enter your name as per bank records"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  disabled={!upiId || !name || isSubmitting}
                >
                  Add UPI ID
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
              Why add UPI ID?
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Instant payments directly to your UPI account</li>
              <li>No bank account details required</li>
              <li>Secure and verified transactions</li>
              <li>24/7 availability for payouts</li>
            </ul>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

