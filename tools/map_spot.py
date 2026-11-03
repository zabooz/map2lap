"""A picture of a spot as our code sees it: the map's roads (Overture / OpenStreetMap) with their drawn asphalt, names,
one-way arrows and bridges, the grading's plans with their widths, and the route with its metres. Built from the
track's kept tiles (out/tracks/<track>) and today's map data cache; written to out/map_<track>_<m>.png.

    .venv\\Scripts\\python.exe tools\\map_spot.py <track> --route <m>             # around a route metre
    .venv\\Scripts\\python.exe tools\\map_spot.py <track> <AC x> <AC z>            # around a point
    .venv\\Scripts\\python.exe tools\\map_spot.py <track> --route <m> --radius 150

Look at it before reasoning from feature ids and widths: how many carriageways, what is connected, what lies between
(SH16 in Auckland: four and more one-way carriageways of one name, ground between them, read from numbers as two).
In the picture:
- grey: each road's drawn asphalt (roads.road_specs with the land cover, as surface.paint_roads paints it); darker:
  its pieces on a bridge, lighter: in a tunnel; its line black, an arrow along a one-way road;
- coloured outlines: each grading plan (grading.Plan) at its carriageway's half width (solid) and its core half width
  (dashed, the ground it levels): overlapping plans of different heights pull each other's ground;
  the plan's height at the spot is written at its line;
- red: the route, with its metres every 50 m (100 m past a radius of 150).
"""
import argparse
import os
import sys
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder: make_obj moves the cwd)
sys.path.insert(0, os.path.join(HERE, "tools"))
import heights  # noqa: E402
import measure  # noqa: E402

PX = 1400               # px: the picture's side
PLAN_COLOURS = ((0, 114, 178), (213, 94, 0), (0, 158, 115), (204, 121, 167), (230, 159, 0), (86, 180, 233))


def to_px(x, y, centre, radius):
    """Picture pixels of points east x, north y around centre (east, north) within radius m. Pure."""
    s = PX / (2.0 * radius)
    return (np.asarray(x) - centre[0]) * s + PX / 2, PX / 2 - (np.asarray(y) - centre[1]) * s


def offset(xy, d):
    """Polyline xy (n, 2) moved d m to its left (normals averaged at the joints). Pure."""
    xy = np.asarray(xy, np.float64)
    t = np.diff(xy, axis=0)
    t = t / np.maximum(np.hypot(*t.T), 1e-12)[:, None]
    n = np.c_[-t[:, 1], t[:, 0]]
    nv = np.r_[n[:1], n[:-1] + n[1:], n[-1:]]
    nv = nv / np.maximum(np.hypot(*nv.T), 1e-12)[:, None]
    return xy + nv * d


def _draw_line(draw, xy, centre, radius, fill, width=1, dash=None):
    if len(xy) < 2:
        return
    u, v = to_px(xy[:, 0], xy[:, 1], centre, radius)
    pts = list(zip(u.tolist(), v.tolist()))
    if dash is None:
        draw.line(pts, fill=fill, width=width)
        return
    for a, b in zip(pts[:-1], pts[1:]):           # (a dashed line: every other piece of dash px)
        L = float(np.hypot(b[0] - a[0], b[1] - a[1]))
        for k in range(0, int(L // dash) + 1, 2):
            t0, t1 = k * dash / max(L, 1e-9), min((k + 1) * dash / max(L, 1e-9), 1.0)
            draw.line([(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0),
                       (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)], fill=fill, width=width)


def nearest(parts, centre):
    """(part, index) of the vertex of parts nearest centre. Pure."""
    best = None
    for p in parts:
        if len(p):
            j = int(np.argmin(np.hypot(p[:, 0] - centre[0], p[:, 1] - centre[1])))
            d = float(np.hypot(*(p[j] - np.asarray(centre))))
            if best is None or d < best[0]:
                best = (d, p, j)
    return (best[1], best[2]) if best else (None, None)


def draw_roads(draw, font, sp, centre, radius):
    """The map's roads near centre: drawn asphalt, line, arrow, name; returns {plan rid: its road's label}."""
    import grading
    import mapgeom
    import roads
    s = PX / (2.0 * radius)
    box = (centre[0] - radius, centre[1] - radius, centre[0] + radius, centre[1] + radius)
    tiles = {heights.tile_of(x, y) for x in (box[0], box[2]) for y in (box[1], box[3])}
    tiles |= {(tx, ty) for tx in range(min(t[0] for t in tiles), max(t[0] for t in tiles) + 1)
              for ty in range(min(t[1] for t in tiles), max(t[1] for t in tiles) + 1)}
    keys = sorted({k for t in tiles for k in roads.cells_of_tile(sp.frame, *t)})
    seen, labels, of_rid = set(), [], {}
    for key in keys:
        f = sp.s.md.cell(key, layers=("roads",), kind="demand").layers.get("roads")
        if f is None or not len(f.kind):
            continue
        specs = roads.road_specs(f, sp.s.surface.urban if sp.s.surface else None, sp.s.widths)
        names = f.attrs.get("name")
        for i, spec in enumerate(specs):
            fid = str(f.ids[i])
            if spec is None or fid in seen:
                continue
            seen.add(fid)
            ground = [np.c_[mapgeom.enu_xy(f, sp.frame, r)] for r in roads.ground_parts(f, i)]
            decks = [np.c_[mapgeom.enu_xy(f, sp.frame, r)] for r in roads.bridge_parts(f, i)]
            tubes = [np.c_[mapgeom.enu_xy(f, sp.frame, r)] for r in roads.tunnel_parts(f, i)]
            allp = ground + decks + tubes
            if not allp or not any(((p[:, 0] > box[0] - 20) & (p[:, 0] < box[2] + 20) & (p[:, 1] > box[1] - 20)
                                    & (p[:, 1] < box[3] + 20)).any() for p in allp if len(p)):
                continue
            w = max(1, int(round(spec.width * s)))
            for parts, grey in ((tubes, (215, 215, 215)), (ground, (180, 180, 180)), (decks, (120, 120, 120))):
                for p in parts:
                    _draw_line(draw, p, centre, radius, grey, w)
            for p in allp:
                _draw_line(draw, p, centre, radius, (0, 0, 0), 1)
            p, k = nearest(allp, centre)        # (arrow and name where the road comes nearest the spot)
            if spec.oneway and p is not None and len(p) >= 2:
                k = min(max(k, 1), len(p) - 1)
                a, b = p[k - 1], p[k]
                if spec.dir and spec.dir < 0:
                    a, b = b, a
                d = (b - a) / max(float(np.hypot(*(b - a))), 1e-9)
                tip = np.asarray(centre) + np.dot(a - np.asarray(centre), [-d[1], d[0]]) * np.array([-d[1], d[0]])
                for side in (1, -1):
                    tail = tip - d * 5 + np.array([-d[1], d[0]]) * 2.5 * side
                    _draw_line(draw, np.array([tail, tip]), centre, radius, (0, 0, 0), 3)
            nm = str(names[i]) if names is not None and str(names[i]) not in ("", "None") else ""
            label = f"{nm[:24]} {spec.cls} {spec.width:.1f}m {fid[:8]}".strip()
            of_rid[grading.road_id(fid)] = f"{nm[:20]} {fid[:8]}".strip()
            if p is not None:
                u, v = to_px(p[k, 0], p[k, 1], centre, radius)
                labels.append((float(u), float(v), label))
    for u, v, text in labels:
        if 0 <= u < PX and 0 <= v < PX:
            draw.text((u + 4, v + 4), text, fill=(60, 60, 60), font=font)
    return of_rid


def draw_plans(draw, font, sp, centre, radius, of_rid):
    """The grading's plans near centre: carriageway half width solid, core half width dashed, height at the spot."""
    xs, ys = np.meshgrid(np.linspace(centre[0] - radius, centre[0] + radius, 9),
                         np.linspace(centre[1] - radius, centre[1] + radius, 9))
    plans = sp.g.plans(*sp.lalo(xs.ravel(), ys.ravel())) if sp.g is not None else []
    for k, p in enumerate(plans):
        xy = np.asarray(p.xy, np.float64)[:, :2]
        if len(xy) < 2:
            continue
        c = PLAN_COLOURS[k % len(PLAN_COLOURS)]
        for side in (1, -1):
            _draw_line(draw, offset(xy, side * p.road_half), centre, radius, c, 2)
            _draw_line(draw, offset(xy, side * p.half), centre, radius, c, 1, dash=6)
        j = int(np.argmin(np.hypot(xy[:, 0] - centre[0], xy[:, 1] - centre[1])))
        u, v = to_px(xy[j, 0], xy[j, 1], centre, radius)
        if 0 <= u < PX and 0 <= v < PX:
            draw.text((float(u) + 4, float(v) - 16), f"plan {of_rid.get(p.rid, p.rid)}: z {p.z[j]:.2f}, "
                      f"half {p.road_half:.2f} / {p.half:.2f}", fill=c, font=font)


def draw_route(draw, font, track, centre, radius):
    """The route in red with its metres."""
    route = measure._route(track)
    xy = np.c_[route[:, 0], -route[:, 1]]
    _draw_line(draw, xy, centre, radius, (220, 0, 0), 3)
    S = np.r_[0.0, np.cumsum(np.hypot(*np.diff(xy, axis=0).T))]
    step = 50.0 if radius <= 150 else 100.0
    for m in np.arange(0.0, S[-1], step):
        x, y = np.interp(m, S, xy[:, 0]), np.interp(m, S, xy[:, 1])
        u, v = to_px(x, y, centre, radius)
        if 0 <= u < PX and 0 <= v < PX:
            draw.ellipse([u - 4, v - 4, u + 4, v + 4], fill=(220, 0, 0))
            draw.text((float(u) + 6, float(v) + 2), f"{m:.0f} m", fill=(220, 0, 0), font=font)


def main():
    from PIL import Image, ImageDraw, ImageFont
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("x", nargs="?", type=float, help="AC x")
    ap.add_argument("z", nargs="?", type=float, help="AC z")
    ap.add_argument("--route", type=float, help="a route metre instead of x and z")
    ap.add_argument("--radius", type=float, default=80.0, help="m around the spot (default 80)")
    a = ap.parse_args()
    if not os.path.exists(os.path.join(HERE, "out", "tracks", a.track, "tiles", "anchor.json")):
        sys.exit(f"no build of {a.track} in out/tracks (keep the build files, or tools\\from_debug.py)")
    if a.route is not None:
        _ss, px, py = heights.stretch(measure._route(a.track), a.route, a.route, 1.0)
        centre, tag = (float(px[0]), float(py[0])), f"{a.route:.0f}"
    elif a.x is not None and a.z is not None:
        centre, tag = (a.x, -a.z), f"x{a.x:.0f}_z{a.z:.0f}"
    else:
        ap.error("AC x and z, or --route")
    img = Image.new("RGB", (PX, PX), (250, 250, 245))
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default(size=14)
    with tempfile.TemporaryDirectory() as tex:
        sp = heights.Spot(a.track, tex)
        of_rid = draw_roads(draw, font, sp, centre, a.radius)
        draw_plans(draw, font, sp, centre, a.radius, of_rid)
    draw_route(draw, font, a.track, centre, a.radius)
    draw.text((10, 10), f"{a.track} at {tag}, {2 * a.radius:.0f} m across; north up", fill=(0, 0, 0), font=font)
    out = os.path.join(HERE, "out", f"map_{a.track}_{tag}.png")
    img.save(out)
    print(out)


if __name__ == "__main__":
    main()
