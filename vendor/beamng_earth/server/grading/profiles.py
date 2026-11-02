"""Plan and one road's profile: smoothing, cuts, the ground under a bridge's end."""
import math

import numpy as np

import roads as roadsmod

from .settings import PROFILE_STEP


def median_profile(z, step, width):
    """The running median of a profile sampled every `step` m over `width` m (the window shrunk evenly near the ends, so
    an end keeps its height). Pure."""
    import fast
    half = int(round(width / 2.0 / step))
    if half < 1 or len(z) < 3:
        return np.asarray(z, np.float64)
    fast.require(71, "median_profile")
    return fast._ef.median_profile(np.ascontiguousarray(z, np.float64), half)


def smooth_profile(z, step, sigma):
    """Gaussian smoothing of a profile sampled every `step` m (turned about its end points past the ends: the ends keep
    their heights, so the parts of a road split at a junction meet at one height). Pure."""
    import fast
    fast.require(69, "smooth_profile")      # the Rust loop (~7000 roads a 9-tile set)
    return fast._ef.smooth_profile(np.ascontiguousarray(z, np.float64), float(step), float(sigma))


def resample(xy, step):
    """Points every `step` m along a polyline (xy (k, 2)), the last point kept, and their arc lengths."""
    import fast
    if not len(xy):
        return xy[:1].copy(), np.zeros(1)
    fast.require(0, "resample")
    return fast._ef.resample(np.ascontiguousarray(np.asarray(xy, np.float64)[:, :2]), float(step))


class Plan:
    """One road's grading: vertices (n, 2) in the frame's ENU metres, their target heights, core half width; abut: does
    it lead onto a bridge at its (first, last) vertex (grade_points)."""
    # (free)
    __slots__ = ("xy", "z", "half", "bbox", "abut", "cut", "road_half", "rid", "max_wall", "bank", "free", "tunnel",
                 "under", "beyond")

    def __init__(self, xy, z, half, abut=(False, False), cut=None, road_half=None):
        self.xy, self.z, self.half, self.abut = xy, z, float(half), (bool(abut[0]), bool(abut[1]))
        # (n - 1, 6) per segment, NaN where none: a cutting's wall offset from the centre line, its top's height and
        # the top's offset, on the left, then the right (_add_cuts)
        self.cut = cut
        self.road_half = float(road_half) if road_half is not None else float(half)    # the carriageway's half width
        self.rid = -1           # the road (map feature) it is part of: _plan_cell (each cell plans its own stretch of it)
        self.max_wall = WALL_MAX_H_M    # its cuttings' walls at most this tall (wall_max_h)
        self.bank = None                # (n,) its cross slope (m per m toward its left: a banked curve, bank) or None
        self.free = (False, False)      # does its (first, last) end give way (Grader._free_ends)
        self.tunnel = False             # a tunnel's own plan (TUNNEL_TAG: an open section, a mouth), another level
        self.under = (False, False)     # does its (first, last) end go on under its deck (_under_deck)
        # (first, last): m past that end its grading stops, square across (an end going on under its deck as far as the
        # elevation under it is closed: past that the ground is the elevation's, regrade_past_ends), or None: it blends
        # out round the end
        self.beyond = (None, None)
        pad = half + T_MAX
        self.bbox = (xy[:, 0].min() - pad, xy[:, 1].min() - pad, xy[:, 0].max() + pad, xy[:, 1].max() + pad)


def clip_polyline(xy, box):
    """The runs (each (k, 2), k >= 2) of polyline xy (k, 2) inside box (x0, y0, x1, y1), segments cut at its edges
    (Liang-Barsky). Pure."""
    x0, y0, x1, y1 = box
    runs, cur = [], None
    for i in range(len(xy) - 1):
        px, py = float(xy[i, 0]), float(xy[i, 1])
        dx, dy = float(xy[i + 1, 0]) - px, float(xy[i + 1, 1]) - py
        ta, tb, ok = 0.0, 1.0, True
        for p, q in ((-dx, px - x0), (dx, x1 - px), (-dy, py - y0), (dy, y1 - py)):
            if p == 0.0:
                if q < 0.0:
                    ok = False
                    break
                continue
            r = q / p
            if p < 0.0:
                if r > tb:
                    ok = False
                    break
                ta = max(ta, r)
            else:
                if r < ta:
                    ok = False
                    break
                tb = min(tb, r)
        if not ok or tb <= ta:
            if cur is not None:
                runs.append(cur)
                cur = None
            continue
        a = (px + dx * ta, py + dy * ta) if ta > 0.0 else (px, py)
        b = (px + dx * tb, py + dy * tb) if tb < 1.0 else (float(xy[i + 1, 0]), float(xy[i + 1, 1]))
        if cur is not None and ta == 0.0:
            cur.append(b)
        else:
            if cur is not None:
                runs.append(cur)
            cur = [a, b]
        if tb < 1.0:
            runs.append(cur)
            cur = None
    if cur is not None:
        runs.append(cur)
    return [np.array(r, np.float64) for r in runs if len(r) >= 2]


def tunnel_plan(xy, z, spec):
    """A Plan of a tunnel's own (TUNNEL_TAG) for road spec: its core and carriageway as any road's (plan_road), Plan.tunnel
    set. (With the shoulder counted as its carriageway, the rule that a road's band never pulls another road's
    carriageway at another level (the native loop's on_other_car) would never hold for a trench's shoulder: an open
    section 5.7 m under a bridge's approach pulled its abutment 0.9 m down.)"""
    p = Plan(xy, z, spec.width / 2 + shoulder(spec), road_half=spec.width / 2)
    p.tunnel = True
    return p


def plan_road(frame, lonlat, spec, elev):
    """The Plan of one road part (lonlat (k, 2)); elev(lat, lon) -> m at PROFILE_ZOOM. Pure given elev."""
    return plan_roads(frame, [(lonlat, spec)], elev)[0]


def _normals(xy):
    """Unit normals (k, 2) of a polyline's points (the direction from the neighbours). Pure."""
    xy = np.asarray(xy, np.float64)[:, :2]
    if len(xy) < 2:
        return np.zeros((len(xy), 2))
    d = np.gradient(xy, axis=0)
    ln = np.maximum(np.hypot(d[:, 0], d[:, 1]), 1e-9)
    return np.stack([-d[:, 1] / ln, d[:, 0] / ln], axis=1)


def plan_roads(frame, parts, elev, abut=None, ext=None, pins=None, cuts=True, coarse=False, fine=False, under=None,
               obs=None):
    """plan_road for many (lonlat, spec) parts with one elev call (its cost is per call); abut: per part (start, end)
    flags, the ends leading onto a bridge (fill_abutment); ext: per part (before, after), the lines (k, 2) in the frame
    from its start / end outward along the part the road goes on in (Grader._extensions), or None: their ground is in
    the part's profile smoothing; pins: per part (start, end) heights its ends are held at, or None (Grader._pins: a
    road ending on a more smoothed one meets it at its height); fine: the elevation is lidar
    (ABUT_*_FINE); obs(xy (m, 2), spec) -> measured heights (m,) of a
    part's samples (NaN where none) or None: they stand in for the DEM's (roadz.py, on coarse elevation: Grader._obs).
    Pure given elev and obs."""
    if not parts:
        return []
    ll = np.concatenate([lonlat for lonlat, _ in parts])
    E, N, _ = frame.geodetic_to_enu(ll[:, 1], ll[:, 0], 0.0)
    prof, k = [], 0
    for j, (lonlat, spec) in enumerate(parts):
        m = len(lonlat)
        line = np.stack([E[k:k + m], N[k:k + m]], axis=1)
        k += m
        # (an even step, PROFILE_STEP or a little under, so the samples end on both ends: a short last step made the
        # smoothing lean at that end, and the parts of a road met 0.2 m apart on a 20 % grade)
        length = float(np.hypot(*np.diff(line, axis=0).T).sum()) if m >= 2 else 0.0
        step = length / max(1, math.ceil(length / PROFILE_STEP - 1e-9)) * (1.0 + 1e-9) if length > 0 else PROFILE_STEP
        xy, _ = resample(line, step)
        if len(xy) < 2:
            prof.append(None)
            continue
        side, bank_side = [], []
        for out in (ext[j] if ext is not None else (None, None)):
            if out is None or len(out) < 2:
                side.append(np.zeros((0, 2)))
                bank_side.append(np.zeros((0, 2)))
            else:                       # (from the node outward; the node is the part's own end sample)
                bank_side.append(resample(np.asarray(out, np.float64), step)[0][1:])
                # Extra bank geometry must not change longitudinal DEM sampling
                # or the bridge solver's established approach/underpass profiles.
                reach = 3.0 * profile_sigma(spec) + PROFILE_STEP
                arc = np.r_[0., np.cumsum(np.linalg.norm(np.diff(out, axis=0), axis=1))]
                if arc[-1] > reach + 1e-8:
                    out = np.vstack([np.asarray(out)[arc < reach], _point_along(out, reach)])
                side.append(resample(np.asarray(out, np.float64), step)[0][1:])
        prof.append((xy, side[0][::-1], side[1], step, bank_side[0][::-1], bank_side[1]))
    pts = [np.concatenate([b, xy, a]) for xy, b, a, *_ in (p for p in prof if p is not None)]
    if not pts:
        return [None] * len(parts)
    allxy = np.concatenate(pts)
    if coarse:
        # coarse elevation (dem.coarse_at): the median of the centre line and COARSE_SIDE_M to either side,
        # so a pit or a spike narrower than the data's own cells does not drag the road into a walled trench (Perm's
        # primary sat 4-5 m under the ground 7 m beside it, at grade in the street photos)
        nrm = np.concatenate([_normals(q) for q in pts])
        three = np.concatenate([allxy, allxy + nrm * COARSE_SIDE_M, allxy - nrm * COARSE_SIDE_M])
        la, lo, _ = frame.enu_to_geodetic(three[:, 0], three[:, 1], 0.0)
        z3 = np.asarray(elev(la, lo), np.float64).reshape(3, -1)
        zall = np.median(z3, axis=0)
    else:
        la, lo, _ = frame.enu_to_geodetic(allxy[:, 0], allxy[:, 1], 0.0)
        zall = np.asarray(elev(la, lo), np.float64)
    out, k = [], 0
    pend = []                   # (out index, _plan's arguments)
    for j, ((lonlat, spec), pr) in enumerate(zip(parts, prof)):
        if pr is None:
            out.append(None)
            continue
        xy, before, after, step, bank_before, bank_after = pr
        nb, na = len(before), len(after)
        zx = zall[k:k + nb + len(xy) + na]
        k += nb + len(xy) + na
        if obs is not None:
            o = obs(xy, spec)
            if o is not None and len(o) == len(xy) and np.isfinite(o).any():
                zx = zx.copy()
                zx[nb:nb + len(xy)] = np.where(np.isfinite(o), o, zx[nb:nb + len(xy)])
        ab = (False, False)
        if abut is not None and ABUT_FILL_ON:
            ab = (bool(abut[j][0]), bool(abut[j][1]))
            if ab[0] and nb:            # (no extension past an end onto a bridge: its fill is the part's own)
                zx, nb = zx[nb:], 0
            if ab[1] and na:
                zx, na = zx[:len(zx) - na], 0
            # (with the road going on past its other end: an 8 m part between a junction and a bridge that the map draws
            # 4 m short of its bank has nothing of its own further on to tell the bank from the road, its end stayed 1.5 m
            # down the bank, 19 %, and the deck with it, 5 G where it reached the junction: Rechberg, Carinthia)
            for at_end in (False, True):
                if ab[int(at_end)]:
                    zx = fill_abutment(zx, at_end, fine=fine)   # (fine)
        pin = pins[j] if pins is not None else (None, None)
        if pin[0] is not None and not nb and not ab[0]:     # (the end sample held: the smoothing keeps an end's height)
            zx = zx.copy()
            zx[0] = pin[0]
        if pin[1] is not None and not na and not ab[1]:
            zx = zx.copy()
            zx[-1] = pin[1]
        # Curvature and its runoff need the joined-road context too. Computing
        # banking on xy alone puts a partial curvature window at every map
        # segment end, even where the longitudinal profile is continuous.
        if ab[0]:
            bank_before = bank_before[:0]
        if ab[1]:
            bank_after = bank_after[:0]
        bank_xy = np.concatenate([bank_before, xy, bank_after])
        out.append(None)        # (planned below, with the elevation's cross slopes in one call)
        ud = (bool(under[j][0]), bool(under[j][1])) if under is not None else (False, False)
        pend.append((len(out) - 1, xy, zx, spec, ab, (nb, na), step, bank_xy, (len(bank_before), len(bank_after)), ud))
    lidar = _lidar_banks(frame, elev, [(p[7], p[3]) for p in pend]) if fine else [None] * len(pend)

    def ground(xy):                 # (the elevation under a deck, _under_deck)
        la, lo, _ = frame.enu_to_geodetic(xy[:, 0], xy[:, 1], 0.0)
        return np.asarray(elev(la, lo), np.float64)
    for (i, xy, zx, spec, ab, ext_, step_, bank_xy, bext, ud), lb in zip(pend, lidar):
        out[i] = _plan(xy, zx, spec, ab, ext_, step_, bank_xy=bank_xy, bank_ext=bext, lidar_bank=lb, fine=fine,
                       under_deck=ud, ground=ground)
    if SHARP_ON and cuts:           # (cuts False: the profile alone, Grader._stronger_z)
        _add_cuts(frame, [p if p is not None and sp.kind in roadsmod.BUILT else None
                          for p, (_ll, sp) in zip(out, parts)], elev)
    return out


WALL_MAX_H_M = 4.0      # m a sharp cutting's wall stands over the road at most (the slope above it is graded) ...
WALL_MAX_H_CITY_M = 10.0  # ... a major road's in town (concrete): the full depth of its trench (Munich's McGraw-Graben:
                        # vertical concrete walls the whole way up, Mapillary; with the 4 m cap the bank above
                        # stood as a bare cliff over the wall once the near ground was drawn sharp)


def wall_max_h(spec):
    """How tall a sharp cutting's wall beside road spec (roads.Spec) may stand: WALL_MAX_H_CITY_M for a major road in
    town (roads.CONCRETE_WALL_CLASSES, the concrete walls), else WALL_MAX_H_M (stone walls, mountain passes)."""
    return WALL_MAX_H_CITY_M if (spec.urban and spec.cls in roadsmod.CONCRETE_WALL_CLASSES) else WALL_MAX_H_M


HAIRPIN_SPAN_M = 20.0   # a road's direction this far back and on ...
HAIRPIN_TURN_DEG = 90.0  # ... turned this much: a tight bend (earthfast.tight_bends) ...
HAIRPIN_PAD_M = 15.0    # ... and this far either side of it: no sharp cutting, no retaining wall


def bend_zone(xy):
    """Which points of a polyline (k, 2) lie at or within HAIRPIN_PAD_M (along it) of a tight bend."""
    import fast
    fast.require(42, "tight_bends")
    xy = np.ascontiguousarray(np.asarray(xy, np.float64)[:, :2])
    m = np.asarray(fast._ef.tight_bends(xy, float(HAIRPIN_SPAN_M), float(HAIRPIN_TURN_DEG)))
    if not m.any():
        return m
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    sb = s[m]
    return np.abs(s[:, None] - sb[None, :]).min(axis=1) <= HAIRPIN_PAD_M


def _add_cuts(frame, plans, elev):
    """Sets Plan.cut on the plans (None entries skipped): per segment and side a cutting's wall (SHARP_*), from the raw
    ground elev(lat, lon) sampled outward from the carriageway's edge: the ground rising SHARP_MIN_M or more at
    SHARP_GRADE or steeper on average. The data spreads a vertical wall evenly round where it stands: its wall is put
    where the climb is half done (never on the carriageway; a fall: never inside the core, its sidewalk on the level),
    its top where it is done (the Rust kernels earthfast.sharp_probes / sharp_cuts; the ground lookup between them)."""
    import fast
    fast.require(42, "sharp cuttings")
    f64 = np.float64
    keep = [p for p in plans if p is not None and len(p.xy) >= 2]
    jobs = []
    for p in keep:
        q, o = fast._ef.sharp_probes(np.ascontiguousarray(p.xy[:, :2], f64), float(p.road_half), float(p.half),
                                     float(SHARP_REACH_M), float(SHARP_STEP_M))
        jobs.append((p, q, o))
    if not jobs:
        return
    allp = np.concatenate([q for _, q, _ in jobs])
    la, lo, _ = frame.enu_to_geodetic(allp[:, 0], allp[:, 1], 0.0)
    g = np.asarray(elev(np.asarray(la), np.asarray(lo)), f64)       # (as plan_roads' heights)
    k = 0
    for p, q, o in jobs:
        cut = fast._ef.sharp_cuts(np.ascontiguousarray(g[k:k + len(q)]), np.ascontiguousarray(p.z, f64), o,
                                  float(p.road_half), float(p.half), float(SHARP_MIN_M), float(SHARP_GRADE),
                                  float(SHARP_STEP_M), int(SHARP_RUN_N))
        k += len(q)
        if cut is not None:
            # (none at a tight bend: a hairpin's apex and approaches are graded smoothly, no wall into the turn)
            bend = bend_zone(p.xy[:, :2])
            cut = cut.copy()
            if bend.any():
                cut[bend[:-1] | bend[1:]] = np.nan
            # (a cutting's wall at most WALL_MAX_H_M tall, the ground above it sloping back to the hill as real pass
            # walls do; a 12 m wall stood between the Stelvio's hairpin legs)
            zmin = np.minimum(p.z[:-1], p.z[1:])
            # (a shallow climb on one side only: no cutting there, SHARP_LONE_MIN_M)
            climb = np.isfinite(cut[:, [1, 4]])
            shallow = climb & ((cut[:, [1, 4]] - zmin[:, None]) < SHARP_LONE_MIN_M)
            lone = shallow & ~climb[:, ::-1]
            for side, c0 in ((0, 0), (1, 3)):
                cut[lone[:, side], c0:c0 + 3] = np.nan
            for c in (1, 4):
                cut[:, c] = np.minimum(cut[:, c], zmin + getattr(p, "max_wall", WALL_MAX_H_M))
            if np.isfinite(cut[:, 0]).any() or np.isfinite(cut[:, 3]).any():
                p.cut = cut


def _point_along(line, d):
    """The point d m along polyline line (k, 2) from its first point (its last when shorter). Walks only as far as it
    needs (a whole line's cumulative length per road end cost Grader._extensions most of its time)."""
    acc = 0.0
    for i in range(len(line) - 1):
        ax, ay = float(line[i][0]), float(line[i][1])
        bx, by = float(line[i + 1][0]), float(line[i + 1][1])
        seg = math.hypot(bx - ax, by - ay)
        if seg > 0 and acc + seg >= d:
            t = (d - acc) / seg
            return np.array([ax + (bx - ax) * t, ay + (by - ay) * t])
        acc += seg
    return np.array([float(line[-1][0]), float(line[-1][1])])


def profile_sigma(spec):
    """m: the profile smoothing of a road of this spec."""
    if spec.kind not in roadsmod.BUILT:
        return DIRT_SIGMA_M
    if spec.cls in MAJOR_CLASSES and not getattr(spec, "link", False):
        return max(SIGMA_M, SIGMA_MAJOR_M)
    return max(SIGMA_M, CLASS_SIGMA_M.get(spec.cls, SIGMA_M)) if not getattr(spec, "link", False) else SIGMA_M


def _plan(xy, z, spec, abut=(False, False), ext=(0, 0), step=PROFILE_STEP, bank_xy=None, bank_ext=None,
          lidar_bank=None, fine=False, under_deck=(False, False), ground=None):
    """ext: (before, after), samples of z past the part's ends (plan_roads): smoothed with it, then dropped. step: m
    between the samples. bank_xy: the matching extended geometry, trimmed after the curvature/runoff pass. ground (xy
    (m, 2) -> m): the elevation, for how far an end onto a bridge goes on under its deck (_under_deck)."""
    built = spec.kind in roadsmod.BUILT
    zs = smooth_profile(median_profile(z, step, MEDIAN_M if built else DIRT_MEDIAN_M), step,
                        profile_sigma(spec))[ext[0]:len(z) - ext[1]]
    # thin to VERTEX_STEP (the profile stays smooth between: linear in the grading pass)
    every = max(1, int(round(VERTEX_STEP / PROFILE_STEP)))
    keep = np.r_[np.arange(0, len(xy) - 1, every), len(xy) - 1]
    # the carriageway as a city street would have it (never from the land cover), or the measured one
    width = max(spec.width, roadsmod.carriageway(spec.cls, spec.kind, True, None, spec.oneway)) if built else spec.width
    if spec.median:             # a divided road's carriageway: never over the other one
        width = max(spec.width, roadsmod.dual_cap(spec.median, width))
    xk, zk, grow, opens = xy[keep], zs[keep], (0, 0), (False, False)
    if fine and any(under_deck):    # on under the deck at the approach's grade
        xk, zk, grow, opens = _under_deck(xk, zk, under_deck, width / 2, ground)
    plan = Plan(xk, zk, width / 2 + shoulder(spec), abut, road_half=width / 2)
    if fine and any(under_deck):
        plan.under = (bool(grow[0]), bool(grow[1]))
        plan.beyond = tuple(0.0 if grow[e] and opens[e] else None for e in (0, 1))
    plan.max_wall = wall_max_h(spec)
    bext = ext if bank_ext is None else bank_ext
    if lidar_bank is not None and np.isfinite(lidar_bank).any():     # (the elevation's own)
        b = _bank_lidar(lidar_bank, step, abut, bext, xy if bank_xy is None else bank_xy)
    else:
        b = bank(xy if bank_xy is None else bank_xy, spec, abut, bext)
    if b is not None:
        if bank_xy is not None:
            b = b[bext[0]:len(bank_xy) - bext[1]]
        plan.bank = np.r_[np.full(grow[0], b[keep][0]), b[keep], np.full(grow[1], b[keep][-1])]   # (its ends' too)
    return plan


# A road's plan ends at a bridge's abutment, and the grading holds its end height flat past it (grade_points: a point
# beyond the end takes the end's height) under the deck's first metres. A deck stays over that ground: it would run level
# off the abutment and kink onto the approach's grade, and a deck meeting the approach at its grade (roads TANGENT_*)
# would dip under it. Where the elevation is lidar the plan goes on UNDER_DECK_M under the deck at its end's grade,
# falling UNDER_DECK_FALL below it: the ground stays under the deck, the deck is free to meet the approach's grade. The
# fall is the one a deck needs over one 2 m terrain cell (roads.DECK_CLEAR): the terrain cell across the joint runs from
# a corner on the road to a corner under the deck, so a steeper fall sinks the road's own last metre with it, an edge
# across the carriageway at the deck's start. Only at a bridge part no other part joins at either end (a single deck, each half of a
# twin bridge: the decks laid tangent); under a junction's bridge the ramps meet it at their own grades and the
# extensions would cross under its decks (Grader._simple_abuts).
# Where the elevation opens under the deck within UNDER_DECK_M (more than UNDER_DECK_OPEN_M under that grade line: the
# thinnest deck's depth, nothing passes under the deck nearer the road), the plan goes on only to the opening, at least
# UNDER_DECK_MIN_M (one 2 m terrain cell: the cell under the deck's end on the road's height, no hole under the joint),
# and its grading stops there (Plan.beyond): the ground under the rest of the deck is the elevation's. Carried
# UNDER_DECK_M whatever lay under the deck, two approaches filled a 15.7 m bridge over a stream 7 m deep to the road's
# height (RN 147 at Moulismes, France: the stream drawn on the fill, up at the road). Where it stays closed (the deck on
# its embankment, or along a slope the lidar draws at the road's height) the plan blends out round its end as before,
# under the deck's first metres: cut off there, a deck along the Grossglockner road's slope had the grass come up
# through its start.
UNDER_DECK_M = 6.0
UNDER_DECK_MIN_M = 2.0
UNDER_DECK_OPEN_M = roadsmod.DECK_MIN_DEPTH
UNDER_DECK_STEP_M = 1.0     # m between the elevation's samples under the deck
UNDER_DECK_FALL = roadsmod.DECK_CLEAR / UNDER_DECK_MIN_M    # m per m under the end's grade line
UNDER_DECK_GRADE_M = 10.0   # m of the plan before its end its grade is read over


def _under_reach(zp, g, ground):
    """m a plan ending at height zp at grade g goes on under its deck: the elevation ground (m,) at UNDER_DECK_STEP_M,
    2 x UNDER_DECK_STEP_M, ... past its end, up to the first sample more than UNDER_DECK_OPEN_M under the grade line;
    UNDER_DECK_MIN_M at least, UNDER_DECK_M at most. Pure."""
    a = UNDER_DECK_STEP_M * np.arange(1, len(ground) + 1)
    open_ = np.flatnonzero(np.asarray(ground, np.float64) < zp + g * a - UNDER_DECK_OPEN_M)
    reach = UNDER_DECK_M if not len(open_) else float(a[open_[0]]) - UNDER_DECK_STEP_M
    return float(np.clip(reach, UNDER_DECK_MIN_M, UNDER_DECK_M))


def _under_deck(xy, z, abut, half, ground=None):
    """Plan vertices xy (n, 2), heights z with a vertex past each end onto a bridge (abut): UNDER_DECK_M past it, or
    with ground (xy (m, 2) -> the elevation (m,)) as far as _under_reach finds the elevation under the deck closed.
    Returns (xy, z, (added before, added after), (does the elevation open under the deck within UNDER_DECK_M at the
    first end, at the last)). Pure given ground."""
    xy, z = np.asarray(xy, np.float64), np.asarray(z, np.float64)
    if len(xy) < 2:
        return xy, z, (0, 0), (False, False)
    grow, opens = [0, 0], [False, False]
    for e in (0, 1):
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]     # (again after a vertex added at the start)
        if not abut[e] or s[-1] < 2.0:
            continue
        back = min(UNDER_DECK_GRADE_M, float(s[-1]))
        if e == 0:
            q = np.array([np.interp(back, s, xy[:, 0]), np.interp(back, s, xy[:, 1])])
            zq, p, zp = float(np.interp(back, s, z)), xy[0], float(z[0])
        else:
            q = np.array([np.interp(s[-1] - back, s, xy[:, 0]), np.interp(s[-1] - back, s, xy[:, 1])])
            zq, p, zp = float(np.interp(s[-1] - back, s, z)), xy[-1], float(z[-1])
        u = (p - q) / max(float(np.hypot(*(p - q))), 1e-9)
        g = (zp - zq) / back
        reach = UNDER_DECK_M
        if ground is not None:
            a = UNDER_DECK_STEP_M * np.arange(1, int(round(UNDER_DECK_M / UNDER_DECK_STEP_M)) + 1)
            reach = _under_reach(zp, g, ground(p[None, :] + a[:, None] * u[None, :]))
            opens[e] = reach < UNDER_DECK_M
        new = p + u * reach
        zn = zp + g * reach - UNDER_DECK_FALL * reach
        if e == 0:
            xy, z = np.r_[new[None], xy], np.r_[zn, z]
        else:
            xy, z = np.r_[xy, new[None]], np.r_[z, zn]
        grow[e] = 1
    return xy, z, tuple(grow), tuple(opens)


# (read inside functions only; here so that the parts can load each other)
from .settings import (
    ABUT_FILL_ON, CLASS_SIGMA_M, COARSE_SIDE_M, DIRT_MEDIAN_M, DIRT_SIGMA_M, MAJOR_CLASSES, MEDIAN_M, SHARP_GRADE,
    SHARP_LONE_MIN_M, SHARP_MIN_M, SHARP_ON, SHARP_REACH_M, SHARP_RUN_N, SHARP_STEP_M, SIGMA_M, SIGMA_MAJOR_M, T_MAX,
    VERTEX_STEP
)  # noqa: E402
from .banks import _bank_lidar, _lidar_banks, bank  # noqa: E402
from .snap import shoulder  # noqa: E402
from .bridges import fill_abutment  # noqa: E402
