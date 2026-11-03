"""Road geotiles (phase 1c, .claude/work/geotiles_plan.md): a road tile's content built once in its geotile's frame, its
skin per anchor.

- ownership (geotiles.GeoBox.owns): every place in exactly one tile, whatever frame asks;
- seams (earthfast.clip_tris_convex): two neighbouring tiles' quads mapped into an anchor cut a mesh along the very same
  line: the pieces add up to the whole, none outside its quad; their shared corners are bit-equal;
- plan trimming by a cell's quad (earthfast.clip_segments_convex): a box gives clip_segments' answer, two cells split a
  road without a gap or an overlap;
- exact variants (earthfast.cdae_zstats / cdae_shear): a tall shape placed rigidly at its pivot is off by relief x D / R,
  its variant within a mm of the exact world map;
"""
import math
import os
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import cdae  # noqa: E402
import fast  # noqa: E402
import geodesy  # noqa: E402
import geotiles  # noqa: E402
import grading  # noqa: E402
import roads  # noqa: E402

LAT, LON = 39.2834, -76.5934
CACHE = os.path.expanduser("~/.cache/beamng-earth")
HAVE_DATA = os.path.isdir(os.path.join(CACHE, "mapdata")) and os.environ.get("BNGE_ROADGEO_REAL", "1") != "0"


def east(lat, lon, km):
    return geodesy.EnuFrame(lat, lon + km * 1000.0 / (111320.0 * math.cos(math.radians(lat))))


class OwnershipTest(unittest.TestCase):
    def test_every_place_in_one_tile(self):
        gx, gy = geotiles.tile_of(LAT, LON)
        a = east(LAT, LON, 15.0)
        rng = np.random.default_rng(3)
        # points round the tile's corners and edges in anchor a's world (h = 0)
        q = geotiles.quad(a, gx, gy)
        pts = np.concatenate([c + rng.normal(0.0, [0.02, 0.02], (400, 2)) for c in q] +
                             [rng.uniform(q.min(0) - 5, q.max(0) + 5, (2000, 2))])
        la, lo, _ = geotiles.world_to_geodetic(a, np.c_[pts, np.zeros(len(pts))])
        count = np.zeros(len(pts), int)
        for i in (-1, 0, 1):
            for j in (-1, 0, 1):
                b = geotiles.geobox(gx + i, gy + j)
                # the points in this tile's own frame (its world, exactly)
                own = geotiles.world_map(a, b.frame, np.c_[pts, np.zeros(len(pts))])[:, :2]
                o = b.owns(own[:, 0], own[:, 1])
                tx, ty = geotiles.tile_of(la, lo)
                self.assertTrue(np.array_equal(o, (tx == gx + i) & (ty == gy + j)), (i, j))
                count += o
        inner = (np.abs(pts - q.mean(0)) < 300).all(1)
        self.assertTrue((count[inner] == 1).all(), "every place in exactly one of the 9 tiles")

    def test_box_owns_anchor_tiles_half_open(self):
        box = roads.tile_bbox(1, 2)
        self.assertTrue(roads.box_owns(box, 256.0, 512.0))
        self.assertFalse(roads.box_owns(box, 512.0, 600.0))
        self.assertTrue(np.array_equal(roads.box_owns(box, np.array([256.0, 511.9, 512.0]), np.array([600.0] * 3)),
                                       [True, True, False]))


class SeamsTest(unittest.TestCase):

    def test_plan_trimmed_by_two_cells_quads(self):
        a = geotiles.region_frame(*geotiles.region_of(LAT, LON))
        import mapcells
        k1 = mapcells.cell_of(LAT, LON)
        k2 = mapcells.CellKey(k1.z, k1.x + 1, k1.y)

        class Pl:
            frame = a
        q1 = grading._Planner._clip_quad(Pl, k1)
        q2 = grading._Planner._clip_quad(Pl, k2)
        self.assertTrue(np.array_equal(q1[1], q2[0]) and np.array_equal(q1[2], q2[3]), "shared corners bit-equal")
        mid = 0.5 * (q1[1] + q1[2])
        xy = np.array([mid - [300.0, 7.0], mid + [5.0, 1.0], mid + [400.0, 9.0]])
        p = grading.Plan(xy, np.array([1.0, 2.0, 3.0]), 4.0)
        a1 = grading.trim_plan(p, q1)
        a2 = grading.trim_plan(p, q2)
        L = lambda ps: sum(float(np.hypot(*np.diff(q.xy, axis=0).T).sum()) for q in ps)    # noqa: E731
        whole = float(np.hypot(*np.diff(xy, axis=0).T).sum())
        inside = L(grading.trim_plan(p, np.array([q1[0], q2[1], q2[2], q1[3]])))
        self.assertAlmostEqual(L(a1) + L(a2), inside, places=6)
        self.assertGreater(whole, inside - 1e-9)
        # a box gives the box clip's answer
        box = (float(q1[:, 0].min()), float(q1[:, 1].min()), float(q1[:, 0].max()), float(q1[:, 1].max()))
        bq = np.array([[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]])
        self.assertAlmostEqual(L(grading.trim_plan(p, box)), L(grading.trim_plan(p, bq)), places=6)


class ExactVariantTest(unittest.TestCase):
    def test_shear_lands_a_tall_shape_exactly(self):
        fast.require(104, "cdae_shear")
        gx, gy = geotiles.tile_of(LAT, LON)
        tf = geotiles.frame(gx, gy)
        a = east(LAT, LON, 15.0)
        # a 120 m tower on the ground at 40 m, 30 m off the tile's centre
        pos = np.array([30.0, -20.0, 0.0])
        P = np.array([[0, 0, 40], [5, 0, 40], [5, 5, 160], [0, 5, 160], [2, 2, 100]], np.float64)
        T = np.array([[0, 1, 2], [0, 2, 3], [1, 2, 4]])
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "t.cdae")
            cdae.write(path, P, T)
            blob = open(path, "rb").read()
            n, med, lo, hi = fast._ef.cdae_zstats(blob)
            self.assertEqual(n, 5)
            self.assertAlmostEqual(med, 100.0, places=4)
            self.assertAlmostEqual(lo, 40.0, places=4)
            self.assertAlmostEqual(hi, 160.0, places=4)
            piv = pos[2] + med
            r, t, c = geotiles.placement(tf, a, (0.0, 0.0, piv))
            world = P + pos
            exact = geotiles.world_map(tf, a, world)
            rigid = world @ r.T + t
            self.assertGreater(float(np.abs(rigid - exact)[:, :2].max()), 0.1, "rigid: off by relief x D / R")
            s = r.T @ c
            var = fast._ef.cdae_shear(blob, float(pos[2]), float(s[0]), float(s[1]), float(s[2]), float(piv))
            d2 = cdae.decode(var)
            V = cdae.mesh_arrays(d2["meshes"][0])["verts"].astype(np.float64)
            # the engine's vertices (the triangle winding / order kept: match by the original order of P)
            V0 = cdae.mesh_arrays(cdae.decode(blob)["meshes"][0])["verts"].astype(np.float64)
            order = [int(np.argmin(np.abs(V0 - p).sum(1))) for p in P]
            placed = (V[order] + pos) @ r.T + t
            self.assertLess(float(np.abs(placed - exact).max()), 0.002)


if __name__ == "__main__":
    unittest.main()
