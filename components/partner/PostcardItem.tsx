import React, { useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { HighlightedText } from '@/components/HighlightedText';
import Card from '../Card';
import typography from '@/constants/typography';
import ActionButtons from '@/components/ActionButtons';
import { generateActionsFor } from '@/utils/advisor/actions';
import type { Action } from '@/utils/advisor/advisorTypes';

// Accept a minimal shape to keep component reusable for daily rollups
type PostcardLike = { emoji: string; text: string; highlights?: string[]; type?: 'mood_booster' | 'gentle_nudge' | 'rhythm_note' };

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

  // Derive actions client-side (do not persist) using highlights/type
  let actions: Action[] | undefined
  try{
    if(postcard.type==='mood_booster'){
      const booster = postcard.highlights?.[0]
      if(booster){ actions = generateActionsFor('week_top_booster', { booster }, { context: 'partner' }) }
    }else if(postcard.type==='gentle_nudge'){
      const drainer = postcard.highlights?.[0]
      if(drainer){ actions = generateActionsFor('week_emerging_drainer', { drainer }, { context: 'partner' }) }
    }else if(postcard.type==='rhythm_note'){
      actions = generateActionsFor('week_rhythm', {}, { context: 'partner' })
    }
  }catch{}

  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{postcard.emoji}</Text>
      <View style={{ flex:1 }}>
        <HighlightedText text={displayText} highlights={postcard.highlights} style={styles.text} />
        {!!actions?.length && (
          <View style={{ marginTop: 10 }}>
            <ActionButtons actions={actions} />
          </View>
        )}
      </View>
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
