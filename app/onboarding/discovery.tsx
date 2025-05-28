import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import ProgressDots from '@/components/ProgressDots';
import typography from '@/constants/typography';
import colors from '@/constants/colors';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Discovery() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  const handleSkip = () => {
    haptics.light();
    router.navigate('/');
  };

  const handleNext = () => {
    haptics.light();
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
      router.navigate('/onboarding/trial');
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.navButton}
            accessibilityLabel="Go back"
            accessible
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.navButton}
            accessibilityLabel="Skip onboarding"
            accessible
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <Animated.View 
            style={[styles.content]}
            entering={FadeIn.duration(400)}
          >
            <Animated.View
              entering={FadeInDown.duration(600).delay(200)}
            >
              <Image
                source={require('@/assets/images/discovery-illustration.png')}
                style={styles.illustration}
                resizeMode="cover"
              />
            </Animated.View>
            
            <Animated.View
              entering={FadeInUp.duration(600).delay(400)}
            >
              <Text style={[typography.headlineMedium, styles.title]}>
                Unlock Deeper Self-Awareness
              </Text>
              
              <Text style={[typography.bodyMedium, styles.description]}>
                Go beyond simple tracking. Understand your emotional landscape, uncover valuable patterns, and foster genuine self-knowledge to support your well-being.
              </Text>
            </Animated.View>
          </Animated.View>
          
          <Animated.View 
            style={[styles.footer, animatedStyle]}
            entering={FadeInUp.duration(600).delay(600)}
          >
            <ProgressDots total={4} current={2} />
            
            <Button
              title="Experience a Moment"
              onPress={handleNext}
              size="large"
              style={styles.button}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
    minHeight: 44,
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: 16,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 240,
    height: 240,
    borderRadius: 20,
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.text.primary,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 16,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: 24,
    width: '100%',
  },
  button: {
    marginTop: 16,
  }
});