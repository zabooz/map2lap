"""Optional parked cars and permanent build-time tree thinning, before any installed editor source exists."""
import json

from app import tracktrees, treespacing
from track import objectlist
from scenery import cars


def car_mesh(spots, ground, rings, classes, placed, enabled=True):
    """Cars on parking spots, or None when disabled; parking geometry and its original spots are left alone."""
    if not enabled:
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
