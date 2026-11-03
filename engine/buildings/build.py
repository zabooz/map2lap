"""A building's mesh and collision."""
import numpy as np

import fast

from .looks import (
    BRIDGE_CLASSES, FLOOR_M, FOUNDATION_M, GROUND_FLOOR_SHOP_M, LOOKS, MATERIALS, PANEL, SKIRT_LITE_M, SKIRT_M, STEEL,
    STEEL_BAY_M, STEEL_LEG_MAX, STEEL_TOP_SHARE, _Looks
)
from .styles import _area2, oriented_box
from .mesh import (
    Mesh, _box, _clutter, _cornice, _keep, _merlons, _plates, _porch, _roof, _signs, _steeple, _stoop, _walls, base_z,
    drawn_ring
)
from .garages import _parking_deck, deck_plan

# The engine draws a shape's mesh with 16-bit indices: past 65,535 vertices they wrap and triangles join far-apart
# vertices (the: slabs across a Fells Point street; dense tiles had up to 81k vertices).
MAX_MESH_VERTS = 60000


def build(specs_and_ground, lite=False):
    """The tile's mesh from [(Spec, ground z min, ground z max)] with rings in the tile's local frame:
    (positions, uvs, tris, tri material indices, MATERIALS) or None if empty. lite (far tiles): no
    cornices, whole walls instead of one quad per bay."""
    m = Mesh()
    for spec, gmin, gmax in specs_and_ground:
        if spec.cls == "toll_booth":        # a stock prop (toll_booth_rows)
            continue
        mat_idx = _Looks(spec.seed)
        if spec.cls in BRIDGE_CLASSES:
            _steel_frame(m, spec, gmin, mat_idx[spec.facade if spec.facade in LOOKS else STEEL], lite)
            continue
        ring = drawn_ring(spec)
        mh = spec.min_h or 0.0
        if spec.deck and not lite and _parking_deck(m, spec, gmin, gmax, mat_idx):
            continue
        z0 = gmin - (SKIRT_LITE_M if lite else SKIRT_M) if mh <= 0.5 else base_z(spec, gmin, gmax) + mh
        z_eave = base_z(spec, gmin, gmax) + mh + spec.height
        _walls(m, spec, ring, z0, z_eave, mat_idx, lite)
        if mh > 0.5:                                  # a part standing on another / over a street: its underside
            m.poly([(p[0], p[1], z0) for p in ring[::-1]], [(0.002, 0.995)] * len(ring), mat_idx[spec.facade])
        _roof(m, spec, ring, z_eave, mat_idx)
        if spec.roof == "flat" and not spec.plain and spec.floors <= 6 and not lite:
            _cornice(m, spec, ring, z_eave, mat_idx)
        if not lite:
            _clutter(m, spec, ring, z_eave, mat_idx)
        if spec.steeple:
            _steeple(m, spec, z_eave, mat_idx)
        if spec.castle and not lite:
            if spec.roof == "flat":
                _merlons(m, ring, z_eave, mat_idx[spec.facade], spec.seed, ragged=spec.castle == "ruins")
            if spec.castle == "castle":
                _keep(m, spec, z_eave, mat_idx)
        if spec.stoop and not lite:
            _stoop(m, spec, ring, gmin, gmax, mat_idx)
        if spec.porch and spec.door and not lite:
            _porch(m, spec, gmax, mat_idx)
        plates = spec.plates or ()
        if spec.sign is not None and not lite:
            if spec.windows is False:           # a big box: over its storefront band (_plain_wall_with_windows)
                z_top = min(gmax + GROUND_FLOOR_SHOP_M + 1.15, z_eave)
            else:
                z_top = z_eave - (spec.floors - 1) * spec.floor_h if spec.floors > 1 else z_eave
            names = tuple(spec.names or ())     # (a hotel's, a town hall's or an office's name on a band of its own)
            names += tuple(t for s, t, _ in plates if s in ("panel", "plate") and t not in names)
            _signs(m, spec, ring, z_top, mat_idx, base_z(spec, gmin, gmax) + mh, z_eave, names)
        if plates and not lite and (spec.plate is not None or spec.sign is not None):
            _plates(m, spec, ring, base_z(spec, gmin, gmax) + mh, z_eave, mat_idx, bands=spec.sign is not None)
    if m.n == 0:
        return None
    P, UV, T, M, C = m.arrays()
    return P, UV, T, M, MATERIALS, C


def _steel_frame(m, spec, gmin, mat, lite=False, legs_only=False):
    """A bridge structure (BRIDGE_CLASSES) as an open steel frame on its oriented box: a leg at each corner, bracing
    along the short sides every STEEL_BAY_M (beside the decks running along them), cross beams over the long sides
    only near the top (STEEL_TOP_SHARE, over any deck); a narrow footprint is one pier. lite: legs and top only."""
    c, u, hl, hw = oriented_box(np.asarray(spec.ring, np.float64))
    v = np.array([-u[1], u[0]])
    z0, z1 = gmin - FOUNDATION_M, gmin + spec.height
    if hl < 6.0:                                            # a pier
        _box(m, c, u, hl, hw, z0, z1, mat)
        return
    if hw < 3.0:    # a thin wall across the decks (the Queensboro Bridge's towers, 33 x 4.6 m): a leg at each end
        t = float(min(hw, STEEL_LEG_MAX))
        for sx in (-1, 1):
            _box(m, c + u * sx * (hl - t), u, t, hw, z0, z1, mat)
        if not legs_only:
            b = t * 0.6
            top = gmin + STEEL_TOP_SHARE * spec.height
            for z in [z1 - b] + ([] if lite else list(np.arange(z1 - b - STEEL_BAY_M / 2, top, -STEEL_BAY_M / 2))):
                _box(m, c, u, hl - 2 * t, b, z - b, z + b, mat)
        return
    t = float(np.clip(hw * 0.5, 0.5, STEEL_LEG_MAX))        # leg half size
    corners = [c + u * sx * (hl - t) + v * sy * (hw - t) for sx in (-1, 1) for sy in (-1, 1)]
    for k in corners:
        _box(m, k, u, t, t, z0, z1, mat)
    if legs_only:
        return
    b = t * 0.6                                             # beam half size
    levels = [z1 - b] if lite else list(np.arange(gmin + STEEL_BAY_M, z1 - b, STEEL_BAY_M)) + [z1 - b]
    for z in levels:
        for sx in (-1, 1):          # along the short sides (along v): beside a deck running through the frame
            _box(m, c + u * sx * (hl - t), v, hw - 2 * t, b, z - b, z + b, mat)
        if z >= gmin + STEEL_TOP_SHARE * spec.height:       # across the top only
            for sy in (-1, 1):
                _box(m, c + v * sy * (hw - t), u, hl - 2 * t, b, z - b, z + b, mat)


def collision_mesh(specs_and_ground):
    """The tile's buildings for physics only: one quad per wall and a flat lid at the eaves (pitched roofs on their
    oriented box), parking decks as drawn; (positions, uvs, tris, tri materials, MATERIALS, colours) or None.
    The drawn mesh (windows a quad per bay and floor, cornices, signs) cost the game's collision rebuild ~30 ms of
    a 40 ms rebuild in Fells Point, every few seconds while driving; this one is ~1/20 of its triangles."""
    m = Mesh()
    tok = (MATERIALS.index(PANEL), (128, 128, 128, 255))
    zero = (0.0, 0.0)
    for spec, gmin, gmax in specs_and_ground:
        if spec.cls in BRIDGE_CLASSES:          # its legs (the decks run between them)
            _steel_frame(m, spec, gmin, tok, True, legs_only=True)
            continue
        if deck_plan(spec, gmin, gmax) is not None:
            _parking_deck(m, spec, gmin, gmax, _Looks(spec.seed))
            continue
        ring = np.asarray(spec.ring, np.float64)
        if spec.roof != "flat":
            c, u, hl, hw = oriented_box(ring)
            v = np.array([-u[1], u[0]])
            ring = np.array([c - u * hl - v * hw, c + u * hl - v * hw, c + u * hl + v * hw, c - u * hl + v * hw])
        if _area2(ring) < 0:
            ring = ring[::-1]
        mh = spec.min_h or 0.0
        z0 = gmin - FOUNDATION_M if mh <= 0.5 else base_z(spec, gmin, gmax) + mh
        z1 = base_z(spec, gmin, gmax) + mh + spec.height
        for i in range(len(ring)):
            a, b = ring[i], ring[(i + 1) % len(ring)]
            m.quad((a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], z1), (a[0], a[1], z1), zero, zero, zero, zero, tok)
        m.poly([(p[0], p[1], z1) for p in ring], [zero] * len(ring), tok)
        if mh > 0.5:                # over a street: its underside
            m.poly([(p[0], p[1], z0) for p in ring[::-1]], [zero] * len(ring), tok)
    if m.n == 0:
        return None
    P, UV, T, M, C = m.arrays()
    return P, UV, T, M, MATERIALS, C


# ------------------------------------------------------------------------------------------- a tile


def _shared_walls(rings, tol=0.6):
    """Per ring, the number of other rings with a vertex within tol of one of its edges (row houses)."""
    n = len(rings)
    cnt = np.zeros(n, np.int64)
    if n < 2:
        return cnt
    cents = np.array([r.mean(0) for r in rings])
    rads = np.array([np.hypot(*(r - r.mean(0)).T).max() for r in rings])
    order = np.argsort(cents[:, 0])
    fast.require(1, "shared_walls")
    offs = np.zeros(n + 1, np.int64)
    offs[1:] = np.cumsum([len(r) for r in rings])
    coords = np.ascontiguousarray(np.concatenate(rings)[:, :2], np.float64)
    return np.asarray(fast._ef.shared_walls(coords, offs, np.ascontiguousarray(cents, np.float64),
                                            np.ascontiguousarray(rads, np.float64), order.astype(np.int64),
                                            float(tol)), np.int64)


def _part_heights(a, i):
    """A building part's (own height, its bottom) from its attributes, or None without a height."""
    top = a["height"][i] if "height" in a else np.nan
    mh = a["min_height"][i] if "min_height" in a else np.nan
    mh = float(mh) if np.isfinite(mh) and mh > 0 else 0.0
    if not np.isfinite(top) or top <= mh + 1.0:
        nf, f0 = (a[k][i] if k in a else np.nan for k in ("num_floors", "min_floor"))
        if np.isfinite(nf) and nf > 0:
            f0 = float(f0) if np.isfinite(f0) and f0 > 0 else 0.0
            mh = mh or f0 * FLOOR_M
            return max(FLOOR_M, (float(nf) - f0) * FLOOR_M), mh
        return None
    return float(top) - mh, mh


def _concat(meshes):
    """build() meshes (the same MATERIALS) as one."""
    if len(meshes) == 1:
        return meshes[0]
    off = np.cumsum([0] + [len(m[0]) for m in meshes[:-1]])
    return (np.concatenate([m[0] for m in meshes]), np.concatenate([m[1] for m in meshes]),
            np.concatenate([m[2] + o for m, o in zip(meshes, off)]), np.concatenate([m[3] for m in meshes]),
            meshes[0][4], np.concatenate([m[5] for m in meshes]))


def build_parts(specs_and_ground, lite=False, max_verts=MAX_MESH_VERTS, with_lod=False):
    """build() split into meshes of at most max_verts vertices each (whole buildings per mesh): a list, [] if empty.
    Each building is built once (build draws them one by one) and the meshes joined. with_lod: each mesh carries the
    lite mesh of its buildings as a 7th element (write: the shape's coarse detail)."""
    parts, cur, cur_lite, n = [], [], [], 0

    def flush():
        if cur:
            mesh = _concat(cur)
            parts.append(mesh + (_concat(cur_lite) if cur_lite else None,) if with_lod and not lite else mesh)

    for item in specs_and_ground:
        one = build([item], lite)
        if one is None:
            continue
        if cur and n + len(one[0]) > max_verts:
            flush()
            cur, cur_lite, n = [], [], 0
        cur.append(one)
        n += len(one[0])
        if with_lod and not lite:
            o = build([item], lite=True)
            if o is not None:
                cur_lite.append(o)
    flush()
    return parts
