"""Assetto Corsa's metre offsets for side-by-side racing on a finished AI spline."""
import os
from pathlib import Path
import tempfile

import numpy as np

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


def sections(points, detail, circuit):
    """Normalized START/END and symmetric metre hints from the serialized XYZ and side widths. Pure."""
    xyz = points["pos"].astype(float)
    widths = detail["left"].astype(float) + detail["right"]
    if circuit:
        xyz = np.vstack((xyz, xyz[0]))
        widths = np.r_[widths, widths[0]]
    stations = np.r_[0., np.cumsum(np.linalg.norm(np.diff(xyz, axis=0), axis=1))]
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


def contents(lane, circuit):
    """Read the final v7 line and render AC's consecutively numbered danger intervals."""
    from track import fastlane
    points, detail, _ = fastlane.read_lane(lane)
    return "".join(f"[DANGER_{i}]\nSTART={a:.9f}\nEND={b:.9f}\nLEFT={hint:.2f}\nRIGHT={hint:.2f}\n\n"
                   for i, (a, b, hint) in enumerate(sections(points, detail, circuit))).encode("ascii")


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


def sync(folder, circuit):
    """Reconcile a copied, manually replaced or legacy lane, including missing or unreadable previews."""
    from track import fastlane
    try:
        data = contents(folder / fastlane.FILE, circuit)
    except (FileNotFoundError, ValueError):
        data = None
    install(folder, data)
