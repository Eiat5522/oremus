import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

const CHRISTIAN_AMBIENT_SOURCE = require('@/assets/sounds/jesus-prayer.wav');

export function useChristianPrayerAudio(isEnabled: boolean) {
  const player = useAudioPlayer(CHRISTIAN_AMBIENT_SOURCE);
  const status = useAudioPlayerStatus(player);
  const [audioError, setAudioError] = useState<string | null>(null);

  const isReleasedPlayerError = useCallback((error: unknown): boolean => {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.message.includes('NativeSharedObjectNotFoundException') ||
      error.message.includes('Cannot use shared object that was already released') ||
      error.message.includes('cannot be cast to type expo.modules.audio.AudioPlayer')
    );
  }, []);

  const pause = useCallback(() => {
    try {
      player.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not pause Christian ambient audio:', error);
      }
    }
  }, [isReleasedPlayerError, player]);

  const play = useCallback(async () => {
    if (!isEnabled) {
      return;
    }

    try {
      player.loop = true;
      if (status.duration > 0 && status.currentTime >= status.duration) {
        await player.seekTo(0);
      }
      player.play();
      setAudioError(null);
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not play Christian ambient audio:', error);
      }
      setAudioError('Ambient prayer audio is unavailable on this device.');
    }
  }, [isEnabled, isReleasedPlayerError, player, status.currentTime, status.duration]);

  useEffect(() => {
    if (!isEnabled && status.playing) {
      pause();
    }
  }, [isEnabled, pause, status.playing]);

  useEffect(() => {
    return () => {
      pause();
    };
  }, [pause]);

  return {
    audioError,
    isPlaying: status.playing,
    play,
    pause,
  };
}
