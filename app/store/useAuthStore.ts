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
  setStatus: async (status: PartnerStatus) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { error: 'No user found' };

      const { error } = await supabase
        .from('profiles')
        .update({ 
          status, 
          is_online: status === 'online' || status === 'ontrip' 
        })
        .eq('id', authUser.id);

      if (error) throw error;

      set((state) => ({
        user: state.user ? {
          ...state.user,
          status,
          isOnline: status === 'online' || status === 'ontrip'
        } : {
          // Fallback if full profile isn't loaded yet
          id: authUser.id,
          name: authUser.user_metadata?.full_name || '',
          phone: authUser.phone || '',
          email: authUser.email || '',
          city: '',
          zone: '',
          kycStatus: 'pending',
          status,
          isOnline: status === 'online' || status === 'ontrip'
        },
        isAuthenticated: true,
      }));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating status:', error);
      return { error: error.message };
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
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Initial fetch
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
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

      // 2. Real-time subscription for profile changes (status, etc.)
      supabase
        .channel(`profile-${authUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${authUser.id}`,
          },
          (payload) => {
            const updatedProfile = payload.new;
            set((state) => ({
              user: state.user ? {
                ...state.user,
                status: updatedProfile.status,
                isOnline: updatedProfile.is_online,
                kycStatus: updatedProfile.kyc_status,
              } : null,
            }));
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  },
}));

