"""The download cache's size cap: last use per file, LRU eviction, "clear cache" (
"Caching" 1, the cheap parts of 3 and 5).

Layout of the cache root (~/.cache/beamng-earth by default):
  VERSION             the layout version (LAYOUT_VERSION). Missing: this layout, written now. Any other
                      value (a newer server's layout): the cache is left alone - counted, never evicted,
                      cleared or indexed.
  index.tsv           the last use of every tracked file ("<unix s>\t<bytes>\t<path>"), saved by the
                      background thread every SAVE_S when something changed, and on close()
  dem/ imagery/ colormatch/ deshadow/     MANAGED: tracked, evicted, cleared
  mapdata/            MANAGED too (mapdata.py: layer files and the sources' range blocks; a missing
                      one is a miss, built or fetched again). Not used by earthd yet, so nothing
                      there is protected as this session's: the walk's mtime is its last use
  gravity/            counted, never evicted or cleared (the 145 MB EGM2008 model, downloaded once)
  airports/           the same (airports.py: OurAirports' CSV files, ~17 MB, the last good copy kept for
                      offline use; airports.py replaces it weekly and deletes the old generation itself)
  seacarve/ (its raw rasters) peercache/ roadwidth/   their own limits (seacarve.RAW_MB, peerwork.CACHE_BYTES,
                      roadwidth.STORE_MB), cut back at server start (prune_dir; their readers touch_once what they use)
  mapdata-mirror/ dem's mirror            their own limits, pruned by their writers (a process's first write too)
  netstats/ (and anything else)           not tracked: the daily request budgets must survive a clear

Last use = the server's own record of every disk hit and write (dem.py, imagery.py, the de-shadow and
colour-seam caches call used() / wrote() / read()), not the file system's atime (relatime) and no stat
per request: one dict update under a lock. At start a background thread walks the tree once
(st_size, and st_mtime = the download time for files the index does not know, e.g. a cache from before
this module) and merges it with the index; until then ready is False and nothing is evicted.

Eviction (a background thread): when the tracked bytes exceed the cap, least recently used files go
until LOW_WATER (90 %) of the cap is left, at most every EVICT_S. Never evicted: gravity/, files this
server process used within PROTECT_S (an hour: the area around the player), and empty files (404 and
"no seams" markers: they save requests; clear() removes them). Directories stay (a writer may be about
to put a file there). clear() removes every MANAGED file but the ones this server process used at all
(the current session's, however long ago). Neither touches a file in a saved area (pinned(keys): areas.py,
the map's downloads ahead).

on_change(key, added): a key new to the index or gone from it (the map's cache view, covermap.py); never called
for a repeat hit.

Per-source lifetimes (ROADMAP "Caching" 3): LIFETIMES maps a path prefix to the longest a file may be
kept after its download (s); the start-up walk deletes older ones. Empty today: none of the current
sources (USGS public domain, EOX CC BY / CC BY-NC-SA, Mapterhorn, AWS Terrain Tiles) limits caching
time; the 404 markers' own expiry is netfetch's miss_ttl. Per-producer versions live in the paths
(colormatch/v1/, imagery/usgs-ds1-<mode>/): a generator update writes a new directory and the old one
is never read again, so it ages out through the LRU instead of being deleted at once (ROADMAP 5).

Memory: about 200 bytes per tracked file (a 20 GB cache of 30 KB imagery tiles: ~130 MB).
"""
import logging
import os
import threading
import time

log = logging.getLogger("earthd.cache")

KEPT = ("gravity", "airports")                              # counted only
GB = 1e9                    # the page's GB (decimal, as disk sizes are sold)
LOW_WATER = 0.9             # evict down to this share of the cap
READ_WAITS = (0.02, 0.05, 0.1, 0.25)   # s between the tries of a read held up on Windows (NoCache.read)


class NoCache:
    """The default of every producer's `disk` attribute: reads and writes without bookkeeping (Server()
    without a Cache, the tools, the tests)."""

    def read(self, path):
        """The file's bytes, or None if it is not there (also when it was evicted a moment ago). On Windows a file
        another process is replacing or deleting cannot be opened for a moment (PermissionError: a far tile of a
        first visit to Chicago failed on a Windows test PC): tried again READ_WAITS, then a miss (the
        caller fetches it again and staging.replace_cached keeps whichever copy goes in)."""
        for wait in READ_WAITS + (None,):
            try:
                with open(path, "rb") as f:
                    return f.read()
            except FileNotFoundError:
                return None
            except PermissionError:
                if wait is None:
                    log.debug("cache: %s held by another process: a miss", path)
                    return None
                time.sleep(wait)

    def used(self, path, size=None):
        pass

    def wrote(self, path, size=None):
        pass

    def forget(self, path):
        pass


NONE = NoCache()


def _inside(path, root):
    """Is path's real location (links resolved) inside root's?"""
    try:
        r = os.path.realpath(root)
        return os.path.commonpath([os.path.realpath(path), r]) == r
    except ValueError:              # (another drive on Windows)
        return False


def prune_dir(root, max_bytes, keep_s=600.0, match=None, now=None):
    """The caches that keep their own files outside MANAGED (sea carving's raw rasters, compute sharing's replies,
    the road widths' walls): the oldest files (mtime; their readers touch the ones they use) under root removed until
    at most max_bytes are left; files changed within keep_s stay; match(file name) selects files (None: all). A file
    that cannot be removed (mapped by a running process on Windows) is skipped. -> (files removed, bytes left)"""
    now = time.time() if now is None else now
    files, total = [], 0
    for dirpath, _dirs, names in os.walk(root):
        for n in names:
            if match is not None and not match(n):
                continue
            p = os.path.join(dirpath, n)
            try:
                st = os.stat(p)
            except OSError:
                continue
            files.append((st.st_mtime, st.st_size, p))
            total += st.st_size
    removed = 0
    if total > max_bytes:
        for mtime, size, p in sorted(files):
            if total <= max_bytes * LOW_WATER or now - mtime < keep_s:
                break
            try:
                os.remove(p)
            except OSError:
                continue
            total -= size
            removed += 1
    return removed, total


_touched = set()
_touched_lock = threading.Lock()


def touch_once(path):
    """Mark a self-managed cache file used (its mtime now, prune_dir's order), once per process."""
    with _touched_lock:
        if path in _touched:
            return
        _touched.add(path)
    try:
        os.utime(path, None)
    except OSError:
        pass


