"""Start and finish of a point-to-point track made visible, in comic style: a checkered band across the whole road
and a gantry over it, two posts beside the road (with collision) and a banner reading "START" or "FINISH". The road
width at the line is sampled in the terrain texture (the painted road, _Tex).

Also decides exactly where the lines are (anchor.json timing["gates"]): obj_to_kn5.ab_gates puts AC_AB_START/FINISH on
the same points, so the clock starts and stops exactly at the band. As there: without road at timing["start_m"] the
start moves up to 50 m forward, the finish up to 50 m back.

Textures with thick black borders per face (the edges look drawn); the banner has its gantry's aspect ratio, so the
lettering is never stretched.
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import build_tiles
import make_obj
import obj_to_kn5

roadsmod = build_tiles.roadsmod

SQUARE_M = 0.6                  # checker square; the band is two squares deep
BAND_LIFT = 0.03                # m above the road (like the markings)
SPAN_STEP, SPAN_MAX, SPAN_GAP = 0.25, 14.0, 1.0     # sampling the road width per side (gaps up to 1 m bridged)
POST_GAP, POST_W, POST_TOP = 1.2, 0.45, 6.6          # posts: distance from the road edge, width, height above the road
BANNER_LOW, BANNER_HIGH, BANNER_T = 5.0, 6.4, 0.3    # banner: bottom, top above the road, thickness
BANNER_PX = 256                 # banner texture height
INK = (22, 22, 26)              # outlines
COLORS = {"start": (38, 166, 84), "finish": (224, 36, 58)}      # banner colour
WORDS = {"start": "START", "finish": "FINISH"}
FONTS = ("ariblk.ttf", "impact.ttf", "arialbd.ttf")             # (Windows; else Pillow's own)
MATERIALS = ("gate_band", "gate_post", "gate_start", "gate_finish")


class _Mesh:
    """Quads with their UV; winding by the wanted outward direction (ENU, z up)."""

    def __init__(self):
        self.P, self.UV, self.T = [], [], []

    def quad(self, pts, out, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
        n = len(self.P)
        self.P += [np.asarray(p, float) for p in pts]
        self.UV += list(uv)
        if np.cross(self.P[n + 1] - self.P[n], self.P[n + 2] - self.P[n]) @ out >= 0:
            self.T += [(n, n + 1, n + 2), (n, n + 2, n + 3)]
        else:
            self.T += [(n, n + 2, n + 1), (n, n + 3, n + 2)]

    def box(self, b0, b1, ax, ay, hx, hy, bottom=False):
        """Upright box from b0 (bottom centre) to b1 (top centre), half widths hx, hy along ax, ay."""
        up = np.array([0.0, 0.0, 1.0])
        for a, b, ha, hb in ((ax, ay, hx, hy), (-ax, ay, hx, hy), (ay, ax, hy, hx), (-ay, ax, hy, hx)):
            c0, c1 = b0 + a * ha, b1 + a * ha
            self.quad([c0 - b * hb, c0 + b * hb, c1 + b * hb, c1 - b * hb], a)
        for c, s in ((b1, 1.0), (b0, -1.0)) if bottom else ((b1, 1.0),):
            self.quad([c - ax * hx - ay * hy, c + ax * hx - ay * hy, c + ax * hx + ay * hy, c - ax * hx + ay * hy],
                      up * s)

    def arrays(self):
        return np.array(self.P), np.array(self.UV, float), np.array(self.T, np.int64)


def _height(objs, x, y, prefixes=("1ROAD_", "1GRAVEL_")):
    """Height (ENU z) of the objects at the point (x east, y north), or None."""
    return obj_to_kn5.road_height(objs, x, -y, prefixes)


def _place(objs, xy, s, d0, step):
    """(centre ENU, driving direction ENU) of the line at d0 m along the route; without road there up to 25 steps on."""
    for d in d0 + step * np.arange(26):
        x, y, fwd_ac = obj_to_kn5._along(xy, s, d)
        h = _height(objs, x, y)
        if h is not None:
            return np.array([x, y, h]), np.array([fwd_ac[0], -fwd_ac[2], 0.0])
    return None, None


class _Tex:
    """The terrain textures (ground.py: the road painted in, 12.5 cm per pixel) to look up how wide the road really is
    at the line: the 2 m physics cells were 25 m wide at the Stausee start (a car park next to it), the painted road
    was 8 m."""

    def __init__(self, tex_dir):
        self.dir, self.img = tex_dir, {}

    def rgb(self, x, y):
        t = roadsmod.TILE
        tx, ty = int(np.floor(x / t)), int(np.floor(y / t))
        if (tx, ty) not in self.img:
            p = os.path.join(self.dir, f"ground_{tx}_{ty}.jpg")
            self.img[(tx, ty)] = np.asarray(Image.open(p).convert("RGB"), np.float32) if os.path.exists(p) else None
        a = self.img[(tx, ty)]
        if a is None:
            return None
        n = a.shape[0]
        return a[min(n - 1, int(((ty + 1) * t - y) / t * n)), min(n - 1, int((x - tx * t) / t * n))]


TEX_STEP, TEX_TOL, TEX_GAP = 0.125, 30.0, 0.6   # m per sample, colour distance to the road centre, bridged patches/cracks


def _tex_span(tex, c, left):
    """Road left and right of the centre c by the painted colour (the centre's, median over ±0.5 m); None without a
    texture."""
    ref = [tex.rgb(*(c + left * d)[:2]) for d in np.arange(-0.5, 0.51, TEX_STEP)]
    ref = [r for r in ref if r is not None]
    if not ref:
        return None
    ref = np.median(ref, axis=0)
    out = []
    for sgn in (1.0, -1.0):
        last, d = 0.0, TEX_STEP
        while d <= SPAN_MAX:
            p = c + left * sgn * d
            r = tex.rgb(p[0], p[1])
            if r is not None and np.linalg.norm(r - ref) < TEX_TOL:
                last = d
            elif d - last > TEX_GAP:
                break
            d += TEX_STEP
        out.append(max(last, 2.0))
    return out


def _span(objs, c, left):
    """Road left and right of the centre c (m along left or -left) by the physics cells (without a texture)."""
    out = []
    for sgn in (1.0, -1.0):
        last, d = 0.0, SPAN_STEP
        while d <= SPAN_MAX:
            p = c + left * sgn * d
            if _height(objs, p[0], p[1]) is not None:
                last = d
            elif d - last > SPAN_GAP:
                break
            d += SPAN_STEP
        out.append(max(last, 2.0))
    return out


def _font(px):
    for name in FONTS:
        try:
            return ImageFont.truetype(name, px)
        except OSError:
            continue
    return ImageFont.load_default()


def _checker(d, x0, y0, n_x, n_y, sq):
    for i in range(n_x):
        for j in range(n_y):
            d.rectangle([x0 + i * sq, y0 + j * sq, x0 + (i + 1) * sq - 1, y0 + (j + 1) * sq - 1],
                        fill=(240, 240, 235) if (i + j) % 2 else INK)


def _banner(path, kind, aspect):
    """Banner: colour, checkers at both ends, the word in white with a thick outline and an offset shadow."""
    h = BANNER_PX
    w = max(2 * h, int(round(h * aspect)))
    img = Image.new("RGB", (w, h), COLORS[kind])
    d = ImageDraw.Draw(img)
    border, sq = 10, (h - 20) // 4
    for x0 in (border, w - border - 2 * sq):
        _checker(d, x0, border, 2, 4, sq)
    font = _font(int(h * 0.58))
    word = WORDS[kind]
    box = d.textbbox((0, 0), word, font=font, stroke_width=12)
    tx, ty = (w - (box[2] - box[0])) / 2 - box[0], (h - (box[3] - box[1])) / 2 - box[1]
    d.text((tx + 9, ty + 9), word, font=font, fill=INK, stroke_width=12, stroke_fill=INK)      # (shadow)
    d.text((tx, ty), word, font=font, fill=(250, 250, 245), stroke_width=12, stroke_fill=INK)
    d.rectangle([0, 0, w - 1, h - 1], outline=INK, width=border)
    img.save(path)


def make_textures(tex_dir):
    """Band (2 x 2 squares) and posts (grey, black border: every face looks drawn)."""
    img = Image.new("RGB", (256, 256))
    _checker(ImageDraw.Draw(img), 0, 0, 2, 2, 128)
    img.save(os.path.join(tex_dir, "gate_band.png"))
    img = Image.new("RGB", (64, 64), (72, 74, 82))
    ImageDraw.Draw(img).rectangle([0, 0, 63, 63], outline=INK, width=5)
    img.save(os.path.join(tex_dir, "gate_post.png"))


def _gate(kind, objs, ground, c, fwd, obj, tex_dir, tex):
    """Band, posts and banner of one line into obj; returns (left, right) up to the posts (m)."""
    up = np.array([0.0, 0.0, 1.0])
    left = np.cross(up, fwd)
    lw, rw = _tex_span(tex, c, left) or _span(objs, c, left)
    # band: a grid across the road (vertices at the road height, else the centre's)
    across = np.r_[np.arange(-rw, lw, SQUARE_M), lw]
    along = np.array([-SQUARE_M, 0.0, SQUARE_M])
    P, UV = [], []
    for w in along:
        for a in across:
            p = c + left * a + fwd * w
            h = _height(objs, p[0], p[1])
            P.append([p[0], p[1], (c[2] if h is None else h) + BAND_LIFT])
            UV.append([(a + rw) / (2 * SQUARE_M), (w + SQUARE_M) / (2 * SQUARE_M)])
    n = len(across)
    T = []
    for j in range(len(along) - 1):
        for i in range(n - 1):
            k = j * n + i
            T += [(k, k + 1, k + n + 1), (k, k + n + 1, k + n)]
    P, T = np.array(P), np.array(T, np.int64)
    flip = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])[:, 2] < 0     # (top side up)
    T[flip] = T[flip][:, ::-1]
    obj.add(f"nocol_gate_band_{kind}", "gate_band", P, np.array(UV), T)

    # posts beside the road (foot on grass or road, dug in a little), banner from post to post
    lh, rh = lw + POST_GAP, rw + POST_GAP
    posts, frame, banner = _Mesh(), _Mesh(), _Mesh()
    for e in (c + left * lh, c - left * rh):
        g = _height(ground, e[0], e[1], ("1GRASS_", "1ROAD_", "1GRAVEL_"))
        b0 = np.array([e[0], e[1], (c[2] if g is None else g) - 0.5])
        posts.box(b0, np.array([e[0], e[1], c[2] + POST_TOP]), left, fwd, POST_W / 2, POST_W / 2)
    lo, hi, t = c[2] + BANNER_LOW, c[2] + BANNER_HIGH, BANNER_T / 2
    el, er = c + left * lh, c - left * rh

    def at(e, z, f):
        return np.array([e[0], e[1], z]) + fwd * f
    # front (towards the arriving driver: looking along fwd, his left is +left) and back (looking back): lettering readable
    banner.quad([at(el, lo, -t), at(er, lo, -t), at(er, hi, -t), at(el, hi, -t)], -fwd)
    banner.quad([at(er, lo, t), at(el, lo, t), at(el, hi, t), at(er, hi, t)], fwd)
    frame.quad([at(el, hi, -t), at(er, hi, -t), at(er, hi, t), at(el, hi, t)], up)
    frame.quad([at(el, lo, t), at(er, lo, t), at(er, lo, -t), at(el, lo, -t)], -up)
    _banner(os.path.join(tex_dir, f"gate_{kind}.png"), kind, (lh + rh) / (BANNER_HIGH - BANNER_LOW))
    obj.add(f"1WALL_gate_post_{kind}", "gate_post", *posts.arrays())
    obj.add(f"nocol_gate_frame_{kind}", "gate_post", *frame.arrays())
    obj.add(f"nocol_gate_banner_{kind}", f"gate_{kind}", *banner.arrays())
    return lh, rh


def build(tiles_dir, obj_dir, log=print):
    """Start and finish to obj_dir/parts/gates.obj (materials into track.mtl, textures to textures/) and their position
    to anchor.json timing["gates"]; returns the path, None without timing (area, circuit)."""
    anc_path = os.path.join(tiles_dir, "anchor.json")
    with open(anc_path, encoding="utf-8") as f:
        anc = json.load(f)
    timing, route = anc.get("timing"), anc.get("route")
    if not timing or not route:
        return None
    xy = np.asarray(route, float)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    tex_dir = os.path.join(obj_dir, "textures")
    make_textures(tex_dir)
    path = os.path.join(obj_dir, "parts", "gates.obj")
    obj = make_obj.Obj(path, header=False)
    placed, tex = {}, _Tex(tex_dir)
    for kind, d0, step in (("start", timing["start_m"], 2.0), ("finish", timing["finish_m"], -2.0)):
        x, y, _ = obj_to_kn5._along(xy, s, d0)
        near = [os.path.join(obj_dir, "parts", f"t_{tx}_{ty}.obj") for tx, ty in anc["tiles"]
                if roadsmod.box_gap(*roadsmod.tile_bbox(tx, ty), x, y) < 120.0]
        ground = {}
        for p in near:
            if os.path.exists(p):
                ground.update({k: v for k, v in obj_to_kn5.read_obj(p).items()
                               if k.startswith(("1ROAD_", "1GRAVEL_", "1GRASS_"))})
        c, fwd = _place(ground, xy, s, d0, step)
        if c is None:
            log(f"No road at the {kind} line: no start and finish")
            obj.close()
            os.remove(path)
            return None
        lh, rh = _gate(kind, ground, ground, c, fwd, obj, tex_dir, tex)
        placed[kind] = {"pos": [float(c[0]), float(c[2]), float(-c[1])], "fwd": [float(fwd[0]), 0.0, float(-fwd[1])],
                        "left": lh, "right": rh}       # (AC: x east, y up, z = -north)
    obj.close()
    timing["gates"] = placed
    with open(anc_path, "w", encoding="utf-8") as f:
        json.dump(anc, f)
    with open(os.path.join(obj_dir, "track.mtl"), "a", encoding="utf-8") as f:
        for m in MATERIALS:
            f.write(f"newmtl {m}\nKd 1 1 1\nmap_Kd textures/{m}.png\n\n")
    log(f"Start and finish: road {placed['start']['left'] + placed['start']['right'] - 2 * POST_GAP:.1f} m and "
        f"{placed['finish']['left'] + placed['finish']['right'] - 2 * POST_GAP:.1f} m wide")
    return path
