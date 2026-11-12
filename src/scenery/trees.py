"""Trees and bushes from BeamNG.Earth's vegetation.tile_items (positions, heights, kinds from Meta's tree height data), each as
the CSP TreeFX model of its look (placements, scenery/treefx.py). A look (SPRITES) is a kind of tree with its width over its
height; the larch only grows high in the mountains (LARCH_FROM_M). Rocks are left out here (rocks.py makes them 3D).

Species by region: BeamNG.Earth already turns its generic groups into regional ones (palm, tropical, pine_west,
oak_west, juniper, desert_shrub: vegetation.regional); the generic deciduous, conifer and shrub left over get the
trees of the tile's climate zone (zone(): Koppen-Geiger from BeamNG.Earth's climate map).
"""
import numpy as np

import climate
import vegetation
from scenery import treefx

# the looks a tree can have, each one a TreeFX model (treefx.MODEL_OF)
SPRITES = ("deciduous", "deciduous2", "conifer", "conifer2", "shrub", "birch", "linden", "spruce", "larch",
           "shrub_flowers", "pine", "stone_pine", "cypress", "olive", "acacia", "baobab", "palm", "tropical",
           "dry_shrub", "juniper", "jungle_bush")
# group -> ((look, width/height), ...): each tree gets one of them (by its random value; a look named twice is twice as
# common). STYLE everywhere, ZONE_STYLE's groups replace it in their climate zone.
STYLE = {"deciduous": (("deciduous", 0.75), ("deciduous2", 0.75), ("birch", 0.55), ("linden", 0.85)),
         "conifer": (("conifer", 0.42), ("conifer2", 0.42), ("spruce", 0.32)),
         "pine_west": (("pine", 0.45), ("pine", 0.45), ("conifer", 0.45)),
         "oak_west": (("linden", 0.9), ("olive", 0.9)),
         "juniper": (("juniper", 0.7),),
         "palm": (("palm", 0.7),),
         "tropical": (("tropical", 0.85),),
         "shrub": (("shrub", 1.3), ("shrub_flowers", 1.2)),
         "desert_shrub": (("dry_shrub", 1.3),)}
ZONE_STYLE = {
    "boreal": {"deciduous": (("birch", 0.55), ("birch", 0.55), ("deciduous", 0.75)),
               "conifer": (("spruce", 0.32), ("spruce", 0.32), ("pine", 0.4), ("conifer2", 0.42))},
    "mediterranean": {"deciduous": (("olive", 0.9), ("olive", 0.9), ("linden", 0.85), ("deciduous", 0.75)),
                      "conifer": (("stone_pine", 1.0), ("cypress", 0.22), ("pine", 0.45)),
                      "shrub": (("dry_shrub", 1.3), ("shrub", 1.3))},
    "savanna": {"deciduous": (("acacia", 1.3),) * 5 + (("deciduous", 0.75),) * 2 + (("baobab", 0.85),),
                "tropical": (("tropical", 0.85), ("acacia", 1.3)),
                "shrub": (("dry_shrub", 1.3), ("dry_shrub", 1.3), ("shrub", 1.3))},
    "rainforest": {"deciduous": (("tropical", 0.85), ("tropical", 0.85), ("deciduous", 0.75)),
                   "shrub": (("jungle_bush", 1.2), ("jungle_bush", 1.2), ("shrub", 1.3))},
    "desert": {"deciduous": (("acacia", 1.3), ("acacia", 1.3), ("olive", 0.9)),
               "conifer": (("juniper", 0.7),),
               "shrub": (("dry_shrub", 1.3),)}}
LARCH = (("larch", 0.4),)
LARCH_FROM_M = 1500.0       # m altitude (anchor frame): above it every third conifer is a larch
SKIP = {"rock", "desert_rock"}
SINK_M = 0.2                # foot slightly into the ground (slopes)
TRUNK_CLEAR_M = 0.5         # m a trunk (a bush's or a rock's foot) keeps from a building's walls; a crown may reach
                            # over the roof, as a garden tree's does


def zone(lat, lon):
    """The tile's climate zone for the species (Koppen-Geiger class, climate.koppen_at): rainforest (Af, Am), savanna
    (Aw, BSh), desert (BWh, BWk), mediterranean (Csa, Csb outside North America, where BeamNG.Earth's own western
    species stand), boreal (D and E north of 55 degrees: Scandinavia, Finland, Russia, Canada; the Alps' Dfc and ET
    stay temperate), else temperate."""
    k = climate.koppen_at(lat, lon)
    if k in (1, 2):
        return "rainforest"
    if k in (3, 6):
        return "savanna"
    if k in (4, 5):
        return "desert"
    if k in (8, 9) and not (lat > 24.0 and -170.0 < lon < -50.0):
        return "mediterranean"
    if k >= 17 and abs(lat) > 55.0:
        return "boreal"
    return "temperate"


def tile_items(frame, tx, ty, veg, elev):
    """Trees, bushes and rocks of the tile: (group name, x, y, z, rotation, height or size, random value) in ENU."""
    rows = vegetation.tile_items(frame, tx, ty, veg, lambda k: True, elev) or []
    return [(vegetation.GROUPS[int(g)], x, y, z, yaw, height, rank) for g, x, y, z, yaw, _s, height, rank in rows]


def clear_of_buildings(items, rings, clear=TRUNK_CLEAR_M):
    """The items (group, x, y, ...) whose foot stands outside every ring (the buildings as drawn: road tiles'
    "footprints", the anchor frame) and clear m from its walls at least. The vegetation keeps its trees off the map's
    footprints; a pitched roof's house is drawn on its oriented box, and an L-shaped house's box has room for a tree
    of its garden. Pure."""
    if not items or not rings:
        return list(items or ())
    p = np.array([(float(t[1]), float(t[2])) for t in items])
    bad = np.zeros(len(p), bool)
    for r in rings:
        r = np.asarray(r, np.float64).reshape(-1, 2)
        lo, hi = r.min(0) - clear, r.max(0) + clear
        near = np.flatnonzero(((p >= lo) & (p <= hi)).all(1) & ~bad)
        if not len(near) or len(r) < 3:
            continue
        q = p[near]
        a, b = r, np.roll(r, -1, 0)
        d = b - a
        t = np.clip(((q[:, None, :] - a[None]) * d[None]).sum(2) / np.maximum((d * d).sum(1), 1e-12)[None], 0, 1)
        dist = np.hypot(*(a[None] + t[..., None] * d[None] - q[:, None, :]).transpose(2, 0, 1)).min(1)
        cross = ((a[None, :, 1] > q[:, None, 1]) != (b[None, :, 1] > q[:, None, 1])) & (
            q[:, None, 0] < a[None, :, 0] + (q[:, None, 1] - a[None, :, 1]) * d[None, :, 0]
            / np.where(d[None, :, 1] == 0, 1e-12, d[None, :, 1]))
        bad[near] = (cross.sum(1) % 2 == 1) | (dist < clear)
    return [t for t, b in zip(items, bad) if not b]


def tile_zone(frame, items):
    """The climate zone (zone()) at the first of the tile's items (ENU), temperate without any."""
    if not items:
        return "temperate"
    lat, lon, _ = frame.enu_to_geodetic(float(items[0][1]), float(items[0][2]))
    return zone(float(lat), float(lon))


def look_of(style, name, zone, z, rank):
    """(sprite, width / height) of an item of group name at altitude z: one of style's (STYLE with its zone's, by the item's random
    value; every third conifer high up in temperate and boreal zones a larch). Pure."""
    looks = style.get(name, style["deciduous"])
    if name == "conifer" and zone in ("temperate", "boreal") and z > LARCH_FROM_M and int(rank * 7919) % 3 == 0:
        looks = LARCH
    return looks[int(rank * 1000) % len(looks)]


def placements(items, wet=None, zone="temperate"):
    """The TreeFX trees (treefx.placement) of (group name, x, y, z, rotation, height, random value) in ENU: each item stands as
    its look's model (look_of, treefx.model_of) at its foot, as high and as wide as its look; in water (wet(x, y)) it stands
    nowhere. Rocks are none (rocks.py makes them). Pure."""
    style, placed = {**STYLE, **ZONE_STYLE.get(zone, {})}, []
    for name, x, y, z, yaw, height, rank in items:
        if name in SKIP or (wet is not None and wet(x, y)):
            continue
        sprite, ratio = look_of(style, name, zone, z, rank)
        placed.append(treefx.placement(treefx.model_of(sprite), (x, z - SINK_M, -y), yaw, max(0.8, float(height)), ratio))
    return placed


