"""CSP's per-layer tiling fix, with a portable native KN5 fallback and an owned track config include."""
from pathlib import Path
import re

from track import groundmaterial

FILE = "map2lap_ground.ini"
BEGIN, END = "; map2lap-ground:start", "; map2lap-ground:end"
MANAGED = re.compile(r"\n" + re.escape(BEGIN) + r"\r?\n.*?" + re.escape(END) + r"\r?\n", re.S)


def _flags(material):
    """The imported layers which vary; the original tile in A always stays fixed. Pure."""
    values = {p[0]: p[1] for p in material.props}
    return [int(values.get("m2lVariation" + channel, 0) == 1) for channel in "RGBA"]


def config(materials):
    """CSP replacements for marked generated ground materials; no mesh duplication or per-frame adjustments. Pure."""
    sections = []
    for material in materials:
        flags = _flags(material)
        regional = any(p[0]=='m2lGroundPass' and p[1]==3 for p in material.props)
        if material.shader != "ksMultilayer_objsp" or not (groundmaterial.is_ground(material.name) or regional) or not (any(flags) or regional):
            continue
        sections.append("\n".join([
            "[SHADER_REPLACEMENT_...]", "MATERIALS = " + material.name, "SHADER = ksMultilayer_objsp_nm4",
            "FILL_MISSING_TEXTURES = 1", "PROP_0 = multTilingFix, 1",
            *[f"PROP_{j + 1} = tilingFix{channel}, {flag}" for j, (channel, flag) in enumerate(zip("RGBA", flags))],
            *[line for j, channel in enumerate('RGBA') for slot, _index, texture in material.maps
              if regional and slot=='txNormal'+channel
              for line in (f'RESOURCE_{j}=txNormal{channel}',f'RESOURCE_TEXTURE_{j}={texture}')],
        ]))
    return "\n\n".join(sections) + "\n" if sections else ""


def write(folder, materials, extra=""):
    """Refresh only our config/include inside Save's staging folder, keeping unrelated track effects verbatim."""
    extension = Path(folder, "extension")
    main, owned = extension / "ext_config.ini", extension / FILE
    before = main.read_bytes().decode("utf-8-sig") if main.exists() else ""
    clean = MANAGED.sub("", before)
    content = config(materials) + extra
    if content:
        extension.mkdir(parents=True, exist_ok=True)
        owned.write_text(content, encoding="utf-8")
        clean += f"\n{BEGIN}\n[INCLUDE: {FILE}]\n{END}\n"
    elif owned.exists():
        owned.unlink()
    if clean != before:
        main.write_bytes(clean.encode("utf-8"))
