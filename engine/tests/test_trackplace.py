"""Objects placed anew in a built kn5: moved, raised, turned and scaled around their place, what belongs to them and their wires along,
nothing else; the height changes after them go by where they stand now."""
import os
import sys
import unittest

import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(ENGINE, "..", "src")))

import generator  # noqa: E402,F401  (sets the engine's path)
from app import trackplace  # noqa: E402
from test_placement import house_list, placement  # noqa: E402
from test_trackheights import Base, mesh, plateau  # noqa: E402
from track import kn5  # noqa: E402


HOUSE = [(12.0, 100.0, 10.0), (10.0, 100.0, 12.0), (10.0, 105.0, 10.0)]
SIGN = [(11.0, 101.0, 10.0), (11.0, 102.0, 10.0), (10.0, 101.0, 11.0)]
OTHER = [(50.0, 100.0, 50.0), (51.0, 100.0, 50.0), (50.0, 101.0, 50.0)]


class MovedTest(Base):
    def place(self, placed, objects=None, ops=()):
        """The kn5 with placed and then ops applied, read back: {mesh name: its Node}."""
        scan = kn5.scan(self.path)
        out = os.path.join(self.dir, "out.kn5")
        kn5.without_faces(self.path, out, {}, trackplace.changed(self.path, scan, objects or {}, list(ops), placed))
        return {m.name: m for m in kn5.walk_meshes(kn5.read(out)["root"])}

    def test_moved_raised_and_nothing_else(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER), mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        out = self.place([placement(x=5.0, y=-0.5, z=-2.0)], house_list())
        pos = out["nocol_bld_0_0"].vertices["pos"]
        np.testing.assert_allclose(pos[:6], np.array(HOUSE + SIGN) + [5.0, -0.5, -2.0], atol=1e-4)       # (its sign with it)
        np.testing.assert_array_equal(pos[6:], OTHER)
        np.testing.assert_array_equal(out["1ROAD_ground_0_0"].vertices["pos"], [(10.0, 100.0, 10.0)] * 3)

    def test_turned_around_its_place_counter_clockwise_from_above_and_its_light_with_it(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER))
        v = self.place([placement(turn=90.0)], house_list())["nocol_bld_0_0"].vertices
        # (east of its place goes north, AC's -z; north of it west; its top stays over its place)
        np.testing.assert_allclose(v["pos"][:3], [(10.0, 100.0, 8.0), (12.0, 100.0, 10.0), (10.0, 105.0, 10.0)], atol=1e-4)
        np.testing.assert_allclose(v["tangent"][:3], [(0.0, 0.0, -1.0)] * 3, atol=1e-6)
        np.testing.assert_allclose(v["normal"][:3], [(0.0, 1.0, 0.0)] * 3, atol=1e-6)

    def test_scaled_around_its_foot(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER))
        pos = self.place([placement(scale=2.0)], house_list())["nocol_bld_0_0"].vertices["pos"]
        np.testing.assert_allclose(pos[:3], [(14.0, 100.0, 10.0), (10.0, 100.0, 14.0), (10.0, 110.0, 10.0)], atol=1e-4)

    def test_what_belongs_to_it_alone_and_then_with_it(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER))
        pos = self.place([placement("t_0_0#1", y=1.0), placement(x=5.0)], house_list())["nocol_bld_0_0"].vertices["pos"]
        np.testing.assert_allclose(pos[3:6], np.array(SIGN) + [5.0, 1.0, 0.0], atol=1e-4)
        np.testing.assert_allclose(pos[:3], np.array(HOUSE) + [5.0, 0.0, 0.0], atol=1e-4)

    def test_its_collision_in_another_mesh_goes_with_it(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE), mesh("1WALL_bldcol_0_0", 0, HOUSE, renderable=0))
        objects = {"t_0_0": {"kinds": ["house"], "at": [[10.0, 100.0, 10.0]], "parents": [-1], "faces": [[[0, 0, 1], [1, 0, 1]]], "with": {}}}
        out = self.place([placement(x=3.0)], objects)
        for name in ("nocol_bld_0_0", "1WALL_bldcol_0_0"):
            np.testing.assert_allclose(out[name].vertices["pos"], np.array(HOUSE) + [3.0, 0.0, 0.0], atol=1e-4)

    def test_a_wire_stays_on_its_poles_one_moved(self):
        poles = [(0.0, 100.0, 10.0)] * 3 + [(10.0, 100.0, 10.0)] * 3
        wire = [(0.0, 108.0, 10.0), (5.0, 107.0, 10.0), (10.0, 108.0, 10.0)]
        self.write(mesh("nocol_props_0_0", 0, poles), mesh("nocol_wire_0_0", 0, wire))
        objects = {"t_0_0": {"kinds": ["power pole", "power pole", "power line"], "at": [[0.0, 100.0, 10.0], [10.0, 100.0, 10.0], [5.0, 107.0, 10.0]],
                             "parents": [-1, -1, -1], "faces": [[[0, 0, 1]], [[0, 1, 1]], [[1, 0, 1]]],
                             "with": {"0": ["t_0_0#2"], "1": ["t_0_0#2"]}}}
        pos = self.place([placement("t_0_0#1", z=-4.0, y=2.0)], objects)["nocol_wire_0_0"].vertices["pos"]
        np.testing.assert_allclose(pos, [(0.0, 108.0, 10.0), (5.0, 108.0, 8.0), (10.0, 110.0, 6.0)], atol=1e-4)

    def test_heights_after_it_go_by_where_it_stands_now(self):
        """Moved under a raised spot it goes up with it; the spot it left takes nothing along."""
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER))
        moved_into = self.place([placement("t_0_0#2", x=-40.0, z=-40.0)], house_list(), [plateau()])["nocol_bld_0_0"].vertices["pos"]
        np.testing.assert_allclose(moved_into[6:], np.array(OTHER) + [-40.0, 1.0, -40.0], atol=1e-4)
        moved_out = self.place([placement(x=200.0)], house_list(), [plateau()])["nocol_bld_0_0"].vertices["pos"]
        np.testing.assert_allclose(moved_out[:3], np.array(HOUSE) + [200.0, 0.0, 0.0], atol=1e-4)
        np.testing.assert_allclose(moved_out[3:6], np.array(SIGN) + [200.0, 0.0, 0.0], atol=1e-4)

    def test_its_sphere_grows_by_its_way_and_the_rest_stays_to_the_byte(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE + SIGN + OTHER), mesh("1ROAD_ground_0_0", 0, [(10.0, 100.0, 10.0)] * 3))
        moved = trackplace.moved(self.path, kn5.scan(self.path), house_list(), [placement(x=30.0, z=-40.0)])
        self.assertEqual([0], sorted(moved.vertices))
        self.assertAlmostEqual(50.0, moved.grow[0], places=3)

    def test_no_placements_move_nothing_and_read_nothing(self):
        self.write(mesh("nocol_bld_0_0", 0, HOUSE))
        self.assertEqual(kn5.Moved({}, {}, {}), trackplace.moved(os.path.join(self.dir, "not there.kn5"), {}, house_list(), []))

    def test_the_meshes_of_an_object_what_belongs_to_it_and_its_wires(self):
        objects = {"t_0_0": {"kinds": ["power pole", "house sign", "power line"], "at": [[0.0, 0.0, 0.0]] * 3, "parents": [-1, 0, -1],
                             "faces": [[[4, 0, 1]], [[5, 0, 1]], [[6, 0, 1]]], "with": {"0": ["t_0_0#2"]}}}
        self.assertEqual([4, 5, 6], trackplace.meshes_of({"meshes": []}, objects, {"t_0_0#0"}))
        self.assertEqual([5], trackplace.meshes_of({"meshes": []}, objects, {"t_0_0#1"}))


if __name__ == "__main__":
    unittest.main()
