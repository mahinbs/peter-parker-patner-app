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
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';
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
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles!user_id(full_name, phone)
        `)
        .eq('id', params.id)
        .single();

      if (data && !error) {
        setBooking(data);
      }
      setIsLoading(false);
    };

    if (params.id) {
      fetchBooking();

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`booking-detail-${params.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${params.id}` },
          (payload: any) => {
            setBooking(payload.new);
            if (payload.new.status === 'accepted') setAccepted(true);
          }
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to accept requests');
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ 
          partner_id: user.id, 
          status: 'accepted', 
          started_at: new Date().toISOString() 
        })
        .eq('id', params.id)
        .eq('status', 'searching'); // Ensure it hasn't been claimed yet

      if (error) {
        alert('Failed to accept request: ' + error.message);
      } else {
        setAccepted(true);
        // Also update partner status to 'ontrip' using the store
        await setStatus('ontrip');
        
        // Refresh local booking data
        const { data: updated } = await supabase.from('bookings').select('*').eq('id', params.id).single();
        if (updated) setBooking(updated);
      }
    } catch (err: any) {
      alert('An unexpected error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="p-4 text-center">Loading request details...</div>
      </MobileContainer>
    );
  }

  if (!booking) {
    return (
      <MobileContainer>
        <div className="p-4 text-center text-red-500">Request not found or expired.</div>
      </MobileContainer>
    );
  }

  if (accepted || booking.status === 'accepted' || booking.status === 'valet_arrived_pickup') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex p-6 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <FiClock className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {booking.status === 'valet_arrived_pickup' ? 'You have Arrived!' : 'Request Accepted!'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {booking.status === 'valet_arrived_pickup' 
                  ? 'Wait for the user or click "Picked Up" to start inspection' 
                  : 'Navigate to pickup location'}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-[#66BD59]" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-neutral-500">Pickup Location</p>
                  <p className="font-semibold">{booking.pickup_location}</p>
                </div>
              </div>
              <Button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickup_location)}`)}
                variant="outline" 
                fullWidth
              >
                <FiNavigation size={18} />
                Open in Maps
              </Button>
            </div>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            {booking.status === 'valet_arrived_pickup' ? (
              <Button 
                fullWidth 
                size="lg"
                onClick={() => router.push(`/pickup/${params.id}`)}
              >
                <FiCheckCircle className="mr-2" size={20} />
                Picked Up (Start Inspection)
              </Button>
            ) : (
              <Button 
                fullWidth 
                size="lg"
                onClick={async () => {
                  const { error } = await supabase
                    .from('bookings')
                    .update({ status: 'valet_arrived_pickup' })
                    .eq('id', params.id);
                  if (error) alert('Error: ' + error.message);
                }}
              >
                <FiCheckCircle className="mr-2" size={20} />
                I have Arrived at Pickup
              </Button>
            )}
          </div>
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
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{booking.vehicle_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Earnings</p>
                <p className="text-lg font-bold text-teal-600 dark:text-teal-400">₹{booking.cost}</p>
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
                    {booking.pickup_location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1.2 km away</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiClock className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Stay Duration
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">30 mins free + extensions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiDollarSign className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Pricing Breakdown
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Base: 30 mins (Complimentary)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overtime: ₹10 / 10 mins thereafter
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
                onClick={() => window.open(`tel:${booking.user?.phone || '+911234567890'}`)}
              >
                <FiPhone size={18} />
                Call {booking.user?.full_name?.split(' ')[0] || 'User'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/chat/${params.id}`)}
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

