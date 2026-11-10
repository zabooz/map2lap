"""Imported models reach the kn5 as DDS with full mip chains: colour mixed in linear light, cutout leaves as dense far away."""
from dataclasses import replace
import io
from pathlib import Path
import shutil
import struct
import unittest
from unittest import mock

import numpy as np
from PIL import Image

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import modeldata, modelmesh, objectlibrary, trackcopy, trackedits
from track import kn5, textures

LIGHT = {"ksAmbient": .42, "ksDiffuse": .36}


def levels(raw):
    """Each mip of a BC1/BC3 DDS as RGBA pixels. Pure."""
    height, width, count = struct.unpack_from("<II", raw, 12) + (struct.unpack_from("<I", raw, 28)[0],)
    fourcc, offset, out = raw[84:88].decode(), 128, []
    for _ in range(count):
        size = ((width + 3) // 4) * ((height + 3) // 4) * (8 if fourcc == "DXT1" else 16)
        single = textures._dds_file([raw[offset:offset + size]], width, height, fourcc)
        out.append(np.asarray(Image.open(io.BytesIO(single)).convert("RGBA")))
        offset += size
        width, height = max(1, width // 2), max(1, height // 2)
    return out


def leaves(side=64, soft=True):
    """Leaves covering an eighth of the texels on a transparent ground: soft-edged blobs as painted, or single texels. Pure."""
    rng = np.random.default_rng(7)
    pixels = np.zeros((side, side, 4), np.uint8)
    pixels[..., :3] = (40, 120, 30)
    if soft:
        noise = np.asarray(Image.fromarray(rng.random((side // 4, side // 4)).astype(np.float32), "F").resize((side, side), Image.Resampling.BILINEAR))
        edge = np.quantile(noise, .875)
        pixels[..., 3] = np.rint(np.clip((noise - edge) * 20 + .5, 0, 1) * 255)
    else:
        pixels[..., 3] = (rng.random((side, side)) < .125) * 255
    return pixels


class EncodeTest(unittest.TestCase):
    def test_an_opaque_image_is_bc1_down_to_one_texel(self):
        raw = textures.dds_colour(np.full((16, 32, 4), 200, np.uint8), "OPAQUE")
        self.assertEqual(b"DXT1", raw[84:88])
        self.assertEqual([(16, 32), (8, 16), (4, 8), (2, 4), (1, 2), (1, 1)], [level.shape[:2] for level in levels(raw)])
        self.assertEqual(textures.dds_size(32, 16), len(raw))

    def test_mips_mix_colour_in_linear_light(self):
        checker = (np.indices((8, 8)).sum(axis=0) % 2 * 255).astype(np.uint8)
        raw = textures.dds_colour(np.dstack([checker] * 3 + [np.full((8, 8), 255, np.uint8)]), "OPAQUE")
        self.assertTrue(np.all(np.abs(levels(raw)[1][..., :3].astype(int) - 188) <= 6), levels(raw)[1][0, 0])

    def test_cutout_leaves_keep_their_coverage_in_every_mip(self):
        raw = textures.dds_colour(leaves(), "MASK", .5)
        self.assertEqual(b"DXT5", raw[84:88])
        for level in levels(raw):
            if level.shape[0] >= 8:
                self.assertAlmostEqual(float(np.mean(leaves()[..., 3] >= 128)), float(np.mean(level[..., 3] >= 128)), delta=.03, msg=level.shape)
        for level in levels(textures.dds_colour(leaves(soft=False), "MASK", .5))[:-1]:
            self.assertGreater(float(np.mean(level[..., 3] >= 128)), .05, "Single leaf texels must not vanish far away")

    def test_cutout_alpha_is_all_or_nothing_in_every_mip_at_any_cutoff(self):
        # (alpha-to-coverage draws 40 % alpha as 40 % of the pixels: far leaves became a screen door in AC)
        for cutoff in (.2, .5):
            for level in levels(textures.dds_colour(leaves(), "MASK", cutoff)):
                with self.subTest(cutoff=cutoff, size=level.shape[0]):
                    self.assertLessEqual(set(np.unique(level[..., 3])), {0, 255})
        image = leaves()
        for level in levels(textures.dds_colour(image, "MASK", .2)):
            if level.shape[0] >= 8:
                self.assertAlmostEqual(float(np.mean(image[..., 3] >= .2 * 255)), float(np.mean(level[..., 3] == 255)), delta=.03, msg=level.shape)

    def test_blended_alpha_is_averaged(self):
        image = leaves()
        raw = textures.dds_colour(image, "BLEND")
        self.assertAlmostEqual(float(image[..., 3].mean()), float(levels(raw)[2][..., 3].mean()), delta=3)

    def test_transparent_texels_lend_no_colour_to_the_mips(self):
        raw = textures.dds_colour(leaves(), "MASK", .5)
        visible = levels(raw)[2]
        np.testing.assert_allclose(visible[visible[..., 3] > 0][:, :3].mean(axis=0), (40, 120, 30), atol=8)


def model_with(image):
    """The fixture tree, its leaves from this image. Pure."""
    document, binary = fixture()
    out = io.BytesIO(); Image.fromarray(image).save(out, "PNG")
    return replace(modeldata.load(encode(document, binary)), images=(out.getvalue(),))


class RecipeTest(unittest.TestCase):
    def test_a_recipe_names_a_dds_of_power_of_two_sides_at_most_2048(self):
        for size, expected in (((48, 20), (64, 16)), ((4096, 16), (2048, 16)), ((1024, 512), (1024, 512))):
            with self.subTest(size=size):
                model = model_with(np.full((size[1], size[0], 4), 90, np.uint8))
                _native, recipes = modelmesh.materials(model, "a" * 64, LIGHT)
                name, recipe = next(iter(recipes.items()))
                self.assertTrue(name.endswith(".dds"))
                raw = modelmesh.dds(model, recipe)
                self.assertEqual(expected, struct.unpack_from("<II", raw, 12)[::-1])
                self.assertEqual(len(raw), recipe["bytes"])


class SaveTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)
        document, binary = fixture()
        prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        self.asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]["id"]

    def placed(self, name):
        now = trackedits.load(self.ac, name)
        model = trackedits.model(self.ac, name, {"base": now["base"], "revision": now["revision"], "model": self.asset, "at": [20, 0, 5]})["model"]
        now = trackedits.load(self.ac, name)
        trackedits.save_telling(self.ac, name, {"base": now["base"], "revision": now["revision"], "id": "m", "deleted": [], "models": [*now["models"], model]})

    def native(self, name):
        return kn5.read(str(Path(self.ac, "content/tracks", name, name + ".kn5")))

    def model_maps(self, native):
        return {next(n for slot, _i, n in m.maps if slot == "txDiffuse") for m in native["materials"] if m.name.startswith("m2l_model_")}

    def test_save_writes_the_leaves_as_bc3_dds(self):
        self.placed(self.name)
        trackcopy.save(self.ac, self.name, "dds_tree", "DDS tree")
        native = self.native("dds_tree")
        (name,) = self.model_maps(native)
        raw = {n: r for n, _a, r in native["textures"]}[name]
        self.assertTrue(name.endswith(".dds"))
        self.assertEqual((b"DDS ", b"DXT5"), (raw[:4], raw[84:88]))

    def test_a_saved_track_takes_the_new_image_and_drops_the_old(self):
        with mock.patch.object(modelmesh, "ENCODER", "an older encoder"):
            self.placed(self.name)
            trackcopy.save(self.ac, self.name, "old_tree", "Old tree")
        (old,) = self.model_maps(self.native("old_tree"))
        for relative in ("cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        self.placed("old_tree")
        trackcopy.save(self.ac, "old_tree", "new_tree", "New tree")
        native = self.native("new_tree")
        names = {n for n, _a, _r in native["textures"] if n.startswith("map2lap_model_")}
        (new,) = self.model_maps(native)
        self.assertNotEqual(old, new)
        self.assertEqual({new}, names, "The old image goes once no material uses it")


if __name__ == "__main__": unittest.main()
