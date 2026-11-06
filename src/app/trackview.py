"""A built track as the generator page's Editor tab shows it in 3D: what its kn5 holds, each mesh's and texture's bytes
read from the file on demand (a long track's kn5 does not fit into memory). Map2Lap's tracks only (mytracks.FILE).
"""
import functools
import json
import os
import re
import struct

from app import mytracks, tracksource
from track import kn5, objectlist

VERTEX_BYTES = kn5.VERTEX.itemsize
START = "AC_START_0"
ATLAS_MATERIAL = "trees"
FACES_PER_BILLBOARD = 8     # (scenery.trees.billboards)
PART_SUFFIX = re.compile(r"(_-?\d+_-?\d+)_\d+$")     # (<kind>_<tx>_<ty>_<part>: a part's name without its number is \1)


class NotOurs(Exception):
    """No kn5 of a Map2Lap track there."""


class Unreadable(Exception):
    """The kn5 can't be read now, or is no more the one asked about: a build is writing it, or has replaced it."""


def _revision(stat):
    """Which state of a file a stat result is of. Pure."""
    return f"{stat.st_mtime_ns}-{stat.st_size}"


def kn5_path(ac, name):
    """The kn5 of the track name in the AC folder ac: its own, the one AC drives."""
    root = os.path.join(ac, "content", "tracks", name)
    path = os.path.join(root, name + ".kn5")
    if not (os.path.exists(os.path.join(root, mytracks.FILE)) and os.path.exists(path)):
        raise NotOurs(name)
    return path


@functools.lru_cache(maxsize=8)
def _info(path, _revision_of_file):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def recipe(ac, name):
    """What the Editor's last Save of the track name was made of ("edits" in its map2lap.json: trackcopy.save), if it counts: its
    source is there and the track's kn5 is still the one that Save wrote. Built again since (whole, or failed halfway), or the
    source lost: None, and what the Save left out stays out of the track's own kn5 for good."""
    path = kn5_path(ac, name)
    info_path = os.path.join(os.path.dirname(path), mytracks.FILE)
    try:
        edits = _info(info_path, _revision(os.stat(info_path))).get("edits") or {}
    except OSError:
        return None
    if not (isinstance(edits, dict) and tracksource.exists(edits.get("source"))):
        return None
    return edits if edits.get("kn5") == objectlist.state_of(path) else None


def served(ac, name):
    """(the kn5 the Editor shows of the track name and its draft's ids are of, the source's id or None): its source while its recipe
    counts, else its own kn5."""
    own, saved = kn5_path(ac, name), recipe(ac, name)
    return (tracksource.kn5_of(saved["source"]), saved["source"]) if saved else (own, None)


@functools.lru_cache(maxsize=1)
def _scan(path, _revision_of_file):
    return kn5.scan(path)


def _scanned(ac, name):
    """(the served kn5's path, its scan, its revision)."""
    path = served(ac, name)[0]
    try:
        revision = _revision(os.stat(path))
        return path, _scan(path, revision), revision
    except (AssertionError, struct.error, ValueError, OSError) as e:      # (cut off: a build is writing it)
        raise Unreadable(str(e)) from e


def _prop(material, name, default):
    """A material's value by name. Pure."""
    return next((p[1] for p in material.props if p[0] == name), default)


def _material(material):
    """What the view needs of a Material: its names, its diffuse texture's name, ksAmbient + ksDiffuse (how bright AC lights
    it), cut out by alpha or see-through. Pure."""
    texture = next((tex for slot, _n, tex in material.maps if slot == "txDiffuse"), None)
    return {"name": material.name, "shader": material.shader, "texture": texture,
            "bright": _prop(material, "ksAmbient", 0.5) + _prop(material, "ksDiffuse", 0.5),
            "alpha_ref": _prop(material, "ksAlphaRef", 0.5) if material.alpha_tested else 0.0,
            "blend": bool(material.blend)}


def _start(matrix):
    """The start's place and the way the car faces (AC drives along its +Z, the matrix's third row), or None. Pure."""
    return {"pos": matrix[12:15], "forward": matrix[8:11]} if matrix else None


def _base(name):
    """A mesh's name without its part's number. Pure."""
    return PART_SUFFIX.sub(r"\1", name)


def _first_faces(meshes, materials):
    """{mesh number: triangles in the earlier parts of its object}: obj_to_kn5 splits an object at 65,535 vertices into
    <name>, <name>_1, ...; the billboards of a tile (material ATLAS_MATERIAL, 8 triangles each) count on over its parts,
    one can lie across two. Pure."""
    seen, out = {}, {}
    for i, m in enumerate(meshes):
        if materials[m["material"]].name == ATLAS_MATERIAL:
            base = _base(m["name"])
            out[i] = seen.get(base, 0)
            seen[base] = out[i] + m["indices"] // 3
    return out


def _route(root):
    """The route as the build wrote it (generator: data/map2lap_route.txt): (anchor [lat, lon] or None, [[AC x, AC z], ...])."""
    try:
        with open(os.path.join(root, "data", "map2lap_route.txt"), encoding="utf-8") as f:
            rows = [line.split() for line in f]
    except OSError:
        return None, []
    anchor = [float(v) for v in rows[0][1:3]] if rows and rows[0] and rows[0][0] == "anchor" else None
    return anchor, [[float(a), float(b)] for a, b, *_rest in (r for r in rows if len(r) >= 2 and r[0] != "anchor")]


def _atlas():
    """The billboards' atlas: its images in rows of cols (scenery.trees)."""
    from scenery import trees       # (only here: needs the engine's path from generator)
    return {"sprites": list(trees.SPRITES), "cols": trees.COLS, "rows": trees.ROWS}


def index(ac, name):
    """The track's meshes (the invisible collision ones left out), materials, textures, start, anchor, route and billboard
    atlas, as JSON for the page. A mesh's "i" asks for its bytes (mesh_bytes), with "revision": the numbers hold for this
    state of the file only. Our kn5 hold all meshes in the world's frame: the one parent's matrix is the identity
    (obj_to_kn5)."""
    path, s, revision = _scanned(ac, name)
    first = _first_faces(s["meshes"], s["materials"])
    meshes = [{"i": i, "name": m["name"], "material": m["material"], "vertices": m["vertices"], "indices": m["indices"],
               "lod_in": m["lod_in"], "lod_out": m["lod_out"], "center": m["center"], "radius": m["radius"],
               "first_face": first.get(i), "base": _base(m["name"]) if i in first else None}
              for i, m in enumerate(s["meshes"]) if m["renderable"]]
    anchor, route = _route(os.path.dirname(kn5_path(ac, name)))      # (the track's own: a source holds only the kn5 and its list)
    return {"revision": revision, "meshes": meshes, "materials": [_material(m) for m in s["materials"]],
            "textures": [{"name": t[0], "size": t[2]} for t in s["textures"]], "start": _start(s["points"].get(START)),
            "anchor": anchor, "route": route, "atlas": _atlas(), "objects": objects(ac, name)}


def sprites():
    """The names of the billboards' sorts (scenery.trees)."""
    return _atlas()["sprites"]


def objects(ac, name):
    """The build's list of the track's single objects (track.objectlist): {a tile: {"kinds", "sorts" (not in older builds'), "at",
    "parents", "faces"}}; empty for a track built before it, or when the list isn't of this state of the kn5. Of the served kn5."""
    return list_of(served(ac, name)[0])


def list_of(path):
    """The object list beside the kn5 at path, if it is of that state of the file; else {}."""
    try:
        with open(os.path.join(os.path.dirname(path), objectlist.FILE), encoding="utf-8") as f:
            d = json.load(f)
        fits = d["schema"] == objectlist.SCHEMA and d["kn5"] == objectlist.state_of(path) and objectlist.well_formed(d["objects"])
        return d["objects"] if fits else {}
    except (OSError, ValueError, KeyError, TypeError):
        return {}


def _billboard_kind(base):
    """Tree or bush by its mesh's name (make_obj). Pure."""
    return "bush" if "_trees_bush_" in base or base.startswith("nocol_bush_") else "tree"


def deletable(ac, name):
    """(the kn5's revision, {what an id starts with: (how many single objects it holds, their kind or a list of each one's)}, the
    sorts of listed objects that can go all at once): the build's list, and the billboards, which are told apart by their count of
    triangles on any track."""
    _path, s, revision = _scanned(ac, name)
    faces = {}
    for m in s["meshes"]:
        if s["materials"][m["material"]].name == ATLAS_MATERIAL:
            faces[_base(m["name"])] = faces.get(_base(m["name"]), 0) + m["indices"] // 3
    counts = {base: (n // FACES_PER_BILLBOARD, _billboard_kind(base)) for base, n in faces.items()}
    listed = objects(ac, name)
    counts.update({base: (len(o["at"]), o["kinds"]) for base, o in listed.items()})
    return revision, counts, objectlist.all_sorts(listed)


def _read(path, offset, size, revision):
    """size bytes at offset of the file in the given revision: checked after reading too, a build can start any time."""
    try:
        with open(path, "rb") as f:
            f.seek(offset)
            data = f.read(size)
            same = _revision(os.fstat(f.fileno())) == revision
    except OSError as e:
        raise Unreadable(str(e)) from e
    if not same or len(data) != size:
        raise Unreadable("the track file changed")
    return data


def _scan_of(ac, name, revision):
    """(the kn5's path, its scan) if it still is in the revision asked about."""
    path, s, now = _scanned(ac, name)
    if now != revision:
        raise Unreadable("the track file changed")
    return path, s


def mesh_bytes(ac, name, i, revision):
    """Mesh i of the scan as in the file: its vertices (kn5.VERTEX), the index count (int32), its indices (uint16)."""
    path, s = _scan_of(ac, name, revision)
    m = s["meshes"][i]
    return _read(path, m["offset"], m["vertices"] * VERTEX_BYTES + 4 + m["indices"] * 2, revision)


def texture_bytes(ac, name, i, revision):
    """Texture i as in the file: (its name, the image file's bytes: .dds, .png or .jpg)."""
    path, s = _scan_of(ac, name, revision)
    tex, offset, size = s["textures"][i]
    return tex, _read(path, offset, size, revision)
