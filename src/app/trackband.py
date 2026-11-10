"""The Editor's smooth tool: a band along the road from A to B, and the height change that makes the road in it smooth, with no map: the road
is what the kn5's 1ROAD ground is, a cheapest way over it that keeps to its middle and doesn't climb a wall follows it (1ROAD lies under walls and on both
sides of them; it can take the wrong turn where roads meet, then a point in between says which way). Between A and B the road's
heights are evened out by a smoothing spline, from short waves up to, at full strength, the calmest curve that goes on from the road's slope beyond A
and B; across it the road keeps the slant it was built with. Each lattice point of the band's own road goes to that surface by its own height; what stands
beside the road, a bank, a side road at another level, goes along with the road's change and stays as it stood to it. Beside the band it fades out. A and
B themselves stay where they are: one set on a bump leaves it, the band has to start before it. The result is an ordinary height change (trackheights).
"""
import functools
import heapq
import math
import typing
import warnings

import numpy as np

from app import trackheights
from track import kn5, objectlist

STEP = trackheights.STEP
SNAP_M = 6.0                # how far beside the road a click still means the road: the ground's lattice and a hand's aim
MARGIN_M = 200.0            # how far around the points a way is looked for, at least: a road's bend; further would only cost
MIDDLE_WEIGHT = 3.0         # how much dearer a step at the road's edge is than in its middle: enough to keep off a kerb, not to go round a town
LINE_AVERAGE = 2            # the way's lattice points evened out over this many on each side: it would zigzag from cell to cell
MIN_WIDTH_M, MAX_WIDTH_M = 3.0, 60.0    # a band: a lane, to the widest crossing
CELL_LEVELS_M = 0.5         # the heights of a cell's triangles further apart than this are two levels: its two triangles' middles lie 0.94 m apart, and at MAX_GRADE that is this much
MIN_WINDOW_M = 4.0          # the shortest wave the lattice holds, two cells: below it a change goes by the heights around a point, from it on by the point's own
WINDOW_LENGTHS = 8.0        # at full strength the waves evened out are this many band lengths: of the longest bump a band can hold 0.1 % stays; by strength ** 3 a hill as long as the band goes at about 80 %
HOLD_M = 2.0 * math.sqrt(2.0)   # how far from A and B nothing changes: a lattice cell's diagonal, so all four corners around each stay, and with them A and B, wherever they lie in it
JOIN_M = 4.0                # over how much of the way a change then goes in: two lattice cells, for the lattice's roughness at the very end; the curve joins by itself
END_BLEND_M = 12.0          # over how much of it a lane's own height at A and B, off the road's slant in the middle, goes over into the even road
SLOPE_OVER_M = 16.0         # over how much road beyond A and B its slope is read: a few car lengths, longer than a bump, shorter than a change of the road's grade
SLOPE_MIN_POINTS = 4        # ... of how many lattice steps of road at least: fewer (a junction's edge, the map's) say nothing, the band's own slope there counts
SLANT_WINDOW_M = 30.0       # a road's slant changes over waves of at least this: a bend's banking stays, a stroke's bump across the road doesn't
MAX_LENGTH_M = 3000.0       # a band at most: more is a road's length, not a stretch, and its solve would take too long for a preview
SIDE_FADE_M = 6.0           # over how much it fades out beside the band, at least: the lattice's three cells, an edge no car feels
SIDE_SLOPE = 0.1            # ... and at most this slope added beside it (a large change gets a wider fade): a bank a car can stand on
SOFT_STEEPEST = 1.5         # (a soft fade's steepest slope, against a straight one's)
MAX_POINTS = 20             # A, B and the points in between
MAX_SEARCH_CELLS = 4_000_000    # a way is looked for in a grid of at most this: two points some 1.3 km apart with their margin (4 km by 4 km); further, the page asks for one in between
CUT_M = 0.25                # a lattice point's heights further apart than this are a cut line's two sides: more than a seam's rounding, less than a kerb
ON_LATTICE = 0.005          # (of a step, 1 cm: a vertex on the lattice; a cut line's lie between)
MAX_GRADE = 0.5             # no street on earth is steeper (the steepest about 37 %), a wall is: a triangle or a step steeper than this is none of a road's. Where a road was built with a spike steeper still, a way goes round it
CROSS_GRADE = 0.25          # across a road no step is steeper: twice the steepest banking (about 12 %). Steeper is the foot of a wall, which a build's road mesh runs up at about 50 % (Cap Corse)
OWN_MEDIAN = 5              # a band's own road is read across over this many points of its line, the middle one's height: a spike of a lattice point or two on a road is no wall, a wall goes on
OVERLAP_REACHES = 3.0       # two parts of a band this many of its reaches apart along the way are two legs of a hairpin, not one bend's inside
OVERLAP_APART_M = 0.05      # ... and differing by more than this at one place they would make a step: what a car feels, more than the lattice's rounding


class Refused(Exception):
    """A band can't be made here, for the reason it says."""


def _cells_of_triangles(vertices, faces):
    """(the lattice cells (i, j) the triangles lie on, by their middles, all those under a large one, the height there), of the triangles a road can be:
    one steeper than MAX_GRADE is a wall that came to stand on 1ROAD. Pure."""
    corners = vertices["pos"][faces].astype(np.float64)
    edges = corners - np.roll(corners, 1, axis=1)
    corners = corners[~(np.abs(edges[:, :, 1]) > MAX_GRADE * np.hypot(edges[:, :, 0], edges[:, :, 2])).any(axis=1)]
    flat = corners[:, :, [0, 2]]
    span = np.ptp(flat, axis=1).max(axis=1)
    small = span <= 2 * STEP
    cells, heights = [np.floor(flat[small].mean(axis=1) / STEP).astype(np.int64)], [corners[small, :, 1].mean(axis=1)]
    for (a, b, c), ya, yb, yc in zip(flat[~small], *corners[~small, :, 1].T):
        low, high = np.floor(np.min([a, b, c], axis=0) / STEP).astype(int), np.ceil(np.max([a, b, c], axis=0) / STEP).astype(int)
        i, j = np.meshgrid(np.arange(low[0], high[0]), np.arange(low[1], high[1]))
        px, pz = (i.ravel() + 0.5) * STEP, (j.ravel() + 0.5) * STEP
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if d:
            u = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (pz - c[1])) / d
            v = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (pz - c[1])) / d
            inside = (u >= 0) & (v >= 0) & (u + v <= 1)
            cells.append(np.c_[i.ravel()[inside], j.ravel()[inside]])
            heights.append((u * ya + v * yb + (1 - u - v) * yc)[inside])
    return np.concatenate(cells), np.concatenate(heights)


def _is_road(mesh):
    return mesh["name"].startswith("1ROAD_") and objectlist.kind_of(mesh["name"]) == "ground"


class Road(typing.NamedTuple):
    """The kn5's road: its lattice cells, an array of (i, j), and each one's height as built."""
    cells: np.ndarray
    heights: np.ndarray


@functools.lru_cache(maxsize=1)
def road_cells(path, _revision):
    """The Road of the kn5. Of the file: a height change moves none, and a hill made in the Editor raises no wall. A cell holding two levels stands at a wall, and is none."""
    scan = kn5.scan(path)
    found = []
    with open(path, "rb") as f:
        for m in scan["meshes"]:
            if _is_road(m) and m["indices"]:
                found.append(_cells_of_triangles(*trackheights._mesh(f, m)))
    if not found:
        return Road(np.zeros((0, 2), np.int64), np.zeros(0))
    every, heights = np.concatenate([c for c, _h in found]), np.concatenate([h for _c, h in found])
    cells, number = np.unique(every, axis=0, return_inverse=True)
    number = number.ravel()
    low, high = np.full(len(cells), np.inf), np.full(len(cells), -np.inf)
    np.minimum.at(low, number, heights)
    np.maximum.at(high, number, heights)
    one = high - low <= CELL_LEVELS_M
    return Road(cells[one], (np.bincount(number, heights, len(cells)) / np.bincount(number, minlength=len(cells)))[one])


def _inside_depth(heights, corners=False):
    """Per cell of a grid of road heights (NaN: none) how many steps to the nearest cell outside the road, or beyond a step no road takes, over its sides, with
    corners over those too. Across a road that runs diagonally the first counts by 1.41 too many, the second by as much too few. Pure."""
    limit = MAX_GRADE * STEP
    with np.errstate(invalid="ignore"):
        down, over = np.abs(heights[1:, :] - heights[:-1, :]) <= limit, np.abs(heights[:, 1:] - heights[:, :-1]) <= limit
        rising = np.abs(heights[1:, 1:] - heights[:-1, :-1]) <= limit * math.sqrt(2.0)
        falling = np.abs(heights[1:, :-1] - heights[:-1, 1:]) <= limit * math.sqrt(2.0)
    now = np.isfinite(heights)
    out = np.zeros(heights.shape, np.int32)
    while now.any():
        out += now
        inner = now.copy()
        inner[1:, :] &= now[:-1, :] & down
        inner[:-1, :] &= now[1:, :] & down
        inner[:, 1:] &= now[:, :-1] & over
        inner[:, :-1] &= now[:, 1:] & over
        if corners:
            inner[1:, 1:] &= now[:-1, :-1] & rising
            inner[:-1, :-1] &= now[1:, 1:] & rising
            inner[1:, :-1] &= now[:-1, 1:] & falling
            inner[:-1, 1:] &= now[1:, :-1] & falling
        inner[0, :] = inner[-1, :] = inner[:, 0] = inner[:, -1] = False
        now = inner
    return out


def _cheapest(heights, depth, start, goal):
    """The cheapest way over a grid of road heights (NaN: none) from start to goal, (i, j) each, a step dearer near the edge, none too steep for a road; None if there
    is none. Looking towards the goal first (A*): a wide square would cost seconds. Pure."""
    rows, width = heights.shape
    least = 1.0 + MIDDLE_WEIGHT / max(int(depth.max()), 1)

    def left(x, z):
        far, near = abs(goal[0] - x), abs(goal[1] - z)
        return least * (max(far, near) + (math.sqrt(2.0) - 1.0) * min(far, near))

    best, came, queue = {start: 0.0}, {}, [(left(*start), 0.0, start)]
    while queue:
        _guess, cost, here = heapq.heappop(queue)
        if here == goal:
            out = [here]
            while here in came:
                here = came[here]
                out.append(here)
            return out[::-1]
        if cost > best[here]:
            continue
        for dx, dz, length in ((1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0), (1, 1, math.sqrt(2.0)), (1, -1, math.sqrt(2.0)), (-1, 1, math.sqrt(2.0)), (-1, -1, math.sqrt(2.0))):
            nx, nz = here[0] + dx, here[1] + dz
            if 0 <= nx < width and 0 <= nz < rows and abs(heights[nz, nx] - heights[here[1], here[0]]) <= MAX_GRADE * STEP * length:
                step = cost + length * (1.0 + MIDDLE_WEIGHT / depth[nz, nx])
                if step < best.get((nx, nz), math.inf):
                    best[(nx, nz)], came[(nx, nz)] = step, here
                    heapq.heappush(queue, (step + left(nx, nz), step, (nx, nz)))
    return None


def _snapped(cells, x, z):
    """The road's cell nearest the place (AC x, z), as (i, j). Refused if it lies too far off. Pure."""
    centres = (cells + 0.5) * STEP
    apart = np.hypot(centres[:, 0] - x, centres[:, 1] - z)
    k = int(np.argmin(apart)) if len(cells) else -1
    if k < 0 or apart[k] > SNAP_M:
        raise Refused("Click on the road")
    return tuple(int(v) for v in cells[k])


def _checked_points(points):
    """What the page sent as a band's points, if it is that: an array of [AC x, AC z], two at least. Pure."""
    if not (isinstance(points, list) and 2 <= len(points) <= MAX_POINTS):
        raise ValueError("No band")
    if not all(isinstance(p, list) and len(p) == 2 and all(type(v) in (int, float) and abs(v) <= trackheights.MAX_PLACE_M for v in p) for p in points):
        raise ValueError("No band")
    return np.array(points, np.float64)


def way(road, points):
    """The road (a Road) from point to point: (the line, an array of [AC x, AC z] every lattice step or so, the width of the road on it, m). Refused
    where there is none. Pure."""
    cells = road.cells
    at = _checked_points(points)
    snapped = [_snapped(cells, x, z) for x, z in at]
    line, depths = [], []
    for start, goal in zip(snapped, snapped[1:]):
        margin = int(max(MARGIN_M, math.hypot(goal[0] - start[0], goal[1] - start[1]) * STEP) / STEP)
        low = np.minimum(start, goal) - margin
        high = np.maximum(start, goal) + margin
        if (high[1] - low[1] + 1) * (high[0] - low[0] + 1) > MAX_SEARCH_CELLS:
            raise Refused("These points lie too far apart: click one in between, on the road")
        near = (cells >= low).all(axis=1) & (cells <= high).all(axis=1)
        grid = np.full((high[1] - low[1] + 1, high[0] - low[0] + 1), np.nan)
        grid[cells[near, 1] - low[1], cells[near, 0] - low[0]] = road.heights[near]
        depth = _inside_depth(grid)
        found = _cheapest(grid, np.maximum(depth, 1), (start[0] - int(low[0]), start[1] - int(low[1])), (goal[0] - int(low[0]), goal[1] - int(low[1])))
        if found is None:
            raise Refused("No road found between these points: a wall or a gap lies between them, or click one in between, on the road")
        cell = np.array(found)
        line.append((cell + low + 0.5) * STEP)
        depths.append((depth + _inside_depth(grid, corners=True))[cell[:, 1], cell[:, 0]] / 2)     # (of the two, what a road is wide whichever way it runs)
    line = np.vstack([line[0]] + [part[1:] for part in line[1:]])
    if len(line) > 2 * LINE_AVERAGE + 1:
        kernel = np.ones(2 * LINE_AVERAGE + 1) / (2 * LINE_AVERAGE + 1)
        even = np.c_[np.convolve(line[:, 0], kernel, "valid"), np.convolve(line[:, 1], kernel, "valid")]
        line = np.vstack([line[:1], even, line[-1:]])
    # (over the road's edge on both sides: the median misses where it widens, the last metres of a band go over softly, and what it holds beyond the road only goes along)
    width = float(np.median(np.concatenate(depths))) * 2 * STEP + 2 * STEP
    return line, min(MAX_WIDTH_M, max(MIN_WIDTH_M, width))


def _along(line):
    """The metres along a line at each of its points. Pure."""
    return np.r_[0.0, np.cumsum(np.hypot(*np.diff(line, axis=0).T))]


def road_heights(path, scan, moved, line):
    """The ground's height at each point of the line, as the kn5 is with moved (a kn5.Moved or None). Refused where there is none."""
    grid, i0, j0 = _ground(path, scan, moved, line)
    return _sampled(grid, i0, j0, line)


class _Heights:
    """Heights per lattice point of one kind of ground: the lowest and the highest."""

    def __init__(self, shape):
        self.low, self.high = np.full(shape, np.inf), np.full(shape, -np.inf)

    def add(self, j, i, y):
        np.minimum.at(self.low, (j, i), y)
        np.maximum.at(self.high, (j, i), y)

    def grid(self):
        """Their middle; NaN where none is, or where they lie apart: a cut line's two sides, of which a mean would be neither."""
        out = np.full(self.low.shape, np.nan)
        one = np.isfinite(self.low) & (self.high - self.low <= CUT_M)
        out[one] = (self.low[one] + self.high[one]) / 2
        return out


def _ground(path, scan, moved, line, road_only=False):
    """(the ground's heights on the lattice around line, a grid with NaN where none is known, the lattice numbers of its first point), as the kn5 is
    with moved. The road's where it has one: the terrain beside it can stand at another height at the same place. road_only: the road's alone."""
    low, high = line.min(axis=0) - 2 * STEP, line.max(axis=0) + 2 * STEP
    i0, j0 = int(low[0] // STEP), int(low[1] // STEP)
    nx, nz = int(high[0] // STEP) - i0 + 2, int(high[1] // STEP) - j0 + 2
    if nx * nz > trackheights.MAX_POINTS:
        raise Refused("This band is too long: make it in parts")
    road, other = _Heights((nz, nx)), _Heights((nz, nx))
    centre, reach = (low + high) / 2, float(np.hypot(*(high - low))) / 2

    def add(into, x, z, y):
        i, j = np.rint(x / STEP).astype(np.int64) - i0, np.rint(z / STEP).astype(np.int64) - j0
        inside = (i >= 0) & (i < nx) & (j >= 0) & (j < nz)
        into.add(j[inside], i[inside], y[inside])

    with open(path, "rb") as f:
        for number, m in enumerate(scan["meshes"]):
            if objectlist.kind_of(m["name"]) != "ground" or math.hypot(m["center"][0] - centre[0], m["center"][2] - centre[1]) > m["radius"] + reach:
                continue        # (all the ground: a band reaches over the road's edge)
            if road_only and not _is_road(m):
                continue
            vertices, faces = trackheights._mesh(f, m)
            if moved and number in moved.vertices:
                vertices = moved.vertices[number]
            into = road if _is_road(m) else other
            p = vertices["pos"].astype(np.float64)
            on = (np.abs(p[:, 0] / STEP - np.rint(p[:, 0] / STEP)) < ON_LATTICE) & (np.abs(p[:, 2] / STEP - np.rint(p[:, 2] / STEP)) < ON_LATTICE)
            add(into, p[on, 0], p[on, 2], p[on, 1])        # (a cut line's points lie between the lattice's, on another height)
            corners = p[faces]
            for a, b, c in corners[np.ptp(corners[:, :, [0, 2]], axis=1).max(axis=1) > 2 * STEP]:     # (triangles larger than the lattice: a plane's points)
                t = np.linspace(0, 1, 9)
                u, v = np.meshgrid(t, t)
                keep = u + v <= 1
                q = a + (b - a) * u[keep][:, None] + (c - a) * v[keep][:, None]
                add(into, q[:, 0], q[:, 2], q[:, 1])
    grid = other.grid()
    on_road = road.grid()
    grid[np.isfinite(on_road)] = on_road[np.isfinite(on_road)]
    return grid, i0, j0


def _across(half):
    """The lanes of a band, by how far off its line: always at the same places, a wider band only adds to them on the outside, so a width a little more or less
    changes nothing under the band. Pure."""
    n = max(1, int(math.ceil(half / STEP)))
    return STEP * np.arange(-n, n + 1, dtype=np.float64)


def _read_across(grid, i0, j0, line, half):
    """(how far off the line its lanes lie, out to two lattice steps past half; per lane and point of the line the grid's height there, the middle of
    OWN_MEDIAN points along: a spike of a lattice point or two on a road is no wall, a wall goes on). Pure."""
    lanes = _across(half + 2 * STEP)
    side = _sideways(line)
    read = np.array([_on_grid(grid, i0, j0, line + side * o) for o in lanes])
    around = np.lib.stride_tricks.sliding_window_view(np.pad(read, ((0, 0), (OWN_MEDIAN // 2, OWN_MEDIAN // 2)), mode="edge"), OWN_MEDIAN, axis=1)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)     # (no road at all around a point: NaN is the answer)
        return lanes, np.nanmedian(around, axis=2)


def _on_step(read):
    """Per point of a line, of _read_across's heights: it lies on a step between two levels, its middle reading neither, the lanes beside it off it by more
    than a road is across (CROSS_GRADE), at least one of them on road. Pure."""
    middle = len(read) // 2
    with np.errstate(invalid="ignore"):
        apart = [~(np.abs(read[k] - read[middle]) <= CROSS_GRADE * STEP) for k in (middle - 1, middle + 1)]
    return np.isfinite(read[middle]) & apart[0] & apart[1] & (np.isfinite(read[middle - 1]) | np.isfinite(read[middle + 1]))


def _own_road(grid, i0, j0, line, half, claimed=None, mapped=None):
    """Of a grid of the road's heights as built, the lattice points of the road the line is on, within half: walking across from the line, as far as there is road
    and no step steeper than CROSS_GRADE. A side road is 1ROAD too and can lie a cell beside it, at another level with a wall between, and join it at a junction
    further on: so not by what can be reached along it. As built: a hill made in the Editor doesn't take a road out of its own band.
    claimed (a boolean grid, or None): the points other roads hold as their own. Given, where the line lies on a step between two levels (its middle reads
    neither, both lanes beside it are off it: Rechberg, a wall running under the line for 6 m), the road goes on from its points before and after over steps a
    road can take, within half and not onto a claimed point; so too onto a point within mapped (its own half width on the map, or None) on another level as
    built: what the map gives the road is the road (Rechberg: a wall's corner put its east lane 3 m down). Pure."""
    lanes, read = _read_across(grid, i0, j0, line, half)
    middle = len(lanes) // 2
    holds = np.zeros(read.shape, bool)
    holds[middle] = np.isfinite(read[middle])
    for lane, inner in [(k, k - 1) for k in range(middle + 1, len(lanes))] + [(k, k + 1) for k in range(middle - 1, -1, -1)]:
        with np.errstate(invalid="ignore"):
            holds[lane] = holds[inner] & (np.abs(read[lane] - read[inner]) <= CROSS_GRADE * STEP)
    reach = float(lanes[-1])
    apart, own, said = np.full(grid.shape, np.inf), np.zeros(grid.shape, bool), np.zeros(grid.shape)
    nearest = np.zeros(grid.shape, np.int64)
    for k, (a, b) in enumerate(zip(line, line[1:])):
        i_low, i_high = max(0, int((min(a[0], b[0]) - reach) // STEP) - i0), min(grid.shape[1], int((max(a[0], b[0]) + reach) // STEP) - i0 + 2)
        j_low, j_high = max(0, int((min(a[1], b[1]) - reach) // STEP) - j0), min(grid.shape[0], int((max(a[1], b[1]) + reach) // STEP) - j0 + 2)
        if i_low >= i_high or j_low >= j_high:
            continue
        gx, gz = np.meshgrid(STEP * (np.arange(i_low, i_high, dtype=np.float64) + i0) - a[0], STEP * (np.arange(j_low, j_high, dtype=np.float64) + j0) - a[1])
        along = b - a
        t = np.clip((gx * along[0] + gz * along[1]) / max(float(along @ along), 1e-12), 0, 1)
        d = np.hypot(gx - t * along[0], gz - t * along[1])
        nearer = d < apart[j_low:j_high, i_low:i_high]
        sideways = (gx * along[1] - gz * along[0]) / max(float(np.hypot(*along)), 1e-9)
        lane = np.clip(np.rint(sideways / STEP).astype(np.int64) + middle, 0, len(lanes) - 1)
        apart[j_low:j_high, i_low:i_high][nearer] = d[nearer]
        station = k + np.rint(t).astype(np.int64)
        own[j_low:j_high, i_low:i_high][nearer] = holds[lane, station][nearer]
        said[j_low:j_high, i_low:i_high][nearer] = read[lane, station][nearer]
        nearest[j_low:j_high, i_low:i_high][nearer] = station[nearer]
    own &= (apart <= reach) & np.isfinite(grid)
    _leave_other_level(own, grid, np.abs(grid - said) > CROSS_GRADE * STEP)
    if claimed is None:
        return own
    on_step = _on_step(read)
    # (a lane reading across a wall's corner leaves a point of the line's own level out: Rechberg, 1.27 m left standing beside its smoothed road)
    with np.errstate(invalid="ignore"):
        level = np.abs(grid - read[middle][nearest]) <= CROSS_GRADE * np.maximum(apart, STEP)
    within = np.zeros(grid.shape, bool) if mapped is None else apart <= mapped
    candidates = (on_step[nearest] | level | within) & (apart <= half) & np.isfinite(grid) & ~claimed & ~own
    return _reached(own, grid, candidates)


def _shifted(grid, dz, dx, fill):
    """grid moved by dz rows and dx columns, fill where nothing comes in. Pure."""
    out = np.full(grid.shape, fill, grid.dtype)
    rows, cols = grid.shape
    out[max(dz, 0):rows + min(dz, 0), max(dx, 0):cols + min(dx, 0)] = grid[max(-dz, 0):rows - max(dz, 0), max(-dx, 0):cols - max(dx, 0)]
    return out


def _reached(own, grid, candidates):
    """own with the candidates reached from it, lattice point by lattice point, over steps no steeper than a road is across (CROSS_GRADE). Pure."""
    reached = own.copy()
    while True:
        grown = np.zeros(own.shape, bool)
        for dz, dx in ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)):
            with np.errstate(invalid="ignore"):
                near = np.abs(grid - _shifted(grid, dz, dx, np.nan)) <= CROSS_GRADE * STEP * math.hypot(dz, dx)
            grown |= candidates & ~reached & _shifted(reached, dz, dx, False) & near
        if not grown.any():
            return reached
        reached |= grown


def _leave_other_level(own, grid, off):
    """own (a boolean grid) without the points off what their lane read that go with a point beside them that isn't its own: a road at another level, where a wall
    runs slantwise across the lanes. A bump on the road has none such beside it. Only the points in question are walked: few."""
    rows, width = grid.shape
    for j, i in np.argwhere(own & off).tolist():
        for nj, ni in ((j - 1, i - 1), (j - 1, i), (j - 1, i + 1), (j, i - 1), (j, i + 1), (j + 1, i - 1), (j + 1, i), (j + 1, i + 1)):
            if 0 <= nj < rows and 0 <= ni < width and not own[nj, ni] and abs(grid[nj, ni] - grid[j, i]) <= CROSS_GRADE * STEP:
                own[j, i] = False
                break


def _sampled(grid, i0, j0, line):
    """The heights of a grid of lattice points (NaN: none there) along the line: linear between the four around each point, what is missing from
    along the line. Refused if none is there. Pure."""
    out = _on_grid(grid, i0, j0, line)
    good = np.isfinite(out)
    if not good.any():
        raise Refused("No ground found to smooth here")
    s = _along(line)
    return np.interp(s, s[good], out[good])


def _lanes(grid, i0, j0, rows):
    """The road's heights (grid: the road's alone) per lane and point of the rows. Where a lane is off the road, at the same point along the height of the
    nearest lane on it: a lane that runs into a bank would otherwise even the road and the bank out together, and lift the road beside it. What stands beside
    the road so takes the road's change and stays as it stands to it. Where no lane is on road, from along the way. Refused if none ever is. Pure."""
    h = np.array([_on_grid(grid, i0, j0, row) for row in rows])
    known = np.isfinite(h)
    if not known.any():
        raise Refused("No road found to smooth here")
    lanes = np.arange(len(h))
    has = known.any(axis=0)
    for k in np.flatnonzero(has):
        h[:, k] = np.interp(lanes, lanes[known[:, k]], h[known[:, k], k])
    s = _along(rows[len(rows) // 2])
    return np.array([np.interp(s, s[has], lane[has]) for lane in h])


def _on_grid(grid, i0, j0, line):
    """The heights of a grid of lattice points at the points of a line: linear between the four around each, of those that have one; NaN where none has. Pure."""
    x, z = line[:, 0] / STEP - i0, line[:, 1] / STEP - j0
    i, j = np.floor(x).astype(np.int64), np.floor(z).astype(np.int64)
    fx, fz = x - i, z - j
    out = np.full(len(line), np.nan)
    inside = (i >= 0) & (j >= 0) & (i + 1 < grid.shape[1]) & (j + 1 < grid.shape[0])
    weights = np.stack([(1 - fx) * (1 - fz), fx * (1 - fz), (1 - fx) * fz, fx * fz])
    values = np.full((4, len(line)), np.nan)
    values[:, inside] = np.stack([grid[j[inside], i[inside]], grid[j[inside], i[inside] + 1], grid[j[inside] + 1, i[inside]], grid[j[inside] + 1, i[inside] + 1]])
    there = np.isfinite(values)
    weight = (weights * there).sum(axis=0)
    good = weight > 0
    out[good] = (np.nan_to_num(values) * weights).sum(axis=0)[good] / weight[good]
    return out


def _joining(s, length):
    """How much of a change holds at s metres along a band of that length: nothing as far as HOLD_M from A and B, so they stay as they are, to all of it a few
    metres in: what is left of a lattice's roughness at the very end goes in softly, the even line itself takes up the road's slope. Pure."""
    t = np.clip((np.minimum(s, length - s) - HOLD_M) / max(min(JOIN_M, length / 2 - HOLD_M), 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def _window(length, strength):
    """Which waves a strength evens out, by their length in m, on a band of that length: none at 0, growing without a jump, up to WINDOW_LENGTHS bands. Pure."""
    return WINDOW_LENGTHS * length * strength ** 3


def _even(s, rows, window, slopes=None):
    """rows of heights at each point s metres along, as they are to be: per row the line nearest them with the least bend, waves shorter than window (m)
    gone, which keeps the first height and the last and starts and ends with slopes (two rises per m, each None: the row's own near that end). Over waves
    short of the road's slope there the row's own, read over the window: a little strength doesn't touch the ends; below the shortest wave it goes over to the
    heights themselves, as the spline holds its ends' points by the cubic: no jump from none. Solved as a whole, so the ends need no fading. Pure."""
    length = float(s[-1])
    n = max(5, int(round(length / STEP)) + 1)
    uniform = np.linspace(0.0, length, n)
    y = np.array([np.interp(uniform, s, row) for row in rows])
    h = uniform[1] - uniform[0]
    near = min(n - 1, max(1, int(round(min(window, SLOPE_OVER_M) / h))))
    own = (y[:, near] - y[:, 0]) / (near * h), (y[:, -1] - y[:, -1 - near]) / (near * h)
    share = min(1.0, window / SLOPE_OVER_M)
    ends = [o if given is None else o + share * (given - o) for o, given in zip(own, slopes or (None, None))]
    out = np.array([np.interp(s, uniform, row) for row in _spline(y, h, ends, window)])
    return rows + min(1.0, window / MIN_WINDOW_M) * (out - rows)


def _spline(y, h, slopes, window):
    """Per row of y, at points h metres apart: the curve that minimises its distance to the row plus (window / 2 pi) ** 4 times its bend squared. A wave of
    that length halves, longer ones stay. It starts and ends on the cubic with the row's ends and slopes, which has no bend to spend: so what comes on top
    of the cubic is all that is solved, and a long window can't go wrong by rounding. One solve for all rows. Pure."""
    n = y.shape[1]
    t = np.linspace(0.0, 1.0, n)
    span = h * (n - 1)
    cubic = (np.outer(y[:, 0], 2 * t ** 3 - 3 * t ** 2 + 1) + np.outer(slopes[0] * span, t ** 3 - 2 * t ** 2 + t)
             + np.outer(y[:, -1], 3 * t ** 2 - 2 * t ** 3) + np.outer(slopes[1] * span, t ** 3 - t ** 2))
    weight = (window / (2 * math.pi)) ** 4 / h ** 4
    out = cubic.copy()
    out[:, 2:-2] += _bends_solved(weight, (y - cubic)[:, 2:-2])
    return out


def _bends_solved(weight, rows):
    """Per row r the x with x + weight * (its fourth differences, x 0 beyond its ends) = r: five diagonals, so by their own factors (L D L'): for 3 km of band
    what a general solve takes a second for, a preview has to be quicker. Pure."""
    n = rows.shape[1]
    d, e, f = [0.0] * n, [0.0] * n, [0.0] * n
    for i in range(n):
        d[i] = 1.0 + 6.0 * weight - (d[i - 1] * e[i - 1] ** 2 if i >= 1 else 0.0) - (d[i - 2] * f[i - 2] ** 2 if i >= 2 else 0.0)
        e[i] = (-4.0 * weight - (d[i - 1] * e[i - 1] * f[i - 1] if i >= 1 else 0.0)) / d[i]
        f[i] = weight / d[i]
    x = rows.copy().T
    for i in range(1, n):
        x[i] -= e[i - 1] * x[i - 1]
        if i >= 2:
            x[i] -= f[i - 2] * x[i - 2]
    x /= np.array(d)[:, None]
    for i in range(n - 2, -1, -1):
        x[i] -= e[i] * x[i + 1]
        if i + 2 < n:
            x[i] -= f[i] * x[i + 2]
    return x.T


def _onward(line):
    """Where the road goes on past the end of the line (its last point), as far as it can be told: the way its last metres turn, carried on, a point each
    lattice step. In a bend a straight line would leave the road for what stands beside it. Pure."""
    s = _along(line)
    far = s[-1] - s
    k1, k2 = int(np.searchsorted(-far, -min(6.0, s[-1] / 2))), int(np.searchsorted(-far, -min(12.0, s[-1])))
    a, b, c = line[k2], line[k1], line[-1]
    last = math.atan2(*(c - b)[::-1])
    turn = math.remainder(last - math.atan2(*(b - a)[::-1]), 2 * math.pi) / max(far[k2] - far[k1], STEP)
    metres = np.arange(STEP, SLOPE_OVER_M + STEP / 2, STEP)
    angle = last + turn * (far[k1] / 2 + metres - STEP / 2)     # (a chord's heading is that of its middle)
    return c + np.cumsum(STEP * np.c_[np.cos(angle), np.sin(angle)], axis=0)


def _rise_onward(grid, i0, j0, end, onward):
    """The road's rise per m from end, a band's, along the points of _onward, on a grid of the road's heights, or None if too few of them lie on it: only as far as no
    road's missing and no step is a wall's, the first from the end itself. Robust, the middle of the rises between all pairs of them (Theil and Sen): a bump just
    beyond an end doesn't tilt it. Pure."""
    heights = _on_grid(grid, i0, j0, np.vstack([end, onward]))
    with np.errstate(invalid="ignore"):
        left = np.flatnonzero(~np.isfinite(heights[1:]) | ~np.isfinite(heights[:-1]) | (np.abs(np.diff(heights)) > MAX_GRADE * STEP))
    count = int(left[0]) + 1 if len(left) else len(heights)
    if count < SLOPE_MIN_POINTS or not np.isfinite(heights[:count]).all():
        return None
    heights = heights[:count]
    metres = np.arange(count) * STEP
    first, second = np.triu_indices(len(metres), 1)
    return float(np.median((heights[second] - heights[first]) / (metres[second] - metres[first])))


def _sideways(line):
    """Per point of a line the unit vector across it, to its left going along. Pure."""
    along = np.gradient(line, axis=0)
    along /= np.maximum(np.hypot(along[:, 0], along[:, 1]), 1e-9)[:, None]
    return np.c_[along[:, 1], -along[:, 0]]


def raster(line, change, width, id_, exact=None, lanes=None):
    """The height change (trackheights.problem's form) of change, per lane across the band of that width and per point of the line (one row: the same
    for all of the width): between them linear, beside the band fading out softly from what its edge has. lanes: how far off the line the rows lie, evenly; they can reach
    over the band's edge; None: from edge to edge. exact: (even, heights, grid, i0, j0, share), per lane and point what the road is
    to be and is: each lattice point by its own place along the way, so A and B stay, and inside the band by its own height, by that share: a change taken from
    the heights around a point would leave a part of a narrow hill.
    Refused if it does nothing, or if the band overlaps itself where it would have to do two things at one place. Pure."""
    half = width / 2
    change = np.atleast_2d(change)
    if len(change) == 1:
        change = np.vstack([change, change])
    lanes = np.linspace(-half, half, len(change)) if lanes is None else lanes
    lane = float(lanes[1] - lanes[0])
    at_edge = np.clip((np.clip(lanes, -half, half) - lanes[0]) / lane, 0, len(change) - 1 - 1e-9)
    largest = float(np.abs(change[at_edge.astype(np.int64)] * (1 - at_edge % 1)[:, None] + change[at_edge.astype(np.int64) + 1] * (at_edge % 1)[:, None]).max())
    fade = max(SIDE_FADE_M, SOFT_STEEPEST * largest / SIDE_SLOPE)
    reach = half + fade
    x0 = int(math.floor((line[:, 0].min() - reach) / STEP)) * STEP - STEP
    z0 = int(math.floor((line[:, 1].min() - reach) / STEP)) * STEP - STEP
    nx = (int(math.ceil((line[:, 0].max() + reach) / STEP)) * STEP + STEP - x0) // STEP + 1
    nz = (int(math.ceil((line[:, 1].max() + reach) / STEP)) * STEP + STEP - z0) // STEP + 1
    if nx * nz > trackheights.MAX_POINTS:
        raise Refused("This band is too long: make it in parts")
    apart, value, station = np.full((nz, nx), np.inf), np.zeros((nz, nx)), np.zeros((nz, nx), np.int64)
    own = None
    if exact:
        even, heights, grid, g0, h0, by_own = exact
        own = np.full((nz, nx), np.nan)
        di, dj = x0 // STEP - g0, z0 // STEP - h0     # (where this raster's first point lies in the grid)
        a0, b0 = max(0, -dj), max(0, -di)
        a1, b1 = min(nz, grid.shape[0] - dj), min(nx, grid.shape[1] - di)
        if a1 > a0 and b1 > b0:
            own[a0:a1, b0:b1] = grid[a0 + dj:a1 + dj, b0 + di:b1 + di]
    metres = _along(line)
    for k, (a, b) in enumerate(zip(line, line[1:])):
        i0, i1 = int((min(a[0], b[0]) - reach - x0) // STEP), int((max(a[0], b[0]) + reach - x0) // STEP) + 2
        j0, j1 = int((min(a[1], b[1]) - reach - z0) // STEP), int((max(a[1], b[1]) + reach - z0) // STEP) + 2
        gx, gz = np.meshgrid(x0 + STEP * np.arange(i0, i1, dtype=np.float64) - a[0], z0 + STEP * np.arange(j0, j1, dtype=np.float64) - a[1])
        along = b - a
        t = np.clip((gx * along[0] + gz * along[1]) / max(float(along @ along), 1e-12), 0, 1)
        d = np.hypot(gx - t * along[0], gz - t * along[1])
        nearer = d < apart[j0:j1, i0:i1]
        length = max(float(np.hypot(*along)), 1e-9)
        # (how far to the side, by the same left as _sideways, as a lane's number: beyond the band its outermost lane's)
        sideways = (gx * along[1] - gz * along[0]) / length
        at_lane = np.clip((np.clip(sideways, -half, half) - lanes[0]) / lane, 0, len(change) - 1 - 1e-9)
        low = at_lane.astype(np.int64)
        share = at_lane - low
        here = (change[low, k] * (1 - share) + change[low + 1, k] * share) * (1 - t) + (change[low, k + 1] * (1 - share) + change[low + 1, k + 1] * share) * t
        if exact:
            height = own[j0:j1, i0:i1]
            inside = (np.abs(sideways) <= half) & np.isfinite(height)
            to_be = (even[low, k] * (1 - share) + even[low + 1, k] * share) * (1 - t) + (even[low, k + 1] * (1 - share) + even[low + 1, k + 1] * share) * t
            lanes_say = (heights[low, k] * (1 - share) + heights[low + 1, k] * share) * (1 - t) + (heights[low, k + 1] * (1 - share) + heights[low + 1, k + 1] * share) * t
            holds = _joining(metres[k] + t * length, float(metres[-1]))
            here = holds * (to_be - lanes_say)
            # (down to none at the band's edge: beyond it the change comes from its lanes, and a width a little more or less is to make no jump)
            here[inside] += (holds * by_own * np.clip((half - np.abs(sideways)) / STEP, 0, 1) * (lanes_say - height))[inside]
        # (a hairpin's two legs, both near a point: far apart along the way, each with a change of its own)
        two = (d < reach) & (apart[j0:j1, i0:i1] < reach) & (metres[k] - metres[station[j0:j1, i0:i1]] > OVERLAP_REACHES * reach)
        if (np.abs(here - value[j0:j1, i0:i1])[two] > OVERLAP_APART_M).any():
            raise Refused("The band overlaps itself here: make it in parts, or narrower")
        apart[j0:j1, i0:i1][nearer] = d[nearer]
        value[j0:j1, i0:i1][nearer] = here[nearer]
        station[j0:j1, i0:i1][nearer] = k
    t = np.clip((apart - half) / fade, 0, 1)
    mm = np.clip(np.rint(value * (1 - t * t * (3 - 2 * t)) * 1000), -trackheights.MAX_MM, trackheights.MAX_MM).astype(np.int64)
    mm[0], mm[-1], mm[:, 0], mm[:, -1] = 0, 0, 0, 0
    if not mm.any():
        raise Refused("It is smooth here already")
    return {"id": id_, "x": x0, "z": z0, "nx": int(nx), "nz": int(nz), "mm": mm.ravel().tolist()}


def change_of(path, scan, moved, road, points, width, strength, id_):
    """The height change of a band over points, as the kn5 is with moved: width in m, None for the road's own; strength 0 to 1. ValueError for
    what can't be asked, Refused for what can't be."""
    if not (type(strength) in (int, float) and 0 <= strength <= 1):
        raise ValueError("No strength")
    if width is not None and not (type(width) in (int, float) and MIN_WIDTH_M <= width <= MAX_WIDTH_M):
        raise ValueError("No width")
    line, road_width = way(road, points)
    if len(line) < 3 or _along(line)[-1] <= 2 * HOLD_M:
        raise Refused("A and B lie too close together")
    width = road_width if width is None else width
    # (lane by lane, not by the middle alone: a hill isn't the same across the road)
    lanes = _across(width / 2)
    side, s = _sideways(line), _along(line)
    if s[-1] > MAX_LENGTH_M:
        raise Refused("This band is too long: make it in parts")
    rows = [line + side * o for o in lanes]
    before, after = _onward(line[::-1]), _onward(line)
    # (the band's own road alone: raster's points without a height of it, a bank's, another road's, go with the road's change at their lane)
    around = np.vstack(rows + [before, after])
    source, i0, j0 = _ground(path, scan, None, around, road_only=True)
    grid = source if moved is None else _ground(path, scan, moved, around, road_only=True)[0]
    slopes = _rise_onward(grid, i0, j0, line[0], before), _rise_onward(grid, i0, j0, line[-1], after)
    own = _own_road(source, i0, j0, line, width / 2)
    grid, source = np.where(own, grid, np.nan), np.where(own, source, np.nan)
    heights = _lanes(grid, i0, j0, rows)
    built = _lanes(source, i0, j0, rows)
    even = _even_surface(s, heights, built, strength, (None if slopes[0] is None else -slopes[0], slopes[1]))
    by_own = min(1.0, _window(float(s[-1]), strength) / MIN_WINDOW_M)
    return raster(line, (even - heights) * _joining(s, float(s[-1])), width, id_, (even, heights, grid, i0, j0, by_own), lanes)


def _even_surface(s, heights, built, strength, slopes):
    """The road as it is to be, per lane and point of the line, from its heights: a calm line along it (_even), going on from slopes at its ends (a rise per m
    going along, each None for the band's own), and across it the slant the road has as built (of built, the file, which a hill made afterwards doesn't
    touch), of waves of a slant's length only: a bend's banking stays. At little strength the slant as it is now, without a jump from 0. At each end
    each lane's height as it is. Pure."""
    if strength <= 0:
        return heights.copy()
    window = _window(float(s[-1]), strength)
    middle = _middle(heights)
    calm = _even(s, middle[None], window, slopes)[0]
    share = min(1.0, window / SLANT_WINDOW_M)
    slant = _even(s, built - _middle(built), min(window, SLANT_WINDOW_M))
    even = calm + share * slant + (1 - share) * _even(s, heights - middle, window)
    return even + np.outer(heights[:, 0] - even[:, 0], _towards(s)) + np.outer(heights[:, -1] - even[:, -1], _towards(s[-1] - s))


def _middle(rows):
    """The road along its line: the mean of the lanes around it, of no other, so a wider band says the same. Pure."""
    centre = len(rows) // 2
    return rows[centre - 1:centre + 2].mean(axis=0)


def _towards(metres):
    """1 at 0 metres, softly to 0 at END_BLEND_M, or the band's half if that is less. Pure."""
    t = np.clip(metres / max(min(END_BLEND_M, float(metres.max()) / 2), 1e-9), 0, 1)
    return 1 - t * t * (3 - 2 * t)
