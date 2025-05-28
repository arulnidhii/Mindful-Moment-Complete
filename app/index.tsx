import { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import GradientBackground from '@/components/GradientBackground';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export default function Index() {
  const router = useRouter();
  const isOnboarded = useUserStore((state) => state.isOnboarded);

  useEffect(() => {
    // Small delay to ensure store is loaded
    const timer = setTimeout(() => {
      // Redirect based on user state
      if (!isOnboarded) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOnboarded, router]);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={[typography.headlineLarge, styles.title]}>Mindful Moment</Text>
        <ActivityIndicator size="large" color={colors.primary[40]} style={styles.loader} />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: colors.semantic.onSurface,
  },
  loader: {
    marginTop: 16,
  },
});