import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { buddhistPrayers } from '@/constants/religious-content';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BuddhistSessionScreen() {
  const router = useRouter();
  const { prayerId } = useLocalSearchParams<{ prayerId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const prayer = useMemo(() => {
    if (buddhistPrayers.length === 0) return null;
    if (!prayerId) return buddhistPrayers[0];
    return buddhistPrayers.find((entry) => entry.id === prayerId);
  }, [prayerId]);
  const hasInvalidPrayerId = Boolean(prayerId) && prayer === undefined;

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const maxOffset = useRef(0);
  const player = useAudioPlayer(prayer?.audioAsset);
  const status = useAudioPlayerStatus(player);

  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(26);
  const [audioError, setAudioError] = useState<string | null>(null);
  const safePause = useCallback(() => {
    try {
      player.pause();
    } catch (error) {
      console.warn('Audio pause skipped: player already released.', error);
    }
  }, [player]);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }
    const timer = setInterval(() => {
      const nextOffset = Math.min(scrollOffset.current + scrollSpeed, maxOffset.current);
      scrollRef.current?.scrollTo({ y: nextOffset, animated: true });
      scrollOffset.current = nextOffset;
      if (nextOffset >= maxOffset.current) {
        setAutoScroll(false);
      }
    }, 750);

    return () => clearInterval(timer);
  }, [autoScroll, scrollSpeed]);

  useEffect(() => {
    if (!prayer) {
      return;
    }

    setAudioError(null);
    const loadPrayerAudio = async () => {
      try {
        await player.replace(prayer.audioAsset);
      } catch (error) {
        console.error('Failed to load Buddhist prayer audio:', error);
        setAudioError('Could not load prayer audio on this device.');
      }
    };
    void loadPrayerAudio();
  }, [player, prayer]);

  useEffect(() => {
    return () => {
      safePause();
    };
  }, [safePause]);

  const togglePlay = async () => {
    if (!prayer) {
      return;
    }

    try {
      if (status.playing) {
        safePause();
        return;
      }
      if (status.duration > 0 && status.currentTime >= status.duration) {
        await player.seekTo(0);
      }
      player.play();
    } catch (error) {
      console.error('Failed to play Buddhist prayer audio:', error);
      setAudioError('Could not play prayer audio on this device.');
      return;
    }
  };

  if (prayer === null) {
    return (
      <ThemedView style={[styles.container, styles.stateContainer]}>
        <Stack.Screen options={{ title: 'Buddhist Session', headerShown: true }} />
        <View style={styles.stateCard}>
          <ThemedText style={styles.stateTitle}>Prayer content unavailable</ThemedText>
          <ThemedText style={styles.stateMessage}>
            No Buddhist prayers are configured right now. Please try again later.
          </ThemedText>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  if (hasInvalidPrayerId) {
    return (
      <ThemedView style={[styles.container, styles.stateContainer]}>
        <Stack.Screen options={{ title: 'Buddhist Session', headerShown: true }} />
        <View style={styles.stateCard}>
          <ThemedText style={styles.stateTitle}>Prayer not found</ThemedText>
          <ThemedText style={styles.stateMessage}>
            We couldn&apos;t find the requested Buddhist prayer. Please choose another prayer.
          </ThemedText>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Buddhist Session',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="arrow.left" size={20} color={theme.text} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={(event) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
        }}
        onContentSizeChange={(_, contentHeight) => {
          maxOffset.current = Math.max(contentHeight - 420, 0);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.heroCard}>
          <ThemedText style={styles.title}>{prayer.title}</ThemedText>
          <ThemedText style={styles.subtitle}>{prayer.subtitle}</ThemedText>
        </View>

        <View style={styles.controlsRow}>
          <Button
            title={autoScroll ? 'Pause Scroll' : 'Auto Scroll'}
            variant={autoScroll ? 'secondary' : 'primary'}
            onPress={() => setAutoScroll((value) => !value)}
            style={styles.controlButton}
          />
          <Pressable
            onPress={() => setScrollSpeed((value) => (value >= 40 ? 20 : value + 10))}
            style={styles.speedPill}
          >
            <IconSymbol name="timer" size={16} color="#92400e" />
            <ThemedText style={styles.speedPillText}>{scrollSpeed}px</ThemedText>
          </Pressable>
        </View>

        <View style={styles.audioCard}>
          <ThemedText style={styles.audioLabel}>Prayer audio</ThemedText>
          <Pressable onPress={togglePlay} style={styles.audioAction}>
            <IconSymbol
              name={status.playing ? 'pause.fill' : 'play.fill'}
              size={20}
              color="#ffffff"
            />
            <ThemedText style={styles.audioActionText}>
              {status.playing ? 'Pause audio' : 'Play audio'}
            </ThemedText>
          </Pressable>
          {audioError ? <ThemedText style={styles.errorText}>{audioError}</ThemedText> : null}
        </View>

        <View style={styles.textCard}>
          <ThemedText style={styles.textBody}>{prayer.text}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stateCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 16,
    gap: 12,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  stateMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
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
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    flex: 1,
  },
  speedPill: {
    minHeight: 46,
    minWidth: 90,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  speedPillText: {
    color: '#92400e',
    fontWeight: '700',
  },
  audioCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    padding: 14,
    gap: 10,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  audioAction: {
    borderRadius: 12,
    minHeight: 48,
    backgroundColor: '#b45309',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  audioActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    padding: 16,
  },
  textBody: {
    fontSize: 22,
    lineHeight: 34,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
});
