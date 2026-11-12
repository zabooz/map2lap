"""Mapped toll roofs with open lanes and closed service rooms beside every road."""
from dataclasses import dataclass
import math

import numpy as np
import navgraph

from polygon import contains_points
from .looks import LETTERS, MATERIALS, PANEL
from .styles import clean_ring, triangulate
from .mesh import _box, _lettering
from .garages import _clip_half
from .places import sign_text


@dataclass
class TollRoad:
    """One directed map polyline in the tile frame; width is its driving width in metres."""
    xy: np.ndarray
    width: float
    lanes: int
    forward: int | None = None
    backward: int | None = None
    speed: float | None = None


def _positive(value, fallback):
    try:
        value = float(value)
        return value if np.isfinite(value) and value > 0 else fallback
    except (ValueError, TypeError):
        return fallback


def _subtract(ring, corners):
    """Parts of ring outside a convex counter-clockwise polygon. Pure."""
    out, inside = [], ring
    for a, b in zip(corners, np.roll(corners, -1, axis=0)):
        if inside is None:
            break
        d = b - a
        n = np.array([-d[1], d[0]])
        outside = _clip_half(inside, a, n, False)
        if outside is not None:
            out.append(clean_ring(outside))
        inside = _clip_half(inside, a, n, True)
    return [p for p in out if p is not None]


def _corridors(roads, margin):
    """Swept road rectangles, extended over the joins to keep bends open. Pure."""
    out = []
    for road in roads:
        for a, b in zip(road.xy[:-1], road.xy[1:]):
            d = b - a
            length = float(np.linalg.norm(d))
            if length < .01:
                continue
            u = d / length; v = np.array([-u[1], u[0]])
            w = road.width / 2 + margin
            a, b = a - u * w, b + u * w
            out.append(np.array([a - v * w, b - v * w, b + v * w, a + v * w]))
    return out


def _near(point, xy):
    a, d = xy[:-1], np.diff(xy, axis=0)
    t = np.clip(((point - a) * d).sum(1) / np.maximum((d * d).sum(1), 1e-9), 0, 1)
    q = a + t[:, None] * d
    j = int(np.argmin(np.linalg.norm(q - point, axis=1)))
    return q[j], d[j] / max(float(np.linalg.norm(d[j])), 1e-9)


def _span(ring, at, axis):
    # Quarter-metre samples locate the edges of a roof for furniture only, never alter its road surface.
    reach = max(10., float(np.linalg.norm(ring.max(0) - ring.min(0))))
    ss = np.linspace(-reach, reach, max(3, int(reach * 8) + 1))
    inside = contains_points(ring, at + ss[:, None] * axis)
    return (float(ss[inside].min()), float(ss[inside].max())) if inside.any() else None


def layout_toll(ring, roads, attrs, left_hand=False, country=None):
    """Roof, lane furniture and service-room polygons from all crossing roads and mapped heights. Pure."""
    ring = clean_ring(ring)
    clear = _positive(attrs.get('min_height'), None)
    top = _positive(attrs.get('height'), None)
    # Unmapped roofs clear a tall vehicle; a real min_height/height takes precedence over this fallback.
    clear = clear or (max(2.5, top - .5) if top else 5.5)
    top = max(clear + .25, top or clear + .5)
    rooms = [ring]
    for corridor in _corridors(roads, 1.2):  # walking space beside moving traffic, outside the service rooms
        rooms = [p for room in rooms for p in _subtract(room, corridor)]
    corridors = _corridors(roads, .2)
    solid, lanes, gates = [], [], []

    def box(kind, at, u, half, z0, z1, color):
        solid.append(dict(kind=kind, at=np.asarray(at), axis=np.asarray(u), half=half, z0=z0, z1=z1, color=color))

    for ri, road in enumerate(roads):
        if len(road.xy) < 2 or road.lanes < 1:
            continue
        c, u = _near(ring.mean(0), road.xy)
        right = np.array([u[1], -u[0]])
        pitch = road.width / road.lanes
        # A toll island must leave at least 2.5 m clear. Narrow mapped lanes get no invented internal island.
        island_w = min(.9, pitch - 2.5)
        islands = {}
        for boundary in range(1, road.lanes):
            if island_w < .55:
                break
            at = c + right * (boundary - road.lanes / 2) * pitch
            span = _span(ring, at, u)
            if span is None or span[1] - span[0] < 5:
                continue
            at = at + u * sum(span) / 2
            # At a branching/crossing layout, a neighbouring road's driving corridor wins over furniture.
            others = _corridors(roads[:ri] + roads[ri + 1:], .5)
            corners = np.array([at + u * s * 3.25 + right * t * island_w / 2 for s in (-1, 1) for t in (-1, 1)])
            if any(contains_points(p, corners).any() or contains_points(p, at[None])[0] for p in others):
                continue
            islands[boundary] = at
            box('island', at, u, (3.25, island_w / 2), 0., .15, (181, 185, 174))
            box('booth', at, u, (1., island_w / 2 - .04), .15, 2.65, (230, 231, 217))
            box('cap', at, u, (1.08, island_w / 2), 2.65, 2.8, (87, 105, 109))
            box('support', at, u, (.12, .12), 2.8, clear, (112, 127, 128))
        for lane in range(road.lanes):
            at = c + right * (lane + .5 - road.lanes / 2) * pitch
            span = _span(ring, at, u)
            if span is None:
                continue
            direction = 0
            if road.forward is not None and road.backward is not None and road.forward + road.backward == road.lanes:
                direction = (1 if lane < road.forward else -1) if left_hand else (-1 if lane < road.backward else 1)
            lanes.append(dict(at=at, axis=u, right=right, span=span, direction=direction,
                              speed=road.speed, pitch=pitch, road=ri))
            # Unknown directions have no restrictive red X. Gates remain raised on every modelled island.
            boundary = lane if direction >= 0 else lane + 1
            if left_hand:
                boundary = lane + 1 if direction >= 0 else lane
            island = islands.get(boundary)
            if island is not None:
                hinge = island + u * (direction or 1) * 2.2
                gates.append(hinge)
                box('gate', hinge, u, (.18, .18), .15, 1.1, (218, 179, 74))
    # A support may sit on the roof boundary only when all road corridors leave it clear.
    for a, b in zip(ring, np.roll(ring, -1, axis=0)):
        for t in np.linspace(0, 1, max(1, int(np.linalg.norm(b - a) / 6)), endpoint=False):
            p = a * (1 - t) + b * t
            if any(contains_points(c, p[None])[0] for c in corridors):
                continue
            if any(contains_points(r, p[None])[0] for r in rooms):
                continue
            box('support', p, np.array([1., 0.]), (.14, .14), 0., clear, (112, 127, 128))
    return dict(ring=ring, rooms=rooms, lanes=lanes, gates=gates, clear=clear, top=top,
                solid_boxes=solid, name=str(attrs.get('name') or ''), country=country,
                mph=country in navgraph.MPH_COUNTRIES)


def _token(color, material=PANEL):
    return MATERIALS.index(material), tuple(color) + (255,)


def _slab(m, ring, z0, z1, token):
    uv = [(0.002, .995)] * len(ring)
    m.poly([(*p, z1) for p in ring], uv, token)
    m.poly([(*p, z0) for p in ring[::-1]], uv, token)
    for a, b in zip(ring, np.roll(ring, -1, axis=0)):
        m.quad((*a, z0), (*b, z0), (*b, z1), (*a, z1), *([(0.002, .995)] * 4), token)


def _face(m, point, axis, z, coords, color):
    token = _token(color)
    p = np.array([point + axis * x for x, _ in coords])
    # Faces stand in a vertical plane, so triangulate in their own 2D plane rather than world XY.
    for tri in triangulate(np.asarray(coords, np.float64)):
        q = [(*p[k], z + coords[k][1]) for k in tri]
        m.tri(*q, *([(0.002, .995)] * 3), token)


def draw_toll(m, layout, ground, collision=False, lite=False):
    """Append the real roof, rooms, furniture and raised gates to a building Mesh; collision uses the same openings."""
    ring, clear, top = layout['ring'], layout['clear'], layout['top']
    roof_ground = layout.get('roof_ground', ground)
    _slab(m, ring, roof_ground + clear, roof_ground + top, _token((174, 187, 184)))
    for k, room in enumerate(layout['rooms']):
        floor = layout.get('room_ground', [ground] * len(layout['rooms']))[k]
        _slab(m, room, floor - .2, roof_ground + clear, _token((224, 222, 210)))
    for box in layout['solid_boxes']:
        base = box.get('base', ground)
        high = roof_ground + clear if box['kind'] == 'support' else base + box['z1']
        _box(m, box['at'], box['axis'], *box['half'], base + box['z0'], high, _token(box['color']))
    if collision or lite:
        return
    for box in layout['solid_boxes']:
        if box['kind'] != 'booth':
            continue
        base = box.get('base', ground)
        p, u = box['at'], box['axis']; v = np.array([-u[1], u[0]])
        for side in (-1, 1):
            _box(m, p + v * side * (box['half'][1] + .01), u, .78, .012, base + 1.12, base + 2.35, _token((70, 113, 128)))
    for k, room in enumerate(layout['rooms']):
        floor = layout.get('room_ground', [ground] * len(layout['rooms']))[k]
        midpoints = (room + np.roll(room, -1, axis=0)) / 2
        front = min(range(len(room)), key=lambda i: min(np.linalg.norm(midpoints[i] - p['at']) for p in layout['lanes']))
        for edge, (a, b) in enumerate(zip(room, np.roll(room, -1, axis=0))):
            length = float(np.linalg.norm(b - a))
            if length < 1.2:
                continue
            u = (b - a) / length; normal = np.array([u[1], -u[0]])
            bays = max(1, int(length / 2.2))
            for bay, t in enumerate(np.linspace(.5 / bays, 1 - .5 / bays, bays)):
                p = a + (b - a) * t + normal * .025
                if edge == front and bay == bays // 2 and length >= 1.5:
                    _box(m, p, u, .5, .025, floor, floor + 2.65, _token((77, 102, 109)))
                    _box(m, p + normal * .03, u, .41, .012, floor + .15, floor + 2.5, _token((105, 145, 156)))
                    _box(m, p + u * .3 + normal * .055, u, .025, .025, floor + 1.1, floor + 1.4, _token((222, 226, 217)))
                    continue
                _box(m, p, u, min(.68, length / 4), .02, floor + 1.1, min(roof_ground + clear - .2, floor + 2.9), _token((70, 113, 128)))
    for k, gate in enumerate(layout['gates']):
        base = layout.get('gate_bases', [ground] * len(layout['gates']))[k]
        for stripe in range(14):
            z = base + 1.05 + stripe * .22
            _box(m, gate, np.array([1., 0.]), .055, .055, z, z + .22,
                 _token((212, 70, 61) if stripe % 2 else (242, 240, 221)))
    for lane in layout['lanes']:
        u, right = lane['axis'], lane['right']
        for approach in (1, -1):
            normal = -u * approach
            axis = right * approach
            at = lane['at'] + u * (lane['span'][0] - .2 if approach > 0 else lane['span'][1] + .2)
            _box(m, at, right, .4, .12, roof_ground + clear + .01, roof_ground + clear + .78, _token((25, 36, 40)))
            p = at + normal * .13
            z = roof_ground + clear + .4
            if lane['direction'] in (0, approach):
                arrow = [(-.07, .27), (-.07, -.02), (-.23, -.02), (0, -.27), (.23, -.02), (.07, -.02), (.07, .27)]
                _face(m, p, axis, z, arrow, (75, 245, 155))
            else:
                for sign in (-1, 1):
                    cross = [(-.21, -.21 * sign - .035), (.21, .21 * sign - .035), (.21, .21 * sign + .035), (-.21, -.21 * sign + .035)]
                    _face(m, p, axis, z, cross, (245, 65, 63))
    _signs(m, layout, ground)
    m.mark(None)


def _signs(m, layout, ground):
    """Mapped speed on each approach and the real station name, with signs outside its driving lanes."""
    for road in sorted({p['road'] for p in layout['lanes']}):
        lanes = [p for p in layout['lanes'] if p['road'] == road]
        first, last = lanes[0], lanes[-1]
        width = len(lanes) * first['pitch']
        u, right = first['axis'], first['right']
        centre = (first['at'] + last['at']) / 2
        for approach in (1, -1):
            if not any(p['direction'] in (0, approach) for p in lanes):
                continue
            lane = last if approach > 0 else first
            base = lane.get('base', ground)
            if lane['speed'] is not None:
                p = centre - u * approach * 14 + right * approach * (width / 2 + .9)
                _box(m, p, u, .035, .035, base - .2, base + 2.7, _token((155, 166, 163)))
                normal = -u * approach; axis = right * approach
                p = p + normal * .04
                rectangular = layout.get('country') in ('US', 'CA')
                if rectangular:
                    for w, h, depth, color in ((.4, .55, 0., (35, 40, 40)), (.37, .52, .005, (245, 245, 235))):
                        face = [(-w, -h), (w, -h), (w, h), (-w, h)]
                        _face(m, p + normal * depth, axis, base + 2.65, face, color)
                    label = 'MAXIMUM' if layout['country'] == 'CA' else 'SPEED LIMIT'
                    _lettering(m, label, p + normal * .012, axis, normal, base + 2.94, .12, .66,
                               _token((255, 255, 255), LETTERS[1]))
                else:
                    for radius, depth, color in ((.48, 0., (211, 48, 50)), (.37, .005, (245, 245, 235))):
                        circle = [(radius * math.cos(t), radius * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 33)[:-1]]
                        _face(m, p + normal * depth, axis, base + 2.65, circle, color)
                value = lane['speed'] / 1.609344 if layout.get('mph') else lane['speed']
                _lettering(m, str(round(value)), p + normal * .012, axis, normal, base + 2.55 if rectangular else base + 2.65,
                           .38, .62, _token((255, 255, 255), LETTERS[1]))
            if layout['name']:
                span = first['span'][0] if approach > 0 else first['span'][1]
                p = centre + u * (span - approach * .3)
                z = layout.get('roof_ground', ground) + layout['clear'] + 1.1
                _box(m, p, right, min(3., width / 2), .06, z - .45, z + .45, _token((45, 78, 98)))
                text = sign_text(layout['name'])
                _lettering(m, text, p - u * approach * .07, right * approach, -u * approach, z, .45,
                           min(5.6, width - .3), _token((255, 255, 255), LETTERS[0]))
