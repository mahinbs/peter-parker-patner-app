'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
} from 'react-icons/fi';
import { HiArrowRight } from 'react-icons/hi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, GradientButton, SectionLabel } from '../components/ui';
import { useAuthStore, PartnerStatus } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setStatus } = useAuthStore();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
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
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: earnings } = await supabase
      .from('bookings')
      .select('cost')
      .eq('partner_id', u.id)
      .eq('status', 'completed')
      .gte('ended_at', today.toISOString());

    const totalEarnings = earnings?.reduce((acc: number, c: any) => acc + (Number(c.cost) || 0), 0) || 0;

    const { count: sessionsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', u.id)
      .in('status', [
        'accepted',
        'valet_enroute_pickup',
        'valet_arrived_pickup',
        'valet_enroute_drop',
        'parked',
        'valet_enroute_return',
      ]);

    const { data: location } = await supabase
      .from('parking_locations')
      .select('available_slots')
      .eq('partner_id', u.id)
      .limit(1)
      .single();

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
      setActiveRequests(
        requests.map((r: any) => ({
          id: r.id,
          vehicleType: r.vehicle_type || 'Vehicle',
          userLocation: r.pickup_location || 'Unknown location',
          estimatedEarnings: r.cost || 0,
          distance: r.distance || '0 km',
          duration: r.duration || 'N/A',
          timeLeft: 60,
        })),
      );
    }
  };

  const fetchActiveSessions = async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) return;
    const { data: sessions } = await supabase
      .from('bookings')
      .select('*')
      .eq('partner_id', u.id)
      .in('status', [
        'accepted',
        'valet_enroute_pickup',
        'valet_arrived_pickup',
        'valet_enroute_drop',
        'parked',
        'valet_enroute_return',
      ])
      .order('created_at', { ascending: false });

    if (sessions) {
      setActiveSessions(
        sessions.map((s: any) => {
          let remainingTime = 'N/A';
          if (s.status === 'parked' && s.parked_at) {
            const parkedTime = new Date(s.parked_at).getTime();
            const diffInSeconds = Math.floor((Date.now() - parkedTime) / 1000);
            const remaining = Math.max(0, 30 * 60 - diffInSeconds);
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            remainingTime = `${mins}:${secs.toString().padStart(2, '0')}`;
          } else if (s.status.includes('enroute')) remainingTime = 'En route';
          else if (s.status === 'accepted') remainingTime = 'Accepted';
          return {
            id: s.id,
            status: s.status,
            vehicleNumber: s.vehicle_number || 'N/A',
            slotNumber: s.parking_location || 'TBD',
            startTime: s.started_at
              ? new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            remainingTime,
          };
        }),
      );
    }
  };

  useEffect(() => {
    if (user && user.kycStatus !== 'approved') {
      router.push('/kyc/status');
      return;
    }
    fetchStats();
    fetchActiveRequests();
    fetchActiveSessions();

    const sub = supabase
      .channel('bookings-changes')
      .on('postgres_changes' as any, { event: '*', table: 'bookings' }, () => {
        fetchStats();
        fetchActiveRequests();
        fetchActiveSessions();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [user, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusDropdownOpen]);

  const currentStatus: PartnerStatus = user?.status ?? 'offline';
  const city = user?.city ?? 'Not set';
  const zone = user?.zone ?? 'Not set';

  const statusConfig: Record<PartnerStatus, { label: string; dot: string; pill: string }> = {
    online: {
      label: 'Online',
      dot: 'bg-[#66BD59] shadow-[0_0_8px_rgba(102,189,89,0.6)]',
      pill: 'bg-[#66BD59]/15 text-[#66BD59] border-[#66BD59]/30',
    },
    ontrip: {
      label: 'On trip',
      dot: 'bg-[#34C0CA] shadow-[0_0_8px_rgba(52,192,202,0.6)]',
      pill: 'bg-[#34C0CA]/15 text-[#34C0CA] border-[#34C0CA]/30',
    },
    offline: {
      label: 'Offline',
      dot: 'bg-white/40',
      pill: 'bg-white/10 text-white/85 border-white/15',
    },
  };
  const current = statusConfig[currentStatus];

  const handleStatusChange = async (status: PartnerStatus) => {
    if (status === currentStatus) {
      setIsStatusDropdownOpen(false);
      return;
    }
    setIsStatusUpdating(true);
    setIsStatusDropdownOpen(false);
    await (setStatus as any)(status);
    setIsStatusUpdating(false);
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-8">
        {/* Welcome + location + status */}
        <DarkCard glow noPadding>
          <div className="relative p-5">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#34C0CA]/30 to-[#66BD59]/30 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">
                    You're {current.label.toLowerCase()}
                  </p>
                  <p className="text-xl font-extrabold mt-1 text-white">
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                  </p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    disabled={isStatusUpdating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border ${current.pill} font-bold text-xs transition active:scale-95 shrink-0 ${
                      isStatusUpdating ? 'opacity-60' : ''
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${current.dot}`} />
                    <span>{isStatusUpdating ? 'Updating…' : current.label}</span>
                    <FiChevronDown size={14} className={`transition ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white text-[#0F1415] rounded-2xl shadow-2xl border border-neutral-100 z-50 overflow-hidden">
                      {(Object.keys(statusConfig) as PartnerStatus[]).map(opt => {
                        const c = statusConfig[opt];
                        return (
                          <button
                            key={opt}
                            onClick={() => handleStatusChange(opt)}
                            className={`w-full text-left px-3 py-2.5 flex items-center gap-2 text-sm ${
                              currentStatus === opt ? 'bg-neutral-50 font-bold' : 'font-semibold'
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                            <span>{c.label}</span>
                            {currentStatus === opt && (
                              <FiCheckCircle className="ml-auto text-[#66BD59]" size={16} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">City</p>
                  <p className="text-sm font-bold mt-0.5 text-white">{city}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 border border-white/10">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">Zone</p>
                  <p className="text-sm font-bold mt-0.5 text-white">{zone}</p>
                </div>
              </div>
            </div>
          </div>
        </DarkCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: FiDollarSign, label: 'Earnings today', value: `₹${stats.earningsToday}`, color: '#66BD59' },
            { icon: FiClock, label: 'Active sessions', value: stats.activeSessions, color: '#34C0CA' },
            { icon: FiMapPin, label: 'Available slots', value: stats.availableSlots, color: '#66BD59' },
            { icon: FiAlertCircle, label: 'Pending requests', value: stats.pendingRequests, color: '#FFB627' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <DarkCard key={stat.label} className="!p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${stat.color}26`, color: stat.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-white/85">
                    {stat.label}
                  </p>
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
              </DarkCard>
            );
          })}
        </div>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <div>
            <SectionLabel>Active requests</SectionLabel>
            <div className="space-y-3">
              {activeRequests.map(r => (
                <DarkCard key={r.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{r.vehicleType}</p>
                      <p className="text-[11px] text-white/85 mt-0.5 truncate">{r.userLocation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold text-[#66BD59]">₹{r.estimatedEarnings}</p>
                      <p className="text-[10px] text-white/85 mt-0.5">{r.distance} away</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/85 mt-2">
                    <FiClock size={12} />
                    <span>{r.duration}</span>
                    <span className="ml-auto text-[#FFB627] font-semibold animate-pulse">
                      {r.timeLeft}s left
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <GradientButton
                      fullWidth
                      withArrow={false}
                      size="sm"
                      onClick={async () => {
                        const {
                          data: { user: u },
                        } = await supabase.auth.getUser();
                        if (!u) return;
                        await supabase
                          .from('bookings')
                          .update({
                            partner_id: u.id,
                            status: 'accepted',
                            started_at: new Date().toISOString(),
                          })
                          .eq('id', r.id)
                          .eq('status', 'searching');
                        await setStatus('ontrip');
                        router.push(`/requests/${r.id}`);
                      }}
                    >
                      Accept
                    </GradientButton>
                    <button
                      onClick={() => setActiveRequests(prev => prev.filter(x => x.id !== r.id))}
                      className="flex-1 py-2 rounded-full bg-white/10 text-white text-sm font-semibold active:scale-[0.98]"
                    >
                      Reject
                    </button>
                  </div>
                </DarkCard>
              ))}
            </div>
          </div>
        )}

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div>
            <SectionLabel>Active sessions</SectionLabel>
            <div className="space-y-3">
              {activeSessions.map(s => (
                <DarkCard
                  key={s.id}
                  onClick={() => router.push(`/sessions/${s.id}`)}
                  className={s.status === 'valet_enroute_return' ? 'border-[#FFB627]/50 ring-1 ring-[#FFB627]/30' : ''}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate">{s.vehicleNumber}</p>
                        {s.status === 'valet_enroute_return' && (
                          <span className="px-1.5 py-0.5 bg-[#FFB627] text-[#0F1415] text-[9px] font-bold rounded-full animate-pulse uppercase tracking-wider">
                            Return
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/85 mt-0.5">Slot: {s.slotNumber}</p>
                      <p className="text-[10px] text-white/85 mt-0.5">Started {s.startTime}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          s.status === 'valet_enroute_return' ? 'text-[#FFB627]' : 'text-[#34C0CA]'
                        }`}
                      >
                        {s.status === 'valet_enroute_return' ? 'User waiting' : s.remainingTime}
                      </p>
                      <p className="text-[10px] text-white/85 mt-0.5">
                        {s.status === 'valet_enroute_return' ? 'at pickup' : 'remaining'}
                      </p>
                    </div>
                  </div>
                  {s.status === 'valet_enroute_return' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/return/${s.id}`);
                      }}
                      className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#34C0CA] to-[#66BD59] text-white text-sm font-bold active:scale-[0.98]"
                    >
                      Initiate return
                    </button>
                  )}
                </DarkCard>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <SectionLabel>Quick actions</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiMapPin, label: 'Locations', href: '/parking-locations' },
              { icon: FiDollarSign, label: 'Earnings', href: '/earnings' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <DarkCard key={a.label} onClick={() => router.push(a.href)} className="!p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center text-white shrink-0">
                      <Icon size={18} />
                    </div>
                    <p className="flex-1 text-sm font-bold">{a.label}</p>
                    <HiArrowRight className="w-4 h-4 text-white/85" />
                  </div>
                </DarkCard>
              );
            })}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
