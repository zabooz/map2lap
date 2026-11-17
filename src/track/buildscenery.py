"""Optional parked cars and permanent build-time tree thinning, before any installed editor source exists."""
import json
import numpy as np
from polygon import Path

from app import tracktrees, treespacing
from track import objectlist
from scenery import cars
import parking


def _line_crosses_ring(a, b, ring):
    """Whether the open segment a-b crosses the interior of a polygon edge. Pure."""
    edge = np.roll(ring, -1, axis=0) - ring
    d = b - a
    den = d[0] * edge[:, 1] - d[1] * edge[:, 0]
    valid = np.abs(den) > 1e-12
    if not valid.any():
        return False
    q = ring - a
    t = np.divide(q[:, 0] * edge[:, 1] - q[:, 1] * edge[:, 0], den,
                  out=np.zeros(len(den)), where=valid)
    u = np.divide(q[:, 0] * d[1] - q[:, 1] * d[0], den,
                  out=np.zeros(len(den)), where=valid)
    return bool((valid & (t > 0) & (t < 1) & (u > 0) & (u < 1)).any())


def clear_covered_parking_lines(chunks, rings):
    """(kept chunks, covered parking lines) against finished ground-level building outlines. Pure.

    Road tiles are built independently. A building assigned by centroid to the next tile may cover a stall
    here; the finished neighbour footprints make that visible before OBJ and Editor source are written.
    """
    footprints = [(np.asarray(r, float), Path(r)) for r in rings if len(r) >= 3]
    if not footprints:
        return list(chunks), []
    kept, blocked = [], []
    for chunk in chunks:
        nodes = chunk.get("n", ())
        if chunk.get("m") != "line_white" or chunk.get("w") != 0.1 or len(nodes) != 2:
            kept.append(chunk)
            continue
        p = np.asarray(nodes, float)
        a, b = p[:, :2]
        if any(not ((ring.max(0) < np.minimum(a, b)).any() or
                    (ring.min(0) > np.maximum(a, b)).any()) and
               (path.contains_points(np.array([a, b])).any() or _line_crosses_ring(a, b, ring))
               for ring, path in footprints):
            blocked.append(chunk)
        else:
            kept.append(chunk)
    return kept, blocked


def clear_covered_mark_mesh(vertices, triangles, blocked):
    """Triangles of a road mesh clear of its removed parking-line ribbons. Pure.

    The 0.1 m painted ribbon stays within 0.1 m of its generating line. Compare heights as well so a
    road marking on a bridge above a building's ground-level parking line is not removed by a 2D match.
    The 0.5 m vertical allowance covers road draping and marking lift; markings on two surfaces less than
    0.5 m apart at the same position cannot be distinguished here.
    """
    if not blocked or not len(triangles):
        return triangles
    centres = np.asarray(vertices)[triangles].mean(axis=1)
    keep = np.ones(len(triangles), bool)
    for chunk in blocked:
        a, b = np.asarray(chunk["n"], float)
        d = b[:2] - a[:2]
        t = np.clip(((centres[:, :2] - a[:2]) @ d) / max(float(d @ d), 1e-12), 0, 1)
        xy = a[:2] + t[:, None] * d
        z = a[2] + t * (b[2] - a[2])
        keep &= (np.linalg.norm(centres[:, :2] - xy, axis=1) > 0.1) | (np.abs(centres[:, 2] - z) > 0.5)
    return triangles[keep]


def car_mesh(spots, ground, rings, classes, placed, enabled=True):
    """Cars on parking spots, or None when disabled; parking geometry and its original spots are left alone."""
    if not enabled:
        return None
    # The road tile checked its own buildings. The finished neighbouring tiles' footprints are available here;
    # a building whose centroid belongs to the next tile can still cover this tile's parked car.
    spots = parking.clear_of_buildings(spots, rings)
    if not spots:
        return None
    return cars.build(spots, ground, cars.fill_shares(spots, rings, classes), placed)


def thin_trees(parts, distance):
    """Remove trees from OBJ parts' source lists at minimum spacing distance, across tile borders; return their count.

    Bushes remain. Only kept placements reach the installed object list, TreeFX list and retained Editor source:
    resetting the Editor's separate thinning layer cannot restore a tree removed by the build.
    """
    if distance == 0:
        return 0
    records = [(part, objectlist.load_side(part)) for part in parts]
    trees = [tree for _part, data in records for tree in data.get("treefx", ())]
    points = {str(k): tree["pos"] for k, tree in enumerate(trees) if tracktrees.kind(tree["model"]) == "tree"}
    hidden = set(treespacing.thin(points, distance))
    offset = 0
    for part, data in records:
        old = data.get("treefx", [])
        kept = [tree for k, tree in enumerate(old, offset) if str(k) not in hidden]
        offset += len(old)
        if len(kept) != len(old):
            data["treefx"] = kept
            with open(objectlist.side_file(part), "w", encoding="utf-8") as stream:
                json.dump(data, stream)
    return len(hidden)
