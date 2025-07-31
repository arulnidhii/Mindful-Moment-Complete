// Types for mood entries and related data

export interface MoodEntry {
  entry_id: string;
  user_id: string;
  timestamp: string;
  mood_value: string;
  guidance_text_shown: string;
  journal_note?: string;
  boosters?: string[];
  drainers?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  reminder_time?: string;
  reminder_enabled: boolean;
  subscription_status: 'active' | 'inactive';
}