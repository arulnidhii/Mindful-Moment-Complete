import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Animated, { FadeIn } from 'react-native-reanimated';

interface MoodCount {
  mood: string;
  count: number;
  percentage: number;
}

interface MoodDistributionProps {
  data: MoodCount[];
  weekData?: MoodCount[];
  monthData?: MoodCount[];
  weekDataByDay?: MoodCount[];
  monthDataByDay?: MoodCount[];
}

const MoodDistribution: React.FC<MoodDistributionProps> = ({ 
  data,
  weekData,
  monthData,
  weekDataByDay,
  monthDataByDay
}) => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month'>('week');
  const [viewMode, setViewMode] = useState<'by-entry' | 'by-day'>('by-entry');
  
  // Use the appropriate data based on selected time frame and view mode
  const getDisplayData = () => {
    if (timeFrame === 'week') {
      return viewMode === 'by-entry' ? (weekData || data) : (weekDataByDay || data);
    } else {
      return viewMode === 'by-entry' ? (monthData || data) : (monthDataByDay || data);
    }
  };

  const displayData = getDisplayData();

  // Find the most frequent mood
  const getMostFrequentMood = (): string => {
    if (displayData.length === 0) return 'No data';
    
    const sorted = [...displayData].sort((a, b) => b.count - a.count);
    return sorted[0].mood;
  };

  // Fixed return type to ensure we always return exactly two strings
  const getMoodGradient = (mood: string): [string, string] => {
    switch (mood.toLowerCase()) {
      case 'great': return ['#98FB98', '#7CCD7C'];
      case 'good': return ['#B0E0E6', '#87CEEB'];
      case 'okay': return ['#E6E6FA', '#D8BFD8'];
      case 'challenged': return ['#FFA07A', '#FF7F50'];
      case 'struggling': return ['#D8BFD8', '#9370DB'];
      default: return ['#E6E6FA', '#D8BFD8'];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeFrameSelector}>
        <TouchableOpacity 
          style={[
            styles.timeFrameButton, 
            timeFrame === 'week' && styles.timeFrameButtonActive
          ]}
          onPress={() => setTimeFrame('week')}
        >
          <Text 
            style={[
              styles.timeFrameText, 
              timeFrame === 'week' && styles.timeFrameTextActive
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.timeFrameButton, 
            timeFrame === 'month' && styles.timeFrameButtonActive
          ]}
          onPress={() => setTimeFrame('month')}
        >
          <Text 
            style={[
              styles.timeFrameText, 
              timeFrame === 'month' && styles.timeFrameTextActive
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewModeSelector}>
        <TouchableOpacity 
          style={[
            styles.viewModeButton, 
            viewMode === 'by-entry' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('by-entry')}
        >
          <Text 
            style={[
              styles.viewModeText, 
              viewMode === 'by-entry' && styles.viewModeTextActive
            ]}
          >
            By Entry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.viewModeButton, 
            viewMode === 'by-day' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('by-day')}
        >
          <Text 
            style={[
              styles.viewModeText, 
              viewMode === 'by-day' && styles.viewModeTextActive
            ]}
          >
            By Day
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[typography.bodyMedium, styles.periodText]}>
        {timeFrame === 'week' ? 'Last 7 Days' : 'Last 30 Days'} • {viewMode === 'by-entry' ? 'All Entries' : 'Daily Average'}
      </Text>
      
      {displayData.length > 0 ? (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.barsContainer}
        >
          {displayData.map((item) => {
            const gradient = getMoodGradient(item.mood);
            return (
              <View key={item.mood} style={styles.barItem}>
                <View style={styles.labelContainer}>
                  <Text style={typography.bodySmall}>{item.mood}</Text>
                  <Text style={typography.bodySmall}>{item.percentage}%</Text>
                </View>
                <View style={styles.barBackground}>
                  <LinearGradient 
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.barFill, 
                      { width: `${item.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </Animated.View>
      ) : (
        <Text style={[typography.bodyMedium, styles.emptyText]}>
          Record more moments to see your mood distribution.
        </Text>
      )}
      
      {displayData.length > 0 && (
        <Text style={[typography.bodyMedium, styles.summaryText]}>
          This {timeFrame === 'week' ? 'week' : 'month'}, you've most frequently felt <Text style={styles.highlightText}>{getMostFrequentMood()}</Text>.
          {viewMode === 'by-day' && ' (daily average)'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  timeFrameSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: colors.surface.containerHigh,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeFrameButtonActive: {
    backgroundColor: colors.surface.containerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.semantic.onSurfaceVariant,
  },
  timeFrameTextActive: {
    color: colors.semantic.onSurface,
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: colors.surface.containerHigh,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: colors.surface.containerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.semantic.onSurfaceVariant,
  },
  viewModeTextActive: {
    color: colors.semantic.onSurface,
  },
  periodText: {
    marginBottom: 16,
    color: colors.semantic.onSurfaceVariant,
  },
  barsContainer: {
    marginBottom: 16,
  },
  barItem: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barBackground: {
    height: 10,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  summaryText: {
    marginTop: 8,
  },
  highlightText: {
    fontWeight: '600',
    color: colors.primary[40],
  },
  emptyText: {
    color: colors.semantic.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MoodDistribution;