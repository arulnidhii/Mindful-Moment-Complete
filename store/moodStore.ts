import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '@/types/mood';
import { Mood } from '@/constants/moods';
import { getRandomGuidance } from '@/constants/guidance';
import { useStreakStore } from './streakStore';
import { useReminderStore } from './reminderStore';
import { useUserStore } from './userStore';
import { haptics } from '@/utils/haptics';
import { completeInAppReview } from '@/utils/inAppReview';
import { schedulePersonalizedNotification } from '@/utils/notifications';
import { generateAndSendDailyPostcard } from '@/src/lib/partnerService';

interface MoodState {
  entries: MoodEntry[];
  currentMood: string | null;
  currentGuidance: string | null;
  journalNote: string;
  boosters: string[];
  drainers: string[];
  onMilestoneAchieved?: (milestone: string, streakDays: number) => void; // Callback for milestone achievements
  
  // Actions
  setCurrentMood: (mood: string) => void;
  setJournalNote: (note: string) => void;
  setBoosters: (boosters: string[]) => void;
  setDrainers: (drainers: string[]) => void;
  saveMoodEntry: () => Promise<string | null>; // Returns milestone if achieved
  deleteEntries: (entryIds: string[]) => void;
  clearCurrentEntry: () => void;
  setOnMilestoneAchieved: (callback: (milestone: string, streakDays: number) => void) => void;
}

// Mock user ID for demo purposes
const MOCK_USER_ID = 'user-123';

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentMood: null,
      currentGuidance: null,
      journalNote: '',
      boosters: [],
      drainers: [],
      onMilestoneAchieved: undefined,
      
      setOnMilestoneAchieved: (callback) => {
        set({ onMilestoneAchieved: callback });
      },
      
      setCurrentMood: (mood) => {
        const guidance = getRandomGuidance(mood);
        haptics.selection(); // Haptic feedback for mood selection
        set({ currentMood: mood, currentGuidance: guidance });
      },
      
      setJournalNote: (note) => {
        set({ journalNote: note });
      },
      
      setBoosters: (boosters) => set({ boosters }),
      setDrainers: (drainers) => set({ drainers }),
      
      saveMoodEntry: async () => {
        const { currentMood, currentGuidance, journalNote, entries, boosters, drainers, onMilestoneAchieved } = get();
        
        if (!currentMood || !currentGuidance) return null;
        
        const now = new Date();
        const timestamp = now.toISOString();
        
        const newEntry: MoodEntry = {
          entry_id: Date.now().toString(),
          user_id: MOCK_USER_ID,
          timestamp,
          mood_value: currentMood,
          guidance_text_shown: currentGuidance,
          journal_note: journalNote || undefined,
          boosters: boosters.length > 0 ? boosters : undefined,
          drainers: drainers.length > 0 ? drainers : undefined
        };
        
        // Update streak and entry count
        useStreakStore.getState().incrementStreak();
        useStreakStore.getState().incrementEntries();
        
        // Add check-in time for smart reminders
        useReminderStore.getState().addCheckInTime(timestamp);
        
        // Check for milestones
        const milestone = useStreakStore.getState().checkMilestones();
        
        // Trigger streak celebration notification if milestone is a streak milestone
        if (milestone && ["threeDay", "sevenDay", "fourteenDay", "thirtyDay"].includes(milestone)) {
          const currentStreak = useStreakStore.getState().currentStreak;
          if (onMilestoneAchieved) {
            onMilestoneAchieved(milestone, currentStreak);
          }
        }
        
        // Provide success haptic feedback
        haptics.success();
        
        const updatedEntries = [newEntry, ...entries];
        
        set({ 
          entries: updatedEntries,
          currentMood: null,
          currentGuidance: null,
          journalNote: '',
          boosters: [],
          drainers: []
        });
        
        // Schedule personalized notification based on patterns
        const { userName, lastNotificationDate } = useUserStore.getState();
        try {
          const personalizedResult = await schedulePersonalizedNotification(
            updatedEntries, 
            userName || 'friend', 
            lastNotificationDate
          );
          
          // Update last notification date if personalized notification was sent
          if (personalizedResult) {
            useUserStore.getState().setLastNotificationDate(personalizedResult.date);
          }
        } catch (error) {
          console.error('Failed to schedule personalized notification:', error);
        }
        
        // Trigger in-app review after successful save
        const currentStreak = useStreakStore.getState().currentStreak;
        const { lastReviewDate, setLastReviewDate } = useUserStore.getState();
        
        // Use setTimeout to ensure the review doesn't interrupt the save flow
        setTimeout(() => {
          completeInAppReview(
            updatedEntries.length,
            currentStreak,
            lastReviewDate,
            setLastReviewDate
          );
        }, 1000);
        
        // Generate and send daily postcard to partner if connected
        try {
          await generateAndSendDailyPostcard(updatedEntries);
        } catch (error) {
          console.error('Failed to generate daily postcard:', error);
        }
        
        return milestone;
      },
      
      deleteEntries: (entryIds) => {
        haptics.warning(); // Warning haptic for deletion
        
        const { entries } = get();
        const updatedEntries = entries.filter(entry => !entryIds.includes(entry.entry_id));
        set({ entries: updatedEntries });
      },
      
      clearCurrentEntry: () => {
        set({
          currentMood: null,
          currentGuidance: null,
          journalNote: '',
          boosters: [],
          drainers: []
        });
      }
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);