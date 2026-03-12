import type { AltarExperienceMode } from '@/src/features/buddhistPrayer/types/buddhistPrayer';

export interface AltarSceneCapabilities {
  supportsNativePlaneDetection: boolean;
  supportsPinchPlacement: boolean;
  mode: AltarExperienceMode;
}

export const getAltarSceneCapabilities = (
  mode: AltarExperienceMode = 'immersive3D',
): AltarSceneCapabilities => {
  if (mode === 'nativeARReady') {
    return {
      supportsNativePlaneDetection: false,
      supportsPinchPlacement: false,
      mode,
    };
  }

  return {
    supportsNativePlaneDetection: false,
    supportsPinchPlacement: false,
    mode: 'immersive3D',
  };
};
