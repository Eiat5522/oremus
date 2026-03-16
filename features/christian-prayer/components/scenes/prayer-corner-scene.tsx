import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  ChristianPrayerPalette,
  type ChristianArSceneStyle,
} from '@/features/christian-prayer/constants';

interface PrayerCornerSceneProps {
  sceneStyle: ChristianArSceneStyle;
  floatingPrompts?: string[];
  children?: React.ReactNode;
}

const PARTICLE_LAYOUT = [
  { top: '18%', left: '16%' },
  { top: '24%', left: '72%' },
  { top: '34%', left: '28%' },
  { top: '38%', left: '64%' },
  { top: '48%', left: '14%' },
  { top: '56%', left: '76%' },
  { top: '66%', left: '24%' },
  { top: '72%', left: '62%' },
] as const;

export function PrayerCornerScene({
  sceneStyle,
  floatingPrompts = [],
  children,
}: PrayerCornerSceneProps) {
  const visiblePrompts = floatingPrompts.slice(0, 5);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          `rgba(243, 201, 138, ${0.08 + sceneStyle.haloIntensity * 0.16})`,
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.36)',
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.halo, { opacity: sceneStyle.haloIntensity }]} />
      {PARTICLE_LAYOUT.slice(
        0,
        Math.max(2, Math.min(PARTICLE_LAYOUT.length, Math.round(sceneStyle.particleRate * 10))),
      ).map((particle, index) => (
        <View
          key={`${particle.top}-${particle.left}-${index}`}
          style={[styles.particle, particle]}
        />
      ))}

      {/* Cap prompt pills so the fixed staggered layout stays inside the scene. */}
      {visiblePrompts.map((prompt, index) => (
        <View
          key={`${prompt}-${index}`}
          style={[
            styles.promptPill,
            index % 2 === 0 ? styles.promptLeft : styles.promptRight,
            { top: 36 + index * 46 },
          ]}
        >
          <ThemedText style={styles.promptText}>{prompt}</ThemedText>
        </View>
      ))}

      <View style={styles.sceneCenter}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
        <View style={styles.bibleRow}>
          <View style={styles.bibleLeft} />
          <View style={styles.bibleRight} />
        </View>
        <View style={styles.candleRow}>
          <View style={[styles.candle, { opacity: sceneStyle.candleIntensity }]} />
          <View style={[styles.candle, { opacity: sceneStyle.candleIntensity }]} />
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(19, 13, 11, 0.64)',
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    top: '24%',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(243,201,138,0.32)',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,244,232,0.8)',
  },
  promptPill: {
    position: 'absolute',
    maxWidth: 160,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(22, 15, 12, 0.72)',
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
  },
  promptLeft: {
    left: 18,
  },
  promptRight: {
    right: 18,
  },
  promptText: {
    color: ChristianPrayerPalette.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  sceneCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  crossVertical: {
    width: 14,
    height: 120,
    borderRadius: 8,
    backgroundColor: ChristianPrayerPalette.gold,
  },
  crossHorizontal: {
    position: 'absolute',
    top: '34%',
    width: 78,
    height: 14,
    borderRadius: 8,
    backgroundColor: ChristianPrayerPalette.gold,
  },
  bibleRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 26,
  },
  bibleLeft: {
    width: 48,
    height: 34,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 10,
    backgroundColor: 'rgba(255,250,244,0.82)',
  },
  bibleRight: {
    width: 48,
    height: 34,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 10,
    backgroundColor: 'rgba(255,250,244,0.82)',
  },
  candleRow: {
    flexDirection: 'row',
    gap: 88,
    marginTop: 12,
  },
  candle: {
    width: 12,
    height: 52,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 234, 204, 0.8)',
  },
});
