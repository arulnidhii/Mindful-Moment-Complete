import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { haptics } from '@/utils/haptics';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Pressable, AppState } from 'react-native';

interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: (e: any) => void;
  [key: string]: any;
}

function TabBarButton({ children, onPress, ...props }: TabBarButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePress = (e: any) => {
    haptics.selection();
    scale.value = withTiming(0.92, { duration: 80 });
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 120 });
    }, 80);
    if (onPress) onPress(e);
  };
  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} {...props} accessibilityRole="button">
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function TabLayout() {
  const router = useRouter();

  // Optional: Reset to home tab when app comes back to foreground
  // Uncomment the following useEffect if you want this behavior
  /*
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // Reset to home tab when app becomes active
        router.replace('/(tabs)');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [router]);
  */

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[40],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface.container,
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
          height: 64,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: colors.surface.bright,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Check In',
          tabBarIcon: ({ color }) => <MaterialIcons name="mood" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'My Moments',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}