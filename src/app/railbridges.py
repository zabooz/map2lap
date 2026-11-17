"""Mapped railway bridge spans and their visible and collision triangles in one KN5."""
import functools
import math
import os

import numpy as np

from app import roadregion, roadseparation, roadsurfaces, trackband, trackheights
from track import editorinfo, kn5, objectlist, surfaceindex

RAIL_WIDTH = 4.8  # railways.DECK_HALF_M on both sides of the mapped centreline.
FACE_REACH = 3.0  # deck rim and piers extend a little beyond the 2.4 m half-width.


@functools.lru_cache(maxsize=2)
def _graph(folder, stamp):
    """Rail features from retained build facts, with bridge ranges split at their real ends."""
    _fingerprint, tiles, _chains = surfaceindex._catalog(folder, stamp)
    features = [{**feature, 'spec': {'width': RAIL_WIDTH}}
                for items in tiles.values() for feature in items
                if feature.get('tags', {}).get('subtype') == 'rail']
    return roadregion._graph(features)


def graph(path):
    """Rail graph of the installed KN5, cached by its build facts."""
    folder = editorinfo._folder(path)
    if editorinfo.manifest(path) is None:
        raise ValueError('This track needs a new build to select railway bridges')
    return _graph(folder, editorinfo._stamp(os.path.join(folder, 'manifest.json')))


def mapped(path, points):
    """One rail line between A and B, from the retained railway build facts."""
    return roadregion._network(graph(path), points, join_near=False)


def _bed_height(path, scan, moved, point):
    """Top of the physical rail ballast at one bridge crossing."""
    x, z = point
    heights = []
    with open(path, 'rb') as source:
        for i, mesh in enumerate(scan['meshes']):
            if not mesh['name'].startswith('1GRAVEL_railcol_ballast'):
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if np.linalg.norm(centre - point) > mesh['radius'] + 1:
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            for triangle in vertices['pos'][faces].astype(np.float64):
                if not ((triangle[:, [0, 2]].min(axis=0) <= point).all()
                        and (triangle[:, [0, 2]].max(axis=0) >= point).all()):
                    continue
                normal = np.cross(triangle[1] - triangle[0], triangle[2] - triangle[0])
                if normal[1] <= 1e-8:
                    continue
                inside, height = roadsurfaces._plane(triangle, x, z)
                if inside:
                    heights.append(float(height))
    if not heights or max(heights) - min(heights) > .05:
        raise ValueError('The railway bridge bed at this crossing cannot be identified uniquely')
    return float(max(heights))


def describe(path, scan, moved, points):
    """Mapped rail bridge, its one ground-road crossing and current ballast-to-road gap."""
    if not isinstance(points, list) or len(points) != 2:
        raise ValueError('Mark A and B on the same railway bridge line')
    upper = mapped(path, points)
    if not any(edge['structure'] == 'bridge' for edge in upper['segments']):
        raise ValueError('A and B must span an existing mapped railway bridge')
    above = roadseparation._route(upper)
    folder = editorinfo._folder(path)
    positions, _numbers, edges = roadregion._source_graph(folder, editorinfo._stamp(os.path.join(folder, 'manifest.json')))
    candidates = []
    for edge in edges:
        if edge['structure']:
            continue
        line = np.asarray([positions[edge['a']], positions[edge['b']]], np.float64)
        for point, upper_s, lower_s in roadseparation._intersections(above, line):
            if roadsurfaces.structures(upper, np.array([point[0]]), np.array([point[1]]))[0] == 1:
                candidates.append((edge, line, point, upper_s, lower_s))
    if not candidates:
        raise ValueError('No ground road crosses this mapped railway bridge')
    if len(candidates) != 1:
        raise ValueError('Several roads cross here; mark a shorter railway stretch')
    edge, below, point, upper_s, lower_s = candidates[0]
    lower = {'segments': [{'a': below[0].tolist(), 'b': below[1].tolist(), 'width': edge['width'], 'structure': ''}],
             'pins': [below[0].tolist(), below[1].tolist()], 'unselected': [], 'held_junctions': []}
    ground, i0, j0 = trackband._ground(path, scan, moved, np.asarray([below.min(axis=0) - 4, below.max(axis=0) + 4]))
    bottom = float(trackband._on_grid(ground, i0, j0, point[None])[0])
    if not np.isfinite(bottom):
        raise ValueError('No lower road surface at the railway crossing')
    top = _bed_height(path, scan, moved, point)
    crossing = {'x': round(float(point[0]), 3), 'z': round(float(point[1]), 3), 'upper_s': upper_s,
                'lower_s': lower_s, 'upper_y': round(top, 3), 'gap': round(top - bottom, 3)}
    return upper, lower, above, below, [crossing]


def _offsets(path, scan, moved, upper, lower, above, below, targets):
    """Source vertex offsets for one rail line's bed, rails, sleepers, deck, piers and approaches."""
    reach = RAIL_WIDTH + max(6., 15. * max(abs(value) for _at, value in targets))
    low, high = above.min(axis=0) - reach, above.max(axis=0) + reach
    result = {}
    with open(path, 'rb') as source:
        fixed = []
        for i, mesh in enumerate(scan['meshes']):
            if objectlist.kind_of(mesh['name']) not in {'rail', 'railcol'}:
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if (centre + mesh['radius'] < low).any() or (centre - mesh['radius'] > high).any():
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            xy = vertices['pos'][:, [0, 2]].astype(np.float64)
            distance = roadseparation._project(xy, above)[1]
            fixed.extend(xy[(distance > FACE_REACH) & (np.abs(roadseparation._field(xy, above, upper, targets)) > .01)])
        fixed = np.unique(np.round(np.asarray(fixed, np.float64).reshape(-1, 2), 1), axis=0)

        def terrain(xy):
            change = roadseparation._ground_change(xy, above, below, upper, lower, targets, [])
            distance = roadseparation._project(xy, below)[1]
            # The ground road beneath the rail bridge stays at its old height across its entire carriageway.
            t = np.clip((distance - max(e['width'] for e in lower['segments']) / 2) / 8, 0, 1)
            change *= t * t * (3 - 2 * t)
            if len(fixed):
                own = roadseparation._project(xy, above)[1] <= RAIL_WIDTH / 2 + 1
                change *= np.where(own, 1., roadseparation._fixed_weight(xy, fixed))
            return change

        for i, mesh in enumerate(scan['meshes']):
            kind = objectlist.kind_of(mesh['name'])
            if kind not in {'ground', 'rail', 'railcol'}:
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if (centre + mesh['radius'] < low).any() or (centre - mesh['radius'] > high).any():
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            if moved and i in moved.vertices:
                vertices = moved.vertices[i]
            points = vertices['pos'].astype(np.float64)
            xy = points[:, [0, 2]]
            owner = np.zeros(len(points), np.uint8)
            weight = np.ones(len(points))
            if kind == 'ground':
                change = terrain(xy)
                owner[:] = 2
            else:
                change = np.zeros(len(points))
                distance = roadseparation._project(xy, above)[1]
                correction = roadseparation._field(xy, above, upper, targets)
                for component in roadsurfaces._components(points, faces):
                    if '_con_' in mesh['name']:
                        selected = float(np.mean(distance[component])) <= FACE_REACH
                    else:
                        selected = bool(np.any(distance[component] <= FACE_REACH))
                    if not selected:
                        continue
                    change[component] = correction[component]
                    owner[component] = 1
                    if '_con_' in mesh['name']:
                        p = points[component]
                        vertical = float(np.ptp(p[:, 1]))
                        if vertical > 2.4:  # railways.DECK_D + the ballast and edge wall: lower vertices are pier feet.
                            weight[component] = np.clip((p[:, 1] - p[:, 1].min()) / max(vertical - 2.4, .5), 0, 1)
                            change[component] *= weight[component]
            touched = np.flatnonzero(np.abs(change) >= .0005)
            if not len(touched):
                continue
            def sampled(dx, dz):
                place = xy[touched] + [dx, dz]
                values = roadseparation._field(place, above, upper, targets)
                ground = owner[touched] == 2
                if ground.any():
                    values[ground] = terrain(place[ground])
                return values * weight[touched]
            gx = (sampled(.25, 0) - sampled(-.25, 0)) / .5
            gz = (sampled(0, .25) - sampled(0, -.25)) / .5
            result[str(i)] = [[int(k), int(round(change[k] * 1000)), round(float(gx[n]), 7), round(float(gz[n]), 7)]
                              for n, k in enumerate(touched)]
    return result


def change_of(path, scan, moved, points, gap, id_, max_grade_percent=2):
    """One source-bound height operation lifting a rail bridge while its ground-road crossing stays fixed."""
    if type(gap) not in (int, float) or not math.isfinite(gap) or not 0 <= gap <= 50:
        raise ValueError('Gap must be between 0 and 50 metres')
    if type(max_grade_percent) not in (int, float) or not math.isfinite(max_grade_percent) or not .5 <= max_grade_percent <= 50:
        raise ValueError('Maximum railway ramp slope must be between 0.5 and 50 percent')
    upper, lower, above, below, crossings = describe(path, scan, moved, points)
    if any(edge['structure'] == 'tunnel' for edge in upper['segments']):
        raise ValueError('A tunnel joins this railway ramp; mark a shorter stretch')
    if gap < crossings[0]['gap'] - .001:
        raise ValueError('This tool only increases the existing crossing gap')
    targets = [(crossings[0]['upper_s'], gap - crossings[0]['gap'])]
    marks = [(0., 0.), *targets, (roadseparation._stations(above)[-1], 0.)]
    for (a, first), (b, last) in zip(marks, marks[1:]):
        grade = 1.5 * abs(last - first) / (b - a) * 100 if b > a else float('inf')
        if b - a < 4 or grade > max_grade_percent:
            raise ValueError(f'The railway ramp would reach {grade:.1f}% (maximum {max_grade_percent:g}%); mark A and B farther apart or raise the maximum')
    low, high = above.min(axis=0) - 4, above.max(axis=0) + 4
    x0, z0 = (np.floor(low / 2).astype(int) * 2).tolist()
    x1, z1 = (np.ceil(high / 2).astype(int) * 2).tolist()
    nx, nz = (x1 - x0) // 2 + 1, (z1 - z0) // 2 + 1
    if nx * nz > trackheights.MAX_POINTS:
        raise ValueError('Mark a shorter railway stretch')
    op = {'id': id_, 'x': x0, 'z': z0, 'nx': nx, 'nz': nz, 'mm': [0] * (nx * nz),
          'mesh_offsets': _offsets(path, scan, moved, upper, lower, above, below, targets),
          'separation': {'points': points, 'gap': gap, 'kind': 'rail', 'max_grade_percent': max_grade_percent}}
    problem = trackheights.problem(op)
    if problem:
        raise ValueError(problem)
    if not op['mesh_offsets']:
        raise ValueError('No editable railway bridge mesh was found')
    return op, crossings


def _distance(points, a, b):
    """Distances and unclipped stations from x/z points to one segment. Pure."""
    v = b - a
    station = (points - a) @ v / (v @ v)
    distance = np.linalg.norm(points - (a + np.clip(station, 0, 1)[:, None] * v), axis=1)
    return distance, station


def span(path, point):
    """The whole connected mapped bridge or one adjoining ground-rail edge clicked at x/z."""
    positions, _numbers, edges = graph(path)
    if not edges:
        raise ValueError('No mapped railway in this track')
    xy = np.asarray(point[:2], np.float64)
    choices = []
    for i, edge in enumerate(edges):
        a, b = np.asarray(positions[edge['a']]), np.asarray(positions[edge['b']])
        distance, _station = _distance(xy[None], a, b)
        if distance[0] <= FACE_REACH + 1:
            choices.append((float(distance[0]), i))
    if not choices:
        raise ValueError('Click on a mapped railway line')
    choices.sort()
    if len(choices) > 1 and choices[1][0] - choices[0][0] < .3 and edges[choices[0][1]]['road'] != edges[choices[1][1]]['road']:
        raise ValueError('Two railway bridges overlap here; click nearer one rail')
    chosen = edges[choices[0][1]]
    if chosen['structure'] != 'bridge':
        return [np.asarray([positions[chosen['a']], positions[chosen['b']]], np.float64)]
    by_node = {}
    for i, edge in enumerate(edges):
        if edge['structure'] == 'bridge' and edge['road'] == chosen['road']:
            by_node.setdefault(edge['a'], []).append(i)
            by_node.setdefault(edge['b'], []).append(i)
    found, waiting = set(), [choices[0][1]]
    while waiting:
        i = waiting.pop()
        if i in found:
            continue
        found.add(i)
        edge = edges[i]
        waiting.extend(by_node.get(edge['a'], []))
        waiting.extend(by_node.get(edge['b'], []))
    return [np.asarray([positions[edges[i]['a']], positions[edges[i]['b']]], np.float64) for i in sorted(found)]


def _ranges(numbers):
    """Source face numbers as compact [first, count] ranges. Pure."""
    if not len(numbers):
        return []
    cuts = np.r_[0, np.flatnonzero(np.diff(numbers) != 1) + 1, len(numbers)]
    return [[int(numbers[a]), int(b - a)] for a, b in zip(cuts, cuts[1:])]


def selection(path, scan, point):
    """All render and collision faces of a mapped railway bridge or its adjoining track section."""
    segments = span(path, point)
    low = np.min(np.vstack(segments), axis=(0, 1)) - FACE_REACH
    high = np.max(np.vstack(segments), axis=(0, 1)) + FACE_REACH
    meshes, cuts = [], []
    with open(path, 'rb') as source:
        for i, mesh in enumerate(scan['meshes']):
            if objectlist.kind_of(mesh['name']) not in {'rail', 'railcol'}:
                continue
            centre = np.asarray(mesh['center'])[[0, 2]]
            if (centre + mesh['radius'] < low).any() or (centre - mesh['radius'] > high).any():
                continue
            vertices, faces = kn5.mesh_arrays(source, mesh)
            xy = vertices['pos'][faces][:, :, [0, 2]].mean(axis=1).astype(np.float64)
            selected = np.zeros(len(faces), bool)
            if '_con_' in mesh['name']:
                # Decks and piers are individual connected solids. Cut each whole solid, not a few side faces
                # belonging to the neighbouring parallel railway bridge.
                points = vertices['pos'].astype(np.float64)
                for component in roadsurfaces._components(points, faces):
                    near = min(float(_distance(points[component][:, [0, 2]], a, b)[0].mean()) for a, b in segments)
                    if near <= FACE_REACH:
                        selected |= np.isin(faces[:, 0], component)
            else:
                for a, b in segments:
                    distance, station = _distance(xy, a, b)
                    selected |= (distance <= FACE_REACH) & (station >= -.02) & (station <= 1.02)
            numbers = np.flatnonzero(selected)
            if len(numbers):
                meshes.append({'mesh': i, 'faces': numbers.tolist()})
                cuts.append({'mesh': mesh['name'], 'faces': _ranges(numbers)})
    if not cuts:
        raise ValueError('No railway bridge meshes were found at this mapped bridge')
    return {'material': 'rail_section', 'truncated': False, 'tiles': [], 'meshes': meshes}, cuts
