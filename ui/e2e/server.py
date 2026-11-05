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
from http.server import ThreadingHTTPServer
from types import SimpleNamespace

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "src"))
os.chdir(REPO)

import generator  # noqa: E402
import server  # noqa: E402
from app import mapcache, mytracks, settings, system, updater, version  # noqa: E402
from scenery import trees  # noqa: E402
from track import kn5  # noqa: E402

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


def ground(name, mat, x0, z0, size=TILE, y=0.0):
    """A flat square from (x0, z0) on, its triangles facing up, as the ground's."""
    n, step = GRID + 1, size / GRID
    pos = [(x0 + i * step, y, z0 + j * step) for j in range(n) for i in range(n)]
    uv = [(i / GRID, -j / GRID) for j in range(n) for i in range(n)]
    tri = []
    for j in range(GRID):
        for i in range(GRID):
            a, b, c, d = j * n + i, (j + 1) * n + i, j * n + i + 1, (j + 1) * n + i + 1
            tri += [a, b, c, c, b, d]
    return mesh(name, mat, pos, [(0, 1, 0)] * len(pos), uv, tri)


def billboards(name, mat, items):
    """Billboards as make_obj's: trees.billboards' corners in AC's frame, three vertices a triangle, v negated."""
    p, uv, t = trees.billboards(items)
    corners = np.asarray(t).ravel()
    pos = np.c_[p[corners, 0], p[corners, 2], -p[corners, 1]]
    tex = np.c_[uv[corners, 0], -uv[corners, 1]]
    return mesh(name, mat, pos, [(0, 1, 0)] * len(pos), tex, np.arange(len(pos)))


def make_track(name, title, files=True, built=None, track_version=None, north=42.902, with_trees=True):
    """A track of two ground tiles, a road along x = 128, trees on it and distant terrain behind, as a build leaves it.
    north: where its route ends (two tracks with the same route count as copies of one track: mytracks.listing)."""
    root = os.path.join(AC, "content", "tracks", name)
    os.makedirs(os.path.join(root, "data"), exist_ok=True)
    with open(ATLAS, "rb") as f:
        atlas = f.read()
    textures = [("ground_0_0.dds", dds(*ROAD_FIELDS)), ("ground_-1_0.dds", dds(((60, 130, 50),))), ("trees.png", atlas),
                ("ground_far.dds", dds(((80, 120, 90),)))]
    materials = [material("ground_0_0", "ground_0_0.dds"), material("ground_-1_0", "ground_-1_0.dds"),
                 material("trees", "trees.png", "ksPerPixelAT_NS", 1), material("ground_far", "ground_far.dds")]
    # (x, north, up, yaw, height, random value; the second stands on the road ahead of the start)
    items = [("deciduous", 40.0, 200.0, 0.0, 0.0, 12.0, 0.1), ("deciduous", 128.0, 130.0, 0.0, 0.0, 30.0, 0.1)]
    tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
    tree.children = [ground("1ROAD_ground_0_0", 0, 0.0, -TILE), ground("1GRASS_ground_-1_0", 1, -TILE, -TILE),
                     *([billboards("nocol_trees_0_0", 2, items)] if with_trees else []),
                     ground("nocol_far_1", 3, -2000.0, 0.0, 4000.0, -3.0), kn5.Node(1, "AC_START_0", 1, matrix=START)]
    kn5.write(os.path.join(root, name + ".kn5"), textures, materials, tree)
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


def fill():
    """Everything as new: the tracks, a car, the settings."""
    calls.clear()
    release.clear()
    stopped.clear()
    server.job.update(state="idle", log=[], result=None, error=None, progress=None, started=None, ended=None)
    server.running.update(proc=None, clearing=False)
    for d in (AC, os.path.join(TMP, "out")):
        shutil.rmtree(d, ignore_errors=True)
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
    mapcache.usage = lambda: (5000000, 3)
    mapcache.clear = lambda: (calls.append(["map data cleared"]), 5000000)[1]
    server.play = lambda name: (calls.append(["play", name]), (200, {"ok": True}))[1]
    server.browse_folder = record("browse")
    server.start_build = start_build
    system.kill_tree = lambda pid: stopped.set()
    server.tidy_interrupted = record("tidy")
    assert settings.FILE.startswith(TMP) and server.ROOT == TMP and mytracks.ROOT == TMP


def start_build(name, title, points, width, area):
    """As server.start_build, but the build is a few steps of waiting: its progress, its log, the track at the end."""
    if not settings.is_ac(settings.ac_path()):
        return 400, {"error": "Assetto Corsa folder not found: set it in Settings"}
    if not area and len(points) < 2:
        return 400, {"error": "Set a start and a finish, or draw an area"}
    if server.job["state"] in ("running", "stopping"):
        return 409, {"error": "A build is already running"}
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
        if self.path == "/__test/calls":
            return self._send(200, calls)
        super().do_GET()

    def do_POST(self):
        if not self.path.startswith("/__test/"):
            return super().do_POST()
        body = self._body()
        if self.path == "/__test/reset":
            fill()
        elif self.path == "/__test/release":
            release.update(body)
        elif self.path == "/__test/rebuild":    # (the track built again: a new file, a new date)
            make_track(body["name"], body["title"], built=time.time() + 100, with_trees=body.get("trees", True))
        elif self.path == "/__test/cut":        # (a build writing it: the file ends halfway)
            path = os.path.join(AC, "content", "tracks", body["name"], body["name"] + ".kn5")
            with open(path, "r+b") as f:
                f.truncate(math.floor(os.path.getsize(path) / 2))
        self._send(200, {"ok": True})


class Quiet(ThreadingHTTPServer):
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
