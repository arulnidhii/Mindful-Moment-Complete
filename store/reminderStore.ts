import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReminderState {
  enabled: boolean;
  time: string; // HH:MM format
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  smartReminders: boolean; // Whether to use AI-based timing
  lastCheckInTimes: string[]; // Array of ISO strings for last 10 check-ins
  
  // Actions
  toggleEnabled: () => void;
  setTime: (time: string) => void;
  toggleDay: (day: keyof ReminderState['days']) => void;
  toggleSmartReminders: () => void;
  addCheckInTime: (time: string) => void;
  getSuggestedReminderTime: () => string | null;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      enabled: false,
      time: '20:00', // Default to 8:00 PM
      days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      smartReminders: false,
      lastCheckInTimes: [],
      
      toggleEnabled: () => {
        set(state => ({ enabled: !state.enabled }));
      },
      
      setTime: (time) => {
        set({ time });
      },
      
      toggleDay: (day) => {
        set(state => ({
          days: {
            ...state.days,
            [day]: !state.days[day]
          }
        }));
      },
      
      toggleSmartReminders: () => {
        set(state => ({ smartReminders: !state.smartReminders }));
      },
      
      addCheckInTime: (time) => {
        set(state => {
          const newTimes = [time, ...state.lastCheckInTimes].slice(0, 10);
          return { lastCheckInTimes: newTimes };
        });
      },
      
      getSuggestedReminderTime: () => {
        const { lastCheckInTimes } = get();
        
        if (lastCheckInTimes.length < 5) {
          return null; // Not enough data to make a suggestion
        }
        
        // Extract hours and minutes from check-in times
        const timeData = lastCheckInTimes.map(timeStr => {
          const date = new Date(timeStr);
          return {
            hour: date.getHours(),
            minute: date.getMinutes()
          };
        });
        
        // Group by hour to find the most common check-in hour
        const hourCounts: Record<number, number> = {};
        timeData.forEach(time => {
          hourCounts[time.hour] = (hourCounts[time.hour] || 0) + 1;
        });
        
        // Find the most common hour
        let mostCommonHour = 0;
        let highestCount = 0;
        
        Object.entries(hourCounts).forEach(([hour, count]) => {
          if (count > highestCount) {
            highestCount = count;
            mostCommonHour = parseInt(hour);
          }
        });
        
        // Calculate average minute within that hour
        const minutesInHour = timeData
          .filter(time => time.hour === mostCommonHour)
          .map(time => time.minute);
        
        const avgMinute = Math.round(
          minutesInHour.reduce((sum, minute) => sum + minute, 0) / minutesInHour.length
        );
        
        // Format as HH:MM
        return `${mostCommonHour.toString().padStart(2, '0')}:${avgMinute.toString().padStart(2, '0')}`;
      },
    }),
    {
      name: 'reminder-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);