import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { christianVerses } from '@/constants/religious-content';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { recordPrayerCompletion } from '@/lib/focus-gate';

export default function ChristianSessionScreen() {
  const router = useRouter();
  const { verseId } = useLocalSearchParams<{ verseId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  useKeepAwake();

  const verse = useMemo(
    () =>
      christianVerses.find((entry) => entry.id === verseId) ??
      christianVerses[0] ?? { id: '', reference: '', text: '' },
    [verseId],
  );

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const maxOffset = useRef(0);
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }
    const timer = setInterval(() => {
      const nextOffset = Math.min(scrollOffset.current + 24, maxOffset.current);
      scrollRef.current?.scrollTo({ y: nextOffset, animated: true });
      scrollOffset.current = nextOffset;
      if (nextOffset >= maxOffset.current) {
        setAutoScroll(false);
      }
    }, 750);

    return () => clearInterval(timer);
  }, [autoScroll]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Prayer Session',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.headerIcon}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <IconSymbol name="arrow.left" size={20} color={theme.text} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onLayout={(event) => {
          layoutHeight.current = event.nativeEvent.layout.height;
          maxOffset.current = Math.max(contentHeight.current - layoutHeight.current, 0);
          const nextOffset = Math.min(scrollOffset.current, maxOffset.current);
          if (nextOffset !== scrollOffset.current) {
            scrollRef.current?.scrollTo({ y: nextOffset, animated: false });
            scrollOffset.current = nextOffset;
          }
        }}
        onScroll={(event) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
        }}
        onContentSizeChange={(_, height) => {
          contentHeight.current = height;
          maxOffset.current = Math.max(contentHeight.current - layoutHeight.current, 0);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.focusCard}>
          <ThemedText style={styles.focusTitle}>Focus Mode</ThemedText>
          <ThemedText style={styles.focusBody}>
            Screen sleep is disabled for this session. To reduce interruptions, enable Do Not
            Disturb in device settings.
          </ThemedText>
          <Button
            title="Open Device Settings"
            variant="secondary"
            onPress={() => {
              void Linking.openSettings();
            }}
          />
        </View>

        <View style={styles.verseCard}>
          <ThemedText style={styles.reference}>{verse.reference}</ThemedText>
          <ThemedText style={styles.verseText}>&quot;{verse.text}&quot;</ThemedText>
        </View>

        <View style={styles.controls}>
          <Button
            title={autoScroll ? 'Pause Scroll' : 'Start Scroll'}
            onPress={() => setAutoScroll((value) => !value)}
          />
          <Button
            title="Restart"
            variant="secondary"
            onPress={() => {
              scrollRef.current?.scrollTo({ y: 0, animated: true });
              scrollOffset.current = 0;
              setAutoScroll(false);
            }}
          />
          <Button
            title="Complete Prayer Session"
            onPress={() => {
              void recordPrayerCompletion();
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </ThemedView>
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
    paddingBottom: 44,
    gap: 14,
  },
  focusCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    padding: 16,
    gap: 10,
  },
  focusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  focusBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 10,
  },
  reference: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  verseText: {
    fontSize: 24,
    lineHeight: 36,
    fontStyle: 'italic',
  },
  controls: {
    gap: 10,
  },
});
