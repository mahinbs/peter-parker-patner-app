'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPower,
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiNavigation,
  FiChevronDown
} from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import MobileContainer from '../components/MobileContainer';
import { useAuthStore, PartnerStatus } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setStatus } = useAuthStore();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    earningsToday: 0,
    activeSessions: 0,
    availableSlots: 0,
    pendingRequests: 0,
  });

  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Earnings Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: earnings } = await supabase
      .from('bookings')
      .select('cost')
      .eq('partner_id', user.id)
      .eq('status', 'completed')
      .gte('ended_at', today.toISOString());

    const totalEarnings = earnings?.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) || 0;

    // Fetch Active Sessions
    const { count: sessionsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', user.id)
      .in('status', ['accepted', 'valet_enroute_pickup', 'valet_arrived_pickup', 'valet_enroute_drop', 'parked', 'valet_enroute_return']);

    // Fetch Available Slots (from first managed location for simplicity)
    const { data: location } = await supabase
      .from('parking_locations')
      .select('available_slots')
      .eq('partner_id', user.id)
      .limit(1)
      .single();

    // Fetch Pending Requests
    const { count: requestsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'searching');

    setStats({
      earningsToday: totalEarnings,
      activeSessions: sessionsCount || 0,
      availableSlots: location?.available_slots || 0,
      pendingRequests: requestsCount || 0,
    });
  };

  const fetchActiveRequests = async () => {
    const { data: requests } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'searching')
      .order('created_at', { ascending: false });

    if (requests) {
      setActiveRequests(requests.map(r => ({
        id: r.id,
        vehicleType: r.vehicle_type || 'Unknown Vehicle',
        userLocation: r.pickup_location || 'Unknown Location',
        estimatedEarnings: r.cost || 0,
        distance: r.distance || '0 km',
        duration: r.duration || 'N/A',
        timeLeft: 60, // Mock timer for now
      })));
    }
  };

  const fetchActiveSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessions } = await supabase
      .from('bookings')
      .select('*')
      .eq('partner_id', user.id)
      .in('status', ['accepted', 'valet_enroute_pickup', 'valet_arrived_pickup', 'valet_enroute_drop', 'parked', 'valet_enroute_return'])
      .order('created_at', { ascending: false });

    if (sessions) {
      setActiveSessions(sessions.map(s => ({
        id: s.id,
        vehicleNumber: s.vehicle_number || 'N/A',
        slotNumber: s.parking_location || 'TBD',
        startTime: s.started_at ? new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        remainingTime: 'Calculating...', // Logic for remaining time can be added
      })));
    }
  };

  useEffect(() => {
    // KYC Check
    if (user && user.kycStatus !== 'approved') {
      router.push('/kyc/status');
      return;
    }

    fetchStats();
    fetchActiveRequests();
    fetchActiveSessions();

    // Real-time subscriptions
    const bookingSubscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes' as any, { event: '*', table: 'bookings' }, () => {
        fetchStats();
        fetchActiveRequests();
        fetchActiveSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingSubscription);
    };
  }, [user, router]);

  const currentStatus: PartnerStatus = user?.status ?? 'offline';
  const city = user?.city ?? 'Not Set';
  const zone = user?.zone ?? 'Not Set';

  const statusOptions: { value: PartnerStatus; label: string; color: string; bgColor: string }[] = [
    { value: 'online', label: 'Online', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { value: 'ontrip', label: 'On Trip', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { value: 'offline', label: 'Offline', color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
  ];

  const currentStatusConfig = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[2];

  const handleStatusChange = (status: PartnerStatus) => {
    setStatus(status);
    setIsStatusDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        {/* Status Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover-lift">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Status</p>
                  <motion.p
                    key={currentStatus}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-lg font-bold ${currentStatusConfig.color}`}
                  >
                    {currentStatusConfig.label}
                  </motion.p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${currentStatus === 'online'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : currentStatus === 'ontrip'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                      }`}
                  >
                    <motion.div
                      animate={{
                        scale: currentStatus === 'online' || currentStatus === 'ontrip' ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 2, repeat: currentStatus === 'online' || currentStatus === 'ontrip' ? Infinity : 0 }}
                      className={`h-2 w-2 rounded-full ${currentStatus === 'online'
                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                        : currentStatus === 'ontrip'
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                          : 'bg-gray-400'
                        }`}
                    />
                    <span className={`text-sm font-semibold ${currentStatusConfig.color}`}>
                      {currentStatusConfig.label}
                    </span>
                    <FiChevronDown
                      className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''} ${currentStatusConfig.color}`}
                      size={16}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isStatusDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                      >
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${currentStatus === option.value
                              ? `${option.bgColor} ${option.color} font-semibold`
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${option.value === 'online'
                                ? 'bg-green-500'
                                : option.value === 'ontrip'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-400'
                                }`}
                            />
                            <span>{option.label}</span>
                            {currentStatus === option.value && (
                              <FiCheckCircle className="ml-auto" size={18} />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* City and Zone Display */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Current Location</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Zone</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {zone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: FiDollarSign, label: 'Earnings Today', value: `₹${stats.earningsToday}`, color: 'bg-[var(--color-secondary-accent-light)]', iconColor: 'text-[var(--color-secondary-accent)]' },
            { icon: FiClock, label: 'Active Sessions', value: stats.activeSessions, color: 'bg-[var(--color-primary-accent-light)]', iconColor: 'text-[var(--color-primary-accent)]' },
            { icon: FiMapPin, label: 'Available Slots', value: stats.availableSlots, color: 'bg-purple-100 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
            { icon: FiAlertCircle, label: 'Pending Requests', value: stats.pendingRequests, color: 'bg-orange-100 dark:bg-orange-900/20', iconColor: 'text-orange-600 dark:text-orange-400' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="hover-lift">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`p-3 rounded-xl ${stat.color}`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={stat.iconColor} size={24} />
                    </motion.div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
                      <motion.p
                        className="text-lg font-bold text-[var(--text-primary)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Active Requests
            </h2>
            <div className="space-y-3">
              {activeRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="hover-lift">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {request.vehicleType}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {request.userLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[var(--color-primary-accent)]">
                            ₹{request.estimatedEarnings}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">{request.distance} away</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <FiClock size={14} />
                        <span>{request.duration}</span>
                        <motion.span
                          className="text-orange-500 ml-auto font-semibold"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {request.timeLeft}s left
                        </motion.span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                        onClick={async () => {
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
                              .eq('id', request.id)
                              .eq('status', 'searching');

                            if (error) {
                              alert('Failed to accept request: ' + error.message);
                              return;
                            }
                            
                            // Also update partner status to 'ontrip'
                            await supabase
                              .from('profiles')
                              .update({ status: 'ontrip' })
                              .eq('id', user.id);

                            router.push(`/requests/${request.id}`);
                          } catch (err: any) {
                            alert('An unexpected error occurred: ' + err.message);
                          }
                        }}
                          variant="primary"
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => {
                            setActiveRequests(prev => prev.filter(r => r.id !== request.id));
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Parking Sessions */}
        {activeSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Active Sessions
            </h2>
            <div className="space-y-3">
              {activeSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    className="hover-lift cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {session.vehicleNumber}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Slot: {session.slotNumber}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          Started: {session.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-primary-accent)]">
                          {session.remainingTime}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">remaining</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiMapPin, label: 'Locations', href: '/parking-locations' },
              { icon: FiDollarSign, label: 'Earnings', href: '/earnings' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push(action.href)}
                    variant="outline"
                    className="h-20 flex-col w-full"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon size={24} />
                    </motion.div>
                    <span className="text-sm mt-1">{action.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </MobileContainer>
  );
}

