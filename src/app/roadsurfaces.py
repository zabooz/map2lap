"""Source road surfaces and scoped vertex corrections for smoothing bridges and tunnel portals."""
import math

import numpy as np

from app import trackband, trackheights
from track import editorinfo, kn5, objectlist

# The mapped road edge can lie a few decimetres outside its triangulated deck (A2 Völkermarkt: 18 cm).
# The kerb overlaps the asphalt by 15 cm; beyond half a metre there is no reliable deck edge to extend.
KERB_DECK_REACH_M = 0.5


def structures(net, x, z, extra=0):
    """The nearest mapped segment's structure type, within its road width. Pure."""
    distance = np.full(np.broadcast_shapes(np.shape(x), np.shape(z)), np.inf)
    result = np.zeros(distance.shape, np.uint8)
    for edge in net['segments']:
        a, b = np.asarray(edge['a']), np.asarray(edge['b'])
        v = b - a
        t = ((x - a[0]) * v[0] + (z - a[1]) * v[1]) / (v @ v)
        d = np.hypot(x - a[0] - np.clip(t, 0, 1) * v[0], z - a[1] - np.clip(t, 0, 1) * v[1])
        on = ((d < distance) | ((d <= distance + 1e-8) & bool(edge.get('structure')))) & (d <= edge['width'] / 2 + extra)
        distance[on] = d[on]
        result[on] = {'bridge': 1, 'tunnel': 2}.get(edge.get('structure'), 0)
    return result


def _top_triangles(path, scan, moved=None, bounds=None, include_skins=False):
    """Upward deck/floor triangles in source order; include_skins also supplies their visible road overlays."""
    with open(path, 'rb') as f:
        for i, mesh in enumerate(scan['meshes']):
            floor = mesh['name'].startswith(('1ROAD_deck', '1WALL_deck_con'))
            skin = include_skins and mesh['name'].startswith('nocol_road_')
            if not (floor or skin):
                continue
            if bounds is not None:
                at = np.asarray(mesh['center'])[[0, 2]]
                if np.any(at + mesh['radius'] < bounds[0]) or np.any(at - mesh['radius'] > bounds[1]):
                    continue
            vertices, faces = kn5.mesh_arrays(f, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            p = vertices['pos'][faces].astype(np.float64)
            n = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
            # Sides and undersides are collision too; only the upper, driveable face supplies the road height.
            on = (n[:, 1] > 1e-8) & (np.hypot(n[:, 0], n[:, 2]) <= trackband.MAX_GRADE * n[:, 1])
            yield i, np.flatnonzero(on), p[on]


def _plane(triangle, x, z):
    """Barycentric inclusion and height of triangle at x/z. Pure."""
    a, b, c = triangle
    det = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2])
    u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / det
    v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / det
    return (u >= -1e-6) & (v >= -1e-6) & (u + v <= 1 + 1e-6), u * a[1] + v * b[1] + (1 - u - v) * c[1]


def _nearest_deck(triangle, point):
    """Plan distance and height at the nearest point of an upward deck triangle. Pure."""
    inside, height = _plane(triangle, *point)
    if inside:
        return 0.0, float(height)
    best = (float('inf'), 0.0)
    for a, b in zip(triangle, np.roll(triangle, -1, axis=0)):
        way = b[[0, 2]] - a[[0, 2]]
        t = float(np.clip(np.dot(point - a[[0, 2]], way) / max(np.dot(way, way), 1e-12), 0, 1))
        distance = float(np.linalg.norm(point - a[[0, 2]] - t * way))
        if distance < best[0]:
            best = distance, float(a[1] + t * (b[1] - a[1]))
    return best


def bridge_at(path, scan, point):
    """True/False if a deck lies at x/z, matched against clicked [x,z,y]; None away from decks."""
    x, z, y = point
    bounds = np.array([[x - 0.1, z - 0.1], [x + 0.1, z + 0.1]])
    heights = []
    for i, _faces, triangles in _top_triangles(path, scan, bounds=bounds):
        if not scan['meshes'][i]['name'].startswith('1ROAD_deck'):
            continue
        near = triangles[((triangles[:, :, [0, 2]].min(axis=1) <= [x, z])
                          & (triangles[:, :, [0, 2]].max(axis=1) >= [x, z])).all(axis=1)]
        for triangle in near:
            inside, height = _plane(triangle, x, z)
            if inside:
                heights.append(float(height))
    if not heights:
        return None
    # The visible asphalt skin is centimetres above 1ROAD_deck; a road below a
    # crossing deck is metres away. The tolerance also covers imperfect click rays.
    return min(abs(height - y) for height in heights) < 0.2


def deck_heights(path, scan, moved, points, approximate, net):
    """Visible height of the selected bridge road, extending its deck edge by at most KERB_DECK_REACH_M."""
    points = np.asarray(points, np.float64)
    result = np.asarray(approximate, np.float64).copy()
    on_bridge = structures(net, points[:, 0], points[:, 1], extra=2) == 1
    if not on_bridge.any():
        return result
    selected_ids = {edge.get('road') for edge in net['segments'] if edge['structure'] == 'bridge'} - {None}
    best = np.full(len(points), np.inf)
    bounds = np.array([points.min(axis=0) - KERB_DECK_REACH_M, points.max(axis=0) + KERB_DECK_REACH_M])
    for i, faces, triangles in _top_triangles(path, scan, moved, bounds):
        if not scan['meshes'][i]['name'].startswith('1ROAD_deck') or not len(triangles):
            continue
        owners = editorinfo.surface_face_owners(path, scan['meshes'][i]['name'])[faces] if selected_ids else None
        low = triangles[:, :, [0, 2]].min(axis=1)
        high = triangles[:, :, [0, 2]].max(axis=1)
        for k in np.flatnonzero(on_bridge):
            point = points[k]
            near = np.flatnonzero(((low <= point + KERB_DECK_REACH_M)
                                   & (high >= point - KERB_DECK_REACH_M)).all(axis=1))
            for j in near:
                if owners is not None and owners[j] not in selected_ids:
                    continue
                distance, height = _nearest_deck(triangles[j], point)
                if owners is None:
                    # A synthetic or old source without IDs still uses its click-height hint on exact deck faces.
                    distance = abs(height - approximate[k]) if distance < 1e-6 else np.inf
                if distance < min(best[k], KERB_DECK_REACH_M + 1e-6):
                    # roadmesh.DECK_SKIN raises the visible asphalt 1 cm above the collision slab.
                    result[k] = height + 0.01
                    best[k] = distance
    if selected_ids and np.any(on_bridge & ~np.isfinite(best)):
        raise ValueError('Kerb edge is more than 0.5 m from its mapped bridge deck; mark a shorter road stretch')
    return result


def ground(path, scan, moved, bounds, net, driveable_only=False):
    """Selected ground/deck heights on the existing lattice; driveable_only excludes bridge concrete below the road."""
    grid, i0, j0 = trackband._ground(path, scan, moved, bounds, road_only=True)
    x, z = np.meshgrid((np.arange(grid.shape[1]) + i0) * 2, (np.arange(grid.shape[0]) + j0) * 2)
    kind = structures(net, x, z, extra=2)
    if not kind.any():
        return grid, i0, j0
    expected = _expected(net, grid, i0, j0, x, z)
    grid[kind != 0] = np.nan
    best = np.full(grid.shape, np.inf)
    for _i, _faces, triangles in _top_triangles(path, scan, moved, bounds):
        if driveable_only and not scan['meshes'][_i]['name'].startswith('1ROAD_deck'):
            continue
        for triangle in triangles:
            low, high = triangle[:, [0, 2]].min(axis=0), triangle[:, [0, 2]].max(axis=0)
            c0, r0 = np.maximum(np.floor(low / 2).astype(int) - [i0, j0], 0)
            c1, r1 = np.minimum(np.ceil(high / 2).astype(int) - [i0, j0] + 1, grid.shape[::-1])
            if c0 >= c1 or r0 >= r1:
                continue
            part = np.s_[r0:r1, c0:c1]
            inside, height = _plane(triangle, x[part], z[part])
            error = np.abs(height - expected[part])
            on = inside & (kind[part] != 0) & (error < best[part])
            grid[part][on], best[part][on] = height[on], error[on]
    return grid, i0, j0


def _expected(net, ground, i0, j0, x, z):
    """A reference height from clicked elevations and source approaches, used only to choose stacked decks. Pure."""
    samples = []
    for line in net['lines']:
        line = np.asarray(line)
        for point in line:
            for edge in net['segments']:
                if not edge.get('structure') and any(np.linalg.norm(point - p) < 1e-4 for p in (edge['a'], edge['b'])):
                    towards = np.asarray(edge['a']) + np.asarray(edge['b']) - 2 * point
                    length = np.linalg.norm(towards)
                    if length:
                        p = point + towards / length * min(trackband.SLOPE_OVER_M, length / 2)
                        y = trackband._on_grid(ground, i0, j0, p[None])[0]
                        if np.isfinite(y):
                            samples.append((*p, y))
    samples.extend((p[0], p[1], p[2]) for p in net['pins'] if len(p) == 3)
    if not samples:
        raise ValueError('Mark an approach or a point on the bridge/tunnel surface to identify its level')
    # Inverse-distance interpolation is only a level hint. Actual triangle heights, including banking, remain authoritative.
    total, weight = np.zeros(x.shape), np.zeros(x.shape)
    for px, pz, y in samples:
        w = 1 / np.maximum((x - px) ** 2 + (z - pz) ** 2, 1)
        total += w * y
        weight += w
    return total / weight


def selection(path, net):
    """Source deck faces within the selected mapped corridor, for the existing mesh-face highlight."""
    selected = []
    scan = kn5.scan(path)
    points = np.array([p for edge in net['segments'] for p in (edge['a'], edge['b'])])
    bounds = np.array([points.min(axis=0) - 20, points.max(axis=0) + 20])
    grid, i0, j0 = ground(path, scan, None, bounds, net)
    # The opaque floor lies DECK_SKIN below the visible asphalt. Highlight both source layers so the asphalt
    # cannot hide the floor's selection; physics sampling above continues to use collision triangles alone.
    for i, faces, triangles in _top_triangles(path, scan, bounds=bounds, include_skins=True):
        centres = triangles.mean(axis=1)
        on = structures(net, centres[:, 0], centres[:, 2]) != 0
        reference = _reference(centres[:, [0, 2]], net, grid, i0, j0)
        on &= np.abs(reference - centres[:, 1]) <= trackband.CUT_M
        if on.any():
            selected.append({'mesh': i, 'faces': faces[on].tolist()})
    return selected


def _components(points, faces):
    """Connected source pieces, welding coincident material seam vertices. Pure."""
    _places, welded = np.unique(np.round(points, 3), axis=0, return_inverse=True)
    welded = welded.ravel()
    parent = np.arange(len(_places))
    def root(k):
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k
    for a, b, c in welded[faces]:
        first = root(a)
        parent[root(b)] = parent[root(c)] = first
    roots = np.array([root(k) for k in welded])
    order = np.argsort(roots)
    return np.split(order, np.flatnonzero(np.diff(roots[order])) + 1)


def _reference(points, net, grid, i0, j0):
    """Read this network's road height at the nearest mapped station, including beside its edges. Pure."""
    distance, heights = np.full(len(points), np.inf), np.full(len(points), np.nan)
    for edge in net['segments']:
        a, b = np.asarray(edge['a']), np.asarray(edge['b'])
        v = b - a
        t = np.clip((points - a) @ v / (v @ v), 0, 1)
        projected = a + t[:, None] * v
        d = np.linalg.norm(points - projected, axis=1)
        on = d < distance
        heights[on] = trackband._on_grid(grid, i0, j0, projected[on])
        distance[on] = d[on]
    return heights


def _attached(points, faces, net, grid, i0, j0, tops):
    """Source pieces belonging to the selected floor, and pier weights that keep their foundations fixed. Pure."""
    attached, weights = np.zeros(len(points), bool), np.ones(len(points))
    reference = _reference(points[:, [0, 2]], net, grid, i0, j0)
    for component in _components(points, faces):
        p = points[component]
        centre = (p[:, [0, 2]].min(axis=0) + p[:, [0, 2]].max(axis=0)) / 2
        # Read at an actual component vertex: a curved bridge's bounding-box centre can lie outside its deck.
        k = int(np.argmin(np.linalg.norm(p[:, [0, 2]] - centre, axis=1)))
        at = p[k, [0, 2]]
        ref = reference[component[k]]
        if not np.isfinite(ref):
            continue
        near = np.linalg.norm(p[:, [0, 2]] - at, axis=1) <= trackheights.STEP
        low, high = p[near, 1].min(), p[near, 1].max()
        candidates = []
        for triangles, low_box, high_box in tops:
            near = ((low_box <= at + 1e-6) & (high_box >= at - 1e-6)).all(axis=1)
            for triangle in triangles[near]:
                inside, y = _plane(triangle, at[0], at[1])
                if inside:
                    candidates.append(float(y))
        if not candidates:
            continue
        distance = np.maximum(low - np.array(candidates), np.array(candidates) - high)
        chosen = candidates[int(np.argmin(distance))]
        if abs(chosen - ref) > trackband.CUT_M:
            continue
        attached[component] = True
        # A vertical support's foot is a foundation; its top follows the deck. Slabs, rails and trusses shear whole.
        vertical = np.ptp(p[:, 1])
        horizontal = np.ptp(p[:, [0, 2]], axis=0).max()
        if vertical > horizontal and high < chosen - trackband.CUT_M:
            weights[component] = np.clip((p[:, 1] - p[:, 1].min()) / vertical, 0, 1)
    return attached, weights


def scope(path, scan, moved, net, op, built, i0, j0):
    """Split an ordinary raster into terrain motion and explicit source-vertex corrections at selected structures."""
    full = trackheights.Field([op])
    mm = np.asarray(op['mm'], np.int64).reshape(op['nz'], op['nx']).copy()
    x, z = np.meshgrid(op['x'] + np.arange(op['nx']) * 2, op['z'] + np.arange(op['nz']) * 2)
    mm[structures(net, x, z, extra=math.inf) != 0] = 0
    result = {**op, 'mm': mm.ravel().tolist(), 'mesh_offsets': {}}
    terrain = trackheights.Field([result])
    bounds = np.array([[op['x'], op['z']], [op['x'] + 2 * op['nx'], op['z'] + 2 * op['nz']]])
    tops = [(t, t[:, :, [0, 2]].min(axis=1), t[:, :, [0, 2]].max(axis=1))
            for _i, _faces, t in _top_triangles(path, scan, moved, bounds)]
    with open(path, 'rb') as f:
        for i, mesh in enumerate(scan['meshes']):
            kind = objectlist.kind_of(mesh['name'])
            if kind not in trackheights.FOLLOW | {'deck'}:
                continue
            if not full.reaches(mesh['center'], mesh['radius']):
                continue
            vertices, faces = kn5.mesh_arrays(f, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            p = vertices['pos'].astype(np.float64)
            at = structures(net, p[:, 0], p[:, 2], extra=2)
            reference = trackband._on_grid(built, i0, j0, p[:, [0, 2]])
            # Terrain under bridges and over tunnels is independent; its height does not match this road surface.
            # Road skins and kerbs sit within half a metre of it. Taller structures are handled by their own mesh role.
            attached = np.isfinite(reference) & (np.abs(p[:, 1] - reference) <= .5)
            weights = np.ones(len(p))
            if kind != 'ground':
                attached, weights = _attached(p, faces, net, built, i0, j0, tops)
                # A skewed end's corners can project onto the approach side of the map boundary.
                # The connected source piece owns those corners too; masking them by map side opens a driving step.
            wanted = ((at != 0) & attached) if kind == 'ground' else attached
            d, ax, az = full.at(p[:, 0], p[:, 2])
            d, ax, az = d * weights, ax * weights, az * weights
            td, tx, tz = terrain.at(p[:, 0], p[:, 2])
            if kind == 'deck':
                td, tx, tz = np.zeros((3, len(p)))
            stay = np.where(at != 0, 0, td) if kind == 'tunnel' else td
            sx, sz = ((np.where(at != 0, 0, tx), np.where(at != 0, 0, tz)) if kind == 'tunnel' else (tx, tz))
            delta, gx, gz = np.where(wanted, d, stay) - td, np.where(wanted, ax, sx) - tx, np.where(wanted, az, sz) - tz
            touched = (np.abs(delta) >= .0005) | (np.abs(gx) > 1e-8) | (np.abs(gz) > 1e-8)
            if touched.any():
                result['mesh_offsets'][str(i)] = [[int(k), int(round(delta[k] * 1000)), round(float(gx[k]), 7), round(float(gz[k]), 7)]
                                                  for k in np.flatnonzero(touched)]
    return result


def check_clearance(path, scan, moved, net, op, grid, i0, j0):
    """Refuse a new loss of road clearance at an independent crossing level."""
    from roads import LIDAR_HEADROOM_M
    from roadmesh import DECK_DEPTH, GIRDER_D
    x, z = np.meshgrid((np.arange(grid.shape[1]) + i0) * 2, (np.arange(grid.shape[0]) + j0) * 2)
    field = trackheights.Field([op])
    delta = field.at(x, z)[0]
    moving = (structures(net, x, z) != 0) & (np.abs(delta) >= .001) & np.isfinite(grid)
    # Map provenance distinguishes another road from the approach embankment under this same bridge.
    crossing = np.zeros(grid.shape, bool)
    for edge in net.get('crossings', []):
        a, b = np.asarray(edge['a']), np.asarray(edge['b'])
        v = b - a
        t = ((x - a[0]) * v[0] + (z - a[1]) * v[1]) / (v @ v)
        crossing |= ((t >= 0) & (t <= 1) & (np.hypot(x - a[0] - t * v[0], z - a[1] - t * v[1]) <= edge['width'] / 2))
    moving &= crossing
    if not moving.any():
        return
    with open(path, 'rb') as f:
        for i, mesh in enumerate(scan['meshes']):
            if objectlist.kind_of(mesh['name']) not in {'ground', 'deck'} or not field.reaches(mesh['center'], mesh['radius']):
                continue
            vertices, faces = kn5.mesh_arrays(f, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            triangles = vertices['pos'][faces].astype(np.float64)
            normal = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
            triangles = triangles[normal[:, 1] > 1e-8]
            for triangle in triangles:
                low, high = triangle[:, [0, 2]].min(axis=0), triangle[:, [0, 2]].max(axis=0)
                c0, r0 = np.maximum(np.floor(low / 2).astype(int) - [i0, j0], 0)
                c1, r1 = np.minimum(np.ceil(high / 2).astype(int) - [i0, j0] + 1, grid.shape[::-1])
                if c0 >= c1 or r0 >= r1:
                    continue
                part = np.s_[r0:r1, c0:c1]
                if not moving[part].any():
                    continue
                inside, height = _plane(triangle, x[part], z[part])
                separation = grid[part] - height
                on = inside & moving[part] & (np.abs(separation) > trackband.CUT_M)
                # Keep the generator's fine-elevation vehicle headroom plus its ordinary slab/girder allowance.
                # A crossing already tighter than that may improve, but smoothing must not consume more of its gap.
                minimum = np.minimum(np.abs(separation), LIDAR_HEADROOM_M + DECK_DEPTH + GIRDER_D)
                after = (separation + delta[part]) * np.sign(separation)
                if (after[on] < minimum[on] - .001).any():
                    raise ValueError('This smoothing would reduce crossing clearance; reduce strength or mark a different region')
