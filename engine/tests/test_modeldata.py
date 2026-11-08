"""Imported GLB resources stay shared while scene transforms and leaf materials remain explicit."""
import io
import base64
import json
from pathlib import Path
import struct
import sys
import unittest

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import modeldata


def fixture():
    binary = bytearray()
    views = []

    def append(raw):
        while len(binary) % 4:
            binary.append(0)
        index = len(views)
        views.append({"buffer": 0, "byteOffset": len(binary), "byteLength": len(raw)})
        binary.extend(raw)
        return index

    positions = append(np.array([[-1, 1, 0], [1, 1, 0], [0, 3, 0]], "<f4").tobytes())
    indices = append(np.array([0, 1, 2], "<u2").tobytes())
    image = io.BytesIO()
    Image.new("RGBA", (4, 4), (30, 140, 40, 120)).save(image, "PNG")
    leaf = append(image.getvalue())
    document = {"asset": {"version": "2.0"}, "buffers": [{"byteLength": len(binary)}], "bufferViews": views,
                "accessors": [{"bufferView": positions, "componentType": 5126, "count": 3, "type": "VEC3"},
                              {"bufferView": indices, "componentType": 5123, "count": 3, "type": "SCALAR"}],
                "images": [{"bufferView": leaf, "mimeType": "image/png"}], "textures": [{"source": 0}],
                "materials": [{"name": "Leaves", "alphaMode": "MASK", "alphaCutoff": .4, "doubleSided": True,
                               "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "roughnessFactor": .9, "metallicFactor": 0}}],
                "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1, "material": 0}]}],
                "nodes": [{"translation": [10, 2, -4], "children": [1]}, {"mesh": 0, "scale": [2, 2, 2]}],
                "scenes": [{"nodes": [0]}], "scene": 0}
    return document, bytes(binary)


def encode(document, binary):
    text = json.dumps(document, separators=(",", ":")).encode()
    text += b" " * (-len(text) % 4)
    binary += b"\0" * (-len(binary) % 4)
    chunks = struct.pack("<II", len(text), 0x4e4f534a) + text + struct.pack("<II", len(binary), 0x004e4942) + binary
    return struct.pack("<4sII", b"glTF", 2, len(chunks) + 12) + chunks


class ModelTest(unittest.TestCase):
    def test_scene_transforms_ground_anchor_and_alpha_leaf_material_survive_import(self):
        document, binary = fixture()
        model = modeldata.load(encode(document, binary))
        np.testing.assert_allclose(model.bounds, [[8, 4, -4], [12, 8, -4]])
        self.assertEqual([10, 4, -4], model.anchor)
        self.assertEqual(1, len(model.primitives))
        self.assertEqual(1, len(model.instances))
        self.assertEqual(0, model.primitives[0].material)
        self.assertEqual("MASK", model.materials[0]["alphaMode"])
        self.assertEqual(.4, model.materials[0]["alphaCutoff"])
        self.assertTrue(model.materials[0]["doubleSided"])
        with Image.open(io.BytesIO(model.images[0])) as image:
            self.assertEqual(120, image.getpixel((0, 0))[3])

    def test_repeated_nodes_share_one_geometry_and_one_embedded_image(self):
        document, binary = fixture()
        document["nodes"].append({"mesh": 0, "translation": [20, 0, 0]})
        document["scenes"][0]["nodes"].append(2)
        model = modeldata.load(encode(document, binary))
        self.assertEqual(1, len(model.primitives))
        self.assertEqual(2, len(model.instances))
        self.assertEqual(model.instances[0].primitives, model.instances[1].primitives)
        self.assertEqual(1, len(model.images))
        self.assertFalse(model.primitives[0].positions.flags.writeable)
        np.testing.assert_allclose(model.bounds, [[8, 1, -4], [21, 8, 0]])

    def test_interleaved_positions_and_normalized_uvs_are_read_without_changing_units(self):
        document, binary = fixture()
        start = (len(binary) + 3) // 4 * 4
        binary += b"\0" * (start - len(binary))
        values = np.array([[99, -1, 1, 0], [99, 1, 1, 0], [99, 0, 3, 0]], "<f4")
        document["bufferViews"].append({"buffer": 0, "byteOffset": start, "byteLength": values.nbytes, "byteStride": 16})
        document["accessors"][0].update(bufferView=3, byteOffset=4)
        binary += values.tobytes()
        uv = np.array([[0, 0], [65535, 0], [32768, 65535]], "<u2")
        document["bufferViews"].append({"buffer": 0, "byteOffset": len(binary), "byteLength": uv.nbytes})
        binary += uv.tobytes()
        document["accessors"].append({"bufferView": 4, "componentType": 5123, "count": 3, "type": "VEC2", "normalized": True})
        document["meshes"][0]["primitives"][0]["attributes"]["TEXCOORD_0"] = 2
        document["buffers"][0]["byteLength"] = len(binary)
        model = modeldata.load(encode(document, binary))
        np.testing.assert_allclose(model.primitives[0].positions, [[-1, 1, 0], [1, 1, 0], [0, 3, 0]])
        np.testing.assert_allclose(model.primitives[0].uvs[[0, 1]], [[0, 0], [1, 0]])

    def test_external_resources_unsupported_required_extensions_and_animation_are_explicit_errors(self):
        for field, value, message in (("buffers", [{"byteLength": 36, "uri": "other.bin"}], "embedded"),
                                      ("images", [{"uri": "leaves.png"}], "embedded"),
                                      ("extensionsRequired", ["KHR_draco_mesh_compression"], "extension"),
                                      ("animations", [{}], "animation")):
            document, binary = fixture()
            document[field] = value
            with self.subTest(field=field), self.assertRaisesRegex(ValueError, message):
                modeldata.load(encode(document, binary))

    def test_invalid_binary_ranges_indices_and_cyclic_scenes_are_refused(self):
        document, binary = fixture()
        document["accessors"][0]["count"] = 99999999
        with self.assertRaises(ValueError):
            modeldata.load(encode(document, binary))
        document, binary = fixture()
        document["nodes"][1]["children"] = [0]
        with self.assertRaisesRegex(ValueError, "cycle|tree"):
            modeldata.load(encode(document, binary))
        document, binary = fixture()
        view = document["bufferViews"][1]
        bad = bytearray(binary)
        struct.pack_into("<H", bad, view["byteOffset"], 9)
        with self.assertRaisesRegex(ValueError, "indices"):
            modeldata.load(encode(document, bytes(bad)))
        raw = encode(*fixture())
        with self.assertRaises(ValueError):
            modeldata.load(raw[:-1])

    def test_float_rounding_in_a_quaternion_does_not_scale_the_model(self):
        document, binary = fixture()
        half = 2 ** -.5 * (1 + 1e-7)
        document["nodes"][0]["rotation"] = [0, 0, half, half]
        model = modeldata.load(encode(document, binary))
        basis = model.instances[0].transform[:3, :3] / 2
        np.testing.assert_allclose(basis.T @ basis, np.eye(3), atol=1e-12)

    def test_incomplete_meshes_or_material_resources_cannot_be_imported(self):
        for number, change in enumerate((lambda doc: doc["meshes"][0].update(primitives=[]),
                       lambda doc: doc["materials"][0].update(alphaMode="UNKNOWN"),
                       lambda doc: doc["textures"][0].update(source=99),
                       lambda doc: doc["materials"][0]["pbrMetallicRoughness"].update(baseColorTexture={"index": 99}))):
            document, binary = fixture()
            change(document)
            with self.subTest(case=number), self.assertRaises(ValueError):
                modeldata.load(encode(document, binary))

    def test_numeric_overflow_and_oversized_scene_reference_lists_are_refused(self):
        document, binary = fixture()
        document["nodes"][0]["scale"] = [1e308, 1e308, 1e308]
        document["nodes"][1]["scale"] = [1, 1, 1]
        with self.assertRaisesRegex(ValueError, "finite"):
            modeldata.load(encode(document, binary))
        document, binary = fixture()
        document["scenes"][0]["nodes"] = [0] * (modeldata.MAX_NODES + 1)
        with self.assertRaisesRegex(ValueError, "nodes"):
            modeldata.load(encode(document, binary))

    def test_embedded_data_uris_are_self_contained_resources_too(self):
        document, binary = fixture()
        source = modeldata.load(encode(document, binary))
        document["buffers"][0]["uri"] = "data:application/octet-stream;base64," + base64.b64encode(binary).decode()
        document["images"] = [{"uri": "data:image/png;base64," + base64.b64encode(source.images[0]).decode()}]
        model = modeldata.load(encode(document, b""))
        self.assertEqual(source.bounds, model.bounds)
        self.assertEqual(source.images, model.images)


if __name__ == "__main__":
    unittest.main()
