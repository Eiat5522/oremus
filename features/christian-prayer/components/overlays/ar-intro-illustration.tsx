import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

export function ArIntroIllustration() {
  return (
    <View style={styles.frame}>
      <View style={styles.phoneFrame}>
        <View style={styles.halo} />
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
        <View style={styles.bibleLeft} />
        <View style={styles.bibleRight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 210,
    height: 260,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(243,201,138,0.18)',
  },
  crossVertical: {
    width: 12,
    height: 92,
    borderRadius: 6,
    backgroundColor: ChristianPrayerPalette.gold,
  },
  crossHorizontal: {
    position: 'absolute',
    top: 86,
    width: 72,
    height: 12,
    borderRadius: 6,
    backgroundColor: ChristianPrayerPalette.gold,
  },
  bibleLeft: {
    position: 'absolute',
    bottom: 46,
    left: 62,
    width: 40,
    height: 28,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  bibleRight: {
    position: 'absolute',
    bottom: 46,
    right: 62,
    width: 40,
    height: 28,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
});
