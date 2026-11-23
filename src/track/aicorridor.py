"""Free lateral space above the collision road in an AI spline cross section."""
import numpy as np

from track import editorinfo, obj_to_kn5

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



def _cuts(triangles, centre, side, reach=0., grade=0.):
    """Cut nearby triangles in the transverse plane into polygons in (across, height above centre). Pure."""
    delta = triangles - centre
    along = delta[:, :, 2] * side[0] - delta[:, :, 0] * side[1]
    hit = (along.min(axis=1) <= reach) & (along.max(axis=1) >= -reach)
    delta, along = delta[hit], along[hit]
    across = delta[:, :, 0] * side[0] + delta[:, :, 2] * side[1]
    points = np.stack((across, delta[:, :, 1] - along * grade), axis=2)
    if reach:
        return _swept_polygons(points, along, reach)
    # A wall can lie exactly in this plane. Keep its entire triangle in that case.
    flat = (along == 0).all(axis=1)
    coplanar = points[flat]
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
    return np.concatenate((cuts[:, [0, 1, 0]], coplanar))


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
    dy = np.roll(above, -1, axis=1) - above
    du = np.roll(u, -1, axis=1) - u
    for plane in (0., CAR_HEIGHT):
        t = np.divide(plane - above, dy, out=np.full_like(dy, np.inf), where=dy != 0)
        cut = (t >= 0) & (t <= 1)
        pos = u + np.where(cut, t, 0) * du
        left = np.minimum(left, np.where(cut, pos, np.inf).min(axis=1))
        right = np.maximum(right, np.where(cut, pos, -np.inf).max(axis=1))
    return left, right


def free_span(patch, centre, side, reach=0., grade=0.):
    """Contiguous road width through centre, clipped by obstacles touching the vehicle above that road. Pure."""
    obstacles = _cuts(patch.barriers, centre, side, reach, grade) if len(patch.barriers) else ()
    if not len(obstacles):
        return obj_to_kn5._containing_span(obj_to_kn5._road_intervals(patch, centre, side, own_level=True))
    floors = _cuts(patch.floor, centre, side)
    gap = obj_to_kn5.LEVEL_GAP_M
    floors = floors[(floors[:, :, 1].min(axis=1) < gap) & (floors[:, :, 1].max(axis=1) > -gap)]
    start = np.min(floors[:, :, 0], axis=1)
    end = np.max(floors[:, :, 0], axis=1)
    span = obj_to_kn5._containing_span(zip(start, end))
    if span is None:
        return None
    lo, hi = span
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


def boundary_stations(edges, centre, forward, side, reach, width):
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
    return ((cuts[:-1] + cuts[1:]) / 2)[np.diff(cuts) > ROAD_SEAM]
