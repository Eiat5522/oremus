import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface AnimatedBellProps {
  onPress: () => void;
  isActive?: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
  disabled?: boolean;
}

export function AnimatedBell({
  onPress,
  isActive = false,
  size = 18,
  color = 'rgba(15,23,42,0.45)',
  activeColor = '#16a34a',
  disabled = false,
}: AnimatedBellProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const triggerAnimation = () => {
    // Jiggle animation
    rotation.value = withSequence(
      withTiming(-20, { duration: 50 }),
      withTiming(20, { duration: 100 }),
      withTiming(-15, { duration: 100 }),
      withTiming(15, { duration: 100 }),
      withTiming(0, { duration: 50 }),
    );

    // Scale pop animation
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 }),
    );

    // Haptic feedback
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePress = () => {
    if (disabled) {
      return;
    }
    triggerAnimation();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={12} disabled={disabled}>
      <Animated.View style={animatedStyle}>
        <IconSymbol
          name="bell.fill"
          size={size}
          color={disabled ? 'rgba(148,163,184,0.8)' : isActive ? activeColor : color}
        />
      </Animated.View>
    </Pressable>
  );
}
