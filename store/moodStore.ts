import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '@/types/mood';
import { MoodType } from '@/constants/moods';
import { getRandomGuidance } from '@/constants/guidance';
import { useStreakStore } from './streakStore';
import { useReminderStore } from './reminderStore';
import { haptics } from '@/utils/haptics';

interface MoodState {
  entries: MoodEntry[];
  currentMood: MoodType | null;
  currentGuidance: string | null;
  journalNote: string;
  
  // Actions
  setCurrentMood: (mood: MoodType) => void;
  setJournalNote: (note: string) => void;
  saveMoodEntry: () => Promise<string | null>; // Returns milestone if achieved
  deleteEntries: (entryIds: string[]) => void;
  clearCurrentEntry: () => void;
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
      
      setCurrentMood: (mood) => {
        const guidance = getRandomGuidance(mood);
        haptics.selection(); // Haptic feedback for mood selection
        set({ currentMood: mood, currentGuidance: guidance });
      },
      
      setJournalNote: (note) => {
        set({ journalNote: note });
      },
      
      saveMoodEntry: async () => {
        const { currentMood, currentGuidance, journalNote, entries } = get();
        
        if (!currentMood || !currentGuidance) return null;
        
        const now = new Date();
        const timestamp = now.toISOString();
        
        const newEntry: MoodEntry = {
          entry_id: Date.now().toString(),
          user_id: MOCK_USER_ID,
          timestamp,
          mood_value: currentMood,
          guidance_text_shown: currentGuidance,
          journal_note: journalNote || undefined
        };
        
        // Update streak and entry count
        useStreakStore.getState().incrementStreak();
        useStreakStore.getState().incrementEntries();
        
        // Add check-in time for smart reminders
        useReminderStore.getState().addCheckInTime(timestamp);
        
        // Check for milestones
        const milestone = useStreakStore.getState().checkMilestones();
        
        // Provide success haptic feedback
        haptics.success();
        
        set({ 
          entries: [newEntry, ...entries],
          currentMood: null,
          currentGuidance: null,
          journalNote: ''
        });
        
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
          journalNote: ''
        });
      }
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);