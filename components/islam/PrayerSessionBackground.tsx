import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Image as RNImage, StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

type PrayerSessionBackgroundProps = {
  children: React.ReactNode;
  backgroundOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  starfieldOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
};

const backgroundSource = require('@/assets/islam/session/islam_prayer_session_bg.png');
const starfieldUri = RNImage.resolveAssetSource(
  require('@/assets/islam/session/islam_prayer_starfield.svg'),
).uri;

export function PrayerSessionBackground({
  children,
  backgroundOpacity,
  starfieldOpacity,
}: PrayerSessionBackgroundProps) {
  return (
    <View style={styles.container}>
      <Animated.View
        style={[StyleSheet.absoluteFill, backgroundOpacity ? { opacity: backgroundOpacity } : null]}
        pointerEvents="none"
      >
        <Image source={backgroundSource} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['rgba(4, 15, 13, 0.36)', 'rgba(2, 10, 8, 0.84)', 'rgba(1, 6, 5, 0.95)']}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(241, 209, 131, 0.18)', 'rgba(0, 0, 0, 0)']}
          locations={[0, 0.9]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.starfield,
          starfieldOpacity ? { opacity: starfieldOpacity } : null,
        ]}
        pointerEvents="none"
      >
        <SvgUri
          uri={starfieldUri}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        />
      </Animated.View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040C0A',
  },
  content: {
    flex: 1,
  },
  starfield: {
    opacity: 0.32,
  },
});
