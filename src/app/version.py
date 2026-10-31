"""Two version numbers:

VERSION        the app: every release gets a new one, even if only the page changed (zip name, the page, the
               User-Agent, ui_track.json for Content Manager).
TRACK_VERSION  the built tracks: bump it only when a change alters how built tracks look or drive (ground, trees,
               roads, kn5, distant view, gates). Every build stores it (data/map2lap.json "track_version"), and
               "My tracks" on the generator page marks tracks with an older one as old. Not for the page or the tools.

TRACK_VERSION is never higher than VERSION: a release that changes the tracks sets both to the same number. Tracks
built before the split (up to 0.3.3) only stored "version", which then was the track version. Tracks built before
versions existed have none and count as old. Small changes go in the third place (0.3.1), bigger ones in the second.
"""
VERSION = "0.3.3"
TRACK_VERSION = "0.3.3"
REPO_URL = "https://github.com/zabooz/map2lap"
CONTACT = "no.keyboard.press.any.key.to.continue@proton.me"
# (the User-Agent for OSRM and Nominatim: their usage policies ask for an app name and a way to reach its maker)
USER_AGENT = f"Map2Lap/{VERSION} (+{REPO_URL}; {CONTACT})"
# Track versions:
# 0.2    brighter shadow sides, darker birch leaves, terrain casts no shadows
# 0.3    point-to-point routes with start and finish lines (timing), run-off behind the finish
# 0.3.1  start and finish made visible (checkered band, gantry with banner, gates.py)
# 0.3.2  darker, greener larches
# 0.3.3  BeamNG.Earth 1.7.2 (paved junctions on bridges, roundabout islands, piped rivers stay underground)


def key(v):
    """Comparable: "0.10" > "0.9"; no or broken version: (0,)."""
    try:
        return tuple(int(x) for x in str(v).split("."))
    except ValueError:
        return (0,)


def outdated(v):
    """A track's version older than TRACK_VERSION (or none)."""
    return v is None or key(v) < key(TRACK_VERSION)
