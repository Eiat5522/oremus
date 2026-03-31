import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SlideToggle } from '@/components/onboarding/slide-toggle';

const BACKGROUND = '#101622';
const GLOW_MIN = 0.4;
const GLOW_MAX = 1.0;
const GLOW_DURATION = 2000;
const TOGGLE_DELAY = 500;

export default function SplashGateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const glowOpacity = useSharedValue(GLOW_MIN);
  const toggleOpacity = useSharedValue(0);
  const toggleTranslateY = useSharedValue(30);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(GLOW_MAX, { duration: GLOW_DURATION }), -1, true);

    toggleOpacity.value = withDelay(TOGGLE_DELAY, withTiming(1, { duration: 400 }));
    toggleTranslateY.value = withDelay(TOGGLE_DELAY, withTiming(0, { duration: 400 }));
  }, [glowOpacity, toggleOpacity, toggleTranslateY]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const toggleContainerStyle = useAnimatedStyle(() => ({
    opacity: toggleOpacity.value,
    transform: [{ translateY: toggleTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={glowStyle}>
          <Image
            source={require('@/assets/images/app-logo-mark.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        <Text style={styles.appName}>Oremus</Text>
        <Text style={styles.tagline}>Your prayer companion</Text>
      </View>

      <Animated.View
        style={[styles.bottom, { paddingBottom: insets.bottom + 24 }, toggleContainerStyle]}
      >
        <SlideToggle label="Slide to begin" onActivate={() => router.push('/onboarding/welcome')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  bottom: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
});
