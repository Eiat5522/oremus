import type { AltarExperienceMode } from './types';

export const DEFAULT_ALTAR_EXPERIENCE_MODE: AltarExperienceMode = 'immersive3D';

export const ALTAR_EXPERIENCE_OPTIONS: Record<
  AltarExperienceMode,
  {
    title: string;
    subtitle: string;
    description: string;
    actionLabel: string;
    requiresCamera: boolean;
  }
> = {
  immersive3D: {
    title: 'Immersive 3D',
    subtitle: 'Fallback scene',
    description:
      'Uses a fully rendered altar scene without the camera so the practice still feels sacred on every device.',
    actionLabel: 'Continue in Immersive 3D',
    requiresCamera: false,
  },
  nativeARReady: {
    title: 'Native AR',
    subtitle: 'Camera surface detection',
    description:
      'Uses the device camera to detect a real surface in your space and places the altar on it.',
    actionLabel: 'Continue with Camera Scan',
    requiresCamera: true,
  },
};
