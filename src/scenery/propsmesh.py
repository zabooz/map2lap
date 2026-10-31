"""Street furniture in comic style from the props rows of the road tiles (BeamNG.Earth furniture.place):
row = [group, x, y, z, rotation (degrees), scale, height (m), random value] in the anchor frame (ENU).

Rotation: (cos, sin) of the rotation runs along the wall or sign face (measured on 240 doors against the house walls:
median 0.00 to the wall normal); the facing direction is perpendicular to it.
Models from boxes and quads, one shared atlas (props.png, 5 x 5 cells). Utility poles, street lights, sign posts,
traffic light and level crossing posts collide (1WALL), the rest doesn't. Traffic lights (group signal: at the kerb of
each way into a signalled junction) and the level crossings' kits (railways.crossing_props: rrcross / rrflash / rrgate,
"_eu" outside the Americas, "_l" gates where traffic drives on the left; at the kerb, facing the traffic coming in) have
their heads on both faces, so the side of the road doesn't matter. Gates stand open (arm up): a lowered one would close
the road. Street trees go to trees.py, light cones/lenses and fences (length unknown) are left
out. (The module isn't called "furniture": the BeamNG.Earth server already has one.)
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ATLAS = 5
CELL = 128
# atlas cells
(METAL, WOOD, RED, GREEN, DOOR, STOP, GIVEWAY, S50, S60, S80, S100, LAMP, BENCH, WHITE, YELLOW, SIGNBACK,
 SIGNAL_HEAD, XBUCK_EU, XBUCK_US, RR_FLASH, STRIPES, FUEL_SIGN, PUMP_FACE, CANOPY) = range(24)
SPEED = {"speedk50": S50, "speedk60": S60, "speedk80": S80, "speedk100": S100}
SKIP = {"lamplens", "lampglow", "fence"}
TREES = {"deciduous", "conifer"}


# --- atlas --------------------------------------------------------------------------------------------------

def _cell_box(k):
    return (k % ATLAS) * CELL, (k // ATLAS) * CELL


def _font(size):
    try:
        return ImageFont.truetype("arialbd.ttf", size)
    except OSError:
        return ImageFont.load_default()


def make_atlas(path):
    img = Image.new("RGB", (ATLAS * CELL, ATLAS * CELL), (200, 200, 200))
    d = ImageDraw.Draw(img)
    flat = {METAL: (150, 156, 162), WOOD: (122, 86, 54), RED: (210, 46, 40), GREEN: (60, 120, 70),
            LAMP: (70, 74, 80), WHITE: (245, 245, 240), YELLOW: (255, 226, 120), SIGNBACK: (170, 174, 178)}
    for k, col in flat.items():
        x, y = _cell_box(k)
        d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=col)
        d.rectangle([x, y, x + CELL - 1, y + CELL - 1], outline=tuple(int(c * 0.8) for c in col), width=4)
    x, y = _cell_box(WOOD)                                  # wood grain
    for yy in range(y + 10, y + CELL, 18):
        d.line([(x + 4, yy), (x + CELL - 4, yy + 4)], fill=(96, 66, 40), width=3)
    x, y = _cell_box(DOOR)                                  # door: panels and handle
    d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=(120, 72, 40))
    for yy in (y + 12, y + 70):
        d.rectangle([x + 18, yy, x + CELL - 18, yy + 46], outline=(86, 50, 28), width=5)
    d.ellipse([x + CELL - 34, y + 62, x + CELL - 22, y + 74], fill=(230, 200, 90))
    x, y = _cell_box(BENCH)
    d.rectangle([x, y, x + CELL - 1, y + CELL - 1], fill=(160, 110, 64))
    for yy in range(y, y + CELL, 32):
        d.line([(x, yy), (x + CELL, yy)], fill=(110, 74, 40), width=4)
    cx = lambda k: (_cell_box(k)[0] + CELL / 2, _cell_box(k)[1] + CELL / 2)    # noqa: E731
    sx, sy = cx(STOP)                                       # stop: red octagon, white border, STOP
    d.rectangle([sx - 64, sy - 64, sx + 63, sy + 63], fill=(170, 174, 178))
    oct_ = [(sx + 60 * math.cos(math.pi / 8 + k * math.pi / 4), sy + 60 * math.sin(math.pi / 8 + k * math.pi / 4))
            for k in range(8)]
    d.polygon(oct_, fill=(245, 245, 240))
    d.polygon([(sx + 0.86 * (px - sx), sy + 0.86 * (py - sy)) for px, py in oct_], fill=(200, 30, 30))
    d.text((sx, sy), "STOP", fill=(250, 250, 250), font=_font(30), anchor="mm")
    gx, gy = cx(GIVEWAY)                                    # give way: triangle pointing down
    d.rectangle([gx - 64, gy - 64, gx + 63, gy + 63], fill=(170, 174, 178))
    d.polygon([(gx - 60, gy - 50), (gx + 60, gy - 50), (gx, gy + 56)], fill=(200, 30, 30))
    d.polygon([(gx - 40, gy - 38), (gx + 40, gy - 38), (gx, gy + 32)], fill=(245, 245, 240))
    for k, n in ((S50, "50"), (S60, "60"), (S80, "80"), (S100, "100")):
        x0, y0 = cx(k)                                      # speed limit: white circle, red ring, number
        d.rectangle([x0 - 64, y0 - 64, x0 + 63, y0 + 63], fill=(170, 174, 178))
        d.ellipse([x0 - 60, y0 - 60, x0 + 60, y0 + 60], fill=(200, 30, 30))
        d.ellipse([x0 - 46, y0 - 46, x0 + 46, y0 + 46], fill=(245, 245, 240))
        d.text((x0, y0), n, fill=(20, 20, 20), font=_font(54 if len(n) < 3 else 42), anchor="mm")
    x0, y0 = _cell_box(SIGNAL_HEAD)                         # traffic light: black housing, red / amber / green
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(28, 30, 32))
    for k, (on, off) in enumerate((((236, 40, 34), (90, 24, 22)), ((250, 176, 30), (96, 70, 20)),
                                   ((40, 200, 90), (20, 76, 40)))):
        yy = y0 + 22 + k * 42
        d.ellipse([x0 + 46, yy - 17, x0 + 82, yy + 17], fill=on if k == 0 else off)
    x0, y0 = _cell_box(XBUCK_EU)                            # St Andrew's cross arm: red and white stripes
    for k in range(4):
        d.rectangle([x0 + k * 32, y0, x0 + k * 32 + 31, y0 + CELL - 1], fill=(206, 30, 32) if k % 2 else
                    (246, 246, 242))
    x0, y0 = _cell_box(XBUCK_US)                            # crossbuck arm: white, black lettering
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(246, 246, 242))
    word = Image.new("RGB", (560, 100), (246, 246, 242))
    ImageDraw.Draw(word).text((280, 50), "RAILROAD", fill=(16, 16, 16), font=_font(78), anchor="mm")
    img.paste(word.resize((CELL - 8, CELL - 8)), (x0 + 4, y0 + 4))
    x0, y0 = _cell_box(RR_FLASH)                            # level crossing flashers: two red lamps on black
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(22, 22, 24))
    for cx_, on in ((x0 + 30, True), (x0 + 98, False)):
        d.ellipse([cx_ - 22, y0 + 42, cx_ + 22, y0 + 86], fill=(236, 36, 30) if on else (96, 26, 24))
    x0, y0 = _cell_box(STRIPES)                             # gate arm: red and white bands
    for k in range(4):
        d.rectangle([x0, y0 + k * 32, x0 + CELL - 1, y0 + k * 32 + 31], fill=(206, 30, 32) if k % 2 else
                    (246, 246, 242))
    x0, y0 = _cell_box(FUEL_SIGN)                           # gas station sign: a pump pictogram on red, price rows
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(200, 34, 32))
    d.rectangle([x0 + 34, y0 + 10, x0 + 74, y0 + 62], fill=(246, 246, 242))
    d.rectangle([x0 + 42, y0 + 18, x0 + 66, y0 + 32], fill=(200, 34, 32))
    d.line([(x0 + 74, y0 + 24), (x0 + 88, y0 + 30), (x0 + 88, y0 + 52)], fill=(246, 246, 242), width=5)
    for k in range(3):
        yy = y0 + 74 + k * 18
        d.rectangle([x0 + 14, yy, x0 + CELL - 15, yy + 13], fill=(24, 24, 26))
        for j in range(4):
            d.rectangle([x0 + 66 + j * 12, yy + 3, x0 + 74 + j * 12, yy + 10], fill=(255, 196, 60))
    x0, y0 = _cell_box(PUMP_FACE)                           # pump front: white, red top, dark screen, nozzle
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(240, 240, 236))
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + 24], fill=(200, 34, 32))
    d.rectangle([x0 + 30, y0 + 36, x0 + 98, y0 + 66], fill=(30, 36, 40))
    d.rectangle([x0 + 14, y0 + 80, x0 + 34, y0 + 112], fill=(40, 40, 42))
    d.rectangle([x0 + 94, y0 + 80, x0 + 114, y0 + 112], fill=(40, 40, 42))
    x0, y0 = _cell_box(CANOPY)                              # canopy fascia: white with a red band
    d.rectangle([x0, y0, x0 + CELL - 1, y0 + CELL - 1], fill=(244, 244, 240))
    d.rectangle([x0, y0 + 46, x0 + CELL - 1, y0 + 82], fill=(200, 34, 32))
    img.save(path)
    return path


# --- geometry -----------------------------------------------------------------------------------------------

class Builder:
    def __init__(self):
        self.P, self.UV, self.T = [], [], []

    def _uv(self, k, u, v):
        x, y = _cell_box(k)
        inset = 6
        uu = (x + inset + u * (CELL - 2 * inset)) / (ATLAS * CELL)
        vv = 1.0 - (y + inset + (1 - v) * (CELL - 2 * inset)) / (ATLAS * CELL)     # (OBJ: v up)
        return uu, vv

    def quad(self, a, b, c, d, k, back=None):
        """Quad a-b-c-d (counter-clockwise from the front), atlas cell k; back: back side (cell) or None."""
        for pts, cell in ((((a, (0, 0)), (b, (1, 0)), (c, (1, 1)), (d, (0, 1))), k),):
            base = len(self.P)
            for p, (u, v) in pts:
                self.P.append(p)
                self.UV.append(self._uv(cell, u, v))
            self.T += [(base, base + 1, base + 2), (base, base + 2, base + 3)]
        if back is not None:
            self.quad(b, a, d, c, back)

    def box(self, cx, cy, z0, sx, sy, sz, yaw, k, top=None):
        """Box: centre (cx, cy), bottom z0, size sx (across) x sy (along) x sz, rotated by yaw (rad)."""
        c, s = math.cos(yaw), math.sin(yaw)

        def pt(dx, dy, dz):
            return (cx + dx * c - dy * s, cy + dx * s + dy * c, z0 + dz)
        hx, hy = sx / 2, sy / 2
        b = [pt(-hx, -hy, 0), pt(hx, -hy, 0), pt(hx, hy, 0), pt(-hx, hy, 0)]
        t = [pt(-hx, -hy, sz), pt(hx, -hy, sz), pt(hx, hy, sz), pt(-hx, hy, sz)]
        for i in range(4):
            j = (i + 1) % 4
            self.quad(b[i], b[j], t[j], t[i], k)
        self.quad(t[0], t[1], t[2], t[3], top if top is not None else k)

    def beam(self, p0, p1, r, k):
        """Square bar with half thickness r from p0 to p1 (at any angle), sides facing out, no ends."""
        p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
        d = (p1 - p0) / np.linalg.norm(p1 - p0)
        u = np.cross(d, (0.0, 0.0, 1.0) if abs(d[2]) < 0.9 else (1.0, 0.0, 0.0))
        u /= np.linalg.norm(u)
        v = np.cross(d, u)                  # (u, v, d right-handed: the corners run counter-clockwise around d)
        c = [r * (math.cos(a) * u + math.sin(a) * v) for a in (0.25 * math.pi, 0.75 * math.pi, 1.25 * math.pi,
                                                               1.75 * math.pi)]
        for i in range(4):
            j = (i + 1) % 4
            self.quad(tuple(p0 + c[i]), tuple(p0 + c[j]), tuple(p1 + c[j]), tuple(p1 + c[i]), k)

    def mesh(self):
        if not self.T:
            return None
        return np.asarray(self.P, float), np.asarray(self.UV, float), np.asarray(self.T, np.int64)


# High-voltage pylon (BeamNG.Earth powerlines.py, group "pylon", height 35.8 m with 5.9 m legs below the origin):
# lattice tower from bars. yaw is the line direction, the cross arms stand across it: the wires hang 4.14 m
# to the side at 15.6 / 20.4 / 25.2 m (powerlines.ARMS) on insulators of PYLON_INSULATOR m
PYLON_BASE, PYLON_NECK, PYLON_BODY, PYLON_TOP = 3.2, 0.9, 27.5, 30.5     # m: half width at the bottom / top, heights
PYLON_ARMS = (15.6, 20.4, 25.2)
PYLON_REACH, PYLON_INSULATOR = 4.14, 0.6
PYLON_RINGS = (1.0, 6.0, 11.0, 16.2, 21.0, 25.8, 27.5)


def _pylon(solid, deco, x, y, z, yaw):
    al, la = np.array([math.cos(yaw), math.sin(yaw), 0.0]), np.array([math.sin(yaw), -math.cos(yaw), 0.0])
    o = np.array([x, y, z])

    def half(h):                            # half width of the tower at height h
        return PYLON_BASE + (PYLON_NECK - PYLON_BASE) * min(max(h, 0.0), PYLON_BODY) / PYLON_BODY

    def corner(h, sa, sl):
        return o + half(h) * (sa * al + sl * la) + (0.0, 0.0, h)
    corners = ((1, 1), (-1, 1), (-1, -1), (1, -1))
    for sa, sl in corners:                  # legs (with collision), from 1 m below the ground (slopes)
        solid.beam(corner(-1.0, sa, sl), corner(PYLON_BODY, sa, sl), 0.14, METAL)
    for k, h in enumerate(PYLON_RINGS):     # rings and cross braces per side
        for i in range(4):
            a, b = corners[i], corners[(i + 1) % 4]
            deco.beam(corner(h, *a), corner(h, *b), 0.06, METAL)
            if k:
                h0 = PYLON_RINGS[k - 1]
                deco.beam(corner(h0, *a), corner(h, *b), 0.045, METAL)
                deco.beam(corner(h0, *b), corner(h, *a), 0.045, METAL)
    for h in PYLON_ARMS:                    # cross arms, bracing to the tower, insulators
        top = h + PYLON_INSULATOR
        for s in (-1, 1):
            tip = o + s * (PYLON_REACH + 0.4) * la + (0.0, 0.0, top)
            deco.beam(o + s * half(top) * la + (0.0, 0.0, top), tip, 0.1, METAL)
            deco.beam(tip, o + s * half(top + 2.2) * la + (0.0, 0.0, top + 2.2), 0.05, METAL)
            hang = o + s * PYLON_REACH * la
            deco.beam(hang + (0.0, 0.0, top), hang + (0.0, 0.0, h), 0.09, WHITE)
    for sa, sl in corners:                  # top (earth wire)
        deco.beam(corner(PYLON_BODY, sa, sl), o + (0.0, 0.0, PYLON_TOP), 0.06, METAL)


def pylons(groups, rows):
    """(collision mesh: the legs, visible mesh without collision) of the high-voltage pylons and the substations' parts
    among the props rows; separate from the other furniture because they are visible further away (obj_to_kn5.VIEW)."""
    solid, deco = Builder(), Builder()
    for row in rows:
        g = groups[row[0]]
        if g == "pylon":
            _pylon(solid, deco, *row[1:4], math.radians(row[4]))
        elif g in SUBSTATION:
            _substation(solid, deco, g, *row[1:4], math.radians(row[4]), row[6])
    return solid.mesh(), deco.mesh()


# Substations (BeamNG.Earth powerlines.py: West Coast USA's yard kit, its parts as rows [group, x, y, z, yaw, 1, model
# height]; their x along (cos yaw, sin yaw), checked on the gantry pairs 11.6 m apart; the lines come in from +y and end
# on the gantries' strain insulators 2.78 m in front of them, 1.75 m apart, 7.5 m up). The chain link fence round the
# yard: fences.substation_fence.
SUBSTATION = {"gantry", "sub_support", "sub_breaker", "sub_transformer", "sub_mast"}


def _substation(solid, deco, g, x, y, z, yaw, h):
    c, s = math.cos(yaw), math.sin(yaw)

    def p(dx, dy, dz=0.0):
        return x + dx * c - dy * s, y + dx * s + dy * c, z + dz
    if g == "gantry":                       # two posts, beams at 9 and 7.5 m, three strain insulators, spikes
        for dx in (-4.0, 4.0):
            px, py, _ = p(dx, 0.0)
            solid.box(px, py, z - 0.3, 0.5, 0.5, 9.9, yaw, METAL)
            deco.beam(p(dx, 0.0, 9.6), p(dx, 0.0, h), 0.05, METAL)
        for zz, r in ((9.3, 0.25), (7.6, 0.15)):
            deco.beam(p(-4.0, 0.0, zz), p(4.0, 0.0, zz), r, METAL)
        for dx in (-1.75, 0.0, 1.75):
            deco.beam(p(dx, 0.0, 7.5), p(dx, 2.78, 7.5), 0.09, LAMP)
    elif g == "sub_support":                # a column with an insulator on top
        solid.box(x, y, z - 0.3, 0.35, 0.35, h - 0.6, yaw, METAL)
        deco.box(x, y, z + h - 0.9, 0.22, 0.22, 0.9, yaw, WHITE)
    elif g == "sub_breaker":                # a cabinet, three poles with insulators
        solid.box(x, y, z, 3.0, 0.9, 1.3, yaw, METAL)
        for dx in (-1.0, 0.0, 1.0):
            px, py, _ = p(dx, 0.0)
            deco.box(px, py, z + 1.3, 0.25, 0.25, h - 2.3, yaw, METAL)
            deco.box(px, py, z + h - 1.0, 0.3, 0.3, 1.0, yaw, WHITE)
    elif g == "sub_transformer":            # tank, cooling fins both sides, conservator, three bushings
        solid.box(x, y, z, 3.2, 2.4, 3.2, yaw, METAL)
        for side in (-1.0, 1.0):
            for k in range(5):
                px, py, _ = p(-1.2 + k * 0.6, side * 1.45)
                deco.box(px, py, z + 0.3, 0.08, 0.5, 2.6, yaw, METAL)
        px, py, _ = p(0.0, -0.9)
        deco.box(px, py, z + 3.6, 2.4, 0.7, 0.7, yaw, METAL)
        for dx in (-0.9, 0.0, 0.9):
            px, py, _ = p(dx, 0.4)
            deco.box(px, py, z + 3.2, 0.25, 0.25, h - 3.2, yaw, WHITE)
    elif g == "sub_mast":                   # lightning mast, narrowing upwards
        solid.box(x, y, z - 0.3, 0.6, 0.6, 8.3, yaw, METAL)
        deco.box(x, y, z + 8.0, 0.4, 0.4, 8.0, yaw, METAL)
        deco.beam(p(0.0, 0.0, 16.0), p(0.0, 0.0, h), 0.08, METAL)


# --- gas stations (BeamNG.Earth gasstations.py, data "fuel") ------------------------------------------------------
# A station's props are the BeamNG models it would place (their shapes' names), each drawn here as a comic one in the
# same frame: x along (cos yaw, sin yaw), scaled by its "scale". Italy's awning half (the European style): 12 m along x,
# 6.53 m to its -y, a row of two pumps under it at x +-2.25, y -3.2; West Coast's roof slab (half 7 x 8.61 m, 4.8 m up)
# on 4.9 m pillars; East Coast's unit: three islands (x -5.215, 1.24, 7.74; y -9.2 .. -4.53) under a 4.7 m roof
# (x -7.53 .. 10.1, y -10.04 .. -3.44). Only the pumps' bases (collide) are drawn, not their brand overlays.
ROOF_T = 0.7                            # m: a canopy's thickness


def _slab(solid, deco, p, x0, x1, y0, y1, z0, yaw, t=ROOF_T):
    """A canopy roof over [x0, x1] x [y0, y1] (local) from z0 up: fascia all round, light underside, top."""
    corners = [p(x0, y0, z0), p(x1, y0, z0), p(x1, y1, z0), p(x0, y1, z0)]
    tops = [(a, b, zz + t) for a, b, zz in corners]
    for i in range(4):
        j = (i + 1) % 4
        solid.quad(corners[i], corners[j], tops[j], tops[i], CANOPY)
    solid.quad(*tops, WHITE)
    solid.quad(corners[0], corners[3], corners[2], corners[1], SIGNBACK)


def _pump(solid, deco, x, y, z, yaw):
    """A dispenser on its island: x along the island, its faces to +-y."""
    solid.box(x, y, z, 2.6, 1.2, 0.15, yaw, SIGNBACK)
    solid.box(x, y, z + 0.15, 0.9, 0.5, 1.75, yaw, WHITE, top=RED)
    _plate(deco, x, y, z + 0.15, yaw, 0.88, 1.74, PUMP_FACE, 0.26)
    _plate(deco, x, y, z + 0.15, yaw, 0.88, 1.74, PUMP_FACE, -0.26)


def fuel(records):
    """(collision mesh, visible mesh without collision) of the gas stations' records (roads.write_tile "fuel")."""
    solid, deco = Builder(), Builder()
    for rec in records:
        for pr in rec.get("props", ()):
            shape = pr["shape"].lower()
            x, y, z = pr["pos"]
            yaw = math.radians(pr["yaw"])
            sx, sy = pr.get("scale", (1.0, 1.0, 1.0))[:2]
            c, s = math.cos(yaw), math.sin(yaw)

            def p(dx, dy, dz=0.0, x=x, y=y, z=z, c=c, s=s):
                return x + dx * c - dy * s, y + dx * s + dy * c, z + dz
            if "awningst" in shape:                         # Italy's awning half: roof, its island and pillar
                _slab(solid, deco, p, -6.0 * sx, 6.0 * sx, -6.53 * sy, 0.0, 4.6, yaw)
                px, py, _ = p(0.0, -3.2 * sy)
                solid.box(px, py, z, 0.4, 0.4, 4.6, yaw, WHITE)
            elif "pump" in shape and "eca_" not in shape:
                if pr.get("collide", True):
                    _pump(solid, deco, x, y, z, yaw)
            elif "brandsign" in shape:                      # the price sign by the road
                solid.box(x, y, z - 0.3, 0.3, 0.3, 3.4, yaw, METAL)
                solid.box(x, y, z + 3.0, 1.7, 0.3, 2.6, yaw, RED)
                _plate(deco, x, y, z + 3.05, yaw, 1.66, 2.5, FUEL_SIGN, 0.16)
                _plate(deco, x, y, z + 3.05, yaw, 1.66, 2.5, FUEL_SIGN, -0.16)
            elif "fuel_structure_06" in shape:              # West Coast's roof slab (its origin 4.8 m up)
                _slab(solid, deco, p, -7.0 * sx, 7.0 * sx, -8.61 * sy, 8.61 * sy, 0.0, yaw)
            elif "fuel_structure_07" in shape:              # its pillar
                solid.box(x, y, z, 0.45, 0.45, 4.85, yaw, WHITE)
            elif "bollard" in shape:
                solid.box(x, y, z, 0.22 * sx, 0.22 * sy, 1.0, yaw, YELLOW, top=LAMP)
            elif "eca_gastation" in shape:                  # East Coast's unit: three islands under one roof
                for ix in (-5.215, 1.24, 7.74):
                    px, py, _ = p(ix * sx, -7.46 * sy)
                    _pump(solid, deco, px, py, z, yaw + math.pi / 2)
                    for iy in (-9.0, -4.7):
                        qx, qy, _ = p(ix * sx, iy * sy)
                        solid.box(qx, qy, z, 0.35, 0.35, 4.7, yaw, WHITE)
                _slab(solid, deco, p, -7.53 * sx, 10.1 * sx, -10.04 * sy, -3.44 * sy, 4.7, yaw)
    return solid.mesh(), deco.mesh()


def _toward(x, y, road_xy):
    """Direction (rad) to the nearest road vertex, or None."""
    if road_xy is None or not len(road_xy):
        return None
    d = road_xy - (x, y)
    i = int(np.argmin(np.einsum("ij,ij->i", d, d)))
    return math.atan2(d[i, 1], d[i, 0])


def build(groups, rows, road_xy=None):
    """(collision mesh, visible mesh without collision, street tree rows [x, y, z, yaw, h, rank])."""
    solid, deco, street_trees = Builder(), Builder(), []
    for row in rows:
        g = groups[row[0]]
        x, y, z, yaw_deg, scale, h, rank = row[1:8]
        yaw = math.radians(yaw_deg)
        if g in SKIP or g.startswith("wallsign") or g in SUBSTATION or g == "sub_fence":
            continue
        if g in TREES:
            street_trees.append((x, y, z, yaw_deg, h, rank))
        elif g == "pylon":                                  # (own objects, visible further away: pylons)
            continue
        elif g == "pole":                                   # wooden pole with cross arm
            solid.box(x, y, z - 0.3, 0.26, 0.26, h + 0.3, yaw, WOOD)
            solid.box(x, y, z + h - 0.6, 1.8, 0.12, 0.12, yaw, WOOD)
        elif g == "streetlight":                            # pole, arm towards the road, lamp head
            a = _toward(x, y, road_xy)
            a = yaw if a is None else a
            solid.box(x, y, z - 0.3, 0.2, 0.2, h + 0.3, a, METAL)
            ax, ay = x + math.cos(a) * 0.8, y + math.sin(a) * 0.8
            deco.box(ax, ay, z + h - 0.2, 1.6, 0.12, 0.12, a, METAL)
            hx, hy = x + math.cos(a) * 1.6, y + math.sin(a) * 1.6
            deco.box(hx, hy, z + h - 0.45, 0.7, 0.32, 0.25, a, LAMP, top=LAMP)
            deco.box(hx, hy, z + h - 0.5, 0.5, 0.22, 0.06, a, YELLOW)
        elif g == "polelamp":                               # lamp on a pole (without its own pole)
            deco.box(x, y, z - 0.25, 0.6, 0.3, 0.25, yaw, LAMP)
            deco.box(x, y, z - 0.3, 0.45, 0.2, 0.06, yaw, YELLOW)
        elif g in SPEED or g in ("stop", "giveway"):        # post and double-sided sign on top
            k = SPEED.get(g, STOP if g == "stop" else GIVEWAY)
            solid.box(x, y, z - 0.3, 0.07, 0.07, h + 0.3, yaw, METAL)
            c, s, w = math.cos(yaw), math.sin(yaw), 0.36
            p = lambda dx, dz: (x + dx * c, y + dx * s, z + h - 0.35 + dz)         # noqa: E731
            deco.quad(p(-w, -w), p(w, -w), p(w, w), p(-w, w), k, back=k)
        elif g == "signal":                                 # traffic light on a post, head on both faces
            solid.box(x, y, z - 0.3, 0.14, 0.14, 3.9, yaw, METAL)
            _signal_head(deco, x, y, z + 2.6, yaw)
        elif g.startswith(("rrcross", "rrflash", "rrgate")):    # level crossings (railways.crossing_props)
            _crossing(solid, deco, g, x, y, z, yaw)
        elif g == "door":                                   # flat door on the wall
            c, s, w = math.cos(yaw), math.sin(yaw), 0.5
            p = lambda dx, dz: (x + dx * c, y + dx * s, z + dz)                    # noqa: E731
            deco.quad(p(-w, 0), p(w, 0), p(w, h), p(-w, h), DOOR, back=DOOR)
        elif g == "hydrant":
            deco.box(x, y, z, 0.28, 0.28, h * 0.8, yaw, RED)
            deco.box(x, y, z + h * 0.8, 0.34, 0.34, h * 0.2, yaw, RED)
        elif g == "bin":
            deco.box(x, y, z, 0.5, 0.5, h, yaw, GREEN)
        elif g == "bench":
            deco.box(x, y, z + 0.4, 1.6, 0.45, 0.08, yaw, BENCH)
            c, s = math.cos(yaw), math.sin(yaw)
            deco.box(x - s * 0.22, y + c * 0.22, z + 0.48, 1.6, 0.06, 0.45, yaw, BENCH)
            for dx in (-0.7, 0.7):
                deco.box(x + c * dx, y + s * dx, z, 0.08, 0.4, 0.4, yaw, METAL)
    return solid.mesh(), deco.mesh(), street_trees


def _plate(b, x, y, z0, yaw, w, h, k, depth=0.0):
    """Double-sided upright plate: width w along yaw, height h from z0, depth m off the axis across it."""
    c, s = math.cos(yaw), math.sin(yaw)
    p = lambda dx, dz: (x + dx * c + depth * s, y + dx * s - depth * c, z0 + dz)          # noqa: E731
    b.quad(p(-w / 2, 0), p(w / 2, 0), p(w / 2, h), p(-w / 2, h), k, back=k)


def _signal_head(b, x, y, z0, yaw):
    """Traffic light head: a dark housing (0.36 x 0.28 x 1.0 m) with the lamps on its front and its back."""
    b.box(x, y, z0, 0.36, 0.28, 1.0, yaw, LAMP, top=LAMP)
    for depth in (0.15, -0.15):
        _plate(b, x, y, z0 + 0.02, yaw, 0.34, 0.96, SIGNAL_HEAD, depth)


def _crossing(solid, deco, g, x, y, z, yaw):
    """A level crossing kit: post, crossbuck (St Andrew's cross in Europe), flashers, a raised gate arm."""
    kit = "gate" if g.startswith("rrgate") else "flash" if g.startswith("rrflash") else "cross"
    eu = "_eu" in g
    top = 2.9 if kit == "cross" else 3.6
    solid.box(x, y, z - 0.3, 0.12, 0.12, top + 0.3, yaw, METAL if not eu else WHITE)
    c, s = math.cos(yaw), math.sin(yaw)
    zc, arm, half = z + top - 0.55, 0.62, 0.11
    cell = XBUCK_EU if eu else XBUCK_US
    for sign in (1, -1):                                    # the two arms of the cross, both faces
        ex, ez = math.cos(math.pi / 4) * arm, sign * math.sin(math.pi / 4) * arm
        nx, nz = -math.sin(math.pi / 4) * half * sign, math.cos(math.pi / 4) * half
        p = lambda u, v: (x + (u * ex + v * nx) * c, y + (u * ex + v * nx) * s, zc + u * ez + v * nz)    # noqa: E731
        deco.quad(p(-1, -1), p(1, -1), p(1, 1), p(-1, 1), cell, back=cell)
    if kit in ("flash", "gate"):
        _plate(deco, x, y, z + top - 1.75, yaw, 0.9, 0.42, RR_FLASH, 0.08)
        _plate(deco, x, y, z + top - 1.75, yaw, 0.9, 0.42, RR_FLASH, -0.08)
    if kit == "gate":                                       # the arm stands up beside the post, towards the road
        toward = 1.0 if g.endswith("_l") else -1.0          # (railways._crossing_rows: yaw is the travel's right)
        ax, ay = x + toward * 0.35 * c, y + toward * 0.35 * s
        deco.box(ax, ay, z + 0.9, 0.3, 0.3, 0.5, yaw, LAMP)
        deco.beam((ax, ay, z + 1.2), (ax, ay, z + 7.2), 0.06, STRIPES)


# --- guardrails --------------------------------------------------------------------------------------------
# Row like guardrails.forest_rows: [group, x, y, z, yaw, -, height, random, front xyz, back xyz, top xyz] (ENU),
# one 3 m module around (x, y), 2.8 m apart (overlapping); groups guardrails.GROUPS. In game they are Italy's beam,
# the concrete barrier and the cable barrier as forest models (with collision). Here comic models without collision,
# plus one invisible vertical wall per module (1WALL ..._guardrailcol_...).
RAIL_GROUPS = {"guardrail": "rail", "guardrail_back": "rail", "guardrail_start": "start", "guardrail_back_start": "start",
               "guardrail_end": "end", "guardrail_back_end": "end", "jersey": "jersey", "jersey_end": "jersey_end",
               "cable": "cable"}
RAIL_HALF = 1.5                 # m: half module length (guardrails.MODULE_LENGTH_M)
RAIL_BEAM = (0.45, 0.76)        # m: bottom and top of the steel beam
RAIL_CAP_LOW = 0.15             # m: top at the ground end of an end piece
CABLE_AT = (0.55, 0.67, 0.79, 0.91)     # m: the four cables


def rails(groups, rows):
    """(visible mesh, collision mesh) of the guardrail rows; each None when there are none."""
    deco, col = Builder(), Builder()
    for row in rows:
        kind = RAIL_GROUPS.get(groups[int(row[0])])
        if kind is None:
            continue
        x, y, z, h = row[1], row[2], row[3], row[6]
        c0, c1, U = np.asarray(row[8:11], float), np.asarray(row[11:14], float), np.asarray(row[14:17], float)
        F, B = (c1, -c0) if kind.startswith("jersey") else (c0, c1)     # (the concrete wall runs along its y axis)
        # (an end piece stands with z on its end, not in the middle: guardrails.forest_rows)
        l0 = -RAIL_HALF if kind == "start" else RAIL_HALF if kind == "end" else 0.0

        def pt(l, w, hh):
            q = l * F + w * B + hh * U
            return (x + q[0], y + q[1], z + q[2] - l0 * F[2])

        def top(l):                 # top along the module (end pieces drop towards the ground end)
            hi = RAIL_BEAM[1] if kind in ("rail", "start", "end") else h
            f = (l + RAIL_HALF) / (2 * RAIL_HALF)
            if kind == "start":
                return RAIL_CAP_LOW + (hi - RAIL_CAP_LOW) * f
            if kind in ("end", "jersey_end"):
                return hi + (RAIL_CAP_LOW - hi) * f
            return hi
        L = (-RAIL_HALF, RAIL_HALF)
        if kind in ("rail", "start", "end"):        # beam at the front (-B), posts behind it
            for (la, lb) in ((L[0], 0.0), (0.0, L[1])):
                ta, tb = top(la), top(lb)
                ba, bb = ta - (RAIL_BEAM[1] - RAIL_BEAM[0]), tb - (RAIL_BEAM[1] - RAIL_BEAM[0])
                fa, fb = (max(ba, 0.0), ta), (max(bb, 0.0), tb)
                deco.quad(pt(la, -0.15, fa[0]), pt(lb, -0.15, fb[0]), pt(lb, -0.15, fb[1]), pt(la, -0.15, fa[1]), METAL,
                          back=METAL)
                deco.quad(pt(la, -0.15, fa[1]), pt(lb, -0.15, fb[1]), pt(lb, -0.10, fb[1]), pt(la, -0.10, fa[1]), METAL)
            ph = top(0.0)
            for w0, w1, l_0, l_1 in ((-0.10, 0.0, -0.05, -0.05), (0.0, 0.0, -0.05, 0.05), (0.0, -0.10, 0.05, 0.05),
                                     (-0.10, -0.10, 0.05, -0.05)):
                deco.quad(pt(l_0, w0, -0.3), pt(l_1, w1, -0.3), pt(l_1, w1, ph), pt(l_0, w0, ph), METAL)
        elif kind.startswith("jersey"):             # Jersey profile: 0.6 m wide at the bottom, 0.16 m at the top
            for side in (-1, 1):
                a0, a1 = (L[0], side * 0.30, 0.0), (L[1], side * 0.30, 0.0)
                b0, b1 = (L[0], side * 0.08, top(L[0])), (L[1], side * 0.08, top(L[1]))
                if side < 0:
                    deco.quad(pt(*a0), pt(*a1), pt(*b1), pt(*b0), SIGNBACK)
                else:
                    deco.quad(pt(*a1), pt(*a0), pt(*b0), pt(*b1), SIGNBACK)
            deco.quad(pt(L[0], -0.08, top(L[0])), pt(L[1], -0.08, top(L[1])), pt(L[1], 0.08, top(L[1])),
                      pt(L[0], 0.08, top(L[0])), SIGNBACK)
        else:                                       # cable barrier: posts, four cables
            for w0, w1, l_0, l_1 in ((-0.04, 0.04, -0.04, -0.04), (0.04, 0.04, -0.04, 0.04), (0.04, -0.04, 0.04, 0.04),
                                     (-0.04, -0.04, 0.04, -0.04)):
                deco.quad(pt(l_0, w0, -0.3), pt(l_1, w1, -0.3), pt(l_1, w1, h), pt(l_0, w0, h), METAL)
            for hh in CABLE_AT:
                deco.quad(pt(L[0], 0.0, hh - 0.015), pt(L[1], 0.0, hh - 0.015), pt(L[1], 0.0, hh + 0.015),
                          pt(L[0], 0.0, hh + 0.015), METAL, back=METAL)
        hc = h if kind == "cable" else None        # collision: one vertical wall per module (obj_to_kn5: double-sided)
        col.quad(pt(L[0], 0.0, -0.3), pt(L[1], 0.0, -0.3), pt(L[1], 0.0, hc or top(L[1])), pt(L[0], 0.0, hc or top(L[0])),
                 METAL)
    return deco.mesh(), col.mesh()
