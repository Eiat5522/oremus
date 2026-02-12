import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { christianVerses, type ChristianVerse } from '@/constants/religious-content';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChristianScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(
    christianVerses[0]?.id ?? null,
  );

  const selectedVerse = useMemo(
    () => christianVerses.find((verse) => verse.id === selectedVerseId) ?? null,
    [selectedVerseId],
  );

  const randomizeVerse = () => {
    if (christianVerses.length === 0) {
      return;
    }
    if (christianVerses.length <= 1) {
      setSelectedVerseId(christianVerses[0]?.id ?? null);
      return;
    }
    let nextVerse = selectedVerse ?? christianVerses[0];
    while (nextVerse.id === selectedVerse?.id) {
      const idx = Math.floor(Math.random() * christianVerses.length);
      nextVerse = christianVerses[idx];
    }
    setSelectedVerseId(nextVerse.id);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Religious Verses',
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
        <View style={styles.heroCard}>
          <ThemedText style={styles.sectionLabel}>Selected verse</ThemedText>
          {selectedVerse ? (
            <>
              <ThemedText style={styles.verseText}>&quot;{selectedVerse.text}&quot;</ThemedText>
              <ThemedText style={styles.reference}>{selectedVerse.reference}</ThemedText>
            </>
          ) : (
            <ThemedText style={styles.verseText}>No verses available.</ThemedText>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={randomizeVerse} style={styles.randomButton}>
            <IconSymbol name="sparkles" size={16} color="#1d4ed8" />
            <ThemedText style={styles.randomButtonText}>Pick random verse</ThemedText>
          </Pressable>
          <Button
            title="Start Session"
            onPress={() => {
              if (!selectedVerse) {
                return;
              }
              router.push({
                pathname: '/tradition/christian-session' as never,
                params: { verseId: selectedVerse.id },
              });
            }}
            disabled={!selectedVerse}
            style={styles.startButton}
          />
        </View>

        <View style={styles.list}>
          {christianVerses.map((verse) => (
            <VerseItem
              key={verse.id}
              verse={verse}
              active={verse.id === selectedVerseId}
              onPress={() => setSelectedVerseId(verse.id)}
            />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function VerseItem({
  verse,
  active,
  onPress,
}: {
  verse: ChristianVerse;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.verseItem,
        active && { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.08)' },
      ]}
    >
      <View style={styles.verseItemText}>
        <ThemedText style={styles.verseItemTitle}>{verse.title}</ThemedText>
        <ThemedText style={styles.verseItemMeta}>
          {verse.reference} • {verse.category}
        </ThemedText>
      </View>
      <IconSymbol
        name={active ? 'checkmark.circle.fill' : 'chevron.right'}
        size={20}
        color="#3b82f6"
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
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.24)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  verseText: {
    fontSize: 20,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  actionRow: {
    gap: 10,
  },
  randomButton: {
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  randomButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  startButton: {
    borderRadius: 12,
  },
  list: {
    gap: 8,
  },
  verseItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  verseItemText: {
    flex: 1,
    gap: 2,
  },
  verseItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  verseItemMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
});
