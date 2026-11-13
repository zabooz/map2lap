"""Persistent tree thinning is reversible independently of manual deletion and editor Undo."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from test_tracktrees import TreesBase
from app import treespacing, trackedits, trackcopy
from track import objectlist


class SpacingTest(unittest.TestCase):
    def test_stable_nested_subsets_and_pairwise_distance(self):
        points = {f'trees#{i}': [i % 19, i % 3, i // 19] for i in range(400)}
        previous = set()
        for distance in (0, .5, 1.1, 2, 4, 8):
            hidden = set(treespacing.thin(points, distance))
            self.assertLessEqual(previous, hidden)
            self.assertEqual(hidden, set(treespacing.thin(dict(reversed(list(points.items()))), distance)))
            kept = [p for key, p in points.items() if key not in hidden]
            for i, a in enumerate(kept):
                for b in kept[i + 1:]:
                    self.assertGreaterEqual((a[0]-b[0])**2 + (a[2]-b[2])**2, distance**2)
            previous = hidden

    def test_same_position_and_vertical_distance_do_not_bypass_spacing(self):
        points = {'trees#0': [0, 0, 0], 'trees#1': [0, 100, 0], 'trees#2': [20, 0, 0]}
        self.assertEqual(len(treespacing.thin(points, 1)), 1)
        self.assertEqual(treespacing.thin(points, 0), [])


class PersistentSpacingTest(TreesBase):
    def prepare(self, distance, targets=None, name='t'):
        draft = trackedits.load(self.ac, name)
        return trackedits.tree_spacing(self.ac, name, {'base': draft['base'], 'revision': draft['revision'],
                                                     'distance': distance, 'targets': targets})['tree_spacing']

    def test_save_close_reopen_and_reduce_restores_only_thinned_trees(self):
        spacing = self.prepare(4)
        self.assertEqual(len(spacing['hidden']), 1)
        hidden = spacing['hidden'][0]
        self.draft(tree_spacing=spacing, deleted=['trees#1'])
        trackcopy.save(self.ac, 't')
        trackedits.clear('t')
        reopened = trackedits.load(self.ac, 't')
        self.assertEqual(reopened['tree_spacing'], spacing)
        self.assertNotIn(str(int(hidden.split('#')[1])), self.saved_section()['trees'])
        self.draft(tree_spacing=self.prepare(0))
        trackcopy.save(self.ac, 't')
        self.assertEqual(set(self.saved_section()['trees']), {'0', '2'})
        self.assertEqual(trackedits.load(self.ac, 't')['deleted'][0]['id'], 'trees#1')

    def test_save_as_copy_retains_adjustable_scope_without_changing_original(self):
        spacing = self.prepare(4, ['trees#0', 'trees#2'])
        self.draft(tree_spacing=spacing)
        self.copy()
        trackedits.clear('t_mod')
        draft = trackedits.load(self.ac, 't_mod')
        self.assertEqual(draft['tree_spacing'], spacing)
        reset = self.prepare(0, spacing['targets'], 't_mod')
        trackedits.save(self.ac, 't_mod', {**draft, 'tree_spacing': reset, 'id': 'reset'})
        trackcopy.save(self.ac, 't_mod')
        self.assertEqual(set(self.saved_section('t_mod')['trees']), {'0', '1', '2'})
        self.assertEqual(set(self.saved_section()['trees']), {'0', '1', '2'})

    def test_manual_deletion_made_after_thinning_stays_deleted_when_reduced(self):
        spacing = self.prepare(4)
        kept = next(id_ for id_ in ('trees#0', 'trees#2') if id_ not in spacing['hidden'])
        self.draft(tree_spacing=spacing)
        self.draft(deleted=[kept])
        self.draft(tree_spacing=self.prepare(0))
        trackcopy.save(self.ac, 't')
        self.assertNotIn(kept.split('#')[1], self.saved_section()['trees'])
        self.assertIn(spacing['hidden'][0].split('#')[1], self.saved_section()['trees'])

    def test_bushes_are_not_thinned_and_selection_is_checked(self):
        section = self.section.copy()
        section['trees'] = {**section['trees'], '3': {**section['trees']['0'], 'model': 'bush'}}
        section['next'] = 4
        objectlist.write(self.kn5, self.objects, section)
        self.assertNotIn('trees#3', self.prepare(100)['hidden'])
        for targets in (['trees#3'], ['t_0_0#0'], ['missing#0']):
            with self.assertRaises(trackedits.Invalid):
                self.prepare(4, targets)

    def test_moved_positions_and_added_trees_are_used(self):
        self.draft(placed=[{'id':'trees#2','x':100,'y':0,'z':0,'turn':0,'scale':1}])
        self.assertEqual(self.prepare(4)['hidden'], [])
        added = {**self.section['trees']['0'], 'id':'trees#3'}
        self.draft(trees=[added])
        self.assertEqual(len(self.prepare(4)['hidden']), 1)

    def test_invalid_spacing_and_old_default(self):
        self.assertIsNone(trackedits.load(self.ac, 't')['tree_spacing'])
        for distance in (-1, 101, True, float('nan'), '4'):
            with self.assertRaises(trackedits.Invalid):
                self.prepare(distance)


if __name__ == '__main__':
    unittest.main()
