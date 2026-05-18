import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

interface AuthState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      isAuthenticated: false,
      setProfile: (profile) =>
        set({ profile, isAuthenticated: !!profile }),
      logout: () => set({ profile: null, isAuthenticated: false }),
    }),
    {
      name: 'ogotel-auth-store',
    }
  )
);
