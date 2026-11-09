"""How much work a regional ground Save does: what a region's mask depends on is made once per Save, and a mask whose
inputs did not change since the track's last Save is taken from then."""
import copy
import shutil
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

import test_ground_guard_editor as guarded
import test_trackpaint as paintfixture
from app import materiallibrary, trackcopy, trackdetail, tracknative, trackpaint, trackregions, trackview
from track import editorinfo, kn5


class RegionMaskTest(unittest.TestCase):
    setUp = paintfixture.PaintTest.setUp
    material = paintfixture.PaintTest.material
    keep = paintfixture.PaintTest.keep
    build = guarded.GuardedSaveTest.build

    def painted(self, stripes):
        """Tile 0 in two pieces of one material, as a build splits big ground, its seven stripes painted from the second
        on with that many greys (more than three: a regional Save). The paint ids."""
        self.build(0, stripes=7)
        native = kn5.read(str(self.path))
        whole = native["root"].children[0]
        second = copy.deepcopy(whole)
        second.name = whole.name + "_1"
        whole.indices, second.indices = whole.indices[:3].copy(), whole.indices[3:].copy()
        native["root"].children.insert(1, second)
        kn5.write(str(self.path), [(t[0], t[2]) for t in native["textures"]], native["materials"], native["root"])
        paint = editorinfo.Paint(str(self.folder / "t_0_0.obj"), 0, 0, 32)
        paint.base([f"field{k}" for k in range(7)], np.repeat(np.arange(32) * 7 // 32, 32).reshape(32, 32).T.astype(np.uint8))
        paint.finish()
        editorinfo.install(str(self.path), [str(self.folder / f"t_{tx}_0.obj") for tx in (0, 1)])
        self.revision = trackview.index(self.ac, self.name)["revision"]
        for mesh in (0, 1):
            trackview.prepare_surface(self.ac, self.name, mesh, self.revision)
        return [self.stripe(k) for k in range(stripes)]

    def stripe(self, k):
        return trackpaint.create(self.ac, self.name, self.revision, self.material((60 + 30 * k,) * 3),
                                 [{"mesh": 0, "u": (k + 1.5) / 7, "v": -.5, "whole": False}])

    def saved(self, folder):
        """The saved track's kn5: its region copies' names and its region masks {name: bytes}."""
        saved = kn5.read(str(Path(self.ac, "content/tracks", folder, folder + ".kn5")))
        regions = [node for node in kn5.walk_meshes(saved["root"]) if "m2l_region" in node.name]
        names = {name for node in regions for slot, _i, name in saved["materials"][node.material].maps if slot == "txMask"}
        return {node.name.split("region_")[1] for node in regions}, {n: raw for n, _a, raw in saved["textures"] if n in names}

    def test_a_region_mask_is_made_once_for_all_ground_pieces_of_its_tile(self):
        self.keep(self.painted(5))
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            trackcopy.save(self.ac, self.name, "copy", "Copy")
        regions, _masks = self.saved("copy")
        self.assertEqual({0, 1}, {int(r.split("_")[0]) for r in regions})        # (both pieces have regional copies)
        self.assertEqual(len({int(r.split("_")[1]) for r in regions}), made.call_count)

    def test_a_save_without_ground_changes_makes_no_region_mask_and_writes_the_same_ones(self):
        self.keep(self.painted(5))
        trackcopy.save(self.ac, self.name)
        _regions, first = self.saved(self.name)
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            trackcopy.save(self.ac, self.name)
        _regions, second = self.saved(self.name)
        self.assertEqual(0, made.call_count)
        self.assertTrue(first)
        self.assertEqual(first, second)

    def test_a_changed_ground_makes_its_masks_again_and_keeps_only_those_of_the_last_save(self):
        paints = self.painted(5)
        self.keep(paints[:4])
        trackcopy.save(self.ac, self.name)
        self.keep(paints)
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            trackcopy.save(self.ac, self.name)
        _regions, masks = self.saved(self.name)
        self.assertGreater(made.call_count, 0)
        kept = [path.read_bytes() for path in tracknative._mask_folder(self.name).glob("*.dds")]
        self.assertEqual(sorted(masks.values()), sorted(kept))

    def test_a_change_elsewhere_on_the_tile_keeps_a_regions_mask_and_saves_what_a_save_from_nothing_saves(self):
        paints = self.painted(5)
        self.keep(paints)
        trackcopy.save(self.ac, self.name)
        # The last stripe (x 22 to 28 of 32) takes the first one's material: that field changes, far from the first stripe.
        same = trackpaint.create(self.ac, self.name, self.revision, self.material((60, 60, 60)),
                                 [{"mesh": 0, "u": 5.5 / 7, "v": -.5, "whole": False}])
        self.keep(paints[:4] + [same])
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            trackcopy.save(self.ac, self.name)
        _regions, kept = self.saved(self.name)
        self.assertGreater(made.call_count, 0)
        for call in made.call_args_list:
            self.assertGreaterEqual(call.args[1][2] + 2, 22, call.args[1])        # (reads up to two pixels past its bounds)
        shutil.rmtree(tracknative._mask_folder(self.name))
        trackcopy.save(self.ac, self.name)
        self.assertEqual(kept, self.saved(self.name)[1])

    def test_a_tile_of_a_pbr_material_is_prepared_once_and_gets_no_browser_passes(self):
        self.painted(0)
        prepared = materiallibrary.prepare("rough.png", paintfixture.png(np.full((4, 4, 3), 90, np.uint8)))
        asset = materiallibrary.add({"token": prepared["token"], "filename": "rough.png", "name": "Rough", "category": "soil",
                                     "repeat": [2, 2], "properties": {"normal_scale": 1., "roughness": .5}})["material"]["id"]
        paint = trackpaint.create(self.ac, self.name, self.revision, asset, [{"mesh": 0, "u": 1.5 / 7, "v": -.5, "whole": False}])
        descriptors = trackpaint.descriptors(self.ac, self.name, self.revision, [paint])
        self.assertNotIn("ground", descriptors[0]["layers"])
        with (mock.patch.object(trackregions, "compile", wraps=trackregions.compile) as passes,
              mock.patch.object(trackdetail, "_semantic", wraps=trackdetail._semantic) as prepared_tiles):
            native = trackdetail.native_descriptors(self.ac, self.name, descriptors)[0]["layers"]
        passes.assert_not_called()
        self.assertEqual(1, prepared_tiles.call_count)
        self.assertEqual({"dimensions", "uv_origin"}, set(native["ground"]))
        self.assertTrue(native["native_regions"])


class MaskKeyTest(unittest.TestCase):
    """_mask_key against what region_mask reads: the bounds and two pixels around them."""

    def setUp(self):
        rows = np.random.default_rng(1).random((32, 32, 2), np.float32) + .1
        self.fields = {"a": rows[..., 0], "b": rows[..., 1]}
        self.bounds, self.palette, self.phase = [8, 8, 16, 16], ["a", "b"], [0., 0.]

    def key_and_mask(self, y, x):
        fields = {**self.fields, "a": self.fields["a"].copy()}
        fields["a"][y, x] += .4
        return (tracknative._mask_key(fields, self.bounds, self.palette, self.phase),
                tracknative.region_mask(fields, self.bounds, self.palette, phase=self.phase))

    def test_a_pixel_region_mask_reads_changes_the_key(self):
        same = tracknative._mask_key(self.fields, self.bounds, self.palette, self.phase)
        for y, x in ((10, 10), (6, 10), (10, 6), (17, 10), (10, 17)):
            self.assertNotEqual(same, self.key_and_mask(y, x)[0], (y, x))

    def test_a_pixel_it_does_not_read_keeps_the_key_and_the_mask(self):
        same = tracknative._mask_key(self.fields, self.bounds, self.palette, self.phase)
        mask = tracknative.region_mask(self.fields, self.bounds, self.palette, phase=self.phase)
        for y, x in ((5, 10), (10, 5), (18, 10), (10, 18), (30, 30)):
            self.assertEqual((same, mask), self.key_and_mask(y, x), (y, x))

    def test_bounds_at_the_tiles_edge_are_cut_to_it(self):
        self.bounds = [0, 0, 8, 8]
        same = tracknative._mask_key(self.fields, self.bounds, self.palette, self.phase)
        self.assertEqual(same, self.key_and_mask(10, 10)[0])
        self.assertNotEqual(same, self.key_and_mask(9, 9)[0])


if __name__ == "__main__":
    unittest.main()
