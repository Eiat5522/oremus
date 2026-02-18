import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CrescentMoonProgressProps {
  progress: number; // 0 to 1
  size?: number;
  color?: string;
  emptyColor?: string;
  strokeWidth?: number;
}

export function CrescentMoonProgress({
  progress,
  size = 80,
  color = '#10b981',
  emptyColor = 'rgba(0,0,0,0.1)',
  strokeWidth = 8,
}: CrescentMoonProgressProps) {
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withSpring(progress);
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    // When complete, always use the filled color
    const progressValue = animatedProgress.value >= 1 ? 1 : animatedProgress.value;
    return {
      stroke: interpolateColor(progressValue, [0, 1], [emptyColor, color]),
    };
  });

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={emptyColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          animatedProps={animatedProps}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  );
}
