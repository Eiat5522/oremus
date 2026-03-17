import bpy
import bmesh
import json
import os
import sys

REQUIRED_OBJECT_NAMES = [
    "cross_wood_a",
    "bible_open_a",
    "candle_tall_a",
    "candle_short_a",
    "corner_base_cloth_a",
]


def set_active(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def mesh_has_ngons(obj):
    if obj.type != "MESH":
        return False
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    has_ngons = any(len(face.verts) > 4 for face in bm.faces)
    bm.free()
    return has_ngons


def mesh_has_non_manifold(obj):
    if obj.type != "MESH":
        return False
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    has_non_manifold = any(not edge.is_manifold for edge in bm.edges) or any(
        not vert.is_manifold for vert in bm.verts
    )
    bm.free()
    return has_non_manifold


def apply_transforms_and_recalculate_normals(obj):
    bpy.ops.object.select_all(action="DESELECT")
    set_active(obj)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if obj.type == "MESH":
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode="OBJECT")


def validate_scene():
    report = {"missing_objects": [], "invalid_meshes": []}
    scene_objects = {obj.name: obj for obj in bpy.context.scene.objects}

    for name in REQUIRED_OBJECT_NAMES:
        if name not in scene_objects:
            report["missing_objects"].append(name)

    for name in REQUIRED_OBJECT_NAMES:
        obj = scene_objects.get(name)
        if not obj or obj.type != "MESH":
            continue

        issues = []
        if mesh_has_ngons(obj):
            issues.append("contains n-gons")
        if mesh_has_non_manifold(obj):
            issues.append("contains non-manifold geometry")

        if issues:
            report["invalid_meshes"].append({"name": name, "issues": issues})

    return report


def export_object(obj_name, output_dir):
    obj = bpy.context.scene.objects.get(obj_name)
    if not obj:
        return None

    apply_transforms_and_recalculate_normals(obj)
    bpy.ops.object.select_all(action="DESELECT")
    set_active(obj)
    export_path = os.path.join(output_dir, f"{obj_name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=False,
    )
    return export_path


def main():
    if "--" not in sys.argv:
        raise RuntimeError("Expected output directory after '--'")

    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) < 1:
        raise RuntimeError("Usage: blender --background file.blend --python christian_prayer_corner_export.py -- /abs/output/dir")

    output_dir = os.path.abspath(args[0])
    os.makedirs(output_dir, exist_ok=True)

    report = validate_scene()
    if report["missing_objects"] or report["invalid_meshes"]:
        print(json.dumps(report, indent=2))
        raise RuntimeError("Scene validation failed. Fix missing objects or mesh issues before export.")

    exported_files = []
    for obj_name in REQUIRED_OBJECT_NAMES:
        export_path = export_object(obj_name, output_dir)
        if export_path:
            exported_files.append(export_path)

    print(json.dumps({"exported_files": exported_files}, indent=2))


if __name__ == "__main__":
    main()
