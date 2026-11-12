"""Street-lamp CSP lighting shared by generator lamps and placed library lamps."""


def config(materials, include=True):
    """Night illumination and emitting glass for material names; no per-lamp coordinates, so moving/deleting follows geometry. Pure."""
    if not materials:
        return ""
    names = ", ".join(materials)
    return ("[INCLUDE: common/conditions.ini]\n\n" if include else "") + f"""\
; Street lamps: one light per glass head. No shadow maps per lamp: affordable on long lit roads.
[LIGHT_SERIES_...]
DESCRIPTION = street lamps
MATERIALS = {names}
CLUSTER_THRESHOLD = 2
OFFSET = 0, -0.1, 0
DIRECTION = 0, -1, 0
COLOR = 1, 0.82, 0.6, 6
SPOT = 130
SPOT_SHARPNESS = 0.4
RANGE = 25
RANGE_GRADIENT_OFFSET = 0.5
FADE_AT = 400
FADE_SMOOTH = 50
SPECULAR_MULT = 1
SHADOWS = 0
CONDITION = NIGHT_SMOOTH

[MATERIAL_ADJUSTMENT_...]
DESCRIPTION = street lamp glass
MATERIALS = {names}
KEY_0 = ksEmissive
VALUE_0 = 1, 0.82, 0.6, 20
VALUE_0_OFF = 0, 0, 0
CONDITION = NIGHT_SMOOTH
"""
