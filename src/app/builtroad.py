"""Where a selected mapped road was built: the Editor's shared road, level and surface query.

Map facts (`roadregion`) say which roads connect and carry each road's ID. Where that road's driving surface lies comes
from the build: every deck face keeps its generating road's ID (`editorinfo.surface_face_owners`), and a ground road is
the graded terrain under its paint. Bend road, Racing kerb and Smooth road select and read roads here, so a click picks
the same road and level in each tool, and a point beside a skewed deck end reads that road's deck rather than the
terrain under it. Another road's deck never gives this road a level or a height; the ground beneath a bridge belongs to
the road passing under it, not to the bridge's road.

Example (A2 Völkermarkt): the motorway deck at x=-4480, z=586 lies at 454 m, the terrain under it at 447 m. A click at
454 m picks the motorway; a kerb point 0.1 m beside the deck reads 454 m, the deck's edge, not 447 m.
"""
import os

import numpy as np

from app import roadregion, roadsurfaces, trackband
from track import editorinfo

# The mapped road edge can lie a few decimetres outside its triangulated deck (A2 Völkermarkt: 18 cm).
# Within this reach a point reads the nearest deck edge; beyond it there is no reliable deck height to extend.
DECK_REACH_M = 0.5
# roadmesh.DECK_SKIN: the visible asphalt lies 1 cm over the collision deck.
DECK_SKIN_M = 0.01
# A click ray stops on the visible asphalt: 1 cm over a deck, or the 4 cm road lift over graded ground. The closest
# built level wins, even where a deck lies centimetres over the road it crosses (Perth, no elevation data). A click
# further than one metre from every level (a parapet, a car-high object) selects by mapped distance instead.
CLICK_LEVEL_M = 1.0
# A road point without terrain takes its neighbours' height across at most three lattice steps; longer, the edge runs
# off the built track, where an interpolated height would be invented.
GAP_M = 6.0
# How far below a click a deck face still counts as under it: half a lattice step, for clicks on a deck's sloped edge.
CLICK_REACH_M = 0.3


def road_ids(net, structure=None):
    """Mapped road IDs of a selected network, optionally only its segments of one structure kind. Pure."""
    return {str(edge["road"]) for edge in net["segments"]
            if edge.get("road") is not None and (structure is None or edge.get("structure") == structure)}


def decks(path, scan, moved, bounds):
    """Upward driveable deck faces inside bounds [[x0,z0],[x1,z1]]: [(triangles, low, high, owners)].

    owners: the source road ID of each face, or None for a mesh built before face ownership was retained.
    """
    result = []
    for i, faces, triangles in roadsurfaces._top_triangles(path, scan, moved, bounds):
        name = scan["meshes"][i]["name"]
        if name.startswith("1ROAD_deck") and len(triangles):
            owners = roadsurfaces._face_owners(path, name)
            result.append((triangles, triangles[:, :, [0, 2]].min(axis=1), triangles[:, :, [0, 2]].max(axis=1),
                           None if owners is None else owners[faces]))
    return result


def owned(found, ids):
    """The faces of decks() that carry one of the road IDs; legacy meshes keep all theirs. Pure."""
    result = []
    for triangles, low, high, owners in found:
        keep = np.ones(len(triangles), bool) if owners is None else np.isin(owners, list(ids))
        if keep.any():
            result.append((triangles[keep], low[keep], high[keep], None if owners is None else owners[keep]))
    return result


def deck_at(decks, points, reach):
    """(height, plan distance) of the nearest owned deck face within reach of each [x,z] point; inf distance where none.

    Pure. Unowned (legacy) faces count only when the point lies exactly on them.
    """
    points = np.asarray(points, np.float64).reshape(-1, 2)
    heights, distance = np.full(len(points), np.nan), np.full(len(points), np.inf)
    for triangles, low, high, owners in decks:
        limit = 0.0 if owners is None else reach
        for k, point in enumerate(points):
            near = np.flatnonzero(((low <= point + limit) & (high >= point - limit)).all(axis=1))
            for j in near:
                d, y = roadsurfaces._nearest_deck(triangles[j], point)
                if d <= limit + 1e-6 and d < distance[k]:
                    heights[k], distance[k] = y, d
    return heights, distance


def heights(path, scan, moved, net, points, reach=DECK_REACH_M):
    """(visible road height or NaN, on_deck) at each [x,z] point of one selected road's stretch.

    The selected roads' own deck faces within reach decide the deck; elsewhere the graded road ground does, also
    beneath another road's deck: a road passing under a bridge drives there, even where a build laid the deck
    directly on it (Perth). Map structure ranges are not consulted: at a skewed end the deck reaches past them.
    NaN marks points without terrain, for filled().
    """
    points = np.asarray(points, np.float64).reshape(-1, 2)
    bounds = np.array([points.min(axis=0) - reach, points.max(axis=0) + reach])
    deck, distance = deck_at(owned(decks(path, scan, moved, bounds), road_ids(net)), points, reach)
    on_deck = np.isfinite(distance)
    grid, i0, j0 = trackband._ground(path, scan, moved, points)
    return np.where(on_deck, deck + DECK_SKIN_M, trackband._on_grid(grid, i0, j0, points)), on_deck


def filled(points, values):
    """Heights along [x,z] points with NaN gaps interpolated; refuses a gap longer than GAP_M. Pure."""
    points, values = np.asarray(points, np.float64).reshape(-1, 2), np.asarray(values, np.float64)
    good = np.isfinite(values)
    if not good.any():
        raise trackband.Refused("No road surface found here")
    s = trackband._along(points)
    _refuse_long_gaps(points, s, good)
    return np.interp(s, s[good], values[good])


def _refuse_long_gaps(points, s, good):
    """Refuse a stretch without a surface of this road longer than GAP_M. Pure."""
    edges = np.flatnonzero(np.diff(np.r_[1, good.astype(np.int8), 1]))
    for first, end in zip(edges[::2], edges[1::2]):
        before, after = s[max(first - 1, 0)], s[min(end, len(s) - 1)]
        if after - before > GAP_M:
            x, z = points[first]
            raise trackband.Refused(f"the road has no surface of its own at x={x:.0f}, z={z:.0f}")


def _click_level(path, scan, data, pin):
    """(road IDs, on_deck) whose built surface lies at one clicked [x,z,y], or None if no built level matches it.

    Candidate roads come from the mapped edges within clicking reach. A road is on its deck when one of its own deck
    faces lies under the click; every candidate's ground is the same graded terrain there, so ground matches return
    all candidates on the ground and leave the nearest one to the mapped projection.
    """
    positions, _numbers, edges = data
    x, z, y = (float(v) for v in pin)
    starts = np.asarray([positions[e["a"]] for e in edges])
    vector = np.asarray([positions[e["b"]] for e in edges]) - starts
    square = np.maximum((vector * vector).sum(axis=1), 1e-12)
    t = np.clip(((np.array([x, z]) - starts) * vector).sum(axis=1) / square, 0, 1)
    distance = np.linalg.norm(starts + t[:, None] * vector - [x, z], axis=1)
    reach = np.array([roadregion.reach_of(edge) for edge in edges])
    candidates = [edges[k] for k in np.flatnonzero(distance <= reach)]
    if not candidates:
        return None
    ids = {str(edge["road"]) for edge in candidates}
    bounds = np.array([[x - CLICK_REACH_M, z - CLICK_REACH_M], [x + CLICK_REACH_M, z + CLICK_REACH_M]])
    options = []
    found = decks(path, scan, None, bounds)
    for road in sorted(ids):
        deck, _distance = deck_at(owned(found, {road}), [[x, z]], CLICK_REACH_M)
        if np.isfinite(deck[0]):
            options.append((abs(deck[0] + DECK_SKIN_M - y), (road,), True))
    try:
        grid, i0, j0 = trackband._ground(path, scan, None, np.array([[x, z]]))
        ground = float(trackband._on_grid(grid, i0, j0, np.array([[x, z]]))[0])
    except trackband.Refused:
        ground = np.nan
    on_ground = tuple(sorted({str(e["road"]) for e in candidates if not e.get("structure")}))
    if np.isfinite(ground) and on_ground:
        options.append((abs(ground - y), on_ground, False))
    if not options:
        return None
    best = min(options, key=lambda option: option[0])
    return (best[1], best[2]) if best[0] <= CLICK_LEVEL_M else None


def pick(path, scan, points, join_near=False):
    """The mapped network through clicked [x,z] or [x,z,y] points; each click's height selects the road built there.

    scan None or two-value points select by mapped distance alone. The main driving route is never used.
    """
    folder = editorinfo._folder(path)
    if editorinfo.manifest(path) is None:
        raise ValueError("This track needs a new build for road-area smoothing")
    stamp = editorinfo._stamp(os.path.join(folder, "manifest.json"))
    pins = roadregion.checked_points(points)
    hints = None
    if scan is not None and pins.shape[1] == 3:
        data = roadregion._source_graph(folder, stamp)
        hints = tuple(_click_level(path, scan, data, pin) for pin in pins)
    return roadregion._mapped(folder, stamp, tuple(tuple(p) for p in pins), hints, join_near)
