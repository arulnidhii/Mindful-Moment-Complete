import * as StoreReview from 'expo-store-review';

interface ReviewTrigger {
  shouldTrigger: boolean;
  reason: string;
}

/**
 * Check if the app should trigger an in-app review
 * Following Google Play best practices:
 * - After 5th mood entry
 * - After achieving 3-day streak
 * - Not on first launch
 * - Not too frequently
 */
export function shouldTriggerReview(
  totalEntries: number,
  currentStreak: number,
  lastReviewDate: string | null
): ReviewTrigger {
  const today = new Date().toISOString().split('T')[0];
  
  // Don't trigger if we already showed review today
  if (lastReviewDate === today) {
    return { shouldTrigger: false, reason: 'Already reviewed today' };
  }
  
  // Trigger after 5th mood entry
  if (totalEntries === 5) {
    return { shouldTrigger: true, reason: '5th mood entry milestone' };
  }
  
  // Trigger after achieving 3-day streak
  if (currentStreak === 3) {
    return { shouldTrigger: true, reason: '3-day streak achievement' };
  }
  
  // Trigger after 7-day streak (additional milestone)
  if (currentStreak === 7) {
    return { shouldTrigger: true, reason: '7-day streak achievement' };
  }
  
  // Trigger after 50th entry (significant milestone)
  if (totalEntries === 50) {
    return { shouldTrigger: true, reason: '50th mood entry milestone' };
  }
  
  return { shouldTrigger: false, reason: 'No trigger conditions met' };
}

/**
 * Request and launch in-app review
 * Following Google Play documentation best practices
 */
export async function requestInAppReview(): Promise<boolean> {
  try {
    // Check if the app is available for review
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Store review not available on this device');
      return false;
    }
    
    // Request the review flow
    const hasAction = await StoreReview.hasAction();
    
    if (!hasAction) {
      console.log('Store review action not available');
      return false;
    }
    
    // Launch the review flow
    await StoreReview.requestReview();
    
    console.log('In-app review flow completed');
    return true;
    
  } catch (error) {
    console.error('Error requesting in-app review:', error);
    return false;
  }
}

/**
 * Complete in-app review flow with proper error handling
 * This function handles the entire review process and updates the user store
 */
export async function completeInAppReview(
  totalEntries: number,
  currentStreak: number,
  lastReviewDate: string | null,
  updateLastReviewDate: (date: string) => void
): Promise<void> {
  const trigger = shouldTriggerReview(totalEntries, currentStreak, lastReviewDate);
  
  if (!trigger.shouldTrigger) {
    console.log('In-app review not triggered:', trigger.reason);
    return;
  }
  
  console.log('Triggering in-app review:', trigger.reason);
  
  // Request the review
  const success = await requestInAppReview();
  
  // Always update the last review date, regardless of success
  // This prevents showing the review too frequently
  const today = new Date().toISOString().split('T')[0];
  updateLastReviewDate(today);
  
  if (success) {
    console.log('In-app review completed successfully');
  } else {
    console.log('In-app review failed or was dismissed');
  }
} 