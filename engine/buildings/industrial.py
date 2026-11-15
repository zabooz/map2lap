"""Class-specific, bounded opening layouts for low industrial halls; mapped shells remain authoritative."""
from dataclasses import dataclass

import numpy as np

from .looks import INDUSTRIAL_CLASSES, SURFACE_MATERIALS, _hash01
from .mesh import WIN_UV, base_z, door_ground, drawn_ring
from .utility import _panel


@dataclass(frozen=True)
class Opening:
    """A closed panel on one drawn wall; bottom is an absolute engine elevation."""
    kind: str
    edge: int
    along: float
    width: float
    bottom: float
    height: float


def industrial_kind(spec):
    """The opening profile of a ground-level industrial hall, or None. Pure."""
    if spec.cls not in INDUSTRIAL_CLASSES or spec.windows is not False or (spec.min_h or 0.) > .5:
        return None
    return None if spec.deck or spec.toll is not None else spec.cls


def _append(panels, kind, edge, along, width, bottom, height, length, eave):
    """Append a panel only when wall piers, headroom and existing openings leave room."""
    # Half a metre of wall around openings is a visual pier/headroom allowance, not a building-code claim.
    width = min(width, 2 * (min(along, length - along) - .5))
    height = min(height, eave - bottom - .5)
    if width < (.6 if kind in ('window', 'vent', 'door') else 1.8) or height < (.5 if kind in ('window', 'vent') else 1.8):
        return
    for p in panels:
        if p.edge == edge and abs(p.along - along) < (p.width + width) / 2 + .3 and \
                bottom < p.bottom + p.height + .3 and p.bottom < bottom + height + .3:
            return
    panels.append(Opening(kind, edge, float(along), float(width), float(bottom), float(height)))


def industrial_openings(spec, gmin, gmax):
    """Gates, personnel access and window bands for the class, fitted to its actual walls and ground. Pure."""
    kind = industrial_kind(spec)
    if kind is None:
        return []
    ring = drawn_ring(spec)
    lengths = np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1)
    front = int(spec.front) if spec.front is not None else int(lengths.argmax())
    base, length = base_z(spec, gmin, gmax), float(lengths[front])
    eave = base + spec.height
    panels = []
    # Reserve the last 2.5 m for pedestrian access, away from the loading/sliding gates.
    span = max(0., length - 3.)
    count = min(6, max(1, int(span / 8.))) if kind == 'warehouse' else 2 if kind in ('manufacture', 'factory') else 1
    nominal = {'warehouse': (4.2, 4.5), 'manufacture': (3.8, 4.), 'factory': (4.5, 4.2),
               'industrial': (4., 3.8), 'hangar': (span * .85, spec.height * .72)}
    width, height = nominal[kind]     # Visual vehicle clearances; actual doors are not supplied by the map.
    for i in range(count):
        along = .5 + span * (i + .5) / count
        bottom = door_ground(spec, front, along, gmax)
        _append(panels, 'hangar' if kind == 'hangar' else 'gate', front, along,
                min(width, span / count - .8), bottom, height, length, eave)
    along = length - 1.05
    _append(panels, 'door', front, along, 1., door_ground(spec, front, along, gmax), 2.2, length, eave)
    _windows(panels, spec, ring, lengths, front, base, eave, gmax, kind)
    return panels


def _windows(panels, spec, ring, lengths, front, base, eave, gmax, kind):
    """Add a sparse warehouse rear, manufacturing clerestory or factory floor bands; hangars get side vents."""
    used = 0
    for edge, length in enumerate(lengths):
        if length < 2.5:
            continue
        if kind in ('warehouse', 'industrial') and edge != (front + len(ring) // 2) % len(ring):
            continue
        if kind == 'hangar' and edge in (front, (front + len(ring) // 2) % len(ring)):
            continue
        rows = min(2, max(1, spec.floors)) if kind == 'factory' else 1
        count = min(8, max(1, int(length / 3.))) if kind in ('manufacture', 'factory') else 2
        for row in range(rows):
            offset = (row + .55) * spec.floor_h if kind == 'factory' else spec.height - 1.9
            if kind == 'industrial':
                offset = 2.4
            bottom, height = base + offset, 1.1 if kind in ('manufacture', 'factory') else .8
            for i in range(count):
                along = length * (i + .5) / count
                width = min(1.8 if kind in ('manufacture', 'factory') else 1.2, length / count - .6)
                ground = door_ground(spec, edge, along, gmax)
                if bottom < ground + .6:
                    continue
                # Named halls put their sign near the eave in the middle 60% of the front.
                if edge == spec.sign and spec.names and bottom + height > eave - 2.6 and \
                        abs(along - length / 2) < length * .3 + width / 2 + .6:
                    continue
                before = len(panels)
                _append(panels, 'vent' if kind == 'hangar' else 'window', edge, along, width,
                        bottom, height, length, eave)
                used += len(panels) - before
                if used >= 48:     # At most 96 window/vent triangles, including long and complex footprints.
                    return


def draw_industrial(m, spec, gmin, gmax, mat_idx):
    """Draw shared gate textures and ordinary night-lit window panes on the planned industrial shell."""
    panels = industrial_openings(spec, gmin, gmax)
    if not panels:
        return
    ring = drawn_ring(spec)
    for i, p in enumerate(panels):
        uv = None
        mat = mat_idx[f"{SURFACE_MATERIALS['ind']}|0"]
        cell = {'gate': (0, 0), 'hangar': (1, 0), 'door': (0, 1), 'vent': (1, 1), 'window': (0, 0)}[p.kind]
        if p.kind == 'window':
            shift = int(_hash01(spec.seed, p.edge, i) * 4) / 4
            u0, u1, v0, v1 = WIN_UV
            uv, mat = (u0 + shift, u1 + shift, v0, v1), mat_idx['bne_bld_fac_white']
        _panel(m, ring[p.edge], ring[(p.edge + 1) % len(ring)], p.along, p.width, p.bottom, p.height, cell, mat, uv)
