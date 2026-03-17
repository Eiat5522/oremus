# Christian AR Blender MCP Workflow

This workflow produces production-ready Christian Prayer Corner `.glb` assets for:

- `cross_wood_a`
- `bible_open_a`
- `candle_tall_a`
- `candle_short_a`
- `corner_base_cloth_a`

## 1) Blender MCP health check

1. `get_scene_info`
2. `execute_python` with `print("ok")`
3. `screenshot`

## 2) Scene requirements

- Object names must match required IDs exactly.
- Apply transforms before export.
- Recalculate normals before export.
- No n-gons.
- No non-manifold geometry.

## 3) Headless export

```bash
blender --background /path/to/christian_scene.blend \
  --python /home/eiat/projects/oremus-expo/scripts/blender/christian_prayer_corner_export.py \
  -- /home/eiat/projects/oremus-expo/assets/models/christian
```

## 4) Optimize each exported GLB

```bash
/home/eiat/projects/oremus-expo/scripts/blender/optimize-christian-glb.sh \
  /home/eiat/projects/oremus-expo/assets/models/christian/cross_wood_a.glb \
  /home/eiat/projects/oremus-expo/assets/models/christian/cross_wood_a.opt.glb
```

Repeat for each Christian asset. Replace original files when visually verified.

## 5) Register modules in app

Update:

- `features/christian-prayer/constants/model-modules.ts`

Example:

```ts
cross_wood_a: require('@/assets/models/christian/cross_wood_a.glb'),
```

## 6) Validate in app

- `3D assets` debug chip should report ready assets and activate 3D stage when core models are present.
- Missing candle models should still render procedural candles in the 3D stage.
- If core models fail to load, viewport falls back safely.
