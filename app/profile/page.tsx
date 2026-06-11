'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiLogOut,
  FiSettings,
  FiHelpCircle,
  FiChevronRight,
} from 'react-icons/fi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, GradientButton, SectionLabel } from '../components/ui';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const kycConfig = {
    pending: {
      icon: FiClock,
      label: 'Pending verification',
      color: '#FFB627',
      desc: 'Your documents are under review',
    },
    approved: {
      icon: FiCheckCircle,
      label: 'Verified',
      color: '#66BD59',
      desc: 'You can accept parking requests',
    },
    rejected: {
      icon: FiXCircle,
      label: 'Rejected',
      color: '#EF4444',
      desc: 'Please resubmit your documents',
    },
  };
  const kyc = user?.kycStatus ? kycConfig[user.kycStatus] : kycConfig.pending;
  const KycIcon = kyc.icon;

  const initials = user?.name?.charAt(0).toUpperCase() || 'V';

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-8">
        {/* Profile hero */}
        <DarkCard glow noPadding>
          <div className="relative p-5">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-[#34C0CA]/25 to-[#66BD59]/25 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold leading-tight truncate">
                  {user?.name || 'Valet partner'}
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mt-1.5"
                  style={{ backgroundColor: `${kyc.color}26`, color: kyc.color }}
                >
                  <KycIcon size={12} />
                  {kyc.label}
                </span>
              </div>
            </div>
          </div>
        </DarkCard>

        {/* Personal info */}
        <div>
          <SectionLabel>Personal information</SectionLabel>
          <DarkCard>
            <div className="space-y-3">
              {[
                { icon: FiUser, label: 'Full name', value: user?.name },
                { icon: FiPhone, label: 'Phone', value: user?.phone },
                { icon: FiMail, label: 'Email', value: user?.email },
                { icon: FiMapPin, label: 'City', value: user?.city },
              ].map((row, i, arr) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center gap-3 ${i < arr.length - 1 ? 'pb-3 border-b border-white/5' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-white/85">
                        {row.label}
                      </p>
                      <p className="text-sm font-semibold truncate">{row.value || 'Not set'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </DarkCard>
        </div>

        {/* KYC */}
        <div>
          <SectionLabel>KYC status</SectionLabel>
          <DarkCard>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${kyc.color}26`, color: kyc.color }}
              >
                <KycIcon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{kyc.label}</p>
                <p className="text-[11px] text-white/85">{kyc.desc}</p>
              </div>
            </div>
            {user?.kycStatus !== 'approved' && (
              <div className="mt-3 flex justify-end">
                <GradientButton
                  size="sm"
                  withArrow={false}
                  onClick={() => router.push('/kyc/identity')}
                >
                  {user?.kycStatus === 'rejected' ? 'Resubmit' : 'Complete KYC'}
                </GradientButton>
              </div>
            )}
          </DarkCard>
        </div>

        {/* Actions */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <DarkCard className="!p-2">
            <div className="divide-y divide-white/5">
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center gap-3 px-2 py-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                  <FiSettings size={18} />
                </div>
                <p className="flex-1 text-sm font-semibold">Settings</p>
                <FiChevronRight className="text-white/85" />
              </button>
              <button
                onClick={() => router.push('/support')}
                className="w-full flex items-center gap-3 px-2 py-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#66BD59]/15 text-[#66BD59] flex items-center justify-center shrink-0">
                  <FiHelpCircle size={18} />
                </div>
                <p className="flex-1 text-sm font-semibold">Support & help</p>
                <FiChevronRight className="text-white/85" />
              </button>
            </div>
          </DarkCard>
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push('/auth/login');
          }}
          className="w-full py-3.5 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition"
        >
          <FiLogOut size={18} /> Log out
        </button>
      </div>
    </MobileContainer>
  );
}
