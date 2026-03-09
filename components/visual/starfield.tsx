import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type StarfieldProps = {
  width: number;
  height: number;
  count?: number;
};

type Star = {
  id: number;
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  duration: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function seeded(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function TwinkleStar({ cx, cy, r, opacity, duration }: Omit<Star, 'id'>) {
  const progress = useSharedValue(opacity);

  useEffect(() => {
    progress.value = withRepeat(withTiming(opacity + 0.22, { duration }), -1, true);
  }, [duration, opacity, progress]);

  const animatedProps = useAnimatedProps(() => ({
    opacity: progress.value,
  }));

  return <AnimatedCircle animatedProps={animatedProps} cx={cx} cy={cy} r={r} fill="#FFF9E5" />;
}

export function Starfield({ width, height, count = 28 }: StarfieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, index) => {
      const base = index + 1;
      return {
        id: base,
        cx: seeded(base * 3.1) * width,
        cy: seeded(base * 7.9) * (height * 0.58),
        r: 0.5 + seeded(base * 11.7) * 1.7,
        opacity: 0.06 + seeded(base * 13.1) * 0.18,
        duration: 1900 + Math.round(seeded(base * 17.3) * 2200),
      };
    });
  }, [count, height, width]);

  return (
    <Svg width={width} height={height} style={styles.field} pointerEvents="none">
      {stars.map((star) => (
        <TwinkleStar
          key={star.id}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          opacity={star.opacity}
          duration={star.duration}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFillObject,
  },
});
