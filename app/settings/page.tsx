'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiBell,
  FiGlobe,
  FiShield,
  FiCreditCard,
  FiClock,
  FiLock,
  FiChevronDown,
} from 'react-icons/fi';
import { HiPlus, HiChevronRight } from 'react-icons/hi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, GradientButton, SectionLabel } from '../components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    newRequests: true,
    extensions: true,
    messages: true,
    payouts: true,
  });
  const [language, setLanguage] = useState('English');

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifLabels: Record<keyof typeof notifications, { title: string; desc: string }> = {
    newRequests: { title: 'New requests', desc: 'Get notified about new parking requests' },
    extensions: { title: 'Extensions', desc: 'When a user extends their parking time' },
    messages: { title: 'Messages', desc: 'New chat messages from users' },
    payouts: { title: 'Payouts', desc: 'Updates about earnings and payouts' },
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-8">
        {/* Notifications */}
        <div>
          <SectionLabel>Notifications</SectionLabel>
          <DarkCard className="!p-2">
            <div className="divide-y divide-white/5">
              {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => {
                const value = notifications[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleNotification(key)}
                    className="w-full flex items-center gap-3 px-2 py-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                      <FiBell size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {notifLabels[key].title}
                      </p>
                      <p className="text-[11px] text-white/55 leading-tight mt-0.5">
                        {notifLabels[key].desc}
                      </p>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full transition relative shrink-0 ${
                        value ? 'bg-gradient-to-r from-[#34C0CA] to-[#66BD59]' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition ${
                          value ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </DarkCard>
        </div>

        {/* Language */}
        <div>
          <SectionLabel>Language</SectionLabel>
          <DarkCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiGlobe size={18} />
              </div>
              <div className="relative flex-1">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-semibold appearance-none outline-none focus:border-[#34C0CA]"
                >
                  <option className="text-[#0F1415]">English</option>
                  <option className="text-[#0F1415]">Hindi</option>
                  <option className="text-[#0F1415]">Marathi</option>
                  <option className="text-[#0F1415]">Tamil</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/55 pointer-events-none" />
              </div>
            </div>
          </DarkCard>
        </div>

        {/* Payment Methods */}
        <div>
          <SectionLabel>Payment methods</SectionLabel>
          <DarkCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center text-white shrink-0">
                <FiCreditCard size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Bank account</p>
                <p className="text-[11px] text-white/55 font-mono">•••• 1234</p>
              </div>
              <button className="text-xs font-semibold text-[#34C0CA] active:opacity-70">Edit</button>
            </div>

            <div className="border-t border-white/10 my-3" />

            <div className="space-y-2">
              <button
                onClick={() => router.push('/settings/payment/add-upi')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold active:scale-[0.98] transition"
              >
                <span className="flex items-center gap-2">
                  <HiPlus className="w-4 h-4 text-[#66BD59]" /> Add UPI ID
                </span>
                <HiChevronRight className="w-5 h-5 text-white/40" />
              </button>
              <button
                onClick={() => router.push('/settings/payment/add-card')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold active:scale-[0.98] transition"
              >
                <span className="flex items-center gap-2">
                  <HiPlus className="w-4 h-4 text-[#66BD59]" /> Add card
                </span>
                <HiChevronRight className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </DarkCard>
        </div>

        {/* Security */}
        <div>
          <SectionLabel>Security</SectionLabel>
          <DarkCard className="!p-2">
            <div className="divide-y divide-white/5">
              <button className="w-full flex items-center gap-3 px-2 py-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#66BD59]/15 text-[#66BD59] flex items-center justify-center shrink-0">
                  <FiLock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Change password</p>
                  <p className="text-[11px] text-white/55">Update your account password</p>
                </div>
                <HiChevronRight className="w-5 h-5 text-white/40" />
              </button>
              <button className="w-full flex items-center gap-3 px-2 py-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                  <FiShield size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Two-factor authentication</p>
                  <p className="text-[11px] text-white/55">Extra security on sign in</p>
                </div>
                <HiChevronRight className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </DarkCard>
        </div>

        {/* Availability Schedule */}
        <div>
          <SectionLabel>Availability</SectionLabel>
          <DarkCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                <FiClock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Operating hours</p>
                <p className="text-[11px] text-white/55">Set when you're available to accept requests</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <GradientButton size="sm" withArrow={false}>
                Set hours
              </GradientButton>
            </div>
          </DarkCard>
        </div>
      </div>
    </MobileContainer>
  );
}
