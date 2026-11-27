"""Version-7 Assetto Corsa AI lines sampled on the finished Route or Circuit KN5."""
from functools import lru_cache
import json
import math
import os
from pathlib import Path
import re
import struct
import tempfile
from time import perf_counter

import numpy as np

from app import buildoptions, mytracks
from track import aibends, aicorridor, aicorrections, airedraw, airacing, editorinfo, kn5, obj_to_kn5, route_race

import surface

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
# On paved ground a 2 m physics cell is 1ROAD when its centre is at most surface.ROAD_EDGE_M (1 m)
# outside the mapped edge. Beyond the edge marking, Heiligenblut, Sahara and Cap Corse measured
# 1 m of 1ROAD at the median, just 0.1 m at the fifth percentile along the jagged grid boundary.
# With FILLET_CLEARANCE a road car's outer wheel can reach 0.9 m beyond the marking in a bend.
AI_ROAD_EDGE_M = 1.0
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
        raise NoLine("Incomplete AI line header")
    version, n, _, _ = HEADER.unpack_from(data)
    extra = HEADER.size + n * POINT.itemsize
    end = extra + COUNT.size + n * DETAIL.itemsize
    if version != 7 or n < 2 or end > len(data) or COUNT.unpack_from(data, extra)[0] != n:
        raise NoLine("Invalid v7 AI line or mismatched counts")
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
            stream.write(struct.pack("<i", 0))  # HasGrid: this spline carries no spatial search grid.
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
    prefix = "M2_GRID_" if "M2_GRID_0" in points else "AC_START_"
    slots = sorted((int(name[len(prefix):]), value) for name, value in points.items()
                   if re.fullmatch(prefix + r"\d+", name))
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


def _distinct_path(path):
    """Read finite X/Z legs, collapsing consecutive points equal at saved route precision. Pure."""
    path = np.asarray(path, dtype=float)
    if path.ndim != 2 or path.shape[1] != 2 or not np.isfinite(path).all():
        raise NoLine("invalid X/Z coordinates in the saved route")
    if len(path):
        path = path[np.r_[True, (path[1:] != path[:-1]).any(axis=1)]]
    if len(path) < 2:
        raise NoLine("saved route has fewer than two points")
    return path


def _route_path(path, points, grid):
    """Place an open X/Z path through the rear grid and both KN5 timing gates. Pure."""
    path = _distinct_path(path)
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
            if j + 1 < first_on_route and "M2_GRID_0" not in points:
                lead.extend(_grid_join(slots[j], directions[j], slots[j + 1], directions[j + 1]))
        if np.linalg.norm(lead[-1] - origin) <= GRID_XZ_TOL:
            lead.pop()
        elif "M2_GRID_0" not in points:
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
        _section(road, previous, _unit(np.cross(UP, incoming + direction)), metre, limits=(CAR_HALF_WIDTH, CAR_HALF_WIDTH))
        _section(road, site, _unit(np.cross(UP, direction)), metre, limits=(CAR_HALF_WIDTH, CAR_HALF_WIDTH))
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


def _fits_chord(road, start, end, width, *, tracking=False):
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
    margin = math.hypot(width, reach + (road.tooth_length if tracking else 0.))
    patch = road(*centre[XZ], math.ceil(margin))
    slope = step[1] / length
    span = aicorridor.free_span(patch, centre, side, reach, slope, limits=(width, width))

    def fits(pos, span, sweep=0.):
        if span is None:
            return False
        widths = span[1], -span[0]
        if min(widths) >= width:
            return True
        return tracking and min(aicorridor.tracking_widths(patch, pos, side, widths, (width, width), sweep=sweep)) >= width-1e-8

    if not fits(centre, span, reach):
        # At a skew abutment the sweep projects the slab underside onto the lower approach.
        # Before rejecting the actual car footprint, prove which faces are covered by the
        # traversed deck at their own X/Z. Keep protruding concrete and vertical walls hard.
        if width != CAR_HALF_WIDTH or not patch.built or not len(patch.barriers):
            return False
        if not any(aicorridor.built_span(patch, pt, side) is not None for pt in (start, end)):
            return False
        exposed = aicorridor.exposed_barriers(patch, centre, side, reach, slope, width)
        span = aicorridor.free_span(patch, centre, side, reach, slope, limits=(width, width), barriers=exposed)
        if not fits(centre, span):
            return False
    for distance in aicorridor.boundary_stations(patch.edges, centre[XZ], forward, side, reach, width,
                                                  corners=tracking and patch.raster):
        pos = centre + step * (distance / length)
        span = aicorridor.floor_span(patch, pos, side, aicorridor.ROAD_SEAM)
        if not fits(pos, span):
            return False
        deck = aicorridor.built_span(patch, pos, side) if patch.built else None
        if deck is not None and min(-deck[0], deck[1]) < width:
            return False
    return True


def _arc_fits_band(xz, starts, ends, half):
    """Check each chord of a fillet against its two consecutive owning legs, including their handover. Pure."""
    delta = ends - starts
    relative = xz[:, None] - starts
    fraction = np.clip((relative * delta).sum(axis=2) / (delta * delta).sum(axis=1), 0, 1)
    miss = relative - fraction[:, :, None] * delta
    leg = (miss * miss).sum(axis=2).argmin(axis=1)
    return airacing.joins_fit(xz, np.arange(1, len(xz)), starts[leg], ends[leg], half[leg], FILLET_CLEARANCE).all()


def _corner(vertex, before, after, trim, angle, metre, heights, road, band):
    """Largest supported tangent arc within trim of the X/Z corner, on the original driving level. Pure."""
    if not trim or not np.isfinite(band[2]).all() or min(band[2]) <= RACING_CLEARANCE:
        return vertex[None, :]

    def fit(size):
        arc, _ = _fillet(vertex, before, after, size, angle)
        if not _arc_fits_band(arc, *band):
            return None
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


def _group_arc(path, metres, ends, peak, angle, half, min_radius, heights, road, band):
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
        if min(band[2]) <= RACING_CLEARANCE or not _arc_fits_band(xz, *band):
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


def _narrow_curve(pieces, path, metres, direction, angles, fixed, band, heights, road):
    """Interpolate the surveyed centre of a narrow, continuously turning road through its original knots."""
    # Adjacent changes of heading survey a curve, including an S bend. A lone angled
    # intersection gives no evidence of a curved centreline and retains its mapped vertex.
    narrow = np.isfinite(band[2]) & (band[2] <= RACING_CLEARANCE)
    turns = np.r_[0., angles, 0.]
    smooth = (np.r_[False, narrow] | np.r_[narrow, False]) & ~fixed
    turning = abs(turns) > np.finfo(float).eps
    smooth &= turning & (np.roll(turning, 1) | np.roll(turning, -1))
    for i in np.flatnonzero(smooth[:-1] | smooth[1:]):
        if not np.isfinite(band[2][i]) or not len(pieces[i]) or not len(pieces[i+1]):
            continue
        start, end = pieces[i][-1], pieces[i+1][0]
        length = np.linalg.norm(end - start)
        if length <= GRID_XZ_TOL:
            continue
        axis = direction[i]
        before = _unit(direction[i-1] + axis) if smooth[i] else axis
        after = _unit(axis + direction[i+1]) if smooth[i+1] else axis
        # Hermite tangents interpolate the surveyed knots. With both tangents along the leg
        # the result is exactly the original straight. Check its whole car strip on this level.
        t = np.linspace(0., 1., max(2, math.ceil(length / (SPACING / 2))) + 1)[:, None]
        xz = start + t * (end - start) + length * t * (1 - t) * ((1 - t) * (before-axis) - t * (after-axis))
        if not _arc_fits_band(xz, *(v[i:i+1] for v in band)):
            continue
        station = metres[i] + (xz-path[i]) @ axis
        xyz = np.column_stack((xz[:, 0], np.interp(station, *heights), xz[:, 1]))
        if all(_fits_chord(road, a, b, FILLET_CLEARANCE) for a, b in zip(xyz, xyz[1:])):
            pieces[i] = np.vstack((pieces[i], xz[1:-1]))


def _rounded(path, metres, fixed, heights, road, mapped=(), rings=(), *, ownership=False, grouped=True, band=None):
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
    if band is None:
        band, _ = _leg_bands(path, metres, heights, road, mapped)
    half = band[2]
    pieces = [path[:1]]
    for i, (a, b, trim, angle) in enumerate(zip(before, after, trims, angles)):
        corner_band = tuple(value[i:i+2] for value in band)
        pieces.append(_corner(path[i+1], a, b, trim, angle, metres[i+1], heights, road, corner_band))
    pieces.append(path[-1:])
    last_vertex = np.arange(len(path))
    grouped_turn = np.zeros(len(path))
    if mapped:
        protected = fixed | aibends.ring_vertices(path, rings)
        single = pieces.copy()
        groups = aibends.groups(metres, angles, half, protected) if grouped else ()
        for i, j, peak, angle, width in groups:
            radius = np.linalg.norm(single[peak][0] - path[peak]) / weight[peak]
            ends = single[i - 1][-1], single[j + 1][0]
            legs = slice(i - 1, j + 2)
            arc = _group_arc(path[legs], metres[legs], ends, peak - i + 1, angle, width, radius, heights, road,
                             tuple(value[i-1:j+1] for value in band))
            if arc is not None:
                last_vertex[i] = j
                grouped_turn[i] = -np.sign(angle)
                pieces[i:j+1] = [arc] + [path[:0]] * (j - i)
    _narrow_curve(pieces, path, metres, direction, angles, fixed, band, heights, road)
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
    return rounded[keep], np.asarray(route_m)[keep], half, turns


def _sample(path, points, circuit, road, mapped=(), rings=(), *, ownership=False, grouped=True, redraws=(), free_road=None, diagnostic=False):
    """Sample a rounded track on its KN5 road while holding the timing lines and grid in place. Pure."""
    grid = _grid(points)
    if circuit:
        path, metres = obj_to_kn5._closed_lap(_distinct_path(path))
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
            # Centre guides include route vertices between slots, so use their actual distance.
            distance = metres[-1] if "M2_GRID_0" in points else (
                obj_to_kn5.STAGE_START_GAP_M + (len(grid) - 1) * obj_to_kn5.SLOT_GAP)
            approach = max(track_m[0], first - distance - GRID_XZ_TOL)
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
    probe = _at(at, knots, raw)
    free = np.zeros(len(raw), bool)
    for section in redraws:
        inside = (raw >= section.start) & (raw <= section.end)
        if inside.any():
            probe[inside] = section.positions(raw[inside])[:, XZ]
            free[inside] = section.item["free"]
    levels = _surface(raw, probe, _per_point(road, free_road, free), height, circuit, diagnostic=diagnostic)[:, 1]
    band, painted = _leg_bands(at, knots, (raw, levels), road, mapped)
    rounded = _rounded(at, knots, fixed, (raw, levels), road, mapped, rings,
                       ownership=True, grouped=grouped, band=band)
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
    # At an unrounded narrow bend, keep the vertex itself. Resampling across it cuts the corner.
    narrow = ~np.isfinite(widths) | (widths <= RACING_CLEARANCE)
    axes = _unit(np.diff(at, axis=0))
    bends = (narrow[1:] | narrow[:-1]) & (np.linalg.norm(np.diff(axes, axis=0), axis=1) > 1e-8)
    vertices = np.interp(knots[1:-1][bends], route_m, length)
    if len(vertices):
        # A knot a few centimetres from a regular station makes an artificial steering
        # spike in the three-point curvature. Space stations evenly between pinned knots.
        pinned = np.unique(np.r_[0., vertices, length[-1]] if circuit else
                           np.r_[0., vertices, timed_length + (runout - finish)])
        intervals = [np.linspace(a, b, math.ceil((b-a) / SPACING), endpoint=False)
                     for a, b in zip(pinned, pinned[1:]) if b - a > 1e-8]
        along = np.concatenate(intervals if circuit else [*intervals, pinned[-1:]])
    xz = _at(rounded, length, along)
    result = first + along, xz, height
    if not ownership:
        return result
    station = np.interp(along, length, route_m)
    leg = np.clip(np.searchsorted(knots, station) - 1, 0, len(at)-2)
    pin = ((station >= rear) if circuit else ((station <= start) | (station >= finish)))
    pin[0] = True
    lap_path = np.vstack((xz, xz[0])) if circuit else xz
    hard = pin.copy()
    splits = []
    for key in points:
        if re.fullmatch(r"AC_TIME_\d+_L", key) and key[:-1] + "R" in points:
            name = key[:-2]
            crossing, _ = _gate_crossings(lap_path, points, name)
            if name == "AC_TIME_0":
                hard[crossing] = hard[(crossing+1) % len(pin)] = True
            else:
                # Locate the sector on the saved route even if a rounded corner misses the markers.
                gate_hits, t = _gate_crossings(at, points, name)
                if len(gate_hits):
                    i = gate_hits[0]
                    metre = knots[i] + t[i]*(knots[i+1]-knots[i])
                else:
                    marker = np.array(points[key])[12:15][XZ]
                    metre, _ = _project(at, knots, marker)
                splits.append((name, points, metre))
            pin[crossing] = pin[(crossing+1) % len(pin)] = True
    # Keep both ends of the grid and finish chords fixed, including a gate between samples.
    hard = hard | np.roll(hard, 1) | np.roll(hard, -1)
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
    return (*result, airacing.RouteRibbon(pin, band[0][leg], band[1][leg], widths[leg], station, groups, hard, tuple(splits),
                                        None if circuit else finish, tuple(value[leg] for value in painted)))


FREE_FLOORS = ("1GRASS_", "1KERB_")


class _RoadMeshes(dict):
    """KN5 surfaces and the spacing of this track's collision terrain."""
    cell = aicorridor.acgrid.CELL


def _roads(model, meshes, free=False):
    """Read active road, sidewalk and wall meshes from the finished KN5."""
    roads = _RoadMeshes()
    manifest = Path(model).parent / mytracks.FILE
    if manifest.is_file():
        info = json.loads(manifest.read_text(encoding="utf-8"))
        roads.cell = buildoptions.terrain_cell(info.get("terrain_cell_m", roads.cell))
    with open(model, "rb") as stream:
        for i, mesh in enumerate(meshes):
            name = mesh["name"]
            if name.startswith(ROAD_PREFIXES + aicorridor.BLOCKERS + (FREE_FLOORS if free else ())) and mesh["active"] and mesh["indices"]:
                vertices, faces = kn5.mesh_arrays(stream, mesh)
                roads[f"{name}/{i}"] = None, vertices["pos"].astype(float), None, faces
    return roads


class _RoadPatch(dict):
    """Road meshes for level queries, with nearby barrier triangles for cross sections."""


def _local_roads(roads, free=False):
    """Return a local face lookup with cached metre cells for nearby spline probes. Pure."""
    # Expose permitted grass and kerb triangles through the same indexed road
    # query. WALL meshes retain their collision role, including tunnel floors exported as walls.
    tooth_length = getattr(roads, "cell", aicorridor.acgrid.CELL) * math.sqrt(2)
    roads = {("1ROAD_free_" + name if free and name.startswith(FREE_FLOORS) else name): mesh
             for name, mesh in roads.items() if name.startswith(ROAD_PREFIXES + aicorridor.BLOCKERS)
             or free and name.startswith(FREE_FLOORS)}
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
        barriers, boundaries, built_edges = [], [], []
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
                    if name.startswith(aicorridor.BUILT):
                        built_edges.append(boundaries[-1])
                used, indices = np.unique(faces[hit], return_inverse=True)
                picked[name] = None, pos[used], None, indices.reshape(-1, 3)
        picked.tooth_length = tooth_length
        picked.raster = bool(picked) and all(
            name.startswith(("1ROAD_ground_", "1GRAVEL_ground_")) for name in picked)
        picked.built = {name: mesh for name, mesh in picked.items() if name.startswith(aicorridor.BUILT)}
        picked.built_edges = np.concatenate(built_edges) if built_edges else ()
        picked.edges = np.concatenate(boundaries) if boundaries else ()
        picked.barriers = np.concatenate(barriers) if barriers else ()
        floor = [pos[faces] for _, pos, _, faces in picked.values()]
        picked.floor = np.concatenate(floor) if floor else np.empty((0, 3, 3))
        return picked

    def local(x, z, margin):
        return patches(math.floor(x / cell), math.floor(z / cell), margin)

    local.tooth_length = tooth_length
    local.free = free
    return local


def _per_point(road, wider, free):
    """Select the index for the correction owning each sample, including repeated passages. Pure."""
    return [wider if allow else road for allow in free] if free.any() else road


def _query(road, i):
    return road[i] if isinstance(road, list) else road


def _surface(stations, xz, road, height, circuit, *, diagnostic=False):
    """Follow the road level nearest the preceding sample, starting at the installed grid or gate. Pure."""
    xyz = np.column_stack((xz[:, 0], np.empty(len(xz)), xz[:, 1]))
    for i, (x, z) in enumerate(xz):
        levels = obj_to_kn5.road_levels(_query(road, i)(x, z, 0), x, z)
        if diagnostic and not levels:
            xyz[i, 1] = height
            continue
        if not levels:
            raise NoLine(f"no driveable road at route metre {stations[i]:.1f} (X/Z {x:.2f}/{z:.2f})")
        new = min(levels, key=lambda level: abs(level - height))
        # A change by a whole road level in one sample step is a discontinuity between collision decks.
        if not diagnostic and i and abs(new - height) >= obj_to_kn5.LEVEL_GAP_M:
            raise NoLine(f"driveable level changes abruptly at route metre {stations[i]:.1f}")
        xyz[i, 1] = height = new
    if not diagnostic and circuit and abs(xyz[-1, 1] - xyz[0, 1]) >= obj_to_kn5.LEVEL_GAP_M:
        raise NoLine(f"Circuit does not close on the same road level at route metre {stations[0]:.1f}")
    return xyz


def _span(road, p, transverse, metre, limits=None, *, along=0.):
    """Connected collision span and its local road patch on this level. Pure."""
    x, y, z = p
    side = transverse[XZ]
    # Start at a two-lane road plus shoulders on each side. Wide roads or intersecting arms expand this search.
    if limits is not None and not np.isfinite(limits).all():
        limits = None
    margin = 16 if limits is None else math.ceil(math.hypot(max(CAR_HALF_WIDTH, *limits), along))
    while True:
        objects = road(x, z, margin)
        span = aicorridor.free_span(objects, p, side, limits=limits)
        if span is None:
            raise NoLine(f"no connected road width at route metre {metre:.1f} (X/Z {x:.2f}/{z:.2f})")
        lo, hi = span
        if limits is not None or max(-lo, hi) < margin:
            return lo, hi, objects
        margin *= 2


def _section(road, p, transverse, metre, *, known_span=None, limits=None):
    """Width to each connected road edge and cross slope of the sampled level. Pure."""
    x, y, z = p
    side = transverse[XZ]
    if known_span is None:
        lo, hi, objects = _span(road, p, transverse, metre, limits)
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
    # Nominal road-car model: allow 0.65 g of tyre grip for cornering and 0.70 g for braking.
    # Engine power limits acceleration to an assumed 0.25 g. Grip varies by surface, and constant
    # acceleration overestimates speed on long straights where drag and gearing matter.
    lateral, brake, gas = np.array([0.65, 0.70, 0.25]) * 9.81
    bend = np.abs(curvature)
    limits = np.divide(lateral, bend, out=np.full(len(ds), np.inf), where=bend > 0)
    # An entirely collinear closed input has no bend to set a finite speed. Use a standing lap start.
    if circuit and not np.isfinite(limits).any():
        limits[0] = 0.0
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


def _map_candidates(xz, roads, edge):
    """Yield nearby sample/segment pairs and offsets from their finite axes. Pure."""
    orders = [np.argsort(col) for col in xz.T]
    coords = [xz[order, dim] for dim, order in enumerate(orders)]
    for line, width in roads:
        half = width / 2 + edge
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
        if len(idx):
            yield line, half, idx, seg, axis, miss


def _mapped_legs(xz, forward, roads):
    """Centre shifts and nominal half-widths of map segments aligned with the original route legs. Pure."""
    widths = np.full(len(xz), np.inf)
    centre_shift = np.zeros_like(xz)
    nearest = np.full(len(xz), np.inf)
    for _, half, idx, _, axis, miss in _map_candidates(xz, roads, 0.):
        distance = np.linalg.norm(miss, axis=1)
        aligned = (forward[idx]*axis).sum(axis=1)
        # A route-ownership match must be within a car half-width of the saved centre.
        limit = min(half, CAR_HALF_WIDTH)
        keep = np.flatnonzero((distance <= limit) & (distance < nearest[idx]) & (abs(aligned) >= math.sqrt(.5)))
        if not len(keep):
            continue
        order = keep[np.lexsort((distance[keep], idx[keep]))]
        best = order[np.r_[True, np.diff(idx[order]) != 0]]
        sites = idx[best]
        nearest[sites] = distance[best]
        widths[sites] = half
        normal = forward[sites, ::-1] * [1, -1]
        centre_shift[sites] = -normal * (miss[best] * normal).sum(axis=1)[:, None]
    return centre_shift, widths


def _leg_bands(path, metres, heights, road, mapped):
    """Solver and visible road capsules of the original legs, before rounding or racing offsets. Pure."""
    centres = (path[:-1] + path[1:]) / 2
    axis = _unit(np.diff(path, axis=0))
    shift, half = _mapped_legs(centres, axis, mapped)
    # AC uses the exported sides for passing. The extra physics cells support the racing
    # line's tracking reserve, but only painted asphalt is mapped room for another car.
    painted = path[:-1] + shift, path[1:] + shift, half + surface.PHOTO_ROAD_EDGE_M
    half += AI_ROAD_EDGE_M
    for i, (x, z) in enumerate(centres):
        patch = road(x, z, 0)
        if not patch.built:
            continue
        y = np.interp((metres[i] + metres[i+1])/2, *heights)
        side = axis[i, ::-1] * [1, -1]
        centre = np.array([x, y, z])
        margin = math.ceil(half[i]) if np.isfinite(half[i]) else math.ceil(CAR_HALF_WIDTH)
        span = aicorridor.built_span(road(x, z, margin), centre, side)
        if span is not None:
            # A built ribbon has a real outer edge even where coplanar terrain continues.
            while span is not None and np.isfinite(span).all() and max(-span[0], span[1]) >= margin:
                margin = math.ceil(max(-span[0], span[1])) + 1
                span = aicorridor.built_span(road(x, z, margin), centre, side)
            if span is None or not np.isfinite(span).all():
                continue
            half[i] = (span[1] - span[0]) / 2
            shift[i] = side * ((span[1] + span[0]) / 2)
    return (path[:-1] + shift, path[1:] + shift, half), painted


def _band_widths(xz, side, route):
    """Distances to the owned capsule along this sample's normal. Unknown legs keep only the car footprint. Pure."""
    known = np.isfinite(route.half_width)
    half = np.where(known, route.half_width, CAR_HALF_WIDTH)
    lo, hi = airacing.route_bounds(xz, side, route.start, route.end, half, 0)
    return np.where(known[:, None], np.maximum(0, np.column_stack((hi, -lo))), CAR_HALF_WIDTH)


def _painted_widths(xz, side, painted):
    """Intersect the sample normal with its visible mapped road. Unmapped decks retain their built width. Pure."""
    start, end, half = painted
    known = np.isfinite(half)
    lo, hi = airacing.route_bounds(xz, side, start, end, np.where(known, half, 0.), 0.)
    return np.where(known[:, None], np.maximum(0., np.column_stack((hi, -lo))), np.inf)


def _containing_paint(xz, side, mapped):
    """Measure the containing carriageway along the normal of each free sample. Pure."""
    nearest = np.full(len(xz), np.inf)
    crossing = np.ones(len(xz), dtype=bool)
    forward = side[:, ::-1] * [1, -1]
    half_width = np.zeros(len(xz))
    start, end = np.empty_like(xz), np.empty_like(xz)
    for line, half, idx, seg, axis, miss in _map_candidates(xz, mapped, surface.PHOTO_ROAD_EDGE_M):
        distance = np.linalg.norm(miss, axis=1)
        # A remote strip can intersect the normal on just one side of the car. Only a
        # capsule containing the centre can own the sample. Ignore coincident map nodes.
        candidates = np.flatnonzero((distance <= half) & axis.any(axis=1))
        if not len(candidates):
            continue
        # Where paint overlaps, a road running more across than along the stroke is
        # a side street. Heading cannot distinguish two parallel decks in plan view.
        across = abs((side[idx] * axis).sum(axis=1)) > abs((forward[idx] * axis).sum(axis=1))
        order = candidates[np.lexsort((distance[candidates], across[candidates], idx[candidates]))]
        best = order[np.r_[True, np.diff(idx[order]) != 0]]
        better = ((across[best] < crossing[idx[best]]) |
                  ((across[best] == crossing[idx[best]]) & (distance[best] < nearest[idx[best]])))
        best = best[better]
        sites, legs = idx[best], seg[best]
        crossing[sites] = across[best]
        nearest[sites], half_width[sites] = distance[best], half
        start[sites], end[sites] = line[legs], line[legs+1]
    found = np.isfinite(nearest)
    widths = np.full((len(xz), 2), np.nan)
    widths[found] = _painted_widths(xz[found], side[found], (start[found], end[found], half_width[found]))
    return widths


def _free_paint(xyz, side, free, mapped, painted, physical, circuit):
    """Measure authored samples on their own map roads and bound unmapped runs by their joined ends. Pure."""
    if free is None or not free.any():
        return painted
    cap = np.full_like(physical, np.inf) if painted is None else painted.copy()
    cap[free] = _containing_paint(xyz[free][:, XZ], side[free], mapped)
    indices = np.flatnonzero(free)
    runs = np.split(indices, np.flatnonzero(np.diff(indices) > 1) + 1)
    if circuit and len(runs) > 1 and free[0] and free[-1]:
        runs = [np.r_[runs[-1], runs[0]], *runs[1:-1]]
    for run in runs:
        missing = np.isnan(cap[run, 0])
        if not missing.any():
            continue
        ends = []
        for i, adjacent in ((run[0], run[0]-1), (run[-1], run[-1]+1)):
            if np.isnan(cap[i, 0]):
                if circuit:
                    adjacent %= len(xyz)
                if (not (0 <= adjacent < len(xyz)) or free[adjacent]
                        or not np.isfinite(cap[adjacent]).all()):
                    ends.append(None)
                    continue
                i = adjacent
            ends.append(np.minimum(physical[i], cap[i]))
        # A runout has only its entry to bound passing room. With no adjoining
        # map at either end, use collision measured at the marks. Outside the
        # stroke an unmapped route's search can stop at just the car footprint.
        entry, exit_width = ends
        if entry is None and exit_width is None:
            entry, exit_width = physical[run[0]], physical[run[-1]]
        elif entry is None:
            entry = exit_width
        elif exit_width is None:
            exit_width = entry
        distance = _distances(xyz[run])
        fraction = distance[missing, None] / distance[-1] if distance[-1] else 0.
        cap[run[missing]] = entry + fraction * (exit_width - entry)
    return cap


def _export_widths(physical, limits, painted, junctions, circuit):
    """Sides for passing, bounded by collision, the owned road and its visible paint. Pure."""
    allowed = np.minimum(physical, limits)
    # Identify side openings on the measured road before paint can hide a width spike.
    widths = _junction_widths(allowed, allowed.copy(), junctions, circuit)
    return widths if painted is None else np.minimum(widths, painted)


def _junction_limits(band, junction, known, circuit):
    """Allow a mapped mouth to carry the widths of its adjoining route approaches. Pure."""
    mouth = junction & known
    anchors = np.flatnonzero(~junction & known)
    if mouth.any() and len(anchors):
        band = band.copy()
        for widths in band.T:
            approach = np.interp(np.flatnonzero(mouth), anchors, widths[anchors], period=len(band) if circuit else None)
            widths[mouth] = np.maximum(widths[mouth], approach)
    return band


def _section_limits(xz, side, route, areas, circuit, free):
    """Finite search envelope for the owned legs and mapped mouths at the current heading. Pure."""
    band = _band_widths(xz, side, route)
    junction = _in_junctions(xz, areas)
    limits = _junction_limits(band, junction, np.isfinite(route.half_width), circuit)
    if free is not None:
        limits[free] = np.inf
    return limits, junction


def _own_widths(xz, side, widths, areas, circuit, *, route, free=None):
    """Collision can narrow the selected route corridor at each new heading. Pure."""
    limits, junction = _section_limits(xz, side, route, areas, circuit, free)
    allowed = np.minimum(widths, limits)
    return _junction_widths(allowed, allowed.copy(), junction, circuit)


def _in_junctions(xz, areas):
    """Which points lie in mapped junction mouths. Pure."""
    mapped = np.zeros(len(xz), dtype=bool)
    for x, z, radius_sq in areas:
        mapped |= ((xz - [x, z])**2).sum(axis=1) <= radius_sq
    return mapped


def _junction_widths(widths, result, mapped, circuit):
    """Limit side openings using the surrounding route in driving order. Pure."""
    count = len(widths)
    i = np.arange(count)
    reach = min(round(WIDTH_NEIGHBORHOOD / SPACING), count // 2)
    # A side opening is wider than its nearby widths on both sides of the crossing. Each side is independent.
    before = np.maximum(0, i[:, None] - np.arange(1, reach + 1))
    after = np.minimum(count - 1, i[:, None] + np.arange(1, reach + 1))
    if circuit:
        before, after = (i[:, None] - np.arange(1, reach + 1)) % count, (i[:, None] + np.arange(1, reach + 1)) % count
    for side, corridor in enumerate(result.T):
        neighbor = np.maximum(corridor[before].min(axis=1), corridor[after].min(axis=1))
        # A full car width of sudden extra room can admit a wrong turn. Gentle tapers remain measured.
        crossing = mapped | (corridor > neighbor + 2 * CAR_HALF_WIDTH)
        if crossing.any() and not crossing.all():
            estimated = np.interp(i, i[~crossing], corridor[~crossing], period=count if circuit else None)
            result[crossing, side] = np.minimum(widths[crossing, side], estimated[crossing])
    return result


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


def _records(xyz, stations, road, circuit, *, checked_sections=None, widths=None):
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
        widths = sections[:, :2]
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


def _tracking_spans(base, sides, stations, road, circuit, limits):
    """Physical widths for export and tracking-reserve widths for the solver on this reference."""
    spans, tracking = [], []
    for i, (point, side) in enumerate(zip(base, sides)):
        local = _query(road, i)
        lo, hi, patch = _span(local, point, side, stations[i], limits[i], along=local.tooth_length)
        spans.append((lo, hi))
        tracking.append(aicorridor.tracking_widths(patch, point, side[XZ], (hi, -lo), limits[i], refine=True))
    measured = np.array(tracking)
    tracking = measured.copy()
    # An inside corner can fall between the two original cross sections. Give
    # its connected floor width to the solver before checking the displaced chord.
    for i in range(0 if circuit else 1, len(base)):
        step = base[i] - base[i-1]
        length = np.linalg.norm(step[XZ])
        if not length:
            continue
        mid = (base[i] + base[i-1])/2
        widths = np.maximum(measured[i], measured[i-1])
        local = _query(road, i)
        reach = math.hypot(max(widths), length/2 + local.tooth_length)
        patch = local(*mid[XZ], math.ceil(reach))
        if not len(patch.edges):
            continue
        forward = step[XZ]/length
        side = forward[::-1]*[1, -1]
        for t in aicorridor.corner_stations(patch.edges, mid[XZ], forward, side, length/2, widths, raster=patch.raster):
            point = mid + step*(t/length)
            span = aicorridor.floor_span(patch, point, side, aicorridor.ROAD_SEAM)
            if span is not None:
                usable = aicorridor.tracking_widths(patch, point, side, (span[1], -span[0]), widths, refine=True)
                tracking[[i-1, i]] = np.minimum(tracking[[i-1, i]], usable)
    return spans, tracking


def _racing_offsets(base, stations, road, circuit, areas, route, lap, free):
    """Bound offsets by the reference spline's own sides and the selected route legs. Pure."""
    sides = _frame(base, circuit)[3]
    xz, side = base[:, XZ], sides[:, XZ]
    limits, junction = _section_limits(xz, side, route, areas, circuit, free)
    spans, physical = _tracking_spans(base, sides, stations, road, circuit, limits)
    hi, lo = physical[:, 0], -physical[:, 1]
    widths = _junction_widths(physical, physical.copy(), junction, circuit)
    # Keep a further route-coordinate tolerance for the finite chords joining samples.
    reserve = RACING_CLEARANCE + GRID_XZ_TOL
    # Missing road ownership permits just the vehicle footprint centred on the reference.
    half = np.where(np.isfinite(route.half_width), route.half_width, CAR_HALF_WIDTH)
    lower, upper = airacing.route_bounds(xz, side, route.start, route.end, half, reserve)
    lower = np.maximum(lower, reserve - widths[:, 1])
    upper = np.minimum(upper, widths[:, 0] - reserve)
    # Keep the joining chord as well when a leg has no reliable width.
    unowned = ~np.isfinite(route.half_width)
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
        new_side = _frame(estimate, circuit)[3]
        physical = np.column_stack((hi-shift, shift-lo))
        predicted = _own_widths(estimate[:, XZ], new_side[:, XZ], physical, areas, circuit, route=route, free=free)
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
        levels = obj_to_kn5.road_levels(_query(road, i)(x, z, 0), x, z)
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


def _check_racing_chords(xyz, dirty, moved, failed, route, half, road, circuit, free):
    """Flag displaced chords outside their road ribbon or driving-level collision corridor."""
    check = dirty | np.roll(dirty, 1)
    if not circuit:
        check[0] = False
    # Test the entire displaced chord against its owning capsules, including a
    # stationary endpoint beside a narrow junction and the handover between legs.
    owned = np.isfinite(route.half_width)
    if free is not None:
        owned &= ~free
    owned &= np.roll(owned, 1)
    shifted = moved | np.roll(moved, 1)
    fixed = np.flatnonzero(check & owned & ~shifted)
    fits = airacing.joins_fit(xyz[:, XZ], fixed, route.start, route.end, half, CAR_HALF_WIDTH)
    if not fits.all():
        raise NoLine(f"car leaves the road band at route metre {route.metres[fixed[~fits][0]]:.1f}")
    displaced = np.flatnonzero(check & owned & shifted)
    fits = airacing.joins_fit(xyz[:, XZ], displaced, route.start, route.end, half, FILLET_CLEARANCE)
    invalid = displaced[~fits]
    failed[invalid] = failed[invalid-1] = True
    for i in np.flatnonzero(check):
        if failed[i] or failed[i-1]:
            continue
        width = RACING_CLEARANCE if moved[i] or moved[i-1] else CAR_HALF_WIDTH
        if (abs(xyz[i, 1] - xyz[i-1, 1]) >= obj_to_kn5.LEVEL_GAP_M
                or not _fits_chord(_query(road, i), xyz[i-1], xyz[i], width, tracking=bool(moved[i] or moved[i-1]))):
            if not (moved[i-1] or moved[i]):
                raise NoLine(f"no room for the car width at route metre {route.metres[i]:.1f}")
            failed[[i-1, i]] = True


def _check_racing_sections(xyz, road, circuit, dirty, moved, failed, spans, sections, tracking, route, areas, free):
    """Update measured widths and camber at samples whose position or tangent changed."""
    new_side = _frame(xyz, circuit)[3]
    limits, junction = _section_limits(xyz[:, XZ], new_side[:, XZ], route, areas, circuit, free)
    turned = moved | np.roll(moved, -1) | np.roll(moved, 1)
    for i in np.flatnonzero(dirty | np.roll(dirty, -1) | np.roll(dirty, 1)):
        if failed[i]:
            continue
        try:
            # Unchanged samples with unchanged tangents already have an exact span.
            known = None if turned[i] else spans[i]
            sections[i] = _section(_query(road, i), xyz[i], new_side[i], route.metres[i], known_span=known, limits=limits[i])
            tracking[i] = sections[i, :2]
            if moved[i] and min(tracking[i]) < RACING_CLEARANCE:
                local = _query(road, i)
                patch = local(*xyz[i, XZ], math.ceil(math.hypot(RACING_CLEARANCE, local.tooth_length)))
                desired = np.minimum(limits[i], RACING_CLEARANCE)
                tracking[i] = aicorridor.tracking_widths(patch, xyz[i], new_side[i, XZ], tracking[i], desired)
                failed[i] = min(tracking[i]) < RACING_CLEARANCE-1e-8
        except NoLine:
            neighbours = np.arange(i-1, i+2) % len(xyz)
            if not moved[neighbours].any():
                raise
            failed[neighbours] = True
    return limits, junction


def _restore(stations, failed, circuit, lap, scale):
    """Blend the offset back onto the reference around failed samples. Pure."""
    # Return both ends of a failed chord to the old geometry. A steering transition
    # two curvature windows long keeps a local repair from introducing a new kink.
    bend = airacing.restore_scale(stations, failed, circuit, lap, 2*CURVE_HALF_WINDOW) < 1
    return np.minimum(scale, airacing.restore_scale(stations, bend, circuit, lap, 2*CURVE_HALF_WINDOW))


def _return_metres(base, final, proposed, failed, metres, circuit):
    """First route metre of each local return visible in a retained move. Pure."""
    base, proposed = base.astype("f4"), proposed.astype("f4")
    kept = np.any(final != base, axis=1)
    if not failed.any() or not kept.any():
        return []
    # Compare positions at the precision actually written to AC. A discarded
    # solver attempt can have many failing chords and leave no trace in the lane.
    reduced = np.any(final != proposed, axis=1)
    effective = np.zeros(len(base), bool)
    for run in airacing.move_runs(np.any(proposed != base, axis=1), circuit):
        if kept[run].any() and reduced[run].any():
            effective[run] = failed[run]
    starts = effective & ~np.roll(effective, 1)
    if not circuit or effective.all():
        starts[0] = effective[0]
    return metres[starts]


def _racing_records(base, stations, road, circuit, mapped, route, report_returns, *, preview_sections=None):
    """Fit a racing line inside the reference carriageway and validate every stored chord."""
    xz = base[:, XZ]
    lap = stations[-1] - stations[0] + np.linalg.norm(xz[-1] - xz[0])
    free = np.array([query.free for query in road]) if isinstance(road, list) else None
    areas = obj_to_kn5._junction_geometry(mapped)[0] if mapped else ()
    shift, lower, upper, half, side, spans = _racing_offsets(base, stations, road, circuit, areas, route, lap, free)
    xyz, sections = base.copy(), np.empty((len(base), 3))
    tracking = np.empty((len(base), 2))
    dirty = np.ones(len(base), bool)
    scale = np.ones(len(base))
    failures = np.zeros(len(base), bool)
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
            failures |= fold
            scale = _restore(stations, fold, circuit, lap, scale)
            dirty[:] = True
            continue
        curvature = _curvature(xyz[:, XZ], 1, circuit)
        failed |= _steering_failures(curvature, original, moved, route.groups)
        _check_racing_chords(xyz, dirty, moved, failed, route, half, road, circuit, free)
        limits, junction = _check_racing_sections(xyz, road, circuit, dirty, moved, failed, spans, sections, tracking, route, areas, free)
        if not failed.any():
            usable = np.minimum(tracking, limits)
            checked = _junction_widths(usable, usable.copy(), junction, circuit)
            failed = moved & (checked.min(axis=1) < RACING_CLEARANCE-1e-8)
            if not failed.any():
                # Linearisation and local repairs need not reduce the true nonlinear
                # objective. Keep a complete joined move only if it still does.
                difference = airacing.bending_energy(xyz[:, XZ], curvature) - energy
                rejected = airacing.worse_runs(moved, difference, circuit)
                if not rejected.any():
                    sides = _frame(xyz, circuit)[3][:, XZ]
                    painted = _painted_widths(xyz[:, XZ], sides, route.painted) if route.painted is not None else None
                    painted = _free_paint(xyz, sides, free, mapped, painted, sections[:, :2], circuit)
                    widths = _export_widths(sections[:, :2], limits, painted, junction, circuit)
                    points, detail = _records(xyz, stations, road, circuit, checked_sections=sections, widths=widths)
                    if preview_sections is not None:
                        preview_sections.append((base, sections.copy()))
                    if failures.any():
                        proposed = xz + side * shift[:, None]
                        report_returns(_return_metres(xz, points["pos"][:, XZ], proposed, failures,
                                                      route.metres, circuit))
                    return points, detail
                dirty = rejected
                scale[rejected] = 0
                continue
        failures |= failed
        reduced = _restore(stations, failed, circuit, lap, scale)
        # Also revisit chords skipped because their unchanged endpoint was flagged.
        dirty = failed | ((scale != reduced) & (shift != 0))
        scale = reduced


def read_route(folder):
    """Read the route's X/Z path and anchor origin from the track folder."""
    with (folder / ROUTE).open("rb") as stream:
        header = stream.readline().split()
        origin = tuple(map(float, header[1:3])) if header[:1] == [b"anchor"] else ()
        return np.loadtxt(stream, ndmin=2), origin


def lane_inputs(model, circuit, log, *, preview=False):
    """Read exactly the geometry, markers and mapped carriageways used for this line."""
    path, origin = read_route(model.parent)
    scan = kn5.scan(model)
    markers = {key: matrix for key, matrix in scan["points"].items()
               if re.fullmatch(r"(?:AC_START_|M2_GRID_)\d+|AC_TIME_\d+_[LR]", key)}
    if not circuit:
        gates = route_race.GATES if all(k in scan["points"] for k in route_race.GATES) else route_race.ALIASES.values()
        markers.update((k, scan["points"][k]) for k in gates if k in scan["points"])
    mapped, rings = aibends.lane_roads(editorinfo.archives(model), log)
    corrections = aicorrections.recipe(model.parent)
    if error := aicorrections.problem(corrections):
        raise NoLine(error)
    free = preview or any(item["free"] for item in corrections)
    return path, markers, _roads(model, scan["meshes"], free), mapped, rings, origin, corrections


def move_reference(model, inputs, circuit, report_returns, *, preview_sections=None):
    """The validated automatic line and its exact sample-to-route correspondence for authoring."""
    path, markers, roads, mapped, rings, origin, _ = inputs
    road = _local_roads(roads)

    def records(stations, xz, height, limits):
        xyz = _surface(stations, xz, road, height, circuit)
        points, detail = _racing_records(xyz, stations, road, circuit, mapped, limits, report_returns, preview_sections=preview_sections)
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


def check_click_levels(section, xyz, route):
    """Click heights select a deck only at the clicked coordinates; intermediate elevations follow physics."""
    hints = np.vstack([section.xyz[0], *airedraw.local_points(section.item["points"],
                       section.item["anchor"]["origin"], route.origin), section.xyz[-1]])
    for point in hints:
        i = np.linalg.norm(section.xyz[:, XZ]-point[XZ], axis=1).argmin()
        if abs(xyz[i,1]-point[1]) >= obj_to_kn5.LEVEL_GAP_M:
            raise NoLine(f"Wrong driving level at route metre {section.metres[i]:.1f}")


def preview_reference(model, inputs, circuit, *, preview_sections=None):
    """An editable route guide even where the automatic line has no connected surface."""
    try:
        return move_reference(model, inputs, circuit, lambda _: None, preview_sections=preview_sections), {}
    except NoLine:
        return _diagnostic_reference(model, inputs, circuit)


def _diagnostic_reference(model, inputs, circuit):
    """Build selectable geometry without requiring the original path to have a floor everywhere."""
    path, markers, meshes, mapped, rings, origin, _ = inputs
    road = _local_roads(meshes)
    stations, xz, height, ribbon = _sample(path, markers, circuit, road, mapped, rings, ownership=True, diagnostic=True)
    xyz = _surface(stations, xz, road, height, circuit, diagnostic=True)
    errors = {}
    forward = _frame(xyz,circuit)[2]
    points, detail = np.zeros(len(xyz),POINT), np.zeros(len(xyz),DETAIL)
    points["pos"] = xyz
    detail["forward"] = forward
    for i, point in enumerate(xyz):
        if i or circuit:
            if not _fits_chord(road, xyz[i-1], point, FILLET_CLEARANCE):
                errors[i] = f"No driveable corridor at route metre {ribbon.metres[i]:.1f}"
    return (points,detail,ribbon,stations,road,aicorrections.Route(path,origin,circuit)), errors


def nearest_stations(stations, metres):
    """Indices of the closest reference samples for query metres. Pure."""
    nearest = np.clip(np.searchsorted(stations, metres), 0, len(stations)-1)
    prev = np.maximum(nearest-1, 0)
    return np.where(abs(metres-stations[prev]) < abs(metres-stations[nearest]), prev, nearest)


def check_splits(xyz, splits, circuit):
    """A corrected passage must cross each sector segment forwards on its driving level. Pure."""
    if not splits:
        return
    lap = np.vstack((xyz, xyz[0])) if circuit else xyz
    for name, markers, metre in splits:
        hits, t = _gate_crossings(lap[:, XZ], markers, name)
        heights = lap[hits, 1] + t[hits]*(lap[hits+1, 1]-lap[hits, 1])
        left, right = (np.asarray(markers[f"{name}_{side}"])[12:15] for side in "LR")
        side = right[XZ] - left[XZ]
        cuts = lap[hits][:, XZ] + t[hits,None]*(lap[hits+1][:, XZ]-lap[hits][:, XZ])
        level = left[1] + ((cuts-left[XZ]) @ side)/(side @ side)*(right[1]-left[1])
        if not np.any(abs(heights-level) < obj_to_kn5.LEVEL_GAP_M):
            raise NoLine(f"Misses timing gate {name} at route metre {metre:.1f}")


def check_selected_road(xz, metres, ribbon, nearest, owned):
    """Keep a road-bound stroke in the chosen route legs through intersections. Pure."""
    width = ribbon.half_width[nearest]
    owned = owned[np.isfinite(width[owned]) & np.isfinite(width[owned-1])]
    fits = airacing.joins_fit(xz, owned, ribbon.start[nearest], ribbon.end[nearest], width, FILLET_CLEARANCE)
    if not fits.all():
        raise NoLine(f"Outside the selected road at route metre {metres[owned[~fits][0]]:.1f}")


def _drawn_reference(model, inputs, circuit, report_returns, *, diagnostic=False, driven=None):
    """Splice hand-drawn sections before a complete route ever needs to have a floor."""
    path, markers, meshes, mapped, rings, origin, corrections = inputs
    route = driven[5] if driven else aicorrections.Route(path, origin, circuit)
    road, wider = _local_roads(meshes), _local_roads(meshes, free=True)
    sections = sorted((airedraw.resolve(item, route, SPACING/2) for item in corrections
                       if item["kind"] == "redraw"), key=lambda section: section.start)
    if circuit:
        if driven:
            first = driven[2].metres[0]
        else:
            closed, metres = obj_to_kn5._closed_lap(path)
            first = _gate(closed, metres, markers, "AC_TIME_0")
        for section in sections:
            if section.start < first:
                section.start += route.length
                section.end += route.length
                section.metres += route.length
        sections.sort(key=lambda section: section.start)
    for section, following in zip(sections, sections[1:]):
        if section.end > following.start:
            raise NoLine(f"Overlapping correction at route metre {following.start:.1f}")
    if driven:
        xz, height, ribbon = driven[0]["pos"][:, XZ].astype(float), driven[0]["pos"][0,1], driven[2]
    else:
        _, xz, height, ribbon = _sample(path, markers, circuit, road, mapped, rings, ownership=True,
                                    redraws=sections, free_road=wider, diagnostic=diagnostic)
    stations = ribbon.metres
    retain = np.ones(len(xz), bool)
    tail_end = stations[-1]
    for section in sections:
        is_tail = "tail" in section.item
        if is_tail:
            if circuit or not section.item["free"] or abs(section.item["end"]["metre"]-route.length) > GRID_XZ_TOL:
                raise NoLine(f"Invalid runout at route metre {section.start:.1f}")
            tail_end = section.end
        if section.start < stations[0] or (not is_tail and section.end > stations[-1]):
            raise NoLine(f"End outside the available line at route metre {section.end:.1f}")
        inside = (stations >= section.start) & (stations <= section.end)
        fixed = inside & ribbon.hard
        if is_tail:
            # The automatic solver pins its whole runout. Only the timing plane
            # and timed approach must remain fixed when the user draws a new tail.
            fixed &= stations <= ribbon.finish + GRID_XZ_TOL
        if fixed.any():
            delta = section.positions(stations[fixed])[:, XZ] - xz[fixed]
            if np.any(np.linalg.norm(delta, axis=1) > GRID_XZ_TOL):
                raise NoLine(f"Fixed AI line point at route metre {stations[fixed][0]:.1f}")
        retain &= ~inside
    retain &= stations <= tail_end
    xz, joined = airedraw.join_approaches(xz, stations, ribbon.hard, sections, 2*CURVE_HALF_WINDOW, GRID_XZ_TOL)
    metres = np.concatenate([stations[retain], *[part.metres for part in sections]])
    points = np.concatenate([xz[retain], *[part.xyz[:, XZ] for part in sections]])
    order = np.argsort(metres)
    metres, points = metres[order], points[order]
    nearest = nearest_stations(stations, metres)
    manual = np.zeros(len(points), bool)
    free = manual.copy()
    for part in sections:
        inside = (metres >= part.start) & (metres <= part.end)
        manual |= inside
        if part.item["free"]:
            free |= inside
    queries = _per_point(road, wider, free)
    if driven:
        xyz = driven[0]["pos"][nearest].astype(float)
        xyz[:, XZ] = points
        for i in np.flatnonzero(manual | joined[nearest]):
            x, y, z = xyz[i]
            levels = obj_to_kn5.road_levels(_query(queries,i)(x,z,0), x, z)
            level = min(levels, key=lambda h: abs(h-y), default=np.inf)
            if abs(y-level) >= obj_to_kn5.LEVEL_GAP_M:
                raise NoLine(f"No driveable surface at route metre {metres[i]:.1f}")
            xyz[i,1] = level
    else:
        xyz = _surface(metres, points, queries, height, circuit, diagnostic=diagnostic)
    check_splits(xyz, ribbon.splits, circuit)
    for part in sections:
        check_click_levels(part, xyz[(metres >= part.start) & (metres <= part.end)], route)
    authored = manual | joined[nearest]
    mask = authored | np.roll(authored, 1)
    if not circuit:
        mask[0] = False
    owned = np.flatnonzero(mask & ~free & ~np.roll(free, 1))
    check_selected_road(points, metres, ribbon, nearest, owned)
    sides = _frame(xyz, circuit)[3]
    for i in np.flatnonzero(mask):
        q = _query(queries, i)
        if (not _fits_chord(q, xyz[i-1], xyz[i], FILLET_CLEARANCE)
                or min(_section(q, xyz[i], sides[i], metres[i], limits=(FILLET_CLEARANCE, FILLET_CLEARANCE))[:2]) < FILLET_CLEARANCE):
            raise NoLine(f"Insufficient clearance at route metre {metres[i]:.1f}")
    limits = airacing.RouteRibbon(ribbon.fixed[nearest] | authored, ribbon.start[nearest], ribbon.end[nearest],
                                  ribbon.half_width[nearest], metres, [(m[nearest], v) for m,v in ribbon.groups],
                                  ribbon.hard[nearest] | (manual if driven else authored), ribbon.splits, ribbon.finish,
                                  tuple(value[nearest] for value in ribbon.painted))
    along = _distances(points)
    if driven:
        from track import drivenline
        records, detail, _ = drivenline.records(xyz, metres, queries, mapped, driven[1], driven[2].metres, circuit)
        aicorrections.check_centreline(xyz, metres, authored, circuit, obj_to_kn5.LEVEL_GAP_M)
    elif diagnostic:
        records, detail = np.zeros(len(xyz), POINT), np.zeros(len(xyz), DETAIL)
        records["pos"] = xyz
    else:
        records, detail = _racing_records(xyz, along, queries, circuit, mapped, limits, report_returns)
        check_splits(records["pos"], limits.splits, circuit)
        aicorrections.check_centreline(records["pos"], metres, authored, circuit, obj_to_kn5.LEVEL_GAP_M)
    return records, detail, limits, along, queries, route


def moved_line(reference, corrections, wider=None, measured=None, areas=()):
    """Apply recipe moves to the automatic reference and validate their seams and cross-sections."""
    points, detail, ribbon, stations, road, route = reference
    xyz = points["pos"].astype(float)
    sides = _frame(xyz, route.circuit)[3]
    moved, mask = route.moves(corrections, ribbon, xyz, sides, obj_to_kn5.LEVEL_GAP_M)
    queries = [_query(road,i) for i in range(len(xyz))]
    free = np.zeros(len(xyz),bool)
    for item in corrections:
        if item["free"]:
            centre, _ = route.resolve(item["anchor"])
            d = abs(ribbon.metres-centre)
            if route.circuit:
                d %= route.length
                d = np.minimum(d,route.length-d)
            free |= d < item["range"]
    for i in np.flatnonzero(free):
        queries[i] = wider
    for i in np.flatnonzero(mask):
        x, y, z = moved[i]
        levels = obj_to_kn5.road_levels(queries[i](x, z, 0), x, z)
        height = min(levels, key=lambda h: abs(h-y), default=np.inf)
        if abs(height-y) >= obj_to_kn5.LEVEL_GAP_M:
            raise NoLine(f"No driveable surface at route metre {ribbon.metres[i]:.1f}")
        moved[i, 1] = height
    check_splits(moved, ribbon.splits, route.circuit)
    joins = mask | np.roll(mask, 1)
    if not route.circuit:
        joins[0] = False
    indices = np.flatnonzero(joins)
    widths = np.where(np.isfinite(ribbon.half_width), ribbon.half_width, (detail["left"]+detail["right"])/2)
    # At junctions the neighbouring street can share the same road mesh. Keep the
    # same ownership capsule as the automatic line when a route width is known.
    mapped = indices[~free[indices] & ~free[indices-1] & np.isfinite(ribbon.half_width[indices]) & np.isfinite(ribbon.half_width[indices-1])]
    fit = airacing.joins_fit(moved[:, XZ], mapped, ribbon.start, ribbon.end, widths, FILLET_CLEARANCE)
    if not fit.all():
        raise NoLine(f"Outside the selected road at route metre {ribbon.metres[mapped[~fit][0]]:.1f}")
    side = _frame(moved, route.circuit)[3]
    # Saving only needs the swept car profile here. A preview also needs the distances to its edges.
    limits = None
    if measured is not None:
        limits, _ = _section_limits(moved[:, XZ], side[:, XZ], ribbon, areas, route.circuit, free)
    for i in indices:
        m = ribbon.metres[i]
        if not _fits_chord(queries[i], moved[i-1], moved[i], FILLET_CLEARANCE):
            raise NoLine(f"Insufficient clearance at route metre {m:.1f}")
        reach = (FILLET_CLEARANCE, FILLET_CLEARANCE) if limits is None else np.maximum(limits[i], FILLET_CLEARANCE)
        section = _section(queries[i], moved[i], side[i], m, limits=reach)
        if measured is not None:
            measured[i] = section
        if min(section[:2]) < FILLET_CLEARANCE:
            raise NoLine(f"Insufficient clearance at route metre {m:.1f}")
    return moved, mask, queries


def checked_moves(reference, moves, finish, wider=None, measured=None, areas=()):
    """Try the complete recipe, isolating failed edits in recipe order if necessary."""
    original = reference[0]["pos"].astype(float)
    empty = np.zeros(len(original), bool)
    def apply(items):
        if measured is not None:
            measured.clear()
        return finish(*moved_line(reference, items, wider, measured, areas)) if items else finish(original, empty, reference[4])
    try:
        return apply(moves), {}
    except ValueError:
        pass
    accepted, skipped = [], {}
    result = None
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
    return (apply([]) if result is None else result), skipped


def _reference_with_redraws(model, inputs, circuit, report_returns, *, diagnostic=False):
    """Validate the replacements before sampling the original road inside their spans."""
    draws = [item for item in inputs[-1] if item["kind"] == "redraw"]
    def automatic():
        if diagnostic:
            return _diagnostic_reference(model, inputs, circuit)[0]
        return move_reference(model, inputs, circuit, report_returns)
    if not draws:
        return automatic(), {}
    def apply(items, provisional=diagnostic):
        return _drawn_reference(model, (*inputs[:-1], items), circuit, report_returns, diagnostic=provisional)
    try:
        return apply(draws), {}
    except ValueError as first_error:
        if len(draws) == 1:
            reason = str(first_error)
            try:
                return automatic(), {draws[0]["id"]: reason}
            except NoLine:
                raise NoLine(reason) from first_error
    # Keep a repair of a genuinely missing road even if another draw fails.
    accepted, skipped, reference = [], {}, None
    for item in draws:
        try:
            # Other strokes may repair different gaps. Check this stroke on its own
            # support before requiring continuous road between all accepted repairs.
            candidate = apply([*accepted, item], provisional=True)
        except ValueError as error:
            skipped[item["id"]] = str(error)
        else:
            accepted.append(item)
            reference = candidate
    if reference is None:
        reference = automatic()
    elif not diagnostic:
        reference = apply(accepted)
    return reference, skipped


def calculate(model, inputs, circuit, lane, log) -> tuple[dict, np.ndarray]:
    """Write the spline to lane and return skipped corrections and its samples' route metres."""
    start = perf_counter()
    needs_floor_check = False
    reference_returns = set()
    try:
        reference, skipped_draws = _reference_with_redraws(model, inputs, circuit, reference_returns.update)
    except NoLine:
        if not any(item["kind"] == "move" for item in inputs[-1]):
            raise
        # An automatic floor failure can be inside the hand-drawn footprint.
        # Start from the same provisional guide the user could pick in the Editor.
        reference, skipped_draws = _reference_with_redraws(model, inputs, circuit, reference_returns.update, diagnostic=True)
        needs_floor_check = True
    points, detail, ribbon, stations, road, route = reference

    def finish(moved, fixed, queries):
        if not fixed.any() and not needs_floor_check:
            return points, detail, reference_returns
        returns = reference_returns.difference(ribbon.metres[fixed])
        protected = ribbon.fixed | fixed
        if needs_floor_check:
            moved = _surface(ribbon.metres, moved[:, XZ], queries, moved[0,1], circuit)
        else:
            # Refit the adjoining approaches over a curvature window. Other bends
            # already have their validated optimum. The authored samples are immutable.
            lap = stations[-1]-stations[0] + np.linalg.norm(moved[-1, XZ]-moved[0, XZ])
            approach = airacing.restore_scale(stations, fixed, circuit, lap, CURVE_HALF_WINDOW) < 1
            protected |= ~approach
        limits = ribbon._replace(fixed=protected)
        records, details = _racing_records(moved, stations, queries, circuit, inputs[3], limits, returns.update)
        check_splits(records["pos"], ribbon.splits, circuit)
        aicorrections.check_centreline(records["pos"], ribbon.metres, fixed, circuit, obj_to_kn5.LEVEL_GAP_M)
        return records, details, returns

    moves = [item for item in inputs[-1] if item["kind"] == "move"]
    wider = _local_roads(inputs[2], free=True) if any(item["free"] for item in moves) else None
    (points, detail, returns), skipped = checked_moves(reference, moves, finish, wider)
    skipped.update(skipped_draws)
    for reason in skipped.values():
        log(f"AI correction skipped: {reason}")
    missing = np.flatnonzero(~np.isfinite(ribbon.half_width))
    for run in np.split(missing, np.flatnonzero(np.diff(missing) > 1) + 1):
        if len(run):
            log(f"AI line: no road band at route metres {ribbon.metres[run[0]]:.1f} to "
                f"{ribbon.metres[run[-1]]:.1f}; using the checked reference")
    _write_lane(lane, points, detail)
    if returns:
        shown = ", ".join(f"{m:.1f}" for m in sorted(returns)[:4])
        suffix = ", …" if len(returns) > 4 else ""
        noun = "location" if len(returns) == 1 else "locations"
        log(f"AI line {model.stem}: local return to reference at {len(returns)} {noun} (route metres {shown}{suffix})")
    log(f"AI line: {len(points):,} points in {perf_counter() - start:.2f} s")
    return skipped, ribbon.metres


def regenerate(model, *, circuit, log=print):
    """Generate Build/Rebuild's installed line and record its inputs and result."""
    from track import ailinestate
    model = Path(model)
    fingerprint = None
    try:
        inputs = lane_inputs(model, circuit, log)
        fingerprint = ailinestate.fingerprint(inputs, circuit)
        skipped, metres = calculate(model, inputs, circuit, model.parent / FILE, log)
        ailinestate.record_ready(model.parent, fingerprint, skipped, circuit=circuit, metres=metres)
    except ailinestate.ERRORS as error:
        reason = ailinestate.reason(error)
        ailinestate.clear(model.parent, fingerprint, reason)
        log(f"AI line skipped: {reason}")
        return False
    return True
