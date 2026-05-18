import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hotel } from '@/types';

interface HotelState {
  activeHotel: Hotel | null;
  hotels: Hotel[];
  setActiveHotel: (hotel: Hotel | null) => void;
  setHotels: (hotels: Hotel[]) => void;
}

export const useHotelStore = create<HotelState>()(
  persist(
    (set) => ({
      activeHotel: null,
      hotels: [],
      setActiveHotel: (hotel) => set({ activeHotel: hotel }),
      setHotels: (hotels) => {
        set((state) => ({
          hotels,
          activeHotel: state.activeHotel ?? hotels[0] ?? null,
        }));
      },
    }),
    {
      name: 'ogotel-hotel-store',
    }
  )
);
