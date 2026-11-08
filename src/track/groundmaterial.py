"""Shared AC ground materials: neutral detail slots and a colour-only two-layer blend."""
from dataclasses import replace
import functools
import io
import math
import re

from PIL import Image

WHITE = "map2lap_detail_white.png"
MASK = "map2lap_detail_base.png"
GROUND = re.compile(r"ground_-?\d+_-?\d+")


def is_ground(name):
    """Whether name is a generated tile's ground material (not water, distant terrain or a bridge). Pure."""
    return bool(GROUND.fullmatch(name))


def layered(material, mask=MASK, details=None, scales=None):
    """A new ksMultilayer material from an existing base, mask and optional RGBA detail images/world scales. Pure.

    The default mask selects one white detail, so base colours, UVs, alpha and lighting values are retained.
    No higher-resolution ground image or duplicated geometry is needed. AC samples details in world X/Z;
    a scale of .5 means one repeat per 2 m, independently of the base image's tile coordinates.
    """
    details, scales = details or {}, scales or {}
    if set(details) - set("RGBA") or set(scales) - set("RGBA"):
        raise ValueError("Ground details use the R, G, B and A mask channels")
    if any(not math.isfinite(v) or v <= 0 for v in scales.values()):
        raise ValueError("Ground detail scales must be positive and finite")
    props = list(material.props)
    for channel in "RGBA":
        scale = scales.get(channel, 1.)
        # Kunos' multA is float2, while multR/G/B are scalars. Fill the correct field of the KN5 property.
        props.append(("mult" + channel, scale, (scale, scale) if channel == "A" else (0., 0.),
                      (0., 0., 0.), (0., 0., 0., 0.)))
    props.append(("magicMult", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)))
    maps = [*material.maps, ("txMask", 1, mask)]
    maps.extend(("txDetail" + channel, i + 2, details.get(channel, WHITE)) for i, channel in enumerate("RGBA"))
    return replace(material, shader="ksMultilayer", props=props, maps=maps)


def dual_layer(material, detail, mask, repeat_m):
    """An opaque ground material blending a repeating colour with its existing tile. Pure.

    Kunos' dual-layer shader samples txDiffuse at UV * uvMult, and txLayer1/its red mask at the original UV.
    A white mask keeps the old tile; black selects the new colour. It is a colour-only material, without PBR maps.
    The repeat is measured against the generated 256 m tile; no vertices or source images need to change.
    """
    if type(repeat_m) not in (int, float) or not math.isfinite(repeat_m) or repeat_m <= 0:
        raise ValueError("The texture repeat must be positive and finite")
    if not is_ground(material.name) or material.blend or material.alpha_tested:
        raise ValueError("The colour blend requires opaque generated ground")
    base = next((name for slot, _index, name in material.maps if slot == "txDiffuse"), None)
    if not base:
        raise ValueError("The ground material has no base image")
    values = {"uvMult": 256. / repeat_m, "fresnelC": 0., "fresnelEXP": 1., "fresnelMaxLevel": 0., "isAdditive": 0.}
    unused = {*values, "multR", "multG", "multB", "multA", "magicMult"}
    props = [p for p in material.props if p[0] not in unused]
    props.extend((name, value, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for name, value in values.items())
    return replace(material, shader="ksPerPixel_dual_layer", props=props,
                   maps=[("txDiffuse", 0, detail), ("txLayer1", 1, base), ("txLayer1_Mask", 2, mask)])


def world_colour(material, detail, repeat_m):
    """A full opaque surface replacement sampled in world X/Z metres, independent of its existing UV stretch. Pure.

    A bridge's slab and its overlaid road strip use different UV scales. A white base and the shared red-only mask
    select the same world-repeating colour on both, retaining geometry, UVs, material indexes and light parameters.
    """
    if type(repeat_m) not in (int, float) or not math.isfinite(repeat_m) or repeat_m <= 0:
        raise ValueError("The texture repeat must be positive and finite")
    if material.blend or material.alpha_tested:
        raise ValueError("The world colour requires an opaque surface")
    base = replace(material, maps=[("txDiffuse", 0, WHITE)],
                   props=[p for p in material.props if p[0] not in {"multR", "multG", "multB", "multA", "magicMult"}])
    return layered(base, details={"R": detail}, scales={"R": 1. / repeat_m})


@functools.lru_cache(maxsize=1)
def textures():
    """The two shared 4px neutral texture payloads; generated once, with no disk or source-image reads."""
    result = []
    for name, colour in ((WHITE, (255, 255, 255, 255)), (MASK, (255, 0, 0, 0))):
        stream = io.BytesIO()
        Image.new("RGBA", (4, 4), colour).save(stream, "PNG")
        result.append((name, stream.getvalue()))
    return tuple(result)
