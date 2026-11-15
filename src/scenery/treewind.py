"""Shared height samples let TreeFX wood and foliage follow the same wind bend."""
import numpy as np

# Eight bands bound interpolation error for a quadratic bend to 1/256 of tip sway.
# A single foot-to-tip trunk instead cuts through the bent needle tiers. This samples
# the large tree bend, not the shader's independent small-scale leaf flutter.
BANDS = 8


def subdivide(original, height, needles=False):
    """Split wood (and optionally needle cones) at fractions of height, retaining rest shape and UVs. Pure."""
    mesh = type(original)()
    for key in ('p', 'n', 'uv'):
        setattr(mesh, key, list(getattr(original, key)))
    cuts = {}

    def intersection(a, b, level):
        """Index of an edge's vertex at level, shared by both adjoining faces."""
        key = (min(a, b), max(a, b), level)
        if key not in cuts:
            if mesh.p[a][1] > mesh.p[b][1]:
                a, b = b, a
            t = (level - mesh.p[a][1]) / (mesh.p[b][1] - mesh.p[a][1])
            cuts[key] = len(mesh.p)
            for attr in ('p', 'n', 'uv'):
                values = getattr(mesh, attr)
                values.append(tuple((1 - t) * np.asarray(values[a]) + t * np.asarray(values[b])))
            x, _, z = mesh.p[-1]
            mesh.p[-1] = (x, level, z)
        return cuts[key]

    def emit(polygon):
        """Triangulate a convex clipped face, keeping its original winding."""
        mesh.t.extend((polygon[0], polygon[i], polygon[i + 1]) for i in range(1, len(polygon) - 1))

    for triangle in original.t:
        uv = np.asarray([mesh.uv[i] for i in triangle])
        wood = (uv >= .5).all()
        cone = needles and ((uv[:, 0] < .5) & (uv[:, 1] > .5)).all()
        if not (wood or cone):
            mesh.t.append(triangle)
            continue
        polygon = list(triangle)
        for level in np.arange(1, BANDS) * height / BANDS:
            ys = [mesh.p[i][1] for i in polygon]
            if not min(ys) < level < max(ys):
                continue
            lower, upper = [], []
            for a, b in zip(polygon, polygon[1:] + polygon[:1]):
                ya, yb = mesh.p[a][1], mesh.p[b][1]
                if ya <= level:
                    lower.append(a)
                if ya >= level:
                    upper.append(a)
                if min(ya, yb) < level < max(ya, yb):
                    vertex = intersection(a, b, level)
                    lower.append(vertex)
                    upper.append(vertex)
            emit(lower)
            polygon = upper
        emit(polygon)
    # Keep interpolation linear through all cuts, then restore unit shading normals.
    for i in range(len(original.n), len(mesh.n)):
        normal = np.asarray(mesh.n[i])
        length = np.linalg.norm(normal)
        mesh.n[i] = tuple(normal / length) if length > 1e-12 else (0., 1., 0.)
    return mesh
