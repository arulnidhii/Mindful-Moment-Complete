import { scheduleMissedCheckIn, scheduleStreakCelebration } from './notifications';

// Initialize notification callbacks to break circular dependencies
export function initializeNotificationCallbacks(
  streakStore: any,
  moodStore: any,
  userStore: any
) {
  const { setOnStreakBreak } = streakStore.getState();
  const { setOnMilestoneAchieved } = moodStore.getState();
  
  // Set up streak break callback
  setOnStreakBreak(async () => {
    const { userName, lastNotificationDate } = userStore.getState();
    const newDate = await scheduleMissedCheckIn(userName || 'friend', lastNotificationDate);
    if (newDate) {
      userStore.getState().setLastNotificationDate(newDate);
    }
  });
  
  // Set up milestone achieved callback
  setOnMilestoneAchieved(async (milestone: string, streakDays: number) => {
    const { userName, lastNotificationDate } = userStore.getState();
    const newDate = await scheduleStreakCelebration(streakDays, userName || 'friend', lastNotificationDate);
    if (newDate) {
      userStore.getState().setLastNotificationDate(newDate);
    }
  });
}

// Helper function to update last notification date
export function updateLastNotificationDate(userStore: any, date: string) {
  userStore.getState().setLastNotificationDate(date);
} 