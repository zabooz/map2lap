"""Ground selection is prepared while loading, then clicks look up regions without evaluating paint masks again."""
import base64
import io
import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path
from unittest import mock

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import editorinfo, surfaceindex  # noqa: E402


class SurfaceIndexTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.kn5 = self.root / "track.kn5"
        self.kn5.write_bytes(b"source geometry")
        patch = mock.patch.object(surfaceindex, "CACHE_ROOT", self.root / "cache")
        patch.start()
        self.addCleanup(patch.stop)

    def tile(self, x=0, features=(), alpha=None):
        part = self.root / f"t_{x}_0.obj"
        paint = editorinfo.Paint(str(part), x, 0, 64)
        paint.base(["gc_meadow"], np.zeros((64, 64), np.uint8))
        if alpha is None:
            alpha = np.zeros((64, 64), np.uint8)
            alpha[29:35, :] = 255
            alpha[28, :] = 80
        paint.layer("road_asphalt", alpha)
        paint.finish(features=features)
        return str(part)

    def mask(self, result, key=(0, 0)):
        tile = next(t for t in result["tiles"] if t["tile"] == list(key))
        return np.asarray(Image.open(io.BytesIO(base64.b64decode(tile["mask"]))))

    def test_after_loading_clicks_do_not_evaluate_masks_or_flood_the_region(self):
        parts = [self.tile(x) for x in (0, 1)]
        editorinfo.install(str(self.kn5), parts)
        self.assertEqual(2, surfaceindex.prepare(str(self.kn5))["prepared"])
        with mock.patch.object(editorinfo, "_weight", side_effect=AssertionError("paint evaluated at click")), \
             mock.patch.object(editorinfo, "_component", side_effect=AssertionError("flood at click")), \
             mock.patch.object(editorinfo, "_material_at", side_effect=AssertionError("paint decoded at click")):
            result = surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.5, whole=True)
            again = surfaceindex.select(str(self.kn5), 1, 0, 0.2, 0.5, whole=True)
        self.assertEqual("road_asphalt", result["material"])
        self.assertEqual(2, len(result["tiles"]))
        self.assertEqual({tuple(t["tile"]) for t in result["tiles"]}, {tuple(t["tile"]) for t in again["tiles"]})
        mask = self.mask(result)
        self.assertTrue((mask[28] == 80).all())
        self.assertTrue((mask[29:35] == 255).all())
        self.assertTrue((mask[:28] == 0).all())

    def test_each_materials_weights_are_the_layers_painted_in_order_over_the_base(self):
        rng = np.random.default_rng(5)
        part = self.root / "t_0_0.obj"
        paint = editorinfo.Paint(str(part), 0, 0, 64)
        base = (np.arange(64)[:, None] // 32 + np.zeros((1, 64), int)).astype(np.uint8)
        paint.base(["gc_meadow", "gc_forest"], base)
        layers = [("road_asphalt", rng.integers(0, 256, (64, 64), dtype=np.uint8)),
                  ("gc_rock", np.tile(np.linspace(0, 255, 64).astype(np.uint8), (64, 1))),
                  ("road_asphalt", (rng.random((64, 64)) > .7).astype(np.uint8) * 200)]
        for material, alpha in layers:
            paint.layer(material, alpha)
        paint.finish()
        editorinfo.install(str(self.kn5), [str(part)])
        surfaceindex.prepare(str(self.kn5))
        _folder, target, *_rest = surfaceindex._context(str(self.kn5))
        names = ["gc_meadow", "gc_forest", "road_asphalt", "gc_rock"]
        with np.load(target / "0_0.npz") as saved:
            self.assertEqual(names, json.loads(saved["meta"].tobytes())["materials"])
            for k, name in enumerate(names):
                weight = (base == names.index(name)).astype(np.float32) if k < 2 else np.zeros((64, 64), np.float32)
                for material, alpha in layers:      # (each layer covers what is under it by its alpha)
                    a = alpha.astype(np.float32) / 255.0
                    weight *= 1 - a
                    if material == name:
                        weight += a
                with Image.open(io.BytesIO(saved[f"w{k}"].tobytes())) as image:
                    np.testing.assert_array_equal(np.rint(weight * 255).astype(np.uint8), np.asarray(image), err_msg=name)

    def test_each_materials_weights_are_the_layers_painted_in_order_over_the_base(self):
        rng = np.random.default_rng(5)
        part = self.root / "t_0_0.obj"
        paint = editorinfo.Paint(str(part), 0, 0, 64)
        base = (np.arange(64)[:, None] // 32 + np.zeros((1, 64), int)).astype(np.uint8)
        paint.base(["gc_meadow", "gc_forest"], base)
        layers = [("road_asphalt", rng.integers(0, 256, (64, 64), dtype=np.uint8)),
                  ("gc_rock", np.tile(np.linspace(0, 255, 64).astype(np.uint8), (64, 1))),
                  ("road_asphalt", (rng.random((64, 64)) > .7).astype(np.uint8) * 200)]
        for material, alpha in layers:
            paint.layer(material, alpha)
        paint.finish()
        editorinfo.install(str(self.kn5), [str(part)])
        surfaceindex.prepare(str(self.kn5))
        _folder, target, *_rest = surfaceindex._context(str(self.kn5))
        names = ["gc_meadow", "gc_forest", "road_asphalt", "gc_rock"]
        with np.load(target / "0_0.npz") as saved:
            self.assertEqual(names, json.loads(saved["meta"].tobytes())["materials"])
            for k, name in enumerate(names):
                weight = (base == names.index(name)).astype(np.float32) if k < 2 else np.zeros((64, 64), np.float32)
                for material, alpha in layers:      # (each layer covers what is under it by its alpha)
                    a = alpha.astype(np.float32) / 255.0
                    weight *= 1 - a
                    if material == name:
                        weight += a
                with Image.open(io.BytesIO(saved[f"w{k}"].tobytes())) as image:
                    np.testing.assert_array_equal(np.rint(weight * 255).astype(np.uint8), np.asarray(image), err_msg=name)

    def test_unprepared_counts_the_sections_a_first_opening_still_computes(self):
        editorinfo.install(str(self.kn5), [self.tile(x) for x in (0, 1)])
        self.assertEqual(2, surfaceindex.unprepared(str(self.kn5)))
        surfaceindex.prepare(str(self.kn5), ["0_0"])
        self.assertEqual(1, surfaceindex.unprepared(str(self.kn5)))
        surfaceindex.prepare(str(self.kn5))
        self.assertEqual(0, surfaceindex.unprepared(str(self.kn5)))
        self.assertEqual(0, surfaceindex.unprepared(str(self.root / "older.kn5")))   # (no selection data: nothing to compute)

    def test_select_all_includes_disconnected_regions_and_distant_matching_tiles(self):
        alpha = np.zeros((64, 64), np.uint8)
        alpha[10:15, 10:20] = 255
        alpha[45:50, 45:55] = 180
        editorinfo.install(str(self.kn5), [self.tile(0, alpha=alpha), self.tile(3, alpha=alpha)])
        surfaceindex.prepare(str(self.kn5))
        local = surfaceindex.select(str(self.kn5), 0, 0, 0.2, 0.8)
        self.assertEqual(1, len(local["tiles"]))
        self.assertEqual(0, self.mask(local)[46, 46])
        with mock.patch.object(surfaceindex, "_build_tile", side_effect=AssertionError("selection recomputed paint")):
            all_ = surfaceindex.select(str(self.kn5), 0, 0, 0.2, 0.8, whole=True)
        self.assertEqual({(0, 0), (3, 0)}, {tuple(tile["tile"]) for tile in all_["tiles"]})
        np.testing.assert_array_equal(alpha, self.mask(all_))
        np.testing.assert_array_equal(alpha, self.mask(all_, (3, 0)))
        self.assertFalse(all_["truncated"])

    def test_select_all_reports_unprepared_matching_area(self):
        editorinfo.install(str(self.kn5), [self.tile(x) for x in (0, 3, 8)])
        surfaceindex.prepare(str(self.kn5), ["0_0", "3_0"])
        partial = surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.5, whole=True)
        self.assertEqual(2, len(partial["tiles"]))
        self.assertTrue(partial["truncated"])

    def test_a_click_and_select_all_reach_every_tile_however_many(self):
        editorinfo.install(str(self.kn5), [self.tile(x) for x in range(66)])     # (one road across 66 tiles)
        surfaceindex.prepare(str(self.kn5))
        for whole in (False, True):
            with self.subTest(whole=whole):
                region = surfaceindex.regions(str(self.kn5), 0, 0, 0.5, 0.5, whole)
                self.assertEqual(66, len(region["regions"]))
                self.assertFalse(region["truncated"])
        self.assertEqual(66, len(surfaceindex.tile_scope([[x, 0] for x in range(66)])))

    @staticmethod
    def road(id_, points, link=False, layer="0"):
        return {"id": id_, "layer": "roads", "tags": {"layer": layer}, "geometry": [points],
                "spec": {"width": 16, "kind": "paved", "link": link}}

    def test_explicit_tile_scope_keeps_the_highlighted_subset_after_more_tiles_load(self):
        editorinfo.install(str(self.kn5), [self.tile(x) for x in (0, 3, 8)])
        surfaceindex.prepare(str(self.kn5), ["0_0", "8_0"])
        preview = surfaceindex.select(str(self.kn5), 0, 0, .5, .5, whole=True)
        self.assertTrue(preview["truncated"])                   # (tile 3 not loaded yet)
        surfaceindex.prepare(str(self.kn5), ["3_0"])
        scoped = surfaceindex.matching_tiles(str(self.kn5), preview["material"], [(0, 0), (8, 0)])
        self.assertEqual({(0, 0), (8, 0)}, {tuple(tile["tile"]) for tile in scoped["tiles"]})
        self.assertFalse(scoped["truncated"])
        np.testing.assert_array_equal(self.mask(preview, (8, 0)), self.mask(scoped, (8, 0)))

    def test_a_junction_stops_normal_road_selection_shift_takes_the_connected_road(self):
        alpha = np.zeros((64, 64), np.uint8)
        alpha[30:34, 8:56], alpha[8:33, 30:34] = 255, 255
        roads = [self.road("left", [[32, -128], [128, -128]]), self.road("right", [[128, -128], [224, -128]]),
                 self.road("exit", [[128, -128], [128, -224]], link=True)]
        editorinfo.install(str(self.kn5), [self.tile(features=roads, alpha=alpha)])
        surfaceindex.prepare(str(self.kn5))
        local = self.mask(surfaceindex.select(str(self.kn5), 0, 0, 0.25, 0.5))
        whole = self.mask(surfaceindex.select(str(self.kn5), 0, 0, 0.25, 0.5, whole=True))
        self.assertEqual(255, local[32, 16])
        self.assertEqual(0, local[32, 48])
        self.assertEqual(0, local[16, 32])
        np.testing.assert_array_equal(alpha, whole)

    def test_ordinary_map_splits_join_but_exits_and_levels_remain_distinct(self):
        roads = [self.road("a", [[0, 0], [64, 0]]), self.road("b", [[64, 0], [128, 0]]),
                 self.road("exit", [[128, 0], [192, 0]], link=True),
                 self.road("above", [[64, 0], [64, 64]], layer="1")]
        chains = surfaceindex.road_chains(roads)
        self.assertEqual(chains["a"], chains["b"])
        self.assertNotEqual(chains["b"], chains["exit"])
        self.assertNotEqual(chains["a"], chains["above"])

    def in_process(self, seed, code, payload):
        source = "import sys\nsys.path.insert(0, " + repr(str(Path(surfaceindex.__file__).parents[1])) + ")\n"
        result = subprocess.run([sys.executable, "-c", source + textwrap.dedent(code)],
                                input=json.dumps(payload), text=True, capture_output=True,
                                env={**os.environ, "PYTHONHASHSEED": str(seed)}, timeout=30)
        self.assertEqual(0, result.returncode, result.stderr)
        return json.loads(result.stdout)

    def test_chain_ids_are_stable_across_processes_and_feature_order(self):
        roads = [self.road(name, [[i * 64, -128], [(i + 1) * 64, -128]])
                 for i, name in enumerate(("a", "b", "c", "d"))]
        results = [self.in_process(seed, """
            import json
            from track import surfaceindex
            print(json.dumps(surfaceindex.road_chains(json.load(sys.stdin))))
            """, features) for seed in (1, 2, 5) for features in (roads, roads[::-1])]
        for result in results:
            self.assertEqual(results[0], result)
            self.assertEqual(1, len(set(result.values())))

    def test_cached_road_selection_and_smoothing_survive_another_process(self):
        roads = [self.road(name, [[32 + i * 112, -128], [32 + (i + 1) * 112, -128]])
                 for i, name in enumerate(("a", "b", "c", "d"))]
        editorinfo.install(str(self.kn5), [self.tile(x, features=roads) for x in (0, 1)])
        payload = {"path": str(self.kn5), "cache": str(self.root / "cache")}
        self.in_process(1, """
            import json
            from pathlib import Path
            from track import surfaceindex
            data = json.load(sys.stdin)
            surfaceindex.CACHE_ROOT = Path(data['cache'])
            surfaceindex.prepare(data['path'], ['0_0'])
            print('null')
            """, payload)
        result = self.in_process(2, """
            import base64, io, json
            from pathlib import Path
            import numpy as np
            from PIL import Image
            from app import roadregion
            from track import surfaceindex
            data = json.load(sys.stdin)
            surfaceindex.CACHE_ROOT = Path(data['cache'])
            surfaceindex.prepare(data['path'], ['1_0'])
            local = surfaceindex.select(data['path'], 0, 0, .5, .5)
            net = roadregion.mapped(data['path'], [[48, -128], [464, -128]])
            selected = roadregion.selection(data['path'], net)
            pixels = [int(np.asarray(Image.open(io.BytesIO(base64.b64decode(t['mask']))))[32, 32])
                      for t in sorted(selected['tiles'], key=lambda t: t['tile'])]
            print(json.dumps({'local_tiles': len(local['tiles']), 'pixels': pixels}))
            """, payload)
        self.assertEqual({"local_tiles": 2, "pixels": [255, 255]}, result)

    def test_old_unstable_owner_cache_is_replaced_automatically(self):
        editorinfo.install(str(self.kn5), [self.tile()])
        with mock.patch.object(surfaceindex, "VERSION", 1):
            surfaceindex._catalog.cache_clear()
            surfaceindex.prepare(str(self.kn5))
            old_target = surfaceindex._context(str(self.kn5))[1]
        surfaceindex._catalog.cache_clear()
        new_target = surfaceindex._context(str(self.kn5))[1]
        self.assertNotEqual(old_target, new_target)
        surfaceindex.prepare(str(self.kn5))
        self.assertTrue((new_target / "0_0.npz").is_file())
        self.assertTrue((old_target / "0_0.npz").is_file())

    def test_prepared_files_survive_memory_eviction_and_save_as_without_recomputing(self):
        editorinfo.install(str(self.kn5), [self.tile()])
        surfaceindex.prepare(str(self.kn5))
        target = self.root / "copy" / "copy.kn5"
        target.parent.mkdir()
        target.write_bytes(b"saved copy")
        editorinfo.copy(str(self.kn5), str(target))
        surfaceindex.clear_memory()
        with mock.patch.object(surfaceindex, "_build_tile", side_effect=AssertionError("prepared twice")):
            surfaceindex.prepare(str(target))
            self.assertEqual("road_asphalt", surfaceindex.select(str(target), 0, 0, 0.5, 0.5)["material"])

    def test_adding_ground_regions_merges_masks_without_changing_their_weights(self):
        editorinfo.install(str(self.kn5), [self.tile()])
        surfaceindex.prepare(str(self.kn5))
        road = surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.5)
        meadow = surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.9)
        result = surfaceindex.merge([road, meadow])
        self.assertEqual(["road_asphalt", "gc_meadow"], result["materials"])
        np.testing.assert_array_equal(np.maximum(self.mask(road), self.mask(meadow)), self.mask(result))

    def test_changed_metadata_does_not_reuse_an_old_prepared_index(self):
        editorinfo.install(str(self.kn5), [self.tile()])
        surfaceindex.prepare(str(self.kn5))
        self.assertEqual("road_asphalt", surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.5)["material"])
        editorinfo.install(str(self.kn5), [self.tile(alpha=np.zeros((64, 64), np.uint8))])
        surfaceindex.prepare(str(self.kn5))
        self.assertEqual("gc_meadow", surfaceindex.select(str(self.kn5), 0, 0, 0.5, 0.5)["material"])


if __name__ == "__main__":
    unittest.main()
