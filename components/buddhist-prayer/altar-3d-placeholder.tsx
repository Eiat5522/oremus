import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { ThemedText } from '@/components/themed-text';

interface Altar3DPlaceholderProps {
  showHalo?: boolean;
  showIncenseSmoke?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function Altar3DPlaceholder({
  showHalo = true,
  showIncenseSmoke = true,
  animated = true,
  style,
}: Altar3DPlaceholderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!animated) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [animated]);

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <View testID="altar-loading" style={styles.loading}>
          <ThemedText style={styles.loadingText}>Preparing 3D altar…</ThemedText>
        </View>
      ) : null}

      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(224,185,110,0.08)', 'rgba(0,0,0,0.4)'] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.frame}
        testID="altar-fallback"
      >
        {showHalo ? <View testID="altar-halo-overlay" style={styles.halo} /> : null}
        {showIncenseSmoke ? <View testID="altar-smoke-overlay" style={styles.smoke} /> : null}
        <View style={styles.statueSilhouette} />
        <View style={styles.platformBase} />
        <View style={styles.candleRow}>
          <View style={styles.candle} />
          <View style={[styles.candle, styles.candleRight]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    position: 'absolute',
    top: BuddhistPrayerSpacing.md,
    left: BuddhistPrayerSpacing.md,
    right: BuddhistPrayerSpacing.md,
    zIndex: 2,
    backgroundColor: 'rgba(15,10,6,0.85)',
    borderRadius: BuddhistPrayerRadius.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  loadingText: {
    color: BuddhistPrayerColors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.xl,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: BuddhistPrayerSpacing.md,
    backgroundColor: 'rgba(15,10,6,0.92)',
  },
  halo: {
    position: 'absolute',
    top: '18%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.2)',
    shadowColor: BuddhistPrayerColors.goldPrimary,
    shadowOpacity: 0.65,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  smoke: {
    position: 'absolute',
    top: '32%',
    width: 60,
    height: 70,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(245,235,215,0.2)',
    transform: [{ rotate: '-6deg' }],
  },
  statueSilhouette: {
    width: '46%',
    aspectRatio: 0.9,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(216,183,120,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(200,155,75,0.35)',
  },
  platformBase: {
    width: '80%',
    height: 32,
    marginTop: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    backgroundColor: 'rgba(92,62,29,0.9)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
  },
  candleRow: {
    position: 'absolute',
    bottom: BuddhistPrayerSpacing.md,
    left: BuddhistPrayerSpacing.lg,
    right: BuddhistPrayerSpacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  candle: {
    width: 18,
    height: 36,
    borderRadius: BuddhistPrayerRadius.sm,
    backgroundColor: '#F1E3BF',
  },
  candleRight: {
    transform: [{ scaleX: -1 }],
  },
});
