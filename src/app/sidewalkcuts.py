"""Clicked sidewalk or guardrail sections, including collision and objects standing on a sidewalk."""
import re

import numpy as np

from app import roadsurfaces, trackview
from track import kn5, objectlist

WALK = re.compile(r"(?:nocol_walk_|1KERB_walkcol_)")
VISIBLE = re.compile(r"nocol_walk_")
GUARDRAIL = re.compile(r"(?:nocol_guardrail_|1WALL_guardrailcol_)")
ON_TOP = {"street furniture", "road sign", "town sign", "power pole", "fence", "tree", "bush"}


def _ranges(numbers):
    """Compact consecutive triangle numbers. Pure."""
    if not len(numbers):
        return []
    starts = np.r_[0, np.flatnonzero(np.diff(numbers) != 1) + 1, len(numbers)]
    return [[int(numbers[a]), int(b - a)] for a, b in zip(starts, starts[1:])]


def _near(points, others, reach):
    """Whether any point is close in x/z and height to another piece. Pure."""
    if not len(points) or not len(others):
        return False
    # A 10 cm spatial hash avoids quadratic distance checks on long urban sidewalks.
    grid = np.floor(others / reach).astype(np.int64)
    cells = {tuple(row) for row in grid}
    for row in np.floor(points / reach).astype(np.int64):
        if any((row[0] + dx, row[1] + dy, row[2] + dz) in cells
               for dx in (-1, 0, 1) for dy in (-1, 0, 1) for dz in (-1, 0, 1)):
            return True
    return False


def _parts(path, scan, point, name):
    """The clicked visible component and all touching sidewalk materials in its tile."""
    if not isinstance(point, list) or len(point) != 3 or not all(type(x) in (int, float) and np.isfinite(x) for x in point):
        raise ValueError("Click a sidewalk")
    if not isinstance(name, str) or not (VISIBLE.match(name) or name.startswith("nocol_guardrail_")):
        raise ValueError("Click a sidewalk or guardrail")
    guardrail = name.startswith("nocol_guardrail_")
    clicked_mesh = next((m for m in scan["meshes"] if m["name"] == name), None)
    if clicked_mesh is None:
        raise ValueError("This section is not in the source track")
    def tile(mesh):
        # Render and collision names may carry different 65,535-vertex split suffixes.
        return int(np.floor(mesh["center"][0] / 256)), int(np.floor(-mesh["center"][2] / 256))
    wanted_tile = tile(clicked_mesh)
    candidates = [(i, m) for i, m in enumerate(scan["meshes"])
                  if (GUARDRAIL if guardrail else WALK).match(m["name"])
                  and tile(m) == wanted_tile]
    if not candidates or not any(m["name"] == name for _, m in candidates):
        raise ValueError("This sidewalk is not in the source track")
    pieces = []
    with open(path, "rb") as source:
        for i, mesh in candidates:
            vertices, faces = kn5.mesh_arrays(source, mesh)
            points = vertices["pos"].astype(np.float64)
            for component in roadsurfaces._components(points, faces):
                selected = np.isin(faces[:, 0], component)
                pieces.append((i, mesh["name"], points[component], np.flatnonzero(selected), points[faces[selected]]))
    clicked = [p for p in pieces if p[1] == name]
    def distance(piece):
        x, y, z = point
        for tri in piece[4]:
            if (tri[:, 0].min() - .01 <= x <= tri[:, 0].max() + .01
                    and tri[:, 2].min() - .01 <= z <= tri[:, 2].max() + .01):
                inside, height = roadsurfaces._plane(tri, x, z)
                if inside and abs(y - height) < .5:
                    return 0.
        return float(np.linalg.norm(piece[2] - point, axis=1).min())
    seed = min(clicked, key=distance)
    if distance(seed) > 3:
        raise ValueError("Click nearer the sidewalk")
    chosen = {id(seed)}
    connected = [seed]
    # Visible and collision profiles meet at their curb and slab vertices, even across material seams.
    for _ in range(len(pieces)):
        more = [p for p in pieces if id(p) not in chosen and any(_near(p[2], old[2], .12) for old in connected)]
        if not more:
            break
        chosen.update(id(p) for p in more)
        connected.extend(more)
    return connected


def _on_slab(at, triangles):
    """Whether an object's foot stands on a chosen sidewalk top triangle. Pure."""
    x, y, z = at
    for tri in triangles:
        if not (tri[:, 0].min() - .05 <= x <= tri[:, 0].max() + .05
                and tri[:, 2].min() - .05 <= z <= tri[:, 2].max() + .05):
            continue
        inside, height = roadsurfaces._plane(tri, x, z)
        if inside and abs(y - height) <= .6:
            return True
    return False


def selection(path, scan, point, name):
    """Selected sidewalk triangles and listed objects whose feet stand on its slab."""
    parts = _parts(path, scan, point, name)
    by_mesh = {}
    for i, mesh_name, _vertices, faces, _triangles in parts:
        by_mesh.setdefault((i, mesh_name), []).extend(faces.tolist())
    meshes, cuts = [], []
    for (i, mesh_name), faces in sorted(by_mesh.items()):
        numbers = np.unique(faces)
        meshes.append({"mesh": i, "faces": numbers.tolist()})
        cuts.append({"mesh": mesh_name, "faces": _ranges(numbers)})
    slab_parts = [tri for _i, mesh_name, _v, _f, tri in parts
                  if VISIBLE.match(mesh_name) and "_kerbstone_" not in mesh_name]
    slabs = np.concatenate(slab_parts, axis=0) if slab_parts else np.empty((0, 3, 3))
    objects = []
    if len(slabs):
        low, high = slabs[:, :, [0, 2]].min(axis=(0, 1)) - .1, slabs[:, :, [0, 2]].max(axis=(0, 1)) + .1
        def in_bounds(at):
            return low[0] <= at[0] <= high[0] and low[1] <= at[2] <= high[1]
        for tile, entry in trackview.list_of(path).items():
            for number, (kind, at) in enumerate(zip(entry["kinds"], entry["at"])):
                if kind in ON_TOP and entry["parents"][number] < 0 and in_bounds(at) and _on_slab(at, slabs):
                    objects.append({"id": f"{tile}#{number}", "position": at})
        trees = trackview.treefx_of(path) or {}
        for number, tree in trees.get("trees", {}).items():
            if in_bounds(tree["pos"]) and _on_slab(tree["pos"], slabs):
                objects.append({"id": f"trees#{number}", "position": tree["pos"]})
    return {"material": "guardrail" if name.startswith("nocol_guardrail_") else "sidewalk",
            "truncated": False, "tiles": [], "meshes": meshes}, cuts, objects
