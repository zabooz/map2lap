"""Bounded lateral offsets for a minimum-curvature racing line."""
from typing import NamedTuple

import numpy as np

# Corrected BMW AI lines showed 0.6–1.5 m tracking error. Reserve the upper observation
# on either side of the car. Faster cars, traffic and an already narrow road can exceed it.
TRACKING_MARGIN = 1.5


class RouteRibbon(NamedTuple):
    """The original route leg, ownership limits and protected steering at each spline sample."""
    fixed: np.ndarray
    start: np.ndarray
    end: np.ndarray
    half_width: np.ndarray
    metres: np.ndarray
    groups: list


def _curvature(a, b, c):
    """Signed inverse circumradius at b for arrays of three consecutive X/Z samples. Pure."""
    u, v = b - a, c - b
    scale = np.linalg.norm(u, axis=1) * np.linalg.norm(v, axis=1) * np.linalg.norm(c - a, axis=1)
    return np.divide(2 * (u[:, 0]*v[:, 1] - u[:, 1]*v[:, 0]), scale,
                     out=np.zeros_like(scale), where=scale > 0)


def offsets(xz, normals, lower, upper, circuit):
    """Minimise integrated squared curvature within lateral bounds by successive linearisation. Pure."""
    # Only three offsets affect a sample's curvature. Apply the Jacobian and its transpose
    # as three diagonals, keeping memory linear even on long point-to-point routes.
    x = np.zeros(len(xz))
    for _ in range(4):
        points = xz + normals * x[:, None]
        a, c = np.roll(points, 1, axis=0), np.roll(points, -1, axis=0)
        weight = np.sqrt((np.linalg.norm(points-a, axis=1) + np.linalg.norm(c-points, axis=1)) / 2)
        if not circuit:
            weight[[0, -1]] = 0
        k = _curvature(a, points, c)
        # One millimetre is small relative to a spline chord and well above double precision.
        eps = .001
        delta = eps * normals
        left = (_curvature(a + np.roll(delta, 1, axis=0), points, c) - k) * weight / eps
        mid = (_curvature(a, points + delta, c) - k) * weight / eps
        right = (_curvature(a, points, c + np.roll(delta, -1, axis=0)) - k) * weight / eps
        diag = mid**2 + np.roll(left**2, -1) + np.roll(right**2, 1)
        near = mid*right + np.roll(left*mid, -1)
        far = np.roll(left*right, -1)
        # The maximum absolute row sum bounds the gradient's Lipschitz constant.
        bound = np.max(diag + abs(near) + np.roll(abs(near), 1) + abs(far) + np.roll(abs(far), 2))
        if bound == 0:
            break
        residual = weight*k - left*np.roll(x, 1) - mid*x - right*np.roll(x, -1)
        bias = (mid*residual + np.roll(left*residual, -1) + np.roll(right*residual, 1)) / bound
        diag, near, far = diag/bound, near/bound, far/bound
        # Accelerated projected gradient. Each iteration uses the same five diagonals.
        y = x
        for i in range(240):
            grad = (bias + diag*y + near*np.roll(y, -1) + np.roll(near*y, 1)
                    + far*np.roll(y, -2) + np.roll(far*y, 2))
            step = np.clip(y - grad, lower, upper)
            if np.max(abs(step - x)) < 1e-6:
                x = step
                break
            y = step + (i / (i + 3)) * (step - x)
            x = step
    return x


def route_bounds(xz, side, a, b, half, clearance):
    """Lateral offsets inside the finite capsule of each sample's selected route leg. Pure."""
    step = b - a
    length = np.linalg.norm(step, axis=1)
    axis = step / length[:, None]
    across = axis[:, ::-1] * [1, -1]
    radius = np.maximum(half - clearance, 0)
    # Intersect the offset ray with the segment's rectangle and both round ends.
    # Their union is convex. This also handles skewed approaches at junctions.
    lo, hi = np.full(len(xz), -np.inf), np.full(len(xz), np.inf)
    for direction, low, high in ((axis, 0, length), (across, -radius, radius)):
        origin = ((xz-a)*direction).sum(axis=1)
        speed = (side*direction).sum(axis=1)
        parallel = abs(speed) < 1e-12
        t0 = (low-origin) / np.where(parallel, 1, speed)
        t1 = (high-origin) / np.where(parallel, 1, speed)
        lo = np.maximum(lo, np.where(parallel, -np.inf, np.minimum(t0, t1)))
        hi = np.minimum(hi, np.where(parallel, np.inf, np.maximum(t0, t1)))
        hi[parallel & ((origin < low) | (origin > high))] = -np.inf
    valid = lo <= hi
    lo, hi = np.where(valid, lo, np.inf), np.where(valid, hi, -np.inf)
    for end in (a, b):
        relative = xz-end
        along = (relative*side).sum(axis=1)
        square = radius**2 - ((relative-along[:, None]*side)**2).sum(axis=1)
        reach = np.sqrt(np.maximum(square, 0))
        lo = np.minimum(lo, np.where(square >= 0, -along-reach, np.inf))
        hi = np.maximum(hi, np.where(square >= 0, -along+reach, -np.inf))
    return np.where(half >= clearance, lo, np.inf), np.where(half >= clearance, hi, -np.inf)


def joins_fit(xz, i, a, b, half, clearance):
    """Whether each displaced chord stays inside the union of its two owning route capsules. Pure."""
    start = xz[i-1]
    step = xz[i] - start
    length = np.linalg.norm(step, axis=1)
    axis = step / np.maximum(length, 1e-12)[:, None]
    first, last = route_bounds(start, axis, a[i-1], b[i-1], half[i-1], clearance)
    entry, exit = route_bounds(start, axis, a[i], b[i], half[i], clearance)
    tol = 1e-8  # Intersections at a shared endpoint can differ by floating-point roundoff.
    spans_first = (first <= tol) & (last >= length-tol)
    spans_second = (entry <= tol) & (exit >= length-tol)
    connected = (first <= tol) & (last >= entry-tol) & (exit >= length-tol)
    return spans_first | spans_second | connected


def folded(xz, reference, circuit):
    """Samples of collapsed or backwards chords relative to their original route progression. Pure."""
    chord = xz - np.roll(xz, 1, axis=0)
    forward = reference - np.roll(reference, 1, axis=0)
    invalid = (chord*forward).sum(axis=1) <= 0
    if not circuit:
        invalid[0] = False
    return invalid | np.roll(invalid, -1)


def bending_energy(xz, curvature):
    """Per-sample contribution to the integral of squared curvature over actual arclength. Pure."""
    edge = np.linalg.norm(xz - np.roll(xz, 1, axis=0), axis=1)
    return curvature**2 * (edge + np.roll(edge, -1)) / 2


def worse_runs(moved, difference, circuit):
    """Moves that increase true bending energy over a connected modified stretch. Pure."""
    affected = moved | np.roll(moved, 1) | np.roll(moved, -1)
    # Curvature at each end uses the adjoining point. Split only at unaffected
    # samples, where reverting the complete move preserves both joining chords.
    indices = np.flatnonzero(affected)
    runs = np.split(indices, np.flatnonzero(np.diff(indices) > 1) + 1)
    if circuit and len(runs) > 1 and affected[0] and affected[-1]:
        runs = [np.r_[runs[-1], runs[0]], *runs[1:-1]]
    rejected = np.zeros(len(moved), bool)
    for run in runs:
        if difference[run].sum() > 0:
            rejected[run] = moved[run]
    return rejected


def restore_scale(stations, failed, circuit, lap_length, transition):
    """Smoothly return to the reference at invalid samples and blend over adjacent metres. Pure."""
    bad = stations[failed]
    if circuit:
        bad = np.r_[bad[-1] - lap_length, bad, bad[0] + lap_length]
    idx = np.searchsorted(bad, stations)
    distance = np.minimum(abs(stations - bad[np.maximum(idx-1, 0)]),
                          abs(stations - bad[np.minimum(idx, len(bad)-1)]))
    fraction = np.clip(distance / transition, 0, 1)
    return fraction**2 * (3 - 2*fraction)
