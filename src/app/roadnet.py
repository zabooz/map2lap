"""One coupled smoothing surface over a selected road network; output remains the Editor's 2 m height raster."""
import math
import base64
import heapq
import json
import threading

import numpy as np

from app import roadregion, trackband, trackheights
from track import editorinfo

_kept_lock, _kept = threading.Lock(), {}     # (_roads: of the networks marked last)
KEPT = 2                                      # (one marked network at a time, and the one before it: a tab marks anew while another adjusts)


def resample(line):
    """A mapped arm sampled at no more than the terrain step, retaining its endpoints. Pure."""
    line = np.asarray(line, np.float64)
    s = trackband._along(line)
    if s[-1] <= 2 * trackband.HOLD_M:
        raise ValueError("These road points lie too close together")
    at = np.linspace(0, s[-1], max(5, math.ceil(s[-1] / trackheights.STEP) + 1))
    return np.c_[np.interp(at, s, line[:, 0]), np.interp(at, s, line[:, 1])]


def sideways(line):
    """Unit cross-road directions for an arm. Pure."""
    return trackband._sideways(line)


def _key(point):
    return tuple(np.round(point, 5))


def junction_planes(net, arms, strength):
    """Shared junction height/gradient estimated from all selected approaches away from the central bump. Pure."""
    planes = {}
    for junction in net["junctions"]:
        junction = np.asarray(junction)
        samples, values = [], []
        for arm in arms:
            line = arm["line"]
            if min(np.linalg.norm(line[0] - junction), np.linalg.norm(line[-1] - junction)) > 1e-4:
                continue
            distance = np.linalg.norm(line - junction, axis=1)
            length = trackband._along(line)[-1]
            reach = min(length / 2, max(2 * trackheights.STEP, trackband._window(float(length), strength) / (2 * math.pi)))
            on = (distance >= .65 * reach) & (distance <= reach)
            samples.extend((line[on] - junction).tolist())
            values.extend(trackband._middle(arm["heights"])[on].tolist())
        if len(samples) < 3:
            raise ValueError("Mark longer approaches around this junction")
        matrix = np.c_[np.ones(len(samples)), np.asarray(samples)]
        fit, _r, rank, _s = np.linalg.lstsq(matrix, np.asarray(values), rcond=None)
        if rank < 3:
            raise ValueError("This junction has no distinct arms to join")
        planes[_key(junction)] = fit
    return planes


def _junction_share(point, arms, strength):
    lengths = [float(trackband._along(arm["line"])[-1]) for arm in arms
               if min(np.linalg.norm(arm["line"][0] - point), np.linalg.norm(arm["line"][-1] - point)) < 1e-4]
    return min(1., trackband._window(min(lengths), strength) / trackband.MIN_WINDOW_M)


def even_network(net, arms, strength):
    """Spline each arm with shared height and gradient at every selected junction, preserving crossfall. Pure."""
    if strength <= 0:
        return [arm["heights"].copy() for arm in arms]
    planes = junction_planes(net, arms, strength)
    result = []
    for arm in arms:
        line, rows = arm["line"], arm["heights"]
        s, side = trackband._along(line), sideways(line)
        adjusted = rows.copy()
        slopes = list(arm["slopes"])
        for end, k in enumerate((0, -1)):
            plane = planes.get(_key(line[k]))
            if plane is None:
                continue
            share = _junction_share(line[k], arms, strength)
            across = arm["lanes"][:, None] * side[k]
            wanted = plane[0] + across @ plane[1:]
            target = rows[:, k] + share * (wanted - rows[:, k])
            towards = trackband._towards(s if k == 0 else s[-1] - s)
            adjusted += (target - rows[:, k])[:, None] * towards
            tangent = line[1] - line[0] if k == 0 else line[-1] - line[-2]
            tangent /= np.linalg.norm(tangent)
            slopes[end] = float(plane[1:] @ tangent)
        result.append(trackband._even_surface(s, adjusted, arm["built"], strength, tuple(slopes)))
    return result


def _segment(a, b):
    """A mapped segment as a line of points no further apart than the terrain step. Pure."""
    a, b = np.asarray(a, np.float64), np.asarray(b, np.float64)
    n = max(2, math.ceil(float(np.linalg.norm(b - a)) / trackheights.STEP) + 1)
    return a + np.linspace(0, 1, n)[:, None] * (b - a)


def _apart(shape, i0, j0, line, reach):
    """Each lattice point's distance to a line, inf beyond reach of it. Pure."""
    step = trackheights.STEP
    out = np.full(shape, np.inf)
    for a, b in zip(line, line[1:]):
        low, high = np.minimum(a, b) - reach, np.maximum(a, b) + reach
        x0, x1 = max(0, math.floor(low[0] / step) - i0), min(shape[1], math.ceil(high[0] / step) - i0 + 1)
        z0, z1 = max(0, math.floor(low[1] / step) - j0), min(shape[0], math.ceil(high[1] / step) - j0 + 1)
        if x0 >= x1 or z0 >= z1:
            continue
        x, z = np.meshgrid((np.arange(x0, x1) + i0) * step - a[0], (np.arange(z0, z1) + j0) * step - a[1])
        v = b - a
        t = np.clip((x * v[0] + z * v[1]) / max(float(v @ v), 1e-12), 0, 1)
        out[z0:z1, x0:x1] = np.minimum(out[z0:z1, x0:x1], np.hypot(x - t * v[0], z - t * v[1]))
    return out


def owns(grid, i0, j0, lines, half, unselected, widths=None):
    """(each arm's own road on the grid, the points mapped roads not selected hold within their mapped widths, the points within an arm's). An arm's road (trackband._own_road) goes on
    where its line lies on a step and within its mapped width, onto no point another road holds: another arm, or a mapped road not selected (unselected: its
    segments with their widths). A point another road holds stays that road's within its mapped width; beyond it, it goes to the arm whose line is nearer,
    each by its half width (widths: each arm's on the map; None: 2 * half). Rechberg: a point 0.9 m off the upper road's line (half 2.75 m) and 4.9 m off
    the lower's (half 4 m) is the upper road's, one 2.9 m off both is the lower's. Pure."""
    halves = [half] * len(lines) if widths is None else [width / 2 for width in widths]
    roads = [(trackband._own_road(grid, i0, j0, line, half), line, mapped) for line, mapped in zip(lines, halves)]
    for edge in unselected:
        line = _segment(edge["a"], edge["b"])
        roads.append((trackband._own_road(grid, i0, j0, line, edge["width"] / 2), line, edge["width"] / 2))
    # (a road's own points lie within its half width and the lanes read beyond it: two lattice steps and the rounding to one)
    reach = max([half] + [mapped for _own, _line, mapped in roads]) + 3 * trackheights.STEP
    ratio = [_apart(grid.shape, i0, j0, line, reach) / mapped for _own, line, mapped in roads]
    result = []
    for k, (line, mapped) in enumerate(zip(lines, halves)):
        claimed = np.zeros(grid.shape, bool)
        for n, (own, _line, _mapped) in enumerate(roads):
            if n != k:
                claimed |= own & (ratio[n] <= np.maximum(1.0, ratio[k]))
        result.append(trackband._own_road(grid, i0, j0, line, half, claimed, mapped))
    # (and an arm gives up such a point to the nearer one: held by both, it took the farther one's height, a step in its road)
    taken = [mine.copy() for mine in result]
    for n in range(len(result)):
        for k in range(len(result)):
            if k != n:
                result[n] &= ~(taken[k] & (ratio[n] > 1) & (ratio[k] < ratio[n]))
    held = np.zeros(grid.shape, bool)
    for (own, _line, _mapped), share in zip(roads[len(lines):], ratio[len(lines):]):
        held |= own & (share <= 1)
    return result, held, np.logical_or.reduce([share <= 1 for share in ratio[:len(lines)]])


def _over_steps(grid, i0, j0, line, half, lanes, *rows):
    """rows of an arm's lane heights (lanes: how far off the line), without what is a wall's: where its line lies on a step between two levels as built (grid;
    trackband._on_step) all of a cross-section, elsewhere a lane further off the middle's height than a road is across (CROSS_GRADE). Taken along from the lane's
    points before and after, a lane with none from the nearest lane that has: the slant kept would keep the wall (Rechberg: 0.7 m of 2.2 m left across 2 m of
    the smoothed road, a lane 3 m down by a wall's corner). Pure."""
    step = trackband._on_step(trackband._read_across(grid, i0, j0, line, half)[1])
    s = trackband._along(line)
    centre = len(lanes) // 2
    across = trackband.CROSS_GRADE * np.maximum(np.abs(lanes), trackheights.STEP)[:, None]
    out = []
    for heights in rows:
        heights = np.where(step[None], np.nan, heights)
        with np.errstate(invalid="ignore"):
            heights[np.abs(heights - heights[centre]) > across] = np.nan
        good = np.isfinite(heights)
        if not good[centre].any():
            return rows
        filled = np.array([np.interp(s, s[ok], lane[ok]) if ok.any() else np.full(len(s), np.nan) for lane, ok in zip(heights, good)])
        for k in np.flatnonzero(~good.any(axis=1)):
            near = np.flatnonzero(good.any(axis=1))
            filled[k] = filled[near[np.argmin(np.abs(near - k))]]
        out.append(filled)
    return tuple(out)


def _roads(path, scan, net):
    """The marked network's roads as built in the kn5 at path (scan): {"lines": its arms' lines, "width": the widest, "bounds", "built": the road's heights
    there, "i0", "j0": the lattice numbers of their first point, "own", "held", "mapped": owns there}. Of the file and the network alone, not of the draft or the
    strength: kept while both stay, so moving the strength doesn't reckon them again (Rechberg: owns, twice a request, 40 of 110 ms). Read-only arrays."""
    unselected, widths = net.get("unselected", []), net.get("widths")
    key = (path, editorinfo._stamp(path), json.dumps([net["lines"], unselected, widths], default=lambda v: np.asarray(v).tolist()))
    with _kept_lock:
        if key in _kept:
            return _kept[key]
    lines = [resample(line) for line in net["lines"]]
    width = max(edge["width"] for edge in net["segments"])
    points = np.vstack(lines)
    # (the slope read beyond the ends; and an unselected road holding a point of an arm's within its half width has its line inside, so its own road is
    # the same on this grid as on change_of's larger one: a wide road beside the network, half 20 m, would lie outside SLOPE_OVER_M)
    widest = max([edge["width"] for edge in unselected], default=0)
    margin = width / 2 + max(trackband.SLOPE_OVER_M, widest / 2 + 3 * trackheights.STEP)
    bounds = np.vstack([points.min(axis=0) - margin, points.max(axis=0) + margin])
    built, i0, j0 = trackband._ground(path, scan, None, bounds, road_only=True)
    own, held, mapped = owns(built, i0, j0, lines, width / 2, unselected, widths)
    for array in [built, held, mapped, *own]:
        array.setflags(write=False)
    roads = {"lines": lines, "width": width, "bounds": bounds, "built": built, "i0": i0, "j0": j0, "own": own, "held": held, "mapped": mapped}
    with _kept_lock:
        while len(_kept) >= KEPT:
            _kept.pop(next(iter(_kept)))
        _kept[key] = roads
    return roads


def _placed(mask, i0, j0, shape, at_i0, at_j0):
    """A boolean grid whose first point has the lattice numbers i0, j0, on one of shape whose first point has at_i0, at_j0: False beyond it. Pure."""
    out = np.zeros(shape, bool)
    di, dj = i0 - at_i0, j0 - at_j0
    z0, z1 = max(0, dj), min(shape[0], dj + mask.shape[0])
    x0, x1 = max(0, di), min(shape[1], di + mask.shape[1])
    if z0 < z1 and x0 < x1:
        out[z0:z1, x0:x1] = mask[z0 - dj:z1 - dj, x0 - di:x1 - di]
    return out


def _arms(path, scan, moved, roads):
    """Each arm of the network (roads: _roads) with its lanes' heights now (moved: the draft's other changes) and as built, and its slopes beyond its ends."""
    lines, width, bounds, built, i0, j0 = (roads[k] for k in ("lines", "width", "bounds", "built", "i0", "j0"))
    current = built if moved is None else trackband._ground(path, scan, moved, bounds, road_only=True)[0]
    arms = []
    for line, own in zip(lines, roads["own"]):
        lanes = trackband._across(width / 2)
        side = sideways(line)
        rows = [line + offset * side for offset in lanes]
        known = np.array([np.isfinite(trackband._on_grid(np.where(own, current, np.nan), i0, j0, row)) for row in rows]).any(axis=0)
        missing = np.flatnonzero(~known)
        if len(missing):
            groups = np.split(missing, np.flatnonzero(np.diff(missing) > 1) + 1)
            s = trackband._along(line)
            if any(s[group[-1]] - s[group[0]] > trackband.SNAP_M for group in groups):
                raise ValueError("Part of this road has no editable ground surface; exclude bridges, tunnels or gaps")
        h, b = _over_steps(built, i0, j0, line, width / 2, lanes, trackband._lanes(np.where(own, current, np.nan), i0, j0, rows),
                           trackband._lanes(np.where(own, built, np.nan), i0, j0, rows))
        before, after = trackband._onward(line[::-1]), trackband._onward(line)
        first = trackband._rise_onward(current, i0, j0, line[0], before)
        last = trackband._rise_onward(current, i0, j0, line[-1], after)
        arms.append({"line": line, "lanes": lanes, "heights": h, "built": b, "slopes": (None if first is None else -first, last)})
    return arms


def _blend(value):
    value = np.clip(value, 0, 1)
    return value * value * (3 - 2 * value)


def _targets(arms, even, shape, i0, j0, width, terminals, strength, own):
    """One target per lattice point, from the nearest arm whose own road it is (own: per arm); junction patches subsequently provide shared height/gradient.
    The nearest arm alone would raise a lower road beside an upper road's line to the upper road (Rechberg: by up to 4.2 m)."""
    step = trackheights.STEP
    distance, target, joining = np.full(shape, np.inf), np.zeros(shape), np.zeros(shape)
    original, correction = np.zeros(shape), np.zeros(shape)
    for arm, rows, mine in zip(arms, even, own):
        line, lanes = arm["line"], arm["lanes"]
        along = trackband._along(line)
        for k, (a, b) in enumerate(zip(line, line[1:])):
            reach = width / 2 + 2 * step
            low, high = np.minimum(a, b) - reach, np.maximum(a, b) + reach
            x0, x1 = max(0, math.floor(low[0] / step) - i0), min(shape[1], math.ceil(high[0] / step) - i0 + 1)
            z0, z1 = max(0, math.floor(low[1] / step) - j0), min(shape[0], math.ceil(high[1] / step) - j0 + 1)
            if x0 >= x1 or z0 >= z1:
                continue
            x, z = np.meshgrid((np.arange(x0, x1) + i0) * step - a[0], (np.arange(z0, z1) + j0) * step - a[1])
            v = b - a
            length = float(np.linalg.norm(v))
            t = np.clip((x * v[0] + z * v[1]) / (v @ v), 0, 1)
            d = np.hypot(x - t * v[0], z - t * v[1])
            side = (x * v[1] - z * v[0]) / length
            lane = np.clip((side - lanes[0]) / step, 0, len(lanes) - 1 - 1e-9)
            n, f = lane.astype(int), lane % 1
            value = ((rows[n, k] * (1 - f) + rows[n + 1, k] * f) * (1 - t)
                     + (rows[n, k + 1] * (1 - f) + rows[n + 1, k + 1] * f) * t)
            before = arm["heights"]
            previous = ((before[n, k] * (1 - f) + before[n + 1, k] * f) * (1 - t)
                        + (before[n, k + 1] * (1 - f) + before[n + 1, k + 1] * f) * t)
            s = along[k] + t * length
            join = np.ones(t.shape)
            if _key(line[0]) in terminals:
                join *= _blend((s - trackband.HOLD_M) / trackband.JOIN_M)
            if _key(line[-1]) in terminals:
                join *= _blend((along[-1] - s - trackband.HOLD_M) / trackband.JOIN_M)
            nearer = (d < distance[z0:z1, x0:x1]) & mine[z0:z1, x0:x1]
            distance[z0:z1, x0:x1][nearer] = d[nearer]
            target[z0:z1, x0:x1][nearer] = value[nearer]
            original[z0:z1, x0:x1][nearer] = previous[nearer]
            correction[z0:z1, x0:x1][nearer] = min(1., trackband._window(float(along[-1]), strength) / trackband.MIN_WINDOW_M)
            joining[z0:z1, x0:x1][nearer] = join[nearer]
    return target, original, correction, distance, joining


def _spread(delta, active, barrier, fade):
    """Extend edge deltas through adjoining terrain, stopping at unselected roads. One field means no overlap addition."""
    distance = np.full(delta.shape, np.inf)
    nearest = np.zeros(delta.shape, np.int32)
    points = np.flatnonzero(active)
    distance.flat[points] = 0
    nearest.flat[points] = points
    queue = [(0., int(p)) for p in points]
    heapq.heapify(queue)
    rows, cols = delta.shape
    offsets = [(a, b, trackheights.STEP * math.hypot(a, b)) for a, b in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1))]
    while queue:
        value, at = heapq.heappop(queue)
        if value != distance.flat[at]:
            continue
        z, x = divmod(at, cols)
        for dz, dx, length in offsets:
            nx, nz, next_value = x + dx, z + dz, value + length
            if 0 <= nx < cols and 0 <= nz < rows and next_value < fade and not barrier[nz, nx] and next_value < distance[nz, nx]:
                distance[nz, nx] = next_value
                nearest[nz, nx] = nearest.flat[at]
                heapq.heappush(queue, (next_value, nz * cols + nx))
    weight = 1 - _blend(distance / fade)
    return delta.ravel()[nearest] * weight, np.where(active, 0, weight)


def _influence(op, weight):
    """Low-resolution faint transition masks, separate from the full-resolution painted road footprint."""
    from PIL import Image
    image = Image.fromarray(np.rint(weight * 96).astype(np.uint8))
    tiles = []
    for tx in range(math.floor(op["x"] / 256), math.floor((op["x"] + 2 * (op["nx"] - 1)) / 256) + 1):
        for ty in range(math.floor(-(op["z"] + 2 * (op["nz"] - 1)) / 256), math.floor(-op["z"] / 256) + 1):
            part = image.transform((128, 128), Image.Transform.AFFINE,
                                   (1, 0, (tx * 256 - op["x"]) / 2 + .5, 0, 1, (-(ty + 1) * 256 - op["z"]) / 2 + .5), Image.Resampling.BILINEAR)
            if part.getbbox():
                if len(tiles) == editorinfo.MAX_TILES:
                    raise ValueError("The transition reaches too many tiles; choose a smaller road region")
                tiles.append({"tile": [tx, ty], "mask": base64.b64encode(editorinfo._png(np.asarray(part))).decode("ascii")})
    return {"material": "road_transition", "truncated": False, "tiles": tiles}


def _check_grades(current, delta, active, built, own, selected):
    """Refuse a new road step steeper than the existing road limit; an already steep brush bump may improve. Steps on one road only: between two changed
    points of one arm's own road (own: per arm; a wall between two arms may grow), and between a changed point and one of the selected road (selected: the
    painted region on the lattice within an arm's mapped width, no other road's) left as it was, where the surface as built goes on between them (built: its heights; points left out of the road between
    changed ones made a ridge of 1.07 m in 2 m, Rechberg). An unselected road keeps its edge: the transition stops there."""
    after = current + delta
    for dz, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
        first = (slice(0, -dz or None), slice(0, -dx or None)) if dx >= 0 else (slice(0, -dz), slice(1, None))
        last = (slice(dz, None), slice(dx, None)) if dx >= 0 else (slice(dz, None), slice(0, -1))
        length = trackheights.STEP * math.hypot(dx, dz)
        same = np.logical_or.reduce([mine[first] & mine[last] for mine in own])
        with np.errstate(invalid="ignore"):
            going_on = np.abs(built[first] - built[last]) <= trackband.CROSS_GRADE * length
        left = (active[first] & selected[last] & ~active[last]) | (active[last] & selected[first] & ~active[first])
        on = (active[first] & active[last] & same) | (left & going_on)
        before = np.abs(current[first] - current[last]) / length
        grade = np.abs(after[first] - after[last]) / length
        # MAX_GRADE is the existing road/wall distinction; 1mm/m covers raster rounding and float32 source vertices.
        if (grade[on] > np.maximum(trackband.MAX_GRADE, before[on] + .001)).any():
            raise ValueError("These approaches require a steep road join; mark a larger region or reduce strength")


def change_of(path, scan, moved, net, selection, blend, strength, id):
    """One coupled selected-road correction and its faint transition mask, on the existing lattice."""
    if type(strength) not in (int, float) or not 0 <= strength <= 1:
        raise ValueError("Invalid smoothing strength")
    if type(blend) not in (int, float) or not 2 <= blend <= 60:
        raise ValueError("Transition must be between 2 and 60 metres")
    if strength == 0:
        raise trackband.Refused("It is smooth here already")
    roads = _roads(path, scan, net)
    arms = _arms(path, scan, moved, roads)
    even = even_network(net, arms, strength)
    largest = max(float(np.abs(value - arm["heights"]).max()) for arm, value in zip(arms, even))
    fade = max(blend, trackband.SOFT_STEEPEST * largest / trackband.SIDE_SLOPE)
    width = max(edge["width"] for edge in net["segments"])
    points = np.vstack([arm["line"] for arm in arms])
    reach = width / 2 + fade + 2 * trackheights.STEP
    bounds = np.vstack([points.min(axis=0) - reach, points.max(axis=0) + reach])
    built, i0, j0 = trackband._ground(path, scan, None, bounds, road_only=True)
    current = built if moved is None else trackband._ground(path, scan, moved, bounds, road_only=True)[0]
    selected = roadregion.on_grid(selection, i0, j0, built.shape)
    # Include terrain-cell corner vertices touched by the selected paint; the 2 m mesh can extend beyond its image edge.
    on = np.pad(selected, 1)
    active = np.logical_or.reduce([on[z:z + selected.shape[0], x:x + selected.shape[1]] for z in range(3) for x in range(3)])
    # (owns lies within the arms' half width: on _roads' grid, all of it)
    def placed(mask):
        return _placed(mask, roads["i0"], roads["j0"], built.shape, i0, j0)
    own, held, mapped = [placed(mask) for mask in roads["own"]], placed(roads["held"]), placed(roads["mapped"])
    active &= np.logical_or.reduce(own) & np.isfinite(current)
    target, original, correction, distance, joining = _targets(arms, even, built.shape, i0, j0, width, {_key(p) for p in net["terminals"]}, strength, own)
    source_height = np.nan_to_num(current)
    # Interpolated lane samples differ slightly from true vertices. Apply that correction continuously from zero too.
    target = source_height + (target - original) + correction * (original - source_height)
    active &= np.isfinite(distance)
    x, z = np.meshgrid((np.arange(built.shape[1]) + i0) * 2, (np.arange(built.shape[0]) + j0) * 2)
    planes = junction_planes(net, arms, strength)
    for point in net["junctions"]:
        p = np.asarray(point)
        plane = planes[_key(p)]
        radius = max(width / 2 + 2, 4)
        share = 1 - _blend((np.hypot(x - p[0], z - p[1]) - radius) / trackband.JOIN_M)
        wanted = plane[0] + plane[1] * (x - p[0]) + plane[2] * (z - p[1])
        wanted = source_height + _junction_share(p, arms, strength) * (wanted - source_height)
        target = target * (1 - share) + wanted * share
    delta = np.where(active, (target - np.nan_to_num(current)) * joining, 0)
    for point in net["held_junctions"]:
        delta *= _blend((np.hypot(x - point[0], z - point[1]) - trackband.HOLD_M) / trackband.JOIN_M)
    field, transition = _spread(delta, active, np.isfinite(built) & ~active, fade)
    _check_grades(current, field, active, built, own, selected & mapped & ~held)
    field[0] = field[-1] = 0
    field[:, 0] = field[:, -1] = 0
    mm = np.rint(field * 1000).astype(np.int64)
    if not mm.any():
        raise trackband.Refused("It is smooth here already")
    op = {"id": id, "x": i0 * 2, "z": j0 * 2, "nx": built.shape[1], "nz": built.shape[0], "mm": mm.ravel().tolist()}
    wrong = trackheights.problem(op)
    if wrong:
        raise ValueError(wrong)
    return op, _influence(op, np.where(mm != 0, transition, 0))
