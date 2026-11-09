"""How much work a regional ground Save does: what a region's mask depends on is made once per Save."""
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

    def test_a_region_mask_is_made_once_for_all_ground_pieces_of_its_tile(self):
        self.build(0, stripes=7)
        native = kn5.read(str(self.path))           # (tile 0 in two pieces of one material, as a build splits big ground)
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
        greys = [self.material((60 + 30 * k,) * 3) for k in range(5)]
        self.keep([trackpaint.create(self.ac, self.name, self.revision, asset, [{"mesh": 0, "u": (k + 1.5) / 7, "v": -.5, "whole": False}])
                   for k, asset in enumerate(greys)])
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            trackcopy.save(self.ac, self.name, "copy", "Copy")
        saved = kn5.read(str(Path(self.ac, "content/tracks/copy/copy.kn5")))
        regions = {node.name.split("region_")[1] for node in kn5.walk_meshes(saved["root"]) if "m2l_region" in node.name}
        self.assertEqual({0, 1}, {int(r.split("_")[0]) for r in regions})        # (both pieces have regional copies)
        numbers = {int(r.split("_")[1]) for r in regions}
        self.assertEqual(len(numbers), made.call_count)


if __name__ == "__main__":
    unittest.main()
