"""Edited materials and shared detail images leave streamed KN5 geometry and existing texture payloads intact."""
from dataclasses import replace
from pathlib import Path
import sys
import tempfile
import unittest

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import kn5

IDENTITY = (1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1., 0, 0, 0, 0, 1.)


class HeaderTest(unittest.TestCase):
    def test_explicit_texture_filter_streams_foreign_payloads_and_rejects_removing_referenced_images(self):
        with tempfile.TemporaryDirectory() as temporary:
            source, target = (Path(temporary, name + ".kn5") for name in ("source", "target"))
            material = kn5.Material("base", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, "original")])
            kn5.write(source, [("original", b"source image"), ("own_stale", b"derived"), ("foreign_unused", b"keep me")],
                      [material], kn5.Node(1, "root", 1, matrix=IDENTITY))
            original = source.read_bytes()
            kn5.without_faces(source, target, {}, drop_textures={"own_stale"})
            result = kn5.read(target)
            self.assertEqual([("original", b"source image"), ("foreign_unused", b"keep me")],
                             [(n, raw) for n, _active, raw in result["textures"]])
            self.assertEqual(original, source.read_bytes())
            self.assertEqual([material], result["materials"])
            self.assertEqual(result["size"], result["end"])
            with self.assertRaisesRegex(ValueError, "referenced"):
                kn5.without_faces(source, target, {}, drop_textures={"original"})

    def test_appending_derived_materials_keeps_existing_material_numbers_and_source_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            source, target = (Path(temporary, name + ".kn5") for name in ("source", "target"))
            material = kn5.Material("base", "ksPerPixel", 0, 0, 0, [], [])
            derived = replace(material, name="regional", shader="ksPerPixelMultiMap_NMDetail")
            kn5.write(source, [], [material], kn5.Node(1, "root", 1, matrix=IDENTITY))
            before = source.read_bytes()
            kn5.without_faces(source, target, {}, materials=[material, derived])
            self.assertEqual([material, derived], kn5.read(target)["materials"])
            self.assertEqual(before, source.read_bytes())

    def test_material_edits_and_one_shared_image_preserve_meshes_and_unmodified_textures(self):
        with tempfile.TemporaryDirectory() as temporary:
            source, target = (Path(temporary, name + ".kn5") for name in ("source", "target"))
            material = kn5.Material("ground_0_0", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, "tile.dds")])
            vertices = np.zeros(3, kn5.VERTEX)
            vertices["pos"] = [(0, 10, 0), (2, 10, 0), (0, 12, -2)]
            vertices["uv"] = [(0, 0), (.1, 0), (0, -.1)]
            root = kn5.Node(1, "map2lap", 1, matrix=IDENTITY, children=[
                kn5.Node(2, "1ROAD_ground_0_0", 1, visible=1, vertices=vertices,
                         indices=np.array([0, 2, 1], "<u2"), bs_center=(0, 10, 0), bs_radius=2)])
            kn5.write(source, [("tile.dds", b"original"), ("other.png", b"untouched")], [material], root)
            original = source.read_bytes()
            changed = replace(material, shader="ksPerPixel_dual_layer", maps=[("txDiffuse", 0, "shared.dds")])
            moved = kn5.without_faces(source, target, {}, texture_bytes=lambda i: b"mask" if i == 0 else None,
                                     materials=[changed], textures=[("shared.dds", b"new detail")])
            result = kn5.read(target)
            self.assertEqual({0: 0}, moved)
            self.assertEqual(original, source.read_bytes())
            self.assertEqual([(name, raw) for name, _active, raw in result["textures"]],
                             [("tile.dds", b"mask"), ("other.png", b"untouched"), ("shared.dds", b"new detail")])
            self.assertEqual(changed, result["materials"][0])
            actual = result["root"].children[0]
            self.assertEqual(vertices.tobytes(), actual.vertices.tobytes())
            self.assertEqual(root.children[0].indices.tobytes(), actual.indices.tobytes())
            self.assertEqual(result["size"], result["end"])
            self.assertEqual("1ROAD_ground_0_0", actual.name)

    def test_adding_resources_without_replacing_existing_payloads_and_rejecting_index_changes(self):
        with tempfile.TemporaryDirectory() as temporary:
            source, target = (Path(temporary, name + ".kn5") for name in ("source", "target"))
            material = kn5.Material("base", "ksPerPixel", 0, 0, 0, [], [])
            kn5.write(source, [("tile.dds", b"original")], [material], kn5.Node(1, "root", 1, matrix=IDENTITY))
            kn5.without_faces(source, target, {}, materials=[replace(material, name="changed")], textures=[("extra", b"new")])
            result = kn5.read(target)
            self.assertEqual("changed", result["materials"][0].name)
            self.assertEqual(b"original", result["textures"][0][2])
            for kwargs in ({"materials": []}, {"textures": [("tile.dds", b"duplicate")]},
                           {"textures": [("extra", b"a"), ("extra", b"b")]}):
                with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                    kn5.without_faces(source, target, {}, **kwargs)


if __name__ == "__main__":
    unittest.main()
