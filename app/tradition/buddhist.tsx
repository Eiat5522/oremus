import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const TRADITIONS: { id: BuddhistTradition; label: string }[] = [
  { id: 'tibetan', label: 'Tibetan' },
  { id: 'zen', label: 'Zen' },
  { id: 'theravada', label: 'Theravada' },
  { id: 'pure-land', label: 'Pure Land' },
];

export default function BuddhistScreen() {
  const router = useRouter();
  const [activeTradition, setActiveTradition] = useState<BuddhistTradition>('tibetan');
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>(
    buddhistPrayers.find((prayer) => prayer.tradition === 'tibetan')?.id ??
      buddhistPrayers[0]?.id ??
      '',
  );
  const [quickPlayPrayerId, setQuickPlayPrayerId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

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
  const quickPlayPrayer = useMemo(
    () => buddhistPrayers.find((prayer) => prayer.id === quickPlayPrayerId),
    [quickPlayPrayerId],
  );
  const player = useAudioPlayer(quickPlayPrayer?.audioAsset);
  const status = useAudioPlayerStatus(player);

  const isReleasedPlayerError = useCallback((error: unknown) => {
    return error instanceof Error && error.message.includes('NativeSharedObjectNotFoundException');
  }, []);

  const safePause = useCallback(() => {
    try {
      player.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.error('Failed to pause Buddhist mantra audio:', error);
      }
    }
  }, [isReleasedPlayerError, player]);

  useEffect(() => {
    return () => {
      safePause();
    };
  }, [safePause]);

  const toggleQuickPlay = useCallback(
    async (prayer: BuddhistPrayer) => {
      try {
        setAudioError(null);
        if (status.playing && quickPlayPrayerId === prayer.id) {
          safePause();
          return;
        }
        if (quickPlayPrayerId !== prayer.id) {
          await player.replace(prayer.audioAsset);
          setQuickPlayPrayerId(prayer.id);
        }
        if (status.duration > 0 && status.currentTime >= status.duration) {
          await player.seekTo(0);
        }
        player.play();
      } catch (error) {
        console.error('Failed to play Buddhist mantra audio:', error);
        setAudioError('Could not play mantra audio on this device.');
      }
    },
    [player, quickPlayPrayerId, safePause, status.currentTime, status.duration, status.playing],
  );

  const openFullPlayer = useCallback(
    (prayer: BuddhistPrayer) => {
      setSelectedPrayerId(prayer.id);
      safePause();
      setQuickPlayPrayerId(null);
      router.push({
        pathname: '/tradition/buddhist-session' as never,
        params: { prayerId: prayer.id },
      });
    },
    [router, safePause],
  );

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
              isQuickPlaying={status.playing && prayer.id === quickPlayPrayerId}
              onSelect={() => openFullPlayer(prayer)}
              onQuickPlay={() => void toggleQuickPlay(prayer)}
            />
          ))}
        </View>

        <Button title="Quick Play" size="lg" onPress={() => void toggleQuickPlay(selectedPrayer)} />
      </ScrollView>

      {quickPlayPrayer ? (
        <View style={styles.miniPlayer}>
          <Pressable style={styles.miniMeta} onPress={() => openFullPlayer(quickPlayPrayer)}>
            <ThemedText style={styles.miniTitle} numberOfLines={1}>
              {quickPlayPrayer.title}
            </ThemedText>
            <ThemedText style={styles.miniSubtitle} numberOfLines={1}>
              {status.playing ? 'Playing now' : 'Paused'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.miniAction}
            onPress={() => void toggleQuickPlay(quickPlayPrayer)}
            accessibilityRole="button"
            accessibilityLabel={status.playing ? 'Pause quick play' : 'Play quick play'}
          >
            <IconSymbol name={status.playing ? 'pause.fill' : 'play.fill'} size={22} color="#fff" />
          </Pressable>
        </View>
      ) : null}
      {audioError ? <ThemedText style={styles.errorText}>{audioError}</ThemedText> : null}
    </ThemedView>
  );
}

function PrayerItem({
  prayer,
  isActive,
  isQuickPlaying,
  onSelect,
  onQuickPlay,
}: {
  prayer: BuddhistPrayer;
  isActive: boolean;
  isQuickPlaying: boolean;
  onSelect: () => void;
  onQuickPlay: () => void;
}) {
  return (
    <View
      style={[
        styles.prayerItem,
        isActive && { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
      ]}
    >
      <Pressable onPress={onSelect} style={styles.prayerText}>
        <ThemedText style={styles.prayerTitle}>{prayer.title}</ThemedText>
        <ThemedText style={styles.prayerSubtitle}>{prayer.subtitle}</ThemedText>
      </Pressable>
      <Pressable
        onPress={onQuickPlay}
        style={styles.quickAction}
        accessibilityRole="button"
        accessibilityLabel={`Quick play ${prayer.title}`}
      >
        <IconSymbol
          name={isQuickPlaying ? 'pause.fill' : 'play.circle.fill'}
          size={22}
          color="#f59e0b"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 120,
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
  quickAction: {
    minHeight: 36,
    minWidth: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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
  miniPlayer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniMeta: {
    flex: 1,
    gap: 2,
  },
  miniTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  miniSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  miniAction: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
    color: '#dc2626',
    fontSize: 12,
    textAlign: 'center',
  },
});
