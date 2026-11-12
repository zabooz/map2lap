"""treefx: our tree looks as CSP tree models (.bin, read the way Content Manager's AcTreeModelConverter writes them) and the
lines of a track's trees.txt."""
import os
import struct
import sys
import tempfile
import unittest
import zipfile

import numpy as np

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

from scenery import treefx, trees  # noqa: E402


def read_mesh(test, data):
    """A tree .mesh read to its end: texture names, then the count of (diffuse, normal, indices, vertices) parts."""
    o, names, parts = 9, [], 0
    for _ in range(struct.unpack_from("<i", data, 5)[0]):
        n = struct.unpack_from("<i", data, o + 4)[0]
        names.append(data[o + 8:o + 8 + n].decode())
        o += 8 + n
    while o < len(data):
        if struct.unpack_from("<i", data, o)[0] == -1:          # (-1, 4, the trunk's width)
            o += 12
            continue
        ni = struct.unpack_from("<i", data, o + 8)[0]
        nv = struct.unpack_from("<i", data, o + 12 + 2 * ni)[0]
        o += 16 + 2 * ni + 44 * nv
        parts += 1
    test.assertEqual(o, len(data))
    return names, parts


def index_count(data):
    """The count of indices of a tree .mesh's first part. Pure."""
    o = 9
    for _ in range(struct.unpack_from("<i", data, 5)[0]):
        o += 8 + struct.unpack_from("<i", data, o + 4)[0]
    return struct.unpack_from("<i", data, o + 8)[0]


def ini_of(data):
    """{section: {key: value}} of an ini text. Pure."""
    out, section = {}, None
    for line in data.splitlines():
        line = line.strip()
        if line.startswith("["):
            section = out.setdefault(line[1:-1], {})
        elif "=" in line:
            key, value = line.split("=", 1)
            section[key.strip()] = value.strip()
    return out


class MeshTest(unittest.TestCase):
    def test_a_mesh_reads_to_its_end_with_its_names_after_a_four_byte_length(self):
        m = treefx.broadleaf(1, 0, 6, 6.0, 3.0, 3.0, 2.0, 5.0, 0.2)
        data, _ = treefx.mesh_bytes(m, [("a_d.png", b"x"), ("a_n.png", b"y")], 4.0, 10.0)
        self.assertEqual(read_mesh(self, data), (["a_d.png", "a_n.png"], 1))

    def test_a_coarser_lod_keeps_cards_of_the_same_crown(self):
        fine, coarse = (treefx.broadleaf(3, lod, 20, 6.0, 3.0, 3.0, 2.0, 5.0, 0.2) for lod in (0, 1))
        def centres(m, trunk_sides):
            return {tuple(np.round(np.mean(m.p[i:i + 4], axis=0), 4)) for i in range(4 * trunk_sides, len(m.p), 4)}
        self.assertEqual(len(centres(coarse, 5)), 10)
        self.assertLessEqual(centres(coarse, 5), centres(fine, 6))

    def test_every_face_is_written_once(self):
        for name in treefx.MODELS:
            for m in treefx.model(name)[1]:
                self.assertEqual(len({frozenset(t) for t in m.t}), len(m.t), name)


class BinTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)

    def test_a_model_holds_its_lods_finest_first_with_their_distances_and_textures(self):
        path = os.path.join(self.dir.name, "birch.bin")
        treefx.write_bin(path, "birch")
        with zipfile.ZipFile(path) as z:
            ini = ini_of(z.read("tree.ini").decode())
            indices = [index_count(z.read(ini[f"LOD_{i}"]["MODEL"])) for i in range(3)]
            self.assertEqual(["200", "300", "500"], [ini[f"LOD_{i}"]["DISTANCE"] for i in range(3)])
            self.assertEqual(sorted(indices, reverse=True), indices)
            self.assertGreater(indices[0], indices[2])
            self.assertIn("birch_d.png", z.namelist())
            self.assertIn("birch_n.png", z.namelist())

    def test_its_size_is_the_one_in_its_tree_ini(self):
        path = os.path.join(self.dir.name, "spruce.bin")
        treefx.write_bin(path, "spruce")
        with zipfile.ZipFile(path) as z:
            basic = ini_of(z.read("tree.ini").decode())["BASIC"]
        self.assertEqual(treefx.size("spruce"), (float(basic["HEIGHT"]), float(basic["WIDTH"])))

    def test_the_same_model_is_the_same_bytes_each_time(self):
        a, b = (os.path.join(self.dir.name, f"{k}.bin") for k in "ab")
        treefx.write_bin(a, "shrub")
        treefx.write_bin(b, "shrub")
        with zipfile.ZipFile(a) as za, zipfile.ZipFile(b) as zb:
            self.assertEqual({n: za.read(n) for n in za.namelist()}, {n: zb.read(n) for n in zb.namelist()})

    def test_write_models_writes_the_named_ones(self):
        self.assertEqual(["birch.bin", "larch.bin"], treefx.write_models(self.dir.name, ["larch", "birch", "larch"]))
        self.assertEqual(["birch.bin", "larch.bin"], sorted(os.listdir(self.dir.name)))


class KindsTest(unittest.TestCase):
    def test_every_sprite_with_a_model_names_one_that_exists(self):
        for sprite in trees.SPRITES:
            model = treefx.model_of(sprite)
            self.assertTrue(model is None or model in treefx.MODELS, sprite)

    def test_the_kinds_without_a_3d_form_stay_billboards(self):
        for sprite in ("palm", "olive", "stone_pine", "cypress", "acacia", "baobab", "tropical", "juniper", "dry_shrub",
                       "jungle_bush"):
            self.assertIsNone(treefx.model_of(sprite), sprite)
        self.assertEqual("broadleaf", treefx.model_of("linden"))
        self.assertEqual("spruce", treefx.model_of("conifer2"))


class TreesTxtTest(unittest.TestCase):
    def test_a_line_scales_the_model_to_the_tree_and_reads_back(self):
        H, W = treefx.size("broadleaf")
        text = treefx.line("broadleaf", (1.5, 700.25, -20.0), 90.0, 2 * H, W / H)
        self.assertTrue(text.startswith("tree: broadleaf.bin;"), text)
        self.assertEqual({"model": "broadleaf", "pos": (1.5, 700.25, -20.0), "angle": 90.0, "size": 2.0, "width": 1.0},
                         treefx.parse(text))

    def test_a_much_narrower_or_wider_tree_keeps_the_model_recognisable(self):
        H, W = treefx.size("spruce")
        self.assertEqual(0.6, treefx.parse(treefx.line("spruce", (0, 0, 0), 0, H, 0.1 * W / H))["width"])
        self.assertEqual(1.6, treefx.parse(treefx.line("spruce", (0, 0, 0), 0, H, 5 * W / H))["width"])

    def test_comments_and_empty_lines_are_no_trees(self):
        self.assertIsNone(treefx.parse("; Map2Lap"))
        self.assertIsNone(treefx.parse(""))


if __name__ == "__main__":
    unittest.main()
