"""Optional architectural-style metadata and an inactive registry for future facade profiles."""
from dataclasses import dataclass

from .facade import FacadePattern


@dataclass(frozen=True)
class ArchitectureProfile:
    """Implemented appearance rules for one architectural style; mapped dimensions/materials remain authoritative."""
    facade_pattern: FacadePattern | None = None


# No style is implemented yet. Missing and unknown styles retain the regional facade pattern.
PROFILES: dict[str, ArchitectureProfile] = {}


def architecture_values(attrs):
    """Ordered, distinct style names from a raw OSM tag or canonical architecture field. Pure."""
    for key in ('building:architecture', 'architecture'):
        value = attrs.get(key)
        values = (value,) if isinstance(value, str) else value if isinstance(value, tuple) else ()
        names = tuple(dict.fromkeys(name.strip().lower() for item in values if isinstance(item, str)
                                    for name in item.split(';') if name.strip()))
        if names:
            return names
    return ()


def architecture_pattern(names, regional_pattern):
    """First implemented style's facade pattern, otherwise the supplied regional pattern. Pure."""
    for name in names:
        profile = PROFILES.get(name)
        if profile is not None and profile.facade_pattern is not None:
            return profile.facade_pattern
    return regional_pattern
