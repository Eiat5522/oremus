import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Starfield } from '@/components/visual/starfield';

type PrayerSessionBackgroundProps = {
  children: React.ReactNode;
  /** Screen dimensions needed for Starfield. */
  width: number;
  height: number;
};

// The Islamic atmosphere background already present in the project.
const BACKGROUND_IMAGE = require('@/assets/images/background/Islam.jpg');

/**
 * Full-screen atmospheric background for the Islamic Prayer Session screen.
 *
 * Layers (bottom to top):
 *  1. Islam.jpg fill image
 *  2. Deep dark gradient overlay for readability
 *  3. Warm gold top-bleed (halo bloom)
 *  4. Twinkling star field
 *  5. Bottom vignette
 *  6. Children content
 */
export function PrayerSessionBackground({ children, width, height }: PrayerSessionBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* 1. Background image */}
      <Image
        source={BACKGROUND_IMAGE}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        pointerEvents="none"
      />

      {/* 2. Primary dark overlay */}
      <LinearGradient
        colors={['rgba(4, 15, 12, 0.30)', 'rgba(3, 13, 10, 0.72)', 'rgba(1, 8, 6, 0.97)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* 3. Warm gold halo bloom at the top */}
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.18)', 'rgba(0, 0, 0, 0)']}
        locations={[0, 0.42]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* 4. Twinkling stars in the upper half */}
      <Starfield width={width} height={height} count={36} />

      {/* 5. Bottom vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        locations={[0.6, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* 6. Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040F0C',
  },
  content: {
    flex: 1,
  },
});
