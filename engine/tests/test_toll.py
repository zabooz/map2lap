"""Toll canopies preserve every road opening, direction and mapped height."""
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import buildings
from buildings.toll import TollRoad, layout_toll, draw_toll
from buildings.mesh import Mesh
from polygon import contains_points
import tollsource
from geodesy import EnuFrame
from test_roads import features, LAT, LON
from test_buildings import Feats
from test_netfetch import fetcher


ROOF = np.array([[-20., -6.], [20., -6.], [20., 6.], [-20., 6.]])


class TollLayoutTest(unittest.TestCase):
    def test_seven_mapped_lanes_keep_six_forward_one_backward(self):
        road = TollRoad(np.array([[0., -30.], [0., 30.]]), 24.5, 7, 6, 1, speed=30)
        layout = layout_toll(ROOF, [road], {})
        self.assertEqual([p['direction'] for p in layout['lanes']], [-1, 1, 1, 1, 1, 1, 1])
        self.assertEqual(len(layout['gates']), 7)
        self.assertEqual({p['speed'] for p in layout['lanes']}, {30})
        self.assertEqual(layout['clear'], 5.5)

    def test_left_hand_traffic_reverses_lateral_lane_order(self):
        road = TollRoad(np.array([[0., -30.], [0., 30.]]), 12., 3, 2, 1)
        layout = layout_toll(ROOF, [road], {}, left_hand=True)
        self.assertEqual([p['direction'] for p in layout['lanes']], [1, 1, -1])

    def test_divided_roads_and_a_crossing_keep_all_openings_clear(self):
        roads = [TollRoad(np.array([[-7., -30.], [-7., 30.]]), 7., 2, 2, 0),
                 TollRoad(np.array([[7., 30.], [7., -30.]]), 10.5, 3, 3, 0),
                 TollRoad(np.array([[-30., 0.], [30., 0.]]), 5., 1)]
        layout = layout_toll(ROOF, roads, {})
        for room in layout['rooms']:
            for road in roads:
                for t in np.linspace(0, 1, 31):
                    point = road.xy[0] * (1 - t) + road.xy[-1] * t
                    self.assertFalse(contains_points(room, point[None])[0])
        for lane in layout['lanes']:
            for solid in layout['solid_boxes']:
                if solid['kind'] == 'roof':
                    continue
                d = np.asarray(lane['at']) - solid['at']
                u = solid['axis']; v = np.array([-u[1], u[0]])
                self.assertFalse(abs(d @ u) < solid['half'][0] and abs(d @ v) < solid['half'][1])

    def test_unknown_direction_does_not_invent_an_equal_split(self):
        road = TollRoad(np.array([[0., -30.], [0., 30.]]), 24.5, 7)
        self.assertEqual({x['direction'] for x in layout_toll(ROOF, [road], {})['lanes']}, {0})

    def test_actual_mapped_clearance_and_height_override_fallback(self):
        road = TollRoad(np.array([[0., -30.], [0., 30.]]), 7., 2)
        layout = layout_toll(ROOF, [road], {'min_height': 4.8, 'height': 6.0})
        self.assertEqual(layout['clear'], 4.8)
        self.assertEqual(layout['top'], 6.0)

    def test_collision_mesh_has_open_passages_instead_of_outer_building_walls(self):
        road = TollRoad(np.array([[0., -30.], [0., 30.]]), 24.5, 7, 6, 1)
        layout = layout_toll(ROOF, [road], {})
        mesh = Mesh(); draw_toll(mesh, layout, 100., collision=True)
        p, _, triangles, _, _ = mesh.arrays()
        triangles = p[triangles]
        # Every central lane's test line across the whole roof is free up to a passenger car's height.
        for lane in layout['lanes']:
            x = lane['at'][0]
            low = triangles[np.min(triangles[:, :, 2], axis=1) < 102.]
            for tri in low:
                if tri[:, 0].min() < x < tri[:, 0].max():
                    self.assertFalse(tri[:, 1].min() < 0 < tri[:, 1].max())
        self.assertGreater(len(p), 0)
        self.assertTrue(np.isfinite(p).all())


class TollSourceTest(unittest.TestCase):
    def setUp(self):
        self.frame = EnuFrame(LAT, LON, 0.)

    def data(self):
        elements = []
        for i, y in enumerate((-30., 0., 30.)):
            la, lo, _ = self.frame.enu_to_geodetic(0., y, 0.)
            elements.append(dict(type='node', id=i + 1, lat=float(la), lon=float(lo)))
        for i in (0, 1):
            elements.append(dict(type='way', id=10 + i, nodes=[i + 1, i + 2], tags={
                'highway': 'tertiary', 'lanes': '7', 'lanes:forward': '6', 'lanes:backward': '1', 'maxspeed': '30'}))
        return {'elements': elements}

    def test_source_way_geometry_preserves_direction_and_joins_at_the_roof(self):
        got = tollsource.roads_from_osm(self.data(), self.frame, ROOF, [])
        self.assertEqual(len(got), 1)
        self.assertEqual((got[0].lanes, got[0].forward, got[0].backward, got[0].speed), (7, 6, 1, 30))
        self.assertLess(got[0].xy[0, 1], got[0].xy[-1, 1])

    def test_partial_extract_keeps_another_crossing_road_open(self):
        f = features([[(0, -30), (0, 30)], [(10, -30), (10, 30)]], ['tertiary', 'tertiary'])
        with patch('tollsource._extract', return_value=self.data()):
            got = tollsource.station_roads(object(), self.frame, ROOF, [f], 0, 0)
        self.assertEqual(len(got), 2, 'the second road must survive missing OSM extract coverage')

    def test_optional_xml_extract_uses_the_real_fetch_policy_and_works_offline_afterwards(self):
        body = b'<osm version="0.6"><node id="1" lat="47" lon="12"/><way id="3"><nd ref="1"/><tag k="lanes" v="7"/></way></osm>'
        network, _, _, transport = fetcher({'api.openstreetmap.org': [(200, {}, body, .1)]})
        with tempfile.TemporaryDirectory() as folder:
            md = SimpleNamespace(cache_dir=folder, fetcher=network)
            data = tollsource._extract(md, self.frame, ROOF)
            self.assertIsNotNone(data, 'optional policy must actually permit the request')
            self.assertEqual(data['elements'][1]['tags']['lanes'], '7')
            self.assertEqual(len(transport.calls), 1)
            network.offline_flag = True
            other = SimpleNamespace(cache_dir=folder, fetcher=network)
            self.assertEqual(tollsource._extract(other, self.frame, ROOF), data)
            self.assertEqual(len(transport.calls), 1)

    def test_tile_builder_recognizes_a_short_toll_crossing_and_keeps_ordinary_buildings(self):
        def ll(ring):
            la, lo, _ = self.frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
            return np.c_[lo, la]
        roof = ROOF + [100, 100]
        b = Feats(['B'], [ll(np.r_[roof, roof[:1]])], **{'class': ['guardhouse'], 'src_record': ['w3@1']})
        infrastructure = Feats(['I'], [ll(np.r_[roof, roof[:1]])], **{'class': ['toll_booth'], 'src_record': ['w3@1']})
        road = TollRoad(np.array([[100., 60.], [100., 140.]]), 24.5, 7, 6, 1)
        terrain = lambda la, lo: np.zeros(np.shape(la))
        with patch('tollsource.station_roads', return_value=[road]):
            got = buildings.tile_buildings(self.frame, 0, 0, 256, 256, [b], terrain,
                                           toll_context=(object(), [], [infrastructure]), country='AT')
        self.assertEqual(len(got), 1)
        self.assertEqual(len(got[0][0].toll['lanes']), 7)
        self.assertEqual(buildings.collider_boxes(got, 0, 0), [])
        ordinary = buildings.tile_buildings(self.frame, 0, 0, 256, 256, [b], terrain)
        self.assertIsNone(ordinary[0][0].toll)
        self.assertEqual(len(buildings.collider_boxes(ordinary, 0, 0)), 1)


if __name__ == '__main__':
    unittest.main()
