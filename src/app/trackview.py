"""A built track as the generator page's Editor tab shows it in 3D: what its kn5 holds, each mesh's and texture's bytes
read from the file on demand (a long track's kn5 does not fit into memory). Map2Lap's tracks only (mytracks.FILE).
"""
import functools
import io
import json
import math
import os
import re
import struct

import numpy as np

from app import mytracks, tracksource
from track import editorinfo, groundmaterial, kn5, objectlist, surfaceindex

VERTEX_BYTES = kn5.VERTEX.itemsize
START = "AC_START_0"
ATLAS_MATERIAL = "trees"
FACES_PER_BILLBOARD = 8     # (scenery.trees.billboards)
PART_SUFFIX = re.compile(r"(_-?\d+_-?\d+)_\d+$")     # (<kind>_<tx>_<ty>_<part>: a part's name without its number is \1)


class NotOurs(Exception):
    """No kn5 of a Map2Lap track there."""


class Unreadable(Exception):
    """The kn5 can't be read now, or is no more the one asked about: a build is writing it, or has replaced it."""


class CopiesChanged(Unreadable):
    """The generated mesh layout is obsolete; the view needs the current copy index."""


class ModelsChanged(Unreadable):
    """The requested draft's generated mesh numbers no longer describe the current models."""


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
        from app import trackmodels
        return trackmodels.cold_recipe(ac, name)
    return edits if edits.get("kn5") == objectlist.state_of(path) else None


def served(ac, name):
    """(the kn5 the Editor shows of the track name and its draft's ids are of, the source's id or None): its source while its recipe
    counts, else its own kn5."""
    own, saved = kn5_path(ac, name), recipe(ac, name)
    return (tracksource.kn5_of(saved["source"]), saved["source"]) if saved and saved.get("source") else (own, None)


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


def _mask_extent(material):
    """Native mask UV compression, independent of physical photograph repetition. Pure."""
    return next((list(p[2]) for p in material.props if p[0] == 'm2lMaskExtent'), [1., 1.])


def tile_uv(u, v, scale, global_uv, tx, ty):
    """A ground mesh's UV (kn5's: v negated) as its tile's own, u 0..1 and v -1..0 over the whole 256 m, which the
    Editor's masks cover: divided by its scale (a build's: world tiles times groundmaterial.UV_SCALE), less a global UV's
    tile origin. Pure."""
    u, v = u / scale, v / scale
    if global_uv:
        u, v = u - tx, v + ty
    return u, v


def uv_scale(material):
    """What a ground material's mesh UVs are scaled by (groundmaterial.uv_props; 1 without). A track built while its tile
    textures had their guard at the texture's edge (m2lUVGuard) is built again: its tile images don't lie at the world's
    phase, a Save would need a copy of each. Pure."""
    if _prop(material, "m2lUVGuard", 0.):
        raise ValueError("This track was built before Map2Lap 0.6: its ground is painted once it is built again")
    return _prop(material, "m2lUVScale", 1.)


def base_scale(material):
    """The scale its tile image lies at (groundmaterial.UV_SCALE): a Save's m2lBaseScale, whose mesh UVs are its mask's
    canvas, else its mesh UVs'. Pure."""
    return _prop(material, "m2lBaseScale", 0.) or uv_scale(material)


def material_uv(material, tx, ty, u, v):
    """tile_uv by what the ground material of tile (tx, ty) says of its UVs. Pure."""
    return tile_uv(u, v, uv_scale(material), _prop(material, "m2lUVGlobal", 0) == 1, tx, ty)


def _material(material):
    """Names, colour-layer inputs/scales, ksAmbient and ksDiffuse (their sum and apart), ksSpecular and ksSpecularEXP and
    alpha flags for the view. Pure."""
    texture = next((tex for slot, _n, tex in material.maps if slot == "txDiffuse"), None)
    ambient, diffuse = _prop(material, "ksAmbient", 0.5), _prop(material, "ksDiffuse", 0.5)
    result = {"name": material.name, "shader": material.shader, "texture": texture,
              "bright": ambient + diffuse, "ambient": ambient, "diffuse": diffuse,
              "specular": _prop(material, "ksSpecular", 0.), "specular_exp": _prop(material, "ksSpecularEXP", 1.),
              "alpha_ref": _prop(material, "ksAlphaRef", 0.5) if material.alpha_tested else 0.0,
              "blend": bool(material.blend)}
    if material.shader == "ksPerPixel_dual_layer":
        maps = {slot: tex for slot, _n, tex in material.maps}
        scale = _prop(material, "uvMult", 1.)
        if texture and maps.get("txLayer1") and maps.get("txLayer1_Mask") and math.isfinite(scale) and scale > 0:
            result["dual_layer"] = {"base": maps["txLayer1"], "mask": maps["txLayer1_Mask"], "scale": scale}
    elif material.shader == "ksMultilayer":
        maps = {slot: tex for slot, _n, tex in material.maps}
        scale = _prop(material, "multR", 1.)
        if (texture == groundmaterial.WHITE and maps.get("txMask") == groundmaterial.MASK and maps.get("txDetailR")
                and _prop(material, "magicMult", 1.) == 1 and math.isfinite(scale) and scale > 0):
            result.update(texture=maps["txDetailR"], world_scale=[scale, scale])
    elif material.shader in (groundmaterial.NM4, "ksMultilayer_objsp"):
        maps = {slot: tex for slot, _n, tex in material.maps}
        extent = _mask_extent(material)
        # (painted: its tile image in A at the mask canvas's UVs; generated classic ground has a white A, drawn as its image)
        if maps.get("txDetailA") and maps["txDetailA"] != groundmaterial.WHITE and maps.get("txMask"):
            images = []
            for channel in "RGB":
                filename = maps.get("txDetail" + channel)
                if filename and filename != groundmaterial.WHITE:
                    scale = next((list(p[2]) for p in material.props if p[0] == "mult" + channel), [1., 1.])
                    images.append({"name": filename, "scale": [v/e for v,e in zip(scale,extent)], "channel": "RGB".index(channel),
                                   "variation": _prop(material, "m2lVariation" + channel, 0) == 1})
            result.update(texture=maps["txDetailA"], splat={"base": {"name": maps["txDetailA"]},
                          "mask": {"name": maps["txMask"], "linear": True}, "images": images, "origin": [0, 0],
                          "mask_extent": extent, "mask_origin": [0,0], "base_scale": [base_scale(material)] * 2})
    return result


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
        if materials[m["material"]].name == ATLAS_MATERIAL and "_copy_" not in m["name"]:
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
    path, _s, revision = _scanned(ac, name)
    from app import trackedits
    _path, s, listed = trackedits.context(ac, name, revision)
    from app import tracknative
    first = _first_faces(s["meshes"], s["materials"])
    native_sources=tracknative.inherited(ac,name,path).get('render_sources',{})
    meshes = [{"i": i, "name": m["name"], "material": m["material"], "vertices": m["vertices"], "indices": m["indices"],
               "lod_in": m["lod_in"], "lod_out": m["lod_out"], "center": m["center"], "radius": m["radius"],
               "first_face": first.get(i), "base": _base(m["name"]) if i in first else None, "copy": bool(m.get("copy")),
               **({"model": m["model"]} if m.get("model") else {})}
              for i, m in enumerate(s["meshes"]) if (m["renderable"] or native_sources.get(m['name'])) and not m["name"].startswith(tracknative.PREFIX)]
    anchor, route = _route(os.path.dirname(kn5_path(ac, name)))      # (the track's own: a source holds only the kn5 and its list)
    facts = editorinfo.manifest(path)
    from app import trackpaint
    paint_errors = []
    try:
        painted = {t["i"]: t for t in trackpaint.descriptors(ac, name, revision, s.get("paints", []), errors=paint_errors)}
    except (ValueError, OSError) as error:
        paint_errors.append(str(error))
        painted = {}
    materials = [_material(m) for m in s["materials"]]
    from app import trackdetail
    try:
        context = trackdetail.retained_context(ac, name, path) if any("splat" in m for m in materials) else None
        for material in materials:
            if "splat" in material:
                material["splat"] = trackdetail.retained_layers(ac, name, path, material["name"], material["splat"], context)
    except (ValueError, OSError) as error:
        paint_errors.append(str(error))
    masks = {m["dual_layer"]["mask"] for m in materials if "dual_layer" in m}
    masks.update(m["splat"]["mask"]["name"] for m in materials if "splat" in m)
    for descriptor in painted.values():
        if "layers" in descriptor:
            for i in descriptor["materials"]:
                materials[i] = {**materials[i], "splat": descriptor["layers"], "source": materials[i]}
    from app import trackmodels
    edits = trackedits.load(ac, name) if s.get("models") else {}
    return {"revision": revision, "meshes": meshes, "materials": materials,
            "textures": [{"name": t[0], "size": t[2], "source_size": t[2], **({"linear": True} if t[0] in masks else {}),
                          **{k: v for k, v in painted.get(i, {}).items() if k != "i"}}
                         for i, t in enumerate(s["textures"])], "paints": s.get("paints", []), "paint_errors": list(dict.fromkeys(paint_errors)), "start": _start(s["points"].get(START)),
            "anchor": anchor, "route": route, "atlas": _atlas(), "objects": _view_objects(listed), "draft": s.get("draft", 0),
            "copy_revision": s.get("copy_key", ""), "surface_tiles": facts["tiles"] if facts else [],
            "surface_unprepared": surfaceindex.unprepared(path) if facts else 0,
            "models": s.get("models", []), "model_assets": s.get("model_assets", {}),
            "model_replacements": s.get("model_replacements", []),
            "treefx": len((treefx_of(path) or {}).get("trees", {})),
            "model_matrices": trackmodels.view_matrices(s, edits.get("placed", []), edits.get("heights", []))}


def sprites():
    """The names of the billboards' sorts (scenery.trees)."""
    return _atlas()["sprites"]


def _view_objects(objects):
    """The picking index omits original model parameters: they stay on disk until an editing tool needs them. Pure."""
    return {key: {k: value for k, value in entry.items() if k != "details"} for key, entry in objects.items()}


def _surface_tile(scan, mesh):
    if not 0 <= mesh < len(scan["meshes"]):
        raise ValueError("No ground mesh at this point")
    match = re.fullmatch(r"1(?:ROAD|GRASS|GRAVEL)_ground_(-?\d+)_(-?\d+)(?:_\d+)?", scan["meshes"][mesh]["name"])
    if not match:
        raise ValueError("Select a painted ground surface")
    return int(match[1]), int(match[2])


def prepare_surface(ac, name, mesh, revision):
    """Prepare loaded ground tiles' material regions, of mesh: a ground mesh's number or a list of them (the page sends those
    loaded since its last request: several are made on several processes, surfaceindex.prepare); files survive restarts and
    saved-source copies."""
    path, scan, current = _scanned(ac, name)
    if current != revision:
        raise Unreadable("The track changed")
    tiles = dict.fromkeys("{}_{}".format(*_surface_tile(scan, m)) for m in (mesh if isinstance(mesh, list) else [mesh]))
    result = surfaceindex.prepare(path, list(tiles))
    if _revision(os.stat(path)) != revision:
        raise Unreadable("The track changed while selection was being prepared")
    return result


def surface(ac, name, mesh, u, v, revision, whole=False):
    """A connected ground region or all matching prepared regions, from the source's lossless build facts."""
    path, _scan, _current = _scanned(ac, name)
    result = surfaceindex._with_masks(path, surface_region(ac, name, mesh, u, v, revision, whole))
    if _revision(os.stat(path)) != revision:
        raise Unreadable("The track changed while the surface was being selected")
    return result


def surface_region(ac, name, mesh, u, v, revision, whole=False):
    """What surface selects, without its masks (surfaceindex.regions): their tiles, read a portion at a time by Apply."""
    path, scan, current = _scanned(ac, name)
    if current != revision:
        raise Unreadable("The track changed")
    tx, ty = _surface_tile(scan, mesh)
    u, v = material_uv(scan["materials"][scan["meshes"][mesh]["material"]], tx, ty, float(u), float(v))
    # kn5 UV v is negated by the writer; the masks use ordinary north-pointing v.
    result = surfaceindex.regions(path, tx, ty, float(u), -float(v), whole)
    if _revision(os.stat(path)) != revision:
        raise Unreadable("The track changed while the surface was being selected")
    return result


def surfaces(ac, name, points, revision):
    """An additive selection of prepared ground regions, all belonging to the same served source."""
    if not isinstance(points, list) or not 1 <= len(points) <= 64 or not all(isinstance(p, dict) for p in points):
        raise ValueError("Select at most 64 ground regions")
    results = [surface(ac, name, int(p["mesh"]), float(p["u"]), float(p["v"]), revision, bool(p.get("whole"))) for p in points]
    return surfaceindex.merge(results)


def objects(ac, name):
    """The build's list of the track's single objects (track.objectlist): {a tile: {"kinds", "sorts" (not in older builds'), "at",
    "parents", "faces"}}; empty for a track built before it, or when the list isn't of this state of the kn5. Of the served kn5."""
    from app import trackedits
    _path, _s, revision = _scanned(ac, name)
    return trackedits.context(ac, name, revision)[2]


def copy_index(ac, name):
    """Only generated mesh metadata and copied object lists: a copy change need not resend a long track's source index."""
    from app import trackedits
    _path, _scan, revision = _scanned(ac, name)
    _path, scan, listed = trackedits.context(ac, name, revision)
    meshes = [{"i": i, "name": m["name"], "material": m["material"], "vertices": m["vertices"], "indices": m["indices"],
               "lod_in": m["lod_in"], "lod_out": m["lod_out"], "center": m["center"], "radius": m["radius"],
               "first_face": None, "base": None, "copy": True}
              for i, m in enumerate(scan["meshes"]) if m.get("copy") and m["renderable"]]
    return {"revision": revision, "draft": scan.get("draft", 0), "copy_revision": scan.get("copy_key", ""), "meshes": meshes,
            "objects": _view_objects({key: value for key, value in listed.items() if key.startswith("copy_")})}


@functools.lru_cache(maxsize=2)
def _list_read(list_path, kn5_state, _list_state):
    """(the object list in the file, its TreeFX section or None), if it is of that state of its kn5; else ({}, None). Not to be
    changed: the next one asking gets the same."""
    try:
        with open(list_path, encoding="utf-8") as f:
            d = json.load(f)
        fits = d["schema"] == objectlist.SCHEMA and d["kn5"] == kn5_state and objectlist.well_formed(d["objects"])
        trees = d.get("treefx")
        return (d["objects"], trees if objectlist.treefx_well_formed(trees) else None) if fits else ({}, None)
    except (OSError, ValueError, KeyError, TypeError):
        return {}, None


def _listed(path):
    """_list_read of the list beside the kn5 at path."""
    list_path = os.path.join(os.path.dirname(path), objectlist.FILE)
    try:
        return _list_read(list_path, objectlist.state_of(path), objectlist.state_of(list_path))
    except OSError:
        return {}, None


def list_of(path):
    """The object list beside the kn5 at path, if it is of that state of the file; else {}. Read once per state: each stroke of the brush
    asks, and a long track's list is large."""
    return _listed(path)[0]


def treefx_of(path):
    """The TreeFX section of the object list beside the kn5 at path ({"next", "trees"}, track.objectlist), None for none: a track
    built without TreeFX, a list of another state of the file, or a section not well formed."""
    return _listed(path)[1]


def treefx(ac, name):
    """The TreeFX trees of the track name, the served list's and those its draft adds (app.tracktrees), as the page draws them:
    "ids" in the order of their numbers, "models" (names, sorted) and per tree its "model" among them, "pos" where the draft puts
    it, "base" where the list has it, flat x, y, z, and "angle", "size", "width" as the draft leaves them; "next" the first number
    never given. What the draft deletes is in it: the page leaves it out, as it does other objects."""
    from app import trackedits, tracktrees
    path, _s, revision = _scanned(ac, name)
    draft = trackedits.load(ac, name)
    base = tracktrees.trees_of(treefx_of(path), draft["trees"])
    now = tracktrees.now(base, draft["placed"], draft["heights"])
    models = sorted({t["model"] for t in base.values()})
    return {"revision": revision, "draft": draft["revision"], "next": draft["trees_next"], "ids": list(base), "models": models,
            "model": [models.index(t["model"]) for t in base.values()], "pos": [v for t in now.values() for v in t["pos"]],
            "base": [v for t in base.values() for v in t["pos"]], **{k: [t[k] for t in now.values()] for k in ("angle", "size", "width")}}


MODEL_NAME = re.compile(r"[a-z0-9_]+")


@functools.lru_cache(maxsize=8)
def _tree_read(path, _revision_of_file):
    from scenery import treefx      # (only here: needs the engine's path from generator)
    return treefx.read_bin(path)


def _tree_model(ac, name, model):
    """A TreeFX model of the track name as its own folder holds it (extension/trees/<model>.bin: scenery.treefx.read_bin), not as
    this Map2Lap would make it now: the trees AC shows are the file's. NotOurs for no such file."""
    if not (isinstance(model, str) and MODEL_NAME.fullmatch(model)):
        raise NotOurs(model)
    path = os.path.join(os.path.dirname(kn5_path(ac, name)), "extension", "trees", model + ".bin")
    try:
        return _tree_read(path, _revision(os.stat(path)))
    except (OSError, ValueError) as e:
        raise NotOurs(model) from e


def treefx_model(ac, name, model):
    """A TreeFX model of the track for the page: its "height" and "width" in m, its "lods" finest first, each its "distance" and
    "parts": texture names ("diffuse", "normal_map"), "indices", flat "pos" (m from its foot at size 1), "normals" and "uv"."""
    tree = _tree_model(ac, name, model)
    return {"height": tree["height"], "width": tree["width"],
            "lods": [{"distance": lod["distance"], "parts": [
                {"diffuse": p["diffuse"], "normal_map": p["normal_map"], "indices": p["indices"].tolist(),
                 "pos": np.round(p["pos"], 4).ravel().tolist(), "normals": np.round(p["normals"], 3).ravel().tolist(),
                 "uv": np.round(p["uv"], 5).ravel().tolist()} for p in lod["parts"]]} for lod in tree["lods"]]}


def treefx_texture(ac, name, model, texture):
    """The bytes of a texture of a TreeFX model of the track (PNG, as the .bin holds it). NotOurs for one it doesn't use."""
    textures = _tree_model(ac, name, model)["textures"]
    if texture not in textures:
        raise NotOurs(texture)
    return textures[texture]


def _billboard_kind(base):
    """Tree or bush by its mesh's name (make_obj). Pure."""
    return "bush" if "_trees_bush_" in base or base.startswith("nocol_bush_") else "tree"


def deletable(ac, name):
    """(the kn5's revision, {what an id starts with: (how many single objects it holds, their kind or a list of each one's)}, the
    sorts of listed objects that can go all at once): the build's list, and the billboards, which are told apart by their count of
    triangles on any track."""
    from app import trackedits
    _path, _s, revision = _scanned(ac, name)
    path, s, listed = trackedits.context(ac, name, revision)
    counts, sorts = counts_of(s, listed, treefx_of(path))
    return revision, counts, sorts


def counts_of(s, listed, trees=None):
    """Objects in a scan and its list, counted billboards first, authoritative listed ids last; the sorts include the models of the
    TreeFX trees (trees: the list's section, None for none), whose ids app.tracktrees checks. Pure."""
    faces = {}
    for m in s["meshes"]:
        if s["materials"][m["material"]].name == ATLAS_MATERIAL and "_copy_" not in m["name"]:
            faces[_base(m["name"])] = faces.get(_base(m["name"]), 0) + m["indices"] // 3
    counts = {base: (n // FACES_PER_BILLBOARD, _billboard_kind(base)) for base, n in faces.items()}
    counts.update({base: (len(o["at"]), o["kinds"]) for base, o in listed.items()})
    return counts, objectlist.all_sorts(listed, trees)


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


def mesh_bytes(ac, name, i, revision, moved=None, draft=None, copy_revision=None):
    """Mesh i of the scan as in the file: its vertices (kn5.VERTEX), the index count (int32), its indices (uint16). moved: a kn5.Moved
    its vertices are as it says."""
    from app import trackedits
    path, s, _objects = trackedits.context(ac, name, revision)
    if copy_revision is not None and copy_revision != s.get("copy_key", ""):
        raise CopiesChanged("The copied objects changed")
    # Generated model numbers can disappear or be reused after an edit; check before indexing the new layout.
    if copy_revision is None and draft is not None and draft != s.get("draft"):
        raise ModelsChanged("The model objects changed")
    m = s["meshes"][i]
    from track import groundnormals
    patch=groundnormals.patches(path).get(i) if groundnormals.GROUND.fullmatch(m['name']) else None
    if "data" in m:
        vertices, faces = m["data"]
        data = vertices.tobytes() + struct.pack("<i", faces.size) + faces.tobytes()
    else:
        data = _read(path, m["offset"], m["vertices"] * VERTEX_BYTES + 4 + m["indices"] * 2, revision)
    extent = _mask_extent(s['materials'][m['material']])
    if moved and i in moved.vertices or extent != [1.,1.] or patch is not None:
        import numpy as np
        vertices = moved.vertices[i] if moved and i in moved.vertices else np.frombuffer(data,kn5.VERTEX,m['vertices'])
        if not (moved and i in moved.vertices):vertices=groundnormals.apply(vertices,patch)
        if extent != [1.,1.]:
            vertices=vertices.copy(); vertices['uv'] *= extent
        return vertices.tobytes() + data[m["vertices"] * VERTEX_BYTES:]
    return data


GLOW_FILE = re.compile(r"glow_(?:fac|shp|off)_[0-2]\.png")


def glow_bytes(ac, name, file):
    """A window mask of a track (scenery.facades.write_glow) as a PNG at half its size, enough for the Editor's view; None for a
    track built before them."""
    if not GLOW_FILE.fullmatch(file):
        raise ValueError(f"Not a window mask: {file}")
    path = os.path.join(ac, "content", "tracks", name, "extension", file)
    if not os.path.exists(path):
        return None
    from PIL import Image
    with Image.open(path) as image:
        small = image.resize((image.width // 2, image.height // 2), Image.BOX)
    out = io.BytesIO()
    small.save(out, "PNG")
    return out.getvalue()


def texture_bytes(ac, name, i, revision, version="", side=None):
    """Texture i as in the file: (its name, the image file's bytes: .dds, .png or .jpg). A draft model's is made now, at most side
    pixels when given."""
    from app import trackedits
    path, s, _objects = trackedits.context(ac, name, revision)
    tex, offset, size = s["textures"][i]
    if tex in s.get("model_textures", {}):
        from app import trackmodels
        return tex, trackmodels.image(ac, name, s["model_textures"][tex], side)
    if version:
        from app import trackpaint
        return tex, trackpaint.texture(ac, name, i, revision, version)
    raw = _read(path, offset, size, revision)
    if tex not in _masks(s["materials"]):
        return tex, raw         # (a BC7 tile image too: the page draws it as BPTC, as AC does)
    from track.textures import browser_weights
    return tex, browser_weights(raw)     # (a saved BC7 mask: the page takes masks as lossless RGBA8 weights)


def _masks(materials):
    """The names of the textures the materials use as weight masks. Pure."""
    return {tex for m in materials for slot, _n, tex in m.maps if slot in ("txMask", "txLayer1_Mask")}
