import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface BuddhistAltar3DProps {
  scale?: number;
  rotation?: number;
  showHalo?: boolean;
  showIncenseSmoke?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

const LOTUS_PETAL_ANGLES = [-52, -26, 0, 26, 52] as const;
const AMBIENT_PARTICLE_OFFSETS = [
  { top: '14%', left: '22%', size: 7, delay: 0 },
  { top: '22%', left: '72%', size: 5, delay: 240 },
  { top: '36%', left: '16%', size: 6, delay: 520 },
  { top: '18%', left: '50%', size: 4, delay: 860 },
] as const;

export function BuddhistAltar3D({
  scale = 1,
  rotation = 0,
  showHalo = true,
  showIncenseSmoke = true,
  animated = true,
  style,
}: BuddhistAltar3DProps) {
  const reduceMotionEnabled = useReducedMotion();
  const shouldAnimate = animated && !reduceMotionEnabled;
  const haloOpacity = useRef(new Animated.Value(showHalo ? 0.42 : 0)).current;
  const smokeLift = useRef(new Animated.Value(0)).current;
  const smokeFade = useRef(new Animated.Value(0.25)).current;
  const particleValues = useMemo(
    () => AMBIENT_PARTICLE_OFFSETS.map(() => new Animated.Value(0.25)),
    [],
  );

  useEffect(() => {
    if (!shouldAnimate) {
      haloOpacity.setValue(showHalo ? 0.54 : 0);
      return;
    }

    if (!showHalo) {
      haloOpacity.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloOpacity, {
          toValue: 0.88,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          toValue: 0.42,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [haloOpacity, shouldAnimate, showHalo]);

  useEffect(() => {
    if (!showIncenseSmoke || !shouldAnimate) {
      smokeLift.setValue(0);
      smokeFade.setValue(showIncenseSmoke ? 0.2 : 0);
      return;
    }

    const smokeLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(smokeLift, {
            toValue: -18,
            duration: 2600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(smokeLift, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(smokeFade, {
            toValue: 0.62,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(smokeFade, {
            toValue: 0.15,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    smokeLoop.start();
    return () => smokeLoop.stop();
  }, [showIncenseSmoke, shouldAnimate, smokeFade, smokeLift]);

  useEffect(() => {
    if (!shouldAnimate) {
      particleValues.forEach((value) => value.setValue(0.28));
      return;
    }

    const loops = particleValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(AMBIENT_PARTICLE_OFFSETS[index].delay),
          Animated.timing(value, {
            toValue: 0.88,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.22,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [particleValues, shouldAnimate]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Buddhist altar preview"
      accessibilityHint={
        reduceMotionEnabled
          ? 'Static altar preview shown with reduced motion enabled.'
          : 'Animated altar preview with halo and incense.'
      }
      style={[styles.container, style, { transform: [{ scale }, { rotate: `${rotation}deg` }] }]}
      testID="altar-fallback"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(224,185,110,0.03)', 'rgba(0,0,0,0.35)'] as const}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.sceneFrame}
      >
        {showHalo ? (
          <Animated.View
            testID="altar-halo-overlay"
            style={[styles.halo, { opacity: haloOpacity }]}
          />
        ) : null}

        {shouldAnimate
          ? AMBIENT_PARTICLE_OFFSETS.map((particle, index) => (
              <Animated.View
                key={`${particle.top}-${particle.left}`}
                testID="altar-particle"
                style={[
                  styles.particle,
                  {
                    top: particle.top,
                    left: particle.left,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    opacity: particleValues[index],
                  },
                ]}
              />
            ))
          : null}

        <LinearGradient
          colors={['rgba(224,185,110,0.05)', 'rgba(20,15,10,0.8)'] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.sceneGlow}
        />

        <View style={styles.statueZone}>
          <View style={styles.backAura} />
          <View style={styles.statueShadow} />
          <View style={styles.statueBody}>
            <View style={styles.statueHead} />
            <View style={styles.statueTorso}>
              <View style={styles.statueHands} />
            </View>
          </View>
        </View>

        <View style={styles.candleRow}>
          <Candle smokeFade={smokeFade} smokeLift={smokeLift} showSmoke={showIncenseSmoke} />
          <Candle
            smokeFade={smokeFade}
            smokeLift={smokeLift}
            showSmoke={showIncenseSmoke}
            mirrored
          />
        </View>

        <View style={styles.offeringsRow}>
          <View style={[styles.offeringBowl, styles.offeringLeft]} />
          <View style={styles.centralLotus}>
            {LOTUS_PETAL_ANGLES.map((angle) => (
              <View
                key={angle}
                style={[styles.lotusPetal, { transform: [{ rotate: `${angle}deg` }] }]}
              />
            ))}
            <View style={styles.lotusCenter} />
          </View>
          <View style={[styles.offeringBowl, styles.offeringRight]} />
        </View>

        <View style={styles.platformStack}>
          <LinearGradient
            colors={['#6C4D20', '#33220F'] as const}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.platformTop}
          />
          <LinearGradient
            colors={['rgba(224,185,110,0.95)', 'rgba(139,99,40,0.9)'] as const}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.platformMid}
          />
          <LinearGradient
            colors={['rgba(92,62,29,0.95)', 'rgba(34,21,10,0.98)'] as const}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.platformBase}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

function Candle({
  smokeFade,
  smokeLift,
  showSmoke,
  mirrored = false,
}: {
  smokeFade: Animated.Value;
  smokeLift: Animated.Value;
  showSmoke: boolean;
  mirrored?: boolean;
}) {
  return (
    <View style={[styles.candle, mirrored ? styles.candleMirrored : null]}>
      {showSmoke ? (
        <Animated.View
          testID="altar-smoke-overlay"
          style={[
            styles.smokeTrail,
            {
              opacity: smokeFade,
              transform: [{ translateY: smokeLift }],
            },
          ]}
        />
      ) : null}
      <View style={styles.flameOuter}>
        <View style={styles.flameInner} />
      </View>
      <View style={styles.candleBody} />
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
  sceneFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.xl,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    overflow: 'hidden',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    paddingTop: BuddhistPrayerSpacing.lg,
    paddingBottom: BuddhistPrayerSpacing.md,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,10,6,0.95)',
  },
  halo: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: '62%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.24)',
    shadowColor: BuddhistPrayerColors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.7,
    elevation: 18,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(245,235,215,0.9)',
  },
  sceneGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  statueZone: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: '42%',
    height: '34%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backAura: {
    position: 'absolute',
    bottom: '18%',
    width: '84%',
    height: '72%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.12)',
  },
  statueShadow: {
    position: 'absolute',
    bottom: '10%',
    width: '68%',
    height: '18%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  statueBody: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '72%',
    height: '100%',
  },
  statueHead: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#E8D2A0',
    marginBottom: -8,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(92,62,29,0.25)',
  },
  statueTorso: {
    width: '100%',
    height: '72%',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: '#D8B778',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92,62,29,0.2)',
  },
  statueHands: {
    width: '56%',
    height: '16%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(122,85,32,0.28)',
  },
  candleRow: {
    position: 'absolute',
    bottom: '27%',
    left: BuddhistPrayerSpacing.lg,
    right: BuddhistPrayerSpacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  candle: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 30,
    height: 92,
  },
  candleMirrored: {
    transform: [{ scaleX: -1 }],
  },
  smokeTrail: {
    position: 'absolute',
    top: 4,
    width: 14,
    height: 30,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(245,235,215,0.35)',
  },
  flameOuter: {
    width: 16,
    height: 24,
    borderTopLeftRadius: BuddhistPrayerRadius.full,
    borderTopRightRadius: BuddhistPrayerRadius.full,
    borderBottomLeftRadius: BuddhistPrayerRadius.full,
    borderBottomRightRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(255,210,120,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    transform: [{ rotate: '8deg' }],
  },
  flameInner: {
    width: 8,
    height: 12,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#FFF1C2',
  },
  candleBody: {
    width: 14,
    height: 42,
    borderRadius: BuddhistPrayerRadius.sm,
    backgroundColor: '#F1E3BF',
  },
  offeringsRow: {
    position: 'absolute',
    bottom: '21%',
    left: BuddhistPrayerSpacing.xl,
    right: BuddhistPrayerSpacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  offeringBowl: {
    width: 44,
    height: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#8B6328',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.55)',
  },
  offeringLeft: {
    transform: [{ rotate: '-8deg' }],
  },
  offeringRight: {
    transform: [{ rotate: '8deg' }],
  },
  centralLotus: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 82,
    height: 56,
  },
  lotusPetal: {
    position: 'absolute',
    bottom: 0,
    width: 26,
    height: 42,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: 'rgba(244,213,158,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(200,155,75,0.45)',
  },
  lotusCenter: {
    width: 30,
    height: 18,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#F8E7C1',
    marginBottom: 2,
  },
  platformStack: {
    gap: 6,
  },
  platformTop: {
    alignSelf: 'center',
    width: '68%',
    height: 16,
    borderRadius: BuddhistPrayerRadius.lg,
  },
  platformMid: {
    alignSelf: 'center',
    width: '84%',
    height: 32,
    borderRadius: BuddhistPrayerRadius.lg,
  },
  platformBase: {
    width: '100%',
    height: 34,
    borderRadius: BuddhistPrayerRadius.xl,
  },
});
