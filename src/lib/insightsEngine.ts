import { MoodEntry } from '@/types/mood';
import { useUserStore } from '@/store/userStore';
import { InsightPostcard } from './partnerService';

// --- Configuration & Mappings ---

// Maps the raw mood values from the app to numerical scores for analysis.
const moodToValue: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  challenged: 2,
  struggling: 1,
};

// Maps numerical mood scores to gentle, descriptive adjectives for use in templates.
const valueToAdjective: Record<number, string> = {
  5: 'very happy',
  4: 'good',
  3: 'okay',
  2: 'a bit challenged',
  1: 'to be struggling',
};

// --- Template Library ---

// A library of pre-written templates for different types of insights ("stories").
// Using multiple templates for each story type makes the insights feel more natural and less repetitive.
const postcardTemplates = {
  // Priority 1: A significant positive change in mood during the day.
  moodTurnaround: [
    "It looks like {partnerName} had a challenging start, but {turnaroundActivity} later on really helped them feel {highMoodAdjective}.",
    "After a tough morning, {turnaroundActivity} seems to have made a big positive difference for {partnerName}, helping them feel {highMoodAdjective}.",
  ],
  // Priority 2: The single best moment of an overall positive or stable day.
  moodBooster: [
    "A highlight from {partnerName}'s day: {activity} seems to have been a real energizer for them.",
    "A little sunshine from {partnerName} today: {activity} really helped them feel {mood}.",
  ],
  // Priority 3: A gentle, non-alarming heads-up about a difficult day.
  gentleNudge: [
    "A gentle heads-up: It seems {activity} might have been a bit draining for {partnerName} today.",
    "Just so you know, {partnerName} noted that {activity} was a bit of a challenge today.",
  ],
  // Priority 4: Daily rhythm pattern observation
  rhythmNote: [
    "A note on {partnerName}'s rhythm: It seems like {timeOfDay} is often a time when they feel their best.",
    "{partnerName}'s daily pattern shows they tend to feel {moodState} during {timeOfDay}.",
  ],
};

// --- Helper Functions ---

/**
 * A utility function to populate a template string with dynamic variables.
 * @param template The template string with {placeholders}.
 * @param variables An object with keys matching the placeholders.
 * @returns The populated string.
 */
const populateTemplate = (template: string, variables: Record<string, string>): string => {
  let populatedText = template;
  for (const key in variables) {
    populatedText = populatedText.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
  }
  return populatedText;
};

/**
 * Analyzes entries to determine the most common time of day for positive moods.
 */
const getTimeOfDayFromEntries = (entries: MoodEntry[]): string => {
  const timeMap: Record<string, { count: number, positiveCount: number }> = {
    'morning': { count: 0, positiveCount: 0 },
    'afternoon': { count: 0, positiveCount: 0 },
    'evening': { count: 0, positiveCount: 0 },
    'night': { count: 0, positiveCount: 0 },
  };
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    let timeOfDay: string;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }
    
    timeMap[timeOfDay].count++;
    if (moodToValue[entry.mood_value] >= 4) {
      timeMap[timeOfDay].positiveCount++;
    }
  });
  
  // Find the time with the highest positive ratio
  let bestTime = 'morning';
  let bestRatio = 0;
  
  Object.entries(timeMap).forEach(([time, data]) => {
    if (data.count > 0) {
      const ratio = data.positiveCount / data.count;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestTime = time;
      }
    }
  });
  
  return bestTime;
};

/**
 * Determines the overall mood state for the day.
 */
const getOverallMoodState = (entries: MoodEntry[]): string => {
  const totalMoodValue = entries.reduce((sum, entry) => sum + (moodToValue[entry.mood_value] || 3), 0);
  const averageMood = totalMoodValue / entries.length;
  
  if (averageMood >= 4) return 'great';
  if (averageMood >= 3) return 'good';
  if (averageMood >= 2) return 'okay';
  return 'challenged';
};

// --- The Main Engine ---

/**
 * Analyzes a single day's mood entries and generates the most meaningful postcard for a partner.
 * @param dailyEntries An array of MoodEntry objects for a single day.
 * @returns An InsightPostcard object or null if no meaningful insight is found.
 */
export const generatePartnerPostcard = (dailyEntries: MoodEntry[]): Omit<InsightPostcard, 'timestamp'> | null => {
  console.log('🔍 Generating partner postcard for', dailyEntries.length, 'daily entries');
  
  if (dailyEntries.length < 2) {
    console.log('📭 Not enough data for meaningful daily insight (need at least 2 entries)');
    return null;
  }

  const partnerName = useUserStore.getState().userName || 'your partner';
  console.log('👤 Partner name:', partnerName);

  // Sort entries chronologically to understand the day's progression.
  const sortedEntries = [...dailyEntries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const firstEntry = sortedEntries[0];
  const lastEntry = sortedEntries[sortedEntries.length - 1];
  const highestMoodEntry = sortedEntries.reduce((max, entry) => (moodToValue[entry.mood_value] > moodToValue[max.mood_value] ? entry : max));
  const lowestMoodEntry = sortedEntries.reduce((min, entry) => (moodToValue[min.mood_value] < moodToValue[entry.mood_value] ? entry : min));

  const firstValue = moodToValue[firstEntry.mood_value] || 3;
  const lastValue = moodToValue[lastEntry.mood_value] || 3;

  console.log('📊 Mood analysis:', {
    firstMood: firstEntry.mood_value,
    firstValue,
    lastMood: lastEntry.mood_value,
    lastValue,
    highestMood: highestMoodEntry.mood_value,
    lowestMood: lowestMoodEntry.mood_value
  });

  // --- Priority 1: Check for a significant positive turnaround ---
  if (firstValue <= 2 && lastValue >= 4) {
    console.log('🎯 Priority 1: Mood turnaround detected!');
    const turnaroundActivity = lastEntry.boosters?.[0] || 'something positive';
    const variables = {
      partnerName,
      turnaroundActivity,
      highMoodAdjective: valueToAdjective[lastValue],
    };
    const template = postcardTemplates.moodTurnaround[Math.floor(Math.random() * postcardTemplates.moodTurnaround.length)];
    const populated = populateTemplate(template, variables);
    const postcard: Omit<InsightPostcard, 'timestamp'> = {
      type: 'mood_booster',
      emoji: '💌',
      text: populated,
      highlights: [turnaroundActivity, variables.highMoodAdjective]
    };
    console.log('📬 Generated turnaround postcard:', postcard.text);
    return postcard;
  }

  // --- Priority 2: Find the single biggest positive moment ---
  if (highestMoodEntry.boosters && highestMoodEntry.boosters.length > 0) {
    console.log('🎯 Priority 2: Mood booster detected!');
    const activity = highestMoodEntry.boosters[0];
    const mood = highestMoodEntry.mood_value;
    const variables = { partnerName, activity, mood };
    const template = postcardTemplates.moodBooster[Math.floor(Math.random() * postcardTemplates.moodBooster.length)];
    const populated = populateTemplate(template, variables);
    const postcard: Omit<InsightPostcard, 'timestamp'> = {
      type: 'mood_booster',
      emoji: '☀️',
      text: populated,
      highlights: [activity, mood]
    };
    console.log('📬 Generated booster postcard:', postcard.text);
    return postcard;
  }

  // --- Priority 3: Provide a gentle nudge about a challenge ---
  if (lowestMoodEntry.drainers && lowestMoodEntry.drainers.length > 0 && moodToValue[lowestMoodEntry.mood_value] <= 2) {
    console.log('🎯 Priority 3: Gentle nudge detected!');
    const activity = lowestMoodEntry.drainers[0];
    const variables = { partnerName, activity };
    const template = postcardTemplates.gentleNudge[Math.floor(Math.random() * postcardTemplates.gentleNudge.length)];
    const populated = populateTemplate(template, variables);
    const postcard: Omit<InsightPostcard, 'timestamp'> = {
      type: 'gentle_nudge',
      emoji: '❤️‍🩹',
      text: populated,
      highlights: [activity]
    };
    console.log('📬 Generated nudge postcard:', postcard.text);
    return postcard;
  }

  // --- Priority 4: Daily rhythm pattern observation ---
  if (dailyEntries.length >= 3) {
    console.log('🎯 Priority 4: Rhythm pattern detected!');
    const timeOfDay = getTimeOfDayFromEntries(dailyEntries);
    const moodState = getOverallMoodState(dailyEntries);
    const variables = { partnerName, timeOfDay, moodState };
    const template = postcardTemplates.rhythmNote[Math.floor(Math.random() * postcardTemplates.rhythmNote.length)];
    const populated = populateTemplate(template, variables);
    const postcard: Omit<InsightPostcard, 'timestamp'> = {
      type: 'rhythm_note',
      emoji: '🌙',
      text: populated,
      highlights: [timeOfDay, moodState]
    };
    console.log('📬 Generated rhythm postcard:', postcard.text);
    return postcard;
  }

  // If no specific story is found, return null.
  console.log('📭 No meaningful daily insight found for postcard');
  return null;
};


