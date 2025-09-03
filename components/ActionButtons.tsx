import React from 'react';
import { View, Linking, StyleSheet } from 'react-native';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import type { Action } from '@/utils/advisor/advisorTypes';
import ActionIcon from '@/components/ActionIcon';

interface Props {
  actions: Action[];
}

export default function ActionButtons({ actions }: Props) {
  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: open anyway, RN will try
        await Linking.openURL(url);
      }
    } catch (e) {
      console.warn('Failed to open action URL', url, e);
    }
  };

  return (
    <View style={styles.row}>
      {actions.map((a, idx) => (
        <View style={styles.buttonWrapper} key={`${a.type}-${idx}`}>
          <Button
            title={a.label}
            onPress={() => handlePress(a.url)}
            variant="filled"
            size="medium"
            icon={<ActionIcon type={a.type} color="#fff" />}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  buttonWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
});

