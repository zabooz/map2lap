"""Comic facades in the UV grid of BeamNG.Earth's window sheets (buildings.BAND_*: four bands of 256 rows, the top
one first; 1024 px = 12 m of wall). Each floor of a wall is one band, BeamNG.Earth picks the band by region and kind
of building:

- rows 0-256     tall windows on plaster, 3 bays (BAND_TALL)
- rows 256-512   square windows, 4 bays (BAND_PANEL); the single mullioned windows laid over the plain walls of the
                 family houses come from u 53-154 px, rows 274-467 of it (buildings.WIN_UV)
- rows 512-768   sash windows on plaster, 5 bays (BAND_SASH)
- rows 768-1024  sash windows on red brick, 5 bays (BAND_BRICK)

Shutters only where BeamNG.Earth's region has them (make_obj.SHUTTER_REGIONS).
Plain walls (siding boards, stucco, metal) and roofs are tiled (buildings.SIDING_UV_M, ROOF_UV_M).
"""
import numpy as np
from PIL import Image, ImageDraw

PX = 1024
BAY = 256
WIN_X = (53, 154)               # window column in every bay
WIN_Y = (274, 467)              # upper floor windows (rows)
SHOP_Y = (560, 740)             # shop windows in the ground floor band
GLASS, GLASS_HI = (46, 78, 120), (120, 170, 210)
FRAME, SILL = (248, 248, 244), (200, 196, 186)
SHUTTER, SHUTTER_DARK = (70, 130, 80), (50, 100, 60)


def _window(d, x0, y0, x1, y1, shutters=True):
    if shutters:                # green shutters left and right
        w = 24
        for sx0 in (x0 - w - 4, x1 + 4):
            d.rectangle([sx0, y0, sx0 + w, y1], fill=SHUTTER)
            for yy in range(y0 + 8, y1 - 4, 14):
                d.line([(sx0 + 3, yy), (sx0 + w - 3, yy)], fill=SHUTTER_DARK, width=3)
    d.rectangle([x0, y0, x1, y1], fill=FRAME)                                   # frame
    d.rectangle([x0 + 8, y0 + 8, x1 - 8, y1 - 8], fill=GLASS)                   # glass
    d.polygon([(x0 + 8, y0 + 8), (x0 + 40, y0 + 8), (x0 + 8, y0 + 60)], fill=GLASS_HI)   # glint
    xm, ym = (x0 + x1) // 2, (y0 + y1) // 2
    d.line([(xm, y0 + 8), (xm, y1 - 8)], fill=FRAME, width=6)                   # mullions
    d.line([(x0 + 8, ym), (x1 - 8, ym)], fill=FRAME, width=6)
    d.rectangle([x0 - 8, y1, x1 + 8, y1 + 12], fill=SILL)                       # sill


def _shop(d, x0, y0, x1, y1):
    d.rectangle([x0, y0, x1, y1], fill=(60, 60, 64))
    d.rectangle([x0 + 8, y0 + 8, x1 - 8, y1 - 8], fill=GLASS)
    d.polygon([(x0 + 8, y0 + 8), (x0 + 70, y0 + 8), (x0 + 8, y0 + 90)], fill=GLASS_HI)
    d.rectangle([x0 - 6, y0 - 26, x1 + 6, y0 - 4], fill=(196, 64, 52))           # awning
    for xx in range(x0 - 6, x1 + 6, 24):
        d.rectangle([xx, y0 - 26, xx + 11, y0 - 4], fill=(240, 236, 228))


def plaster(base_rgb_img, color):
    """Tinted plaster: the template's greyscale structure, base brightness 1, in the house colour (RGB 0..1)."""
    g = np.asarray(base_rgb_img.convert("L").resize((PX, PX)), np.float32)
    g = 0.75 + 0.25 * (g / max(g.mean(), 1.0))
    return Image.fromarray(np.clip(g[..., None] * np.asarray(color) * 235, 0, 255).astype(np.uint8))


def tinted(base_rgb_img, color, contrast=1.0, px=PX):
    """Tinted wall (concrete, stone, make_obj.WALL_KINDS): the template's structure (each channel divided by its mean,
    the deviations times contrast), on average the colour (RGB 0..1)."""
    a = np.asarray(base_rgb_img.convert("RGB").resize((px, px)), np.float32)
    a = 1.0 + contrast * (a / a.reshape(-1, 3).mean(axis=0) - 1.0)
    return Image.fromarray(np.clip(a * np.asarray(color) * 255, 0, 255).astype(np.uint8))


BRICK, MORTAR = (164, 78, 56), (214, 200, 184)


def _bricks(d, y0, y1, color, row=18, length=54):
    """Comic brickwork (running bond) over rows y0..y1, in the house colour (BeamNG.Earth's brick tints)."""
    tint = lambda c: tuple(int(v * k) for v, k in zip(c, color))      # noqa: E731
    d.rectangle([0, y0, PX, y1], fill=tint(MORTAR))
    for k, y in enumerate(range(y0, y1, row)):
        for x in range(-(k % 2) * length // 2, PX, length):
            shade = 1.0 - 0.08 * (((x // length) * 7 + k * 3) % 3)
            d.rectangle([x + 2, y + 2, x + length - 2, min(y + row - 2, y1)],
                        fill=tint(tuple(v * shade for v in BRICK)))


def sheet(plaster_img, color, shutters):
    """Residential facade with all four of BeamNG.Earth's bands (the module doc), in the house colour."""
    img = plaster_img.copy()
    d = ImageDraw.Draw(img)
    _bricks(d, 768, PX, color)
    shade = tuple(int(c * 0.85) for c in img.getpixel((5, 300)))
    for y in (250, 506, 762):                                                   # cornices above the bands
        d.rectangle([0, y, PX, y + 6], fill=shade)
    for k in range(3):                                                          # tall windows, 3 bays
        bx = k * PX / 3
        _window(d, int(bx + 118), 34, int(bx + 222), 226, shutters)
    for bx in range(0, PX, BAY):                                                # square windows, 4 bays
        _window(d, bx + WIN_X[0], WIN_Y[0], bx + WIN_X[1], WIN_Y[1], shutters)
    for k in range(5):                                                          # sash windows, 5 bays
        bx = k * PX / 5
        _window(d, int(bx + 58), 548, int(bx + 146), 736, shutters)
        _window(d, int(bx + 58), 804, int(bx + 146), 992, shutters=False)       # (on brick: a stone lintel)
        d.rectangle([int(bx + 50), 790, int(bx + 154), 802], fill=(226, 220, 206))
    return img


def brickwall(color):
    """A plain brick wall (garages, BeamNG.Earth's bne_bld_brick) in the brick tint."""
    img = Image.new("RGB", (PX, PX))
    _bricks(ImageDraw.Draw(img), 0, PX, color, row=24, length=72)
    return img


def boards(plaster_img, rows=15):
    """Siding: horizontal boards (buildings.SIDING_UV_M: 3 m per repeat, 0.2 m boards)."""
    img = plaster_img.copy()
    d = ImageDraw.Draw(img)
    base = img.getpixel((5, 5))
    dark, light = tuple(int(c * 0.72) for c in base), tuple(min(255, int(c * 1.08)) for c in base)
    step = PX / rows
    for k in range(rows):
        y = int((k + 1) * step)
        d.rectangle([0, y - 5, PX, y - 1], fill=dark)
        d.rectangle([0, y, PX, y + 2], fill=light)
    return img


def ribbed(color, px=PX, step=32, vertical=True):
    """Metal: corrugated walls (vertical ribs) and standing-seam roofs (seams up the slope: constant u), in the colour."""
    base = np.asarray(color, np.float32) * 200
    a = np.empty((px, px, 3), np.float32)
    t = (np.arange(px) % step) / step
    prof = (0.86 + 0.22 * np.sin(2 * np.pi * t)) if vertical else (1.0 - 0.3 * (t < 0.08))
    a[:] = base * prof[None, :, None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def curtain(color):
    """Office curtain wall (BeamNG.Earth's m_highrise_metal bands 0 and 1: 5 and 4 bays): tinted glass in a grid of
    mullions, a spandrel at each floor's foot; the lower half plain cladding."""
    glass = tuple(int(v * k) for v, k in zip((118, 150, 182), color))
    hi = tuple(min(255, int(v * 1.25)) for v in glass)
    frame, spandrel = (196, 200, 206), tuple(int(v * 0.55) for v in glass)
    img = Image.new("RGB", (PX, PX), (184, 186, 190))
    d = ImageDraw.Draw(img)
    for y0, bays in ((0, 5), (256, 4)):
        d.rectangle([0, y0, PX, y0 + 256], fill=glass)
        for k in range(bays):
            x = int(k * PX / bays)
            d.polygon([(x + 12, y0 + 12), (x + 60, y0 + 12), (x + 12, y0 + 120)], fill=hi)
            d.rectangle([x, y0, x + 8, y0 + 256], fill=frame)
        d.rectangle([0, y0 + 108, PX, y0 + 114], fill=frame)
        d.rectangle([0, y0 + 212, PX, y0 + 256], fill=spandrel)
    return img


def shopfront(plaster_img):
    """Shop facade (BeamNG material bne_bld_shop): shop windows with an awning in both bands."""
    img = plaster_img.copy()
    d = ImageDraw.Draw(img)
    for bx in range(0, PX, BAY):
        for y0, y1 in ((300, 480), SHOP_Y):
            _shop(d, bx + 28, y0, bx + BAY - 28, y1)
    return img
