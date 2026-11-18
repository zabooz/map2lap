"""Low-cost, inferred gates and ventilation for mapped garages and agricultural buildings."""
import numpy as np

from .looks import BARN_CLASSES, SURFACE_MATERIALS, _hash01
from .mesh import WIN_UV, base_z, door_ground, drawn_ring

OPENING_MARGIN_M = .5       # Leave a wall pier beside gates and headroom beneath the eave; not a building-code rule.
OPENING_OUT_M = .025        # Painted closed panels sit 2.5 cm outside the wall to avoid depth flicker.
GARAGE_BAY_M = 3.4          # Approximate 2.6 m car gate plus separating wall piers; mapped bays are not available.


def utility_kind(spec):
    """Opening family for mapped types or inferred tiny sheds; raised parts have none. Pure."""
    if (spec.min_h or 0.) > .5 or spec.deck or spec.toll is not None:
        return None
    if spec.cls in ('garage', 'garages'):
        return 'garage'
    if spec.cls in ('stable', 'cowshed'):
        return 'stable'
    if spec.cls in ('shed', 'hut', 'cabin', 'toilets', 'service', 'static_caravan', 'greenhouse'):
        return spec.cls
    if spec.cls in BARN_CLASSES:
        return 'barn'
    return 'shed' if spec.inferred_shed else None


def _panel(m, a, b, along, width, bottom, height, cell, mat, window_uv=None):
    """One closed opening quad, with UVs inside a cell of the shared two-by-two atlas."""
    d = (b - a) / np.linalg.norm(b - a)
    out = np.array([d[1], -d[0]]) * OPENING_OUT_M
    left, right = a + d * (along - width / 2) + out, a + d * (along + width / 2) + out
    col, row = cell
    u0, u1, v0, v1 = col * .5 + .02, col * .5 + .48, .52 - row * .5, .98 - row * .5
    if window_uv is not None:
        u0, u1, v0, v1 = window_uv
    m.quad((*left, bottom), (*right, bottom), (*right, bottom + height), (*left, bottom + height),
           (u0, v0), (u1, v0), (u1, v1), (u0, v1), mat)


def draw_utility(m, spec, gmin, gmax, mat_idx):
    """Draw class-specific gates on the chosen front and small farm openings, bounded by wall dimensions."""
    kind = utility_kind(spec)
    if kind is None:
        return
    ring = drawn_ring(spec)
    lengths = np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1)
    front = int(spec.front) if spec.front is not None else int(lengths.argmax())
    eave = base_z(spec, gmin, gmax) + spec.height
    mat = mat_idx[f"{SURFACE_MATERIALS['utl']}|0"]
    a, b, length = ring[front], ring[(front + 1) % len(ring)], lengths[front]
    if kind not in ('garage', 'stable', 'barn'):
        _small_access(m, spec, kind, ring, lengths, front, eave, gmax, mat_idx)
        return
    # Limit gates on very long footprints: this is visual inference, not the actual garage unit count.
    count = min(8, max(1, int(length / GARAGE_BAY_M))) if kind == 'garage' else 1
    width = min(2.6 if kind == 'garage' else 3.2 if kind == 'stable' else 4., length / count - 2 * OPENING_MARGIN_M)
    if width >= 1.8:          # Smaller openings no longer read as a vehicle/farm gate.
        for i in range(count):
            along = length * (i + .5) / count
            bottom = door_ground(spec, front, along, gmax)
            height = min(2.4 if kind == 'garage' else 3.2 if kind == 'stable' else 3.8,
                         eave - bottom - OPENING_MARGIN_M)
            if height >= 1.8:
                _panel(m, a, b, along, width, bottom, height, (0 if kind == 'garage' else 1, 0), mat)
    if kind == 'garage':
        return
    budget = 24              # Farm windows/vents remain at most 48 triangles per building.
    for edge, length in enumerate(lengths):
        if edge == front or length < 2.4:
            continue
        count = min(budget, 6, max(1, int(length / 4.)))
        a, b = ring[edge], ring[(edge + 1) % len(ring)]
        for i in range(count):
            along = length * (i + .5) / count
            ground = door_ground(spec, edge, along, gmax)
            height = .65 if kind == 'stable' else .5
            bottom = min(ground + 2., eave - height - OPENING_MARGIN_M)
            if bottom >= ground + .8:
                window_uv, panel_mat = None, mat
                if kind == 'stable':
                    # Reuse the existing four window bays and their random night masks in both Editor and CSP.
                    shift = int(_hash01(spec.seed, edge, i) * 4) / 4
                    u0, u1, v0, v1 = WIN_UV
                    window_uv = (u0 + shift, u1 + shift, v0, v1)
                    panel_mat = mat_idx['bne_bld_fac_white']
                _panel(m, a, b, along, .9, bottom, height, (1, 1), panel_mat, window_uv)
        budget -= count
        if budget == 0:
            break


def _small_access(m, spec, kind, ring, lengths, front, eave, gmax, mat_idx):
    """One personnel door and a few small windows, fitted below the eave on small utility buildings."""
    length = lengths[front]
    bottom = door_ground(spec, front, length / 2, gmax)
    height = min(2.05, eave - bottom - .15)
    width = min(1.05, length - 2 * OPENING_MARGIN_M)
    if height >= 1.7 and width >= .7:
        wood = kind in ('shed', 'hut', 'cabin')
        mat = mat_idx[f"{SURFACE_MATERIALS['utl' if wood else 'ind']}|0"]
        _panel(m, ring[front], ring[(front + 1) % len(ring)], length / 2, width, bottom, height,
               (1, 0) if wood else (0, 1), mat)
    if kind in ('service', 'greenhouse'):
        return
    budget = 6                         # At most twelve extra window triangles even on complex footprints.
    for edge, length in enumerate(lengths):
        if length < 2.4 or (edge == front and kind != 'static_caravan'):
            continue
        if kind == 'shed' and edge != (front + len(ring) // 2) % len(ring):
            continue
        positions = (.22, .78) if kind == 'static_caravan' and length >= 6. else (.5,)
        for fraction in positions:
            if edge == front and fraction == .5:
                continue
            along = length * fraction
            ground = door_ground(spec, edge, along, gmax)
            wh = .45 if kind in ('shed', 'toilets') else .85
            z = eave - wh - .25 if kind == 'toilets' else min(ground + 1.1, eave - wh - .25)
            if z < ground + .6:
                continue
            u0, u1, v0, v1 = WIN_UV
            shift = int(_hash01(spec.seed, edge, fraction) * 4) / 4
            _panel(m, ring[edge], ring[(edge + 1) % len(ring)], along, .8, z, wh, (0, 0),
                   mat_idx['bne_bld_fac_white'], (u0 + shift, u1 + shift, v0, v1))
            budget -= 1
            if not budget:
                return
