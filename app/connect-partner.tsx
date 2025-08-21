import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { acceptConnectionRequest, getRequestDetails } from '@/src/lib/partnerService';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import typography from '@/constants/typography';

const ConnectPartnerScreen = () => {
  const { requestId } = useLocalSearchParams();
  const router = useRouter();
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (typeof requestId !== 'string') {
        setError("Invalid invitation link.");
        setIsLoading(false);
        return;
      }
      try {
        const details = await getRequestDetails(requestId);
        if (details) {
          setInviterName(details.fromUserName);
        } else {
          setError("This invitation is invalid or has expired.");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load invitation details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleAccept = async () => {
    if (typeof requestId !== 'string') return;

    setIsLoading(true);
    try {
      await acceptConnectionRequest(requestId);
      // Navigate directly to the Partner tab to avoid unknown/back stack issues
      router.replace('/(tabs)/partner');
    } catch (error: any) {
      setError(error.message || "Failed to accept invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading invitation...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <Text style={styles.title}>Invitation Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>{inviterName} has invited you!</Text>
        <Text style={styles.subtitle}>
          Connect to share supportive insights and grow together on your mindful journey.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button title="✅ Accept & Connect" onPress={handleAccept} />
          <Button 
            title="Decline" 
            variant="outlined" 
            onPress={handleDecline} 
            style={{ marginTop: 15 }} 
          />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...typography.headlineLarge,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyLarge,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodyLarge,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
});

export default ConnectPartnerScreen;
