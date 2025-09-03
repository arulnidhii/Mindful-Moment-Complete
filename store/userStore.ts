import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/mood';

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  userName: string;
  lastNotificationDate: string;
  lastReviewDate: string | null;
  partnerPhoneNumber: string | null;

  // Actions
  setOnboarded: (value: boolean) => void;
  setProfile: (profile: UserProfile) => void;
  setUserName: (name: string) => void;
  setLastNotificationDate: (date: string) => void;
  setLastReviewDate: (date: string) => void;
  setPartnerPhoneNumber: (phoneNumber: string | null) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isOnboarded: false,
      userName: '',
      lastNotificationDate: '',
      lastReviewDate: null,
      partnerPhoneNumber: null,

      setOnboarded: (value) => set({ isOnboarded: value }),
      setProfile: (profile) => set({ profile }),
      setUserName: (name) => set({ userName: name }),
      setLastNotificationDate: (date) => set({ lastNotificationDate: date }),
      setLastReviewDate: (date) => set({ lastReviewDate: date }),
      setPartnerPhoneNumber: (phoneNumber) => set({ partnerPhoneNumber: phoneNumber }),
      clearProfile: () => set({ profile: null, userName: '', lastNotificationDate: '', lastReviewDate: null, partnerPhoneNumber: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);