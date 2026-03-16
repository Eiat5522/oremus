import { useMemo } from 'react';

import { useChristianAudioService } from '@/features/christian-prayer/services/christianAudio.service';

export function useChristianPrayerAudio(isEnabled: boolean) {
  const audioSettings = useMemo(
    () => ({
      ambientEnabled: isEnabled,
      hapticsEnabled: false,
      narrationEnabled: false,
      reflectionPromptsEnabled: false,
    }),
    [isEnabled],
  );
  const service = useChristianAudioService(audioSettings);

  return {
    audioError: service.audioError,
    isPlaying: service.isAmbientPlaying,
    pause: service.stopAmbient,
    play: service.playAmbient,
  };
}
