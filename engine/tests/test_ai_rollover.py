"""An optional flip fixture belongs only to one opponent in an instrumented ai_race session."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import ai_race


class RolloverProbeTest(unittest.TestCase):
    def test_only_requested_probe_contains_the_rollover(self):
        plain = ai_race.probe_bytes('race-key', 3)
        self.assertNotIn(b'physics.addForce', plain)
        self.assertNotIn(b'__', plain)
        probe = ai_race.probe_bytes('race-key', 3, 2)
        self.assertIn(b'local target = 2', probe)
        self.assertIn(b'physics.addForce', probe)
        self.assertNotIn(b'preventAIFromRetiring', probe)
        self.assertIn(b'M2L_ROLL,state', probe)
        self.assertNotIn(b'__', probe)

    def test_confirmation_belongs_to_the_selected_opponent(self):
        trace = (b'M2L_ROLL,state,13.5,2,0.9,0,0,0,3.0,10,0,0\n'
                 b'M2L_ROLL,state,14.0,12,-0.94,2,0,0,1.0,5,0,0\r\n')
        self.assertFalse(ai_race.roof_observed(trace, 2))
        self.assertTrue(ai_race.roof_observed(trace, 12))

    def test_player_and_nonexistent_cars_cannot_be_selected(self):
        for index in (-1, 0, 4):
            with self.subTest(index=index), self.assertRaises(ValueError):
                ai_race.probe_bytes('race-key', 3, index)


if __name__ == '__main__':
    unittest.main()
