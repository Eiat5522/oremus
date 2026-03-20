# Christian Prayer Corner Model Pack

This folder holds the Christian `v1` `.glb` models referenced by `manifest.json`.

## Required files

| Asset ID | Filename | Source / Notes |
| --- | --- | --- |
| `cross_wood_a` | `cross_wood_a.glb` | Wooden cross |
| `bible_open_a` | `bible_open_a.glb` | Open bible |
| `candle_tall_a` | `candle_tall_a.glb` | Tall candle |
| `candle_short_a` | `candle_short_a.glb` | Short candle |
| `prayer_table_wood_a` | `prayer_table_wood_a.glb` | Wooden table base (replaces altar cloth) |

### Base model alternatives

The base surface uses a wooden prayer table instead of a cloth. Choose one of:

- `wooden_table._practical_model_-_yadira.glb`
- `long_wooden_drawer_tables_type_a.glb`

Rename your chosen file to `prayer_table_wood_a.glb` before placing it in this directory.

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
  prayer_table_wood_a: require('@/assets/models/christian/prayer_table_wood_a.glb'),
};
```
