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
    return [int(values.get("m2lVariation" + channel, 0) == 1) for channel in "RGB"]


def config(materials):
    """CSP replacements for marked generated ground materials; no mesh duplication or per-frame adjustments. Pure."""
    sections = []
    for material in materials:
        flags = _flags(material)
        if material.shader != "ksMultilayer_objsp" or not groundmaterial.is_ground(material.name) or not any(flags):
            continue
        sections.append("\n".join([
            "[SHADER_REPLACEMENT_...]", "MATERIALS = " + material.name, "SHADER = ksMultilayer_objsp_nm4",
            "FILL_MISSING_TEXTURES = 1", "PROP_0 = multTilingFix, 1",
            *[f"PROP_{j + 1} = tilingFix{channel}, {flag}" for j, (channel, flag) in enumerate(zip("RGBA", [*flags, 0]))],
        ]))
    return "\n\n".join(sections) + "\n" if sections else ""


def write(folder, materials):
    """Refresh only our config/include inside Save's staging folder, keeping unrelated track effects verbatim."""
    extension = Path(folder, "extension")
    main, owned = extension / "ext_config.ini", extension / FILE
    before = main.read_bytes().decode("utf-8-sig") if main.exists() else ""
    clean = MANAGED.sub("", before)
    content = config(materials)
    if content:
        extension.mkdir(parents=True, exist_ok=True)
        owned.write_text(content, encoding="utf-8")
        clean += f"\n{BEGIN}\n[INCLUDE: {FILE}]\n{END}\n"
    elif owned.exists():
        owned.unlink()
    if clean != before:
        main.write_bytes(clean.encode("utf-8"))
