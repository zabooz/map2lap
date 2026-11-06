"""What the Editor's memory limit counts for a track: its meshes by kind, its textures, and how far each limit reaches when the view
stands at the start. From the kn5 in the AC folder (the source of a saved track); no server, nothing loaded in a browser.

    .venv\\Scripts\\python.exe tools\\editor_memory.py <track>
    .venv\\Scripts\\python.exe tools\\editor_memory.py <track> --limits 4,8,16,32

The counting is ui/src/editor/view.ts's as it stands (FLOATS_PER_VERTEX, COPIES): keep the two the same. Nearest first, a texture when
the first mesh of its material comes, the first mesh over the limit ends it. Not counted: the ground's ray structures, decoded images
beyond their stored size, the browser's own overhead: a real view stops somewhat earlier, and where depends on the camera.
"""
import argparse
import collections
import math
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src"))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import settings, trackview  # noqa: E402

VERTEX_BYTES = 44       # (view.ts: FLOATS_PER_VERTEX, 4 bytes each)
COPIES = 2              # (view.ts)
GB = 1024 ** 3


def mesh_bytes(mesh):
    """What one mesh takes once. Pure."""
    return mesh["vertices"] * VERTEX_BYTES + 4 + mesh["indices"] * 2


def kind_of(name):
    """A mesh's kind: its name up to its second part, without numbers (1WALL_bld_fac_00_1_0_0: 1WALL_bld). Pure."""
    return re.sub(r"[\d-]+$", "", "_".join(name.split("_")[:2])).rstrip("_")


def by_kind(meshes):
    """{kind: (meshes, bytes once)}, the largest first. Pure."""
    count, size = collections.Counter(), collections.Counter()
    for m in meshes:
        count[kind_of(m["name"])] += 1
        size[kind_of(m["name"])] += mesh_bytes(m)
    return {k: (count[k], s) for k, s in size.most_common()}


def distance(mesh, at):
    """How far from the point at a mesh begins. Pure."""
    return max(0.0, math.dist(mesh["center"], at) - mesh["radius"])


def reach(meshes, materials, textures, at, limit_bytes):
    """How many meshes a limit admits with the view at the point at, as view.ts's load does, and how far off the last one begins:
    (meshes, m). Pure."""
    used, loaded, last, seen = 0, 0, 0.0, set()
    for m in sorted(meshes, key=lambda m: distance(m, at)):
        used += COPIES * mesh_bytes(m)
        if used > limit_bytes:
            break
        texture = materials[m["material"]].get("texture")
        room = COPIES * textures.get(texture, 0)
        if texture not in seen and used + room <= limit_bytes:     # (one too large stays out, the mesh is drawn plain)
            seen.add(texture)
            used += room
        loaded += 1
        last = distance(m, at)
    return loaded, last


def report(data, limits):
    """The tool's lines for a track's index (trackview.index). Pure."""
    meshes, sizes = data["meshes"], {t["name"]: t["size"] for t in data["textures"]}
    once = sum(map(mesh_bytes, meshes))
    stored = sum(sizes.values())
    lines = [f"Meshes:   {len(meshes)}, {once / GB:.2f} GB once, {COPIES * once / GB:.2f} GB counted",
             f"Textures: {len(sizes)}, {stored / GB:.2f} GB once, {COPIES * stored / GB:.2f} GB counted",
             f"All:      {COPIES * (once + stored) / GB:.2f} GB counted", "", "kind                         meshes       GB once"]
    for kind, (count, size) in list(by_kind(meshes).items())[:15]:
        lines.append(f"{kind:28} {count:6} {size / GB:13.3f}")
    if data["start"]:
        lines += ["", "limit      meshes  of all  last one from the start"]
        for gb in limits:
            loaded, last = reach(meshes, data["materials"], sizes, data["start"]["pos"], gb * GB)
            lines.append(f"{gb:3} GB {loaded:10} {100 * loaded / max(1, len(meshes)):6.0f} % {last / 1000:9.1f} km")
    return lines


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("track")
    a.add_argument("--limits", default="4,8,16,32", help="GB, separated by commas")
    args = a.parse_args()
    print("\n".join(report(trackview.index(settings.ac_path(), args.track), [float(g) for g in args.limits.split(",")])))


if __name__ == "__main__":
    main()
