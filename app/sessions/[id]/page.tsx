'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiClock, FiMapPin, FiCamera, FiAlertCircle } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, GradientButton } from '../../components/ui';
import { format, differenceInSeconds } from 'date-fns';
import { supabase } from '../../lib/supabase';

export default function ActiveSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [remainingTime, setRemainingTime] = useState(0);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const fetchBooking = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('bookings').select('*').eq('id', params.id).single();
      if (data) {
        setBooking(data);
        if (data.parked_at) {
          const elapsed = differenceInSeconds(new Date(), new Date(data.parked_at));
          setRemainingTime(Math.max(0, 1800 - elapsed));
        }
      }
      setIsLoading(false);
    };
    fetchBooking();

    const channel = supabase
      .channel(`partner-session-${params.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${params.id}` },
        (payload: any) => {
          setBooking(payload.new);
          if (payload.new.parked_at) {
            const elapsed = differenceInSeconds(new Date(), new Date(payload.new.parked_at));
            setRemainingTime(Math.max(0, 1800 - elapsed));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  useEffect(() => {
    if (remainingTime > 0 && booking?.status === 'parked') {
      const t = setInterval(() => setRemainingTime(prev => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [remainingTime, booking?.status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
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
        <div className="p-4 flex flex-col items-center justify-center min-h-[40vh] text-center">
          <FiAlertCircle size={36} className="text-[#EF4444] mb-3" />
          <p className="text-base font-bold text-[#0F1415]">Session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#34C0CA] to-[#66BD59] text-white text-sm font-semibold"
          >
            Back to dashboard
          </button>
        </div>
      </MobileContainer>
    );
  }

  const overtime = remainingTime < 300 && booking?.status === 'parked';

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500">Active</p>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Parking session</h1>
          </div>
          <span className="px-2.5 py-1 bg-[#13191C] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            {booking.status.replace(/_/g, ' ')}
          </span>
        </div>

        <p className="text-sm text-neutral-500">
          <span className="text-[#0F1415] font-semibold">{booking.vehicle_number}</span> ·{' '}
          {booking.vehicle_type}
        </p>

        {/* Timer hero */}
        <DarkCard glow noPadding>
          <div className="relative p-6 text-center">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#34C0CA]/30 to-[#66BD59]/30 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/85">
                Free time remaining
              </p>
              <p
                className={`text-5xl font-extrabold tracking-tight mt-1 ${
                  overtime
                    ? 'text-[#EF4444] animate-pulse'
                    : 'bg-gradient-to-r from-[#34C0CA] to-[#66BD59] bg-clip-text text-transparent'
                }`}
              >
                {formatTime(remainingTime)}
              </p>
              <p className="text-[11px] text-white/85 mt-2">
                Current cost ₹{booking.cost || 0}
              </p>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiClock size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/85">
                  Parked since
                </p>
                <p className="text-sm font-bold">
                  {booking.parked_at ? format(new Date(booking.parked_at), 'h:mm a') : 'Not parked yet'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#66BD59]/15 text-[#66BD59] flex items-center justify-center shrink-0">
                <FiMapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/85">
                  Parking location
                </p>
                <p className="text-sm font-bold leading-snug">
                  {booking.parking_location || 'Awaiting arrival'}
                </p>
              </div>
            </div>
          </div>
        </DarkCard>

        {overtime && (
          <DarkCard className="border-[#EF4444]/40 ring-1 ring-[#EF4444]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shrink-0">
                <FiAlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Overtime approaching</p>
                <p className="text-[11px] text-white/85 mt-0.5">
                  Free stay ending — overtime charges will apply.
                </p>
              </div>
            </div>
          </DarkCard>
        )}

        <button
          onClick={() => router.push(`/sessions/${params.id}/photos`)}
          className="w-full py-3 rounded-2xl bg-white border border-neutral-200 text-[#0F1415] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
        >
          <FiCamera size={16} /> Inspection photos
        </button>

        <div className="pt-2">
          <GradientButton fullWidth size="lg" onClick={() => router.push(`/return/${params.id}`)}>
            Initiate return
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
