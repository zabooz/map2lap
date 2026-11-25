"""Free lateral space above the collision road in an AI spline cross section."""
import sys

import numpy as np

from app import paths
from track import editorinfo, obj_to_kn5

if paths.ENGINE not in sys.path:
    sys.path.insert(0, paths.ENGINE)
import acgrid

BUILT = ("1ROAD_deck", "1ROAD_stitch")
BLOCKERS = ("1KERB_walkcol_", "1WALL_")
# Clearance for the body of a road car. A high van needs more; a tunnel ceiling above this stays passable.
CAR_HEIGHT = 2.0
# OBJ tile/deck joins rounded separately can leave millimetre slits. Five millimetres is below a
# tyre contact patch; wider discontinuities still interrupt the floor. Never weld obstacle gaps.
ROAD_SEAM = 0.005


def _swept_polygons(points, along, reach):
    """Across/height polygons of triangles clipped to the longitudinal reach on both sides. Pure."""
    # Project the part of each triangle inside the longitudinal sweep. Include even a thin pole
    # midway between stored points. Polygon vertices follow their original triangle edges.
    following = np.roll(along, -1, axis=1)
    steps = following - along
    first = np.divide(-reach - along, steps, out=np.zeros_like(steps), where=steps != 0)
    last = np.divide(reach - along, steps, out=np.ones_like(steps), where=steps != 0)
    entry = np.maximum(0., np.minimum(first, last))
    leave = np.minimum(1., np.maximum(first, last))
    keep = (entry <= leave) & ((steps != 0) | (np.abs(along) <= reach))
    edge = np.roll(points, -1, axis=1) - points
    vertices = (points[:, :, None, :] + np.stack((entry, leave), axis=2)[:, :, :, None] * edge[:, :, None, :])
    vertices = vertices.reshape(-1, 6, 2)
    keep = np.repeat(keep, 2, axis=1)
    # Pack clipped vertices in order, padding the polygon with its last vertex.
    order = np.argsort(~keep, axis=1, stable=True)
    order = np.take_along_axis(order, np.minimum(np.arange(6), keep.sum(axis=1)[:, None] - 1), axis=1)
    return np.take_along_axis(vertices, order[:, :, None], axis=1)



def _cuts(triangles, centre, side, reach=0., grade=0., limits=None):
    """Cut nearby triangles in the transverse plane into polygons in (across, height above centre). Pure."""
    delta = triangles - centre
    along = delta[:, :, 2] * side[0] - delta[:, :, 0] * side[1]
    hit = (along.min(axis=1) <= reach) & (along.max(axis=1) >= -reach)
    across = delta[:, :, 0] * side[0] + delta[:, :, 2] * side[1]
    if limits is not None:
        hit &= (across.min(axis=1) <= limits[0]) & (across.max(axis=1) >= -limits[1])
    if not hit.any():
        return np.empty((0, 6 if reach else 3, 2))
    along = along[hit]
    points = np.stack((across[hit], delta[:, :, 1][hit] - along * grade), axis=2)
    if reach:
        return _swept_polygons(points, along, reach)
    # A wall can lie exactly in this plane. Keep its entire triangle in that case.
    flat = (along == 0).all(axis=1)
    coplanar = points[flat]
    if len(coplanar):
        points, along = points[~flat], along[~flat]
    following = np.roll(along, -1, axis=1)
    # Include a lone vertex touching the plane from either side.
    crosses = (along < 0) != (following < 0)
    positive = ~crosses.any(axis=1)
    crosses[positive] = (along[positive] > 0) != (following[positive] > 0)
    row, edge = np.nonzero(crosses)
    k = (edge + 1) % 3
    t = along[row, edge] / (along[row, edge] - following[row, edge])
    cuts = (points[row, edge] + t[:, None] * (points[row, k] - points[row, edge])).reshape(-1, 2, 2)
    polygons = cuts[:, [0, 1, 0]]
    return np.concatenate((polygons, coplanar)) if len(coplanar) else polygons


def _upper_faces(floors):
    """Intervals of the exposed road top across the section, including changes between overlapping faces. Pure."""
    left, right = floors[:, :, 0].argmin(axis=1), floors[:, :, 0].argmax(axis=1)
    row = np.arange(len(floors))
    a, ya = floors[row, left].T
    b, yb = floors[row, right].T
    valid = b > a
    a, b, ya, yb = a[valid], b[valid], ya[valid], yb[valid]
    slope = (yb - ya) / (b - a)
    intercept = ya - a * slope
    order = np.argsort(a)
    if np.all(b[order[:-1]] <= a[order[1:]]):
        # Most terrain sections have one exposed surface, with no overlapping decks.
        yield from zip(a, b, slope, intercept)
        return
    i, j = np.triu_indices(len(a), 1)
    overlap = (a[i] < b[j]) & (a[j] < b[i]) & (slope[i] != slope[j])
    i, j = i[overlap], j[overlap]
    cross = (intercept[j] - intercept[i]) / (slope[i] - slope[j])
    cross = cross[(cross > np.maximum(a[i], a[j])) & (cross < np.minimum(b[i], b[j]))]
    ends = np.unique(np.r_[a, b, cross])
    for start, end in zip(ends, ends[1:]):
        # Adjacent faces share their KN5 edge; opposite interpolation orders can leave a numerical slit.
        if end - start < 1e-9:
            continue
        mid = (start + end) / 2
        active = (a <= mid) & (mid <= b)
        if active.any():
            top = np.argmax(np.where(active, mid * slope + intercept, -np.inf))
            yield start, end, slope[top], intercept[top]


def _body_intervals(u, above):
    """Across limits of obstacle polygons between the exposed road and car roof. Pure."""
    # Clip each obstacle cross section to the slab between this road face and the car roof.
    # The extrema are vertices inside the slab or intersections of an edge with floor or roof.
    inside = (above >= -1e-6) & (above <= CAR_HEIGHT)
    left = np.where(inside, u, np.inf).min(axis=1)
    right = np.where(inside, u, -np.inf).max(axis=1)
    if inside.all():
        return left, right
    dy = np.roll(above, -1, axis=1) - above
    du = np.roll(u, -1, axis=1) - u
    for plane in (0., CAR_HEIGHT):
        t = np.divide(plane - above, dy, out=np.full_like(dy, np.inf), where=dy != 0)
        cut = (t >= 0) & (t <= 1)
        pos = u + np.where(cut, t, 0) * du
        left = np.minimum(left, np.where(cut, pos, np.inf).min(axis=1))
        right = np.maximum(right, np.where(cut, pos, -np.inf).max(axis=1))
    return left, right


def built_span(patch, centre, side):
    """Width of the deck or stitch carrying the car, independent of surrounding ground. Pure."""
    levels = obj_to_kn5.road_levels(patch.built, centre[0], centre[2])
    if not any(abs(level - centre[1]) < ROAD_SEAM for level in levels):
        return None
    span = obj_to_kn5._containing_span(obj_to_kn5._road_intervals(patch.built, centre, side, own_level=True),
                                       join_tol=ROAD_SEAM)
    if span is None or not len(patch.built_edges):
        return span
    # A skew deck end crosses the road diagonally. Across that end the car rests partly on the
    # approach road. Only a longitudinal deck edge bounds lateral travel there.
    edges = patch.built_edges - centre
    across = edges[:, :, [0, 2]] @ side
    along = edges[:, :, [0, 2]] @ np.array([-side[1], side[0]])
    delta = along[:, 1] - along[:, 0]
    transverse = abs(across[:, 1] - across[:, 0]) > abs(delta)
    cuts = transverse & (along.min(axis=1) <= 0) & (along.max(axis=1) >= 0) & (delta != 0)
    t = -along[cuts, 0] / delta[cuts]
    distance = across[cuts, 0] + t * (across[cuts, 1] - across[cuts, 0])
    height = edges[cuts, 0, 1] + t * (edges[cuts, 1, 1] - edges[cuts, 0, 1])
    same_level = abs(height) < obj_to_kn5.LEVEL_GAP_M
    open_left = np.any(same_level & (abs(distance - span[0]) < ROAD_SEAM))
    open_right = np.any(same_level & (abs(distance - span[1]) < ROAD_SEAM))
    return (-np.inf if open_left else span[0], np.inf if open_right else span[1])


def floor_sections(patch, centre, side):
    """Transverse road-triangle sections touching the driving level. Pure."""
    floors = _cuts(patch.floor, centre, side)
    gap = obj_to_kn5.LEVEL_GAP_M
    return floors[(floors[:, :, 1].min(axis=1) < gap) & (floors[:, :, 1].max(axis=1) > -gap)]


def _floor_interval(floors, tolerance):
    across = floors[:, :, 0]
    return obj_to_kn5._containing_span(zip(across.min(axis=1), across.max(axis=1)), join_tol=tolerance)


def floor_span(patch, centre, side, tolerance):
    """Connected floor interval, using the same prepared faces as the obstacle sweep. Pure."""
    return _floor_interval(floor_sections(patch, centre, side), tolerance)


def _clip_half_plane(poly, distance):
    """Clip a convex polygon to the nonnegative side of its vertices' signed distances. Pure."""
    if np.all(distance >= 0):
        return poly
    if np.all(distance < 0):
        return poly[:0]
    result = []
    for i, d in enumerate(distance):
        if (distance[i-1] < 0) != (d < 0):
            t = distance[i-1] / (distance[i-1] - d)
            result.append(poly[i-1] + t * (poly[i] - poly[i-1]))
        if d >= 0:
            result.append(poly[i])
    return np.asarray(result)


def _outside_triangle(poly, triangle):
    """Pieces of a convex footprint outside a deck face in the horizontal plane. Pure."""
    a, b, c = triangle
    edges = np.roll(triangle, -1, axis=0) - triangle
    winding = np.sign((b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]))
    if winding == 0:
        return [poly]
    outside = []
    for start, (dx, dz) in zip(triangle, edges):
        delta = poly - start
        distance = winding * (dx*delta[:, 1] - dz*delta[:, 0])
        # Cutting neighbouring faces in opposite orders can leave a floating-point sliver.
        distance += 1e-10 * np.hypot(dx, dz)
        if np.any(distance < 0):
            outside.append(_clip_half_plane(poly, -distance))
            poly = _clip_half_plane(poly, distance)
            if not len(poly):
                break
    return outside


def exposed_barriers(patch, centre, side, reach, grade, width):
    """Barriers in the swept car footprint, excluding slab faces demonstrably under its supporting deck. Pure."""
    forward = np.array([-side[1], side[0]])
    def project(faces):
        delta = faces - centre
        along = delta[:, :, [0, 2]] @ forward
        return np.stack((along, delta[:, :, [0, 2]] @ side, delta[:, :, 1] - along*grade), axis=2)

    deck = project(np.concatenate([pos[faces] for _, pos, _, faces in patch.built.values()]))
    slab = project(patch.barriers)
    bounds = np.array([reach, width])
    def nearby(triangles):
        return ((triangles[:, :, :2].min(axis=1) <= bounds) &
                (triangles[:, :, :2].max(axis=1) >= -bounds)).all(axis=1)

    # Only the deck at car level can shield an obstacle. A ceiling over a lower road cannot.
    deck = deck[nearby(deck) & (abs(deck[:, :, 2]).max(axis=1) < obj_to_kn5.LEVEL_GAP_M)]
    exposed = nearby(slab)
    for i in np.flatnonzero(exposed & (slab[:, :, 2].max(axis=1) < 0)):
        covers = deck[deck[:, :, 2].min(axis=1) > slab[i, :, 2].max()]
        footprint = slab[i, :, :2]
        for axis, bound in enumerate(bounds):
            footprint = _clip_half_plane(footprint, bound - footprint[:, axis])
            footprint = _clip_half_plane(footprint, bound + footprint[:, axis])
        parts = [footprint] if len(footprint) else []
        for face in covers:
            parts = [piece for part in parts for piece in _outside_triangle(part, face[:, :2])]
            if not parts:
                break
        exposed[i] = bool(parts)
    return patch.barriers[exposed]


def free_span(patch, centre, side, reach=0., grade=0., *, limits=None, barriers=None):
    """Contiguous road width through centre, clipped by obstacles touching the vehicle above that road. Pure."""
    if barriers is None:
        barriers = patch.barriers
    obstacles = _cuts(barriers, centre, side, reach, grade, limits) if len(barriers) else ()
    deck = built_span(patch, centre, side) if patch.built else None
    lo, hi = (-np.inf, np.inf) if deck is None else deck
    if limits is not None:
        lo, hi = max(lo, -limits[1]), min(hi, limits[0])
    floors = floor_sections(patch, centre, side)
    span = _floor_interval(floors, 1e-9)
    if span is None:
        return None
    lo, hi = max(lo, span[0]), min(hi, span[1])
    if not len(obstacles):
        return lo, hi
    x, y = obstacles.transpose(2, 0, 1)
    xmin, xmax = x.min(axis=1), x.max(axis=1)
    # A bridge slab above buried terrain is below the driving surface on the deck.
    for a, b, slope, intercept in _upper_faces(floors):
        if b < lo or a > hi:
            continue
        hits = (xmin <= min(b, hi)) & (xmax >= max(a, lo))
        if not hits.any():
            continue
        u = x[hits]
        above = y[hits] - (intercept + u * slope)
        left, right = _body_intervals(u, above)
        for first, last in zip(np.maximum(left, a), np.minimum(right, b)):
            if last < first:
                continue
            if first <= 0 <= last:
                return None
            if last < 0:
                lo = max(lo, last)
            else:
                hi = min(hi, first)
    return lo, hi


def corner_stations(edges, centre, forward, side, reach, widths, *, raster=False):
    """Stations of road outline vertices and overlapping junction corners within a chord's width. Pure."""
    if not len(edges):
        return ()
    delta = edges[:, :, [0, 2]] - centre
    t, u = delta @ forward, delta @ side
    near = ((t.min(axis=1) < reach) & (t.max(axis=1) > -reach)
            & (u.min(axis=1) < widths[0]) & (u.max(axis=1) > -widths[1]))
    if not near.any():
        return ()
    t, u = t[near], u[near]
    if raster:
        # A ground tile is a tessellated heightfield. Its own boundary edges meet only at vertices.
        inside = (abs(t) < reach) & (u < widths[0]) & (u > -widths[1])
        return np.unique(t[inside])
    corners = t.ravel()
    # Two overlapping ribbons form a pavement corner at the intersection of their edges.
    # Edges perpendicular to the chord already contribute their station via their vertices.
    dt = t[:, 1] - t[:, 0]
    sloped = dt != 0
    t, u = t[sloped], u[sloped]
    slopes = (u[:, 1]-u[:, 0]) / dt[sloped]
    intercept = u[:, 0] - slopes*t[:, 0]
    a, b = np.triu_indices(len(slopes), 1)
    different = slopes[a] != slopes[b]
    a, b = a[different], b[different]
    cross = (intercept[b]-intercept[a]) / (slopes[a]-slopes[b])
    lo, hi = t.min(axis=1), t.max(axis=1)
    crossing = (cross > np.maximum(lo[a], lo[b])) & (cross < np.minimum(hi[a], hi[b]))
    stations = np.r_[corners, cross[crossing]]
    return np.unique(stations[(stations > -reach) & (stations < reach)])


def _flanks(along, across, width, reach):
    """Whether wider connected ground brackets a gap at the requested transverse offset. Pure."""
    # Project every real boundary inside the requested half-strip onto the line.
    # Their connected interval through this station is the length for which the
    # floor fails to cover the whole width, even if an oblique outer tyre ray has
    # already re-entered the road. Outside both ends the full width is supported.
    tol = 1e-8  # Different projections of a shared vertex must still meet.
    u, v = across.T
    inside = (np.minimum(u, v) < width-tol) & (np.maximum(u, v) > 0)
    if not inside.any():
        return False
    u, v = u[inside], v[inside]
    t, end = along[inside].T
    du = v-u
    enter = np.divide(-u, du, out=np.zeros_like(u), where=du != 0)
    leave = np.divide(width-u, du, out=np.ones_like(u), where=du != 0)
    first = t + (end-t)*np.clip(enter, 0, 1)
    last = t + (end-t)*np.clip(leave, 0, 1)
    intervals = sorted(zip(np.minimum(first, last), np.maximum(first, last)))
    left, right = intervals[0]
    for a, b in intervals[1:]:
        if a > right+tol:
            if right >= -tol:
                break
            left = a
        right = max(b, right)
    if left > tol or right < -tol or right-left > reach+tol:
        return False
    # The centre itself must stay on the same floor between both flanks.
    crossed = (np.minimum(u, v) <= 0) & (du != 0)
    centre = t[crossed] + (end[crossed]-t[crossed])*enter[crossed]
    return not np.any((centre >= left-tol) & (centre <= right+tol))


def tracking_widths(patch, point, side, widths, limits, *, refine=False, sweep=0.):
    """Ground widths usable for tracking reserve at this heading. Hard collision widths stay physical. Pure."""
    # Broader floor must resume across at most one cell, including its diagonal.
    # Only half a default cell (1 m) of the 1.5 m tracking margin may cross a tooth.
    # At least 1.5 m of real floor remains alongside a car requiring 2.5 m clearance.
    reach = patch.tooth_length
    depth = 1.
    if not patch.raster or not len(patch.edges) or all(w >= limit for w, limit in zip(widths, limits)):
        return widths
    delta = patch.edges - point
    horizontal = delta[:, :, [0, 2]]
    along = horizontal @ np.array([-side[1], side[0]])
    across = horizontal @ side
    near = ((along.min(axis=1) <= reach) & (along.max(axis=1) >= -reach)
            & (delta[:, :, 1].min(axis=1) < obj_to_kn5.LEVEL_GAP_M)
            & (delta[:, :, 1].max(axis=1) > -obj_to_kn5.LEVEL_GAP_M))
    if not near.any():
        return widths
    along, across = along[near], across[near]
    # A swept wall or raised walk remains hard even when part of it overhangs
    # a raster tooth. Do not smooth that side through its longitudinal section.
    walls = _cuts(patch.barriers, point, side, sweep) if len(patch.barriers) else ()
    result = list(widths)
    for j, sign in enumerate((1, -1)):
        raw = widths[j]
        high = min(limits[j], raw + depth)
        if high <= raw:
            continue
        if len(walls):
            across_walls = sign*walls[:, :, 0]
            if np.any((across_walls.min(axis=1) <= high) & (across_walls.max(axis=1) >= 0)):
                continue
        if _flanks(along, sign*across, high, reach):
            result[j] = high
        elif refine:
            # Resolve the offset bound only to the source route's centimetre precision.
            low = raw
            while high-low > .01:
                mid = (low+high)/2
                if _flanks(along, sign*across, mid, reach):
                    low = mid
                else:
                    high = mid
            result[j] = low
    return result


def boundary_edges(faces, *, with_opposite=False):
    """Boundary vertex pairs, optionally with their incident face's third vertex. Pure."""
    edges = np.sort(np.stack((faces, np.roll(faces, -1, axis=1)), axis=2), axis=2).reshape(-1, 2)
    stride = int(faces.max()) + 1
    keys = edges[:, 0].astype(np.int64) * stride + edges[:, 1]
    _, first, count = np.unique(keys, return_index=True, return_counts=True)
    first = first[count == 1]
    if with_opposite:
        return edges[first], faces[first // 3, (first + 2) % 3]
    return edges[first]


def _cross_xz(a, b):
    """Signed horizontal cross product of two XYZ vectors. Pure."""
    return a[0] * b[2] - a[2] * b[0]


def tile_end_rows(pos, pairs, opposite):
    """Centred road ends at tile boundaries, ordered with the adjoining face left of the first ray. Pure."""
    ends = pos[pairs]
    incident = {}
    for i in (0, 1):
        on_border = (np.remainder(ends[:, i, [0, 2]], editorinfo.TILE_M) == 0).any(axis=1)
        for k in np.flatnonzero(on_border):
            origin, tip = ends[k, i], ends[k, 1 - i]
            rays = incident.setdefault(tuple(origin), {})
            key = tuple(tip)
            # KN5 has duplicate vertices at UV/normal splits. A twice-seen geometric edge is internal.
            rays[key] = None if key in rays else opposite[k]
    for origin, rays in incident.items():
        rim = [(tip, face) for tip, face in rays.items() if face is not None]
        if len(rim) != 2:
            continue
        tips = np.array([tip for tip, _ in rim]) - origin
        if np.linalg.norm(tips[0] + tips[1]) > ROAD_SEAM:
            continue
        inside = _cross_xz(tips[0], pos[rim[0][1]] - origin)
        if inside * _cross_xz(tips[1], pos[rim[1][1]] - origin) < 0:
            yield origin, tips if inside > 0 else tips[::-1]


def seam_triangles(rows, half_width):
    """AI-only floor across a split ribbon's shared centre where the end rows rotate slightly. Pure."""
    # Two centimetres across the joint is about a tyre tread block. Limit the actual
    # opening even at the shoulder; wide slots or separate deck ends must stay open.
    tread = 0.02
    for centre, ends in rows.items():
        if len(ends) != 2:
            continue
        entry, exit = ends[0], ends[1][::-1]
        gaps = np.linalg.norm(exit - entry, axis=1)
        radii = np.linalg.norm(entry, axis=1)
        # Opposing face interiors, matching half widths, and almost parallel end rows.
        # A junction/fork whose two tangents diverge by a tread within the car is ambiguous.
        if (np.any(abs(radii - np.linalg.norm(exit, axis=1)) > ROAD_SEAM)
                or np.any(gaps * half_width > tread * radii)):
            continue
        for i, (a, b, gap) in enumerate(zip(entry, exit, gaps)):
            # One side of a rotated join already overlaps. Only the opening needs a face.
            if gap and (1 if i == 0 else -1) * _cross_xz(a, b) < 0:
                scale = min(1., tread / gap)
                yield np.array([centre, centre + scale * a, centre + scale * b])


def boundary_stations(edges, centre, forward, side, reach, width, *, corners=False):
    """Offsets along a chord where road boundaries enter or leave the car's swept strip. Pure."""
    if not len(edges):
        return ()
    delta = edges[:, :, [0, 2]] - centre
    u = delta @ side
    t = delta @ forward
    hit = ((u.min(axis=1) < width) & (u.max(axis=1) > -width)
           & (t.min(axis=1) < reach) & (t.max(axis=1) > -reach))
    if not hit.any():
        return ()
    u, t = u[hit], t[hit]
    du = u[:, 1] - u[:, 0]
    a = np.divide(-width - u[:, 0], du, out=np.zeros_like(du), where=du != 0)
    b = np.divide(width - u[:, 0], du, out=np.ones_like(du), where=du != 0)
    portion = np.column_stack((np.minimum(a, b), np.maximum(a, b))).clip(0., 1.)
    ends = t[:, :1] + portion * (t[:, 1:] - t[:, :1])
    inside = ends[(ends > -reach) & (ends < reach)]
    # A gap can be much shorter than one sample. Its open interval is visible halfway between its two edges.
    cuts = np.unique(np.r_[-reach, inside, reach])
    midpoints = ((cuts[:-1] + cuts[1:]) / 2)[np.diff(cuts) > ROAD_SEAM]
    # The floor can be narrowest at a single raster vertex inside an otherwise
    # shallow tooth. Test that extremum as well before spending tracking reserve.
    return np.unique(np.r_[midpoints, inside]) if corners else midpoints
