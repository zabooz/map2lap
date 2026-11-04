"""Plan and one road's profile: smoothing, cuts, banked curves (a road's cross slope), the ground under a bridge's
end."""
import math
import os

import numpy as np

import roads as roadsmod

from .settings import (
    ABUT_FAR_M, ABUT_FILL_ON, ABUT_MAX_M, BESIDE_LEVEL_FROM_M, BETWEEN_MIN_M, BETWEEN_ON, BETWEEN_STEP_M, ABUT_MIN_FINE_M, ABUT_MIN_M, ABUT_NEAR_M, ABUT_SHORT_SAMPLES, ABUT_STEEP,
    ABUT_STEEP_FINE, CLASS_SIGMA_M, COARSE_SIDE_M, DIRT_MEDIAN_M, DIRT_SIGMA_M, MAJOR_CLASSES, MEDIAN_M, PROFILE_STEP,
    SHARP_GRADE, SHARP_LONE_MIN_M, SHARP_MIN_M, SHARP_ON, SHARP_REACH_M, SHARP_RUN_N, SHARP_STEP_M, SIGMA_M,
    SIGMA_MAJOR_M, T_MAX, T_MIN, VERTEX_STEP
)
from .snap import shoulder


# Banked curves ("improve how roads generate"; BeamNG's Hero Road editor banks its curves, our
# carriageways were graded level across): a motorway's or trunk's curve leans into its turn, the cross slope by the
# design-speed rule e = BANK_E_MAX x min(1, r_min / R), r_min = v² / (127 (e_max + f)) of the class's design speed v
# (km/h) and side friction f; a gentle bend (under 1 %) keeps level. It comes in over BANK_RUNOFF_M and fades out over
# BANK_FADE_M where the road meets a bridge (a deck is level across) or ends without a road going on (a tunnel's
# floor, a junction). The grading pass (grade_points) tilts the core across the carriageway by it.
BANK_ON = os.environ.get("BNE_BANK", "on") != "off"
BANK_E_MAX = 0.08
BANK_DESIGN = {"motorway": (110.0, 0.10), "trunk": (90.0, 0.12)}     # km/h, side friction
BANK_LINK = (60.0, 0.16)                                              # their slip roads

# Sparse motorway map lines are straight chords, often ~100 m between vertices: a 12 m stencil saw each chord as level
# and each corner as a tight bend, 8 % bank pulses (I-80, 41.41135, -105.83960; Discord 2026-10-28 and PR #410). The
# curvature is the road's mean turning over this far either side (earthfast.bank_profile), its context the joined
# roads' too (plan_roads bank_xy), then smoothed.
BANK_STENCIL_M = 100.0      # 200 m baseline
BANK_RUNOFF_M = 100.0       # full 8 % transition at <= 0.08 / 100 m away from ends
BANK_FADE_M = 100.0         # smoothstep to level at a bridge / loose end; no deck-height changes
BANK_SIGMA_M = 12.0         # remove discrete box-window steps in cross slope, not road elevation

# Where the elevation is lidar (plan_roads fine: not dem.coarse_at) a motorway's or trunk's cross slope is the
# elevation's own, read across its carriageway (BANK_LIDAR_SIDE of its half width either side of the centre line),
# smoothed along it and held to BANK_E_MAX, instead of the design-speed rule; and it is not faded out where the road
# meets a bridge (roads.BridgeProfiles.deck_bank tilts the deck the same way). A divided road in a curve keeps one
# surface across both carriageways; graded level each about its own centre line, they lie apart over the median and
# their decks overlap there as a step in the fast lane.
BANK_LIDAR_SIDE = 0.6
BANK_LIDAR_SIGMA_M = 10.0

# ... read at five points across; a reading whose points do not lie on a line within BANK_LIDAR_RMS_M, or steeper than
# BANK_E_MAX, is not the road's surface (an embankment's side, a bridge's abutment slope skewed under it, which would
# tilt the road under the other carriageway's deck beside it): it takes its valid neighbours'; and the last ABUT_NEAR_M
# before a bridge keep the slope from there
BANK_LIDAR_RMS_M = 0.03


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
               obs=None, walls=None, onto=None):
    """plan_road for many (lonlat, spec) parts with one elev call (its cost is per call); abut: per part (start, end)
    flags, the ends leading onto a bridge (fill_abutment); ext: per part (before, after), the lines (k, 2) in the frame
    from its start / end outward along the part the road goes on in (Grader._extensions), or None: their ground is in
    the part's profile smoothing; pins: per part (start, end) heights its ends are held at, or None (Grader._pins: a
    road ending on a more smoothed one meets it at its height); fine: the elevation is lidar
    (ABUT_*_FINE); obs(xy (m, 2), spec) -> measured heights (m,) of a
    part's samples (NaN where none) or None: they stand in for the DEM's (roadz.py, on coarse elevation: Grader._obs);
    walls: the mapped walls' lines (k, 2) in the frame near the parts (or a function giving them), for the walls
    between two roads at two levels (_between_cuts), or None: none of those; onto: per part (before, after), does that
    extension end on a bridge's end (Grader._onto_bridge), or None: none does. Pure given elev and obs."""
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
        side, bank_side, whole = [], [], []
        for out in (ext[j] if ext is not None else (None, None)):
            if out is None or len(out) < 2:
                side.append(np.zeros((0, 2)))
                bank_side.append(np.zeros((0, 2)))
                whole.append(False)
            else:                       # (from the node outward; the node is the part's own end sample)
                bank_side.append(resample(np.asarray(out, np.float64), step)[0][1:])
                # Extra bank geometry must not change longitudinal DEM sampling
                # or the bridge solver's established approach/underpass profiles.
                reach = 3.0 * profile_sigma(spec) + PROFILE_STEP
                arc = np.r_[0., np.cumsum(np.linalg.norm(np.diff(out, axis=0), axis=1))]
                whole.append(bool(arc[-1] <= reach + 1e-8))
                if arc[-1] > reach + 1e-8:
                    out = np.vstack([np.asarray(out)[arc < reach], _point_along(out, reach)])
                side.append(resample(np.asarray(out, np.float64), step)[0][1:])
        prof.append((xy, side[0][::-1], side[1], step, bank_side[0][::-1], bank_side[1], whole))
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
        xy, before, after, step, bank_before, bank_after, whole = pr
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
        if onto is not None and ABUT_FILL_ON:
            # An extension that runs on to a bridge's end has that bank in its last samples, as an own end has: filled the
            # same, they stay in the smoothing so the parts still meet. Left in, a road split at a junction 18 m short of its
            # bridge ended 3.3 m under the junction, a 2 m hollow over 30 m (a stream 8 m down, Cap Corse). Not when the
            # extension is cut short of the bridge (whole): fill_abutment takes its last sample for the bridge's end; part of
            # the bank can stay in the samples of one that ends just past its reach.
            for at_end, n in ((False, nb), (True, na)):
                if n and whole[int(at_end)] and onto[j][int(at_end)]:
                    zx = fill_abutment(zx, at_end, fine=fine)
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
        built = [p if p is not None and sp.kind in roadsmod.BUILT else None for p, (_ll, sp) in zip(out, parts)]
        _add_cuts(frame, built, elev)
        if BETWEEN_ON and walls is not None:
            _between_cuts(frame, built, elev, walls)
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


def _foot(mid, xy):
    """Per point mid (k, 2) the nearest point on polyline xy (n, 2) (k, 2), whether it lies inside the line (not past an
    end), and the line's unit direction there (k, 2); with the segment index and its parameter. Pure."""
    a, ab = xy[:-1], np.diff(xy, axis=0)
    l2 = np.maximum((ab * ab).sum(1), 1e-12)
    t = ((mid[:, None, :] - a[None]) * ab[None]).sum(2) / l2[None]
    tc = np.clip(t, 0.0, 1.0)
    f = a[None] + tc[..., None] * ab[None]
    k = np.arange(len(mid))
    j = np.hypot(*(f - mid[:, None, :]).transpose(2, 0, 1)).argmin(1)
    inside = ~(((j == 0) & (t[k, j] < 0.0)) | ((j == len(ab) - 1) & (t[k, j] > 1.0)))
    return f[k, j], inside, ab[j] / np.sqrt(l2[j])[:, None], j, tc[k, j]


def _runs(ok, n):
    """ok (m,) with the runs of fewer than n consecutive True set False. Pure."""
    out = np.zeros(len(ok), bool)
    i = 0
    while i < len(ok):
        if not ok[i]:
            i += 1
            continue
        e = i
        while e + 1 < len(ok) and ok[e + 1]:
            e += 1
        if e + 1 - i >= n:
            out[i:e + 1] = True
        i = e + 1
    return out


def _on_to_bridge_ends(put, beside, abut):
    """Walls put (m,) per segment (NaN none), the nearest one carried over the segments between it and a plan's end onto
    a bridge (abut (start, end)), where the other road still lies beside it (beside (m,)). The ground under a bridge's
    end shows no step, so the wall stopped a segment short and that segment's grading ran over the other carriageway:
    a 0.8 m dip 4 m long in its lanes (Waterview, Auckland). Fewer than SHARP_RUN_N segments only: that few could never
    show a wall of their own. No wall before them, or the roads no longer side by side: nothing to carry on. Pure."""
    out = np.array(put, np.float64, copy=True)
    for at, step in ((0, 1), (len(out) - 1, -1)):
        if not abut[0 if step > 0 else 1]:
            continue
        run = [at + step * i for i in range(min(SHARP_RUN_N, len(out)))]
        near = next((i for i, s in enumerate(run) if np.isfinite(out[s])), None)
        if near is not None and beside[run[:near]].all():
            out[run[:near]] = out[run[near]]
    return out


def _between_cuts(frame, plans, elev, walls):
    """Sets Plan.cut's drops where a road has another road beside it (near enough for their gradings to meet) and a
    wall between them: walls' (lines (k, 2) in the frame, BETWEEN_WALL_CLASSES) first, else the raw ground elev(lat,
    lon) between them stepping by BESIDE_LEVEL_FROM_M within T_MIN, faded in from half that (BETWEEN_*). The ground
    decides, not the plans' heights at their lines: their cross slopes toward a wall hid a third of its 0.73 m. Each side of each
    plan: the nearest such road. walls may be a function giving them: called only when such a pair is found (most map
    cells have none: a cell's walls are another map layer to read). None entries skipped; nothing without the module's
    wall ends (AC_EXPORT_WALL_ENDS)."""
    import fast
    if getattr(fast._ef, "AC_EXPORT_WALL_ENDS", 0) < 1:
        return
    f64 = np.float64
    keep = [p for p in plans if p is not None and len(p.xy) >= 2]
    if len(keep) < 2:
        return
    got = []

    def wall_lines():               # (read once, when first needed)
        if not got:
            ws = walls() if callable(walls) else walls
            got.append([np.asarray(w, f64)[:, :2] for w in (ws or ()) if len(w) >= 2])
        return got[0]
    cos_par = math.cos(math.radians(25.0))      # (parallel within: roads' DUAL_ANGLE_DEG)
    jobs = []                                   # (plan, side column, segments, offsets of their other road, probes)
    for p in keep:
        xy, z = np.asarray(p.xy, f64)[:, :2], np.asarray(p.z, f64)
        mid, zm = (xy[:-1] + xy[1:]) / 2, (z[:-1] + z[1:]) / 2
        dirs = np.diff(xy, axis=0)
        dirs = dirs / np.maximum(np.hypot(*dirs.T), 1e-12)[:, None]
        nl = np.c_[-dirs[:, 1], dirs[:, 0]]
        for side, c0 in ((1.0, 0), (-1.0, 3)):
            nrm = nl * side
            off = np.full(len(mid), np.inf)
            zq = np.full(len(mid), np.nan)
            for q in keep:
                if q is p:
                    continue
                reach = p.half + q.half + T_MIN
                b0, b1 = np.asarray(p.bbox, f64), np.asarray(q.bbox, f64)
                if b1[0] > b0[2] + reach or b1[2] < b0[0] - reach or b1[1] > b0[3] + reach or b1[3] < b0[1] - reach:
                    continue
                qxy, qz = np.asarray(q.xy, f64)[:, :2], np.asarray(q.z, f64)
                foot, inside, u, j, t = _foot(mid, qxy)
                v = foot - mid
                o = (v * nrm).sum(1)
                along = np.abs((v * dirs).sum(1))
                h = qz[j] + t * (qz[j + 1] - qz[j])
                ok = (inside & (np.abs((u * dirs).sum(1)) >= cos_par) & (o > 2 * BETWEEN_MIN_M) & (along < VERTEX_STEP)
                      & (o < reach) & (o < off))
                off[ok], zq[ok] = o[ok], h[ok]
            has = np.isfinite(off)
            if not has.any():
                continue
            wall = np.full(len(mid), np.nan)
            for w in wall_lines():      # (a mapped wall between them: the nearest)
                foot, inside, u, _j, _t = _foot(mid, w)
                v = foot - mid
                o = (v * nrm).sum(1)
                ok = (has & inside & (np.abs((u * dirs).sum(1)) >= cos_par) & (np.abs((v * dirs).sum(1)) < VERTEX_STEP)
                      & (o > 0) & (o < off) & ~(o >= wall))
                wall[ok] = o[ok]
            seg = np.flatnonzero(has)
            probes = [np.arange(BETWEEN_MIN_M, max(off[s] - BETWEEN_MIN_M, BETWEEN_MIN_M) + 1e-9, BETWEEN_STEP_M)
                      for s in seg]
            pts = [mid[s] + nrm[s] * o[:, None] for s, o in zip(seg, probes)]
            jobs.append((p, c0, seg, off, zm, zq, wall, probes, pts))
    if not jobs:
        return
    allp = np.concatenate([q for job in jobs for q in job[8]])
    la, lo, _ = frame.enu_to_geodetic(allp[:, 0], allp[:, 1], 0.0)
    g = np.asarray(elev(np.asarray(la), np.asarray(lo)), f64)
    k = 0
    for p, c0, seg, off, zm, zq, wall, probes, pts in jobs:
        step = np.zeros(len(off), bool)
        at = np.full(len(off), np.nan)
        rise = np.zeros(len(off))
        for s, o in zip(seg, probes):          # (the raw ground's own step between the two roads)
            gg = g[k:k + len(o)]
            k += len(o)
            dg = gg[-1] - gg[0]
            if len(o) < 2 or abs(dg) < BESIDE_LEVEL_FROM_M / 2:
                continue
            frac = (gg - gg[0]) / dg
            past = [np.flatnonzero(frac >= f) for f in (0.25, 0.5, 0.9)]
            if any(len(x) == 0 for x in past):
                continue
            o25, o50, o90 = (o[x[0]] for x in past)
            if (o90 - o25) / 0.65 < T_MIN:     # (sharper than the grading's narrowest transition: it would smear it)
                step[s], at[s], rise[s] = True, o50, abs(dg)
        step = _runs(step, SHARP_RUN_N)
        # (a step under BESIDE_LEVEL_FROM_M faded in: its wall moved out toward the other road, back to the blend as
        # before at half that: no jump along the road where a wall begins or the step grows)
        v = np.clip((rise - BESIDE_LEVEL_FROM_M / 2) / (BESIDE_LEVEL_FROM_M / 2), 0.0, 1.0)
        at = at + (1.0 - v * v * (3.0 - 2.0 * v)) * (off - BETWEEN_MIN_M - at)
        put = _on_to_bridge_ends(np.where(np.isfinite(wall), wall, np.where(step, at, np.nan)), np.isfinite(off), p.abut)
        put = np.where(np.isfinite(put), np.clip(put, BETWEEN_MIN_M, off - BETWEEN_MIN_M), np.nan)
        if not np.isfinite(put).any():
            continue
        cut = np.full((len(off), 6), np.nan) if p.cut is None else np.array(p.cut, f64, copy=True)
        new = np.isfinite(put) & ~(cut[:, c0] <= put)       # (a nearer wall of its own stands)
        cut[new, c0], cut[new, c0 + 1], cut[new, c0 + 2] = put[new], np.nan, np.nan
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


def fill_abutment(z, at_end, step=PROFILE_STEP, fine=False):
    """The raw profile z (a sample every step m) of a road leading onto a bridge at its first (at_end False) or last
    sample, its last ABUT_NEAR_M filled up to the straight grade of the stretch from there to ABUT_FAR_M where they
    fall at least ABUT_STEEP more steeply than it toward the bridge (ABUT_FILL_ON). A profile too short for that (a part
    between a junction and a bridge, with no road going on straight past the junction) takes its half nearer the bridge
    against the other, at least ABUT_SHORT_SAMPLES of them: on a side road's last 10 m, 1.5 m down the bank and then
    level, the end stayed down the bank at 19 % and the deck with it.
    fine: lidar, ABUT_*_FINE. Returns z itself when nothing is filled. Pure."""
    min_m, steep = (ABUT_MIN_FINE_M, ABUT_STEEP_FINE) if fine else (ABUT_MIN_M, ABUT_STEEP)
    z = np.asarray(z, np.float64)
    p = z[::-1] if at_end else z
    d = np.arange(len(p)) * step
    near_m = ABUT_NEAR_M
    far = (d >= near_m) & (d <= ABUT_FAR_M)
    if far.sum() < 4:
        near_m = float(d[-1]) / 2 if len(d) else 0.0
        far = d >= near_m
        if far.sum() < ABUT_SHORT_SAMPLES:
            return z
    b, a = np.polyfit(d[far], p[far], 1)
    n = int((d < near_m).sum())
    e = a + b * d[:n]
    if e[0] - p[0] < min_m or (np.diff(p[:n + 1]) / step - b).max() < steep:
        return z
    q = p.copy()
    q[:n] = np.minimum(np.maximum(p[:n], e), p[:n] + ABUT_MAX_M)
    return q[::-1] if at_end else q


def mapped_plan(p, fn):
    """Plan p with its vertices through fn (xy (n, 2) -> (n, 2): geotiles.world_xy_map); heights, widths, cuttings and
    banking as they are (geodetic, or along / across the road)."""
    q = Plan(fn(p.xy), p.z, p.half, p.abut, p.cut, p.road_half)
    q.rid, q.max_wall, q.bank = p.rid, p.max_wall, getattr(p, "bank", None)
    q.tunnel = getattr(p, "tunnel", False)
    q.under = getattr(p, "under", (False, False))
    q.beyond = getattr(p, "beyond", (None, None))
    return q


def trim_plan(p, box):
    """The pieces of Plan p within box (x0, y0, x1, y1), or a convex polygon (k, 2): cut at its edges (earthfast.clip_segments), heights and
    cuttings with them; an end not at p's own end leads onto no bridge. [Plan]."""
    import fast
    xy = np.ascontiguousarray(np.asarray(p.xy, np.float64)[:, :2])
    if len(xy) < 2:
        return [p]
    if np.ndim(box) == 2:               # a convex polygon (a cell's quad: _Planner._clip_quad)
        fast.require(104, "clip_segments_convex")
        t = np.asarray(fast._ef.clip_segments_convex(xy, np.ascontiguousarray(box, np.float64)))
    else:
        fast.require(44, "clip_segments")
        t = np.asarray(fast._ef.clip_segments(xy, tuple(float(v) for v in box)))
    ok = np.isfinite(t[:, 0])
    if ok.all() and (t[:, 0] == 0.0).all() and (t[:, 1] == 1.0).all():
        return [p]
    out, i, n = [], 0, len(ok)
    while i < n:
        if not ok[i]:
            i += 1
            continue
        j = i
        while j + 1 < n and ok[j + 1] and t[j, 1] == 1.0 and t[j + 1, 0] == 0.0:
            j += 1
        t0, t1 = t[i, 0], t[j, 1]
        a = xy[i] + (xy[i + 1] - xy[i]) * t0
        b = xy[j] + (xy[j + 1] - xy[j]) * t1
        za = p.z[i] + (p.z[i + 1] - p.z[i]) * t0
        zb = p.z[j] + (p.z[j + 1] - p.z[j]) * t1
        pxy = np.vstack([a, xy[i + 1:j + 1], b])
        pz = np.r_[za, p.z[i + 1:j + 1], zb]
        pb = getattr(p, "bank", None)
        if pb is not None:
            pb = np.r_[pb[i] + (pb[i + 1] - pb[i]) * t0, pb[i + 1:j + 1], pb[j] + (pb[j + 1] - pb[j]) * t1]
        if np.hypot(*(pxy[-1] - pxy[0])) > 1e-6 or len(pxy) > 2:
            q = Plan(pxy, pz, p.half, (p.abut[0] and i == 0 and t0 == 0.0, p.abut[1] and j == n - 1 and t1 == 1.0),
                     None if p.cut is None else np.asarray(p.cut)[i:j + 1].copy(), p.road_half)
            q.rid = getattr(p, "rid", -1)
            q.max_wall = getattr(p, "max_wall", WALL_MAX_H_M)
            q.bank = pb
            q.tunnel = getattr(p, "tunnel", False)
            fr = getattr(p, "free", (False, False))     # (only the pieces with its own ends)
            q.free = (fr[0] and i == 0 and t0 == 0.0, fr[1] and j == n - 1 and t1 == 1.0)
            first, last = i == 0 and t0 == 0.0, j == n - 1 and t1 == 1.0
            un, by = getattr(p, "under", (False, False)), getattr(p, "beyond", (None, None))
            q.under = (un[0] and first, un[1] and last)
            q.beyond = (by[0] if first else None, by[1] if last else None)
            out.append(q)
        i = j + 1
    return out


def road_id(fid):
    """A stable integer id of a map feature (grade_points: a road never gives way to itself, though each map cell
    plans its own stretch of it: the Stelvio Pass's hairpins sank under their own other stretches)."""
    import zlib
    return zlib.crc32(str(fid).encode()) & 0x7FFFFFFF


def bank(xy, spec, abut=(False, False), ext=(0, 0)):
    """(n,) the cross slope of a road part's centreline xy (n, 2) (m per m toward its left), or None (not banked)."""
    if not BANK_ON or spec.kind not in roadsmod.BUILT or spec.cls not in BANK_DESIGN or len(xy) < 3:
        return None
    v, f = BANK_LINK if getattr(spec, "link", False) else BANK_DESIGN[spec.cls]
    r_min = v * v / (127.0 * (BANK_E_MAX + f))
    import fast
    fast.require(84, "bank_profile")
    fade = [BANK_FADE_M if (abut[k] or not ext[k]) else 0.0 for k in (0, 1)]
    b = np.asarray(fast._ef.bank_profile(np.ascontiguousarray(np.asarray(xy, np.float64)[:, :2]), float(BANK_E_MAX),
                                         float(r_min), float(BANK_STENCIL_M), float(BANK_RUNOFF_M),
                                         float(fade[0]), float(fade[1])), np.float64)
    step = float(np.median(np.linalg.norm(np.diff(np.asarray(xy)[:, :2], axis=0), axis=1)))
    if step > 0.0:
        b = smooth_profile(b, step, BANK_SIGMA_M)  # pinned ends keep bridge abutments level
    if fade[0]:
        b[0] = 0.0
    if fade[1]:
        b[-1] = 0.0
    return b if np.any(b != 0.0) else None


def _lidar_banks(frame, elev, items):
    """Per (centreline (n, 2), spec) the elevation's cross slope at each point (m per m toward its
    left, as bank; NaN where the reading is not the road's surface: BANK_LIDAR_RMS_M, BANK_E_MAX), or None for a road
    BANK_DESIGN does not bank. One elev call."""
    pts, out, idx = [], [None] * len(items), []
    f = np.array([-1.0, -0.5, 0.0, 0.5, 1.0])
    for j, (xy, spec) in enumerate(items):
        if spec.kind not in roadsmod.BUILT or spec.cls not in BANK_DESIGN or len(xy) < 3:
            continue
        xy = np.asarray(xy, np.float64)[:, :2]
        t = np.gradient(xy, axis=0)
        t /= np.maximum(np.hypot(t[:, 0], t[:, 1]), 1e-9)[:, None]
        o = BANK_LIDAR_SIDE * max(float(getattr(spec, "width", 0.0) or 0.0), 2.0) / 2
        left = np.c_[-t[:, 1], t[:, 0]] * o
        pts += [xy + left * a for a in f]
        idx.append((j, len(xy), o))
    if not idx:
        return out
    P = np.concatenate(pts)
    la, lo, _ = frame.enu_to_geodetic(P[:, 0], P[:, 1], 0.0)
    z = np.asarray(elev(la, lo), np.float64)
    k = 0
    for j, n, o in idx:
        Z = z[k:k + 5 * n].reshape(5, n)
        k += 5 * n
        w = f[:, None] * o
        slope = ((w * (Z - Z.mean(0))).sum(0)) / (w * w).sum(0)
        rms = np.sqrt(((Z - Z.mean(0) - slope * w) ** 2).mean(0))
        out[j] = np.where((rms <= BANK_LIDAR_RMS_M) & (np.abs(slope) <= BANK_E_MAX), slope, np.nan)
    return out


def _bank_lidar(raw, step, abut, ext, xy):
    """The measured cross slope raw (n,; NaN: no reading) filled from its valid neighbours,
    smoothed along the road (BANK_LIDAR_SIGMA_M), held from ABUT_NEAR_M before a bridge to it, and faded to level over
    BANK_FADE_M at an end with no road going on (not at a bridge: its deck takes it); None when level."""
    b = np.asarray(raw, np.float64)
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(np.asarray(xy, np.float64)[:, :2], axis=0).T))]
    ok = np.isfinite(b)
    if not ok.any():
        return None
    b = np.interp(s, s[ok], b[ok])
    if step > 0.0 and len(b) >= 3:
        b = smooth_profile(b, step, BANK_LIDAR_SIGMA_M)
    for e, d in ((0, s), (1, s[-1] - s)):
        if abut[e] and s[-1] > ABUT_NEAR_M:
            b = np.where(d < ABUT_NEAR_M, np.interp(ABUT_NEAR_M if e == 0 else s[-1] - ABUT_NEAR_M, s, b), b)
        elif not abut[e] and not ext[e]:
            w = np.clip(d / BANK_FADE_M, 0.0, 1.0)
            b = b * w * w * (3.0 - 2.0 * w)
    return b if np.any(np.abs(b) > 1e-4) else None
