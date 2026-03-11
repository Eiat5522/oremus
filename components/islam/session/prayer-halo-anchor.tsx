import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Path, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const HALO_SIZE = 160;
const KAABA_SIZE = 64;

/** Opacity range for the outer pulsing halo ring – intentionally subtle. */
const HALO_OPACITY_MAX = 0.28;
const HALO_OPACITY_MIN = 0.1;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function PulsingHalo() {
  const outerScale = useSharedValue(1);
  const outerOpacity = useSharedValue(HALO_OPACITY_MAX);

  useEffect(() => {
    outerScale.value = withRepeat(
      withTiming(1.12, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    outerOpacity.value = withRepeat(
      withTiming(HALO_OPACITY_MIN, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [outerOpacity, outerScale]);

  const outerAnimatedProps = useAnimatedProps(() => ({
    opacity: outerOpacity.value,
    r: (HALO_SIZE / 2) * outerScale.value,
  }));

  return (
    <Svg
      width={HALO_SIZE + 40}
      height={HALO_SIZE + 40}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {/* Outer pulsing glow ring */}
      <AnimatedCircle
        animatedProps={outerAnimatedProps}
        cx={(HALO_SIZE + 40) / 2}
        cy={(HALO_SIZE + 40) / 2}
        fill="rgba(212, 175, 55, 0.5)"
      />
      {/* Inner solid glow */}
      <Circle
        cx={(HALO_SIZE + 40) / 2}
        cy={(HALO_SIZE + 40) / 2}
        r={HALO_SIZE / 2 - 8}
        fill="rgba(212, 175, 55, 0.13)"
      />
      {/* Halo ring stroke */}
      <Circle
        cx={(HALO_SIZE + 40) / 2}
        cy={(HALO_SIZE + 40) / 2}
        r={HALO_SIZE / 2}
        stroke="rgba(255, 220, 100, 0.28)"
        strokeWidth={1.2}
        fill="none"
      />
    </Svg>
  );
}

/**
 * Minimal Kaaba silhouette rendered as inline SVG paths.
 * Designed to match the warm-gold visual language of the Qibla screen.
 */
function KaabaIcon({ size = KAABA_SIZE }: { size?: number }) {
  const scale = size / 64;
  // Simple iconic Kaaba: a cube with cloth drape lines
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" pointerEvents="none">
      <Defs>
        <ClipPath id="kaaba-clip">
          <Rect x="0" y="0" width="64" height="64" />
        </ClipPath>
      </Defs>
      {/* Main cube body */}
      <Path
        d="M10 20 L54 20 L54 56 L10 56 Z"
        fill="rgba(255,240,180,0.15)"
        stroke="rgba(255,220,100,0.7)"
        strokeWidth={1.5 / scale}
      />
      {/* Top overhang / roof cap */}
      <Path
        d="M8 18 L56 18 L54 20 L10 20 Z"
        fill="rgba(255,220,100,0.35)"
        stroke="rgba(255,220,100,0.5)"
        strokeWidth={1 / scale}
      />
      {/* Kiswa cloth band across middle */}
      <Path
        d="M10 27 L54 27 L54 42 L10 42 Z"
        fill="rgba(255,220,100,0.10)"
        stroke="rgba(255,220,100,0.45)"
        strokeWidth={1 / scale}
      />
      {/* Door panel */}
      <Path
        d="M27 42 L37 42 L37 56 L27 56 Z"
        fill="rgba(255,220,100,0.20)"
        stroke="rgba(255,220,100,0.60)"
        strokeWidth={1 / scale}
      />
      {/* Gold band centre line on cloth */}
      <Path d="M10 34 L54 34" stroke="rgba(255,220,100,0.55)" strokeWidth={1 / scale} />
      {/* Decorative corner pillar left */}
      <Path d="M10 20 L10 56" stroke="rgba(255,220,100,0.35)" strokeWidth={2 / scale} />
      {/* Decorative corner pillar right */}
      <Path d="M54 20 L54 56" stroke="rgba(255,220,100,0.35)" strokeWidth={2 / scale} />
    </Svg>
  );
}

/**
 * Centered upper-middle halo with Kaaba icon anchor.
 * Stays visible throughout the session regardless of controls visibility.
 */
export function PrayerHaloAnchor() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.haloWrap}>
        <PulsingHalo />
        <View style={styles.kaabaWrap}>
          <KaabaIcon size={KAABA_SIZE} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  haloWrap: {
    width: HALO_SIZE + 40,
    height: HALO_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaWrap: {
    width: KAABA_SIZE,
    height: KAABA_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
