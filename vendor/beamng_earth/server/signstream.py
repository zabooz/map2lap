"""Highway signs (from cody196's PR #363): optional scenery built per road tile after the tile's roads were sent,
never part of their collision or readiness. A sign tile is sent as a `roads_tile` with key "s<tx>_<ty>" and the
fields exits / mileposts / merges / speeds / towns (render-only shapes, pooled slots); the mod's highwaySigns setting
hides them.

Every guide sign face is drawn to the US MUTCD (green guide panels, Interstate / US / state shields, the yellow merge
diamond, Interstate mile markers): those are built where signstates finds a US state (BNE_SIGNS_WORLD=1: everywhere,
for tests), elsewhere no sign data is asked for. The speed-limit signs (speedsigns.py, field speeds: the AI's limit, in
each region's style) and the town signs (townsigns.py, field towns) are built everywhere."""
import json
import logging
import os
import time

import numpy as np

import highwaysigns
import mergesigns
import roadmesh
import roads
import signstates
import speedsigns
import staging
import townsigns

log = logging.getLogger('earthd.signs')
KINDS = ('exits', 'mileposts', 'merges', 'speeds', 'towns')
WORLD = os.environ.get("BNE_SIGNS_WORLD") == "1"


def shape_files(aid, tx, ty):
    return {kind: f'{kind}_{aid}_{tx}_{ty}.cdae' for kind in KINDS}


def write_tile(out_dir, vfs_dir, aid, tx, ty, meshes):
    x, y, _, _ = roads.tile_bbox(tx, ty)
    data = {'v': roads.VERSION, 'chunks': []}
    for kind, mesh in zip(KINDS, meshes):
        if mesh is None:
            continue
        name = shape_files(aid, tx, ty)[kind]
        roadmesh.write(os.path.join(out_dir, name), mesh)
        data[kind] = {'shape': f'{vfs_dir}/{name}', 'pos': [x, y, 0.]}
    # An empty replacement is intentional: it retires signs from an older index.
    name = f'signs_{aid}_{tx}_{ty}.json'
    path = os.path.join(out_dir, name)
    tmp = staging.tmp_for(path)
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(json.dumps(data, separators=(',', ':')))
    staging.replace(tmp, path)
    return f'{vfs_dir}/{name}', len(data) - 2


def build_tile(md, frame, aid, tx, ty, elev, out_dir, vfs_dir, urban=None, widths=None,
               left_hand=False, mph=True, country=None):
    source = getattr(md, 'highway_signs', None)
    if source is None:
        return None
    x0, y0, x1, y1 = roads.tile_bbox(tx, ty)
    la, lo, _ = frame.enu_to_geodetic(np.array([x0, x1]), np.array([y0, y1]), 0.)
    us = bool((signstates.states(la, lo) != '').any())
    context = source.context(urban, widths)
    feats = context.around(np.c_[lo, la])
    # Conservative deck footprints exclude ground signs on/under overpasses without
    # rebuilding road meshes or solving bridge heights in this optional queue.
    decks = []
    for i, spec in enumerate(roads.bridge_specs(feats)):
        if spec is None:
            continue
        for ring in roads.bridge_parts(feats, i):
            if len(ring) >= 2:
                pts = np.column_stack(frame.geodetic_to_enu(ring[:, 1], ring[:, 0], 0.))
                decks.append({'deck': True, 'n': pts, 'w': spec.width})
    speeds = _speeds(frame, tx, ty, elev, context, decks, left_hand, mph, speedsigns.style(country, us))
    towns = _towns(frame, tx, ty, elev, context, md, decks, left_hand)
    if not (WORLD or us):
        return write_tile(out_dir, vfs_dir, aid, tx, ty, (None, None, None, speeds, towns))  # (not the US: no guide signs)
    exits, miles = highwaysigns.build_tile(md, frame, tx, ty, elev, decks, left_hand, mph, urban, widths)
    merges = mergesigns.build_tile(frame, tx, ty, [feats], elev, decks, urban, widths, left_hand, context)
    return write_tile(out_dir, vfs_dir, aid, tx, ty, (exits, miles, merges, speeds, towns))


_warned = -float('inf')


def _speeds(frame, tx, ty, elev, context, decks, left_hand, mph, face):
    """speedsigns.build_tile, or None: optional scenery never stops the other signs."""
    global _warned
    try:
        return speedsigns.build_tile(frame, tx, ty, elev, context, decks, left_hand, mph, face)
    except Exception as error:
        now = time.monotonic()
        if now - _warned >= 60.:
            _warned = now
            log.warning('Speed-limit signs unavailable; roads continue: %s: %s', type(error).__name__, error)
        return None


def _towns(frame, tx, ty, elev, context, md, decks, left_hand):
    """townsigns.build_tile, or None: optional scenery never stops the other signs."""
    global _warned_towns
    try:
        return townsigns.build_tile(frame, tx, ty, elev, context, md, decks, left_hand)
    except Exception as error:
        now = time.monotonic()
        if now - _warned_towns >= 60.:
            _warned_towns = now
            log.warning('Town signs unavailable; roads continue: %s: %s', type(error).__name__, error)
        return None


_warned_towns = -float('inf')


