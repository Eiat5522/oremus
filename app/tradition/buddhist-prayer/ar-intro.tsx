import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GoldButton, SacredHeader } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';

export default function ARIntroScreen() {
  const router = useRouter();

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
            Use your camera to scan any flat surface — a table, shelf, or floor. A sacred altar will
            appear in your environment, creating an immersive space for meditation and chanting.
          </ThemedText>
          <ThemedText style={styles.description}>
            Walk slowly around the surface to help the app detect it. Once found, tap to place the
            altar and adjust its size and orientation to your liking.
          </ThemedText>
          <ThemedText style={styles.description}>
            You can then chant your chosen sutra with the altar visible throughout your session,
            deepening your sense of presence and devotion.
          </ThemedText>
        </View>

        <View style={styles.noteCard}>
          <IconSymbol name="info.circle" size={16} color={BuddhistPrayerColors.goldPrimary} />
          <ThemedText style={styles.noteText}>Works with or without AR capability</ThemedText>
        </View>

        <View style={styles.actions}>
          <GoldButton
            title="Begin Placement"
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
  actions: {
    width: '100%',
    gap: BuddhistPrayerSpacing.sm,
    marginTop: BuddhistPrayerSpacing.sm,
  },
});
