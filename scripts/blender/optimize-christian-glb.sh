#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: scripts/blender/optimize-christian-glb.sh <input.glb> <output.glb>"
  exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

npx @gltf-transform/cli optimize "$INPUT_FILE" "$OUTPUT_FILE" \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024

echo "Optimized: $INPUT_FILE -> $OUTPUT_FILE"
