import * as Notifications from 'expo-notifications';
import { getFreshInsights } from '@/utils/patternEngine';

// Notification copy pools
export const dailyReminderMessages = [
  "Time for your mindful moment, {userName}.",
  "How are you feeling right now, {userName}?",
  "A gentle nudge: check in with yourself today.",
  "Your mindful pause awaits, {userName}.",
  "Take a moment for you—how's your day going?",
  "Ready for a mindful pause, {userName}?",
  "A quick check-in can bring calm and clarity.",
  "How's your energy today, {userName}?",
  "What's one thing you're grateful for right now?",
];

export const streakCelebrationMessages = [
  "🎉 You've kept your streak going!",
  "{streakDays} days of mindfulness—well done, {userName}!",
  "You're on a {streakDays}-day streak! Keep it up, {userName}.",
  "Consistency is key—{streakDays} days and counting!",
  "Your mindful rhythm is strong, {userName}.",
];

export const weeklyTeaserMessages = [
  "Your weekly insight awaits, {userName}.",
  "Discover what your mood landscape revealed this week.",
  "A new week, a new opportunity for reflection.",
  "See how your emotions shifted this week, {userName}?",
];

export const gentleEncouragementMessages = [
  "You deserve a pause today, {userName}.",
  "A quick check-in can bring calm and clarity.",
  "Be gentle with yourself today, {userName}.",
  "A mindful moment can make a difference.",
];

export const missedCheckInMessages = [
  "We missed you yesterday, {userName}.",
  "It's okay—whenever you're ready, we're here to listen.",
  "No pressure—your mindful journey is always here for you.",
  "Ready to pick up where you left off, {userName}?",
];

// Helper to interpolate variables
function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

// Get a random message from a pool, interpolated
export function getRandomNotificationMessage(pool: string[], vars: Record<string, string | number>) {
  const idx = Math.floor(Math.random() * pool.length);
  return interpolate(pool[idx], vars);
}

// Helper to get today's date string (YYYY-MM-DD)
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// --- Scheduling Functions ---

// Schedule daily reminder (N-01)
export async function scheduleDailyReminder(hour: number, minute: number, userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return;
  
  const message = getRandomNotificationMessage(dailyReminderMessages, { userName });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mindful Moment',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'calendar',
      hour,
      minute,
      repeats: true,
    } as any,
  });
  return today; // Return today's date to update lastNotificationDate
}

// Schedule streak celebration (N-02)
export async function scheduleStreakCelebration(streakDays: number, userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return;
  
  const message = getRandomNotificationMessage(streakCelebrationMessages, { userName, streakDays });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 You've kept your streak going!",
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Immediate
  });
  return today; // Return today's date to update lastNotificationDate
}

// Schedule weekly teaser (N-03, e.g. Sunday 8 AM)
export async function scheduleWeeklyTeaser(userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return;
  
  const message = getRandomNotificationMessage(weeklyTeaserMessages, { userName });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your weekly insight awaits',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'calendar',
      weekday: 1, // Sunday
      hour: 8,
      minute: 0,
      repeats: true,
    } as any,
  });
  return today; // Return today's date to update lastNotificationDate
}

// Schedule gentle encouragement (N-04, e.g. Wednesday 3 PM)
export async function scheduleGentleEncouragement(userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return;
  
  const message = getRandomNotificationMessage(gentleEncouragementMessages, { userName });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'You deserve a pause today',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'calendar',
      weekday: 4, // Wednesday
      hour: 15,
      minute: 0,
      repeats: true,
    } as any,
  });
  return today; // Return today's date to update lastNotificationDate
}

// Schedule missed check-in (N-05, e.g. next evening if missed)
export async function scheduleMissedCheckIn(userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return;
  
  const message = getRandomNotificationMessage(missedCheckInMessages, { userName });
  // Schedule for tomorrow at 20:00 (8 PM)
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 0, 0, 0);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'We missed you yesterday',
      body: message,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'calendar',
      year: tomorrow.getFullYear(),
      month: tomorrow.getMonth() + 1, // JS months are 0-based
      day: tomorrow.getDate(),
      hour: 20,
      minute: 0,
      repeats: false,
    } as any,
  });
  return today; // Return today's date to update lastNotificationDate
}

// --- Proactive, Pattern-Based Notification Logic ---
export async function schedulePersonalizedNotification(entries: any[], userName: string, lastNotificationDate: string | null) {
  const today = getTodayString();
  if (lastNotificationDate === today) return null;
  
  if (!entries || entries.length < 5) return null; // Not enough data for patterns

  // 1. Proactive Booster Nudge: If negative trend and top booster not used recently
  const last5 = entries.slice(0, 5);
  const negativeMoods = last5.filter((e: any) => e.mood_value === 'challenged' || e.mood_value === 'struggling').length;
  if (negativeMoods >= 3) {
    // Find top booster overall
    const topBooster = getFreshInsights(entries, 1).find((i: any) => i.type === 'booster');
    if (topBooster) {
      // Check if top booster is missing from recent entries
      const usedRecently = last5.some((e: any) => (e.boosters || []).includes(topBooster.content.split(' ')[0].toLowerCase()));
      if (!usedRecently) {
        const message = `Hey ${userName}, feeling a bit stuck? Remember how great you often feel after a ${topBooster.content.split(' ')[0]}.`;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Try a Booster Activity',
            body: message,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Immediate
        });
        return { message, date: today };
      }
    }
  }

  // 2. Insight Teaser: If a new, unseen insight is available
  const insights = getFreshInsights(entries, 1);
  if (insights.length > 0) {
    const message = `This week, we noticed something interesting about how ${insights[0].title.toLowerCase()} impacts your mood. Tap to see your latest insight!`;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Insight Available',
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate
    });
    return { message, date: today };
  }

  // Fallback: No personalized message
  return null;
}

// Central function to (re)schedule all notifications
export async function rescheduleAllNotifications(
  reminderEnabled: boolean,
  reminderTime: string,
  userName: string,
  lastNotificationDate: string | null
) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  if (reminderEnabled) {
    const [hour, minute] = reminderTime.split(':').map(Number);
    await scheduleDailyReminder(hour, minute, userName, lastNotificationDate);
  }
  await scheduleWeeklyTeaser(userName, lastNotificationDate);
  await scheduleGentleEncouragement(userName, lastNotificationDate);
  // Missed check-in and streak celebration are triggered by app logic, not scheduled here
} 