"""The Editor tab's view of a kn5: kn5.scan finds what kn5.read finds, trackview hands out the visible meshes' bytes. The
server hands out only the page's own files."""
import json
import os
import struct
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest import mock

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import server  # noqa: E402
from app import mytracks, settings, trackview  # noqa: E402
from track import kn5  # noqa: E402

IDENTITY = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0)
START = (1.0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 1.0, 0, 5.0, 6.0, 7.0, 1.0)


def mesh(name, n, material=0, renderable=1):
    v = np.zeros(n, kn5.VERTEX)
    v["pos"][:, 0] = np.arange(n)
    return kn5.Node(2, name, 1, vertices=v, indices=np.arange(n, dtype="<u2"), material=material, lod_out=100.0,
                    bs_center=(1.0, 2.0, 3.0), bs_radius=4.0, renderable=renderable)


class TrackViewTest(unittest.TestCase):
    def test_stale_model_mesh_revision_is_rejected_before_an_index_can_be_reused_or_removed(self):
        from app import trackedits
        vertices = np.zeros(3, kn5.VERTEX)
        faces = np.array([[0, 1, 2]], dtype="<u2")
        for meshes in ([], [{"model": {"instance": "new"}, "data": (vertices, faces)}]):
            with self.subTest(meshes=len(meshes)), mock.patch.object(trackedits, "context", return_value=("unused", {"meshes": meshes, "draft": 2}, {})):
                with self.assertRaises(trackview.ModelsChanged):
                    trackview.mesh_bytes("unused", "test", 0, "source", draft=1)

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.ac, self.name = tmp.name, "t"
        root = os.path.join(self.ac, "content", "tracks", self.name)
        os.makedirs(os.path.join(root, "data"))
        with open(os.path.join(root, mytracks.FILE), "w", encoding="utf-8") as f:
            json.dump({}, f)
        materials = [kn5.Material("trees", "ksPerPixelAT", 0, 1, 0, [("ksAmbient", 0.4, (0, 0), (0, 0, 0), (0, 0, 0, 0)),
                                                                     ("ksDiffuse", 0.3, (0, 0), (0, 0, 0), (0, 0, 0, 0)),
                                                                     ("ksAlphaRef", 0.5, (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                                  [("txDiffuse", 0, "a.png")])]
        tree = kn5.Node(1, "map2lap", 1, matrix=IDENTITY)
        tree.children = [mesh("1ROAD_x", 3), mesh("1WALL_col", 4, renderable=0), mesh("nocol_y", 5),
                         kn5.Node(1, "AC_START_0", 1, matrix=START)]
        self.path = os.path.join(root, self.name + ".kn5")
        kn5.write(self.path, [("a.png", b"PNGDATA"), ("b.dds", b"DDS")], materials, tree)

    def test_scan_finds_what_read_finds(self):
        read, scan = kn5.read(self.path), kn5.scan(self.path)
        self.assertEqual([t[0] for t in read["textures"]], [t[0] for t in scan["textures"]])
        self.assertEqual(read["materials"], scan["materials"])
        whole = [n for n, _d in kn5.walk(read["root"]) if n.cls == 2]
        self.assertEqual([n.name for n in whole], [m["name"] for m in scan["meshes"]])
        with open(self.path, "rb") as f:
            for n, m in zip(whole, scan["meshes"]):
                f.seek(m["offset"])
                self.assertEqual(n.vertices.tobytes(), f.read(m["vertices"] * kn5.VERTEX.itemsize))
                self.assertEqual(len(n.indices), struct.unpack("<i", f.read(4))[0])
                self.assertEqual(n.indices.tobytes(), f.read(m["indices"] * 2))

    def test_dual_layer_index_keeps_both_colour_images_and_the_linear_keep_mask(self):
        material = kn5.Material("ground_0_0", "ksPerPixel_dual_layer", 0, 0, 0,
                                [("uvMult", 128., (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                                [("txDiffuse", 0, "detail.dds"), ("txLayer1", 1, "base.dds"),
                                 ("txLayer1_Mask", 2, "keep.dds")])
        kn5.write(self.path, [("detail.dds", b"detail"), ("base.dds", b"base"), ("keep.dds", b"mask")],
                  [material], kn5.Node(1, "map2lap", 1, matrix=IDENTITY, children=[mesh("1ROAD_ground_0_0", 3)]))
        got = trackview.index(self.ac, self.name)
        self.assertEqual("detail.dds", got["materials"][0]["texture"])
        self.assertEqual({"base": "base.dds", "mask": "keep.dds", "scale": 128.}, got["materials"][0]["dual_layer"])
        self.assertEqual([False, False, True], [bool(t.get("linear")) for t in got["textures"]])
        self.assertEqual(["detail.dds", "base.dds", "keep.dds"], [t["name"] for t in got["textures"]])

    def test_world_colour_index_exposes_the_actual_photo_and_its_world_scale(self):
        from track import groundmaterial
        material = kn5.Material("asphalt", "ksMultilayer", 0, 0, 0,
                                [("multR", .5, (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                                [("txDiffuse", 0, groundmaterial.WHITE), ("txMask", 1, groundmaterial.MASK),
                                 ("txDetailR", 2, "photo.dds")])
        got = trackview._material(material)
        self.assertEqual("photo.dds", got["texture"])
        self.assertEqual([.5, .5], got["world_scale"])

    def test_generated_classic_ground_shows_its_tile_image_with_its_own_light(self):
        from track import groundmaterial
        tile = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [("ksSpecular", .02, (0, 0), (0, 0, 0), (0, 0, 0, 0))],
                            [("txDiffuse", 0, "ground_0_0.dds")])
        got = trackview._material(groundmaterial.ground(tile))
        self.assertEqual("ground_0_0.dds", got["texture"])
        self.assertEqual(.02, got["specular"])
        self.assertNotIn("pbr", got)
        self.assertNotIn("splat", got)

    def test_painted_classic_ground_shows_its_photos_and_its_tile_image_at_its_scale(self):
        from track import groundmaterial
        tile = kn5.Material("ground_0_0", "ksMultilayer_objsp", 0, 0, 0,
                            [("m2lMaskExtent", 1., (1.125, 1.125), (0, 0, 0), (0, 0, 0, 0)),
                             ("m2lBaseScale", groundmaterial.UV_SCALE, (0, 0), (0, 0, 0), (0, 0, 0, 0))], [])
        material = groundmaterial.classic(tile, groundmaterial.WHITE, "mask.dds",
                                          {"R": ("grass.dds", None, (144., 72.), False),
                                           "A": ("ground_0_0.png", None, (groundmaterial.UV_SCALE * 1.125,) * 2, False)})
        got = trackview._material(material)
        self.assertEqual("ground_0_0.png", got["texture"])
        splat = got["splat"]
        self.assertEqual({"name": "ground_0_0.png"}, splat["base"])
        self.assertEqual({"name": "mask.dds", "linear": True}, splat["mask"])
        self.assertEqual([{"name": "grass.dds", "scale": [128., 64.], "channel": 0, "variation": False}], splat["images"])
        self.assertEqual([1.125, 1.125], splat["mask_extent"])
        self.assertEqual([groundmaterial.UV_SCALE] * 2, splat["base_scale"])
        self.assertNotIn("pbr", splat)

    def test_index_leaves_out_invisible_meshes_and_finds_the_start(self):
        got = trackview.index(self.ac, self.name)
        self.assertEqual(["1ROAD_x", "nocol_y"], [m["name"] for m in got["meshes"]])
        self.assertEqual([0, 2], [m["i"] for m in got["meshes"]])     # (the file's numbers: what mesh_bytes asks for)
        self.assertEqual((5.0, 6.0, 7.0), got["start"]["pos"])
        self.assertEqual((0.0, 0.0, 1.0), got["start"]["forward"])
        self.assertEqual({"name": "trees", "shader": "ksPerPixelAT", "texture": "a.png", "alpha_ref": 0.5, "blend": False}, {
            k: v for k, v in got["materials"][0].items() if k not in ("bright", "ambient", "diffuse", "specular", "specular_exp")})
        self.assertAlmostEqual(0.7, got["materials"][0]["bright"], places=5)
        json.dumps(got)     # (goes to the page)

    def test_billboards_count_on_over_their_parts_tile_by_tile(self):
        trees, other = kn5.Material("trees", "", 0, 0, 0, [], []), kn5.Material("road", "", 0, 0, 0, [], [])
        part = lambda name, material, faces: {"name": name, "material": material, "indices": faces * 3}    # noqa: E731
        meshes = [part("nocol_trees_-1_0", 0, 16), part("nocol_trees_-1_0_1", 0, 8), part("nocol_trees_2_3", 0, 8),
                  part("nocol_trees_bush_-1_0", 0, 8), part("1ROAD_ground_-1_0", 1, 8)]
        self.assertEqual({0: 0, 1: 16, 2: 0, 3: 0}, trackview._first_faces(meshes, [trees, other]))

    def test_the_route_and_its_anchor(self):
        root = os.path.join(self.ac, "content", "tracks", self.name)
        self.assertEqual((None, []), trackview._route(root))
        with open(os.path.join(root, "data", "map2lap_route.txt"), "w", encoding="utf-8") as f:
            f.write("anchor 42.5 9.25\n1.5 -2.5\n3.0 4.0\n")
        self.assertEqual(([42.5, 9.25], [[1.5, -2.5], [3.0, 4.0]]), trackview._route(root))
        got = trackview.index(self.ac, self.name)
        self.assertEqual([42.5, 9.25], got["anchor"])
        self.assertIn("olive", got["atlas"]["sprites"])

    def test_a_mesh_and_a_texture_come_as_in_the_file(self):
        revision = trackview.index(self.ac, self.name)["revision"]
        b = trackview.mesh_bytes(self.ac, self.name, 2, revision)
        self.assertEqual(5 * kn5.VERTEX.itemsize + 4 + 5 * 2, len(b))
        self.assertEqual([0.0, 1.0, 2.0, 3.0, 4.0], np.frombuffer(b, kn5.VERTEX, 5)["pos"][:, 0].tolist())
        self.assertEqual(("b.dds", b"DDS"), trackview.texture_bytes(self.ac, self.name, 1, revision))

    def test_a_bc7_tile_image_comes_as_in_the_file_only_a_bc7_mask_is_unpacked(self):
        from PIL import Image
        from track import textures
        tile = textures.dds_mipmaps(Image.new("RGB", (8, 8), (200, 200, 200)), bc7=True)
        weights = np.zeros((8, 8, 4), np.uint8)
        weights[..., 3] = 255
        mask = textures.bc7_weights(textures.dds_weights(Image.fromarray(weights)))
        material = kn5.Material("ground_0_0", "ksMultilayer_objsp", 0, 0, 0, [],
                                [("txDiffuse", 0, "white.dds"), ("txMask", 1, "mask.dds"), ("txDetailA", 2, "tile.dds")])
        kn5.write(self.path, [("tile.dds", tile), ("mask.dds", mask)], [material],
                  kn5.Node(1, "map2lap", 1, matrix=IDENTITY, children=[mesh("1ROAD_ground_0_0", 3)]))
        revision = trackview.index(self.ac, self.name)["revision"]
        self.assertEqual(("tile.dds", tile), trackview.texture_bytes(self.ac, self.name, 0, revision))
        self.assertEqual(textures.browser_weights(mask), trackview.texture_bytes(self.ac, self.name, 1, revision)[1])

    def test_numbers_from_an_older_file_are_refused(self):
        revision = trackview.index(self.ac, self.name)["revision"]
        with open(self.path, "ab") as f:        # (a build replaced it: mesh 2 could be anything now)
            f.write(b"more")
        with self.assertRaises(trackview.Unreadable):
            trackview.mesh_bytes(self.ac, self.name, 2, revision)
        with self.assertRaises(trackview.Unreadable):
            trackview.texture_bytes(self.ac, self.name, 1, revision)

    def test_a_file_changing_while_it_is_read_is_refused(self):
        revision = trackview.index(self.ac, self.name)["revision"]
        real, seen = os.fstat, []

        def changed(fd):
            seen.append(fd)
            st = real(fd)
            return mock.Mock(st_mtime_ns=st.st_mtime_ns + 1, st_size=st.st_size)
        with mock.patch("app.trackview.os.fstat", changed), self.assertRaises(trackview.Unreadable):
            trackview.mesh_bytes(self.ac, self.name, 2, revision)
        self.assertTrue(seen)

    def test_a_file_cut_off_by_a_build_is_unreadable_not_a_crash(self):
        size = os.path.getsize(self.path)
        for keep in (3, 40, size // 2, size - 1):
            with open(self.path, "r+b") as f:
                f.truncate(keep)
            with self.assertRaises(trackview.Unreadable, msg=keep):
                trackview.index(self.ac, self.name)

    def test_only_map2lap_tracks(self):
        os.remove(os.path.join(self.ac, "content", "tracks", self.name, mytracks.FILE))
        with self.assertRaises(trackview.NotOurs):
            trackview.index(self.ac, self.name)


class EditorRequestsTest(TrackViewTest):
    """What the page gets over HTTP: an unreadable or changed file is an answer, not a dropped connection."""

    def setUp(self):
        super().setUp()
        srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        self.addCleanup(srv.server_close)
        self.addCleanup(srv.shutdown)
        self.url = f"http://127.0.0.1:{srv.server_address[1]}/api/editor/{self.name}"
        patch = mock.patch.object(server.settings, "ac_path", return_value=self.ac)
        patch.start()
        self.addCleanup(patch.stop)

    def get(self, path):
        try:
            with urllib.request.urlopen(self.url + path) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def test_an_apply_running_tells_its_progress_and_none_once_done(self):
        from app import trackedits
        told, release = threading.Event(), threading.Event()

        def paint(_ac, _name, _body, progress):
            progress("masks", 120, 300)
            told.set()
            release.wait(5)
            return {"paint": "a" * 64}
        with mock.patch.object(trackedits, "paint", side_effect=paint):
            request = urllib.request.Request(self.url + "/paint", data=b"{}", headers={"Content-Type": "application/json"})
            answer = {}
            thread = threading.Thread(target=lambda: answer.update(json.loads(urllib.request.urlopen(request).read())))
            thread.start()
            self.assertTrue(told.wait(5))
            self.assertEqual((200, {"phase": "masks", "done": 120, "total": 300}), (lambda r: (r[0], json.loads(r[1])))(self.get("/paint-progress")))
            release.set()
            thread.join(5)
        self.assertEqual("a" * 64, answer["paint"])
        self.assertEqual({}, json.loads(self.get("/paint-progress")[1]))

    def test_a_mesh_with_its_revision(self):
        code, body = self.get("/index")
        self.assertEqual(200, code)
        code, body = self.get(f"/mesh/2?r={json.loads(body)['revision']}")
        self.assertEqual((200, 5 * kn5.VERTEX.itemsize + 4 + 5 * 2), (code, len(body)))

    def test_a_changed_file_and_a_cut_off_one_answer_409(self):
        revision = json.loads(self.get("/index")[1])["revision"]
        with open(self.path, "r+b") as f:
            f.truncate(40)
        self.assertEqual(409, self.get("/index")[0])
        self.assertEqual(409, self.get(f"/mesh/2?r={revision}")[0])
        self.assertIn("error", json.loads(self.get("/index")[1]))

    def test_a_mesh_number_not_there_answers_404(self):
        revision = json.loads(self.get("/index")[1])["revision"]
        self.assertEqual(404, self.get(f"/mesh/99?r={revision}")[0])

    def test_a_mesh_without_a_revision_is_no_request(self):
        self.assertEqual(404, self.get("/mesh/2")[0])


class BuildFilesTest(unittest.TestCase):
    def test_kept_by_default_for_the_editor(self):
        self.assertFalse(settings.DEFAULTS["clean"])

    def test_a_track_has_them_with_its_tiles(self):
        with tempfile.TemporaryDirectory() as root, mock.patch.object(server, "ROOT", root):
            self.assertFalse(server.has_build_files("t"))
            os.makedirs(os.path.join(root, "out", "tracks", "t", "tiles"))
            self.assertTrue(server.has_build_files("t"))


class WebFileTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.web = os.path.join(tmp.name, "web")
        os.makedirs(os.path.join(self.web, "sub"))
        for rel in (("index.html",), ("sub", "a.js")):
            open(os.path.join(self.web, *rel), "w").close()
        open(os.path.join(tmp.name, "secret.txt"), "w").close()

    def test_the_page_and_its_parts(self):
        self.assertEqual(os.path.join(self.web, "index.html"), server.web_file("/", self.web))
        self.assertEqual(os.path.join(self.web, "sub", "a.js"), server.web_file("/sub/a.js?x=1", self.web))

    def test_nothing_else(self):
        for path in ("/../secret.txt", "/%2e%2e/secret.txt", "/sub/../../secret.txt", "/none.js", "/sub"):
            self.assertIsNone(server.web_file(path, self.web), path)


if __name__ == "__main__":
    unittest.main()
