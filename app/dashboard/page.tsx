'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiPower, 
  FiDollarSign, 
  FiMapPin, 
  FiClock, 
  FiAlertCircle,
  FiCheckCircle,
  FiNavigation
} from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import MobileContainer from '../components/MobileContainer';
import { useAuthStore } from '../store/useAuthStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, toggleOnline } = useAuthStore();

  const [stats, setStats] = useState({
    earningsToday: 1250,
    activeSessions: 3,
    availableSlots: 12,
    pendingRequests: 2,
  });

  const [activeRequests, setActiveRequests] = useState([
    {
      id: '1',
      userLocation: '123 Main St',
      vehicleType: 'Sedan',
      duration: '2 hours',
      estimatedEarnings: 200,
      distance: '1.2 km',
      timeLeft: 45,
    },
    {
      id: '2',
      userLocation: '456 Park Ave',
      vehicleType: 'SUV',
      duration: '4 hours',
      estimatedEarnings: 400,
      distance: '2.5 km',
      timeLeft: 30,
    },
  ]);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: '1',
      vehicleNumber: 'MH-12-AB-1234',
      startTime: '10:30 AM',
      remainingTime: '1h 30m',
      slotNumber: 'A-12',
    },
    {
      id: '2',
      vehicleNumber: 'MH-12-CD-5678',
      startTime: '11:00 AM',
      remainingTime: '2h 00m',
      slotNumber: 'B-05',
    },
  ]);

  const isOnline = user?.isOnline ?? false;

  const handleToggle = () => {
    toggleOnline();
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        {/* Online/Offline Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">Status</p>
                <motion.p 
                  key={isOnline ? 'online' : 'offline'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-lg font-bold ${
                    isOnline 
                      ? 'text-[var(--color-secondary-accent)]' 
                      : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </motion.p>
              </div>
              <motion.button
                onClick={handleToggle}
                whileTap={{ scale: 0.95 }}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  isOnline 
                    ? 'bg-[var(--color-secondary-accent)] shadow-lg shadow-[var(--color-secondary-accent)]/30' 
                    : 'bg-[var(--neutral-300)]'
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md ${
                    isOnline ? 'left-[calc(100%-1.5rem)]' : 'left-0.5'
                  }`}
                />
              </motion.button>
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
                          onClick={() => router.push(`/requests/${request.id}`)}
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

