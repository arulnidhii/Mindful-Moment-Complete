import React from 'react';
import { View, StyleSheet } from 'react-native';
import DailyRhythm from './DailyRhythm';

interface ShareableDailyRhythmCardProps {
  entries: any[];
}

const CARD_CONTENT_WIDTH = 600;
const CARD_CONTENT_HEIGHT = 420;

const ShareableDailyRhythmCard = ({ entries }: ShareableDailyRhythmCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.rhythmWrapper}>
        <DailyRhythm entries={entries} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_CONTENT_WIDTH,
    minHeight: CARD_CONTENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    paddingVertical: 48, // More vertical padding for balance
    paddingHorizontal: 12,
  },
  rhythmWrapper: {
    width: '100%',
    marginBottom: 0,
  },
});

export default ShareableDailyRhythmCard; 