import { scheduleMissedCheckIn, scheduleStreakCelebration } from './notifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { scheduleDailyReminder } from './notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  async handleNotification() {
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

// Add notification listener for rescheduling daily reminders
Notifications.addNotificationReceivedListener((notification) => {
  // Check if this is a daily reminder that needs to be rescheduled
  const data = notification.request.content.data as any;
  if (data && data.type === 'daily_reminder' && typeof data.hour === 'number' && typeof data.minute === 'number') {
    // Reschedule the next daily reminder
    const { hour, minute } = data;
    scheduleDailyReminder(hour, minute, 'User', null);
  }
});

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

// Request notification permissions with proper error handling
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    
    // For Android, we need to set the notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: false,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Check and log notification permissions
export async function checkNotificationPermissions() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

// Clear all scheduled notifications
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<any[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
} 

// Check and log notification channel status (Android only)
export async function checkNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      const channel = await Notifications.getNotificationChannelAsync('default');
      return channel;
    } catch (error) {
      console.error('Error checking notification channel:', error);
      return null;
    }
  } else {
    return null;
  }
}

// Reschedule notifications when app starts (call this in _layout.tsx)
export async function rescheduleNotificationsOnStart() {
  try {
    // Get user settings from storage (you'll need to implement this)
    // For now, we'll use default values
    const reminderEnabled = true; // Get from storage
    const reminderTime = '09:00'; // Get from storage
    const userName = 'User'; // Get from storage
    
    if (reminderEnabled) {
      const [hour, minute] = reminderTime.split(':').map(Number);
      await scheduleDailyReminder(hour, minute, userName, null);
    }
  } catch (error) {
    console.error('❌ Failed to reschedule notifications on start:', error);
  }
}