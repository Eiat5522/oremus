import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { BuddhistAltarPreview, GoldButton, SacredHeader } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { useChantSession } from '@/hooks/use-chant-session';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';
import { formatDuration } from '@/lib/chant-helpers';

export default function ARCompletionScreen() {
  const router = useRouter();
  const placementScale = useBuddhistPrayerStore((state) => state.placementScale);
  const placementRotation = useBuddhistPrayerStore((state) => state.placementRotation);
  const { completeSession, sessionDurationSeconds, versesCompleted, currentChantSlug } =
    useChantSession();

  const completedRef = useRef(false);
  useEffect(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      completeSession();
    }
  }, [completeSession]);

  const stats = [
    {
      id: 'duration',
      label: 'Duration',
      value: formatDuration(sessionDurationSeconds),
    },
    {
      id: 'verses',
      label: 'Verses',
      value: String(versesCompleted),
    },
    {
      id: 'streak',
      label: 'Streak',
      value: '🔥 1',
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Practice Complete" />

      {/* Altar — small at top */}
      <View style={styles.altarArea}>
        <BuddhistAltarPreview
          scale={placementScale}
          rotation={placementRotation}
          showHalo
          style={styles.altar}
          fallbackStyle={styles.altar}
        />
      </View>

      <View style={styles.content}>
        {/* Sparkle icon */}
        <View style={styles.iconCircle}>
          <IconSymbol name="sparkles" size={40} color={BuddhistPrayerColors.goldPrimary} />
        </View>

        <ThemedText style={styles.heading}>🪷 Sadhu!</ThemedText>
        <ThemedText style={styles.subheading}>
          May the merit of your AR practice bring peace to all beings.
        </ThemedText>

        {/* Gold divider */}
        <LinearGradient
          colors={['transparent', BuddhistPrayerColors.goldPrimary, 'transparent'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldButton
            title="Return Home"
            onPress={() => router.push('/tradition/buddhist-prayer')}
          />
          <GoldButton
            title="Meditate"
            variant="outline"
            onPress={() => router.push('/tradition/general')}
          />
          <GoldButton
            title="Chant Again"
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/tradition/buddhist-prayer/ar-preparation',
                params: { chantSlug: currentChantSlug ?? '' },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  altarArea: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.xxl,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    gap: BuddhistPrayerSpacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.12)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: BuddhistPrayerSpacing.xs,
  },
  heading: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    width: '70%',
    height: 1,
    marginVertical: BuddhistPrayerSpacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: BuddhistPrayerSpacing.md,
    marginBottom: BuddhistPrayerSpacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.md,
    paddingVertical: BuddhistPrayerSpacing.md,
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.xs,
  },
  statValue: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    width: '100%',
    gap: BuddhistPrayerSpacing.sm,
  },
});
