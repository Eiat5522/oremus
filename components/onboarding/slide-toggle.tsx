import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

import { IconSymbol } from '@/components/ui/icon-symbol';

const TRACK_WIDTH = 312;
const TRACK_HEIGHT = 68;
const THUMB_SIZE = 56;
const TRACK_PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;
const ACTIVATION_THRESHOLD = MAX_TRANSLATE * 0.78;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

interface SlideToggleProps {
  onActivate: () => void;
  label?: string;
}

export function SlideToggle({ onActivate, label = 'Slide to begin' }: SlideToggleProps) {
  const translateX = useSharedValue(0);
  const isActivated = useSharedValue(false);

  function handleActivate() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
    opacity: interpolate(translateX.value, [0, MAX_TRANSLATE * 0.45], [1, 0], 'clamp'),
    transform: [
      { translateY: interpolate(translateX.value, [0, MAX_TRANSLATE], [0, -2], 'clamp') },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(translateX.value, [0, MAX_TRANSLATE], [0.08, 1], 'clamp') }],
  }));

  return (
    <View style={styles.track}>
      <LinearGradient
        colors={['rgba(79, 140, 255, 0.26)', 'rgba(79, 140, 255, 0.04)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.trackFill}
      >
        <Animated.View style={[styles.trackFillProgress, progressStyle]} />
      </LinearGradient>

      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <IconSymbol name="chevron.right" size={22} color="#ffffff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  trackFill: {
    position: 'absolute',
    left: TRACK_PADDING,
    right: TRACK_PADDING,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  trackFillProgress: {
    flex: 1,
    backgroundColor: 'rgba(79, 140, 255, 0.72)',
    borderRadius: 9999,
  },
  label: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 9999,
    backgroundColor: '#4f8cff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
