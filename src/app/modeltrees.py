"""Library trees keep ordinary model bindings for Undo and groups, and use TreeFX for drawing and game export.

A native name contains the immutable snapshot hash. Reopening a transferred track reads its .bin first; an unsaved tree reads
the retained .bin in its snapshot. GLBs remain library pictures and selection bounds, never duplicated tree geometry in KN5.
"""
from pathlib import Path
import re
import shutil

import numpy as np

NAME = re.compile(r"m2l_tree_([a-f0-9]{64})")


def named(asset):
    """The native model name for immutable snapshot asset. Pure."""
    return "m2l_tree_" + asset


def read(ac, name, model):
    """The frozen .bin of an unsaved library tree; None for another TreeFX model name."""
    match = NAME.fullmatch(model)
    if not match:
        return None
    from app import trackmodels
    from scenery import treefx
    folder, meta = trackmodels.resolve(ac, name, match[1])
    if not meta.get("native_tree"):
        raise ValueError("No native tree in this asset")
    return treefx.read_bin(folder / "native/model.bin")


def trees(scan, placed, heights):
    """{model instance id#0: native placement} from shared model transforms, with inherited and draft heights exactly once. Pure."""
    from app import trackmodels
    matrices = trackmodels.view_matrices(scan, placed, heights)
    out = {}
    for instance in scan.get("models", []):
        if not scan["model_assets"][instance["asset"]].get("native_tree"):
            continue
        matrix = np.asarray(matrices[instance["id"]]).reshape(4, 4).T
        out[instance["id"] + "#0"] = {"model": named(instance["asset"]), "pos": matrix[:3, 3].tolist(),
                                     "angle": float(np.degrees(np.arctan2(matrix[0, 2], matrix[0, 0])) % 360),
                                     "size": float(np.linalg.norm(matrix[:3, 1])), "width": 1.}
    return out


def config(scan):
    """CSP list registration when a binding uses TreeFX; the generator uses this same list path. Pure."""
    return "[TREES]\nLIST_0 = trees/trees.txt\n" if any(a.get("native_tree") for a in scan.get("model_assets", {}).values()) else ""


def replacement(ac, name, source, instance, meta, pose, keep_height):
    """A generator TreeFX tree replaced by a library binding: its foot and base turn, optionally its real height."""
    from app import trackmodels, trackview
    if keep_height:
        model = trackview._tree_model(ac, name, source["model"])
        finest = np.concatenate([part["pos"] for part in model["lods"][0]["parts"]])
        instance["scale"] = float(np.ptp(finest[:, 1])) * source["size"] / trackmodels._model_height(meta)
    p = pose or {"x": 0, "y": 0, "z": 0, "turn": 0, "scale": 1}
    return {"id": instance["id"] + "#0", **p, "turn": (source["angle"] + p["turn"] + 180) % 360 - 180}


def export(ac, name, scan, target, edits):
    """Replace just our native lines in trees.txt, preserve generator/foreign trees, copy each frozen .bin once."""
    from app import trackmodels
    from scenery import treefx
    native = trees(scan, edits["placed"], edits["heights"])
    folder = Path(target, "extension/trees")
    listing = folder / "trees.txt"
    before = listing.read_text(encoding="utf-8-sig") if listing.is_file() else ""
    lines = []
    for line in before.splitlines():
        tree = treefx.parse(line)
        if tree is None or not NAME.fullmatch(tree["model"]):
            lines.append(line)
    gone = {d["id"] for d in edits["deleted"]}
    hidden = set(edits["object_sorts"])
    instances = {m["id"] + "#0": m for m in scan.get("models", [])}
    for id, tree in native.items():
        instance = instances[id]
        if id in gone or scan["model_assets"][instance["asset"]]["name"] in hidden:
            continue
        source, _meta = trackmodels.resolve(ac, name, instance["asset"])
        folder.mkdir(parents=True, exist_ok=True)
        destination = folder / (tree["model"] + ".bin")
        if not destination.exists():
            shutil.copyfile(source / "native/model.bin", destination)
        lines.append(treefx.text(tree))
    if native or listing.exists():
        folder.mkdir(parents=True, exist_ok=True)
        listing.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
