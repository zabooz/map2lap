"""Measure tunnel faults in a retained Map2Lap OBJ build.

    .venv\\Scripts\\python.exe tools\\measure_tunnels.py griffen_bruecke_test
    .venv\\Scripts\\python.exe tools\\measure_tunnels.py weblinger_guertel_test --json out/tunnels.json

The entrance and crossing checks read the build's retained road chunks and OBJ meshes. Joint rise also reads the
original elevation data from the local map cache. No track is built or installed. The six tunnel categories and their
physical limits follow BeamNG.Earth's tools/tunnelscan.py (2026-11-12); marking_drop is an AC-specific check.
This tool samples AC's actual geometry, including partial holes in its 2 m terrain cells. Gap depth compares a missing
patch with nearby retained terrain, so inspect its location in AC. A report is a geometry check; drive a changed road.
"""
import argparse
from functools import lru_cache
import json
from pathlib import Path
import sys

import numpy as np

HERE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HERE / "src"))
sys.path.insert(0, str(HERE / "engine"))
from track import obj_to_kn5  # noqa: E402
import measure  # noqa: E402

# Not yet validated by driving these findings in AC; the OBJ checks alone do not establish what a car experiences.
MOUTH_REACH_M = 30.0  # m: the opening and the ground immediately beside it
GAP_AREA_M2 = 0.25   # a partial 2 m terrain cell can expose a half-metre square beside a portal
GAP_SAMPLE_M = 0.5  # m: a 2 m cell's small uncovered corner stays visible in AC (sub-0.5 m gaps can be missed)
PROUD_M = 3.0        # m: portal concrete more than a storey above the hillside beside it
BARE_M = 5.0         # m of full tube with no ground or outer cover over its crown
FULL_H_M = 6.75      # m: the 6.8 m full tube; lower arches are checked separately by their opening
UPPER_CLEAR_M = 0.3  # m above the vault: an upper road below this meets the tunnel


def gap_area(count, cell):
    """Physical area of count missing terrain cells of side cell metres. Pure."""
    return count * cell * cell


def uncovered(reference, ground, floor, covers):
    """Whether missing terrain exposes a void over one metre to the nearest cover. Pure."""
    if not np.isfinite(reference):
        return False
    heights = [z for z in [ground, floor, *covers] if np.isfinite(z)]
    return not heights or max(heights) < reference - 1.0


def marking_spans(triangles):
    """Vertical height span of each marking triangle in metres. Pure."""
    return np.ptp(triangles[:, :, 1], axis=1)


def _finite_max(values):
    """Largest finite value, or -inf when there is none. Pure."""
    finite = np.asarray(values)[np.isfinite(values)]
    return float(finite.max()) if len(finite) else float("-inf")


def tunnel_chunks(track_dir):
    """Tunnel road chunks retained in track_dir/tiles, with n converted from ENU to AC xyz. Pure given files."""
    out = []
    for path in sorted((Path(track_dir) / "tiles").glob("roads_*.json")):
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
        for row in data.get("editor", {}).get("chunks", []):
            if not row.get("tunnel") or len(row.get("n", [])) < 2:
                continue
            chunk = dict(row)
            enu = np.asarray(row["n"], np.float64)
            chunk["n"] = enu[:, [0, 2, 1]] * np.array([1.0, 1.0, -1.0])
            out.append(chunk)
    return out


def blocked(p, out, half, floor, slope, ground):
    """Largest ground rise over the floor's continued line, 3..15 m outside a mouth. Pure given ground(q)."""
    side = np.array([-out[1], out[0]])
    dist = np.arange(3.0, 15.01, 2.0)
    q = np.concatenate([p + out * dist[:, None] + side * lateral for lateral in (-0.7 * half, 0.0, 0.7 * half)])
    residual = ground(q) - np.tile(floor - slope * dist, 3)
    return float(np.nanmax(residual)) if np.isfinite(residual).any() else float("nan")


def _arc(n):
    """Metres along AC xyz centreline n. Pure."""
    return np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(n[:, [0, 2]], axis=0), axis=1))]


def _mouths(chunks):
    """Unique portal records (chunk, end, position xz, outward unit vector). Pure."""
    out = []
    for c in chunks:
        for end, yes in enumerate(c.get("portal", (False, False))):
            if not yes:
                continue
            n = c["n"]
            a, b = (0, 1) if end == 0 else (-1, -2)
            p = n[a, [0, 2]]
            v = p - n[b, [0, 2]]
            length = np.linalg.norm(v)
            if length < 1e-6:
                continue
            if any(np.linalg.norm(p - r[2]) < 0.8 and abs(n[a, 1] - r[0]["n"][0 if r[1] == 0 else -1, 1]) < 1
                   for r in out):
                continue
            out.append((c, end, p, v / length))
    return out


@lru_cache(maxsize=24)
def _read_tile(path):
    """Relevant triangles of one OBJ tile by physics part. Pure given file."""
    got = {"ground": [], "road": [], "floor": [], "wall": [], "cover": [], "grass_cover": [], "marking": []}
    for name, (_mat, pos, _uv, faces) in obj_to_kn5.read_obj(path).items():
        if not len(faces):
            continue
        if "_ground_" in name and name.startswith(("1ROAD", "1GRASS", "1GRAVEL")):
            got["ground"].append(pos[faces])
            if name.startswith(("1ROAD", "1GRAVEL")):
                got["road"].append(pos[faces])
        elif name.startswith("1ROAD_deck"):
            got["road"].append(pos[faces])
        elif name.startswith("1WALL_deck_con"):
            got["floor"].append(pos[faces])
        elif name.startswith("1WALL_tunnel"):
            got["wall"].append(pos[faces])
            got["cover"].append(pos[faces])
            if name.startswith(("1WALL_tunnel_cap", "1WALL_tunnel_grass")):
                got["grass_cover"].append(pos[faces])
        elif name.startswith(("nocol_road_paint", "nocol_road_edge_dirt")):
            got["marking"].append(pos[faces])
    return {k: np.concatenate(v) if v else np.zeros((0, 3, 3)) for k, v in got.items()}


class BuiltMesh:
    """Triangles from retained OBJ tiles, read near each tunnel mouth or section."""

    def __init__(self, track):
        self.files = measure.tile_files(track)
        if not self.files:
            raise FileNotFoundError(f"no retained OBJ parts for {track}: build with measure.py <track> --build")

    def triangles(self, kind, box):
        """Triangles of kind whose plan bounds touch box (x0, z0, x1, z1). Pure given files."""
        rows = []
        for path in self.files:
            if not measure.tile_touches(path, box):
                continue
            tri = _read_tile(path)[kind]
            if not len(tri):
                continue
            lo, hi = tri[:, :, [0, 2]].min(axis=1), tri[:, :, [0, 2]].max(axis=1)
            keep = (hi[:, 0] >= box[0]) & (lo[:, 0] <= box[2]) & (hi[:, 1] >= box[1]) & (lo[:, 1] <= box[3])
            rows.append(tri[keep])
        return np.concatenate(rows) if rows else np.zeros((0, 3, 3))

    def hits(self, kind, q):
        """Every surface height at AC plan points q (n,2), within their bounding box."""
        q = np.asarray(q, np.float64).reshape(-1, 2)
        if not len(q):
            return []
        box = (float(q[:, 0].min()) - 1, float(q[:, 1].min()) - 1,
               float(q[:, 0].max()) + 1, float(q[:, 1].max()) + 1)
        tri = self.triangles(kind, box)
        if not len(tri):
            return [np.zeros(0) for _ in q]
        return [z for z, _ in measure._heights(tri, np.zeros(len(tri), bool), q[:, 0], q[:, 1])]

    def top(self, kind, q):
        """Highest surface of kind under each point, NaN where there is none."""
        return np.array([float(z.max()) if len(z) else np.nan for z in self.hits(kind, q)])


def _record(kind, amount, p, frame, **detail):
    """One result with AC x/z and geographic coordinates. Pure given frame."""
    lat, lon, _ = frame.enu_to_geodetic(float(p[0]), -float(p[1]), 0.0)
    return {"kind": kind, "value": round(float(amount), 2), "x": round(float(p[0]), 2),
            "z": round(float(p[1]), 2), "lat": round(float(lat), 6), "lon": round(float(lon), 6), **detail}


def _local_box(p, reach=MOUTH_REACH_M):
    """AC plan box of reach metres around p. Pure."""
    return (p[0] - reach, p[1] - reach, p[0] + reach, p[1] + reach)


def _ground_reference(mesh, q, cell):
    """Estimate removed terrain from nearby retained ground at the build's lattice, within 8 m. Pure given mesh."""
    if not len(q):
        return np.zeros(0)
    x = (np.arange(np.floor((q[:, 0].min() - 8) / cell), np.ceil((q[:, 0].max() + 8) / cell)) + 0.5) * cell
    z = (np.arange(np.floor((q[:, 1].min() - 8) / cell), np.ceil((q[:, 1].max() + 8) / cell)) + 0.5) * cell
    xx, zz = np.meshgrid(x, z)
    nodes = np.c_[xx.ravel(), zz.ravel()]
    heights = mesh.top("ground", nodes)
    known = np.isfinite(heights)
    nodes, heights = nodes[known], heights[known]
    result = np.full(len(q), np.nan)
    if not len(nodes):
        return result
    n = min(4, len(nodes))
    for start in range(0, len(q), 256):
        batch = q[start:start + 256]
        d2 = np.sum((batch[:, None] - nodes[None]) ** 2, axis=2)
        nearest = np.argpartition(d2, n - 1, axis=1)[:, :n]
        ds = np.take_along_axis(d2, nearest, axis=1)
        hs = heights[nearest]
        weights = 1.0 / np.maximum(ds, 0.25)
        ref = np.sum(hs * weights, axis=1) / weights.sum(axis=1)
        ref[np.min(ds, axis=1) > 8.0 ** 2] = np.nan
        result[start:start + len(batch)] = ref
    return result


def _gap_points(mesh, q, cell):
    """Uncovered points on a fine grid; depth is the gap to the nearest built cover. Pure given geometry."""
    ground = mesh.top("ground", q)
    missing = ~np.isfinite(ground)
    if not missing.any():
        return np.zeros(len(q), bool), np.zeros(len(q))
    ix = np.flatnonzero(missing)
    qm = q[ix]
    ref = _ground_reference(mesh, qm, cell)
    fz = mesh.top("floor", qm)
    covers = mesh.hits("cover", qm)
    bad = np.array([uncovered(r, g, f, w) for r, g, f, w in zip(ref, ground[ix], fz, covers)])
    depths = np.array([r - max([v for v in [g, f, *w] if np.isfinite(v)])
                       if np.isfinite(r) and any(np.isfinite(v) for v in [g, f, *w]) else np.nan
                       for r, g, f, w in zip(ref, ground[ix], fz, covers)])
    out = np.zeros(len(q), bool)
    depth = np.zeros(len(q))
    out[ix] = bad
    depth[ix] = np.where(bad, depths, 0.0)
    return out, depth


def _gap_findings(mesh, mouths, cell, frame):
    """Connected uncovered patches assigned once to their nearest mouth, located at their own centroid."""
    findings = []
    centres = np.array([m[2] for m in mouths])
    for owner, (_c, _end, p, _out) in enumerate(mouths):
        x0 = int(np.floor((p[0] - MOUTH_REACH_M) / GAP_SAMPLE_M))
        x1 = int(np.ceil((p[0] + MOUTH_REACH_M) / GAP_SAMPLE_M))
        z0 = int(np.floor((p[1] - MOUTH_REACH_M) / GAP_SAMPLE_M))
        z1 = int(np.ceil((p[1] + MOUTH_REACH_M) / GAP_SAMPLE_M))
        xi, zi = np.meshgrid(np.arange(x0, x1), np.arange(z0, z1))
        ij = np.c_[xi.ravel(), zi.ravel()]
        q = (ij + 0.5) * GAP_SAMPLE_M
        nearest = np.argmin(np.sum((q[:, None] - centres[None]) ** 2, axis=2), axis=1)
        keep = (np.linalg.norm(q - p, axis=1) <= MOUTH_REACH_M) & (nearest == owner)
        ij, q = ij[keep], q[keep]
        bad, depth = _gap_points(mesh, q, cell)
        patch = {tuple(v): k for k, v in enumerate(ij[bad])}
        depths = depth[bad]
        while patch:
            seed = next(iter(patch))
            todo, members = [seed], []
            while todo:
                key = todo.pop()
                index = patch.pop(key, None)
                if index is None:
                    continue
                members.append(index)
                todo.extend((key[0] + a, key[1] + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            area = gap_area(len(members), GAP_SAMPLE_M)
            if area >= GAP_AREA_M2:
                place = np.mean(ij[bad][members] + 0.5, axis=0) * GAP_SAMPLE_M
                finite = depths[members][np.isfinite(depths[members])]
                findings.append(_record("gap", area, place, frame,
                                        depth=round(float(finite.max()), 2) if len(finite) else None,
                                        mouth_x=round(float(p[0]), 2), mouth_z=round(float(p[1]), 2)))
    return findings


def _entrance(mesh, c, end, p, out, frame, cell):
    """Proud, bare and blocked findings at one built mouth."""
    findings = []
    n = c["n"]
    at = 0 if end == 0 else -1
    floor = float(n[at, 1])
    s = _arc(n)
    k = min(len(n) - 1, 3) if end == 0 else max(0, len(n) - 4)
    slope = (float(n[k, 1]) - floor) / max(abs(s[k] - s[at]), 1e-6)
    half = float(c["w"]) / 2
    rise = blocked(p, out, half, floor, slope, lambda q: mesh.top("ground", q))
    if np.isfinite(rise) and rise > 1.0:
        findings.append(_record("blocked", rise, p, frame))

    wall = mesh.triangles("wall", _local_box(p, 12.0))
    if len(wall):
        vertices = wall.reshape(-1, 3)
        side = np.array([-out[1], out[0]])
        rel = vertices[:, [0, 2]] - p
        along, across = rel @ out, rel @ side
        # The concrete beyond the tube wall is compared with the hillside it holds back.
        sel = (along > -1.5) & (along < 2.0) & (np.abs(across) >= half + 2.5) & (np.abs(across) < half + 6.5)
        if sel.any():
            q = vertices[sel][:, [0, 2]]
            ground = []
            for d in (0.0, 1.5, 3.0, 5.0):
                at = q - out * d
                h = mesh.top("ground", at)
                gone = ~np.isfinite(h)
                if gone.any():
                    h[gone] = _ground_reference(mesh, at[gone], cell)
                ground.append(h)
            ground = np.array(ground)
            high = np.max(np.where(np.isfinite(ground), ground, -np.inf), axis=0)
            high[~np.isfinite(high)] = np.nan
            diff = vertices[sel, 1] - high
            if np.isfinite(diff).any() and float(np.nanmax(diff)) > PROUD_M:
                findings.append(_record("proud", float(np.nanmax(diff)), p, frame))

    if float(c.get("tunnel_h", 0)) >= FULL_H_M and not c.get("no_tube"):
        arc = _arc(n)
        dist = np.arange(0.0, arc[-1], 1.0)
        q = np.c_[np.interp(dist, arc, n[:, 0]), np.interp(dist, arc, n[:, 2])]
        fl = np.interp(dist, arc, n[:, 1])
        near = np.linalg.norm(q - p, axis=1) <= 40.0
        q, fl = q[near], fl[near]
        if len(q):
            crown = fl + float(c["tunnel_h"])
            ground = mesh.top("ground", q)
            # The tunnel's own inward-facing vault is at crown, so only cover above it counts.
            cover = mesh.hits("cover", q)
            outside = np.array([any(z > h + 0.05 for z in zz) for zz, h in zip(cover, crown)])
            bare = int((~(ground >= crown + 0.5) & ~outside).sum())
            if bare > BARE_M:
                findings.append(_record("bare", bare, p, frame))
    return findings


def _upper(mesh, chunks, frame):
    """Upper road/deck surfaces that meet a built tunnel vault, sampled along covered floors."""
    out = []
    seen = set()
    for c in chunks:
        if not c.get("deck") or float(c.get("tunnel_h", 0)) <= 0:
            continue
        n = c["n"]
        arc = _arc(n)
        if arc[-1] <= 4:
            continue
        t = np.arange(2.0, arc[-1] - 1.9, 2.0)
        q = np.c_[np.interp(t, arc, n[:, 0]), np.interp(t, arc, n[:, 2])]
        floor = np.interp(t, arc, n[:, 1])
        for p, zf, heights in zip(q, floor, mesh.hits("road", q)):
            top = zf + float(c["tunnel_h"])
            colliding = [z - top for z in heights if z > zf + 1.0 and z < top + UPPER_CLEAR_M]
            key = (round(p[0] / 4), round(p[1] / 4))
            if colliding and key not in seen:
                seen.add(key)
                out.append(_record("breaks_upper", min(colliding), p, frame))
    return out


def _upper_wall(mesh, mouths, frame):
    """Road markings on a tunnel's grass cover: the upper road drives on WALL physics there."""
    out = []
    centres = np.array([m[2] for m in mouths])
    for owner, (_c, _end, p, _way) in enumerate(mouths):
        tri = mesh.triangles("marking", _local_box(p))
        if not len(tri):
            continue
        q = tri.reshape(-1, 3)
        plan = q[:, [0, 2]]
        near = (np.linalg.norm(plan - p, axis=1) <= MOUTH_REACH_M)
        near &= np.argmin(np.sum((plan[:, None] - centres[None]) ** 2, axis=2), axis=1) == owner
        plan, q = plan[near], q[near]
        if not len(plan):
            continue
        grass = mesh.top("grass_cover", plan)
        hit = np.isfinite(grass) & (np.abs(grass - q[:, 1]) < 0.8)
        if hit.any():
            k = int(np.flatnonzero(hit)[0])
            out.append(_record("breaks_upper", 1.0, plan[k], frame, reason="wall_physics",
                               surface="1WALL_tunnel_cap/grass", marking_height=round(float(q[k, 1]), 2)))
    return out


def _marking_drops(mesh, mouths, frame):
    """One report per mouth for road-paint or edge-dirt triangles over one metre tall."""
    out = []
    centres = np.array([m[2] for m in mouths])
    for owner, (_c, _end, p, _way) in enumerate(mouths):
        tri = mesh.triangles("marking", _local_box(p))
        if not len(tri):
            continue
        middle = tri.mean(axis=1)
        plan = middle[:, [0, 2]]
        near = (np.linalg.norm(plan - p, axis=1) <= MOUTH_REACH_M)
        near &= np.argmin(np.sum((plan[:, None] - centres[None]) ** 2, axis=2), axis=1) == owner
        span = marking_spans(tri)
        bad = np.flatnonzero(near & (span > 1.0))
        if len(bad):
            k = int(bad[np.argmax(span[bad])])
            out.append(_record("marking_drop", float(span[k]), plan[k], frame, triangles=len(bad),
                               mouth_x=round(float(p[0]), 2), mouth_z=round(float(p[1]), 2)))
    return out


def _joint_rise(chunks, frame, cache):
    """Internal floor joins near the raw terrain despite a deep cover elsewhere in the connected tube."""
    floors = [c for c in chunks if c.get("deck") and not c.get("tube_only")]
    if not floors:
        return []
    import blockworker
    import grading
    blockworker._s = blockworker._State(str(cache), offline=True, roads=False, grading=False, road_widths=False,
                                        surface=False)
    dem = blockworker._s.dem

    def raw(q):
        enu = np.asarray(q, np.float64).reshape(-1, 2)
        lat, lon, _ = frame.enu_to_geodetic(enu[:, 0], -enu[:, 1], 0.0)
        h = dem.sample(lat, lon, grading.PROFILE_ZOOM)
        return np.asarray(frame.geodetic_to_enu(lat, lon, h)[2], np.float64)

    cover = [raw(c["n"][:, [0, 2]]) - c["n"][:, 1] for c in floors]
    return _joint_findings(floors, cover, frame)


def _joint_findings(floors, cover, frame):
    """Shallow internal joins in a connected tube whose floor is deep elsewhere. Pure given cover arrays."""
    bucket = {}
    ends = []
    for i, c in enumerate(floors):
        for e in (0, -1):
            if c.get("portal", (False, False))[0 if e == 0 else 1]:
                continue
            p = c["n"][e, [0, 2]]
            key = tuple(np.floor(p).astype(int))
            bucket.setdefault(key, []).append((i, e, p, float(c["n"][e, 1])))
            ends.append((i, e, p))
    joins = {}
    graph = [set() for _ in floors]
    for i, e, p in ends:
        options = [entry for dx in (-1, 0, 1) for dz in (-1, 0, 1)
                   for entry in bucket.get(tuple(np.floor(p).astype(int) + (dx, dz)), ())]
        neighbors = [j for j, _k, q, z in options if j != i and np.linalg.norm(q - p) < 1.0
                     and abs(z - floors[i]["n"][e, 1]) < 1.0]
        joins[i, e] = neighbors
        graph[i].update(neighbors)
    component, depth = {}, {}
    for first in range(len(floors)):
        if first in component:
            continue
        todo, members = [first], set()
        while todo:
            i = todo.pop()
            if i in members:
                continue
            members.add(i)
            todo.extend(graph[i] - members)
        deep = max(_finite_max(cover[i]) for i in members)
        for i in members:
            component[i], depth[i] = first, deep
    out, seen = [], set()
    for i, c in enumerate(floors):
        for e in (0, -1):
            if c.get("portal", (False, False))[0 if e == 0 else 1]:
                continue
            p = c["n"][e, [0, 2]]
            cv = float(cover[i][e])
            if not np.isfinite(cv) or cv >= 3.0:
                continue
            deep = depth[i]
            key = (round(p[0]), round(p[1]), round(c["n"][e, 1]))
            if joins.get((i, e)) and deep > 12.0 and key not in seen:
                seen.add(key)
                out.append(_record("joint_rise", cv, p, frame, deepest=round(deep, 1)))
    return out


def scan(track, cache=HERE / "cache"):
    """Tunnel-fault categories of track's retained build; raw elevation only for joint_rise."""
    import geodesy
    import revisit
    track_dir = HERE / "out" / "tracks" / track
    with (track_dir / "tiles" / "anchor.json").open(encoding="utf-8") as f:
        anchor = json.load(f)
    frame = geodesy.EnuFrame(anchor["lat"], anchor["lon"])
    chunks = tunnel_chunks(track_dir)
    mesh = BuiltMesh(track)
    cell = float(anchor.get("terrain_cell_m", measure.HOLE_CELL_M))
    findings = []
    mouths = _mouths(chunks)
    for c, end, p, out in mouths:
        findings.extend(_entrance(mesh, c, end, p, out, frame, cell))
    if mouths:
        findings.extend(_gap_findings(mesh, mouths, cell, frame))
        findings.extend(_upper_wall(mesh, mouths, frame))
        findings.extend(_marking_drops(mesh, mouths, frame))
    findings.extend(_upper(mesh, chunks, frame))
    findings.extend(_joint_rise(chunks, frame, cache))
    return {"track": track, "status": "measured" if chunks else "no_tunnels", "code_key": anchor.get("code_key"),
            "current_code_key": revisit.code_key(),
            "terrain_cell_m": cell,
            "tunnel_chunks": len(chunks), "mouths": len(mouths), "findings": findings,
            "counts": {kind: sum(f["kind"] == kind for f in findings)
                       for kind in ("gap", "proud", "bare", "joint_rise", "blocked", "breaks_upper", "marking_drop")}}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track", help="retained track name under out/tracks")
    ap.add_argument("--json", metavar="FILE", help="write all findings to a JSON file")
    args = ap.parse_args()
    report = scan(args.track)
    if report["status"] == "no_tunnels":
        print(f"{args.track}: no tunnel chunks in the retained build")
    else:
        print(f"{args.track}: {report['tunnel_chunks']} tunnel chunks, {report['mouths']} mouths; "
              + ", ".join(f"{k} {v}" for k, v in report["counts"].items()))
        if report["code_key"] != report["current_code_key"]:
            print("  build code differs from this checkout; OBJ findings use the retained build, joint_rise uses cached elevation")
        for row in report["findings"]:
            detail = f"  ({row['reason']})" if "reason" in row else ""
            print(f"  {row['kind']:13} {row['value']:7.2f}  AC {row['x']:8.1f}, {row['z']:8.1f}  "
                  f"{row['lat']:.6f}, {row['lon']:.6f}{detail}")
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, allow_nan=False)
            f.write("\n")


if __name__ == "__main__":
    main()
