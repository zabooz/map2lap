"""Inferred public entrances, terrace access and small business fronts on mapped building shells."""
import numpy as np

from .looks import CIVIC_CLASSES, SURFACE_MATERIALS, _hash01
from .mesh import WIN_UV, _box, _lettering, base_z, door_ground, drawn_ring
from .utility import _panel


def frontage_kind(spec):
    """The explicit class's frontage family, excluding raised parts and special structures. Pure."""
    if (spec.min_h or 0.) > .5 or spec.deck or spec.toll is not None:
        return None
    if spec.cls in CIVIC_CLASSES:
        return 'civic'
    if spec.cls in ('cafe', 'fast_food'):
        return 'food'
    if spec.cls == 'fire_station':
        return 'fire'
    if spec.cls == 'semidetached_house':
        return 'paired' if spec.paired_home else 'semi_half'
    return spec.cls if spec.cls in ('terrace', 'kiosk') else None


def prepare_frontage(spec):
    """Keep the road-facing front, or select the longest wall, before native window emission."""
    kind = frontage_kind(spec)
    if kind is None:
        return
    ring = drawn_ring(spec)
    lengths = np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1)
    if spec.front is None:
        spec.front = int(lengths.argmax())
    if kind == 'civic':
        spec.door = (spec.front, lengths[spec.front] / 2)
    spec.porch, spec.stoop = False, None


def entrance_layout(spec):
    """Door centres along the entrance wall and widths, bounded by wall piers. Pure."""
    kind = frontage_kind(spec)
    if kind is None:
        return []
    ring = drawn_ring(spec)
    lengths = np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1)
    edge = spec.front if spec.front is not None else int(lengths.argmax())
    if kind == 'kiosk':
        edge = (edge + 1) % len(ring)       # Personnel access beside the sales frontage.
    length = lengths[edge]
    if length < 2.:
        return []
    if kind == 'fire':
        return [(length - 1., 1.)]
    if kind == 'paired' and length >= 4.:
        return [(length * .35, 1.), (length * .65, 1.)]
    if kind == 'terrace':
        count = min(10, max(1, int(length / 5.5)))  # Inferred house bays, not mapped dwelling counts.
        return [(float(np.clip(length * (i + .25) / count, .75, length - .75)), 1.) for i in range(count)]
    return [(length * (.85 if kind == 'food' and length >= 6. else .5),
             min(2.2 if kind == 'civic' else 1., length - 1.))]


def fire_gates(spec):
    """Vehicle gate centres and widths, leaving the end bay for personnel access. Pure."""
    if frontage_kind(spec) != 'fire':
        return []
    ring = drawn_ring(spec)
    lengths = np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1)
    edge = spec.front if spec.front is not None else int(lengths.argmax())
    span = float(lengths[edge]) - 3.
    if span < 3.5:
        return []
    count = min(6, max(1, int(span / 4.5)))  # Typical vehicle bays with wall piers; actual bays are not mapped.
    return [(.4 + span * (i + .5) / count, min(3.5, span / count - .6)) for i in range(count)]


def draw_frontage(m, spec, gmin, gmax, mat_idx):
    """Add shared textured access panels and bounded details; no per-building textures."""
    kind = frontage_kind(spec)
    if kind is None:
        return
    ring = drawn_ring(spec)
    front = int(spec.front)
    edge = (front + 1) % len(ring) if kind == 'kiosk' else front
    a, b = ring[edge], ring[(edge + 1) % len(ring)]
    eave = base_z(spec, gmin, gmax) + spec.height
    mat = mat_idx[f"{SURFACE_MATERIALS['ent']}|0"]
    if kind == 'fire':
        for along, width in fire_gates(spec):
            bottom = door_ground(spec, edge, along, gmax)
            height = min(3.4, eave - bottom - .4)
            if height >= 2.5:
                _panel(m, a, b, along, width, bottom, height, (0, 1), mat)
    for along, width in entrance_layout(spec):
        bottom = door_ground(spec, edge, along, gmax)
        height = min(2.25 if kind == 'civic' else 2.1, eave - bottom - .2)
        if height >= 1.7:
            _panel(m, a, b, along, width, bottom, height, (0 if kind == 'civic' else 1, 0), mat)
    if kind != 'civic':
        _windows(m, spec, ring, front, gmin, gmax, mat_idx, kind)
    if kind == 'paired':
        # A narrow facade joint indicates the shared boundary without inventing another footprint or roof.
        length = np.linalg.norm(b - a)
        bottom = door_ground(spec, front, length / 2, gmax)
        if eave > bottom:
            _panel(m, a, b, length / 2, .08, bottom, eave - bottom, (0, 0), mat_idx['bne_bld_fac_white'],
                   (.002, .012, .995, .999))
    if kind == 'food' and spec.names:
        _business_blade(m, spec, ring, front, eave, gmax, mat_idx)
    # Small entrance canopy; stations use a longer frontage shelter, food businesses a shallow awning.
    if kind in ('civic', 'food', 'kiosk') and spec.floor_h >= 2.7:
        a, b = ring[front], ring[(front + 1) % len(ring)]
        length = np.linalg.norm(b - a)
        d = (b - a) / length
        out = np.array([d[1], -d[0]])
        width = min(length - .6, length * .8 if spec.cls == 'train_station' else 4.)
        depth = .9 if kind == 'civic' else .65
        bottom = door_ground(spec, front, length / 2, gmax) + 2.45
        if width > 1.5 and bottom + .12 < eave:
            _box(m, (a + b) / 2 + out * depth / 2, d, width / 2, depth / 2, bottom, bottom + .12,
                 mat_idx[spec.roof_mat])


def _business_blade(m, spec, ring, front, eave, ground, mat_idx):
    """A compact double-sided cafe/food sign beside the entrance frontage, using the shared glyph atlas."""
    if eave - ground < 2.8:
        return
    a, b = ring[front], ring[(front + 1) % len(ring)]
    d = (b - a) / np.linalg.norm(b - a)
    out = np.array([d[1], -d[0]])
    centre = a + d * .6 + out * .65
    top = min(eave - .2, ground + 3.15)
    m.mark('sign')
    _box(m, centre, out, .55, .04, top - .55, top, mat_idx['sign|0'])
    text = 'CAFE' if spec.cls == 'cafe' else 'FOOD'
    for side in (-1., 1.):
        normal = -d * side
        _lettering(m, text, centre + normal * .04, out * side, normal, top - .275, .28, .95,
                   mat_idx['letters|0'])
    m.mark(None)


def _windows(m, spec, ring, front, gmin, gmax, mat_idx, kind):
    """Closed display panes or terrace windows, leaving access gaps and keeping varied night-mask bays."""
    base = base_z(spec, gmin, gmax)
    doors = entrance_layout(spec)
    gates = fire_gates(spec)
    budget = 160                         # 320 triangles at most, also on long or tall terrace footprints.
    for edge, (a, b) in enumerate(zip(ring, np.roll(ring, -1, axis=0))):
        length = np.linalg.norm(b - a)
        if length < 2.4 or (kind == 'kiosk' and edge != front):
            continue
        for floor in range(spec.floors):
            if kind == 'paired' and edge == front:
                positions = [length * f for f in ((.15, .85) if floor == 0 else (.15, .35, .65, .85))]
            elif kind == 'semi_half' and edge == front:
                positions = [length * f for f in ((.2, .8) if floor == 0 else (.2, .5, .8))]
            elif kind == 'terrace' and edge == front:
                count = min(10, max(1, int(length / 5.5)))
                positions = [length * (i + f) / count for i in range(count)
                             for f in ((.7,) if floor == 0 else (.25, .7))]
            elif edge == front and kind in ('food', 'kiosk') and floor == 0:
                positions = [length * (.35 if kind == 'food' else .5)]
            else:
                count = min(10, max(1, int(length / 3.4)))
                positions = [length * (i + .5) / count for i in range(count)]
            for i, along in enumerate(positions):
                display = floor == 0 and edge == front and kind in ('food', 'kiosk')
                width = min(3.2 if kind == 'kiosk' else 4.5, length * .5) if display else 1.05
                width = min(width, 2 * (min(along, length - along) - .25))
                if width < .5:
                    continue
                if floor == 0 and edge == front and kind != 'kiosk' and any(
                        abs(along - door) < (width + dw) / 2 + .2 for door, dw in doors):
                    continue
                height = min(1.25 if display else 1.4, spec.floor_h - 1.05)
                bottom = base + floor * spec.floor_h + (1. if kind == 'kiosk' else .65 if display else .8)
                if edge == front and kind == 'fire' and any(
                        abs(along - gate) < (width + gw) / 2 + .2 and
                        bottom < door_ground(spec, front, gate, gmax) + 3.6 for gate, gw in gates):
                    continue
                if height < .4 or bottom < door_ground(spec, edge, along, gmax) + .4:
                    continue
                u0, u1, v0, v1 = WIN_UV
                shift = int(_hash01(spec.seed, edge, floor, i) * 4) / 4
                _panel(m, a, b, along, width, bottom, height, (0, 0), mat_idx['bne_bld_fac_white'],
                       (u0 + shift, u1 + shift, v0, v1))
                budget -= 1
                if not budget:
                    return
