"""A building's mesh and collision."""
import numpy as np

import fast

from .looks import (
    BRIDGE_CLASSES, FLOOR_M, FOUNDATION_M, GROUND_FLOOR_SHOP_M, LOOKS, MATERIALS, PANEL, SKIRT_LITE_M, SKIRT_M, STEEL,
    STEEL_BAY_M, STEEL_LEG_MAX, STEEL_TOP_SHARE, _Looks
)
from .styles import _area2, oriented_box, triangulate
from .mesh import (
    Mesh, _box, _clutter, _cornice, _keep, _merlons, _plates, _porch, _roof, _roof_eaves, _signs, _steeple, _stoop, _walls, base_z,
    drawn_ring
)
from .garages import _parking_deck, deck_plan
from .utility import draw_utility
from .industrial import draw_industrial
from .frontages import draw_frontage, prepare_frontage
from .toll import draw_toll

# The engine draws a shape's mesh with 16-bit indices: past 65,535 vertices they wrap and triangles join far-apart
# vertices (the: slabs across a Fells Point street; dense tiles had up to 81k vertices).
MAX_MESH_VERTS = 60000


def _half_polygon(face, normal, offset, positive):
    """A face with interpolated attributes on one side of a 3D plane. Pure."""
    out = []
    prev = face[-1]
    old = float(np.dot(prev[:3], normal) - offset)
    old_in = old >= -1e-8 if positive else old < -1e-8
    for point in face:
        new = float(np.dot(point[:3], normal) - offset)
        new_in = new >= -1e-8 if positive else new < -1e-8
        if old_in != new_in and abs(old - new) > 1e-12:
            out.append(prev + old / (old - new) * (point - prev))
        if new_in:
            out.append(point)
        prev, old, old_in = point, new, new_in
    return out


def _subtract_prism(face, planes):
    """The portions of a mesh face outside one convex vertical prism. Pure."""
    outside, inside = [], face
    for normal, offset in planes:
        if len(inside) < 3:
            break
        piece = _half_polygon(inside, normal, offset, False)
        if len(piece) >= 3:
            outside.append(piece)
        inside = _half_polygon(inside, normal, offset, True)
    return outside


def _part_prisms(cutouts):
    """Convex prisms from (simple part ring, bottom z, top z). Pure."""
    prisms = []
    for ring, bottom, top in cutouts:
        ring = np.asarray(ring, np.float64)
        if len(ring) < 3 or top <= bottom:
            continue
        for tri in triangulate(ring):
            corners = ring[np.asarray(tri, np.int64)]
            if _area2(corners) < 0:
                corners = corners[::-1]
            if abs(_area2(corners)) < 1e-8:
                continue
            planes = []
            for a, b in zip(corners, np.roll(corners, -1, axis=0)):
                edge = b - a
                normal = np.array([-edge[1], edge[0], 0.0])
                planes.append((normal, float(normal[:2] @ a)))
            planes += [(np.array([0.0, 0.0, 1.0]), float(bottom)),
                       (np.array([0.0, 0.0, -1.0]), -float(top))]
            prisms.append((planes, np.min(corners, axis=0), np.max(corners, axis=0), bottom, top))
    return prisms


def _outside_parts(face, prisms):
    """Face fragments outside all part volumes. Pure."""
    pieces = [face]
    for planes, lo, hi, bottom, top in prisms:
        if not pieces:
            break
        next_pieces = []
        for piece in pieces:
            pts = np.asarray(piece)
            if (np.any(pts[:, :2].max(axis=0) < lo - 1e-8)
                    or np.any(pts[:, :2].min(axis=0) > hi + 1e-8)
                    or pts[:, 2].max() < bottom - 1e-8 or pts[:, 2].min() > top + 1e-8):
                next_pieces.append(piece)
            else:
                next_pieces.extend(_subtract_prism(piece, planes))
        pieces = next_pieces
    return pieces


def uncovered_area(ring, ground_parts):
    """Area of a parent footprint outside its grounded part rings, in square metres. Pure."""
    prisms = _part_prisms([(r, 0.0, 1.0) for r in ground_parts])
    area = 0.0
    for tri in triangulate(ring):
        face = [np.array([*p, 0.5]) for p in np.asarray(ring)[tri]]
        for piece in _outside_parts(face, prisms):
            xy = np.asarray(piece)[:, :2]
            area += abs(_area2(xy)) / 2
    return area


def _clip_parent_mesh(mesh, cutouts, marks=None):
    """Remove faces occupied by mapped parts from a parent's visible or collision mesh. Pure.

    Cutting the finished mesh preserves the parent's mapped roof planes and window axes. Raised parts only cut
    at their own height, leaving the parent body underneath as their support. The same operation is used for
    visible and collision geometry, so a shared church wall is not drawn or collided with twice.
    """
    if mesh is None or not cutouts:
        return mesh
    positions, uvs, triangles, materials, palette, colours = mesh
    prisms = _part_prisms(cutouts)
    out_p, out_uv, out_t, out_m, out_c = [], [], [], [], []
    old_marks = list(marks or ())
    new_marks = []
    mark_i = 0
    for triangle, material in zip(triangles, materials):
        while mark_i < len(old_marks) and old_marks[mark_i][0] <= int(min(triangle)):
            new_marks.append((len(out_p), old_marks[mark_i][1]))
            mark_i += 1
        face = [np.concatenate((positions[v], uvs[v], colours[v].astype(np.float64))) for v in triangle]
        for piece in _outside_parts(face, prisms):
            for k in range(1, len(piece) - 1):
                tri = np.asarray((piece[0], piece[k], piece[k + 1]), np.float64)
                if np.linalg.norm(np.cross(tri[1, :3] - tri[0, :3], tri[2, :3] - tri[0, :3])) < 1e-8:
                    continue
                start = len(out_p)
                out_p.extend(tri[:, :3]); out_uv.extend(tri[:, 3:5]); out_c.extend(tri[:, 5:9])
                out_t.append((start, start + 1, start + 2)); out_m.append(material)
    while mark_i < len(old_marks):
        new_marks.append((len(out_p), old_marks[mark_i][1]))
        mark_i += 1
    if marks is not None:
        marks[:] = new_marks
    if not out_p:
        return None
    return (np.asarray(out_p, np.float64), np.asarray(out_uv, np.float64), np.asarray(out_t, np.int64),
            np.asarray(out_m, np.int64), palette, np.rint(np.asarray(out_c)).clip(0, 255).astype(np.uint8))


def _cut_mesh_tail(mesh, start, cutouts):
    """Replace one collision building's newly appended faces with its exposed portion."""
    first_tri = next((i for i, t in enumerate(mesh.T[::3]) if t >= start), len(mesh.M))
    one = (np.asarray(mesh.P[start * 3:], np.float64).reshape(-1, 3),
           np.asarray(mesh.UV[start * 2:], np.float64).reshape(-1, 2),
           np.asarray(mesh.T[first_tri * 3:], np.int64).reshape(-1, 3) - start,
           np.asarray(mesh.M[first_tri:], np.int64), MATERIALS,
           np.asarray(mesh.C[start * 4:], np.uint8).reshape(-1, 4))
    clipped = _clip_parent_mesh(one, cutouts)
    mesh.P[start * 3:] = [] if clipped is None else clipped[0].ravel().tolist()
    mesh.UV[start * 2:] = [] if clipped is None else clipped[1].ravel().tolist()
    mesh.C[start * 4:] = [] if clipped is None else clipped[5].ravel().tolist()
    mesh.T[first_tri * 3:] = [] if clipped is None else (clipped[2] + start).ravel().tolist()
    mesh.M[first_tri:] = [] if clipped is None else clipped[3].tolist()
    mesh.n = start + (0 if clipped is None else len(clipped[0]))


def build(specs_and_ground, lite=False, marks=None):
    """The tile's mesh from [(Spec, ground z min, ground z max)] with rings in the tile's local frame:
    (positions, uvs, tris, tri material indices, MATERIALS) or None if empty. lite (far tiles): no
    cornices, whole walls instead of one quad per bay. marks: a list that gets Mesh.marks."""
    m = Mesh()
    for spec, gmin, gmax in specs_and_ground:
        if spec.toll is not None:
            draw_toll(m, spec.toll, gmin, lite=lite)
            continue
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
        if spec.cls in ('shelter', 'roof', 'carport'):
            _open_shelter(m, spec, ring, z0, z_eave, mat_idx, lite)
            continue
        prepare_frontage(spec)
        _walls(m, spec, ring, z0, z_eave, mat_idx, lite)
        if not lite:
            draw_utility(m, spec, gmin, gmax, mat_idx)
            draw_industrial(m, spec, gmin, gmax, mat_idx)
            draw_frontage(m, spec, gmin, gmax, mat_idx)
        if mh > 0.5:                                  # a part standing on another / over a street: its underside
            m.poly([(p[0], p[1], z0) for p in ring[::-1]], [(0.002, 0.995)] * len(ring), mat_idx[spec.facade])
        first_vertex, first_index = m.n, len(m.T)
        _roof(m, spec, ring, z_eave, mat_idx)
        if spec.roof != "flat" and not lite:
            _roof_eaves(m, ring, first_vertex, first_index, mat_idx[spec.facade])
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
        m.mark(None)
    if marks is not None:
        marks.extend(m.marks)
    if m.n == 0:
        return None
    P, UV, T, M, C = m.arrays()
    return P, UV, T, M, MATERIALS, C


def _open_shelter(m, spec, ring, z0, z_eave, mat_idx, lite=False):
    """Roof and narrow posts for mapped open shelters; shared by visible and collision geometry."""
    # Approximate support positions on the mapped boundary, bounded even on detailed outlines.
    # 26 cm square posts are a visual fallback; mapped engineering dimensions are unavailable.
    centre = np.mean(ring, axis=0)
    for i in np.linspace(0, len(ring), min(16, len(ring)), endpoint=False, dtype=int):
        p = ring[i]
        inward = centre - p
        inward /= max(float(np.linalg.norm(inward)), 1e-6)
        _box(m, p + inward * .18, np.array([1., 0.]), .13, .13, z0, z_eave, mat_idx[spec.facade])
    start_vertex, start_index = m.n, len(m.T)
    _roof(m, spec, ring, z_eave, mat_idx)
    # The roof is seen from below through the open sides, in the Editor and AC's back-face-culling renderer.
    positions = np.array(m.P[start_vertex * 3:]).reshape(-1, 3)
    uvs = np.array(m.UV[start_vertex * 2:]).reshape(-1, 2)
    triangles = np.array(m.T[start_index:]).reshape(-1, 3) - start_vertex
    for triangle in triangles:
        a, b, c = triangle[::-1]
        m.tri(positions[a], positions[b], positions[c], uvs[a], uvs[b], uvs[c], mat_idx[spec.roof_mat])
    if spec.roof != 'flat' and not lite:
        _roof_eaves(m, ring, start_vertex, start_index, mat_idx[spec.facade])


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


def collision_mesh(specs_and_ground, starts=None):
    """The tile's buildings for physics only: one quad per wall and a flat lid at the eaves (pitched roofs on their
    oriented box), parking decks as drawn; (positions, uvs, tris, tri materials, MATERIALS, colours) or None.
    The drawn mesh (windows a quad per bay and floor, cornices, signs) cost the game's collision rebuild ~30 ms of
    a 40 ms rebuild in Fells Point, every few seconds while driving; this one is ~1/20 of its triangles. starts: a list that gets
    the vertices so far at each building, for the track's list."""
    m = Mesh()
    tok = (MATERIALS.index(PANEL), (128, 128, 128, 255))
    zero = (0.0, 0.0)
    for spec, gmin, gmax in specs_and_ground:
        start = m.n
        if starts is not None:
            starts.append(m.n)
        if spec.toll is not None:
            draw_toll(m, spec.toll, gmin, collision=True)
            continue
        if spec.cls in BRIDGE_CLASSES:          # its legs (the decks run between them)
            _steel_frame(m, spec, gmin, tok, True, legs_only=True)
            continue
        if spec.cls in ('shelter', 'roof', 'carport'):
            mh = spec.min_h or 0.
            base = base_z(spec, gmin, gmax)
            _open_shelter(m, spec, drawn_ring(spec), gmin - FOUNDATION_M if mh <= .5 else base + mh,
                          base + mh + spec.height, _Looks(spec.seed), True)
            continue
        if deck_plan(spec, gmin, gmax) is not None:
            _parking_deck(m, spec, gmin, gmax, _Looks(spec.seed))
            continue
        ring = np.asarray(drawn_ring(spec), np.float64)
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
        if spec.cutouts:
            _cut_mesh_tail(m, start, spec.cutouts)
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


def _listed(k, item, start, marks):
    """What the track's list of objects needs of building number k of the tile: its first vertex in its mesh, where it stands, its
    footprint, what its marks say; a bridge's parts are no house and can't be deleted for now ("house" False). Pure."""
    spec, gmin, _gmax = item
    ring = np.asarray(spec.ring, np.float64)
    mid = ring.mean(axis=0)
    return {"item": k, "start": start, "house": not str(spec.cls or "").startswith("bridge"), "at": [round(float(mid[0]), 3), round(float(mid[1]), 3), round(float(gmin), 3)],
            "marks": [[start + v, what] for v, what in marks],
            "details": {"asset": "generated-building", "footprint": ring.round(3).tolist(),
                        "parameters": {name: getattr(spec, name, None) for name in
                                       ("cls", "floors", "floor_h", "height", "roof", "roof_mat", "roof_height",
                                        "roof_direction", "roof_orientation", "architecture", "facade", "pitch", "min_h", "seed")}}}


def build_parts(specs_and_ground, lite=False, max_verts=MAX_MESH_VERTS, with_lod=False, objects=None):
    """build() split into meshes of at most max_verts vertices each (whole buildings per mesh): a list, [] if empty.
    Each building is built once (build draws them one by one) and the meshes joined. with_lod: each mesh carries the
    lite mesh of its buildings as a 7th element (write: the shape's coarse detail). objects: a list that gets per mesh its
    buildings as _listed says them."""
    parts, cur, cur_lite, n, listed = [], [], [], 0, []

    def flush():
        if cur:
            mesh = _concat(cur)
            parts.append(mesh + (_concat(cur_lite) if cur_lite else None,) if with_lod and not lite else mesh)
            if objects is not None:
                objects.append(listed[:])

    for k, item in enumerate(specs_and_ground):
        marks = []
        one = build([item], lite, marks)
        if one is not None and item[0].cutouts:
            one = _clip_parent_mesh(one, item[0].cutouts, marks)
        if one is None:
            continue
        if cur and n + len(one[0]) > max_verts:
            flush()
            cur, cur_lite, n, listed = [], [], 0, []
        listed.append(_listed(k, item, n, marks))
        cur.append(one)
        n += len(one[0])
        if with_lod and not lite:
            o = build([item], lite=True)
            if o is not None and item[0].cutouts:
                o = _clip_parent_mesh(o, item[0].cutouts)
            if o is not None:
                cur_lite.append(o)
    flush()
    return parts
