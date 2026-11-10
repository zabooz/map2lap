"""Save cuts a large model into kn5 meshes only where AC's 65,535 vertices force it, so few vertices repeat at the seams."""
import json
import unittest
from unittest import mock

import numpy as np

from test_modelbundle import instance_points
from test_modeldata import encode
from test_trackcopy import Base
from app import modelmesh, objectlibrary, trackcopy, trackedits
from track import kn5


def grid(side):
    """A flat side × side grid's vertices and triangles, row by row: neighbours share their corners. Pure."""
    vertices = np.zeros(side * side, kn5.VERTEX)
    x, z = np.meshgrid(np.arange(side), np.arange(side))
    vertices["pos"][:, 0], vertices["pos"][:, 2] = x.ravel(), z.ravel()
    corner = (np.arange(side - 1)[None, :] + side * np.arange(side - 1)[:, None]).ravel()
    faces = np.concatenate([np.stack([corner, corner + side, corner + 1], 1), np.stack([corner + 1, corner + side, corner + side + 1], 1)])
    return vertices, faces[np.argsort(np.concatenate([corner, corner]), kind="stable")].astype("<u4")


def grid_glb(side):
    """A grid as a GLB with normals, so Save keeps its shared vertices. Pure."""
    vertices, faces = grid(side)
    points, normals = vertices["pos"].astype("<f4"), np.tile(np.array([0, 1, 0], "<f4"), (len(vertices), 1))
    binary = points.tobytes() + normals.tobytes() + faces.tobytes()
    views = [{"buffer": 0, "byteOffset": 0, "byteLength": points.nbytes}, {"buffer": 0, "byteOffset": points.nbytes, "byteLength": normals.nbytes},
             {"buffer": 0, "byteOffset": points.nbytes * 2, "byteLength": faces.nbytes}]
    document = {"asset": {"version": "2.0"}, "buffers": [{"byteLength": len(binary)}], "bufferViews": views,
                "accessors": [{"bufferView": 0, "componentType": 5126, "count": len(points), "type": "VEC3",
                               "min": points.min(axis=0).tolist(), "max": points.max(axis=0).tolist()},
                              {"bufferView": 1, "componentType": 5126, "count": len(points), "type": "VEC3"},
                              {"bufferView": 2, "componentType": 5125, "count": faces.size, "type": "SCALAR"}],
                "materials": [{"name": "Stone", "pbrMetallicRoughness": {"baseColorFactor": [.5, .5, .5, 1]}}],
                "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1}, "indices": 2, "material": 0}]}],
                "nodes": [{"mesh": 0}], "scenes": [{"nodes": [0]}], "scene": 0}
    return encode(document, binary)


class PiecesTest(unittest.TestCase):
    def assert_same_triangles(self, vertices, faces, pieces):
        self.assertTrue(all(len(data) <= 65535 for data, _triangles in pieces))
        joined = np.concatenate([data[triangles] for data, triangles in pieces])
        np.testing.assert_array_equal(vertices[faces], joined, "Every triangle, in its order")

    def test_shared_vertices_keep_a_large_part_in_one_piece(self):
        vertices, faces = grid(160)             # (25,600 vertices, 50,562 triangles)
        pieces = list(modelmesh.pieces(vertices, faces))
        self.assertEqual(1, len(pieces))
        self.assert_same_triangles(vertices, faces, pieces)

    def test_a_part_past_the_limit_is_cut_only_where_it_must(self):
        vertices, faces = grid(300)             # (90,000 vertices)
        pieces = list(modelmesh.pieces(vertices, faces))
        self.assertEqual(2, len(pieces))
        self.assertEqual(65535, len(pieces[0][0]), "A piece fills up to the limit")
        self.assertLessEqual(sum(len(data) for data, _triangles in pieces), 90000 + 300, "Only one row repeats at the seam")
        self.assert_same_triangles(vertices, faces, pieces)

    def test_every_triangle_bringing_new_vertices_still_fits(self):
        vertices = np.zeros(3 * 30000, kn5.VERTEX); vertices["pos"][:, 0] = np.arange(len(vertices))
        faces = np.arange(len(vertices), dtype="<u4").reshape(-1, 3)
        pieces = list(modelmesh.pieces(vertices, faces))
        self.assertEqual([65535, 3 * 30000 - 65535], [len(data) for data, _triangles in pieces])
        self.assert_same_triangles(vertices, faces, pieces)

    def test_a_blended_part_keeps_its_pieces_of_21845_triangles(self):
        vertices, faces = grid(160)
        pieces = list(modelmesh.pieces(vertices, faces, blended=True))
        self.assertEqual([21845, 21845, 50562 - 2 * 21845], [len(triangles) for _data, triangles in pieces])
        self.assert_same_triangles(vertices, faces, pieces)


class WriterTest(unittest.TestCase):
    def test_the_kn5_writer_refuses_a_triangle_naming_a_vertex_it_lacks(self):
        vertices = np.zeros(3, kn5.VERTEX)
        for indices in ([0, 1, 3], [0, 1, 65536]):
            with self.subTest(indices=indices), self.assertRaisesRegex(ValueError, "vertex"):
                kn5.node_bytes(kn5.Node(2, "nocol_test", 1, vertices=vertices, indices=np.array(indices), bs_center=(0, 0, 0)))


class LargeModelTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)

    def placed(self, asset, at):
        now = trackedits.load(self.ac, self.name)
        return trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset,
                                                     "at": list(at), "collision": "none"})["model"]

    def save(self, models, target, placed=()):
        now = trackedits.load(self.ac, self.name)
        trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "m", "models": models,
                                                     "placed": list(placed), "deleted": []})
        trackcopy.save(self.ac, self.name, target, target)
        return f"{self.ac}/content/tracks/{target}/{target}.kn5"

    def test_a_large_model_saves_whole_in_few_meshes_and_moves_as_one(self):
        prepared = objectlibrary.prepare("stone.glb", grid_glb(260))     # (67,600 vertices: past one mesh)
        asset = objectlibrary.add({"token": prepared["token"], "filename": "stone.glb", "name": "Stone", "category": "rock"})["model"]["id"]
        first, second = self.placed(asset, (0, 0, 0)), self.placed(asset, (400, 0, 0))
        path = self.save([first, second], "large")
        meshes = [m for m in kn5.scan(path)["meshes"] if "m2l_model" in m["name"]]
        self.assertTrue(all(m["vertices"] <= 65535 for m in meshes))
        self.assertLessEqual(sum(m["vertices"] for m in meshes), 2 * (67600 + 260))
        self.assertEqual(prepared["geometry"]["track_cost"]["bytes"]["none"] * 2, sum(m["vertices"] * 44 + m["indices"] * 2 for m in meshes))
        before = instance_points(path, second["id"])
        self.assertEqual(67600, len(np.unique(before, axis=0)))
        moved = self.save([first, second], "large_moved", [{"id": first["id"] + "#0", "x": 3, "y": 0, "z": 0, "turn": 0, "scale": 1}])
        np.testing.assert_allclose(before, instance_points(moved, second["id"]), atol=1e-4)
        np.testing.assert_allclose(instance_points(path, first["id"])[:, 0] + 3, instance_points(moved, first["id"])[:, 0], atol=1e-4)

    def test_a_cost_stored_by_an_older_rule_is_measured_again(self):
        prepared = objectlibrary.prepare("stone.glb", grid_glb(20))
        asset = objectlibrary.add({"token": prepared["token"], "filename": "stone.glb", "name": "Stone"})["model"]
        path = objectlibrary._folder(asset["id"]) / "asset.json"
        asset["geometry"]["track_cost"] = {**asset["geometry"]["track_cost"], "version": 1, "bytes": {"none": 1, "mesh": 1}}
        path.write_text(json.dumps(asset), encoding="utf8")
        self.assertEqual(prepared["geometry"]["track_cost"], objectlibrary.cost(asset["id"]))


if __name__ == "__main__": unittest.main()
