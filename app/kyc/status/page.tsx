'use client';

import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, GradientButton } from '../../components/ui';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export default function KYCStatusPage() {
  const router = useRouter();
  const { user, updateKYCStatus, fetchProfile } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('kyc_status, kyc_rejection_reason')
          .eq('id', user.id)
          .single();
        if (data?.kyc_status) setStatus(data.kyc_status as any);
        if (data?.kyc_rejection_reason) setRejectionReason(data.kyc_rejection_reason);
      }
    };
    checkStatus();
    fetchProfile();
  }, [user, fetchProfile]);

  const handleContinue = () => {
    if (status === 'approved') {
      updateKYCStatus('approved');
      router.push('/dashboard');
    } else {
      router.push('/parking-locations');
    }
  };

  const config = {
    pending: {
      icon: FiClock,
      color: '#FFB627',
      title: 'Verification pending',
      msg: 'Your KYC documents are under review. This usually takes 24-48 hours.',
    },
    approved: {
      icon: FiCheckCircle,
      color: '#66BD59',
      title: 'Verification approved',
      msg: "You're all set. Start accepting parking requests now.",
    },
    rejected: {
      icon: FiXCircle,
      color: '#EF4444',
      title: 'Verification rejected',
      msg: 'Please check the reason below and resubmit your documents.',
    },
  }[status];
  const Icon = config.icon;

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-12">
        <div className="flex flex-col items-center text-center pt-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-lg"
            style={{ backgroundColor: `${config.color}26`, color: config.color }}
          >
            <Icon size={48} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F1415]">{config.title}</h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-xs">{config.msg}</p>
        </div>

        {status === 'rejected' && (
          <DarkCard className="border-[#EF4444]/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shrink-0">
                <FiAlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Reason</p>
                <p className="text-[12px] text-white/85 mt-0.5">
                  {rejectionReason || 'Please check your documents and resubmit.'}
                </p>
              </div>
            </div>
          </DarkCard>
        )}

        <div className="space-y-3">
          {status === 'pending' && (
            <>
              <GradientButton fullWidth size="lg" onClick={() => router.push('/parking-locations')}>
                Set up parking locations
              </GradientButton>
              <button
                onClick={() => router.push('/profile')}
                className="w-full py-3.5 rounded-full bg-white border border-neutral-200 text-[#0F1415] font-semibold active:scale-[0.98]"
              >
                View profile
              </button>
            </>
          )}
          {status === 'approved' && (
            <GradientButton fullWidth size="lg" onClick={handleContinue}>
              Go to dashboard
            </GradientButton>
          )}
          {status === 'rejected' && (
            <>
              <GradientButton fullWidth size="lg" onClick={() => router.push('/kyc/identity')}>
                Resubmit documents
              </GradientButton>
              <button
                onClick={() => router.push('/support')}
                className="w-full py-3.5 rounded-full bg-white border border-neutral-200 text-[#0F1415] font-semibold active:scale-[0.98]"
              >
                Contact support
              </button>
            </>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
