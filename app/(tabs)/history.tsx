import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Card from '@/components/Card';
import MoodHistory from '@/components/MoodHistory';
import StreakIndicator from '@/components/StreakIndicator';
import { useMoodStore } from '@/store/moodStore';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function HistoryScreen() {
  const entries = useMoodStore((state) => state.entries);
  const deleteEntries = useMoodStore((state) => state.deleteEntries);
  const totalEntries = entries.length;

  const handleDeleteEntries = (entryIds: string[]) => {
    deleteEntries(entryIds);
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(300)}
    >
      <View style={styles.header}>
        <Text style={[typography.titleLarge, styles.title]}>
          Your Mindful Journey
        </Text>
        
        <StreakIndicator compact />
      </View>
      
      {totalEntries > 0 && (
        <Card style={styles.statsCard} elevation={1}>
          <Text style={[typography.labelMedium, styles.statsLabel]}>
            TOTAL MOMENTS
          </Text>
          <Text style={[typography.headlineSmall, styles.statsValue]}>
            {totalEntries}
          </Text>
        </Card>
      )}
      
      <View style={styles.historyContainer}>
        <MoodHistory 
          entries={entries} 
          onDeleteEntries={handleDeleteEntries}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.bright,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: colors.semantic.onSurface,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    color: colors.semantic.onSurfaceVariant,
  },
  statsValue: {
    color: colors.primary[40],
  },
  historyContainer: {
    flex: 1,
  },
});