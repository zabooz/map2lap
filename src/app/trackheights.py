"""A change of the ground's height in the Editor, written into a built kn5 with no build: a height change is a raster of how far the
ground moves there. It is the draft's and the recipe's data (trackedits, trackcopy), and always applied to the track's source, so an
undo or a second Save never adds or subtracts anything.

The whole change at a place is the sum of the rasters over it, so the same place in x and z gets the same change in every mesh: the
seams of tiles and of ROAD, GRAVEL and GRASS stay shut, and a cut line in the ground keeps its step. What goes with the ground:
  - FOLLOW: what lies along it, each vertex by the change at its own place (a kerb, a fence, a wall: a vertical edge stays vertical);
  - wires: from pole to pole, by the change of the two poles they hang on;
  - single objects move whole by the change at their place, by the object list or as billboards: a house or a bench doesn't bend;
  - STAY: water and the distant view keep their height;
  - IN_THE_WAY: a change that reaches a bridge deck, a tunnel floor or a railway is refused: those hold their own heights, and a railway's
    mesh holds its bridges' plates and piers too, which its name doesn't tell from a track on the ground (railways.py).
"""
from collections import namedtuple

import numpy as np

from app import trackview
from track import kn5, objectlist

STEP = 2                    # m between a raster's points: the ground's lattice (GLOSSARY: cell); a cut line's vertices lie between them
MAX_POINTS = 1 << 20        # 2 km by 2 km at STEP: more than a change of a road's height needs, and a draft stays small
MAX_MM = 100_000            # a change of 100 m is no correction any more; no real road needs one
MAX_ID = 64
NOTHING_M = 1e-6            # what changes that cancel out leave of floats: far under what a kn5's float32 holds at a track's heights (30 µm at 400 m)
FOLLOW = {"ground", "road", "walk", "walkcol", "tunnel", "guardrail", "guardrailcol", "gate", "fence", "fencecol", "wire"}
STAY = {"water", "foam", "far"}
IN_THE_WAY = {"deck", "rail", "railcol"}


class InTheWay(Exception):
    """A change can't be applied, for the reason it says."""


def problem(op):
    """What is wrong with a height change as the draft holds it: {"id", "x", "z" (AC, of its first point, on STEP's lattice), "nx", "nz"
    (its points along x and z), "mm": its change per point in whole mm, row by row along z}; None if nothing. Its edge must be 0: it
    has nothing to end softly on outside. Pure."""
    if not (isinstance(op, dict) and isinstance(op.get("id"), str) and 0 < len(op["id"]) <= MAX_ID):
        return "no id"
    x, z, nx, nz, mm = (op.get(k) for k in ("x", "z", "nx", "nz", "mm"))
    if not all(type(v) is int for v in (x, z, nx, nz)) or x % STEP or z % STEP:
        return "not on the lattice"
    if nx < 3 or nz < 3 or nx * nz > MAX_POINTS or not isinstance(mm, list) or len(mm) != nx * nz:
        return "no raster of its size"
    if not all(type(v) is int and abs(v) <= MAX_MM for v in mm):
        return "no heights"
    raster = np.array(mm, np.int64).reshape(nz, nx)
    if raster[0].any() or raster[-1].any() or raster[:, 0].any() or raster[:, -1].any():
        return "its edge moves"
    return None


def problems(ops):
    """What is wrong with a list of height changes, each and together (each id once); None if nothing. Pure."""
    if not isinstance(ops, list):
        return "no list"
    wrong = next(filter(None, map(problem, ops)), None)
    if wrong:
        return wrong
    return "a height change twice" if len({op["id"] for op in ops}) != len(ops) else None


class Field:
    """The sum of height changes [problem's form, each without a problem]."""

    def __init__(self, ops):
        self.rasters = []
        for op in ops:
            d = np.array(op["mm"], np.float64).reshape(op["nz"], op["nx"]) / 1000.0
            along_z, along_x = np.gradient(d, STEP)
            self.rasters.append((op["x"], op["z"], d, along_x, along_z))

    def reaches(self, centre, radius):
        """Whether a sphere (centre x, y, z; a mesh's) can touch a raster. Pure."""
        return any(x - radius <= centre[0] <= x + (d.shape[1] - 1) * STEP + radius and z - radius <= centre[2] <= z + (d.shape[0] - 1) * STEP + radius
                   for x, z, d, _ax, _az in self.rasters)

    def at(self, x, z):
        """(the change, its slope along x, along z) at those places, arrays: linear between a raster's points, 0 outside. The slope is
        the raster's own, smoothed between its points: for the light on the ground, which a slope that jumps at every point would break
        into facets. Pure."""
        x, z = np.asarray(x, np.float64), np.asarray(z, np.float64)
        d, along_x, along_z = np.zeros(x.shape), np.zeros(x.shape), np.zeros(x.shape)
        for x0, z0, raster, ax, az in self.rasters:
            i, j = (x - x0) / STEP, (z - z0) / STEP
            inside = (i >= 0) & (i < raster.shape[1] - 1) & (j >= 0) & (j < raster.shape[0] - 1)
            i0, j0 = np.floor(i[inside]).astype(np.int64), np.floor(j[inside]).astype(np.int64)
            fi, fj = i[inside] - i0, j[inside] - j0
            for out, values in ((d, raster), (along_x, ax), (along_z, az)):
                out[inside] += ((1 - fj) * ((1 - fi) * values[j0, i0] + fi * values[j0, i0 + 1])
                                + fj * ((1 - fi) * values[j0 + 1, i0] + fi * values[j0 + 1, i0 + 1]))
        for out in (d, along_x, along_z):
            out[np.abs(out) < NOTHING_M] = 0.0
        return d, along_x, along_z


def _mesh(f, m):
    """A mesh's vertices (a copy to change) and triangles."""
    f.seek(m["offset"])
    vertices = np.frombuffer(f.read(m["vertices"] * kn5.VERTEX.itemsize), dtype=kn5.VERTEX).copy()
    f.read(4)
    return vertices, np.frombuffer(f.read(m["indices"] * 2), dtype="<u2").reshape(-1, 3)


def _reached(field, vertices, faces):
    """Whether a raster's point that moves lies under or beside a triangle, its corners far off or not: a bridge's plate can span a
    change without a vertex in it. By each triangle's box on the lattice, so a slanting one can count too early, never too late. Pure."""
    if not len(faces):
        return False
    corners = vertices["pos"][faces][:, :, [0, 2]]
    low, high = np.floor(corners.min(axis=1) / STEP).astype(np.int64), np.ceil(corners.max(axis=1) / STEP).astype(np.int64)
    first = low.min(axis=0)
    size = high.max(axis=0) - first + 1
    grid_x, grid_z = np.meshgrid((first[0] + np.arange(size[0])) * STEP, (first[1] + np.arange(size[1])) * STEP)
    moving = field.at(grid_x, grid_z)[0] != 0
    if not moving.any():
        return False
    area = np.zeros((size[1] + 1, size[0] + 1), np.int64)
    area[1:, 1:] = moving.cumsum(axis=0).cumsum(axis=1)
    a, b = low - first, high - first + 1
    return bool((area[b[:, 1], b[:, 0]] - area[a[:, 1], b[:, 0]] - area[b[:, 1], a[:, 0]] + area[a[:, 1], a[:, 0]]).any())


def _followed(vertices, field):
    """vertices moved each by the change at its place, in place; its largest change, None if the field leaves them as they are. Normals
    and tangents as the shear turns them, also where the change is 0 on a slope: at a seam they keep whatever differences they had.
    Pure but for vertices."""
    d, along_x, along_z = field.at(vertices["pos"][:, 0], vertices["pos"][:, 2])
    touched = (d != 0) | (along_x != 0) | (along_z != 0)
    if not touched.any():
        return None
    n, t = vertices["normal"].astype(np.float64), vertices["tangent"].astype(np.float64)
    normal = np.c_[n[:, 0] - along_x * n[:, 1], n[:, 1], n[:, 2] - along_z * n[:, 1]]
    tangent = np.c_[t[:, 0], t[:, 1] + along_x * t[:, 0] + along_z * t[:, 2], t[:, 2]]
    normal /= np.maximum(np.linalg.norm(normal, axis=1, keepdims=True), 1e-12)
    tangent /= np.maximum(np.linalg.norm(tangent, axis=1, keepdims=True), 1e-12)
    vertices["pos"][:, 1] = vertices["pos"][:, 1].astype(np.float64) + d
    vertices["normal"][touched], vertices["tangent"][touched] = normal[touched], tangent[touched]
    return float(np.abs(d).max())


def _object_changes(entry, field):
    """A tile's objects' change: each by the change at its place, what belongs to another by the other's, array. Pure."""
    at = np.array(entry["at"], np.float64).reshape(-1, 3)
    d = field.at(at[:, 0], at[:, 2])[0]
    root = np.arange(len(at))
    for k, parent in enumerate(entry["parents"]):
        while parent >= 0:
            root[k], parent = parent, entry["parents"][parent]
    return d[root]


def _whole_changes(mesh, scan, objects, field):
    """{mesh number: per vertex the change of the object it belongs to}, for the single objects: by the list, and billboards told by
    their count. mesh(i): a mesh's vertices and triangles."""
    out = {}

    def give(i, faces, changes):
        given = out.setdefault(i, np.zeros(scan["meshes"][i]["vertices"]))
        given[faces.ravel()] = np.repeat(changes, 3)

    for entry in objects.values():
        for k, d in enumerate(_object_changes(entry, field)):
            if d:
                for i, first, n in entry["faces"][k]:
                    if objectlist.kind_of(scan["meshes"][i]["name"]) not in FOLLOW:
                        give(i, mesh(i)[1][first:first + n], np.full(n, d))
    parts = {}
    for i, first in trackview._first_faces(scan["meshes"], scan["materials"]).items():
        parts.setdefault(trackview._base(scan["meshes"][i]["name"]), []).append((i, first))
    for tile_parts in parts.values():
        if not any(field.reaches(scan["meshes"][i]["center"], scan["meshes"][i]["radius"]) for i, _ in tile_parts):
            continue
        numbers, xs, zs = [], [], []
        for i, first in tile_parts:         # (a billboard can lie across two parts of a mesh: it moves as one all the same)
            vertices, faces = mesh(i)
            numbers.append((first + np.arange(len(faces))) // trackview.FACES_PER_BILLBOARD)
            xs.append(vertices["pos"][faces, 0].mean(axis=1))
            zs.append(vertices["pos"][faces, 2].mean(axis=1))
        number = np.concatenate(numbers)
        count = np.maximum(np.bincount(number), 1)
        d = field.at(np.bincount(number, np.concatenate(xs)) / count, np.bincount(number, np.concatenate(zs)) / count)[0]
        for (i, _first), own in zip(tile_parts, numbers):
            give(i, mesh(i)[1], d[own])
    return out


def _wire_changes(mesh, scan, objects, field):
    """{mesh number: per vertex the change of a wire hanging on two listed poles, NaN for none}: from the one pole's change to the
    other's by the way along the span, so it stays on their cross-arms, which move whole. A pole's wire ends beside it: by the change at
    its own place it would part from the arm, on a slope of 15 % by 15 cm per metre of arm."""
    ends = {}
    for tile, entry in objects.items():
        changes = _object_changes(entry, field)
        for number, spans in entry.get("with", {}).items():
            for span in spans:
                at = entry["at"][int(number)]
                ends.setdefault(span, []).append((at[0], at[2], float(changes[int(number)])))
    out = {}
    for span, on in ends.items():
        if len(on) != 2:
            continue
        tile, number = span.rsplit("#", 1)
        (ax, az, da), (bx, bz, db) = on
        length2 = max((bx - ax) ** 2 + (bz - az) ** 2, 1e-6)
        for i, first, n in objects[tile]["faces"][int(number)]:
            m = scan["meshes"][i]
            if not (da or db or field.reaches(m["center"], m["radius"])):
                continue
            vertices, faces = mesh(i)
            own = np.unique(faces[first:first + n])
            way = np.clip(((vertices["pos"][own, 0] - ax) * (bx - ax) + (vertices["pos"][own, 2] - az) * (bz - az)) / length2, 0, 1)
            out.setdefault(i, np.full(m["vertices"], np.nan))[own] = da + way * (db - da)
    return out


def moved(path, scan, objects, ops):
    """What the height changes ops move in the kn5 at path: a kn5.Moved. objects: its object list. InTheWay if they reach a deck or a
    railway, or single objects there is no list of (a track built before lists: they would float)."""
    field = Field(ops)
    vertices, grow = {}, {}
    meshes = {}

    def mesh(i):
        if i not in meshes:
            meshes[i] = _mesh(f, scan["meshes"][i])
        return meshes[i]

    with open(path, "rb") as f:
        wires = _wire_changes(mesh, scan, objects, field)
        for i, m in enumerate(scan["meshes"]):
            kind = objectlist.kind_of(m["name"])
            if i not in wires and not field.reaches(m["center"], m["radius"]):
                continue
            if kind in IN_THE_WAY:
                if _reached(field, *mesh(i)):
                    raise InTheWay("A bridge, a tunnel or a railway lies in the change: it holds its own heights")
            elif kind in objectlist.LISTED - FOLLOW and not objects:
                if _reached(field, *mesh(i)):
                    raise InTheWay("This track has no list of its objects: build it again to change its heights")
            elif kind in FOLLOW:
                changed = mesh(i)[0].copy()
                largest = _followed(changed, field)
                if i in wires:
                    hung = ~np.isnan(wires[i])
                    changed["pos"][hung, 1] = mesh(i)[0]["pos"][hung, 1].astype(np.float64) + wires[i][hung]
                    largest = max(largest or 0.0, float(np.abs(wires[i][hung]).max()))
                if largest is not None:
                    grow[i], vertices[i] = largest, changed
        for i, d in _whole_changes(mesh, scan, objects, field).items():
            if d.any():
                changed = mesh(i)[0].copy()
                changed["pos"][:, 1] = changed["pos"][:, 1].astype(np.float64) + d
                grow[i], vertices[i] = float(np.abs(d).max()), changed
    points = {}
    for name, matrix in scan["points"].items():
        d = float(field.at(matrix[12], matrix[14])[0])
        if d:
            points[name] = (*matrix[:13], matrix[13] + d, *matrix[14:])
    return kn5.Moved(vertices, grow, points)


def list_moved(objects, ops):
    """The object list with its objects' places as the height changes ops moved them. Pure."""
    if not ops:
        return objects
    field, out = Field(ops), {}
    for tile, entry in objects.items():
        d = _object_changes(entry, field)
        out[tile] = entry if not d.any() else {**entry, "at": [[a[0], round(a[1] + float(c), 3), a[2]] for a, c in zip(entry["at"], d)]}
    return out
