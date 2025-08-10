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

// Helper to check if we should allow notification (prevent spam while allowing important notifications)
function shouldAllowNotification(notificationType: string, lastNotificationDate: string | null): boolean {
  const today = getTodayString();
  
  // For daily reminders, weekly teasers, and gentle encouragement, limit to once per day
  // BUT allow them to fire even if other notification types were sent today
  if (['daily_reminder', 'weekly_teaser', 'gentle_encouragement'].includes(notificationType)) {
    // Only block if the SAME notification type was sent today
    // For now, we'll allow them to fire daily since they're scheduled notifications
    return true; // Allow scheduled notifications to fire daily
  }
  
  // For immediate/contextual notifications (streak celebration, missed check-in, personalized),
  // allow multiple per day but with some spacing
  if (['streak_celebration', 'missed_checkin', 'personalized'].includes(notificationType)) {
    // Allow if no notification today, or if it's been at least 2 hours since last notification
    if (!lastNotificationDate || lastNotificationDate !== today) {
      return true;
    }
    
    // For same-day notifications, check if enough time has passed
    const now = new Date();
    const lastNotification = new Date(lastNotificationDate + 'T12:00:00'); // Assume noon for date-only comparison
    const hoursSinceLast = (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLast >= 2; // Allow if 2+ hours have passed
  }
  
  return true; // Default allow
}

// --- Scheduling Functions ---

// Schedule daily reminder (N-01)
export async function scheduleDailyReminder(hour: number, minute: number, userName: string, lastNotificationDate: string | null) {
  // This check can remain if you want custom logic, but is not essential for scheduling
  if (!shouldAllowNotification('daily_reminder', lastNotificationDate)) {
    return;
  }

  const message = getRandomNotificationMessage(dailyReminderMessages, { userName });

  try {
    // Calculate seconds until the next occurrence of this time
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (now >= targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const secondsUntilTarget = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

    // Use timeInterval trigger which is more reliable on Android
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Mindful Moment',
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'daily_reminder', hour, minute },
      },
      trigger: {
        type: 'timeInterval',
        seconds: secondsUntilTarget,
        repeats: false, // We'll reschedule after each notification
      } as Notifications.NotificationTriggerInput,
    });

    return getTodayString();
  } catch (error) {
    console.error(`❌ Failed to schedule daily reminder:`, error);
    return null;
  }
}

// Schedule streak celebration (N-02)
export async function scheduleStreakCelebration(streakDays: number, userName: string, lastNotificationDate: string | null) {
  if (!shouldAllowNotification('streak_celebration', lastNotificationDate)) return;
  
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
  return getTodayString();
}

// Schedule weekly teaser (N-03, e.g. Sunday 8 AM)
export async function scheduleWeeklyTeaser(userName: string, lastNotificationDate: string | null) {
  if (!shouldAllowNotification('weekly_teaser', lastNotificationDate)) return;
  
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
    } as Notifications.NotificationTriggerInput,
  });
  return getTodayString();
}

// Schedule gentle encouragement (N-04, e.g. Wednesday 3 PM)
export async function scheduleGentleEncouragement(userName: string, lastNotificationDate: string | null) {
  if (!shouldAllowNotification('gentle_encouragement', lastNotificationDate)) return;
  
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
    } as Notifications.NotificationTriggerInput,
  });
  return getTodayString();
}

// Schedule missed check-in (N-05, e.g. next evening if missed)
export async function scheduleMissedCheckIn(userName: string, lastNotificationDate: string | null) {
  if (!shouldAllowNotification('missed_checkin', lastNotificationDate)) return;
  
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
    } as Notifications.NotificationTriggerInput,
  });
  return getTodayString();
}

// --- Proactive, Pattern-Based Notification Logic ---
export async function schedulePersonalizedNotification(entries: any[], userName: string, lastNotificationDate: string | null) {
  if (!shouldAllowNotification('personalized', lastNotificationDate)) return null;
  
  if (!entries || entries.length < 5) return null; // Not enough data for patterns

  // Proactive Booster Nudge: If negative trend and top booster not used recently
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
        return { message, date: getTodayString() };
      }
    }
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