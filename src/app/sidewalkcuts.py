"""Clicked sidewalk or guardrail sections, including collision and objects standing on a sidewalk."""
import re

import numpy as np

from app import roadsurfaces, trackview
from track import editorinfo, kn5, objectlist

WALK = re.compile(r"(?:nocol_walk_|1KERB_walkcol_)")
VISIBLE = re.compile(r"nocol_walk_")
GUARDRAIL = re.compile(r"(?:nocol_guardrail_|1WALL_guardrailcol_)")
RAIL_MESH = editorinfo.GUARDRAIL_MESH
FACES_PER_PART = editorinfo.GUARDRAIL_FACES_PER_PART
ON_TOP = {"street furniture", "road sign", "town sign", "power pole", "fence", "tree", "bush"}


def _ranges(numbers):
    """Compact consecutive triangle numbers. Pure."""
    if not len(numbers):
        return []
    starts = np.r_[0, np.flatnonzero(np.diff(numbers) != 1) + 1, len(numbers)]
    return [[int(numbers[a]), int(b - a)] for a, b in zip(starts, starts[1:])]


def _connected(pieces, seed, reach=.12):
    """Pieces touching the clicked source piece through a spatial index. Pure."""
    cells, occupied = {}, []
    for i, piece in enumerate(pieces):
        own = {tuple(cell) for cell in np.floor(piece[2] / reach).astype(np.int64)}
        occupied.append(own)
        for cell in own:
            cells.setdefault(cell, []).append(i)
    chosen, pending = {seed}, [seed]
    while pending:
        for x, y, z in occupied[pending.pop()]:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    for dz in (-1, 0, 1):
                        for other in cells.get((x + dx, y + dy, z + dz), ()):
                            if other not in chosen:
                                chosen.add(other)
                                pending.append(other)
    return [pieces[i] for i in sorted(chosen)]


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
    # Visible and collision profiles meet at their curb and slab vertices, even across material seams.
    return _connected(pieces, next(i for i, piece in enumerate(pieces) if piece is seed))


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


def _guardrail_faces(path, scan, parts):
    """Source-row guardrail faces, pairing the chosen visible modules with their collision faces."""
    visible = next((name for _i, name, _p, _f, _t in parts if name.startswith('nocol_guardrail_')), None)
    match = RAIL_MESH.fullmatch(visible or '')
    if match is None:
        return None
    key = f'{match[2]}_{match[3]}'
    try:
        rows, spans, _roads = editorinfo.guardrail_modules(path, key)
    except (OSError, KeyError, ValueError):
        return None
    if len(spans) != len(rows) or any(len(span) != 4 for span in spans):
        return None
    meshes = {}
    for i, mesh in enumerate(scan['meshes']):
        found = RAIL_MESH.fullmatch(mesh['name'])
        if found and f'{found[2]}_{found[3]}' == key:
            meshes[(found[1], int(found[4] or 0))] = (i, mesh['indices'] // 3)
    for kind, start in (('nocol_guardrail', 0), ('1WALL_guardrailcol', 2)):
        total = sum(count for (name, _part), (_i, count) in meshes.items() if name == kind)
        expected = max((span[start] + span[start + 1] for span in spans), default=0)
        if total != expected * (2 if kind == '1WALL_guardrailcol' else 1):
            return None
    selected = set()
    for _i, name, _p, faces, _t in parts:
        found = RAIL_MESH.fullmatch(name)
        if found and found[1] == 'nocol_guardrail':
            selected.update(faces + int(found[4] or 0) * FACES_PER_PART)
    rows_hit = [span for span in spans if any(face in selected for face in range(span[0], span[0] + span[1]))]
    if not rows_hit:
        return None
    by_mesh = {}
    for kind, first in (('nocol_guardrail', 0), ('1WALL_guardrailcol', 2)):
        for (name, part), (i, count) in meshes.items():
            if name != kind:
                continue
            offset = part * FACES_PER_PART
            raw_count = count // 2 if kind == '1WALL_guardrailcol' else count
            for span in rows_hit:
                a, n = span[first:first + 2]
                lo, hi = max(a, offset), min(a + n, offset + raw_count)
                if lo < hi:
                    by_mesh.setdefault(i, []).extend(range(lo - offset, hi - offset))
                    if kind == '1WALL_guardrailcol':
                        # obj_to_kn5 appends the reversed wall faces after the whole OBJ part.
                        by_mesh[i].extend(range(lo - offset + raw_count, hi - offset + raw_count))
    return by_mesh


def selection(path, scan, point, name):
    """Selected sidewalk triangles and listed objects whose feet stand on its slab."""
    parts = _parts(path, scan, point, name)
    by_mesh = {}
    paired = _guardrail_faces(path, scan, parts) if name.startswith('nocol_guardrail_') else None
    if paired is not None:
        by_mesh = {(i, scan['meshes'][i]['name']): faces for i, faces in paired.items()}
    else:
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
