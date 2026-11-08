"""Smooth road selects a variable-width, connected road network, including a Y, without using the main route."""
import sys
import tempfile
import json
import threading
import urllib.request
from http.server import ThreadingHTTPServer
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import roadregion, roadnet, trackheights, trackband
from track import editorinfo, kn5, surfaceindex


def road(id, points, width=8, layer="0"):
    return {"id": id, "layer": "roads", "tags": {"layer": layer}, "spec": {"width": width, "kind": "paved"}, "geometry": [points]}


class NetworkTest(unittest.TestCase):
    def test_four_pins_form_one_y_with_three_terminal_arms(self):
        roads = [road("stem", [[0, -80], [0, 0]], 8), road("up", [[0, 0], [80, 60]], 12), road("down", [[0, 0], [80, -60]], 5)]
        result = roadregion.network(roads, [[0, 0], [0, -60], [60, 45], [60, -45]])
        self.assertEqual(3, len(result["lines"]))
        self.assertEqual(3, len(result["terminals"]))
        self.assertEqual(1, len(result["junctions"]))
        np.testing.assert_allclose(result["junctions"][0], [0, 0])
        self.assertEqual({5, 8, 12}, {segment["width"] for segment in result["segments"]})
        self.assertLess(result["length"], 220)

    def test_side_road_can_be_chosen_without_the_main_route(self):
        roads = [road("main", [[-100, 0], [0, 0], [100, 0]]), road("side", [[0, 0], [0, 100]])]
        result = roadregion.network(roads, [[-70, 0], [0, 70]])
        self.assertTrue(any(segment["road"] == "side" for segment in result["segments"]))
        self.assertFalse(any(np.max(np.asarray(line)[:, 0]) > 1 for line in result["lines"]))

    def test_crossing_roads_on_different_levels_do_not_connect(self):
        roads = [road("lower", [[-100, 0], [0, 0], [100, 0]]), road("upper", [[0, -100], [0, 0], [0, 100]], layer="1")]
        with self.assertRaisesRegex(ValueError, "connected"):
            roadregion.network(roads, [[-60, 0], [0, 60]])

    def test_a_pin_in_the_middle_of_a_road_clips_the_selected_segment(self):
        result = roadregion.network([road("long", [[-200, 0], [200, 0]])], [[-40, 0], [50, 0]])
        self.assertAlmostEqual(90, result["length"])
        self.assertEqual(2, len(result["terminals"]))
        np.testing.assert_allclose(sorted(result["terminals"]), [[-40, 0], [50, 0]])

    def test_footprint_uses_the_painted_shape_and_stops_at_the_terminal(self):
        result = roadregion.network([road("long", [[0, 0], [100, 0]], 14)], [[20, 0], [80, 0]])
        x, z = np.meshgrid(np.arange(0, 102, 2), np.arange(-16, 18, 2))
        # A varying road width and an unpainted island within it.
        painted = np.abs(z) < (3 + x / 25)
        painted[(x == 50) & (z == 0)] = False
        selected = roadregion.footprint(result, x, z, painted)
        np.testing.assert_array_equal(selected, painted & (x >= 20) & (x <= 80))

    def test_a_close_parallel_leg_of_the_same_hairpin_is_outside_the_mask(self):
        net = roadregion.network([road("hairpin", [[0, 0], [100, 0], [100, 6], [0, 6]], 4)], [[20, 0], [80, 0]])
        x, z = np.meshgrid(np.arange(0, 102, 2), np.arange(-6, 14, 2))
        painted = (np.abs(z) <= 2) | (np.abs(z - 6) <= 2)
        selected = roadregion.footprint(net, x, z, painted)
        np.testing.assert_array_equal(selected, painted & (z <= 2) & (x >= 20) & (x <= 80))


class SurfaceTest(unittest.TestCase):
    def test_three_arms_share_one_junction_surface_without_pinning_its_old_bump(self):
        net = roadregion.network([road("stem", [[0, -90], [0, 0]]), road("up", [[0, 0], [100, 70]]),
                                  road("down", [[0, 0], [100, -70]])], [[0, 0], [0, -80], [80, 56], [80, -56]])
        arms = []
        for line in net["lines"]:
            xy = roadnet.resample(line)
            lanes = np.arange(-6, 7, 2)
            along = np.gradient(xy, axis=0)
            along /= np.linalg.norm(along, axis=1)[:, None]
            side = np.c_[along[:, 1], -along[:, 0]]
            p = xy[None] + lanes[:, None, None] * side
            h = 100 + .02 * p[..., 0] - .01 * p[..., 1] + 3 * np.exp(-(p[..., 0] ** 2 + p[..., 1] ** 2) / 200)
            built = 100 + .02 * p[..., 0] - .01 * p[..., 1]
            arms.append({"line": xy, "lanes": lanes, "heights": h, "built": built, "slopes": (None, None)})
        zero = roadnet.even_network(net, arms, 0)
        for arm, result in zip(arms, zero):
            np.testing.assert_array_equal(arm["heights"], result)
        result = roadnet.even_network(net, arms, 1)
        junctions = []
        for arm, even in zip(arms, result):
            at = 0 if np.linalg.norm(arm["line"][0]) < 1 else -1
            junctions.append(even[len(arm["lanes"]) // 2, at])
            np.testing.assert_allclose(even[:, -1 if at == 0 else 0], arm["heights"][:, -1 if at == 0 else 0], atol=1e-9)
            self.assertLess(float(np.max(np.abs(np.diff(even, axis=1)))) / 2, .5)
        self.assertLess(np.ptp(junctions), 1e-7)
        self.assertLess(abs(float(np.mean(junctions)) - 100), .5)

    def test_a_plane_keeps_its_grade_and_crossfall_through_a_y(self):
        net = roadregion.network([road("a", [[-80, 0], [0, 0]]), road("b", [[0, 0], [60, 60]]),
                                  road("c", [[0, 0], [60, -60]])], [[0, 0], [-70, 0], [50, 50], [50, -50]])
        arms = []
        for line in net["lines"]:
            xy = roadnet.resample(line)
            lanes = np.arange(-6, 7, 2)
            side = roadnet.sideways(xy)
            p = xy[None] + lanes[:, None, None] * side
            h = 20 + .04 * p[..., 0] + .06 * p[..., 1]
            arms.append({"line": xy, "lanes": lanes, "heights": h, "built": h, "slopes": (None, None)})
        for arm, even in zip(arms, roadnet.even_network(net, arms, 1)):
            np.testing.assert_allclose(even, arm["heights"], atol=1e-6)


class RasterTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = str(Path(self.tmp.name, "y.kn5"))
        patch = mock.patch.object(surfaceindex, "CACHE_ROOT", Path(self.tmp.name, "prepared"))
        patch.start()
        self.addCleanup(patch.stop)
        self.roads = [road("stem", [[0, -100], [0, 0]], 8), road("up", [[0, 0], [100, 70]], 12), road("down", [[0, 0], [100, -70]], 6)]
        self.points = [[0, 0], [0, -80], [80, 56], [80, -56]]
        x, z = np.meshgrid(np.arange(-80, 142, 2), np.arange(-120, 122, 2))
        vertices = np.zeros(x.size, kn5.VERTEX)
        vertices["pos"] = np.c_[x.ravel(), self.height(x, z).ravel(), z.ravel()]
        vertices["normal"][:, 1] = 1
        rows, cols = x.shape
        a = (np.arange(rows - 1)[:, None] * cols + np.arange(cols - 1)).ravel()
        faces = np.concatenate([np.c_[a, a + cols, a + 1], np.c_[a + 1, a + cols, a + cols + 1]])
        centres = vertices["pos"][faces][:, :, [0, 2]].mean(axis=1)
        is_road = self.painted(centres[:, 0], centres[:, 1])
        root = kn5.Node(1, "map2lap", 1, matrix=(1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1.))
        for prefix, keep in (("1ROAD", is_road), ("1GRASS", ~is_road)):
            indices = faces[keep]
            used = np.unique(indices)
            root.children.append(kn5.Node(2, prefix + "_ground_0_0", 1, vertices=vertices[used],
                                 indices=np.searchsorted(used, indices).astype("<u2").ravel(), material=0,
                                 bs_center=(30., 100., 0.), bs_radius=250.))
        kn5.write(self.path, [], [kn5.Material("ground", "ksPerPixel", 0, 0, 0, [], [])], root)
        parts = []
        for tx in (-1, 0):
            for ty in (-1, 0):
                part = str(Path(self.tmp.name, f"t_{tx}_{ty}.obj"))
                paint = editorinfo.Paint(part, tx, ty, 128)
                paint.base(["gc_meadow"], np.zeros((128, 128), np.uint8))
                px, pz = np.meshgrid(tx * 256 + (np.arange(128) + .5) * 2, -(ty + 1) * 256 + (np.arange(128) + .5) * 2)
                paint.layer("road_asphalt", self.painted(px, pz).astype(np.uint8) * 255)
                paint.finish(features=self.roads)
                parts.append(part)
        editorinfo.install(self.path, parts)
        self.scan = kn5.scan(self.path)

    @staticmethod
    def height(x, z):
        return 100 + .02 * x + .06 * z + 3 * np.exp(-(x * x + z * z) / 200)

    def painted(self, x, z):
        result = np.zeros(x.shape, bool)
        for feature in self.roads:
            a, b = np.asarray(feature["geometry"][0])
            v = b - a
            t = np.clip(((x - a[0]) * v[0] + (z - a[1]) * v[1]) / (v @ v), 0, 1)
            result |= (x - a[0] - t * v[0]) ** 2 + (z - a[1] - t * v[1]) ** 2 <= (feature["spec"]["width"] / 2) ** 2
        return result

    def test_a_real_y_mesh_gets_one_raster_with_fixed_ends_and_no_change_far_away(self):
        net = roadregion.mapped(self.path, self.points)
        selected = roadregion.selection(self.path, net)
        original = Path(self.path).read_bytes()
        op, influence = roadnet.change_of(self.path, self.scan, None, net, selected, 6, 1, "y")
        self.assertIsNone(trackheights.problem(op))
        field = trackheights.Field([op])
        self.assertLess(float(field.at(0, 0)[0]), -2.5)
        for point in self.points[1:]:
            self.assertLess(abs(float(field.at(*point)[0])), .01)
        self.assertEqual(0, float(field.at(-60, 90)[0]))
        self.assertTrue(influence["tiles"])
        changed = trackheights.moved(self.path, self.scan, {}, [op])
        self.assertTrue(changed.vertices)
        self.assertEqual(original, Path(self.path).read_bytes())
        # The upper arm rises and the lower arm falls; both must join through one surface without a new kink.
        for line in net["lines"]:
            xy = roadnet.resample(line)
            before = self.height(xy[:, 0], xy[:, 1])
            after = before + field.at(xy[:, 0], xy[:, 1])[0]
            self.assertLess(np.max(np.abs(np.diff(after, 2))), .6 * np.max(np.abs(np.diff(before, 2))))

    def test_an_unselected_arm_keeps_its_join_and_road_heights(self):
        net = roadregion.mapped(self.path, [[0, -80], [80, 56]])
        selected = roadregion.selection(self.path, net)
        op, _ = roadnet.change_of(self.path, self.scan, None, net, selected, 6, 1, "two")
        field = trackheights.Field([op])
        self.assertLess(abs(float(field.at(0, 0)[0])), .001)
        self.assertLess(abs(float(field.at(40, -28)[0])), .001)

    def test_strength_approaches_zero_at_the_junction_too(self):
        net = roadregion.mapped(self.path, self.points)
        selected = roadregion.selection(self.path, net)
        try:
            op, _ = roadnet.change_of(self.path, self.scan, None, net, selected, 6, .001, "tiny")
        except trackband.Refused as error:
            self.assertIn("already", str(error))
        else:
            self.assertLessEqual(max(map(abs, op["mm"])), 1)

    def test_the_editor_api_returns_the_orange_area_and_one_y_height_change(self):
        import server
        service = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=service.serve_forever, daemon=True).start()
        self.addCleanup(service.server_close)
        self.addCleanup(service.shutdown)
        with mock.patch.object(server.settings, "ac_path", return_value=self.tmp.name), \
             mock.patch.object(server.trackview, "_scan_of", return_value=(self.path, self.scan)), \
             mock.patch.object(server.trackedits, "moved_without", return_value=None), \
             mock.patch.object(server.trackedits, "remember_meshes"):
            body = json.dumps({"base": "source", "network": True, "points": self.points, "blend": 6, "strength": 1}).encode()
            def request(suffix):
                req = urllib.request.Request(f"http://127.0.0.1:{service.server_address[1]}/api/editor/y/band{suffix}",
                                             data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req) as response:
                    return json.load(response)
            area = request("/way")
            self.assertEqual(3, len(area["lines"]))
            self.assertTrue(area["region"]["tiles"])
            result = request("")
            self.assertIsNone(trackheights.problem(result["height"]))
            self.assertTrue(result["influence"]["tiles"])


if __name__ == "__main__":
    unittest.main()
