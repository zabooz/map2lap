"""Mapped carriageways and short counterturns at the mouth of a junction."""
import math
import sys
from types import SimpleNamespace

import numpy as np

from app import paths as app_paths
from track import obj_to_kn5


def lane_roads(paths, log):
    """Read carriageways and the mapped or geometrically identified circulating roads from KN5 tile facts."""
    if not paths:
        return [], []
    if app_paths.ENGINE not in sys.path:
        sys.path.insert(0, app_paths.ENGINE)
    import islands
    from roads import RING_JUNCTIONS

    mapped, tagged, graph = [], set(), {}
    for geometry, width, feature in obj_to_kn5.mapped_road_features(paths, log):
        mapped.append((geometry, width))
        spec = feature["spec"]
        if spec.get("kind") not in ("paved", "cobble", "gravel", None):
            continue
        # Tile facts repeat whole features at borders. Retain distinct parts of multipart roads.
        key = (str(feature.get("id", "")), geometry.tobytes())
        if key in graph:
            continue
        tags = feature.get("tags") or {}
        if tags.get("junction") in RING_JUNCTIONS:
            tagged.add(key)
        direction = SimpleNamespace(oneway=spec.get("oneway", False), dir=spec.get("dir", 0))
        graph[key] = key, direction, geometry, width
    rings = tagged.union(islands.ring_fids(graph.values())) if graph else tagged
    return mapped, [(graph[key][2], graph[key][3]) for key in rings]


def ring_vertices(path, rings):
    """Route vertices inside a circulating carriageway, including its entry and exit nodes. Pure."""
    protected = np.zeros(len(path), bool)
    for line, width in rings:
        half = width / 2
        nearby = np.flatnonzero(((path >= line.min(axis=0) - half) & (path <= line.max(axis=0) + half)).all(axis=1))
        for a, b in zip(line, line[1:]):
            delta = b - a
            if delta @ delta > 0:
                offset = path[nearby] - a
                fraction = np.clip((offset @ delta) / (delta @ delta), 0, 1)
                protected[nearby] |= np.linalg.norm(offset - fraction[:, None] * delta, axis=1) <= half
    return protected


def groups(metres, angles, half, protected):
    """Isolated clusters of short edges with one dominant turn and a shallow return. Pure."""
    length = np.diff(metres)
    # An offset junction can extend across two carriageway widths. Beyond that, treat the link
    # as a street in its own right. This deliberately misses longer, skewed junctions.
    reach = 4 * np.maximum.reduce([half[:-2], half[1:-1], half[2:]])
    links = np.flatnonzero((length[1:-1] <= reach) & np.isfinite(reach)) + 1
    for run in np.split(links, np.flatnonzero(np.diff(links) != 1) + 1):
        if not len(run):
            continue
        i, j = run[0], run[-1] + 1
        widths = half[i-1:j+1]
        if not np.isfinite(widths).all() or protected[i:j+1].any() or metres[j] - metres[i] > 4 * max(widths):
            continue
        turns = angles[i-1:j]
        peak = np.argmax(abs(turns))
        main = turns[peak]
        others = np.delete(turns, peak)
        # The approaches should be transverse, with at least twice as much net steering as
        # unwinding. A balanced slalom or a near-parallel switchback needs its separate turns.
        angle = turns.sum()
        if (not np.any(others * main < 0) or np.any(others * main > 0)
                or abs(main) < 3 * np.abs(others).sum() or not math.pi / 4 <= abs(angle) <= 3 * math.pi / 4):
            continue
        yield i, j, i + peak, angle, max(widths)
