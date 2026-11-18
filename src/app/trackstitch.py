"""Editor Stitch road: one mapped carriageway between two clicks rebuilt as a single continuous driving surface.

Prototype. A and B lie on one unbranched mapped road (`builtroad.pick`), on the ground, a bridge deck or a tunnel floor.
The stitch keeps the existing surface exactly at A and B across the whole width, follows the road's own deck where at
least half a row lies on it, and blends the rest with a cubic per lane column, so a skewed deck end or a deck-to-ground
step becomes one smooth surface over the full width instead of a seam.

Inside the stitched strip the old driving surfaces are cut out by their triangles: the road's own deck collision
(`1ROAD_deck_*` by face owner), the asphalt skin and markings over it (`nocol_road_asphalt_`, `nocol_road_paint_`,
`nocol_road_edge_dirt_`) and the graded ground road (`1ROAD_ground_*`), each only near the new surface's height, so the
road under a bridge and terrain over a tunnel stay. Triangles crossing the strip edge are split; their outside parts are
re-emitted with their own material and physics prefix. The new surface is one visible `1ROAD_` mesh in the build's
asphalt material; the markings found just outside A and B are continued across it.

The draft keeps one descriptor per stitch ("stitches"): its rows, heights and markings. Save and the Editor preview
rebuild the meshes from the retained source with `extend`; the cut triangles travel as `wall_hidden` ranges.
"""
import hashlib
import json
import math

import numpy as np

from app import builtroad, roadsurfaces, trackband, trackkerbs
from track import kn5, obj_to_kn5

COLUMNS = 9             # lane columns across the road: a crown or banking between two columns is drawn as a plane
SAMPLE_M = 1.0          # rows along the road: half the 2 m terrain lattice
MAX_LENGTH_M = 1000.0
APPROACH_M = 2.0        # grade at A and B is read this far outside the stitch
# The road's own old surfaces lie up to a few centimetres under the visible road (ground roads 4 cm, decks 1 cm); a
# skewed deck end or a step can put them some decimetres off. Further below is the ground under a bridge, further above
# the terrain over a tunnel: both stay.
NEAR_BELOW_M = 0.6
NEAR_ABOVE_M = 1.0
DECK_ROW_SHARE = 0.5    # a row at least this much on the road's own deck follows the deck
BLEND_M = 8.0           # a ground row this far from any deck row keeps its own height and cross slope
# Markings are read this far outside A and B: one motorway dash and gap (6 + 12 m) shows, while a deck/ground change
# further out, where the build paints the edge lines elsewhere (A2: deck ±3.6 m, ground ±2.75 m), stays out of it.
MARK_WINDOW_M = 15.0
MARK_SAME_M = 1.2       # two lines this close at one end are one line painted twice (deck and ground): the one nearest the cut stays
MARK_MATCH = 0.15       # lines at A and B pair when their places across differ by less than this share of the width
MARK_LIFT_M = 0.012     # markings over the new surface (roadmesh LIFT["mark"] plus a little against z-fighting)
UV_ALONG_M = 11.0       # the build's asphalt texture repeats about every 11 m along the road (nocol_road_asphalt)
MIN_WIDTH_M, MAX_WIDTH_M = 2.0, 40.0
CHUNK_ROWS = 2000       # 2000 rows x 9 columns: 18k vertices, below AC's 65,535 per mesh
CUT = ("1ROAD_deck", "nocol_road_asphalt_", "nocol_road_paint_", "nocol_road_edge_dirt_", "1ROAD_ground_", "1WALL_deck_con")
# A tunnel's own concrete floor top lies flush with the new surface; slab tops under a bridge deck lie decimetres lower
# and parapets higher, so only own upward concrete faces this close are cut.
FLOOR_FLUSH_M = 0.05
SKIRT_M = 0.3           # the render-only apron under the new surface's edge: deeper than any slit at its edge
MAX_STITCHES = 100


# ---------------------------------------------------------------- the road line

def _untunnelled(net):
    """net with tunnel segments renamed, so the kerb spline (which refuses tunnels) still pins their ends. Pure."""
    return {**net, "segments": [{**e, "structure": "tunnel_floor"} if e.get("structure") == "tunnel" else e
                                for e in net["segments"]]}


def line_of(net):
    """The selected road's rounded centreline from A to B, [x, z, mapped width] at most SAMPLE_M apart. Pure."""
    rows = trackkerbs.sampled(trackkerbs.curved(_untunnelled(net)))
    rows = trackkerbs._spaced_line(rows, [0, 1])
    length = float(np.linalg.norm(np.diff(rows[:, :2], axis=0), axis=1).sum())
    if length < 2:
        raise ValueError("Mark A and B at least 2 m apart")
    if length > MAX_LENGTH_M:
        raise ValueError(f"A stitch can be at most {MAX_LENGTH_M:.0f} m long")
    return rows


def auto_width(net, rows):
    """([width at A, width at B], reason): the mapped width of the ground road at each end. A bridge's or tunnel's own
    mapped width can be wrong (decks tagged too wide), so an end on a structure takes the ground road's. Pure."""
    segments = net["segments"]
    ground = [float(e["width"]) for e in segments if not e.get("structure")]

    def end(point):
        edge = min(segments, key=lambda e: min(math.dist(e["a"], point), math.dist(e["b"], point)))
        if not edge.get("structure"):
            return float(edge["width"]), "ground road"
        if ground:
            return min(ground), f"ground road beside the {edge['structure'].replace('_floor', '')}"
        return float(edge["width"]), f"mapped {edge['structure'].replace('_floor', '')} width (no ground road marked)"

    (a, why_a), (b, why_b) = end(rows[0, :2]), end(rows[-1, :2])
    return [round(a, 2), round(b, 2)], f"A {a:.1f} m ({why_a}), B {b:.1f} m ({why_b})"


def _normals(xy):
    """Unit normals of a polyline [x, z] towards the right of travel (AC z points south). Pure."""
    return trackkerbs._normals(np.asarray(xy, np.float64))


def _distances(xy):
    """Distance along a polyline [x, z]. Pure."""
    return np.r_[0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]


def _offsets(widths):
    """Lane column offsets across each row along _normals: column 0 at the right edge (+), the last at the left. Pure."""
    return np.asarray(widths, np.float64)[:, None] * np.linspace(0.5, -0.5, COLUMNS)[None, :]


# ---------------------------------------------------------------- reading the source surfaces

def _faces(path, scan, bounds, prefixes):
    """[(mesh number, name, vertices, faces)] of meshes whose names start with one of prefixes near bounds."""
    out = []
    with open(path, "rb") as f:
        for i, mesh in enumerate(scan["meshes"]):
            if not mesh["name"].startswith(prefixes) or mesh.get("copy"):
                continue
            at = np.asarray(mesh["center"])[[0, 2]]
            if np.any(at + mesh["radius"] < bounds[0]) or np.any(at - mesh["radius"] > bounds[1]):
                continue
            vertices, faces = kn5.mesh_arrays(f, mesh)
            out.append((i, mesh["name"], vertices, faces.reshape(-1, 3)))
    return out


def _tops(path, scan, bounds, road_ids):
    """(own deck, own concrete tops, ground) triangles as (n, 3, 3) arrays of upward faces near bounds.

    Own deck: `1ROAD_deck_*` faces whose owner is one of road_ids (legacy unowned faces count). Concrete tops: the
    road's own `1WALL_deck_con_*` upward faces, the floor of a tunnel (Griffen, Kollmanntunnel: no 1ROAD floor in the
    tube, the slab's top at the asphalt skin); on a bridge they include slab tops under the deck and parapets, so they
    count only on tunnel rows. Ground: the graded terrain `1ROAD_ground_*`, the driving surface of a ground road.
    """
    found = {"1ROAD_deck": [], "1WALL_deck_con": [], "1ROAD_ground_": []}
    for _i, name, vertices, faces in _faces(path, scan, bounds, tuple(found)):
        p = vertices["pos"][faces].astype(np.float64)
        n = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
        up = (n[:, 1] > 1e-8) & (np.hypot(n[:, 0], n[:, 2]) <= trackband.MAX_GRADE * n[:, 1])
        kind = next(k for k in found if name.startswith(k))
        if kind != "1ROAD_ground_":
            owners = roadsurfaces._face_owners(path, name)
            if owners is not None:
                # Tunnel slabs carry no road ID (Griffen: owner None), so unowned concrete counts on tunnel rows.
                allowed = list(road_ids) + (["None"] if kind == "1WALL_deck_con" else [])
                up &= np.isin(np.asarray(owners).astype(str), allowed)
            elif kind == "1WALL_deck_con":
                continue
        found[kind].append(p[up])
    empty = np.zeros((0, 3, 3))
    return tuple(np.concatenate(v) if v else empty for v in found.values())


def _height_on(triangles, points):
    """Height of the triangle under each [x, z] point, NaN where none; the highest where several. Pure."""
    points = np.asarray(points, np.float64).reshape(-1, 2)
    out = np.full(len(points), np.nan)
    if not len(triangles):
        return out
    low, high = triangles[:, :, [0, 2]].min(axis=1), triangles[:, :, [0, 2]].max(axis=1)
    a, b, c = triangles[:, 0], triangles[:, 1], triangles[:, 2]
    for k, (x, z) in enumerate(points):
        near = np.flatnonzero((low[:, 0] <= x) & (high[:, 0] >= x) & (low[:, 1] <= z) & (high[:, 1] >= z))
        if not len(near):
            continue
        pa, pb, pc = a[near], b[near], c[near]
        d = (pb[:, 2] - pc[:, 2]) * (pa[:, 0] - pc[:, 0]) + (pc[:, 0] - pb[:, 0]) * (pa[:, 2] - pc[:, 2])
        d = np.where(np.abs(d) < 1e-12, np.nan, d)
        l1 = ((pb[:, 2] - pc[:, 2]) * (x - pc[:, 0]) + (pc[:, 0] - pb[:, 0]) * (z - pc[:, 2])) / d
        l2 = ((pc[:, 2] - pa[:, 2]) * (x - pc[:, 0]) + (pa[:, 0] - pc[:, 0]) * (z - pc[:, 2])) / d
        l3 = 1 - l1 - l2
        inside = (l1 >= -1e-6) & (l2 >= -1e-6) & (l3 >= -1e-6)
        if inside.any():
            y = l1 * pa[:, 1] + l2 * pb[:, 1] + l3 * pc[:, 1]
            out[k] = np.nanmax(y[inside])
    return out


# ---------------------------------------------------------------- the new surface

def _hermite(h0, m0, h1, m1, s0, s1, s):
    """Cubic Hermite between (s0, h0, slope m0) and (s1, h1, slope m1) at s. Pure."""
    span = max(s1 - s0, 1e-9)
    t = (np.asarray(s) - s0) / span
    return ((2 * t**3 - 3 * t**2 + 1) * h0 + (t**3 - 2 * t**2 + t) * span * m0
            + (-2 * t**3 + 3 * t**2) * h1 + (t**3 - t**2) * span * m1)


def _plane(offsets, values):
    """Least-squares centre height and cross slope of values over offsets; NaN values left out. Pure."""
    good = np.isfinite(values)
    if good.sum() >= 2 and np.ptp(offsets[good]) > 0.5:
        slope, centre = np.polyfit(offsets[good], values[good], 1)
        return centre + slope * offsets
    if good.any():
        return np.full_like(offsets, np.nanmean(values))
    return np.full_like(offsets, np.nan)


def solve(rows, widths, deck, ground, before=None, after=None):
    """Collision heights [row][column] of the new surface. Pure.

    rows: [x, z] along the road; widths per row; deck, ground: (rows, columns) heights of the road's own deck and of
    the ground road (NaN where none). before/after: (columns) heights APPROACH_M outside A and B, for the grade there.
    A and B keep their measured heights column by column; rows mostly on the road's own deck follow the deck's plane;
    ground rows further than BLEND_M from any deck row keep their heights; the rest is a cubic per column.
    """
    s = _distances(rows)
    offsets = _offsets(widths)
    measured = np.where(np.isfinite(deck), deck, ground)
    n = len(s)
    anchors = np.full((n, COLUMNS), np.nan)
    share = np.isfinite(deck).mean(axis=1)
    deck_rows = np.flatnonzero(share >= DECK_ROW_SHARE)
    for k in range(n):
        if k in (0, n - 1):
            row = measured[k].copy()
            if not np.isfinite(row).any():
                raise ValueError(f"No road surface at {'A' if k == 0 else 'B'}")
            fill = _plane(offsets[k], row)
            anchors[k] = np.where(np.isfinite(row), row, fill)
        elif share[k] >= DECK_ROW_SHARE:
            anchors[k] = _plane(offsets[k], np.where(np.isfinite(deck[k]), deck[k], np.nan))
        elif share[k] == 0 and np.isfinite(ground[k]).all() and (
                not len(deck_rows) or np.min(np.abs(s[deck_rows] - s[k])) > BLEND_M):
            # As built, column by column: a plane fit would tilt the whole row by the edge's few-cm bumps (A2 1742 m).
            anchors[k] = ground[k]
    fixed = np.flatnonzero(np.isfinite(anchors).all(axis=1))
    out = anchors.copy()
    grade_a = (anchors[0] - before) / APPROACH_M if before is not None else None
    grade_b = (after - anchors[-1]) / APPROACH_M if after is not None else None

    def slope(j):
        """Slope per column at fixed row index j: the secant to its neighbouring fixed rows, the approach grade at the ends."""
        k = fixed[j]
        if k == 0 and grade_a is not None:
            return np.where(np.isfinite(grade_a), grade_a, 0)
        if k == n - 1 and grade_b is not None:
            return np.where(np.isfinite(grade_b), grade_b, 0)
        lo, hi = fixed[max(j - 1, 0)], fixed[min(j + 1, len(fixed) - 1)]
        return (anchors[hi] - anchors[lo]) / max(s[hi] - s[lo], 1e-9)

    slopes = [slope(j) for j in range(len(fixed))]
    for j in range(len(fixed) - 1):
        k0, k1 = fixed[j], fixed[j + 1]
        if k1 - k0 > 1:
            inner = np.arange(k0 + 1, k1)
            out[inner] = _hermite(anchors[k0], slopes[j], anchors[k1], slopes[j + 1], s[k0], s[k1], s[inner][:, None])
    return out


def _tunnel_rows(net, xy):
    """Whether each [x, z] row lies on a mapped tunnel segment of net (its nearest segment). Pure."""
    segments = net["segments"]
    a = np.asarray([e["a"] for e in segments], np.float64)
    d = np.asarray([e["b"] for e in segments], np.float64) - a
    length2 = np.maximum((d * d).sum(axis=1), 1e-12)
    u = np.clip(((xy[:, None, :] - a[None]) * d[None]).sum(axis=2) / length2[None], 0, 1)
    nearest = np.argmin(np.linalg.norm(xy[:, None, :] - (a[None] + u[:, :, None] * d[None]), axis=2), axis=1)
    return np.array([segments[k].get("structure") == "tunnel" for k in nearest])


def _sample(path, scan, net, rows, widths):
    """(deck, ground) heights at each row and column, and (before, after) heights APPROACH_M outside A and B.

    deck: the road's own 1ROAD deck, on tunnel rows else its own concrete floor top."""
    xy = rows[:, :2]
    normal = _normals(xy)
    offsets = _offsets(widths)
    points = xy[:, None, :] + normal[:, None, :] * offsets[:, :, None]
    ends = []
    for k, sign in ((0, -1), (-1, 1)):
        tangent = xy[k] - xy[k + sign] if sign > 0 else xy[0] - xy[1]
        tangent = tangent / max(float(np.linalg.norm(tangent)), 1e-9)
        ends.append(xy[k] + tangent * APPROACH_M + normal[k] * offsets[k][:, None])
    every = np.concatenate([points.reshape(-1, 2), *ends])
    bounds = np.array([every.min(axis=0) - 2, every.max(axis=0) + 2])
    deck, floor, ground = _tops(path, scan, bounds, builtroad.road_ids(net))
    flat = points.reshape(-1, 2)
    on_deck = _height_on(deck, flat).reshape(len(rows), COLUMNS)
    tunnel = _tunnel_rows(net, xy)
    if tunnel.any():
        on_floor = _height_on(floor, points[tunnel].reshape(-1, 2)).reshape(-1, COLUMNS)
        on_deck[tunnel] = np.where(np.isfinite(on_deck[tunnel]), on_deck[tunnel], on_floor)
    on_ground = _height_on(ground, flat).reshape(len(rows), COLUMNS)
    in_tunnel = _tunnel_rows(net, np.asarray([e.mean(axis=0) for e in ends]))

    def approach(points, tunnelled):
        own = _height_on(deck, points)
        if tunnelled:
            own = np.where(np.isfinite(own), own, _height_on(floor, points))
        return np.where(np.isfinite(own), own, _height_on(ground, points))
    approach = [approach(e, t) for e, t in zip(ends, in_tunnel)]
    return on_deck, on_ground, approach[0], approach[1]


def _widths(rows, width):
    """Width per row from [at A, at B], linear in distance. Pure."""
    s = _distances(rows[:, :2])
    return width[0] + (width[1] - width[0]) * s / max(s[-1], 1e-9)


# ---------------------------------------------------------------- road coordinates and cutting

class Frame:
    """Road coordinates (s along, t across, + right) of a stitch's centreline; ends extend straight past A and B."""

    def __init__(self, rows, widths):
        self.xy = np.asarray(rows, np.float64)[:, :2]
        self.s = _distances(self.xy)
        self.widths = np.asarray(widths, np.float64)

    def coords(self, points):
        """(s, t) of [x, z] points: the nearest centreline segment, unclamped past the two ends. Pure."""
        points = np.asarray(points, np.float64).reshape(-1, 2)
        a, b = self.xy[:-1], self.xy[1:]
        d = b - a
        length2 = np.maximum((d * d).sum(axis=1), 1e-12)
        out_s, out_t = np.empty(len(points)), np.empty(len(points))
        for first in range(0, len(points), 256):
            q = points[first:first + 256]
            raw = ((q[:, None, :] - a[None]) * d[None]).sum(axis=2) / length2[None]
            u = np.clip(raw, 0, 1)
            u[:, 0] = np.minimum(raw[:, 0], 1)
            u[:, -1] = np.maximum(raw[:, -1], 0) if len(a) > 1 else raw[:, -1]
            foot = a[None] + u[:, :, None] * d[None]
            dist = np.linalg.norm(q[:, None, :] - foot, axis=2)
            k = np.argmin(dist, axis=1)
            rows = np.arange(len(q))
            seg = d[k] / np.sqrt(length2[k])[:, None]
            rel = q - a[k]
            out_s[first:first + 256] = self.s[k] + u[rows, k] * np.sqrt(length2[k])
            out_t[first:first + 256] = seg[:, 0] * rel[:, 1] - seg[:, 1] * rel[:, 0]
        # Right of travel is +t, as _normals.
        return out_s, out_t

    def half_width(self, s):
        """Half the stitch width at distance s (clamped to the ends). Pure."""
        return np.interp(s, self.s, self.widths) / 2


def _heights_at(frame, heights, s, t):
    """New surface height at road coordinates (s, t): linear between rows and lane columns, clamped at the ends. Pure."""
    heights = np.asarray(heights, np.float64)
    s = np.clip(np.asarray(s, np.float64), 0, frame.s[-1])
    k = np.clip(np.searchsorted(frame.s, s, side="right") - 1, 0, len(frame.s) - 2)
    f = np.clip((s - frame.s[k]) / np.maximum(frame.s[k + 1] - frame.s[k], 1e-9), 0, 1)
    across = np.clip((0.5 - np.asarray(t) / np.maximum(np.interp(s, frame.s, frame.widths), 1e-6)) * (COLUMNS - 1), 0,
                     COLUMNS - 1)
    j = np.clip(np.floor(across).astype(int), 0, COLUMNS - 2)
    g = across - j

    def row(r):
        return heights[r, j] * (1 - g) + heights[r, j + 1] * g
    return row(k) * (1 - f) + row(k + 1) * f


def _clip(poly, inside):
    """Sutherland-Hodgman: the part of a polygon (list of (record, value)) where value <= 0 if inside, else > 0. Pure."""
    out = []
    for (pa, va), (pb, vb) in zip(poly, poly[1:] + poly[:1]):
        a_in, b_in = (va <= 0) == inside, (vb <= 0) == inside
        if a_in:
            out.append((pa, va))
        if a_in != b_in:
            f = va / (va - vb)
            cut = pa + (pb - pa) * f
            cut[-1] = 1.0           # a new corner on a strip boundary (_snap_edges)
            out.append((cut, 0.0))
    return out


def _outside_parts(record, frame, length):
    """Polygons (lists of records) of one triangle outside the strip 0 <= s <= length, |t| <= half width. Pure.

    record: (3, k) vertex attributes, whose first two are s and t."""
    w0, w1 = frame.widths[0] / 2, frame.widths[-1] / 2
    slope = (w1 - w0) / max(length, 1e-9)
    tests = (lambda r: -r[0],                              # s < 0: before A
             lambda r: r[0] - length,                      # s > length: after B
             lambda r: r[1] - (w0 + slope * r[0]),         # left of the left edge
             lambda r: -r[1] - (w0 + slope * r[0]))        # right of the right edge
    rest, parts = [np.asarray(v) for v in record], []
    for test in tests:
        poly = [(v, float(test(v))) for v in rest]
        outside = _clip(poly, False)
        if len(outside) >= 3:
            parts.append([v for v, _ in outside])
        rest = [v for v, _ in _clip(poly, True)]
        if len(rest) < 3:
            break
    return parts


def _cut(path, scan, stitch, frame, road_ids):
    """(hidden [mesh, first, count], remainder meshes {mesh number: (vertices, triangles)}) of the source faces inside
    the stitch's strip near its new surface."""
    heights = np.asarray(stitch["heights"], np.float64)
    length = float(frame.s[-1])
    reach = float(frame.widths.max()) / 2 + 1
    bounds = np.array([frame.xy.min(axis=0) - reach, frame.xy.max(axis=0) + reach])
    hidden, remainders = [], {}
    for i, name, vertices, faces in _faces(path, scan, bounds, CUT):
        p = vertices["pos"].astype(np.float64)
        centre = p[faces].mean(axis=1)
        box = (np.all(p[faces][:, :, [0, 2]].max(axis=1) >= bounds[0], axis=1)
               & np.all(p[faces][:, :, [0, 2]].min(axis=1) <= bounds[1], axis=1))
        candidates = np.flatnonzero(box)
        if not len(candidates):
            continue
        concrete = name.startswith("1WALL_deck_con")
        # Another road's deck at the stitch's level inside its strip is a build overlap (A2 1736 m: a skewed joint face of
        # the westbound deck 2 m into the eastbound width) and is cut back to the strip's edge too; its own carriageway
        # lies outside the strip, and the height window keeps roads under and over this one.
        if concrete:
            owners = roadsurfaces._face_owners(path, name)
            if owners is not None:
                allowed = list(road_ids) + (["None"] if concrete else [])
                candidates = candidates[np.isin(np.asarray(owners).astype(str)[candidates], allowed)]
            elif concrete:
                continue
        if concrete:
            q = p[faces[candidates]]
            n = np.cross(q[:, 1] - q[:, 0], q[:, 2] - q[:, 0])
            candidates = candidates[(n[:, 1] > 1e-8) & (np.hypot(n[:, 0], n[:, 2]) <= trackband.MAX_GRADE * n[:, 1])]
        used = np.unique(faces[candidates])
        s_of, t_of = np.full(len(p), np.nan), np.full(len(p), np.nan)
        s_of[used], t_of[used] = frame.coords(p[used][:, [0, 2]])
        fs, ft = s_of[faces[candidates]], t_of[faces[candidates]]
        cs, ct = frame.coords(centre[candidates][:, [0, 2]])
        half = frame.half_width(fs)
        touching = ~(np.all(fs < 0, axis=1) | np.all(fs > length, axis=1)
                     | np.all(ft > half, axis=1) | np.all(ft < -half, axis=1))
        near = centre[candidates, 1] - _heights_at(frame, heights, cs, ct)
        if concrete:
            chosen = candidates[touching & (np.abs(near) <= FLOOR_FLUSH_M)]
        else:
            chosen = candidates[touching & (near >= -NEAR_BELOW_M) & (near <= NEAR_ABOVE_M)]
        if not len(chosen):
            continue
        pieces = []
        for face in chosen:
            corners = faces[face]
            record = [np.r_[s_of[v], t_of[v], p[v], vertices["normal"][v], vertices["uv"][v], 0.0] for v in corners]
            pieces.extend(_outside_parts(record, frame, length))
        hidden.extend([int(i), int(face), 1] for face in chosen)
        if pieces:
            remainders[i] = _polygons_mesh(_snap_edges(pieces, frame, heights, length, _edge_lift(name)))
    return _joined(hidden), remainders


def _joined(hidden):
    """[mesh, first, count] ranges with consecutive faces of one mesh joined. Pure."""
    out = []
    for i, first, count in sorted(hidden):
        if out and out[-1][0] == i and out[-1][1] + out[-1][2] == first:
            out[-1][2] += count
        else:
            out.append([i, first, count])
    return out


def _edge_lift(name):
    """How far a cut mesh's edge lies over the new surface: decals just over it, driving surfaces on it. Pure."""
    if name.startswith("nocol_road_paint_"):
        return MARK_LIFT_M
    if name.startswith(("nocol_road_edge_dirt_", "nocol_road_asphalt_")):
        return 0.004
    return 0.0


def _snap_edges(polygons, frame, heights, length, lift):
    """Polygons whose new corners on the strip's edge lie on the new surface (plus lift). Pure.

    The old asphalt skin lies 1 cm over a deck and the new surface on the deck: left as cut, the edge is a centimetre step
    whose open slit shows the ground below (Griffen west portal). Corners cut off beyond the strip's ends stay."""
    out = []
    for poly in polygons:
        fixed = []
        for r in poly:
            r = r.copy()
            if r[-1] > 0.5 and -0.01 <= r[0] <= length + 0.01 and abs(r[1]) <= frame.half_width(r[0]) + 0.01:
                r[3] = float(_heights_at(frame, heights, r[0], r[1])) + lift
            fixed.append(r)
        out.append(fixed)
    return out


def _polygons_mesh(polygons):
    """(vertices, triangles) of convex polygons whose records are [s, t, x, y, z, nx, ny, nz, u, v], fanned. Pure."""
    records, triangles = [], []
    for poly in polygons:
        base = len(records)
        records.extend(poly)
        for k in range(1, len(poly) - 1):
            triangles.append((base, base + k, base + k + 1))
    r = np.asarray(records, np.float64)
    v = np.zeros(len(r), kn5.VERTEX)
    v["pos"], v["uv"] = r[:, 2:5], r[:, 8:10]
    n = r[:, 5:8]
    v["normal"] = n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
    tri = _upward(v["pos"].astype(np.float64), np.asarray(triangles, np.int64))
    v["tangent"] = obj_to_kn5.tangents(v["pos"].astype(np.float64), np.c_[v["uv"][:, 0], -v["uv"][:, 1]], tri,
                                       v["normal"].astype(np.float64))
    return v, tri


def _upward(p, tri):
    """Triangles wound like the build's upward faces (cross(p1 - p0, p2 - p0) up); degenerate ones left out. Pure."""
    n = np.cross(p[tri[:, 1]] - p[tri[:, 0]], p[tri[:, 2]] - p[tri[:, 0]])
    keep = np.linalg.norm(n, axis=1) > 1e-10
    tri = tri[keep]
    flip = n[keep, 1] < 0
    tri[flip] = tri[flip][:, [0, 2, 1]]
    return tri


# ---------------------------------------------------------------- markings

def _terrain(path, scan, bounds):
    """Upward terrain triangles of every surface kind near bounds (1ROAD, 1GRAVEL, 1GRASS ... `_ground_`): a ground
    road's painted edge line can lie on the verge's gravel, past the 1ROAD part (Heiligenblut). (n, 3, 3)."""
    kinds = tuple(sorted({m["name"].split("_ground_")[0] + "_ground_" for m in scan["meshes"]
                          if "_ground_" in m["name"] and m["name"][:1] == "1"}))
    found = []
    for _i, _name, vertices, faces in (_faces(path, scan, bounds, kinds) if kinds else ()):
        p = vertices["pos"][faces].astype(np.float64)
        n = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
        found.append(p[n[:, 1] > 1e-8])
    return np.concatenate(found) if found else np.zeros((0, 3, 3))


def _road_under(tops, terrain, points):
    """Height of this road's own surface under [x, z] points: its deck, else its tunnel floor, else the terrain;
    NaN where none. tops: _tops() of the road. Pure."""
    deck, floor, _ground = tops
    out = _height_on(deck, points)
    for other in (floor, terrain):
        out = np.where(np.isfinite(out), out, _height_on(other, points))
    return out


def _marks_near(path, scan, frame, heights, side, road_ids=()):
    """Marking lines in the window outside one end ("A" before it, "B" after it): [{"t", "w", "cover", "dash", "gap"}].

    A marking counts when it lies on this road's own surface where it is painted (within 0.5 m: a road under or over
    this one lies metres off). Compared with the height at A or B instead, a climbing road's markings left the window
    after a few metres and a solid edge line read as dashed (Heiligenblut 1654 m, about 10 %)."""
    length = float(frame.s[-1])
    lo, hi = (-MARK_WINDOW_M, 0.0) if side == "A" else (length, length + MARK_WINDOW_M)
    xy = frame.xy
    reach = MARK_WINDOW_M + float(frame.widths.max())
    bounds = np.array([xy.min(axis=0) - reach, xy.max(axis=0) + reach])
    found = []
    tops, terrain = _tops(path, scan, bounds, road_ids), _terrain(path, scan, bounds)
    for _i, _name, vertices, faces in _faces(path, scan, bounds, ("nocol_road_paint_",)):
        p = vertices["pos"].astype(np.float64)[faces]
        centre = p.mean(axis=1)
        near = np.flatnonzero(np.all((centre[:, [0, 2]] >= bounds[0]) & (centre[:, [0, 2]] <= bounds[1]), axis=1))
        if not len(near):
            continue
        cs, ct = frame.coords(centre[near][:, [0, 2]])
        half = frame.half_width(cs)
        inside = (cs >= lo) & (cs <= hi) & (np.abs(ct) <= half + 0.5)
        surface = np.full(len(near), np.nan)
        if inside.any():
            surface[inside] = _road_under(tops, terrain, centre[near[inside]][:, [0, 2]])
        keep = inside & (np.abs(centre[near, 1] - surface) < 0.5)
        for k in np.flatnonzero(keep):
            vs, vt = frame.coords(p[near[k]][:, [0, 2]])
            found.append((float(ct[k]), float(vt.min()), float(vt.max()), float(vs.min()), float(vs.max())))
    if not found:
        return []
    found.sort()
    groups, current = [], [found[0]]
    for item in found[1:]:
        if item[0] - current[-1][0] > 0.3:
            groups.append(current)
            current = []
        current.append(item)
    groups.append(current)
    lines = []
    for group in groups:
        t = float(np.median([g[0] for g in group]))
        width = float(np.clip(np.median([g[2] - g[1] for g in group]), 0.08, 0.5))
        spans = sorted((max(g[3], lo), min(g[4], hi)) for g in group)
        runs = []
        for a, b in spans:
            if runs and a <= runs[-1][1] + 0.3:
                runs[-1][1] = max(runs[-1][1], b)
            else:
                runs.append([a, b])
        cover = sum(b - a for a, b in runs) / (hi - lo)
        if cover < 0.1:
            continue
        inner = [b - a for a, b in runs if a > lo + 0.5 and b < hi - 0.5]
        dash = float(np.median(inner)) if inner else 3.0
        gaps = [b[0] - a[1] for a, b in zip(runs, runs[1:])]
        near = min(abs(a - (hi if side == "A" else lo)) for run in runs for a in run)
        lines.append({"t": t, "w": width, "cover": round(cover, 2), "dash": round(dash, 2), "near": near,
                      # Dashed: a real gap between runs, or paint over less than half the window.
                      "dashed": bool(gaps and max(gaps) > 2.0) or cover < 0.5,
                      "gap": round(float(np.median(gaps)) if gaps else dash * (1 - cover) / max(cover, 0.05), 2)})
    return _single(lines)


def _single(lines):
    """Lines without a second painting of the same line close beside it; the one painted nearest the cut stays. Pure."""
    kept = []
    for line in sorted(lines, key=lambda l: l["near"]):
        if all(abs(line["t"] - other["t"]) > MARK_SAME_M for other in kept):
            kept.append(line)
    return sorted(kept, key=lambda l: l["t"])


def markings(path, scan, frame, heights, road_ids=()):
    """([{"t": [at A, at B], "w": [..], "dash": [length, gap] or None}], note) continuing the markings at A and B.

    Lines pair across A and B by their place across the road. A line seen at one end only goes on at its place across:
    the other end's window can miss a dashed line between two dashes (Heiligenblut 1654 m: the centre line was found
    at A only and dropped). The outermost line on each side, in the road's outer half, is an edge line, which the build
    paints solid and only breaks at junctions (roads.style.EDGE_LINE has no dashes): a junction's break in it read as
    dashes before."""
    at_a, at_b = (_marks_near(path, scan, frame, heights, side, road_ids) for side in ("A", "B"))
    wa, wb = frame.widths[0], frame.widths[-1]
    if not at_a and not at_b:
        return [], "no markings found at A or B"
    pairs = _paired(at_a, at_b, wa, wb)
    paired_a, paired_b = {id(a) for a, _b in pairs}, {id(b) for _a, b in pairs}
    alone = ([(m, {**m, "t": m["t"] * float(wb / wa)}) for m in at_a if id(m) not in paired_a]
             + [({**m, "t": m["t"] * float(wa / wb)}, m) for m in at_b if id(m) not in paired_b])
    pairs = sorted(pairs + alone, key=lambda pair: pair[0]["t"])
    note = f"{len(pairs)} marking lines from A to B" + (f", {len(alone)} seen at one end only" if alone else "")
    edges = set()
    for sign in (-1, 1):
        outer = [k for k, (a, _b) in enumerate(pairs) if sign * a["t"] > wa / 4]
        if outer:
            edges.add(max(outer, key=lambda k: sign * pairs[k][0]["t"]))
    out = []
    for k, (a, b) in enumerate(pairs):
        dashed = k not in edges and (a["dashed"] or b["dashed"])
        pattern = a if a["dashed"] and (not b["dashed"] or a["cover"] <= b["cover"]) else b     # where the dashes show
        out.append({"t": [round(a["t"], 3), round(b["t"], 3)], "w": [round(a["w"], 3), round(b["w"], 3)],
                    "dash": [pattern["dash"], max(pattern["gap"], 0.5)] if dashed else None})
    return out, note


def _paired(at_a, at_b, wa, wb):
    """[(line at A, line at B)] matched one to one by their place across as a share of the width, nearest first. Pure."""
    options = sorted((abs(a["t"] / wa - b["t"] / wb), i, j) for i, a in enumerate(at_a) for j, b in enumerate(at_b))
    used_a, used_b, pairs = set(), set(), []
    for distance, i, j in options:
        if distance <= MARK_MATCH and i not in used_a and j not in used_b:
            used_a.add(i)
            used_b.add(j)
            pairs.append((at_a[i], at_b[j]))
    return sorted(pairs, key=lambda pair: pair[0]["t"])


def intrusions(path, scan, frame, heights, road_ids):
    """{"left": m, "right": m}: how far another road's deck reaches into the strip near the new surface's height.

    Those faces stay (another carriageway, A2 1730 m: the westbound deck 0.3 m inside the eastbound mapped width); the
    page reports it so a narrower width can be chosen. +t is the right of travel."""
    length = float(frame.s[-1])
    reach = float(frame.widths.max()) / 2 + 1
    bounds = np.array([frame.xy.min(axis=0) - reach, frame.xy.max(axis=0) + reach])
    depth = {"left": [], "right": []}
    for _i, name, vertices, faces in _faces(path, scan, bounds, ("1ROAD_deck",)):
        owners = roadsurfaces._face_owners(path, name)
        if owners is None:
            continue
        other = np.flatnonzero(~np.isin(np.asarray(owners).astype(str), list(road_ids)))
        if not len(other):
            continue
        p = vertices["pos"].astype(np.float64)[faces[other]].reshape(-1, 3)
        s, t = frame.coords(p[:, [0, 2]])
        inside = (s > 0) & (s < length) & (np.abs(t) < frame.half_width(s))
        near = np.abs(p[:, 1] - _heights_at(frame, heights, s, t)) < NEAR_ABOVE_M
        for k in np.flatnonzero(inside & near):
            side = "right" if t[k] > 0 else "left"
            depth[side].append(float(frame.half_width(s[k]) - abs(t[k])))
    # A single skewed joint triangle can reach metres in (A2 1736 m: 2 m); the typical edge overlap is what to act on.
    return {side: round(float(np.percentile(d, 80)), 2) if d else 0.0 for side, d in depth.items()}


# ---------------------------------------------------------------- the request and the draft

def prepare(path, scan, net, width=None):
    """A stitch descriptor for the selected road (without its id) and the preview facts the page shows."""
    rows = line_of(net)
    auto, reason = auto_width(net, rows)
    chosen = auto if width is None else ([float(width)] * 2 if np.isscalar(width) else [float(w) for w in width])
    if any(not MIN_WIDTH_M <= w <= MAX_WIDTH_M for w in chosen):
        raise ValueError(f"Stitch width must be {MIN_WIDTH_M:.0f}–{MAX_WIDTH_M:.0f} m")
    widths = _widths(rows, chosen)
    deck, ground, before, after = _sample(path, scan, net, rows, widths)
    heights = solve(rows[:, :2], widths, deck, ground, before, after)
    if not np.isfinite(heights).all():
        raise ValueError("Part of this road has no surface to join: mark A and B on built road")
    frame = Frame(rows, widths)
    marks, mark_note = markings(path, scan, frame, heights, builtroad.road_ids(net))
    on_deck = np.isfinite(deck).mean(axis=1)
    measured = np.where(np.isfinite(deck), deck, ground)
    change = np.nanmax(np.abs(heights - measured)) if np.isfinite(measured).any() else 0.0
    stitch = {"road_ids": sorted(builtroad.road_ids(net)), "rows": rows[:, :2].round(3).tolist(),
              "width": [round(w, 2) for w in chosen], "heights": heights.round(3).tolist(), "marks": marks}
    centre = heights[:, COLUMNS // 2]
    overlap = intrusions(path, scan, frame, heights, set(stitch["road_ids"]))
    return stitch, {"line": np.c_[rows[:, 0], centre, rows[:, 1]].round(3).tolist(), "auto": auto, "reason": reason,
                    "marks": mark_note, "deck_rows": int((on_deck >= DECK_ROW_SHARE).sum()), "rows": len(rows),
                    "change": round(float(change), 2), "overlap": overlap}


MERGE_M = 2.0           # stitches closer than this along or across meet: their cut remainders would overlap at the shared edge


def meets(a, b, margin=MERGE_M):
    """Whether two stitch descriptors on a shared mapped road overlap or touch, within margin. Pure."""
    if not set(a.get("road_ids", [])) & set(b.get("road_ids", [])):
        return False
    for one, other in ((a, b), (b, a)):
        rows = np.asarray(one["rows"], np.float64)
        frame = Frame(rows, _widths(rows, one["width"]))
        s, t = frame.coords(np.asarray(other["rows"], np.float64))
        if np.any((s >= -margin) & (s <= frame.s[-1] + margin) & (np.abs(t) <= frame.half_width(s) + margin)):
            return True
    return False


def _union_pins(stitch, others):
    """The two outermost ends [x, z, y] along the road of a stitch and the stitches it meets. Pure."""
    rows = np.asarray(stitch["rows"], np.float64)
    frame = Frame(rows, _widths(rows, stitch["width"]))
    ends = []
    for one in [stitch, *others]:
        h = np.asarray(one["heights"], np.float64)[:, COLUMNS // 2]
        for k in (0, -1):
            ends.append([*one["rows"][k], float(h[k]) + builtroad.DECK_SKIN_M])
    s, _t = frame.coords(np.asarray(ends)[:, :2])
    return [ends[int(np.argmin(s))], ends[int(np.argmax(s))]]


def union(path, scan, net, width, existing):
    """prepare() for the selected road, grown over every existing stitch it meets, which it replaces.

    A new stitch starting inside an old one, or lying wholly in it, covers both from the outermost end to the other:
    replacing only the new range would bring the rest of the old one back as built. info["replaces"] names the ids."""
    stitch, info = prepare(path, scan, net, width)
    replaced = []
    for _ in range(MAX_STITCHES):
        hits = [o for o in existing if o["id"] not in replaced and meets(stitch, o)]
        if not hits:
            break
        replaced += [o["id"] for o in hits]
        merged = [o for o in existing if o["id"] in replaced]
        net = builtroad.pick(path, scan, _union_pins(stitch, merged), join_near=True)
        stitch, info = prepare(path, scan, net, width)
    return stitch, {**info, "replaces": replaced}


def problems(stitches):
    """Why stitches can't be a draft's, None if they can. Pure."""
    if not isinstance(stitches, list) or len(stitches) > MAX_STITCHES:
        return f"Stitches must be a list of at most {MAX_STITCHES}"
    seen = set()
    for s in stitches:
        if not isinstance(s, dict) or not isinstance(s.get("id"), str) or len(s["id"]) > 64 or s["id"] in seen:
            return "Each stitch needs a unique id"
        seen.add(s["id"])
        rows, heights, width = s.get("rows"), s.get("heights"), s.get("width")
        if not (isinstance(rows, list) and 2 <= len(rows) <= 2 * MAX_LENGTH_M / SAMPLE_M
                and all(isinstance(r, list) and len(r) == 2 and all(_number(v) for v in r) for r in rows)):
            return "Invalid stitch rows"
        if not (isinstance(heights, list) and len(heights) == len(rows)
                and all(isinstance(h, list) and len(h) == COLUMNS and all(_number(v) for v in h) for h in heights)):
            return "Invalid stitch heights"
        if not (isinstance(width, list) and len(width) == 2 and all(_number(w) and MIN_WIDTH_M <= w <= MAX_WIDTH_M
                                                                   for w in width)):
            return "Invalid stitch width"
        if not isinstance(s.get("marks", []), list) or not isinstance(s.get("road_ids", []), list):
            return "Invalid stitch markings"
    return None


def _number(value):
    """A finite JSON number, not a bool. Pure."""
    return type(value) in (int, float) and math.isfinite(value)


def _material(scan, name):
    """The number of the first material called name, or None. Pure."""
    return next((i for i, m in enumerate(scan["materials"]) if m.name == name), None)


def _mesh_entry(template, name, number, vertices, triangles, material, stitch_id, road_ids=()):
    """A draft mesh record for scan["meshes"]. Pure."""
    centre = (vertices["pos"].min(0).astype(float) + vertices["pos"].max(0)) / 2
    return {**template, "name": name, "copy": True, "stitch_id": stitch_id, "road_ids": road_ids, "vertices": len(vertices),
            "indices": triangles.size, "data": (vertices, triangles.astype("<u2")), "material": material,
            "center": centre.tolist(), "radius": float(np.linalg.norm(vertices["pos"] - centre, axis=1).max()),
            "renderable": 1, "lod_in": 0.0, "lod_out": max(float(template.get("lod_out", 0)), 2000.0)}


def surface_mesh(stitch):
    """[(vertices, triangles)] of the new driving surface, chunked under AC's vertex limit. Pure."""
    rows = np.asarray(stitch["rows"], np.float64)
    widths = _widths(rows, stitch["width"])
    heights = np.asarray(stitch["heights"], np.float64)
    normal = _end_normals(rows)
    offsets = _offsets(widths)
    s = _distances(rows)
    out = []
    for first in range(0, len(rows) - 1, CHUNK_ROWS - 1):
        k = np.arange(first, min(first + CHUNK_ROWS, len(rows)))
        xy = rows[k][:, None, :] + normal[k][:, None, :] * offsets[k][:, :, None]
        v = np.zeros(len(k) * COLUMNS, kn5.VERTEX)
        v["pos"] = np.c_[xy[:, :, 0].ravel(), heights[k].ravel(), xy[:, :, 1].ravel()]
        v["uv"] = np.c_[np.tile(np.linspace(0, 1, COLUMNS), len(k)), np.repeat(-s[k] / UV_ALONG_M, COLUMNS)]
        tri = []
        for r in range(len(k) - 1):
            for j in range(COLUMNS - 1):
                a, b, c, d = r * COLUMNS + j, r * COLUMNS + j + 1, (r + 1) * COLUMNS + j, (r + 1) * COLUMNS + j + 1
                tri.extend(((a, b, c), (b, d, c)))
        out.append(_finished(v, np.asarray(tri, np.int64)))
    return out


def _end_normals(rows):
    """_normals with the first and last exactly across their segment: the cut lines at A and B (Frame.coords). Pure."""
    normal = _normals(rows)
    for k, (a, b) in ((0, (0, 1)), (-1, (-2, -1))):
        d = rows[b] - rows[a]
        normal[k] = np.array([-d[1], d[0]]) / max(float(np.linalg.norm(d)), 1e-9)
    return normal


def skirt_mesh(stitch):
    """(vertices, triangles) of a short two-sided apron hanging from the new surface's edge, render only. Pure.

    It covers the millimetre slits where the surface's smoothed edge and the cut remainders' segment-wise edge differ."""
    rows = np.asarray(stitch["rows"], np.float64)
    heights = np.asarray(stitch["heights"], np.float64)
    offsets = _offsets(_widths(rows, stitch["width"]))
    xy = rows[:, None, :] + _end_normals(rows)[:, None, :] * offsets[:, :, None]
    n, c = len(rows), COLUMNS
    ring = ([(0, j) for j in range(c)] + [(k, c - 1) for k in range(1, n)]
            + [(n - 1, j) for j in range(c - 2, -1, -1)] + [(k, 0) for k in range(n - 2, 0, -1)])
    ring.append(ring[0])
    top = np.array([[xy[k, j, 0], heights[k, j], xy[k, j, 1]] for k, j in ring])
    p = np.empty((2 * len(top), 3))
    p[0::2], p[1::2] = top, top - [0, SKIRT_M, 0]
    tri = []
    for r in range(len(top) - 1):
        a, b, cc, d = 2 * r, 2 * r + 1, 2 * r + 2, 2 * r + 3
        tri.extend(((a, b, cc), (b, d, cc), (a, cc, b), (b, cc, d)))     # both sides
    v = np.zeros(len(p), kn5.VERTEX)
    v["pos"] = p
    v["normal"] = [0, 1, 0]          # lit like the road it hangs from
    along = np.r_[0, np.cumsum(np.linalg.norm(np.diff(top[:, [0, 2]], axis=0), axis=1))]
    v["uv"] = np.c_[np.tile([0.0, 0.05], len(top)), -np.repeat(along, 2) / UV_ALONG_M]
    tri = np.asarray(tri, np.int64)
    v["tangent"] = obj_to_kn5.tangents(p, np.c_[v["uv"][:, 0], -v["uv"][:, 1]], tri, v["normal"].astype(np.float64))
    return v, tri


def _finished(v, tri):
    """Vertices with smooth normals and tangents, triangles wound upward. Pure."""
    p = v["pos"].astype(np.float64)
    tri = _upward(p, tri)
    n = np.zeros_like(p)
    faces = obj_to_kn5.face_normals(p, tri)
    for j in range(3):
        np.add.at(n, tri[:, j], faces)
    n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
    v["normal"] = n
    v["tangent"] = obj_to_kn5.tangents(p, np.c_[v["uv"][:, 0], -v["uv"][:, 1]], tri, n)
    return v, tri


def marks_mesh(stitch):
    """(vertices, triangles) of the continued marking lines, or None. Pure."""
    rows = np.asarray(stitch["rows"], np.float64)
    widths = _widths(rows, stitch["width"])
    frame = Frame(rows, widths)
    heights = np.asarray(stitch["heights"], np.float64)
    length = float(frame.s[-1])
    normal = _normals(rows)
    positions, triangles = [], []
    for mark in stitch.get("marks", []):
        pieces = [(0.0, length)]
        if mark.get("dash"):
            dash, gap = mark["dash"]
            period = max(dash + gap, 1.0)
            pieces = [(a, min(a + dash, length)) for a in np.arange(0.0, length, period)]
        for a, b in pieces:
            along = np.unique(np.r_[a, frame.s[(frame.s > a) & (frame.s < b)], b])
            if len(along) < 2:
                continue
            f = along / max(length, 1e-9)
            t = mark["t"][0] + (mark["t"][1] - mark["t"][0]) * f
            half = (mark["w"][0] + (mark["w"][1] - mark["w"][0]) * f) / 2
            centre = np.c_[np.interp(along, frame.s, rows[:, 0]), np.interp(along, frame.s, rows[:, 1])]
            n = np.c_[np.interp(along, frame.s, normal[:, 0]), np.interp(along, frame.s, normal[:, 1])]
            base = sum(len(p) for p in positions)
            row = []
            for side in (1, -1):
                tt = t + side * half
                xy = centre + n * tt[:, None]
                row.append(np.c_[xy[:, 0], _heights_at(frame, heights, along, tt) + MARK_LIFT_M, xy[:, 1]])
            left, right = row
            pts = np.empty((2 * len(along), 3))
            pts[0::2], pts[1::2] = left, right
            positions.append(pts)
            for r in range(len(along) - 1):
                p, q = base + 2 * r, base + 2 * r + 2
                triangles.extend(((p, p + 1, q), (p + 1, q + 1, q)))
    if not positions:
        return None
    p = np.concatenate(positions)
    v = np.zeros(len(p), kn5.VERTEX)
    v["pos"] = p
    v["uv"] = np.c_[np.tile([0.0, 1.0], len(p) // 2), np.zeros(len(p))]
    return _finished(v, np.asarray(triangles, np.int64))


def extend(path, scan, stitches):
    """scan with each stitch's surface, markings and the cut-out remainders appended, and the cut source faces added to
    "wall_hidden" (the Editor and Save leave those out). Pure apart from reading path."""
    if wrong := problems(stitches):
        raise ValueError(wrong)
    if not stitches:
        return scan
    meshes = list(scan["meshes"])
    hidden = list(scan.get("wall_hidden", []))
    asphalt = _material(scan, "asphalt")
    paint = _material(scan, "paint")
    template = next(m for m in scan["meshes"] if m["name"].startswith("1ROAD_"))
    for stitch in stitches:
        rows = np.asarray(stitch["rows"], np.float64)
        frame = Frame(rows, _widths(rows, stitch["width"]))
        ids = list(stitch.get("road_ids", []))
        cut, remainders = _cut(path, scan, stitch, frame, set(ids))
        hidden.extend(cut)
        for i, (vertices, triangles) in remainders.items():
            source = scan["meshes"][i]
            prefix = source["name"].split("_", 1)[0]
            if len(vertices) > 65535:
                raise ValueError("A stitch cut too much of one mesh: mark a shorter stitch")
            meshes.append(_mesh_entry(source, f"{prefix}_stitchcut_{len(meshes)}", len(meshes), vertices, triangles,
                                      source["material"], stitch["id"], ids))
        material = asphalt if asphalt is not None else template["material"]
        for vertices, triangles in surface_mesh(stitch):
            meshes.append(_mesh_entry(template, f"1ROAD_stitch_{len(meshes)}", len(meshes), vertices, triangles,
                                      material, stitch["id"], ids))
        if len(stitch["rows"]) * 2 * (2 * COLUMNS) < 65535:
            meshes.append(_mesh_entry(template, f"nocol_stitch_skirt_{len(meshes)}", len(meshes), *skirt_mesh(stitch),
                                      material, stitch["id"], ids))
        marked = marks_mesh(stitch) if paint is not None else None
        if marked is not None and len(marked[1]):
            meshes.append(_mesh_entry(template, f"nocol_stitch_paint_{len(meshes)}", len(meshes), *marked, paint,
                                      stitch["id"], ids))
    key = hashlib.sha256(json.dumps([scan.get("copy_key"), stitches], sort_keys=True).encode()).hexdigest()
    return {**scan, "meshes": meshes, "wall_hidden": hidden, "copy_key": key}
