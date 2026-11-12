"""TreeFX trees in the Editor (scenery.treefx: CSP's 3D trees): the section of the object list (track.objectlist) of the kn5 the
Editor shows, as the draft changes it. Its trees are objects as the others are: deleted by their id ("trees#<number>") or all of a
model (the draft's object sorts), placed anew (placement: moved, turned around their foot, scaled), and added (the draft's "trees":
copies of trees on the track, their model, place and size, under numbers the track never gave; "trees_next" is the first number
after every one given, so none is given twice, not even one whose addition was taken back). Height changes lift each by the change
under its foot, after its placement, as they do listed objects (trackheights.list_moved). Save writes the result into the list
and trees.txt (trackcopy); the models stay in the track's folder, every one, so a tree that comes back has its model.
"""
import re

import numpy as np

from app import trackheights
from track import objectlist

ID = re.compile(rf"{objectlist.TREEFX}#(\d+)")
MAX_POS_M = 100_000.0       # (no track reaches 100 km from its anchor: a number beyond is no place)
MAX_SIZE = 100.0            # (a model scaled 100 times: a spruce of 1.5 km)
NONE = {"x": 0.0, "y": 0.0, "z": 0.0, "turn": 0.0, "scale": 1.0}


def number(id_):
    """A TreeFX tree's number by its id; None for an id of something else. Pure."""
    match = ID.fullmatch(id_) if isinstance(id_, str) else None
    return int(match[1]) if match else None


def trees_of(section, added):
    """{id: tree} of a list's section (None for none) and the draft's added trees, in the order of their numbers. Pure."""
    out = {objectlist.treefx_id(k): tree for k, tree in (section or {}).get("trees", {}).items()}
    out.update({tree["id"]: {k: v for k, v in tree.items() if k != "id"} for tree in added})
    return dict(sorted(out.items(), key=lambda item: number(item[0])))


def placed(tree, p, ground):
    """A tree as placement p ({x, y, z, turn, scale}; None for none) and then a height change of ground m at its foot leave it:
    rounded as trees.txt writes it (scenery.treefx.text). Pure."""
    p = p or NONE
    x, y, z = tree["pos"]
    return {**tree, "pos": [round(x + p["x"], 2), round(y + p["y"] + ground, 2), round(z + p["z"], 2)],
            "angle": float(round(tree["angle"] + p["turn"]) % 360), "size": round(tree["size"] * p["scale"], 3)}


def now(trees, placements, heights):
    """{id: tree} of trees as the placements and then the height changes leave them. Pure."""
    by_id = {p["id"]: p for p in placements}
    if not trees or not (heights or by_id.keys() & trees.keys()):
        return trees
    moves = [by_id.get(id_) or NONE for id_ in trees]
    x = np.array([t["pos"][0] + p["x"] for t, p in zip(trees.values(), moves)])
    z = np.array([t["pos"][2] + p["z"] for t, p in zip(trees.values(), moves)])
    ground = trackheights.Field(heights).at(x, z)[0] if heights else np.zeros(len(x))
    return {id_: placed(t, by_id.get(id_), float(d)) for (id_, t), d in zip(trees.items(), ground)}


def next_of(section, added, given=0):
    """The first number never given: after the section's, the added trees' and given (the draft's). Pure."""
    return max([given, (section or {}).get("next", 0)] + [number(t["id"]) + 1 for t in added])


def problem(added, section):
    """What is wrong with the draft's added trees, None if nothing: each of a number the track's list never gave, once, of a model
    of the track's trees (their .bin lies in its folder), its place and size those of a tree. Pure."""
    if not isinstance(added, list):
        return "no list of trees"
    models, first, seen = {t["model"] for t in (section or {}).get("trees", {}).values()}, (section or {}).get("next", 0), set()
    for tree in added:
        n = number(tree.get("id")) if isinstance(tree, dict) else None
        if n is None or n < first or n in seen:
            return f"no number for a tree: {str(tree)[:80]}"
        seen.add(n)
        wrong = objectlist.tree_problem({k: v for k, v in tree.items() if k != "id"})
        if wrong or set(tree) != {"id", "model", "pos", "angle", "size", "width"}:
            return f"no tree: {wrong or 'other fields'}"
        if tree["model"] not in models:
            return f"no model of this track's trees: {tree['model'][:40]}"
        if max(map(abs, tree["pos"])) > MAX_POS_M or tree["size"] > MAX_SIZE or tree["width"] > MAX_SIZE:
            return "a tree too far or too large"
    return None


def saved(section, edits):
    """The list's section Save writes: the source's trees and the added ones as the draft places them, without those it deletes,
    "next" never lower than before. None: no trees, and none added."""
    added = edits.get("trees", [])
    if section is None and not added:
        return None
    gone, sorts = {d["id"] for d in edits["deleted"]}, set(edits["object_sorts"])
    trees = now(trees_of(section, added), edits["placed"], edits["heights"])
    return {"next": next_of(section, added, edits.get("trees_next", 0)),
            "trees": {str(number(id_)): tree for id_, tree in trees.items() if id_ not in gone and tree["model"] not in sorts}}
