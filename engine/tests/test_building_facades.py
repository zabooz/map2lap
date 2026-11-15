"""Window axes and entrance clearances agree in the emitted building facade."""
import sys
import unittest
from unittest.mock import patch
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import buildings as bld
from buildings import mesh
from buildings.looks import BAND_BRICK, BAND_PANEL, BAND_SASH, BAND_TALL, STUCCO, _Looks


def house(width=12., roof="gabled", separate_windows=False):
    """A two-storey house with a fixed facade and no regional randomness. Pure."""
    spec = bld.plan(np.array([[0., 0.], [width, 0.], [width, 8.], [0., 8.]]),
                    {"class": "house", "num_floors": 2, "roof_shape": roof})
    spec.roof, spec.floors, spec.floor_h, spec.height = roof, 2, 3., 6.
    spec.plain, spec.shop, spec.windows = False, False, True
    spec.wall = f"{STUCCO}|0" if separate_windows else None
    spec.facade = spec.wall or bld.FACADE
    spec.band, spec.porch, spec.stoop = BAND_SASH, False, None
    return spec


def front_windows(spec, floor=0, lite=False):
    """X extents of emitted window quads on the south facade's requested floor. Pure."""
    output = mesh.Mesh()
    mesh._walls(output, spec, spec.ring, 0., spec.height, _Looks(spec.seed), lite)
    p = np.asarray(output.P).reshape(-1, 4, 3)
    uv = np.asarray(output.UV).reshape(-1, 4, 2)
    result = []
    for quad, tex in zip(p, uv):
        if not np.all(np.abs(quad[:, 1]) < .1):
            continue
        if not floor * 3. <= quad[:, 2].mean() < (floor + 1) * 3.:
            continue
        if spec.wall:
            if np.all(quad[:, 1] < 0.):
                result.append((float(quad[:, 0].min()), float(quad[:, 0].max())))
        elif np.ptp(tex[:, 0]) > .8 / spec.band[1]:
            result.append((float(quad[:, 0].min()), float(quad[:, 0].max())))
    return result


class FacadeGeometryTest(unittest.TestCase):
    def test_separate_windows_mix_atlas_bays_stably_per_house_floor_and_wall(self):
        spec = house(24., separate_windows=True)
        def emit(seed):
            spec.seed = seed
            output = mesh.Mesh()
            mesh._walls(output, spec, spec.ring, 0., spec.height, _Looks(seed))
            uv = np.asarray(output.UV).reshape(-1, 4, 2)
            # Plain wall quads have repeating UVs; window quads retain the fixed panel dimensions.
            return uv[np.isclose(np.ptp(uv[:, :, 0], axis=1), mesh.WIN_UV[1] - mesh.WIN_UV[0])]
        first = emit(.123)
        np.testing.assert_array_equal(first, emit(.123))
        self.assertFalse(np.array_equal(first, emit(.456)))
        bays = np.floor(first[:, 0, 0] * 4).astype(int)
        self.assertEqual(set(bays), {0, 1, 2, 3})
        self.assertFalse(np.array_equal(bays[:7], bays[7:14]), "upper floors must not repeat columns")

    def test_blank_entrance_samples_no_shutters_or_glass(self):
        sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
        from PIL import Image
        from scenery.facades import GLASS, SHUTTER, sheet
        texture = np.asarray(sheet(Image.new("RGB", (1024, 1024), (200, 190, 180)), (1., 1., 1.), True))
        for band in (BAND_TALL, BAND_PANEL, BAND_SASH, BAND_BRICK):
            for lite in (False, True):
                with self.subTest(band=band, lite=lite):
                    spec = house()
                    spec.band, spec.door = band, (0, 6.)
                    output = mesh.Mesh()
                    mesh._walls(output, spec, spec.ring, 0., 6., _Looks(spec.seed), lite)
                    sampled = 0
                    for quad, uv in zip(np.asarray(output.P).reshape(-1, 4, 3),
                                        np.asarray(output.UV).reshape(-1, 4, 2)):
                        if not np.allclose(quad[:, 1], 0.) or quad[:, 2].max() > 3.:
                            continue
                        if not quad[:, 0].min() <= 6. <= quad[:, 0].max():
                            continue
                        x0, x1 = np.floor(uv[:, 0].min() * 1024), np.ceil(uv[:, 0].max() * 1024)
                        y0, y1 = np.floor((1 - uv[:, 1].max()) * 1024), np.ceil((1 - uv[:, 1].min()) * 1024)
                        pixels = texture[int(y0):int(y1), int(x0):int(x1)]
                        sampled += pixels.size
                        for color in (SHUTTER, GLASS):
                            self.assertFalse(np.any(np.all(pixels == color, axis=2)), (band, color, uv))
                    self.assertGreater(sampled, 0)

    def test_foundation_does_not_stretch_ground_floor_windows(self):
        for drop in (.4, 1., 4.):
            for lite in (False, True):
                with self.subTest(drop=drop, lite=lite):
                    spec = house()
                    output = mesh.Mesh()
                    mesh._walls(output, spec, spec.ring, -drop, 6., _Looks(spec.seed), lite)
                    for quad, uv in zip(np.asarray(output.P).reshape(-1, 4, 3),
                                        np.asarray(output.UV).reshape(-1, 4, 2)):
                        if np.ptp(uv[:, 0]) > .8 / spec.band[1]:
                            self.assertGreaterEqual(quad[:, 2].min(), 0.)
                            self.assertAlmostEqual(np.ptp(quad[:, 2]), 3.)

    def test_pitched_door_ground_uses_drawn_position_not_original_edge_number(self):
        spec = house()
        spec.ring = np.roll(spec.ring, 1, axis=0)
        spec.gring = 10. + .1 * spec.ring[:, 0] + .3 * spec.ring[:, 1]
        ring = mesh.drawn_ring(spec)
        for edge in range(len(ring)):
            a, b = ring[edge], ring[(edge + 1) % len(ring)]
            p = (a + b) / 2
            self.assertAlmostEqual(mesh.door_ground(spec, edge, np.linalg.norm(b - a) / 2, 20.),
                                   10. + .1 * p[0] + .3 * p[1])

    def test_ordinary_door_follows_local_ground_on_a_slope(self):
        for roof in ("flat", "gabled"):
            with self.subTest(roof=roof):
                spec = house(12., roof, separate_windows=True)
                spec.gring = np.array([10., 10., 14., 14.])
                street = (np.array([[-50., -6.], [100., -6.]]), 4.)
                rows = bld.doors([(spec, 10., 14.)], [street], 0., 0.)
                door = next(row for row in rows if row[0] == "door")
                self.assertEqual(door[3], 10.)

    def test_regional_pattern_reaches_the_building_without_changing_mapped_height(self):
        from buildings import FacadePattern
        pattern = FacadePattern(bay_m=3., entrance="right")
        style = bld.region_style(46.59, 7.91)
        with patch.object(style, "facade_pattern", pattern):
            spec = bld.plan(house().ring, {"class": "house", "num_floors": 2, "height": 8., "roof_shape": "flat"},
                            lat=46.59, lon=7.91)
        self.assertIs(spec.facade_pattern, pattern)
        self.assertEqual(spec.floors, 2)
        self.assertEqual(spec.height, 8.)

    def test_lite_facade_keeps_the_entrance_free_under_a_gable(self):
        spec = house(12.)
        spec.door = (0, 6.)
        windows = front_windows(spec, lite=True)
        self.assertTrue(windows)
        self.assertTrue(all(b <= 5.25 or a >= 6.75 for a, b in windows), windows)

    def test_door_clearance_can_cover_two_bays_without_cutting_a_window(self):
        spec = house(12.)
        spec.door = (0, 4.8)  # An explicit entrance at a bay boundary must keep its position.
        windows = front_windows(spec)
        self.assertEqual(spec.door, (0, 4.8))
        self.assertEqual(len(windows), 3)
        self.assertTrue(all(b <= 4.05 or a >= 5.55 for a, b in windows), windows)

    def test_entrance_preferences_and_too_narrow_walls(self):
        from buildings import FacadePattern
        from buildings.facade import entrance_position
        spec = house(12.)
        for preference, expected in (("left", 1.2), ("centre", 6.), ("right", 10.8)):
            spec.facade_pattern = FacadePattern(entrance=preference)
            self.assertAlmostEqual(entrance_position(spec, 12., .22), expected)
        self.assertIsNone(entrance_position(spec, 1., .5))

    def test_native_layout_rejects_invalid_dimensions(self):
        import fast
        for width, bay, preferred, clearance in ((0., 3., None, .75), (12., 0., None, .75),
                                                (12., 3., float("nan"), .75), (12., 3., 6., -1.)):
            with self.subTest(width=width, bay=bay, preferred=preferred, clearance=clearance):
                with self.assertRaises(ValueError):
                    fast._ef.facade_layout(width, bay, False, preferred, clearance)

    def test_pattern_controls_the_same_axes_for_door_and_windows(self):
        from buildings import FacadePattern
        spec = house(12.)
        spec.facade_pattern = FacadePattern(bay_m=3., entrance="centre")
        street = (np.array([[-50., -6.], [100., -6.]]), 4.)
        bld.doors([(spec, 0., 0.)], [street], 0., 0.)
        axes = [(a + b) / 2 for a, b in front_windows(spec, floor=1)]
        self.assertEqual(axes, [1.5, 4.5, 7.5, 10.5])
        self.assertIn(spec.door[1], axes)
        self.assertEqual(len(front_windows(spec)), 3)

    def test_invalid_patterns_are_rejected(self):
        from buildings import FacadePattern
        for kwargs in ({"bay_m": 0.}, {"bay_m": float("nan")}, {"entrance": "unknown"},
                       {"door_clearance_m": -1.}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                FacadePattern(**kwargs)

    def test_no_phantom_door_gap_on_a_wall_without_an_entrance(self):
        spec = house(11., separate_windows=True)
        self.assertEqual(len(front_windows(spec)), 3)
        self.assertEqual(front_windows(spec), front_windows(spec, floor=1))

    def test_separate_windows_reserve_the_actual_off_centre_entrance(self):
        spec = house(11., separate_windows=True)
        spec.door = (0, 11. / 6)
        windows = front_windows(spec)
        self.assertEqual(len(windows), 2)
        self.assertTrue(all(a >= spec.door[1] + .75 for a, _ in windows), windows)
        self.assertEqual(len(front_windows(spec, floor=1)), 3)

    def test_pitched_roof_reserves_the_same_entrance_bay_as_a_flat_roof(self):
        for roof in ("flat", "gabled", "hipped"):
            with self.subTest(roof=roof):
                spec = house(12., roof)
                spec.door = (0, 3.6)
                windows = front_windows(spec)
                self.assertEqual(len(windows), 4)
                self.assertTrue(all(b <= 2.85 or a >= 4.35 for a, b in windows), windows)
                self.assertEqual(len(front_windows(spec, floor=1)), 5)

    def test_inferred_door_is_on_a_window_axis(self):
        for width in (5., 8., 12., 19.):
            with self.subTest(width=width):
                spec = house(width)
                street = (np.array([[-50., -6.], [100., -6.]]), 4.)
                bld.doors([(spec, 0., 0.)], [street], 0., 0.)
                self.assertIsNotNone(spec.door)
                axes = [(a + b) / 2 for a, b in front_windows(spec, floor=1)]
                self.assertLess(min(abs(axis - spec.door[1]) for axis in axes), 1e-9)


if __name__ == "__main__":
    unittest.main()
