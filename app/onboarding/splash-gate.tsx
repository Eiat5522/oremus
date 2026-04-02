import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SlideToggle } from '@/components/onboarding/slide-toggle';

const REVEAL_DELAY = 900;
const REVEAL_DURATION = 700;

export default function SplashGateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const controlsOpacity = useSharedValue(0);
  const controlsTranslateY = useSharedValue(18);

  useEffect(() => {
    controlsOpacity.value = withDelay(REVEAL_DELAY, withTiming(1, { duration: REVEAL_DURATION }));
    controlsTranslateY.value = withDelay(
      REVEAL_DELAY,
      withTiming(0, { duration: REVEAL_DURATION }),
    );
  }, [controlsOpacity, controlsTranslateY]);

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
    transform: [{ translateY: controlsTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Animated.View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }, controlsStyle]}>
        <SlideToggle
          label="Swipe to begin"
          onActivate={() => router.replace('/onboarding/welcome')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 134,
  },
  bottom: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
