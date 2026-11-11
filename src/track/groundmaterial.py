"""Shared AC ground materials: stock CSP PBR ground, neutral detail slots and a colour-only two-layer blend."""
from dataclasses import replace
import functools
import io
import math
import re

from PIL import Image

WHITE = "map2lap_detail_white.png"
MASK = "map2lap_detail_base.png"
GROUND = re.compile(r"ground_-?\d+_-?\d+")
# The share of a ground tile texture's edge that is its guard ring (scenery/ground.py, GUARD_PX of TEX_PX).
UV_GUARD = 32 / 2048
# The share of a tile texture one tile covers (scenery/ground.phased): the texture repeats every 256 m / UV_SCALE and lies
# at the world's phase, so a mesh's UV is its world position in tiles times UV_SCALE (u east, kn5 v south), and fuPBR's
# layers, sampled at world X/Z times a multiplier, show the same texture at UV_SCALE / 256 (tracknative: a Save's tile
# image). Ground materials carry it as m2lUVScale with m2lUVGlobal; tracks built before (m2lUVGuard) are built again.
UV_SCALE = 1 - 2 * UV_GUARD
PBR = "fuPBR_multilayer"
# How a saved track holds its PBR ground; a track's recipe keeps the one it was saved with, an older one makes its paints
# need a Save (trackedits._needs_material_save). 2: the shader itself in the kn5 (pbr); 1: a CSP replacement, black in AC.
PBR_FORMAT = 2
# Its texture registers t0..t10 as CSP's compiled shader declares them: a kn5 material names its images by these slots
# and numbers, and AC loads them with the material. Bound instead by a [SHADER_REPLACEMENT] over another shader
# (RESOURCE_TEXTURE or RESOURCE_REF), they stayed unbound in AC: black, mirroring ground (Heiligenblut, 2026-11-11).
PBR_SLOTS = ("txDiffuse", "txMask", *(f"txDetail{c}{kind}" for c in "RGBA" for kind in ("AlbedoAO", "NmMeRo")), "txNormal2")
# Matte natural ground: the roughness the Editor and Save already give a tile's own image, so generated and painted
# ground shine alike.
GROUND_ROUGHNESS = 221 / 255
FLAT_DATA = "map2lap_detail_flat_rough.png"        # (normal/metal/roughness: flat, no metal, GROUND_ROUGHNESS)
FLAT_NORMAL = "map2lap_detail_flat_normal.png"     # (txNormal2, the shader's second normal map: flat)


def is_ground(name):
    """Whether name is a generated tile's ground material (not water, distant terrain or a bridge). Pure."""
    return bool(GROUND.fullmatch(name))


def uv_props(scale=UV_SCALE):
    """The kn5 properties marking a ground material's UVs as world tiles times scale (UV_SCALE). Pure."""
    return [("m2lUVGlobal", 1., (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)), ("m2lUVScale", scale, (0., 0.), (0., 0., 0.), (0., 0., 0., 0.))]


def pbr(material, diffuse, mask, layers, normal2=FLAT_NORMAL):
    """material as fuPBR_multilayer itself, its images in the shader's slots (PBR_SLOTS). Pure.

    The shader multiplies diffuse (at the mesh UV) by the layers mixed by mask (at the mesh UV). layers: {channel:
    (albedo/AO image, normal/metal/roughness image, multiplier)}; a layer repeats every 1 / multiplier m in world X/Z.
    A missing channel gets white with flat data. Without pbrFlags: kn5 properties are floats, the shader reads a uint,
    and with them 0 it uses no flag (its material AO, bit 8, stays off).
    """
    if set(layers) - set("RGBA"):
        raise ValueError("Ground layers use the R, G, B and A mask channels")
    if any(not math.isfinite(m) or m <= 0 for _a, _d, m in layers.values()):
        raise ValueError("Ground layer multipliers must be positive and finite")
    images = {"txDiffuse": diffuse, "txMask": mask, "txNormal2": normal2}
    for channel in "RGBA":
        albedo, data, _m = layers.get(channel, (WHITE, FLAT_DATA, 1.))
        images |= {f"txDetail{channel}AlbedoAO": albedo, f"txDetail{channel}NmMeRo": data}
    values = {**{"mult" + c: layers.get(c, (0, 0, 1.))[2] for c in "RGBA"},
              "pbrF0": .04, "pbrBlurCubemap": 0., "detailNMMult": 1., "magicMult": 1., "ksAlphaRef": 0.}
    vectors = {"pbrAlbedoGain": (1., 1., 1.), "ksEmissive": (0., 0., 0.)}
    props = [p for p in material.props if p[0] not in {*values, *vectors, "pbrFlags"}]
    props += [(name, float(value), (0., 0.), (0., 0., 0.), (0., 0., 0., 0.)) for name, value in values.items()]
    props += [(name, 0., (0., 0.), value, (0., 0., 0., 0.)) for name, value in vectors.items()]
    return replace(material, shader=PBR, props=props, maps=[(slot, i, images[slot]) for i, slot in enumerate(PBR_SLOTS)])


def ground(material):
    """A generated tile's ground as PBR: its baked image in txDiffuse, the red mask choosing one white layer with
    flat data, so its colours stay as baked. Pure."""
    base = next((name for slot, _index, name in material.maps if slot == "txDiffuse"), None)
    if not base:
        raise ValueError("The ground material has no base image")
    return pbr(material, base, MASK, {"R": (WHITE, FLAT_DATA, 1.)})


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
    """The shared 4px neutral texture payloads; generated once, with no disk or source-image reads. Flat data's X is 127:
    fuPBR's tangent X has the opposite sign (tracknative._photo_normals)."""
    result = []
    for name, colour in ((WHITE, (255, 255, 255, 255)), (MASK, (255, 0, 0, 0)),
                         (FLAT_DATA, (127, 128, 0, round(GROUND_ROUGHNESS * 255))), (FLAT_NORMAL, (128, 128, 255, 255))):
        stream = io.BytesIO()
        Image.new("RGBA", (4, 4), colour).save(stream, "PNG")
        result.append((name, stream.getvalue()))
    return tuple(result)
