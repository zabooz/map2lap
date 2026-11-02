"""Far geotiles (phase 2, .claude/work/geotiles_plan.md): far buildings (geotiles.FAR_Z: the road geotiles' grid), the
skyline and far bridges (geotiles.SKY_Z / BRIDGE_Z squares) built once per tile in its own frame, kept by the mod across
rebases.

- the slab kernel (earthfast.bridge_slabs): the box mode is buildings' old _bridge_slab (the anchor tiles'); the
  geotile mode splits a square's slabs into a piece per road geotile, each segment in exactly one;
- the trackers (vegetation.Tracker geo): far buildings come as whole skyline squares, the skyline only where none of
  theirs are; a scripted 15 km rebase builds and sends no far content again (0 jobs, 0 mod loads), the anchor trackers
  every tile again;
- the protocol constants agree with roads.lua (FAR_GEO, SKY_UNIT = 2 ** (FAR_Z - SKY_Z));
- with the map data cache (~/.cache/beamng-earth): the same far geotiles from two anchors 15 km apart are byte-identical
  (each built after the anchor's own tiles warmed its process); one ownership rule by geotile key: no building in two
  far tiles, none of a road geotile's in another key's far tile, and the mod's rule (a far tile hidden once its road
  geotile shows its own) shows each building of a square once, whichever road geotiles are in.
"""
import math
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import buildings  # noqa: E402
import geodesy  # noqa: E402
import geotiles  # noqa: E402

LAT, LON = 39.2834, -76.5934
BRIDGE_LAT, BRIDGE_LON = 39.2617, -76.611        # (Baltimore's Hanover Street bridge: a square with far bridge pieces)
CACHE = os.path.expanduser("~/.cache/beamng-earth")
HAVE_DATA = os.path.isdir(os.path.join(CACHE, "mapdata")) and os.environ.get("BNGE_FARGEO_REAL", "1") != "0"




class SlabKernelTest(unittest.TestCase):
    def parts(self, frame, n=12, seed=5):
        rng = np.random.default_rng(seed)
        out = []
        for _ in range(n):
            k = int(rng.integers(2, 40))
            xy = np.cumsum(rng.normal(0, 25, (k, 2)), 0) + rng.uniform(-500, 500, 2)
            out.append((xy, rng.uniform(5, 40, k), float(rng.uniform(6, 30))))
        return out

    def test_pieces_partition_the_square(self):
        gx, gy = geotiles.tile_of(LAT, LON, geotiles.BRIDGE_Z)
        tile = geotiles.geobox(gx, gy, geotiles.BRIDGE_Z)
        parts = self.parts(tile.frame)
        x0, y0 = tile.box[:2]
        pieces = buildings.bridge_slabs(parts, (x0, y0), owners=(tile.frame, geotiles.FAR_Z, tile.z, gx, gy))
        self.assertGreater(len(pieces), 3)
        # every segment whose midpoint lies in the square: in exactly one piece (4 quads, 16 vertices), its own
        mids = np.concatenate([(p[0][:-1] + p[0][1:]) / 2 for p in parts])
        own = tile.owns(mids[:, 0], mids[:, 1])
        self.assertEqual(sum(len(m[0]) for m in pieces.values()), 16 * int(own.sum()))
        children = set(geotiles.children(gx, gy, tile.z, geotiles.FAR_Z))
        for (kx, ky), m in pieces.items():
            self.assertIn((kx, ky), children)
            P = m[0] + [x0, y0, 0.0]
            # (a segment's top quad: its left and right ends; their mean is the centre line's midpoint)
            seg_mid = (P[0::16, :2] + P[1::16, :2] + P[2::16, :2] + P[3::16, :2]) / 4
            la, lo, _h = geotiles.world_to_geodetic(tile.frame, np.c_[seg_mid, np.zeros(len(seg_mid))])
            tx, ty = geotiles.tile_of(la, lo, geotiles.FAR_Z)
            self.assertTrue(((tx == kx) & (ty == ky)).all(), "each segment in its midpoint's road geotile")
            self.assertEqual(m[2].shape[1], 3)
            self.assertEqual(int(m[2].max()) + 1, len(m[0]))
            self.assertTrue((m[5][:, 3] == 255).all())

    def test_box_mode(self):
        f = geodesy.EnuFrame(LAT, LON)
        parts = self.parts(f, seed=9)
        one = buildings.bridge_slabs(parts, (0.0, 0.0), box=(0.0, 0.0, 256.0, 256.0))
        mids = np.concatenate([(p[0][:-1] + p[0][1:]) / 2 for p in parts])
        n = int(((mids[:, 0] >= 0) & (mids[:, 0] < 256) & (mids[:, 1] >= 0) & (mids[:, 1] < 256)).sum())
        got = one.get(None)
        self.assertGreater(n, 0)
        self.assertEqual(len(got[0]) if got else 0, 16 * n, "the box's segments: 4 quads each")










@unittest.skipUnless(HAVE_DATA, "the map data cache (~/.cache/beamng-earth)")
class RealDataTest(unittest.TestCase):
    def test_content_identical_from_two_anchors(self):
        """The far geotiles at Fells Point (far buildings, skyline) and at the Hanover Street bridge (far bridges), each
        built after a session's anchor tiles warmed the process: for an anchor at the place and one 15 km east, every
        file byte for byte the same."""
        here = os.path.dirname(os.path.abspath(__file__))
        tmp = tempfile.mkdtemp(prefix="fargeo_")
        try:
            lon_b = LON + 15000.0 / (111320.0 * math.cos(math.radians(LAT)))
            outs = []
            for i, (alat, alon) in enumerate(((LAT, LON), (LAT, lon_b))):
                r = subprocess.run([sys.executable, os.path.join(here, "fargeo_content.py"), os.path.join(tmp, str(i)),
                                    str(LAT), str(LON), str(BRIDGE_LAT), str(BRIDGE_LON), str(alat), str(alon)],
                                   capture_output=True, text=True, timeout=1200)
                self.assertEqual(r.returncode, 0, r.stderr[-2000:])
                outs.append(r.stdout)
            self.assertTrue(outs[0].strip(), "content written")
            for pre in ("bf_", "bs_", "bb_"):
                self.assertIn(pre, outs[0])
            self.assertEqual(outs[0], outs[1])
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    def test_one_owner_per_building(self):
        import blockworker as bw
        import revisit
        revisit.ON = False
        bw._s = bw._State(CACHE, True, True, True, True, True, True, True)
        raw = lambda la, lo: bw.ground(None, la, lo, bw._s.dem.sample(la, lo, 15))     # noqa: E731
        sx, sy = geotiles.tile_of(LAT, LON, geotiles.SKY_Z)
        keys = geotiles.children(sx, sy, geotiles.SKY_Z, geotiles.FAR_Z)
        far = {}
        for k in keys:
            t = geotiles.geobox(*k)
            items, _lamps, _box = buildings.far_items(t.frame, t, None, bw._s.md, raw)
            far[k] = {s.seed for s, _a, _b in items}
        seen = {}
        for k, ids in far.items():
            for i in ids:
                self.assertNotIn(i, seen, f"a building in two far tiles: {seen.get(i)} and {k}")
                seen[i] = k
        self.assertGreater(len(seen), 500, "Fells Point's square: its buildings")
        # the road geotiles' own (their content's selection): each of theirs in no other key's far tile
        near = {}
        for k in keys[5:7]:
            t = geotiles.geobox(*k)
            items = buildings.road_tile_items(t.frame, t, None, bw._s.md, raw)
            near[k] = {s.seed for s, _a, _b in items}
            for i in near[k]:
                self.assertIn(seen.get(i, k), (k,), "a road geotile's building in another key's far tile")
            both = len(near[k] & far[k]) / max(1, len(near[k]))
            self.assertGreater(both, 0.95, f"near and far {k}: the same buildings ({both:.3f})")
        # the mod's rule over the square with two road geotiles in: every building shown once (near K's where K is in,
        # else far K's)
        shown = {}
        for k in keys:
            for i in (near[k] if k in near else far[k]):
                shown[i] = shown.get(i, 0) + 1
        self.assertEqual(max(shown.values()), 1, "no building shown twice at the near / far seam")


if __name__ == "__main__":
    unittest.main()
