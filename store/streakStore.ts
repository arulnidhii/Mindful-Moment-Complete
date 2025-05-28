import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  milestones: {
    firstEntry: boolean;
    threeDay: boolean;
    sevenDay: boolean;
    fourteenDay: boolean;
    thirtyDay: boolean;
    fiftyEntries: boolean;
    hundredEntries: boolean;
  };
  totalEntries: number;
  
  // Actions
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementEntries: () => void;
  checkMilestones: () => string | null; // Returns milestone name if newly achieved, null otherwise
}

// Helper function to check if two dates are consecutive
const isConsecutiveDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset time to compare just the dates
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

// Helper function to get today's date as a string
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      milestones: {
        firstEntry: false,
        threeDay: false,
        sevenDay: false,
        fourteenDay: false,
        thirtyDay: false,
        fiftyEntries: false,
        hundredEntries: false,
      },
      totalEntries: 0,
      
      incrementStreak: () => {
        const { currentStreak, longestStreak, lastCheckInDate } = get();
        const today = getTodayString();
        
        // If this is the first check-in or if the last check-in was yesterday
        if (!lastCheckInDate || isConsecutiveDay(lastCheckInDate, today)) {
          const newStreak = currentStreak + 1;
          const newLongestStreak = Math.max(newStreak, longestStreak);
          
          set({
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastCheckInDate: today,
          });
        } 
        // If checking in on the same day, don't increment streak
        else if (lastCheckInDate === today) {
          // Do nothing to the streak
        } 
        // If streak is broken
        else {
          set({
            currentStreak: 1, // Reset to 1 for today's check-in
            lastCheckInDate: today,
          });
        }
      },
      
      resetStreak: () => {
        set({
          currentStreak: 0,
          lastCheckInDate: null,
        });
      },
      
      incrementEntries: () => {
        const { totalEntries } = get();
        set({ totalEntries: totalEntries + 1 });
      },
      
      checkMilestones: () => {
        const { currentStreak, totalEntries, milestones } = get();
        const updatedMilestones = { ...milestones };
        let achievedMilestone = null;
        
        // Check streak-based milestones
        if (currentStreak >= 3 && !milestones.threeDay) {
          updatedMilestones.threeDay = true;
          achievedMilestone = 'threeDay';
        } else if (currentStreak >= 7 && !milestones.sevenDay) {
          updatedMilestones.sevenDay = true;
          achievedMilestone = 'sevenDay';
        } else if (currentStreak >= 14 && !milestones.fourteenDay) {
          updatedMilestones.fourteenDay = true;
          achievedMilestone = 'fourteenDay';
        } else if (currentStreak >= 30 && !milestones.thirtyDay) {
          updatedMilestones.thirtyDay = true;
          achievedMilestone = 'thirtyDay';
        }
        
        // Check entry-based milestones
        if (totalEntries === 1 && !milestones.firstEntry) {
          updatedMilestones.firstEntry = true;
          achievedMilestone = 'firstEntry';
        } else if (totalEntries >= 50 && !milestones.fiftyEntries) {
          updatedMilestones.fiftyEntries = true;
          achievedMilestone = 'fiftyEntries';
        } else if (totalEntries >= 100 && !milestones.hundredEntries) {
          updatedMilestones.hundredEntries = true;
          achievedMilestone = 'hundredEntries';
        }
        
        // Update milestones if any changed
        if (achievedMilestone) {
          set({ milestones: updatedMilestones });
        }
        
        return achievedMilestone;
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);