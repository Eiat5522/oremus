# Christian Prayer Corner Model Pack

This folder holds the Christian `v1` `.glb` models referenced by `manifest.json`.

## Required files

- `cross_wood_a.glb`
- `bible_open_a.glb`
- `candle_tall_a.glb`
- `candle_short_a.glb`
- `corner_base_cloth_a.glb`

## Before export

- Apply transforms (`location`, `rotation`, `scale`)
- Recalculate normals after boolean/mirror edits
- Remove n-gons
- Remove non-manifold geometry

## Integration

After adding each `.glb`, register it in:

`features/christian-prayer/constants/model-modules.ts`

Example:

```ts
export const CHRISTIAN_PRAYER_CORNER_MODEL_MODULES = {
  cross_wood_a: require('@/assets/models/christian/cross_wood_a.glb'),
  bible_open_a: require('@/assets/models/christian/bible_open_a.glb'),
  candle_tall_a: require('@/assets/models/christian/candle_tall_a.glb'),
  candle_short_a: require('@/assets/models/christian/candle_short_a.glb'),
  corner_base_cloth_a: require('@/assets/models/christian/corner_base_cloth_a.glb'),
};
```
