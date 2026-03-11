import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { christianVerses, type ChristianVerse } from '@/constants/religious-content';
import { getTraditionUiTheme } from '@/constants/tradition-ui';

export default function ChristianScreen() {
  const router = useRouter();
  const uiTheme = useMemo(() => getTraditionUiTheme('christianity'), []);
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Religious Verses',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#FFF0DC',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="arrow.left" size={20} color="#FFF0DC" />
            </Pressable>
          ),
        }}
      />

      <Image
        source={uiTheme.backgroundImage}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient colors={uiTheme.overlayGradient} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.heroCard}>
          <ThemedText style={styles.sectionLabel}>Selected Verse</ThemedText>
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
            <IconSymbol name="sparkles" size={16} color="#F7D7A8" />
            <ThemedText style={styles.randomButtonText}>Pick random verse</ThemedText>
          </Pressable>

          <Pressable
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
            style={[styles.startButtonWrap, !selectedVerse && styles.disabled]}
          >
            <LinearGradient colors={uiTheme.ctaGradient} style={styles.startButton}>
              <ThemedText style={styles.startButtonText}>Start Session</ThemedText>
            </LinearGradient>
          </Pressable>
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
    </View>
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
        active && {
          borderColor: 'rgba(251, 191, 36, 0.6)',
          backgroundColor: 'rgba(88, 52, 32, 0.76)',
        },
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
        color="#F7D7A8"
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
    paddingTop: 106,
    paddingHorizontal: 16,
    paddingBottom: 42,
    gap: 16,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.35)',
    backgroundColor: 'rgba(70, 41, 25, 0.72)',
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#F6D7A8',
    fontWeight: '800',
  },
  verseText: {
    color: '#FFF3E1',
    fontSize: 21,
    lineHeight: 31,
    fontStyle: 'italic',
    fontFamily: Fonts.serif,
  },
  reference: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F7D7A8',
  },
  actionRow: {
    gap: 10,
  },
  randomButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.35)',
    backgroundColor: 'rgba(80, 47, 29, 0.68)',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  randomButtonText: {
    color: '#FFF0DC',
    fontWeight: '700',
  },
  startButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  list: {
    gap: 8,
  },
  verseItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.22)',
    backgroundColor: 'rgba(52, 30, 18, 0.66)',
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
    color: '#FFF3E1',
    fontSize: 16,
    fontWeight: '700',
  },
  verseItemMeta: {
    color: 'rgba(255, 224, 188, 0.85)',
    fontSize: 13,
  },
});
