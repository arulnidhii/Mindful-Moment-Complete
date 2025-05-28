import React from 'react';
import { Tabs } from 'expo-router';
import { Smile, History, BarChart2, Settings } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue.dark,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
        },
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Check In',
          tabBarIcon: ({ color }) => <Smile size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'My Moments',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}