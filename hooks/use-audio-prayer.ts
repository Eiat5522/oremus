import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect } from 'react';

import { useBuddhistPrayerStore } from './use-buddhist-prayer-store';

const CHANT_AUDIO_SOURCE = require('@/assets/audio/namo_tassa.mp3');
const TEMPLE_BELL_AUDIO_SOURCE = require('@/assets/audio/temple_bell.mp3');

export function useAudioPrayer() {
  const { isAudioEnabled, templeBellEnabled } = useBuddhistPrayerStore();

  const chantAudio = useAudioPlayer(CHANT_AUDIO_SOURCE);
  const chantStatus = useAudioPlayerStatus(chantAudio);
  const templeBellPlayer = useAudioPlayer(TEMPLE_BELL_AUDIO_SOURCE);
  const templeBellStatus = useAudioPlayerStatus(templeBellPlayer);

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
      if (chantStatus.duration > 0 && chantStatus.currentTime >= chantStatus.duration) {
        await chantAudio.seekTo(0);
      }
      chantAudio.play();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not play chant audio:', error);
      }
    }
  }, [
    chantAudio,
    chantStatus.currentTime,
    chantStatus.duration,
    isAudioEnabled,
    isReleasedPlayerError,
  ]);

  const safePause = useCallback(() => {
    try {
      chantAudio.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not pause chant audio:', error);
      }
    }
  }, [chantAudio, isReleasedPlayerError]);

  const safePauseTempleBell = useCallback(() => {
    try {
      templeBellPlayer.pause();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not pause temple bell audio:', error);
      }
    }
  }, [isReleasedPlayerError, templeBellPlayer]);

  const playTempleBell = useCallback(async () => {
    if (!templeBellEnabled) return;

    try {
      if (templeBellStatus.currentTime > 0) {
        await templeBellPlayer.seekTo(0);
      }
      templeBellPlayer.play();
    } catch (error) {
      if (!isReleasedPlayerError(error)) {
        console.warn('Could not play temple bell audio:', error);
      }
    }
  }, [isReleasedPlayerError, templeBellEnabled, templeBellPlayer, templeBellStatus.currentTime]);

  // Respond to session audio toggle
  useEffect(() => {
    if (!isAudioEnabled && chantStatus.playing) {
      safePause();
    }
    if (!templeBellEnabled && templeBellStatus.playing) {
      safePauseTempleBell();
    }
  }, [
    isAudioEnabled,
    chantStatus.playing,
    safePause,
    safePauseTempleBell,
    templeBellEnabled,
    templeBellStatus.playing,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safePause();
      safePauseTempleBell();
    };
  }, [safePause, safePauseTempleBell]);

  return {
    isAudioAvailable: true,
    isPlaying: chantStatus.playing,
    play: safePlay,
    pause: safePause,
    playTempleBell,
    templeBellEnabled,
  };
}
