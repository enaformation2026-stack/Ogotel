import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hotel } from '@/types';

interface HotelState {
  activeHotel: Hotel | null;
  hotels: Hotel[];
  setActiveHotel: (hotel: Hotel | null) => void;
  setHotels: (hotels: Hotel[]) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, data: Partial<Hotel>) => void;
  removeHotel: (id: string) => void;
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
      addHotel: (hotel) =>
        set((state) => ({ hotels: [...state.hotels, hotel] })),
      updateHotel: (id, data) =>
        set((state) => ({
          hotels: state.hotels.map((h) => (h.id === id ? { ...h, ...data } : h)),
          activeHotel:
            state.activeHotel?.id === id
              ? { ...state.activeHotel, ...data }
              : state.activeHotel,
        })),
      removeHotel: (id) =>
        set((state) => ({
          hotels: state.hotels.filter((h) => h.id !== id),
          activeHotel:
            state.activeHotel?.id === id ? null : state.activeHotel,
        })),
    }),
    {
      name: 'ogotel-hotel-store',
    }
  )
);
