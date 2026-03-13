# Buddhist Prayer AR Flow

## Altar experience modes

The Buddhist prayer flow now supports two explicit experience modes:

- `immersive3D`: default fallback that renders a self-contained `BuddhistAltar3D` scene without using the camera.
- `nativeARReady`: keeps the camera-led scanning journey and reserves the native integration points for a future AR session manager.

The mode metadata and default are defined in:

- `constants/buddhist-prayer/altar-experience.ts`

## Native AR swap points

When the native AR implementation is ready, replace the following seams:

1. `hooks/use-altar-experience.ts` `beginScan()` plane-detection simulation
2. `app/tradition/buddhist-prayer/ar-scan.tsx` permission + scan surface with live camera/native AR view
3. Keep `components/buddhist-prayer/buddhist-altar-3d.tsx` as the immersive fallback for unsupported devices

## Placement semantics

- Surface detection happens before the placement-adjustment step.
- `Confirm Placement` is the moment that marks the altar as placed.
- `Reset placement` clears the transform and returns the user to scanning/selecting a new placement anchor.
- The selected altar transform remains available through placement, preparation, chant, merit, and completion until the whole session is reset.
