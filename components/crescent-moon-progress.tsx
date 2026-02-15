import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CrescentMoonProgressProps {
  progress: number; // 0 to 1
  size?: number;
  color?: string;
  emptyColor?: string;
}

export function CrescentMoonProgress({
  progress,
  size = 80,
  color = '#10b981',
  emptyColor = 'rgba(0,0,0,0.1)',
}: CrescentMoonProgressProps) {
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withSpring(progress);
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      fill: interpolateColor(animatedProgress.value, [0, 1], [emptyColor, color]),
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Crescent Moon Path */}
        <AnimatedPath
          d="M50 10A40 40 0 1 0 50 90A32 32 0 1 1 50 10"
          animatedProps={animatedProps}
          transform="rotate(-20 50 50)"
        />

        {/* Star - visible when progress is 1 */}
        {progress >= 1 && (
          <Path
            d="M75 35L77 41L83 41L78 45L80 51L75 47L70 51L72 45L67 41L73 41L75 35Z"
            fill={color}
          />
        )}
      </Svg>
    </View>
  );
}
