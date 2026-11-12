"""Wall edits isolate source triangles, keep both feet fixed and preserve metre-scale UVs."""
import os
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))
import generator  # noqa: E402,F401
import roadmesh  # noqa: E402
from app import materiallibrary, mytracks, trackcopy, trackedits, trackview, trackwalls  # noqa: E402
from track import kn5, make_obj, obj_to_kn5, objectlist  # noqa: E402
from test_wallsolid import wall  # noqa: E402


class WallEditsTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        records = []
        a, b = wall(False), wall(True, thick=0.45)
        b["base"][:, 1] += 15
        P, T, UV, _mats, _M = roadmesh.tunnel([], (0, 0, 0), walls=[a, b], objects=records)
        self.profile = records[0]["details"]["wall"]
        part = os.path.join(tmp.name, "t_0_0.obj")
        obj = make_obj.Obj(part, header=False)
        owners = np.concatenate([np.full(r["count"], k) for k, r in enumerate(records)])
        for r in records:
            obj.listed.new(r["kind"], *r["at"], details=r["details"])
        obj.add("1WALL_tunnel_stone_0_0", "m", P, UV, T, owners=owners[T[:, 0]])
        obj.close()
        chunk = os.path.join(tmp.name, "c.bin")
        nodes, _, _, listed, _ = obj_to_kn5._part_chunk(part, chunk, {"m": 0}, None)
        self.path = os.path.join(tmp.name, "x.kn5")
        kn5.write_streamed(self.path, [], [kn5.Material("m", "ksPerPixel", 0, 0, 0, [], [])],
                           kn5.Node(1, "map2lap", 1, matrix=np.eye(4).ravel()), [chunk], nodes)
        self.scan, self.objects = kn5.scan(self.path), listed

    def test_only_the_cap_moves_front_and_back_feet_stay(self):
        edits = [{"id": "t_0_0#0", "rise": 1.25, "material": None}]
        scan, objects = trackwalls.extend(self.path, self.scan, self.objects, edits)
        self.assertEqual(self.objects["t_0_0"]["faces"][1], objects["t_0_0"]["faces"][1])
        self.assertEqual(self.objects["t_0_0"]["faces"][0], scan["wall_hidden"])
        with open(self.path, "rb") as f:
            before, _ = kn5.mesh_arrays(f, self.scan["meshes"][0])
        after = np.concatenate([m["data"][0] for m in scan["meshes"] if m.get("wall")])
        top = {tuple(p) for p in np.asarray(self.profile["tops"], np.float32)}
        expected = {tuple(np.asarray(p + (np.array([0, 1.25, 0]) if tuple(p) in top else 0), np.float32)) for p in before["pos"]
                    if p[2] > -10}
        self.assertEqual(expected, set(map(tuple, after["pos"])))
        self.assertTrue(np.isfinite(after["normal"]).all())
        self.assertTrue(np.allclose(np.linalg.norm(after["normal"], axis=1), 1))

    def test_texture_repeats_in_metres_without_changing_other_wall(self):
        asset = {"id": "a" * 64, "repeat": [6, 1.5], "colour": b"test colour"}
        scan, objects = trackwalls.extend(self.path, self.scan, self.objects,
                                         [{"id": "t_0_0#0", "rise": 0, "material": asset["id"]}], {asset["id"]: asset})
        self.assertEqual(self.objects["t_0_0"]["faces"][1], objects["t_0_0"]["faces"][1])
        self.assertEqual(2, len(scan["materials"]))
        self.assertEqual(1, len(scan["wall_images"]))
        with open(self.path, "rb") as f:
            v, faces = kn5.mesh_arrays(f, self.scan["meshes"][0])
        source = v[faces[:sum(n for _, _, n in self.objects["t_0_0"]["faces"][0])].ravel()]
        result = np.concatenate([m["data"][0] for m in scan["meshes"] if m.get("wall")])
        self.assertAlmostEqual(float(source["uv"][:, 0].max()) * 0.5, float(result["uv"][:, 0].max()), places=4)
        self.assertAlmostEqual(float(source["uv"][:, 1].min()) * 2, float(result["uv"][:, 1].min()), places=4)

    def test_lowering_keeps_both_feet_and_moves_only_the_cap(self):
        scan, _ = trackwalls.extend(self.path, self.scan, self.objects, [{"id": "t_0_0#0", "rise": -1, "material": None}])
        with open(self.path, "rb") as f:
            before, _ = kn5.mesh_arrays(f, self.scan["meshes"][0])
        after = np.concatenate([m["data"][0] for m in scan["meshes"] if m.get("wall")])
        top = {tuple(p) for p in np.asarray(self.profile["tops"], np.float32)}
        expected = {tuple(np.asarray(p + (np.array([0, -1, 0]) if tuple(p) in top else 0), np.float32)) for p in before["pos"]
                    if p[2] > -10}
        self.assertEqual(expected, set(map(tuple, after["pos"])))
        self.assertTrue(np.isfinite(after["normal"]).all())
        self.assertTrue(np.allclose(np.linalg.norm(after["normal"], axis=1), 1))

    def test_refuses_a_non_wall_and_lowering_through_either_foot(self):
        for edits in ([{"id": "t_0_0#99", "rise": 1, "material": None}],
                      [{"id": "t_0_0#0", "rise": -2, "material": None}],
                      [{"id": "t_0_0#1", "rise": -3, "material": None}]):
            with self.assertRaises(ValueError):
                trackwalls.extend(self.path, self.scan, self.objects, edits)

    def test_reusing_a_material_already_in_the_source_does_not_duplicate_its_texture(self):
        key = "b" * 64
        tex = f"map2lap_wall_{key}.dds"
        scan = {**self.scan, "textures": [(tex, 24, 100)], "materials": [
            *self.scan["materials"], kn5.Material(f"map2lap_wall_{key}", "ksPerPixel", 0, 0, 0, [], [("txDiffuse", 0, tex)])]}
        result, _ = trackwalls.extend(self.path, scan, self.objects, [{"id": "t_0_0#0", "rise": 0, "material": key}],
                                     {key: {"repeat": [3, 3], "colour": b"dds"}})
        self.assertEqual(scan["textures"], result["textures"])
        self.assertEqual({}, result["wall_images"])

    def test_draft_save_and_restore_keep_the_wall_edit(self):
        import shutil
        root = os.path.dirname(self.path)
        folder = os.path.join(root, "content", "tracks", "t")
        os.makedirs(os.path.join(folder, "data"))
        os.makedirs(os.path.join(folder, "ui"))
        target = os.path.join(folder, "t.kn5")
        shutil.copyfile(self.path, target)
        objectlist.write(target, self.objects)
        mytracks.save(folder, {"title": "Wall test", "points": [[1, 2], [3, 4]], "width": 100})
        with mock.patch.object(mytracks, "ROOT", root):
            now = trackedits.load(root, "t")
            walls = [{"id": "t_0_0#0", "rise": 1.25, "material": None}]
            answer = trackedits.save_telling(root, "t", {"base": now["base"], "revision": now["revision"], "id": "wall-test",
                                                        "deleted": [], "walls": walls})
            self.assertIn(-1, answer["meshes"])
            self.assertEqual(walls, trackedits.load(root, "t")["walls"])
            shown = trackview.index(root, "t")
            self.assertTrue(shown["wall_hidden"])
            self.assertTrue(any(m["copy"] for m in shown["meshes"]))
            trackcopy.save(root, "t", copy_to="t_copy")
            saved = os.path.join(root, "content", "tracks", "t_copy", "t_copy.kn5")
            self.assertEqual(walls, trackedits.load(root, "t_copy")["walls"])
            stored = kn5.read(saved)
            added = [n for n in kn5.walk_meshes(stored["root"]) if n.name.startswith("1WALL_wall_")]
            self.assertTrue(added)
            self.assertAlmostEqual(16.25, max(float(n.vertices["pos"][:, 1].max()) for n in added))

    def test_material_and_height_survive_library_removal_and_a_standalone_transfer(self):
        import io
        import shutil
        from pathlib import Path
        from PIL import Image
        root = Path(self.path).parent
        folder = root / "content/tracks/t"
        (folder / "data").mkdir(parents=True)
        (folder / "ui").mkdir()
        shutil.copyfile(self.path, folder / "t.kn5")
        objectlist.write(str(folder / "t.kn5"), self.objects)
        mytracks.save(str(folder), {"title": "Wall test", "points": [[1, 2], [3, 4]], "width": 100})
        image = io.BytesIO()
        Image.new("RGB", (8, 8), (200, 50, 30)).save(image, "PNG")
        with mock.patch.object(mytracks, "ROOT", str(root)), mock.patch.object(materiallibrary, "ROOT", str(root)):
            prepared = materiallibrary.prepare("wall.png", image.getvalue())
            material = materiallibrary.add({"token": prepared["token"], "filename": "wall.png", "name": "Red wall",
                                            "category": "rock", "repeat": [6, 1.5]})["material"]["id"]
            now = trackedits.load(str(root), "t")
            walls = trackedits.wall_edit(str(root), "t", {"base": now["base"], "revision": now["revision"],
                                                          "objects": ["t_0_0#0"], "rise": -0.5, "material": material})["walls"]
            trackedits.save(str(root), "t", {"base": now["base"], "revision": now["revision"], "id": "texture",
                                             "deleted": [], "walls": walls})
            shown = trackview.index(str(root), "t")
            image_index = next(i for i, t in enumerate(shown["textures"]) if t["name"].startswith("map2lap_wall_"))
            self.assertTrue(trackview.texture_bytes(str(root), "t", image_index, now["base"])[1].startswith(b"DDS "))
            trackcopy.save(str(root), "t", copy_to="t_copy")
            # This instance has the source but neither the library nor the prepared snapshot cache.
            shutil.rmtree(root / "library")
            shutil.rmtree(root / "out/paint-assets")
            trackcopy.save(str(root), "t_copy", copy_to="t_again")
            portable = root / "portable"
            shutil.copytree(root / "content/tracks/t_copy", portable / "content/tracks/t_copy")
        with mock.patch.object(mytracks, "ROOT", str(portable)):
            now = trackedits.load(str(portable), "t_copy")
            self.assertEqual([], now["walls"], "a transferred track uses its baked wall as its new source")
            walls = trackedits.wall_edit(str(portable), "t_copy", {"base": now["base"], "revision": now["revision"],
                                                                   "objects": ["t_0_0#0"], "rise": 0.5})["walls"]
            trackedits.save(str(portable), "t_copy", {"base": now["base"], "revision": now["revision"], "id": "portable",
                                                       "deleted": [], "walls": walls})
            trackcopy.save(str(portable), "t_copy", copy_to="t_raised")
            got = kn5.read(str(portable / "content/tracks/t_raised/t_raised.kn5"))
            added = [n for n in kn5.walk_meshes(got["root"]) if n.name.startswith("1WALL_wall_")]
            self.assertAlmostEqual(15.0, max(float(n.vertices["pos"][:, 1].max()) for n in added))


if __name__ == "__main__":
    unittest.main()
