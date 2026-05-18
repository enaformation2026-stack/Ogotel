import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivePage =
  | 'dashboard'
  | 'hotels'
  | 'reservations'
  | 'rooms'
  | 'room-types'
  | 'guests'
  | 'payments'
  | 'reports'
  | 'staff'
  | 'settings'
  | 'settings-hotel'
  | 'settings-subscription'
  | 'settings-account';

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface UIState {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  authView: AuthView | null;
  setAuthView: (view: AuthView | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      authView: null,
      setAuthView: (view) => set({ authView: view }),
    }),
    {
      name: 'ogotel-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
