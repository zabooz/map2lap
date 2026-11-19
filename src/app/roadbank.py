"""Editor Bank road: one signed cross slope between A and B on a built mapped road, tilted about its mapped centreline.

The target is absolute: the road's existing cross slope e0 (the builder banks motorway and trunk curves itself,
grading.profiles) is read along A-B, and the change at lateral distance d (left of A->B positive) and station s is
d * w(s) * (target - e0(s)). w rises from 0 at A to 1 and falls back to 0 at B, so the marked ends keep their surface
and the core gets the target everywhere, evening a varying e0. The centreline keeps its height.

Example: 8 m wide, level, target 8 %: the left edge rises 32 cm, the right one sinks 32 cm; each transition takes 96 m.
"""
import math
import sys

import numpy as np

from app import builtroad, paths, roadbend, roadseparation, roadsurfaces, trackband, trackheights
from track import kn5, objectlist

if paths.ENGINE not in sys.path:
    sys.path.insert(0, paths.ENGINE)

MAX_PERCENT = 12.0      # a road's cross slope: the builder banks up to 8 % (BANK_E_MAX); racing banking is another range
# How steeply an edge may ramp against the centreline along the road: a conservative road-design value (e.g. TxDOT's
# superelevation runoff), not a worldwide limit. 0 to 8 % on 8 m then takes 96 m per transition.
EDGE_RAMP = 0.005
# A transition is at least two 2 m lattice cells: shorter, the ground's raster can not hold its curve.
MIN_RAMP_M = 4.0
SAMPLE_M = 1.0          # stations at which edges are checked: a lattice half-cell, finer than any transition
MAX_LENGTH_M = 10_000.0  # how far a "needed" length is searched: farther, no mark could give it


def weights(station, length, ramp):
    """How much of the change applies at each station: smoothstep 0->1 over ramp from A and from B, 1 between. Pure."""
    station = np.asarray(station, np.float64)
    t = np.clip(np.minimum(station, length - station) / max(ramp, 1e-9), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def change(d, station, length, ramp, target, e0):
    """The height change in m at lateral distances d (left of A->B positive) and stations; e0(stations): the existing
    cross slope in m per m toward the left. Pure."""
    station = np.asarray(station, np.float64)
    return np.asarray(d, np.float64) * weights(station, length, ramp) * (target - e0(station))


def edge_ramp(station, length, ramp, target, e0, half):
    """The steepest edge ramp (edge height against the centreline, per m along the road) the change makes, on the
    resulting surface: where the road already ramps steeper by itself and the result is no steeper, that is no ramp of
    the change. half: half the carriageway width. Pure."""
    station = np.asarray(station, np.float64)
    before = half * e0(station)
    after = before + half * weights(station, length, ramp) * (target - e0(station))
    made, had = np.abs(np.gradient(after, station)), np.abs(np.gradient(before, station))
    worse = made > had + 1e-9
    return float(made[worse].max()) if worse.any() else 0.0


def _stations(length):
    """Check stations every SAMPLE_M from A to B, both included. Pure."""
    return np.linspace(0.0, length, max(int(math.ceil(length / SAMPLE_M)) + 1, 3))


def needed_ramp(length, target, e0, half, limit=EDGE_RAMP):
    """The shortest transition (m, whole) whose edges stay within limit, or None if even half of A-B is too short. Pure."""
    station = _stations(length)
    ok = lambda ramp: edge_ramp(station, length, ramp, target, e0, half) <= limit + 1e-9
    low, high = MIN_RAMP_M, math.floor(length / 2)
    if high < low or not ok(high):
        return None
    if ok(low):
        return low
    while high - low > 1:               # (a longer transition is never steeper: bisect)
        middle = (low + high) // 2
        low, high = (low, middle) if ok(middle) else (middle, high)
    return float(high)


def _needed_length(length, target, e0, half):
    """How long A-B must be for the transitions, the existing slope stretched over it; None past MAX_LENGTH_M. Pure."""
    fits = lambda total: needed_ramp(total, target, lambda s: e0(np.asarray(s) * length / total), half) is not None
    low, high = length, 2 * length
    while not fits(high):
        low, high = high, 2 * high
        if high > MAX_LENGTH_M:
            return None
    while high - low > 1:
        middle = math.floor((low + high) / 2)
        low, high = (low, middle) if fits(middle) else (middle, high)
    return math.ceil(high)


def refusal(length, target, e0, half):
    """Why a target can not be set between A and B length m apart, or None. Pure."""
    if not isinstance(target, (int, float)) or not math.isfinite(target) or abs(target) > MAX_PERCENT / 100 + 1e-9:
        return f"Cross slope must be between -{MAX_PERCENT:g} and {MAX_PERCENT:g} percent"
    if needed_ramp(length, target, e0, half) is not None:
        return None
    steep = edge_ramp(_stations(length), length, length / 2, target, e0, half)
    needed = _needed_length(length, target, e0, half)
    far = f"{needed:.0f} m needed" if needed else f"more than {MAX_LENGTH_M:.0f} m needed"
    return (f"The edges would ramp at {steep * 100:.2f}% (maximum {EDGE_RAMP * 100:g}%): "
            f"{length:.0f} m available, {far}; mark A and B farther apart")


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


def field_of(bank):
    """The height change of a Bank road operation's bank {line, target, ramp, e0: [[station, slope], ...]} at AC [x, z]
    points, along its whole line and at any lateral distance. Pure."""
    line = np.asarray(bank["line"], np.float64)
    length = float(np.linalg.norm(np.diff(line, axis=0), axis=1).sum())
    samples = np.asarray(bank["e0"], np.float64).reshape(-1, 2)
    e0 = lambda s: np.interp(s, samples[:, 0], samples[:, 1])
    target, ramp = float(bank["target"]), float(bank["ramp"])

    def height(points):
        station, d = lateral(points, line)
        return change(d, station, length, ramp, target, e0)
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
    """op's mesh_offsets: what the raster does not do. Owned rows (own_offsets) less the raster where it moves them too;
    the raster taken back from a connected piece whose lowest vertex lies more than LEVEL_M over the ground road
    (ground_at([x, z]) -> heights): another level over the marked road."""
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
            keep = np.zeros(len(p), bool)
            for component in roadsurfaces._components(p, faces) if len(faces) else []:
                low = component[np.argmin(p[component, 1])]
                keep[component] = p[low, 1] - float(ground_at(p[low, [0, 2]][None])[0]) <= LEVEL_M
            change[keep], gx[keep], gz[keep] = 0.0, 0.0, 0.0
            if objectlist.kind_of(m["name"]) in trackheights.ON_THE_GROUND:
                # (a road line also goes up over the raster's bulges, trackheights._sag: off the ground that is taken back too)
                change[~keep] -= trackheights._sag(vertices, faces.reshape(-1, 3), field)[~keep]
            for k, mm, wx, wz in rows or []:
                change[k], gx[k], gz[k] = mm / 1000 - d[k], wx - ax[k], wz - az[k]
            touched = np.flatnonzero((np.abs(change) >= 0.0005) | (np.abs(gx) > 1e-8) | (np.abs(gz) > 1e-8))
            if len(touched):
                result[str(i)] = [[int(k), int(round(change[k] * 1000)), round(float(gx[k]), 7), round(float(gz[k]), 7)]
                                  for k in touched]
    return result


def describe(path, scan, points):
    """The marked unbranched road and its ordered centreline: Bend road's marking (two marks, no tunnel)."""
    return roadbend.describe(path, scan, points)


def junction_refusal(net, line, length, ramp, half):
    """Why a side road joining inside the bank refuses it, or None: its mouth would be torn off the tilted edge. Pure."""
    for junction in net.get("held_junctions", []):
        station, distance = roadseparation._project(np.asarray([junction], np.float64)[:, :2], line)
        if distance[0] <= half + 1 and weights(station, length, ramp)[0] > 1e-3:
            x, z = junction[:2]
            return f"A side road joins inside this bank at x={x:.0f}, z={z:.0f}; mark a stretch without it"
    return None


def step_refusal(height, line, net, half):
    """Why the marked road would part from a carriageway beside it, or None: where their edges lie within SHARED_EDGE_M,
    the other stays and a lift over trackband.OVERLAP_APART_M (what a car feels) is a step. Pure."""
    line = np.asarray(line, np.float64)
    length = float(roadseparation._stations(line)[-1])
    feet, lefts = _frame(line, np.linspace(0.0, length, max(int(math.ceil(length / trackheights.STEP)) + 1, 2)))
    for edge in net.get("unselected", []):
        other = np.asarray([edge["a"], edge["b"]], np.float64)
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
                continue        # (a junction at one level: junction_refusal)
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
    bank = {"line": np.asarray(line).tolist(), "target": 0.05, "ramp": length / 4, "half": half, "e0": [[0.0, 0.0], [length, 0.0]]}
    height = field_of(bank)
    other, dummy = roadbend._dummy(line, net, _lift(bank))
    fields = roadseparation.Fields(up=held_at_edge(height, line, half), down=None, deck=height, ground=None)
    return roadseparation._offsets(path, scan, moved, line, dummy, net, other, [(length / 2, _lift(bank))], [], gone,
                                   blockers=[], solo="upper", fields=fields)


def change_of(path, scan, moved, points, target, id_, gone=None):
    """One source-bound Bank road operation between the marks: {id, x, z, nx, nz, mm, mesh_offsets, bank}."""
    net, line = describe(path, scan, points)
    half = max(edge["width"] for edge in net["segments"]) / 2
    samples = current(path, scan, moved, net, line)
    e0 = lambda s: np.interp(s, samples[:, 0], samples[:, 1])
    length = float(roadseparation._stations(line)[-1])
    wrong = refusal(length, target, e0, half)
    if wrong:
        raise ValueError(wrong)
    ramp = needed_ramp(length, target, e0, half)
    bank = {"points": points, "target": float(target), "line": line.tolist(), "ramp": float(ramp), "half": float(half),
            "e0": np.round(samples, 6).tolist(),
            "road_ids": sorted({edge["road"] for edge in net["segments"] if edge.get("road")})}
    height = field_of(bank)
    wrong = (junction_refusal(net, line, length, ramp, half) or step_refusal(height, line, net, half)
             or clearance_refusal(path, scan, moved, net, line, height, half))
    if wrong:
        raise ValueError(wrong)
    op = {"id": id_, **ground_raster(height, line, net, half, _lift(bank)), "mesh_offsets": {}, "bank": bank}
    corners = np.array([[op["x"], op["z"]], [op["x"] + 2 * op["nx"], op["z"] + 2 * op["nz"]]], np.float64)
    grid, i0, j0 = trackband._ground(path, scan, moved, corners)
    op["mesh_offsets"] = level_offsets(path, scan, moved, op, own_offsets(path, scan, moved, net, bank, gone),
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
