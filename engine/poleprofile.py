"""Shared model attachment dimensions: mast meshes and cable layouts meet at the same points."""

POLE_HEIGHT = 9.2
POLE_OFFSETS = (-.8, 0., .8)
CROSSARM_DROP, CROSSARM_THICKNESS = .6, .12
POLE_INSULATOR = .24
PYLON_LEVELS = (15.65, 20.40, 25.19)
PYLON_REACH, PYLON_INSULATOR = 4.12, .6


def pole_attachments(height=POLE_HEIGHT):
    """(lateral offset, insulator base height, cable height) above a wooden pole's foot. Pure."""
    # The middle conductor sits on the pole head; putting it at the cross-arm's level runs it through wood.
    return tuple((off, base, base + POLE_INSULATOR)
                 for off in POLE_OFFSETS
                 for base in (height if off == 0 else height - CROSSARM_DROP + CROSSARM_THICKNESS,))
