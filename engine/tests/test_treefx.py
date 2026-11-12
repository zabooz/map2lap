"""treefx: our tree looks as CSP tree models (.bin, read the way Content Manager's AcTreeModelConverter writes them) and the
lines of a track's trees.txt."""
import os
import struct
import sys
import tempfile
import unittest
import zipfile
from unittest import mock

import numpy as np

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402
from scenery import treefx, trees  # noqa: E402
from track import make_obj, make_track_folder, objectlist  # noqa: E402


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

    def test_regional_kinds_have_their_own_forms_and_unknown_sprites_can_stay_billboards(self):
        for sprite in ("palm", "olive", "stone_pine", "cypress", "acacia", "baobab", "tropical", "juniper", "dry_shrub",
                       "jungle_bush"):
            self.assertEqual(sprite, treefx.model_of(sprite), sprite)
        self.assertIsNone(treefx.model_of("future_species"))
        self.assertEqual("broadleaf", treefx.model_of("linden"))
        self.assertEqual("spruce", treefx.model_of("conifer2"))


class TreesTxtTest(unittest.TestCase):
    def test_a_placement_scales_the_model_to_the_tree_and_its_line_reads_back_the_same(self):
        H, W = treefx.size("broadleaf")
        tree = treefx.placement("broadleaf", (1.5, 700.254, -20.0), 90.4, 2 * H, W / H)
        self.assertEqual({"model": "broadleaf", "pos": [1.5, 700.25, -20.0], "angle": 90.0, "size": 2.0, "width": 1.0}, tree)
        text = treefx.text(tree)
        self.assertTrue(text.startswith("tree: broadleaf.bin;"), text)
        self.assertEqual(tree, treefx.parse(text))

    def test_a_much_narrower_or_wider_tree_keeps_the_model_recognisable(self):
        H, W = treefx.size("spruce")
        self.assertEqual(0.6, treefx.placement("spruce", (0, 0, 0), 0, H, 0.1 * W / H)["width"])
        self.assertEqual(1.6, treefx.placement("spruce", (0, 0, 0), 0, H, 5 * W / H)["width"])

    def test_comments_and_empty_lines_are_no_trees(self):
        self.assertIsNone(treefx.parse("; Map2Lap"))
        self.assertIsNone(treefx.parse(""))


class SplitTest(unittest.TestCase):
    """trees.treefx_split: the build's trees (group, x, y, z, rotation, height, random value; ENU) as TreeFX trees where their
    look has a model."""

    def test_a_tree_with_a_model_stands_at_its_foot_in_ac_coordinates(self):
        rest, placed = trees.treefx_split([("deciduous", 10.0, 20.0, 5.0, 33.0, 12.0, 0.0)])
        sprite, ratio = trees.look_of(trees.STYLE, "deciduous", "temperate", 5.0, 0.0)
        model = treefx.model_of(sprite)
        self.assertEqual([], rest)
        self.assertEqual([treefx.placement(model, (10.0, 5.0 - trees.SINK_M, -20.0), 33.0, 12.0, ratio)], placed)

    def test_a_palm_uses_its_own_model(self):
        palm = ("palm", 0.0, 0.0, 1.0, 0.0, 9.0, 0.5)
        rest, placed = trees.treefx_split([palm])
        self.assertEqual([], rest)
        self.assertEqual("palm", placed[0]["model"])

    def test_a_mediterranean_look_uses_its_olive_model(self):
        olive = next(t for t in (("deciduous", 0.0, 0.0, 1.0, 0.0, 9.0, k / 1000) for k in range(8))
                     if trees.look_of({**trees.STYLE, **trees.ZONE_STYLE["mediterranean"]}, "deciduous", "mediterranean",
                                      1.0, t[6])[0] == "olive")
        rest, placed = trees.treefx_split([olive], zone="mediterranean")
        self.assertEqual([], rest)
        self.assertEqual("olive", placed[0]["model"])

    def test_a_tree_in_water_is_none_and_a_rock_stays_with_the_rest(self):
        rock = ("rock", 0.0, 0.0, 1.0, 0.0, 2.0, 0.5)
        wet = ("deciduous", 5.0, 0.0, 1.0, 0.0, 9.0, 0.5)
        self.assertEqual(([rock], []), trees.treefx_split([rock, wet], wet=lambda x, y: x > 1))

    def test_a_low_tree_is_as_high_as_its_billboard(self):
        _, placed = trees.treefx_split([("deciduous", 0.0, 0.0, 1.0, 0.0, 0.1, 0.0)])
        self.assertEqual(round(0.8 / treefx.size(placed[0]["model"])[0], 3), placed[0]["size"])


class SwitchTest(unittest.TestCase):
    """A build's trees with a model go to the tile's list as TreeFX trees instead of billboards; --billboards keeps them billboards."""

    def test_the_generator_builds_treefx_unless_told_billboards(self):
        for argv, on in ((["--name", "t", "1,2", "3,4"], True), (["--name", "t", "--billboards", "1,2", "3,4"], False)):
            with mock.patch.object(generator, "build", return_value={}) as build, \
                    mock.patch.object(generator.system, "trust_windows_certificates"), \
                    mock.patch.object(sys, "argv", ["generator.py", *argv]):
                generator.main()
            self.assertEqual(on, build.call_args.kwargs["treefx"])

    def test_build_and_an_anchor_without_the_switch_build_treefx(self):
        import inspect
        self.assertTrue(inspect.signature(generator.build).parameters["treefx"].default)
        self.assertTrue(make_obj.treefx_on({}))

    def test_off_every_tree_stays_a_billboard(self):
        items = [("deciduous", 0.0, 0.0, 1.0, 0.0, 9.0, 0.0), ("palm", 1.0, 0.0, 1.0, 0.0, 9.0, 0.0)]
        listed = objectlist.TileList()
        self.assertEqual(items, make_obj.to_treefx(listed, items, None, "temperate", False))
        self.assertEqual([], listed.treefx)

    def test_on_the_trees_with_a_model_go_to_the_tile_s_list(self):
        items = [("deciduous", 0.0, 0.0, 1.0, 0.0, 9.0, 0.0), ("palm", 1.0, 0.0, 1.0, 0.0, 9.0, 0.0)]
        listed = objectlist.TileList()
        self.assertEqual([], make_obj.to_treefx(listed, items, None, "temperate", True))
        self.assertEqual(trees.treefx_split(items)[1], listed.treefx)


class TrackFolderTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)
        self.root = self.dir.name
        os.makedirs(os.path.join(self.root, "extension"))
        self.config = os.path.join(self.root, "extension", "ext_config.ini")
        with open(self.config, "w", encoding="utf-8") as f:
            f.write(make_track_folder.EXT_CONFIG)

    def listed(self, *models):
        return {"next": len(models), "trees": {str(k): treefx.placement(m, (k, 1.0, 2.0), 0, 5.0, 0.5)
                                               for k, m in enumerate(models)}}

    def test_a_track_with_treefx_trees_gets_their_models_their_lines_and_its_config(self):
        make_track_folder.write_trees(self.root, self.listed("birch", "spruce", "birch"))
        folder = os.path.join(self.root, "extension", "trees")
        self.assertEqual(["birch.bin", "spruce.bin", "trees.txt"], sorted(os.listdir(folder)))
        with open(os.path.join(folder, "trees.txt"), encoding="utf-8") as f:
            lines = [t for t in map(treefx.parse, f.read().splitlines()) if t]
        self.assertEqual(list(self.listed("birch", "spruce", "birch")["trees"].values()), lines)
        with open(self.config, encoding="utf-8") as f:
            self.assertIn("\n[TREES]\nLIST_0 = trees/trees.txt\n", f.read())

    def test_a_track_without_keeps_no_trees_of_an_earlier_build(self):
        make_track_folder.write_trees(self.root, self.listed("birch"))
        with open(self.config, "w", encoding="utf-8") as f:     # (make writes it anew)
            f.write(make_track_folder.EXT_CONFIG)
        make_track_folder.write_trees(self.root, None)
        self.assertFalse(os.path.exists(os.path.join(self.root, "extension", "trees")))
        with open(self.config, encoding="utf-8") as f:
            self.assertNotIn("[TREES]", f.read())


if __name__ == "__main__":
    unittest.main()
