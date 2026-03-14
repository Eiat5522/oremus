import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatDuration } from '@/lib/chant-helpers';
import { recordPrayerCompletion } from '@/lib/focus-gate';

type CompletionParams = {
  prayerName?: string | string[];
  durationSeconds?: string | string[];
};

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function IslamCompletionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<CompletionParams>();
  const completionRecordedRef = useRef(false);

  useEffect(() => {
    if (completionRecordedRef.current) {
      return;
    }

    completionRecordedRef.current = true;
    void recordPrayerCompletion();
  }, []);

  const prayerNameParam = Array.isArray(params.prayerName)
    ? params.prayerName[0]
    : params.prayerName;
  const durationParam = Array.isArray(params.durationSeconds)
    ? params.durationSeconds[0]
    : params.durationSeconds;
  const durationSeconds = Number.isFinite(Number(durationParam)) ? Number(durationParam) : 0;
  const prayerLabel = prayerNameParam ? `${toTitleCase(prayerNameParam)} Prayer` : 'Prayer';

  const completionMessage = useMemo(
    () => `May your ${prayerLabel.toLowerCase()} bring you peace and steadfastness.`,
    [prayerLabel],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#04150F', '#06231A', '#0C3225']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <IconSymbol name="checkmark.circle.fill" size={44} color="#F4C86B" />
        </View>

        <ThemedText style={styles.eyebrow}>Session Complete</ThemedText>
        <ThemedText style={styles.title}>{prayerLabel}</ThemedText>
        <ThemedText style={styles.subtitle}>{completionMessage}</ThemedText>

        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>{formatDuration(durationSeconds)}</ThemedText>
          <ThemedText style={styles.statLabel}>Duration</ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/tradition/islam-preparation',
                params: { prayerName: prayerNameParam },
              })
            }
            style={styles.primaryButton}
          >
            <ThemedText style={styles.primaryButtonText}>Pray Again</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(tabs)/prayers')}
            style={styles.secondaryButton}
          >
            <ThemedText style={styles.secondaryButtonText}>Return to Prayer List</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 18,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(244,200,107,0.25)',
  },
  eyebrow: {
    color: '#F4C86B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF6DF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(247,233,192,0.82)',
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
  },
  statCard: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(244,200,107,0.18)',
  },
  statValue: {
    color: '#FFF6DF',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(247,233,192,0.65)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4C86B',
  },
  primaryButtonText: {
    color: '#2F1A10',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,200,107,0.24)',
  },
  secondaryButtonText: {
    color: '#FFF6DF',
    fontSize: 15,
    fontWeight: '700',
  },
});
