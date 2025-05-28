import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useStreakStore } from '@/store/streakStore';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Flame } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  withRepeat,
  Easing,
  FadeIn
} from 'react-native-reanimated';

interface StreakIndicatorProps {
  onPress?: () => void;
  compact?: boolean;
}

const StreakIndicator: React.FC<StreakIndicatorProps> = ({ 
  onPress,
  compact = false
}) => {
  const currentStreak = useStreakStore(state => state.currentStreak);
  const longestStreak = useStreakStore(state => state.longestStreak);
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Animate when streak changes
  React.useEffect(() => {
    if (currentStreak > 0) {
      // Pulse animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );
      
      // Subtle wiggle animation
      rotation.value = withSequence(
        withTiming(-0.05, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(0.05, { duration: 150 }),
            withTiming(-0.05, { duration: 150 })
          ),
          3
        ),
        withTiming(0, { duration: 100 })
      );
    }
  }, [currentStreak]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ]
    };
  });
  
  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (currentStreak >= 30) return '#FF3D00'; // Bright orange-red
    if (currentStreak >= 14) return '#FF9100'; // Bright orange
    if (currentStreak >= 7) return '#FFC400'; // Amber
    if (currentStreak >= 3) return '#FFEA00'; // Yellow
    return '#BDBDBD'; // Grey for low/no streak
  };
  
  if (currentStreak === 0) {
    return null; // Don't show if no streak
  }
  
  if (compact) {
    return (
      <Animated.View 
        style={[styles.compactContainer, animatedStyle]}
        entering={FadeIn.duration(300)}
      >
        <Flame size={16} color={getFlameColor()} />
        <Text style={styles.compactText}>{currentStreak}</Text>
      </Animated.View>
    );
  }
  
  return (
    <Pressable onPress={onPress}>
      <Animated.View 
        style={[styles.container, animatedStyle]}
        entering={FadeIn.duration(300)}
      >
        <View style={styles.iconContainer}>
          <Flame size={24} color={getFlameColor()} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[typography.labelLarge, styles.streakLabel]}>
            Current Streak
          </Text>
          <Text style={[typography.titleLarge, styles.streakValue]}>
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </Text>
          {longestStreak > currentStreak && (
            <Text style={[typography.bodySmall, styles.recordText]}>
              Your record: {longestStreak} days
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.containerLow,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  streakLabel: {
    color: colors.semantic.onSurfaceVariant,
    marginBottom: 4,
  },
  streakValue: {
    color: colors.semantic.onSurface,
  },
  recordText: {
    color: colors.semantic.onSurfaceVariant,
    marginTop: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.containerLow,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: colors.semantic.onSurfaceVariant,
  },
});

export default StreakIndicator;