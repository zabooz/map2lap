"""The release smoke tool must extract the complete install block, including nested copy loops."""
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
import test_update  # noqa: E402


class InstallBlockTest(unittest.TestCase):
    def test_nested_windows_copy_loops_do_not_end_the_install_block(self):
        lines = ['if exist "update\\ready" (', '  for /d %%D in ("update\\Map2Lap\\*") do (',
                 '    robocopy "%%D" "%%~nxD" /MIR /R:5 /W:2', '    if errorlevel 8 goto update_failed',
                 '  )', '  copy /y "update\\Map2Lap\\Start Map2Lap.bat" "%~nx0"', ')']
        self.assertEqual(lines, test_update.block("@echo off\n" + "\n".join(lines) + "\n:run", 'if exist', ')'))


if __name__ == "__main__":
    unittest.main()
