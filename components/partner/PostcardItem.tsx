import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { HighlightedText } from '@/components/HighlightedText';
import Card from '../Card';
import typography from '@/constants/typography';

// Accept a minimal shape to keep component reusable for daily rollups
type PostcardLike = { emoji: string; text: string; highlights?: string[] };

const PostcardItem = ({ postcard }: { postcard: PostcardLike }) => {
  const displayText = useMemo(() => {
    if (!postcard?.text) return '';
    let t = postcard.text.trimStart();
    // Strip a leading emoji that may already be present in legacy template strings
    const known = ['☀️', '❤️‍🩹', '🌙', '📅', '💌'];
    for (const e of known) {
      if (t.startsWith(e)) {
        t = t.slice(e.length).trimStart();
        break;
      }
    }
    return t;
  }, [postcard?.text]);

  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{postcard.emoji}</Text>
      <HighlightedText text={displayText} highlights={postcard.highlights} style={styles.text} />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 24,
    marginRight: 15
  },
  text: {
    ...typography.bodyMedium,
    flex: 1,
    flexWrap: 'wrap'
  },
});

export default PostcardItem;
