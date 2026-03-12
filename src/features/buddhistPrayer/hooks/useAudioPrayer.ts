import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback } from 'react';

const BELL = require('../assets/audio/temple_bell.mp3');
const NAMO = require('../assets/audio/namo_tassa.mp3');

export const useAudioPrayer = (enabled: boolean) => {
  const chantPlayer = useAudioPlayer(NAMO);
  const bellPlayer = useAudioPlayer(BELL);
  const chantStatus = useAudioPlayerStatus(chantPlayer);

  const playChant = useCallback(async () => {
    if (!enabled) {
      return;
    }
    chantPlayer.play();
  }, [chantPlayer, enabled]);

  const playBell = useCallback(async () => {
    if (!enabled) {
      return;
    }
    bellPlayer.play();
  }, [bellPlayer, enabled]);

  const pauseAll = useCallback(() => {
    chantPlayer.pause();
    bellPlayer.pause();
  }, [bellPlayer, chantPlayer]);

  return {
    isChantPlaying: chantStatus.playing,
    playChant,
    playBell,
    pauseAll,
  };
};
