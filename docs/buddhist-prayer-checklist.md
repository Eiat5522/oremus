# Buddhist Prayer Checklist

## Phase 5: 3D Scene, Assets, and Motion

- The Buddhist prayer experience now stays aligned with the app's current `expo-audio` implementation instead of the older PRD `expo-av` wording.
- Placeholder production asset paths now exist under:
  - `assets/models/`
  - `assets/animations/`
  - `assets/audio/`
- The AR altar uses a composed 3D scene on supported native devices and falls back to a safe in-app altar illustration while loading or when WebGL is unavailable.
