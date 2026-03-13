import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  BuddhistAltarPreview,
  GoldButton,
  MeritOptionCard,
  SacredHeader,
} from '@/components/buddhist-prayer';
import { ThemedText } from '@/components/themed-text';
import type { MeritOption } from '@/constants/buddhist-prayer/types';
import { BuddhistPrayerColors, BuddhistPrayerSpacing } from '@/constants/buddhist-prayer/theme';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

const MERIT_OPTIONS: { option: MeritOption; label: string; description: string }[] = [
  {
    option: 'family',
    label: 'My Family',
    description: 'Share merit with loved ones',
  },
  {
    option: 'ancestors',
    label: 'Ancestors',
    description: 'Honor those who came before',
  },
  {
    option: 'all-beings',
    label: 'All Beings',
    description: 'May all sentient beings benefit',
  },
  {
    option: 'custom',
    label: 'Custom Intention',
    description: 'Write your own dedication',
  },
];

export default function ARMeritScreen() {
  const router = useRouter();
  const { meritOption, placementScale, placementRotation, selectMeritOption } =
    useBuddhistPrayerStore();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Dedicate Your Merit" showBackButton onBack={() => router.back()} />

      {/* Altar — top 35%, background feel */}
      <View style={styles.altarArea}>
        <BuddhistAltarPreview
          scale={placementScale}
          rotation={placementRotation}
          showHalo={false}
          style={styles.altar}
          fallbackStyle={styles.altar}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.messageBlock}>
          <ThemedText style={styles.completionMessage}>
            Your AR practice is complete. With a calm and open heart, offer this merit to those who
            guided you, those you love, and all beings in need.
          </ThemedText>
        </View>

        <View style={styles.optionsList}>
          {MERIT_OPTIONS.map(({ option, label, description }) => (
            <MeritOptionCard
              key={option}
              option={option}
              label={label}
              description={description}
              isSelected={meritOption === option}
              onSelect={() => selectMeritOption(option)}
            />
          ))}
        </View>

        <GoldButton
          title="Offer Merit"
          onPress={() => router.push('/tradition/buddhist-prayer/ar-completion')}
          disabled={!meritOption}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BuddhistPrayerColors.background,
  },
  altarArea: {
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BuddhistPrayerSpacing.lg,
    opacity: 0.75,
  },
  altar: {
    width: '100%',
    aspectRatio: 1,
  },
  content: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.xxl,
    gap: BuddhistPrayerSpacing.lg,
  },
  messageBlock: {
    paddingVertical: BuddhistPrayerSpacing.sm,
  },
  completionMessage: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsList: {
    gap: BuddhistPrayerSpacing.sm,
  },
});
