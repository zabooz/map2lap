"""Comic facades in the UV grid of BeamNG.Earth's window atlas (measured on the tiles):

- 1024 px = 12 m of wall (u 0..1), window bays every 256 px (3 m).
- Band v 0.50-0.75 (image rows 256-512): upper floor with windows; the single mullioned windows of the family houses
  sit at u 53-154 px, v 0.544-0.732 (rows 274-467) -> every bay gets a window there.
- Band v 0.25-0.50 (rows 512-768): ground floor / shops: larger shop windows.
- Rest: plaster (plinth, cornices).
Family house walls (siding) are tiled world-wide and get the plaster without windows.
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


def windowed(plaster_img):
    """Residential facade in BeamNG's grid: band v 0.50-0.75 windows with shutters, band 0.25-0.50 windows without
    (houses use both bands; measured 724 / 366 vertices)."""
    img = plaster_img.copy()
    d = ImageDraw.Draw(img)
    shade = tuple(int(c * 0.85) for c in img.getpixel((5, 300)))
    for y in (250, 506):                                                        # cornices above the bands
        d.rectangle([0, y, PX, y + 6], fill=shade)
    off = 256                                                                   # band 0.25-0.50 is 256 rows lower
    for bx in range(0, PX, BAY):
        _window(d, bx + WIN_X[0], WIN_Y[0], bx + WIN_X[1], WIN_Y[1])
        _window(d, bx + WIN_X[0], WIN_Y[0] + off, bx + WIN_X[1], WIN_Y[1] + off, shutters=False)
    return img


def shopfront(plaster_img):
    """Shop facade (BeamNG material bne_bld_shop): shop windows with an awning in both bands."""
    img = plaster_img.copy()
    d = ImageDraw.Draw(img)
    for bx in range(0, PX, BAY):
        for y0, y1 in ((300, 480), SHOP_Y):
            _shop(d, bx + 28, y0, bx + BAY - 28, y1)
    return img
