import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MoodEntry } from '@/types/mood';

interface DailyRhythmProps {
  entries: MoodEntry[];
}

const TIME_BLOCKS = [
  { key: 'early', label: 'Early Morning', hours: [5, 6, 7, 8] },
  { key: 'morning', label: 'Morning', hours: [9, 10, 11, 12] },
  { key: 'afternoon', label: 'Afternoon', hours: [13, 14, 15, 16] },
  { key: 'evening', label: 'Evening', hours: [17, 18, 19, 20] },
  { key: 'night', label: 'Night', hours: [21, 22, 23, 0, 1, 2, 3, 4] },
];

const GRADIENTS: Record<string, [string, string]> = {
  early: ['#B3D8F6', '#AEE6C5'],
  morning: ['#AEE6C5', '#F6E7B3'],
  afternoon: ['#F6E7B3', '#B3D8F6'],
  evening: ['#D6C6F6', '#F6E7B3'],
  night: ['#A18BE6', '#B3D8F6'],
};

const MAX_BAR_WIDTH = 180;

type BlockPercent = {
  key: string;
  label: string;
  hours: number[];
  count: number;
  percent: number;
};

function DailyRhythm({ entries }: DailyRhythmProps) {
  // Group check-ins by time block
  const counts: Record<string, number> = {};
  TIME_BLOCKS.forEach(block => { counts[block.key] = 0; });
  entries.forEach((entry: MoodEntry) => {
    const hour = new Date(entry.timestamp).getHours();
    const block = TIME_BLOCKS.find(b => b.hours.includes(hour));
    if (block) counts[block.key]++;
  });
  const blockCounts = counts;

  const total = (Object.values(blockCounts) as number[]).reduce((sum, c) => sum + c, 0);

  const percents: BlockPercent[] = TIME_BLOCKS.map(block => ({
    ...block,
    count: blockCounts[block.key],
    percent: total > 0 ? (blockCounts[block.key] / total) * 100 : 0,
  }));

  // Find the block with the highest count
  const bestBlock = percents.reduce((best, curr) =>
    curr.count > (best?.count || 0) ? curr : best, null as BlockPercent | null);

  return (
    <View style={styles.container}>
      {percents.map(block => (
        <View key={block.key} style={styles.row}>
          <Text style={styles.blockLabel}>{block.label}</Text>
          <View style={styles.barTrack}>
            <LinearGradient
              colors={GRADIENTS[block.key]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.bar,
                {
                  width: block.percent > 0 ? Math.max((block.percent / 100) * MAX_BAR_WIDTH, 6) : 0,
                  opacity: block.percent > 0 ? 0.85 : 0.5,
                },
              ]}
            />
          </View>
          <Text style={styles.percentLabel} numberOfLines={1} ellipsizeMode="tail" testID={`percent-label-${block.key}`}>{block.percent >= 1 ? `${Math.round(block.percent)}%` : block.count > 0 ? '<1%' : ''}</Text>
        </View>
      ))}
      {bestBlock && bestBlock.count > 0 && (
        <Text style={styles.summary}>
          Based on your check-ins, you typically feel your best during the <Text style={styles.highlight}>{bestBlock.label.toLowerCase()}</Text>.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  blockLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    minWidth: 90,
    maxWidth: 110,
    textAlign: 'right',
    marginRight: 8,
    flexShrink: 1,
  },
  barTrack: {
    height: 16,
    flex: 1,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  bar: {
    height: 16,
    borderRadius: 8,
  },
  percentLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    minWidth: 32,
    maxWidth: 44,
    textAlign: 'left',
    marginLeft: 4,
    alignSelf: 'center',
    flexShrink: 0,
    flexGrow: 0,
  },
  summary: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
    color: colors.primary[40],
  },
});

export default DailyRhythm;