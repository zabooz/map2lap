"""The optional 1 m AC terrain keeps paint on the collision mesh and exports within KN5's limits."""
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]


def probe():
    """Build two small adjacent terrain tiles and export a full tile in this process's grid mode."""
    import tempfile
    from types import SimpleNamespace
    from unittest import mock
    import numpy as np

    sys.path.insert(0, str(ROOT / "src"))
    import generator  # noqa: F401: installs engine imports
    import blockworker
    import geodesy
    import heightmap
    import revisit
    import roadmesh
    from scenery import ground, groundcover
    from track import make_obj, obj_to_kn5

    frame = geodesy.EnuFrame(46.5, 14.5)

    def elevation(la, lo, zoom=None):
        x, y, _ = frame.geodetic_to_enu(la, lo, 0.0)
        return 10.0 + .2 * np.maximum(0.0, 1.0 - abs(x - 1.0)) + .01 * y

    def box(tx, ty):
        return (4.0 * tx, 4.0 * ty, 4.0 * (tx + 1), 4.0 * (ty + 1))

    state = SimpleNamespace(surface=None)
    dem = SimpleNamespace(sample=elevation)
    with (tempfile.TemporaryDirectory() as folder,
          mock.patch.object(blockworker, "_s", state),
          mock.patch.object(blockworker, "ground", side_effect=lambda frame, la, lo, z: z),
          mock.patch.object(ground.roadsmod, "tile_bbox", side_effect=box),
          mock.patch.object(ground, "TEX_PX", 16),
          mock.patch.object(ground, "phased", side_effect=lambda img, tile: img),
          mock.patch.object(ground, "_texture", return_value=np.full((4, 4, 3), 80.0)),
          mock.patch.object(groundcover, "materials", return_value=np.full((4, 4), "gc_meadow")),
          mock.patch.object(groundcover, "macro", side_effect=lambda x, y: np.ones((*np.shape(x), 3)))):
        tiles = [ground.build(frame, 1, tx, 0, None, dem, 16, None, None, folder, folder,
                              str(Path(folder) / f"{tx}.jpg")) for tx in (-1, 0)]
    left, right = tiles[0][0], tiles[1][0]
    seam_left = left[np.isclose(left[:, 0], 0.0)]
    seam_right = right[np.isclose(right[:, 0], 0.0)]
    np.testing.assert_array_equal(seam_left, seam_right)

    query = np.array([[1.0, 1.0]])
    drawn = float(roadmesh.drawn_ground(frame, elevation, query)[0])
    grid, i0, j0 = roadmesh._height_grid(frame, elevation, query)
    pos = np.array([[.5, .5], [1.5, .5], [.5, 1.5]])
    p, _, triangles, _ = roadmesh.follow_ground(pos, np.zeros_like(pos), np.array([[0, 1, 2]]), grid, i0, j0)
    # Every used draped vertex must follow the same piecewise planar ground the car drives on.
    used = p[np.unique(triangles)]
    np.testing.assert_allclose(used[:, 2], roadmesh.drawn_ground(frame, elevation, used[:, :2]), atol=1e-7)
    at = right[np.isclose(right[:, 0], 1.0) & np.isclose(right[:, 1], 1.0)]
    if len(at):
        np.testing.assert_allclose(drawn, at[0, 2], atol=1e-7)

    # A 256 m tile at 1 m has 66,049 vertices: export it through the real mesh splitter.
    count = ground.LATTICE
    x, y = np.meshgrid(np.arange(count) * ground.CELL, np.arange(count) * ground.CELL)
    points = np.c_[x.ravel(), np.zeros(x.size), y.ravel()]
    a = (np.arange(count - 1)[:, None] * count + np.arange(count - 1)).ravel()
    faces = np.r_[np.c_[a, a + count + 1, a + 1], np.c_[a, a + count, a + count + 1]]
    nodes = obj_to_kn5.mesh_nodes("1ROAD_ground_0_0", 0, True, points, points[:, [0, 2]] / 256, faces)
    return {"cell": ground.CELL, "water_cell": make_obj.CELL, "legacy_cell": heightmap.SQUARE,
            "points": len(right), "ridge": drawn, "code_key": revisit.code_key(),
            "vertices": max(len(n.vertices) for n in nodes), "indices": sum(len(n.indices) for n in nodes),
            "faces": len(faces), "seam_points": len(seam_left)}


class TerrainGridTest(unittest.TestCase):
    def run_probe(self, value):
        env = os.environ.copy()
        env.pop("BNE_AC_GRID_M", None)
        if value is not None:
            env["BNE_AC_GRID_M"] = value
        return subprocess.run([sys.executable, str(Path(__file__).resolve()), "--probe"], env=env,
                              capture_output=True, text=True, timeout=45)

    def test_one_metre_grid_keeps_markings_water_seams_and_export_aligned(self):
        child = self.run_probe("1")
        self.assertEqual(child.returncode, 0, child.stderr)
        result = json.loads(child.stdout)
        self.assertEqual(result["cell"], 1.0)
        self.assertEqual(result["water_cell"], 1.0)
        self.assertEqual(result["legacy_cell"], 2.0, "AC's experiment leaves the legacy heightmap layout alone")
        self.assertEqual(result["points"], 25)
        self.assertEqual(result["seam_points"], 5)
        self.assertAlmostEqual(result["ridge"], 10.21, delta=1e-4)
        self.assertLessEqual(result["vertices"], 65535)
        self.assertEqual(result["indices"], result["faces"] * 3)

    def test_default_and_explicit_two_metres_keep_the_same_geometry_and_separate_cache_keys(self):
        results = []
        for value in (None, "2", "1"):
            child = self.run_probe(value)
            self.assertEqual(child.returncode, 0, child.stderr)
            results.append(json.loads(child.stdout))
        default, two, one = results
        self.assertEqual(default["cell"], 2.0)
        self.assertEqual(default["points"], 9)
        self.assertEqual(default["indices"], two["indices"])
        self.assertEqual(default["ridge"], two["ridge"])
        self.assertNotEqual(two["code_key"], one["code_key"])

    def test_unsupported_grid_fails_before_building(self):
        child = self.run_probe("0.5")
        self.assertNotEqual(child.returncode, 0)
        self.assertIn("BNE_AC_GRID_M", child.stderr)


class HoleGridTest(unittest.TestCase):
    def test_hole_report_uses_the_built_grid_even_without_the_experiment_switch(self):
        import contextlib
        import io
        import tempfile
        from unittest import mock
        import numpy as np
        sys.path.insert(0, str(ROOT / "tools"))
        import measure

        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / "out" / "tracks" / "fixture"
            (root / "tiles").mkdir(parents=True)
            (root / "obj" / "parts").mkdir(parents=True)
            (root / "tiles" / "anchor.json").write_text(json.dumps({"terrain_cell_m": 1.0}))
            lines = ["o 1ROAD_ground_0_0\nusemtl asphalt\n"]
            lines += [f"v {x} 0 {z}\n" for z in range(5) for x in range(5)]
            lines += [f"vt {x / 4} {z / 4}\n" for z in range(5) for x in range(5)]
            for z in range(4):
                for x in range(4):
                    if (x, z) == (1, 1):
                        continue  # one 1 m hole surrounded by road, invisible to a 2 m cell-centre check
                    a = z * 5 + x + 1
                    lines += ["f " + " ".join(f"{v}/{v}" for v in face) + "\n"
                              for face in ((a, a + 6, a + 1), (a, a + 5, a + 6))]
            (root / "obj" / "parts" / "t_0_0.obj").write_text("".join(lines))
            output = io.StringIO()
            with (mock.patch.object(measure, "HERE", folder),
                  mock.patch.object(measure, "_route", return_value=np.array([[0., 0.], [4., 4.]])),
                  contextlib.redirect_stdout(output)):
                measure.report_holes("fixture")
            self.assertIn("'lane': 1", output.getvalue())
            self.assertIn("     1 m2", output.getvalue())
            self.assertIn("     1.5 z      1.5", output.getvalue())


if __name__ == "__main__":
    if "--probe" in sys.argv:
        print(json.dumps(probe()))
    else:
        unittest.main()
