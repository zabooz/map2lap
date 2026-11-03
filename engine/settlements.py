"""OpenStreetMap's places (cities, towns, villages, hamlets) with their names, for the town signs (townsigns.py).

OSM US's Layercake publishes them as one GeoParquet file (https://data.openstreetmap.us/layercake/settlements.parquet,
ODbL, ~200 MB, 4.6 M points in 38 spatially clustered row groups, rebuilt about weekly), read like the highways'
tags (osmtags.OsmTags: the pinned version, the footer once, then only the columns of the row groups whose bbox
statistics touch the area; a few MB the first time a region is built, from the cache after). Unreachable: no places,
so no town signs.
"""
import logging
import threading

import osmtags
import rangeread

log = logging.getLogger("earthd.mapdata")

URL = "https://data.openstreetmap.us/layercake/settlements.parquet"
PATH = "osm/settlements.parquet"
# the kinds of place that have a town sign of their own (OSM place=*): a suburb or quarter is part of a town, an
# isolated dwelling or a farm a single house
KINDS = ("city", "town", "village", "hamlet")
COLUMNS = ("place", "name", "bbox")
CELLS_KEPT = 64                 # areas whose places stay in memory


class Settlements:
    """The places of an area from the pinned Layercake version."""

    def __init__(self, raw_dir, fetcher, url=URL):
        self.tags = osmtags.OsmTags(raw_dir, fetcher, url=url, sub="settlements")
        self._lock = threading.Lock()
        self._memo = {}

    def area(self, bounds, kind="demand"):
        """[(lon, lat, place, name)] of the named places of KINDS in bounds (lon0, lat0, lon1, lat1). Kept per
        bounds (a map cell's: every sign tile of it asks the same)."""
        key = tuple(round(float(v), 7) for v in bounds)
        with self._lock:
            got = self._memo.get(key)
        if got is not None:
            return got
        for attempt in (0, 1):
            etag, remote = self.tags.version(kind)
            try:
                got = self._read(remote, bounds, kind)
                break
            except rangeread.Changed:
                if attempt:
                    raise
                log.info("settlements: %s changed (was %s), taking the new version", self.tags.url, etag)
                self.tags._forget()
        with self._lock:
            if len(self._memo) >= CELLS_KEPT:
                self._memo.pop(next(iter(self._memo)))
            self._memo[key] = got
        return got

    def _read(self, remote, bounds, kind):
        lon0, lat0, lon1, lat1 = bounds
        t = self.tags
        rd = t._reader
        files = {PATH: remote}
        con, proto, errors = rd._connect(files, kind)
        try:
            uri = f"'{proto}://{PATH}'"
            groups = t._groups(con, uri, remote, kind)
            cand = t._candidates(groups, bounds)
            if not cand:
                return []
            rd._fetch(files, {PATH: [r for rg in cand for c in COLUMNS for r in groups[rg]["cols"].get(c, [])]}, kind)
            only = " OR ".join(f"file_row_number BETWEEN {groups[rg]['first']} AND "
                               f"{groups[rg]['first'] + groups[rg]['n'] - 1}" for rg in cand)
            kinds = ", ".join(repr(k) for k in KINDS)
            rows = con.execute(f"""SELECT (bbox.xmin + bbox.xmax) / 2, (bbox.ymin + bbox.ymax) / 2, place, name
                FROM read_parquet({uri}, file_row_number = true)
                WHERE ({only}) AND place IN ({kinds}) AND name IS NOT NULL AND bbox.xmin <= {lon1!r}
                AND bbox.xmax >= {lon0!r} AND bbox.ymin <= {lat1!r} AND bbox.ymax >= {lat0!r}""").fetchall()
        except Exception:
            for e in errors:
                if isinstance(e, rangeread.Changed):
                    raise e
            raise
        finally:
            con.close()
        return [(float(x), float(y), str(p), str(n)) for x, y, p, n in rows]
