"""Regional dryness for SD ground, from green (0) to dry (1) on a grid in the anchor frame.
The corridor and distant view shift meadow, scrub and forest-floor colours by the same field.
Editor paint layers keep their materials, as do mapped OSM lawns, parks, pitches and gardens.
"""
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
import time

import numpy as np
from PIL import Image, ImageFilter

import climate
import geodesy
import imagery
import mapcells
import maprasters
import netfetch

# A 5 km square pools vegetation across several fields. It averages out small irrigated valleys.
CELL = 5000.0
# Z12 gives ~38 m pixels at the equator, finer polewards. Narrow strips can mix several covers.
ZOOM = 12
# Exclude watered lawns at settlement edges. Irrigated ground farther away can still look green.
URBAN_M = 200.0
# A handful of surviving pixels can all belong to one clearing. Dense cities often fall below 50.
MIN_PIXELS = 50
# Grass/shrub gr was below -0.05 in dry places and above +0.15 in green places at nine sites
# in both EOX composites. The wider ramp (+0.30 to -0.20) keeps intermediate colours;
# an irrigated or unseasonably green composite can underestimate regional dryness.
GREEN_GR, GR_SPAN = 0.30, 0.50
SOURCE = imagery.SOURCES["eox2016"]
# Painted dry endpoints viewed in AC at Otto Bridge, Perth and Heiligenblut. One palette
# cannot represent every local grass species or the colour of the soil beneath it.
DRY = {"gc_meadow": (204, 178, 104), "gc_shrub": (156, 136, 86), "gc_forest": (118, 116, 66)}


def _linear(rgb):
    """Convert sRGB values in 0..255 to linear light. Pure."""
    c = np.asarray(rgb, np.float32) / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


LINEAR = _linear(np.arange(256))


@dataclass
class GroundField:
    origin: np.ndarray  # ENU centre of the south-west cell
    values: np.ndarray
    shifts: dict

    def sample(self, x, y):
        """Bilinear dryness at broadcastable ENU coordinates, clamped at the outer cells. Pure."""
        ny, nx = self.values.shape
        fx = np.clip((np.asarray(x) - self.origin[0]) / CELL, 0, nx - 1)
        fy = np.clip((np.asarray(y) - self.origin[1]) / CELL, 0, ny - 1)
        i, j = fx.astype(int), fy.astype(int)
        u, v = (fx - i).astype(np.float32), (fy - j).astype(np.float32)
        ii, jj = np.minimum(i + 1, nx - 1), np.minimum(j + 1, ny - 1)
        return ((1 - v) * ((1 - u) * self.values[j, i] + u * self.values[j, ii]) +
                v * ((1 - u) * self.values[jj, i] + u * self.values[jj, ii]))

    def tint(self, rgb, name, t):
        """Shift a named material's RGB by the regional fraction of its linear-light colour offset. Pure."""
        if name not in self.shifts:
            return rgb
        t = np.asarray(t)[..., None]
        c = np.clip(_linear(rgb) + t * self.shifts[name], 0, 1)
        out = 255 * np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)
        return np.where(t == 0, rgb, out)


def load(tiles_dir):
    """Read an SD field, or return None for an older or HD build."""
    path = Path(tiles_dir) / "dryness.npz"
    if path.exists():
        with np.load(path) as data:
            return GroundField(data["origin"], data["values"], {name: data[name] for name in DRY})


def _natural(wc, lat):
    """WorldCover pixels inside pure shrub or grass, clear of nearby built-up ground. Pure."""
    im = Image.fromarray(wc.data)
    pure = ((wc.data == 20) | (wc.data == 30)) & (
        np.asarray(im.filter(ImageFilter.MinFilter(3))) == np.asarray(im.filter(ImageFilter.MaxFilter(3))))
    urban = wc.data == 50
    if not urban.any():
        return pure
    # WorldCover is geographic. An east-west pixel gets narrower towards the poles.
    dy = wc.dy * 111320
    dx = wc.dx * 111320 * np.cos(np.radians(lat))
    sums = np.pad(urban.cumsum(axis=1, dtype=np.int32), ((0, 0), (1, 0)))
    cols = np.arange(urban.shape[1])
    for row in range(int(URBAN_M / dy) + 1):
        reach = int(np.sqrt(URBAN_M ** 2 - (row * dy) ** 2) / dx)
        near = sums[:, np.minimum(cols + reach + 1, len(cols))] != sums[:, np.maximum(cols - reach, 0)]
        if row:
            pure[row:] &= ~near[:-row]
            pure[:-row] &= ~near[row:]
        else:
            pure &= ~near
    return pure


def _tile_keys(frame, west, south, nx, ny):
    """Zoom-12 XYZ tiles intersecting the geographic bounds of the cell grid. Pure."""
    x, y = np.meshgrid(west + CELL * np.arange(nx + 1), south + CELL * np.arange(ny + 1))
    lat, lon, _ = frame.enu_to_geodetic(x, y)
    if lat.min() > imagery.MAX_LAT or lat.max() < -imagery.MAX_LAT:
        return []
    lon += 360 * np.rint((frame.lon0 - lon) / 360)
    tx, ty = mapcells.tile_xy(lat, lon, ZOOM)
    ty = np.clip(ty, 0, (1 << ZOOM) - 1)
    return [(i, j) for j in range(int(ty.min()), int(ty.max()) + 1)
            for i in range(int(np.floor(tx.min())), int(np.floor(tx.max())) + 1)]


def _cell_ids(frame, west, south, shape, lat, lon):
    """Flat ENU cell indices for geographic points, or -1 outside the grid. Pure."""
    x, y, _ = frame.geodetic_to_enu(lat, lon)
    ix, iy = ((x - west) // CELL).astype(int), ((y - south) // CELL).astype(int)
    ny, nx = shape
    return np.where((ix >= 0) & (ix < nx) & (iy >= 0) & (iy < ny), iy * nx + ix, -1)


# Combine overlapping tile observations by maximum: any land pixel is enough;
# a missing WorldCover window leaves a partially observed water cell uncertain.
WATER, UNKNOWN, LAND = 1, 2, 3


def _measure(key, frame, west, south, shape, rasters, photos):
    """Return WorldCover evidence, eligible EOX counts and linear red/green sums per ENU cell."""
    i, j = key
    n = 1 << ZOOM
    px = (np.arange(imagery.TILE) + 0.5) / imagery.TILE
    lon = (i + px) * 360 / n - 180
    lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * (j + px) / n))))
    cells = _cell_ids(frame, west, south, shape, lat[:, None], lon)
    cover = np.zeros(np.prod(shape) + 1, np.uint8)  # last slot collects points outside the field
    # Keep the 200 m settlement margin plus two ~40 m overview pixels for 3x3 purity.
    halo = (URBAN_M + 80) / 111320
    dx = halo / np.cos(np.radians(np.max(np.abs(lat))))
    try:
        wc = rasters.worldcover_box((lon[0] - dx, lat[-1] - halo, lon[-1] + dx, lat[0] + halo), 2)
    except (OSError, ValueError) as error:
        cover[cells] = UNKNOWN
        return cover[:-1], None, type(error).__name__
    cover[cells] = WATER
    # Count even narrow islands and forest-only cells on the WorldCover overview's own grid.
    rows, cols = np.nonzero((wc.data != 0) & (wc.data != 80))
    if rows.size:
        land = _cell_ids(frame, west, south, shape, wc.y0 - (rows + 0.5) * wc.dy, wc.x0 + (cols + 0.5) * wc.dx)
        cover[land] = LAND
    try:
        sums = _vegetation_sums(wc, cells, lat, lon, photos, i % n, j, cover.size - 1)
    except (OSError, ValueError) as error:
        return cover[:-1], None, type(error).__name__
    return cover[:-1], sums, None


def _vegetation_sums(wc, cells, lat, lon, photos, i, j, size):
    """Sum the cached EOX tile's natural vegetation samples by cell. Missing photos contribute none."""
    col = np.floor((lon - wc.x0) / wc.dx).astype(int)
    row = np.floor((wc.y0 - lat) / wc.dy).astype(int)
    eligible = (cells >= 0) & _natural(wc, lat.mean())[np.ix_(row, col)]
    if not eligible.any():
        return None
    key = SOURCE, ZOOM, i, j
    data = photos.raw(*key)
    if data is None:  # remembered or fresh 404
        return None
    try:
        with Image.open(BytesIO(data)) as image:
            if image.size != (imagery.TILE, imagery.TILE):
                raise ValueError("unexpected EOX tile size")
            pixels = np.asarray(image.convert("RGBA"))[eligible]
    except (OSError, ValueError):
        photos._discard(*key)  # a damaged JPEG is recoverable on the next online build
        raise
    ok = (pixels[:, 3] > 0) & np.any(pixels[:, :2] > 0, axis=1)
    cells = cells[eligible][ok]
    rg = LINEAR[pixels[ok, :2]]
    return [np.bincount(cells, weights=w, minlength=size) for w in (None, rg[:, 0], rg[:, 1])]


def _zone_at(lat, lon):
    """Köppen map pixel at a cell centre, including 0 for water."""
    grid = climate._load()
    j = int(np.clip((90 - lat) / climate.RES, 0, len(grid) - 1))
    i = int(((lon + 180) % 360) / climate.RES) % grid.shape[1]
    return grid[j, i]


def _land_zone(lat, lon):
    """Nearest Köppen land pixel for a WorldCover land cell, including islands and coastal slivers."""
    zone = _zone_at(lat, lon)
    if zone:
        return zone
    grid = climate._load()
    lats = 90 - (np.arange(grid.shape[0]) + 0.5) * climate.RES
    best = np.inf
    for j in np.argsort(abs(lats - lat)):
        if abs(np.radians(lats[j] - lat)) >= best:
            break
        cols = np.flatnonzero(grid[j])
        if cols.size:
            lons = (cols + 0.5) * climate.RES - 180
            dlon = np.radians((lons - lon + 180) % 360 - 180)
            i = np.argmin(abs(dlon))
            a = (np.sin(np.radians(lats[j] - lat) / 2) ** 2 +
                 np.cos(np.radians(lat)) * np.cos(np.radians(lats[j])) * np.sin(dlon[i] / 2) ** 2)
            angle = 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
            if angle < best:
                best, zone = angle, grid[j, cols[i]]
    return zone


def _koppen_value(zone):
    """Dryness of the Köppen land zone when natural vegetation supplies too few pixels. Pure."""
    # Desert BW and steppe BS are progressively less dry. Dry-summer Cs and Ds get a partial
    # shift. Other zones keep the green palette; climate cannot resolve local rain shadows or irrigation.
    if 4 <= zone <= 5:
        return 1.0
    if 6 <= zone <= 7:
        return 0.7
    if 8 <= zone <= 10:
        return 0.5
    if 17 <= zone <= 20:
        return 0.4
    return 0.0


def _smooth(values, land):
    """Gaussian mean of land values, normalized by the land weight at each cell. Pure."""
    # Sigma 15 km blends neighbouring districts but can soften a sharp mountain rain shadow.
    # Truncate at three sigma, where the remaining Gaussian carries less than 0.3% of its mass.
    sigma = 15000 / CELL
    radius = int(np.ceil(3 * sigma))
    offsets = np.arange(-radius, radius + 1)
    kernel = np.exp(-0.5 * (offsets / sigma) ** 2)
    pair = np.stack((values * land, land))
    for axis in (1, 2):
        pair = np.apply_along_axis(lambda a: np.convolve(np.pad(a, radius, mode="edge"), kernel, "valid"), axis, pair)
    total, weight = pair
    return np.divide(total, weight, out=np.zeros_like(total), where=weight > 0).astype(np.float32)


def field(lat0, lon0, region_enu, rasters, fetcher):
    """Measure the ENU region from cached WorldCover and EOX. Return its field and source masks."""
    frame = geodesy.EnuFrame(lat0, lon0)
    west, south, east, north = region_enu
    nx, ny = np.ceil([(east - west) / CELL, (north - south) / CELL]).astype(int)
    # Centre the grid over the requested extent, giving both outer rows the same margin.
    west, south = (east + west - nx * CELL) / 2, (north + south - ny * CELL) / 2
    origin = np.array([west, south]) + CELL / 2
    sums = np.zeros((3, ny * nx))
    cover = np.zeros(nx * ny, np.uint8)
    loaded = 0
    errors = set()

    def measure(key):
        return _measure(key, frame, west, south, (ny, nx), rasters, photos)

    # Match the EOX host's concurrency limit. Both providers read their disk caches first, even offline.
    # Rasters uses <cache>/mapdata/raw. Share the imagery reader's <cache>/imagery tiles and 404s.
    photo_dir = Path(rasters.raw_dir).parents[1] / "imagery"
    with closing(imagery.Imagery(photo_dir, chain=(SOURCE,), fetcher=fetcher)) as photos, ThreadPoolExecutor(6) as pool:
        for observed, result, error in pool.map(measure, _tile_keys(frame, west, south, nx, ny)):
            np.maximum(cover, observed, out=cover)
            if error:
                errors.add(error)
            if result is not None:
                sums += result
                loaded += 1
    count, red, green = sums.reshape(3, ny, nx)
    measured = (count >= MIN_PIXELS) & (red + green > 0)
    values = np.zeros((ny, nx))
    gr = (green[measured] - red[measured]) / (green[measured] + red[measured])
    values[measured] = np.clip((GREEN_GR - gr) / GR_SPAN, 0, 1)
    cover = cover.reshape(ny, nx)
    land = (cover == LAND) | measured
    for row, col in zip(*np.nonzero(~measured & (cover != WATER))):
        lat, lon, _ = frame.enu_to_geodetic(origin[0] + col * CELL, origin[1] + row * CELL)
        # Where WorldCover itself is unavailable (also beyond Mercator), use the climate
        # map's own land mask. Only *known* land can borrow a nearby coastal climate.
        zone = _land_zone(lat, lon) if land[row, col] else _zone_at(lat, lon)
        if zone:
            land[row, col] = True
            values[row, col] = _koppen_value(zone)
    return origin, _smooth(values, land), measured, land, loaded, errors


def write(tiles_dir, tex_dir, anchor, region, cache_dir, log):
    """Write the field and material offsets used by both SD scenery passes."""
    start = time.perf_counter()
    fetcher = netfetch.Fetcher()
    rasters = maprasters.Rasters(Path(cache_dir) / "mapdata" / "raw", fetcher)
    origin, values, measured, land, tiles, errors = field(anchor["lat"], anchor["lon"], region, rasters, fetcher)
    shifts = {}
    for name, target in DRY.items():
        with Image.open(Path(tex_dir) / (name + ".png")) as image:
            mean = LINEAR[np.asarray(image.convert("RGB"))].mean((0, 1), dtype=np.float64)
        shifts[name] = (_linear(target) - mean).astype(np.float32)
    np.savez(Path(tiles_dir) / "dryness.npz", origin=origin, values=values, measured=measured, land=land, **shifts)
    mb = sum(host["bytes"] for host in fetcher.snapshot().values()) / 1e6
    eox, nland = measured.sum(), land.sum()
    koppen = nland - eox
    log(f"SD dryness min/mean/max {values.min():.3f}/{values.mean():.3f}/{values.max():.3f}, "
        f"EOX {eox}/{nland} land cells ({eox / max(1, nland):.1%}), "
        f"Köppen {koppen}/{nland} ({koppen / max(1, nland):.1%}), {values.size - nland} water cells, "
        f"{tiles} EOX tiles, {mb:.2f} MB downloaded, {time.perf_counter() - start:.1f} s"
        + (f" ({', '.join(sorted(errors))})" if errors else ""))
