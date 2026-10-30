"""Compare two .kn5 files (e.g. ksEditor against obj_to_kn5): meshes by name, triangles, position, normals, empties.

    python compare_kn5.py <reference.kn5> <ours.kn5>
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src"))   # (kn5.py)

from track import kn5


def meshes(k):
    out = {}
    for n, _ in kn5.walk(k["root"]):
        if n.cls == 2:
            base = n.name
            out.setdefault(base, []).append(n)
    return out


def summary(nodes, mats):
    P = np.concatenate([n.vertices["pos"] for n in nodes]).astype(float)
    N = np.concatenate([n.vertices["normal"] for n in nodes]).astype(float)
    tris = sum(len(n.indices) // 3 for n in nodes)
    return {"tris": tris, "verts": len(P), "lo": P.min(0), "hi": P.max(0), "mean": P.mean(0),
            "up": float(np.mean(N[:, 1] > 0.5)), "mat": mats[nodes[0].material].name}


a, b = kn5.read(sys.argv[1]), kn5.read(sys.argv[2])
for k, label in ((a, "Reference"), (b, "Ours")):
    print(f"{label}: version {k['version']}, {len(k['textures'])} textures, {len(k['materials'])} materials, "
          f"reading ends {'exactly at the end of the file' if k['end'] == k['size'] else 'NOT at the end of the file'}")
ma, mb = meshes(a), meshes(b)
only_a, only_b = sorted(set(ma) - set(mb)), sorted(set(mb) - set(ma))
print(f"Meshes: reference {len(ma)}, ours {len(mb)}, shared {len(set(ma) & set(mb))}")
if only_a:
    print("  reference only:", only_a[:8])
if only_b:
    print("  ours only:", only_b[:8])
worst_pos, tri_diff, rows = 0.0, 0, []
for name in sorted(set(ma) & set(mb)):
    sa, sb = summary(ma[name], a["materials"]), summary(mb[name], b["materials"])
    d = max(np.abs(sa["lo"] - sb["lo"]).max(), np.abs(sa["hi"] - sb["hi"]).max())
    worst_pos = max(worst_pos, d)
    tri_diff += abs(sa["tris"] - sb["tris"])
    rows.append((name, sa, sb, d))
print(f"Triangles in all: reference {sum(r[1]['tris'] for r in rows)}, ours {sum(r[2]['tris'] for r in rows)}, "
      f"sum of the differences {tri_diff}")
print(f"Largest difference of a mesh's extent (bounding box): {worst_pos * 100:.2f} cm")
print("Examples (vertices ref/ours, share of normals pointing up ref/ours, material):")
for name, sa, sb, d in rows[:: max(1, len(rows) // 8)]:
    print(f"  {name:28s} {sa['verts']:6d}/{sb['verts']:6d}  up {sa['up']:.2f}/{sb['up']:.2f}  "
          f"{sa['mat']}/{sb['mat']}")


def empties(k):
    return {n.name: np.array(n.matrix).reshape(4, 4) for n, d in kn5.walk(k["root"]) if n.cls == 1 and d > 0}


ea, eb = empties(a), empties(b)
for name in sorted(set(ea) & set(eb)):
    pa, pb = ea[name][3, :3], eb[name][3, :3]
    za, zb = ea[name][2, :3], eb[name][2, :3]
    ang = np.degrees(np.arccos(np.clip(np.dot(za, zb) / np.linalg.norm(za) / np.linalg.norm(zb), -1, 1)))
    print(f"{name:18s} position ref {np.round(pa, 2)} ours {np.round(pb, 2)}  direction differs by {ang:.1f} degrees")
print("Empties only in our file:", sorted(set(eb) - set(ea)))
