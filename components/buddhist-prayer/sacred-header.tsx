import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';

interface SacredHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function SacredHeader({
  title,
  subtitle,
  showBackButton,
  onBack,
  rightElement,
}: SacredHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + BuddhistPrayerSpacing.sm }]}>
      <View style={styles.row}>
        {showBackButton ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconSymbol name="chevron.left" size={22} color={BuddhistPrayerColors.goldPrimary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
        </View>
        <View style={styles.rightSlot}>{rightElement ?? null}</View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: BuddhistPrayerSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
    gap: BuddhistPrayerSpacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 36,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  rightSlot: {
    width: 36,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    marginTop: BuddhistPrayerSpacing.sm,
    marginHorizontal: BuddhistPrayerSpacing.md,
    backgroundColor: BuddhistPrayerColors.cardBorder,
  },
});
