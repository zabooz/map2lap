"""Discarding a draft reads its last Save, including positions and full height rasters."""
import sys
from pathlib import Path
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "src"))
from app import trackedits, trackview


class SavedDraftTest(unittest.TestCase):
    def test_saved_edits_are_complete_and_never_taken_from_the_current_draft(self):
        saved = {"base": "source", "deleted": [{"id": "trees#1", "position": [1, 2, 3]}],
                 "heights": [{"id": "height", "x": 0, "z": 0, "nx": 1, "nz": 1, "mm": [100]}],
                 "paints": ["paint"], "models": [{"id": "tree"}]}
        with mock.patch.object(trackedits, "_file", return_value="unused"), \
             mock.patch.object(trackview, "deletable", return_value=("source", {})), \
             mock.patch.object(trackview, "recipe", return_value=saved), \
             mock.patch.object(trackedits, "_stored", side_effect=AssertionError("read current draft instead of last Save")):
            result = trackedits.saved_edits("unused", "copy")
        for key in ("deleted", "heights", "paints", "models"):
            self.assertEqual(saved[key], result[key])
        self.assertEqual("source", result["base"])


if __name__ == "__main__":
    unittest.main()
