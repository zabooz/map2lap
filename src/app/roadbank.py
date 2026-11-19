"""Editor Bank road: one signed cross slope between A and B on a built mapped road, tilted about its mapped centreline.

The target is absolute: the road's existing cross slope e0 (the builder banks motorway and trunk curves itself,
grading.profiles) is read along A-B, and the change at lateral distance d (left of A->B positive) and station s is
d * w(s) * (target - e0(s)). w rises from 0 at A to 1 and falls back to 0 at B, so the marked ends keep their surface
and the core gets the target everywhere, evening a varying e0. The centreline keeps its height.

Example: 8 m wide, level, target 8 %: the left edge rises 32 cm, the right one sinks 32 cm; each transition takes 96 m.
"""
import math

import numpy as np

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
