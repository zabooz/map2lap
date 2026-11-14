"""Parked-car density is a reversible layer; manual deletions and other objects stay independent."""
import unittest

from test_trackcopy import Base
from app import trackedits, trackcopy, trackview


class CarDensityTest(Base):
    def setting(self, percent, name='t'):
        now = trackedits.load(self.ac, name)
        return trackedits.car_density(self.ac, name, {**now, 'percent': percent})['car_density']

    def keep(self, setting, deleted=None, name='t'):
        now = trackedits.load(self.ac, name)
        trackedits.save(self.ac, name, {**now, 'car_density': setting, 'id': 'density',
            'deleted': now['deleted'] if deleted is None else [{'id': d, 'position': [0, 0, 0]} for d in deleted]})

    def test_subsets_are_nested_and_only_cars_are_hidden(self):
        previous = set()
        for percent, count in ((100, 0), (67, 1), (34, 2), (0, 3)):
            setting = self.setting(percent)
            self.assertEqual(len(setting['hidden']), count)
            self.assertLessEqual(previous, set(setting['hidden']))
            self.assertLessEqual(set(setting['hidden']), {'t_0_0#0', 't_0_0#1', 't_0_0#2'})
            previous = set(setting['hidden'])

    def test_save_copy_reopen_and_restore_keeps_manual_deletion(self):
        setting = self.setting(0)
        self.keep(setting, ['t_0_0#0'])
        trackcopy.save(self.ac, 't', copy_to='density_copy', title='Density copy')
        trackedits.clear('density_copy')
        self.assertEqual(trackedits.load(self.ac, 'density_copy')['car_density'], setting)
        objects = trackview.list_of(self.own('density_copy'))['t_0_0']
        self.assertTrue(all(not faces for faces in objects['faces'][:3]))
        self.assertTrue(objects['faces'][3])
        self.keep(self.setting(100, 'density_copy'), name='density_copy')
        trackcopy.save(self.ac, 'density_copy')
        objects = trackview.list_of(self.own('density_copy'))['t_0_0']
        self.assertFalse(objects['faces'][0])
        self.assertTrue(all(objects['faces'][i] for i in (1, 2, 3)))

    def test_invalid_values_stale_revision_and_non_car_hidden_ids_are_refused(self):
        self.assertIsNone(trackedits.load(self.ac, 't')['car_density'])
        for percent in (-1, 101, True, float('nan'), '50'):
            with self.assertRaises(trackedits.Invalid):
                self.setting(percent)
        with self.assertRaises(trackedits.Conflict):
            trackedits.car_density(self.ac, 't', {'base': 'old', 'revision': 0, 'percent': 50})
        with self.assertRaises(trackedits.Invalid):
            self.keep({'percent': 0, 'targets': None, 'hidden': ['t_0_0#3']})

    def test_selection_only_thins_selected_cars_and_rejects_other_objects(self):
        now = trackedits.load(self.ac, 't')
        value = trackedits.car_density(self.ac, 't', {**now, 'percent': 0, 'targets': ['t_0_0#1']})['car_density']
        self.assertEqual(value['hidden'], ['t_0_0#1'])
        self.keep(value)
        trackcopy.save(self.ac, 't')
        faces = trackview.list_of(self.own())['t_0_0']['faces']
        self.assertTrue(faces[0] and faces[2] and faces[3])
        self.assertFalse(faces[1])
        now = trackedits.load(self.ac, 't')
        for targets in ([], ['t_0_0#3'], ['missing#0']):
            with self.assertRaises(trackedits.Invalid):
                trackedits.car_density(self.ac, 't', {**now, 'percent': 0, 'targets': targets})


if __name__ == '__main__':
    unittest.main()
