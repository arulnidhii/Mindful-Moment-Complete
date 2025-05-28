import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/mood';

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  
  // Actions
  setOnboarded: (value: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isOnboarded: false,
      
      setOnboarded: (value) => set({ isOnboarded: value }),
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);