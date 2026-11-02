"""Highway signs (from cody196's PR #363): the road worker and the in-process fallback build the same sign tiles
without changing road geometry or physics; the stream's bookkeeping; the sign shards' reader (railtags.SignTags)."""
import asyncio
import json
from pathlib import Path
import sys
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import blockworker
import highwaysigns
import milemarkers
import railtags
import roads
import revisit
import signstream
from test_blockworker import FakeDem, FakeMapData
from test_roads import FRAME, LAT, LON, FakeConn, features, rules


class FakeTags:
    """railtags.SignTags' interface with fixed records."""

    def __init__(self, objects=(), built='test'):
        self.objects, self.built = list(objects), built

    def version(self):
        return self.built

    def known(self):
        return self.built

    def query(self, lon0, lat0, lon1, lat1, kinds=None):
        return [o for o in self.objects if lon0 <= o['lon'] <= lon1 and lat0 <= o['lat'] <= lat1]


def fixture(raw_dir):
    f = features([[(-1900., 100.), (700., 100.)], [(0., 100.), (100., -20.), (200., -100.)]],
                 ['motorway', 'motorway'], ids=['osm:w10:0', 'osm:w20:0'])
    f.rules['oneway'] = rules([(0, 1.), (1, 1.)], 'float')
    f.rules['subclass'] = rules([(1, 'link')])
    f.attrs['osm_lanes'] = np.array([2., 1.])
    md = FakeMapData(f, roads.cells_of_tile(FRAME, 0, 0)[0])
    md.cache_dir, md.fetcher = raw_dir, None
    main, ramp = f.parts(0)[0][0], f.parts(1)[0][0]
    exit_obj = dict(id=-20, lon=float(ramp[0][0]), lat=float(ramp[0][1]), tags={}, ways=[],
                    exit=dict(label=dict(ref='36', names=['Auburn'], routes=[]),
                              approach=[main[0].tolist(), ramp[0].tolist()], ramp=ramp.tolist(),
                              main_ids=[10], ramp_id=20, side=1))
    la, lo, _ = FRAME.enu_to_geodetic(150., 100., 0.)
    mile = milemarkers._object('MD', 95, 116, 'E', [float(lo), float(la)], [1., 0.], 'osm')
    md.highway_signs = highwaysigns.Source(md, tags=FakeTags([exit_obj, mile]))
    return md






class PipelineTest(unittest.TestCase):

    def test_revisited_roads_can_get_fresh_signs_without_rebuilding_roads(self):
        with tempfile.TemporaryDirectory() as root:
            md = fixture(root)
            self.addCleanup(md.highway_signs.close)
            first, revisit_dir = Path(root, 'first'), Path(root, 'revisited')
            first.mkdir()
            revisit_dir.mkdir()
            state = SimpleNamespace(md=md, dem=FakeDem(), widths=None, surface=None, airports=None, sea=None,
                                    lock=threading.Lock(), cache_dir=root, bridges={},
                                    anchor=lambda *a: (None, None))
            with mock.patch.object(blockworker, '_s', state), mock.patch.object(revisit, 'ON', True), \
                    mock.patch.object(revisit, 'SKIP', set()):
                blockworker.roads_tile(1, LAT, LON, 15, 0, 0, str(first), '/temp/first', False, .05)
                self.assertTrue(list(Path(root, 'revisit').rglob('*.zip')))
                with mock.patch.object(blockworker, '_roads_tile', side_effect=AssertionError('cache missed')):
                    path, _, pads = blockworker.roads_tile(
                        2, LAT, LON, 15, 0, 0, str(revisit_dir), '/temp/revisited', False, .05)
                self.assertEqual(path, '/temp/revisited/roads_2_0_0.json')
                self.assertEqual(pads, [])
                signs = blockworker.signs_tile(2, LAT, LON, 15, 0, 0, str(revisit_dir), '/temp/revisited')
                data = json.loads((revisit_dir / Path(signs[0]).name).read_text())
                self.assertIn('exits', data)
                self.assertIn('mileposts', data)
                self.assertIn('/temp/revisited/', data['exits']['shape'])





class StreamingTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.tracker = signstream.Tracker()
        self.addCleanup(self.tracker.close)
        self.conn = SimpleNamespace(s=SimpleNamespace(out_dir=self.temp.name), sent=[])
        self.conn.send = self.conn.sent.append
        self.pending = []
        def queue(*args):
            future = asyncio.get_running_loop().create_future()
            self.pending.append(future)
            return future
        self.loop = SimpleNamespace(run_in_executor=queue)
        self.build = mock.Mock()

    def pose(self, ready, aid=1, version='test'):
        self.tracker.on_pose(self.conn, aid, 0., 0., self.loop, self.build, ready, version=version)

    async def finish(self, index=0, aid=1, n=None):
        result = signstream.write_tile(self.temp.name, '/temp/test', aid, 0, 0, (None, None, None))
        if n is not None:
            result = (result[0], n)
        self.pending[index].set_result(result)
        await asyncio.sleep(0)

    async def test_waits_for_roads_and_empty_replacements_do_not_pool_stale_shapes(self):
        self.pose(set())
        self.assertFalse(self.pending)
        self.pose({(0, 0)})
        pool = self.conn.s.pool_shapes = mock.Mock(return_value={})
        await self.finish(n=1)
        self.assertEqual(self.conn.sent[0]['key'], 's0_0')
        self.assertEqual(pool.call_args.args[1], {})
        self.pose({(0, 0)})
        self.assertEqual(len(self.pending), 1)
        self.pose(set())
        self.assertEqual(self.conn.sent[-1]['type'], 'roads_drop')
        self.assertEqual(self.conn.sent[-1]['key'], 's0_0')

    async def test_refresh_in_flight_requeues_and_discards_old_index_result(self):
        self.pose({(0, 0)})
        self.tracker.refresh()
        await self.finish()
        self.assertFalse(self.conn.sent)
        self.pose({(0, 0)})
        await self.finish(1, n=1)
        self.assertEqual(len(self.conn.sent), 1)
        self.assertFalse(self.tracker.stale)

    async def test_rebases_bound_work_and_do_not_announce_old_anchor(self):
        self.pose({(0, 0), (1, 0), (2, 0)})
        self.assertEqual(len(self.pending), signstream.WORKERS)
        self.pose({(0, 0)}, aid=2)
        self.assertEqual(len(self.pending), signstream.WORKERS)
        await self.finish()
        self.assertFalse(self.conn.sent)
        self.pose({(0, 0)}, aid=2)
        self.assertEqual(len(self.pending), signstream.WORKERS + 1)

    async def test_departed_tile_and_closed_connection_reject_completed_work(self):
        self.pose({(0, 0)})
        self.pose(set())
        await self.finish()
        self.assertFalse(self.conn.sent)
        self.pose({(0, 0)})
        self.tracker.close()
        await asyncio.sleep(0)
        self.assertFalse(self.conn.sent)

    async def test_worker_failure_retries_later_without_dropping_roads(self):
        self.pose({(0, 0)})
        with self.assertLogs('earthd.signs', level='WARNING'):
            self.pending[0].set_exception(OSError('unavailable'))
            await asyncio.sleep(0)
        self.assertFalse(self.conn.sent)
        self.pose({(0, 0)})
        self.assertEqual(len(self.pending), 1)
        self.tracker.retry[(0, 0)] = 0.
        self.pose({(0, 0)})
        self.assertEqual(len(self.pending), 2)


    async def test_an_empty_tile_is_not_announced_unless_it_replaces_signs(self):
        self.pose({(0, 0)})
        await self.finish()
        self.assertFalse(self.conn.sent)
        self.assertEqual(self.tracker.sent, {(0, 0)})
        self.pose({(0, 0)}, version='next week')     # (new sign data: the tile again, its empty result sent)
        self.assertEqual(self.tracker.stale, {(0, 0)})
        await self.finish(1)
        self.assertEqual([m['key'] for m in self.conn.sent], ['s0_0'])

    async def test_sign_data_arriving_rebuilds_the_tiles_sent_without_it(self):
        self.pose({(0, 0)}, version=None)
        await self.finish(n=1)
        self.pose({(0, 0)}, version='built')
        self.assertEqual(len(self.pending), 2)


if __name__ == '__main__':
    unittest.main()
