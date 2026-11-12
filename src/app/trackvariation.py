"""The track's own CSP config include: imported models' double-sided materials. Ground needs none: its shader, images and
variation are the kn5 material's own (groundmaterial.classic)."""
from pathlib import Path
import re

FILE = "map2lap_ground.ini"
BEGIN, END = "; map2lap-ground:start", "; map2lap-ground:end"
MANAGED = re.compile(r"\n" + re.escape(BEGIN) + r"\r?\n.*?" + re.escape(END) + r"\r?\n", re.S)


def config(materials):
    """CSP replacements the ground needs: none. A [SHADER_REPLACEMENT] binding our embedded images by name (RESOURCE_TEXTURE)
    left them unbound in AC (black fuPBR ground, 2026-11-11); classic ground is ksMultilayer_objsp_nm4 itself, its normal maps
    in its slots and its tiling fix as kn5 values. Pure."""
    return ""


def model_config(materials):
    """CSP draws imported models' double-sided materials from both sides; their faces are written once, not twice. Without CSP
    their back faces stay unseen. Pure."""
    props = [{p[0]: p[1] for p in material.props} for material in materials]
    names = [m.name for m, values in zip(materials, props) if values.get("m2lModelMaterial") == 1 and values.get("m2lDoubleSided") == 1]
    from scenery import lamps
    light_names = [m.name for m, values in zip(materials, props) if values.get("m2lLamp") == 1]
    both = "\n".join(["[SHADER_REPLACEMENT_...]", "MATERIALS = " + ", ".join(names), "CULL_MODE = NONE"]) + "\n" if names else ""
    return both + lamps.config(light_names)


def write(folder, materials, extra=""):
    """Refresh only our config/include inside Save's staging folder, keeping unrelated track effects verbatim."""
    extension = Path(folder, "extension")
    main, owned = extension / "ext_config.ini", extension / FILE
    before = main.read_bytes().decode("utf-8-sig") if main.exists() else ""
    clean = MANAGED.sub("", before)
    content = "\n".join(part for part in (config(materials), model_config(materials)) if part) + extra
    if content:
        extension.mkdir(parents=True, exist_ok=True)
        owned.write_text(content, encoding="utf-8")
        clean += f"\n{BEGIN}\n[INCLUDE: {FILE}]\n{END}\n"
    elif owned.exists():
        owned.unlink()
    if clean != before:
        main.write_bytes(clean.encode("utf-8"))
