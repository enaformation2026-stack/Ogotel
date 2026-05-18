import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivePage =
  | 'dashboard'
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

interface UIState {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'ogotel-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
