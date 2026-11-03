"""A road's cross slope in curves."""
import os

import numpy as np

import roads as roadsmod

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


# (read inside functions only; here so that the parts can load each other)
from .settings import ABUT_NEAR_M  # noqa: E402
from .profiles import smooth_profile  # noqa: E402
