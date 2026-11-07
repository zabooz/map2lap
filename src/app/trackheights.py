"""A change of the ground's height in the Editor, written into a built kn5 with no build: a height change is a raster of how far the
ground moves there. It is the draft's and the recipe's data (trackedits, trackcopy), and always applied to the track's source, so an
undo or a second Save never adds or subtracts anything.

The whole change at a place is the sum of the rasters over it, so the same place in x and z gets the same change in every mesh: the
seams of tiles and of ROAD, GRAVEL and GRASS stay shut, and a cut line in the ground keeps its step. What goes with the ground:
  - FOLLOW: what lies along it, each vertex by the change at its own place (a kerb, a fence, a wall: a vertical edge stays vertical),
    what lies right on it a little higher where its long edges would run under the hill (ON_THE_GROUND);
  - wires: from pole to pole, by the change of the two poles they hang on;
  - single objects move whole by the change at their place, by the object list or as billboards: a house or a bench doesn't bend;
  - STAY: water and the distant view keep their height;
  - IN_THE_WAY: a change that reaches a bridge deck, a tunnel floor or a railway is refused: those hold their own heights, and a railway's
    mesh holds its bridges' plates and piers too, which its name doesn't tell from a track on the ground (railways.py).
"""
import math

import numpy as np

from app import trackview
from track import kn5, objectlist

STEP = 2                    # m between a raster's points: the ground's lattice (GLOSSARY: cell); a cut line's vertices lie between them
MAX_POINTS = 1 << 20        # 2 km by 2 km at STEP: more than a change of a road's height needs, and a draft stays small
MAX_MM = 100_000            # a change of 100 m is no correction any more; no real road needs one
MAX_ID = 64
NOTHING_M = 1e-6            # what changes that cancel out leave of floats: far under what a kn5's float32 holds at a track's heights (30 µm at 400 m)
MIN_RADIUS_M, MAX_RADIUS_M = 2.0, 500.0     # a brush: a smaller ring can stand between the lattice's points and move little or nothing, a click must always tell; 500 m is a hillside
MIN_SOFT = 0.1              # its soft share of the radius: a brush with no soft edge would be a wall on the lattice
MAX_STROKE_POINTS = 5000    # (a stroke's samples; the view takes up to 20 a second where the ring moves, and sums them where it stands: minutes of it)
MAX_SAMPLE_S = 3600.0       # (an hour between two samples is no stroke)
HOLD_AFTER_S = 0.25         # a press this short is a click, one height: what a hand takes to let go, a double click's half
STAMP_SHARE = 0.25          # time along a way is spread on stamps this share of the radius apart: closer than a soft edge can show
MAX_PLACE_M = 1e7           # how far from a track's anchor a place can lie: a quarter of the earth, more than any track (NaN falls out here too)
STANDING_REACH_M = 50.0     # how far from an object's place its triangles are looked for: half the size of a big building; a bigger one only goes unnamed
MAX_LIFT_M = 0.5            # how far a road's line goes up over a bulge at most: it has no collision, but further up, at the far end of a long edge, it is seen to float
SAG_STEP_M = 0.25           # how often along an edge the bulge is looked at: a raster's top lies at its points, this finds it to within 2 cm on a slope of 15 %
LINE_EDGE_M = 50.0          # how far past a change a line's edge can carry a lift: the longest measured is 22.5 m (Auckland); a longer one could jump at a tile's border
FOLLOW = {"ground", "road", "walk", "walkcol", "tunnel", "guardrail", "guardrailcol", "gate", "fence", "fencecol", "wire"}
ON_THE_GROUND = {"road"}    # (lying on it by a few cm, with no collision: _sag. A kerb's visible mesh and its collision have edges of their own: lifted, they would part)
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


def _box(op):
    """A height change's extent [x0, z0, x1, z1]. Pure."""
    return [op["x"], op["z"], op["x"] + (op["nx"] - 1) * STEP, op["z"] + (op["nz"] - 1) * STEP]


def _groups(ops):
    """The height changes in groups, each small enough for one raster: [[its extent, its changes], ...]. So 300 strokes on a stretch are
    looked up once, not 300 times over every vertex (10 ms each on Heiligenblut, nearly 3 s for each click). Pure."""
    out = []
    for op in ops:
        box = _box(op)
        for group in out:
            x0, z0, x1, z1 = (min(group[0][0], box[0]), min(group[0][1], box[1]), max(group[0][2], box[2]), max(group[0][3], box[3]))
            if ((x1 - x0) // STEP + 1) * ((z1 - z0) // STEP + 1) <= MAX_POINTS:
                group[0] = [x0, z0, x1, z1]
                group[1].append(op)
                break
        else:
            out.append([box, [op]])
    return out


class Field:
    """The sum of height changes [problem's form, each without a problem]. Those of a group add up in whole mm: nothing is left of what
    cancels out."""

    def __init__(self, ops):
        self.boxes = np.array([_box(op) for op in ops], np.float64).reshape(-1, 4)
        self.rasters = []
        for (x0, z0, x1, z1), group in _groups(ops):
            mm = np.zeros(((z1 - z0) // STEP + 1, (x1 - x0) // STEP + 1), np.int64)
            for op in group:
                i, j = (op["x"] - x0) // STEP, (op["z"] - z0) // STEP
                mm[j:j + op["nz"], i:i + op["nx"]] += np.array(op["mm"], np.int64).reshape(op["nz"], op["nx"])
            d = mm / 1000.0
            along_z, along_x = np.gradient(d, STEP)
            self.rasters.append((x0, z0, d, along_x, along_z))

    def reaches(self, centre, radius):
        """Whether a sphere (centre x, y, z; a mesh's) can touch one of the changes. Pure."""
        b = self.boxes
        return bool(((b[:, 0] - radius <= centre[0]) & (centre[0] <= b[:, 2] + radius) & (b[:, 1] - radius <= centre[2]) & (centre[2] <= b[:, 3] + radius)).any())

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


def _sag(vertices, faces, field):
    """Per vertex how far up it has to go so its triangles' edges don't run under the ground: a road's line has its points far apart, on
    a hill the ground bulges up between them and the line would vanish in it. How far the change along an edge lies over the straight
    line between its ends, every SAG_STEP_M on it, at most MAX_LIFT_M. Pure."""
    edges = faces[:, [0, 1, 1, 2, 2, 0]].reshape(-1, 2)
    if not len(edges):
        return np.zeros(len(vertices))
    a, b = vertices["pos"][edges[:, 0]].astype(np.float64), vertices["pos"][edges[:, 1]].astype(np.float64)
    ends = field.at(a[:, 0], a[:, 2])[0], field.at(b[:, 0], b[:, 2])[0]
    places = np.maximum(np.ceil(np.hypot(b[:, 0] - a[:, 0], b[:, 2] - a[:, 2]) / SAG_STEP_M).astype(np.int64), 1)
    edge = np.repeat(np.arange(len(edges)), places)
    t = (np.arange(len(edge)) - np.repeat(np.r_[0, np.cumsum(places)[:-1]], places) + 0.5) / places[edge]
    at = a[edge] + (b[edge] - a[edge]) * t[:, None]
    over = np.zeros(len(edges))
    np.maximum.at(over, edge, field.at(at[:, 0], at[:, 2])[0] - (ends[0][edge] + (ends[1][edge] - ends[0][edge]) * t))
    lift = np.zeros(len(vertices))
    np.maximum.at(lift, edges[:, 0], np.minimum(over, MAX_LIFT_M))
    np.maximum.at(lift, edges[:, 1], np.minimum(over, MAX_LIFT_M))
    lift[lift < NOTHING_M] = 0.0
    return lift


def lines_reached(scan, field):
    """The numbers of the meshes of road lines a field can lift or lower: how far they go up isn't a sum over the changes, so one change
    can take back what another's bulge lifted, and a mesh it doesn't move by itself still looks different. Pure."""
    return [i for i, m in enumerate(scan["meshes"])
            if objectlist.kind_of(m["name"]) in ON_THE_GROUND and field.reaches(m["center"], m["radius"] + LINE_EDGE_M)]


def _line_lifts(mesh, scan, field):
    """{mesh number: per vertex how far up (_sag)}, of the road lines the field reaches, where any go up. Vertices at one place go together,
    also across meshes: a line goes on over a tile's border, and it mustn't jump there."""
    found = [(i, mesh(i)[0], _sag(*mesh(i), field)) for i in lines_reached(scan, field)]
    if not any(lift.any() for _i, _v, lift in found):
        return {}
    _same, place = np.unique(np.rint(np.concatenate([v["pos"] for _i, v, _lift in found]).astype(np.float64) * 1000).astype(np.int64),
                             axis=0, return_inverse=True)
    place = place.ravel()
    most = np.zeros(place.max() + 1)
    np.maximum.at(most, place, np.concatenate([lift for _i, _v, lift in found]))
    out, start = {}, 0
    for i, vertices, _lift in found:
        lift = most[place[start:start + len(vertices)]]
        start += len(vertices)
        if lift.any():
            out[i] = lift
    return out


def _object_changes(entry, field):
    """A tile's objects' change: each by the change at its place, what belongs to another by the other's, array. Pure."""
    at = np.array(entry["at"], np.float64).reshape(-1, 3)
    d = field.at(at[:, 0], at[:, 2])[0]
    root = np.arange(len(at))
    for k, parent in enumerate(entry["parents"]):
        while parent >= 0:
            root[k], parent = parent, entry["parents"][parent]
    return d[root]


def _whole_changes(mesh, scan, objects, field, reach):
    """{mesh number: per vertex the change of the object it belongs to}, for the single objects: by the list, and billboards told by
    their count. mesh(i): a mesh's vertices and triangles; reach(i): how far its sphere reaches."""
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
        if not any(field.reaches(scan["meshes"][i]["center"], reach(i)) for i, _ in tile_parts):
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


def _wire_changes(mesh, scan, objects, field, reach):
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
            if not (da or db or field.reaches(m["center"], reach(i))):
                continue
            vertices, faces = mesh(i)
            own = np.unique(faces[first:first + n])
            way = np.clip(((vertices["pos"][own, 0] - ax) * (bx - ax) + (vertices["pos"][own, 2] - az) * (bz - az)) / length2, 0, 1)
            out.setdefault(i, np.full(m["vertices"], np.nan))[own] = da + way * (db - da)
    return out


def moved(path, scan, objects, ops, under=None):
    """What the height changes ops move in the kn5 at path: a kn5.Moved. objects: its object list, with the places the objects stand at.
    under: a kn5.Moved the meshes start from (trackplace: objects placed anew), the result only what the changes move further. InTheWay
    if they reach a deck or a railway, or single objects there is no list of (a track built before lists: they would float)."""
    field = Field(ops)
    vertices, grow = {}, {}
    meshes = {}
    under = under or kn5.Moved({}, {}, {})

    def mesh(i):
        if i not in meshes:
            meshes[i] = _mesh(f, scan["meshes"][i])
            if i in under.vertices:
                meshes[i] = (under.vertices[i], meshes[i][1])
        return meshes[i]

    def reach(i):
        return scan["meshes"][i]["radius"] + under.grow.get(i, 0.0)

    with open(path, "rb") as f:
        wires, lifts = _wire_changes(mesh, scan, objects, field, reach), _line_lifts(mesh, scan, field)
        for i, m in enumerate(scan["meshes"]):
            kind = objectlist.kind_of(m["name"])
            if i not in wires and i not in lifts and not field.reaches(m["center"], reach(i)):
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
                if i in lifts:
                    changed["pos"][:, 1] = changed["pos"][:, 1].astype(np.float64) + lifts[i]
                    largest = (largest or 0.0) + float(lifts[i].max())
                if i in wires:
                    hung = ~np.isnan(wires[i])
                    changed["pos"][hung, 1] = mesh(i)[0]["pos"][hung, 1].astype(np.float64) + wires[i][hung]
                    largest = max(largest or 0.0, float(np.abs(wires[i][hung]).max()))
                if largest is not None:
                    grow[i], vertices[i] = largest, changed
        for i, d in _whole_changes(mesh, scan, objects, field, reach).items():
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


def _well_sampled(samples):
    """Whether what the page sent is a stroke: [[AC x, AC z, seconds since the one before], ...]. Pure."""
    return (isinstance(samples, list) and 0 < len(samples) <= MAX_STROKE_POINTS
            and all(isinstance(s, list) and len(s) == 3 and all(type(v) in (int, float) for v in s)
                    and abs(s[0]) <= MAX_PLACE_M and abs(s[1]) <= MAX_PLACE_M and 0 <= s[2] <= MAX_SAMPLE_S for s in samples))


def _stamps(at, spacing):
    """Where a stroke's time went: (x, z, seconds) for at, an array of samples [x, z, seconds on the way from the sample before]: past the
    first HOLD_AFTER_S, wherever the ring was then, one stamp each spacing of way, and one where it stood. By time and way alone, so how the
    samples cut them up makes no difference, and a long stroke costs by its way, not by the mouse's events. Pure."""
    before_hold, carried, gone = HOLD_AFTER_S, 0.0, 0.0
    for a, b in zip(at, at[1:]):
        seconds = b[2]
        if before_hold and before_hold >= seconds:
            before_hold -= seconds
            continue
        start = a[:2] + (b[:2] - a[:2]) * (before_hold / seconds if seconds else 0.0)
        seconds -= before_hold
        before_hold = 0.0
        way = float(np.hypot(*(b[:2] - start)))
        if not way:                 # (it stands here: what it did on the way before ends now)
            if gone:
                yield start[0], start[1], carried
                carried, gone = 0.0, 0.0
            carried += seconds
            continue
        if carried and not gone:    # (it stood here, and leaves)
            yield start[0], start[1], carried
            carried = 0.0
        done = 0.0
        while gone + way - done >= spacing:
            done += spacing - gone
            place = start + (b[:2] - start) * (done / way)
            yield place[0], place[1], carried + seconds * (spacing - gone) / way
            carried, gone = 0.0, 0.0
        gone += way - done
        carried += seconds * (way - done) / way
    if carried:
        yield at[-1, 0], at[-1, 1], carried


def brush(samples, radius, soft, mm, speed, id_):
    """The height change of a brush's stroke: where its ring was, and for how long ([[AC x, AC z, seconds on the way from the sample before], ...]).
    The press gives mm once, a click no more; held longer than HOLD_AFTER_S, speed mm a second more (the way mm goes) wherever the
    ring is then, by the time it was there: a place it left stops growing, and more events or a slower computer make no other hill. Down to 0 at
    radius; soft: the share of radius that goes down softly. Added up unrounded, so tiny shares aren't lost. ValueError for what can't be one. Pure."""
    if not _well_sampled(samples):
        raise ValueError("No stroke")
    if not (type(radius) in (int, float) and MIN_RADIUS_M <= radius <= MAX_RADIUS_M and type(soft) in (int, float) and MIN_SOFT <= soft <= 1):
        raise ValueError("No brush of that size")
    if not (type(mm) is int and 0 < abs(mm) <= MAX_MM):
        raise ValueError("No height")
    if not (type(speed) is int and 0 <= speed <= MAX_MM):
        raise ValueError("No speed")
    at = np.array(samples, np.float64)
    x0 = int(math.floor((at[:, 0].min() - radius) / STEP)) * STEP - STEP
    z0 = int(math.floor((at[:, 1].min() - radius) / STEP)) * STEP - STEP
    nx = (int(math.ceil((at[:, 0].max() + radius) / STEP)) * STEP + STEP - x0) // STEP + 1
    nz = (int(math.ceil((at[:, 1].max() + radius) / STEP)) * STEP + STEP - z0) // STEP + 1
    if nx * nz > MAX_POINTS:
        raise ValueError("This stroke is too long: make it in parts")
    total = np.zeros((nz, nx))

    def stamp(px, pz, amount):
        i0, i1 = int((px - radius - x0) // STEP), int((px + radius - x0) // STEP) + 2
        j0, j1 = int((pz - radius - z0) // STEP), int((pz + radius - z0) // STEP) + 2
        gx, gz = np.meshgrid(x0 + STEP * np.arange(i0, i1, dtype=np.float64), z0 + STEP * np.arange(j0, j1, dtype=np.float64))
        t = np.clip((np.hypot(gx - px, gz - pz) - radius * (1 - soft)) / (radius * soft), 0, 1)
        total[j0:j1, i0:i1] += amount * (1 - t * t * (3 - 2 * t))

    stamp(at[0, 0], at[0, 1], float(mm))
    if speed:
        for px, pz, seconds in _stamps(at, radius * STAMP_SHARE):
            if seconds:
                stamp(px, pz, math.copysign(speed, mm) * seconds)
    raster = np.clip(np.rint(total), -MAX_MM, MAX_MM).astype(np.int64)
    return {"id": id_, "x": x0, "z": z0, "nx": int(nx), "nz": int(nz), "mm": raster.ravel().tolist()}


def standing(path, scan, objects, op):
    """How many single objects stay where they stand though the height change op reaches some of their triangles: an object moves by
    the change at its own place, and that lies outside it. For a line on the page: a big house at the edge of a change."""
    field, count = Field([op]), 0
    x0, z0 = op["x"] - STANDING_REACH_M, op["z"] - STANDING_REACH_M
    x1, z1 = op["x"] + (op["nx"] - 1) * STEP + STANDING_REACH_M, op["z"] + (op["nz"] - 1) * STEP + STANDING_REACH_M
    meshes = {}
    with open(path, "rb") as f:
        for entry in objects.values():
            changes = _object_changes(entry, field)
            for k, at in enumerate(entry["at"]):
                if changes[k] or entry["parents"][k] >= 0 or not (x0 <= at[0] <= x1 and z0 <= at[2] <= z1):
                    continue
                for i, first, n in entry["faces"][k]:
                    if objectlist.kind_of(scan["meshes"][i]["name"]) in FOLLOW:
                        continue
                    if i not in meshes:
                        meshes[i] = _mesh(f, scan["meshes"][i])
                    if _reached(field, meshes[i][0], meshes[i][1][first:first + n]):
                        count += 1
                        break
    return count


def list_moved(objects, ops):
    """The object list with its objects' places as the height changes ops moved them. Pure."""
    if not ops:
        return objects
    field, out = Field(ops), {}
    for tile, entry in objects.items():
        d = _object_changes(entry, field)
        out[tile] = entry if not d.any() else {**entry, "at": [[a[0], round(a[1] + float(c), 3), a[2]] for a, c in zip(entry["at"], d)]}
    return out
