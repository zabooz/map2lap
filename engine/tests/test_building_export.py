"""Facade texture bands survive the compiled-shape → OBJ → KN5 coordinate conversions."""
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "engine"), str(ROOT / "src")]
import cdae
from buildings.mesh import WIN_UV
from scenery import facades
from track import make_obj, obj_to_kn5


class BuildingExportTest(unittest.TestCase):
    def test_each_facade_band_reaches_the_same_texture_rows_in_kn5(self):
        positions = np.array([[0., 0., 0.], [3., 0., 0.], [0., 0., 3.]])
        triangles = np.array([[0, 1, 2]])
        for band in range(4):
            with self.subTest(band=band), tempfile.TemporaryDirectory() as tmp:
                uv = np.array([[.1, 1 - (band + .9) / 4], [.2, 1 - (band + .9) / 4],
                               [.1, 1 - (band + .1) / 4]])
                path = Path(tmp) / "house.cdae"
                path.write_bytes(cdae.encode(positions, triangles, uvs=uv, material="bne_bld_facade"))
                _, p, exported_uv, t, _ = next(make_obj.shape_parts(str(path), (0., 0., 0.)))
                node = obj_to_kn5.mesh_nodes("nocol_house", 0, False, p, exported_uv, t)[0]
                for vertex in node.vertices:
                    source = int(np.linalg.norm(positions - vertex['pos'], axis=1).argmin())
                    np.testing.assert_allclose(vertex['uv'] % 1., [uv[source, 0], 1 - uv[source, 1]], atol=1e-6)

    def test_separate_window_uses_the_complete_panel_window(self):
        u0, u1, v0, v1 = WIN_UV
        np.testing.assert_allclose([u0 * 1024, u1 * 1024], facades.WIN_X)
        np.testing.assert_allclose([(1 - v1) * 1024, (1 - v0) * 1024], facades.WIN_Y)


if __name__ == "__main__":
    unittest.main()
