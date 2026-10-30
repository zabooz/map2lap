"""The map data cache (cache/: elevation, map data, vegetation, finished tiles) with a size limit.

BeamNG.Earth's own cache management (cache.py: a size limit, least recently used first; earthd.prune_own_caches: the
folders with their own limits) only runs inside its server earthd, which we don't use: without this the folder grew
without bound (10 GB, 173,000 files, 1.3 GB of it an old vegetation version that is never read again). Here, after
every build (generator.build) and on request (generator page, Settings):

1. old vegetation versions go (vegetation.VERSION),
2. the folders with their own limits are cut back like earthd does (mirrors of the map and elevation data, road
   widths, finished tiles),
3. above the limit the oldest files go (not KEEP and WHOLE; modification time = download, nobody records the last
   read without earthd) until 90 % are left. Empty files stay (cache.py: "no result" markers, they save requests), as
   does everything from the last 10 minutes (the build that just ran).

A missing file is downloaded or built again by BeamNG.Earth on the next build (cache.py: "a missing one is a miss").
"""
import os
import shutil
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "cache")      # (absolute: build_tiles changes into the server folder)
KEEP = {"netstats", "gravity", "airports"}      # never: the daily request budgets, one-off downloads (like cache.py)
WHOLE = {"mapdata-mirror"}      # whole entries only (prune_mirror): removing a single file would break its entry
LOW_WATER = 0.9
FRESH_S = 600.0


def _walk(root):
    """[(mtime, bytes, path)] of all files under root."""
    out = []
    for dirpath, _dirs, names in os.walk(root):
        for n in names:
            p = os.path.join(dirpath, n)
            try:
                st = os.stat(p)
            except OSError:
                continue
            out.append((st.st_mtime, st.st_size, p))
    return out


def usage(root=ROOT):
    """(bytes, files) of the cache."""
    files = _walk(root)
    return sum(s for _, s, _ in files), len(files)


def trim(cap_gb, root=ROOT, log=print):
    """Tidy the cache (1-3 above; cap_gb 0: no limit, only 1 and 2); returns the bytes left."""
    import build_tiles  # noqa: F401  (BeamNG.Earth's path)
    import cache as cachemod
    import dem
    import mapdata
    import revisit
    import roadwidth
    import vegetation
    if not os.path.isdir(root):
        return 0
    before = usage(root)[0]
    veg = os.path.join(root, "vegetation")
    if os.path.isdir(veg):
        for d in os.listdir(veg):
            if d != f"v{vegetation.VERSION}":
                shutil.rmtree(os.path.join(veg, d), ignore_errors=True)
    mapdata.prune_mirror(root)
    for sub, mb, ext in ((os.path.join("dem", "decoded"), dem.MIRROR_MB, ".npy"),
                         ("roadwidth", roadwidth.STORE_MB, ".npy"), (revisit.SUBDIR, revisit.MAX_MB, ".zip")):
        cachemod.prune_dir(os.path.join(root, sub), mb * 1e6, match=lambda n, e=ext: n.endswith(e))
    files, kept = [], 0
    for sub in os.listdir(root):
        got = _walk(os.path.join(root, sub)) if os.path.isdir(os.path.join(root, sub)) else []
        if sub in KEEP or sub in WHOLE:
            kept += sum(s for _, s, _ in got)
        else:
            files += got
    total, cap, now = kept + sum(s for _, s, _ in files), cap_gb * 1e9, time.time()     # (the limit: the whole folder)
    if cap and total > cap:
        for mtime, size, p in sorted(files):
            if total <= cap * LOW_WATER:
                break
            if not size or now - mtime < FRESH_S:
                continue
            try:
                os.remove(p)
            except OSError:         # (open right now)
                continue
            total -= size
    after = total
    log(f"Map data cache: {after / 1e9:.1f} GB" + (f" (limit {cap_gb:g} GB)" if cap_gb else "") +
        (f", {(before - after) / 1e9:.1f} GB of old data removed" if before - after > 50e6 else ""))
    return after


def clear(root=ROOT):
    """Delete all map data (except KEEP); returns the bytes freed. Only while no build runs (server.py)."""
    if not os.path.isdir(root):
        return 0
    before = usage(root)[0]
    for sub in os.listdir(root):
        p = os.path.join(root, sub)
        if sub not in KEEP and os.path.isdir(p):
            shutil.rmtree(p, ignore_errors=True)
    return before - usage(root)[0]
