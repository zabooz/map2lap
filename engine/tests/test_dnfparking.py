"""Offline AI parking on an existing collision surface and migration of generated tracks."""
from pathlib import Path
import hashlib
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from track import dnfparking as park, kn5, route_race


def plane(name, x, z, radius, y):
    vertices = np.zeros(4, dtype=kn5.VERTEX)
    vertices["pos"] = [(x-radius, y, z-radius), (x+radius, y, z-radius),
                       (x+radius, y, z+radius), (x-radius, y, z+radius)]
    return kn5.Node(2, name, 1, vertices=vertices, indices=[0, 2, 1, 0, 3, 2],
                    bs_center=(x, y, z), bs_radius=2*radius, lod_out=1000)


class ParkingTest(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.model = self.folder / "lap.kn5"
        (self.folder / "data").mkdir()
        (self.folder / "extension").mkdir()
        (self.folder / "data/map2lap.json").write_text("{}")
        (self.folder / "extension/ext_config.ini").write_text("[CUSTOM]\nKEEP=1\n")
        (self.folder / "data/surfaces.ini").write_text("[SURFACE_0]\nKEY=ROAD\nWAV_PITCH=extended-0\n")
        self.identity = tuple(np.eye(4).ravel())

    def write_model(self, extra=()):
        points = [kn5.Node(1, "AC_PIT_0", 1, matrix=self.identity)]
        root = kn5.Node(1, "track", 1, matrix=self.identity, children=points+list(extra))
        kn5.write(self.model, [], [], root)

    def test_existing_track_installs_without_editing_main_model_and_retries_idempotently(self):
        self.write_model([plane("1GRASS_ground_0", 0, -40, 12, 7)])
        before = self.model.read_bytes()
        self.assertTrue(park.install(self.model))
        added = self.folder / park.MODEL
        target = kn5.scan(added)["points"]["AC_TIME_ATTACK_0"]
        self.assertAlmostEqual(target[13], 7.3, places=4)
        self.assertGreaterEqual(abs(target[14]), 30)
        stamp = added.stat().st_mtime_ns
        self.assertTrue(park.install(self.model))
        self.assertEqual(added.stat().st_mtime_ns, stamp)
        self.assertEqual(before, self.model.read_bytes())
        self.assertIn("KEEP=1", (self.folder/"extension/ext_config.ini").read_text())
        self.assertEqual((self.folder/"extension/ext_config.ini").read_text().count("retired_cars.lua"), 1)
        self.assertIn("ALLOW_TRACK_SCRIPTS=1", (self.folder/"data/surfaces.ini").read_text())

    def test_ab_finish_script_migrates_without_offroad_parking(self):
        self.write_model([kn5.Node(1, gate, 1, matrix=self.identity) for gate in route_race.GATES])
        old = b"-- previous Map2Lap retirement script"
        target = self.folder / "extension/retired_cars.lua"
        target.write_bytes(old)
        with mock.patch.object(park, "OLD_SCRIPTS", {hashlib.sha256(old).hexdigest()}):
            self.assertFalse(park.install(self.model))  # No parking model was added.
        self.assertIn("teleportCarTo", target.read_text())
        self.assertIn("Pits", target.read_text())
        self.assertIn("ALLOW_TRACK_SCRIPTS=1", (self.folder / "data/surfaces.ini").read_text())
        self.assertFalse((self.folder / park.MODEL).exists())

    @unittest.skipUnless(shutil.which("lua"), "Lua interpreter unavailable")
    def test_only_classified_offline_route_opponents_return_once_per_race(self):
        harness = """
local sim = { raceSessionType=3, carsCount=2 }
local car = { isAIControlled=true, isRetired=false, isRaceFinished=true, lapCount=0 }
local route, calls, permitted = false, 0, true
script = {}
ac = {SessionType={Race=3}, SpawnSet={Pits='PIT'}, getSim=function() return sim end,
      getCar=function(i) assert(i==1) return car end,
      findNodes=function() return {size=function() return route and 1 or 0 end} end,
      onSessionStart=function(f) restart=f end}
local held = false
physics = {allowed=function() return permitted end,
           setAINoInput=function(i,state) assert(i==1) held=state end,
           teleportCarTo=function(i,set) assert(i==1 and set=='PIT') calls=calls+1 end}
function loadTrack()
  dofile(arg[1])
end
loadTrack()
car.lapCount=1
script.update(0.1)
assert(calls==0)
route=true
loadTrack()
car.lapCount=0
script.update(0.1)
car.lapCount=1
sim.isOnlineRace=true
script.update(0.1)
sim.isOnlineRace=false
sim.isReplayActive=true
script.update(0.1)
sim.isReplayActive=false
sim.raceSessionType=1
script.update(0.1)
sim.raceSessionType=3
permitted=false
script.update(0.1)
permitted=true
assert(calls==0)
script.update(0.1)
car.isRaceFinished=false
script.update(0.1)
car.isRaceFinished=true
script.update(0.1)
assert(calls==1 and held)
restart()
assert(not held)
script.update(0.1)
assert(calls==2)
"""
        subprocess.run(["lua", "-", str(park.SCRIPT)], input=harness, text=True, check=True)

    def test_old_physics_migration_changes_wave_pitch_only_in_the_road_section(self):
        self.write_model([plane("1GRASS_ground_0", 0, -40, 12, 7)])
        surfaces = self.folder / "data/surfaces.ini"
        surfaces.write_text("[SURFACE_1]\nWAV_PITCH=0\n[SURFACE_0]\nWAV_PITCH=0\n")
        self.assertTrue(park.install(self.model))
        self.assertIn("[SURFACE_1]\nWAV_PITCH=0\n[SURFACE_0]\nWAV_PITCH=extended-0", surfaces.read_text())

    def test_preserves_legacy_timing_on_install_and_removal(self):
        self.write_model([plane("1GRASS_ground_0", 0, -40, 12, 7)])
        config = self.folder/"models.ini"
        original = route_race._models(self.model.name, route_race.PRACTICE_MODEL)
        config.write_text(original)
        self.assertTrue(park.install(self.model))
        self.assertIn(route_race.PRACTICE_MODEL, config.read_text())
        park.remove(self.model)
        self.assertEqual(config.read_text(), original)
        self.assertFalse((self.folder/park.MODEL).exists())

    def test_skips_occupied_or_unsupported_ground_and_foreign_configuration(self):
        grass = plane("1GRASS_ground_0", 0, -40, 4, 0)
        for obstacle in [plane("1WALL_building", 0, -40, 4, 3), plane("1ROAD_bridge", 0, -40, 6, 14),
                         kn5.Node(1, "AC_TIME_ATTACK_0", 1, matrix=self.identity)]:
            self.write_model([grass, obstacle])
            self.assertFalse(park.install(self.model))
            self.assertFalse((self.folder/"models.ini").exists())
        self.write_model([grass])
        (self.folder/"models.ini").write_text("[MODEL_0]\nFILE=foreign.kn5\n")
        self.assertFalse(park.install(self.model))
        self.assertEqual((self.folder/"models.ini").read_text(), "[MODEL_0]\nFILE=foreign.kn5\n")

if __name__ == "__main__":
    unittest.main()
