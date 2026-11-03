"""The committed engine/earthfast.pyd has every import covered by an import descriptor: an uncovered one is never filled
by Windows and crashes when called (it took std::thread and std::env down: tools/pe_imports.py, docs/rust.md)."""
import os
import sys
import unittest

ENGINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(ENGINE, "..", "tools"))
from pe_imports import orphan_imports  # noqa: E402


class NativeImportsTest(unittest.TestCase):
    def test_every_import_of_the_windows_module_is_filled(self):
        self.assertEqual(orphan_imports(os.path.join(ENGINE, "earthfast.pyd")), [])


if __name__ == "__main__":
    unittest.main()
