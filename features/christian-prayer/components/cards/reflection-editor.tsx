import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlassCard } from '@/features/christian-prayer/components/cards/glass-card';
import { TagChipGroup } from '@/features/christian-prayer/components/controls/tag-chip-group';
import { ChristianPrayerPalette } from '@/features/christian-prayer/constants';

interface ReflectionEditorProps {
  text: string;
  tags: string[];
  onChangeText: (text: string) => void;
  onChangeTags: (tags: string[]) => void;
  options: string[];
}

export function ReflectionEditor({
  text,
  tags,
  onChangeText,
  onChangeTags,
  options,
}: ReflectionEditorProps) {
  return (
    <GlassCard style={styles.card}>
      <ThemedText style={styles.label}>Your Reflection</ThemedText>
      <TextInput
        multiline
        onChangeText={onChangeText}
        placeholder="Write what surfaced in prayer..."
        placeholderTextColor={ChristianPrayerPalette.textMuted}
        style={styles.input}
        value={text}
      />
      <View style={styles.tagSection}>
        <ThemedText style={styles.tagLabel}>Tags</ThemedText>
        <TagChipGroup options={options} selected={tags} onChange={onChangeTags} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  label: {
    color: ChristianPrayerPalette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ChristianPrayerPalette.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: ChristianPrayerPalette.textPrimary,
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 24,
  },
  tagSection: {
    gap: 8,
  },
  tagLabel: {
    color: ChristianPrayerPalette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
