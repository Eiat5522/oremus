import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GoldButton, MeritOptionCard, SacredHeader } from '@/components/buddhist-prayer';
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

export default function MeritDedicationScreen() {
  const router = useRouter();
  const { dedicationNote, meritOption, selectMeritOption, setDedicationNote } =
    useBuddhistPrayerStore();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SacredHeader title="Dedicate Your Merit" showBackButton onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.messageBlock}>
          <ThemedText style={styles.completionMessage}>
            Your practice is complete. With a calm and open heart, share this merit.
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

        <View style={styles.noteSection}>
          <ThemedText style={styles.noteLabel}>Optional dedication note</ThemedText>
          <TextInput
            style={styles.noteInput}
            value={dedicationNote}
            onChangeText={setDedicationNote}
            placeholder="Offer a name, prayer, or intention…"
            placeholderTextColor={BuddhistPrayerColors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <GoldButton
          title="Continue"
          onPress={() => router.push('/tradition/buddhist-prayer/completion')}
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
  content: {
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingBottom: BuddhistPrayerSpacing.xxl,
    gap: BuddhistPrayerSpacing.lg,
  },
  messageBlock: {
    paddingVertical: BuddhistPrayerSpacing.md,
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
  noteSection: {
    gap: BuddhistPrayerSpacing.xs,
  },
  noteLabel: {
    color: BuddhistPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  noteInput: {
    minHeight: 112,
    backgroundColor: BuddhistPrayerColors.card,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    borderRadius: 18,
    paddingHorizontal: BuddhistPrayerSpacing.md,
    paddingVertical: BuddhistPrayerSpacing.sm,
    color: BuddhistPrayerColors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
});
