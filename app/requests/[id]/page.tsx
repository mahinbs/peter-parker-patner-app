'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FiNavigation,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiMapPin,
  FiDollarSign,
} from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [timeLeft, setTimeLeft] = useState(45);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!accepted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, accepted, router]);

  const handleAccept = () => {
    setAccepted(true);
    // Navigate to pickup flow
    setTimeout(() => {
      router.push('/pickup/123');
    }, 1000);
  };

  if (accepted) {
    return (
      <MobileContainer>
        <div className="p-4 space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex p-6 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <FiClock className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Request Accepted!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Navigate to pickup location
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Parking Request
          </h1>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Time Left</p>
            <p className="text-xl font-bold text-orange-500">{timeLeft}s</p>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle Type</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Sedan</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Earnings</p>
                <p className="text-lg font-bold text-teal-600 dark:text-teal-400">₹200</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Pickup Location
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    123 Main Street, City Center
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1.2 km away</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiClock className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Parking Duration
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiDollarSign className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Pricing Breakdown
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Base: ₹50/hour × 2 hours = ₹100
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Service Fee: ₹100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Contact User
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open('tel:+911234567890')}
              >
                <FiPhone size={18} />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/chat/123')}
              >
                <FiMessageCircle size={18} />
                Message
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            Reject
          </Button>
          <Button
            onClick={handleAccept}
            className="flex-1"
          >
            <FiNavigation size={18} />
            Accept & Navigate
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}

