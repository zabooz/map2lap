"""How much work a regional ground Save does: what a region's mask depends on is made once per Save, and a mask whose
inputs did not change since the track's last Save is taken from then."""
import copy
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

import test_ground_guard_editor as guarded
import test_trackpaint as paintfixture
from app import trackcopy, tracknative, trackpaint, trackview
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


if __name__ == "__main__":
    unittest.main()
