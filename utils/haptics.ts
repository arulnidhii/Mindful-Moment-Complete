import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Centralized haptic feedback utility
export const haptics = {
  // Light feedback for UI interactions like button presses
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Medium feedback for more significant interactions
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Heavy feedback for major state changes
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Selection feedback for item selection
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Success feedback for completed actions
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Warning feedback for cautionary actions
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
  
  // Error feedback for failed actions
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(err => {
        console.log('Haptics error:', err);
      });
    }
  },
};