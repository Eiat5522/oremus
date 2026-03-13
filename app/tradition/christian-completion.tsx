import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  ChristianPrayerColors,
  getDefaultChristianPrayerTemplate,
} from '@/constants/christian-prayer';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useChristianPrayerSession } from '@/hooks/use-christian-prayer-session';
import { formatDuration } from '@/lib/chant-helpers';
import { recordPrayerCompletion } from '@/lib/focus-gate';

export default function ChristianCompletionScreen() {
  const router = useRouter();
  const uiTheme = useMemo(() => getTraditionUiTheme('christianity'), []);
  const { currentTemplate, completeSession, sessionDurationSeconds, stagesCompleted } =
    useChristianPrayerSession();
  const completionRecordedRef = useRef(false);

  useEffect(() => {
    if (completionRecordedRef.current) {
      return;
    }

    completionRecordedRef.current = true;
    completeSession();
    void recordPrayerCompletion();
  }, [completeSession]);

  const template = currentTemplate ?? getDefaultChristianPrayerTemplate();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={uiTheme.backgroundImage}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          ChristianPrayerColors.overlayTop,
          ChristianPrayerColors.overlayMid,
          ChristianPrayerColors.overlayBottom,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <IconSymbol name="checkmark.circle.fill" size={42} color={ChristianPrayerColors.gold} />
        </View>

        <ThemedText style={styles.eyebrow}>Prayer Complete</ThemedText>
        <ThemedText style={styles.title}>{template.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{template.closingBlessing}</ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>
              {formatDuration(sessionDurationSeconds)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Duration</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{stagesCompleted}</ThemedText>
            <ThemedText style={styles.statLabel}>Stages</ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/tradition/christian-preparation',
                params: { templateId: template.id },
              } as never)
            }
            style={styles.primaryButton}
          >
            <ThemedText style={styles.primaryButtonText}>Pray Again</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/tradition/christian' as never)}
            style={styles.secondaryButton}
          >
            <ThemedText style={styles.secondaryButtonText}>Return Home</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/tradition/christian' as never)}
            style={styles.ghostButton}
          >
            <ThemedText style={styles.ghostButtonText}>Choose Another Template</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChristianPrayerColors.background,
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
    borderColor: ChristianPrayerColors.borderStrong,
  },
  eyebrow: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  statValue: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: ChristianPrayerColors.textMuted,
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
    backgroundColor: ChristianPrayerColors.gold,
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
    borderColor: ChristianPrayerColors.borderStrong,
  },
  secondaryButtonText: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  ghostButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
