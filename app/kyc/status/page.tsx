'use client';

import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useState } from 'react';

export default function KYCStatusPage() {
  const router = useRouter();
  const { updateKYCStatus } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    // Simulate checking status
    const timer = setTimeout(() => {
      // For demo, you can change this to 'approved' or 'rejected'
      setStatus('pending');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (status === 'approved') {
      updateKYCStatus('approved');
      router.push('/dashboard');
    } else {
      router.push('/parking-locations');
    }
  };

  const statusConfig = {
    pending: {
      icon: FiClock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      title: 'Verification Pending',
      message: 'Your KYC documents are under review. This usually takes 24-48 hours.',
    },
    approved: {
      icon: FiCheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      title: 'Verification Approved',
      message: 'Congratulations! Your KYC has been approved. You can now start accepting parking requests.',
    },
    rejected: {
      icon: FiXCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      title: 'Verification Rejected',
      message: 'Your KYC verification was rejected. Please check the reason and resubmit your documents.',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <MobileContainer>
      <div className="p-4 space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className={`inline-flex p-6 rounded-full ${config.bgColor} mb-4`}>
              <Icon size={64} className={config.color} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {config.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {config.message}
            </p>
            {status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-red-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Reason for Rejection:
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      Image quality is unclear. Please upload clear, high-resolution images of your documents.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {status === 'pending' && (
                <>
                  <Button onClick={() => router.push('/parking-locations')} variant="outline" fullWidth>
                    Set Up Parking Locations
                  </Button>
                  <Button onClick={() => router.push('/profile')} variant="secondary" fullWidth>
                    View Profile
                  </Button>
                </>
              )}
              {status === 'approved' && (
                <Button onClick={handleContinue} fullWidth>
                  Go to Dashboard
                </Button>
              )}
              {status === 'rejected' && (
                <>
                  <Button onClick={() => router.push('/kyc/identity')} fullWidth>
                    Resubmit Documents
                  </Button>
                  <Button onClick={() => router.push('/support')} variant="outline" fullWidth>
                    Contact Support
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

