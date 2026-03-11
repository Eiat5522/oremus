import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  buddhistPrayers,
  type BuddhistPrayer,
  type BuddhistTradition,
} from '@/constants/religious-content';
import { getTraditionUiTheme } from '@/constants/tradition-ui';

const TRADITIONS: { id: BuddhistTradition; label: string }[] = [
  { id: 'tibetan', label: 'Tibetan' },
  { id: 'zen', label: 'Zen' },
  { id: 'theravada', label: 'Theravada' },
  { id: 'pure-land', label: 'Pure Land' },
];

export default function BuddhistScreen() {
  const router = useRouter();
  const uiTheme = useMemo(() => getTraditionUiTheme('buddhism'), []);
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
    if (!(error instanceof Error)) {
      return false;
    }
    return (
      error.message.includes('NativeSharedObjectNotFoundException') ||
      error.message.includes('Cannot use shared object that was already released') ||
      error.message.includes('cannot be cast to type expo.modules.audio.AudioPlayer')
    );
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
      <View style={styles.container}>
        <ThemedText>No prayers available</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Buddhist Prayer',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#FFF1DB',
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
                  borderColor: 'rgba(255, 219, 170, 0.85)',
                  backgroundColor: 'rgba(128, 76, 43, 0.78)',
                },
              ]}
            >
              <ThemedText
                style={[styles.tabText, activeTradition === tradition.id && { color: '#FFF4E1' }]}
              >
                {tradition.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.heroCard}>
          <ThemedText style={styles.sectionLabel}>Selected mantra</ThemedText>
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

        <Pressable
          style={styles.quickPlayWrap}
          onPress={() => void toggleQuickPlay(selectedPrayer)}
        >
          <LinearGradient colors={uiTheme.ctaGradient} style={styles.quickPlayButton}>
            <IconSymbol
              name={status.playing ? 'pause.fill' : 'play.fill'}
              size={18}
              color="#FFFFFF"
            />
            <ThemedText style={styles.quickPlayText}>
              {status.playing ? 'Pause mantra' : 'Quick play mantra'}
            </ThemedText>
          </LinearGradient>
        </Pressable>
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
            <IconSymbol name={status.playing ? 'pause.fill' : 'play.fill'} size={20} color="#fff" />
          </Pressable>
        </View>
      ) : null}
      {audioError ? <ThemedText style={styles.errorText}>{audioError}</ThemedText> : null}
    </View>
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
        isActive && {
          borderColor: 'rgba(255, 219, 170, 0.7)',
          backgroundColor: 'rgba(118, 70, 39, 0.78)',
        },
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
          color="#FFD7A0"
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
    paddingTop: 102,
    paddingHorizontal: 16,
    paddingBottom: 124,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.35)',
    backgroundColor: 'rgba(88, 52, 29, 0.62)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: {
    color: '#F9E0C0',
    fontSize: 13,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.35)',
    backgroundColor: 'rgba(95, 55, 29, 0.72)',
    padding: 16,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#FFD8A8',
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFF4E1',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255, 227, 187, 0.92)',
    fontSize: 14,
  },
  list: {
    gap: 8,
  },
  prayerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.22)',
    borderRadius: 14,
    backgroundColor: 'rgba(73, 42, 23, 0.66)',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerTitle: {
    color: '#FFF3E0',
    fontSize: 16,
    fontWeight: '700',
  },
  prayerSubtitle: {
    color: 'rgba(255, 224, 188, 0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  quickPlayWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  quickPlayButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickPlayText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  miniPlayer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 26,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 184, 0.35)',
    backgroundColor: 'rgba(73, 42, 23, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniMeta: {
    flex: 1,
    gap: 2,
  },
  miniTitle: {
    color: '#FFF4E1',
    fontSize: 14,
    fontWeight: '700',
  },
  miniSubtitle: {
    color: 'rgba(255, 222, 180, 0.85)',
    fontSize: 12,
  },
  miniAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196, 120, 54, 0.85)',
  },
  errorText: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    textAlign: 'center',
    color: '#FECACA',
    fontSize: 13,
  },
});
