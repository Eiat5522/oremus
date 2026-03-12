import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ChantTextBlock } from '@/src/features/buddhistPrayer/components/ChantTextBlock';
import { ProgressPill } from '@/src/features/buddhistPrayer/components/ProgressPill';
import type { ChantVerse } from '@/src/features/buddhistPrayer/types/buddhistPrayer';

export const ChantOverlay = ({
  verse,
  progress,
  showMeaning,
}: {
  verse: ChantVerse;
  progress: number;
  showMeaning: boolean;
}) => {
  const haloPulse = useSharedValue(0.7);
  const smokeDrift = useSharedValue(0);

  useEffect(() => {
    haloPulse.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    smokeDrift.value = withRepeat(
      withTiming(1, { duration: 3800, easing: Easing.linear }),
      -1,
      true,
    );
  }, [haloPulse, smokeDrift]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloPulse.value * 0.35,
    transform: [{ scale: 0.92 + haloPulse.value * 0.12 }],
  }));

  const smokeStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + smokeDrift.value * 0.2,
    transform: [{ translateY: -8 * smokeDrift.value }, { translateX: 3 * smokeDrift.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View pointerEvents="none" style={[styles.haloWrap, haloStyle]}>
        <LinearGradient
          colors={['rgba(224,185,110,0.26)', 'rgba(224,185,110,0.02)']}
          style={styles.halo}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.incense, smokeStyle]} />
      <ProgressPill progress={progress} />
      <ChantTextBlock verse={verse} showMeaning={showMeaning} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    backgroundColor: 'rgba(10,7,4,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.22)',
    padding: 12,
  },
  haloWrap: {
    position: 'absolute',
    width: 240,
    height: 240,
    alignSelf: 'center',
    top: -44,
    borderRadius: 999,
    overflow: 'hidden',
  },
  halo: { width: '100%', height: '100%', borderRadius: 999 },
  incense: {
    position: 'absolute',
    width: 150,
    height: 130,
    right: -8,
    top: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
});
