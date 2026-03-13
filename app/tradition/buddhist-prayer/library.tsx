import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GlassCard, SacredHeader } from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import { CHANT_CATEGORIES, CHANTS } from '@/constants/buddhist-prayer/chants';
import type { ChantCategory } from '@/constants/buddhist-prayer/types';
import {
  BuddhistPrayerColors,
  BuddhistPrayerRadius,
  BuddhistPrayerSpacing,
} from '@/constants/buddhist-prayer/theme';
import { formatDuration } from '@/lib/chant-helpers';

function isValidCategory(category?: string): category is ChantCategory {
  return CHANT_CATEGORIES.some((item) => item.id === category);
}

export default function ChantLibraryScreen() {
  const router = useRouter();
  const { category, intent } = useLocalSearchParams<{
    category?: ChantCategory;
    intent?: string;
  }>();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChantCategory | 'all'>('all');

  useEffect(() => {
    if (isValidCategory(category)) {
      setSelectedCategory(category);
      return;
    }

    setSelectedCategory('all');
  }, [category]);

  const intentCard = useMemo(() => {
    if (intent === 'learn') {
      return {
        title: 'Study with intention',
        description: 'Choose a chant to explore its meaning and practice at a reflective pace.',
      };
    }

    return null;
  }, [intent]);

  const filteredChants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHANTS.filter(
      (c) =>
        (selectedCategory === 'all' || c.category === selectedCategory) &&
        (q.length === 0 ||
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          (c.titleThai ?? '').includes(q)),
    );
  }, [query, selectedCategory]);

  const chantsByCategory = useMemo(() => {
    const map = new Map<ChantCategory, typeof CHANTS>();
    for (const cat of CHANT_CATEGORIES) {
      const items = filteredChants.filter((c) => c.category === cat.id);
      if (items.length > 0) {
        map.set(cat.id, items);
      }
    }
    return map;
  }, [filteredChants]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Chant Library" showBackButton onBack={() => router.back()} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chants…"
          placeholderTextColor={BuddhistPrayerColors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {intentCard ? (
          <GlassCard style={styles.intentCard}>
            <ThemedText style={styles.intentTitle}>{intentCard.title}</ThemedText>
            <ThemedText style={styles.intentDescription}>{intentCard.description}</ThemedText>
          </GlassCard>
        ) : null}

        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterChip,
              selectedCategory === 'all' ? styles.filterChipSelected : null,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                selectedCategory === 'all' ? styles.filterChipTextSelected : null,
              ]}
            >
              All
            </ThemedText>
          </Pressable>
          {CHANT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.filterChip,
                selectedCategory === cat.id ? styles.filterChipSelected : null,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.id ? styles.filterChipTextSelected : null,
                ]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {CHANT_CATEGORIES.map((cat) => {
          const items = chantsByCategory.get(cat.id);
          if (!items) return null;
          return (
            <View key={cat.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>{cat.label}</ThemedText>
                <ThemedText style={styles.sectionDesc}>{cat.description}</ThemedText>
              </View>
              <View style={styles.chantList}>
                {items.map((chant) => (
                  <GlassCard
                    key={chant.id}
                    onPress={() =>
                      router.push({
                        pathname: '/tradition/buddhist-prayer/preparation',
                        params: {
                          chantId: chant.id,
                          ...(intent === 'learn' ? { intent: 'learn' } : {}),
                        },
                      })
                    }
                    style={styles.chantCard}
                  >
                    <View style={styles.chantRow}>
                      <View style={styles.chantText}>
                        <ThemedText style={styles.chantTitle}>{chant.title}</ThemedText>
                        {chant.titleThai ? (
                          <ThemedText style={styles.chantTitleThai}>{chant.titleThai}</ThemedText>
                        ) : null}
                        <ThemedText style={styles.chantSubtitle}>{chant.subtitle}</ThemedText>
                        <ThemedText style={styles.chantPurpose} numberOfLines={2}>
                          {chant.purpose}
                        </ThemedText>
                      </View>
                      <View style={styles.chantBadge}>
                        <ThemedText style={styles.durationText}>
                          {formatDuration(chant.durationSeconds)}
                        </ThemedText>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </View>
            </View>
          );
        })}

        {filteredChants.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No chants match your search.</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  searchContainer: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.sm,
  },
  searchInput: {
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.lg,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 15,
  },
  content: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.xxl,
    gap: BuddhistPrayerSpacing.lg,
  },
  intentCard: {
    gap: BuddhistPrayerSpacing.xs,
  },
  intentTitle: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  intentDescription: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BuddhistPrayerSpacing.xs,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: BuddhistPrayerRadius.full,
    paddingHorizontal: BuddhistPrayerSpacing.sm,
    paddingVertical: 6,
    backgroundColor: BuddhistPrayerColors.card,
  },
  filterChipSelected: {
    borderColor: BuddhistPrayerColors.goldPrimary,
    backgroundColor: 'rgba(224,185,110,0.1)',
  },
  filterChipText: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: BuddhistPrayerColors.goldPrimary,
  },
  section: {
    gap: BuddhistPrayerSpacing.sm,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionDesc: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
  },
  chantList: {
    gap: BuddhistPrayerSpacing.sm,
  },
  chantCard: {
    paddingVertical: BuddhistPrayerSpacing.sm,
  },
  chantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: BuddhistPrayerSpacing.sm,
  },
  chantText: {
    flex: 1,
    gap: 3,
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
  chantPurpose: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  chantBadge: {
    backgroundColor: 'rgba(224,185,110,0.1)',
    borderRadius: BuddhistPrayerRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  durationText: {
    color: BuddhistPrayerColors.goldPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: BuddhistPrayerSpacing.xxl,
  },
  emptyText: {
    color: BuddhistPrayerColors.textMuted,
    fontSize: 15,
  },
});
