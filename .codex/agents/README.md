# Custom Codex Agents

This folder contains project-scoped Codex subagents for Oremus.

## Agents

- `main_orchestrator`
  - Coordinates implementation work and integrates results.

- `qa_reviewer`
  - Performs high-scrutiny production-readiness review.

- `ar_scene_architect`
  - Owns scene structure, composition, and shared AR abstractions.

- `ar_interaction_engineer`
  - Owns placement, gesture handling, alignment logic, and session transitions.

- `ar_animation_engineer`
  - Owns animation systems, loops, timing, and subtle immersive effects.

- `ar_assets_generator`
  - Owns Blender-related asset preparation, optimization, and GLB readiness.

## Notes

- Shared MCP config currently lives in `.codex/config.toml`.
- Blender MCP values are placeholders and should be updated for the local environment.
- Skills are referenced from `.agents/skills/`.
- Keep agent responsibilities narrow and avoid overlapping ownership.
