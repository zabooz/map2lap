"""Map2Lap's real server for the page's browser tests, with nothing real behind it: an AC folder, settings and build files of
its own in a temporary folder, small generated tracks, and stand-ins for all that would reach out of it (builds, AC, updates,
map data, the net). So a test can press Delete or Clear without any harm, and needs no track built on this machine.

    python ui/e2e/server.py         # prints "PORT <n>"; ends when its stdin closes (the test run ended)
"""
import json
import math
import os
import shutil
import struct
import sys
import tempfile
import threading
import time
from types import SimpleNamespace

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "src"))
os.chdir(REPO)

import generator  # noqa: E402
import furniture  # noqa: E402
import server  # noqa: E402
from app import mapcache, materiallibrary, objectlibrary, mytracks, settings, system, updater, version  # noqa: E402
from scenery import cars, trees  # noqa: E402
from track import editorinfo, kn5, objectlist  # noqa: E402
from track.textures import dds_mipmaps  # noqa: E402

# Test an isolated UI build without replacing the live generator page's bundles.
if web_root := os.environ.get("MAP2LAP_TEST_WEB"):
    server.web_file.__defaults__ = (os.path.abspath(web_root),)

TMP = tempfile.mkdtemp(prefix="map2lap_e2e_")
AC = os.path.join(TMP, "ac")
IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
START = (-1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, -1.0, 0, 128.0, 0.0, -40.0, 1.0)    # (faces minus z: along the route)
TILE = 256.0
GRID = 16
ANCHOR = (42.9, 9.36)
BUILD_STEP_S = 0.3
calls = []                  # what the page asked of the stand-ins
release = {}                # the newest release version.latest answers
stopped = threading.Event()
TRACK_LOCK = threading.RLock()
ATLAS = os.path.join(TMP, "atlas.png")


def dds(*rows):
    """A DXT1 image of 4 x 4 blocks, a colour each, by rows: what the builds' textures are, in small."""
    def block(rgb):
        r, g, b = rgb
        colour = (r >> 3) << 11 | (g >> 2) << 5 | b >> 3
        return struct.pack("<HHI", colour, colour, 0)
    height, width = 4 * len(rows), 4 * len(rows[0])
    header = struct.pack("<4s7I44x2I4s20xI16x", b"DDS ", 124, 0x1007, height, width, 0, 0, 1, 32, 4, b"DXT1", 0x1000)
    return header + b"".join(block(c) for row in rows for c in row)


# The road's texture: four fields of the image, so a test can tell from a pixel's colour which part of it lies there. A field
# from the top left, as e2e/render.e2e.ts expects them: a mirrored or turned texture shows at once.
ROAD_FIELDS = (((200, 40, 40), (40, 200, 40)), ((40, 40, 200), (200, 200, 40)))


def material(name, texture, shader="ksPerPixel", alpha=0):
    props = [(k, v, (0, 0), (0, 0, 0), (0, 0, 0, 0)) for k, v in (("ksAmbient", 0.5), ("ksDiffuse", 0.5), ("ksAlphaRef", 0.5 if alpha else 0.0))]
    return kn5.Material(name, shader, 0, alpha, 0, props, [("txDiffuse", 0, texture)])


def mesh(name, mat, pos, normal, uv, indices):
    """A mesh node from its rows."""
    v = np.zeros(len(pos), kn5.VERTEX)
    v["pos"], v["normal"], v["uv"] = pos, normal, uv
    p = np.asarray(pos, float)
    center = tuple(((p.min(0) + p.max(0)) / 2).tolist())
    return kn5.Node(2, name, 1, cast_shadows=0, visible=1, transparent=0, vertices=v, indices=np.asarray(indices, "<u2"),
                    material=mat, lod_in=0.0, lod_out=100000.0, bs_center=center,
                    bs_radius=float(np.linalg.norm(p - center, axis=1).max()), renderable=1)


def ground(name, mat, x0, z0, size=TILE, y=0.0, grid=GRID, height=None):
    """A flat square from (x0, z0) on, its triangles facing up, as the ground's; grid: cells a side; height(z): how high, instead of y."""
    n, step = grid + 1, size / grid
    pos = [(x0 + i * step, height(z0 + j * step) if height else y, z0 + j * step) for j in range(n) for i in range(n)]
    uv = [(i / grid, -j / grid) for j in range(n) for i in range(n)]
    tri = []
    for j in range(grid):
        for i in range(grid):
            a, b, c, d = j * n + i, (j + 1) * n + i, j * n + i + 1, (j + 1) * n + i + 1
            tri += [a, b, c, c, b, d]
    return mesh(name, mat, pos, [(0, 1, 0)] * len(pos), uv, tri)


def hill_at(z):
    """A hill of 3 m across the road, ahead of the start, as the smooth tool's tests want to take away."""
    return 3.0 * math.exp(-((z + 80.0) / 18.0) ** 2)


def billboards(name, mat, items):
    """Billboards as make_obj's: trees.billboards' corners in AC's frame, three vertices a triangle, v negated."""
    p, uv, t = trees.billboards(items)
    corners = np.asarray(t).ravel()
    pos = np.c_[p[corners, 0], p[corners, 2], -p[corners, 1]]
    tex = np.c_[uv[corners, 0], -uv[corners, 1]]
    return mesh(name, mat, pos, [(0, 1, 0)] * len(pos), tex, np.arange(len(pos)))


RESET_TRIES, RESET_WAIT_S = 100, 0.05


def parked_car(number, mat):
    """A car of cars.py on the road ahead of the start, as make_obj and obj_to_kn5 leave it: three vertices a triangle, each
    triangle a second time turned round. (its mesh, its entry in the track's list.)"""
    placed = []
    p, uv, t = cars.build([[128.0, 40.0, 0.0, 90.0]], fill=[1.0], placed=placed)
    t = np.r_[t, t[:, ::-1]]
    corners = t.ravel()
    pos = np.c_[p[corners, 0], p[corners, 2], -p[corners, 1]]
    tex = np.c_[uv[corners, 0], -uv[corners, 1]]
    x, y, z, faces = placed[0]
    entry = {"kinds": ["car"], "at": [[x, z, -y]], "parents": [-1], "faces": [objectlist.pieces_of(0, faces, [[(number, faces * 2)]], True)]}
    return mesh("1WALL_cars_0_0", mat, pos, [(0, 1, 0)] * len(pos), tex, np.arange(len(pos))), entry


def box_faces(x0, x1, y0, y1, z0, z1):
    """The corners of a box's 12 triangles in AC's frame, each triangle's corners in turn."""
    c = [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
    quads = ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3))
    return [c[k] for q in quads for k in (q[0], q[1], q[2], q[0], q[2], q[3])]


def house_with_sign(number, mat):
    """A house ahead of the start with a sign on its front, one mesh as make_obj leaves it: each triangle a second time turned round,
    the sign's triangles in the fields of the road's texture that are not the house's. (its mesh, its entry in the track's list.)"""
    house, sign = box_faces(120.0, 136.0, 0.0, 12.0, -68.0, -58.0), box_faces(124.0, 132.0, 6.0, 9.0, -57.9, -57.7)
    front = house + sign
    back = [p for k in range(0, len(front), 3) for p in reversed(front[k:k + 3])]
    uv = [(0.25, 0.25)] * len(house) + [(0.75, 0.75)] * len(sign)
    tex = uv + [p for k in range(0, len(uv), 3) for p in reversed(uv[k:k + 3])]
    faces = len(house) // 3, len(sign) // 3
    nodes = [[(number, 2 * sum(faces))]]
    entry = {"kinds": ["house", "house sign"], "at": [[128.0, 0.0, -63.0], [128.0, 6.0, -57.8]], "parents": [-1, 0],
             "faces": [objectlist.pieces_of(0, faces[0], nodes, True), objectlist.pieces_of(faces[0], sum(faces), nodes, True)]}
    return mesh("1WALL_bld_fac_00_1_0_0", mat, front + back, [(0, 1, 0)] * len(tex), tex, np.arange(len(tex))), entry


def pole_with_wires(number, mat, two=False):
    """A pole beside the road ahead of the start, and a span of wires from it across the road, as a build leaves them; two: a pole at
    the span's other end too, which shares it. (its two meshes, its entry in the track's list.)"""
    pole = box_faces(119.8, 120.2, 0.0, 8.0, -60.2, -59.8)
    faces = len(pole) // 3
    front = pole + (box_faces(139.8, 140.2, 0.0, 8.0, -60.2, -59.8) if two else [])
    node = mesh("1WALL_props_0_0", mat, front + [p for k in range(0, len(front), 3) for p in reversed(front[k:k + 3])],
                [(0, 1, 0)] * (2 * len(front)), [(0.25, 0.25)] * (2 * len(front)), np.arange(2 * len(front)))
    line = np.array([(120.0 + 2.0 * k, 60.0, 8.0) for k in range(11)])      # (x east, y north, z up)
    p, t, uv = furniture.wire_mesh([line], (0.0, 0.0, 0.0))
    corners = t.ravel()
    wire = mesh("nocol_wire_wire_0_0", mat, np.c_[p[corners, 0], p[corners, 2], -p[corners, 1]], [(0, 1, 0)] * len(corners),
                np.c_[uv[corners, 0], -uv[corners, 1]], np.arange(len(corners)))
    nodes = [[(number, len(front) * 2 // 3)]]
    poles = [objectlist.pieces_of(0, faces, nodes, True)] + ([objectlist.pieces_of(faces, 2 * faces, nodes, True)] if two else [])
    span = f"t_0_0#{len(poles)}"
    entry = {"kinds": ["power pole"] * len(poles) + ["power line"], "sorts": ["pole"] * len(poles) + ["power line"],     # (the car's and the house's: as older lists, none)
             "at": [[120.0, 0.0, -60.0]] + ([[140.0, 0.0, -60.0]] if two else []) + [[130.0, 8.0, -60.0]], "parents": [-1] * (len(poles) + 1),
             "faces": [*poles, [[number + 1, 0, len(t)]]], "with": {str(k): [span] for k in range(len(poles))}}
    return [node, wire], entry


def make_track(*args, **kwargs):
    """A test build is indivisible, as real builds are; several intercepted mesh GETs can ask for it at once."""
    with TRACK_LOCK:
        return _make_track(*args, **kwargs)


def _make_track(name, title, files=True, built=None, track_version=None, north=42.902, with_trees=True, car=None, house=False, pole=False, hill=False, verge=False, grass=False, ground_material=None, ground_split=False, ground_materials=0, ground_brightness=None, tree_height=30.0):
    """A track of two ground tiles, a road along x = 128, trees on it and distant terrain behind, as a build leaves it.
    north: where its route ends (two tracks with the same route count as copies of one track: mytracks.listing). car: a parked
    car on it, "listed" in the track's list of objects or "older" without one. house: a house with a sign on it, listed. pole: a
    power pole with a span of wires, listed ("two": a pole at each end of the span, which they share). hill: the road tile on the
    2 m lattice of a real build, with a hill across it."""
    root = os.path.join(AC, "content", "tracks", name)
    os.makedirs(os.path.join(root, "data"), exist_ok=True)
    with open(ATLAS, "rb") as f:
        atlas = f.read()
    textures = [("ground_0_0.dds", dds(*ROAD_FIELDS)), ("ground_-1_0.dds", dds(((60, 130, 50),))), ("trees.png", atlas),
                ("ground_far.dds", dds(((80, 120, 90),)))]
    if ground_materials:
        # This fixture generates its physical 256px source directly; the renderer never enlarges a smaller mask.
        pixels = np.empty((256, 256, 3), np.uint8)
        for row in range(2):
            for col in range(2):
                pixels[row * 128:(row + 1) * 128, col * 128:(col + 1) * 128] = ROAD_FIELDS[row][col]
        textures[0] = ("ground_0_0.dds", dds_mipmaps(Image.fromarray(pixels), smallest=1))
    materials = [material("ground_0_0", "ground_0_0.dds"), material("ground_-1_0", "ground_-1_0.dds"),
                 material("trees", "trees.png", "ksTree", 1), material("ground_far", "ground_far.dds")]
    if ground_brightness is not None:
        for entry in materials[:2]:
            entry.props = [(p[0], ground_brightness / 2 if p[0] in {"ksAmbient", "ksDiffuse"} else p[1], *p[2:]) for p in entry.props]
    # (x, north, up, yaw, height, random value; the second stands on the road ahead of the start)
    items = [("deciduous", 40.0, 200.0, 0.0, 0.0, 12.0, 0.1), ("deciduous", 128.0, 130.0, 0.0, 0.0, tree_height, 0.1)]
    tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
    road = ground("1ROAD_ground_0_0", 0, 0.0, -TILE, grid=int(TILE / 2), height=hill_at) if hill else ground("1ROAD_ground_0_0", 0, 0.0, -TILE, grid=128 if ground_materials else GRID)
    if grass:
        road.name = "1GRASS_ground_0_0"
    tree.children = [road, ground("1GRASS_ground_-1_0", 1, -TILE, -TILE),
                     *([billboards("nocol_trees_0_0", 2, items)] if with_trees else []),
                     ground("nocol_far_1", 3, -2000.0, 0.0, 4000.0, -3.0), kn5.Node(1, "AC_START_0", 1, matrix=START)]
    listed = {}
    if car:
        materials.append(material("cars", "ground_far.dds"))
        node, entry = parked_car(sum(c.cls == 2 for c in tree.children), len(materials) - 1)
        tree.children.insert(-1, node)
        if car == "listed":
            listed["t_0_0"] = entry
    if house:
        node, entry = house_with_sign(sum(c.cls == 2 for c in tree.children), 0)
        tree.children.insert(-1, node)
        listed["t_0_0"] = entry
    if pole:
        nodes, entry = pole_with_wires(sum(c.cls == 2 for c in tree.children), 0, pole == "two")
        tree.children[-1:-1] = nodes
        listed["t_0_0"] = entry
    if verge:
        materials.append(material("edge_dirt", "ground_far.dds"))
        node = mesh("nocol_road_edge_dirt_0_0", len(materials) - 1,
                    [(134, 0.02, -75), (138, 0.02, -75), (134, 0.02, -20), (138, 0.02, -20)],
                    [(0, 1, 0)] * 4, [(0, 0), (1, 0), (0, -1), (1, -1)], [0, 2, 1, 1, 2, 3])
        tree.children.insert(-1, node)
    kn5.write(os.path.join(root, name + ".kn5"), textures, materials, tree)
    objectlist.write(os.path.join(root, name + ".kn5"), listed)
    if name != "gamma":
        parts = []
        for ty in (-1, 0):
            px, py = ((-1, 0) if ty == -1 else (0, 0)) if ground_materials else (0, ty)
            part = os.path.join(root, f"t_{px}_{py}.obj")
            paint = editorinfo.Paint(part, px, py, 256 if ground_materials and ty == 0 else 32)
            if ground_materials and ty == 0:
                labels = [f"gc_field{k}" for k in range(ground_materials)]
                ids = np.broadcast_to(np.minimum(ground_materials - 1, np.arange(256) * ground_materials // 256), (256, 256)).astype(np.uint8)
                paint.base(labels, ids)
                yy, xx = np.indices((256, 256))
                soft = np.rint(45 * np.maximum(0, 1 - np.hypot(xx - 128, yy - 128) / 64)).astype(np.uint8)
                for label in labels:
                    paint.layer(label, soft)
            elif ground_split:
                ids = np.broadcast_to((np.arange(32) >= 16).astype(np.uint8), (32, 32)).copy()
                paint.base(["gc_meadow", "road_asphalt"], ids)
            else:
                paint.base([ground_material or ("gc_meadow" if grass else "road_asphalt")], np.zeros((32, 32), np.uint8))
            features = [{"id": "fixture-road", "layer": "roads", "tags": {"highway": "residential"},
                         "spec": {"width": 16, "kind": "paved"},
                         "geometry": [[[128, -256], [128, -80], [128, 0], [128, 256]]]}] if hill else []
            paint.finish(features=features)
            parts.append(part)
        editorinfo.install(os.path.join(root, name + ".kn5"), parts)
    with open(os.path.join(root, "data", "map2lap_route.txt"), "w", encoding="utf-8") as f:
        f.write(f"anchor {ANCHOR[0]} {ANCHOR[1]}\n128 0\n128 -250\n")
    current = track_version or version.TRACK_VERSION
    mytracks.save(root, {"version": current, "track_version": current, "title": title, "points": [[42.9, 9.36], [north, 9.36]],
                         "width": 100.0, "area": None, "length_m": 250.0, "area_m": None, "tiles": 2,
                         "built": built or time.time(), "line": [[42.9, 9.36], [north, 9.36]]})
    if files:
        os.makedirs(os.path.join(TMP, "out", "tracks", name, "tiles"), exist_ok=True)
        with open(os.path.join(TMP, "out", "tracks", name, "tiles", "x.bin"), "wb") as f:
            f.write(b"x" * 2000000)


def remove_tree(path):
    """path gone. A request of the test before can still hold one of its files (Windows then refuses to delete it): what stayed
    behind would meet the next test as its own. Not gone after a while: that test can't start clean, so it says so."""
    for _ in range(RESET_TRIES):
        shutil.rmtree(path, ignore_errors=True)
        if not os.path.exists(path):
            return
        time.sleep(RESET_WAIT_S)
    raise RuntimeError(f"still there: {path}")


def fill():
    """Everything as new: the tracks, a car, the settings."""
    calls.clear()
    release.clear()
    stopped.clear()
    server.job.update(state="idle", log=[], result=None, error=None, progress=None, started=None, ended=None)
    server.running.update(proc=None, clearing=False)
    for d in (AC, os.path.join(TMP, "out"), os.path.join(TMP, "library"), os.path.join(TMP, "cache")):
        remove_tree(d)
    os.makedirs(os.path.join(AC, "content", "cars", "car_a", "skins", "default"))
    os.makedirs(os.path.join(AC, "content", "cars", "car_a", "ui"))
    with open(os.path.join(AC, "content", "cars", "car_a", "ui", "ui_car.json"), "w", encoding="utf-8") as f:
        json.dump({"name": "Test Car"}, f)
    now = time.time()
    make_track("alpha", "Alpha Test", built=now)
    make_track("beta", "Beta Test", built=now - 60)
    make_track("gamma", "Gamma Old", files=False, built=now - 120, track_version="0.0.1", north=42.91)
    if os.path.exists(settings.FILE):
        os.remove(settings.FILE)
    settings.save({"ac_path": AC, "clean": False, "debug_app": False})


def stand_ins():
    """All that would reach out of TMP. Checked at the end: a test must never touch the real folders."""
    settings.FILE = os.path.join(TMP, "settings.json")
    server.ROOT = mytracks.ROOT = TMP
    materiallibrary.ROOT = TMP
    objectlibrary.ROOT = TMP
    server.MARK = os.path.join(TMP, "out", "build_running.json")

    def record(name, value=None):
        def stand_in(*args, **_kw):
            calls.append([name, *[a for a in args if isinstance(a, (str, int, float))]])
            return value
        return stand_in
    generator.route = lambda points: ([list(p) for p in points], 1000.0 * (len(points) - 1))
    generator.place = lambda lat, lon: ("Testtown", f"Part {round(lat * 100) % 7}")
    generator.auto_title = lambda points=None, area=None: "Testtown Area" if area else "Testtown Route"
    generator.search = lambda q: {"springfield": [{"name": "Springfield, Illinois, United States", "lat": 39.8, "lon": -89.6},
                                                  {"name": "Springfield, Massachusetts, United States", "lat": 42.1, "lon": -72.6}],
                                  "onlyone": [{"name": "Onlytown, Somewhere, Country, Far", "lat": 47.0, "lon": 11.0}]}.get(q.lower(), [])
    version.latest = lambda fresh=False: dict(release) or {"version": version.VERSION, "url": "https://example.invalid/", "archive": None}
    updater.possible = lambda root=None: False
    # Ordinary page tests start with a working patch; installation warnings supply their own local-status responses.
    server.csp.inspect = lambda ac: {"status": "installed", "version": "0.2.11", "build": 3465, "enabled": True}
    mapcache.usage = lambda: (5000000, 3)
    mapcache.clear = lambda: (calls.append(["map data cleared"]), 5000000)[1]
    server.play = lambda name, clock=None: (calls.append(["play", name]), (200, {"ok": True}))[1]
    server.browse_folder = record("browse")
    server.start_build = start_build
    system.kill_tree = lambda pid: stopped.set()
    server.tidy_interrupted = record("tidy")
    assert settings.FILE.startswith(TMP) and server.ROOT == TMP and mytracks.ROOT == TMP and materiallibrary.ROOT == TMP


def start_build(name, title, points, width, area):
    """As server.start_build, but the build is a few steps of waiting: its progress, its log, the track at the end."""
    if not settings.is_ac(settings.ac_path()):
        return 400, {"error": "Assetto Corsa folder not found: set it in Settings"}
    if not area and len(points) < 2:
        return 400, {"error": "Set a start and a finish, or draw an area"}
    if server.job["state"] in ("running", "stopping"):
        return 409, {"error": "A build is already running"}
    saved = server.saved_in_editor(name)
    if saved:
        return saved
    calls.append(["build", name, title])
    stopped.clear()
    server.running["proc"] = SimpleNamespace(pid=0)
    server.job.update(state="running", log=[], result=None, error=None, progress=None, started=time.time(), ended=None)
    threading.Thread(target=_build, args=(name, title), daemon=True).start()
    return 200, {"ok": True}


def _build(name, title):
    for k, phase in enumerate(("route", "tiles", "scenery", "kn5")):
        server.job["progress"] = {"phase": phase, "done": k, "total": 4}
        server.job["log"].append(f"step {k}")
        if stopped.wait(BUILD_STEP_S):
            server.job.update(state="stopped", ended=time.time())
            server.running["proc"] = None
            return
    if "fail" in name:
        server.job.update(state="error", error="the generator ended with exit code 1 (see the log)", ended=time.time())
    else:
        make_track(name, title)
        server.job.update(state="done", ended=time.time(), result={
            "name": name, "kn5_bytes": 1500000, "seconds": 1.2, "tiles": 2, "area_m": None, "length_m": 250.0})
    server.running["proc"] = None


class Handler(server.Handler):
    """The page's server and what only the tests ask for."""

    def do_GET(self):
        if self.path == "/__test/ground-weights":
            from app import trackdetail, trackedits, trackpaint
            now = trackedits.load(AC, "alpha")
            descriptor = trackpaint.descriptors(AC, "alpha", now["base"], now["paints"])[0]
            record, path, scan, filename = trackdetail._view(AC, "alpha", descriptor["version"])
            layout, weights, _coverage = trackdetail._semantic(AC, "alpha", record, path, scan, filename)
            width, height = layout["dimensions"]
            return self._send(200, {"dimensions": [width, height], "weights": [float(v[height // 2, width // 2]) for v in weights.values()]})
        if self.path == "/__test/calls":
            return self._send(200, calls)
        if self.path.startswith("/__test/meshes?name="):    # (what the track's own kn5 holds, as AC reads it: the Editor shows its source)
            name = generator.slug(self.path.split("=", 1)[1])
            tracks = kn5.read(os.path.join(AC, "content", "tracks", name, name + ".kn5"))
            return self._send(200, {m.name: len(m.indices) // 3 for m in kn5.walk_meshes(tracks["root"])})
        super().do_GET()

    def do_POST(self):
        if not self.path.startswith("/__test/"):
            return super().do_POST()
        body = self._body()
        if self.path == "/__test/reset":
            fill()
        elif self.path == "/__test/cold-models":
            for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
                shutil.rmtree(os.path.join(TMP, relative), ignore_errors=True)
        elif self.path == "/__test/release":
            release.update(body)
        elif self.path == "/__test/rebuild":    # (the track built again: a new file, a new date)
            make_track(body["name"], body["title"], built=time.time() + 100, with_trees=body.get("trees", True), car=body.get("car"), house=body.get("house", False),
                       pole=body.get("pole", False), hill=body.get("hill", False), verge=body.get("verge", False), grass=body.get("grass", False),
                       ground_material=body.get("ground_material"), ground_split=body.get("ground_split", False),
                       ground_materials=body.get("ground_materials", 0), ground_brightness=body.get("ground_brightness"),
                       tree_height=body.get("tree_height", 30.0))
        elif self.path == "/__test/cut":        # (a build writing it: the file ends halfway)
            path = os.path.join(AC, "content", "tracks", body["name"], body["name"] + ".kn5")
            with open(path, "r+b") as f:
                f.truncate(math.floor(os.path.getsize(path) / 2))
        self._send(200, {"ok": True})


class Quiet(server.Server):
    def handle_error(self, request, client_address):
        """(a test ended while its page still asked: nothing to report)"""


def main():
    stand_ins()
    trees.make_atlas(ATLAS)
    fill()
    srv = Quiet(("127.0.0.1", 0), Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    print("PORT", srv.server_address[1], flush=True)
    sys.stdin.read()                    # (a killed test run leaves no server behind)
    shutil.rmtree(TMP, ignore_errors=True)
    os._exit(0)


if __name__ == "__main__":
    main()
