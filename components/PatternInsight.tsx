import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MoodEntry } from '@/types/mood';

interface PatternInsightProps {
  entries: MoodEntry[];
}

const PatternInsight: React.FC<PatternInsightProps> = ({ entries }) => {
  // This is a more sophisticated implementation for pattern detection
  // It handles multiple entries per day and detects intra-day patterns
  
  const getBestTimeOfDay = (): string | null => {
    if (entries.length < 3) return null;
    
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
    
    return bestTime;
  };
  
  const getBestDayOfWeek = (): string | null => {
    if (entries.length < 5) return null;
    
    const dayMap: Record<number, { count: number, positiveCount: number }> = {
      0: { count: 0, positiveCount: 0 }, // Sunday
      1: { count: 0, positiveCount: 0 },
      2: { count: 0, positiveCount: 0 },
      3: { count: 0, positiveCount: 0 },
      4: { count: 0, positiveCount: 0 },
      5: { count: 0, positiveCount: 0 },
      6: { count: 0, positiveCount: 0 }, // Saturday
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
    let bestRatio = 0;
    
    Object.entries(dayMap).forEach(([day, data]) => {
      if (data.count >= 2) {
        const ratio = data.positiveCount / data.count;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestDay = parseInt(day);
        }
      }
    });
    
    if (bestDay === null) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[bestDay];
  };
  
  // New function to detect intra-day mood patterns
  const getIntraDayPattern = (): string | null => {
    if (entries.length < 4) return null;
    
    // Group entries by day
    const entriesByDay: Record<string, MoodEntry[]> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!entriesByDay[dayKey]) {
        entriesByDay[dayKey] = [];
      }
      
      entriesByDay[dayKey].push(entry);
    });
    
    // Find days with multiple entries
    const daysWithMultipleEntries = Object.entries(entriesByDay)
      .filter(([_, dayEntries]) => dayEntries.length > 1);
    
    if (daysWithMultipleEntries.length < 2) return null;
    
    // Track mood improvement or decline throughout the day
    let daysWithImprovement = 0;
    let daysWithDecline = 0;
    let daysWithFluctuation = 0;
    
    const moodValues: Record<string, number> = {
      'great': 5,
      'good': 4,
      'okay': 3,
      'challenged': 2,
      'struggling': 1
    };
    
    daysWithMultipleEntries.forEach(([_, dayEntries]) => {
      // Sort entries by time
      const sortedEntries = [...dayEntries].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Compare first and last mood of the day
      const firstMood = sortedEntries[0].mood_value.toLowerCase();
      const lastMood = sortedEntries[sortedEntries.length - 1].mood_value.toLowerCase();
      
      const firstMoodValue = moodValues[firstMood] || 3;
      const lastMoodValue = moodValues[lastMood] || 3;
      
      if (lastMoodValue > firstMoodValue) {
        daysWithImprovement++;
      } else if (lastMoodValue < firstMoodValue) {
        daysWithDecline++;
      } else {
        // Check if there were fluctuations during the day
        let hadFluctuation = false;
        for (let i = 1; i < sortedEntries.length - 1; i++) {
          const currentMood = sortedEntries[i].mood_value.toLowerCase();
          const currentMoodValue = moodValues[currentMood] || 3;
          
          if (currentMoodValue !== firstMoodValue) {
            hadFluctuation = true;
            break;
          }
        }
        
        if (hadFluctuation) {
          daysWithFluctuation++;
        }
      }
    });
    
    // Determine the dominant pattern
    if (daysWithImprovement > daysWithDecline && daysWithImprovement > daysWithFluctuation) {
      return 'improvement';
    } else if (daysWithDecline > daysWithImprovement && daysWithDecline > daysWithFluctuation) {
      return 'decline';
    } else if (daysWithFluctuation > daysWithImprovement && daysWithFluctuation > daysWithDecline) {
      return 'fluctuation';
    }
    
    return null;
  };
  
  const bestTimeOfDay = getBestTimeOfDay();
  const bestDayOfWeek = getBestDayOfWeek();
  const intraDayPattern = getIntraDayPattern();
  
  if (!bestTimeOfDay && !bestDayOfWeek && !intraDayPattern) {
    return (
      <Text style={[typography.bodyMedium, styles.emptyText]}>
        Continue recording moments to discover your patterns. We need a bit more data to identify when you typically feel your best.
      </Text>
    );
  }
  
  return (
    <View style={styles.container}>
      {bestTimeOfDay && (
        <View style={styles.patternItem}>
          <View style={styles.patternIcon}>
            <Text style={styles.emoji}>⏰</Text>
          </View>
          <Text style={[typography.bodyMedium, styles.patternText]}>
            You tend to feel your best during the <Text style={styles.highlight}>{bestTimeOfDay}</Text>.
          </Text>
        </View>
      )}
      
      {bestDayOfWeek && (
        <View style={styles.patternItem}>
          <View style={styles.patternIcon}>
            <Text style={styles.emoji}>📅</Text>
          </View>
          <Text style={[typography.bodyMedium, styles.patternText]}>
            <Text style={styles.highlight}>{bestDayOfWeek}</Text> appears to be your most positive day of the week.
          </Text>
        </View>
      )}
      
      {intraDayPattern && (
        <View style={styles.patternItem}>
          <View style={styles.patternIcon}>
            <Text style={styles.emoji}>📈</Text>
          </View>
          <Text style={[typography.bodyMedium, styles.patternText]}>
            {intraDayPattern === 'improvement' && (
              <>Your mood tends to <Text style={styles.highlight}>improve throughout the day</Text>.</>
            )}
            {intraDayPattern === 'decline' && (
              <>Your mood tends to <Text style={styles.highlight}>decline as the day progresses</Text>.</>
            )}
            {intraDayPattern === 'fluctuation' && (
              <>Your mood tends to <Text style={styles.highlight}>fluctuate throughout the day</Text>.</>
            )}
          </Text>
        </View>
      )}
      
      <Text style={[typography.bodySmall, styles.note]}>
        These insights become more accurate as you continue to record moments.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patternIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  patternText: {
    flex: 1,
  },
  highlight: {
    fontWeight: '600',
    color: colors.blue.dark,
  },
  note: {
    fontStyle: 'italic',
    color: colors.text.tertiary,
    marginTop: 8,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default PatternInsight;