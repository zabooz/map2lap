"""A single object placed anew in the Editor (trackplace writes it into the kn5): what a placement is, what it does to points, where it
puts the object list's places. Pure.

A placement {"id", "x", "y", "z", "turn", "scale"} scales an object by scale and turns it by turn degrees around the upright through its
place (seen from above counter-clockwise, east to north), then moves it by x, y, z metres (AC: east, up, minus north). Its place: where
the build put it (track.objectlist's "at", the middle of its foot); a tree's or bush's the middle of its foot, by its corners. What
belongs to an object (a house's sign and door) goes with it, and can be placed by itself too: first its own placement, then its owner's.
Its height stays as placed: no rule puts it on the ground, a slope under a house moved there is Elevation's.
"""
import math

import numpy as np

MAX_ID = 64
MAX_MOVE_M = 1000.0         # how far from where it was built: it stays in its tile's mesh, which AC draws while that sphere, grown by the
# way, is in view; a few tiles' way is a correction, further it would be another track
MAX_RAISE_M = 100.0         # (trackheights.MAX_MM: no real correction needs more)
MIN_SCALE, MAX_SCALE = 0.1, 10.0    # a tenth: smaller, a house is a box at the kerb; ten times: a bench as big as a house
NOT_ALONE = {"power line"}  # (a span: it goes where its poles go)
FIELDS = ("x", "y", "z", "turn", "scale")


def problem(p):
    """What is wrong with a placement as the draft holds it, None if nothing."""
    if not (isinstance(p, dict) and isinstance(p.get("id"), str) and 0 < len(p["id"]) <= MAX_ID and "#" in p["id"]):
        return "no id"
    if not all(type(p.get(k)) in (int, float) and math.isfinite(p[k]) for k in FIELDS):
        return "no numbers"
    if math.hypot(p["x"], p["z"]) > MAX_MOVE_M or abs(p["y"]) > MAX_RAISE_M:
        return "too far"
    if abs(p["turn"]) > 360 or not MIN_SCALE <= p["scale"] <= MAX_SCALE:
        return "no turn or size"
    return None


def problems(placed):
    """What is wrong with a list of placements, each and together (each object once); None if nothing."""
    if not isinstance(placed, list):
        return "no list"
    wrong = next(filter(None, map(problem, placed)), None)
    if wrong:
        return wrong
    return "an object placed twice" if len({p["id"] for p in placed}) != len(placed) else None


def _turning(turn):
    """The matrix that turns by turn degrees around the upright, counter-clockwise from above (AC's z is minus north)."""
    c, s = math.cos(math.radians(turn)), math.sin(math.radians(turn))
    return np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]])


def chain(entry, tile, k, by_id):
    """The placements that move object k of a tile's list entry, its own first, then its owner's, ...: [(its place, the placement)].
    by_id: {id: placement}."""
    out = []
    while k >= 0:
        p = by_id.get(f"{tile}#{k}")
        if p:
            out.append((entry["at"][k], p))
        k = entry["parents"][k]
    return out


def through(pos, normal, tangent, placements):
    """Places and directions (each n by 3) as placements [(its place, the placement)] move them, in that order."""
    pos, normal, tangent = (np.asarray(a, np.float64) for a in (pos, normal, tangent))
    for pivot, p in placements:
        turning = _turning(p["turn"])
        pos = pivot + (pos - np.asarray(pivot, np.float64)) @ (p["scale"] * turning).T + [p["x"], p["y"], p["z"]]
        normal, tangent = normal @ turning.T, tangent @ turning.T
    return pos, normal, tangent


def tiles_of(by_id):
    """The tiles whose objects any of those placements name. A billboard's id names its mesh's base instead."""
    return {id_.rsplit("#", 1)[0] for id_ in by_id}


def list_placed(objects, placed):
    """The object list with its objects' places as the placements moved them."""
    if not placed:
        return objects
    by_id, out = {p["id"]: p for p in placed}, dict(objects)
    for tile in tiles_of(by_id) & objects.keys():
        entry, at = objects[tile], []
        for k, place in enumerate(entry["at"]):
            moving = chain(entry, tile, k, by_id)
            at.append([round(float(c), 3) for c in through([place], [[0, 1, 0]], [[1, 0, 0]], moving)[0][0]] if moving else place)
        out[tile] = {**entry, "at": at}
    return out
