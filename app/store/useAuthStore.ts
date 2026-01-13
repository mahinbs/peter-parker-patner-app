import { create } from 'zustand';

export type PartnerStatus = 'online' | 'ontrip' | 'offline';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  zone: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  status: PartnerStatus;
  isOnline: boolean; // Keep for backward compatibility
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateKYCStatus: (status: 'pending' | 'approved' | 'rejected') => void;
  setStatus: (status: PartnerStatus) => void;
  toggleOnline: () => void; // Keep for backward compatibility
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateKYCStatus: (status) =>
    set((state) => ({
      user: state.user ? { ...state.user, kycStatus: status } : null,
    })),
  setStatus: (status) =>
    set((state) => {
      if (!state.user) {
        // Initialize user if not present
        const newUser: User = {
          id: '1',
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          city: 'Mumbai',
          zone: 'Zone A',
          kycStatus: 'approved',
          status: 'offline',
          isOnline: false,
        };
        return { user: newUser, isAuthenticated: true };
      }
      return {
        user: { 
          ...state.user, 
          status,
          isOnline: status === 'online' || status === 'ontrip', // Update isOnline based on status
        },
      };
    }),
  toggleOnline: () =>
    set((state) => {
      if (!state.user) {
        // Initialize user if not present
        const newUser: User = {
          id: '1',
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          city: 'Mumbai',
          zone: 'Zone A',
          kycStatus: 'approved',
          status: 'offline',
          isOnline: false,
        };
        return { user: newUser, isAuthenticated: true };
      }
      const newStatus = state.user.isOnline ? 'offline' : 'online';
      return {
        user: { 
          ...state.user, 
          isOnline: !state.user.isOnline,
          status: newStatus,
        },
      };
    }),
}));

