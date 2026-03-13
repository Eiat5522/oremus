import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import type { AltarProps } from '@/constants/buddhist-prayer/types';

interface Altar3DPlaceholderProps extends AltarProps {
  style?: ViewStyle;
}

type Scene3DComponent = React.ComponentType<Required<AltarProps> & { onReady?: () => void }>;

const TEST_ENVIRONMENT = Boolean(process.env.JEST_WORKER_ID);

function useReducedMotionPreference() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (isMounted) {
          setReduceMotionEnabled(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setReduceMotionEnabled(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (value) => {
      setReduceMotionEnabled(value);
    });

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotionEnabled;
}

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

function LoadingPlaceholder() {
  return (
    <View style={styles.loadingBadge} testID="altar-loading">
      <ActivityIndicator color={BuddhistPrayerColors.goldPrimary} size="small" />
      <ThemedText style={styles.loadingText}>Preparing 3D altar…</ThemedText>
    </View>
  );
}

function FallbackAltar() {
  return (
    <View style={styles.fallbackScene} testID="altar-fallback">
      <View style={styles.candleColumnLeft}>
        <View style={styles.candleWax} />
        <View style={styles.candleFlame} />
      </View>

      <View style={styles.candleColumnRight}>
        <View style={styles.candleWax} />
        <View style={styles.candleFlame} />
      </View>

      <View style={styles.lotusPetalLarge} />
      <View style={styles.lotusPetalSmallLeft} />
      <View style={styles.lotusPetalSmallRight} />
      <View style={styles.lotusPedestalBase} />

      <View style={styles.buddhaBody} />
      <View style={styles.buddhaHead} />
      <View style={styles.buddhaHaloDisk} />

      <View style={styles.incenseBowl}>
        <View style={styles.incenseStickLeft} />
        <View style={styles.incenseStickRight} />
      </View>
    </View>
  );
}

function StaticHalo({ glowIntensity }: { glowIntensity: number }) {
  return <View style={[styles.halo, { opacity: Math.min(0.32, 0.14 + glowIntensity * 0.08) }]} />;
}

function AnimatedHalo({
  glowIntensity,
  reduceMotion,
}: {
  glowIntensity: number;
  reduceMotion: boolean;
}) {
  const haloOpacity = useRef(
    new Animated.Value(Math.min(0.28, 0.14 + glowIntensity * 0.08)),
  ).current;
  const haloScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      haloOpacity.setValue(Math.min(0.28, 0.14 + glowIntensity * 0.08));
      haloScale.setValue(1);
      return;
    }

    const opacityPeak = Math.min(0.4, 0.18 + glowIntensity * 0.1);
    const opacityBase = Math.max(0.16, opacityPeak - 0.14);
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(haloOpacity, {
            toValue: opacityPeak,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: opacityBase,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(haloScale, {
            toValue: 1.06,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [glowIntensity, haloOpacity, haloScale, reduceMotion]);

  return (
    <Animated.View
      style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
      testID="altar-halo-overlay"
    />
  );
}

function SmokeOverlay({ reduceMotion }: { reduceMotion: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0.5);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion]);

  return (
    <View pointerEvents="none" style={styles.smokeContainer} testID="altar-smoke-overlay">
      {[styles.smokeWispLeft, styles.smokeWispCenter, styles.smokeWispRight].map(
        (smokeStyle, index) => (
          <Animated.View
            key={`smoke-${index}`}
            style={[
              styles.smokeWisp,
              smokeStyle,
              {
                opacity: reduceMotion
                  ? 0.18 + index * 0.04
                  : drift.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.05, 0.24 + index * 0.03, 0.08],
                    }),
                transform: [
                  {
                    translateY: reduceMotion
                      ? -20 - index * 6
                      : drift.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10 + index * 4, -34 - index * 10],
                        }),
                  },
                  {
                    translateX: reduceMotion
                      ? 0
                      : drift.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [-2 + index * 2, 6 - index * 3, -3 + index * 2],
                        }),
                  },
                  {
                    scale: reduceMotion
                      ? 1
                      : drift.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.84, 1.2],
                        }),
                  },
                ],
              },
            ]}
          />
        ),
      )}
    </View>
  );
}

export function Altar3DPlaceholder({
  scale = 1,
  rotation = 0,
  showHalo = true,
  showIncenseSmoke = true,
  glowIntensity = 1,
  animated = true,
  style,
}: Altar3DPlaceholderProps) {
  const reduceMotionEnabled = useReducedMotionPreference();
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneErrored, setSceneErrored] = useState(false);
  const Scene3D = useMemo<Scene3DComponent | null>(() => {
    if (Platform.OS === 'web' || TEST_ENVIRONMENT) {
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('./altar-3d-scene').AltarScene3D as Scene3DComponent;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (Scene3D) {
      return;
    }

    const timeout = setTimeout(() => {
      setSceneReady(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [Scene3D]);

  return (
    <View style={[styles.container, style]} testID="altar-root">
      <View style={[styles.stage, { transform: [{ scale }, { rotate: `${rotation}deg` }] }]}>
        <FallbackAltar />

        {Scene3D && !sceneErrored ? (
          <SceneErrorBoundary onError={() => setSceneErrored(true)}>
            <View style={styles.sceneLayer}>
              <Scene3D
                scale={1}
                rotation={0}
                showHalo={showHalo}
                showIncenseSmoke={showIncenseSmoke}
                glowIntensity={glowIntensity}
                animated={animated && !reduceMotionEnabled}
                onReady={() => setSceneReady(true)}
              />
            </View>
          </SceneErrorBoundary>
        ) : null}

        {showHalo ? (
          reduceMotionEnabled ? (
            <StaticHalo glowIntensity={glowIntensity} />
          ) : (
            <AnimatedHalo glowIntensity={glowIntensity} reduceMotion={!animated} />
          )
        ) : null}

        {showIncenseSmoke ? <SmokeOverlay reduceMotion={reduceMotionEnabled || !animated} /> : null}

        {!sceneReady ? <LoadingPlaceholder /> : null}

        {sceneErrored ? (
          <View style={styles.errorBadge}>
            <ThemedText style={styles.errorBadgeText}>
              3D altar unavailable — showing safe fallback
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
  },
  stage: {
    width: '100%',
    height: '100%',
    borderRadius: BuddhistPrayerRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
  },
  sceneLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  fallbackScene: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,15,10,0.92)',
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: '72%',
    height: '58%',
    borderRadius: 999,
    backgroundColor: BuddhistPrayerColors.goldPrimary,
    shadowColor: BuddhistPrayerColors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.6,
    elevation: 20,
    zIndex: 3,
  },
  buddhaHaloDisk: {
    position: 'absolute',
    top: '21%',
    width: '38%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.18)',
  },
  buddhaBody: {
    position: 'absolute',
    top: '33%',
    width: '28%',
    height: '26%',
    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#B88943',
    zIndex: 2,
  },
  buddhaHead: {
    position: 'absolute',
    top: '26%',
    width: '12%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#D8B16A',
    zIndex: 3,
  },
  lotusPedestalBase: {
    position: 'absolute',
    bottom: '20%',
    width: '46%',
    height: '10%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#805424',
    zIndex: 1,
  },
  lotusPetalLarge: {
    position: 'absolute',
    bottom: '24%',
    width: '34%',
    height: '11%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#D3A455',
    zIndex: 1,
  },
  lotusPetalSmallLeft: {
    position: 'absolute',
    bottom: '25%',
    left: '29%',
    width: '16%',
    height: '8%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#E3BF7C',
    transform: [{ rotate: '-14deg' }],
    zIndex: 1,
  },
  lotusPetalSmallRight: {
    position: 'absolute',
    bottom: '25%',
    right: '29%',
    width: '16%',
    height: '8%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#E3BF7C',
    transform: [{ rotate: '14deg' }],
    zIndex: 1,
  },
  candleColumnLeft: {
    position: 'absolute',
    left: '18%',
    bottom: '28%',
    alignItems: 'center',
    zIndex: 2,
  },
  candleColumnRight: {
    position: 'absolute',
    right: '18%',
    bottom: '28%',
    alignItems: 'center',
    zIndex: 2,
  },
  candleWax: {
    width: 18,
    height: 62,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#F3E2BE',
  },
  candleFlame: {
    width: 14,
    height: 22,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#FFB453',
    marginBottom: -3,
    shadowColor: '#FFB453',
    shadowRadius: 18,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
  incenseBowl: {
    position: 'absolute',
    bottom: '14%',
    width: '24%',
    height: '8%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#5F3F22',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 4,
  },
  incenseStickLeft: {
    position: 'absolute',
    top: -34,
    left: '34%',
    width: 4,
    height: 42,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#43301B',
    transform: [{ rotate: '-4deg' }],
  },
  incenseStickRight: {
    position: 'absolute',
    top: -34,
    right: '34%',
    width: 4,
    height: 42,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#43301B',
    transform: [{ rotate: '4deg' }],
  },
  smokeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  smokeWisp: {
    position: 'absolute',
    bottom: '22%',
    width: '12%',
    height: '18%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  smokeWispLeft: {
    left: '39%',
  },
  smokeWispCenter: {
    left: '44%',
    width: '11%',
    height: '20%',
  },
  smokeWispRight: {
    left: '49%',
  },
  loadingBadge: {
    position: 'absolute',
    top: BuddhistPrayerSpacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.sm,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(20,15,10,0.88)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    zIndex: 5,
  },
  loadingText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBadge: {
    position: 'absolute',
    bottom: BuddhistPrayerSpacing.md,
    alignSelf: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(20,15,10,0.9)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    zIndex: 5,
  },
  errorBadgeText: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 11,
    textAlign: 'center',
  },
});
