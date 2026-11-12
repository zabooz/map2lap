"""What the Editor tab changed on a built track, its draft: the objects it leaves out, single or all of a sort, the objects it places anew
(placement, trackplace), the height changes it makes (trackheights), the road verge it leaves out by its triangles (tracksurfaces) and
the TreeFX trees it adds (tracktrees: "trees", "trees_next"). It lies in out/edits, so nothing of a track's folder changes
until Save writes it (trackcopy), and holds for one state of the kn5 the Editor shows (trackview.served, "base"): an object's id is its
number in that file, its position only a check for later. Built again, the list stays but is not applied: the numbers may mean other
trees now, and a neighbour must never go in the place of the one that was picked. No file: the track's recipe, what its last Save was
made of, while that counts (trackview.recipe); a saved empty list stays empty.
"""
import json
import math
import os
import re
import secrets
import tempfile
import threading

import numpy as np

from app import (mytracks, placement, trackcopies, trackdetail, trackheights, trackmodels, tracknative, trackpaint, trackplace, tracksurfaces,
                 tracktrees, trackview, trackwalls)
from track import groundmaterial, objectlist

SCHEMA = 2
MAX_BYTES = 16 * 1024 * 1024        # about 150,000 objects: far more than anyone clicks away, far less than fills the memory
NAME = re.compile(r"[a-z0-9_]+")    # (generator.slug's names; another name is refused, not turned into one of them)
ID = re.compile(r"([\w-]+)#(\d+)")
MAX_ID, MAX_UNANSWERED = 64, 64
_saving = threading.Lock()          # (the server answers in threads: reading the revision and writing belong together)
_now_lock, _now = threading.Lock(), {}      # (moved_now's last answer)
_context_lock, _context_cache = threading.RLock(), {}  # one validated draft/scan, shared by thousands of mesh GETs
_meshes_of = {}                     # (remember_meshes: a height change's id and the placements it was made under: the meshes it moves)
MAX_REMEMBERED = 4096               # (more than a day's strokes; forgotten, they are reckoned again)
_reckoned_lock, _reckoned = threading.Lock(), {}    # (_changed: the drafts' states reckoned last, by what they hold; _heights_and_moved holds _now_lock)
RECKONED = 3                        # (a smoothing's draft without its change and with it, and the one before: each a kn5.Moved, of a large stroke many MB)


class Invalid(Exception):
    """What the page sent can't be a track's edits."""


class Conflict(Exception):
    """The track or its list changed since the page read them: another tab, or a build."""


def path_of(name):
    """Where the draft of the track name lies. Pure."""
    return os.path.join(mytracks.ROOT, "out", "edits", name + ".json")


def _file(ac, name):
    """The draft's path for a track of ours called name; a name that can't be one is refused, not turned into one."""
    if not NAME.fullmatch(name):
        raise trackview.NotOurs(name)
    trackview.kn5_path(ac, name)
    return path_of(name)


def clear(name, revision=None):
    """The track's draft file is gone: the track is deleted, or a copy took its changes (it is its recipe again). revision: only if
    it is still that one: a tab may have saved a newer one since."""
    if not NAME.fullmatch(name):
        return
    with _saving:
        if os.path.exists(path_of(name)) and revision in (None, _stored(path_of(name))["revision"]):
            os.remove(path_of(name))


def changes(ac, name):
    """How many changes the track's draft holds that its last Save doesn't, whichever build they are of."""
    if not NAME.fullmatch(name):
        return 0
    try:
        saved = trackview.recipe(ac, name)
    except trackview.NotOurs:
        saved = None
    s = _stored(path_of(name), saved)
    if s.get("broken"):
        return 1
    if not saved or s["base"] != saved["base"]:
        return _count(s)
    return sum(len(set(a) ^ set(b)) for a, b in zip(_parts(s), _parts(saved))) + int(_needs_material_save(saved))


def _needs_material_save(saved):
    """Whether saved paint operations still use an older native material layout, region copies of an older geometry
    (tracknative.GEOMETRY_CACHE_VERSION; before 2 they left a slit at the tile edges, recorded since) or another ground
    shader (groundmaterial.GROUND_FORMAT; before 3 fuPBR, recorded as pbr_format). Pure."""
    return bool(saved.get("paints")) and (saved.get("detail_profile") != trackdetail.PROFILE
                                          or saved.get("region_geometry", 1) != tracknative.GEOMETRY_CACHE_VERSION
                                          or saved.get("ground_format", 1) != groundmaterial.GROUND_FORMAT)


def _placements(stored):
    """A list's placements, each by all it holds. Pure."""
    return [tuple(p[k] for k in ("id",) + placement.FIELDS) for p in stored.get("placed", ())]


def _parts(stored):
    """A list's ids, sorts, height changes and placements, by all they hold. Pure."""
    return ([d["id"] for d in stored["deleted"]], stored.get("object_sorts", ()),
            [(h["id"], h["x"], h["z"], h["nx"], h["nz"], tuple(h["mm"])) for h in stored.get("heights", ())], _placements(stored),
            [json.dumps(c, sort_keys=True) for c in stored.get("copies", ())], list(enumerate(stored.get("paints", ()))),
            [json.dumps(m, sort_keys=True) for m in stored.get("models", ())],
            [json.dumps(x, sort_keys=True) for x in stored.get("surfaces", ())], [json.dumps(t, sort_keys=True) for t in stored.get("trees", ())],
            [json.dumps(w, sort_keys=True) for w in stored.get("walls", ())])


def _count(stored):
    """How many changes a list holds: each object, each sort, each height change, each object placed. Pure."""
    return (len(stored["deleted"]) + len(stored.get("object_sorts", ())) + len(stored.get("heights", ()))
            + len(stored.get("placed", ())) + len(stored.get("copies", ())) + len(stored.get("paints", ())) + len(stored.get("models", ()))
            + len(stored.get("surfaces", ())) + len(stored.get("trees", ())) + len(stored.get("walls", ())))


def _names(value):
    """Whether a list's part is a list of names. Pure."""
    return isinstance(value, list) and all(isinstance(x, str) for x in value)


def _well_formed(d):
    """Whether what was read from a draft's file is one, to its last part: a file cut or edited by hand is no list to act on. Pure."""
    return (isinstance(d, dict) and d.get("schema") in (1, SCHEMA) and type(d.get("revision")) is int
            and "base" in d and isinstance(d["base"], (str, type(None))) and isinstance(d.get("deleted"), list)
            and all(isinstance(i, dict) and isinstance(i.get("id"), str) and isinstance(i.get("position"), list) for i in d["deleted"])
            and _names(d.get("object_sorts", []))
            and trackheights.problems(d.get("heights", [])) is None and placement.problems(d.get("placed", [])) is None
            and trackcopies.problems(d.get("copies", [])) is None and trackpaint.problems(d.get("paints", [])) is None
            and trackmodels.problems(d.get("models", [])) is None and tracksurfaces.problems(d.get("surfaces", [])) is None
            and trackwalls.problems(d.get("walls", [])) is None
            and isinstance(d.get("trees", []), list) and all(isinstance(t, dict) and tracktrees.number(t.get("id")) is not None
                                                             for t in d.get("trees", []))
            and type(d.get("trees_next", 0)) is int)


def _stored(path, saved=None):
    """The list in the file: {"base", "revision", "deleted", "object_sorts", "heights", "placed"}. None there: the recipe saved, or an
    empty one.
    Not readable as a list: an empty one that says "broken", it is not overwritten without being asked."""
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        if _well_formed(d):
            return d
    except FileNotFoundError:
        if saved:
            if (trackheights.problems(saved.get("heights", [])) or placement.problems(saved.get("placed", []))
                    or trackcopies.problems(saved.get("copies", [])) or trackpaint.problems(saved.get("paints", []))
                    or trackmodels.problems(saved.get("models", [])) or tracksurfaces.problems(saved.get("surfaces", []))
                    or trackwalls.problems(saved.get("walls", []))):
                return {"base": None, "revision": 0, "deleted": [], "broken": True}
            return {"base": saved["base"], "revision": 0, "deleted": saved["deleted"],
                    "object_sorts": saved["object_sorts"], "heights": saved.get("heights", []), "placed": saved.get("placed", []), "copies": saved.get("copies", []), "paints": saved.get("paints", []), "models": saved.get("models", []),
                    "surfaces": saved.get("surfaces", []), "trees": saved.get("trees", []), "trees_next": saved.get("trees_next", 0),
                    "walls": saved.get("walls", [])}
        return {"base": None, "revision": 0, "deleted": []}
    except (ValueError, KeyError, TypeError):
        pass
    return {"base": None, "revision": 0, "deleted": [], "broken": True}


def _old(stored, revision):
    """How many changes in a list don't hold for the kn5 in this revision. Pure."""
    if stored.get("broken"):
        return 1
    return 0 if stored["base"] == revision else _count(stored)


def load(ac, name):
    """The list for the page: "base" the served kn5's revision now, "revision" to send back with a save, "deleted", "object_sorts"
    (of listed objects and of TreeFX trees' models), "heights" and "placed" what holds for it, "outdated" how many changes don't, "saved"
    what the last Save was made of while that counts (the page tells by it whether the track is as the list: "at", the ids and sorts, the
    height changes' ids, the placements), else None; "trees" the TreeFX trees it adds, "trees_next" the first number never given to one."""
    path = _file(ac, name)
    revision = trackview.deletable(ac, name)[0]
    saved = trackview.recipe(ac, name)
    s = _stored(path, saved)
    same = s["base"] == revision
    trees = s.get("trees", []) if same else []
    return {"base": revision, "revision": s["revision"], "deleted": s["deleted"] if same else [],
            "object_sorts": s.get("object_sorts", []) if same else [],
            "heights": s.get("heights", []) if same else [], "placed": s.get("placed", []) if same else [], "copies": s.get("copies", []) if same else [], "paints": s.get("paints", []) if same else [],
            "models": s.get("models", []) if same else [], "surfaces": s.get("surfaces", []) if same else [], "trees": trees,
            "walls": s.get("walls", []) if same else [],
            "trees_next": tracktrees.next_of(trackview.treefx_of(trackview.served(ac, name)[0]), trees, s.get("trees_next", 0) if same else 0),
            "outdated": _old(s, revision), "saved": saved and {
                "at": saved["saved"], "needs_save": _needs_material_save(saved), "deleted": [d["id"] for d in saved["deleted"]],
                "object_sorts": saved["object_sorts"],
                "heights": [h["id"] for h in saved.get("heights", [])] if not s.get("broken") else [],
                "placed": saved.get("placed", []) if not s.get("broken") else [], "copies": saved.get("copies", []) if not s.get("broken") else [],
                "paints": saved.get("paints", []) if not s.get("broken") else [], "models": saved.get("models", []) if not s.get("broken") else [],
                "surfaces": saved.get("surfaces", []) if not s.get("broken") else [],
                "trees": saved.get("trees", []) if not s.get("broken") else [],
                "walls": saved.get("walls", []) if not s.get("broken") else []}}


def saved_edits(ac, name):
    """Read the last Save's complete edits only when Discard needs them; never read or alter the current draft."""
    _file(ac, name)
    revision = trackview.deletable(ac, name)[0]
    saved = trackview.recipe(ac, name)
    if saved and saved["base"] != revision:
        raise Conflict("The saved track changed; read it again")
    return {"base": revision, **{key: (saved or {}).get(key, []) for key in
            ("deleted", "object_sorts", "heights", "placed", "copies", "paints", "models", "surfaces", "trees", "walls")}}


def context(ac, name, revision, copies=None, models=None, walls=None):
    """The source path, scan and list extended by the copies of this draft (or the explicit list)."""
    path, scan = trackview._scan_of(ac, name, revision)
    if copies is not None or models is not None or walls is not None:
        stored = _stored(_file(ac, name), trackview.recipe(ac, name))
        copies = copies if copies is not None else stored.get("copies", []) if stored["base"] == revision else []
        models = models if models is not None else stored.get("models", []) if stored["base"] == revision else []
        extended, objects = trackcopies.build(path, scan, trackview.list_of(path), copies)
        walls = walls if walls is not None else stored.get("walls", []) if stored["base"] == revision else []
        extended, objects = trackwalls.extend(path, extended, objects, walls, {w["material"]: trackwalls.asset(ac, name, w["material"]) for w in walls if w["material"]})
        extended, objects = trackmodels.extend(ac, name, {**extended, "model_source_path": path, "model_source_revision": revision}, objects, models)
        return path, extended, objects
    with _context_lock:
        key = _context_key(ac, name, path, revision)
        if _context_cache.get("key") == key:
            return _context_cache["value"]
        stored = _stored(_file(ac, name), trackview.recipe(ac, name))
        copies = stored.get("copies", []) if stored["base"] == revision else []
        extended, objects = trackcopies.build(path, scan, trackview.list_of(path), copies)
        walls = stored.get("walls", []) if stored["base"] == revision else []
        extended, objects = trackwalls.extend(path, extended, objects, walls, {w["material"]: trackwalls.asset(ac, name, w["material"]) for w in walls if w["material"]})
        extended, objects = trackmodels.extend(ac, name, {**extended, "model_source_path": path, "model_source_revision": revision}, objects, stored.get("models", []) if stored["base"] == revision else [])
        value = path, {**extended, "draft": stored["revision"], "paints": stored.get("paints", []) if stored["base"] == revision else []}, objects
        # An atomic save may have replaced the draft while its geometry was generated. Never cache it under the old stat.
        if key == _context_key(ac, name, path, revision):
            _context_cache.update(key=key, value=value)
        return value


def _context_key(ac, name, path, revision):
    """What a context holds for: its source and revision, and the state of the draft, the track's info and the object list."""
    info = os.path.join(os.path.dirname(trackview.kn5_path(ac, name)), mytracks.FILE)
    return path, revision, _stamp(_file(ac, name)), _stamp(info), _stamp(os.path.join(os.path.dirname(path), objectlist.FILE))


def _stamp(path):
    """A file's identity, modification time and size; None when it is absent."""
    try:
        st = os.stat(path)
        return st.st_ino, st.st_mtime_ns, st.st_size
    except OSError:
        return None


def grounded(ac, name, body):
    """Correct a terrain-following drag for the height field that Save applies after placement; do not apply it twice."""
    if not isinstance(body, dict):
        raise Invalid("No move request")
    with _saving:
        now = load(ac, name)
        if body.get("base") != now["base"] or body.get("revision") != now["revision"] or now["outdated"]:
            raise Conflict(name)
        path, scan, objects = context(ac, name, now["base"])
        counts, _sorts = trackview.counts_of(scan, objects)
        trees = tracktrees.Trees(trackview.treefx_of(path), now["trees"])
        placed = _checked_placed(body.get("placed"), counts, trees)
        previous = {p["id"]: p for p in now["placed"]}
        field, out = trackheights.Field(now["heights"]), []
        with open(path, "rb") as f:
            for p in placed:
                old = previous.get(p["id"], {"x": 0, "z": 0})
                x, _, z = trees.get(p["id"])["pos"] if p["id"] in trees else trackcopies._source(f, scan, objects, p["id"])["at"]
                delta = float(field.at(x + p["x"], z + p["z"])[0] - field.at(x + old["x"], z + old["z"])[0])
                out.append({**p, "y": round(max(-placement.MAX_RAISE_M, min(placement.MAX_RAISE_M, p["y"] - delta)), 3)})
        return {"placed": out}


def copy_template(ac, name, body):
    """Snapshot an object's current placement for repeat copying; refuse an obsolete draft or a hidden object."""
    if not isinstance(body, dict):
        raise Invalid("No copy request")
    with _saving:
        now = load(ac, name)
        if body.get("base") != now["base"] or body.get("revision") != now["revision"] or now["outdated"]:
            raise Conflict(name)
        try:
            if isinstance(body.get("template"), dict) and "model" in body["template"]:
                return trackmodels.copied(ac, name, now, body)
            imported = next((m for m in now["models"] if m["id"] + "#0" == body.get("object")), None)
            if imported is not None:
                return trackmodels.copy_template(ac, name, now, imported)
            section = trackview.treefx_of(trackview.served(ac, name)[0])
            if isinstance(body.get("template"), dict) and "tree" in body["template"]:
                return {"tree": tracktrees.copied(section, now, body["template"]["tree"], body.get("at"), body.get("pose"))}
            if tracktrees.number(body.get("object")) is not None:
                return tracktrees.template(tracktrees.Trees(section, now["trees"]), body["object"], now)
        except (ValueError, KeyError, TypeError, OSError) as error:
            raise Invalid(str(error)) from error
        path, scan = trackview._scan_of(ac, name, now["base"])
        if "template" in body:
            copied = {**body["template"], "id": "copy_" + secrets.token_hex(12)} if isinstance(body["template"], dict) else None
            point = body.get("at")
            if trackcopies.problems([copied]) or not isinstance(point, list) or len(point) != 3 or not all(type(v) in (int, float) and math.isfinite(v) for v in point):
                raise Invalid("No copy position")
            pose = body.get("pose", {"turn": 0, "y": 0, "scale": 1})
            if not isinstance(pose, dict) or placement.problem({**pose, "id": "copy#0", "x": 0, "z": 0}):
                raise Invalid("No copy turn, height or size")
            try:
                with open(path, "rb") as f:
                    at = trackcopies.foot(f, scan, trackview.list_of(path), copied["parts"])
                delta = np.array(point, np.float64) - at
                delta[1] += pose["y"] - float(trackheights.Field(now["heights"]).at(np.array([point[0]]), np.array([point[2]]))[0][0])
                transform = {**pose, "x": delta[0], "y": delta[1], "z": delta[2]}
                copied["parts"] = [{**p, "matrix": trackcopies._compose(p["matrix"], [(at, transform)])}
                                     for p in copied["parts"]]
                trackcopies.build(path, scan, trackview.list_of(path), now["copies"] + [copied])
            except ValueError as e:
                raise Invalid(str(e)) from e
            return {"copy": copied}
        wanted = body.get("object")
        if not isinstance(wanted, str) or not ID.fullmatch(wanted):
            raise Invalid("No object to copy")
        try:
            from app import trackcopy
            _path, extended, listed = context(ac, name, now["base"])
            going, omitted = trackcopy.faces_left_out(extended, listed, [d["id"] for d in now["deleted"]], now["object_sorts"])
            with open(path, "rb") as f:
                source = trackcopies._source(f, extended, listed, wanted)
            if all(going.get(i, np.zeros(extended["meshes"][i]["indices"] // 3, bool))[a:a+n].all() for i, a, n in source["faces"]):
                raise Invalid("The source object is deleted")
            template, at, kind = trackcopies.template(path, scan, trackview.list_of(path), now["copies"], now["placed"], wanted, omitted)
        except (ValueError, IndexError, KeyError) as e:
            raise Invalid(str(e)) from e
        with open(path, "rb") as f:
            foot = trackcopies.foot(f, scan, trackview.list_of(path), template["parts"])
        foot[1] += float(trackheights.Field(now["heights"]).at(at[0], at[2])[0])
        return {"template": template, "at": foot.tolist(), "kind": kind}


def _there(id_, counts, trees):
    """Whether an id is of an object there: a TreeFX tree of trees ({id: tree}), else one of counts. Pure."""
    match = ID.fullmatch(id_) if isinstance(id_, str) else None
    if not match or match[1] == objectlist.TREEFX:
        return bool(match) and id_ in trees
    return int(match[2]) < counts.get(match[1], (0,))[0]


def _checked(deleted, counts, trees=()):
    """What the page sent as deleted, only in the form the file holds: each id an object that is there (trees: the TreeFX trees by
    id), once, with a position of three finite numbers. Pure."""
    if not isinstance(deleted, list):
        raise Invalid("deleted is no list")
    out, seen = [], set()
    for item in deleted:
        if not (isinstance(item, dict) and _there(item.get("id"), counts, trees)) or item["id"] in seen:
            raise Invalid(f"no object to delete: {str(item)[:80]}")
        at = item.get("position")
        if not (isinstance(at, list) and len(at) == 3 and all(type(v) in (int, float) and math.isfinite(v) for v in at)):
            raise Invalid(f"no position: {item['id']}")
        seen.add(item["id"])
        base, number = item["id"].rsplit("#", 1)
        kind = "treefx" if item["id"] in trees else counts[base][1]
        out.append({"id": item["id"], "kind": kind[int(number)] if isinstance(kind, list) else kind,
                    "position": [round(v, 3) for v in at]})
    return out


def _checked_sorts(sorts, known, what):
    """What the page sent as whole sorts to leave out: names in known, each once. A rule, not a list of ids: a long track's trees
    or cars wouldn't fit one. what: of what, for the message. Pure."""
    if not isinstance(sorts, list) or not all(isinstance(s, str) and s in known for s in sorts) or len(set(sorts)) != len(sorts):
        raise Invalid(f"no sorts of {what}")
    return sorts


def moved_now(ac, name, revision):
    """What the placements and height changes of the track's draft move in its served kn5 in that revision (a kn5.Moved), None for
    nothing: the Editor shows each mesh as it will be, so the view and Save have one reckoning. Kept while the draft's file and the recipe
    stay as they are: a long track's 66,000 meshes each ask."""
    return _heights_and_moved(ac, name, revision)[2]


def moved_without(ac, name, revision, omit):
    """Current placements/heights excluding one active smoothing result, so adjusting it never smooths twice."""
    heights, placed, moved = _heights_and_moved(ac, name, revision)
    if omit is None:
        return moved
    if not isinstance(omit, str) or not any(h["id"] == omit for h in heights):
        raise ValueError("The smoothing operation changed: mark the road again")
    path, scan, objects = context(ac, name, revision)
    return _changed(path, scan, objects, [h for h in heights if h["id"] != omit], placed)


def _state_key(path, scan, heights, placed):
    """What a draft's kn5.Moved goes by: the kn5, its copies and models (scan), its height changes by id in their order, its placements. Pure."""
    models = json.dumps([scan.get("models", []), scan.get("model_heights", {})], sort_keys=True, default=str)
    return path, scan.get("model_source_revision"), scan.get("copy_key"), models, tuple(h["id"] for h in heights), _placed_key(placed)


def _changed(path, scan, objects, heights, placed):
    """trackplace.changed, kept for the drafts' states reckoned last: moving a smoothing's strength replaces its change, the draft without it stays
    (moved_without), and the meshes handed out once it is saved take the draft with it its request reckoned (remember_meshes). InTheWay as it."""
    scan, objects, placed = trackmodels.editor_source(scan, objects, placed)
    key = _state_key(path, scan, heights, placed)
    with _reckoned_lock:
        if key in _reckoned:
            return _reckoned[key]
    value = trackplace.changed(path, scan, objects, heights, placed)
    with _reckoned_lock:
        while len(_reckoned) >= RECKONED:
            _reckoned.pop(next(iter(_reckoned)))
        _reckoned[key] = value
    return value


def _heights_and_moved(ac, name, revision):
    """(the height changes of the track's draft for that revision, its placements, what they move), of one state of it: read apart, a save
    between them would make them disagree."""
    path, saved = _file(ac, name), trackview.recipe(ac, name)
    try:
        st = os.stat(path)
        state = (st.st_mtime_ns, st.st_size)
    except OSError:
        state = None
    key = (name, revision, state, saved and saved["kn5"])
    with _now_lock:
        if _now.get("key") != key:
            s = _stored(path, saved)
            heights = s.get("heights", []) if s["base"] == revision else []
            placed = s.get("placed", []) if s["base"] == revision else []
            _now.update(key=key, heights=heights, placed=placed, moved=_moved_or_none(ac, name, revision, heights, placed))
        return _now["heights"], _now["placed"], _now["moved"]


def preview(ac, name, revision, op):
    """What a stroke under way, the height change op, changes in the meshes as they are handed out now, for the view while the mouse is
    held: little-endian uint32 and float32, so a browser reads them as they lie. Its count of meshes, then per mesh: its number, its count
    of vertices, their numbers, per vertex y and normal. Only what differs: a click's hundreds of points, not a tile's megabytes.
    InTheWay if it can't be applied. Nothing is kept."""
    heights, placed, now = _heights_and_moved(ac, name, revision)
    kn5_path, scan, objects = context(ac, name, revision)
    after = _changed(kn5_path, scan, objects, heights + [op], placed)

    def vertices_in(moved, i):
        if moved and i in moved.vertices:
            return moved.vertices[i]
        return np.frombuffer(trackview.mesh_bytes(ac, name, i, revision)[:scan["meshes"][i]["vertices"] * trackheights.kn5.VERTEX.itemsize],
                             dtype=trackheights.kn5.VERTEX)

    parts = []
    # (also what only the state now moves: a stroke that takes all of a change back leaves that mesh as in the file)
    for i in sorted(set(after.vertices) | set(now.vertices if now else ())):
        before, vertices = vertices_in(now, i), vertices_in(after, i)
        differ = np.flatnonzero((vertices["pos"][:, 1] != before["pos"][:, 1]) | (vertices["normal"] != before["normal"]).any(axis=1))
        if len(differ):
            values = np.c_[vertices["pos"][differ, 1], vertices["normal"][differ]].astype("<f4")
            parts.append(np.array([i, len(differ)], "<u4").tobytes() + differ.astype("<u4").tobytes() + values.tobytes())
    return np.array([len(parts)], "<u4").tobytes() + b"".join(parts)


def _moved_or_none(ac, name, revision, heights, placed):
    """What placed and then heights move; None for none. Heights that can't be applied: only what placed moves, Save says why."""
    if not (heights or placed):
        return None
    path, scan, objects = context(ac, name, revision)
    try:
        return _changed(path, scan, objects, heights, placed)
    except trackheights.InTheWay:
        source, listed, poses = trackmodels.editor_source(scan, objects, placed)
        return trackplace.moved(path, source, listed, poses) if poses else None


def _checked_placed(placed, counts, trees=()):
    """What the page sent as placements, if there is no problem with them: each of an object that is there (trees: the TreeFX trees
    by id), a span of wires never by itself. Pure."""
    wrong = placement.problems(placed)
    if wrong:
        raise Invalid(f"no placements: {wrong}")
    for p in placed:
        if not _there(p["id"], counts, trees):
            raise Invalid(f"no object to place: {p['id'][:80]}")
        if p["id"] in trees:
            continue
        match = ID.fullmatch(p["id"])
        kind = counts[match[1]][1]
        if (kind[int(match[2])] if isinstance(kind, list) else kind) in placement.NOT_ALONE:
            raise Invalid(f"a span goes where its poles go: {p['id']}")
    return placed


def _checked_heights(heights):
    """What the page sent as height changes, if there is no problem with them. Pure."""
    wrong = trackheights.problems(heights)
    if wrong:
        raise Invalid(f"no height changes: {wrong}")
    return heights


def _write(path, content):
    """content into the file at path, whole or not at all: a build or a crash never leaves half a list."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".map2lap_edits_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(content, f, indent=0)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temporary, path)
    except BaseException:
        os.unlink(temporary)
        raise


def _placed_key(placed):
    """The placements as a key. Pure."""
    return tuple(sorted(_placements({"placed": placed})))


def _meshes_of_height(path, scan, objects, placed, op, refuse=False):
    """The meshes the height change op moves with the objects where placed puts them, as known from before or reckoned now. refuse:
    InTheWay if it can't be applied, else it moves none."""
    key = (op["id"], trackmodels._digest(_state_key(path, scan, [], placed)))
    with _now_lock:
        known = _meshes_of.get(key)
    if known is None:
        try:
            source, listed, poses = trackmodels.editor_source(scan, objects, placed)
            known = sorted(set(trackheights.moved(path, source, placement.list_placed(listed, poses), [op],
                                                 trackplace.moved(path, source, listed, poses)).vertices)
                           | trackmodels.meshes_at_height(scan, placed, [op]))
        except trackheights.InTheWay:
            if refuse:
                raise
            known = []
        with _now_lock:
            if len(_meshes_of) > MAX_REMEMBERED:
                _meshes_of.clear()
            _meshes_of[key] = known
    return known


def remember_meshes(ac, name, revision, op, replace=None):
    """The draft with the height change op added last, in place of the change replace (a smoothing's before: the page puts it there), and the meshes op
    moves, reckoned while it is made: those otherwise with it than without it. Saving it and the meshes handed out then needn't reckon them again.
    InTheWay if it can't be applied (trackheights.moved)."""
    path, scan, objects = context(ac, name, revision)
    heights, placed, _moved = _heights_and_moved(ac, name, revision)
    others = [h for h in heights if h["id"] != replace]
    before, after = _changed(path, scan, objects, others, placed), _changed(path, scan, objects, others + [op], placed)
    both = before.vertices.keys() & after.vertices.keys()
    known = sorted((before.vertices.keys() ^ after.vertices.keys()) | {i for i in both if not _alike(before.vertices[i], after.vertices[i])}
                   | trackmodels.meshes_at_height(scan, placed, [op]))
    with _now_lock:
        if len(_meshes_of) > MAX_REMEMBERED:
            _meshes_of.clear()
        _meshes_of[(op["id"], trackmodels._digest(_state_key(path, scan, [], placed)))] = known


def _alike(a, b):
    """Whether two meshes' vertices (kn5.VERTEX) are the same where a height change moves them: heights and normals. Pure."""
    return a is b or (len(a) == len(b) and np.array_equal(a["pos"][:, 1], b["pos"][:, 1]) and np.array_equal(a["normal"], b["normal"]))


def _meshes_between(path, scan, objects, before, after):
    """The numbers of the meshes to show anew in the context (path, scan, objects) of after: what the height changes that are in only one
    of the lists before and after move, and the road lines they reach; the objects placed otherwise in the two, and what goes with them.
    before, after: {"heights", "placed"}."""
    now = {h["id"] for h in after["heights"]}
    different = ([h for h in after["heights"] if h["id"] not in {b["id"] for b in before["heights"]}]
                 + [h for h in before["heights"] if h["id"] not in now])
    placed_then, placed_now = (set(_placements({"placed": d["placed"]})) for d in (before, after))
    moving = {p[0] for p in placed_then ^ placed_now}
    copied = before.get("copies", []) != after.get("copies", []) or before.get("walls", []) != after.get("walls", [])
    modeled = before.get("models", []) != after.get("models", [])
    if not (different or moving or copied or modeled):
        return []
    out = set()
    if moving:
        out.update(trackplace.meshes_of(scan, objects, moving))
    if different:
        out.update(trackheights.lines_reached(scan, trackheights.Field(different)))
    for h in different:
        out.update(_meshes_of_height(path, scan, objects, after["placed"] if h["id"] in now else before["placed"], h))
    return ([-2] if modeled else []) + ([-1] if copied else []) + sorted(i for i in out if not copied or not scan["meshes"][i].get("copy"))


def save(ac, name, body):
    """save_telling, its new revision."""
    return save_telling(ac, name, body)["revision"]


def save_telling(ac, name, body):
    """The page's list {"base", "revision", "deleted", "object_sorts", "heights", "placed", "surfaces", "id", "unanswered"} instead
    of the one on disk, if it was made from that one and for this kn5 (else Conflict). No "heights", "placed" or "surfaces": those on disk stay. "unanswered": the ids of its saves it heard nothing back from: the last save on disk being one
    of them, the page's revision is only behind by an answer lost on the way (or a page closing with a save under way). An outdated
    or broken list goes only by an empty one, asked for. Returns {"revision": the new one, "meshes": the numbers of those it changed
    the height changes or placements of, for the view to fetch anew}."""
    if not isinstance(body, dict):
        raise Invalid("no list")
    path = _file(ac, name)
    request, unanswered = body.get("id"), body.get("unanswered") or []
    if not (isinstance(request, str) and len(request) <= MAX_ID and isinstance(unanswered, list) and len(unanswered) <= MAX_UNANSWERED):
        raise Invalid("no id")
    with _saving:
        revision, counts, listed_sorts = trackview.deletable(ac, name)
        if body.get("base") != revision:        # (first: on another build its numbers may be no objects at all)
            raise Conflict(name)
        s = _stored(path, trackview.recipe(ac, name))
        known = body.get("revision") == s["revision"] or s.get("last") in unanswered
        copies = body.get("copies", s.get("copies", []) if s["base"] == revision else [])
        models = body.get("models", s.get("models", []) if s["base"] == revision else [])
        wrong = trackmodels.problems(models)
        if wrong:
            raise Invalid(wrong)
        try:
            for asset in {model["asset"] for model in models}:
                trackmodels.resolve(ac, name, asset)
            if s["base"] == revision and models != s.get("models", []):
                trackmodels.retain(ac, name, s.get("models", []))
        except (ValueError, OSError) as error:
            raise Invalid(str(error)) from error
        wrong = trackcopies.problems(copies)
        if wrong:
            raise Invalid(wrong)
        walls = body.get("walls", s.get("walls", []) if s["base"] == revision else [])
        if wrong := trackwalls.problems(walls):
            raise Invalid(wrong)
        try:
            source, scan, objects = context(ac, name, revision, copies, models, walls)
        except ValueError as e:
            raise Invalid(str(e)) from e
        section = trackview.treefx_of(source)
        added = body["trees"] if "trees" in body else s.get("trees", []) if s["base"] == revision else []
        wrong = tracktrees.problem(added, section)
        if wrong:
            raise Invalid(wrong)
        trees = tracktrees.Trees(section, added)
        given = body.get("trees_next", 0)
        trees_next = tracktrees.next_of(section, added, max(given if type(given) is int else 0, s.get("trees_next", 0) if s["base"] == revision else 0))
        counts, listed_sorts = trackview.counts_of(scan, objects, section)
        deleted = _checked(body.get("deleted"), counts, trees)
        object_sorts = _checked_sorts(body.get("object_sorts") or [], listed_sorts, "objects")
        heights = _checked_heights(body["heights"]) if "heights" in body else s.get("heights", []) if s["base"] == revision else []
        placed = _checked_placed(body["placed"], counts, trees) if "placed" in body else s.get("placed", []) if s["base"] == revision else []
        try:
            surfaces = tracksurfaces.checked(body["surfaces"] if "surfaces" in body else s.get("surfaces", []) if s["base"] == revision else [], scan)
        except ValueError as error:
            raise Invalid(str(error)) from error
        previous_paints = s.get("paints", []) if s["base"] == revision else []
        paints = body.get("paints", previous_paints)
        if trackpaint.problems(paints):
            raise Invalid(trackpaint.problems(paints))
        try:
            previous_ids = set(previous_paints)
            trackpaint.validate(ac, name, revision, [p for p in paints if p not in previous_ids])
        except ValueError as error:
            raise Invalid(str(error)) from error
        if not known or ((deleted or object_sorts or heights or placed or copies or paints or models or surfaces or added or walls) and _old(s, revision)):
            raise Conflict(name)
        new = s["revision"] + 1
        # All material validation/version publication happens before committing the draft. Pixel rendering belongs to GET.
        try:
            textures = trackpaint.changed(ac, name, revision, previous_paints, paints)
        except ValueError as error:
            raise Invalid(str(error)) from error
        _write(path, {"schema": SCHEMA, "base": revision, "revision": new, "last": request, "deleted": deleted,
                      "object_sorts": object_sorts, "heights": heights, "placed": placed, "copies": copies, "paints": paints, "models": models,
                      "surfaces": surfaces, "trees": added, "trees_next": trees_next, "walls": walls})
        same = s["base"] == revision
        before = {"heights": s.get("heights", []) if same else [], "placed": s.get("placed", []) if same else [], "copies": s.get("copies", []) if same else [], "models": s.get("models", []) if same else [], "walls": s.get("walls", []) if same else []}
        # (the trees that stand otherwise now, by a placement, a height change or what is added: the page takes them as they come)
        moved_trees = tracktrees.changed(section, {**before, "trees": s.get("trees", []) if same else []},
                                         {"trees": added, "placed": placed, "heights": heights}) if section else None
        from app import modeltrees
        native_change = modeltrees.changed(ac, name, scan, before, {"models": models, "placed": placed, "heights": heights})
        if native_change:
            moved_trees = {"trees": {**(moved_trees or {}).get("trees", {}), **native_change["trees"]},
                           "gone": (moved_trees or {}).get("gone", []) + native_change["gone"]}
        # What was built to check this list is the draft now: the index reads it, and the answer below stays this save's after the lock.
        scan = {**scan, "draft": new, "paints": paints}
        with _context_lock:
            _context_cache.update(key=_context_key(ac, name, source, revision), value=(source, scan, objects))
    return {"revision": new, "meshes": _meshes_between(source, scan, objects, before, {"heights": heights, "placed": placed, "copies": copies, "models": models, "walls": walls}),
            "textures": textures, "treefx": moved_trees}


def wall_edit(ac, name, body):
    """Prepare the selected generated walls' cap height or colour texture; the page records the result as one Undo step."""
    if not isinstance(body, dict):
        raise Invalid("Select a wall")
    with _saving:
        now = load(ac, name)
        if now["outdated"] or body.get("base") != now["base"] or body.get("revision") != now["revision"]:
            raise Conflict(name)
        path, scan = trackview._scan_of(ac, name, now["base"])
        try:
            walls = trackwalls.prepare(ac, name, trackview.list_of(path), now["walls"], body.get("objects"),
                                       rise=body.get("rise"), material=body.get("material", False), reset=body.get("reset", False))
            trackwalls.extend(path, scan, trackview.list_of(path), walls,
                              {w["material"]: trackwalls.asset(ac, name, w["material"]) for w in walls if w["material"]})
            return {"walls": walls}
        except (ValueError, KeyError, TypeError, OSError) as error:
            raise Invalid(str(error)) from error


def paint(ac, name, body, progress=None):
    """Prepare one texture edit for the page's source/draft revision; the page adds its id as one undoable change.
    progress(phase, done, total): its tiles' masks taken ("masks"), then described for the preview ("preview")."""
    if not isinstance(body, dict):
        raise Invalid("Select a ground area and a material")
    with _saving:
        now = load(ac, name)
        if now["outdated"] or body.get("base") != now["base"] or body.get("revision") != now["revision"]:
            raise Conflict(name)
    try:
        id = trackpaint.create(ac, name, now["base"], body.get("material"), body.get("points"), body.get("variation"), body.get("tiles"),
                               progress, body.get("look"))
        trackpaint.descriptors(ac, name, now["base"], [*[p for p in now.get("paints", []) if p != id], id], progress=progress)
    except (ValueError, KeyError, TypeError) as error:
        raise Invalid(str(error)) from error
    return {"paint": id}


def restyle(ac, name, body):
    """Prepare texture edit body["paint"] of the draft again with other settings (body["look"], body["variation"]); the page
    puts the answer's id in its place as one undoable change."""
    if not isinstance(body, dict):
        raise Invalid("Choose a texture edit and its settings")
    with _saving:
        now = load(ac, name)
        if now["outdated"] or body.get("base") != now["base"] or body.get("revision") != now["revision"]:
            raise Conflict(name)
    if body.get("paint") not in now.get("paints", []):
        raise Invalid("This texture edit is no longer in the track; select the ground again")
    try:
        id = trackpaint.restyle(ac, name, now["base"], body["paint"], body.get("look"), body.get("variation"))
        # (as the page will have it: back to settings an edit in the draft has, that edit, once, at the old one's place)
        trackpaint.descriptors(ac, name, now["base"], [id if p == body["paint"] else p for p in now["paints"] if p != id])
    except (ValueError, KeyError, TypeError) as error:
        raise Invalid(str(error)) from error
    return {"paint": id}


def model(ac, name, body):
    """Freeze a library model and prepare its generic instance binding for one ordinary undoable draft change."""
    if not isinstance(body, dict):
        raise Invalid("Choose a model and a place")
    with _saving:
        now = load(ac, name)
        if now["outdated"] or body.get("base") != now["base"] or body.get("revision") != now["revision"]:
            raise Conflict(name)
        try:
            return trackmodels.create(ac, name, now, body)
        except (ValueError, OSError, KeyError, TypeError) as error:
            raise Invalid(str(error)) from error
