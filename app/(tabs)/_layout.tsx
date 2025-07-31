import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { haptics } from '@/utils/haptics';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Pressable } from 'react-native';

function TabBarButton({ children, onPress, ...props }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePress = (e) => {
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