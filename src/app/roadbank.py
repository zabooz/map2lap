"""Editor Bank road: one cross slope over a marked stretch A-B of a built mapped road, tilted about its mapped centreline.

The user gives a banking (a magnitude) and which edge is high (side: +1 the left one as A runs to B, -1 the right); the
target cross slope is side * banking, absolute: the road's existing cross slope e0 (the builder banks motorway and trunk
curves itself, grading.profiles) is read along the road, and the change at lateral distance d (left positive) and
station s is d * w(s) * (target - e0(s)). w is 1 from A to B, the fully banked stretch, and falls to 0 over a transition
before A and one after B, each as short as the user's edge-ramp limit allows. The centreline keeps its height.

Example: 8 m wide, level, banking 8 %, limit 0.5 %: the left edge rises 32 cm, the right one sinks 32 cm between A and B;
each transition takes 96 m.
"""
import math
import sys

import numpy as np

from app import builtroad, paths, roadbend, roadregion, roadseparation, roadsurfaces, trackband, trackheights
from track import editorinfo, kn5, objectlist

if paths.ENGINE not in sys.path:
    sys.path.insert(0, paths.ENGINE)

# Public roads bank up to about 12 %, the builder up to 8 % (BANK_E_MAX); a track may want more. 20 % keeps the banked
# road well inside what the track band reads as one road across (trackband.CROSS_GRADE, 25 %): steeper, Bend, Smooth and
# Stitch would read the high side as the foot of a wall.
MAX_PERCENT = 20.0
# How steeply an edge may ramp against the centreline along the road, by default: a conservative road-design value
# (e.g. TxDOT's superelevation runoff), not a worldwide limit; the user sets another between the two below.
EDGE_RAMP = 0.005
MIN_EDGE_RAMP, MAX_EDGE_RAMP = 0.002, 0.03
# A transition is at least two 2 m lattice cells: shorter, the ground's raster can not hold its curve.
MIN_RAMP_M = 4.0
# The longest transition looked for: 20 % on a 20 m wide road at 0.2 % takes 1500 m; past this much road ahead no
# junction-free stretch is likely and the walk would only cost.
MAX_RAMP_M = 1500.0
SAMPLE_M = 1.0          # stations at which edges are checked: a lattice half-cell, finer than any transition
# A curve whose mapped line turns at least this much one way, and less than a third of it the other way, is one clear
# curve whose outside edge starts high; less is a straight or an S-bend.
CLEAR_TURN_RAD = math.radians(15.0)


def weights(station, span):
    """How much of the change applies at each station; span (A, B, before, after): 1 from A to B, smoothstep down to 0
    over before ahead of A and over after beyond B. Pure."""
    a, b, before, after = span
    station = np.asarray(station, np.float64)
    up = np.clip((station - (a - before)) / max(before, 1e-9), 0.0, 1.0)
    down = np.clip(((b + after) - station) / max(after, 1e-9), 0.0, 1.0)
    t = np.minimum(up, down)
    return t * t * (3.0 - 2.0 * t)


def change(d, station, span, target, e0):
    """The height change in m at lateral distances d (left of the way positive) and stations; e0(stations): the existing
    cross slope in m per m toward the left. Pure."""
    station = np.asarray(station, np.float64)
    return np.asarray(d, np.float64) * weights(station, span) * (target - e0(station))


def edge_ramp(station, span, target, e0, half):
    """The steepest edge ramp (edge height against the centreline, per m along the road) the change makes, on the
    resulting surface: where the road already ramps steeper by itself and the result is no steeper, that is no ramp of
    the change. half: half the carriageway width. Pure."""
    station = np.asarray(station, np.float64)
    before = half * e0(station)
    after = before + half * weights(station, span) * (target - e0(station))
    made, had = np.abs(np.gradient(after, station)), np.abs(np.gradient(before, station))
    worse = made > had + 1e-9
    return float(made[worse].max()) if worse.any() else 0.0


def _stations(first, last):
    """Check stations every SAMPLE_M from first to last, both included. Pure."""
    return np.linspace(first, last, max(int(math.ceil((last - first) / SAMPLE_M)) + 1, 3))


def needed_ramps(e0, a, b, target, half, limit, room):
    """(before, after): each side's shortest transition (m, whole) whose resulting edges stay within limit, at most the
    road there is (room: metres before A, after B); None for a side that does not fit. Pure."""
    def side(first):
        reach = math.floor(min(room[0 if first else 1], MAX_RAMP_M))
        def ok(ramp):
            span = (a, b, ramp, 1.0) if first else (a, b, 1.0, ramp)
            station = _stations(a - ramp, a) if first else _stations(b, b + ramp)
            return edge_ramp(station, span, target, e0, half) <= limit + 1e-9
        low, high = MIN_RAMP_M, reach
        if high < low or not ok(high):
            return None
        if ok(low):
            return low
        while high - low > 1:               # (a longer transition is never steeper: bisect on whole metres)
            middle = (low + high) // 2
            low, high = (low, middle) if ok(middle) else (middle, high)
        return float(high)
    return side(True), side(False)


def most_that_fits(e0, a, b, side, half, limit, room):
    """The largest banking (to 0.1 %, up to MAX_PERCENT) whose transitions fit the room. Pure."""
    fits = lambda tenths: None not in needed_ramps(e0, a, b, side * tenths / 1000, half, limit, room)
    low, high = 0, int(MAX_PERCENT * 10)
    if fits(high):
        return high / 1000
    while high - low > 1:
        middle = (low + high) // 2
        low, high = (middle, high) if fits(middle) else (low, middle)
    return low / 1000 if fits(low) else 0.0


def value_refusal(banking, limit):
    """Why a banking or an edge-ramp limit can not be set, or None. Pure."""
    good = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)
    if not good(banking) or not 0 <= banking <= MAX_PERCENT / 100 + 1e-9:
        return f"Banking must be between 0 and {MAX_PERCENT:g} percent"
    if not good(limit) or not MIN_EDGE_RAMP - 1e-9 <= limit <= MAX_EDGE_RAMP + 1e-9:
        return f"The edge ramp limit must be between {MIN_EDGE_RAMP * 100:g} and {MAX_EDGE_RAMP * 100:g} percent"
    return None


def start_side(line):
    """Which edge starts high: +1 the left one (as the line runs), -1 the right; in one clear curve its outside edge, else
    the left. AC's z points south: the left of a way (tx, tz) is (tz, -tx). Pure."""
    line = np.asarray(line, np.float64)
    v = np.diff(line, axis=0)
    v = v[np.linalg.norm(v, axis=1) > 1e-9]
    if len(v) < 2:
        return 1
    t = v / np.linalg.norm(v, axis=1)[:, None]
    left = np.c_[t[:-1, 1], -t[:-1, 0]]
    turn = np.arcsin(np.clip((t[1:] * left).sum(axis=1), -1, 1))      # (+: toward the left)
    ways = turn[turn > 0].sum(), -turn[turn < 0].sum()
    if ways[0] >= CLEAR_TURN_RAD and ways[1] < ways[0] / 3:
        return -1           # (a left-hand curve: its outside, the right edge, high)
    if ways[1] >= CLEAR_TURN_RAD and ways[0] < ways[1] / 3:
        return 1
    return 1


# At a junction the road goes on along the mapped piece turning least, if it turns less than this; the others join it
# (a driveway, a fork, a lay-by: the banking takes their mouths along). Turning more, the road ends there (a T-junction).
GO_ON_RAD = math.radians(45.0)


def _onward(positions, here, previous, choices, joined):
    """The (node, edge) of choices the road goes on along from here (coming from previous), or None; the rest into
    joined. Pure but for joined."""
    if not choices:
        return None
    way = positions[here] - previous
    way = way / max(np.linalg.norm(way), 1e-12)
    def turn(choice):
        step = positions[choice[0]] - positions[here]
        return math.acos(float(np.clip(step @ way / max(np.linalg.norm(step), 1e-12), -1, 1)))
    best = min(choices, key=turn)
    if turn(best) > GO_ON_RAD:
        return None
    joined.extend(e for n, e in choices if e is not best[1])
    return best


def walk(data, end, inward, road_ids, length, passed=None, joined=None):
    """(points, stop) going on along the mapped road beyond end ([x, z], a marked line's end) away from inward (its next
    point): the points passed (k, 2), the last length m along; stop None, or (why, metres there were): a junction where
    nothing goes on straight enough (GO_ON_RAD), the road's end or a tunnel. data: roadregion's graph; road_ids: the
    marked road's, to find the edge end lies on; passed: a list that gets the graph edge leading to each point; joined:
    one that gets the edges joining at the junctions passed. Pure but for passed and joined."""
    passed = [] if passed is None else passed
    joined = [] if joined is None else joined
    positions, _numbers, edges = data
    positions = np.asarray(positions, np.float64)
    end, inward = np.asarray(end, np.float64), np.asarray(inward, np.float64)
    links = {}
    for edge in edges:
        links.setdefault(edge["a"], []).append((edge["b"], edge))
        links.setdefault(edge["b"], []).append((edge["a"], edge))
    best, first = math.inf, None
    for edge in edges:
        if edge["road"] not in road_ids:
            continue
        a, b = positions[edge["a"]], positions[edge["b"]]
        v = b - a
        t = float(np.clip((end - a) @ v / max(v @ v, 1e-12), 0, 1))
        distance = float(np.linalg.norm(a + t * v - end))
        if distance < best:
            best, first = distance, (edge, t)
    if first is None or best > 1.0:
        return np.zeros((0, 2)), ("road end", 0.0)
    edge, t = first
    away = end - inward
    ahead = [n for n in (edge["a"], edge["b"]) if (positions[n] - end) @ away > 1e-9]
    if not ahead:
        here, came = (edge["a"] if t < 0.5 else edge["b"]), None
        ahead_edges = [(n, e) for n, e in links[here] if (positions[n] - positions[here]) @ away > 1e-9]
        chosen = _onward(positions, here, inward, ahead_edges, joined)
        if chosen is None:
            return np.zeros((0, 2)), ("junction" if ahead_edges else "road end", 0.0)
        node, edge = chosen
        here, came = node, here
        points, gone, previous = [], float(np.linalg.norm(positions[node] - end)), end
    else:
        node = ahead[0]
        points, gone, previous, came = [], float(np.linalg.norm(positions[node] - end)), end, None
        here = node
    while True:
        if edge["structure"] == "tunnel":
            return np.asarray(points).reshape(-1, 2), ("tunnel", float(gone - np.linalg.norm(positions[here] - previous)))
        if gone >= length:
            over = gone - length
            step = positions[here] - previous
            points.append(positions[here] - step / max(np.linalg.norm(step), 1e-12) * over)
            passed.append(edge)
            return np.asarray(points).reshape(-1, 2), None
        points.append(positions[here])
        passed.append(edge)
        onward = [(n, e) for n, e in links[here] if e is not edge and n != came]
        chosen = _onward(positions, here, previous, onward, joined)
        if chosen is None:
            return np.asarray(points).reshape(-1, 2), ("junction" if onward else "road end", float(gone))
        previous, came = positions[here], here
        here, edge = chosen
        gone += float(np.linalg.norm(positions[here] - previous))


def lateral(points, line, frame=False):
    """(station, signed lateral distance) of AC [x, z] points from the mapped line, left of its way positive; frame: also
    each point's unit left (n, 2). AC's z points south, so the left of a way (tx, tz) is (tz, -tx): going north (-z),
    left is west (-x). Pure."""
    points, line = np.asarray(points, np.float64).reshape(-1, 2), np.asarray(line, np.float64)
    along = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(line, axis=0), axis=1))]
    station, side, best = np.zeros(len(points)), np.zeros(len(points)), np.full(len(points), np.inf)
    lefts = np.zeros((len(points), 2))
    for k, (a, b) in enumerate(zip(line, line[1:])):
        v = b - a
        length = math.sqrt(v @ v)
        t = np.clip((points - a) @ v / (v @ v), 0, 1)
        offset = points - (a + t[:, None] * v)
        d = np.linalg.norm(offset, axis=1)
        on = d < best
        left = np.array([v[1], -v[0]]) / length
        station[on], side[on], best[on] = along[k] + t[on] * length, (offset @ left)[on], d[on]
        lefts[on] = left
    return (station, side, lefts) if frame else (station, side)


def kerb_field_of(bank):
    """The part of a bank's field kerbs and stitches get on top of the height raster: they follow the raster like the
    ground (trackheights.FOLLOW), so only on the marked road's bridges (bank["decks"], station ranges), where the raster
    stays out, does the bank's field move them. Pure."""
    decks = [tuple(r) for r in bank.get("decks", [])]
    if not decks:
        return lambda points: np.zeros(len(np.asarray(points).reshape(-1, 2)))
    line, height = np.asarray(bank["line"], np.float64), field_of(bank)

    def on_decks(points):
        station, _d = lateral(points, line)
        inside = np.zeros(len(station), bool)
        for first, last in decks:
            inside |= (station >= first) & (station <= last)
        return np.where(inside, height(points), 0.0)
    return on_decks


def span_of(bank):
    """(A, B, before, after) of a bank, stations along its line. Pure."""
    return tuple(float(bank[k]) for k in ("a", "b", "before", "after"))


def field_of(bank):
    """The height change of a Bank road operation's bank {line, target, a, b, before, after, e0: [[station, slope], ...]}
    at AC [x, z] points, along its whole line and at any lateral distance. Pure."""
    line = np.asarray(bank["line"], np.float64)
    samples = np.asarray(bank["e0"], np.float64).reshape(-1, 2)
    e0 = lambda s: np.interp(s, samples[:, 0], samples[:, 1])
    target, span = float(bank["target"]), span_of(bank)

    def height(points):
        station, d = lateral(points, line)
        return change(d, station, span, target, e0)
    return height


# A cross reading whose five points do not lie on a line within this, or steeper than CROSS_GRADE, is not the road's
# surface (a kerb, a wall's foot, a bank beside it): it takes its neighbours' (grading.profiles BANK_LIDAR_RMS_M).
READ_RMS_M = 0.03
READ_ACROSS = (-0.6, -0.3, 0.0, 0.3, 0.6)       # of half the width: inside the edges, where a kerb or gutter can lie
SMOOTH_M = 10.0          # the readings smoothed along the road (BANK_LIDAR_SIGMA_M): a lattice step's noise, not a curve
# A vertex more than this above the ground road under it belongs to another level (a bridge over the marked road, its
# parapet or guardrail): the raster must not carry it (roadsurfaces.scope: road skins and kerbs lie within it).
LEVEL_M = 0.5
# The marked road's edge this close to another carriageway's shares its surface or a kerb-narrow strip: a lift there is
# a step a car drives over, not a slope a verge takes.
SHARED_EDGE_M = 1.0


def current_of(heights_at, line, half):
    """[[station, cross slope], ...] of the mapped line every lattice step, read across at READ_ACROSS of half the width
    by heights_at([x, z] points) -> heights, smoothed along. Pure."""
    line = np.asarray(line, np.float64)
    length = float(np.linalg.norm(np.diff(line, axis=0), axis=1).sum())
    station = np.linspace(0.0, length, max(int(math.ceil(length / trackheights.STEP)) + 1, 2))
    feet, lefts = _frame(line, station)
    d = half * np.asarray(READ_ACROSS)
    points = feet[:, None, :] + d[None, :, None] * lefts[:, None, :]
    y = np.asarray(heights_at(points.reshape(-1, 2)), np.float64).reshape(len(station), len(d))
    slope = ((y - y.mean(axis=1, keepdims=True)) * d).sum(axis=1) / (d * d).sum()
    fit = y.mean(axis=1, keepdims=True) + slope[:, None] * d
    rms = np.sqrt(((y - fit) ** 2).mean(axis=1))
    good = np.isfinite(rms) & (rms <= READ_RMS_M) & (np.abs(slope) <= trackband.CROSS_GRADE)
    if not good.any():
        raise ValueError("The road's cross slope can not be read between A and B")
    slope = np.interp(station, station[good], slope[good])
    return np.c_[station, _smoothed(slope, station)]


def _frame(line, station):
    """(feet (n, 2), unit lefts (n, 2)) of the mapped line at stations. Pure."""
    along = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(line, axis=0), axis=1))]
    k = np.clip(np.searchsorted(along, station, side="right") - 1, 0, len(line) - 2)
    v = line[k + 1] - line[k]
    length = np.linalg.norm(v, axis=1)
    feet = line[k] + v * ((station - along[k]) / length)[:, None]
    return feet, np.c_[v[:, 1], -v[:, 0]] / length[:, None]


def _smoothed(values, station):
    """values along stations, Gaussian-smoothed over SMOOTH_M; the ends keep their weight. Pure."""
    weight = np.exp(-0.5 * ((station[:, None] - station[None, :]) / SMOOTH_M) ** 2)
    return (weight @ values) / weight.sum(axis=1)


def held_at_edge(height, line, half):
    """height of [x, z] points read at the nearest carriageway edge beyond it: a guardrail or verge beside the road
    keeps the edge's height instead of continuing the slope. Pure."""
    def at(points):
        points = np.asarray(points, np.float64).reshape(-1, 2)
        _station, d, lefts = lateral(points, line, frame=True)
        return height(points - (d - np.clip(d, -half, half))[:, None] * lefts)
    return at


def ground_raster(height, line, net, half, lift):
    """The ground's part of a bank on the 2 m lattice: {"x", "z", "nx", "nz", "mm"}. Inside the carriageway the bank,
    beside it the edge's height faded out over max(6 m, 15 x lift) (roadseparation._field: a 10 % side slope takes 15 m
    per metre), nothing at another mapped road on the same level or under the marked road's bridges. Pure."""
    line = np.asarray(line, np.float64)
    fade = max(6.0, 15.0 * lift)
    reach = half + fade + 2 * trackheights.STEP
    x0, z0 = (np.floor((line.min(axis=0) - reach) / trackheights.STEP).astype(int) * trackheights.STEP).tolist()
    x1, z1 = (np.ceil((line.max(axis=0) + reach) / trackheights.STEP).astype(int) * trackheights.STEP).tolist()
    nx, nz = (x1 - x0) // trackheights.STEP + 1, (z1 - z0) // trackheights.STEP + 1
    if nx * nz > trackheights.MAX_POINTS:
        raise ValueError("Mark a shorter road stretch")
    x, z = np.meshgrid(x0 + np.arange(nx) * trackheights.STEP, z0 + np.arange(nz) * trackheights.STEP)
    points = np.c_[x.ravel(), z.ravel()].astype(np.float64)
    _station, d = lateral(points, line)
    t = np.clip((np.abs(d) - half) / fade, 0.0, 1.0)
    value = held_at_edge(height, line, half)(points) * (1.0 - t * t * (3.0 - 2.0 * t))
    value *= roadseparation._kept_road_weight(points, line, net)
    value[roadsurfaces.structures(net, points[:, 0], points[:, 1], extra=math.inf) != 0] = 0.0
    mm = np.round(value * 1000).astype(np.int64).reshape(nz, nx)
    mm[0], mm[-1], mm[:, 0], mm[:, -1] = 0, 0, 0, 0
    return {"x": int(x0), "z": int(z0), "nx": int(nx), "nz": int(nz), "mm": mm.ravel().tolist()}


def _lift(bank):
    """The largest edge lift (m) of a bank. Pure."""
    e0 = np.asarray(bank["e0"], np.float64).reshape(-1, 2)[:, 1]
    return float(bank["half"] * np.abs(bank["target"] - e0).max())


def own_offsets(path, scan, moved, net, bank, gone):
    """The marked road's own source vertices and the change each wants (roadseparation._offsets' rows): its skin,
    markings, guardrails and kerbs at the edge's height beyond it, its deck tilted whole; ground is left to the raster."""
    line = np.asarray(bank["line"], np.float64)
    height, lift = field_of(bank), max(_lift(bank), 0.01)
    other, dummy = roadbend._dummy(line, net, lift)
    fields = roadseparation.Fields(up=held_at_edge(height, line, bank["half"]), down=None, deck=height, ground=None)
    length = float(roadseparation._stations(line)[-1])
    return roadseparation._offsets(path, scan, moved, line, dummy, net, other, [(length / 2, lift)], [], gone,
                                   solo="upper", fields=fields)


def level_offsets(path, scan, moved, op, owned, ground_at):
    """op's mesh_offsets: what the raster does not do. On the ground road's level everything that follows the ground
    follows the raster alone, the marked road's lines and verges too: the road's surface is the raster's, and the exact
    field differs from it by centimetres in a tight curve or where a side road stops it (a line would dip under the
    asphalt). A connected piece whose lowest reached vertex lies more than LEVEL_M over the ground road (ground_at([x, z])
    -> heights) is another level: the raster is taken back, and an owned row (own_offsets: the marked road's bridge)
    gets its own change. Wires hang on poles that go with the ground (trackheights._wire_changes): never taken back."""
    field = trackheights.Field([op])
    result = {}
    with open(path, "rb") as f:
        for i, m in enumerate(scan["meshes"]):
            rows = owned.get(str(i))
            follows = objectlist.kind_of(m["name"]) in trackheights.FOLLOW
            if not follows:
                if rows:
                    result[str(i)] = rows
                continue
            if not rows and not field.reaches(m["center"], m["radius"]):
                continue
            vertices, faces = kn5.mesh_arrays(f, m)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            p = vertices["pos"].astype(np.float64)
            d, ax, az = field.at(p[:, 0], p[:, 2])
            change, gx, gz = -d, -ax, -az
            # The ground is the level itself. Another piece is judged where the raster reaches it, by its lowest vertex
            # there: a long piece's lowest point elsewhere says nothing about this place; no ground read there: it follows.
            keep = np.full(len(p), objectlist.kind_of(m["name"]) in {"ground", "wire"})
            for component in roadsurfaces._components(p, faces) if len(faces) and not keep.all() else []:
                reached = component[(np.abs(d[component]) > 0) | (np.abs(ax[component]) > 0) | (np.abs(az[component]) > 0)]
                if not len(reached):
                    keep[component] = True
                    continue
                low = reached[np.argmin(p[reached, 1])]
                over = p[low, 1] - float(ground_at(p[low, [0, 2]][None])[0])
                keep[component] = not over > LEVEL_M
            change[keep], gx[keep], gz[keep] = 0.0, 0.0, 0.0
            if objectlist.kind_of(m["name"]) in trackheights.ON_THE_GROUND:
                # (a road line also goes up over the raster's bulges, trackheights._sag: off the ground that is taken back too)
                change[~keep] -= trackheights._sag(vertices, faces.reshape(-1, 3), field)[~keep]
            for k, mm, wx, wz in rows or []:
                if not keep[k]:
                    change[k], gx[k], gz[k] = mm / 1000 - d[k], wx - ax[k], wz - az[k]
            touched = np.flatnonzero((np.abs(change) >= 0.0005) | (np.abs(gx) > 1e-8) | (np.abs(gz) > 1e-8))
            if len(touched):
                result[str(i)] = [[int(k), int(round(change[k] * 1000)), round(float(gx[k]), 7), round(float(gz[k]), 7)]
                                  for k in touched]
    return result


def describe(path, scan, points):
    """The marked unbranched road and its ordered centreline: Bend road's marking (two marks, no tunnel)."""
    return roadbend.describe(path, scan, points)


def step_refusal(height, line, net, half):
    """Why the marked road would part from a carriageway beside it, or None: where their edges lie within SHARED_EDGE_M,
    the other stays and a lift over trackband.OVERLAP_APART_M (what a car feels) is a step. A road joining the marked one
    (an end of it on the marked road: a driveway, a fork) is no carriageway beside it: its mouth banks along. Pure."""
    line = np.asarray(line, np.float64)
    length = float(roadseparation._stations(line)[-1])
    feet, lefts = _frame(line, np.linspace(0.0, length, max(int(math.ceil(length / trackheights.STEP)) + 1, 2)))
    for edge in net.get("unselected", []):
        other = np.asarray([edge["a"], edge["b"]], np.float64)
        if roadseparation._project(other, line)[1].min() <= half + 1.0:
            continue
        for side in (1.0, -1.0):
            points = feet + side * half * lefts
            gap = roadseparation._project(points, other)[1] - edge["width"] / 2
            near = gap <= SHARED_EDGE_M
            if not near.any():
                continue
            lifts = height(points[near])
            worst = lifts[np.argmax(np.abs(lifts))]
            if abs(worst) > trackband.OVERLAP_APART_M:
                return (f"This bank would leave the marked road {abs(worst) * 100:.0f} cm "
                        f"{'higher' if worst > 0 else 'lower'} than the carriageway beside it; leave it level there")
    return None


def clearance_refusal(path, scan, moved, net, line, height, half):
    """Why a bank would cut a crossing's clearance, or None: a marked bridge's lowered edge over the road below, a marked
    road's raised edge under the bridge over it; no new loss under the required clearance (as roadbend._clearance)."""
    from roads import LIDAR_HEADROOM_M
    from roadmesh import DECK_DEPTH, GIRDER_D
    line = np.asarray(line, np.float64)
    for edge in net.get("crossings", []):
        other = np.asarray([edge["a"], edge["b"]], np.float64)
        for point, station, _other_station in roadseparation._intersections(line, other):
            own_bridge = roadsurfaces.structures(net, np.array([point[0]]), np.array([point[1]]))[0] == 1
            if own_bridge == (edge.get("structure") == "bridge"):
                continue        # (a junction at one level: its mouth banks along, change_of)
            feet, lefts = _frame(line, np.clip(station + np.array([-1, 0, 1]) * edge["width"] / 2, 0, None))
            across = half * np.linspace(-1, 1, 9)
            values = height((feet[:, None, :] + across[None, :, None] * lefts[:, None, :]).reshape(-1, 2))
            ground, i0, j0 = trackband._ground(path, scan, moved, np.asarray([point - 4, point + 4]))
            gap = roadseparation._deck_height(path, scan, moved, point) - float(trackband._on_grid(ground, i0, j0, point[None])[0])
            after, side = (gap + float(values.min()), "low") if own_bridge else (gap - float(values.max()), "high")
            minimum = min(gap, LIDAR_HEADROOM_M + DECK_DEPTH + GIRDER_D)
            if after < minimum - 0.001:
                return (f"This bank would reduce crossing clearance to {after:.2f} m at its {side} edge; "
                        f"at least {minimum:.2f} m is required")
    return None


def current(path, scan, moved, net, line):
    """[[station, cross slope], ...] of the marked road as the draft has it (current_of on its own surface)."""
    half = max(edge["width"] for edge in net["segments"]) / 2
    return current_of(lambda at: builtroad.heights(path, scan, moved, net, at)[0], line, half)


def blockers(path, scan, moved, net, line, gone=None):
    """Railway and tunnel parts a nominal 5 % bank between the marks would reach, for red crosses before a target is set."""
    half = max(edge["width"] for edge in net["segments"]) / 2
    length = float(roadseparation._stations(line)[-1])
    bank = {"line": np.asarray(line).tolist(), "target": 0.05, "a": 0.0, "b": length, "before": 1.0, "after": 1.0, "half": half,
            "e0": [[0.0, 0.0], [length, 0.0]]}
    height = field_of(bank)
    other, dummy = roadbend._dummy(line, net, _lift(bank))
    fields = roadseparation.Fields(up=held_at_edge(height, line, half), down=None, deck=height, ground=None)
    return roadseparation._offsets(path, scan, moved, line, dummy, net, other, [(length / 2, _lift(bank))], [], gone,
                                   blockers=[], solo="upper", fields=fields)


def _graph_of(path):
    """The track's mapped road graph (roadregion), as builtroad.pick reads it."""
    folder = editorinfo._folder(path)
    import os
    return roadregion._source_graph(folder, editorinfo._stamp(os.path.join(folder, "manifest.json")))


def _length(points):
    """Metres along a polyline. Pure."""
    points = np.asarray(points, np.float64).reshape(-1, 2)
    return float(np.linalg.norm(np.diff(points, axis=0), axis=1).sum()) if len(points) > 1 else 0.0


def _cut(line, first, last):
    """The part of a polyline from station first to station last. Pure."""
    line = np.asarray(line, np.float64)
    along = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(line, axis=0), axis=1))]
    at = lambda s: np.array([np.interp(s, along, line[:, 0]), np.interp(s, along, line[:, 1])])
    inside = line[(along > first) & (along < last)]
    return np.vstack([at(first), inside, at(last)])


def _runs(flags):
    """(first, last) index pairs of each run of True. Pure."""
    flags = np.r_[False, np.asarray(flags, bool), False]
    edges = np.flatnonzero(np.diff(flags.astype(np.int8)))
    return [(int(a), int(b) - 1) for a, b in zip(edges[::2], edges[1::2])]


def reach(data, net, line):
    """((points before A, stop), (points after B, stop)) of the marked road going on beyond its marks, MAX_RAMP_M at most,
    each with the graph edges it passed: room for the transitions."""
    ids = builtroad.road_ids(net)
    out = []
    for end, inward in ((line[0], line[1]), (line[-1], line[-2])):
        passed = []
        points, stop = walk(data, end, inward, ids, MAX_RAMP_M, passed)
        out.append((points, stop, passed))
    return out


# Two bankings on the same mapped road overlap where their lines (transitions included) run together over more than this:
# touching end to end is no overlap, a metre of shared road already puts two transitions on one place.
SHARED_M = 1.0


def overlap(heights, road_ids, line, ignore=()):
    """Why a banking along line (its transitions included) on road_ids can not be added: it meets another banking on the
    same mapped road (other road IDs are another level or road, never an overlap); None if not. ignore: ids being
    replaced. Pure."""
    line = np.asarray(line, np.float64)
    samples = _cut(line, 0.0, _length(line))
    along = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(samples, axis=0), axis=1))]
    places = np.c_[np.interp(np.arange(0.5, along[-1], 0.5), along, samples[:, 0]),
                   np.interp(np.arange(0.5, along[-1], 0.5), along, samples[:, 1])]
    for op in heights:
        bank = op.get("bank")
        if not isinstance(bank, dict) or op.get("id") in ignore or not set(road_ids) & set(bank.get("road_ids", [])):
            continue
        on = roadseparation._project(places, np.asarray(bank["line"], np.float64))[1] < 0.5
        if on.sum() * 0.5 > SHARED_M:
            return "There is banking here already; click it to change it"
    return None


def change_of(path, scan, moved, points, banking, side, limit, id_, gone=None, others=()):
    """One source-bound Bank road operation: A-B fully banked, transitions beyond them; {id, x, z, nx, nz, mm,
    mesh_offsets, bank}. banking: the magnitude (m per m); side: +1 the left edge high as A runs to B, -1 the right;
    others: the draft's other height changes, for the overlap check."""
    wrong = value_refusal(banking, limit) or (None if side in (1, -1) else "Side must be left or right")
    if wrong:
        raise ValueError(wrong)
    net, line = describe(path, scan, points)
    half = max(edge["width"] for edge in net["segments"]) / 2
    (ahead, stop_a, passed_a), (beyond, stop_b, passed_b) = reach(_graph_of(path), net, line)
    room = (stop_a[1] if stop_a else MAX_RAMP_M, stop_b[1] if stop_b else MAX_RAMP_M)
    full = np.vstack([ahead[::-1], line, beyond]) if len(ahead) or len(beyond) else line
    a = _length(np.vstack([ahead[::-1], line[:1]])) if len(ahead) else 0.0
    b = a + _length(line)
    width = max(edge["width"] for edge in net["segments"])
    grown = [{"a": p.tolist(), "b": q.tolist(), "width": width, "road": e["road"], "structure": e["structure"]}
             for points_, passed, start in ((ahead, passed_a, line[0]), (beyond, passed_b, line[-1]))
             for p, q, e in zip(np.vstack([start[None], points_])[:-1], points_, passed)]
    # The map gives the marked road's own continuation beyond A and B as unselected; the transitions lie on it now, so it
    # is no carriageway beside them (step_refusal) nor a road the ground must stop at (_kept_road_weight).
    on_it = lambda edge: roadseparation._project(np.linspace(edge["a"], edge["b"], 5), full)[1].max() <= 1.0
    # A road joining the marked one (a driveway, a fork: an end of it on the marked road) is taken along: on the road its
    # mouth banks with it, beside it it fades out like the ground; only roads running beside it stay as they are.
    joins = lambda edge: roadseparation._project(np.asarray([edge["a"], edge["b"]], np.float64), full)[1].min() <= half + 1.0
    extended = {**net, "segments": [*net["segments"], *grown],
                "unselected": [e for e in net.get("unselected", []) if not on_it(e) and not joins(e)]}
    samples = current(path, scan, moved, extended, full)
    e0 = lambda s: np.interp(s, samples[:, 0], samples[:, 1])
    target = side * banking
    ramps = needed_ramps(e0, a, b, target, half, limit, room)
    if None in ramps:
        most = most_that_fits(e0, a, b, side, half, limit, room)
        k = ramps.index(None)
        stop, where = (stop_a, "before A") if k == 0 else (stop_b, "after B")
        why = f"meets a {stop[0]} after {stop[1]:.0f} m" if stop else f"needs more than {MAX_RAMP_M:.0f} m of road"
        raise ValueError(f"Only {most * 100:.1f} % banking fits here: the transition {where} {why}")
    before, after = ramps
    first, last = a - before, b + after
    line_cut = _cut(full, first, last)
    shifted = samples[(samples[:, 0] >= first - trackheights.STEP) & (samples[:, 0] <= last + trackheights.STEP)] - [first, 0.0]
    ys = builtroad.heights(path, scan, moved, extended, line_cut)[0]
    good = np.isfinite(ys)
    stations = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(line_cut, axis=0), axis=1))]
    ys = np.interp(stations, stations[good], ys[good]) if good.any() else np.zeros(len(line_cut))
    on_deck = roadsurfaces.structures(extended, line_cut[:, 0], line_cut[:, 1]) == 1
    decks = [[float(stations[k]), float(stations[j])] for k, j in _runs(on_deck)]
    bank = {"points": points, "banking": float(banking), "side": int(side), "target": float(target), "limit": float(limit), "decks": decks,
            "line": np.round(line_cut, 3).tolist(), "heights": np.round(ys, 3).tolist(),
            "a": float(before), "b": float(before + b - a), "before": float(before), "after": float(after),
            "half": float(half), "e0": np.round(shifted, 6).tolist(),
            "road_ids": sorted({edge["road"] for edge in extended["segments"] if edge.get("road")})}
    height = field_of(bank)
    span = span_of(bank)
    wrong = (overlap(others, bank["road_ids"], line_cut) or step_refusal(height, line_cut, extended, half)
             or clearance_refusal(path, scan, moved, net, line_cut, height, half))
    if wrong:
        raise ValueError(wrong)
    op = {"id": id_, **ground_raster(height, line_cut, extended, half, _lift(bank)), "mesh_offsets": {}, "bank": bank}
    corners = np.array([[op["x"], op["z"]], [op["x"] + 2 * op["nx"], op["z"] + 2 * op["nz"]]], np.float64)
    grid, i0, j0 = trackband._ground(path, scan, moved, corners)
    op["mesh_offsets"] = level_offsets(path, scan, moved, op, own_offsets(path, scan, moved, extended, bank, gone),
                                       lambda at: trackband._on_grid(grid, i0, j0, np.asarray(at, np.float64)))
    wrong = trackheights.problem(op)
    if wrong:
        raise ValueError(wrong)
    return op


def matching(heights, net, points):
    """Earlier Bank road operations on the same mapped roads and ends (1 m, either order). Pure."""
    ids = {edge.get("road") for edge in net["segments"]} - {None}
    ends = np.asarray(points, np.float64)[:, :2]
    found = []
    for op in heights:
        bank = op.get("bank")
        if not isinstance(bank, dict) or not ids.intersection(bank.get("road_ids", [])):
            continue
        previous = np.asarray(bank.get("points", []), np.float64)
        if previous.shape not in ((2, 2), (2, 3)):
            continue
        previous = previous[:, :2]
        if min(np.linalg.norm(previous - ends, axis=1).max(), np.linalg.norm(previous[::-1] - ends, axis=1).max()) <= 1:
            found.append(op)
    return found
