import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';

import type { ChristianAudioSettings } from '@/features/christian-prayer/constants';

const CHRISTIAN_AMBIENT_SOURCE = require('@/assets/sounds/jesus-prayer.wav');

export function useChristianAudioService(audioSettings: ChristianAudioSettings) {
  const player = useAudioPlayer(CHRISTIAN_AMBIENT_SOURCE);
  const status = useAudioPlayerStatus(player);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);

  const isReleasedPlayerError = useCallback((error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    return (
      error.message.includes('NativeSharedObjectNotFoundException') ||
      error.message.includes('Cannot use shared object that was already released') ||
      error.message.includes('cannot be cast to type expo.modules.audio.AudioPlayer')
    );
  }, []);

  const stopAmbient = useCallback(() => {
    try {
      player.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not pause Christian ambient audio:', error);
      }
    }
  }, [isReleasedPlayerError, player]);

  const playAmbient = useCallback(async () => {
    if (!audioSettings.ambientEnabled) {
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
        setAudioError(error instanceof Error ? error.message : 'Ambient audio is unavailable.');
      }
    }
  }, [
    audioSettings.ambientEnabled,
    isReleasedPlayerError,
    player,
    status.currentTime,
    status.duration,
  ]);

  const stopNarration = useCallback(async () => {
    try {
      await Speech.stop();
    } catch (error) {
      console.warn('Could not stop Christian narration:', error);
    } finally {
      setIsNarrating(false);
    }
  }, []);

  const replayNarration = useCallback(
    async (text: string) => {
      if (!audioSettings.narrationEnabled || text.trim().length === 0) {
        return;
      }

      await stopNarration();
      setIsNarrating(true);
      Speech.speak(text, {
        language: 'en-US',
        rate: 0.95,
        pitch: 1,
        onDone: () => setIsNarrating(false),
        onStopped: () => setIsNarrating(false),
        onError: () => {
          setAudioError('Narration is unavailable on this device.');
          setIsNarrating(false);
        },
      });
    },
    [audioSettings.narrationEnabled, stopNarration],
  );

  useEffect(() => {
    if (!audioSettings.ambientEnabled && status.playing) {
      stopAmbient();
    }
  }, [audioSettings.ambientEnabled, status.playing, stopAmbient]);

  useEffect(() => {
    return () => {
      stopAmbient();
      void stopNarration();
    };
  }, [stopAmbient, stopNarration]);

  return {
    audioError,
    isAmbientPlaying: status.playing,
    isNarrating,
    playAmbient,
    stopAmbient,
    replayNarration,
    stopNarration,
  };
}
