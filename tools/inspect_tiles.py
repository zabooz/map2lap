"""Overview of the built tiles: shapes per tile, triangles and material names."""
import collections
import glob
import json
import os
import sys

SERVER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vendor", "beamng_earth", "server")
sys.path.insert(0, SERVER)
import cdae  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out", "tiles")
mats = collections.defaultdict(collections.Counter)
for js in sorted(glob.glob(os.path.join(OUT, "roads_*.json"))):
    with open(js, encoding="utf-8") as f:
        data = json.load(f)
    kinds = []
    for what, v in data.items():
        if not (isinstance(v, dict) and "shape" in v):
            continue
        shape = cdae.read(os.path.join(OUT, os.path.basename(v["shape"])))
        names = [m["name"] for m in shape["materials"]]
        tris = 0
        for m in shape["meshes"]:
            if m.get("type") != 0:
                continue
            arr = cdae.mesh_arrays(m)
            for start, count, mat in arr["primitives"]:
                tris += count // 3
                mats[what][names[mat & 0x0FFFFFFF]] += count // 3
        kinds.append(f"{what}:{tris}")
    print(os.path.basename(js), " ".join(kinds))
print()
for what, c in mats.items():
    print(what, dict(c.most_common()))
