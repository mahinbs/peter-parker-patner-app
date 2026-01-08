'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IoHomeSharp, IoHome } from 'react-icons/io5';
import { IoWallet, IoWalletOutline } from 'react-icons/io5';
import { FaUserCircle, FaRegUserCircle } from 'react-icons/fa';
import { IoSettings, IoSettingsOutline } from 'react-icons/io5';
import { useAuthStore } from '../store/useAuthStore';

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
      href: '/earnings', 
      iconFilled: IoWallet, 
      iconOutline: IoWalletOutline, 
      label: 'Earnings' 
    },
    { 
      href: '/profile', 
      iconFilled: FaUserCircle, 
      iconOutline: FaRegUserCircle, 
      label: 'Profile' 
    },
    { 
      href: '/settings', 
      iconFilled: IoSettings, 
      iconOutline: IoSettingsOutline, 
      label: 'Settings' 
    },
  ];

  const isOnline = user?.isOnline ?? false;

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
    <div className="min-h-screen w-full  bg-[var(--color-background)] text-[var(--text-primary)] pb-20 lg:h-full lg:flex lg:flex-col lg:pb-0">
      {/* Premium Header with logo */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="sticky top-0 z-50 gradient-primary text-white shadow-xl lg:relative lg:sticky"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isOnline 
                ? 'bg-white/20 border border-white/30 shadow-lg' 
                : 'bg-white/10 border border-white/20'
            }`}
          >
            <motion.div
              animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 2, repeat: isOnline ? Infinity : 0 }}
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-green-300 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/50'
              }`}
            />
            <span className="text-white/90">{isOnline ? 'Online' : 'Offline'}</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-3 sm:px-4 py-4 animate-in pb-20 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:min-h-0 lg:pb-4">{children}</main>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed lg:sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[var(--neutral-200)]/80 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] max-w-md safe-bottom lg:mt-auto lg:flex-shrink-0"
      >
        <div className="grid grid-cols-4 h-20 lg:h-20">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.iconFilled : item.iconOutline;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 w-full h-full active:scale-95 flex-shrink-0 ${
                    isActive ? 'text-[var(--color-secondary-accent)]' : 'text-[var(--neutral-400)] hover:text-[var(--neutral-600)]'
                  }`}
                >
                  <motion.div 
                    className={`relative transition-all duration-300 ${
                      isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'
                    }`}
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'w-7 h-7 text-[var(--color-secondary-accent)] drop-shadow-sm' 
                          : 'w-6 h-6 text-[var(--neutral-400)]'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 gradient-primary rounded-full animate-pulse-slow"
                      />
                    )}
                  </motion.div>
                  <span className={`text-xs tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'font-bold text-[var(--color-secondary-accent)]' 
                      : 'font-medium text-[var(--neutral-400)]'
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

