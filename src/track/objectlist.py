"""The single objects of a built track. A kn5's meshes stay merged per tile and material, as AC draws them fastest; this list says
which of their triangles make up each object, so an object can be picked and deleted. An object can lie in several meshes (a
house: its walls and roof by material, and its collision), and belong to another (a house's sign and door: deleted with it, or
alone).

make_obj notes per tile what it adds, by the triangles in the order it added them, in a file beside the tile's OBJ part. On the way
into the kn5 they get split at AC's limit of vertices per mesh, and a 1WALL mesh gets each triangle a second time turned round:
obj_to_kn5 knows where they end up, and writes the list for the whole track beside the kn5. An object's id on a track is
"<its tile's OBJ part, t_<x>_<y>>#<its number>".
"""
import json
import os
import tempfile

import numpy as np

FILE = os.path.join("data", "map2lap_objects.json")
STRICT = "MAP2LAP_STRICT"       # set (tools/check.py, tools/measure.py): a mesh problem stops the build; at a user's it is a line in the log
# Every mesh a build adds, by the first word after its AC prefix, is one of three things. A new kind of mesh has to be entered here,
# or the build says so: so nothing new lacks what the Editor needs without anyone noticing.
LISTED = {"cars", "bld", "bldcol", "props", "pylon", "wire", "rocks", "fence", "fencecol", "fuel", "signs", "pool", "play", "sport",
          "graves", "tower", "fountain"}    # single objects: make_obj says whose each triangle is
COUNTED = {"trees", "bush"}                 # single objects too, told apart by their count of triangles (trees.billboards)
TRACK = {"ground", "water", "foam", "far", "road", "walk", "walkcol", "deck", "tunnel", "rail", "railcol", "guardrail",
         "guardrailcol", "gate"}            # the track itself: nothing to delete by a click
OF_THE_TRACK = ("_sub",)                    # (a substation's fence: goes with its yard, which stays for now)
NOT_ALL = {"house"}                         # sorts never deleted all at once: a click would take a whole street
SCHEMA = 4                                  # ("sorts" can be missing, in lists of older builds: sorts_of)


def state_of(path):
    """Which state of a file this is: its time to the nanosecond and its size, so a new kn5 of the same size is another one too."""
    st = os.stat(path)
    return f"{st.st_mtime_ns}-{st.st_size}"


def kind_of(name):
    """A mesh's kind: the first word after its AC prefix, without a number. Pure."""
    return name.split("_")[1].rstrip("0123456789") if "_" in name else name


def problem(name, has_owners):
    """What is wrong with a mesh about to be added, or None: not entered above, or listed without saying whose its triangles are.
    Pure."""
    word = kind_of(name)
    if word in TRACK or word in COUNTED or any(f"{mark}_" in name for mark in OF_THE_TRACK):
        return None
    if word not in LISTED:
        return f"A mesh of a kind not known to track.objectlist: {name}"
    return None if has_owners else f"A mesh that should say whose its triangles are: {name}"


def side_file(path):
    """The file beside a tile's OBJ part or shape. Pure."""
    return os.path.splitext(path)[0] + ".objects.json"


def runs_of(owners):
    """[[owner, first triangle, how many], ...] of the triangles' owners, -1 for none. Pure."""
    owners = np.asarray(owners, np.int64)
    if not len(owners):
        return []
    starts = np.r_[0, np.flatnonzero(owners[1:] != owners[:-1]) + 1]
    ends = np.r_[starts[1:], len(owners)]
    return [[int(owners[a]), int(a), int(b - a)] for a, b in zip(starts, ends) if owners[a] >= 0]


def sorts_of(entry):
    """A tile's sort of each object: its finest name (a bench, a stop sign), what "delete all" goes by. A list without them (built
    before they were): each one's kind. Pure."""
    return entry.get("sorts") or entry["kinds"]


def all_sorts(objects):
    """The sorts that can be deleted all at once on a track: of the objects that have triangles (a saved track's own list keeps the
    numbers of what it left out, without any), but houses (one click takes a street). Pure."""
    return {sort for entry in objects.values() for sort, faces in zip(sorts_of(entry), entry["faces"]) if faces} - NOT_ALL


class TileList:
    """What make_obj notes of a tile: the objects, and per mesh it adds which triangles are whose."""

    def __init__(self):
        self.kinds, self.sorts, self.at, self.parents, self.meshes = [], [], [], [], {}
        self.spans, self.poles = {}, {}     # (a span's two ends, a pole's place: linked says which belongs to which)

    def new(self, kind, x, y, z, parent=-1, sort=None):
        """A new object at (x east, y north, z up); its number. sort: its finest name, if finer than its kind."""
        self.kinds.append(kind)
        self.sorts.append(sort or kind)
        self.at.append([round(float(x), 3), round(float(z), 3), round(float(-y), 3)])
        self.parents.append(parent)
        return len(self.kinds) - 1

    def note(self, name, owners):
        """The owner of each triangle of the mesh name, -1 for none."""
        self.meshes[name] = runs_of(owners)

    def save(self, part):
        """Beside the tile's OBJ part; no objects: no file, not even an older one."""
        path = side_file(part)
        if self.kinds:
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"kinds": self.kinds, "sorts": self.sorts, "at": self.at, "parents": self.parents, "meshes": self.meshes,
                           "spans": self.spans, "poles": self.poles}, f)
        elif os.path.exists(path):
            os.remove(path)


def load_side(path):
    """A side file's content; {} for one that isn't there."""
    try:
        with open(side_file(path), encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def parts_of(name, written):
    """What the OBJ objects of a mesh as built were written as, in order: its name, then <name>_1, <name>_2 ... (make_obj.Obj.add).
    written: {OBJ object: anything}. Pure."""
    out, k = [], 0
    while (name if k == 0 else f"{name}_{k}") in written:
        out.append(written[name if k == 0 else f"{name}_{k}"])
        k += 1
    return out


def _cut(first, end, nodes):
    """Triangles first .. end of an OBJ object written as the nodes [(node number, triangles)], as [[node number, first in it,
    how many]]. Pure."""
    pieces, start = [], 0
    for node, faces in nodes:
        low, high = max(first, start), min(end, start + faces)
        if low < high:
            pieces.append([node, low - start, high - low])
        start += faces
    return pieces


def pieces_of(first, end, parts, doubled):
    """Where triangles first .. end of a mesh as built lie in the kn5: [[node number, first triangle, how many], ...]. parts: per OBJ
    object of the mesh, the nodes it was written as [(node number, triangles)]. doubled: it holds each triangle twice, all of them
    once more after the last (obj_to_kn5: 1WALL). Pure."""
    pieces, base = [], 0
    for nodes in parts:
        total = sum(n for _node, n in nodes) // (2 if doubled else 1)
        low, high = max(first - base, 0), min(end - base, total)
        if low < high:
            pieces += _cut(low, high, nodes)
            if doubled:
                pieces += _cut(low + total, high + total, nodes)
        base += total
    return pieces


def chunk_objects(part, written):
    """The list of a tile's OBJ part, its numbers those of written ({OBJ object: [(node number, triangles)]}): {its name: {"kinds",
    "sorts", "at", "parents", "faces": per object [[node number, first triangle, how many], ...]}}. Pure but for reading the side
    file."""
    listed = load_side(part)
    if not listed:
        return {}
    faces = [[] for _ in listed["kinds"]]
    for name, runs in listed["meshes"].items():
        parts = parts_of(name, written)
        for owner, first, count in runs:
            faces[owner] += pieces_of(first, first + count, parts, name.startswith("1WALL"))
    group = os.path.splitext(os.path.basename(part))[0]
    return {group: {"kinds": listed["kinds"], "sorts": sorts_of(listed), "at": listed["at"], "parents": listed["parents"], "faces": faces,
                    "spans": listed.get("spans", {}), "poles": listed.get("poles", {})}}


POLE_REACH_M = {"pole": 1.0, "pylon": 20.0}     # how far from a pole's foot its span ends: the mean of a cross-arm's wires lies on
# it (furniture.wire_spans), a pylon's wires hang on arms of up to 15 m on one side or both


def linked(objects):
    """{tile: {its object's number: [ids of the spans that end at it]}}: a pole gets the spans at it, in any tile, for what is
    deleted with it; a span on poles only poles, on pylons only pylons, so a line passing a street's pole never hangs on that.
    objects: merged's list, with each tile's "spans" {number: [from, to, "pole" or "pylon"]} and "poles" {number: [x, y, the same]}.
    Pure."""
    cell = 2 * max(POLE_REACH_M.values())
    grid = {}
    for tile, entry in objects.items():
        for number, (x, y, on) in entry.get("poles", {}).items():
            grid.setdefault((x // cell, y // cell, on), []).append((tile, number, x, y))
    out = {}
    for tile, entry in objects.items():
        for span, (a, b, on) in entry.get("spans", {}).items():
            reach = POLE_REACH_M[on] ** 2
            for x, y, *_ in (a, b):
                near = (grid.get((x // cell + i, y // cell + j, on), ()) for i in (-1, 0, 1) for j in (-1, 0, 1))
                found = [p for ps in near for p in ps if (p[2] - x) ** 2 + (p[3] - y) ** 2 <= reach]
                if found:
                    t, number, *_ = min(found, key=lambda p: (p[2] - x) ** 2 + (p[3] - y) ** 2)
                    out.setdefault(t, {}).setdefault(number, []).append(f"{tile}#{span}")
    return out


def merged(lists, nodes):
    """The tiles' lists as one: lists per chunk of the kn5, nodes how many meshes each chunk holds; its numbers count on over the
    file (the chunks stand first in it: obj_to_kn5.convert). Pure."""
    out, before = {}, 0
    for listed, count in zip(lists, nodes):
        for name, entry in listed.items():
            out[name] = {**entry, "faces": [[[node + before, first, n] for node, first, n in pieces] for pieces in entry["faces"]]}
        before += count
    links = linked(out)
    for name, entry in out.items():
        entry.pop("spans", None), entry.pop("poles", None)
        entry["with"] = links.get(name, {})
    return out


def after_filter(objects, moved, going, gone):
    """The list as it is for the kn5 kn5.without_faces made: moved its numbers of meshes, going what it took, gone the ids of the
    objects that are no more. Their numbers stay, with no triangles: an id means the same on the copy. Pure."""
    kept_before = {i: np.r_[0, np.cumsum(~mask)] for i, mask in going.items()}
    out = {}
    for tile, entry in objects.items():
        faces = []
        for k, pieces in enumerate(entry["faces"]):
            new = []
            for mesh, first, count in pieces if f"{tile}#{k}" not in gone else ():
                if moved.get(mesh) is None:
                    continue
                before = kept_before.get(mesh)
                a, n = (first, count) if before is None else (int(before[first]), int(before[first + count] - before[first]))
                if n:
                    new.append([moved[mesh], a, n])
            faces.append(new)
        out[tile] = {**entry, "faces": faces}
    return out


def well_formed(objects):
    """Whether what was read from a track's list is one, to its last part. Pure."""
    if not isinstance(objects, dict):
        return False
    for entry in objects.values():
        if not isinstance(entry, dict) or not all(isinstance(entry.get(k), list) for k in ("kinds", "at", "parents", "faces")):
            return False
        n = len(entry["kinds"])
        if len(entry["at"]) != n or len(entry["parents"]) != n or len(entry["faces"]) != n:
            return False
        sorts = entry.get("sorts", entry["kinds"])
        if not (isinstance(sorts, list) and len(sorts) == n and all(isinstance(s, str) for s in sorts)):
            return False
        if not all(isinstance(p, list) and all(isinstance(q, list) and len(q) == 3 and all(type(v) is int for v in q) for q in p)
                   for p in entry["faces"]):
            return False
        if not isinstance(entry.get("with", {}), dict):
            return False
    return True


def write(kn5_path, objects):
    """The list of the kn5 at kn5_path into its track's folder, whole or not at all, after the kn5. It holds for that state of the
    file: a list of another, or one left by a build that stopped between the two, is taken for none (app.trackview.objects). No
    objects: no list."""
    path = os.path.join(os.path.dirname(kn5_path), FILE)
    if not objects:
        if os.path.exists(path):
            os.remove(path)
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".map2lap_objects_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump({"schema": SCHEMA, "kn5": state_of(kn5_path), "objects": objects}, f, separators=(",", ":"))
        os.replace(temporary, path)
    except BaseException:
        os.unlink(temporary)
        raise
