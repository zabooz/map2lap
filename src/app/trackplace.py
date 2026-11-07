"""Single objects placed anew in the Editor (placement), written into a built kn5 with no build. The placements are the draft's and the
recipe's data (trackedits, trackcopy) like the height changes, always applied to the track's source, so an undo or a second Save never
adds anything up.
  - an object moves by the object list's triangles, a tree or bush as its billboard, whole, with what belongs to it;
  - a pole's wires go with it: each point of a span by its way from the one pole to the other, so both its ends stay on their arms;
  - a span alone is not placed: it hangs on its poles (placement.NOT_ALONE).
Normals and tangents turn with it. It stays in its tile's mesh, whose sphere grows by its way. The height changes come after
(trackheights.moved, under): they go by where the objects stand now.
"""
import numpy as np

from app import placement, trackheights, trackview
from track import kn5


def _billboard_parts(scan):
    """{a tile's billboards' base name: [(mesh number, triangles in its earlier parts)]}. Pure."""
    parts = {}
    for i, first in trackview._first_faces(scan["meshes"], scan["materials"]).items():
        parts.setdefault(trackview._base(scan["meshes"][i]["name"]), []).append((i, first))
    return parts


def _billboard_pieces(scan, parts, base, number):
    """Where billboard number of a tile lies: [(mesh number, first triangle, end)], in the parts that hold any of it. Pure."""
    per, out = trackview.FACES_PER_BILLBOARD, []
    for i, first in parts.get(base, ()):
        a, b = max(0, number * per - first), min(scan["meshes"][i]["indices"] // 3, (number + 1) * per - first)
        if a < b:
            out.append((i, a, b))
    return out


class _Placing:
    """The meshes of a kn5 open in f as the placements leave them: each read once, changed on a copy."""

    def __init__(self, f, scan):
        self.f, self.scan = f, scan
        self.meshes, self.vertices, self.grow = {}, {}, {}

    def mesh(self, i):
        """Mesh i's vertices and triangles, as in the file."""
        if i not in self.meshes:
            self.meshes[i] = trackheights._mesh(self.f, self.scan["meshes"][i])
        return self.meshes[i]

    def own(self, i, first, end):
        """The vertices of triangles first .. end of mesh i."""
        return np.unique(self.mesh(i)[1][first:end])

    def place(self, i, own, moving):
        """The vertices own of mesh i as moving, a function of (places, normals, tangents), moves them."""
        v = self.mesh(i)[0][own]
        pos, normal, tangent = moving(v["pos"], v["normal"], v["tangent"])
        out = self.vertices.setdefault(i, self.mesh(i)[0].copy())
        out["pos"][own], out["normal"][own], out["tangent"][own] = pos, normal, tangent
        way = np.linalg.norm(pos - v["pos"].astype(np.float64), axis=1)
        self.grow[i] = max(self.grow.get(i, 0.0), float(way.max()) if len(way) else 0.0)

    def result(self):
        return kn5.Moved(self.vertices, {i: g for i, g in self.grow.items() if g}, {})


def moved(path, scan, objects, placed):
    """What the placements move in the kn5 at path: a kn5.Moved, its points none. objects: its object list (trackview.list_of). An id
    that names nothing there moves nothing (trackedits checks them)."""
    if not placed:
        return kn5.Moved({}, {}, {})
    by_id = {p["id"]: p for p in placed}
    with open(path, "rb") as f:
        placing = _Placing(f, scan)
        _place_listed(placing, objects, by_id)
        _hang_wires(placing, objects, by_id)
        _place_billboards(placing, objects, by_id)
    return placing.result()


def _place_listed(placing, objects, by_id):
    """The listed objects of the placements and what belongs to them."""
    for tile in placement.tiles_of(by_id) & objects.keys():
        entry = objects[tile]
        for k in range(len(entry["kinds"])):
            moving = placement.chain(entry, tile, k, by_id)
            for i, first, n in entry["faces"][k] if moving else ():
                placing.place(i, placing.own(i, first, first + n), lambda *v, m=moving: placement.through(*v, m))


def _place_billboards(placing, objects, by_id):
    """The trees and bushes of the placements, each around the middle of its foot."""
    parts = _billboard_parts(placing.scan)
    for id_, p in by_id.items():
        base, number = id_.rsplit("#", 1)
        if base in objects or base not in parts:
            continue
        pieces = [(i, placing.own(i, a, b)) for i, a, b in _billboard_pieces(placing.scan, parts, base, int(number))]
        corners = np.concatenate([placing.mesh(i)[0]["pos"][own] for i, own in pieces]).astype(np.float64)
        if not len(corners):
            continue
        low, high = corners.min(axis=0), corners.max(axis=0)
        foot = [(low[0] + high[0]) / 2, low[1], (low[2] + high[2]) / 2]
        for i, own in pieces:
            placing.place(i, own, lambda *v, p=p, foot=foot: placement.through(*v, [(foot, p)]))


def _spans(objects, by_id):
    """{a span's id: [(its pole's place, the placements that move the pole)]}: of each pole that has a span, moved or not. Pure."""
    ends = {}
    for tile, entry in objects.items():
        for number, spans in entry.get("with", {}).items():
            k = int(number)
            for span in spans:
                ends.setdefault(span, []).append((entry["at"][k], placement.chain(entry, tile, k, by_id)))
    return ends


def _hung(a, chain_a, b, chain_b):
    """How a span from pole a to pole b moves, a function of (places, normals, tangents): each point by its way from the one to the
    other, at a pole as that pole moves. Pure."""
    length2 = max((b[0] - a[0]) ** 2 + (b[2] - a[2]) ** 2, 1e-6)

    def moving(pos, normal, tangent):
        way = np.clip(((pos[:, 0] - a[0]) * (b[0] - a[0]) + (pos[:, 2] - a[2]) * (b[2] - a[2])) / length2, 0, 1)[:, None]
        at_a, at_b = placement.through(pos, normal, tangent, chain_a), placement.through(pos, normal, tangent, chain_b)
        pos, normal, tangent = ((1 - way) * x + way * y for x, y in zip(at_a, at_b))
        normal /= np.maximum(np.linalg.norm(normal, axis=1, keepdims=True), 1e-12)
        tangent /= np.maximum(np.linalg.norm(tangent, axis=1, keepdims=True), 1e-12)
        return pos, normal, tangent
    return moving


def _hang_wires(placing, objects, by_id):
    """The spans on two poles of which one or both are placed. A span on one pole found stays: it can't be told where its other end
    goes."""
    for span, on in _spans(objects, by_id).items():
        if len(on) != 2 or not (on[0][1] or on[1][1]):
            continue
        tile, number = span.rsplit("#", 1)
        moving = _hung(*on[0], *on[1])
        for i, first, n in objects[tile]["faces"][int(number)]:
            placing.place(i, placing.own(i, first, first + n), moving)


def meshes_of(scan, objects, ids):
    """The numbers of the meshes a placement of those objects moves: theirs, what belongs to them, their wires. Pure."""
    belonging = {}
    for tile, entry in objects.items():
        for k, parent in enumerate(entry["parents"]):
            if parent >= 0:
                belonging.setdefault(f"{tile}#{parent}", []).append(f"{tile}#{k}")
        for number, spans in entry.get("with", {}).items():
            belonging.setdefault(f"{tile}#{number}", []).extend(spans)
    out, parts, queue, seen = set(), None, list(ids), set()
    while queue:
        id_ = queue.pop()
        if id_ in seen:
            continue
        seen.add(id_)
        base, number = id_.rsplit("#", 1)
        if base in objects:
            out.update(i for i, _first, _n in objects[base]["faces"][int(number)])
            queue += belonging.get(id_, ())
        else:
            parts = parts if parts is not None else _billboard_parts(scan)
            out.update(i for i, _a, _b in _billboard_pieces(scan, parts, base, int(number)))
    return sorted(out)


def changed(path, scan, objects, heights, placed):
    """What a draft's placements and then its height changes move in the kn5 at path, together: a kn5.Moved. InTheWay as
    trackheights.moved."""
    under = moved(path, scan, objects, placed)
    if not heights:
        return under
    over = trackheights.moved(path, scan, placement.list_placed(objects, placed), heights, under)
    grow = {i: under.grow.get(i, 0.0) + over.grow.get(i, 0.0) for i in under.grow.keys() | over.grow.keys()}
    return kn5.Moved({**under.vertices, **over.vertices}, grow, over.points)
