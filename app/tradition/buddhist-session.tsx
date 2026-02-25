import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { buddhistPrayers } from '@/constants/religious-content';
import { recordPrayerCompletion } from '@/lib/focus-gate';

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (safeSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function BuddhistSessionScreen() {
  const router = useRouter();
  const { prayerId } = useLocalSearchParams<{ prayerId?: string }>();

  const prayer = useMemo(() => {
    if (buddhistPrayers.length === 0) return null;
    if (!prayerId) return buddhistPrayers[0];
    return buddhistPrayers.find((entry) => entry.id === prayerId);
  }, [prayerId]);
  const hasInvalidPrayerId = Boolean(prayerId) && prayer === undefined;
  const player = useAudioPlayer(prayer?.audioAsset);
  const status = useAudioPlayerStatus(player);
  const [audioError, setAudioError] = useState<string | null>(null);

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
        console.error('Failed to pause Buddhist prayer audio:', error);
      }
    }
  }, [isReleasedPlayerError, player]);

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
        setAudioError('Could not load mantra audio on this device.');
      }
    };
    void loadPrayerAudio();
  }, [player, prayer]);

  useEffect(() => {
    return () => {
      safePause();
    };
  }, [safePause]);

  const togglePlay = useCallback(async () => {
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
      console.error('Failed to toggle Buddhist prayer audio:', error);
      setAudioError('Could not play mantra audio on this device.');
    }
  }, [player, prayer, safePause, status.currentTime, status.duration, status.playing]);

  const seekBy = useCallback(
    async (delta: number) => {
      try {
        const nextTime = Math.max(0, Math.min(status.currentTime + delta, status.duration || 0));
        await player.seekTo(nextTime);
      } catch (error) {
        console.error('Failed to seek Buddhist prayer audio:', error);
      }
    },
    [player, status.currentTime, status.duration],
  );

  if (prayer === null) {
    return (
      <ThemedView style={[styles.container, styles.stateContainer]}>
        <Stack.Screen options={{ title: 'Buddhist Player', headerShown: true }} />
        <View style={styles.stateCard}>
          <ThemedText style={styles.stateTitle}>Mantra unavailable</ThemedText>
          <ThemedText style={styles.stateMessage}>
            No Buddhist chants are configured yet. Please try again later.
          </ThemedText>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  if (hasInvalidPrayerId) {
    return (
      <ThemedView style={[styles.container, styles.stateContainer]}>
        <Stack.Screen options={{ title: 'Buddhist Player', headerShown: true }} />
        <View style={styles.stateCard}>
          <ThemedText style={styles.stateTitle}>Mantra not found</ThemedText>
          <ThemedText style={styles.stateMessage}>
            We couldn&apos;t find that mantra. Please choose another one.
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
          title: prayer.title,
          headerShown: true,
        }}
      />

      <View style={styles.content}>
        <Image source={prayer.albumArt} style={styles.coverArt} resizeMode="contain" />
        <View style={styles.meta}>
          <ThemedText style={styles.title}>{prayer.title}</ThemedText>
          <ThemedText style={styles.subtitle}>{prayer.subtitle}</ThemedText>
        </View>

        <View style={styles.progressRow}>
          <ThemedText style={styles.timeText}>{formatTime(status.currentTime)}</ThemedText>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.timeText}>{formatTime(status.duration)}</ThemedText>
        </View>

        <View style={styles.transportRow}>
          <Pressable style={styles.smallControl} onPress={() => void seekBy(-15)}>
            <ThemedText style={styles.smallControlText}>-15</ThemedText>
          </Pressable>
          <Pressable style={styles.playControl} onPress={() => void togglePlay()}>
            <IconSymbol name={status.playing ? 'pause.fill' : 'play.fill'} size={34} color="#fff" />
          </Pressable>
          <Pressable style={styles.smallControl} onPress={() => void seekBy(15)}>
            <ThemedText style={styles.smallControlText}>+15</ThemedText>
          </Pressable>
        </View>

        <Button
          title="Complete Prayer Session"
          onPress={() => {
            void recordPrayerCompletion();
            router.back();
          }}
        />

        {audioError ? <ThemedText style={styles.errorText}>{audioError}</ThemedText> : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a1105',
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
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  coverArt: {
    width: '100%',
    maxHeight: 320,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  meta: {
    marginTop: 18,
    gap: 4,
  },
  title: {
    color: '#fff7ed',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#fed7aa',
    fontSize: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  timeText: {
    color: '#ffedd5',
    fontSize: 12,
    minWidth: 38,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 237, 213, 0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fb923c',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 18,
  },
  smallControl: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 237, 213, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallControlText: {
    color: '#fff7ed',
    fontWeight: '800',
  },
  playControl: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
});
