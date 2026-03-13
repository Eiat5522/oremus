import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

interface Altar3DPlaceholderProps {
  showHalo?: boolean;
  showIncenseSmoke?: boolean;
  animated?: boolean;
}

/**
 * Lightweight altar illustration used whenever the native 3D scene is unavailable.
 * Keeps visual parity across AR and non-AR sessions and provides a safe fallback on web.
 */
export function Altar3DPlaceholder({
  showHalo = true,
  showIncenseSmoke = true,
  animated = true,
}: Altar3DPlaceholderProps) {
  const [isReady, setIsReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const haloOpacity = useRef(new Animated.Value(showHalo ? 0.4 : 0)).current;
  const smokeLift = useRef(new Animated.Value(0)).current;
  const smokeFade = useRef(new Animated.Value(showIncenseSmoke ? 0.4 : 0)).current;

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (isMounted) {
        setReduceMotion(value);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      isMounted = false;
      if (typeof subscription === 'function') {
        subscription();
      } else {
        subscription?.remove?.();
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), animated ? 240 : 0);
    return () => clearTimeout(timer);
  }, [animated]);

  useEffect(() => {
    if (!animated || reduceMotion || !showHalo) {
      haloOpacity.setValue(showHalo ? 0.32 : 0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloOpacity, {
          toValue: 0.75,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          toValue: 0.35,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [animated, haloOpacity, reduceMotion, showHalo]);

  useEffect(() => {
    if (!animated || reduceMotion || !showIncenseSmoke) {
      smokeFade.setValue(showIncenseSmoke ? 0.35 : 0);
      smokeLift.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(smokeLift, {
            toValue: -12,
            duration: 1400,
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
          Animated.timing(smokeFade, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(smokeFade, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [animated, reduceMotion, showIncenseSmoke, smokeFade, smokeLift]);

  return (
    <View style={styles.container} testID="altar-fallback">
      {!isReady ? (
        <View style={styles.loading} testID="altar-loading">
          <ThemedText style={styles.loadingText}>Preparing 3D altar…</ThemedText>
        </View>
      ) : null}

      <View style={styles.sceneFrame}>
        {showHalo ? (
          <Animated.View
            style={[styles.halo, { opacity: haloOpacity }]}
            testID="altar-halo-overlay"
          />
        ) : null}

        <View style={styles.aura} />
        <View style={styles.statue}>
          <View style={styles.statueHead} />
          <View style={styles.statueTorso}>
            <View style={styles.statueHands} />
          </View>
        </View>

        <View style={styles.platformStack}>
          <View style={styles.platformTop} />
          <View style={styles.platformMid} />
          <View style={styles.platformBase} />
        </View>

        <View style={styles.offeringRow}>
          <View style={[styles.offeringBowl, styles.offeringLeft]} />
          <View style={styles.candleGroup}>
            {showIncenseSmoke ? (
              <Animated.View
                testID="altar-smoke-overlay"
                style={[
                  styles.smoke,
                  { opacity: smokeFade, transform: [{ translateY: smokeLift }] },
                ]}
              />
            ) : null}
            <View style={styles.flameOuter}>
              <View style={styles.flameInner} />
            </View>
            <View style={styles.candleBody} />
          </View>
          <View style={[styles.offeringBowl, styles.offeringRight]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: BuddhistPrayerSpacing.md,
  },
  loading: {
    position: 'absolute',
    top: BuddhistPrayerSpacing.sm,
    left: BuddhistPrayerSpacing.sm,
    right: BuddhistPrayerSpacing.sm,
    padding: BuddhistPrayerSpacing.sm,
    borderRadius: BuddhistPrayerRadius.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    zIndex: 2,
  },
  loadingText: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
  },
  sceneFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.lg,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    backgroundColor: 'rgba(15,10,6,0.96)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: BuddhistPrayerSpacing.lg,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    top: '18%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.2)',
    shadowColor: BuddhistPrayerColors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 32,
    shadowOpacity: 0.7,
  },
  aura: {
    position: 'absolute',
    top: '36%',
    width: '60%',
    height: '28%',
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.08)',
  },
  statue: {
    alignItems: 'center',
    gap: 6,
    marginBottom: BuddhistPrayerSpacing.sm,
  },
  statueHead: {
    width: 40,
    height: 40,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#E8D2A0',
    borderWidth: 1,
    borderColor: 'rgba(92,62,29,0.25)',
  },
  statueTorso: {
    width: 78,
    height: 86,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#D8B778',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92,62,29,0.2)',
  },
  statueHands: {
    width: 44,
    height: 16,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(122,85,32,0.28)',
  },
  platformStack: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  platformTop: {
    width: '68%',
    height: 14,
    borderRadius: BuddhistPrayerRadius.md,
    backgroundColor: '#6C4D20',
  },
  platformMid: {
    width: '88%',
    height: 26,
    borderRadius: BuddhistPrayerRadius.lg,
    backgroundColor: '#8B6328',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.55)',
  },
  platformBase: {
    width: '100%',
    height: 30,
    borderRadius: BuddhistPrayerRadius.xl,
    backgroundColor: '#3B2912',
  },
  offeringRow: {
    position: 'absolute',
    bottom: BuddhistPrayerSpacing.lg,
    left: BuddhistPrayerSpacing.lg,
    right: BuddhistPrayerSpacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  offeringBowl: {
    width: 50,
    height: 24,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#8B6328',
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.45)',
  },
  offeringLeft: {
    transform: [{ rotate: '-6deg' }],
  },
  offeringRight: {
    transform: [{ rotate: '6deg' }],
  },
  candleGroup: {
    alignItems: 'center',
    gap: 4,
  },
  smoke: {
    width: 14,
    height: 28,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(245,235,215,0.35)',
  },
  flameOuter: {
    width: 16,
    height: 22,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(255,210,120,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameInner: {
    width: 8,
    height: 12,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: '#FFF1C2',
  },
  candleBody: {
    width: 12,
    height: 40,
    borderRadius: BuddhistPrayerRadius.sm,
    backgroundColor: '#F1E3BF',
  },
});
