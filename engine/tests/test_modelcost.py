"""Per-instance geometry costs agree with native Save, including flat normals, node reuse and piece seams."""
import json
from pathlib import Path
from unittest import mock

import numpy as np

from test_modeldata import encode, fixture
from test_trackcopy import Base
from app import modeldata, modelmesh, objectlibrary, trackcopy, trackedits
from track import kn5


class CostTest(Base):
    def setUp(self):
        super().setUp()
        patch = mock.patch.object(objectlibrary, "ROOT", self.ac)
        patch.start(); self.addCleanup(patch.stop)

    def prepare(self, double=True, many=False):
        document, binary = fixture()
        document["materials"][0]["doubleSided"] = double
        document["nodes"].append({"mesh": 0, "translation": [2, 0, 0]})
        document["scenes"][0]["nodes"].append(2)
        if many:
            faces = np.tile(np.array([0, 1, 2], "<u2"), 21846)
            start = (len(binary) + 3) // 4 * 4
            binary += b"\0" * (start - len(binary)) + faces.tobytes()
            document["bufferViews"].append({"buffer": 0, "byteOffset": start, "byteLength": faces.nbytes})
            document["accessors"][1].update(bufferView=len(document["bufferViews"]) - 1, count=len(faces))
            document["buffers"][0]["byteLength"] = len(binary)
        raw = encode(document, binary)
        return raw, objectlibrary.prepare("tree.glb", raw)

    def test_scene_nodes_count_and_double_sided_render_faces_are_written_once(self):
        _raw, prepared = self.prepare()
        cost = prepared["geometry"]["track_cost"]
        self.assertEqual(2, cost["triangles"])
        self.assertEqual(276, cost["bytes"]["none"])
        self.assertEqual(828, cost["bytes"]["mesh"])
        self.assertFalse(cost["heavy"]["none"])

    def test_cost_matches_saved_vertex_and_index_payload_with_flat_normals_and_split_pieces(self):
        for double in (False, True):
            _raw, prepared = self.prepare(double, many=True)
            cost = prepared["geometry"]["track_cost"]
            for collision in ("none", "mesh"):
                with self.subTest(double=double, collision=collision):
                    asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Tree", "collision": collision})["model"]
                    now = trackedits.load(self.ac, self.name)
                    instance = trackedits.model(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
                        "model": asset["id"], "at": [20, 0, 5], "collision": collision})["model"]
                    trackedits.save_telling(self.ac, self.name, {"base": now["base"], "revision": now["revision"],
                        "id": "model", "deleted": [], "models": [instance]})
                    target = f"cost_{double}_{collision}"
                    trackcopy.save(self.ac, self.name, target, target)
                    scan = kn5.scan(Path(self.ac, "content/tracks", target, target + ".kn5"))
                    meshes = [m for m in scan["meshes"] if "m2l_model_" in m["name"]]
                    self.assertEqual(sum(m["vertices"] * 44 + m["indices"] * 2 for m in meshes), cost["bytes"][collision])
                    self.assertTrue(cost["heavy"][collision])

    def test_piece_boundary_counts_shared_vertices_again(self):
        from dataclasses import replace
        model = modeldata.load(encode(*fixture()))
        primitive = replace(model.primitives[0], normals=np.tile([0., 0., 1.], (3, 1)),
                            indices=np.tile([[0, 1, 2]], (21846, 1)).astype("<u4"))
        model = replace(model, primitives=(primitive,))
        cost = modelmesh.track_cost(model)
        self.assertEqual(6 * 44 + 21846 * 6, cost["bytes"]["none"])

    def test_old_package_cost_is_lazy_cached_and_does_not_rewrite_the_package(self):
        _raw, prepared = self.prepare()
        asset = objectlibrary.add({"token": prepared["token"], "filename": "tree.glb", "name": "Old tree"})["model"]
        path = objectlibrary._folder(asset["id"]) / "asset.json"
        asset["geometry"].pop("track_cost", None)
        path.write_text(json.dumps(asset), encoding="utf8")
        before = path.read_bytes()
        with mock.patch.object(modelmesh, "track_cost", wraps=modelmesh.track_cost) as calculate:
            objectlibrary.listing()
            self.assertEqual(0, calculate.call_count)
            first = objectlibrary.cost(asset["id"])
            self.assertEqual(first, objectlibrary.cost(asset["id"]))
            self.assertEqual(1, calculate.call_count)
        self.assertEqual(prepared["geometry"]["track_cost"], first)
        self.assertEqual(before, path.read_bytes())

