"""Surfaces the Editor leaves out by their triangles, not as objects: the road verge (roads.EDGE_DECAL, meshes nocol_road_edge_dirt_),
a decal 3 mm over the ground without collision, so taking it away changes nothing a car feels. It isn't in the object list: a click
selects a connected stretch of it (the page's MaterialRegions), and what goes are those triangles.

A draft's "surfaces": [{"mesh": the mesh's name, "faces": [[first triangle, count], ...]}], sorted, joined, each mesh once. The numbers
are of the kn5 the draft is of (trackview.served, its "base"), as an object's id is: a build makes them mean other triangles.
"""
import re

import numpy as np

DELETABLE = re.compile(r"nocol_road_edge_dirt_")     # (make_obj: the verge's meshes; a road, a wall or the ground never go this way)
MAX_RANGES = 200000                                    # (all verges of a long track, cut by clicks: far more than that is no draft)


def _count(value):
    """Whether value is a whole number for a draft, not a float or a bool. Pure."""
    return type(value) is int


def problems(surfaces):
    """Why surfaces can't be a draft's, None if it can. Pure: only its form, no file read."""
    if not isinstance(surfaces, list):
        return "Invalid surfaces"
    ranges = 0
    for s in surfaces:
        if not (isinstance(s, dict) and set(s) == {"mesh", "faces"} and isinstance(s["mesh"], str) and isinstance(s["faces"], list)):
            return "Invalid surfaces"
        for r in s["faces"]:
            if not (isinstance(r, list) and len(r) == 2 and all(_count(v) for v in r) and r[0] >= 0 and r[1] >= 1):
                return f"Invalid triangles of {s['mesh'][:80]}"
        ranges += len(s["faces"])
    return "Too many surfaces" if ranges > MAX_RANGES else None


def _joined(ranges):
    """[[first, count], ...] sorted, overlapping and touching ones as one. Pure."""
    out = []
    for a, n in sorted(ranges):
        if out and a <= out[-1][0] + out[-1][1]:
            out[-1][1] = max(out[-1][1], a + n - out[-1][0])
        else:
            out.append([a, n])
    return out


def checked(surfaces, scan):
    """surfaces as a draft holds them, for the meshes of scan: each a verge's, there once, its ranges within it. Raises ValueError. Pure."""
    wrong = problems(surfaces)
    if wrong:
        raise ValueError(wrong)
    numbers = _numbers(scan)
    wanted = {}
    for s in surfaces:
        if not DELETABLE.match(s["mesh"]):
            raise ValueError(f"{s['mesh'][:80]} can't be deleted by its triangles")
        if s["mesh"] not in numbers:
            raise ValueError(f"No mesh {s['mesh'][:80]}")
        wanted.setdefault(s["mesh"], []).extend(s["faces"])
    out = []
    for name, ranges in wanted.items():
        if numbers[name] is None:
            raise ValueError(f"Two meshes are called {name[:80]}: their triangles can't be told apart")
        faces = _joined(ranges)
        if faces[-1][0] + faces[-1][1] > scan["meshes"][numbers[name]]["indices"] // 3:
            raise ValueError(f"{name[:80]} has fewer triangles")
        out.append({"mesh": name, "faces": faces})
    return sorted(out, key=lambda s: s["mesh"])


def _numbers(scan):
    """{a deletable mesh's name: its number in scan, None if two share it}. Pure."""
    out = {}
    for i, m in enumerate(scan["meshes"]):
        if DELETABLE.match(m["name"]):
            out[m["name"]] = None if m["name"] in out else i
    return out


def going(scan, surfaces):
    """{mesh number: bool per triangle, True what goes} for checked surfaces (trackcopy.faces_left_out's form). Pure."""
    numbers, out = _numbers(scan), {}
    for s in surfaces:
        i = numbers[s["mesh"]]
        mask = out.setdefault(i, np.zeros(scan["meshes"][i]["indices"] // 3, bool))
        for a, n in s["faces"]:
            mask[a:a + n] = True
    return out
