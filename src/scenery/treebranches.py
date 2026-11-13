"""Permanent low-cost branches inside existing crowns; old geometry is retained verbatim."""
import math
import random

import numpy as np


def _tube(mesh, points, radii, sides, unit, root=None):
    """Append a tapered branch, optionally sharing its parent's root ring, in the native trunk's face winding."""
    first = len(mesh.t)
    points, rings = np.asarray(points, float), []
    for i, (point, radius) in enumerate(zip(points, radii)):
        if i == 0 and root is not None:
            rings.append(root)
            continue
        tangent = unit(points[min(i + 1, len(points) - 1)] - points[max(0, i - 1)])
        side = unit(np.cross(tangent, (0, 0, 1)))
        other = unit(np.cross(tangent, side))
        if radius == 0:
            rings.append([len(mesh.p)])
            mesh.p.append(tuple(point)); mesh.n.append(tuple(tangent)); mesh.uv.append((.75, .75))
            continue
        ring = []
        for k in range(sides):
            angle = k * math.tau / sides
            normal = math.cos(angle) * side + math.sin(angle) * other
            ring.append(len(mesh.p))
            mesh.p.append(tuple(point + radius * normal)); mesh.n.append(tuple(normal))
            mesh.uv.append((.52 + .45 * k / max(1, sides - 1), .52 + .45 * i / max(1, len(points) - 1)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(sides):
            j = (k + 1) % sides
            if len(b) == 1:
                mesh.t.append((a[k], a[j], b[0]))
            else:
                mesh.t.extend(((a[k], a[j], b[j]), (a[k], b[j], b[k])))
    if root is None:
        for k in range(1, sides - 1):
            mesh.t.append((rings[0][0], rings[0][k + 1], rings[0][k]))
    # CSP's existing trunk uses clockwise faces with outward shading normals; added wood must agree.
    mesh.t[first:] = [(a, c, b) for a, b, c in mesh.t[first:]]


def extend(name, lod, original, fine, api):
    """Clone a tree and add wood without moving any old vertex, face or leaf card. Pure."""
    mesh = api.Mesh()
    for key in ('p', 'n', 'uv', 't'):
        setattr(mesh, key, list(getattr(original, key)))
    if name == 'larch':
        for k in range(7)[::(1, 2, 3)[lod]]:
            t = k / 6
            y, reach = 14 * (.13 + .68 * t), 2.8 * (1 - .82 * t) * .88
            for j in range(3):
                angle = k * 2.39996 + j * math.tau / 3
                end = (math.cos(angle) * reach, y + .25, math.sin(angle) * reach)
                _tube(mesh, [(0, y, 0), end], [.045 * (1 - .65 * t), 0], 3, api.unit)
        return mesh
    if name not in ('broadleaf', 'birch'):
        return mesh
    birch = name == 'birch'
    centres = np.asarray(fine.p[24:]).reshape(-1, 4, 3).mean(axis=1)
    low, high = centres[:, 1].min(), centres[:, 1].max()
    trunk_top, radius = (7.5, .14) if birch else (6., .22)
    heights = np.linspace(trunk_top, high - .08, 4)
    offsets = np.array([[0, 0], [.09, .02], [.03, -.06], [.12, -.01]])
    leader = np.column_stack((offsets[:, 0], heights, offsets[:, 1]))
    sides = (6, 5, 4)[lod]
    root = [4 * (-k % sides) + 3 for k in range(sides)]  # original trunk's upper ring, in tube order
    _tube(mesh, leader, [radius * .6, radius * .4, radius * .2, 0], sides, api.unit, root)
    count = (9, 7, 5)[lod] if birch else (8, 6, 5)[lod]
    rng = random.Random(1029 if birch else 410)
    for k in range(count):
        t = k / max(1, count - 1)
        y = low * .82 + (high * .77 - low * .82) * t
        start = np.array([np.interp(y, heights, leader[:, 0]), y, np.interp(y, heights, leader[:, 2])])
        angle = k * 2.39996 + rng.uniform(-.25, .25)
        direction = np.array([math.cos(angle), 0, math.sin(angle)])
        reach = np.ptp(centres[:, 0]) * .45 * (1 - .25 * t)
        desired = direction * reach + [0, low + (high - low) * (.18 + .72 * t), 0]
        tip = centres[np.argmin(np.sum((centres - desired) ** 2, axis=1))].copy()
        mid = start * .48 + tip * .52 + [0, -.13 if birch else -.2, 0]
        _tube(mesh, [start, mid, tip], [radius * (.43 - .2 * t), radius * .16, 0], 3, api.unit)
        for j in range(2 if lod < 2 else 1):
            root = mid if j == 0 else mid * .45 + tip * .55
            a = angle + (-.8 if j == 0 else .7)
            wanted = tip + np.array([math.cos(a) * reach * .35, -.35 if birch else .45, math.sin(a) * reach * .35])
            twig = centres[np.argmin(np.sum((centres - wanted) ** 2, axis=1))].copy()
            if np.linalg.norm(twig - tip) < .1:
                twig = tip + (wanted - tip) * .28
            _tube(mesh, [root, twig], [radius * (.11 if birch else .14), 0], 3, api.unit)
    return mesh
