"""Fit AC start and pit slots on the built collision road, in race order."""
import math

import numpy as np

from track import fastlane, obj_to_kn5 as kn


# A 5 m by 2 m touring car plus 20 cm per side for mirrors and spawn tolerance.
# Longer or wider vehicles can exceed this envelope.
HALF_LENGTH = 2.5
HALF_WIDTH = 1.2
# The columns are 3 m apart (1 m between two 2 m bodies). The second is 2 m
# behind pole for visibility. With 8 m row pitch even a merging single has
# at least 6 m longitudinal separation on straight road.
COLUMN = 1.5
STAGGER = 2.0
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


def _spawn_site(road, xy, distances, metre, offset, areas):
    """Check a car footprint on the mapped approach and return its position, heading and road centre. Pure."""
    x, y, fwd = kn._along(xy, distances, metre)
    side = np.cross([0., 1., 0.], fwd)
    centre = np.array([x, 0., -y])
    p = centre + offset * side
    patch = road(p[0], p[2], math.ceil(HALF_LENGTH + HALF_WIDTH))
    if len(areas):
        # Distance from each mapped junction centre to the car rectangle.
        delta = areas[:, :2] - p[[0, 2]]
        along = np.maximum(abs(delta @ fwd[[0, 2]]) - HALF_LENGTH, 0.)
        across = np.maximum(abs(delta @ side[[0, 2]]) - HALF_WIDTH, 0.)
        if np.any(along**2 + across**2 < areas[:, 2]):
            return None, "mapped junction"
    for at in (centre, p):
        levels = kn.road_levels(patch, at[0], at[2])
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


def layout(road, xy, distances, gate, lower, *, end_reason="end of approach", junctions=None, twice=(), lap=0,
           front_gap=kn.STAGE_START_GAP_M):
    """Place front-to-back slots and centreline nodes down to lower, returning the first limiting reason. Pure."""
    slots, stations = [], []
    doubles = 0
    areas = junctions[0] if junctions is not None else ()
    front = gate - front_gap

    def site(metre, offset, neighbours):
        if metre < lower - 1e-6:
            return None, end_reason
        if twice and kn._overlaps_twice(twice, metre - HALF_LENGTH, gate - metre + HALF_LENGTH, lap):
            return None, "twice-driven junction"
        placed, reason = _spawn_site(road, xy, distances, metre, offset, areas)
        if placed is None:
            return None, reason
        p, fwd, _ = placed
        if any(_overlap(p, fwd, pos, direction) for pos, direction in neighbours):
            return None, "overlapping car footprints on bend"
        return placed, ""

    row = front
    reason = end_reason
    while len(slots) < kn.SLOTS:
        first, reason = site(row, COLUMN, slots)
        pair = []
        if first and len(slots) + 2 <= kn.SLOTS:
            second, reason = site(row - STAGGER, -COLUMN, [*slots, first[:2]])
            if second:
                pair = [first, second]
        if not pair:
            single, reason = site(row, 0, slots)
            if not single:
                if row >= lower and (reason == "overlapping car footprints on bend" or
                                     (not slots and reason == "mapped junction")):
                    row -= kn.SLOT_GAP
                    continue
                break
            pair = [single]
        if len(pair) == 2:
            doubles += 1
        for index, (pos, direction, centre) in enumerate(pair):
            slots.append((pos, direction))
            stations.append((row - index * STAGGER, centre, direction))
        row -= kn.SLOT_GAP
    limit = f"{reason} at {gate - row:.1f} m behind the line" if len(slots) < kn.SLOTS else ""
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
    return slots, sorted(stations, key=lambda item: -item[0]), limit, doubles


def hotlap_node(grid, road, xy, distances, gate, lower, junctions=None, *, twice=(), lap=0):
    """Place the solo start along the checked approach behind the rear grid station. Pure."""
    rear = grid[1][-1][0]
    target = min(rear, max(lower, gate - HOTLAP_RUN_UP_M))
    areas = junctions[0] if junctions is not None else ()
    # The rear slot itself fits even if an obstacle occupies the middle of a paired row.
    pos, fwd = grid[0][-1]
    # Overlap successive 5 m footprints while following the road around bends.
    for metre in np.r_[np.arange(rear, target, -HALF_LENGTH), target]:
        if twice and kn._overlaps_twice(twice, metre - HALF_LENGTH, gate - metre + HALF_LENGTH, lap):
            break
        site, _ = _spawn_site(road, xy, distances, metre, 0., areas)
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
    slots, centres, reason, pairs = grid
    log(f"Starting grid: {len(slots)} slots, {pairs} double rows" + (f" ({reason})" if reason else ""))
    result = []
    for i, (p, fwd) in enumerate(slots):
        pos = p + [0, kn.START_LIFT, 0]
        result.extend((kn.empty(f"AC_START_{i}", pos, fwd), kn.empty(f"AC_PIT_{i}", pos, fwd)))
    for i, (_, centre, fwd) in enumerate(centres):
        result.append(kn.empty(f"M2_GRID_{i}", centre + [0, kn.START_LIFT, 0], fwd))
    return result
