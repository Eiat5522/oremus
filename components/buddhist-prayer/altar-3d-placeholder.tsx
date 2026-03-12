import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { BuddhistPrayerColors } from '@/constants/buddhist-prayer/theme';

interface Altar3DPlaceholderProps {
  scale?: number;
  rotation?: number;
  showHalo?: boolean;
  style?: ViewStyle;
}

// TODO: [3D SWAP-IN] Replace this placeholder with BuddhistAltar3D component
// that uses expo-gl + expo-three or @react-three/fiber when those deps are added.
// The component interface (scale, rotation, showHalo, style) is intentionally
// compatible so the swap-in requires only a component substitution.

export function Altar3DPlaceholder({
  scale = 1,
  rotation = 0,
  showHalo = true,
  style,
}: Altar3DPlaceholderProps) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!showHalo) {
      glowAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.85, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim, showHalo]);

  return (
    <View
      style={[styles.container, style, { transform: [{ scale }, { rotate: `${rotation}deg` }] }]}
    >
      {showHalo ? <Animated.View style={[styles.halo, { opacity: glowAnim }]} /> : null}
      <Image
        source={require('@/assets/images/background/buddhism-waterpaint.png')}
        style={styles.image}
        contentFit="contain"
        transition={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
  },
  halo: {
    position: 'absolute',
    width: '85%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: BuddhistPrayerColors.goldPrimary,
    shadowColor: BuddhistPrayerColors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.6,
    elevation: 20,
  },
  image: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 16,
  },
});
