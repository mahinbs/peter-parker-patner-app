import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isOnline: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateKYCStatus: (status: 'pending' | 'approved' | 'rejected') => void;
  toggleOnline: () => void;
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
          kycStatus: 'approved',
          isOnline: true,
        };
        return { user: newUser, isAuthenticated: true };
      }
      return {
        user: { ...state.user, isOnline: !state.user.isOnline },
      };
    }),
}));

