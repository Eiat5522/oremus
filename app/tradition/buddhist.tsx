import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  buddhistPrayers,
  type BuddhistPrayer,
  type BuddhistTradition,
} from '@/constants/religious-content';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TRADITIONS: { id: BuddhistTradition; label: string }[] = [
  { id: 'tibetan', label: 'Tibetan' },
  { id: 'zen', label: 'Zen' },
  { id: 'theravada', label: 'Theravada' },
  { id: 'pure-land', label: 'Pure Land' },
];

export default function BuddhistScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [activeTradition, setActiveTradition] = useState<BuddhistTradition>('tibetan');
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>(
    buddhistPrayers.find((prayer) => prayer.tradition === 'tibetan')?.id ??
      buddhistPrayers[0]?.id ??
      '',
  );

  const filteredPrayers = useMemo(
    () => buddhistPrayers.filter((prayer) => prayer.tradition === activeTradition),
    [activeTradition],
  );

  const selectedPrayer = useMemo(() => {
    const prayer =
      filteredPrayers.find((prayer) => prayer.id === selectedPrayerId) ??
      filteredPrayers[0] ??
      buddhistPrayers[0];
    return prayer;
  }, [filteredPrayers, selectedPrayerId]);

  if (!selectedPrayer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No prayers available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Buddhist Prayer',
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="arrow.left" size={20} color={theme.text} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabs}>
          {TRADITIONS.map((tradition) => (
            <Pressable
              key={tradition.id}
              onPress={() => {
                setActiveTradition(tradition.id);
                const firstPrayer = buddhistPrayers.find(
                  (prayer) => prayer.tradition === tradition.id,
                );
                if (firstPrayer) {
                  setSelectedPrayerId(firstPrayer.id);
                }
              }}
              style={[
                styles.tab,
                activeTradition === tradition.id && {
                  borderColor: '#f59e0b',
                  backgroundColor: '#fef3c7',
                },
              ]}
            >
              <ThemedText
                style={[styles.tabText, activeTradition === tradition.id && { color: '#b45309' }]}
              >
                {tradition.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.heroCard}>
          <ThemedText style={styles.sectionLabel}>Selected prayer</ThemedText>
          <ThemedText style={styles.heroTitle}>{selectedPrayer.title}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{selectedPrayer.subtitle}</ThemedText>
        </View>

        <View style={styles.list}>
          {filteredPrayers.map((prayer) => (
            <PrayerItem
              key={prayer.id}
              prayer={prayer}
              isActive={prayer.id === selectedPrayer.id}
              onPress={() => setSelectedPrayerId(prayer.id)}
            />
          ))}
        </View>

        <Button
          title="Start Prayer Session"
          size="lg"
          onPress={() =>
            router.push({
              pathname: '/tradition/buddhist-session' as never,
              params: { prayerId: selectedPrayer.id },
            })
          }
        />
      </ScrollView>
    </ThemedView>
  );
}

function PrayerItem({
  prayer,
  isActive,
  onPress,
}: {
  prayer: BuddhistPrayer;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.prayerItem,
        isActive && { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
      ]}
    >
      <View style={styles.prayerText}>
        <ThemedText style={styles.prayerTitle}>{prayer.title}</ThemedText>
        <ThemedText style={styles.prayerSubtitle}>{prayer.subtitle}</ThemedText>
      </View>
      <IconSymbol
        name={isActive ? 'checkmark.circle.fill' : 'play.circle.fill'}
        size={22}
        color="#f59e0b"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 16,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#92400e',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
    opacity: 0.75,
  },
  list: {
    gap: 8,
  },
  prayerItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  prayerText: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  prayerSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
});
