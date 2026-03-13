import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Altar3DPlaceholder,
  GlassCard,
  GoldButton,
  IconToggleRow,
  SacredHeader,
} from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

export default function ARPreparationScreen() {
  const router = useRouter();

  const {
    currentChantSlug,
    showMeaning,
    autoScroll,
    isAudioEnabled,
    templeBellEnabled,
    toggleMeaning,
    toggleAutoScroll,
    toggleAudio,
    toggleTempleBell,
    startSession,
  } = useBuddhistPrayerStore();

  const handleStartChanting = () => {
    startSession();
    router.push('/tradition/buddhist-prayer/ar-chant');
  };

  if (!currentChantSlug) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SacredHeader title="Prepare for Chanting" showBackButton onBack={() => router.back()} />
        <View style={styles.errorState}>
          <ThemedText style={styles.errorText}>
            No chant selected. Please go back and choose a chant.
          </ThemedText>
          <GoldButton title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Prepare for Chanting" showBackButton onBack={() => router.back()} />

      {/* Altar preview — top 50% */}
      <View style={styles.altarArea}>
        <Altar3DPlaceholder showHalo style={styles.altar} />
      </View>

      {/* Bottom sheet overlay */}
      <GlassCard style={styles.sheet}>
        <ThemedText style={styles.sheetTitle}>Prepare for Chanting</ThemedText>

        <View style={styles.toggles}>
          <IconToggleRow
            icon="quote.bubble"
            label="Show Meaning"
            value={showMeaning}
            onToggle={toggleMeaning}
          />
          <IconToggleRow
            icon="arrow.down.to.line"
            label="Auto Advance"
            value={autoScroll}
            onToggle={toggleAutoScroll}
          />
          <IconToggleRow
            icon="music.note"
            label="Monk Chanting"
            value={isAudioEnabled}
            onToggle={toggleAudio}
          />
          <IconToggleRow
            icon="bell.fill"
            label="Temple Bell"
            value={templeBellEnabled}
            onToggle={toggleTempleBell}
          />
        </View>

        <ThemedText style={styles.settingsHint}>
          Sessions flow one verse at a time. Auto Advance moves you forward when a verse finishes.
        </ThemedText>

        <GoldButton title="Start Chanting" onPress={handleStartChanting} />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  altarArea: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.md,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  sheet: {
    marginHorizontal: BuddhistPrayerSpacing.md,
    marginBottom: BuddhistPrayerSpacing.xl,
    gap: BuddhistPrayerSpacing.sm,
  },
  sheetTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: BuddhistPrayerSpacing.xs,
  },
  toggles: {
    gap: BuddhistPrayerSpacing.xs,
  },
  settingsHint: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    gap: BuddhistPrayerSpacing.md,
  },
  errorText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
