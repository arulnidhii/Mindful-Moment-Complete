import { StyleSheet } from 'react-native';
import colors from './colors';

// Material 3 inspired typography system (Luxury Wellness: lighter, elegant)
export default StyleSheet.create({
  // Display styles
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '300', // lighter
    letterSpacing: 0.5,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont', // placeholder for custom font
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '300',
    letterSpacing: 0.25,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '300',
    letterSpacing: 0.15,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  
  // Headline styles
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '300',
    letterSpacing: 0.15,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '300',
    letterSpacing: 0.1,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '300',
    letterSpacing: 0.1,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  
  // Title styles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: colors.text.primary,
    // fontFamily: 'YourLuxuryFont',
  },
  
  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '300',
    letterSpacing: 0.25,
    color: colors.text.secondary,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '300',
    letterSpacing: 0.15,
    color: colors.text.secondary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '300',
    letterSpacing: 0.1,
    color: colors.text.tertiary,
  },
  
  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: colors.text.tertiary,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: colors.text.tertiary,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: colors.text.tertiary,
  },
});