import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import { Platform, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/userStore";
import { useStreakStore } from "@/store/streakStore";
import { useMoodStore } from "@/store/moodStore";
import colors from "@/constants/colors";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { checkNotificationPermissions, rescheduleNotificationsOnStart } from "@/utils/notificationManager";
import * as Linking from 'expo-linking';
import { auth, signIn, onAuthStateChanged } from '@/src/lib/firebase';
import { listenForConnectionChanges } from '@/src/lib/partnerService';
import { parseRequestIdFromUrl, parseInternalActionFromUrl } from '@/src/utils/deeplinks';

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { isOnboarded, userName } = useUserStore();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const url = Linking.useURL(); // Move hook call to component level

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const requestId = parseRequestIdFromUrl(url);
      if (requestId) {
        router.push(`/connect-partner?requestId=${requestId}`);
        return;
      }
      const internal = parseInternalActionFromUrl(url)
      if(internal?.action==='set-reminder'){
        try{
          const hour = parseInt(internal.params.hour||'22',10)
          const minute = parseInt(internal.params.minute||'30',10)
          const label = internal.params.label || 'Reminder'
          // We can route to settings or schedule directly on next app open; for now, route to settings
          router.push('/(tabs)/settings')
          console.log('Set reminder requested via deep link', { hour, minute, label })
        }catch(e){ console.warn('Failed to parse set-reminder deeplink', e) }
      }
    };

    if (url) handleDeepLink(url);
    const linkingSubscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    const partnerUnsubRef = { current: null as null | (() => void) };

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Always attempt to (re)attach the partner connection listener when we have a real auth user
        if (auth && auth.currentUser) {
          try {
            partnerUnsubRef.current?.();
            partnerUnsubRef.current = listenForConnectionChanges();
            console.log('✅ Partner connection listener active for', auth.currentUser.uid);
          } catch (e) {
            console.warn('Failed to start partner listener:', e);
          }
        }
        if (!isAuthReady) {
          setIsAuthReady(true);
          setAuthError(null); // Clear any previous errors
        }
      } else {
        // Try to sign in, but handle failures gracefully
        signIn().catch((error) => {
          console.warn('Firebase auth failed, continuing without authentication:', error);
          setAuthError('Firebase authentication unavailable');
          // Continue without Firebase auth - app can still work offline
          setIsAuthReady(true);
        });
      }
    });

    return () => {
      authUnsubscribe();
      try { (partnerUnsubRef.current || undefined)?.(); } catch {}
      linkingSubscription.remove();
    };
  }, [isAuthReady, router, url]);

  useEffect(() => {
    // Check notification permissions on app start
    checkNotificationPermissions();
    
    // Reschedule notifications on app start
    rescheduleNotificationsOnStart();
    
    // Handle initial navigation
    const handleInitialNavigation = async () => {
      try {
        setTimeout(() => {
          if (isOnboarded) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }, 100);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        setTimeout(() => {
          if (isOnboarded) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }, 200);
      }
    };

    handleInitialNavigation();
  }, [isOnboarded]);

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text.primary }}>
          Initializing...
        </Text>
        {authError && (
          <View style={{ marginTop: 20, padding: 15, backgroundColor: 'rgba(255, 165, 0, 0.1)', borderRadius: 8 }}>
            <Text style={{ color: 'orange', textAlign: 'center', fontSize: 14 }}>
              ⚠️ {authError}
            </Text>
            <Text style={{ color: 'orange', textAlign: 'center', fontSize: 12, marginTop: 5 }}>
              App will continue in offline mode
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="connect-partner" options={{ title: 'Partner Invitation', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}