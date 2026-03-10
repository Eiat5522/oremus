import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type PrayerAtmosphereProps = {
  children: React.ReactNode;
};

const ISLAM_BACKGROUND = require('@/assets/images/background/Islam.jpg');

export function PrayerAtmosphere({ children }: PrayerAtmosphereProps) {
  return (
    <View style={styles.container}>
      <Image
        source={ISLAM_BACKGROUND}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(8, 25, 19, 0.26)', 'rgba(6, 26, 20, 0.7)', 'rgba(2, 12, 10, 0.96)']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(225, 181, 93, 0.12)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.55)']}
        locations={[0.04, 0.36, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.softOverlay} pointerEvents="none" />
      <View style={styles.vignetteTop} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07140F',
  },
  content: {
    flex: 1,
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 16, 13, 0.18)',
  },
  vignetteTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});
