"""Repeating painted building surfaces: 3 m facade and 6 m roof tiles, without extra geometry."""
import numpy as np
from PIL import Image


def _grain(x, y):
    """Periodic fine surface variation at normalized coordinates x, y. Pure."""
    return (np.sin(2 * np.pi * (37 * x + 23 * y)) *
            np.cos(2 * np.pi * (19 * x - 41 * y)) + .4 * np.sin(2 * np.pi * (83 * x + 61 * y)))


def _grid(x, y, columns, rows, width):
    """Symmetric joint mask on a repeating grid. Pure."""
    u, v = (x * columns) % 1, (y * rows) % 1
    return (np.minimum(u, 1 - u) < width) | (np.minimum(v, 1 - v) < width)


def _masonry(x, y, grain, clay=False):
    """Running-bond concrete blocks or earthen courses at facade scale. Pure."""
    rows, columns = (10, 6) if not clay else (12, 8)
    row = np.floor(y * rows)
    u, v = (x * columns + row % 2 / 2) % 1, y * rows % 1
    shade = 1 + .045 * np.sin(np.floor(x * columns + row % 2 / 2) * 2.1 + row * 1.7)
    base = (155, 155, 145) if not clay else (183, 128, 85)
    a = np.asarray(base) * shade[..., None] + grain[..., None] * (4 if not clay else 6)
    a[(u < .025) | (u > .975) | (v < .035) | (v > .965)] = (193, 190, 177) if not clay else (153, 105, 71)
    return a


def _timber(x, y, grain):
    """Plaster infill and dark timber braces; a painted motif, not structural geometry. Pure."""
    u, v = x * 2 % 1, y * 2 % 1
    frame = _grid(x, y, 2, 2, .055)
    # Diagonal braces belong to each panel; the grid frames their ends.
    frame |= (np.abs(u - v) < .045) | (np.abs(u + v - 1) < .045)
    a = np.ones((*x.shape, 3)) * (223, 212, 184) + grain[..., None] * 3
    a[frame] = np.stack([64 + grain * 3, 46 + grain * 2, 32 + grain], axis=-1)[frame]
    return a


def _panels(x, y, grain, solar=False):
    """Glazed roof panes or photovoltaic modules; neither includes emissive window pixels. Pure."""
    if solar:
        a = np.ones((*x.shape, 3)) * (28, 48, 73)
        a += (6 * np.sin(2 * np.pi * (x * 3 + y * 3)))[..., None]
        a[_grid(x, y, 18, 36, .025)] = (76, 97, 117)
        a[_grid(x, y, 6, 3, .025)] = (169, 174, 173)
    else:
        a = np.ones((*x.shape, 3)) * (95, 137, 153)
        a += (12 * np.cos(2 * np.pi * (x * 6 - y * 6)))[..., None]
        a[_grid(x, y, 6, 6, .025)] = (182, 190, 188)
    return a + grain[..., None]


def _vegetation(x, y, grain):
    """Low sedum/grass patches, painted into the roof rather than spawned as plants. Pure."""
    patch = np.sin(2 * np.pi * (3 * x + 2 * y)) * np.cos(2 * np.pi * (2 * x - 3 * y))
    fine = np.sin(2 * np.pi * (97 * x + 43 * y)) * np.cos(2 * np.pi * 71 * y)
    return np.stack([83 + 18 * patch + 9 * fine, 108 + 19 * patch + 12 * fine,
                     49 + 9 * patch + 6 * fine], axis=-1) + grain[..., None] * 3


def _gravel(x, y, grain):
    """Small rounded stones with periodic Voronoi cells at roof scale. Pure."""
    # 6 m / 96 cells: roughly 6 cm aggregate; deliberately coarse enough to survive a 512 px mip chain.
    gx, gy = x * 96, y * 96
    ix, iy = np.floor(gx), np.floor(gy)
    nearest = np.full(x.shape, np.inf)
    shades = np.zeros(x.shape)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            cx, cy = (ix + dx) % 96, (iy + dy) % 96
            jitter = np.sin(cx * 12.3 + cy * 71.7)
            d = (gx - (ix + dx + .5 + .22 * jitter)) ** 2 + (gy - (iy + dy + .5 + .2 * np.cos(cx + cy))) ** 2
            closer = d < nearest
            shades[closer] = (142 + 23 * jitter)[closer]
            nearest = np.minimum(nearest, d)
    light = shades - 50 * np.minimum(nearest, 1) + grain * 2
    return np.stack([light * 1.08, light * 1.02, light * .91], axis=-1)


def _roof_courses(x, y, grain, tiles=False):
    """Overlapping clay tiles or wooden shingles, at 6 m per repeat. Pure."""
    row = np.floor(y * 20)
    u, v = (x * 24 + row % 2 / 2) % 1, y * 20 % 1
    if tiles:
        shade = .85 + .18 * np.sin(np.pi * u) + .08 * v
        base = (187, 92, 52)
    else:
        shade = .85 + .12 * np.sin(np.floor(x * 24 + row % 2 / 2) * 2.3 + row)
        shade += .04 * np.sin(2 * np.pi * x * 240)
        base = (143, 117, 86)
    a = np.asarray(base) * shade[..., None] + grain[..., None] * 2
    a[(u < .025) | (u > .975) | (v < .06)] *= .65
    return a


def _copper(x, y, grain):
    """Weathered copper sheets with muted blue-green patina and uneven dark oxidation. Pure."""
    tau = 2 * np.pi
    # Periodic domain warping keeps patches irregular without introducing seams at the 6 m repeat.
    u = x + .13 * np.sin(tau * (2 * y + x))
    v = y + .11 * np.cos(tau * (3 * x - y))
    patch = (np.sin(tau * (3 * u + 2 * v)) + .55 * np.cos(tau * (5 * u - 3 * v))
             + .3 * np.sin(tau * (11 * u + 7 * v))) / 1.85
    patina = np.clip(.68 + .55 * patch, 0, 1)
    dark, pale = np.asarray((65, 100, 90)), np.asarray((156, 195, 179))
    a = dark + (pale - dark) * patina[..., None] + grain[..., None] * 2
    # Twelve standing seams per 6 m tile represent roughly 50 cm copper sheets.
    seam = x * 12 % 1
    a[np.minimum(seam, 1 - seam) < .018] *= .68
    return a


def texture(kind, color, px=512):
    """RGB repeat for surface kind, multiplicative tint and pixel size. Pure."""
    y, x = np.mgrid[0:px, 0:px].astype(float) / px
    grain = _grain(x, y)
    if kind in ('blk', 'cly'):
        a = _masonry(x, y, grain, clay=kind == 'cly')
    elif kind == 'tmf':
        a = _timber(x, y, grain)
    elif kind in ('sol', 'rgl'):
        a = _panels(x, y, grain, solar=kind == 'sol')
    elif kind == 'veg':
        a = _vegetation(x, y, grain)
    elif kind == 'grv':
        a = _gravel(x, y, grain)
    elif kind == 'cop':
        a = _copper(x, y, grain)
    elif kind in ('rtl', 'rsh'):
        a = _roof_courses(x, y, grain, tiles=kind == 'rtl')
    elif kind == 'tha':
        strand = np.sin(2 * np.pi * (x * 192 + .12 * np.sin(2 * np.pi * y * 8)))
        course = .88 + .12 * (y * 12 % 1)
        a = np.asarray((185, 150, 89)) * course[..., None] + (strand * 14 + grain * 4)[..., None]
    elif kind == 'fbc':
        corrugation = .9 + .1 * np.cos(2 * np.pi * x * 36)
        a = np.asarray((154, 156, 148)) * corrugation[..., None] + grain[..., None] * 3
        a[_grid(x, y, 6, 3, .018)] *= .75
    elif kind == 'pol':
        rib = .88 + .12 * np.cos(2 * np.pi * x * 96)
        a = np.asarray((180, 193, 186)) * rib[..., None] + grain[..., None]
        a[_grid(x, y, 6, 3, .015)] *= .82
    elif kind == 'vny':
        course = y * 15 % 1
        a = np.ones((*x.shape, 3)) * (210, 215, 207) + grain[..., None]
        a[course < .06] *= .74
        a[(course >= .06) & (course < .10)] *= 1.07
    elif kind == 'bit':
        a = np.ones((*x.shape, 3)) * (69, 72, 70) + grain[..., None] * 4
        a[_grid(x, y, 6, 2, .012)] *= .72
    else:
        raise ValueError(f'Unknown building surface: {kind}')
    a = np.clip(a * np.asarray(color), 0, 255).astype(np.uint8)
    # Matching edge texels protect repeats through downsampling; wrap the last sample to the first.
    a[-1] = a[0]
    a[:, -1] = a[:, 0]
    return Image.fromarray(a)
