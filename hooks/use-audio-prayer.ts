import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect } from 'react';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

// Audio asset placeholders - replace with actual files when available
// TODO: Add actual audio assets to assets/sounds/
const AUDIO_ASSETS = {
  // These will fall back gracefully if files don't exist
  namo_tassa: null as number | null, // require('@/assets/sounds/namo_tassa.mp3')
  temple_bell: null as number | null, // require('@/assets/sounds/temple_bell.mp3')
} as const;

void AUDIO_ASSETS;

export function useAudioPrayer() {
  const { isAudioEnabled, templeBellEnabled } = useBuddhistPrayerStore();

  // Using existing metta.wav as placeholder for chant audio
  const chantAudio = useAudioPlayer(require('@/assets/sounds/metta.wav'));
  const chantStatus = useAudioPlayerStatus(chantAudio);

  const isReleasedPlayerError = useCallback((error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    return (
      error.message.includes('NativeSharedObjectNotFoundException') ||
      error.message.includes('Cannot use shared object that was already released') ||
      error.message.includes('cannot be cast to type expo.modules.audio.AudioPlayer')
    );
  }, []);

  const safePlay = useCallback(async () => {
    if (!isAudioEnabled) return;
    try {
      chantAudio.play();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not play chant audio:', error);
      }
    }
  }, [chantAudio, isAudioEnabled, isReleasedPlayerError]);

  const safePause = useCallback(() => {
    try {
      chantAudio.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not pause chant audio:', error);
      }
    }
  }, [chantAudio, isReleasedPlayerError]);

  // Respond to session audio toggle
  useEffect(() => {
    if (!isAudioEnabled && chantStatus.playing) {
      safePause();
    }
  }, [isAudioEnabled, chantStatus.playing, safePause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safePause();
    };
  }, [safePause]);

  return {
    isAudioAvailable: true, // Could check if audio file loaded successfully
    isPlaying: chantStatus.playing,
    play: safePlay,
    pause: safePause,
    // TODO: Add temple bell one-shot play when templeBellEnabled
    templeBellEnabled,
  };
}
