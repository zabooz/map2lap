"""Render-region feasibility prototype over unrestricted semantic material weights; no edit data is rewritten."""
import functools
import numpy as np

PROFILE = 1


def _inputs(weights, capacity, min_side, filter_radius):
    """Validate material weights and partition settings without quantizing contributions. Pure."""
    if not weights or any(not isinstance(token, str) or not token for token in weights):
        raise ValueError("Material weights need non-empty material ids")
    if (type(capacity) is not int or capacity < 1 or type(min_side) is not int or min_side < 1
            or type(filter_radius) is not int or filter_radius < 0):
        raise ValueError("Invalid render-region settings")
    dimensions = None
    for values in weights.values():
        if (not isinstance(values, np.ndarray) or values.ndim != 2 or not values.size or not np.isfinite(values).all()
                or np.any(values < 0) or np.any(values > 1)):
            raise ValueError("Material weights must be finite two-dimensional arrays between zero and one")
        if dimensions is not None and values.shape != dimensions:
            raise ValueError("All material weights must use the same dimensions")
        dimensions = values.shape
    return dimensions


def plan(weights, capacity=3, min_side=16, filter_radius=1):
    """Partition semantic weights into local palettes, retaining and reporting every overflow. Pure.

    filter_radius is the conservative support of the intended texture filter in source pixels, including mip/anisotropic
    footprints. The implicit original ground uses its own slot. A dense leaf can exceed capacity: callers must choose
    another rendering strategy, never keep only its strongest materials. This prototype does not modify the live renderer.
    """
    height, width = _inputs(weights, capacity, min_side, filter_radius)
    regions, overflow = [], []

    @functools.lru_cache(maxsize=4096)
    def palette_at(support, candidates):
        sx0, sy0, sx1, sy1 = support
        return tuple(token for token in candidates if weights[token][sy0:sy1, sx0:sx1].any())

    def support_of(bounds):
        x0, y0, x1, y1 = bounds
        return [max(0, x0 - filter_radius), max(0, y0 - filter_radius),
                min(width, x1 + filter_radius), min(height, y1 + filter_radius)]

    def visit(bounds, candidates):
        x0, y0, x1, y1 = bounds
        support = support_of(bounds)
        palette = palette_at(tuple(support), candidates)
        children = []
        if len(palette) > capacity and (x1 - x0 > min_side or y1 - y0 > min_side):
            if x1 - x0 >= y1 - y0 and x1 - x0 > min_side:
                middle = (x0 + x1) // 2
                children = [[x0, y0, middle, y1], [middle, y0, x1, y1]]
            else:
                middle = (y0 + y1) // 2
                children = [[x0, y0, x1, middle], [x0, middle, x1, y1]]
        # A filter footprint covering the whole tile remains the same after splitting; avoid useless draw regions.
        if children and any(support_of(child) != support for child in children):
            for child in children:
                visit(child, palette)
            return
        if len(palette) > capacity:
            overflow.append(len(regions))
        regions.append({"bounds": bounds, "support": support, "palette": list(palette)})

    visit([0, 0, width, height], tuple(sorted(weights)))
    return {"profile": PROFILE, "dimensions": [width, height], "capacity": capacity, "min_side": min_side,
            "filter_radius": filter_radius, "regions": regions, "overflow": overflow,
            "required_capacity": max(len(region["palette"]) for region in regions)}
