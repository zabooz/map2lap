"""blockworker.navgraph: the AI road graph a tile worker builds is the same every time."""
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from types import SimpleNamespace

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import blockworker  # noqa: E402
from test_roads import FRAME, LAT, LON, features  # noqa: E402


class FakeMapData:
    """The roads layer of the tile's first cell only (every cell the same object would double them)."""

    def __init__(self, feats, first):
        self.feats, self.first = feats, first

    def cell(self, key, layers=(), kind="demand"):
        return SimpleNamespace(layers={"roads": self.feats if key == self.first else None})

    def warm(self, needs, kind="demand"):
        return 0

    def versions(self):             # (part of the revisit cache's key)
        return {"pipeline": 0}


def tmp_cache(test):
    """A revisit cache folder of the test's own (the tiles' keep-for-the-next-visit cache), removed after it."""
    d = tempfile.TemporaryDirectory()
    test.addCleanup(d.cleanup)
    return d.name


class FakeDem:
    def sample(self, lat, lon, zoom, progress=None):
        return np.full(np.shape(lat), 10.0)


class NavgraphTest(unittest.TestCase):
    """blockworker.navgraph: the graph built in a road process is the one navgraph.build makes with the same inputs
    (the server's way), its file written and the rules passed through."""

    def test_same_graph(self):
        import json
        import mapcells
        import navgraph
        f = features([[(-300, 100), (300, 100)], [(120, -100), (120, 300)]], ["secondary", "residential"])
        w = navgraph.WINDOW_M + 200.0
        la, lo, _ = FRAME.enu_to_geodetic(np.array([-w, w]), np.array([-w, w]), 0.0)
        keys = mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max()))
        md = FakeMapData(f, keys[0])
        blockworker._s = SimpleNamespace(md=md, dem=FakeDem(), widths=None, surface=None, sea=None,
                                         lock=threading.Lock(), bridges={}, anchor=lambda aid, lat, lon: (None, None),
                                         cache_dir=tmp_cache(self))
        rules = {"rightHandDrive": False, "mph": True}
        with tempfile.TemporaryDirectory() as out:
            path, n_nodes, n_edges = blockworker.navgraph(1, LAT, LON, 15, 0.0, 0.0, out, "/temp/x", 7, False, True,
                                                          rules)
            self.assertEqual(path, "/temp/x/navgraph_1_7.json")
            got = json.loads(Path(out, "navgraph_1_7.json").read_text())
        elev = lambda la_, lo_: FakeDem().sample(la_, lo_, 15)      # noqa: E731
        want = navgraph.build(FRAME, [md.cell(k).layers.get("roads") for k in keys], elev, (0.0, 0.0), None,
                              decks={}, widths=None, left_hand=False, mph=True)
        want["rules"] = rules
        self.assertEqual(got, json.loads(json.dumps(want, separators=(",", ":"))))
        self.assertGreater(n_nodes, 2)
        self.assertEqual((n_nodes, n_edges), (len(want["nodes"]), len(want["edges"])))


if __name__ == "__main__":
    unittest.main()
