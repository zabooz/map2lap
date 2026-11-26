"""Assetto Corsa's metre offsets for side-by-side racing on a finished AI spline."""
import os
from pathlib import Path
import tempfile
from typing import NamedTuple

import numpy as np

from track import aicorrections, aimargins
from track.aimargins import Span

FILE = Path("data/ai_hints.ini")


def _stations(points, circuit):
    """Cumulative 3D lane metres, including the circuit's closing chord. Pure."""
    xyz = points["pos"].astype(float)
    if circuit:
        xyz = np.vstack((xyz, xyz[0]))
    return np.r_[0., np.cumsum(np.linalg.norm(np.diff(xyz, axis=0), axis=1))]


def merge(spans: list[Span]) -> list[tuple[float, float, float, float]]:
    """Merge placed danger zones, with the last explicit value winning on each side. Pure."""
    cuts = sorted({0., 1., *(s.start for s in spans), *(s.end for s in spans)})
    indices = {cut: i for i, cut in enumerate(cuts)}
    widths = np.zeros((len(cuts)-1, 2))
    for span in spans:
        for a, b in aimargins.intervals(span.start, span.end, 1.):
            stretch = widths[indices[a]:indices[b]]
            if span.left is not None:
                stretch[:, 0] = span.left
            if span.right is not None:
                stretch[:, 1] = span.right

    result = []
    for a, b, values in zip(cuts, cuts[1:], widths):
        pair = tuple(values)
        if pair == (0., 0.):
            continue
        if result and result[-1][1] == a and result[-1][2:] == pair:
            result[-1] = (result[-1][0], b, *pair)
        else:
            result.append((a, b, *pair))
    return result


class Profile(NamedTuple):
    sections: list[tuple[float, float, float, float]]
    locations: dict[str, dict[str, float]]


class Hints(NamedTuple):
    data: bytes
    rejected: dict[str, str]
    unplaced: str | None
    spans: list[Span]


def render(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
           unplaced: str | None) -> Hints:
    """Render the installed lane with the recipe's placeable danger zones and report rejected anchors."""
    hints, _ = render_profile(lane, circuit, margins, placement, unplaced)
    return hints


def render_profile(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
                   unplaced: str | None) -> tuple[Hints, Profile]:
    """Calculate the INI and its Editor preview from a single placement and merge."""
    from track import fastlane, obj_to_kn5
    points, _, _ = fastlane.read_lane(lane)
    spans, rejected, locations = [], {}, {}
    if margins and placement is not None:
        route, metres = placement
        spans, rejected, locations = aimargins.placements(margins, route, metres, _stations(points, circuit),
                                                         points["pos"][:, 1], circuit, obj_to_kn5.LEVEL_GAP_M)
    profile = Profile(merge(spans), locations)
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
