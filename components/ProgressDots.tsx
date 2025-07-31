import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

interface ProgressDotsProps {
  count: number;
  activeIndex: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ count, activeIndex }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === activeIndex ? colors.primary[60] : colors.neutral[80] }
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
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default ProgressDots;