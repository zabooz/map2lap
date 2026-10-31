"""Our patches to BeamNG.Earth's driving surface (docs/BEAMNG_EARTH.md): each one's switch and the value that turns it
off (BeamNG.Earth's own behaviour), and all of them at once.

    BNE_OUR_PATCHES=off     every patch off (a build as BeamNG.Earth 1.7.2 makes it, with our own code around it)

apply_env() sets the switches; it runs before BeamNG.Earth's modules are imported (build_tiles), which read them at
import, and the worker processes inherit them. tools/patch_check.py builds a stretch with and without them.
"""
import os

# patch -> (environment variable, its value for "off")
PATCHES = {
    "P1": ("BNE_JUNCTION_YIELD", "off"),
    "P2": ("BNE_UNDERPASS_HUMP", "off"),
    "P3": ("BNE_LIDAR_HEADROOM", "0"),
    "P5": ("BNE_ABUT_FINE", "off"),
    "P6": ("BNE_TRIM_DZ", "0.3"),
    "P7": ("BNE_BANK_LIDAR", "off"),
    "P8": ("BNE_DECK_TANGENT", "off"),
    "P9": ("BNE_JUNCTION_PARALLEL", "off"),
    "P10": ("BNE_UNDER_DECK", "off"),
    "P11": ("BNE_LIDAR_UNDERPASS_COVER", "0"),
    "P12": ("BNE_PAD_JUNCTIONS_ONLY", "off"),
    "P13": ("BNE_TUNNEL_DECK_COVER", "off"),
}


def off_env(ids):
    """{variable: value} turning the patches ids off."""
    return {PATCHES[i][0]: PATCHES[i][1] for i in ids}


def apply_env(env=os.environ):
    """BNE_OUR_PATCHES=off: every patch's switch set to off in env (a switch set explicitly stays as it is)."""
    if env.get("BNE_OUR_PATCHES", "on") != "off":
        return
    for k, v in off_env(PATCHES).items():
        env.setdefault(k, v)
