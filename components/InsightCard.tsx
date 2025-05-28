import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import Card from './Card';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

interface InsightCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  collapsible?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  title, 
  children, 
  style,
  collapsible = false
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const contentHeight = useSharedValue('auto');
  const opacity = useSharedValue(1);

  const toggleCollapsed = () => {
    if (collapsed) {
      setCollapsed(false);
      opacity.value = withTiming(1, { duration: 300 });
      contentHeight.value = withTiming('auto', { duration: 300 });
    } else {
      setCollapsed(true);
      opacity.value = withTiming(0, { duration: 300 });
      contentHeight.value = withTiming(0, { duration: 300 });
    }
  };

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: contentHeight.value,
      overflow: 'hidden',
    };
  });

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={[typography.heading3, styles.title]}>{title}</Text>
        {collapsible && (
          <TouchableOpacity onPress={toggleCollapsed} style={styles.collapseButton}>
            {collapsed ? (
              <ChevronDown size={20} color={colors.text.secondary} />
            ) : (
              <ChevronUp size={20} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {collapsible ? (
        <Animated.View style={animatedContentStyle}>
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      ) : (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  collapseButton: {
    padding: 4,
  },
  content: {
    // Content styling
  },
});

export default InsightCard;