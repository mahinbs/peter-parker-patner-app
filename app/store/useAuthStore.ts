import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  toggleOnline: () => void;
  fetchProfile: () => Promise<void>;
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
  setStatus: async (status) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ status, is_online: status === 'online' || status === 'ontrip' })
        .eq('id', user.id);

      set((state) => ({
        user: state.user ? {
          ...state.user,
          status,
          isOnline: status === 'online' || status === 'ontrip'
        } : null,
      }));
    }
  },
  toggleOnline: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const state = useAuthStore.getState();
    if (user && state.user) {
      const newIsOnline = !state.user.isOnline;
      const newStatus: PartnerStatus = newIsOnline ? 'online' : 'offline';

      await supabase
        .from('profiles')
        .update({ is_online: newIsOnline, status: newStatus })
        .eq('id', user.id);

      set((state) => ({
        user: state.user ? {
          ...state.user,
          isOnline: newIsOnline,
          status: newStatus,
        } : null,
      }));
    }
  },
  fetchProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        set({
          user: {
            id: profile.id,
            name: profile.name || profile.full_name,
            phone: profile.phone,
            email: profile.email,
            city: profile.city,
            zone: profile.zone,
            kycStatus: profile.kyc_status,
            status: profile.status,
            isOnline: profile.is_online,
          },
          isAuthenticated: true,
        });
      }
    }
  },
}));

