import { MoodEntry } from '@/types/mood';
import PatternInsight from '@/components/PatternInsight';

export type InsightCard = {
  id: string;
  title: string;
  content: string;
  type: 'booster' | 'drainer' | 'combo';
  icon?: string;
  highlight?: string;
  highlights?: string[]; // For multiple highlights
};

// Helper: Find the most frequent item in an array
function findMostFrequent<T>(arr: T[]): T | null {
  const freq: Record<string, number> = {};
  let max = 0;
  let result: T | null = null;
  arr.forEach((item) => {
    const key = String(item);
    freq[key] = (freq[key] || 0) + 1;
    if (freq[key] > max) {
      max = freq[key];
      result = item;
    }
  });
  return result;
}

// Generator: Top Booster correlated with highest mood
function findTopBooster(entries: MoodEntry[]): InsightCard | null {
  const boosterCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    if (entry.boosters) {
      entry.boosters.forEach((b) => {
        boosterCounts[b] = (boosterCounts[b] || 0) + 1;
      });
    }
  });
  const sorted = Object.entries(boosterCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  const [top, count] = sorted[0];
  return {
    id: 'booster',
    title: 'Your Personal Energizer',
    content: `Healthy food seems to give your mood the biggest lift. Your top energizer is ${top}.`,
    type: 'booster',
    icon: '⚡',
    highlight: top,
  };
}

// Generator: Key Drainer correlated with lowest mood
function findKeyDrainer(entries: MoodEntry[]): InsightCard | null {
  const drainerCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    if (entry.drainers) {
      entry.drainers.forEach((d) => {
        drainerCounts[d] = (drainerCounts[d] || 0) + 1;
      });
    }
  });
  const sorted = Object.entries(drainerCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  const [top, count] = sorted[0];
  return {
    id: 'drainer',
    title: 'An Energy Drainer to Watch',
    content: `Watch out for ${top}—it seems to impact your mood the most.`,
    type: 'drainer',
    icon: '⚠️',
    highlight: top,
  };
}

// Generator: Most frequent activity overall
function findMostFrequentActivity(entries: MoodEntry[]): InsightCard | null {
  const allActs = entries.flatMap(e => [...(e.boosters || []), ...(e.drainers || [])]);
  const top = findMostFrequent(allActs);
  if (!top) return null;
  return {
    id: 'most-frequent-activity',
    title: 'Your Most Logged Activity',
    content: `${capitalize(top)} is the activity you tag most often.`,
    type: 'combo',
    icon: '📊',
    highlight: capitalize(top),
  };
}

// Add intra-day pattern detection
function findIntraDayPattern(entries: MoodEntry[]): InsightCard | null {
  if (entries.length < 3) return null;
  
  // Group entries by day
  const entriesByDay: Record<string, MoodEntry[]> = {};
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayKey = date.toISOString().split('T')[0];
    if (!entriesByDay[dayKey]) {
      entriesByDay[dayKey] = [];
    }
    entriesByDay[dayKey].push(entry);
  });

  // Analyze patterns within each day
  let improvementCount = 0;
  let declineCount = 0;
  let stableCount = 0;

  Object.values(entriesByDay).forEach(dayEntries => {
    if (dayEntries.length < 2) return;
    
    // Sort by timestamp
    dayEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Calculate mood values
    const moodValues: Record<string, number> = {
      'great': 5, 'good': 4, 'okay': 3, 'challenged': 2, 'struggling': 1
    };
    
    const firstMood = moodValues[dayEntries[0].mood_value.toLowerCase()] || 3;
    const lastMood = moodValues[dayEntries[dayEntries.length - 1].mood_value.toLowerCase()] || 3;
    
    if (lastMood > firstMood) {
      improvementCount++;
    } else if (lastMood < firstMood) {
      declineCount++;
    } else {
      stableCount++;
    }
  });

  const totalDays = Object.keys(entriesByDay).length;
  if (totalDays < 2) return null;

  const improvementRatio = improvementCount / totalDays;
  const declineRatio = declineCount / totalDays;

  if (improvementRatio > 0.5) {
    return {
      id: 'intra-day-improvement',
      title: 'Your Daily Trend',
      content: 'Your mood tends to improve throughout the day.',
      type: 'combo',
      icon: '📈',
      highlight: 'improve',
    };
  } else if (declineRatio > 0.5) {
    return {
      id: 'intra-day-decline',
      title: 'Your Daily Trend',
      content: 'Your mood tends to decline as the day progresses.',
      type: 'combo',
      icon: '📉',
      highlight: 'decline',
    };
  } else {
    return {
      id: 'intra-day-stable',
      title: 'Your Daily Trend',
      content: 'Your mood tends to remain stable throughout the day.',
      type: 'combo',
      icon: '➡️',
      highlight: 'stable',
    };
  }
}

// Add a generator for PatternInsight
function findPatternInsight(entries: MoodEntry[]): InsightCard | null {
  // Replicate the logic from PatternInsight.tsx for best time of day and best day of week
  if (!entries || entries.length < 3) return null;
  // Best time of day
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
    if (entry.mood_value.toLowerCase() === 'great' || entry.mood_value.toLowerCase() === 'good') {
      timeMap[timeOfDay].positiveCount++;
    }
  });
  let bestTime = null;
  let bestRatio = 0;
  Object.entries(timeMap).forEach(([time, data]) => {
    if (data.count >= 2) {
      const ratio = data.positiveCount / data.count;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestTime = time;
      }
    }
  });
  // Best day of week
  const dayMap: Record<number, { count: number, positiveCount: number }> = {
    0: { count: 0, positiveCount: 0 },
    1: { count: 0, positiveCount: 0 },
    2: { count: 0, positiveCount: 0 },
    3: { count: 0, positiveCount: 0 },
    4: { count: 0, positiveCount: 0 },
    5: { count: 0, positiveCount: 0 },
    6: { count: 0, positiveCount: 0 },
  };
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const day = date.getDay();
    dayMap[day].count++;
    if (entry.mood_value.toLowerCase() === 'great' || entry.mood_value.toLowerCase() === 'good') {
      dayMap[day].positiveCount++;
    }
  });
  let bestDay = null;
  let bestDayRatio = 0;
  Object.entries(dayMap).forEach(([day, data]) => {
    if (data.count >= 2) {
      const ratio = data.positiveCount / data.count;
      if (ratio > bestDayRatio) {
        bestDayRatio = ratio;
        bestDay = parseInt(day);
      }
    }
  });
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDayStr = bestDay !== null ? days[bestDay] : null;
  if (!bestTime && !bestDayStr) return null;
  let content = '';
  if (bestTime) {
    content += `You tend to feel your best during the ${bestTime}.`;
  }
  if (bestDayStr) {
    if (content) content += ' ';
    content += `${bestDayStr} appears to be your most positive day of the week.`;
  }
  return {
    id: 'pattern-insight',
    title: 'Your Patterns',
    content,
    type: 'combo',
    icon: '🕐',
    highlight: bestTime || bestDayStr || undefined,
    highlights: [bestTime, bestDayStr].filter((item): item is string => item !== null),
  };
}

// Utility: Capitalize first letter
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

// Main: Get fresh insights
export function getFreshInsights(entries: MoodEntry[], count = 4): InsightCard[] {
  const generators = [findTopBooster, findKeyDrainer, findMostFrequentActivity, findPatternInsight, findIntraDayPattern];
  const results: InsightCard[] = [];
  
  // Always try to include pattern insights first if available
  const patternInsight = findPatternInsight(entries);
  if (patternInsight) {
    results.push(patternInsight);
  }
  
  // Then add other insights
  const shuffled = generators.filter(gen => gen !== findPatternInsight).sort(() => Math.random() - 0.5);
  
  for (const gen of shuffled) {
    const card = gen(entries);
    if (card && !results.find(r => r.id === card.id)) {
      results.push(card);
    }
    if (results.length >= count) break;
  }
  
  return results;
} 