import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import MoodDistribution from './MoodDistribution';

// Use the same gradients as the insights section (brand gradients)
export const LUXURY_GRADIENTS: readonly [ColorValue, ColorValue][] = [
  ['#3A3D5A', '#6D8EA0'], // Deep indigo to teal
  ['#BFA76A', '#F7E7CE'], // Soft gold to cream
  ['#A8C0FF', '#EAF6FF'], // Pastel blue to white
  ['#F5D6E0', '#C9E4DE'], // Blush pink to mint
  ['#6A82FB', '#FC5C7D'], // Blue to pink
  ['#232526', '#414345'], // Charcoal gradient
];

interface ShareableInsightCardProps {
  insightText?: string; // Now optional, not used for slogan
  gradientIndex?: number;
  userName?: string;
  caption?: string; // New: optional modern caption
  children?: React.ReactNode; // New: for data snapshot/chart
}

const LOGO = require('@/assets/images/logo.png');
const GOOGLE_PLAY_BADGE = require('@/assets/images/GetItOnGooglePlay_Badge_Web_color_English.png');

// Instagram Story size (9:16)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const CARD_WIDTH = 720;
const CARD_HEIGHT = 1160; // Increased from 1040 for more vertical room

const SHARE_CHART_SIZE = 360; // Slightly larger chart
const SHARE_LEGEND_FONT_SIZE = 36; // Larger legend font

const ShareableInsightCard = ({ insightText, gradientIndex = 0, userName, caption, children }: ShareableInsightCardProps) => {
  const gradientColors = LUXURY_GRADIENTS[gradientIndex] || LUXURY_GRADIENTS[0];
  // If children is a MoodDistribution, clone it with larger props
  let mainContent = children;
  if (
    React.isValidElement(children) &&
    typeof children.type === 'function' &&
    ((children.type as any).displayName === 'MoodDistribution' || (children.type as any).name === 'MoodDistribution')
  ) {
    mainContent = React.cloneElement(children as React.ReactElement<any>, {
      size: SHARE_CHART_SIZE,
      legendFontSize: SHARE_LEGEND_FONT_SIZE,
      legendAlign: 'left',
    });
  }
  return (
    <LinearGradient colors={gradientColors} style={styles.gradientBg}>
      <View style={styles.centeredContainer}>
        <View style={styles.innerCard}>
          <View style={styles.contentContainer}>
            {mainContent}
            {caption ? (
              <Text style={styles.caption}>{caption}</Text>
            ) : null}
          </View>
          <View style={styles.footerStack}>
            <View style={styles.brandRow}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brandName}>Mindful Moment</Text>
            </View>
            <Image source={GOOGLE_PLAY_BADGE} style={styles.playBadge} resizeMode="contain" />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    overflow: 'hidden',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  innerCard: {
    backgroundColor: '#fff',
    borderRadius: 48,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 96, // Increased from 64 for more top/bottom room
    paddingHorizontal: 64, // Increased from 48 for more side room
    shadowColor: '#000',
    shadowOpacity: 0.16, // Slightly stronger shadow
    shadowRadius: 32, // More blur
    elevation: 16, // More lift
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 24, // Add top padding for breathing room
    paddingBottom: 32, // Add bottom padding before caption
  },
  insightText: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 48,
    fontWeight: '600',
    marginBottom: 24,
    fontSize: 54,
  },
  footerStack: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32, // Increased from 16 for more space between caption and footer
    gap: 18, // More gap for footer stack
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 8,
  },
  brandName: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 38,
    marginLeft: 12,
  },
  playBadge: {
    width: 220,
    height: 72,
    marginTop: 4,
  },
  logo: {
    width: 72,
    height: 72,
  },
  caption: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 32, // More space above caption
    marginBottom: 8, // Space before footer
    fontSize: 38, // Slightly larger
    fontWeight: '500',
    lineHeight: 48, // More line height for descenders
  },
});

export default ShareableInsightCard; 