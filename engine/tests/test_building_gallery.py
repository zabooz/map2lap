"""The roof comparison gallery covers supported forms, mapped dimensions and explicit fallbacks."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
import building_gallery


class GalleryTest(unittest.TestCase):
    def test_house_keeps_roofs_and_adds_every_material(self):
        self.assertEqual(building_gallery.TITLE, "House")
        cases = building_gallery.cases()
        self.assertEqual(len(cases), 128)
        self.assertEqual({c['attrs']['facade_material'] for c in cases[32:43]},
                         {'brick', 'cement_block', 'clay', 'concrete', 'glass', 'metal', 'plaster',
                          'plastic', 'stone', 'timber_framing', 'wood'})
        self.assertEqual({c['attrs']['roof_material'] for c in cases[43:57]},
                         {'concrete', 'copper', 'eternit', 'glass', 'grass', 'gravel', 'metal', 'plastic',
                          'roof_tiles', 'slate', 'solar_panels', 'tar_paper', 'thatch', 'wood'})

    def test_part_example_uses_production_material_inheritance(self):
        import buildings as bld
        case = building_gallery.cases()[57]
        items = building_gallery.case_items(case, 20., 20.)
        self.assertEqual(len(items), 2)
        base, top = [item[0] for item in items]
        self.assertEqual(bld.LOOKS[base.facade][0], bld.STONE)
        self.assertEqual(bld.LOOKS[top.facade][0], bld.OFFICE)
        self.assertEqual(bld.LOOKS[top.roof_mat][0], bld.SURFACE_MATERIALS['cop'])
        self.assertAlmostEqual(top.min_h, 7.)

    def test_roof_equipment_examples_emit_the_new_textured_units(self):
        import buildings as bld
        for case in building_gallery.cases()[58:60]:
            items = building_gallery.case_items(case, 0., 0.)
            _, _, _, mids, materials, _ = bld.build(items)
            self.assertIn(bld.SURFACE_MATERIALS['hvu'], {materials[i] for i in mids})

    def test_garage_and_farm_examples_have_visible_gates(self):
        import buildings as bld
        cases = building_gallery.cases()[60:65]
        self.assertEqual({case['attrs']['class'] for case in cases}, {'garage', 'garages', 'stable', 'barn'})
        for case in cases:
            _, _, _, mids, materials, _ = bld.build(building_gallery.case_items(case, 0., 0.))
            self.assertIn(bld.SURFACE_MATERIALS['utl'], {materials[i] for i in mids})

    def test_business_section_covers_all_classes_without_forced_facade_materials(self):
        cases = building_gallery.cases()[65:81]
        self.assertEqual({case['attrs']['class'] for case in cases},
                         {'retail', 'commercial', 'supermarket', 'shop', 'kiosk', 'office', 'hotel', 'restaurant',
                          'civic', 'cafe', 'fast_food', 'industrial', 'warehouse', 'manufacture', 'factory', 'hangar'})
        for case in cases:
            self.assertIsNone(case['attrs']['facade_material'])
            self.assertIsNone(case['attrs']['facade_color'])
            items = building_gallery.case_items(case, 0., 0.)
            building_gallery.case_props(case, items, 0., 0.)
            spec = items[0][0]
            self.assertEqual(spec.cls, case['attrs']['class'])
            if spec.shop and not spec.plain:
                self.assertTrue(spec.names)
                self.assertIsNotNone(spec.sign)

    def test_housing_section_uses_all_residential_classes_and_normal_door_placement(self):
        cases = building_gallery.cases()[81:92]
        self.assertEqual({case['attrs']['class'] for case in cases},
                         {'house', 'detached', 'semidetached_house', 'bungalow', 'residential', 'apartments',
                          'terrace', 'dormitory', 'farm', 'cabin', 'static_caravan'})
        for case in cases:
            self.assertIsNone(case['attrs']['facade_material'])
            self.assertIsNone(case['attrs']['roof_shape'], 'Let regional roof rules run')
            items = building_gallery.case_items(case, 0., 0.)
            props = building_gallery.case_props(case, items, 0., 0.)
            self.assertEqual(items[0][0].cls, case['attrs']['class'])
            if case['attrs']['class'] in ('house', 'detached'):
                self.assertTrue(any(row[0] == 'door' for row in props))

    def test_remaining_requested_classes_and_missing_class_are_in_the_lab(self):
        import buildings as bld
        import numpy as np
        cases = building_gallery.cases()[92:]
        expected = {'carport', 'parking', 'parking_garage', 'farm_auxiliary', 'cowshed', 'agricultural',
                    'shed', 'hut', 'shelter', 'roof', 'greenhouse', 'service', 'toilets',
                    'silo', 'grain_silo', 'storage_tank', 'church', 'chapel', 'cathedral',
                    'fire_station', 'police', 'school', 'kindergarten', 'hospital', 'post_office', 'library',
                    'train_station', 'townhall', 'government', 'public', 'university', 'college',
                    'yes', 'transportation', None, 'unknown_building'}
        self.assertEqual(len(cases), len(expected))
        self.assertEqual({case['attrs'].get('class') for case in cases}, expected)
        for case in cases:
            with self.subTest(title=case['title']):
                self.assertIsNone(case['attrs']['facade_material'])
                items = building_gallery.case_items(case, 0., 0.)
                building_gallery.case_props(case, items, 0., 0.)
                self.assertEqual(items[0][0].cls, case['attrs'].get('class', ''))
                p, uv, triangles, *_ = bld.build(items)
                self.assertGreater(len(triangles), 0)
                self.assertTrue(np.isfinite(p).all() and np.isfinite(uv).all())
                if case['attrs'].get('class') in ('parking', 'parking_garage'):
                    self.assertTrue(items[0][0].deck, 'Large parking examples exercise actual parking decks')

    def test_business_examples_do_not_overlap_and_big_boxes_reach_the_production_size(self):
        import buildings as bld
        import numpy as np
        boxes = []
        for i, case in enumerate(building_gallery.cases()):
            x, y = building_gallery.case_position(i)
            ring = building_gallery.footprint(case['footprint']) * case.get('scale', 1.) + [x, y]
            lo, hi = ring.min(0), ring.max(0)
            for a, b in boxes:
                self.assertFalse(np.all(hi > a) and np.all(b > lo), case['title'])
            boxes.append((lo, hi))
            if i >= 65 and case['attrs'].get('class') == 'supermarket':
                self.assertGreaterEqual(bld._area2(ring) / 2, 1200.)

    def test_labels_after_32_have_their_own_atlas_space(self):
        import tempfile
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            building_gallery.label_texture(Path(tmp), [str(i) for i in range(57)])
            with Image.open(Path(tmp) / 'labels.png') as img:
                self.assertEqual(img.size, (1024, 4096))
                self.assertEqual(img.getpixel((3, 28 * 128 + 3)), (120, 158, 162))

    def test_onion_and_spherical_examples_use_tall_roofs_on_small_square_towers(self):
        import numpy as np
        cases = building_gallery.cases()
        for index, shape in ((23, "onion"), (27, "spherical")):
            case = cases[index]
            self.assertEqual(case["attrs"]["roof_shape"], shape)
            width, depth = np.ptp(building_gallery.footprint(case["footprint"]), axis=0)
            self.assertEqual(width, 6.)
            self.assertEqual(depth, 6.)
            self.assertGreaterEqual(case["attrs"]["roof_height"], .9 * width)
            self.assertAlmostEqual(case["attrs"]["height"] - case["attrs"]["roof_height"], 9.)
            self.assertEqual(case["attrs"]["num_floors"], 3)

    def test_every_gallery_roof_is_now_drawn_as_requested(self):
        import buildings as bld
        for case in building_gallery.cases():
            with self.subTest(title=case["title"]):
                spec = bld.plan(building_gallery.footprint(case["footprint"]), case["attrs"], lat=46.6, lon=14.6)
                if case["attrs"]["roof_shape"] is not None:
                    self.assertEqual(spec.roof, case["attrs"]["roof_shape"])

    def test_catalogue_includes_every_overture_roof_shape_and_both_orientations(self):
        cases = building_gallery.cases()
        shapes = {c["attrs"].get("roof_shape") for c in cases}
        self.assertTrue({"flat", "gabled", "hipped", "skillion", "pyramidal", "half_hipped", "mansard", "gambrel",
                         "dome", "onion", "round", "saltbox", "sawtooth", "spherical"} <= shapes)
        self.assertTrue({"along", "across"} <= {c["attrs"].get("roof_orientation") for c in cases})
        self.assertTrue({1., 3., 5.} <= {c["attrs"].get("roof_height") for c in cases})
        self.assertEqual(len(cases), len({c["title"] for c in cases}))


if __name__ == "__main__":
    unittest.main()
