"""Version-7 Assetto Corsa AI lines sampled on the finished Route or Circuit KN5."""
from functools import lru_cache
import math
import os
from pathlib import Path
import re
import struct
import tempfile
from time import perf_counter

import numpy as np

from track import editorinfo, kn5, obj_to_kn5, route_race

FILE = Path("ai/fast_lane.ai")
ROUTE = Path("data/map2lap_route.txt")
# Road collisions include bridges, gravel and Editor Stitch. Kerbs are raised edges of that surface.
ROAD_PREFIXES = ("1ROAD_", "1GRAVEL_")
UP = np.array([0.0, 1.0, 0.0])
XZ = [0, 2]
SPACING = 1.5  # Trento-Bondone's open line samples about every 1.54 m.
GRID_RUN_IN = 5.0  # One car length behind the last grid centre.
FINISH_RUN_OUT = 10.0  # Two car lengths beyond the finish.
# Route text is rounded to centimetres; a grid point can differ by a diagonal centimetre and KN5 float rounding.
GRID_XZ_TOL = 0.02
# A 2 m road car needs 1 m on either side of the spline. Wider cars need more; narrow roads may keep their original line.
CAR_HALF_WIDTH = 1.0
# Ten centimetres of extra clearance allow for the chord between adjacent spline samples on a typical road bend.
FILLET_CLEARANCE = CAR_HALF_WIDTH + 0.10
# Look beyond the side opening of a typical junction. Larger plazas may need mapped junction data.
WIDTH_NEIGHBORHOOD = 25.0
# Estimate curvature over 15 m of line, roughly an input chord on a major road. A shorter window amplifies tiny joins;
# a hairpin sharper than the window also needs its local curvature for the speed limit.
CURVE_HALF_WINDOW = 7.5
# Straight-line radius convention used in the v7 records, in metres.
STRAIGHT_RADIUS = 999_999
HEADER = struct.Struct("<4i")
COUNT = struct.Struct("<i")
POINT = np.dtype([("pos", "<f4", 3), ("length", "<f4"), ("id", "<i4")])
DETAIL = np.dtype([
    ("speed", "<f4"), ("gas", "<f4"), ("brake", "<f4"), ("lat_g", "<f4"), ("radius", "<f4"),
    ("left", "<f4"), ("right", "<f4"), ("camber", "<f4"), ("direction", "<f4"), ("normal", "<f4", 3),
    ("length", "<f4"), ("forward", "<f4", 3), ("tag", "<f4"), ("grade", "<f4"),
])


class NoLine(ValueError):
    """The saved route or its driveable surface cannot support an AI line."""


def read_lane(path):
    """Read the v7 point and detail arrays from path, with any trailing data kept opaque."""
    data = Path(path).read_bytes()
    if len(data) < HEADER.size:
        raise ValueError("Incomplete AI line header")
    version, n, _, _ = HEADER.unpack_from(data)
    extra = HEADER.size + n * POINT.itemsize
    end = extra + COUNT.size + n * DETAIL.itemsize
    if version != 7 or n < 2 or end > len(data) or COUNT.unpack_from(data, extra)[0] != n:
        raise ValueError("Invalid v7 AI line or mismatched counts")
    return np.frombuffer(data, POINT, n, HEADER.size), np.frombuffer(data, DETAIL, n, extra + COUNT.size), data[end:]


def _write_lane(path, points, detail):
    """Write v7 records to a temporary file alongside path, then publish the whole line."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix=".fast_lane_", dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
        try:
            n = len(points)
            stream.write(HEADER.pack(7, n, 0, 0))
            stream.write(points.tobytes())
            stream.write(COUNT.pack(n))
            stream.write(detail.tobytes())
            stream.close()
            os.replace(tmp, path)
        finally:
            tmp.unlink(missing_ok=True)


def _unit(vectors):
    """Normalize nonzero vectors by row. Pure."""
    length = np.linalg.norm(vectors, axis=-1, keepdims=True)
    if np.any(length == 0):
        raise NoLine("AI path has a zero-length direction")
    return vectors / length


def _distances(path):
    """Cumulative horizontal metres on the ordered X/Z path. Pure."""
    return np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(path, axis=0), axis=1))]


def _project(path, metres, point):
    """Return the metres and horizontal miss distance onto the X/Z path. Pure."""
    delta = np.diff(path, axis=0)
    t = np.clip(np.sum((point - path[:-1]) * delta, axis=1) / np.sum(delta**2, axis=1), 0, 1)
    projected = path[:-1] + t[:, None] * delta
    gaps = np.linalg.norm(projected - point, axis=1)
    i = gaps.argmin()
    return metres[i] + t[i] * (metres[i + 1] - metres[i]), gaps[i]


def _at(path, metres, stations):
    """Interpolate X/Z positions of stations on the supplied polyline. Pure."""
    return np.stack([np.interp(stations, metres, axis) for axis in path.T], axis=-1)


def _gate(path, metres, points, name, *, last=False):
    """Route metre of a forward crossing between the KN5 timing markers. Pure."""
    left, right = (np.array(points[f"{name}_{side}"]) for side in "LR")
    a, b = left[12:15][XZ], right[12:15][XZ]
    side = b - a
    forward = left[8:11][XZ]
    delta = np.diff(path, axis=0)
    advance = delta @ forward
    t = np.divide((a - path[:-1]) @ forward, advance, out=np.full(len(delta), -1.0), where=advance > 0)
    across = (path[:-1] + t[:, None] * delta - a) @ side
    valid = np.flatnonzero((t >= 0) & (t <= 1) & (across >= 0) & (across <= side @ side))
    if not len(valid):
        raise NoLine(f"{name} does not cross the saved route in the driving direction")
    i = valid[-1 if last else 0]
    return metres[i] + t[i] * (metres[i + 1] - metres[i])


def _grid(points):
    """The KN5 starting slots in driving order from rear to front. Pure."""
    slots = sorted((int(name[9:]), value) for name, value in points.items() if re.fullmatch(r"AC_START_\d+", name))
    return np.asarray([value for _, value in reversed(slots)] if slots and slots[0][0] == 0 else [])


def _grid_join(a, direction, b, forward):
    """Reconstruct a bend between consecutive grid positions from their forward tangents. Pure."""
    axes = np.column_stack((direction, forward))
    if abs(np.linalg.det(axes)) <= np.finfo(float).eps:
        return []
    advance, depart = np.linalg.solve(axes, b - a)
    # Each leg has to fit between adjacent slots, which the builder spaces SLOT_GAP apart along the road.
    if min(advance, depart) > GRID_XZ_TOL and advance + depart <= obj_to_kn5.SLOT_GAP + GRID_XZ_TOL:
        return [a + advance * direction]
    return []


def _route_path(path, points, grid):
    """Place an open X/Z path through the rear grid and both KN5 timing gates. Pure."""
    if not len(grid):
        raise NoLine("missing start grid")
    positions = grid[:, 12:15]
    slots = positions[:, XZ]
    directions = _unit(grid[:, 8:11][:, XZ])
    rear = slots[0]
    end_direction = _unit(path[-1] - path[-2])
    origin = path[0]
    old_metres = _distances(path)
    # Walk back from the front. Any slot outside the exported centreline indicates an approach before pin 1.
    first_on_route = len(slots)
    for j in range(len(slots) - 1, -1, -1):
        if _project(path, old_metres, slots[j])[1] > GRID_XZ_TOL:
            break
        first_on_route = j
    if first_on_route:
        lead = []
        for j in range(first_on_route):
            lead.append(slots[j])
            if j + 1 < first_on_route:
                lead.extend(_grid_join(slots[j], directions[j], slots[j + 1], directions[j + 1]))
        if np.linalg.norm(lead[-1] - origin) <= GRID_XZ_TOL:
            lead.pop()
        else:
            lead.extend(_grid_join(slots[first_on_route - 1], directions[first_on_route - 1],
                                   origin, _unit(path[1] - origin)))
        path = np.vstack((*lead, path))
    metres = _distances(path)
    rear_m, _ = _project(path, metres, rear)
    # An on-route grid may have several metres of its original approach already recorded before the rear slot.
    if rear_m < GRID_RUN_IN:
        before = path[0] - (GRID_RUN_IN - rear_m) * (directions[0] if first_on_route else _unit(path[1] - path[0]))
        path = np.vstack((before, path))
    offset = _project(path, _distances(path), origin)[0]
    path = np.vstack((path, path[-1] + FINISH_RUN_OUT * end_direction))
    metres = _distances(path)
    prefix = "AC" if all(gate in points for gate in route_race.GATES) else "M2"
    finish = _gate(path, metres, points, f"{prefix}_AB_FINISH", last=True)
    start = _gate(path, metres, points, f"{prefix}_AB_START")
    rear_m, _ = _project(path, metres, rear)
    if not rear_m < start < finish:
        raise NoLine("the start grid and A–B gates are out of order along the route")
    return path, metres - offset, rear_m - offset, start - offset, finish - offset, positions[0, 1]


def _on_level(road, xz, height):
    """Whether X/Z has collision road within the level gap of the supplied reference height. Pure."""
    x, z = xz
    return any(abs(y - height) < obj_to_kn5.LEVEL_GAP_M for y in obj_to_kn5.road_levels(road(x, z, 0), x, z))


def _fillet(vertex, before, after, trim, signed_angle):
    """Circular arc and unit tangents for a corner with equal trim on its incoming and outgoing edges. Pure."""
    radius = trim / math.tan(abs(signed_angle) / 2)
    start = vertex - trim * before
    inside = np.sign(signed_angle) * np.array([-before[1], before[0]])
    # Probe the swept width more finely on tight turns, where a short gap can fall between the stored samples.
    reach = min(SPACING / 2, CAR_HALF_WIDTH * math.sqrt(radius / CURVE_HALF_WINDOW) / 3)
    steps = max(2, math.ceil(radius * abs(signed_angle) / reach))
    angles = np.linspace(0, signed_angle, steps + 1)
    c, s = np.cos(angles), np.sin(angles)
    tangent = np.column_stack((c * before[0] - s * before[1], s * before[0] + c * before[1]))
    inward = np.sign(signed_angle) * np.column_stack((-tangent[:, 1], tangent[:, 0]))
    arc = start + radius * (inside - inward)
    arc[-1] = vertex + trim * after
    return arc, tangent


def _corner(vertex, before, after, trim, angle, metre, heights, road):
    """Largest supported tangent arc within trim of the X/Z corner, on the original driving level. Pure."""
    if not trim:
        return vertex[None, :]

    def fit(size):
        arc, tangent = _fillet(vertex, before, after, size, angle)
        side = tangent[:, ::-1] * [-FILLET_CLEARANCE, FILLET_CLEARANCE]
        reference = np.interp(np.linspace(metre - size, metre + size, len(arc)), *heights)
        for p, width, y in zip(arc, side, reference):
            if not all(_on_level(road, probe, y) for probe in (p, p + width, p - width)):
                return None
        return arc

    result = fit(trim)
    if result is not None:
        return result
    low, high = 0.0, trim
    # The exported road coordinates are rounded to centimetres; sub-centimetre differences in trim are noise.
    while high - low > GRID_XZ_TOL:
        mid = (low + high) / 2
        arc = fit(mid)
        if arc is None:
            high = mid
        else:
            result, low = arc, mid
    return vertex[None, :] if result is None else result


def _rounded(path, metres, fixed, heights, road):
    """Round free vertices without moving X/Z at pinned metres or overlapping adjacent fillets. Pure."""
    delta = np.diff(path, axis=0)
    length = np.diff(metres)
    direction = _unit(delta)
    before, after = direction[:-1], direction[1:]
    cross = before[:, 0] * after[:, 1] - before[:, 1] * after[:, 0]
    angles = np.arctan2(cross, (before * after).sum(axis=1))
    # For equal radii each turn needs a share of the common chord proportional to tan(turn angle / 2).
    weight = np.zeros(len(path))
    movable = ~fixed[1:-1] & (np.abs(cross) > np.finfo(float).eps)
    weight[1:-1][movable] = np.tan(np.abs(angles[movable]) / 2)
    total = weight[:-1] + weight[1:]
    unit_trim = np.divide(length, total, out=np.zeros_like(length), where=total > 0)
    trims = weight[1:-1] * np.minimum(unit_trim[:-1], unit_trim[1:])
    pieces = [path[:1]]
    for vertex, a, b, trim, angle, metre in zip(path[1:-1], before, after, trims, angles, metres[1:-1]):
        pieces.append(_corner(vertex, a, b, trim, angle, metre, heights, road))
    pieces.append(path[-1:])
    rounded = np.vstack(pieces)
    # Adjacent maximum-size fillets can meet exactly at a shared chord midpoint.
    return rounded[np.r_[True, np.linalg.norm(np.diff(rounded, axis=0), axis=1) > 1e-8]]


def _sample(path, points, circuit, road):
    """Sample a rounded track on its KN5 road while holding the timing lines and grid in place. Pure."""
    path = np.asarray(path, dtype=float)
    if path.ndim != 2 or path.shape[1] != 2 or not np.isfinite(path).all():
        raise NoLine("invalid X/Z coordinates in the saved route")
    path = path[np.r_[True, (path[1:] != path[:-1]).any(axis=1)]]
    if len(path) < 2:
        raise NoLine("saved route has fewer than two points")
    grid = _grid(points)
    if circuit:
        path, metres = obj_to_kn5._closed_lap(path)
        if len(path) < 4:
            raise NoLine("saved Circuit has fewer than three distinct points")
        first = _gate(path, metres, points, "AC_TIME_0")
        last = first + metres[-1]
        height = (points["AC_TIME_0_L"][13] + points["AC_TIME_0_R"][13]) / 2
        # Look only on the grid approach directly behind the timing line, including when it spans the route seam.
        track = np.concatenate((path[:-1], path))
        track_m = np.r_[metres[:-1] - metres[-1], metres]
        rear = last
        if len(grid):
            approach = max(track_m[0], first - obj_to_kn5.STAGE_START_GAP_M - (len(grid) - 1) * obj_to_kn5.SLOT_GAP)
            at = np.searchsorted(track_m, approach, side="left")
            stop = np.searchsorted(track_m, first, side="right")
            span = np.r_[approach, track_m[at:stop], first]
            span = np.unique(span)
            m, gap = _project(_at(track, track_m, span), span, grid[0, 12:15][XZ])
            if gap <= GRID_XZ_TOL:
                rear = last + m - first
        knots = np.unique(np.r_[first, metres[metres > first], metres[(metres > 0) & (metres < first)] + metres[-1], last, rear])
        at = _at(path, metres, knots % metres[-1])
        fixed = (knots == first) | (knots >= rear)
    else:
        path, metres, rear, start, finish, height = _route_path(path, points, grid)
        first, last = rear - GRID_RUN_IN, min(finish + FINISH_RUN_OUT, metres[-1])
        run_in = _at(path, metres, np.linspace(first, rear, math.ceil(GRID_RUN_IN / (SPACING / 2)) + 1))
        if not all(_on_level(road, p, height) for p in run_in):
            first = rear
        knots = np.unique(np.r_[first, metres[(metres > first) & (metres < last)], start, finish, last])
        at = _at(path, metres, knots)
        fixed = (knots <= start) | (knots >= finish)
    # Drop duplicate positions introduced by a timing plane landing numerically on a saved polyline vertex.
    keep = np.r_[np.linalg.norm(np.diff(at, axis=0), axis=1) > 1e-8, True]
    fixed[1:] |= fixed[:-1] & ~keep[:-1]
    at, knots, fixed = at[keep], knots[keep], fixed[keep]
    raw = np.linspace(first, last, math.ceil((last - first) / SPACING) + 1)
    levels = _surface(raw, _at(at, knots, raw), road, height, circuit)[:, 1]
    rounded = _rounded(at, knots, fixed, (raw, levels), road)
    length = _distances(rounded)
    steps = max(3 if circuit else 1, math.ceil(length[-1] / SPACING))
    along = np.linspace(0, length[-1], steps if circuit else steps + 1, endpoint=not circuit)
    return first + along, _at(rounded, length, along), height


def _roads(model, meshes):
    """Read the final KN5's active collision road meshes as the arrays used by the road queries."""
    roads = {}
    with open(model, "rb") as stream:
        for i, mesh in enumerate(meshes):
            name = mesh["name"]
            if name.startswith(ROAD_PREFIXES) and mesh["active"] and mesh["indices"]:
                vertices, faces = kn5.mesh_arrays(stream, mesh)
                roads[f"{name}/{i}"] = None, vertices["pos"].astype(float), vertices["uv"], faces
    return roads


def _local_roads(roads):
    """Return a local face lookup with cached metre cells for nearby spline probes. Pure."""
    near = obj_to_kn5._road_near(roads)
    cell = 8.0  # Share face patches across several 1.5 m samples without scanning a whole tile.

    @lru_cache(maxsize=128)
    def patches(ix, iz, margin):
        low = np.array([ix, iz]) * cell
        picked = {}
        for name, (mat, pos, uv, faces) in near(*(low + cell / 2), cell / 2 + margin).items():
            triangles = pos[faces][:, :, XZ]
            hit = ((triangles.min(axis=1) <= low + cell + margin) & (triangles.max(axis=1) >= low - margin)).all(axis=1)
            if hit.any():
                used, indices = np.unique(faces[hit], return_inverse=True)
                picked[name] = mat, pos[used], uv[used], indices.reshape(-1, 3)
        return picked

    return lambda x, z, margin: patches(math.floor(x / cell), math.floor(z / cell), margin)


def _surface(stations, xz, road, height, circuit):
    """Follow the road level nearest the preceding sample, starting at the installed grid or gate. Pure."""
    xyz = np.column_stack((xz[:, 0], np.empty(len(xz)), xz[:, 1]))
    for i, (x, z) in enumerate(xz):
        levels = obj_to_kn5.road_levels(road(x, z, 0), x, z)
        if not levels:
            raise NoLine(f"no driveable road at route metre {stations[i]:.1f} (X/Z {x:.2f}/{z:.2f})")
        new = min(levels, key=lambda level: abs(level - height))
        # A change by a whole road level in one sample step is a discontinuity between collision decks.
        if i and abs(new - height) >= obj_to_kn5.LEVEL_GAP_M:
            raise NoLine(f"driveable level changes abruptly at route metre {stations[i]:.1f}")
        xyz[i, 1] = height = new
    if circuit and abs(xyz[-1, 1] - xyz[0, 1]) >= obj_to_kn5.LEVEL_GAP_M:
        raise NoLine(f"Circuit does not close on the same road level at route metre {stations[0]:.1f}")
    return xyz


def _section(road, p, transverse, metre):
    """Width to each connected road edge and cross slope of the sampled level. Pure."""
    x, y, z = p
    side = transverse[XZ]
    # Start at a two-lane road plus shoulders on each side. Wide roads or intersecting arms expand this search.
    margin = 16
    while True:
        objects = road(x, z, margin)
        span = obj_to_kn5._containing_span(obj_to_kn5._road_intervals(objects, p, side, own_level=True))
        if span is None:
            raise NoLine(f"no connected road width at route metre {metre:.1f} (X/Z {x:.2f}/{z:.2f})")
        lo, hi = span
        if max(-lo, hi) < margin:
            break
        margin *= 2
    offsets = (max(lo / 2, -CAR_HALF_WIDTH), min(hi / 2, CAR_HALF_WIDTH))
    heights = []
    for offset in offsets:
        sx, sz = p[XZ] + side * offset
        levels = obj_to_kn5.road_levels(objects, sx, sz)
        own = [level for level in levels if abs(level - y) < obj_to_kn5.LEVEL_GAP_M]
        if not own:
            raise NoLine(f"no driveable road beside the AI line at route metre {metre:.1f}")
        heights.append(min(own, key=lambda level: abs(level - y)))
    # Measured against Kunos's meshes: SideLeft is up × forward, SideRight its opposite.
    return hi, -lo, (heights[1] - heights[0]) / (offsets[1] - offsets[0])


def _curvature(xz, window, circuit):
    """Signed inverse circumradius of X/Z samples window steps apart, positive toward up × forward. Pure."""
    n = len(xz)
    i = np.arange(n)
    window = min(window, (n - 1) // 2) if circuit else window
    previous = (i - window) % n if circuit else np.maximum(0, i - window)
    following = (i + window) % n if circuit else np.minimum(n - 1, i + window)
    a, b = xz - xz[previous], xz[following] - xz
    cross = a[:, 1] * b[:, 0] - a[:, 0] * b[:, 1]
    denom = np.linalg.norm(a, axis=1) * np.linalg.norm(b, axis=1) * np.linalg.norm(a + b, axis=1)
    return np.divide(2 * cross, denom, out=np.zeros_like(cross), where=denom > 0)


def _bend(xz, circuit):
    """Curvature for speed and radius from the rounded X/Z line, retaining very tight bends. Pure."""
    smooth = _curvature(xz, round(CURVE_HALF_WINDOW / SPACING), circuit)
    local = _curvature(xz, 1, circuit)
    return np.where(np.abs(local) > np.maximum(np.abs(smooth), 1 / (2 * CURVE_HALF_WINDOW)), local, smooth)


def _speed(curvature, ds, circuit):
    """Target speeds in m/s from curvature, sample distances and braking/acceleration limits. Pure."""
    # Conservative road-car targets: 0.65 g lateral, 0.70 g braking, 0.25 g acceleration, 120 km/h.
    lateral, brake, gas = np.array([0.65, 0.70, 0.25]) * 9.81
    limits = lateral / np.maximum(np.abs(curvature), lateral / (120 / 3.6)**2)
    if circuit:
        first = int(limits.argmin())
        ids = (first + np.arange(len(ds) + 1)) % len(ds)
    else:
        limits[[0, -1]] = 0.0
        ids = np.arange(len(ds))
    speed = limits[ids].copy()
    distances = ds[ids]
    for i in range(len(ids) - 1, 0, -1):
        speed[i - 1] = min(speed[i - 1], speed[i] + 2 * brake * distances[i])
    for i in range(1, len(ids)):
        speed[i] = min(speed[i], speed[i - 1] + 2 * gas * distances[i])
    limits[ids] = speed
    advance = np.roll(ds, -1)
    accel = np.divide(np.roll(limits, -1) - limits, 2 * advance,
                      out=np.zeros_like(limits), where=advance > 0)
    return np.sqrt(limits), np.clip(accel / gas, 0, 1), np.clip(-accel / brake, 0, 1)


def _mapped_widths(xz, forward, roads):
    """Widths of the aligned mapped road containing each X/Z sample, or infinity without a match. Pure."""
    widths = np.full((len(xz), 2), np.inf)
    nearest = np.full(len(xz), np.inf)
    for line, width in roads:
        half = width / 2
        # Tile facts already clip roads to the tile. Most spline points are outside each road's bounds.
        hits = np.flatnonzero(((xz >= line.min(axis=0) - half) & (xz <= line.max(axis=0) + half)).all(axis=1))
        if not len(hits):
            continue
        for a, b in zip(line, line[1:]):
            length = np.linalg.norm(b - a)
            if length == 0:
                continue
            direction = (b - a) / length
            projected = np.clip(((xz[hits] - a) * direction).sum(axis=1), 0, length)
            delta = xz[hits] - (a + projected[:, None] * direction)
            distance = np.linalg.norm(delta, axis=1)
            aligned = (forward[hits] * direction).sum(axis=1)
            # Choose a road whose bearing is closer to parallel than perpendicular to the spline tangent.
            use = (distance <= half) & (distance < nearest[hits]) & (np.abs(aligned) >= math.sqrt(.5))
            sites = hits[use]
            side = direction[::-1] * [1, -1]
            offset = (delta[use] @ side) * np.sign(aligned[use])
            span = (half + offset[:, None] * [-1, 1]) / np.abs(aligned[use, None])
            widths[sites] = np.maximum(span, CAR_HALF_WIDTH)
            nearest[sites] = distance[use]
    return widths


def _own_widths(xz, forward, widths, mapped_roads, circuit):
    """Interpolate across mapped junctions or short width bulges using the driven road's sides. Pure."""
    count = len(widths)
    i = np.arange(count)
    reach = min(round(WIDTH_NEIGHBORHOOD / SPACING), count // 2)
    mapped = np.zeros(count, dtype=bool)
    areas = obj_to_kn5._junction_geometry(mapped_roads)[0] if mapped_roads else ()
    for x, z, radius_sq in areas:
        mapped |= ((xz - [x, z])**2).sum(axis=1) <= radius_sq
    # A side opening is wider than its nearby widths on both sides of the crossing. Each side is independent.
    before = np.maximum(0, i[:, None] - np.arange(1, reach + 1))
    after = np.minimum(count - 1, i[:, None] + np.arange(1, reach + 1))
    if circuit:
        before, after = (i[:, None] - np.arange(1, reach + 1)) % count, (i[:, None] + np.arange(1, reach + 1)) % count
    result = np.minimum(widths, _mapped_widths(xz, forward, mapped_roads))
    for side, corridor in enumerate(result.T):
        neighbor = np.maximum(corridor[before].min(axis=1), corridor[after].min(axis=1))
        # A full car width of sudden extra room can admit a wrong turn. Gentle tapers remain measured.
        crossing = mapped | (corridor > neighbor + 2 * CAR_HALF_WIDTH)
        if crossing.any() and not crossing.all():
            estimated = np.interp(i, i[~crossing], corridor[~crossing], period=count if circuit else None)
            result[crossing, side] = np.minimum(widths[crossing, side], estimated[crossing])
    return result


def _records(xyz, stations, road, circuit, mapped_roads=()):
    """Version-7 records for the sampled positions, route metres, road widths and mapped junctions. Pure."""
    steps = xyz - np.roll(xyz, 1, axis=0)
    ds = np.linalg.norm(steps, axis=1)
    distance = np.cumsum(ds) - ds[0]
    if not circuit:
        steps[0] = steps[1]
        ds[0] = 0
    directions = _unit(steps)
    tangent = directions + np.roll(directions, -1, axis=0)
    if circuit:
        tangent[0] = directions[1]
    else:
        tangent[-1] = directions[-1]
    reverse = np.linalg.norm(tangent, axis=1) == 0
    tangent[reverse] = directions[reverse]
    forward = _unit(tangent)
    sides = _unit(np.cross(UP, forward))
    sections = np.array([_section(road, p, side, metre) for p, side, metre in zip(xyz, sides, stations)])
    normal = _unit(np.cross(forward, sides + sections[:, 2, None] * UP))
    curvature = _bend(xyz[:, XZ], circuit)

    points = np.zeros(len(xyz), POINT)
    points["pos"], points["length"], points["id"] = xyz, distance, np.arange(len(xyz))
    detail = np.zeros(len(xyz), DETAIL)
    detail["left"], detail["right"] = _own_widths(xyz[:, XZ], _unit(forward[:, XZ]),
                                                 sections[:, :2], mapped_roads, circuit).T
    detail["normal"], detail["forward"] = normal, forward
    detail["length"] = ds
    if not circuit:
        detail["length"][-1] = 0  # Both terminal records of the open Trento line store zero.
    detail["radius"] = 1 / np.maximum(np.abs(curvature), 1 / STRAIGHT_RADIUS)
    detail["direction"] = np.where(curvature < 0, -1, 1)
    # Trento's Camber is the bank angle seen toward the turn, derived from the lateral normal.
    bank = np.arcsin(np.clip(np.sum(sides * normal, axis=1), -1, 1))
    detail["camber"] = bank * detail["direction"]
    detail["grade"] = forward[:, 1]
    detail["speed"], detail["gas"], detail["brake"] = _speed(curvature, ds, circuit)
    return points, detail


def regenerate(model, *, circuit, log=print):
    """Replace the AI line from the completed KN5 and its saved route, or explain why no line can be written."""
    start = perf_counter()
    model = Path(model)
    lane = model.parent / FILE
    try:
        lane.unlink(missing_ok=True)
        path = np.loadtxt(model.parent / ROUTE, skiprows=1, ndmin=2)
        scan = kn5.scan(model)
        road = _local_roads(_roads(model, scan["meshes"]))
        stations, xz, height = _sample(path, scan["points"], circuit, road)
        xyz = _surface(stations, xz, road, height, circuit)
        mapped = list(obj_to_kn5.mapped_road_lines(editorinfo.archives(model), log))
        points, detail = _records(xyz, stations, road, circuit, mapped)
        _write_lane(lane, points, detail)
    except (AssertionError, IndexError, KeyError, OSError, ValueError, struct.error) as error:
        reason = f"missing KN5 marker {error}" if isinstance(error, KeyError) else str(error) or "invalid installed KN5"
        log(f"AI line skipped: {reason}")
        return False
    log(f"AI line: {len(points):,} points in {perf_counter() - start:.2f} s")
    return True
