import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MoodEntry } from '@/types/mood';
import { LinearGradient } from 'expo-linear-gradient';

interface DailyRhythmProps {
  entries: MoodEntry[];
}

const DailyRhythm: React.FC<DailyRhythmProps> = ({ entries }) => {
  // Only show this component if we have enough data
  if (entries.length < 4) {
    return (
      <Text style={[typography.bodyMedium, styles.emptyText]}>
        Record more moments throughout your day to see your daily mood rhythm.
      </Text>
    );
  }
  
  // Group entries by time of day
  const timeOfDayData = analyzeTimeOfDay(entries);
  
  // Get the time of day with the highest average mood
  const bestTimeOfDay = getBestTimeOfDay(timeOfDayData);
  
  return (
    <View style={styles.container}>
      <Text style={[typography.bodyMedium, styles.description]}>
        Your daily mood rhythm shows when you typically feel your best and worst throughout the day.
      </Text>
      
      <View style={styles.rhythmContainer}>
        {Object.entries(timeOfDayData).map(([timeOfDay, data]) => {
          if (data.count === 0) return null;
          
          const averageMoodValue = data.totalMoodValue / data.count;
          const height = Math.max(20, Math.min(100, averageMoodValue * 20)); // Scale to reasonable height
          
          // Get gradient colors
          const gradientColors = getGradientColors(timeOfDay, averageMoodValue);
          
          return (
            <View key={timeOfDay} style={styles.timeColumn}>
              <View style={styles.barContainer}>
                <LinearGradient
                  colors={gradientColors}
                  style={[styles.bar, { height }]}
                />
              </View>
              <Text style={styles.timeLabel}>{formatTimeOfDay(timeOfDay)}</Text>
              <Text style={styles.countLabel}>{data.count}</Text>
            </View>
          );
        })}
      </View>
      
      {bestTimeOfDay && (
        <Text style={[typography.bodyMedium, styles.insightText]}>
          Based on your check-ins, you typically feel your best during the <Text style={styles.highlight}>{formatTimeOfDay(bestTimeOfDay).toLowerCase()}</Text>.
        </Text>
      )}
    </View>
  );
};

// Helper functions
const analyzeTimeOfDay = (entries: MoodEntry[]) => {
  const timeOfDayData: Record<string, { count: number, totalMoodValue: number }> = {
    'early-morning': { count: 0, totalMoodValue: 0 },
    'morning': { count: 0, totalMoodValue: 0 },
    'afternoon': { count: 0, totalMoodValue: 0 },
    'evening': { count: 0, totalMoodValue: 0 },
    'night': { count: 0, totalMoodValue: 0 },
  };
  
  const moodValues: Record<string, number> = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'challenged': 2,
    'struggling': 1
  };
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    
    let timeOfDay: string;
    if (hour >= 5 && hour < 9) {
      timeOfDay = 'early-morning';
    } else if (hour >= 9 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }
    
    const moodValue = moodValues[entry.mood_value.toLowerCase()] || 3;
    
    timeOfDayData[timeOfDay].count++;
    timeOfDayData[timeOfDay].totalMoodValue += moodValue;
  });
  
  return timeOfDayData;
};

const getBestTimeOfDay = (timeOfDayData: Record<string, { count: number, totalMoodValue: number }>): string | null => {
  let bestTimeOfDay = null;
  let bestAverageMood = 0;
  
  Object.entries(timeOfDayData).forEach(([timeOfDay, data]) => {
    if (data.count >= 2) {
      const averageMood = data.totalMoodValue / data.count;
      if (averageMood > bestAverageMood) {
        bestAverageMood = averageMood;
        bestTimeOfDay = timeOfDay;
      }
    }
  });
  
  return bestTimeOfDay;
};

const formatTimeOfDay = (timeOfDay: string): string => {
  switch (timeOfDay) {
    case 'early-morning': return 'Early Morning';
    case 'morning': return 'Morning';
    case 'afternoon': return 'Afternoon';
    case 'evening': return 'Evening';
    case 'night': return 'Night';
    default: return timeOfDay;
  }
};

// Fixed return type to ensure we always return exactly two strings
const getGradientColors = (timeOfDay: string, averageMoodValue: number): [string, string] => {
  // Base colors for time of day
  const timeColors: Record<string, string> = {
    'early-morning': '#B0E0E6', // Powder Blue
    'morning': '#98FB98', // Pale Green
    'afternoon': '#87CEEB', // Sky Blue
    'evening': '#D8BFD8', // Thistle
    'night': '#9370DB', // Medium Purple
  };
  
  // Adjust intensity based on mood value
  const baseColor = timeColors[timeOfDay] || '#E6E6FA';
  
  if (averageMoodValue >= 4) {
    return ['#7CCD7C', baseColor]; // Good mood gradient
  } else if (averageMoodValue >= 3) {
    return ['#B0E0E6', baseColor]; // Neutral mood gradient
  } else {
    return ['#FFA07A', baseColor]; // Challenging mood gradient
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  description: {
    marginBottom: 16,
  },
  rhythmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  timeColumn: {
    alignItems: 'center',
    width: '18%',
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.semantic.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 4,
  },
  countLabel: {
    fontSize: 10,
    color: colors.semantic.onSurfaceVariant,
  },
  insightText: {
    marginTop: 16,
  },
  highlight: {
    fontWeight: '600',
    color: colors.primary[40],
  },
  emptyText: {
    color: colors.semantic.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default DailyRhythm;