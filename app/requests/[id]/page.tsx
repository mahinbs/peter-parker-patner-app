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
  FiCheckCircle,
} from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, GradientButton } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [accepted, setAccepted] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const { setStatus } = useAuthStore();

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('bookings')
        .select(`*, user:profiles!user_id(full_name, phone)`)
        .eq('id', params.id)
        .single();
      if (data) setBooking(data);
      setIsLoading(false);
    };

    if (params.id) {
      fetchBooking();
      const channel = supabase
        .channel(`booking-detail-${params.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${params.id}` },
          (payload: any) => {
            setBooking(payload.new);
            if (payload.new.status === 'accepted') setAccepted(true);
          },
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [params.id]);

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

  const handleAccept = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    await supabase
      .from('bookings')
      .update({ partner_id: user.id, status: 'accepted', started_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('status', 'searching');
    await setStatus('ontrip');
    setAccepted(true);
    setIsLoading(false);
    const { data: updated } = await supabase.from('bookings').select('*').eq('id', params.id).single();
    if (updated) setBooking(updated);
  };

  if (isLoading && !booking) {
    return (
      <MobileContainer>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#66BD59] rounded-full animate-spin" />
        </div>
      </MobileContainer>
    );
  }

  if (!booking) {
    return (
      <MobileContainer>
        <div className="p-6 text-center text-[#EF4444]">Request not found or expired.</div>
      </MobileContainer>
    );
  }

  // Post-accept state
  if (accepted || booking.status === 'accepted' || booking.status === 'valet_arrived_pickup') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4 pb-28">
          <DarkCard glow>
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center mb-3 shadow-lg">
                <FiCheckCircle className="text-white" size={32} />
              </div>
              <h1 className="text-xl font-extrabold">
                {booking.status === 'valet_arrived_pickup' ? "You've arrived" : 'Request accepted'}
              </h1>
              <p className="text-xs text-white/55 mt-1 max-w-xs">
                {booking.status === 'valet_arrived_pickup'
                  ? 'Wait for the user or start inspection'
                  : 'Navigate to the pickup location'}
              </p>
            </div>
          </DarkCard>

          <DarkCard>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiMapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Pickup</p>
                <p className="text-sm font-semibold leading-snug">{booking.pickup_location}</p>
              </div>
            </div>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickup_location)}`,
                )
              }
              className="mt-3 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FiNavigation size={16} /> Open in Maps
            </button>
          </DarkCard>
        </div>

        <div className="fixed bottom-20 inset-x-0 p-4 z-30">
          <div className="max-w-md mx-auto">
            {booking.status === 'valet_arrived_pickup' ? (
              <GradientButton fullWidth size="lg" onClick={() => router.push(`/pickup/${params.id}`)}>
                Start inspection
              </GradientButton>
            ) : (
              <GradientButton
                fullWidth
                size="lg"
                onClick={async () => {
                  await supabase
                    .from('bookings')
                    .update({ status: 'valet_arrived_pickup' })
                    .eq('id', params.id);
                }}
              >
                I've arrived
              </GradientButton>
            )}
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Incoming request state
  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-28">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500">New</p>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Parking request</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">Auto-cancel</p>
            <p className="text-lg font-extrabold text-[#FFB627] tabular-nums">{timeLeft}s</p>
          </div>
        </div>

        <DarkCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Vehicle</p>
              <p className="text-base font-bold mt-0.5">{booking.vehicle_type}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">You earn</p>
              <p className="text-xl font-extrabold bg-gradient-to-r from-[#34C0CA] to-[#66BD59] bg-clip-text text-transparent">
                ₹{booking.cost}
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiMapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Pickup</p>
                <p className="text-sm font-semibold leading-snug">{booking.pickup_location}</p>
                <p className="text-[11px] text-white/40 mt-0.5">1.2 km away</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#66BD59]/15 text-[#66BD59] flex items-center justify-center shrink-0">
                <FiClock size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Duration</p>
                <p className="text-sm font-semibold">30 mins free + extensions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiDollarSign size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Pricing</p>
                <p className="text-xs text-white/65">First 30 mins complimentary</p>
                <p className="text-xs text-white/65">₹10 per extra 10 min</p>
              </div>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <p className="text-[10px] uppercase font-bold tracking-wider text-white/55 mb-2">
            Contact user
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`tel:${booking.user?.phone || '+911234567890'}`)}
              className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95"
            >
              <FiPhone size={14} />
              Call {booking.user?.full_name?.split(' ')[0] || 'User'}
            </button>
            <button
              onClick={() => router.push(`/chat/${params.id}`)}
              className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95"
            >
              <FiMessageCircle size={14} /> Message
            </button>
          </div>
        </DarkCard>
      </div>

      <div className="fixed bottom-20 inset-x-0 p-4 z-30">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-full bg-white border border-neutral-200 text-[#0F1415] font-semibold active:scale-[0.98]"
          >
            Reject
          </button>
          <GradientButton fullWidth size="md" onClick={handleAccept}>
            Accept
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
