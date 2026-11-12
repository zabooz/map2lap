"""Our tree looks as CSP tree models (TreeFX) and the lines of a track's trees.txt that place them.

A track lists its trees in extension/trees/trees.txt (ext_config.ini: [TREES] LIST_0 = trees/trees.txt), one line per tree:
"tree: birch.bin; pos=x, y, z; angle=a; size=s; width=w" in AC coordinates (x east, y up, z south), size and width scale
the model. CSP draws them with wind, shadows both ways and its own far image beyond the last LOD.

.bin, as Content Manager's AcTreeModelConverter writes it (gro-ove/actools AcTools.ExtraKn5Utils): a zip of tree.ini, one
<name>_lod<i>.mesh per LOD and the textures (PNG). .mesh: int 1, byte 0, int textures, per texture (uint checksum,
int32 length + UTF-8 name: AcTools' ExtendedBinaryWriter, not .NET's 7-bit length, which CSP reads as "Unexpected end");
per material part int diffuse, int normal, int indices, ushort indices, int vertices, 44-byte vertices (position, normal,
uv as floats, positions over x/half width, y/height, z/half width; tangent bytes, element id, uv2 halves, ao0, ao1, wet,
extra); then -1, 4, float trunk width (normalised). CSP writes its baked AO back into the .bin on first load.

The textures are symmetric top to bottom (mirror_v): whether CSP flips v is not known.
"""
import functools
import io
import math
import os
import random
import struct
import zipfile
import zlib

import numpy as np
from PIL import Image, ImageDraw

T = 256                     # px of an atlas region; atlas 2T x 2T: A leaves light, B leaves dark, C needle band, D bark
REGION = {"A": (0, 0), "B": (1, 0), "C": (0, 1), "D": (1, 1)}
PADPX = 12
LOD_M = (200, 300, 500)     # m to which each LOD shows, the user's choice 2026-11-12: no change to be seen near the road
GROW = 1.3                  # card size per halving of the cards: the crown stays about as full
# a tree's width over its height against the model's, at most this far apart: a model stretched further no longer looks like
# its kind (the billboards' sprites run from 0.22 to 1.3 of their height wide, a model from about 0.3 to 1.3)
WIDTH_RANGE = (0.6, 1.6)

# the billboard sprite (trees.SPRITES) each model stands for; the rest have no 3D form yet and stay billboards
MODEL_OF = {"deciduous": "broadleaf", "deciduous2": "broadleaf", "linden": "broadleaf", "birch": "birch",
            "conifer": "spruce", "conifer2": "spruce", "spruce": "spruce", "pine": "spruce", "larch": "larch",
            "shrub": "shrub", "shrub_flowers": "shrub_flowers"}


def model_of(sprite):
    """The model's name for a billboard sprite, None for a kind without a 3D form. Pure."""
    return MODEL_OF.get(sprite)


def uv_rect(region, inset=PADPX):
    """(u0, v0, u1, v1) of an atlas region, inside its margin. Pure."""
    cx, cy = REGION[region]
    return ((cx * T + inset) / (2 * T), (cy * T + inset) / (2 * T),
            ((cx + 1) * T - inset) / (2 * T), ((cy + 1) * T - inset) / (2 * T))


def mirror_v(img):
    """img with its top half mirrored onto the bottom: the same whichever way v runs."""
    top = img.crop((0, 0, img.width, img.height // 2))
    img.paste(top.transpose(Image.FLIP_TOP_BOTTOM), (0, img.height // 2))
    return img


def leaf_clump(rng, green, tint, n=34, size=(26, 52), light=0.25, flowers=None):
    """A round clump of leaf dabs, as the sprites paint their crowns (trees._dabs), on a transparent region; rng: its
    random.Random, green: the base green, tint: red and blue over green, flowers: their count."""
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c, r0 = T / 2, T / 2 - PADPX - 4
    for _ in range(n):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random())
        s = rng.uniform(*size)
        rr = max(0.0, r * (r0 - s))
        x, y = c + math.cos(a) * rr, c + math.sin(a) * rr * 0.5          # (top half only: mirrored)
        g = int(min(255, green * (1 - light / 2 + light * rng.random()) + rng.uniform(-10, 10)))
        d.ellipse([x - s, y - s, x + s, y + s], fill=(int(g * tint[0]), g, int(g * tint[1]), 255))
    for _ in range(flowers or 0):
        a, r = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random()) * (r0 - 20)
        x, y = c + math.cos(a) * r, c + math.sin(a) * r * 0.5
        s = rng.uniform(7, 12)
        d.ellipse([x - s, y - s, x + s, y + s], fill=rng.choice([(246, 244, 232, 255), (238, 170, 190, 255)]))
    return mirror_v(img)


def needle_band(rng, green, tint, loose=False):
    """A band of needle tiers with jagged edges top and bottom, as the conifer sprites draw theirs; loose: tufts only."""
    img = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lo, hi = PADPX + 18, T / 2
    pts = [(PADPX, hi)] + [(PADPX + (T - 2 * PADPX) * j / 10, lo + rng.uniform(-14, 14)) for j in range(11)] + [(T - PADPX, hi)]
    g = int(green * 0.85)
    if not loose:
        d.polygon(pts, fill=(int(g * tint[0]), g, int(g * tint[1]), 255))
    for _ in range(140 if loose else 90):                                  # tufts
        x, y = rng.uniform(PADPX + 8, T - PADPX - 8), rng.uniform(lo + 4, hi)
        s = rng.uniform(8, 16) if loose else rng.uniform(6, 14)
        gg = int(green * rng.uniform(0.8, 1.15))
        d.ellipse([x - s, y - s * 0.6, x + s, y + s * 0.6], fill=(int(gg * tint[0]), gg, int(gg * tint[1]), 255))
    return mirror_v(img)


def bark(rng, colour, marks=None):
    """Bark of colour (r, g, b) in upright stripes; marks: the count of dark birch marks."""
    img = Image.new("RGBA", (T, T), colour + (255,))
    d = ImageDraw.Draw(img)
    for _ in range(40):
        x = rng.uniform(0, T)
        k = rng.uniform(0.8, 1.15)
        d.rectangle([x, 0, x + rng.uniform(2, 6), T], fill=tuple(int(min(255, c * k)) for c in colour) + (255,))
    for _ in range(marks or 0):
        y = rng.uniform(0, T / 2)
        x0 = rng.uniform(0, T * 0.7)
        d.rectangle([x0, y, x0 + rng.uniform(20, 70), y + rng.uniform(3, 7)], fill=(40, 38, 36, 255))
    return mirror_v(img)


def atlas(regions):
    """The 2T x 2T texture of {region letter: image}. Pure."""
    img = Image.new("RGBA", (2 * T, 2 * T), (0, 0, 0, 0))
    for k, part in regions.items():
        cx, cy = REGION[k]
        img.paste(part, (cx * T, cy * T))
    return img


class Mesh:
    """A LOD's quads: positions in m (x, y up, z) from the foot of the trunk, normals, uv and triangles."""

    def __init__(self):
        self.p, self.n, self.uv, self.t = [], [], [], []

    def quad(self, corners, normals, rect):
        """One face (CSP draws leaves from both sides: a back face too flickered far away and showed a grid).
        corners: 4 points (u0v0, u1v0, u1v1, u0v1); normals per corner; rect: (u0, v0, u1, v1)."""
        u0, v0, u1, v1 = rect
        b = len(self.p)
        self.p += [tuple(c) for c in corners]
        self.n += [tuple(x) for x in normals]
        self.uv += [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        self.t += [(b, b + 1, b + 2), (b, b + 2, b + 3)]


def unit(v):
    """v at length one. Pure."""
    v = np.asarray(v, float)
    return v / (np.linalg.norm(v) or 1)


def trunk(m, height, r0, r1, sides, rect):
    """A trunk into m: a cone of sides from radius r0 at the foot to r1 at height, the bark in rect."""
    u0, v0, u1, v1 = rect
    for k in range(sides):
        a0, a1 = 2 * math.pi * k / sides, 2 * math.pi * (k + 1) / sides
        c = [(math.cos(a0) * r0, 0, math.sin(a0) * r0), (math.cos(a1) * r0, 0, math.sin(a1) * r0),
             (math.cos(a1) * r1, height, math.sin(a1) * r1), (math.cos(a0) * r1, height, math.sin(a0) * r1)]
        n = [(math.cos(a0), 0, math.sin(a0)), (math.cos(a1), 0, math.sin(a1))]
        du = (u1 - u0) / sides
        m.quad(c, [n[0], n[1], n[1], n[0]], (u0 + du * k, v0, u0 + du * (k + 1), v1))


def card(m, centre, size, a, b, normal_from, rect):
    """A leaf card into m at centre, turned by a (around the upright) and b (tilt), its normals pointing away from normal_from."""
    right = np.array([math.cos(a), 0, math.sin(a)])
    up = unit([-math.sin(a) * math.sin(b), math.cos(b), math.cos(a) * math.sin(b)])
    up = unit(up - right * np.dot(up, right))
    c = np.asarray(centre)
    h = size / 2
    corners = [c - right * h - up * h, c + right * h - up * h, c + right * h + up * h, c - right * h + up * h]
    m.quad(corners, [unit(x - normal_from) for x in corners], rect)


def _cards(m, cards, lod, centre):
    """LOD lod keeps every 2**lod-th card of the full crown at its place, GROW**lod larger: the same crown, coarser (each LOD
    with a crown of its own was another tree on switching)."""
    for pos, size, a, b, dark in cards[::2 ** lod]:
        card(m, pos, size * GROW ** lod, a, b, centre, uv_rect("B" if dark else "A"))


def broadleaf(seed, lod, cards, crown_y, rx, ry, card_m, trunk_top, trunk_r, round_shell=0.5):
    """A broadleaf tree's LOD lod: cards in a shell (round_shell to 1 of the crown's radii rx, ry, rx around crown_y m), those
    below and inside dark; a trunk of radius trunk_r up to trunk_top m. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    trunk(m, trunk_top, trunk_r, trunk_r * 0.6, (6, 5, 4)[lod], uv_rect("D", 0))
    centre = np.array([0, crown_y, 0])
    full = []
    for _ in range(cards):
        while True:
            q = np.array([rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)])
            r = np.linalg.norm(q)
            if round_shell <= r <= 1:
                break
        pos = centre + q * [rx - card_m * 0.35, ry - card_m * 0.35, rx - card_m * 0.35]
        full.append((pos, card_m * rng.uniform(0.85, 1.15), rng.uniform(0, 2 * math.pi), rng.uniform(-0.6, 0.6),
                     q[1] < -0.2 or r < 0.7))
    rng.shuffle(full)                                   # (every 2**lod-th then spreads over the whole crown)
    _cards(m, full, lod, centre)
    return m


def conifer(seed, lod, tiers, H, W, trunk_r, rect):
    """A conifer's LOD lod, H m high and W wide: tiers of needle cones (rect of the atlas), the same at every LOD with fewer
    sides (7, 5, 4); LOD 2 keeps every other tier, each reaching up to the next kept. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    segs = (7, 5, 4)[lod]
    trunk(m, H * 0.9, trunk_r, trunk_r * 0.3, (5, 4, 3)[lod], uv_rect("D", 0))
    full = []
    for k in range(tiers):
        t = k / max(1, tiers - 1)
        y_bot = H * (0.1 + 0.68 * t)
        full.append((y_bot, min(H, y_bot + H * (0.32 - 0.1 * t)), W / 2 * (1 - 0.82 * t) * rng.uniform(0.92, 1.05),
                     rng.uniform(0, 2 * math.pi), rng.uniform(-0.03, 0.03) * H))
    step = 2 if lod == 2 else 1
    kept = full[::step]
    if step == 2 and full[-1] is not kept[-1]:
        kept.append(full[-1])
    for y_bot, y_top, R, turn, droop in kept:
        if step == 2:
            y_top = min(H, y_top + H * 0.68 / max(1, tiers - 1))
        _tier(m, segs, y_bot, y_top, droop, R, turn, rect)
    return m


def _tier(m, segs, y_bot, y_top, droop, R, turn, rect):
    """A needle cone into m: segs faces from radius R at y_bot + droop to R * 0.12 at y_top, turned by turn; its normals
    lean as from y_bot."""
    r_top = R * 0.12
    slope = math.atan2(R - r_top, y_top - y_bot)
    for s in range(segs):
        a0, a1 = turn + 2 * math.pi * s / segs, turn + 2 * math.pi * (s + 1) / segs
        c = [(math.cos(a0) * R, y_bot + droop, math.sin(a0) * R), (math.cos(a1) * R, y_bot + droop, math.sin(a1) * R),
             (math.cos(a1) * r_top, y_top, math.sin(a1) * r_top), (math.cos(a0) * r_top, y_top, math.sin(a0) * r_top)]
        n = [unit((math.cos(a) * math.cos(math.pi / 2 - slope), math.sin(math.pi / 2 - slope) * 0.8 + 0.2,
                   math.sin(a) * math.cos(math.pi / 2 - slope))) for a in (a0, a1, a1, a0)]
        m.quad(c, n, rect)


def bush(seed, lod, cards, H, rx, card_m):
    """A bush's LOD lod, H m high, rx wide to each side: cards in its upper half shell, the low ones dark. Pure."""
    rng = random.Random(seed)
    m = Mesh()
    centre = np.array([0, H * 0.15, 0])
    full = []
    for _ in range(cards):
        while True:
            q = np.array([rng.uniform(-1, 1), rng.uniform(0, 1), rng.uniform(-1, 1)])
            if 0.35 <= np.linalg.norm(q) <= 1:
                break
        pos = np.array([q[0] * (rx - card_m * 0.3), max(card_m * 0.4, q[1] * (H - card_m * 0.4)), q[2] * (rx - card_m * 0.3)])
        full.append((pos, card_m * rng.uniform(0.85, 1.15), rng.uniform(0, 2 * math.pi), rng.uniform(-0.6, 0.6), q[1] < 0.35))
    rng.shuffle(full)
    _cards(m, full, lod, centre)
    return m


def _broadleaf(rng, seed):
    tex = atlas({"A": leaf_clump(rng, 112, (0.45, 0.3)), "B": leaf_clump(rng, 74, (0.45, 0.3)), "D": bark(rng, (70, 52, 38))})
    return tex, [broadleaf(seed, lod, 44, 6.4, 3.4, 3.3, 2.6, 6.0, 0.22) for lod in range(3)]


def _birch(rng, seed):
    tex = atlas({"A": leaf_clump(rng, 140, (0.62, 0.36), n=30, size=(20, 40)),
                 "B": leaf_clump(rng, 100, (0.62, 0.36), n=30, size=(20, 40)), "D": bark(rng, (226, 222, 212), marks=18)})
    return tex, [broadleaf(seed, lod, 40, 8.2, 2.3, 3.6, 2.0, 7.5, 0.14, round_shell=0.4) for lod in range(3)]


def _spruce(rng, seed):
    tex = atlas({"C": needle_band(rng, 72, (0.32, 0.4)), "D": bark(rng, (56, 40, 30))})
    return tex, [conifer(seed, lod, 9, 14.0, 4.6, 0.2, uv_rect("C")) for lod in range(3)]


def _larch(rng, seed):
    tex = atlas({"C": needle_band(rng, 128, (0.56, 0.32), loose=True), "D": bark(rng, (92, 66, 46))})
    return tex, [conifer(seed, lod, 8, 14.0, 5.6, 0.2, uv_rect("C")) for lod in range(3)]


def _shrub(rng, seed, flowers=None):
    tex = atlas({"A": leaf_clump(rng, 104, (0.5, 0.3), flowers=flowers),
                 "B": leaf_clump(rng, 78, (0.5, 0.3), flowers=flowers and flowers // 3)})
    return tex, [bush(seed, lod, 14, 1.6, 1.05, 1.1) for lod in range(3)]


# name: (seed, painter and builder): the colours and shapes of the sprites in trees.py; the seeds of the trial of 2026-11-12
MODELS = {"broadleaf": (100, _broadleaf), "birch": (101, _birch), "spruce": (102, _spruce), "larch": (103, _larch),
          "shrub": (104, _shrub), "shrub_flowers": (105, lambda rng, seed: _shrub(rng, seed, flowers=9))}


@functools.lru_cache(maxsize=None)
def model(name):
    """(texture image, [Mesh per LOD, finest first]) of a model of MODELS; the same each time."""
    seed, make = MODELS[name]
    return make(random.Random(seed), seed)


@functools.lru_cache(maxsize=None)
def size(name):
    """(height, width) in m of a model of MODELS, as its tree.ini says."""
    allp = np.concatenate([np.asarray(m.p) for m in model(name)[1]])
    H = round(float(allp[:, 1].max()), 4)
    return H, round(2 * float(max(np.abs(allp[:, 0]).max(), np.abs(allp[:, 2]).max())), 4)


def dotnet_string(s):
    """AcTools' ExtendedBinaryWriter string: int32 byte length, then UTF-8. Pure."""
    b = s.encode("utf-8")
    return struct.pack("<i", len(b)) + b


def checksum(data):
    """A texture's checksum in a .mesh: CRC-32, never 0. Pure."""
    return (zlib.crc32(data) & 0xFFFFFFFF) or 1


def _tangents(P, UV, tris):
    """Per vertex the direction of u along its faces (good enough for a flat normal map). Pure."""
    tang = np.zeros_like(P)
    for a, b, c in tris:
        du = UV[b, 0] - UV[a, 0]
        if abs(du) > 1e-9:
            tang[[a, b, c]] += (P[b] - P[a]) / du
    return tang / np.maximum(np.linalg.norm(tang, axis=1, keepdims=True), 1e-9)


def mesh_bytes(m, textures, half_width, H):
    """A LOD's .mesh of Mesh m, with one material part (diffuse textures[0], normal textures[1]); textures: [(name, bytes)],
    half_width and H: the model's, which positions are given over; (bytes, count of triangles). Pure."""
    P, N, UV = (np.asarray(a, float) for a in (m.p, m.n, m.uv))
    tris = np.asarray(m.t, int)
    if len(P) >= 65536:
        raise ValueError(f"{len(P)} vertices: a tree mesh holds 65,535 at most")
    norm = P / [half_width, H, half_width]
    out = bytearray(struct.pack("<iB", 1, 0) + struct.pack("<i", len(textures)))
    for name, data in textures:
        out += struct.pack("<I", checksum(data)) + dotnet_string(name)
    idx = tris.reshape(-1)
    out += struct.pack("<ii", 0, 1) + struct.pack("<i", len(idx)) + idx.astype("<u2").tobytes()
    out += struct.pack("<i", len(P))
    for p, n, uv, t in zip(norm, N, UV, _tangents(P, UV, tris)):
        tb = [int(min(255, max(0, x * 127.5 + 127.5))) for x in t]
        out += (struct.pack("<3f3f2f", *p, *n, *uv) + bytes(tb + [0]) + np.float16(0).tobytes() * 2
                + bytes([255, 255, 255, 0]))
    trunk_w = trunk_width(norm)
    if trunk_w is not None:
        out += struct.pack("<iif", -1, 4, trunk_w)
    return bytes(out), len(tris)


def trunk_width(norm):
    """The trunk's half width at the foot over the model's half width, from the normalised positions; None without a trunk
    (a bush). Pure."""
    sel = norm[(norm[:, 1] < 0.002) & (np.abs(norm[:, 0]) < 0.2) & (np.abs(norm[:, 2]) < 0.2)]
    if not len(sel):
        return None
    return float(min(sel[:, 0].max(), sel[:, 2].max(), -sel[:, 0].min(), -sel[:, 2].min()))


def png(img):
    """img as PNG bytes. Pure."""
    b = io.BytesIO()
    img.save(b, "PNG")
    return b.getvalue()


def tree_ini(name, H, W, meshes):
    """tree.ini of a model H m high and W wide whose LOD meshes are named meshes, finest first. Pure."""
    ini = [f"[BASIC]\nHEIGHT={H:.4f}\nWIDTH={W:.4f}\nCACHE_RESOLUTION=256,512\nVERTICAL_OFFSET=0\n",
           "[SHADING]\nSPECULAR=1.0\nSUBSCATTERING=1.0\nREFLECTIVITY=1.0\nBRIGHTNESS=1.0\nUSE_AO_CHANNEL=0\n",
           "[NORMALS]\nBOOST=0.9\nSPHERE=1.0\n", "[LEAVES]\nMULT=20.0\nOFFSET=0.0\n", "[FAKE_SHADOW]\nSIZE=1.0\nOPACITY=1.0\n"]
    for i, fname in enumerate(meshes):                  # (beyond the last CSP's far image)
        ini.append(f"[LOD_{i}]\nMODEL={fname}\nDISTANCE={LOD_M[i]}\n")
    return "\n".join(ini)


def write_bin(path, name):
    """Write model name of MODELS as a .bin to path, the same bytes each time."""
    tex, lods = model(name)
    H, W = size(name)
    textures = [(f"{name}_d.png", png(tex)), (f"{name}_n.png", png(Image.new("RGBA", (64, 64), (128, 128, 255, 255))))]
    meshes = [(f"{name}_lod{i}.mesh", mesh_bytes(m, textures, W / 2, H)[0]) for i, m in enumerate(lods)]
    files = meshes + [("tree.ini", tree_ini(name, H, W, [f for f, _ in meshes]).encode())] + textures
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for fname, data in files:
            z.writestr(zipfile.ZipInfo(fname, (1980, 1, 1, 0, 0, 0)), data, zipfile.ZIP_DEFLATED)


def write_models(folder, names):
    """Write each of the models names once into folder as <name>.bin; their file names, sorted."""
    files = sorted({f"{n}.bin" for n in names})
    for f in files:
        write_bin(os.path.join(folder, f), f[:-4])
    return files


def placement(name, pos, angle, height, ratio):
    """A TreeFX tree as the object list holds it and trees.txt says it: {model, pos, angle, size, width} for model name at pos
    (x, y, z in AC coordinates, the foot), turned by angle degrees, scaled to height m high and ratio of its height wide (its
    width at most WIDTH_RANGE from the model's); rounded as text writes it, so a list and its trees.txt say the same. Pure."""
    H, W = size(name)
    width = min(max(ratio / (W / H), WIDTH_RANGE[0]), WIDTH_RANGE[1])
    return {"model": name, "pos": [round(float(v), 2) for v in pos], "angle": float(round(angle) % 360),
            "size": round(height / H, 3), "width": round(width, 3)}


def text(tree):
    """trees.txt's line of a placement. Pure."""
    x, y, z = tree["pos"]
    return (f"tree: {tree['model']}.bin; pos={x:.2f}, {y:.2f}, {z:.2f}; angle={tree['angle']:.0f}; size={tree['size']:.3f}; "
            f"width={tree['width']:.3f}")


def parse(line):
    """A trees.txt line as a placement; None for a comment or an empty line. Pure."""
    if not line.strip().startswith("tree:"):
        return None
    fields = dict(part.split("=", 1) for part in (p.strip() for p in line.split(";")[1:]) if "=" in part)
    model_file = line.split(";", 1)[0].split(":", 1)[1].strip()
    return {"model": model_file[:-4] if model_file.endswith(".bin") else model_file,
            "pos": [float(v) for v in fields["pos"].split(",")],
            "angle": float(fields.get("angle", 0)), "size": float(fields.get("size", 1)), "width": float(fields.get("width", 1))}
