"""The Map2Lap version. Every built track carries it (data/map2lap.json, ui_track.json "version" for Content
Manager); "My tracks" on the generator page uses it to show which tracks were built with an older release.

Bump it whenever a change alters how built tracks look or drive (not for the page or the tools). Tracks built before
versions existed have none and count as old. Small changes go in the third place (0.3.1), bigger ones in the second.
"""
VERSION = "0.3.2"
REPO_URL = "https://github.com/zabooz/map2lap"
CONTACT = "no.keyboard.press.any.key.to.continue@proton.me"
# (the User-Agent for OSRM and Nominatim: their usage policies ask for an app name and a way to reach its maker)
USER_AGENT = f"Map2Lap/{VERSION} (+{REPO_URL}; {CONTACT})"
# 0.2    brighter shadow sides, darker birch leaves, terrain casts no shadows
# 0.3    point-to-point routes with start and finish lines (timing), run-off behind the finish
# 0.3.1  start and finish made visible (checkered band, gantry with banner, gates.py)
# 0.3.2  darker, greener larches


def key(v):
    """Comparable: "0.10" > "0.9"; no or broken version: (0,)."""
    try:
        return tuple(int(x) for x in str(v).split("."))
    except ValueError:
        return (0,)


def outdated(v):
    return v is None or key(v) < key(VERSION)
