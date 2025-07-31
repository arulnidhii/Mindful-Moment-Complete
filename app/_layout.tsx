import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/userStore";
import { useStreakStore } from "@/store/streakStore";
import { useMoodStore } from "@/store/moodStore";
import colors from "@/constants/colors";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializeNotificationCallbacks } from "@/utils/notificationManager";

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

  useEffect(() => {
    // Initialize notification callbacks to break circular dependencies
    initializeNotificationCallbacks(useStreakStore, useMoodStore, useUserStore);
  }, []);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [isOnboarded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}