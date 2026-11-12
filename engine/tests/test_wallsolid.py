"""Retaining walls and rural stone parapets are closed solids: every edge shared by exactly two faces and
every face wound outward (no culled back face to be seen), as the deck's jersey parapets (test_bridgelook)."""
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import roadmesh  # noqa: E402


def wall(parapet, concrete=False, thick=2.4, bend=False):
    x = np.arange(0.0, 40.1, 4.0)
    k = len(x)
    y = 0.02 * x * x if bend else np.zeros(k)
    base = np.c_[x, y]
    t = np.gradient(base, axis=0)
    t /= np.hypot(*t.T)[:, None]
    return {"base": base, "top": 10 + 0.05 * x + 3.0, "foot": 10 + 0.05 * x,
            "toward": np.c_[-t[:, 1], t[:, 0]], "thick": np.full(k, thick), "parapet": parapet, "concrete": concrete}


def edge_counts(P, T):
    q = np.round(np.asarray(P, np.float64), 4)
    got = {}
    for tri in np.asarray(T):
        for a, b in ((0, 1), (1, 2), (2, 0)):
            e = tuple(sorted((tuple(q[tri[a]]), tuple(q[tri[b]]))))
            got[e] = got.get(e, 0) + 1
    return got


class WallSolidTest(unittest.TestCase):
    def test_retaining_top_uses_the_walls_material_and_repeat(self):
        for concrete in (False, True):
            with self.subTest(concrete=concrete):
                P, T, UV, mats, M = roadmesh.tunnel([], (0, 0, 0), walls=[wall(False, concrete)])
                self.assertNotIn(roadmesh.TUNNEL_SOIL, [mats[int(i)] for i in np.unique(M)])
                self.assertEqual({roadmesh.TUNNEL_SIDE if concrete else roadmesh.TUNNEL_STONE},
                                 {mats[int(i)] for i in np.unique(M)})
                # The broad top repeats at the masonry's metre scale, just like its narrow coping.
                k = len(wall(False)["base"])
                repeat = roadmesh.CONCRETE_UV_M if concrete else roadmesh.STONE_UV_M
                self.assertAlmostEqual(float(UV[4 * k, 0]), 0)
                self.assertAlmostEqual(float(UV[5 * k, 1]), (2.4 - 0.5) / repeat)

    def test_wall_records_own_only_their_vertices_and_keep_their_kind(self):
        retaining, parapet = wall(False), wall(True, thick=0.45)
        parapet["base"][:, 1] += 10
        records = []
        mesh = roadmesh.tunnel([], (0, 0, 0), walls=[retaining, parapet], objects=records)
        self.assertEqual(["retaining wall", "parapet"], [r["kind"] for r in records])
        self.assertEqual(0, records[0]["first"])
        self.assertEqual(records[0]["count"], records[1]["first"])
        self.assertEqual(len(mesh[0]), sum(r["count"] for r in records))
        for r, w in zip(records, (retaining, parapet)):
            self.assertEqual(bool(w["parapet"]), r["details"]["wall"]["parapet"])
            np.testing.assert_allclose(r["details"]["wall"]["top"], w["top"])

    def check(self, w):
        got = roadmesh.tunnel([], (0.0, 0.0, 0.0), walls=[w])
        P, T = np.asarray(got[0], np.float64), np.asarray(got[1])
        bad = [e for e, n in edge_counts(P, T).items() if n != 2]
        self.assertEqual(bad, [], "open edges")
        v = np.einsum("ij,ij->i", P[T[:, 0]], np.cross(P[T[:, 1]], P[T[:, 2]])).sum() / 6.0
        self.assertGreater(v, 0.0, "wound outward")
        self.assertEqual(len(got[2]), len(P), "a uv per vertex")

    def test_retaining_wall(self):
        self.check(wall(False))

    def test_concrete_retaining_wall(self):
        self.check(wall(False, True))

    def test_stone_parapet(self):
        self.check(wall(True, thick=0.5))

    def test_curved_wall(self):
        self.check(wall(False, bend=True))
        self.check(wall(True, thick=0.5, bend=True))


if __name__ == "__main__":
    unittest.main()
