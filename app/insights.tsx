import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export default function InsightsRedirect() {
  const router = useRouter();
  
  // Redirect to the tabbed insights page
  React.useEffect(() => {
    router.replace('/(tabs)/insights');
  }, [router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Insights' }} />
      <Text style={typography.bodyMedium}>Redirecting to insights...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
});