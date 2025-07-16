import React from 'react';
import { View, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  label?: string;
}

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 28;

const Toggle: React.FC<ToggleProps> = ({ value, onValueChange, disabled = false, style, label }) => {
  const offset = useSharedValue(value ? TRACK_WIDTH - THUMB_SIZE - 4 : 4);

  React.useEffect(() => {
    offset.value = withTiming(value ? TRACK_WIDTH - THUMB_SIZE - 4 : 4, { duration: 220 });
  }, [value]);

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    shadowOpacity: value ? 0.18 : 0.08,
    shadowRadius: value ? 6 : 2,
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? colors.primary[40] : colors.neutral[80],
  }));

  const handlePress = () => {
    if (disabled) return;
    haptics.selection();
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      style={[styles.container, style, disabled && { opacity: 0.5 }]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.track, animatedTrackStyle]}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...typography.bodyMedium,
    marginRight: 12,
    color: colors.text.primary,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.neutral[80],
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    marginVertical: 4,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    left: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default Toggle; 