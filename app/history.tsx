import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export default function HistoryRedirect() {
  const router = useRouter();
  
  // Redirect to the tabbed history page
  React.useEffect(() => {
    router.replace('/(tabs)/history');
  }, [router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Moments' }} />
      <Text style={typography.bodyMedium}>Redirecting to moments...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.bright,
  },
});