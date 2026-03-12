import { useMemo } from 'react';

import type { AltarExperienceMode } from '@/src/features/buddhistPrayer/types/buddhistPrayer';
import { getAltarSceneCapabilities } from '@/src/features/buddhistPrayer/utils/altarSceneAdapter';

export const useAltarExperience = (mode: AltarExperienceMode = 'immersive3D') => {
  return useMemo(() => {
    const capabilities = getAltarSceneCapabilities(mode);
    return {
      mode: capabilities.mode,
      isFallbackExperience: !capabilities.supportsNativePlaneDetection,
      supportsPinchPlacement: capabilities.supportsPinchPlacement,
      // TODO(native-ar): swap this adapter for ARKit/ARCore-backed implementation.
      hint: capabilities.supportsNativePlaneDetection
        ? 'Native AR plane detection is active.'
        : 'Immersive 3D altar mode active.',
    };
  }, [mode]);
};
