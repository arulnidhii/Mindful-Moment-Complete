import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { haptics } from '@/utils/haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown
} from 'react-native-reanimated';
import { Platform } from 'react-native';

// Create AnimatedPressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MilestonePopupProps {
  milestone: string;
  onClose: () => void;
  autoClose?: boolean;
}

const MilestonePopup: React.FC<MilestonePopupProps> = ({ 
  milestone, 
  onClose,
  autoClose = true
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Auto-close after 5 seconds
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);
  
  // Play haptic feedback when shown
  useEffect(() => {
    haptics.success();
    
    // Celebration animation
    scale.value = withSequence(
      withTiming(1.1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    rotation.value = withSequence(
      withTiming(-0.1, { duration: 150 }),
      withTiming(0.1, { duration: 300 }),
      withTiming(0, { duration: 150 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ]
    };
  });
  
  const closeScale = useSharedValue(1);
  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));
  const handleClosePress = () => {
    haptics.selection();
    closeScale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    onClose();
  };
  
  const getMilestoneTitle = () => {
    switch (milestone) {
      case 'firstEntry':
        return 'First Moment Recorded!';
      case 'threeDay':
        return '3-Day Streak!';
      case 'sevenDay':
        return '7-Day Streak!';
      case 'fourteenDay':
        return '14-Day Streak!';
      case 'thirtyDay':
        return '30-Day Streak!';
      case 'fiftyEntries':
        return '50 Moments Recorded!';
      case 'hundredEntries':
        return '100 Moments Recorded!';
      default:
        return 'Milestone Achieved!';
    }
  };
  
  const getMilestoneDescription = () => {
    switch (milestone) {
      case 'firstEntry':
        return "You've taken your first step toward mindful self-awareness. Keep going!";
      case 'threeDay':
        return "You've checked in for 3 consecutive days. Building a healthy habit!";
      case 'sevenDay':
        return "A full week of mindful moments! Your consistency is impressive.";
      case 'fourteenDay':
        return "Two weeks of daily check-ins! You're developing a powerful habit.";
      case 'thirtyDay':
        return "An entire month of mindfulness! This practice is becoming part of your life.";
      case 'fiftyEntries':
        return "You've recorded 50 mindful moments. That's a lot of self-awareness!";
      case 'hundredEntries':
        return "One hundred moments of mindfulness! You're a true reflection master.";
      default:
        return "Keep up the great work with your mindfulness practice!";
    }
  };
  
  return (
    <Animated.View 
      style={styles.overlay}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <Animated.View 
        style={[styles.container, animatedStyle]}
        entering={Platform.OS !== 'web' ? SlideInUp.duration(400) : FadeIn}
        exiting={Platform.OS !== 'web' ? SlideOutDown.duration(300) : FadeOut}
      >
        <AnimatedPressable
          style={[styles.closeButton, closeAnimatedStyle]}
          onPress={handleClosePress}
          accessibilityLabel="Close milestone popup"
        >
          <MaterialIcons name="close" size={24} color={colors.semantic.onSurfaceVariant} />
        </AnimatedPressable>
        
        <View style={styles.iconContainer}>
          <MaterialIcons name="emoji-events" size={24} color={colors.primary[40]} />
        </View>
        
        <Text style={[typography.titleLarge, styles.title]}>
          {getMilestoneTitle()}
        </Text>
        
        <Text style={[typography.bodyMedium, styles.description]}>
          {getMilestoneDescription()}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '85%',
    backgroundColor: colors.surface.containerLowest,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.containerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[90],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text.primary,
  },
  description: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: 8,
  },
});

export default MilestonePopup;