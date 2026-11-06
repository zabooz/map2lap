"""One tile: build_tile, write_tile and what collides."""
import json
import math
import os

import numpy as np

import junctions
import mapgeom
import staging

from .style import (
    BUILT, CENTRE, DRAIN, DRAIN_EVERY, DRAIN_IN, EDGE_DECAL, EDGE_DECAL_GAP_M, EDGE_LINE, GUTTER, LADDER_LINE_W,
    OVERLAP, ROADS_IN_GROUND, SIDEWALK, VERSION, look_of, terrain_surface
)
from .tags import _rule_value
from .specs import is_ring, road_specs
from .levels import bridge_specs, ground_parts
from .tiles import _along, _chunk, box_owns, lane_layout, lane_tags, split, tile_bbox
from .walks import (
    _on_level, clip_polyline, cut_outside, densify, drape_walks, extras, has_sidewalks, join_walk_ends, offset_polyline,
    sidewalk_stop, simplify
)
from .bridges import NEAR_M
from .deckmesh import _bridge_chunks, _corner_look
from .tunnels import _tunnel_chunks
from .walls import _off_wall_tops, cliff_rows, retaining_walls


CUT_MARGIN = 0.5                # m: a sidewalk / line stops this far outside a crossing road's carriageway
COVER_MARGIN_M = 30.0   # m past the tile: the ground carriageways a deck's parapet is tested against (build_tile cover_out)


def _on_box(p, box, eps=1e-6):
    x0, y0, x1, y1 = box
    return abs(p[0] - x0) < eps or abs(p[0] - x1) < eps or abs(p[1] - y0) < eps or abs(p[1] - y1) < eps


def drains(run, side, caps, walk_w=None):
    """The storm drain chunks along a sidewalk run (k, 3) on `side` of its road: DRAIN_IN m before its
    end if that is a real end (caps: (start, end) real) and every DRAIN_EVERY m along it. Pure."""
    import sidewalks
    curb, out = sidewalks.run_geometry(run, side, walk_w or SIDEWALK["w"])
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(curb[:, :2], axis=0).T))]
    L = s[-1]
    if L < 2 * DRAIN_IN:
        return []
    at = []
    if caps[1]:
        at.append(L - DRAIN_IN)
    if L > DRAIN_EVERY * 1.5:
        at += list(np.arange(DRAIN_EVERY, L - DRAIN_EVERY / 2, DRAIN_EVERY))
    res = []
    for a in sorted(at):
        pts = []
        for d in (a - DRAIN["len"] / 2, a + DRAIN["len"] / 2):
            x = np.interp(d, s, curb[:, 0])
            y = np.interp(d, s, curb[:, 1])
            z = np.interp(d, s, curb[:, 2])
            k = min(int(np.searchsorted(s, d)), len(s) - 1)
            o = out[k] / max(np.hypot(*out[k]), 1e-9)
            pts.append([x - o[0] * (GUTTER["w"] / 2), y - o[1] * (GUTTER["w"] / 2), z])
        res.append(_chunk(DRAIN, DRAIN["w"], np.array(pts)))
    return res


GOING_ON_DEG = 20.0     # a road whose end meets another's end turning by under this (the straightest there) goes on in it


def _going_on(roads):
    """{(fid, fid2)} (both ways) of the roads [(fid, spec, pts (k, 3), lon)] whose gravel edge decals need not keep
    EDGE_DECAL_GAP_M off each other's carriageway (meant for a ramp's gore, it left a ~10 m gap on the far side of every
    T junction, Carroll County MD): roads at one junction node, not both one-way (a merge's or a
    diverge's gore keeps it) and the second without sidewalks (its slab's end), and a road going on in another at a
    shared end (the map splits a road at every junction:
    the straightest of each other's there). Pure."""
    import junctions
    ends = {}                                   # node key -> [(fid, outward unit direction)]
    at_node = {}                                # node key -> {fid: one-way}
    for fid, sp, pts, _ in roads:
        if len(pts) < 2 or sp.kind not in BUILT:
            continue
        keys = np.round(np.asarray(pts[:, :2], np.float64) / junctions.NODE_TOL).astype(np.int64)
        for key in {(int(a), int(b)) for a, b in keys}:
            at_node.setdefault(key, {})[fid] = (bool(sp.oneway), has_sidewalks(sp))
        for a, b in ((0, 1), (-1, -2)):
            d = pts[a, :2] - pts[b, :2]
            n = math.hypot(d[0], d[1])
            if n > 1e-6:
                ends.setdefault((int(keys[a, 0]), int(keys[a, 1])), []).append((fid, d / n))
    out = set()
    for key in sorted(at_node):
        fids = at_node[key]
        if len(fids) >= 2:
            for f1 in fids:
                for f2 in fids:
                    if f1 != f2 and not (fids[f1][0] and fids[f2][0]) and not fids[f2][1]:
                        out.add((f1, f2))       # (f1's decal by f2: up to f2's curb when it has one)
    lim = -math.cos(math.radians(GOING_ON_DEG))
    for key in sorted(ends):
        at = ends[key]
        best = {}
        for fid, u in at:
            # the straightest other road ending here: going on is turning least (outward directions opposite)
            got = min(((float(u @ v), f2) for f2, v in at if f2 != fid), default=None)
            if got is not None and got[0] <= lim:
                best[fid] = got[1]
        for fid, f2 in best.items():
            if best.get(f2) == fid:             # each the other's (a ramp leaving a motorway is not its going on)
                out.add((fid, f2))
                out.add((f2, fid))
    return out


GALLERY_STEP_M = 2.0       # m between a gallery's samples (the terrain's grid: its road's height follows it)
GALLERY_SLOPE_M = 6.0      # m past the road's edge where the ground tells a gallery's mountain side from its valley side


def tile_galleries(frame, tunnels, cells, elev, box):
    """The avalanche galleries' roofs (TunnelProfiles.roofs: their covered sections, GALLERY_KIND) of the tunnels
    (a TunnelProfiles or ChainView) in cells, cut to the tile's box: [{"pts": (k, 5) east, north, up, metres along
    the section, up of the ground under its pillars, "w": the road's width, "side": +1 when the mountain is on the left
    of the line, -1 on the right}]. The height is the tunnel's floor (the road's, drawn there and the ground graded to
    it); the mountain side the one where the ground (elev) GALLERY_SLOPE_M past the road's edge lies higher (a
    gallery leans against its slope); the pillars stand on the ground on the other (below the road where the slope
    falls away: they reach down to it, not hang in the air)."""
    import roadmesh
    if tunnels is None or getattr(tunnels, "open_parts", None) is None:
        return []
    opened = sorted(tunnels.open_parts(cells, box), key=lambda p: p[0])
    roofs = tunnels.roofs if opened else {}         # (solved by open_parts)
    out = []
    pillar = roadmesh.GALLERY_SHOULDER_M + roadmesh.GALLERY_PILLAR_W / 2
    for fid, spec, xy, z, _lon in opened:
        if fid not in roofs or not np.isfinite(z).all():
            continue
        pts = densify(np.c_[np.asarray(xy, np.float64)[:, :2], np.asarray(z, np.float64)], GALLERY_STEP_M)
        xy = pts[:, :2]
        if len(xy) < 2 or xy[:, 0].max() < box[0] or xy[:, 0].min() > box[2] or xy[:, 1].max() < box[1]                 or xy[:, 1].min() > box[3]:
            continue
        t = np.gradient(xy, axis=0)
        t /= np.maximum(np.hypot(t[:, 0], t[:, 1]), 1e-9)[:, None]
        left = np.c_[-t[:, 1], t[:, 0]]
        reach, at = spec.width / 2 + GALLERY_SLOPE_M, spec.width / 2 + pillar
        q = np.concatenate([xy + left * reach, xy - left * reach, xy + left * at, xy - left * at])
        la, lo, _ = frame.enu_to_geodetic(q[:, 0], q[:, 1], 0.0)
        la, lo = np.asarray(la, np.float64), np.asarray(lo, np.float64)
        up = np.asarray(frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2], np.float64)
        k = len(xy)
        side = 1.0 if float(np.mean(up[:k] - up[k:2 * k])) >= 0.0 else -1.0
        foot = up[3 * k:] if side > 0 else up[2 * k:3 * k]      # (the valley side's)
        s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
        for piece in clip_polyline(np.c_[pts, s, foot], *box):
            if len(piece) >= 2:
                out.append({"pts": piece, "w": float(spec.width), "side": side})
    return out


def build_tile(frame, tx, ty, cells, elev, urban_fn=None, walks=None, bridges=None, widths=None, props=None,
               lines=None, wires=None, town=None, park=None, left_hand=False, structures=(), mph=True, tunnels=None,
               buried=0.0, lamp_region=None, country=None,
               walls=None, deck_context=None, ground=None, terrain_paint=True, cover_out=None, walk_cuts=(),
               signals=None, marks=None, roads_out=None, skin_margin=0.0, walks_raw=None, galleries=None,
               aisles_out=None, wall_cuts=None):
    """The chunks of one tile. wall_cuts: a list that gets the lines the ground is cut along (retaining_walls' cut_lines). cells: the mapgeom.Features of the "roads" layer of every cell touching
    the tile; elev(lat, lon) -> metres (the DEM); urban_fn: as road_specs. Features in several cells are
    taken once (by id). The carriageways, then each road's sidewalks / gutters / markings (extras), cut
    where another road's carriageway crosses them. walks: a list that gets the sidewalk runs (dicts
    pts / side / caps, clipped exactly to the tile, caps: whether each end is a real end) for the
    sidewalk mesh (sidewalks.py) and storm drains among the chunks; None: sidewalks as decals.
    bridges: a BridgeProfiles (deck heights of whole chains, shared by every tile); None: from the
    chains among these cells. ground(x, y) -> z: the terrain block's drawn ground in the frame, the sidewalks' heights
    (drape_walks); None: elev's. walk_cuts: [(centreline (k, 2), half width)] where no sidewalk runs (a gas station's
    made-up driveway: gasstations.tile_sites cuts). roads_out: a list that gets the ground carriageways near the tile
    ((fid, spec, centreline (k, 3), lon): the median barriers', medians.tile_rows). skin_margin (m, a geotile's content:
    blockworker.roads_geo): the draped surfaces' pieces (sidewalk runs and corners, markings, crosswalks, corner fills)
    taken this far past the tile's box, its own, the skin clipping them exactly at the tile's quad in the anchor's
    world (a seam-straddling crosswalk drawn by both tiles, each its half); walks_raw: a list that gets the sidewalk
    pieces before they are put on the ground (the skin drapes them on its anchor's). galleries: a list that gets the
    tile's avalanche galleries (tile_galleries: their roofs, roadmesh.tunnel). aisles_out: a set that gets the fids of
    roads_out's parking aisles (parking.through_roads). Pure given its inputs (sorted by feature id)."""
    own_box = tile_bbox(tx, ty)                 # (a geotile's knows its own points: box_owns)
    x0, y0, x1, y1 = own_box
    box = (x0 - OVERLAP, y0 - OVERLAP, x1 + OVERLAP, y1 + OVERLAP)
    near = (x0 - NEAR_M, y0 - NEAR_M, x1 + NEAR_M, y1 + NEAR_M)
    seen, bseen = {}, {}
    for feats in cells:
        if feats is None or len(feats) == 0:
            continue
        specs = road_specs(feats, urban_fn, widths, left_hand)
        bspecs = bridge_specs(feats)
        for i in range(len(feats)):
            if bspecs[i] is not None and str(feats.ids[i]) not in bseen:
                bseen[str(feats.ids[i])] = (feats, i, bspecs[i])
            if specs[i] is None or str(feats.ids[i]) in seen:
                continue
            seen[str(feats.ids[i])] = (feats, i, specs[i])
    rings = []                                  # (fid, spec, lon/lat ring) near the tile (xy at h = 0)
    for fid in sorted(seen):
        feats, i, spec = seen[fid]
        fb = feats.boxes(frame)[i]          # (the whole feature far from the tile: none of its parts is near)
        if fb[2] < near[0] or fb[0] > near[2] or fb[3] < near[1] or fb[1] > near[3]:
            continue
        for ring in ground_parts(feats, i):
            e, n = mapgeom.enu_xy(feats, frame, ring)
            if (e.max() < near[0] or e.min() > near[2] or n.max() < near[1] or n.min() > near[3]):
                continue
            rings.append((fid, spec, ring))
    if galleries is not None:
        galleries.extend(tile_galleries(frame, tunnels, cells, elev, own_box))
    roads = []                                  # (fid, spec, centreline (k, 3), lon) near the tile
    if rings:                                   # one elevation call for every ring (the grader's cost
        lon = np.concatenate([r[:, 0] for _, _, r in rings])     # is per call: profile,
        lat = np.concatenate([r[:, 1] for _, _, r in rings])     # 1,240 calls took 7 of a tile's 8 s)
        h = np.asarray(elev(lat, lon), np.float64)
        # east / north of the point at h = 0, as the ground's (heightmap.surface: its samples' lat / lon at plane
        # z 0) and every outline's (mapgeom.enu_xy); up of the point at its height. At its height the point lands
        # h x distance / earth radius farther out: US-163 in Utah at 1650 m, 13 km out, the lines lay 2.8 m east and
        # 2.0 m north of the asphalt and grip painted into the ground
        e, n, _ = frame.geodetic_to_enu(lat, lon, 0.0)
        u = frame.geodetic_to_enu(lat, lon, h)[2]
        k = 0
        for fid, spec, ring in rings:
            m = len(ring)
            roads.append((fid, spec, np.stack([e[k:k + m], n[k:k + m], u[k:k + m]], axis=1),
                          float(np.mean(ring[:, 0]))))
            k += m
    # Geometric roundabout rings (islands.ring_directions): Overture often leaves junction=roundabout and oneway
    # off the ring ways (Chavagnes-en-Paillers). No parking / inferred sidewalks on the ring, one-way so
    # centre lines are not painted through the circle. Short approaches that meet the ring lose sidewalks too:
    # their stubs against the circle were rectangular concrete blocks.
    ring_dir = {}
    if roads:
        import islands
        ring_dir = islands.ring_directions(roads, left_hand)
        if ring_dir:
            apps = islands.ring_approaches(roads, ring_dir)
            short_apps = {fid for fid, sp, pts, _ in roads if fid in apps
                          and float(np.sum(np.hypot(*np.diff(pts[:, :2], axis=0).T))) < islands.APPROACH_NO_WALK_M}
            roads = [(fid,
                      (sp._replace(urban=False, median=None, oneway=True, dir=ring_dir[fid]) if fid in ring_dir
                       else sp._replace(urban=False, median=None) if fid in short_apps
                       else sp),
                      pts, lon) for fid, sp, pts, lon in roads]
    chunks = []
    if roads_out is not None:
        roads_out.extend(roads)
    if cover_out is not None:
        # the ground carriageways for the decks' parapet test (roadmesh.deck ground=): drawn or painted into the ground,
        # a deck at grade across one has no parapet over its lanes. With the roads in the ground there
        # were none, and a small bridge's wall stood across the road at its end
        for fid, spec, pts, _ in roads:
            for piece in clip_polyline(pts, x0 - COVER_MARGIN_M, y0 - COVER_MARGIN_M, x1 + COVER_MARGIN_M,
                                       y1 + COVER_MARGIN_M):
                for c in split(densify(simplify(piece))):
                    if len(c) >= 2:
                        cover_out.append(_chunk(look_of(spec), spec.width, c))
    for fid, spec, pts, _ in roads:
        if ROADS_IN_GROUND:                     # the carriageway painted into the ground (surface.photo_roads)
            continue
        # no smooth ribbon over rough ground — but only where the ground layer will paint it (--surface on); with
        # the surface pass off there is no ROCK/GRASS mask, and the road would otherwise vanish entirely
        if terrain_paint and terrain_surface(spec):
            continue
        look = look_of(spec)
        lanes = [(0.0, spec.width)]
        if look.get("strip"):                   # parallel strips across the width (see LOOK)
            n = max(1, int(round(spec.width / look["strip"])))
            sw = spec.width / n
            lanes = [((k + 0.5) * sw - spec.width / 2, sw) for k in range(n)]
        for off, lw in lanes:
            line = pts if off == 0.0 else offset_polyline(pts, off)
            for piece in clip_polyline(line, *box):
                for c in split(densify(simplify(piece))):
                    if len(c) >= 2:
                        chunks.append(_chunk(look, lw, c))
    decks_near = []                             # (retaining_walls: none under a bridge)
    for ch in _bridge_chunks(frame, bseen, elev, (x0, y0, x1, y1), bridges, cells):
        if ch.get("deck"):
            decks_near.append(ch)
        if not ch.get("ctx"):
            chunks.append(ch)
        elif deck_context is not None:          # the decks around the tile (roadmesh.deck's parapet test)
            deck_context.append(ch)
    if tunnels is not None:                     # TunnelProfiles: road surfaces and lines through tunnels
        tch = _tunnel_chunks(tunnels, cells, (x0, y0, x1, y1), terrain_paint)
        chunks.extend(tch)
        import roadmesh
        # (retaining walls: none in a tube either, its vault over them; between twin tunnels' carriageways one stood in
        # their shared mouth)
        for c in tch:
            if c.get("tunnel") and not c.get("no_tube"):
                n = np.array(c["n"], np.float64)
                n[:, 2] += float(c.get("tunnel_h") or roadmesh.TUNNEL_H)
                decks_near.append({"n": n, "w": float(c["w"]) + 2 * roadmesh.TUNNEL_SHOULDER})
    exact = (x0, y0, x1, y1)
    sm = float(skin_margin or 0.0)
    wexact = (x0 - sm, y0 - sm, x1 + sm, y1 + sm) if sm else exact    # (the skin's pieces: skin_margin)

    def skin_own(px, py):                       # a draped piece's owner test (skin_margin: the margin box)
        if sm:
            return wexact[0] <= px < wexact[2] and wexact[1] <= py < wexact[3]
        return box_owns(own_box, px, py)
    if walls is not None:                       # retaining walls where a road is cut into the ground (roadmesh.tunnel)
        tile_walls = retaining_walls(frame, roads, elev, exact, decks=decks_near,
                                     plans_at=getattr(bridges, "plans_at", None), cut_lines=wall_cuts)
        if props is None:                       # (no props here: stone)
            for w in tile_walls:
                w["rock"] = False
        walls.extend(w for w in tile_walls if not w["rock"])
        if props is not None:                   # a rural cut: rock-face pieces instead (cliff_rows)
            props.extend(cliff_rows([w for w in tile_walls if w["rock"]], roads))
        chunks = _off_wall_tops(chunks, [w for w in tile_walls if not w["rock"]])
    corners, jcuts, crosswalks, jramps, jlines, jinternal = ({}, {}, [], {}, {}, set()) if walks is None else \
        junctions.find(roads, has_sidewalks, None)
    # (no curb extensions: they were on every town street with parking, after Fells Point's, and most streets have none:
    # the corners stuck out into the road in Tustin's suburbs)
    # small road loops (roundabouts, turnaround loops): no sidewalks facing their inside, a curbed island instead
    import islands
    isl = islands.find(roads, structures=structures) if walks is not None else []
    inner = islands.inner_sides(isl)
    if walks is not None:
        for f in isl:
            if f["ring"] is None:
                continue
            # (from its south-west-most point: each tile finds the loop from its own roads, starting anywhere)
            ring = np.roll(f["ring"], -int(np.lexsort((f["ring"][:, 1], f["ring"][:, 0]))[0]), axis=0)
            # (closed: offset with a vertex either side of its start, so its ends meet mitred, not 5 cm apart)
            band = offset_polyline(np.vstack([ring[-1:], ring, ring[:2]]), islands.ISLAND_BAND_M / 2)[1:-1]
            # tight simplify + denser nodes: the default 0.25 m / 12 m spacing faceted the curb into a hexagon (PR
            # #468). The whole ring simplified before it is clipped, so neighbouring tiles' pieces (each to its box and
            # the skin margin, the skin cutting them exactly at the tile's quad) share its vertices and meet
            band = simplify(band, tol=0.08)
            for piece in clip_polyline(band, *wexact):
                run = densify(piece, spacing=3.0)
                if len(run) >= 2:
                    walks.append({"pts": run, "side": 1, "caps": (False, False), "ramps": [],
                                  "w": islands.ISLAND_BAND_M, "fid": "island"})
    cornered = set()                            # road pairs whose sidewalks meet at a curb return
    if walks is not None:
        for (fid, side), cl in jcuts.items():
            for X, u, t in cl:
                for f2, s2, p2, _ in roads:
                    if f2 != fid and np.hypot(*(p2[:, :2] - X).T).min() < 1.0:
                        cornered.add((fid, f2))
        for c in corners:                       # each corner / crosswalk made by the tile it is in
            p = c["arc"][len(c["arc"]) // 2]
            if isl and islands.in_island(isl, p[:2]):
                continue                        # a curb return inside a loop: its island has its own curb
            # a curb return on the circulatory roadway or at a ring entry (approach sidewalks meeting there): the
            # ring has no sidewalk, so the corner was a rectangular block on the asphalt
            if any(float(np.hypot(*(p[:2] - f["poly"].mean(0))))
                   < float(np.max(np.hypot(*(f["poly"] - f["poly"].mean(0)).T))) + islands.ENTRY_CLEAR_M
                   for f in isl if f.get("round")):
                continue
            if skin_own(p[0], p[1]):
                walks.append({"corner": c})
                fill_look = _corner_look(p, roads)
                for fill in ([] if ROADS_IN_GROUND else ([c["fill"]] if c["fill"] is not None else []) + c.get("fills", [])):
                    chunks.append({"m": fill_look["m"], "w": 0.0, "tl": fill_look["tl"], "p": fill_look["p"],
                                   "poly": [[round(float(v), 3) for v in q] for q in fill], "n": []})
        import markings as _mk
        ladder = _mk.style(country, float(np.mean([r[3] for r in roads])) if roads else None).ladder
        for cw in crosswalks:                   # crosswalks and stop lines
            mid = 0.5 * (cw["a"] + cw["b"])
            if skin_own(mid[0], mid[1]):
                look = junctions.STOP_LINE if cw.get("stop") else junctions.CROSSWALK
                ab = np.array([cw["a"], cw["b"]])
                chunks.append(_chunk(look, cw["w"], ab))
                if ladder and not cw.get("stop"):
                    # a ladder crosswalk (MUTCD 3C.07, Baltimore's on the MD iMAP 3-inch aerial): a solid line along
                    # each side of the bars
                    for sd in (1, -1):
                        chunks.append(_chunk(EDGE_LINE, LADDER_LINE_W, offset_polyline(ab, sd * cw["w"] / 2)))
    import markings
    for fid, spec, pts, lon in roads:               # turn arrows (OpenStreetMap turn:lanes; MUTCD 3B.20)
        tags = lane_tags(*seen[fid][:2]) if fid in seen else None
        if not tags or spec.kind != "paved" or fid in jinternal:
            continue
        drv, nl = lane_layout(spec)
        for centre, t, kind_ in markings.arrows(tags, pts, not spec.oneway, drv, nl, left_hand):
            corners, uv = markings.arrow_quad(centre, t, kind_)
            if (corners[:, 0].max() >= wexact[0] and corners[:, 0].min() < wexact[2]
                    and corners[:, 1].max() >= wexact[1] and corners[:, 1].min() < wexact[3]):
                chunks.append({"m": markings.ARROW_MATERIAL, "w": 0.0, "tl": 4.0, "p": CENTRE["p"], "layer": "mark",
                               "poly": [[round(float(v), 3) for v in q] for q in corners],
                               "uvq": uv.tolist(), "n": []})
    gore_look = {"m": "line_white", "tl": EDGE_LINE["tl"], "p": CENTRE["p"]}
    for kind_, gw, gl in markings.gores(roads):     # ramp gores: channelizing lines and stripes (MUTCD 3B.08 / 3B.25)
        if kind_ == "fill":
            continue                                # (painted into the ground: surface.photo_roads)
        if kind_ == "stripe":
            mid = 0.5 * (gl[0] + gl[-1])
            if skin_own(mid[0], mid[1]):
                chunks.append(_chunk(gore_look, gw, gl))
            continue
        for piece in clip_polyline(gl, x0, y0, x1, y1):
            for c in split(densify(simplify(piece))):
                if len(c) >= 2:
                    chunks.append(_chunk(gore_look, gw, c))
    runs_near = []                              # sidewalk runs near the tile, before clipping (walks: below)
    # a parking aisle lies in a paved lot (painted asphalt: surface.photo_lots): no gravel edge along it (a dirt strip
    # stood across the asphalt between the stall rows, Canton)
    lot_aisles = {fid for fid, (f, i, sp) in seen.items()
                  if sp.kind == "paved" and _rule_value(f.rules.get("subclass"), i) == "parking_aisle"}
    # rounded corners where curbless paved roads meet (roadcorners.py): their fills when the roads are
    # meshes (else painted into the ground: surface.py), the gravel edge decal along each arc and a curved edge line
    # where both roads have them; corner_cuts end those road sides' straight edge lines and decals at the tangents
    import roadcorners
    corner_chunks, corner_cuts = roadcorners.tile(
        roads, box, not ROADS_IN_GROUND, country, left_hand,
        rings={fid for fid, (f, i, sp) in seen.items() if is_ring(f, i)}, no_decal=lot_aisles, exact=wexact)
    chunks.extend(corner_chunks)
    going_on = _going_on(roads)
    for fid, spec, pts, lon in roads:
        ex = extras(spec, pts, lon, left_hand, country, lane_tags(*seen[fid][:2]) if fid in seen else None) \
            if fid not in jinternal else []    # inside a junction: none
        if not ex:
            continue
        blockers = [(p2[:, :2], s2.width / 2 + CUT_MARGIN) for f2, s2, p2, _ in roads if f2 != fid]
        decal_blockers = [(p2[:, :2], s2.width / 2 + (CUT_MARGIN if (fid, f2) in going_on else
                                                      EDGE_DECAL["w"] + EDGE_DECAL_GAP_M))
                          for f2, s2, p2, _ in roads if f2 != fid and s2.kind in BUILT]
        # ring roads: sidewalks stop ENTRY_CLEAR_M outside the carriageway (no stub into the circle)
        walk_blockers = [(p2[:, :2],
                          (s2.width / 2 + (islands.ENTRY_CLEAR_M if f2 in ring_dir else 0.0)
                           if (fid, f2) in cornered or f2 in ring_dir
                           else sidewalk_stop(spec, fid, s2, f2)))
                         for f2, s2, p2, _ in roads if f2 != fid] + list(walk_cuts)
        # a median's band stops at the other carriageways' curbs only (their sidewalk is on their far side: it cut
        # one carriageway's half of Boston Street's median away)
        curb_blockers = [(p2[:, :2], s2.width / 2) for f2, s2, p2, _ in roads if f2 != fid]
        for look, w, line in ex:
            walk = look["m"] == SIDEWALK["m"]
            side = look.get("side")
            wb = curb_blockers if look.get("median") else walk_blockers
            if (walk or look["m"] == GUTTER["m"]) and (fid, side) in inner:
                continue                        # facing a traffic island: no sidewalk there
            if walk and walks is not None:
                # whole runs near the tile first (joined across tile borders below), clipped to the tile after
                for piece in clip_polyline(line, *near):
                    for cpiece, (j0, j1) in junctions.apply_cuts(piece, jcuts.get((fid, side), [])):
                        for run in [r for r0 in cut_outside(cpiece, wb, 0.5)
                                    for r in _on_level(frame, elev, densify(simplify(r0)))]:
                            if len(run) < 2:
                                continue
                            at_j0 = j0 and np.hypot(*(run[0, :2] - cpiece[0, :2])) < 0.6
                            at_j1 = j1 and np.hypot(*(run[-1, :2] - cpiece[-1, :2])) < 0.6
                            runs_near.append({"pts": run, "side": side, "w": w, "fid": fid, "j": (at_j0, at_j1),
                                              "median": bool(look.get("median")),
                                              "open": (not _on_box(run[0], near), not _on_box(run[-1], near))})
                continue
            if walks is not None and look["m"] == GUTTER["m"]:     # gutters end where their curb turns
                gcuts = jcuts.get((fid, side), [])
                pieces = [cp for p in clip_polyline(line, *box) for cp, _ in junctions.apply_cuts(p, gcuts)]
            elif walks is not None and jlines.get(fid):             # markings stop at the crosswalks
                pieces = [cp for p in clip_polyline(line, *box) for cp, _ in junctions.apply_cuts(p, jlines[fid])]
            else:
                pieces = clip_polyline(line, *box)
            if (look.get("kind") == "edge" or look["m"] == EDGE_DECAL["m"]) and (fid, side) in corner_cuts:
                pieces = [cp for p in pieces for cp, _ in junctions.apply_cuts(p, corner_cuts[(fid, side)])]
            if look["m"] == EDGE_DECAL["m"]:
                if fid in lot_aisles:
                    continue
                # no gravel edge where another carriageway is near: a ramp's gore and a narrow median are paved
                pieces = [r for pc in pieces for r in cut_outside(pc, decal_blockers, 0.5)]
            for piece in pieces:
                for run in cut_outside(piece, wb if walk else blockers, 0.5 if walk else 2.0):
                    for c in split(densify(simplify(run))):
                        if len(c) >= 2:
                            chunks.append(_chunk(look, w, c))
    if walks is not None:
        runs_near = join_walk_ends(runs_near, [(p2[:, :2], s2.width / 2) for _, s2, p2, _ in roads]
                                   + list(walk_cuts))       # (a cut's gap stays open: a driveway crosses it)
        drain_runs = []                         # (walks entry, side, real ends, width): drains once on the ground
        for rn in runs_near:
            fid, side, w, run0 = rn["fid"], rn["side"], rn["w"], rn["pts"]
            for run in clip_polyline(run0, *wexact):
                if len(run) < 2:
                    continue
                first = np.hypot(*(run[0, :2] - run0[0, :2])) < 1e-6
                last = np.hypot(*(run[-1, :2] - run0[-1, :2])) < 1e-6
                at_j0 = first and rn["j"][0]
                at_j1 = last and rn["j"][1]
                caps = (first and not at_j0 and not _on_box(run[0], wexact),
                        last and not at_j1 and not _on_box(run[-1], wexact))
                rl = [r for key in rn.get("ramp_keys", [(fid, side)]) for r in jramps.get(key, [])]
                ramps = junctions.ramp_ranges(run, rl)
                walks.append({"pts": run, "side": side, "caps": caps, "ramps": ramps, "w": w, "fid": fid,
                              "median": rn.get("median", False)})
                if not rn.get("median"):                # (a median: a bare curb, no storm drains)
                    drain_runs.append((walks[-1], side, (caps[0] or at_j0, caps[1] or at_j1), w))
        if walks_raw is not None:               # (the skin's: put on its anchor's ground there)
            import copy
            walks_raw.extend(copy.deepcopy(walks))
        drape_walks(frame, elev, walks, ground)
        for wk, side, ends, w in drain_runs:
            chunks.extend(drains(wk["pts"], side, ends, w))
    if lines is not None:                           # the centrelines near the tile (buildings' front doors)
        lines.extend((pts[:, :2], spec.width / 2, spec.cls, spec.urban) for _, spec, pts, _ in roads)
    if props is not None and walks is not None:     # street lights and utility poles (furniture.py)
        # (the speed-limit signs are the sign tiles' since: speedsigns.py)
        import furniture
        decks = [(np.asarray(ch["n"], np.float64), ch["w"] / 2) for ch in chunks if ch.get("deck")]
        props.extend(furniture.place(roads, walks, own_box, wires=wires, town=bool(town), left_hand=left_hand,
                                     decks=decks, signals=signals, buried=buried, region=lamp_region,
                                     lighting={fid: str(f.attrs["osm_lit"][i]).strip().lower()
                                               for fid, (f, i, _sp) in seen.items() if "osm_lit" in f.attrs}))
    aisles = {fid for fid, (f, i, sp) in seen.items()
              if sp.kind == "paved" and _rule_value(f.rules.get("subclass"), i) == "parking_aisle"}
    if aisles_out is not None:
        aisles_out.update(aisles)
    if (park is not None and walks is not None) or (marks is not None and aisles):
        import parking

        def z_at(x, y):                             # (the ground the stalls stand on: no stall on a slope)
            if ground is not None:
                return np.asarray(ground(x, y), np.float64)
            la, lo, _ = frame.enu_to_geodetic(x, y, 0.0)
            return frame.geodetic_to_enu(la, lo, np.asarray(elev(la, lo), np.float64))[2]
        if park is not None and walks is not None:      # curbside parking spots (parking.py)
            dirs = {}
            for fid, (f, i, sp) in seen.items():
                if sp.oneway:
                    v = _rule_value(f.rules.get("oneway"), i)
                    dirs[fid] = (-1 if float(v) < 0 else 1) if v is not None else (sp.dir or 1)
            park.extend(parking.curb_spots(roads, walks, own_box, left_hand, dirs))
            if aisles:
                park.extend(parking.aisle_spots(roads, aisles, own_box, z_at=z_at))
        if marks is not None and aisles:            # stall lines along the aisles (parking.aisle_markings)
            marks.extend(parking.aisle_markings(roads, aisles, wexact, z_at=z_at))
    return chunks


BLD_PARTS_MAX = 4               # building meshes per road tile ("bld", "bld2".."bld4": the mod's list)


# --- road geotiles (phase 1c, .claude/work/geotiles_plan.md) -------------------------------------------------------
# A road tile is a geotile (geotiles.Z: the global grid, key "g17_x_y"): its content (buildings, decks, tunnels,
# walls, wires, rails, props and guard rails, parking, stations, wells, sound) built once in its own frame and kept by
# the mod across rebases (placed into each anchor's world: geotile.lua), its skin (the draped road mesh, plazas,
# sidewalks) built per anchor on that anchor's lattice. After a rebase the server sends skins only (and the exact
# variants of the tall parts the rigid placement leaves off: GeoTracker.exact_need).
ROAD_GEO = 1                # the road geotiles' protocol (hello.roadGeo, the mod's roads.lua M.ROAD_GEO)
EXACT_TOL_COL_M = 0.03      # m a colliding part placed rigidly may be off (relief x the shear) before its exact variant
EXACT_TOL_M = 0.10          # ... a render-only one


def shape_files(aid, tx, ty):
    """The shape files write_tile may write for a tile, by the field naming them in the tile ({what: file name})."""
    out = {"road": f"road_{aid}_{tx}_{ty}.cdae", "deck": f"deck_{aid}_{tx}_{ty}.cdae",
           "walk": f"walks_{aid}_{tx}_{ty}.cdae", "walkcol": f"walkcol_{aid}_{tx}_{ty}.cdae",
           "bldcol": f"bldcol_{aid}_{tx}_{ty}.cdae", "wire": f"wire_{aid}_{tx}_{ty}.cdae",
           "bld": f"bld_{aid}_{tx}_{ty}.cdae", "tunnel": f"tunnel_{aid}_{tx}_{ty}.cdae",
           "rail": f"rail_{aid}_{tx}_{ty}.cdae", "railcol": f"railcol_{aid}_{tx}_{ty}.cdae"}
    for k in range(2, BLD_PARTS_MAX + 1):
        out[f"bld{k}"] = f"bld_{aid}_{tx}_{ty}_{k}.cdae"
    return out


# Sound spaces (the mod's ambience.lua makes them SFXSpaces: the stock maps' tunnel reverb in a tube, the one under a
# bridge below its deck): kinds, and how far a bridge's space reaches under the deck's surface
SOUND_TUNNEL, SOUND_BRIDGE, SOUND_TUNNEL_OPEN, SOUND_GARAGE, SOUND_PORTAL = 0, 1, 2, 3, 4
SOUND_REFINERY = (5, 6, 7)      # points: West Coast USA's refinery tower engines, large, small (industry.py)
SOUND_POWER_PLANT = 8           # points: West Coast USA's power plant sound (industry.py), played quieter by the mod
SOUND_UNDER_M = 25.0
# a closed tunnel's mouths: the stock portal snapshot event this far inside each (recorded 2026-10-26: the outside cut
# off within ~10 m of it, 7 dB down at 20 m, untouched from 40 m: a ~25 m fade outside the portal, both ways), its
# position SOUND_PORTAL_UP over the floor (a row [kind, x, y, z, 0, 0, 0, yaw (into the tube)])
SOUND_PORTAL_IN_M = 10.0
SOUND_PORTAL_UP = 2.0
# a low arch, or a tube shorter than this, has the open tunnel's (the outside heard, muffled ~5 dB) instead of the
# closed one's (the outside cut off): recorded 2026-10-26
SOUND_SHORT_TUNNEL_M = 120.0
SOUND_BOX_M, SOUND_TURN, SOUND_DZ_M, SOUND_EXTEND_M = 60.0, math.radians(10.0), 1.0, 1.0


def sound_boxes(chunks):
    """The sound spaces of a tile's chunks: along every tunnel tube (its floor to its vault) and under every bridge
    deck (from its slab down SOUND_UNDER_M), as earthfast.sound_boxes rows [kind, x, y, z, length, width, height, yaw]
    rounded, one flat list; first a closed tunnel's portal points (SOUND_PORTAL) at its mouths."""
    import fast
    import roadmesh
    lines, out = [], []
    for c in chunks:
        if c.get("tunnel") and not c.get("no_tube"):
            h = float(c.get("tunnel_h") or roadmesh.TUNNEL_H)
            short = h < roadmesh.TUNNEL_H - 0.01 or float(c.get("tunnel_len") or 1e9) < SOUND_SHORT_TUNNEL_M
            lines.append((SOUND_TUNNEL_OPEN if short else SOUND_TUNNEL, c["n"],
                          float(c["w"]) + 2 * roadmesh.TUNNEL_SHOULDER, 0.5, h + 0.5))
            n = np.asarray(c["n"], np.float64)[:, :3]
            for end, line in ((0, n), (1, n[::-1])):
                if not short and (c.get("portal") or (False, False))[end] and len(line) >= 2:
                    p = _along(line, SOUND_PORTAL_IN_M)
                    d = line[1, :2] - line[0, :2]
                    out += [float(SOUND_PORTAL), round(float(p[0]), 2), round(float(p[1]), 2),
                            round(float(p[2]) + SOUND_PORTAL_UP, 2), 0.0, 0.0, 0.0,
                            round(math.atan2(float(d[1]), float(d[0])), 4)]
        elif c.get("deck") and not c.get("tunnel"):
            lines.append((SOUND_BRIDGE, c["n"], float(c["w"]), SOUND_UNDER_M, -roadmesh.DECK_DEPTH))
    if not lines:
        return out
    fast.require(78, "sound_boxes")
    pts = np.ascontiguousarray(np.concatenate([np.asarray(n, np.float64)[:, :3] for _, n, _, _, _ in lines]))
    off = np.cumsum([0] + [len(n) for _, n, _, _, _ in lines]).astype(np.int64)
    col = lambda k: np.ascontiguousarray([ln[k] for ln in lines], np.float64)     # noqa: E731
    rows = fast._ef.sound_boxes(pts, off, col(0), col(2), col(3), col(4), SOUND_BOX_M, SOUND_TURN, SOUND_DZ_M,
                                SOUND_EXTEND_M)
    rows[:, 1:7] = np.round(rows[:, 1:7], 2)
    rows[:, 7] = np.round(rows[:, 7], 4)
    return out + rows.ravel().tolist()


def write_tile(out_dir, vfs_dir, aid, tx, ty, chunks, walks=None, road_mesh=None, deck_mesh=None, bld=None,
               props=None, wires=None, park=None, tunnel_mesh=None, fuel=None,
               rail_mesh=None, garage_sound=(), wells=(), guardrail_rows=None, decals=True, footprints=None):
    """Write a tile's chunks (atomically), its sidewalk mesh (walks: build_tile's runs, if any:
    `walks_<a>_<tx>_<ty>.cdae`, announced in the tile as "walk": {shape, pos}) and its road mesh
    (road_mesh: roadmesh.build's result: `road_<a>_<tx>_<ty>.cdae`, "road": {shape, pos}; the mod then
    shows it instead of a DecalRoad per chunk) and its bridge decks (deck_mesh: roadmesh.deck's result:
    `deck_<a>_<tx>_<ty>.cdae`, "deck": {shape, pos}, colliding) and its buildings' outlines as drawn with their class
    (footprints: buildings.ground_rings' pairs, "footprints": [[x, y, ...]] and "footprint_cls": what an exporter's
    own trees keep out of, how full its parked cars stand); returns (vfs path, number of chunks)."""
    import roadmesh
    import sidewalks
    name = f"roads_{aid}_{tx}_{ty}.json"
    path = os.path.join(out_dir, name)
    # (from, Madderose) with a road mesh the mod makes no DecalRoads: their chunks were ~36 % of the file it
    # parses on its main thread
    data = {"v": VERSION, "chunks": [] if road_mesh is not None or not decals else
            [c for c in chunks if not c.get("tube_only")]}
    sound = sound_boxes(chunks) + list(garage_sound)      # (garage_sound: buildings.garage_sound_boxes)
    if sound:
        data["sound"] = sound
    if wells:                                               # oil wells' pump jacks (oilwells.tile_wells)
        data["wells"] = list(wells)
    if road_mesh is not None:
        x0, y0, _, _ = tile_bbox(tx, ty)
        shape = f"road_{aid}_{tx}_{ty}.cdae"
        roadmesh.write(os.path.join(out_dir, shape), road_mesh)
        data["road"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    if deck_mesh is not None:
        x0, y0, _, _ = tile_bbox(tx, ty)
        shape = f"deck_{aid}_{tx}_{ty}.cdae"
        roadmesh.write(os.path.join(out_dir, shape), deck_mesh)
        data["deck"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    if tunnel_mesh is not None:     # roadmesh.tunnel: the tubes and portals (colliding)
        x0, y0, _, _ = tile_bbox(tx, ty)
        shape = f"tunnel_{aid}_{tx}_{ty}.cdae"
        roadmesh.write(os.path.join(out_dir, shape), tunnel_mesh)
        data["tunnel"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    if guardrail_rows:              # mapped guard rails and the median barriers (guardrails / medians): Forest rows
        import guardrails
        data["guardrails"] = {"items": guardrail_rows, "groups": list(guardrails.GROUPS)}
    if rail_mesh is not None:       # railways.tile_mesh: ballast, sleepers and rails
        import cdae
        import railways
        x0, y0, _, _ = tile_bbox(tx, ty)
        shape = f"rail_{aid}_{tx}_{ty}.cdae"
        roadmesh.write(os.path.join(out_dir, shape), rail_mesh)
        data["rail"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
        col = railways.collision_mesh(rail_mesh)
        if col is not None:         # the lean physics-only mesh (the mod then only draws "rail"): its bed and decks
            shape = f"railcol_{aid}_{tx}_{ty}.cdae"
            cdae.write(os.path.join(out_dir, shape), col[0], col[1], uvs=col[2], material=col[3],
                       tri_materials=col[4], collision_only=True)
            data["railcol"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    if walks:
        x0, y0, _, _ = tile_bbox(tx, ty)
        b = sidewalks.Builder((x0, y0, 0.0), collision=True)
        for wk in walks:
            if "corner" in wk:
                c = wk["corner"]
                b.add_corner(c["arc"], c["inward"], c["outer"], ramps=c.get("ramps", ()))
                continue
            ww = wk.get("w", SIDEWALK["w"])
            curb, out = sidewalks.run_geometry(wk["pts"], wk["side"], ww)
            b.add_run(curb, out, ww, caps=wk["caps"], ramps=wk.get("ramps", ()),
                      slab=sidewalks.BRICK if wk.get("brick") else 1)
        if not b.empty():
            shape = f"walks_{aid}_{tx}_{ty}.cdae"
            b.write(os.path.join(out_dir, shape))
            data["walk"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
            shape = f"walkcol_{aid}_{tx}_{ty}.cdae"     # the lean physics-only mesh (the drawn one then only renders)
            b.write_collision(os.path.join(out_dir, shape))
            data["walkcol"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    boxes = collider_boxes(walks if data.get("walk") else None, chunks if data.get("deck") else None)
    if "walk" in boxes and data.get("walkcol"):
        boxes["walkcol"] = boxes["walk"]
    if bld is not None:             # buildings.road_tile: the tile's buildings, colliding ("bld")
        import buildings
        x0, y0, _, _ = tile_bbox(tx, ty)
        meshes = bld[0] if isinstance(bld[0], list) else [bld[0]]
        for k, mesh in enumerate(meshes[:BLD_PARTS_MAX]):   # under the engine's 16-bit index limit each
            what = "bld" if k == 0 else f"bld{k + 1}"
            shape = f"bld_{aid}_{tx}_{ty}.cdae" if k == 0 else f"bld_{aid}_{tx}_{ty}_{k + 1}.cdae"
            buildings.write(os.path.join(out_dir, shape), mesh)
            if len(bld) > 3:
                buildings.write_objects(os.path.join(out_dir, shape), mesh, bld[3][k])
            data[what] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
            boxes[what] = bld[1]
        if len(bld) > 2 and bld[2] is not None:     # the lean physics-only mesh (the drawn ones then only render)
            shape = f"bldcol_{aid}_{tx}_{ty}.cdae"
            buildings.write(os.path.join(out_dir, shape), bld[2], collision_only=True)
            if len(bld) > 4:
                buildings.write_objects(os.path.join(out_dir, shape), bld[2], [{"item": k, "start": s} for k, s in enumerate(bld[4])])
            data["bldcol"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
            boxes["bldcol"] = bld[1]
    if boxes:
        data["colliders"] = boxes
    if wires:                       # utility pole wires (furniture.wire_mesh), render-only
        import cdae
        import furniture
        x0, y0, _, _ = tile_bbox(tx, ty)
        starts = []
        wm = furniture.wire_mesh(wires, (x0, y0, 0.0), starts)
        if wm is not None:
            shape = f"wire_{aid}_{tx}_{ty}.cdae"
            furniture.write_wire_objects(os.path.join(out_dir, shape), wm, furniture.wire_spans(wires, starts))
            cdae.write(os.path.join(out_dir, shape), wm[0], wm[1], uvs=wm[2], material="bne_wire", object_name="wires")
            data["wire"] = {"shape": f"{vfs_dir}/{shape}", "pos": [x0, y0, 0.0]}
    if props:                       # furniture.place's rows: Forest items (trees.lua), groups by index
        groups = sorted({r[0] for r in props})
        data["props"] = {"groups": groups, "items": [[groups.index(r[0])] + r[1:] for r in props]}
    if park:                        # parking.py's spots [x, y, z, heading] for the stock parked cars (parking.lua)
        data["park"] = park
    if fuel:                        # gasstations.tile_sites' stations: pumps and refuel areas (gasstations.lua)
        data["fuel"] = fuel
    if footprints:
        data["footprints"] = [[round(float(v), 2) for v in np.asarray(r, np.float64).ravel()] for r, _ in footprints]
        data["footprint_cls"] = [str(c) for _, c in footprints]
    tmp = staging.tmp_for(path)
    with open(tmp, "w") as f:
        f.write(json.dumps(data, separators=(",", ":")))    # json.dump to a file streams through the pure-Python encoder
    staging.replace(tmp, path)
    return f"{vfs_dir}/{name}", len(chunks)


COLLIDER_PIECE_M = 20.0     # collider_boxes: a run / deck cut into boxes this long
COLLIDER_MARGIN_M = 0.5


def collider_boxes(walks, chunks):
    """{"walk": [...], "deck": [...]}: boxes [x0, y0, z0, x1, y1, z1] (anchor frame, m) around the
    sidewalk runs / corners and the bridge decks of a tile, in pieces of COLLIDER_PIECE_M. The mod
    does not make a colliding mesh solid while the player's vehicle is inside one of its boxes (a late
    curb or deck turning solid around a car; the intermittent NaN drives). Pure."""
    import roadmesh
    import sidewalks
    out = {}

    def add(what, pts, half_w, z_lo, z_hi):
        pts = np.asarray(pts, np.float64)
        seg = np.r_[0.0, np.cumsum(np.hypot(*np.diff(pts[:, :2], axis=0).T))] if len(pts) > 1 else np.zeros(1)
        cut = np.floor(seg / COLLIDER_PIECE_M).astype(int)
        for k in np.unique(cut):
            idx = np.flatnonzero(cut == k)
            sel = pts[max(idx[0] - 1, 0):idx[-1] + 1]     # the piece and the point before it
            m = half_w + COLLIDER_MARGIN_M
            out.setdefault(what, []).append([round(float(sel[:, 0].min() - m), 1), round(float(sel[:, 1].min() - m), 1),
                                             round(float(sel[:, 2].min() + z_lo), 1), round(float(sel[:, 0].max() + m), 1),
                                             round(float(sel[:, 1].max() + m), 1), round(float(sel[:, 2].max() + z_hi), 1)])
    for wk in walks or ():
        if "corner" in wk:
            c = wk["corner"]             # the curb arc and the outer corner points: one box over both
            pts = np.concatenate([np.asarray(c["arc"], np.float64), np.asarray(c["outer"], np.float64).reshape(-1, 3)])
            add("walk", pts[np.argsort(np.arctan2(pts[:, 1] - pts[:, 1].mean(), pts[:, 0] - pts[:, 0].mean()))],
                0.5, -1.0, 1.0)
            continue
        ww = wk.get("w", SIDEWALK["w"])
        curb, outv = sidewalks.run_geometry(wk["pts"], wk["side"], ww)
        mid = curb.copy()
        mid[:, :2] = curb[:, :2] + outv * (ww / 2)
        add("walk", mid, ww / 2 + 0.5, -1.0, 1.0)
    for c in chunks or ():
        if c.get("deck") and len(c["n"]) > 1:
            add("deck", c["n"], float(c["w"]) / 2 + 1.0, -roadmesh.DECK_DEPTH - 1.0, 2.0)
    return out
