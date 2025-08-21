import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Partner {
  id: string;
  name: string;
}

interface PartnerState {
  partner: Partner | null;
  setPartner: (partner: Partner | null) => void;
  clearPartner: () => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set) => ({
      partner: null,
      setPartner: (partner) => set({ partner }),
      clearPartner: () => set({ partner: null }),
    }),
    {
      name: 'partner-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
