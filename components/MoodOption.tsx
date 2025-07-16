import React from 'react';
import { StyleSheet, Text, View, Platform, Pressable } from 'react-native';
import { Mood } from '@/constants/moods';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { haptics } from '@/utils/haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  Easing,
  FadeIn,
  ZoomIn
} from 'react-native-reanimated';

interface MoodOptionProps {
  mood: Mood;
  selected: boolean;
  onSelect: (mood: Mood) => void;
  index?: number; // For staggered animation
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MoodOption: React.FC<MoodOptionProps> = ({ 
  mood, 
  selected, 
  onSelect,
  index = 0
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(selected ? 4 : 0);
  
  const handlePress = () => {
    haptics.selection();
    
    // Animate the scale
    scale.value = withSequence(
      withTiming(1.2, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    // Animate the elevation
    elevation.value = withTiming(4, { duration: 200 });
    
    onSelect(mood);
  };

  // Update elevation when selected state changes
  React.useEffect(() => {
    elevation.value = withTiming(selected ? 4 : 0, { duration: 200 });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      elevation: elevation.value,
      shadowOpacity: 0.15 * (elevation.value / 4),
      shadowRadius: 2 * (elevation.value / 4),
    };
  });

  // Get the appropriate color from the Material 3 palette
  const getMoodColor = () => {
    const moodColors = colors.mood[mood.id as keyof typeof colors.mood];
    return selected ? moodColors.medium : moodColors.light;
  };

  const getContainerColor = () => {
    const moodColors = colors.mood[mood.id as keyof typeof colors.mood];
    return selected ? moodColors.container : colors.surface.containerLow;
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: getContainerColor(),
          borderColor: getMoodColor(),
          borderWidth: selected ? 2 : 0,
          marginHorizontal: 12, // for carousel spacing
          minWidth: 100, // larger touch target for carousel
        },
        animatedStyle
      ]}
      onPress={handlePress}
      entering={Platform.OS !== 'web' ? FadeIn.delay(index * 100).duration(300) : FadeIn}
      accessibilityLabel={`Select mood: ${mood.label}`}
      accessibilityRole="button"
      accessible
    >
      <Animated.View 
        style={[
          styles.iconContainer, 
          { backgroundColor: getMoodColor() }
        ]}
        entering={Platform.OS !== 'web' ? ZoomIn.delay(index * 100 + 200).duration(300) : FadeIn}
      >
        <Text style={styles.icon}>{mood.icon}</Text>
      </Animated.View>
      <Text 
        style={[
          typography.labelMedium, 
          styles.label,
          { color: selected ? getMoodColor() : colors.text.secondary }
        ]}
      >
        {mood.label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MoodOption;