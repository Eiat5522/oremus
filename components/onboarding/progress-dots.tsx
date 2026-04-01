import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const SPIRIT_BLUE = '#4f8cff';
const INACTIVE_COLOR = 'rgba(255,255,255,0.22)';

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 24;
const ANIMATION_DURATION = 300;

interface ProgressDotsProps {
  /** Zero-based index of the current active step (0-4). */
  currentStep: number;
  /** Total number of steps. Defaults to 5. */
  totalSteps?: number;
}

function Dot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(isActive ? ACTIVE_WIDTH : DOT_SIZE, {
      duration: ANIMATION_DURATION,
    }),
    opacity: withTiming(isActive ? 1 : 0.5, {
      duration: ANIMATION_DURATION,
    }),
    backgroundColor: isActive ? SPIRIT_BLUE : INACTIVE_COLOR,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function ProgressDots({ currentStep, totalSteps = 5 }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Dot key={i} isActive={i === currentStep} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
