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
VERSION = "0.5.2"
TRACK_VERSION = "0.5.0"
REPO_URL = "https://github.com/zabooz/map2lap"
CONTACT = "no.keyboard.press.any.key.to.continue@proton.me"
# (the User-Agent for OSRM and Nominatim: their usage policies ask for an app name and a way to reach its maker)
USER_AGENT = f"Map2Lap/{VERSION} (+{REPO_URL}; {CONTACT})"


def key(v):
    """Comparable: "0.10" > "0.9"; no or broken version: (0,)."""
    try:
        return tuple(int(x) for x in str(v).split("."))
    except ValueError:
        return (0,)


def outdated(v):
    """A track's version older than TRACK_VERSION (or none)."""
    return v is None or key(v) < key(TRACK_VERSION)


LATEST_URL = "https://api.github.com/repos/zabooz/map2lap/releases/latest"
_latest = {}


def latest(fresh=False):
    """The newest release on GitHub: {"version", "url", "zip"}, or None (offline, no release yet, the repo private:
    GitHub answers 404 without a login). zip: the Windows zip {"url", "size", "digest"} for updater, None when the
    release has none. Asked once per run, again with fresh (Settings → "Check for updates")."""
    if fresh or "got" not in _latest:
        import json
        import urllib.request
        try:
            req = urllib.request.Request(LATEST_URL, headers={"User-Agent": USER_AGENT,
                                                              "Accept": "application/vnd.github+json"})
            with urllib.request.urlopen(req, timeout=5) as r:
                rel = json.load(r)
            v = str(rel.get("tag_name") or "").lstrip("vV")
            z = next((a for a in rel.get("assets") or () if a.get("name") == f"Map2Lap-{v}-win64.zip"), None)
            z = z and {"url": z["browser_download_url"], "size": z["size"], "digest": z.get("digest")}
            _latest["got"] = ({"version": v, "url": rel.get("html_url") or REPO_URL, "zip": z}
                              if key(v) > (0,) else None)
        except Exception:
            _latest["got"] = None
    return _latest["got"]
