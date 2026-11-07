"""Ground selection is prepared while loading, then clicks look up regions without evaluating paint masks again."""
import base64
import io
import sys
import tempfile
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

    @staticmethod
    def road(id_, points, link=False, layer="0"):
        return {"id": id_, "layer": "roads", "tags": {"layer": layer}, "geometry": [points],
                "spec": {"width": 16, "kind": "paved", "link": link}}

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
