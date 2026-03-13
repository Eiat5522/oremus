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
    title: 'Native AR Ready',
    subtitle: 'Camera placement flow',
    description:
      'Keeps the camera-based room scanning journey and marks the exact swap points for a future native AR session manager.',
    actionLabel: 'Continue with Camera Scan',
    requiresCamera: true,
  },
};

export const ALTAR_NATIVE_SWAP_POINTS = [
  'hooks/use-altar-experience.ts beginScan(): replace the simulated detection with a native plane-detection session.',
  'app/tradition/buddhist-prayer/ar-scan.tsx: replace the permission + guidance surface with a live camera preview/native AR view.',
  'components/buddhist-prayer/buddhist-altar-3d.tsx: keep as the immersive fallback scene when native AR is unavailable.',
] as const;
