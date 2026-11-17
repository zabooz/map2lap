"""Editor correction for a mapped bridge crossing a ground road, on the retained KN5 source."""
import math

import numpy as np

from app import roadregion, roadsurfaces, trackband, trackheights
from track import kn5, objectlist

RAMP_GRADE = .15  # Default correction limit: 15% is a steep road ramp; the editor can set another limit.


def _route(net):
    """Ordered mapped centreline from the first to the second pin. Pure."""
    links = {}
    for edge in net['segments']:
        a, b = (tuple(edge[key]) for key in ('a', 'b'))
        links.setdefault(a, []).append(b)
        links.setdefault(b, []).append(a)
    ends = [point for point, neighbours in links.items() if len(neighbours) == 1]
    if len(ends) != 2 or any(len(neighbours) > 2 for neighbours in links.values()):
        raise ValueError('Mark one road stretch between two ends')
    first = min(ends, key=lambda p: math.dist(p, net['pins'][0][:2]))
    line, previous = [first], None
    while len(line) < len(links):
        following = [p for p in links[line[-1]] if p != previous]
        if len(following) != 1:
            raise ValueError('The marked road has an ambiguous branch')
        previous = line[-1]
        line.append(following[0])
    return np.asarray(line, np.float64)


def _stations(line):
    """Metres along the mapped line. Pure."""
    return np.r_[0., np.cumsum(np.linalg.norm(np.diff(line, axis=0), axis=1))]


def _project(points, line):
    """Nearest mapped station and distance of AC x/z points. Pure."""
    points = np.asarray(points, np.float64).reshape(-1, 2)
    along = _stations(line)
    station = np.zeros(len(points))
    distance = np.full(len(points), np.inf)
    for k, (a, b) in enumerate(zip(line, line[1:])):
        v = b - a
        t = np.clip((points - a) @ v / (v @ v), 0, 1)
        d = np.linalg.norm(points - (a + t[:, None] * v), axis=1)
        on = d < distance
        station[on], distance[on] = along[k] + t[on] * math.sqrt(v @ v), d[on]
    return station, distance


def _direction(point, line):
    """Unit tangent of the mapped segment nearest one AC x/z point. Pure."""
    best, tangent = math.inf, None
    for a, b in zip(line, line[1:]):
        v = b - a
        t = np.clip((point - a) @ v / (v @ v), 0, 1)
        distance = np.linalg.norm(point - (a + t * v))
        if distance < best:
            best, tangent = distance, v / math.sqrt(v @ v)
    return tangent


def _oriented_owner(points, upper, lower):
    """A connected road strip's mapped road by its long axis; None if unclear. Pure."""
    xy = points[:, [0, 2]]
    centred = xy - xy.mean(axis=0)
    values, vectors = np.linalg.eigh(centred.T @ centred)
    # Bridge asphalt can be only 1.5 times longer than wide near a skew crossing; a cross-shaped join stays ambiguous.
    if values[1] < 1.3 * max(values[0], 1e-8) or values[1] < 1:
        return None
    axis = vectors[:, 1]
    top = abs(axis @ _direction(xy.mean(axis=0), upper))
    bottom = abs(axis @ _direction(xy.mean(axis=0), lower))
    if top > bottom + .4:
        return 'upper'
    if bottom > top + .4:
        return 'lower'
    return None


def _intersections(upper, lower):
    """Mapped centreline crossing points, with stations on each road. Pure."""
    up, down = _stations(upper), _stations(lower)
    found = []
    for i, (a, b) in enumerate(zip(upper, upper[1:])):
        v = b - a
        for j, (c, d) in enumerate(zip(lower, lower[1:])):
            w = d - c
            determinant = v[0] * w[1] - v[1] * w[0]
            if abs(determinant) < 1e-8:
                continue
            q = c - a
            t = (q[0] * w[1] - q[1] * w[0]) / determinant
            u = (q[0] * v[1] - q[1] * v[0]) / determinant
            if 0 < t < 1 and 0 < u < 1:
                point = a + t * v
                if not any(np.linalg.norm(point - old[0]) < 2 for old in found):
                    found.append((point, up[i] + t * math.sqrt(v @ v), down[j] + u * math.sqrt(w @ w)))
    return found


def _deck_height(path, scan, moved, point):
    """One collision deck top at the crossing; stacked or missing decks are ambiguous."""
    x, z = point
    bounds = np.array([[x - 1, z - 1], [x + 1, z + 1]])
    values = []
    for i, _faces, triangles in roadsurfaces._top_triangles(path, scan, moved, bounds):
        if not scan['meshes'][i]['name'].startswith('1ROAD_deck'):
            continue
        for triangle in triangles:
            if (triangle[:, [0, 2]].min(axis=0) <= point).all() and (triangle[:, [0, 2]].max(axis=0) >= point).all():
                inside, height = roadsurfaces._plane(triangle, x, z)
                if inside:
                    values.append(float(height))
    if not values or max(values) - min(values) > .05:
        raise ValueError('The bridge deck at this crossing cannot be identified uniquely')
    return float(np.mean(values))


def describe(path, scan, moved, points):
    """Mapped roads, crossings and their current driveable surface gaps."""
    if not isinstance(points, list) or len(points) not in (2, 4):
        raise ValueError('Mark A and B on the bridge')
    upper = roadregion.mapped(path, points[:2], scan=scan, join_near=True)
    if not any(edge['structure'] == 'bridge' for edge in upper['segments']):
        raise ValueError('The upper road needs an existing mapped bridge')
    above = _route(upper)
    if len(points) == 4:
        lower = roadregion.mapped(path, points[2:], scan=scan, join_near=True)
        if any(edge['structure'] for edge in lower['segments']):
            raise ValueError('The lower road must be on the ground in this first version')
        below = _route(lower)
    else:
        candidates = []
        for edge in upper['crossings']:
            if edge['structure']:
                continue
            line = np.asarray([edge['a'], edge['b']], np.float64)
            for point, upper_s, lower_s in _intersections(above, line):
                if roadsurfaces.structures(upper, np.array([point[0]]), np.array([point[1]]))[0] == 1:
                    candidates.append((edge, line, point, upper_s, lower_s))
        if not candidates:
            raise ValueError('No ground road crosses the marked bridge')
        if len(candidates) != 1:
            raise ValueError('Several ground roads cross here; mark a shorter bridge stretch')
        edge, below, _point, _upper_s, _lower_s = candidates[0]
        lower = {'segments': [edge], 'pins': [edge['a'], edge['b']], 'unselected': [], 'held_junctions': []}
    crossings = _intersections(above, below)
    if not crossings:
        raise ValueError('The marked roads do not cross')
    bounds = np.vstack([below.min(axis=0) - 4, below.max(axis=0) + 4])
    # A marked ground road can have ROAD, GRAVEL or GRASS collision, depending on its surface tags.
    ground, i0, j0 = trackband._ground(path, scan, moved, bounds)
    result = []
    for point, upper_s, lower_s in crossings:
        if roadsurfaces.structures(upper, np.array([point[0]]), np.array([point[1]]))[0] != 1:
            raise ValueError('The crossing is outside the mapped bridge')
        top = _deck_height(path, scan, moved, point)
        bottom = float(trackband._on_grid(ground, i0, j0, point[None])[0])
        if not math.isfinite(bottom):
            raise ValueError('No lower road surface at the crossing')
        result.append({'x': round(float(point[0]), 3), 'z': round(float(point[1]), 3),
                       'upper_s': upper_s, 'lower_s': lower_s, 'upper_y': round(top, 3), 'gap': round(top - bottom, 3)})
    return upper, lower, above, below, result


def _profile(station, length, targets):
    """Smooth zero-ended vertical correction through all crossing targets. Pure."""
    marks = [(0., 0.), *sorted(targets), (length, 0.)]
    result = np.zeros_like(station, dtype=np.float64)
    for (a, first), (b, last) in zip(marks, marks[1:]):
        if b - a < 2 * trackheights.STEP:
            raise ValueError('Crossings or marked ends are too close; mark a longer road stretch')
        on = (station >= a) & (station <= b)
        t = (station[on] - a) / (b - a)
        result[on] = first + (last - first) * t * t * (3 - 2 * t)
    return result


def _field(points, line, net, targets):
    """Road correction at AC x/z points, faded beyond the mapped carriageway. Pure."""
    if not targets:
        return np.zeros(len(points))
    station, distance = _project(points, line)
    height = _profile(station, _stations(line)[-1], targets)
    width = max(edge['width'] for edge in net['segments']) / 2
    # A 10% side slope needs at least 15 m for each metre of lift under the cubic fade's steepest derivative.
    fade = max(6., 15. * max(abs(value) for _at, value in targets))
    t = np.clip((distance - width) / fade, 0, 1)
    return height * (1 - t * t * (3 - 2 * t))


def _kept_road_weight(points, line, net):
    """Fade terrain to zero at another mapped road on the same level. Pure."""
    if not net['unselected']:
        return np.ones(len(points))
    _station, selected = _project(points, line)
    own_edge = np.maximum(0, selected - max(edge['width'] for edge in net['segments']) / 2)
    other_edge = np.full(len(points), np.inf)
    for edge in net['unselected']:
        a, b = np.asarray(edge['a']), np.asarray(edge['b'])
        v = b - a
        t = np.clip((points - a) @ v / (v @ v), 0, 1)
        other_edge = np.minimum(other_edge, np.maximum(0, np.linalg.norm(points - (a + t[:, None] * v), axis=1) - edge['width'] / 2))
    total = own_edge + other_edge
    return np.divide(other_edge, total, out=np.zeros(len(points)), where=total > 0)


def _ground_change(xy, above, below, upper, lower, upper_targets, lower_targets):
    """Terrain correction from the two mapped roads, excluding bridge ground. Pure."""
    up = _field(xy, above, upper, upper_targets)
    down = _field(xy, below, lower, lower_targets)
    # A bridge's ground is independent. Its first two terrain cells share vertices with the approach at the abutment.
    bridge_ends = {}
    for edge in upper['segments']:
        if edge['structure'] == 'bridge':
            for end in ('a', 'b'):
                point = tuple(edge[end])
                bridge_ends[point] = bridge_ends.get(point, 0) + 1
    ends = np.asarray([point for point, count in bridge_ends.items() if count == 1], np.float64)
    station = _project(xy, above)[0]
    end_station = _project(ends, above)[0] if len(ends) else []
    near_abutment = np.zeros(len(xy), bool)
    for at in end_station:
        near_abutment |= np.abs(station - at) <= 2 * trackheights.STEP
    for edge in upper['segments']:
        if edge['structure'] != 'bridge':
            continue
        a, b = np.asarray(edge['a']), np.asarray(edge['b'])
        v = b - a
        t = (xy - a) @ v / (v @ v)
        distance = np.linalg.norm(xy - (a + np.clip(t, 0, 1)[:, None] * v), axis=1)
        up[(t >= 0) & (t <= 1) & (distance <= edge['width'] / 2) & ~near_abutment] = 0
    return up * _kept_road_weight(xy, above, upper) + down * _kept_road_weight(xy, below, lower)


def _fixed_weight(points, fixed):
    """Terrain fades out by a fixed railway or tunnel footprint. Pure."""
    if not len(fixed):
        return np.ones(len(points))
    distance = np.full(len(points), np.inf)
    for first in range(0, len(points), 256):
        part = points[first:first + 256]
        distance[first:first + 256] = np.sqrt(np.min(np.sum((part[:, None] - fixed[None]) ** 2, axis=2), axis=1))
    # The first two metres include ballast or a tunnel wall; six more blend into surrounding terrain.
    t = np.clip((distance - 2) / 6, 0, 1)
    return t * t * (3 - 2 * t)


def _offsets(path, scan, moved, above, below, upper, lower, upper_targets, lower_targets, gone=None):
    """Source vertex corrections, selected by mesh role and connected road pieces; gone has deleted source faces."""
    result = {}
    reach = max(max(edge['width'] for edge in upper['segments']), max(edge['width'] for edge in lower['segments']))
    reach += max(6., 15. * max(abs(value) for _at, value in [*upper_targets, *lower_targets]))
    low = np.minimum(above.min(axis=0), below.min(axis=0)) - reach
    high = np.maximum(above.max(axis=0), below.max(axis=0)) + reach
    upper_half = max(edge['width'] for edge in upper['segments']) / 2
    lower_half = max(edge['width'] for edge in lower['segments']) / 2
    with open(path, 'rb') as source:
        fixed = []
        for i, mesh in enumerate(scan['meshes']):
            if objectlist.kind_of(mesh['name']) not in {'rail', 'railcol', 'tunnel'}:
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if (centre + mesh['radius'] < low).any() or (centre - mesh['radius'] > high).any():
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            if gone is not None and i in gone:
                faces = faces[~gone[i]]
            if not len(faces):
                continue
            # Deleted railway pieces no longer block a road, even though their source vertices remain in the KN5.
            xy = vertices['pos'][np.unique(faces)][:, [0, 2]].astype(np.float64)
            top, bottom = _field(xy, above, upper, upper_targets), _field(xy, below, lower, lower_targets)
            upper_core = (_project(xy, above)[1] < upper_half) & (np.abs(top) > .01)
            lower_core = (_project(xy, below)[1] < lower_half) & (np.abs(bottom) > .01)
            blocked = np.flatnonzero(upper_core | lower_core)
            if len(blocked):
                x, z = xy[blocked[0]]
                raise ValueError(f'A railway or tunnel crosses the moving road at x={x:.1f}, z={z:.1f}: {mesh["name"]}')
            nearby = (np.abs(top) > .01) | (np.abs(bottom) > .01)
            fixed.extend(xy[nearby])
        fixed = np.unique(np.round(np.asarray(fixed, np.float64).reshape(-1, 2), 1), axis=0)

        def terrain(place):
            value = _ground_change(place, above, below, upper, lower, upper_targets, lower_targets)
            if not len(fixed):
                return value
            top = (_project(place, above)[1] <= upper_half + 1) & (np.abs(_field(place, above, upper, upper_targets)) > .01)
            bottom = (_project(place, below)[1] <= lower_half + 1) & (np.abs(_field(place, below, lower, lower_targets)) > .01)
            return value * np.where(top | bottom, 1., _fixed_weight(place, fixed))

        for i, mesh in enumerate(scan['meshes']):
            kind = objectlist.kind_of(mesh['name'])
            if kind in {'rail', 'railcol', 'tunnel'}:
                continue
            if kind not in {'ground', 'deck', 'road', 'walk', 'walkcol', 'guardrail', 'guardrailcol', 'racing'}:
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if (centre + mesh['radius'] < low).any() or (centre - mesh['radius'] > high).any():
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            points = vertices['pos'].astype(np.float64)
            xy = points[:, [0, 2]]
            up, down = _field(xy, above, upper, upper_targets), _field(xy, below, lower, lower_targets)
            owner, weight = np.zeros(len(points), np.uint8), np.ones(len(points))
            if kind == 'ground':
                # Under a bridge, the ground belongs to the lower road. Its bridge approach is ground only outside the deck.
                change = terrain(xy)
                owner[:] = 3
            else:
                change = np.zeros(len(points))
                _us, du = _project(xy, above)
                _ls, dl = _project(xy, below)
                uw = max(edge['width'] for edge in upper['segments']) / 2 + 2
                lw = max(edge['width'] for edge in lower['segments']) / 2 + 2
                for component in roadsurfaces._components(points, faces):
                    upper_only = np.any((du[component] < uw) & (dl[component] >= lw))
                    lower_only = np.any((dl[component] < lw) & (du[component] >= uw))
                    if kind == 'deck':
                        # Collision slabs and piers of another bridge in the selected corridor need their own mapping.
                        choose = 'upper' if np.any(du[component] < uw) else None
                    else:
                        if upper_only and lower_only:
                            # A bridge skin can cross both corridors. Its strip direction identifies its road even
                            # when the two road surfaces are nearly coincident in height.
                            upper_score = float(np.mean(du[component])) / uw
                            lower_score = float(np.mean(dl[component])) / lw
                            if upper_score < .7 * lower_score:
                                choose = 'upper'
                            elif lower_score < .7 * upper_score:
                                choose = 'lower'
                            else:
                                choose = _oriented_owner(points[component], above, below)
                                if choose is None:
                                    raise ValueError(f'A road mesh joins the two marked roads: {mesh["name"]}')
                        else:
                            choose = 'upper' if upper_only else 'lower' if lower_only else None
                        if choose is None and np.any((du[component] < uw) & (dl[component] < lw)
                                                      & ((np.abs(up[component]) > .001) | (np.abs(down[component]) > .001))):
                            choose = _oriented_owner(points[component], above, below)
                            if choose is None:
                                raise ValueError(f'A road part at the crossing has no unique mapped owner: {mesh["name"]}')
                    if choose == 'upper':
                        change[component] = up[component]
                        owner[component] = 1
                    elif choose == 'lower':
                        change[component] = down[component]
                        owner[component] = 2
                    if kind == 'deck' and choose == 'upper':
                        p = points[component]
                        vertical = np.ptp(p[:, 1])
                        horizontal = np.ptp(p[:, [0, 2]], axis=0).max()
                        if vertical > horizontal and vertical > 1:
                            weight[component] = np.clip((p[:, 1] - p[:, 1].min()) / vertical, 0, 1)
                            change[component] *= weight[component]
            touched = np.flatnonzero(np.abs(change) >= .0005)
            if len(touched):
                def sampled(dx, dz):
                    place = xy[touched] + [dx, dz]
                    top = _field(place, above, upper, upper_targets)
                    bottom = _field(place, below, lower, lower_targets)
                    values = np.where(owner[touched] == 1, top, np.where(owner[touched] == 2, bottom, 0.))
                    ground = owner[touched] == 3
                    if ground.any():
                        values[ground] = terrain(place[ground])
                    return values * weight[touched]
                # Local derivatives turn the retained normals and tangents with the ramp.
                gx = (sampled(.25, 0) - sampled(-.25, 0)) / .5
                gz = (sampled(0, .25) - sampled(0, -.25)) / .5
                result[str(i)] = [[int(k), int(round(change[k] * 1000)), round(float(gx[n]), 7), round(float(gz[n]), 7)]
                                  for n, k in enumerate(touched)]
    return result


def change_of(path, scan, moved, points, gap, upper_percent, id_, gone=None, max_grade_percent=RAMP_GRADE * 100):
    """One source-bound height operation and current crossing gaps."""
    if type(gap) not in (int, float) or not math.isfinite(gap) or not 0 <= gap <= 50:
        raise ValueError('Gap must be between 0 and 50 metres')
    if type(upper_percent) not in (int, float) or not math.isfinite(upper_percent) or not 0 <= upper_percent <= 100:
        raise ValueError('Upper share must be between 0 and 100 percent')
    if type(max_grade_percent) not in (int, float) or not math.isfinite(max_grade_percent) or not .5 <= max_grade_percent <= 50:
        raise ValueError('Maximum ramp slope must be between 0.5 and 50 percent')
    upper, lower, above, below, crossings = describe(path, scan, moved, points)
    if len(points) == 2 and upper_percent != 100:
        raise ValueError('The two-point tool moves only the bridge')
    if any(edge['structure'] == 'tunnel' for edge in upper['segments']):
        raise ValueError('A tunnel joins the marked bridge road; mark a shorter range')
    if any(cross['gap'] > gap + .001 for cross in crossings):
        raise ValueError('This tool only increases the existing crossing gap')
    fraction = upper_percent / 100
    upper_targets = [(cross['upper_s'], (gap - cross['gap']) * fraction) for cross in crossings]
    lower_targets = [] if len(points) == 2 else [(cross['lower_s'], -(gap - cross['gap']) * (1 - fraction)) for cross in crossings]
    for net, line, targets in ((upper, above, upper_targets), (lower, below, lower_targets)):
        if net['held_junctions'] and np.any(np.abs(_field(np.asarray(net['held_junctions']), line, net, targets)) > .01):
            raise ValueError('A side road joins inside this ramp; this crossing needs a longer connected road selection')
    for line, targets in ((above, upper_targets), (below, lower_targets)):
        if not targets or all(abs(value) < .0005 for _at, value in targets):
            continue
        marks = [(0., 0.), *sorted(targets), (_stations(line)[-1], 0.)]
        for (a, first), (b, last) in zip(marks, marks[1:]):
            grade = 1.5 * abs(last - first) / (b - a) * 100 if b > a else float('inf')
            if b - a < 4 or grade > max_grade_percent:
                raise ValueError(f'The ramp would reach {grade:.1f}% (maximum {max_grade_percent:g}%); mark its ends farther apart or raise the maximum')
    low = np.minimum(above.min(axis=0), below.min(axis=0)) - 4
    high = np.maximum(above.max(axis=0), below.max(axis=0)) + 4
    x0, z0 = (np.floor(low / 2).astype(int) * 2).tolist()
    x1, z1 = (np.ceil(high / 2).astype(int) * 2).tolist()
    nx, nz = (x1 - x0) // 2 + 1, (z1 - z0) // 2 + 1
    if nx * nz > trackheights.MAX_POINTS:
        raise ValueError('Mark shorter road stretches')
    op = {'id': id_, 'x': x0, 'z': z0, 'nx': nx, 'nz': nz, 'mm': [0] * (nx * nz),
          'mesh_offsets': _offsets(path, scan, moved, above, below, upper, lower, upper_targets, lower_targets, gone),
          'separation': {'points': points, 'gap': gap, 'upper_percent': upper_percent, 'max_grade_percent': max_grade_percent}}
    problem = trackheights.problem(op)
    if problem:
        raise ValueError(problem)
    if not op['mesh_offsets']:
        raise ValueError('No editable bridge or road surface was found')
    return op, crossings
