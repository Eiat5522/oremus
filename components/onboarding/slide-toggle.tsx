import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const TRACK_WIDTH = 300;
const TRACK_HEIGHT = 64;
const THUMB_SIZE = 52;
const TRACK_PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;
const ACTIVATION_THRESHOLD = MAX_TRANSLATE * 0.75;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

interface SlideToggleProps {
  onActivate: () => void;
  label?: string;
}

export function SlideToggle({ onActivate, label = 'Slide to begin →' }: SlideToggleProps) {
  const translateX = useSharedValue(0);
  const isActivated = useSharedValue(false);

  function handleActivate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onActivate();
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (isActivated.value) return;
      translateX.value = Math.min(Math.max(e.translationX, 0), MAX_TRANSLATE);
    })
    .onEnd(() => {
      if (isActivated.value) return;

      if (translateX.value >= ACTIVATION_THRESHOLD) {
        isActivated.value = true;
        translateX.value = withSpring(MAX_TRANSLATE, SPRING_CONFIG);
        runOnJS(handleActivate)();
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, MAX_TRANSLATE * 0.5], [1, 0], 'clamp'),
  }));

  return (
    <View style={styles.track}>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  label: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 9999,
    backgroundColor: '#1152d4',
    shadowColor: '#1152d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
