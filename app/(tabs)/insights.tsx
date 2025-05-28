import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import InsightCard from '@/components/InsightCard';
import MoodDistribution from '@/components/MoodDistribution';
import PatternInsight from '@/components/PatternInsight';
import DailyRhythm from '@/components/DailyRhythm';
import typography from '@/constants/typography';
import { useMoodStore } from '@/store/moodStore';

export default function InsightsScreen() {
  const entries = useMoodStore((state) => state.entries);
  
  // Process data for insights with improved logic for multiple check-ins per day
  const processedData = useMemo(() => {
    if (entries.length === 0) return {
      weekData: [],
      monthData: [],
      weekDataByDay: [],
      monthDataByDay: []
    };
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter entries by time period
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekAgo;
    });
    
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= monthAgo;
    });
    
    // Process by individual entry (original method)
    const weekData = processEntriesByCount(weekEntries);
    const monthData = processEntriesByCount(monthEntries);
    
    // Process by day (averaging method)
    const weekDataByDay = processEntriesByDay(weekEntries);
    const monthDataByDay = processEntriesByDay(monthEntries);
    
    return {
      weekData,
      monthData,
      weekDataByDay,
      monthDataByDay
    };
  }, [entries]);
  
  return (
    <GradientBackground variant="secondary">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={[typography.bodyLarge, styles.introText]}>
            Unlock a deeper understanding of your emotional well-being. Here are some initial observations based on your Mindful Moments:
          </Text>
          
          <InsightCard title="Your Mood Landscape">
            <MoodDistribution 
              data={processedData.weekData} 
              weekData={processedData.weekData}
              monthData={processedData.monthData}
              weekDataByDay={processedData.weekDataByDay}
              monthDataByDay={processedData.monthDataByDay}
            />
          </InsightCard>
          
          <InsightCard title="Your Daily Rhythm">
            <DailyRhythm entries={entries} />
          </InsightCard>
          
          <InsightCard title="Your Patterns">
            <PatternInsight entries={entries} />
          </InsightCard>
          
          <InsightCard title="Your Journey">
            <Text style={typography.bodyMedium}>
              You've recorded {entries.length} mindful {entries.length === 1 ? 'moment' : 'moments'} so far. Consistency is key to developing deeper self-awareness.
            </Text>
          </InsightCard>
          
          <Text style={[typography.bodyMedium, styles.futureText]}>
            More insights will unlock as you continue your journey!
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

// Helper function to process entries by count (each entry counts individually)
const processEntriesByCount = (entries: any[]) => {
  if (entries.length === 0) return [];
  
  // Count occurrences of each mood
  const moodCounts: Record<string, number> = {};
  entries.forEach(entry => {
    const mood = entry.mood_value;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });
  
  // Calculate percentages
  const total = entries.length;
  return Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / total) * 100)
  }));
};

// Helper function to process entries by day (averaging moods per day)
const processEntriesByDay = (entries: any[]) => {
  if (entries.length === 0) return [];
  
  // Group entries by day
  const entriesByDay: Record<string, any[]> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!entriesByDay[dayKey]) {
      entriesByDay[dayKey] = [];
    }
    
    entriesByDay[dayKey].push(entry);
  });
  
  // Calculate the dominant mood for each day
  const moodValues: Record<string, number> = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'challenged': 2,
    'struggling': 1
  };
  
  const dailyMoods: Record<string, number> = {};
  
  Object.values(entriesByDay).forEach(dayEntries => {
    // Calculate average mood value for the day
    let totalMoodValue = 0;
    
    dayEntries.forEach(entry => {
      const moodValue = moodValues[entry.mood_value.toLowerCase()] || 3;
      totalMoodValue += moodValue;
    });
    
    const averageMoodValue = totalMoodValue / dayEntries.length;
    
    // Determine the closest mood category
    let closestMood = 'okay';
    let smallestDifference = 5;
    
    Object.entries(moodValues).forEach(([mood, value]) => {
      const difference = Math.abs(value - averageMoodValue);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestMood = mood;
      }
    });
    
    // Count this day's mood
    dailyMoods[closestMood] = (dailyMoods[closestMood] || 0) + 1;
  });
  
  // Calculate percentages
  const totalDays = Object.keys(entriesByDay).length;
  return Object.entries(dailyMoods).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / totalDays) * 100)
  }));
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  introText: {
    marginBottom: 24,
  },
  futureText: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
    fontStyle: 'italic',
  },
});