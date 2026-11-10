"""Save bundles equal model parts per tile and material, like object copies: fewer meshes, every instance still its own object."""
from pathlib import Path
import shutil
import unittest
from unittest import mock

import numpy as np

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import objectlibrary, trackcopy, trackedits, trackmodels, trackview
from track import kn5


def instance_points(path, instance):
    """The saved positions of one model instance, found through the saved object list as AC and the Editor find it."""
    scan, listed = kn5.scan(str(path)), trackview.list_of(str(path))
    points = []
    with open(path, "rb") as file:
        for mesh, first, count in listed[instance]["faces"][0]:
            info = scan["meshes"][mesh]
            if info["name"].startswith("nocol_"):
                vertices, faces = kn5.mesh_arrays(file, info)
                points.append(vertices["pos"][np.unique(faces.reshape(-1, 3)[first:first + count])])
    return np.concatenate(points)


class BundleTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)

    def asset(self, alpha="MASK"):
        document, binary = fixture()
        document["materials"][0]["alphaMode"] = alpha
        prepared = objectlibrary.prepare("tree.glb", encode(document, binary))
        return objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree"})["model"]["id"]

    def placed(self, asset, at, collision="none"):
        now = trackedits.load(self.ac, self.name)
        return trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "model": asset,
                                                     "at": list(at), "collision": collision})["model"]

    def save(self, models, target, placed=(), deleted=()):
        now = trackedits.load(self.ac, self.name)
        trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"], "id": "m", "models": models,
                                                     "placed": list(placed), "deleted": list(deleted)})
        trackcopy.save(self.ac, self.name, target, target)
        return Path(self.ac, "content/tracks", target, target + ".kn5")

    def model_meshes(self, path):
        return [m for m in kn5.scan(str(path))["meshes"] if "m2l_model" in m["name"]]

    def test_instances_in_one_tile_share_a_mesh_and_keep_their_own_faces(self):
        asset = self.asset()
        first, second = self.placed(asset, (20, 0, 5)), self.placed(asset, (30, 0, 5))
        path = self.save([first, second], "two_trees")
        (mesh,) = self.model_meshes(path)
        self.assertTrue(mesh["name"].startswith("nocol_m2l_model_"))
        self.assertEqual(6, mesh["vertices"])
        np.testing.assert_allclose(np.ptp(instance_points(path, first["id"]), axis=0), np.ptp(instance_points(path, second["id"]), axis=0))
        self.assertAlmostEqual(10, float(instance_points(path, second["id"])[:, 0].min() - instance_points(path, first["id"])[:, 0].min()), places=4)

    def test_tiles_collision_and_blended_materials_stay_apart(self):
        leaves, glass = self.asset(), self.asset("BLEND")
        models = [self.placed(leaves, (20, 0, 5)), self.placed(leaves, (900, 0, 5)), self.placed(leaves, (30, 0, 5), "mesh"),
                  self.placed(glass, (20, 0, 8)), self.placed(glass, (25, 0, 8))]
        names = sorted(m["name"].split("_")[0] for m in self.model_meshes(self.save(models, "apart")))
        # (tile 0 and tile 3 visual leaves, tile 0 collision, two blended instances one by one)
        self.assertEqual(["1WALL", "nocol", "nocol", "nocol", "nocol"], names)

    def test_moving_or_deleting_one_instance_leaves_the_other_where_it_was(self):
        asset = self.asset()
        first, second = self.placed(asset, (20, 0, 5)), self.placed(asset, (30, 0, 5))
        before = instance_points(self.save([first, second], "still"), second["id"])
        moved = self.save([first, second], "moved", [{"id": first["id"] + "#0", "x": 3, "y": 1, "z": 0, "turn": 40, "scale": 2}])
        np.testing.assert_allclose(before, instance_points(moved, second["id"]), atol=1e-5)
        self.assertAlmostEqual(3, float(instance_points(moved, first["id"])[:, 0].mean() - 20 - (before[:, 0].mean() - 30)), delta=2)
        gone = self.save([first, second], "gone", deleted=[{"id": first["id"] + "#0", "position": first["at"]}])
        (mesh,) = self.model_meshes(gone)
        self.assertEqual(3, mesh["vertices"])
        np.testing.assert_allclose(before, instance_points(gone, second["id"]), atol=1e-5)

    def test_a_cold_track_saves_the_same_bundles_again(self):
        asset = self.asset()
        path = self.save([self.placed(asset, (20, 0, 5)), self.placed(asset, (30, 0, 5))], "warm")
        for relative in ("library", "cache", "out/sources", "out/edits", "out/model-assets"):
            shutil.rmtree(Path(self.ac, relative), ignore_errors=True)
        trackcopy.save(self.ac, "warm", "cold", "Cold")
        again = Path(self.ac, "content/tracks/cold/cold.kn5")
        with open(path, "rb") as a, open(again, "rb") as b:
            for one, two in zip(self.model_meshes(path), self.model_meshes(again)):
                self.assertEqual(one["name"], two["name"])
                self.assertEqual([x.tobytes() for x in kn5.mesh_arrays(a, one)], [x.tobytes() for x in kn5.mesh_arrays(b, two)])


class GroundedTest(unittest.TestCase):
    def test_inherited_ground_moves_only_the_instances_own_vertices_of_a_shared_mesh(self):
        vertices = np.zeros(6, kn5.VERTEX); vertices["pos"][:, 0] = [0, 1, 0, 10, 11, 10]
        faces = np.array([[0, 1, 2], [3, 4, 5]], "<u2")
        scan = {"meshes": [{"data": (vertices, faces)}], "model_heights": {"a": [{"id": "h", "x": -4, "z": -4, "nx": 10, "nz": 5, "mm": [500] * 50}]}}
        objects = {"a": {"kinds": ["model"], "at": [[0, 0, 0]], "parents": [-1], "faces": [[[0, 0, 1]]]},
                   "b": {"kinds": ["model"], "at": [[10, 0, 0]], "parents": [-1], "faces": [[[0, 1, 1]]]}}
        moved = trackmodels.grounded(scan, objects, [], kn5.Moved({}, {}, {}))
        y = moved.vertices[0]["pos"][:, 1]
        np.testing.assert_allclose(y[:3], .5)
        np.testing.assert_allclose(y[3:], 0)


if __name__ == "__main__": unittest.main()
