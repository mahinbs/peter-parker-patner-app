'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IoHomeSharp, IoHome } from 'react-icons/io5';
import { IoWallet, IoWalletOutline } from 'react-icons/io5';
import { IoGift, IoGiftOutline } from 'react-icons/io5';
import { IoPersonCircle, IoPersonCircleOutline } from 'react-icons/io5';
import { IoCarSport, IoCarSportOutline } from 'react-icons/io5';
import { useAuthStore, PartnerStatus } from '../store/useAuthStore';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/';
  const isKYC = pathname?.startsWith('/kyc');

  if (isAuthPage || isKYC) {
    return <>{children}</>;
  }

  const navItems = [
    { 
      href: '/dashboard', 
      iconFilled: IoHomeSharp, 
      iconOutline: IoHome, 
      label: 'Home' 
    },
    { 
      href: '/parking-locations', 
      iconFilled: IoCarSport, 
      iconOutline: IoCarSportOutline, 
      label: 'Parking' 
    },
    { 
      href: '/earnings', 
      iconFilled: IoWallet, 
      iconOutline: IoWalletOutline, 
      label: 'Wallet' 
    },
    { 
      href: '/support', 
      iconFilled: IoGift, 
      iconOutline: IoGiftOutline, 
      label: 'Offers' 
    },
    { 
      href: '/profile', 
      iconFilled: IoPersonCircle, 
      iconOutline: IoPersonCircleOutline, 
      label: 'Profile' 
    },
  ];

  const currentStatus: PartnerStatus = user?.status ?? 'offline';
  
  const getStatusConfig = (status: PartnerStatus) => {
    switch (status) {
      case 'online':
        return {
          label: 'Online',
          color: 'bg-green-300 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
          bgColor: 'bg-white/20 border-white/30 shadow-lg',
        };
      case 'ontrip':
        return {
          label: 'On Trip',
          color: 'bg-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
          bgColor: 'bg-white/20 border-white/30 shadow-lg',
        };
      default:
        return {
          label: 'Offline',
          color: 'bg-white/50',
          bgColor: 'bg-white/10 border-white/20',
        };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/earnings') return 'Earnings';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/settings') return 'Settings';
    if (pathname?.startsWith('/requests')) return 'Request';
    if (pathname?.startsWith('/sessions')) return 'Session';
    if (pathname?.startsWith('/pickup')) return 'Pickup';
    if (pathname?.startsWith('/return')) return 'Return';
    if (pathname?.startsWith('/parking-locations')) return 'Locations';
    if (pathname?.startsWith('/chat')) return 'Chat';
    if (pathname === '/support') return 'Support';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] text-[var(--text-primary)] pb-20 lg:h-full lg:flex lg:flex-col lg:pb-0">
      {/* Premium Header with logo */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-0 z-50 text-white lg:relative lg:sticky gradient-primary shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-10 w-10 rounded-full bg-white/95 p-1.5 shadow-lg overflow-hidden"
            >
              <Image
                src="/icon.png"
                alt="Valet Partner"
                width={40}
                height={40}
                priority
                className="object-contain animate-float"
              />
            </motion.div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                Valet Partner
              </p>
              <motion.h1 
                key={pathname}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base font-semibold leading-tight text-white"
              >
                {getPageTitle()}
              </motion.h1>
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusConfig.bgColor} border`}
          >
            <motion.div
              animate={{ 
                scale: currentStatus === 'online' || currentStatus === 'ontrip' ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                duration: 2, 
                repeat: currentStatus === 'online' || currentStatus === 'ontrip' ? Infinity : 0 
              }}
              className={`h-2 w-2 rounded-full ${statusConfig.color}`}
            />
            <span className="text-white">{statusConfig.label}</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-3 sm:px-4 py-4 animate-in pb-28 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:min-h-0 lg:pb-4">{children}</main>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed lg:sticky bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md safe-bottom rounded-[28px] border border-white/10 bg-[#131c26]/95 backdrop-blur-xl z-50 shadow-[0_10px_30px_rgba(0,0,0,0.45)] lg:mt-auto lg:shrink-0"
      >
        <div className="grid grid-cols-5 h-[76px] px-1.5">
          {navItems.map((item, index) => {
            const isActive = item.href === '/parking-locations'
              ? pathname?.startsWith('/parking-locations')
              : pathname === item.href;
            const Icon = isActive ? item.iconFilled : item.iconOutline;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="shrink-0"
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-full h-full active:scale-95 shrink-0 ${
                    isActive ? 'text-[#4ADE80]' : 'text-[#8A939F] hover:text-[#B4BDC8]'
                  }`}
                >
                  <motion.div 
                    className={`relative transition-all duration-300 ${
                      isActive ? 'scale-105' : 'scale-100'
                    }`}
                    animate={isActive ? { scale: 1.05, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'w-6 h-6 text-[#4ADE80] drop-shadow-sm' 
                          : 'w-6 h-6 text-[#8A939F]'
                      }`}
                    />
                  </motion.div>
                  <span className={`text-[11px] tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'font-semibold text-[#4ADE80]' 
                      : 'font-medium text-[#8A939F]'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}

