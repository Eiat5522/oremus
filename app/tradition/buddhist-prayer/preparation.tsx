import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { GlassCard, GoldButton, IconToggleRow, SacredHeader } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { CHANTS } from '@/constants/buddhist-prayer/chants';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { getChantBySlug } from '@/lib/chant-helpers';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

export default function ChantPreparationScreen() {
  const router = useRouter();
  const { chantSlug, intent } = useLocalSearchParams<{ chantSlug?: string; intent?: string }>();

  const {
    showMeaning,
    autoScroll,
    isAudioEnabled,
    templeBellEnabled,
    setShowMeaning,
    toggleMeaning,
    toggleAutoScroll,
    toggleAudio,
    toggleTempleBell,
    startPreparation,
    startSession,
  } = useBuddhistPrayerStore();

  const chant = useMemo(() => {
    if (chantSlug) {
      return getChantBySlug(chantSlug) ?? null;
    }
    return CHANTS[0] ?? null;
  }, [chantSlug]);

  useEffect(() => {
    if (intent === 'learn') {
      setShowMeaning(true);
    }
  }, [intent, setShowMeaning]);

  const handleBeginChanting = () => {
    if (!chant) return;
    startPreparation(chant.slug, false);
    startSession();
    router.push('/tradition/buddhist-prayer/session');
  };

  const handleBeginAR = () => {
    if (!chant) return;
    startPreparation(chant.slug, true);
    router.push('/tradition/buddhist-prayer/ar-intro');
  };

  if (!chant) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SacredHeader title="Preparation" showBackButton onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>Chant not found.</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Preparation" showBackButton onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chant info */}
        <GlassCard style={styles.chantInfo}>
          <ThemedText style={styles.chantTitle}>{chant.title}</ThemedText>
          {chant.titleThai ? (
            <ThemedText style={styles.chantTitleThai}>{chant.titleThai}</ThemedText>
          ) : null}
          <ThemedText style={styles.chantSubtitle}>{chant.subtitle}</ThemedText>
          <ThemedText style={styles.chantPurpose}>{chant.purpose}</ThemedText>
        </GlassCard>

        {/* Settings */}
        <GlassCard style={styles.settings}>
          <ThemedText style={styles.settingsHeading}>Session Settings</ThemedText>
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
          <ThemedText style={styles.settingsHint}>
            Sessions flow one verse at a time. Auto Advance moves you forward when a verse finishes.
          </ThemedText>
        </GlassCard>

        {/* CTAs */}
        <View style={styles.ctaGroup}>
          <GoldButton title="Begin Chanting" onPress={handleBeginChanting} />
          <GoldButton title="Begin AR Prayer" variant="outline" onPress={handleBeginAR} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  content: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.xxl,
    gap: BuddhistPrayerSpacing.md,
  },
  chantInfo: {
    gap: BuddhistPrayerSpacing.xs,
  },
  chantTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  chantTitleThai: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 18,
  },
  chantSubtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 14,
  },
  chantPurpose: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: BuddhistPrayerSpacing.xs,
  },
  settings: {
    gap: BuddhistPrayerSpacing.xs,
  },
  settingsHeading: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: BuddhistPrayerSpacing.xs,
  },
  settingsHint: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: BuddhistPrayerSpacing.sm,
  },
  ctaGroup: {
    gap: BuddhistPrayerSpacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 15,
  },
});
