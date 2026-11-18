"""Signed A/B height correction for one mapped road, independent of a crossing target gap."""
import math
import sys

import numpy as np

from app import builtroad, paths, roadseparation, roadsurfaces, trackband, trackheights

if paths.ENGINE not in sys.path:
    sys.path.insert(0, paths.ENGINE)

DEFAULT_GRADE = 15.0
MAX_BEND_M = 50.0


def describe(path, scan, points):
    """The selected unbranched road and its ordered centreline."""
    if not isinstance(points, list) or len(points) != 2:
        raise ValueError('Mark A and B on the same road')
    net = builtroad.pick(path, scan, points, join_near=True)
    if any(edge['structure'] == 'tunnel' for edge in net['segments']):
        raise ValueError('Mark a stretch outside the tunnel')
    return net, roadseparation._route(net)


def matching(heights, net, points):
    """Prior A/B operation on the same mapped roads and ends. Pure."""
    road_ids = {edge.get('road') for edge in net['segments']} - {None}
    ends = np.asarray(points, np.float64)[:, :2]
    found = []
    for op in heights:
        old = op.get('bend')
        if not isinstance(old, dict) or old.get('kind') != 'road' or not road_ids.intersection(old.get('road_ids', [])):
            continue
        previous = np.asarray(old.get('points', []), np.float64)
        if previous.shape not in ((2, 2), (2, 3)):
            continue
        previous = previous[:, :2]
        if min(np.linalg.norm(previous - ends, axis=1).max(),
               np.linalg.norm(previous[::-1] - ends, axis=1).max()) <= 1:
            found.append(op)
    return found


def _dummy(line, net, delta):
    """An inert opposite-level line outside the selected route's entire extent. Pure."""
    span = float(np.linalg.norm(line.max(axis=0) - line.min(axis=0)))
    width = max(edge['width'] for edge in net['segments'])
    shift = span + width + max(6., 15. * abs(delta)) + 10.
    dummy = line + np.array([shift, shift])
    other = {'segments': [{'a': dummy[0].tolist(), 'b': dummy[-1].tolist(), 'width': 1.,
                           'road': None, 'structure': ''}], 'unselected': [], 'held_junctions': [], 'other_lines': []}
    return other, dummy


def _context(path, scan, moved, points, net, line, delta):
    """The selected road as upper or lower, with real crossing roads when present."""
    upper_side = any(edge['structure'] == 'bridge' for edge in net['segments'])
    try:
        upper, lower, above, below, _crossings = roadseparation.describe(path, scan, moved, points)
        return upper, lower, above, below, None
    except ValueError as error:
        expected = 'No ground road crosses the marked bridge' if upper_side else 'No mapped bridge crosses the marked ground road'
        if str(error) != expected:
            raise
    other, other_line = _dummy(line, net, delta)
    if upper_side:
        return net, other, line, other_line, 'upper'
    return other, net, other_line, line, 'lower'


def _targets(line, delta):
    """One smooth crest or sag with fixed ends. Pure."""
    return [(float(roadseparation._stations(line)[-1] / 2), float(delta))]


def _clearance(path, scan, moved, net, line, delta):
    """Keep the actual ordering and minimum clearance at every mapped crossing level."""
    from roads import LIDAR_HEADROOM_M
    from roadmesh import DECK_DEPTH, GIRDER_D
    targets = _targets(line, delta)
    for edge in net.get('crossings', []):
        other = np.asarray([edge['a'], edge['b']], np.float64)
        for point, station, _other_station in roadseparation._intersections(line, other):
            correction = float(roadseparation._profile(np.array([station]), roadseparation._stations(line)[-1], targets)[0])
            if abs(correction) < .001:
                continue
            own_bridge = roadsurfaces.structures(net, np.array([point[0]]), np.array([point[1]]))[0] == 1
            other_bridge = edge['structure'] == 'bridge'
            if own_bridge == other_bridge:
                if own_bridge:
                    raise ValueError('Two bridge levels overlap here; their clearance cannot be measured uniquely')
                continue  # a same-level road junction, handled by the held-junction check
            low, high = point - 4, point + 4
            ground, i0, j0 = trackband._ground(path, scan, moved, np.asarray([low, high]))
            ground_y = float(trackband._on_grid(ground, i0, j0, point[None])[0])
            deck_y = roadseparation._deck_height(path, scan, moved, point)
            gap = deck_y - ground_y
            after = gap + correction if own_bridge else gap - correction
            minimum = min(gap, LIDAR_HEADROOM_M + DECK_DEPTH + GIRDER_D)
            if after < minimum - .001:
                raise ValueError(f'This bend would reduce crossing clearance to {after:.2f} m; at least {minimum:.2f} m is required')


def blockers(path, scan, moved, points, gone=None):
    """Railway and tunnel parts touched by a nominal one-metre bend."""
    net, line = describe(path, scan, points)
    upper, lower, above, below, solo = _context(path, scan, moved, points, net, line, 1.)
    targets = _targets(line, 1.)
    result = []
    upper_side = any(edge['structure'] == 'bridge' for edge in net['segments'])
    roadseparation._offsets(path, scan, moved, above, below, upper, lower,
                            targets if upper_side else [], [] if upper_side else targets,
                            gone, result, solo)
    return result


def change_of(path, scan, moved, points, delta, id_, gone=None, max_grade_percent=DEFAULT_GRADE):
    """One source-bound signed road-height operation, with the marked ends fixed."""
    if type(delta) not in (int, float) or not math.isfinite(delta) or not -MAX_BEND_M <= delta <= MAX_BEND_M or not delta:
        raise ValueError('Height change must be between -50 and 50 metres and not zero')
    if type(max_grade_percent) not in (int, float) or not math.isfinite(max_grade_percent) or not .5 <= max_grade_percent <= 50:
        raise ValueError('Maximum ramp slope must be between 0.5 and 50 percent')
    net, line = describe(path, scan, points)
    length = float(roadseparation._stations(line)[-1])
    grade = 3 * abs(delta) / length * 100 if length > 0 else math.inf
    if length < 8 or grade > max_grade_percent:
        needed = max(8., 3 * abs(delta) * 100 / max_grade_percent)
        raise ValueError(f'The added ramp would reach {grade:.1f}% (maximum {max_grade_percent:g}%): '
                         f'{length:.0f} m available, {needed:.0f} m needed; mark A and B farther apart')
    targets = _targets(line, delta)
    if net['held_junctions'] and np.any(np.abs(roadseparation._field(np.asarray(net['held_junctions']), line, net, targets)) > .01):
        raise ValueError('A side road joins inside this bend; mark a shorter stretch or include its approach')
    _clearance(path, scan, moved, net, line, delta)
    upper, lower, above, below, solo = _context(path, scan, moved, points, net, line, delta)
    upper_side = any(edge['structure'] == 'bridge' for edge in net['segments'])
    low, high = line.min(axis=0) - 4, line.max(axis=0) + 4
    x0, z0 = (np.floor(low / 2).astype(int) * 2).tolist()
    x1, z1 = (np.ceil(high / 2).astype(int) * 2).tolist()
    nx, nz = (x1 - x0) // 2 + 1, (z1 - z0) // 2 + 1
    if nx * nz > trackheights.MAX_POINTS:
        raise ValueError('Mark a shorter road stretch')
    op = {'id': id_, 'x': x0, 'z': z0, 'nx': nx, 'nz': nz, 'mm': [0] * (nx * nz),
          'mesh_offsets': roadseparation._offsets(path, scan, moved, above, below, upper, lower,
                                                 targets if upper_side else [], [] if upper_side else targets,
                                                 gone, solo=solo),
          'bend': {'points': points, 'delta': delta, 'kind': 'road', 'max_grade_percent': max_grade_percent,
                   'line': line.tolist(),
                   'road_ids': sorted({edge['road'] for edge in net['segments'] if edge.get('road')})}}
    wrong = trackheights.problem(op)
    if wrong:
        raise ValueError(wrong)
    if not op['mesh_offsets']:
        raise ValueError('No editable road surface was found')
    return op
