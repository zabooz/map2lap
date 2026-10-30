"""The project's folders, absolute (build_tiles and make_obj change into BeamNG.Earth's server folder)."""
import os

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (src/: server.py, generator.py, the packages)
ROOT = os.path.dirname(SRC)        # (the project folder: cache/, out/, assets/, vendor/, settings.json)
SERVER = os.path.join(ROOT, "vendor", "beamng_earth", "server")      # (BeamNG.Earth, vendored)
