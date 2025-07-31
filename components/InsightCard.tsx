import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';

interface InsightCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  onShare?: () => void;
  icon?: string;
}

function InsightCard({ title, children, style, onShare, icon }: InsightCardProps) {
  // Add animation for share button
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handleSharePress = () => {
    haptics.selection();
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    onShare && onShare();
  };
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {onShare && (
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePress}
              accessibilityLabel={`Share ${title}`}
              accessibilityRole="button"
            >
              <MaterialIcons name="share" size={22} color={colors.semantic.onSurfaceVariant} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.container,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    ...typography.titleLarge,
    color: colors.text.primary,
    flex: 1,
  },
  shareButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: colors.surface.containerHigh,
  },
  content: {
    width: '100%',
  },
});

export default InsightCard;