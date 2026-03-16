import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { IconCircleButton } from '@/features/christian-prayer/components/controls/icon-circle-button';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface TopOverlayHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export function TopOverlayHeader({ title, subtitle, onBack, onClose }: TopOverlayHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <IconCircleButton accessibilityLabel="Go back" onPress={onBack}>
            <IconSymbol name="arrow.left" size={18} color={ChristianPrayerPalette.textPrimary} />
          </IconCircleButton>
        ) : null}
      </View>
      <View style={styles.center}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
      </View>
      <View style={styles.side}>
        {onClose ? (
          <IconCircleButton accessibilityLabel="Close" onPress={onClose}>
            <IconSymbol name="close" size={18} color={ChristianPrayerPalette.textPrimary} />
          </IconCircleButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  side: {
    width: 46,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
