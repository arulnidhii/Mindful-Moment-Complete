import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import ProgressDots from '@/components/ProgressDots';
import typography from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    router.navigate('/onboarding/benefits');
  };

  const handleSkip = () => {
    router.navigate('/');
  };

  return (
    <GradientBackground variant="primary">
      <View style={[styles.container, {
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        paddingLeft: insets.left + 24,
        paddingRight: insets.right + 24,
      }]}
      >
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[typography.headlineLarge, styles.title, { color: '#F7FAFC' }]}>
            Mindful Moment
          </Text>
          
          <Text style={[typography.bodyLarge, styles.tagline, { color: '#F7FAFC' }]}>
            Discover calm. Understand yourself. Elevate your day.
          </Text>
          
          <Text style={[typography.bodyMedium, styles.description, { color: '#F7FAFC' }]}>
            Your personal sanctuary for daily reflection and intentional growth.
          </Text>
        </Animated.View>
        
        <View style={styles.footer}>
          <ProgressDots total={4} current={0} />
          
          <Button
            title="Begin Your Journey"
            onPress={handleNext}
            size="large"
            style={styles.button}
            icon={<Ionicons name="arrow-forward" size={24} color="#1A202C" />}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  skipButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    color: '#F7FAFC',
    fontSize: 16,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '700',
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '80%',
  },
  footer: {
    marginTop: 24,
    width: '100%',
  },
  button: {
    backgroundColor: '#F6AD55',
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});