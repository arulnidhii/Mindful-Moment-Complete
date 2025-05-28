import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import colors from '@/constants/colors';
import elevation from '@/constants/elevation';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevation: elevationLevel = 1,
  onPress
}) => {
  // Animation values
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    if (onPress) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };
  
  const handlePressOut = () => {
    if (onPress) {
      scale.value = withTiming(1, { duration: 150 });
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  const getElevationStyle = () => {
    switch (elevationLevel) {
      case 0: return elevation.level0;
      case 1: return elevation.level1;
      case 2: return elevation.level2;
      case 3: return elevation.level3;
      case 4: return elevation.level4;
      case 5: return elevation.level5;
      default: return elevation.level1;
    }
  };
  
  const CardComponent = onPress ? AnimatedPressable : View;
  const cardProps = onPress ? {
    onPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    style: [
      styles.card,
      getElevationStyle(),
      style,
      animatedStyle
    ]
  } : {
    style: [
      styles.card,
      getElevationStyle(),
      style
    ]
  };
  
  return (
    <CardComponent {...cardProps}>
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.containerLowest,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
});

export default Card;