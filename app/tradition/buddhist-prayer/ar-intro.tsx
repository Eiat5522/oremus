import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GoldButton, SacredHeader } from '@/components/buddhist-prayer';
import { ALTAR_EXPERIENCE_OPTIONS } from '@/constants/buddhist-prayer/altar-experience';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { AltarExperienceMode } from '@/constants/buddhist-prayer/types';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

export default function ARIntroScreen() {
  const router = useRouter();
  const altarExperienceMode = useBuddhistPrayerStore((state) => state.altarExperienceMode);
  const setAltarExperienceMode = useBuddhistPrayerStore((state) => state.setAltarExperienceMode);

  const selectedOption = ALTAR_EXPERIENCE_OPTIONS[altarExperienceMode];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['rgba(20,15,10,0.0)', 'rgba(20,15,10,0.7)', 'rgba(20,15,10,0.98)'] as const}
        style={styles.gradient}
        pointerEvents="none"
      />

      <SacredHeader title="AR Buddha Altar" showBackButton onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <IconSymbol name="sparkles" size={44} color={BuddhistPrayerColors.goldPrimary} />
        </View>

        <ThemedText style={styles.emoji}>🪷</ThemedText>

        <ThemedText style={styles.title}>AR Buddha Altar</ThemedText>
        <ThemedText style={styles.subtitle}>Place a sacred altar in your space</ThemedText>

        <View style={styles.descriptionBlock}>
          <ThemedText style={styles.description}>
            Slowly scan a clear surface — a table, shelf, or floor. When the altar appears, treat it
            as you would a shrine at home: with quiet attention and respect.
          </ThemedText>
          <ThemedText style={styles.description}>
            Walk mindfully around the surface to help the app sense depth. When ready, place the
            altar and adjust its size and orientation until it feels settled in the room.
          </ThemedText>
          <ThemedText style={styles.description}>
            Chant with the altar in view to deepen presence. If you prefer not to use the camera,
            the experience will gently fall back to a calm illustration.
          </ThemedText>
        </View>

        <View style={styles.noteCard}>
          <IconSymbol name="info.circle" size={16} color={BuddhistPrayerColors.goldPrimary} />
          <ThemedText style={styles.noteText}>
            Works gracefully with or without camera access.
          </ThemedText>
        </View>

        <View style={styles.modeCard}>
          <ThemedText style={styles.modeHeading}>Choose your altar mode</ThemedText>
          <View style={styles.modeOptions}>
            {(
              Object.entries(ALTAR_EXPERIENCE_OPTIONS) as [
                AltarExperienceMode,
                (typeof ALTAR_EXPERIENCE_OPTIONS)[AltarExperienceMode],
              ][]
            ).map(([mode, option]) => {
              const isSelected = altarExperienceMode === mode;

              return (
                <Pressable
                  key={mode}
                  onPress={() => setAltarExperienceMode(mode)}
                  style={[styles.modeOption, isSelected ? styles.modeOptionSelected : null]}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${option.title} mode`}
                >
                  <View style={styles.modeOptionHeader}>
                    <ThemedText style={styles.modeTitle}>{option.title}</ThemedText>
                    <ThemedText
                      style={[styles.modeBadge, isSelected ? styles.modeBadgeSelected : null]}
                    >
                      {option.subtitle}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.modeDescription}>{option.description}</ThemedText>
                </Pressable>
              );
            })}
          </View>
          <ThemedText style={styles.modeHint}>
            {selectedOption.requiresCamera
              ? 'Camera permission will be requested on the next step.'
              : 'No camera is required in immersive fallback mode.'}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <GoldButton
            title={selectedOption.actionLabel}
            onPress={() => router.push('/tradition/buddhist-prayer/ar-scan')}
          />
          <GoldButton title="Go Back" variant="ghost" onPress={() => router.back()} />
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    gap: BuddhistPrayerSpacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: BuddhistPrayerRadius.full,
    backgroundColor: 'rgba(224,185,110,0.12)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: BuddhistPrayerSpacing.xs,
  },
  emoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  title: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: BuddhistPrayerSpacing.xs,
  },
  descriptionBlock: {
    gap: BuddhistPrayerSpacing.sm,
    marginVertical: BuddhistPrayerSpacing.xs,
  },
  description: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.xs,
    backgroundColor: 'rgba(224,185,110,0.08)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.goldBorder,
    borderRadius: BuddhistPrayerRadius.md,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
  },
  noteText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
  },
  modeCard: {
    width: '100%',
    gap: BuddhistPrayerSpacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.lg,
    padding: BuddhistPrayerSpacing.md,
  },
  modeHeading: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  modeOptions: {
    gap: BuddhistPrayerSpacing.sm,
  },
  modeOption: {
    gap: BuddhistPrayerSpacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: BuddhistPrayerRadius.md,
    padding: BuddhistPrayerSpacing.sm,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  modeOptionSelected: {
    borderColor: BuddhistPrayerColors.goldPrimary,
    backgroundColor: 'rgba(224,185,110,0.09)',
  },
  modeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: BuddhistPrayerSpacing.sm,
  },
  modeTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  modeBadge: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modeBadgeSelected: {
    color: BuddhistPrayerColors.goldPrimary,
  },
  modeDescription: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  modeHint: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: BuddhistPrayerSpacing.sm,
    marginTop: BuddhistPrayerSpacing.sm,
  },
});
