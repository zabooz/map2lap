"""A tunnel portal's heights, read from the code that decides them: at the portal nearest an AC point, along the floor's
last metres and on past the portal, the elevation, the graded ground (lift 0 and grading.ROAD_LIFT, roads only and all),
the floor (roads.TunnelProfiles) and the floor as drawn; the road plans past the portal against the elevation under
them; the tunnel's map range against the part as built (roads._clear_portals); the ground roads the grader takes as the
portals' approaches (roads.portal_approaches). Nothing is built: the track's work folder needs only its anchor.

    .venv\\Scripts\\python.exe tools\\portal.py <track> <AC x> <AC z> [--inside 12] [--outside 8]
"""
import argparse
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
sys.path.insert(0, os.path.join(HERE, "src"))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("track", help="the track's name in out/tracks")
    ap.add_argument("x", type=float, help="AC x (east)")
    ap.add_argument("z", type=float, help="AC z (= -north)")
    ap.add_argument("--inside", type=float, default=12.0, help="m into the tunnel from the portal")
    ap.add_argument("--outside", type=float, default=8.0, help="m out past the portal")
    a = ap.parse_args()
    os.chdir(HERE)
    import generator
    from track import build_tiles
    import blockworker
    import geodesy
    import grading
    import mapgeom
    import roads

    anc = json.load(open(os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json"), encoding="utf-8"))
    frame = geodesy.EnuFrame(anc["lat"], anc["lon"])
    generator._init_worker(os.path.join(HERE, "cache"))
    s_ = blockworker._s
    g, _ = s_.anchor(9, anc["lat"], anc["lon"])
    zoom = build_tiles.DEM_ZOOM
    P = np.array([a.x, -a.z])

    def geo(xy):
        xy = np.asarray(xy, np.float64).reshape(-1, 2)
        la, lo, _ = frame.enu_to_geodetic(xy[:, 0], xy[:, 1], np.zeros(len(xy)))
        return np.asarray(la), np.asarray(lo)

    def raw(la, lo):
        return np.asarray(blockworker.ground(frame, la, lo, s_.dem.sample(la, lo, zoom)), np.float64)

    def up(xy, h):
        la, lo = geo(xy)
        return np.asarray(frame.geodetic_to_enu(la, lo, np.asarray(h, np.float64))[2], np.float64)

    def graded(xy, lift, roads_only=False):
        la, lo = geo(xy)
        return up(xy, g.apply(la, lo, raw(la, lo), lift, roads_only=roads_only))

    def elev(la, lo):
        return g.apply(la, lo, raw(la, lo), grading.ROAD_LIFT)

    tunnels = blockworker.tunnel_profiles(None, frame, elev, g)
    tx, ty = sorted(roads.tiles_near(a.x, -a.z, 1.0))[0]
    cells = [s_.md.cell(k, layers=("roads",), kind="demand").layers.get("roads") for k in roads.cells_of_tile(frame, tx, ty)]
    best = None
    for fid, spec, xy, z, _lon in tunnels.parts(cells, (a.x - 80, -a.z - 80, a.x + 80, -a.z + 80)):
        xy = np.asarray(xy, np.float64)[:, :2]
        for at in (0, -1):
            d = float(np.hypot(*(xy[at] - P)))
            if best is None or d < best[0]:
                best = (d, fid, spec, xy, np.asarray(z, np.float64), at)
    if best is None:
        sys.exit("no tunnel part within 80 m")
    d, fid, spec, xy, z, at = best
    print(f"part {fid} ({spec.cls}, {spec.width} m), portal at its {'end' if at else 'start'}, {d:.1f} m off the point; "
          f"mouths {tunnels.mouth(fid)}")

    # along the floor's last metres and on past the portal
    q, zq = (xy, z) if at == 0 else (xy[::-1], z[::-1])
    s = np.r_[0.0, np.cumsum(np.hypot(*np.diff(q, axis=0).T))]
    k = s <= a.inside + 1e-6
    out = q[0] - q[min(2, len(q) - 1)]
    out /= np.hypot(*out)
    so = np.arange(1.0, a.outside + 1e-6, 1.0)
    ext = q[0] + so[:, None] * out
    L = np.r_[-s[k][::-1], so]
    pts = np.r_[q[k][::-1], ext]
    fl = np.r_[zq[k][::-1], np.full(len(so), np.nan)]
    la, lo = geo(pts)
    cols = (up(pts, raw(la, lo)), graded(pts, 0.0, True), graded(pts, grading.ROAD_LIFT, True),
            graded(pts, grading.ROAD_LIFT), fl, fl + grading.ROAD_LIFT)
    print("\n  m (- inside)  elevation  roads lift 0  roads +lift  physics ground   floor  floor drawn    AC x     AC z")
    for i in range(len(L)):
        print(f"  {L[i]:+11.1f}" + "".join(f"  {c[i]:{w}.3f}" for c, w in zip(cols, (9, 12, 11, 14, 7, 11)))
              + f"  {pts[i, 0]:7.1f}  {-pts[i, 1]:7.1f}")

    # the road plans past the portal against the elevation under their vertices
    probe = ext[min(3, len(ext) - 1)] if len(ext) else q[0]
    print(f"\nplans at AC {probe[0]:.1f} {-probe[1]:.1f} (z - elevation at their vertices)")
    for p in g.plans(*geo(probe)):
        gap, kk, t = roads._line_gap(probe[None], p.xy)
        if gap[0] > p.half:
            continue
        pla, plo = geo(p.xy)
        dz = p.z - up(p.xy, raw(pla, plo))
        sp = np.r_[0.0, np.cumsum(np.hypot(*np.diff(p.xy, axis=0).T))]
        zz = p.z[kk[0]] + t[0] * (p.z[min(kk[0] + 1, len(p.z) - 1)] - p.z[kk[0]])
        print(f"  rid {p.rid}{' (tunnel)' if p.tunnel else ''}, {sp[-1]:.0f} m, from AC ({p.xy[0, 0]:.1f} {-p.xy[0, 1]:.1f})"
              f" to ({p.xy[-1, 0]:.1f} {-p.xy[-1, 1]:.1f}), {gap[0]:.1f} m off: z {zz:.3f}, z - elevation median "
              f"{np.median(dz):+.3f}, {dz.min():+.3f} .. {dz.max():+.3f}")
        step = max(1, len(sp) // 20)
        print("     " + " ".join(f"{sp[i]:.0f}:{dz[i]:+.2f}" for i in range(0, len(sp), step)))

    # the tunnel's map range against the part as built, and the approaches the grader finds at its portals
    fid0 = fid.split(".")[0]
    for cf in cells:
        if cf is None or not len(cf) or fid0 not in [str(v) for v in cf.ids]:
            continue
        i = [str(v) for v in cf.ids].index(fid0)
        for m_, b_ in zip(roads._parts_by_level(cf, i, "tunnel"), roads.tunnel_parts(cf, i)):
            em, nm = mapgeom.enu_xy(cf, frame, m_)
            eb, nb = mapgeom.enu_xy(cf, frame, b_)
            print(f"\ntunnel in the map AC ({em[0]:.1f} {-nm[0]:.1f}) .. ({em[-1]:.1f} {-nm[-1]:.1f}), built "
                  f"({eb[0]:.1f} {-nb[0]:.1f}) .. ({eb[-1]:.1f} {-nb[-1]:.1f})")
        for j, r in enumerate(roads.ground_parts(cf, i)):
            e, n = mapgeom.enu_xy(cf, frame, r)
            print(f"  its ground part {j}: AC ({e[0]:.1f} {-n[0]:.1f}) .. ({e[-1]:.1f} {-n[-1]:.1f})")
        break
    lines = []
    for ck in roads.cells_of_tile(frame, tx, ty):
        cf = s_.md.cell(ck, layers=("roads",), kind="demand").layers.get("roads")
        lines += roads.approach_lines(cf, frame) if cf is not None and len(cf) else []
    apps = roads.portal_approaches(xy, lines, roads.approach_reach(spec))
    print("approaches (start, end):", ", ".join("none" if p is None else f"{len(p)} points from AC ({p[0, 0]:.1f} "
                                                f"{-p[0, 1]:.1f})" for p in apps))
    for at_, name in ((0, "start"), (-1, "end")):
        dd = sorted(min(float(np.hypot(*(ln[0] - xy[at_]))), float(np.hypot(*(ln[-1] - xy[at_])))) for ln in lines)
        print(f"  nearest ground road ends to its {name} (m): {[round(v, 1) for v in dd[:3]]} "
              f"(an approach needs one within roads.APPROACH_JOIN_M = {roads.APPROACH_JOIN_M})")


if __name__ == "__main__":
    main()
