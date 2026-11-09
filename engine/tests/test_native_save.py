"""How much work a regional ground Save does: what a region's mask depends on is made once per Save, and a mask whose
inputs did not change since the track's last Save is taken from then."""
import copy
import hashlib
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import numpy as np

import test_ground_guard_editor as guarded
import test_trackpaint as paintfixture
from app import materiallibrary, trackcopy, trackdetail, trackground, trackinspect, trackmodels, tracknative, trackpaint, trackregions, trackview
from track import editorinfo, groundnormals, kn5, textures


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
        kept = {path.read_bytes() for path in tracknative._mask_folder(self.name).glob("*.dds")}     # (masks and photos)
        self.assertLessEqual(set(masks.values()), kept)
        self.assertLessEqual(kept, set(self.textures(self.name).values()))

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

    def test_the_size_check_and_the_export_clip_the_ground_once(self):
        self.keep(self.painted(5))
        # (a real build's ground has its border lighting already; this fixture's would be changed by it)
        with (mock.patch.object(groundnormals, "changed", side_effect=lambda _path, change: change),
              mock.patch.object(trackground, "clip_region", wraps=trackground.clip_region) as clipped):
            trackcopy.save(self.ac, self.name, "copy", "Copy")
        regions = {tuple(call.args[2]) for call in clipped.call_args_list}
        self.assertEqual(2 * len(regions), clipped.call_count)              # (two ground pieces)

    def test_a_moved_ground_piece_is_clipped_from_where_it_went(self):
        self.keep(self.painted(5))
        with open(self.path, "rb") as file:
            scan = kn5.scan(str(self.path))
            moved = kn5.mesh_arrays(file, scan["meshes"][0])[0].copy()
        source = moved["pos"][:, 1].min()
        moved["pos"][:, 1] += 5
        with mock.patch.object(groundnormals, "changed", side_effect=lambda _path, _change: kn5.Moved({0: moved}, {}, {})):
            trackcopy.save(self.ac, self.name, "moved", "Moved")
        target = Path(self.ac, "content/tracks/moved/moved.kn5")
        with open(target, "rb") as file:
            copies = [m for m in kn5.scan(str(target))["meshes"] if "m2l_region_0_" in m["name"]]
            lowest = min(kn5.mesh_arrays(file, m)[0]["pos"][:, 1].min() for m in copies)
        self.assertTrue(copies)
        self.assertAlmostEqual(source + 5, lowest, places=3)


    def tiles_read_by_export(self, *save):
        """How many tiles' weight fields tracknative.build reads itself during trackcopy.save(self.ac, self.name, *save)."""
        real, reads = tracknative.build, []

        def build(*args):
            with mock.patch.object(trackdetail, "_semantic", wraps=trackdetail._semantic) as semantic:
                result = real(*args)
            reads.append(semantic.call_count)
            return result
        with mock.patch.object(tracknative, "build", build):
            trackcopy.save(self.ac, self.name, *save)
        return reads[0]

    def test_a_save_with_its_masks_kept_reads_no_tile_again(self):
        self.keep(self.painted(5))
        self.assertEqual(1, self.tiles_read_by_export())
        self.assertEqual(0, self.tiles_read_by_export())

    def test_a_mask_gone_from_the_cache_reads_its_tile_and_makes_that_mask_alone(self):
        self.keep(self.painted(5))
        trackcopy.save(self.ac, self.name)
        first = self.saved(self.name)[1]
        next(path for path in tracknative._mask_folder(self.name).glob("*.dds") if path.read_bytes() in first.values()).unlink()
        with mock.patch.object(tracknative, "region_mask", wraps=tracknative.region_mask) as made:
            self.assertEqual(1, self.tiles_read_by_export())
        self.assertEqual(1, made.call_count)
        self.assertEqual(first, self.saved(self.name)[1])

    def test_a_tile_prepared_without_mask_keys_saves_the_same_masks(self):
        paints = self.painted(5)
        self.keep(paints)
        trackcopy.save(self.ac, self.name, "with_keys", "With keys")
        shutil.rmtree(tracknative._mask_folder(self.name))
        self.keep(paints)                   # (a Save as a copy leaves the track's draft empty)
        real = trackdetail.native_descriptors
        with mock.patch.object(trackdetail, "native_descriptors", side_effect=lambda ac, name, ds: real(ac, name, ds, keys=False)):
            trackcopy.save(self.ac, self.name, "without_keys", "Without keys")
        self.assertTrue(self.saved("with_keys")[1])
        self.assertEqual(self.saved("with_keys")[1], self.saved("without_keys")[1])

    def test_the_size_estimate_makes_no_mask_keys(self):
        self.keep(self.painted(5))
        with mock.patch.object(tracknative, "_mask_key", wraps=tracknative._mask_key) as keys:
            self.assertIsNotNone(trackinspect.statistics(self.ac, self.name)["draft_bytes"])
        keys.assert_not_called()

    def test_a_selection_changed_during_a_save_is_refused_and_leaves_the_track_as_it_was(self):
        paints = self.painted(5)
        self.keep(paints)
        folder, record = trackpaint.operation(self.ac, self.name, paints[0])
        selection = folder / record["tiles"][0]["masks"][0]["file"]
        real = trackpaint.export

        def changed_after_export(*args):
            real(*args)
            selection.write_bytes(selection.read_bytes() + b"x")
        before = self.path.read_bytes()
        with mock.patch.object(trackpaint, "export", changed_after_export), self.assertRaises(trackcopy.Refused):
            trackcopy.save(self.ac, self.name)
        self.assertEqual(before, self.path.read_bytes())

    def textures(self, folder):
        return {n: raw for n, _a, raw in kn5.read(str(Path(self.ac, "content/tracks", folder, folder + ".kn5")))["textures"]}

    def test_a_save_without_changes_packs_no_photo_again_and_writes_what_a_save_from_nothing_writes(self):
        self.keep(self.painted(5))
        trackcopy.save(self.ac, self.name)
        first = self.textures(self.name)
        with (mock.patch.object(textures, "dds_mipmaps", wraps=textures.dds_mipmaps) as packed,
              mock.patch.object(trackdetail, "tile_base", wraps=trackdetail.tile_base) as tiles):
            trackcopy.save(self.ac, self.name)
        packed.assert_not_called()
        tiles.assert_not_called()
        self.assertEqual(first, self.textures(self.name))
        shutil.rmtree(tracknative._mask_folder(self.name))
        trackcopy.save(self.ac, self.name)
        self.assertEqual(first, self.textures(self.name))

    def test_a_save_keeps_only_the_files_it_used(self):
        paints = self.painted(5)
        self.keep(paints)
        trackcopy.save(self.ac, self.name)
        folder = tracknative._mask_folder(self.name)
        (folder / "old.png").write_bytes(b"old")
        self.keep(paints[:4])
        trackcopy.save(self.ac, self.name)
        self.assertFalse((folder / "old.png").exists())
        self.assertTrue(list(folder.glob("*.dds")))

    def test_a_deleted_track_leaves_no_kept_images(self):
        import server
        self.keep(self.painted(5))
        trackcopy.save(self.ac, self.name)
        folder = tracknative._mask_folder(self.name)
        self.assertTrue(list(folder.iterdir()))
        with mock.patch.object(server.settings, "ac_path", return_value=self.ac):
            self.assertEqual(200, server.delete_track(self.name)[0])
        self.assertFalse(folder.exists())


class PhotoKeyTest(unittest.TestCase):
    """_photo_key against what a ground photo's packed images are made from."""

    @staticmethod
    def material(guard=0., extent=None):
        empty = ((0., 0.), (0., 0., 0.), (0., 0., 0., 0.))
        props = [("m2lUVGuard", guard, *empty)] if guard else []
        if extent:
            props.append(("m2lBaseExtent", 0., tuple(extent), *empty[1:]))
        return kn5.Material("m", "ksMultilayer_objsp", 0, 0, 0, props, [])

    def key(self, raw=b"a", ref=None, material=None, tile=(1, -2), sheen=0):
        return tracknative._photo_key(raw, ref or {"id": "base"}, material or self.material(), tile, sheen)

    def test_a_tiles_own_image_depends_on_its_bytes_tile_guard_ring_and_alpha(self):
        same = self.key()
        self.assertEqual(same, self.key())
        for other in (self.key(raw=b"b"), self.key(tile=(2, -2)), self.key(material=self.material(guard=.1)),
                      self.key(material=self.material(extent=(1.25, 1.25))), self.key(sheen=9)):
            self.assertNotEqual(same, other)

    def test_a_shared_photo_does_not_depend_on_the_tile(self):
        source = {"id": "source:3:0"}
        self.assertEqual(self.key(ref=source), self.key(ref=source, tile=(7, 7), material=self.material(guard=.1)))
        self.assertNotEqual(self.key(ref=source), self.key())

    def test_a_photo_with_a_detail_map_depends_on_it_and_its_properties(self):
        def ref(detail="k", scale=1., rough=.5):
            return {"id": "asset:a", "asset": "a", "detail": {"key": detail}, "properties": {"normal_scale": scale, "roughness": rough}}
        same = self.key(ref=ref())
        for other in (ref(detail="l"), ref(scale=.5), ref(rough=.8)):
            self.assertNotEqual(same, self.key(ref=other))


class KnHashTest(unittest.TestCase):
    """A Save's new kn5 is hashed once, however many records name it."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name, "track.kn5")
        self.path.write_bytes(b"first")
        trackmodels._hash_at.cache_clear()

    def test_the_models_and_the_ground_records_share_one_hash(self):
        with mock.patch.object(hashlib, "file_digest", wraps=hashlib.file_digest) as hashed:
            model = trackmodels._file_hash(str(self.path))
            self.assertEqual(model, trackdetail._kn5_digest(self.path))
        self.assertEqual(1, hashed.call_count)

    def test_a_rewritten_file_is_hashed_again(self):
        first = trackdetail._kn5_digest(self.path)
        self.path.write_bytes(b"second, longer")
        self.assertEqual(hashlib.sha256(b"second, longer").hexdigest(), trackdetail._kn5_digest(self.path))
        self.assertNotEqual(first, trackdetail._kn5_digest(self.path))


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
