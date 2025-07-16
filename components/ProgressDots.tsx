import React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '@/constants/colors';

interface ProgressDotsProps {
  total: number;
  current: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ total, current }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current && styles.activeDot
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface.container,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary[40],
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ProgressDots;