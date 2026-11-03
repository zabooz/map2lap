"""The ground photo, brick walks, footprints per map cell, a town's districts.

The ground photo part (photo_mask, fill_photo: footprints filled from the ground around) is kept for later: an AC
build paints comic ground and doesn't run it; photo-textured ground would.
"""
import math

import numpy as np

import mapgeom


def photo_mask(frame, x0, y0, size, px, md):
    """A (px, px) bool mask (row 0 = north) of the ground photo's square [x0, x0 + size) x [y0, y0 + size)
    (anchor frame) where buildings stand, grown by their edges and lean: there the photo shows roofs and
    walls that the 3D buildings now stand on or next to. None without buildings."""
    from PIL import Image, ImageDraw
    import mapcells
    la, lo, _ = frame.enu_to_geodetic(np.array([x0, x0 + size, x0, x0 + size]),
                                      np.array([y0, y0, y0 + size, y0 + size]), 0.0)
    keys = mapcells.cells_for_bbox(float(la.min()), float(lo.min()), float(la.max()), float(lo.max()))
    img = Image.new("L", (px, px), 0)
    draw = ImageDraw.Draw(img)
    mpp = size / px
    seen = set()
    n = 0
    for k in keys:
        f = md.cell(k, layers=("buildings",), kind="demand").layers.get("buildings")
        if f is None:
            continue
        hs = f.attrs.get("height")
        ids = f.ids.tolist()
        rows, a, b = _photo_candidates(f, frame, x0, y0, size)
        keep = [j for j, i in enumerate(rows) if ids[i] not in seen]  # (a building in two cells: the first piece)
        if not keep:
            seen.update(ids)
            continue
        rows, a, b = rows[keep], a[keep], b[keep]
        # every kept outer ring grown out from its middle, all at once
        h = np.full(len(rows), 8.0) if hs is None else np.asarray(hs, np.float64)[rows]
        h = np.where(np.isfinite(h), h, 8.0)
        grow = (PHOTO_GROW_M + np.minimum(PHOTO_LEAN * h, PHOTO_LEAN_MAX_M)) / mpp
        ln = b - a
        idx = np.repeat(a - np.r_[0, np.cumsum(ln)[:-1]], ln) + np.arange(int(ln.sum()))
        xy = f.xy_in(frame)[idx]
        cx, cy = (xy[:, 0] - x0) / mpp, (y0 + size - xy[:, 1]) / mpp
        starts = np.r_[0, np.cumsum(ln)[:-1]]
        mx = np.repeat(np.add.reduceat(cx, starts) / ln, ln)
        my = np.repeat(np.add.reduceat(cy, starts) / ln, ln)
        dx, dy = cx - mx, cy - my
        g = np.repeat(grow, ln) / np.maximum(np.hypot(dx, dy), 1e-6)
        pts = np.stack([cx + dx * g, cy + dy * g], 1).tolist()
        for s0, m in zip(starts.tolist(), ln.tolist()):
            draw.polygon([tuple(q) for q in pts[s0:s0 + m]], fill=255)
        n += len(rows)
        seen.update(ids)
    if n == 0:
        return None
    return np.asarray(img) > 0


def _photo_candidates(f, frame, x0, y0, size):
    """Rows of f (a cell's buildings) whose outer ring's box meets the square [x0, x0 + size]² and that come first
    among the rows of their id, ascending, with their outer rings' coordinate ranges [a, b): photo_mask's buildings, its test made for all rows at once (one ring at a
    time it was ~19k Python steps a block, most of a block photo's roof mask)."""
    m = len(f.kind)
    none = (np.zeros(0, np.int64),) * 3
    if m == 0:
        return none
    p = f.part_off[:-1]
    has = (f.part_off[1:] > p)
    r = f.ring_off[np.minimum(p, len(f.ring_off) - 2)]
    has &= f.ring_off[np.minimum(p, len(f.ring_off) - 2) + 1] > r
    a = f.coord_off[np.minimum(r, len(f.coord_off) - 2)]
    b = f.coord_off[np.minimum(r, len(f.coord_off) - 2) + 1]
    has &= b > a
    _, first = np.unique(f.ids, return_index=True)
    head = np.zeros(m, bool)
    head[first] = True
    rows = np.flatnonzero(has & head)
    if len(rows) == 0:
        return none
    xy = f.xy_in(frame)
    a, b = a[rows], b[rows]
    order = np.argsort(a, kind="stable")       # (reduceat: ascending starts)
    e_lo = np.empty(len(rows)); e_hi = np.empty(len(rows)); n_lo = np.empty(len(rows)); n_hi = np.empty(len(rows))
    e_lo[order] = mapgeom._reduce(np.minimum, xy[:, 0], a[order], b[order])
    e_hi[order] = mapgeom._reduce(np.maximum, xy[:, 0], a[order], b[order])
    n_lo[order] = mapgeom._reduce(np.minimum, xy[:, 1], a[order], b[order])
    n_hi[order] = mapgeom._reduce(np.maximum, xy[:, 1], a[order], b[order])
    inside = ~((e_hi < x0) | (e_lo > x0 + size) | (n_hi < y0) | (n_lo > y0 + size))
    return rows[inside], a[inside], b[inside]


def fill_photo(rgb, mask, size, px):
    """rgb (px, px, 3) uint8 with the masked pixels replaced by a smooth fill from the unmasked ground
    around them: a push-pull pyramid, so a footprint of any size fills (one PHOTO_FILL_M blur left black
    holes in big blocks), softened by that blur (earthfast.fill_photo: the numpy / Pillow version's numbers,
    a third of its time)."""
    import fast
    fast.require(68, "the ground photo's roof fill")
    r = max(2.0, PHOTO_FILL_M / (size / px))
    return fast._ef.fill_photo(np.ascontiguousarray(rgb, np.uint8), np.ascontiguousarray(mask, bool), float(r))


BRICK_WALK_COVERAGE = 0.35  # dense old cores (row houses) of brick regions ...
BRICK_WALK_SHARE = 0.55     # ... pave this share of their streets' sidewalks with brick (hashed per street)


def brick_walks(walks, items, lat, lon, tile=256.0):
    """Marks the sidewalk runs (roads.build_tile's walks) of a dense brick-region tile that are brick pavers
    (Fells Point's historic streets): every run of a street the same."""
    if not walks or brick_share(lat, lon) < 0.7 or coverage(items, tile) < BRICK_WALK_COVERAGE:
        return
    for wk in walks:
        fid = wk.get("fid")
        if fid is not None and _hash01(str(fid), "brickwalk") < BRICK_WALK_SHARE:
            wk["brick"] = True


_cell_stats = {}                # map cell key -> (lon, lat, area m2) per footprint (district_coverage)
_cell_lock = None


def _cell_lock_get():
    global _cell_lock
    if _cell_lock is None:
        import threading
        _cell_lock = threading.Lock()
    return _cell_lock


def cell_footprints(key, layer):
    """(lon, lat, area m2) arrays of a cell's building footprints (outer rings), cached per cell (layer may
    be None once cached). Pure."""
    _cell_lock_get()
    with _cell_lock:
        got = _cell_stats.get(key)
    if got is not None:
        return got
    if layer is None or len(layer.ids) == 0:
        got = (np.zeros(0), np.zeros(0), np.zeros(0))
    else:
        f = layer
        first = f.ring_off[f.part_off[:-1]]
        a = f.coord_off[first]
        b = f.coord_off[first + 1]
        ll = f.lonlat
        lat0 = float(np.mean(ll[:, 1]))
        x = ll[:, 0] * 111320.0 * math.cos(math.radians(lat0))
        y = ll[:, 1] * 111320.0
        cross = np.r_[x[:-1] * y[1:] - x[1:] * y[:-1], 0.0]
        C = np.concatenate(([0.0], np.cumsum(cross)))
        CX, CY = np.concatenate(([0.0], np.cumsum(ll[:, 0]))), np.concatenate(([0.0], np.cumsum(ll[:, 1])))
        n = np.maximum(b - a, 1)
        last = np.maximum(b - 1, a)
        area = np.abs(C[last] - C[a] + x[last] * y[a] - x[a] * y[last]) / 2
        got = ((CX[b] - CX[a]) / n, (CY[b] - CY[a]) / n, area)
    with _cell_lock:
        if len(_cell_stats) > 64:
            _cell_stats.clear()
        _cell_stats[key] = got
    return got


def district_coverage(lat, lon, cells):
    """The share of the DISTRICT_M disc around (lat, lon) covered by building footprints; cells: [(key,
    buildings layer)] covering the disc."""
    seen = 0.0
    mx = 111320.0 * math.cos(math.radians(lat))
    for key, layer in cells:
        lo, la, ar = cell_footprints(key, layer)
        if len(ar):
            d2 = ((lo - lon) * mx) ** 2 + ((la - lat) * 111320.0) ** 2
            seen += float(ar[d2 <= DISTRICT_M * DISTRICT_M].sum())
    return seen / (math.pi * DISTRICT_M * DISTRICT_M)


def district_town(frame, tx, ty, md):
    """Is road tile (tx, ty) in a small town of the arid West (WEST_TOWN_COVERAGE)? The cells of the district
    are loaded like the tile's own (the far building tiles need them anyway); an unreadable one counts as
    empty."""
    import mapcells
    import roads
    import surface
    x0, y0, x1, y1 = roads.tile_bbox(tx, ty)
    lat, lon, _ = frame.enu_to_geodetic((x0 + x1) / 2, (y0 + y1) / 2, 0.0)
    lat, lon = float(lat), float(lon)
    if not bool(surface.dry_west(lat, lon)):
        return False
    dlat = DISTRICT_M / 111320.0
    dlon = DISTRICT_M / (111320.0 * math.cos(math.radians(lat)))
    cells = []
    for key in mapcells.cells_for_bbox(lat - dlat, lon - dlon, lat + dlat, lon + dlon):
        with _cell_lock_get():
            known = key in _cell_stats
        if known:
            cells.append((key, None))
            continue
        try:
            cells.append((key, md.cell(key, layers=("buildings",), kind="demand").layers.get("buildings")))
        except Exception:           # not cached / unreadable: counts as empty
            continue
    return district_coverage(lat, lon, cells) < WEST_TOWN_COVERAGE


# (read inside functions only; here so that the parts can load each other)
from .styles import _hash01, brick_share  # noqa: E402
from .doors import DISTRICT_M, WEST_TOWN_COVERAGE  # noqa: E402
from .far import PHOTO_FILL_M, PHOTO_GROW_M, PHOTO_LEAN, PHOTO_LEAN_MAX_M, coverage  # noqa: E402
