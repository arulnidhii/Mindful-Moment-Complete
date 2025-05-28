import React from 'react';
import { 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Pressable,
  View
} from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import elevation from '@/constants/elevation';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  // Animation values - moved inside component body
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(err => {
        console.log('Haptics error:', err);
      });
    }
    
    // Animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    opacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    onPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });
  
  const getBackgroundColor = () => {
    if (disabled) return colors.neutralVariant[80];
    
    switch (variant) {
      case 'filled':
        return colors.primary[40];
      case 'tonal':
        return colors.secondary[80];
      case 'outlined':
      case 'text':
        return 'transparent';
      default:
        return colors.primary[40];
    }
  };
  
  const getTextColor = () => {
    if (disabled) return colors.neutralVariant[40];
    
    switch (variant) {
      case 'filled':
        return colors.neutral[99];
      case 'tonal':
        return colors.secondary[20];
      case 'outlined':
      case 'text':
        return colors.primary[40];
      default:
        return colors.neutral[99];
    }
  };
  
  const getBorderColor = () => {
    if (disabled) return colors.neutralVariant[60];
    if (variant === 'outlined') return colors.semantic.outline;
    return 'transparent';
  };
  
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { height: 32, paddingHorizontal: 12 };
      case 'large':
        return { height: 56, paddingHorizontal: 24 };
      default:
        return { height: 40, paddingHorizontal: 16 };
    }
  };
  
  const getTextStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return typography.labelMedium;
      case 'large':
        return typography.labelLarge;
      default:
        return typography.labelLarge;
    }
  };
  
  const getElevation = () => {
    if (variant === 'filled') return elevation.level1;
    return elevation.level0;
  };
  
  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyle(),
        getElevation(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
        animatedStyle
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          
          <Text 
            style={[
              getTextStyle(),
              { color: getTextColor() },
              textStyle
            ]}
          >
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;