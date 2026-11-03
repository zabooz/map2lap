"""OpenStreetMap's points of interest with their tags (amenity, religion, building, historic, leisure, sport, ...): what
Overture's places and buildings leave out, such as which building is a church, and a village's town hall, police
station and café (Overture's places come from Meta and Microsoft and are thin outside cities).

OSM US's Layercake publishes them as one GeoParquet file (https://data.openstreetmap.us/layercake/pois.parquet,
ODbL, ~4.7 GB, 509 spatially clustered row groups of ~120k rows, rebuilt about weekly), read like the highways' tags
(osmtags.OsmTags: the pinned version, the footer once, then only the columns asked for of the row groups whose bbox
statistics touch the area). Only bboxes are read, not the outlines (the geometry column is ~6 MB a row group, the
bbox and tag columns of a row group ~1.5 MB together). Unreachable: none, so nothing changes.
"""
import logging
import threading

import osmtags
import rangeread

log = logging.getLogger("earthd.mapdata")

URL = "https://data.openstreetmap.us/layercake/pois.parquet"
PATH = "osm/pois.parquet"
# what can be asked for: (the columns read, the rows wanted, the values returned after the bbox)
WHAT = {
    # a Christian place of worship (a church, chapel, cathedral as a building or its POI), or a building mapped as one
    "churches": (("amenity", "religion", "building", "bbox"),
                 "(amenity = 'place_of_worship' AND religion = 'christian') "
                 "OR building IN ('church', 'chapel', 'cathedral')", ()),
    # castles, forts, town gates and ruins (a site's outline or the building itself)
    "castles": (("historic", "building", "bbox"),
                "historic IN ('castle', 'fort', 'city_gate', 'ruins') OR building IN ('castle', 'ruins')",
                ("historic", "building")),
    # named businesses and public services (buildings.osm_place: their signs)
    "places": (("amenity", "shop", "office", "tourism", "craft", "healthcare", "name", "bbox"),
               "name IS NOT NULL AND (amenity IS NOT NULL OR shop IS NOT NULL OR office IS NOT NULL "
               "OR tourism IS NOT NULL OR craft IS NOT NULL OR healthcare IS NOT NULL)",
               ("amenity", "shop", "office", "tourism", "craft", "healthcare", "name[1]")),
}
CELLS_KEPT = 64                 # areas whose rows stay in memory


class Pois:
    """The points of interest of an area from the pinned Layercake version."""

    def __init__(self, raw_dir, fetcher, url=URL):
        self.tags = osmtags.OsmTags(raw_dir, fetcher, url=url, sub="pois")
        self._lock = threading.Lock()
        self._memo = {}

    def boxes(self, bounds, what, kind="demand"):
        """[(lon0, lat0, lon1, lat1, *values)] of the POIs of WHAT[what] whose bbox touches bounds (lon0, lat0, lon1,
        lat1): a point's is the point; values: WHAT's (text or None). Kept per bounds (a map cell's: every tile of it
        asks the same)."""
        key = (what,) + tuple(round(float(v), 7) for v in bounds)
        with self._lock:
            got = self._memo.get(key)
        if got is not None:
            return got
        for attempt in (0, 1):
            etag, remote = self.tags.version(kind)
            try:
                got = self._read(remote, bounds, what, kind)
                break
            except rangeread.Changed:
                if attempt:
                    raise
                log.info("pois: %s changed (was %s), taking the new version", self.tags.url, etag)
                self.tags._forget()
        with self._lock:
            if len(self._memo) >= CELLS_KEPT:
                self._memo.pop(next(iter(self._memo)))
            self._memo[key] = got
        return got

    def _read(self, remote, bounds, what, kind):
        lon0, lat0, lon1, lat1 = bounds
        columns, where, values = WHAT[what]
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
            rd._fetch(files, {PATH: [r for rg in cand for c in columns for r in groups[rg]["cols"].get(c, [])]}, kind)
            only = " OR ".join(f"file_row_number BETWEEN {groups[rg]['first']} AND "
                               f"{groups[rg]['first'] + groups[rg]['n'] - 1}" for rg in cand)
            rows = con.execute(f"""SELECT bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax{''.join(', ' + v for v in values)}
                FROM read_parquet({uri}, file_row_number = true)
                WHERE ({only}) AND ({where}) AND bbox.xmin <= {lon1!r} AND bbox.xmax >= {lon0!r}
                AND bbox.ymin <= {lat1!r} AND bbox.ymax >= {lat0!r}""").fetchall()
        except Exception:
            for e in errors:
                if isinstance(e, rangeread.Changed):
                    raise e
            raise
        finally:
            con.close()
        return [tuple(float(v) for v in r[:4]) + tuple(None if v is None else str(v) for v in r[4:]) for r in rows]
