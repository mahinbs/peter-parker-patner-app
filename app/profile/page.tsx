'use client';

import { useRouter } from 'next/navigation';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import MobileContainer from '../components/MobileContainer';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const kycStatusConfig = {
    pending: {
      icon: FiClock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'Pending Verification',
    },
    approved: {
      icon: FiCheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      text: 'Verified',
    },
    rejected: {
      icon: FiXCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      text: 'Rejected',
    },
  };

  const statusConfig = user?.kycStatus ? kycStatusConfig[user.kycStatus] : kycStatusConfig.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>

        {/* Profile Header */}
        <Card>
          <div className="text-center py-6">
            <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'V'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {user?.name || 'Valet Partner'}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-sm">
              <StatusIcon className={statusConfig.color} size={16} />
              {statusConfig.text}
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiUser className="text-gray-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.name || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-gray-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.phone || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="text-gray-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.email || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="text-gray-400" size={20} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">City & Area</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.city || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* KYC Status */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            KYC Status
          </h3>
          <div className={`p-4 rounded-xl ${statusConfig.bgColor}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={statusConfig.color} size={24} />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {statusConfig.text}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.kycStatus === 'pending' && 'Your documents are under review'}
                  {user?.kycStatus === 'approved' && 'You can accept parking requests'}
                  {user?.kycStatus === 'rejected' && 'Please resubmit your documents'}
                </p>
              </div>
            </div>
          </div>
          {user?.kycStatus !== 'approved' && (
            <Button
              onClick={() => router.push('/kyc/identity')}
              variant="outline"
              fullWidth
              className="mt-4"
            >
              {user?.kycStatus === 'rejected' ? 'Resubmit Documents' : 'Complete KYC'}
            </Button>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => router.push('/settings')}
            variant="outline"
            fullWidth
          >
            Settings
          </Button>
          <Button
            onClick={() => router.push('/support')}
            variant="outline"
            fullWidth
          >
            Support & Help
          </Button>
          <Button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            variant="danger"
            fullWidth
          >
            Logout
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}

