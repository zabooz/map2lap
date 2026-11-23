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

from track import aibends, aicorridor, aicorrections, airacing, editorinfo, kn5, obj_to_kn5, route_race

FILE = Path("ai/fast_lane.ai")
ROUTE = Path("data/map2lap_route.txt")
# Terrain, decks and Editor Stitch can support the line. Raised sidewalks have separate collision.
ROAD_PREFIXES = ("1ROAD_", "1GRAVEL_")
UP = np.array([0.0, 1.0, 0.0])
XZ = [0, 2]
SPACING = 1.5  # Trento-Bondone's open line samples about every 1.54 m.
GRID_RUN_IN = 5.0  # One car length behind the last grid centre.
# Without a mapped runout, probe at most two car lengths in the arrival direction for the timing crossing.
# Only a continuous, full-width road on the finish level can support this short terminal chord.
FINISH_RUN_OUT = 10.0
# Route text is rounded to centimetres; a grid point can differ by a diagonal centimetre and KN5 float rounding.
GRID_XZ_TOL = 0.02
# A 2 m road car needs 1 m on either side of the spline. Wider vehicles would need a larger footprint.
CAR_HALF_WIDTH = 1.0
# Ten centimetres of extra clearance allow for the chord between adjacent spline samples on a typical road bend.
FILLET_CLEARANCE = CAR_HALF_WIDTH + 0.10
RACING_CLEARANCE = CAR_HALF_WIDTH + airacing.TRACKING_MARGIN
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


def _gate_crossings(path, points, name):
    """Indices and fractions of forward crossings of a KN5 timing segment. Pure."""
    left, right = (np.array(points[f"{name}_{side}"]) for side in "LR")
    a, b = left[12:15][XZ], right[12:15][XZ]
    side = b - a
    forward = left[8:11][XZ]
    delta = np.diff(path, axis=0)
    advance = delta @ forward
    t = np.divide((a - path[:-1]) @ forward, advance, out=np.full(len(delta), -1.0), where=advance > 0)
    across = (path[:-1] + t[:, None] * delta - a) @ side
    valid = np.flatnonzero((t >= 0) & (t <= 1) & (across >= 0) & (across <= side @ side))
    return valid, t


def _gate(path, metres, points, name, *, last=False):
    """Route metre of a forward crossing between the KN5 timing markers. Pure."""
    valid, t = _gate_crossings(path, points, name)
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


def _runout_step(road, previous, incoming, xz, metre):
    """Next surface point if the swept chord, turning section and terminal section fit. Pure."""
    x, z = xz
    levels = obj_to_kn5.road_levels(road(x, z, CAR_HALF_WIDTH), x, z)
    level = min(levels, key=lambda y: abs(y - previous[1]), default=np.inf)
    if abs(level - previous[1]) >= obj_to_kn5.LEVEL_GAP_M:
        return None
    site = np.array([x, level, z])
    if not _fits_chord(road, previous, site, CAR_HALF_WIDTH):
        return None
    direction = _unit(site - previous)
    try:
        # A kerb just outside both straight sweeps can still touch the car as it rotates at their join.
        _section(road, previous, _unit(np.cross(UP, incoming + direction)), metre)
        _section(road, site, _unit(np.cross(UP, direction)), metre)
    except NoLine:
        return None
    return site


def _runout_stations(path, metres, finish, points, road):
    """Driveable suffix along the saved route, including its bends and a final partial step. Pure."""
    # _route_path adds a terminal probe for gates at the very end of a centimetre-rounded route.
    end = metres[-2] if metres[-2] > finish + GRID_XZ_TOL else min(metres[-1], finish + FINISH_RUN_OUT)
    corners = np.unique(np.r_[finish, metres[(metres > finish) & (metres < end)], end])
    prefix = "AC" if all(gate in points for gate in route_race.GATES) else "M2"
    height = points[f"{prefix}_AB_FINISH_L"][13] - obj_to_kn5.START_LIFT
    stations = [finish]
    # The first runout chord can turn at the timing plane itself. Include the arriving car in that test.
    before = max(finish - SPACING, metres[0])
    approach = _surface([before, finish], _at(path, metres, [before, finish]), road, height, False)
    previous = approach[-1]
    incoming = _unit(previous - approach[0])

    def supported(metre):
        return _runout_step(road, previous, incoming, _at(path, metres, metre), metre)

    for a, b in zip(corners, corners[1:]):
        for station in np.linspace(a, b, math.ceil((b - a) / SPACING) + 1)[1:]:
            if station - stations[-1] <= GRID_XZ_TOL:
                continue
            site = supported(station)
            if site is None:
                lo, hi = stations[-1], station
                while hi - lo > GRID_XZ_TOL:
                    mid = (lo + hi) / 2
                    if supported(mid) is None:
                        hi = mid
                    else:
                        lo = mid
                if lo > stations[-1] + GRID_XZ_TOL:
                    stations.append(lo)
                return np.asarray(stations)
            incoming = _unit(site - previous)
            previous = site
            stations.append(station)
    return np.asarray(stations)


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


def _fits_chord(road, start, end, width):
    """Whether the swept car width fits between two XYZ samples on their driving level. Pure."""
    centre = (start + end) / 2
    step = end - start
    length = np.linalg.norm(step[XZ])
    if length == 0:
        return True
    forward = step[XZ] / length
    side = forward[::-1] * [1, -1]
    reach = length / 2
    # Round outwards so adjacent probes reuse the same cached face patch.
    patch = road(*centre[XZ], math.ceil(reach + width))
    slope = step[1] / length
    span = aicorridor.free_span(patch, centre, side, reach, slope)
    if span is None or min(-span[0], span[1]) < width:
        return False
    for distance in aicorridor.boundary_stations(patch.edges, centre[XZ], forward, side, reach, width):
        pos = centre + step * (distance / length)
        span = obj_to_kn5._containing_span(obj_to_kn5._road_intervals(patch, pos, side, own_level=True),
                                           join_tol=aicorridor.ROAD_SEAM)
        if span is None or min(-span[0], span[1]) < width:
            return False
    return True


def _corner(vertex, before, after, trim, angle, metre, heights, road):
    """Largest supported tangent arc within trim of the X/Z corner, on the original driving level. Pure."""
    if not trim:
        return vertex[None, :]

    def fit(size):
        arc, _ = _fillet(vertex, before, after, size, angle)
        reference = np.interp(np.linspace(metre - size, metre + size, len(arc)), *heights)
        points = np.column_stack((arc[:, 0], reference, arc[:, 1]))
        if not all(_fits_chord(road, a, b, FILLET_CLEARANCE) for a, b in zip(points, points[1:])):
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


def _straight_join(start, end):
    """Samples on a new straight connector up to its shared arc endpoint (excluded). Pure."""
    steps = math.ceil(np.linalg.norm(end - start) / (SPACING / 2))
    return np.linspace(start, end, steps, endpoint=False)


def _group_arc(path, metres, ends, peak, angle, half, min_radius, heights, road):
    """Larger supported arc for a group and its two approach legs, bounded by adjacent fillet ends. Pure."""
    axis = _unit(np.diff(path, axis=0))
    before, after = axis[0], axis[-1]
    entry, exit = path[1], path[-2]
    advance, depart = np.linalg.solve(np.column_stack((before, after)), exit - entry)
    vertex = entry + advance * before
    # A shallow bend can still be a real offset into another street. Every skipped knot
    # must fit the same entry or exit carriageway as the dominant turn.
    for knots, origin, tangent in ((path[1:peak+1], entry, before), (path[peak:-1], exit, after)):
        if np.max(abs((knots - origin) @ (tangent[::-1] * [1, -1]))) > half:
            return None
    # Keep the neighbouring fillets. Two groups on the same straight each get at most half.
    lengths = np.diff(metres)
    left = min(np.linalg.norm(entry - ends[0]), lengths[0] / 2)
    right = min(np.linalg.norm(exit - ends[1]), lengths[-1] / 2)
    maximum = min(left + advance, right + depart)
    # The midpoint of a tangent arc is R * (1 - cos(angle/2)) from each tangent line.
    # Even the furthest internal knot is within the group's length of the incoming line.
    tangent = math.tan(abs(angle) / 2)
    maximum = min(maximum, tangent * (half + metres[-2] - metres[1]) / (1 - math.cos(angle / 2)))
    minimum = min_radius * tangent

    def fits(size):
        arc, _ = _fillet(vertex, before, after, size, angle)
        # If a tangent ends inside the group, its straight continuation also replaces route geometry.
        lead = _straight_join(entry, arc[0]) if advance > size else arc[:0]
        tail = _straight_join(exit, arc[-1])[::-1] if depart > size else arc[:0]
        xz = np.vstack((lead, arc, tail))
        # Only the selected route legs own this junction. A wide crossing road on the same
        # level must not buy extra room. Map widths are approximate at flared junction mouths.
        rel = xz[:, None] - path[:-1]
        along = np.clip((rel * axis).sum(axis=2), 0, lengths)
        gaps = np.linalg.norm(rel - along[:, :, None] * axis, axis=2)
        nearest = gaps.argmin(axis=1)
        rows = np.arange(len(xz))
        if gaps[rows, nearest].max() + FILLET_CLEARANCE > half:
            return None
        stations = metres[nearest] + along[rows, nearest]
        xyz = np.column_stack((xz[:, 0], np.interp(stations, *heights), xz[:, 1]))
        if all(_fits_chord(road, a, b, FILLET_CLEARANCE) for a, b in zip(xyz, xyz[1:])):
            return xz
        return None

    # A virtual intersection can fall off the road, so even the zero-radius limit can fail.
    # Try successively tighter trims down to the measured single-corner radius. Half a
    # spline sample is enough resolution to find a useful arc; a narrower feasible band is skipped.
    if maximum > minimum + GRID_XZ_TOL:
        for trim in np.linspace(maximum, minimum, math.ceil((maximum - minimum) / (SPACING / 2)) + 1)[:-1]:
            replacement = fits(trim)
            if replacement is not None:
                return replacement
    return None


def _rounded(path, metres, fixed, heights, road, mapped=(), rings=(), *, ownership=False, grouped=True):
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
    last_vertex = np.arange(len(path))
    grouped_turn = np.zeros(len(path))
    if mapped:
        half = _mapped_widths((path[:-1] + path[1:]) / 2, direction, mapped, half_only=True)
        protected = fixed | aibends.ring_vertices(path, rings)
        single = pieces.copy()
        groups = aibends.groups(metres, angles, half, protected) if grouped else ()
        for i, j, peak, angle, width in groups:
            radius = np.linalg.norm(single[peak][0] - path[peak]) / weight[peak]
            ends = single[i - 1][-1], single[j + 1][0]
            legs = slice(i - 1, j + 2)
            arc = _group_arc(path[legs], metres[legs], ends, peak - i + 1, angle, width, radius, heights, road)
            if arc is not None:
                last_vertex[i] = j
                grouped_turn[i] = -np.sign(angle)
                pieces[i:j+1] = [arc] + [path[:0]] * (j - i)
    rounded = np.vstack(pieces)
    # Adjacent maximum-size fillets can meet exactly at a shared chord midpoint.
    keep = np.r_[True, np.linalg.norm(np.diff(rounded, axis=0), axis=1) > 1e-8]
    if not ownership:
        return rounded[keep]
    # Carry the owning route leg through rounding. A global nearest-road search could
    # switch to a parallel road, the other arm of a hairpin or the deck above a tunnel.
    route_m = []
    for i, piece in enumerate(pieces):
        legs = np.arange(max(0, i-1), min(last_vertex[i]+1, len(direction)))
        relative = piece[:, None] - path[legs]
        along = np.clip((relative * direction[legs]).sum(axis=2), 0, length[legs])
        nearest = ((relative - along[:, :, None]*direction[legs])**2).sum(axis=2).argmin(axis=1)
        route_m.extend(metres[legs[nearest]] + along[np.arange(len(piece)), nearest])
    turns = np.repeat(grouped_turn, [len(piece) for piece in pieces])[keep]
    return rounded[keep], np.asarray(route_m)[keep], half if mapped else np.full(len(length), np.inf), turns


def _sample(path, points, circuit, road, mapped=(), rings=(), *, ownership=False, grouped=True):
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
        runout = _runout_stations(path, metres, finish, points, road)
        first, last = rear - GRID_RUN_IN, runout[-1]
        run_in = _at(path, metres, np.linspace(first, rear, math.ceil(GRID_RUN_IN / (SPACING / 2)) + 1))
        approach = np.column_stack((run_in[:, 0], np.full(len(run_in), height), run_in[:, 1]))
        if not all(_fits_chord(road, a, b, CAR_HALF_WIDTH) for a, b in zip(approach, approach[1:])):
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
    rounded = _rounded(at, knots, fixed, (raw, levels), road, mapped, rings, ownership=ownership, grouped=grouped)
    if ownership:
        rounded, route_m, widths, turns = rounded
    length = _distances(rounded)
    if circuit:
        steps = max(3, math.ceil(length[-1] / SPACING))
        along = np.linspace(0, length[-1], steps, endpoint=False)
    else:
        # Keep the finish and every checked runout chord exactly, even on a bend or at a truncated road edge.
        timed_length = length[-1] - (last - finish)
        along = np.r_[np.linspace(0, timed_length, math.ceil(timed_length / SPACING) + 1)[:-1],
                      timed_length + (runout - finish)]
    xz = _at(rounded, length, along)
    result = first + along, xz, height
    if not ownership:
        return result
    station = np.interp(along, length, route_m)
    leg = np.clip(np.searchsorted(knots, station) - 1, 0, len(at)-2)
    pin = ((station >= rear) if circuit else ((station <= start) | (station >= finish)))
    pin[0] = True
    lap_path = np.vstack((xz, xz[0])) if circuit else xz
    for key in points:
        if re.fullmatch(r"AC_TIME_\d+_L", key) and key[:-1] + "R" in points:
            crossing, _ = _gate_crossings(lap_path, points, key[:-2])
            pin[crossing] = pin[(crossing+1) % len(pin)] = True
    ring = aibends.ring_vertices(at, rings)
    pin |= aibends.ring_vertices(xz, rings) | (ring[leg] & ring[leg+1])
    # Hold both ends of chords crossing a timing plane or a ring boundary, and the
    # tangent across the circuit seam. Optimisation supplies the smooth approach.
    pin = pin | np.roll(pin, 1) | np.roll(pin, -1)
    # A grouped junction has already removed an artificial counterturn. Preserve
    # its steering sign, including the straight approaches within a full curvature window.
    groups = []
    for ids in np.split(np.arange(len(turns)), np.flatnonzero(np.diff(turns)) + 1):
        if turns[ids[0]]:
            region = (along >= length[ids[0]]-2*CURVE_HALF_WINDOW) & (along <= length[ids[-1]]+2*CURVE_HALF_WINDOW)
            groups.append((region, turns[ids[0]]))
    return (*result, airacing.RouteRibbon(pin, at[leg], at[leg+1], widths[leg], station, groups))


def _roads(model, meshes):
    """Read active road, sidewalk and wall meshes from the finished KN5."""
    roads = {}
    with open(model, "rb") as stream:
        for i, mesh in enumerate(meshes):
            name = mesh["name"]
            if name.startswith(ROAD_PREFIXES + aicorridor.BLOCKERS) and mesh["active"] and mesh["indices"]:
                vertices, faces = kn5.mesh_arrays(stream, mesh)
                roads[f"{name}/{i}"] = None, vertices["pos"].astype(float), None, faces
    return roads


class _RoadPatch(dict):
    """Road meshes for level queries, with nearby barrier triangles for cross sections."""


def _local_roads(roads):
    """Return a local face lookup with cached metre cells for nearby spline probes. Pure."""
    roads = roads.copy()
    bounds, edges, end_rows = {}, {}, {}
    for name, (_, pos, _, faces) in roads.items():
        xz = pos[faces][:, :, XZ]
        bounds[name] = xz.min(axis=1), xz.max(axis=1)
        if name.startswith(ROAD_PREFIXES):
            pairs, opposite = aicorridor.boundary_edges(faces, with_opposite=True)
            edge = pos[pairs]
            for centre, tips in aicorridor.tile_end_rows(pos, pairs, opposite):
                end_rows.setdefault(centre, []).append(tips)
            edges[name] = edge, edge[:, :, XZ].min(axis=1), edge[:, :, XZ].max(axis=1)
    for i, triangle in enumerate(aicorridor.seam_triangles(end_rows, CAR_HALF_WIDTH)):
        name = f"1ROAD_ai_seam/{i}"
        roads[name] = None, triangle, None, np.array([[0, 1, 2]])
        xz = triangle[:, XZ]
        bounds[name] = xz.min(axis=0, keepdims=True), xz.max(axis=0, keepdims=True)
        edge = triangle[[[0, 1], [1, 2], [2, 0]]]
        edges[name] = edge, edge[:, :, XZ].min(axis=1), edge[:, :, XZ].max(axis=1)
    near = obj_to_kn5._road_near(roads)
    cell = 8.0  # Share face patches across several 1.5 m samples without scanning a whole tile.

    @lru_cache(maxsize=128)
    def patches(ix, iz, margin):
        low = np.array([ix, iz]) * cell
        picked = _RoadPatch()
        barriers, boundaries = [], []
        for name, (_, pos, _, faces) in near(*(low + cell / 2), cell / 2 + margin).items():
            face_low, face_high = bounds[name]
            hit = ((face_low <= low + cell + margin) & (face_high >= low - margin)).all(axis=1)
            if hit.any():
                if name.startswith(aicorridor.BLOCKERS):
                    barriers.append(pos[faces[hit]])
                    continue
                edge, e_low, e_high = edges[name]
                nearby = ((e_low <= low + cell + margin) & (e_high >= low - margin)).all(axis=1)
                if nearby.any():
                    boundaries.append(edge[nearby])
                used, indices = np.unique(faces[hit], return_inverse=True)
                picked[name] = None, pos[used], None, indices.reshape(-1, 3)
        picked.edges = np.concatenate(boundaries) if boundaries else ()
        picked.barriers = np.concatenate(barriers) if barriers else ()
        if barriers:
            floor = [pos[faces] for _, pos, _, faces in picked.values()]
            picked.floor = np.concatenate(floor) if floor else np.empty((0, 3, 3))
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


def _span(road, p, transverse, metre):
    """Connected collision span and its local road patch on this level. Pure."""
    x, y, z = p
    side = transverse[XZ]
    # Start at a two-lane road plus shoulders on each side. Wide roads or intersecting arms expand this search.
    margin = 16
    while True:
        objects = road(x, z, margin)
        span = aicorridor.free_span(objects, p, side)
        if span is None:
            raise NoLine(f"no connected road width at route metre {metre:.1f} (X/Z {x:.2f}/{z:.2f})")
        lo, hi = span
        if max(-lo, hi) < margin:
            return lo, hi, objects
        margin *= 2


def _section(road, p, transverse, metre, *, known_span=None):
    """Width to each connected road edge and cross slope of the sampled level. Pure."""
    x, y, z = p
    side = transverse[XZ]
    if known_span is None:
        lo, hi, objects = _span(road, p, transverse, metre)
    else:
        lo, hi = known_span
        objects = road(x, z, math.ceil(CAR_HALF_WIDTH))
    if min(-lo, hi) < CAR_HALF_WIDTH:
        raise NoLine(f"no room for the car width at route metre {metre:.1f} (X/Z {x:.2f}/{z:.2f})")
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


def _mapped_widths(xz, forward, roads, *, half_only=False):
    """Widths of the nearest aligned map segment at each sample, or infinity without a match. Pure."""
    widths = np.full(len(xz) if half_only else (len(xz), 2), np.inf)
    nearest = np.full(len(xz), np.inf)
    orders = [np.argsort(col) for col in xz.T]
    coords = [xz[order, dim] for dim, order in enumerate(orders)]
    for line, width in roads:
        half = width / 2
        # Enumerate just the points in each segment's bounding strip. A single mountain
        # road feature can cover thousands of samples, most nowhere near a given segment.
        dim = np.ptp(line, axis=0).argmax()
        low = np.minimum(line[:-1], line[1:]) - half
        high = np.maximum(line[:-1], line[1:]) + half
        first = np.searchsorted(coords[dim], low[:, dim])
        counts = np.searchsorted(coords[dim], high[:, dim], side="right") - first
        seg = np.repeat(np.arange(len(first)), counts)
        idx = orders[dim][np.arange(len(seg)) + np.repeat(first-np.cumsum(counts)+counts, counts)]
        use = (xz[idx, 1-dim] >= low[seg, 1-dim]) & (xz[idx, 1-dim] <= high[seg, 1-dim])
        idx, seg = idx[use], seg[use]
        delta = line[seg+1] - line[seg]
        length = np.linalg.norm(delta, axis=1)
        axis = delta / np.where(length > 0, length, 1)[:, None]
        along = np.clip(((xz[idx]-line[seg])*axis).sum(axis=1), 0, length)
        miss = xz[idx] - (line[seg] + along[:, None]*axis)
        distance = np.linalg.norm(miss, axis=1)
        aligned = (forward[idx]*axis).sum(axis=1)
        # A route-ownership match must be within a car half-width of the saved centre.
        limit = min(half, CAR_HALF_WIDTH) if half_only else half
        keep = np.flatnonzero((distance <= limit) & (distance < nearest[idx]) & (abs(aligned) >= math.sqrt(.5)))
        if not len(keep):
            continue
        order = keep[np.lexsort((distance[keep], idx[keep]))]
        best = order[np.r_[True, np.diff(idx[order]) != 0]]
        sites = idx[best]
        nearest[sites] = distance[best]
        if half_only:
            widths[sites] = half
        else:
            side = axis[best, ::-1] * [1, -1]
            offset = (miss[best]*side).sum(axis=1) * np.sign(aligned[best])
            span = (half + offset[:, None]*[-1, 1]) / abs(aligned[best, None])
            widths[sites] = np.maximum(span, CAR_HALF_WIDTH)
    return widths


def _own_widths(xz, forward, widths, mapped_roads, circuit, *, with_openings=False):
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
    openings = mapped.copy()
    for side, corridor in enumerate(result.T):
        neighbor = np.maximum(corridor[before].min(axis=1), corridor[after].min(axis=1))
        # A full car width of sudden extra room can admit a wrong turn. Gentle tapers remain measured.
        crossing = mapped | (corridor > neighbor + 2 * CAR_HALF_WIDTH)
        openings |= crossing
        if crossing.any() and not crossing.all():
            estimated = np.interp(i, i[~crossing], corridor[~crossing], period=count if circuit else None)
            result[crossing, side] = np.minimum(widths[crossing, side], estimated[crossing])
    return (result, openings) if with_openings else result


def _frame(xyz, circuit):
    """Sample distances, forward and lateral unit vectors on the XYZ line. Pure."""
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
    reverse = np.linalg.norm(tangent[:, XZ], axis=1) == 0
    tangent[reverse] = directions[reverse]
    forward = _unit(tangent)
    sides = _unit(np.cross(UP, forward))
    return ds, distance, forward, sides


def _records(xyz, stations, road, circuit, mapped_roads=(), *, checked_sections=None, widths=None):
    """Version-7 records for the sampled positions, route metres, road widths and mapped junctions. Pure."""
    ds, distance, forward, sides = _frame(xyz, circuit)
    if checked_sections is None:
        for i in range(0 if circuit else 1, len(xyz)):
            if not _fits_chord(road, xyz[i - 1], xyz[i], CAR_HALF_WIDTH):
                raise NoLine(f"no room for the car width at route metre {stations[i]:.1f}")
        checked_sections = [_section(road, p, side, metre) for p, side, metre in zip(xyz, sides, stations)]
    sections = np.asarray(checked_sections)
    normal = _unit(np.cross(forward, sides + sections[:, 2, None] * UP))
    curvature = _bend(xyz[:, XZ], circuit)

    points = np.zeros(len(xyz), POINT)
    points["pos"], points["length"], points["id"] = xyz, distance, np.arange(len(xyz))
    detail = np.zeros(len(xyz), DETAIL)
    if widths is None:
        widths = _own_widths(xyz[:, XZ], _unit(forward[:, XZ]), sections[:, :2], mapped_roads, circuit)
    detail["left"], detail["right"] = widths.T
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


def _racing_offsets(base, stations, road, circuit, mapped, route, lap):
    """Bound offsets by the reference spline's own sides and the selected route legs. Pure."""
    _, _, forward, sides = _frame(base, circuit)
    xz, side = base[:, XZ], sides[:, XZ]
    spans = [_span(road, p, normal, m)[:2] for p, normal, m in zip(base, sides, stations)]
    lo, hi = np.asarray(spans).T
    widths, openings = _own_widths(xz, _unit(forward[:, XZ]), np.column_stack((hi, -lo)), mapped, circuit,
                                   with_openings=True)
    # Keep a further route-coordinate tolerance for the finite chords joining samples.
    reserve = RACING_CLEARANCE + GRID_XZ_TOL
    # Where there is no reliable map match, use the width of the reference line after
    # side openings have been clipped. Grid/run-out stations carry the same pins.
    half = np.where(np.isfinite(route.half_width), route.half_width, widths.sum(axis=1)/2)
    lower, upper = airacing.route_bounds(xz, side, route.start, route.end, half, FILLET_CLEARANCE)
    lower = np.maximum(lower, reserve - widths[:, 1])
    upper = np.minimum(upper, widths[:, 0] - reserve)
    # At a side opening an unmatched route leg has no trustworthy map-width bound.
    # Retain its approach chord. A continuous unbranched road can use its measured width.
    unowned = openings & ~np.isfinite(route.half_width)
    pin = route.fixed | unowned | np.roll(unowned, 1) | np.roll(unowned, -1)
    impossible = lower > upper
    if impossible.any():
        # A solitary forced zero between incompatible bounds creates a steering impulse.
        # Keep the original bend around it and let the solver join it on both approaches.
        pin |= airacing.restore_scale(stations, impossible, circuit, lap, 2*CURVE_HALF_WINDOW) < 1
    lower[pin] = upper[pin] = 0
    shift = airacing.offsets(xz, side, lower, upper, circuit)
    # Across a junction a new heading can change which mapped boundary limits
    # the saved side. Refine its offset bound before the expensive KN5 validation.
    for _ in range(2):
        estimate = base.copy()
        estimate[:, XZ] = xz + side * shift[:, None]
        if airacing.folded(estimate[:, XZ], xz, circuit).any():
            break  # The final chord pass restores this local fold before measuring tangents.
        _, _, tangent, _ = _frame(estimate, circuit)
        physical = np.column_stack((hi-shift, shift-lo))
        predicted = _own_widths(estimate[:, XZ], _unit(tangent[:, XZ]), physical, mapped, circuit)
        short = (predicted.min(axis=1) < RACING_CLEARANCE) & (shift != 0)
        if not short.any():
            break
        lower[short] = np.maximum(lower[short], (shift + reserve-predicted[:, 1])[short])
        upper[short] = np.minimum(upper[short], (shift + predicted[:, 0]-reserve)[short])
        conflict = lower > upper
        lower[conflict] = upper[conflict] = 0
        shift = airacing.offsets(xz, side, lower, upper, circuit)
    # Sub-millimetre improvements are below the precision of the source route.
    shift[abs(shift) < .001] = 0
    return shift, lower, upper, half, side, spans


def _move_on_surface(xyz, base, offset, side, dirty, road, failed):
    """Update changed XYZ positions on their reference level and flag any unsupported point."""
    xyz[dirty] = base[dirty]
    for i in np.flatnonzero(dirty & (offset != 0)):
        x, z = base[i, XZ] + offset[i]*side[i]
        levels = obj_to_kn5.road_levels(road(x, z, 0), x, z)
        y = min(levels, key=lambda h: abs(h-base[i, 1]), default=np.inf)
        if abs(y - base[i, 1]) >= obj_to_kn5.LEVEL_GAP_M:
            failed[i] = True
        else:
            xyz[i] = x, y, z


def _steering_failures(curvature, original, moved, groups):
    """Moved points that introduce a steering spike or unwind a grouped junction. Pure."""
    # Minimum integrated curvature alone can trade a single steering spike for
    # gains elsewhere. Retain the old track's peak steering demand at fixed joins.
    spikes = abs(curvature) > abs(original).max() + 1e-8
    failed = moved & (spikes | np.roll(spikes, 1) | np.roll(spikes, -1))
    for region, sign in groups:
        # The source is centimetre-rounded; ignore only steering below that
        # positional resolution over a curvature window.
        if np.any(sign*curvature[region] < np.minimum(0, sign*original[region])
                  - GRID_XZ_TOL/CURVE_HALF_WINDOW**2):
            failed |= region & moved
    return failed


def _check_racing_chords(xyz, dirty, moved, failed, route, half, road, circuit):
    """Flag displaced chords outside their road ribbon or driving-level collision corridor."""
    check = dirty | np.roll(dirty, 1)
    if not circuit:
        check[0] = False
    # Test the entire displaced chord against its owning capsules, including a
    # stationary endpoint beside a narrow junction and the handover between legs.
    displaced = np.flatnonzero(check & (moved | np.roll(moved, 1)))
    fits = airacing.joins_fit(xyz[:, XZ], displaced, route.start, route.end, half, FILLET_CLEARANCE)
    invalid = displaced[~fits]
    failed[invalid] = failed[invalid-1] = True
    for i in np.flatnonzero(check):
        if failed[i] or failed[i-1]:
            continue
        width = RACING_CLEARANCE if moved[i] or moved[i-1] else CAR_HALF_WIDTH
        if (abs(xyz[i, 1] - xyz[i-1, 1]) >= obj_to_kn5.LEVEL_GAP_M
                or not _fits_chord(road, xyz[i-1], xyz[i], width)):
            if not (moved[i-1] or moved[i]):
                raise NoLine(f"no room for the car width at route metre {route.metres[i]:.1f}")
            failed[[i-1, i]] = True


def _check_racing_sections(xyz, stations, road, circuit, dirty, moved, failed, spans, sections):
    """Update measured widths and camber at samples whose position or tangent changed."""
    _, _, new_forward, new_side = _frame(xyz, circuit)
    turned = moved | np.roll(moved, -1) | np.roll(moved, 1)
    for i in np.flatnonzero(dirty | np.roll(dirty, -1) | np.roll(dirty, 1)):
        if failed[i]:
            continue
        try:
            # Unchanged samples with unchanged tangents already have an exact span.
            known = None if turned[i] else spans[i]
            sections[i] = _section(road, xyz[i], new_side[i], stations[i], known_span=known)
            if moved[i] and min(sections[i, :2]) < RACING_CLEARANCE:
                failed[i] = True
        except NoLine:
            neighbours = np.arange(i-1, i+2) % len(xyz)
            if not moved[neighbours].any():
                raise
            failed[neighbours] = True
    return new_forward


def _restore(stations, failed, circuit, lap, scale, name, route_m, log):
    """Log failed bends and blend the offset back onto the reference on their approaches."""
    # Return both ends of a failed chord to the old geometry. A steering transition
    # two curvature windows long keeps a local repair from introducing a new kink.
    starts = failed & ~np.r_[False, failed[:-1]]
    log(f"AI line {name}: local return to reference at route metres "
        + ", ".join(f"{m:.1f}" for m in route_m[starts]))
    bend = airacing.restore_scale(stations, failed, circuit, lap, 2*CURVE_HALF_WINDOW) < 1
    return np.minimum(scale, airacing.restore_scale(stations, bend, circuit, lap, 2*CURVE_HALF_WINDOW))


def _racing_records(base, stations, road, circuit, mapped, route, name, log):
    """Fit a racing line inside the reference carriageway and validate every stored chord."""
    xz = base[:, XZ]
    lap = stations[-1] - stations[0] + np.linalg.norm(xz[-1] - xz[0])
    shift, lower, upper, half, side, spans = _racing_offsets(base, stations, road, circuit, mapped, route, lap)
    xyz, sections = base.copy(), np.empty((len(base), 3))
    dirty = np.ones(len(base), bool)
    scale = np.ones(len(base))
    original = _curvature(xz, 1, circuit)
    energy = airacing.bending_energy(xz, original)
    while True:
        offset = scale * shift
        moved = offset != 0
        failed = moved & ((offset < lower-1e-8) | (offset > upper+1e-8))
        _move_on_surface(xyz, base, offset, side, dirty, road, failed)
        fold = airacing.folded(xyz[:, XZ], xz, circuit) & moved
        if fold.any():
            # Crossing normals in a very tight hairpin can collapse a chord. Restore
            # it before taking a tangent, then check the complete resulting line.
            scale = _restore(stations, fold, circuit, lap, scale, name, route.metres, log)
            dirty[:] = True
            continue
        curvature = _curvature(xyz[:, XZ], 1, circuit)
        failed |= _steering_failures(curvature, original, moved, route.groups)
        _check_racing_chords(xyz, dirty, moved, failed, route, half, road, circuit)
        new_forward = _check_racing_sections(xyz, stations, road, circuit, dirty, moved, failed, spans, sections)
        if not failed.any():
            widths = _own_widths(xyz[:, XZ], _unit(new_forward[:, XZ]), sections[:, :2], mapped, circuit)
            failed = moved & (widths.min(axis=1) < RACING_CLEARANCE)
            if not failed.any():
                # Linearisation and local repairs need not reduce the true nonlinear
                # objective. Keep a complete joined move only if it still does.
                difference = airacing.bending_energy(xyz[:, XZ], curvature) - energy
                rejected = airacing.worse_runs(moved, difference, circuit)
                if not rejected.any():
                    return _records(xyz, stations, road, circuit, checked_sections=sections, widths=widths)
                dirty = rejected
                scale[rejected] = 0
                continue
        reduced = _restore(stations, failed, circuit, lap, scale, name, route.metres, log)
        # Also revisit chords skipped because their unchanged endpoint was flagged.
        dirty = failed | ((scale != reduced) & (shift != 0))
        scale = reduced


def lane_inputs(model, circuit, log):
    """Read exactly the geometry, markers and mapped carriageways used for this line."""
    with (model.parent / ROUTE).open("rb") as stream:
        header = stream.readline().split()
        origin = tuple(map(float, header[1:3])) if header[:1] == [b"anchor"] else ()
        path = np.loadtxt(stream, ndmin=2)
    scan = kn5.scan(model)
    markers = {key: matrix for key, matrix in scan["points"].items()
               if re.fullmatch(r"AC_START_\d+|AC_TIME_\d+_[LR]", key)}
    if not circuit:
        gates = route_race.GATES if all(k in scan["points"] for k in route_race.GATES) else route_race.ALIASES.values()
        markers.update((k, scan["points"][k]) for k in gates if k in scan["points"])
    mapped, rings = aibends.lane_roads(editorinfo.archives(model), log)
    return path, markers, _roads(model, scan["meshes"]), mapped, rings, origin, aicorrections.recipe(model.parent)


def move_reference(model, inputs, circuit, log):
    """The validated automatic line and its exact sample-to-route correspondence for authoring."""
    path, markers, roads, mapped, rings, origin, _ = inputs
    road = _local_roads(roads)

    def records(stations, xz, height, limits):
        xyz = _surface(stations, xz, road, height, circuit)
        points, detail = _racing_records(xyz, stations, road, circuit, mapped, limits, model.stem, log)
        return points, detail, limits, stations, road, aicorrections.Route(path, origin, circuit)

    preferred = _sample(path, markers, circuit, road, mapped, rings, ownership=True)
    try:
        return records(*preferred)
    except NoLine:
        if not mapped:
            raise
        original = _sample(path, markers, circuit, road, mapped, rings, ownership=True, grouped=False)
        if np.array_equal(original[1], preferred[1]):
            raise
        return records(*original)


def moved_line(reference, corrections):
    """Apply recipe moves to the automatic reference and validate their seams and cross-sections."""
    points, detail, ribbon, stations, road, route = reference
    xyz = points["pos"].astype(float)
    sides = _frame(xyz, route.circuit)[3]
    moved, mask = route.moves(corrections, ribbon, xyz, sides, obj_to_kn5.LEVEL_GAP_M)
    for i in np.flatnonzero(mask):
        x, y, z = moved[i]
        levels = obj_to_kn5.road_levels(road(x, z, 0), x, z)
        height = min(levels, key=lambda h: abs(h-y), default=np.inf)
        if abs(height-y) >= obj_to_kn5.LEVEL_GAP_M:
            raise NoLine(f"No driveable surface at route metre {ribbon.metres[i]:.1f}")
        moved[i, 1] = height
    joins = mask | np.roll(mask, 1)
    if not route.circuit:
        joins[0] = False
    indices = np.flatnonzero(joins)
    widths = np.where(np.isfinite(ribbon.half_width), ribbon.half_width, (detail["left"]+detail["right"])/2)
    # At junctions the neighbouring street can share the same road mesh. Keep the
    # same ownership capsule as the automatic line when a route width is known.
    mapped = indices[np.isfinite(ribbon.half_width[indices]) & np.isfinite(ribbon.half_width[indices-1])]
    fit = airacing.joins_fit(moved[:, XZ], mapped, ribbon.start, ribbon.end, widths, FILLET_CLEARANCE)
    if not fit.all():
        raise NoLine(f"Outside the selected road at route metre {ribbon.metres[mapped[~fit][0]]:.1f}")
    side = _frame(moved, route.circuit)[3]
    for i in indices:
        m = ribbon.metres[i]
        if not _fits_chord(road, moved[i-1], moved[i], FILLET_CLEARANCE):
            raise NoLine(f"Insufficient clearance at route metre {m:.1f}")
        if min(_section(road, moved[i], side[i], m)[:2]) < FILLET_CLEARANCE:
            raise NoLine(f"Insufficient clearance at route metre {m:.1f}")
    return moved, mask


def checked_moves(reference, moves, finish):
    """Try the complete recipe, isolating failed edits in recipe order if necessary."""
    original = reference[0]["pos"].astype(float)
    empty = np.zeros(len(original), bool)
    def apply(items):
        xyz, mask = moved_line(reference, items) if items else (original, empty)
        return finish(xyz, mask)
    try:
        return apply(moves), {}
    except ValueError:
        pass
    accepted, skipped = [], {}
    result = apply([])
    for move in moves:
        try:
            result = apply([*accepted, move])
        except ValueError as error:
            reason = str(error)
            if "route metre" not in reason:
                reason += f" at route metre {move['anchor']['metre']:.1f}"
            skipped[move["id"]] = reason
        else:
            accepted.append(move)
    return result, skipped


def calculate(model, inputs, circuit, lane, log):
    """Compute from already-read inputs and write the complete spline to lane."""
    start = perf_counter()
    reference = move_reference(model, inputs, circuit, log)
    points, detail, ribbon, stations, road, route = reference

    def finish(moved, fixed):
        if not fixed.any():
            return points, detail
        # Refit the adjoining approaches over a curvature window. Other bends
        # already have their validated optimum. The authored samples are immutable.
        lap = stations[-1]-stations[0] + np.linalg.norm(moved[-1, XZ]-moved[0, XZ])
        approach = airacing.restore_scale(stations, fixed, circuit, lap, CURVE_HALF_WINDOW) < 1
        limits = ribbon._replace(fixed=ribbon.fixed | fixed | ~approach)
        return _racing_records(moved, stations, road, circuit, inputs[3], limits, model.stem, log)

    (points, detail), skipped = checked_moves(reference, inputs[-1], finish)
    for reason in skipped.values():
        log(f"AI correction skipped: {reason}")
    _write_lane(lane, points, detail)
    log(f"AI line: {len(points):,} points in {perf_counter() - start:.2f} s")
    return skipped


def regenerate(model, *, circuit, log=print):
    """Generate Build/Rebuild's installed line and record its inputs and result."""
    from track import ailinestate
    model = Path(model)
    fingerprint = None
    try:
        inputs = lane_inputs(model, circuit, log)
        fingerprint = ailinestate.fingerprint(inputs, circuit)
        skipped = calculate(model, inputs, circuit, model.parent / FILE, log)
        ailinestate.record_ready(model.parent, fingerprint, skipped)
    except ailinestate.ERRORS as error:
        reason = ailinestate.reason(error)
        ailinestate.clear(model.parent, fingerprint, reason)
        log(f"AI line skipped: {reason}")
        return False
    return True
