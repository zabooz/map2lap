"""The ground along a wall between two roads at two levels (roads.walls._between_walls): a clean step inside the wall.

The terrain's 2 m lattice can only draw a step at an angle to it as a ramp from its last low point to its first high one: up to
a grid diagonal of asphalt teeth in front of the face, hiding the wall and in the way of a car at the road's edge (Cap Corse,
3 m between a main road and the lane above it). A cutting's wall stands in front of its teeth (grading.WALL_FLAT_M), but
between two roads that strip would lie on the upper road. So along a cut line just behind the wall's face:
- the lattice's corners take the level of their side, where the grading's step isn't exactly there (_snap);
- the cells the line crosses are drawn apart: the lower road's level up to the line, the upper's behind it, joined by an upright
  skirt inside the wall's body.

Worldwide: only along those walls and the step going on past their ends (roads.walls.BETWEEN_*), and only cells with their low
corners on one side of the line and their high ones on the other: where the line stops inside a cell, a saddle or a step gone
flat keep the lattice's ramp, its gap to the step closed. Two neighbouring cells (two tiles too) cut a shared edge at the same
point: it comes from the edge and the lines alone.
"""
import math
from collections import namedtuple

import numpy as np

MIN_STEP_M = 0.5        # m between the levels: less is no step to cut
EDGE_KEEP = 0.02        # a crossing at least this share of an edge from its corners: no triangle without an area
# m off the line a corner can lie on the wrong level: the grading's step isn't exactly the line (roads.walls.BETWEEN_LOW_M: its
# transition around it). The line then misses that corner's edge, and one such cell stays a ramp, its neighbours with it: a
# corner 0.1 m behind the face still low, a 3.8 m tooth at the road's edge, Cap Corse; 0.5 m behind it, past the wall's end
NEAR_M = 0.75

Cut = namedtuple("Cut", "u P cells T owner lift")


def _segments(lines, box):
    """The lines' segments near box (x0, y0, x1, y1), each once, in one order whichever tile asks: (k, 10) rows ax, ay, bx, by, low
    at a, at b, high at a, at b, then the unit vector to the lower side. lines: dicts of base (n, 2), low (n,), high (n,),
    toward (n, 2): each tile has its own piece, and neighbours' pieces overlap. Pure."""
    rows = []
    for w in lines:
        b, lo, hi, tw = (np.asarray(w[k], np.float64) for k in ("base", "low", "high", "toward"))
        if len(b) >= 2:
            rows.append(np.c_[b[:-1], b[1:], lo[:-1], lo[1:], hi[:-1], hi[1:], tw[:-1]])
    if not rows:
        return np.zeros((0, 10))
    s = np.unique(np.round(np.concatenate(rows), 3), axis=0)
    return s[(s[:, [0, 2]].max(axis=1) >= box[0]) & (s[:, [0, 2]].min(axis=1) <= box[2])
             & (s[:, [1, 3]].max(axis=1) >= box[1]) & (s[:, [1, 3]].min(axis=1) <= box[3])]


def _line_end(segs, p):
    """Whether point p (2,) on a line is its end: one segment alone has it. Pure."""
    return int((np.abs(segs[:, :2] - p) < 1e-3).all(axis=1).sum() + (np.abs(segs[:, 2:4] - p) < 1e-3).all(axis=1).sum()) < 2


def _snap(u, segs, x0, y0, cell):
    """The lattice's heights u (n, n) with the corners within NEAR_M of a line on its side's level, where they lie on the other
    and an edge of theirs shows a step there (a line far from any step moves nothing). Pure."""
    n, out = u.shape[0], u.copy()
    if not len(segs):
        return out
    a, d = segs[:, :2], segs[:, 2:4] - segs[:, :2]
    l2 = np.maximum((d * d).sum(1), 1e-12)
    lo, hi = segs[:, :2].min(0), segs[:, :2].max(0)
    lo, hi = np.minimum(lo, segs[:, 2:4].min(0)) - NEAR_M, np.maximum(hi, segs[:, 2:4].max(0)) + NEAR_M
    i0, i1 = max(math.ceil((lo[0] - x0) / cell), 0), min(math.floor((hi[0] - x0) / cell), n - 1)
    j0, j1 = max(math.ceil((lo[1] - y0) / cell), 0), min(math.floor((hi[1] - y0) / cell), n - 1)
    for j in range(j0, j1 + 1):
        for i in range(i0, i1 + 1):
            p = np.array((x0 + i * cell, y0 + j * cell))
            t = np.clip(((p - a) * d).sum(1) / l2, 0.0, 1.0)
            dist = np.hypot(*(a + t[:, None] * d - p).T)
            k = int(dist.argmin())
            # (past a line's end nothing: a corner taken up there stood as a tooth over the cell the line doesn't reach)
            if dist[k] >= NEAR_M or (t[k] in (0.0, 1.0) and _line_end(segs, a[k] + t[k] * d[k])):
                continue
            low = segs[k, 4] + t[k] * (segs[k, 5] - segs[k, 4])
            high = segs[k, 6] + t[k] * (segs[k, 7] - segs[k, 6])
            if high - low < MIN_STEP_M:
                continue
            mid = (low + high) / 2
            front = float((p - (a[k] + t[k] * d[k])) @ segs[k, 8:10]) > 0.0
            if front == (u[j, i] < mid):
                continue                    # (on its own side's level)
            near = [u[jj, ii] for jj, ii in ((j - 1, i), (j + 1, i), (j, i - 1), (j, i + 1)) if 0 <= jj < n and 0 <= ii < n]
            if any((z < mid) != (u[j, i] < mid) for z in near):
                out[j, i] = low if front else high
    return out


def _lines(a, b, origin, cell, n):
    """The lattice lines k (of n) between coordinates a and b, with the share of the way from a to b there. Half open, so a
    line through a joint of two segments counts once. Pure."""
    lo, hi = min(a, b), max(a, b)
    if lo == hi:
        return []
    first = max(math.ceil((lo - origin) / cell), 0)
    return [(k, (origin + k * cell - a) / (b - a)) for k in range(first, n) if origin + k * cell < hi]


def _crossings(segs, u, x0, y0, cell):
    """Where the lines cross a lattice edge whose corners lie on two levels: {(0, i, j): edge (i, j)-(i + 1, j), or (1, i, j): edge
    (i, j)-(i, j + 1): (share of the edge, low, high)}. u (n, n): the lattice's heights, [j northwards, i eastwards]. Pure."""
    n, out = u.shape[0], {}

    def add(key, z0, z1, f, low, high):
        mid = (low + high) / 2
        if high - low >= MIN_STEP_M and min(z0, z1) < mid <= max(z0, z1):
            out.setdefault(key, (float(np.clip(f, EDGE_KEEP, 1.0 - EDGE_KEEP)), low, high))

    def edges_at(s):                # (a line through a corner crosses the edges on both sides of it: one has the step)
        return {k for k in (math.floor(s - EDGE_KEEP), math.floor(s + EDGE_KEEP)) if 0 <= k < n - 1}
    for ax, ay, bx, by, la, lb, ha, hb, _tx, _ty in segs.tolist():
        for j, t in _lines(ay, by, y0, cell, n):
            s = (ax + t * (bx - ax) - x0) / cell
            for i in edges_at(s):
                add((0, i, j), u[j, i], u[j, i + 1], s - i, la + t * (lb - la), ha + t * (hb - ha))
        for i, t in _lines(ax, bx, x0, cell, n):
            s = (ay + t * (by - ay) - y0) / cell
            for j in edges_at(s):
                add((1, i, j), u[j, i], u[j + 1, i], s - j, la + t * (lb - la), ha + t * (hb - ha))
    return out


def _edges(i, j):
    """A cell's edges counter-clockwise from its south one, as _crossings' keys. Pure."""
    return (0, i, j), (1, i + 1, j), (0, i, j + 1), (1, i, j)


def _corners(i, j):
    """A cell's corners (j, i) counter-clockwise from its south-west one: edge k runs from corner k to corner k + 1. Pure."""
    return (j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i)


def _high_corners(u, cross, i, j):
    """Which of cell (i, j)'s corners lie on the upper level, or None when the cell isn't cut: exactly two of its edges crossed,
    the very ones between its low and high corners. Pure."""
    keys = [e for e in _edges(i, j) if e in cross]
    if len(keys) != 2:
        return None
    level = sum(cross[e][1] + cross[e][2] for e in keys) / 4
    high = [bool(u[c] >= level) for c in _corners(i, j)]
    mixed = [e for k, e in enumerate(_edges(i, j)) if high[k] != high[(k + 1) % 4]]
    return high if mixed == keys else None


def _fan(poly):
    """Triangles of a convex polygon (its vertices' indices in order). Pure."""
    return [[poly[0], poly[k], poly[k + 1]] for k in range(1, len(poly) - 1)]


def cut(u, x0, y0, cell, lines, open_cells=None):
    """The lattice's cells along lines (see _segments) drawn apart. u (n, n): the heights, [j northwards, i eastwards], its
    vertex (i, j) at index j * n + i; open_cells: per cell [j * (n - 1) + i], False: none there (a tunnel's hole), left alone.
    Returns a Cut: u: the heights to draw (_snap); P (m, 3): new vertices, to go after the lattice's n * n; cells (c,): the cells
    these replace, by that index; T (t, 3): their triangles counter-clockwise from their front, indices into lattice + P;
    owner (t,): each one's cell, by that index; lift (m,): m a new vertex's texture lies up the tile (a skirt's height: straight
    down from one point of the texture it drew as streaks). Pure."""
    n = u.shape[0]
    box = (x0 - cell, y0 - cell, x0 + (n - 1) * cell + cell, y0 + (n - 1) * cell + cell)
    segs = _segments(lines, box)
    u = _snap(u, segs, x0, y0, cell)
    cross = _crossings(segs, u, x0, y0, cell)
    cells = {}
    for kind, a, b in cross:
        for i, j in (((a, b), (a, b - 1)) if kind == 0 else ((a, b), (a - 1, b))):
            if 0 <= i < n - 1 and 0 <= j < n - 1 and (i, j) not in cells and \
                    (open_cells is None or open_cells[j * (n - 1) + i]):
                cells[(i, j)] = _high_corners(u, cross, i, j)
    cells = {c: h for c, h in cells.items() if h is not None}
    points, lift, made = [], [], {}

    def at(key):
        """The vertices of a crossing: low, high, then again for the skirt (its own normals: no slope smoothed over the step)."""
        if key not in made:
            kind, a, b = key
            f, low, high = cross[key]
            x, y = (x0 + (a + f) * cell, y0 + b * cell) if kind == 0 else (x0 + a * cell, y0 + (b + f) * cell)
            made[key] = [n * n + len(points) + k for k in range(4)]
            points.extend([(x, y, low), (x, y, high), (x, y, low), (x, y, high)])
            lift.extend([0.0, 0.0, 0.0, high - low])
        return made[key]
    tris, owner, order = [], [], sorted(cells)
    for c, (i, j) in enumerate(order):
        new = _cell_triangles(u, cells, i, j, n, at)
        tris.extend(new)
        owner.extend([c] * len(new))
    return Cut(u, np.array(points, np.float64).reshape(-1, 3), np.array([j * (n - 1) + i for i, j in order], np.int64),
               np.array(tris, np.int64).reshape(-1, 3), np.array(owner, np.int64), np.array(lift, np.float64))


def _cell_triangles(u, cells, i, j, n, at):
    """A cut cell's triangles: its low part, its high part, the skirt between them along the line, and toward a neighbour that
    keeps the ramp the gap between that ramp and this step. at(edge key): a crossing's vertices. Pure but for at."""
    high, corners, edges = cells[(i, j)], _corners(i, j), _edges(i, j)
    index = [a * n + b for a, b in corners]
    low_part, high_part, rise, fall, out = [], [], None, None, []
    for k in range(4):
        (high_part if high[k] else low_part).append(index[k])
        if high[k] != high[(k + 1) % 4]:
            v = at(edges[k])
            low_part.append(v[0])
            high_part.append(v[1])
            if high[k]:
                fall = v
            else:
                rise = v
            near = ((i, j - 1), (i + 1, j), (i, j + 1), (i - 1, j))[k]
            if 0 <= near[0] < n - 1 and 0 <= near[1] < n - 1 and near not in cells:
                # (under the ramp, seen from this cell; over it, on the upper level's side, from the neighbour)
                if high[k]:
                    out += [[index[(k + 1) % 4], v[2], index[k]], [v[2], v[3], index[k]]]
                else:
                    out += [[index[k], index[(k + 1) % 4], v[2]], [v[2], index[(k + 1) % 4], v[3]]]
    out += _fan(low_part) + _fan(high_part)
    # (walking the cell counter-clockwise the low part lies left of rise -> fall: the skirt faces it)
    out += [[rise[2], rise[3], fall[3]], [rise[2], fall[3], fall[2]]]
    return out
