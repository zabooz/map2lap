"""Shared AC ground materials: CSP's classic multilayer ground, neutral detail slots and a colour-only two-layer blend."""
from dataclasses import replace
import functools
import io
import math
import re

from PIL import Image

WHITE = "map2lap_detail_white.png"
MASK = "map2lap_detail_base.png"
FLAT_NORMAL = "map2lap_detail_flat_normal.png"     # (a flat tangent-space normal map: a layer without bumps)
GROUND = re.compile(r"ground_-?\d+_-?\d+")
# The share of a ground tile texture's edge that is its guard ring (scenery/ground.py, GUARD_PX of TEX_PX).
UV_GUARD = 32 / 2048
# The share of a tile texture one tile covers (scenery/ground.phased): the texture repeats every 256 m / UV_SCALE and lies
# at the world's phase, so a mesh's UV is its world position in tiles times UV_SCALE (u east, kn5 v south). A painted Save
# samples that texture itself as one more layer at UV_SCALE a tile, no copy of it (tracknative: a Save's tile image).
# Ground materials carry it as m2lUVScale with m2lUVGlobal; tracks built before (m2lUVGuard) are built again.
UV_SCALE = 1 - 2 * UV_GUARD
NM4 = "ksMultilayer_objsp_nm4"
# How a saved track holds its ground; a track's recipe keeps the one it was saved with, an older one makes its paints need a
# Save (trackedits._needs_material_save). 3: classic nm4 itself in the kn5 (classic); 2: fuPBR itself; 1: fuPBR as a CSP
# replacement, black in AC.
GROUND_FORMAT = 3
# Its texture registers t0..t9 as CSP's compiled shader declares them: a kn5 material names its images by these slots and
# numbers, and AC loads them with the material, normal maps included (stausee_nm4_direkt, 2026-11-11). Bound instead by a
# [SHADER_REPLACEMENT] (RESOURCE_TEXTURE or RESOURCE_REF), embedded images stayed unbound in AC (fuPBR: black, mirroring).
NM4_SLOTS = ("txDiffuse", "txMask", *(f"txDetail{c}" for c in "RGBA"), *(f"txNormal{c}" for c in "RGBA"))
# CSP's variation noise is sampled at world X/Z times multTilingFix / 20 m, the same on every tile and region, so the
# patches of a varied layer meet across their borders. Its two candidate offsets are in the layer's repeats.
TILING_FIX = 1.
# The values classic writes; a material keeps all its others (ksAmbient, ksDiffuse, ksSpecular, ksSpecularEXP, ...).
_CLASSIC = {"multTilingFix", "magicMult", *(f"{name}{c}" for name in ("mult", "tilingFix", "m2lVariation") for c in "RGBA")}


def is_ground(name):
    """Whether name is a generated tile's ground material (not water, distant terrain or a bridge). Pure."""
    return bool(GROUND.fullmatch(name))


def uv_props(scale=UV_SCALE):
    """The kn5 properties marking a ground material's UVs as world tiles times scale (UV_SCALE). Pure."""
    return [("m2lUVGlobal", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)), ("m2lUVScale", scale, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]


def classic(material, diffuse, mask, layers):
    """material as ksMultilayer_objsp_nm4 itself, its images in the shader's slots (NM4_SLOTS). Pure.

    The shader samples diffuse, mask and each layer at the mesh UV, a layer times its float2 multiplier, and multiplies
    diffuse by the layers mixed by mask; its gloss is ksSpecular times the mixed alpha (one ksSpecularEXP for all). layers:
    {channel: (colour image, normal image or None for flat, (u, v) multiplier, varies)}; a missing channel is white and
    flat. A varying layer is broken up by CSP's tiling fix (tilingFix*, as kn5 floats), its normals with the same offsets.
    """
    if set(layers) - set("RGBA"):
        raise ValueError("Ground layers use the R, G, B and A mask channels")
    if any(len(m) != 2 or not all(math.isfinite(v) and v > 0 for v in m) for _c, _n, m, _v in layers.values()):
        raise ValueError("Ground layer multipliers must be positive and finite")
    maps = {"txDiffuse": diffuse, "txMask": mask}
    props = [p for p in material.props if p[0] not in _CLASSIC]
    for channel in "RGBA":
        colour, normal, mult, varies = layers.get(channel, (WHITE, None, (1., 1.), False))
        maps |= {"txDetail" + channel: colour, "txNormal" + channel: normal or FLAT_NORMAL}
        # (nm4's multipliers are float2, read from the kn5 property's second field; the first keeps u for older readers)
        props += [("mult" + channel, float(mult[0]), tuple(map(float, mult)), (0., 0., 0.), (0., 0., 0., 0.)),
                  *((name + channel, float(bool(varies)), (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for name in ("tilingFix", "m2lVariation"))]
    props += [("magicMult", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)), ("multTilingFix", TILING_FIX, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]
    return replace(material, shader=NM4, props=props, maps=[(slot, i, maps[slot]) for i, slot in enumerate(NM4_SLOTS)])


def ground(material):
    """A generated tile's ground as classic nm4: its baked image in txDiffuse, the red mask choosing one white, flat layer,
    so its colours, gloss and light stay as baked. Pure."""
    base = next((name for slot, _index, name in material.maps if slot == "txDiffuse"), None)
    if not base:
        raise ValueError("The ground material has no base image")
    return classic(material, base, MASK, {"R": (WHITE, None, (1., 1.), False)})


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
    A white mask keeps the old tile; black selects the new colour. It is a colour-only material, without normal maps.
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
    """The shared 4px neutral texture payloads; generated once, with no disk or source-image reads."""
    result = []
    for name, colour in ((WHITE, (255, 255, 255, 255)), (MASK, (255, 0, 0, 0)), (FLAT_NORMAL, (128, 128, 255, 255))):
        stream = io.BytesIO()
        Image.new("RGBA", (4, 4), colour).save(stream, "PNG")
        result.append((name, stream.getvalue()))
    return tuple(result)
