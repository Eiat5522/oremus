import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated2, { useAnimatedStyle } from 'react-native-reanimated';

import { PrayerHaloAnchor } from '@/components/islam/session/prayer-halo-anchor';
import { PrayerSessionBackground } from '@/components/islam/session/prayer-session-background';
import { PrayerSessionControls } from '@/components/islam/session/prayer-session-controls';
import { PrayerSessionTimer } from '@/components/islam/session/prayer-session-timer';
import { ThemedText } from '@/components/themed-text';
import { usePrayerSessionVisibilityControls } from '@/hooks/use-prayer-session-visibility-controls';
import type { PrayerName } from '@/lib/prayer-times';
import { addSessionLogEntry } from '@/lib/session-log';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Capitalize first letter of each word (e.g. "fajr" → "Fajr"). */
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPrayerName(value: string | undefined): value is PrayerName {
  return (
    value === 'fajr' ||
    value === 'dhuhr' ||
    value === 'asr' ||
    value === 'maghrib' ||
    value === 'isha'
  );
}

/** useNativeDriver must be false on web (Expo Router web support). */
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function IslamPrayerSessionScreen() {
  // Prevent screen from sleeping during the session.
  useKeepAwake();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Prayer name may be passed as a route param from the prayer list.
  const params = useLocalSearchParams<{ prayerName?: string | string[] }>();
  const prayerName = Array.isArray(params.prayerName) ? params.prayerName[0] : params.prayerName;
  const displayName = prayerName ? `${toTitleCase(prayerName)} Prayer` : 'Prayer Session';

  // Visibility hook – auto-hides controls after 3 s of idle.
  const { controlsOpacity, reveal } = usePrayerSessionVisibilityControls();

  // Animated style for the Reanimated opacity layer.
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // ---- Entry animations (React Native Animated) ----
  const masterFade = useRef(new Animated.Value(0)).current;
  const helperFade = useRef(new Animated.Value(0)).current;
  const helperTranslate = useRef(new Animated.Value(8)).current;
  const sessionStartedAtRef = useRef(Date.now());

  useEffect(() => {
    // Fade in the whole scene.
    Animated.timing(masterFade, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    // Helper text slides up then fades out on its own after delay.
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(helperFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(helperTranslate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]).start();
  }, [helperFade, helperTranslate, masterFade]);

  // ---- Handlers ----
  const handleEndSession = () => {
    const completedAtMs = Date.now();
    const durationSeconds = Math.max(
      0,
      Math.floor((completedAtMs - sessionStartedAtRef.current) / 1000),
    );

    void addSessionLogEntry({
      tradition: 'islam',
      prayerName: isPrayerName(prayerName) ? prayerName : undefined,
      startedAtMs: sessionStartedAtRef.current,
      completedAtMs,
      durationSeconds,
    });

    router.replace({
      pathname: '/tradition/islam-completion',
      params: {
        prayerName: isPrayerName(prayerName) ? prayerName : undefined,
        durationSeconds: String(durationSeconds),
      },
    });
  };

  const handleEmergencyExit = () => {
    router.back();
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <PrayerSessionBackground width={width} height={height}>
        <Animated.View
          onTouchStart={reveal}
          style={[
            styles.scene,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
            { opacity: masterFade },
          ]}
        >
          {/* ── Upper section: halo + prayer title ── */}
          <View style={styles.upperSection}>
            <PrayerHaloAnchor />

            <View style={styles.titleBlock}>
              <ThemedText
                style={styles.prayerTitle}
                accessibilityLabel={displayName}
                accessibilityRole="header"
              >
                {displayName}
              </ThemedText>
              <ThemedText style={styles.sessionSubtitle}>Session Active</ThemedText>
              <PrayerSessionTimer running />
            </View>

            {/* Helper text – fades in briefly */}
            <Animated2.View style={[styles.helperWrap, controlsAnimatedStyle]}>
              <Animated.View
                style={{ opacity: helperFade, transform: [{ translateY: helperTranslate }] }}
              >
                <ThemedText style={styles.helperText}>
                  Face the Qibla and begin when ready.
                </ThemedText>
              </Animated.View>
            </Animated2.View>
          </View>

          {/* ── Lower section: controls ── */}
          <View style={styles.lowerSection}>
            <PrayerSessionControls
              animatedStyle={controlsAnimatedStyle}
              onEndSession={handleEndSession}
              onEmergencyExit={handleEmergencyExit}
            />
          </View>
        </Animated.View>
      </PrayerSessionBackground>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040F0C',
  },
  scene: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  upperSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 20,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 4,
  },
  prayerTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: 'rgba(255,240,180,0.95)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  sessionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,240,180,0.55)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  helperWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  helperText: {
    fontSize: 13,
    color: 'rgba(255,240,180,0.50)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lowerSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
});
