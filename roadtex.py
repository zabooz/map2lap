"""Comic textures for BeamNG.Earth's road decals (since 1.7.1), whose game textures we don't have:

- Gravel edge ECA_road_edge_dirt (roads.EDGE_DECAL): a 1.6 m band along the edge of roads without a kerb; u across
  (u = 1 on the asphalt, road edge at roads.EDGE_DECAL_AT), v along (6.4 m per repeat). Opaque from the edge to a
  frayed line, transparent beyond it (alpha test).
- Turn arrows roadmarkings1 (markings.ARROW_CELLS): a 4 x 4 atlas, row 0 left, right, straight, the tip at the front
  (v0 of the cell). Our OBJ -> kn5 chain negates v (obj_to_kn5): whether BeamNG's row 0 ends up at the top or the
  bottom of the image depends on that, so the arrows sit at the top and mirrored in the bottom row.
"""
import math
import random

from PIL import Image, ImageDraw

EDGE_PX = (128, 512)            # across (u), along (v)
EDGE_AT = 0.95                  # (roads.EDGE_DECAL_AT: the asphalt edge)
EDGE_MIN, EDGE_MAX = 0.62, 0.76  # u of the frayed outer line (band 0.3-0.5 m wide)
EDGE_RGB = (166, 154, 128)
ARROW_PX = 512


def make_edge(path, seed=5):
    """Gravel edge (RGBA, seamless along)."""
    rng = random.Random(seed)
    w, h = EDGE_PX
    img = Image.new("RGBA", (w, h), EDGE_RGB + (0,))
    px = img.load()
    waves = [(rng.randint(1, 3) * k, rng.uniform(0, 2 * math.pi), rng.uniform(0.4, 1.0) / k) for k in (1, 3, 7, 13)]
    norm = sum(a for _f, _p, a in waves)
    for y in range(h):
        t = 2 * math.pi * y / h
        r = 0.5 + 0.5 * sum(a * math.sin(f * t + p) for f, p, a in waves) / norm
        x0 = int((EDGE_MIN + (EDGE_MAX - EDGE_MIN) * r) * w)
        for x in range(x0, int(EDGE_AT * w) + 1):
            px[x, y] = EDGE_RGB + (255,)
    d = ImageDraw.Draw(img)
    for _ in range(260):            # pebbles: darker and lighter, only in the opaque band
        x, y = rng.uniform(EDGE_MIN * w, EDGE_AT * w), rng.uniform(0, h)
        r = rng.uniform(1.0, 2.6)
        if px[int(x), int(y) % h][3]:
            c = (128, 118, 96) if rng.random() < 0.6 else (198, 188, 162)
            for dy in (-h, 0, h):   # (drawn across the edge: seamless)
                d.ellipse([x - r, y + dy - r, x + r, y + dy + r], fill=c + (255,))
    img.save(path)


def _arrow(d, x0, y0, cell, kind, flip):
    """A white arrow in the cell (x0, y0); tip up (flip: down)."""
    def p(u, v):                    # (u, v) in 0..1 of the cell, v = 0 at the front
        return x0 + u * cell, y0 + ((1 - v) if flip else v) * cell
    c, sw, head, hw = 0.5, 0.07, 0.30, 0.17
    if kind == "through":
        shape = [(c - sw, 0.86), (c - sw, head), (c - hw, head), (c, 0.12), (c + hw, head), (c + sw, head),
                 (c + sw, 0.86)]
        d.polygon([p(u, v) for u, v in shape], fill=(240, 240, 235, 255))
        return
    s = -1 if kind == "left" else 1     # (looking in the driving direction, tip ahead: left is small u)
    stem = [(c - sw, 0.86), (c - sw, 0.40), (c + sw, 0.40), (c + sw, 0.86)]
    arm = [(c - sw * s, 0.40), (c - sw * s, 0.26), (c + 0.12 * s, 0.26), (c + 0.12 * s, 0.40)]
    tip = [(c + 0.12 * s, 0.17), (c + 0.12 * s, 0.49), (c + 0.30 * s, 0.33)]
    for shape in (stem, arm, tip):
        d.polygon([p(u, v) for u, v in shape], fill=(240, 240, 235, 255))


# --- Road surfaces in comic style (they used to be ambientCG photos: in the terrain texture at 12.5 cm per pixel a
# cobblestone became 1-2 pixels of mush). Drawn coarse enough to stay readable at 12.5 cm per pixel; seamless,
# 512 px per repeat (ground.ROAD_LOOKS: m per repeat).
SURFACE_PX = 512
COBBLE_N = 7                    # stones per repeat and direction (4 m: ~57 cm per stone, ~4.5 pixels in game;
                                # 45 cm were hard to read)
COBBLE_STONES = ((150, 146, 138), (138, 134, 126), (162, 156, 146), (128, 124, 118), (156, 148, 136))
COBBLE_JOINT, COBBLE_JOINT_PX = (84, 80, 74), 9.0


def _cobble(seed):
    """Irregular cobbles without a direction (fit any curve): Voronoi stones on a jittered grid, one colour per stone,
    lighter towards the middle (domed), dark joints; seamless (the grid jitter repeats)."""
    import numpy as np
    n, px = COBBLE_N, SURFACE_PX
    cell = px / n
    rng = np.random.default_rng(seed)
    jx, jy = rng.uniform(0.2, 0.8, (n, n)), rng.uniform(0.2, 0.8, (n, n))
    tint = rng.integers(0, len(COBBLE_STONES), (n, n))
    yy, xx = np.mgrid[0:px, 0:px] + 0.5
    ci, cj = (xx // cell).astype(int), (yy // cell).astype(int)
    d1, d2, own = np.full(xx.shape, np.inf), np.full(xx.shape, np.inf), np.zeros(xx.shape, int)
    for di in (-1, 0, 1):
        for dj in (-1, 0, 1):
            i, j = ci + di, cj + dj
            d = np.hypot(xx - (i + jx[j % n, i % n]) * cell, yy - (j + jy[j % n, i % n]) * cell)
            k = (j % n) * n + (i % n)
            closer = d < d1
            d2 = np.where(closer, d1, np.minimum(d2, d))
            own = np.where(closer, k, own)
            d1 = np.where(closer, d, d1)
    col = np.array(COBBLE_STONES, float)[tint.ravel()[own]] * (1.1 - 0.3 * np.clip(d1 / cell, 0, 1))[..., None]
    col[(d2 - d1) < COBBLE_JOINT_PX] = COBBLE_JOINT
    return Image.fromarray(np.uint8(np.clip(col, 0, 255)))


def make_surfaces(tex_dir, seed=31):
    """The comic surfaces as road_<kind>.png into tex_dir (ground.ROAD_LOOKS)."""
    import groundcover as gc
    looks = {}
    rng = random.Random(seed)
    # Asphalt and concrete in one colour; their blotches are added world-locked (ground.CALM). A first version had
    # blotches and light grains: grains below a pixel turned into noise and the blotches repeated every 4 m, which
    # looked like gravel in game, plus stripes depending on the viewing angle
    looks["road_asphalt"] = gc._base((94, 94, 97))              # (slightly cool: beige under the warm sun otherwise)
    looks["road_concrete"] = gc._base((172, 170, 165))
    img = gc._base((170, 160, 140))                             # gravel: lots of pebbles
    gc._dots(img, rng, [(150, 140, 122), (188, 180, 162), (134, 126, 112), (160, 150, 130)], 900, (6, 14))
    looks["road_gravel"] = img
    img = gc._base((142, 114, 82))                              # dirt: brown, small stones
    gc._dots(img, rng, [(128, 102, 72), (156, 128, 94)], 500, (8, 20))
    gc._dots(img, rng, [(170, 160, 140)], 120, (3, 7))
    looks["road_dirt"] = img
    looks["road_cobble"] = _cobble(seed)
    for name, im in looks.items():
        im.save(f"{tex_dir}/{name}.png")
    return list(looks)


def make_arrows(path):
    """Arrow atlas like roadmarkings1 (RGBA)."""
    img = Image.new("RGBA", (ARROW_PX, ARROW_PX), (240, 240, 235, 0))
    d = ImageDraw.Draw(img)
    cell = ARROW_PX // 4
    for col, kind in enumerate(("left", "right", "through")):
        _arrow(d, col * cell, 0, cell, kind, False)
        _arrow(d, col * cell, 3 * cell, cell, kind, True)
    img.save(path)
