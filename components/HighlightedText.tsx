import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

type HighlightedTextProps = {
  text: string;
  highlight?: string;
  highlights?: string[];
  style?: any;
};

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight, highlights, style }) => {
  // If we have multiple highlights, use them; otherwise fall back to single highlight
  const highlightWords = highlights || (highlight ? [highlight] : []);
  
  if (highlightWords.length === 0) {
    return <Text style={style}>{text}</Text>;
  }
  
  // Create a regex pattern that matches any of the highlight words (case insensitive)
  const highlightPattern = new RegExp(`(${highlightWords.join('|')})`, 'gi');
  const parts = text.split(highlightPattern);
  
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        const isHighlighted = highlightWords.some(word => 
          part.toLowerCase() === word.toLowerCase()
        );
        
        return isHighlighted ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          part
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  highlight: {
    fontWeight: '600',
    color: colors.primary[40],
  },
}); 