import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GlassCard, GoldButton, SacredHeader } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CHANT_CATEGORIES, CHANTS } from '@/constants/buddhist-prayer/chants';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';
import {
  getCategoryRoute,
  getHomeSessionCardState,
  getQuickActionRoute,
} from '@/lib/buddhist-prayer-home';
import { formatDuration, getChantBySlug, getFeaturedChants } from '@/lib/chant-helpers';

const QUICK_ACTIONS = [
  { id: 'ar', icon: 'sparkles' as const, label: 'AR Prayer' },
  { id: 'chant', icon: 'music.note' as const, label: 'Daily Chant' },
  { id: 'merit', icon: 'hands.sparkles' as const, label: 'Merit' },
  { id: 'learn', icon: 'book.fill' as const, label: 'Learn' },
] as const;

const _featuredChants = getFeaturedChants();
const featuredChants = _featuredChants.length > 0 ? _featuredChants : CHANTS.slice(0, 3);

export default function BuddhistPrayerHomeScreen() {
  const router = useRouter();
  const {
    currentChantSlug,
    currentVerseIndex,
    sessionStartedAt,
    sessionCompletedAt,
    resetSession,
  } = useBuddhistPrayerStore();

  const currentChant = useMemo(() => {
    if (!currentChantSlug) return null;
    return getChantBySlug(currentChantSlug) ?? null;
  }, [currentChantSlug]);
  const sessionCard = useMemo(
    () =>
      getHomeSessionCardState({
        chant: currentChant,
        currentVerseIndex,
        sessionStartedAt,
        sessionCompletedAt,
      }),
    [currentChant, currentVerseIndex, sessionCompletedAt, sessionStartedAt],
  );

  const handleChantPress = useCallback(
    (chantSlug: string) => {
      router.push({
        pathname: '/tradition/buddhist-prayer/preparation',
        params: { chantSlug },
      });
    },
    [router],
  );
  const handleQuickActionPress = useCallback(
    (actionId: (typeof QUICK_ACTIONS)[number]['id']) => {
      const target = getQuickActionRoute(actionId);
      router.push(target);
    },
    [router],
  );
  const handleCategoryPress = useCallback(
    (category: (typeof CHANT_CATEGORIES)[number]['id']) => {
      router.push(getCategoryRoute(category));
    },
    [router],
  );
  const handleSessionPress = useCallback(() => {
    if (!sessionCard) {
      return;
    }

    router.push(sessionCard.primaryRoute);
  }, [router, sessionCard]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={require('@/assets/images/background/buddhism-waterpaint.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(20,15,10,0.45)', 'rgba(20,15,10,0.82)', 'rgba(20,15,10,0.97)']}
        style={StyleSheet.absoluteFillObject}
      />

      <SacredHeader title="Buddhist Prayer" subtitle="Begin your practice with intention" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <GlassCard style={styles.heroCard}>
          <ThemedText style={styles.heroHeading}>🪷 Sacred Practice</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Unite body, breath, and mind through traditional Theravāda chanting.
          </ThemedText>
          <View style={styles.heroButtons}>
            <GoldButton
              title="Begin AR Prayer"
              onPress={() => router.push('/tradition/buddhist-prayer/ar-intro')}
            />
            <GoldButton
              title="Daily Chant"
              variant="outline"
              onPress={() => router.push('/tradition/buddhist-prayer/library')}
            />
          </View>
        </GlassCard>

        {CHANT_CATEGORIES.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Practice Categories</ThemedText>
            </View>
            <View style={styles.categoryGrid}>
              {CHANT_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    pressed ? styles.cardPressed : null,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={category.label}
                >
                  <ThemedText style={styles.categoryCardLabel}>{category.label}</ThemedText>
                  <ThemedText style={styles.categoryCardDescription} numberOfLines={2}>
                    {category.description}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {sessionCard ? (
          <GlassCard style={styles.sessionCard}>
            <View style={styles.sessionCardHeader}>
              <ThemedText style={styles.sectionTitle}>{sessionCard.eyebrow}</ThemedText>
              <View style={styles.sessionBadge}>
                <ThemedText style={styles.sessionBadgeText}>{sessionCard.progressLabel}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.sessionTitle}>{sessionCard.title}</ThemedText>
            <ThemedText style={styles.sessionDescription}>{sessionCard.description}</ThemedText>
            <View style={styles.sessionActions}>
              <GoldButton title={sessionCard.primaryLabel} onPress={handleSessionPress} />
              <GoldButton
                title={sessionCard.secondaryLabel}
                variant="ghost"
                onPress={resetSession}
              />
            </View>
          </GlassCard>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        </View>
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [styles.actionCard, pressed ? styles.cardPressed : null]}
              onPress={() => handleQuickActionPress(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={`Opens the ${action.label.toLowerCase()} flow.`}
            >
              <IconSymbol name={action.icon} size={24} color={BuddhistPrayerColors.goldPrimary} />
              <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Featured Chants */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Featured Chants</ThemedText>
        </View>
        <View style={styles.chantList}>
          {featuredChants.map((chant) => (
            <GlassCard
              key={chant.id}
              onPress={() => handleChantPress(chant.slug)}
              style={styles.chantCard}
            >
              <View style={styles.chantCardRow}>
                <View style={styles.chantCardText}>
                  <ThemedText style={styles.chantTitle}>{chant.title}</ThemedText>
                  {chant.titleThai ? (
                    <ThemedText style={styles.chantTitleThai}>{chant.titleThai}</ThemedText>
                  ) : null}
                  <ThemedText style={styles.chantSubtitle}>{chant.subtitle}</ThemedText>
                </View>
                <View style={styles.chantMeta}>
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryText}>{chant.category}</ThemedText>
                  </View>
                  <ThemedText style={styles.duration}>
                    {formatDuration(chant.durationSeconds)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.chantPurpose} numberOfLines={2}>
                {chant.purpose}
              </ThemedText>
            </GlassCard>
          ))}
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
  heroCard: {
    gap: BuddhistPrayerSpacing.sm,
  },
  heroHeading: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  heroButtons: {
    gap: BuddhistPrayerSpacing.sm,
    marginTop: BuddhistPrayerSpacing.sm,
  },
  sectionHeader: {
    marginTop: BuddhistPrayerSpacing.sm,
  },
  sectionTitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: BuddhistPrayerSpacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BuddhistPrayerSpacing.sm,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.md,
    padding: BuddhistPrayerSpacing.md,
    gap: BuddhistPrayerSpacing.xs,
  },
  categoryCardLabel: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryCardDescription: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.md,
    paddingVertical: BuddhistPrayerSpacing.md,
    alignItems: 'center',
    gap: BuddhistPrayerSpacing.xs,
  },
  cardPressed: {
    opacity: 0.7,
  },
  actionLabel: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  chantList: {
    gap: BuddhistPrayerSpacing.sm,
  },
  sessionCard: {
    gap: BuddhistPrayerSpacing.sm,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: BuddhistPrayerSpacing.sm,
  },
  sessionBadge: {
    backgroundColor: 'rgba(224,185,110,0.12)',
    borderRadius: BuddhistPrayerRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sessionBadgeText: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  sessionTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  sessionDescription: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sessionActions: {
    gap: BuddhistPrayerSpacing.xs,
  },
  chantCard: {
    gap: BuddhistPrayerSpacing.xs,
  },
  chantCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: BuddhistPrayerSpacing.sm,
  },
  chantCardText: {
    flex: 1,
    gap: 2,
  },
  chantTitle: {
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  chantTitleThai: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 14,
  },
  chantSubtitle: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
  },
  chantMeta: {
    alignItems: 'flex-end',
    gap: BuddhistPrayerSpacing.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(224,185,110,0.12)',
    borderRadius: BuddhistPrayerRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  duration: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
  },
  chantPurpose: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
