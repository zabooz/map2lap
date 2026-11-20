"""The closed lap and its twice-driven stretches from OSRM annotations."""

import io
import json
from pathlib import Path
import sys
import unittest
from unittest import mock
from urllib.parse import parse_qsl, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
import app.circuitlap as circuitlap
from app.version import USER_AGENT
import generator


A, B, C, D = (14.60, 46.60), (14.61, 46.60), (14.61, 46.61), (14.60, 46.61)


def answer(legs, pins, coords=None):
    """OSRM answer for (nodes, edge metres) per leg and (lon, lat) pins and coordinates. Pure."""
    legs = [
        {"distance": sum(distances), "annotation": {"nodes": nodes, "distance": distances}}
        for nodes, distances in legs
    ]
    return {
        "routes": [{
            "distance": sum(leg["distance"] for leg in legs),
            "geometry": {"coordinates": [list(point) for point in (pins if coords is None else coords)]},
            "legs": legs,
        }],
        "waypoints": [{"location": list(pin)} for pin in pins],
    }


def ring(redundant_pin=False):
    """Three 300 m legs around a ring, optionally with an extra pin snapped to pin 1. Pure."""
    legs = [([1, 2], [300]), ([2, 3], [300]), ([3, 1], [300])]
    pins = [A, B, C, A]
    if redundant_pin:
        legs.append(([1, 2], [0]))
        pins.append(A)
    return answer(legs, pins, [A, B, C, A])


def dumbbell(start_on_stem=False):
    """A 100 m loop and a 600 m loop joined by a 200 m stem, with a start on the loop or stem. Pure."""
    outer, middle, inner = A, B, (14.62, 46.60)
    short_a, short_b = (14.599, 46.599), (14.599, 46.601)
    long_a, long_b, long_c = (14.62, 46.604), (14.624, 46.604), (14.624, 46.60)
    if start_on_stem:
        start = (14.604, 46.60)
        legs = [
            ([1, 2, 3, 6], [60, 100, 150]),
            ([6, 7, 8, 3, 2, 1, 4, 5, 1, 2], [150, 150, 150, 100, 100, 40, 30, 30, 40]),
        ]
        coords = [start, middle, inner, long_a, long_b, long_c, inner, middle, outer,
                  short_a, short_b, outer, start]
    else:
        start = short_a
        legs = [
            ([4, 5, 1, 2, 3, 6], [30, 30, 100, 100, 150]),
            ([6, 7, 8, 3, 2, 1, 4], [150, 150, 150, 100, 100, 40]),
        ]
        coords = [start, short_b, outer, middle, inner, long_a, long_b, long_c, inner, middle, outer, start]
    return answer(legs, [start, long_a, start], coords)


class CircuitRequestTest(unittest.TestCase):
    def test_circuit_request_closes_on_pin_1_and_keeps_straight(self):
        points = [(1, 2), (3, 4)]
        coords = [(2, 1), (4, 3), (2, 3), (2, 1)]
        response = answer([([1, 2], [300]), ([2, 3, 1], [150, 150])], [coords[0], coords[1], coords[-1]], coords)
        response["code"] = "Ok"
        with mock.patch("urllib.request.urlopen", return_value=io.StringIO(json.dumps(response))) as open_url:
            lap = generator.circuit_route(points)

        open_url.assert_called_once()
        request, = open_url.call_args.args
        self.assertEqual(open_url.call_args.kwargs, {"timeout": 30})
        self.assertEqual(request.get_header("User-agent"), USER_AGENT)
        url = urlsplit(request.full_url)
        self.assertEqual(url.path, "/route/v1/driving/2.000000,1.000000;4.000000,3.000000;2.000000,1.000000")
        self.assertCountEqual(parse_qsl(url.query), [
            ("overview", "full"), ("geometries", "geojson"),
            ("continue_straight", "true"), ("annotations", "nodes,distance"),
        ])
        self.assertEqual(lap, circuitlap.Lap([(lat, lon) for lon, lat in coords], 600.0, [], [0.0, 300.0]))
        self.assertEqual(points, [(1, 2), (3, 4)])

    def test_circuit_needs_two_pins_before_requesting_osrm(self):
        with mock.patch("urllib.request.urlopen") as open_url:
            for points in ([], [(1, 2)]):
                with self.subTest(points=points), self.assertRaisesRegex(circuitlap.NoLap, "^Set at least two pins$"):
                    generator.circuit_route(points)
            open_url.assert_not_called()

    def test_circuit_keeps_osrm_error(self):
        for code, message in (("NoRoute", "Impossible route between points"), ("Ok", "Missing routes")):
            response = {"code": code, "message": message, "routes": []}
            with self.subTest(code=code), \
                 mock.patch("urllib.request.urlopen", return_value=io.StringIO(json.dumps(response))), \
                 self.assertRaisesRegex(RuntimeError, f"^OSRM: {code} {message}$"):
                generator.circuit_route([(1, 2), (3, 4)])


class CircuitLapTest(unittest.TestCase):
    def test_ring_has_no_twice_driven_span(self):
        lap = circuitlap.lap(ring())
        self.assertAlmostEqual(lap.length_m, 900)
        self.assertEqual(lap.twice, [])
        self.assertEqual(lap.pins_m, [0, 300, 600])
        self.assertEqual(lap.coords, [(lat, lon) for lon, lat in [A, B, C, A]])

    def test_leg_boundary_inside_one_edge_is_one_traversal(self):
        mid_bc = (14.61, 46.605)
        legs = [([1, 2, 3], [200, 100]), ([2, 3, 4], [100, 200]), ([4, 1], [300])]
        lap = circuitlap.lap(answer(legs, [A, mid_bc, D, A], [A, B, mid_bc, C, D, A]))
        self.assertEqual(lap.twice, [])

    def test_seam_inside_one_edge_is_one_traversal(self):
        mid_ab = (14.605, 46.60)
        legs = [([1, 2, 3], [100, 200]), ([3, 4], [300]), ([4, 1, 2], [200, 100])]
        lap = circuitlap.lap(answer(legs, [mid_ab, C, D, mid_ab], [mid_ab, B, C, D, A, mid_ab]))
        self.assertEqual(lap.twice, [])

    def test_seam_joins_at_the_snapped_osm_node(self):
        legs = [([1, 2], [300]), ([2, 3], [300]), ([3, 1, 4], [300, 0])]
        lap = circuitlap.lap(answer(legs, [A, B, C, A]))
        self.assertEqual(lap.coords[0], lap.coords[-1])
        self.assertEqual(lap.twice, [])

    def test_seam_between_stacked_roads_does_not_join(self):
        legs = [([1, 2, 3], [150, 150]), ([3, 4, 5], [150, 150])]
        route = answer(legs, [A, C, A], [A, B, C, D, A])
        with self.assertRaisesRegex(
            circuitlap.NoLap, "^At pin 1 the lap does not join up: move pin 1 along its road$"
        ):
            circuitlap.lap(route)

    def test_zero_length_phantom_edges_at_a_junction_are_not_driven(self):
        legs = [([2, 1, 4], [0, 300]), ([4, 3], [300]), ([3, 1, 2], [300, 0])]
        lap = circuitlap.lap(answer(legs, [A, D, C, A]))
        self.assertEqual(lap.twice, [])

    def test_rounding_does_not_turn_a_zero_length_phantom_into_a_repeat(self):
        legs = [
            ([1, 2, 4, 1, 3, 5, 6], [75, 75, 100, 75, 75, 100]),
            ([6, 1, 3], [462.05400000000003, 0.0]),
        ]
        route = answer(legs, [A, C, A])
        route["routes"][0]["legs"][-1]["distance"] = 462.1
        route["routes"][0]["distance"] = 962.1
        self.assertEqual(circuitlap.lap(route).twice, [])

    def test_dumbbell_stem_is_twice_driven(self):
        lap = circuitlap.lap(dumbbell())
        self.assertEqual(lap.twice, [(60, 260), (860, 1060)])

    def test_twice_driven_span_wraps_at_pin_1(self):
        lap = circuitlap.lap(dumbbell(start_on_stem=True))
        self.assertEqual(lap.twice, [(0, 160), (760, 960), (1060, 1100)])

    def test_annotated_span_ends_at_the_rounded_lap_length(self):
        route = dumbbell(start_on_stem=True)
        route["routes"][0]["legs"][-1]["annotation"]["distance"][-1] += 0.04
        lap = circuitlap.lap(route)
        self.assertEqual(lap.twice[-1][1], lap.length_m)

    def test_driven_span_ends_at_pin_1_before_a_trailing_phantom(self):
        legs = [
            ([2, 3, 6], [100, 150]),
            ([6, 7, 8, 3, 2, 1, 4, 5, 1, 2, 9], [150, 150, 150, 100, 100, 40, 30, 30, 100.19, 0]),
        ]
        route = answer(legs, [B, C, B])
        route["routes"][0]["legs"][-1]["distance"] = 850.2
        route["routes"][0]["distance"] = 1100.2
        lap = circuitlap.lap(route)
        self.assertEqual(lap.twice[-1][1], lap.length_m)

    def test_figure_eight_crossing_node_is_not_twice_driven(self):
        crossing = (14.605, 46.605)
        legs = [([1, 5, 2], [150, 150]), ([2, 3], [300]), ([3, 5, 4, 1], [100, 100, 100])]
        lap = circuitlap.lap(answer(legs, [A, B, C, A], [A, crossing, B, C, crossing, D, A]))
        self.assertEqual(lap.twice, [])

    def test_u_turn_at_a_pin_names_the_pin(self):
        legs = [([1, 2], [300]), ([2, 3, 4], [150, 150]), ([4, 3, 5, 1], [100, 100, 100])]
        with self.assertRaisesRegex(circuitlap.NoLap, "At pin 3 the car would have to turn around"):
            circuitlap.lap(answer(legs, [A, B, D, A]))

    def test_u_turn_inside_closing_leg_names_both_pins(self):
        legs = [([1, 2], [300]), ([2, 3], [300]), ([3, 4, 5, 4, 1], [75, 75, 75, 75])]
        with self.assertRaisesRegex(circuitlap.NoLap, "Between pin 3 and pin 1 the car would have to turn around"):
            circuitlap.lap(answer(legs, [A, B, C, A]))

    def test_u_turn_at_the_seam_names_pin_1(self):
        legs = [([1, 2], [300]), ([2, 1], [300])]
        with self.assertRaisesRegex(circuitlap.NoLap, "At pin 1 the car would have to turn around"):
            circuitlap.lap(answer(legs, [A, B, A]))

    def test_u_turn_at_pin_1_survives_a_leg_rounded_to_zero(self):
        start, next_pin, far_pin = (14.60, 70), (14.600001, 70), (14.603, 70)
        legs = [([2, 1], [0.038]), ([2, 1, 3], [0, 112]), ([3, 4, 1, 2], [38, 114, 0.038])]
        route = answer(legs, [start, next_pin, far_pin, start])
        route["routes"][0]["legs"][0]["distance"] = 0.0
        route["routes"][0]["legs"][-1]["distance"] = 152
        route["routes"][0]["distance"] = 264
        with self.assertRaisesRegex(circuitlap.NoLap, "At pin 1 the car would have to turn around"):
            circuitlap.lap(route)

    def test_free_ended_stem_requires_u_turn_at_pin_1(self):
        legs = [([1, 2, 3, 4], [100, 100, 200]), ([4, 5, 3, 2, 1], [200, 200, 100, 100])]
        with self.assertRaisesRegex(circuitlap.NoLap, "At pin 1 the car would have to turn around"):
            circuitlap.lap(answer(legs, [A, D, A], [A, B, C, D, (14.60, 46.62), C, B, A]))

    def test_hairpin_is_allowed(self):
        hairpin = (14.60, 46.6006)
        legs = [([1, 2, 3], [300, 300]), ([3, 4, 1], [150, 150])]
        lap = circuitlap.lap(answer(legs, [A, hairpin, A], [A, B, hairpin, D, A]))
        self.assertEqual(lap.twice, [])

    def test_closing_leg_of_zero_length_is_dropped(self):
        lap = circuitlap.lap(ring(redundant_pin=True))
        self.assertEqual(lap.pins_m, [0, 300, 600])
        self.assertAlmostEqual(lap.length_m, 900)

    def test_same_location_closing_leg_with_actual_travel_is_kept(self):
        start, outer, near = (14.60, 80), (14.61, 80), (14.600001, 80)
        legs = [([1, 2], [300]), ([2, 3], [300]), ([3, 4, 1], [0.019, 0.019])]
        route = answer(legs, [start, outer, start, start], [start, outer, start, near, start])
        route["routes"][0]["legs"][-1]["distance"] = 0.0
        route["routes"][0]["distance"] = 600
        self.assertEqual(circuitlap.lap(route).pins_m, [0, 300, 600])

    def test_rounded_zero_leg_counts_as_a_traversal_without_emitting_an_empty_span(self):
        start = (14.599, 80)
        outer, inner = (14.60, 80), (14.600002, 80)
        legs = [
            ([4, 5, 1], [30, 30]),
            ([1, 2], [0.038]),
            ([2, 6, 7, 8, 2, 1, 4], [150, 150, 150, 150, 0.038, 40]),
        ]
        route = answer(legs, [start, outer, inner, start])
        route["routes"][0]["legs"][1]["distance"] = 0.0
        route["routes"][0]["legs"][-1]["distance"] = 640
        route["routes"][0]["distance"] = 700
        lap = circuitlap.lap(route)
        self.assertEqual(len(lap.twice), 1)
        lo, hi = lap.twice[0]
        self.assertAlmostEqual(lo, 660, places=1)
        self.assertGreater(hi, lo)

    def test_rounded_zero_closing_leg_stays_at_the_reported_lap_end(self):
        start, outer, far_pin = (14.60, 80), (14.600002, 80), (14.61, 80)
        legs = [
            ([2, 3], [300.2]),
            ([3, 4, 2, 1, 5, 6, 1], [100, 100, 0.038, 100.4, 100, 200]),
            ([1, 2], [0.038]),
        ]
        route = answer(legs, [start, far_pin, outer, start])
        route["routes"][0]["legs"][1]["distance"] = 600.4
        route["routes"][0]["legs"][-1]["distance"] = 0.0
        route["routes"][0]["distance"] = 900.6
        lap = circuitlap.lap(route)
        self.assertEqual(lap.pins_m[-1], lap.length_m)
        self.assertEqual(len(lap.twice), 1)


if __name__ == "__main__":
    unittest.main()
