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

  const stopAmbient = useCallback(() => {
    player.pause();
  }, [player]);

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
      setAudioError(error instanceof Error ? error.message : 'Ambient audio is unavailable.');
    }
  }, [audioSettings.ambientEnabled, player, status.currentTime, status.duration]);

  const stopNarration = useCallback(async () => {
    await Speech.stop();
    setIsNarrating(false);
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
