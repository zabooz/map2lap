"""The project's folders, absolute (build_tiles and make_obj change into engine/)."""
import os

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (src/: server.py, generator.py, the packages)
ROOT = os.path.dirname(SRC)        # (the project folder: cache/, out/, assets/, engine/, settings.json)
ENGINE = os.path.join(ROOT, "engine")       # (roads, grading, buildings: based on BeamNG.Earth's server)
FONTS = os.path.join(ROOT, "assets", "fonts")     # (free fonts for lettering where Windows' own are missing: Linux)
