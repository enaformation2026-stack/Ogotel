import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

// Données mock pour le profil utilisateur
const MOCK_PROFILE: UserProfile = {
  id: 'usr-001',
  organizationId: 'org-001',
  firstName: 'Mamadou',
  lastName: 'Konan',
  email: 'mamadou@hotel-cocody.ci',
  phone: '+225 07 08 09 10 11',
  avatarUrl: undefined,
  gender: 'male',
  role: 'owner',
  language: 'fr',
  isActive: true,
};

interface AuthState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: MOCK_PROFILE,
      isAuthenticated: true,
      setProfile: (profile) =>
        set({ profile, isAuthenticated: !!profile }),
      logout: () => set({ profile: null, isAuthenticated: false }),
    }),
    {
      name: 'ogotel-auth-store',
    }
  )
);
