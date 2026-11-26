"""AI hint zones stored as directed route anchors and placed on the installed AI line."""
import json
import math
from pathlib import Path
from typing import NamedTuple

import numpy as np

from track import aicorrections

SCALAR_SECTIONS = {"corner": "HINT", "braking": "BRAKEHINT", "speedLimit": "MAXSPEED"}


class Span(NamedTuple):
    id: str
    start: float
    end: float
    left: float | None
    right: float | None
    kind = "danger"


class ScalarSpan(NamedTuple):
    id: str
    start: float
    end: float
    kind: str
    value: float


def recipe(folder: Path) -> list[dict]:
    """Read the ordered hint zones saved in the track folder's Editor recipe."""
    try:
        data = json.loads((folder / "data/map2lap.json").read_text(encoding="utf-8"))
    except FileNotFoundError:
        return []
    return (data.get("edits") or {}).get("aiMargins", [])


def _setting(value):
    """Return the five-centimetre setting accepted within the schema tolerance. Pure."""
    return None if value is None else round(value * 20) / 20


def _value(value):
    """Check the Editor's five-centimetre settings from zero to one metre. Pure."""
    return (value is None or type(value) in (int, float) and 0 <= value <= 1
            and abs(value - _setting(value)) <= 1e-6)


def problem(items) -> str | None:
    """Return the schema error for a draft margin list. Pure."""
    if not isinstance(items, list):
        return "Invalid danger zone"
    ids = set()
    for item in items:
        if (not isinstance(item, dict) or not isinstance(item.get("id"), str)
                or not item["id"] or item["id"] in ids
                or aicorrections.anchor_problem(item.get("start"))
                or aicorrections.anchor_problem(item.get("end"))):
            return "Invalid danger zone"
        if "kind" in item:
            value = item.get("value")
            if (not isinstance(item["kind"], str) or item["kind"] not in SCALAR_SECTIONS
                    or type(value) not in (float, int) or not -math.inf < value < math.inf
                    or item["kind"] == "speedLimit" and value <= 0):
                return "Invalid AI hint value"
        elif (not all(k in item and _value(item[k]) for k in ("left", "right"))
              or item["left"] is None and item["right"] is None):
            return "Invalid danger zone value"
        ids.add(item["id"])
    return None


def intervals(start, end, length):
    """Split a directed interval at its seam for overlap checks and INI export. Pure."""
    if start <= end:
        return [(start, end)]
    return [(start, length), (0., end)]


def _endpoint(anchor, route, metres, heights, circuit, level_gap):
    """Resolve the anchor and check the driving level of the nearest lane sample. Pure."""
    metre, level = route.resolve(anchor)
    delta = abs(metres - metre)
    if circuit:
        delta = delta % route.length
        delta = np.minimum(delta, route.length - delta)
    if abs(heights[delta.argmin()] - level) >= level_gap:
        raise ValueError(f"Unresolved driving level at route metre {metre:.1f}")
    return metre


def _extent(start, end, samples, circuit, length, kind):
    """Clip a route stretch to its lane coverage, or normalize the two marks on a circuit. Pure."""
    if start == end or circuit and (end - start) % length == 0:
        label = "danger zone" if kind == "danger" else "AI hint"
        raise ValueError(f"Empty {label} at route metre {start:.1f}")
    if circuit:
        return start % length, end % length
    start, end = sorted((start, end))
    if end <= samples[0] or start >= samples[-1]:
        raise ValueError(f"Outside the AI line at route metre {start:.1f}")
    return max(start, samples[0]), min(end, samples[-1])


def placements(items, route: aicorrections.Route, metres: np.ndarray, stations: np.ndarray,
               heights: np.ndarray, circuit: bool, level_gap: float):
    """Place the recipe's directed route stretches on the installed lane's 3D stations. Pure."""
    samples = metres
    if circuit:
        # The timing line may be anywhere on the saved route. Append its next passage
        # so anchors on the closing chord interpolate like those between other samples.
        wrapped = metres % route.length
        turns = np.r_[0, np.cumsum(np.diff(wrapped) < 0)]
        samples = np.r_[wrapped + turns * route.length, wrapped[0] + route.length]

    def fraction(metre):
        if circuit:
            metre = samples[0] + (metre - samples[0]) % route.length
        return float(np.interp(metre, samples, stations) / stations[-1])

    spans, rejected, locations = [], {}, {}
    for item in items:
        key = item["id"]
        marks = {}
        for endpoint in ("start", "end"):
            try:
                marks[endpoint] = _endpoint(item[endpoint], route, metres, heights, circuit, level_gap)
            except ValueError as exc:
                rejected.setdefault(key, str(exc))
        # A surviving anchor can still be highlighted if its partner no longer resolves.
        locations[key] = {endpoint: fraction(metre) for endpoint, metre in marks.items()}
        if key in rejected:
            continue
        try:
            kind = item.get("kind", "danger")
            start, end = _extent(marks["start"], marks["end"], samples, circuit, route.length, kind)
            a, b = fraction(start), fraction(end)
            if kind == "danger":
                spans.append(Span(key, a, b, _setting(item["left"]), _setting(item["right"])))
            else:
                spans.append(ScalarSpan(key, a, b, kind, item["value"]))
        except ValueError as exc:
            rejected[key] = str(exc)
    return spans, rejected, locations


def place(items, route: aicorrections.Route, metres: np.ndarray, stations: np.ndarray,
          heights: np.ndarray, circuit: bool, level_gap: float) -> tuple[list[Span | ScalarSpan], dict[str, str]]:
    """Return placed spans and reasons for rejected items on the installed lane. Pure."""
    spans, rejected, _ = placements(items, route, metres, stations, heights, circuit, level_gap)
    return spans, rejected
