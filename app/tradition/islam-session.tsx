import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrayerHaloAnchor } from '@/components/islam/PrayerHaloAnchor';
import { PrayerSessionBackground } from '@/components/islam/PrayerSessionBackground';
import { PrayerSessionControls } from '@/components/islam/PrayerSessionControls';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { usePrayerSessionVisibilityControls } from '@/hooks/use-prayer-session-visibility';

function formatElapsed(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remaining = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export default function IslamPrayerSessionScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { controlOpacity, revealControls } = usePrayerSessionVisibilityControls();
  useKeepAwake();

  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const anchorScale = useRef(new Animated.Value(0.92)).current;

  const prayerTitle = useMemo(() => {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return 'Maghrib Prayer';
    }
    return `${name.trim()} Prayer`;
  }, [name]);

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(haloOpacity, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 640,
          delay: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anchorScale, {
          toValue: 1,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start();
    return () => {
      sequence.stop();
    };
  }, [anchorScale, backgroundOpacity, haloOpacity, textOpacity]);

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleEndSession = () => {
    // TODO: integrate with Islamic end-session flow when available.
    router.back();
  };

  const handleEmergencyExit = () => {
    router.replace('/prayers');
  };

  return (
    <PrayerSessionBackground backgroundOpacity={backgroundOpacity}>
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Pressable
        style={styles.touchArea}
        onPress={revealControls}
        accessibilityRole="button"
        accessibilityLabel="Show prayer session controls"
      >
        <View style={[styles.topMeta, { paddingTop: insets.top + 10 }]}>
          <Animated.View style={[styles.helperPill, { opacity: controlOpacity }]}>
            <ThemedText style={styles.helperText}>Session Active</ThemedText>
          </Animated.View>
        </View>

        <View style={styles.centerContent}>
          <PrayerHaloAnchor haloOpacity={haloOpacity} anchorScale={anchorScale} />

          <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
            <ThemedText
              style={styles.title}
              accessibilityLabel="Prayer title"
              accessibilityRole="header"
            >
              {prayerTitle}
            </ThemedText>
            <ThemedText style={styles.subtitle}>Session Active</ThemedText>
            <ThemedText style={styles.timerLabel}>{formatElapsed(elapsed)}</ThemedText>
          </Animated.View>
        </View>

        <Animated.View style={[styles.helperWrap, { opacity: controlOpacity }]}>
          <ThemedText style={styles.helperBody}>Face the Qibla and begin when ready.</ThemedText>
        </Animated.View>

        <PrayerSessionControls
          opacity={controlOpacity}
          onEndSession={handleEndSession}
          onTogglePause={() => setIsPaused((value) => !value)}
          isPaused={isPaused}
          onEmergencyExit={handleEmergencyExit}
        />
      </Pressable>
    </PrayerSessionBackground>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    flex: 1,
  },
  topMeta: {
    width: '100%',
    paddingHorizontal: 18,
    alignItems: 'flex-end',
  },
  helperPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(4, 12, 10, 0.6)',
  },
  helperText: {
    color: '#F7E9C0',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 22,
  },
  textWrap: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 30,
    lineHeight: 40,
    color: '#F7F0D8',
    fontFamily: Fonts.serif,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(239, 222, 175, 0.78)',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  timerLabel: {
    color: 'rgba(234, 215, 170, 0.7)',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  helperWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  helperBody: {
    color: 'rgba(241, 222, 178, 0.9)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
