import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ChristianPrayerPalette,
  ChristianPrayerSpacing,
} from '@/features/christian-prayer/constants';

interface ToggleRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: React.ReactNode;
}

export function ToggleRow({ title, description, value, onValueChange, icon }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.content}>
        {icon}
        <View style={styles.textWrap}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
      </View>
      <Switch
        accessibilityHint={description}
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.16)', true: 'rgba(243,201,138,0.45)' }}
        thumbColor={value ? ChristianPrayerPalette.gold : '#F7E7D2'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ChristianPrayerSpacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: ChristianPrayerSpacing.sm,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
