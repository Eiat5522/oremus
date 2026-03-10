import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

type PrayerProgressRingProps = {
  completed: number;
  total: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function PrayerProgressRing({ completed, total }: PrayerProgressRingProps) {
  const size = 252;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;

  const dashOffset = useSharedValue(circumference * (1 - progress));
  const glowOpacity = useSharedValue(0.34);

  useEffect(() => {
    dashOffset.value = withTiming(circumference * (1 - progress), { duration: 900 });
  }, [circumference, dashOffset, progress]);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(0.6, { duration: 1800 }), -1, true);
  }, [glowOpacity]);

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const glowProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} pointerEvents="none">
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,245,222,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          animatedProps={glowProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(244, 200, 107, 0.36)"
          strokeWidth={strokeWidth + 10}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 18}
          stroke="rgba(252, 235, 190, 0.22)"
          strokeWidth={1.5}
          fill="rgba(8, 27, 22, 0.22)"
        />
        <AnimatedCircle
          animatedProps={progressProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(244, 200, 107, 0.96)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <ThemedText style={styles.moon}>☾</ThemedText>
        <ThemedText style={styles.count}>
          {completed}/{total}
        </ThemedText>
        <ThemedText style={styles.label}>Prayers Completed</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  moon: {
    color: '#F6D88A',
    fontSize: 20,
  },
  count: {
    color: '#FFF8E8',
    fontSize: 44,
    lineHeight: 52,
    fontFamily: Fonts.serif,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: 'rgba(255, 247, 226, 0.84)',
    fontSize: 15,
    lineHeight: 20,
  },
});
