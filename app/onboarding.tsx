import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Dimensions, TextInput } from 'react-native';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import ProgressDots from '@/components/ProgressDots';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, checkNotificationPermissions } from '@/utils/notificationManager';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { setOnboarded, setUserName: setGlobalUserName, userName } = useUserStore();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [nameError, setNameError] = useState('');

  const handleNext = async () => {
    if (page === 1) {
      if (userName.trim() === '') {
        setNameError('Please enter your name.');
        return;
      }
    }
    setNameError('');
    if (page < 3) {
      pagerRef.current?.setPage(page + 1);
    } else if (page === 3) {
      setOnboarded(true);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await requestNotificationPermissions();
      setNotificationStatus(granted ? 'granted' : 'denied');
      if (granted) {
        handleNext();
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setNotificationStatus('denied');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={(e: any) => setPage(e.nativeEvent.position)}
        scrollEnabled={true}
      >
        {/* Welcome Screen */}
        <View style={styles.page} key="1">
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to Mindful Moment</Text>
          <Text style={styles.subtitle}>Your private space to understand your emotional world.</Text>
          <View style={styles.featureBox}>
            <Text style={styles.featureText}>✓ Your data stays on your device.</Text>
            <Text style={styles.featureText}>✓ You own your journey.</Text>
            <Text style={styles.featureText}>✓ No ads. No data selling. 100% focused on your well-being.</Text>
          </View>
        </View>
        {/* Name Screen */}
        <View style={styles.page} key="2">
          <Text style={styles.title}>What should we call you in notifications?</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name"
            value={userName}
            onChangeText={setGlobalUserName}
            autoFocus
            maxLength={24}
          />
          {nameError ? <Text style={styles.nameError}>{nameError}</Text> : null}
          <Text style={styles.privacyNote}>
            This name is only used to personalize your experience. It never leaves your device.
          </Text>
        </View>
        {/* Core Mechanics Screen */}
        <View style={styles.page} key="3">
          <Image source={require('@/assets/images/benefits-illustration.png')} style={styles.illustration} />
          <Text style={styles.title}>Small Steps, Big Insights</Text>
          <Text style={styles.subtitle}>Each check-in helps you see patterns and celebrate progress.</Text>
          <View style={styles.mechanicsContainer}>
            <View style={styles.mechanicItem}>
              <Text style={styles.mechanicIcon}>✍️</Text>
              <Text style={styles.mechanicText}>Log your mood in seconds.</Text>
            </View>
            <View style={styles.mechanicItem}>
              <Text style={styles.mechanicIcon}>🏷️</Text>
              <Text style={styles.mechanicText}>Tag what boosts or drains you.</Text>
            </View>
            <View style={styles.mechanicItem}>
              <Text style={styles.mechanicIcon}>📈</Text>
              <Text style={styles.mechanicText}>Discover your emotional landscape.</Text>
            </View>
          </View>
        </View>
        {/* Notification Permission Screen */}
        <View style={styles.page} key="4">
          <Image source={require('@/assets/images/benefits-illustration.png')} style={styles.illustration} />
          <Text style={styles.title}>Stay Mindful, Effortlessly</Text>
          <Text style={styles.subtitle}>
            Enable gentle reminders to help you build a consistent mindfulness practice and discover deeper insights. You control the timing and frequency.
          </Text>
          <Button
            title={notificationStatus === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
            onPress={requestNotificationPermission}
            disabled={notificationStatus === 'granted'}
          />
          {notificationStatus === 'denied' && (
            <Text style={styles.permissionDenied}>You can enable notifications later in your device settings.</Text>
          )}
        </View>
      </PagerView>
      <View style={styles.footer}>
        <ProgressDots count={4} activeIndex={page} />
        <Button
          title={page < 3 ? (page === 2 ? 'Begin My Journey' : 'Continue') : 'Skip'}
          onPress={handleNext}
          disabled={page === 3 && notificationStatus === 'idle'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    width: width,
    minHeight: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 32,
  },
  title: {
    ...typography.headlineSmall,
    textAlign: 'center',
    marginBottom: 16,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text.secondary,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  featureBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.surface.containerLow,
    borderRadius: 12,
  },
  featureText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  mechanicsContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  mechanicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  mechanicText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    backgroundColor: colors.background.primary,
  },
  permissionDenied: {
    ...typography.bodySmall,
    color: colors.semantic.warning,
    marginTop: 16,
    textAlign: 'center',
  },
  nameInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    marginBottom: 12,
    color: colors.text.primary,
    backgroundColor: colors.surface.container,
    textAlign: 'center',
  },
  nameError: {
    color: colors.semantic.warning,
    marginBottom: 8,
    textAlign: 'center',
  },
  privacyNote: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
}); 