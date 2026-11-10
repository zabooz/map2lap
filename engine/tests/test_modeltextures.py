"""An imported model's images are reduced to the chosen texture size once, at import: preview, Editor and Save read the same GLB."""
import io
from pathlib import Path
import unittest
from unittest import mock

import numpy as np
from PIL import Image

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import modeldata, modelimport, objectlibrary, trackcopy, trackedits
from track import kn5


def png(pixels, mode=None):
    """An image's PNG bytes from an array. Pure."""
    out = io.BytesIO()
    Image.fromarray(np.asarray(pixels, np.uint8), mode).save(out, "PNG")
    return out.getvalue()


def glb(images, roles=("baseColorTexture",), extra_images=()):
    """The fixture tree with these images, the first used by every role in roles. Pure."""
    document, binary = fixture()
    binary = bytearray(binary)
    document["images"] = []
    for raw in [*images, *extra_images]:
        binary.extend(b"\0" * (-len(binary) % 4))
        document["bufferViews"].append({"buffer": 0, "byteOffset": len(binary), "byteLength": len(raw)})
        binary.extend(raw)
        document["images"].append({"bufferView": len(document["bufferViews"]) - 1, "mimeType": "image/png"})
    material = document["materials"][0]
    material["pbrMetallicRoughness"].pop("baseColorTexture")
    for role in roles:
        (material["pbrMetallicRoughness"] if role in ("baseColorTexture", "metallicRoughnessTexture") else material)[role] = {"index": 0}
    document["buffers"][0]["byteLength"] = len(binary)
    return document, bytes(binary)


def images(raw):
    """The decoded images of a GLB, in order. Pure."""
    return [Image.open(io.BytesIO(image)) for image in modeldata.load(raw).images]


class ReduceTest(unittest.TestCase):
    def test_the_long_side_is_reduced_and_the_rest_of_the_model_is_kept(self):
        raw = encode(*glb([png(np.full((16, 32, 4), 200))]))
        reduced = modelimport.texture_size(raw, 8)
        self.assertEqual((8, 4), images(reduced)[0].size)
        before, after = modeldata.load(raw), modeldata.load(reduced)
        np.testing.assert_array_equal(before.primitives[0].positions, after.primitives[0].positions)
        self.assertEqual(before.materials, after.materials)

    def test_a_small_model_stays_byte_for_byte(self):
        raw = encode(*glb([png(np.full((8, 8, 4), 200))]))
        self.assertIs(raw, modelimport.texture_size(raw, 8))

    def test_colour_is_averaged_in_linear_light(self):
        checker = np.indices((16, 16)).sum(axis=0) % 2 * 255
        raw = encode(*glb([png(np.dstack([checker] * 3 + [np.full((16, 16), 255)]))]))
        grey = np.asarray(images(modelimport.texture_size(raw, 4))[0].convert("RGB"))
        self.assertTrue(np.all(np.abs(grey.astype(int) - 188) <= 2), grey[0, 0])

    def test_transparent_pixels_lend_no_colour_to_the_edge(self):
        pixels = np.zeros((16, 16, 4), np.uint8)
        pixels[:, :8] = (255, 255, 255, 255)
        raw = encode(*glb([png(pixels)]))
        edge = np.asarray(images(modelimport.texture_size(raw, 4))[0].convert("RGBA"))
        visible = edge[..., 3] > 16
        self.assertTrue(np.all(edge[visible][:, :3] >= 250), edge[visible])

    def test_a_normal_map_keeps_unit_normals(self):
        x = np.linspace(-.9, .9, 16)
        n = np.dstack([np.tile(x, (16, 1)), np.zeros((16, 16)), np.ones((16, 16))])
        n /= np.linalg.norm(n, axis=2, keepdims=True)
        raw = encode(*glb([png(np.rint((n * .5 + .5) * 255))], roles=("normalTexture",)))
        out = np.asarray(images(modelimport.texture_size(raw, 4))[0].convert("RGB"), np.float64) / 255 * 2 - 1
        np.testing.assert_allclose(np.linalg.norm(out, axis=2), 1, atol=.02)

    def test_an_image_both_colour_and_normal_is_left_as_it_is(self):
        image = png(np.full((16, 16, 3), 128))
        raw = encode(*glb([image], roles=("baseColorTexture", "normalTexture")))
        self.assertEqual((16, 16), images(modelimport.texture_size(raw, 4))[0].size)

    def test_a_webp_alternative_goes_so_the_browser_shows_the_reduced_image(self):
        webp = io.BytesIO(); Image.new("RGB", (32, 32), "red").save(webp, "WEBP")
        document, binary = glb([png(np.full((32, 32, 3), 90))], extra_images=[webp.getvalue()])
        document["images"][1]["mimeType"] = "image/webp"
        document["textures"][0]["extensions"] = {"EXT_texture_webp": {"source": 1}}
        document["extensionsUsed"] = ["EXT_texture_webp"]
        reduced = modelimport.texture_size(encode(document, binary), 8)
        model = modeldata.load(reduced)
        self.assertEqual(1, len(model.images))
        self.assertNotIn("extensions", model.document["textures"][0])
        self.assertNotIn("EXT_texture_webp", model.document.get("extensionsUsed", []))
        self.assertEqual((8, 8), images(reduced)[0].size)


class ImportTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)
        self.raw = encode(*glb([png(np.full((1024, 2048, 4), 180))]))
        self.prepared = objectlibrary.prepare("big.glb", self.raw)

    def add(self, **settings):
        return objectlibrary.add({"token": self.prepared["token"], "filename": "big.glb", "name": "Big", **settings})["model"]

    def test_1k_is_the_default_and_the_upload_stays_in_the_package(self):
        asset = self.add()
        self.assertEqual((1024, 512), images(objectlibrary.original(asset["id"]))[0].size)
        self.assertEqual(1024, asset["texture_side"])
        folder = Path(self.ac, "library/objects", asset["id"])
        self.assertEqual(self.raw, (folder / asset["source"]["file"]).read_bytes())

    def test_2k_keeps_the_size_and_is_another_model(self):
        small, large = self.add(), self.add(texture_side=2048)
        self.assertNotEqual(small["id"], large["id"])
        self.assertEqual(self.raw, objectlibrary.original(large["id"]))
        self.assertNotIn("source", large)

    def test_the_preview_is_what_is_added(self):
        self.assertEqual(objectlibrary.prepared_model(self.prepared["token"], texture_side=1024), objectlibrary.original(self.add()["id"]))

    def test_other_sizes_are_refused(self):
        for side in (4096, 512, "1024", None):
            with self.subTest(side=side), self.assertRaisesRegex(ValueError, "texture size"):
                self.add(texture_side=side)

    def test_save_writes_the_reduced_image(self):
        asset = self.add()
        now = trackedits.load(self.ac, self.name)
        model = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset["id"], "at": [20, 0, 5]})["model"]
        now = trackedits.load(self.ac, self.name)
        trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "m", "deleted": [], "models": [model]})
        trackcopy.save(self.ac, self.name, "big_saved", "Big")
        native = kn5.read(str(Path(self.ac, "content/tracks/big_saved/big_saved.kn5")))
        image = next(raw for name, _a, raw in native["textures"] if name.startswith("map2lap_model_"))
        self.assertEqual((1024, 512), Image.open(io.BytesIO(image)).size)


if __name__ == "__main__": unittest.main()
