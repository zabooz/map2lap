"""Assetto Corsa's metre offsets for side-by-side racing on a finished AI spline."""
import os
from pathlib import Path
import tempfile
from typing import NamedTuple

import numpy as np

from track import aicorrections, aimargins
from track.aimargins import Span

FILE = Path("data/ai_hints.ini")
KEEP_M = 5.5  # Two 2 m cars, the E30s' ~1.3 m native body gap and ~0.2 m spare. Wider cars need more.
MAX_M = 1.0  # AC also scales corner push by 1 - 0.2 * the larger hint. Keep that factor at least 0.8.
STEP_M = .25  # A quarter metre at either side changes the pair's available space by half a metre.
MIN_RUN_M = 50.  # About two seconds at 90 km/h for an overtaking car to settle between changes.


def _runs(ends, levels):
    """Group width steps along an unwrapped spline, protecting narrow spots when sharing short runs. Pure."""
    length = ends[-1]
    start = 0.
    result = []
    while start < length:
        first = np.searchsorted(ends, start, side="right")
        end = min(length, max(ends[first], start + MIN_RUN_M))
        if 0 < length - end < MIN_RUN_M:
            # Give the last pinch its own car manoeuvre length without reducing an entire long straight.
            end = length - MIN_RUN_M if length - start >= 2*MIN_RUN_M else length
        last = np.searchsorted(ends, end)
        level = int(min(levels[first:last+1]))
        if not result or result[-1][1] != level:
            result.append((start, level))
        start = end
    return result


def _stations(points, circuit):
    """Cumulative 3D lane metres, including the circuit's closing chord. Pure."""
    xyz = points["pos"].astype(float)
    if circuit:
        xyz = np.vstack((xyz, xyz[0]))
    return np.r_[0., np.cumsum(np.linalg.norm(np.diff(xyz, axis=0), axis=1))]


def sections(points, detail, circuit):
    """Normalized START/END and symmetric metre hints from the serialized XYZ and side widths. Pure."""
    stations = _stations(points, circuit)
    widths = detail["left"].astype(float) + detail["right"]
    if circuit:
        widths = np.r_[widths, widths[0]]
    length = stations[-1]
    if not np.isfinite(length) or length <= 0 or not np.isfinite(widths).all():
        return []
    steps = np.floor(np.clip((widths - KEEP_M) / 2, 0., MAX_M) / STEP_M + .5).astype(int)
    changed = np.flatnonzero(np.diff(steps))
    cuts = (stations[changed] + stations[changed+1]) / 2
    origin = 0.
    if circuit and len(cuts):
        # Unwrap at a width change so the two halves of one run at start/finish count together.
        origin = cuts[0]
        ends = np.r_[cuts[1:] - origin, length]
        levels = steps[changed+1]
    else:
        ends = np.r_[cuts, length]
        levels = np.r_[steps[0], steps[changed+1]]
    changes = _runs(ends, levels)
    if origin:
        changes = sorted(((start + origin) % length, level) for start, level in changes)
        if changes[0][0] > 0:
            changes.insert(0, (0., changes[-1][1]))
        changes = [item for i, item in enumerate(changes) if i == 0 or item[1] != changes[i-1][1]]
    return [(start/length, end/length, level*STEP_M)
            for (start, level), (end, _) in zip(changes, changes[1:] + [(length, 0)]) if level]


def merge(auto: list[tuple[float, float, float]], spans: list[Span]) -> list[tuple[float, float, float, float]]:
    """Cut the automatic profile where either manual side starts or ends. Pure."""
    automatic, left, right = {}, {}, {}
    for a, b, hint in auto:
        automatic[a] = hint
        automatic.setdefault(b, 0.)
    for span in spans:
        for a, b in aimargins.intervals(span.start, span.end, 1.):
            if a == b:
                continue
            for profile, value in ((left, span.left), (right, span.right)):
                if value is not None:
                    profile[a] = value
                    profile.setdefault(b, None)

    cuts = sorted({0., 1.} | automatic.keys() | left.keys() | right.keys())
    default, left_value, right_value = 0., None, None
    result = []
    for a, b in zip(cuts, cuts[1:]):
        default = automatic.get(a, default)
        left_value = left.get(a, left_value)
        right_value = right.get(a, right_value)
        pair = (default if left_value is None else left_value, default if right_value is None else right_value)
        if pair == (0., 0.):
            continue
        if result and result[-1][1] == a and result[-1][2:] == pair:
            result[-1] = (result[-1][0], b, *pair)
        else:
            result.append((a, b, *pair))
    return result


class Profile(NamedTuple):
    auto: list[tuple[float, float, float]]
    sections: list[tuple[float, float, float, float]]
    locations: dict[str, dict[str, float]]


class Hints(NamedTuple):
    data: bytes
    rejected: dict[str, str]
    unplaced: str | None
    spans: list[Span]


def render(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
           unplaced: str | None) -> Hints:
    """Render the installed lane with the recipe's placeable side margins and report rejected anchors."""
    hints, _ = render_profile(lane, circuit, margins, placement, unplaced)
    return hints


def render_profile(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
                   unplaced: str | None) -> tuple[Hints, Profile]:
    """Calculate the INI and its Editor preview from a single placement and merge."""
    from track import fastlane, obj_to_kn5
    points, detail, _ = fastlane.read_lane(lane)
    auto = sections(points, detail, circuit)
    spans, rejected, locations = [], {}, {}
    if margins and placement is not None:
        route, metres = placement
        spans, rejected, locations = aimargins.placements(margins, route, metres, _stations(points, circuit),
                                                         points["pos"][:, 1], circuit, obj_to_kn5.LEVEL_GAP_M)
    profile = Profile(auto, merge(auto, spans), locations)
    data = "".join(f"[DANGER_{i}]\nSTART={a:.9f}\nEND={b:.9f}\nLEFT={left:.2f}\nRIGHT={right:.2f}\n\n"
                   for i, (a, b, left, right) in enumerate(profile.sections)).encode("ascii")
    return Hints(data, rejected, unplaced if margins and placement is None else None, spans), profile


def install(folder, data):
    """Atomically replace the owned INI, or remove it when the folder has no readable lane."""
    path = folder / FILE
    if data is None:
        path.unlink(missing_ok=True)
        return
    if path.is_file() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
        try:
            stream.write(data)
            stream.close()
            os.replace(tmp, path)
        finally:
            tmp.unlink(missing_ok=True)
