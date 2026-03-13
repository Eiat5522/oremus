import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { GlassCard } from './glass-card';
import { ProgressPill } from './progress-pill';

interface ChantOverlayProps {
  title: string;
  subtitle?: string;
  progress: number;
  verseIndex: number;
  totalVerses: number;
  verseContent: React.ReactNode;
  controls: React.ReactNode;
  hint?: string;
  tone?: 'standard' | 'ar';
  style?: ViewStyle;
}

/**
 * Shared overlay for chant sessions so AR and non-AR layouts stay consistent.
 */
export function ChantOverlay({
  title,
  subtitle,
  progress,
  verseIndex,
  totalVerses,
  verseContent,
  controls,
  hint,
  tone = 'standard',
  style,
}: ChantOverlayProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  const clampedProgress = useMemo(() => Math.min(Math.max(progress, 0), 1), [progress]);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeIn }, style]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedProgress * 100}%` }]} />
      </View>

      <GlassCard style={[styles.card, tone === 'ar' ? styles.cardAR : null]}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
          </View>
          <ProgressPill current={verseIndex + 1} total={totalVerses} />
        </View>

        <View style={styles.verseContent}>{verseContent}</View>

        <View style={styles.controls}>{controls}</View>

        {hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: BuddhistPrayerSpacing.sm,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BuddhistPrayerRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BuddhistPrayerColors.goldPrimary,
  },
  card: {
    gap: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.22)',
  },
  cardAR: {
    backgroundColor: 'rgba(12,8,6,0.72)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: BuddhistPrayerSpacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
  },
  verseContent: {
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.sm,
  },
  controls: {
    gap: BuddhistPrayerSpacing.sm,
  },
  hint: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
