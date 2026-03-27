'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiClock, FiMapPin, FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MobileContainer from '../../components/MobileContainer';
import { format, differenceInSeconds } from 'date-fns';
import { supabase } from '../../lib/supabase';

export default function ActiveSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExtended, setIsExtended] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const fetchBooking = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data && !error) {
        setBooking(data);
        if (data.parked_at) {
          const parkedAt = new Date(data.parked_at);
          const now = new Date();
          const elapsed = differenceInSeconds(now, parkedAt);
          const totalDuration = 1800; // 30 mins free stay
          setRemainingTime(Math.max(0, totalDuration - elapsed));
        }
      }
      setIsLoading(false);
    };

    fetchBooking();

    // Subscribe to real-time updates (e.g. extensions from user app)
    const channel = supabase
      .channel(`partner-session-${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${params.id}`
        },
        (payload: any) => {
          setBooking(payload.new);
          if (payload.new.parked_at) {
            const parkedAt = new Date(payload.new.parked_at);
            const now = new Date();
            const elapsed = differenceInSeconds(now, parkedAt);
            const totalDuration = 1800;
            setRemainingTime(Math.max(0, totalDuration - elapsed));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  useEffect(() => {
    if (remainingTime > 0 && booking?.status === 'parked') {
      const timer = setInterval(() => {
        setRemainingTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, booking?.status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReturn = () => {
    router.push(`/return/${params.id}`);
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      </MobileContainer>
    );
  }

  if (!booking) {
    return (
      <MobileContainer>
        <div className="p-4 text-center text-red-500 min-h-screen flex items-center justify-center">
          <div>
            <FiAlertCircle size={48} className="mx-auto mb-4" />
            <p className="font-bold">Session not found.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Active Parking
            </h1>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {booking.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Vehicle: <span className="font-bold text-gray-900 dark:text-gray-100">{booking.vehicle_number}</span> ({booking.vehicle_type})
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Remaining Free Time</p>
                <p className={`text-3xl font-black ${remainingTime < 300 ? 'text-red-500 animate-pulse' : 'text-teal-600 dark:text-teal-400'}`}>
                  {formatTime(remainingTime)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{booking.cost || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <FiClock className="text-teal-600 dark:text-teal-400" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Parked Since</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {booking.parked_at ? format(new Date(booking.parked_at), 'h:mm a') : 'Not Parked Yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <FiMapPin className="text-teal-600 dark:text-teal-400" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Parking Location</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {booking.parking_location || 'Awaiting Arrival'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {remainingTime < 300 && booking?.status === 'parked' && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-red-600 dark:text-red-400" size={24} />
              <div>
                <p className="font-bold text-red-900 dark:text-red-100">
                  Overtime Approaching
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Free stay period is ending. Overtime charges will apply soon.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => router.push(`/sessions/${params.id}/photos`)}
            variant="outline"
            fullWidth
            className="border-2"
          >
            <FiCamera size={18} />
            Check Inspection Photos
          </Button>
          <Button
            onClick={handleReturn}
            fullWidth
            size="lg"
            className="shadow-lg shadow-teal-500/20"
          >
            Initiate Return Process
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}

