"""Fit AC start and pit slots on the built collision road, in race order."""
import math

import numpy as np

from track import aicorridor, editorinfo, fastlane, obj_to_kn5 as kn


# A 5 m by 2 m touring car plus 20 cm per side for mirrors and spawn tolerance.
# Longer or wider vehicles can exceed this envelope.
HALF_LENGTH = 2.5
HALF_WIDTH = 1.2
# At 3 m/s² a road car reaches about 95 km/h in 120 m. Short approaches and
# tight bends can offer less run-up or a lower entry speed.
HOTLAP_RUN_UP_M = 120.0


def _overlap(p, fwd, other, direction):
    """Separating-axis test for two inflated, oriented car footprints. Pure."""
    a, b = fwd[[0, 2]], direction[[0, 2]]
    side_a, side_b = a[::-1] * [1, -1], b[::-1] * [1, -1]
    delta = (p - other)[[0, 2]]
    for axis in (a, b, side_a, side_b):
        reach = HALF_LENGTH * (abs(axis @ a) + abs(axis @ b)) + HALF_WIDTH * (abs(axis @ side_a) + abs(axis @ side_b))
        if abs(delta @ axis) >= reach:
            return False
    return True


def _route_frame(xy, distances, metre):
    """Route centre in AC coordinates, forward and side at the given metre. Pure."""
    x, y, fwd = kn._along(xy, distances, metre)
    return np.array([x, 0., -y]), fwd, np.cross([0., 1., 0.], fwd)


def grid_road(objs, barriers, parts, log):
    """Index the collision meshes and retained road paint used to place the grid."""
    road = fastlane._local_roads({**objs, **(barriers or {})})
    road.paint = editorinfo.road_paint(parts, log)
    return road


def _paint_span(paint, centre, side, lo, hi):
    """Connected painted span through centre inside the measured collision edges. Pure."""
    # Sample at half the finest retained mask pixel, including the actual collision edges.
    step = editorinfo.TILE_M / 2048 / 2
    metres = np.r_[lo, np.arange(-step, lo, -step)[::-1], 0., np.arange(step, hi, step), hi]
    values = paint(centre + metres[:, None] * side)
    pole = np.searchsorted(metres, 0.)
    if values[pole] != 1:
        return None
    for direction in (-1, 1):
        outside = np.flatnonzero(values[pole::direction] != 1)
        if len(outside):
            i = pole + direction * outside[0]
            if values[i] < 0:
                return None
            edge = (metres[i] + metres[i - direction]) / 2
            if direction < 0:
                lo = edge
            else:
                hi = edge
    return lo, hi


def _slot_offsets(road, centre, side, index, branches):
    """Preferred and fallback offsets from the route through the connected road cross section. Pure."""
    x, _, z = centre
    local = road(x, z, 0)
    levels = kn.road_levels(local, x, z)
    if len(levels) != 1:
        return 0., 0.
    point = np.array([x, levels[0], z])
    transverse = side[[0, 2]]
    margin = math.ceil(kn.GRID_BOX_M)
    while True:
        patch = road(x, z, margin)
        # A deck owns its edges even where wider collision terrain touches it.
        deck = aicorridor.built_span(patch, point, transverse) if patch.built else None
        span = deck if deck is not None else aicorridor.floor_span(patch, point, transverse, aicorridor.ROAD_SEAM)
        if span is None or not np.isfinite(span).all():
            return 0., 0.
        lo, hi = span
        reach = max(-lo, hi)
        if reach < margin:
            break
        margin = max(2 * margin, math.ceil(reach) + 1)
    paint = getattr(road, "paint", None)
    if deck is None and paint is not None and kn.road_levels(
            {k: v for k, v in local.items() if k.startswith(("1ROAD_ground_", "1GRAVEL_ground_"))}, x, z):
        # Urban collision terrain can continue across pavements and car parks beyond the carriageway.
        painted = _paint_span(paint, point[[0, 2]], transverse, lo, hi)
        if painted is None:
            return 0., 0.
        lo, hi = painted
    # A slice down another junction arm has no measurable outer edge for this road.
    if deck is None and kn._crosses_junction_arms(branches, point + lo * side, point + hi * side):
        return 0., 0.
    width, middle = hi - lo, (hi + lo) / 2
    # Leave three equal gaps around two painted boxes, clamping each box at the road edge.
    offset = max(0., min((width + kn.GRID_BOX_M) / 6, (width - kn.GRID_BOX_M) / 2))
    return middle + (offset if index % 2 == 0 else -offset), middle


def _spawn_site(road, frame, offset, areas):
    """Check the car footprint at offset from the route frame against the road and junction areas. Pure."""
    centre, fwd, side = frame
    centre = centre.copy()
    p = centre + offset * side
    patch = road(p[0], p[2], math.ceil(HALF_LENGTH + HALF_WIDTH))
    if len(areas):
        # Distance from each mapped junction centre to the car rectangle.
        delta = areas[:, :2] - p[[0, 2]]
        along = np.maximum(abs(delta @ fwd[[0, 2]]) - HALF_LENGTH, 0.)
        across = np.maximum(abs(delta @ side[[0, 2]]) - HALF_WIDTH, 0.)
        if np.any(along**2 + across**2 < areas[:, 2]):
            return None, "mapped junction"
    for at, faces in ((centre, road(centre[0], centre[2], 0)), (p, patch)):
        levels = kn.road_levels(faces, at[0], at[2])
        if len(levels) != 1:
            return None, "second road level" if levels else "end of drivable road"
        at[1] = levels[0]
    ends = []
    for sign in (-1, 1):
        end = p + sign * HALF_LENGTH * fwd
        for shift in (0, -HALF_WIDTH, HALF_WIDTH):
            q = end + shift * side
            levels = kn.road_levels(patch, q[0], q[2])
            if len(levels) != 1:
                return None, "second road level" if levels else "road edge"
            if shift == 0:
                end[1] = levels[0]
        ends.append(end)
    if not fastlane._fits_chord(road, *ends, HALF_WIDTH):
        return None, "road edge or collision obstacle"
    return (p, fwd, centre), ""


def _checked_slot(road, frame, junctions, slots):
    """Try the alternating position, then the road midpoint, clear of all placed slots. Pure."""
    areas, branches = junctions
    preferred, middle = _slot_offsets(road, frame[0], frame[2], len(slots), branches)
    for offset in (preferred,) if preferred == middle else (preferred, middle):
        placed, reason = _spawn_site(road, frame, offset, areas)
        if placed:
            pos, direction, _ = placed
            if not any(_overlap(pos, direction, *other) for other in slots):
                return placed, ""
            reason = "overlapping car footprints on bend"
    return None, reason


def layout(road, xy, distances, gate, lower, *, end_reason="end of approach", junctions=None, twice=(), lap=0,
           front_gap=kn.STAGE_START_GAP_M):
    """Place front-to-back slots and centreline nodes down to lower, returning the first limiting reason. Pure."""
    slots, stations = [], []
    junctions = junctions if junctions is not None else ((), ())
    metre = gate - front_gap
    reason = end_reason
    while len(slots) < kn.SLOTS and metre >= lower - 1e-6:
        if twice and kn._overlaps_twice(twice, metre - HALF_LENGTH, gate - metre + HALF_LENGTH, lap):
            reason = "twice-driven junction"
            break
        frame = _route_frame(xy, distances, metre)
        placed, reason = _checked_slot(road, frame, junctions, slots)
        if placed:
            pos, direction, centre = placed
            slots.append((pos, direction))
            stations.append((metre, centre, direction))
        elif reason != "overlapping car footprints on bend" and (slots or reason != "mapped junction"):
            break
        metre -= kn.SLOT_GAP
        reason = end_reason
    limit = f"{reason} at {gate - metre:.1f} m behind the line" if len(slots) < kn.SLOTS else ""
    # Keep the actual approach vertices too. A turn between slots (or an empty
    # junction between pole and the timing line) cannot be recovered from car headings.
    if stations:
        path_stations = {round(m, 6) for m, _, _ in stations}
        rear = stations[-1][0]
        for m in distances:
            if rear < m < gate and round(m, 6) not in path_stations:
                x, y, direction = kn._along(xy, distances, m)
                height = kn.road_height(road(x, -y, 0), x, -y)
                if height is not None:
                    stations.append((m, np.array([x, height, -y]), direction))
                    path_stations.add(round(m, 6))
    return slots, sorted(stations, key=lambda item: -item[0]), limit


def hotlap_node(grid, road, xy, distances, gate, lower, junctions=None, *, twice=(), lap=0):
    """Place the solo start along the checked approach behind the rear grid station. Pure."""
    rear = grid[1][-1][0]
    target = min(rear, max(lower, gate - HOTLAP_RUN_UP_M))
    areas = junctions[0] if junctions is not None else ()
    # The rear slot itself fits even if an obstacle blocks the route centre.
    pos, fwd = grid[0][-1]
    # Overlap successive 5 m footprints while following the road around bends.
    for metre in np.r_[np.arange(rear, target, -HALF_LENGTH), target]:
        if twice and kn._overlaps_twice(twice, metre - HALF_LENGTH, gate - metre + HALF_LENGTH, lap):
            break
        site, _ = _spawn_site(road, _route_frame(xy, distances, metre), 0., areas)
        if site is None:
            break
        pos, fwd, _ = site
    return kn.empty("AC_HOTLAP_START_0", pos + [0., kn.START_LIFT, 0.], fwd)


def area_grid(road, lines, target, junctions):
    """Fit a grid along a mapped road near the Area anchor. Pure."""
    candidates = []
    for xz, width in lines:
        if width < 2 * HALF_WIDTH:
            continue
        xz = xz[np.r_[True, np.any(np.diff(xz, axis=0), axis=1)]]
        if len(xz) < 2:
            continue
        distances = fastlane._distances(xz)
        at, gap = fastlane._project(xz, distances, target)
        candidates.append((gap, at, xz, distances))
    best = None
    for gap, at, xz, distances in sorted(candidates, key=lambda item: item[0]):
        if best and gap > kn.MAX_GRID_M:
            break
        gate = min(distances[-1], max(kn.MAX_GRID_M, at))
        grid = layout(road, xz * [1, -1], distances, gate, 0., junctions=junctions)
        if grid[0] and (best is None or len(grid[0]) > len(best[0])):
            best = grid
            if len(grid[0]) == kn.SLOTS:
                break
    return best


def nodes(grid, log):
    """Make matched pit, grid and centre-guide nodes for a checked layout and record its capacity."""
    slots, centres, reason = grid
    log(f"Starting grid: {len(slots)} slots" + (f" ({reason})" if reason else ""))
    result = []
    for i, (p, fwd) in enumerate(slots):
        pos = p + [0, kn.START_LIFT, 0]
        result.extend((kn.empty(f"AC_START_{i}", pos, fwd), kn.empty(f"AC_PIT_{i}", pos, fwd)))
    for i, (_, centre, fwd) in enumerate(centres):
        result.append(kn.empty(f"M2_GRID_{i}", centre + [0, kn.START_LIFT, 0], fwd))
    return result
