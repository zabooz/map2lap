"""Create the AC track folder: surfaces, CSP config, minimap, UI (everything except the .kn5, see obj_to_kn5).

    python -m track.make_track_folder <name> "<display name>"
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw

from app import settings, version
from app.paths import ROOT
from track import parallel

AC = settings.ac_path()         # (generator page: Settings; else found through Steam)
OBJ = os.path.join(ROOT, "out", "obj", "track.obj")

SURFACES = """\
[SURFACE_0]
KEY=ROAD
FRICTION=0.98
DAMPING=0
WAV=
WAV_PITCH=0
FF_EFFECT=NULL
DIRT_ADDITIVE=0
IS_VALID_TRACK=1
BLACK_FLAG_TIME=0
SIN_HEIGHT=0
SIN_LENGTH=0
IS_PITLANE=0
VIBRATION_GAIN=0
VIBRATION_LENGTH=0

[SURFACE_1]
KEY=GRASS
FRICTION=0.60
DAMPING=0.1
WAV=grass.wav
WAV_PITCH=0
FF_EFFECT=0
DIRT_ADDITIVE=1
IS_VALID_TRACK=1
BLACK_FLAG_TIME=0
SIN_HEIGHT=0.03
SIN_LENGTH=0.5
IS_PITLANE=0
VIBRATION_GAIN=0.3
VIBRATION_LENGTH=0.5

[SURFACE_2]
KEY=KERB
FRICTION=0.92
DAMPING=0
WAV=kerb.wav
WAV_PITCH=1.0
FF_EFFECT=1
DIRT_ADDITIVE=0
IS_VALID_TRACK=1
BLACK_FLAG_TIME=0
SIN_HEIGHT=0
SIN_LENGTH=0
IS_PITLANE=0
VIBRATION_GAIN=0
VIBRATION_LENGTH=0

[SURFACE_3]
KEY=GRAVEL
FRICTION=0.75
DAMPING=0.02
WAV=grass.wav
WAV_PITCH=0
FF_EFFECT=0
DIRT_ADDITIVE=1
IS_VALID_TRACK=1
BLACK_FLAG_TIME=0
SIN_HEIGHT=0.01
SIN_LENGTH=0.4
IS_PITLANE=0
VIBRATION_GAIN=0.2
VIBRATION_LENGTH=0.3
"""
# No KEY=WALL: AC treats meshes "<digit>WALL..." as collision walls (Kunos' Magione: 07WALL006 etc., WALL is not in
# surfaces.ini). Defined as a surface, WALL turned into drivable ground and cars drove through houses.


# CSP track config. No [Material_Water]: CSP's realistic water shader would cover the comic water (which matches the
# trees, on purpose). For realistic water again: [Material_Water] Materials = water, Type = LAKE
EXT_CONFIG = """\
[INCLUDE: common/materials_track.ini]

; animated comic water: Lua redraws the texture every frame (like Shuto's billboards)
[SCRIPTABLE_DISPLAY_...]
MESHES = nocol_water_?
KEEP_BACKGROUND = 0
INTERACTIVE = 0
SCRIPT = water_anim.lua

[SCRIPTABLE_DISPLAY_...]
MESHES = nocol_foam_?
KEEP_BACKGROUND = 0
INTERACTIVE = 0
SCRIPT = foam_anim.lua
"""


def read_obj(obj=OBJ):
    """(vertices in AC coordinates (x, y up, z), {surface prefix: triangles})."""
    V, faces, cur = [], {}, None
    with open(obj, encoding="utf-8") as f:
        for line in f:
            if line.startswith("v "):
                V.append(tuple(map(float, line.split()[1:4])))
            elif line.startswith("o "):
                cur = line.split()[1].split("_")[0]
                faces.setdefault(cur, [])
            elif line.startswith("f "):
                faces[cur].append([int(p.split("/")[0]) for p in line.split()[1:4]])
                faces[cur][-1] = [k - 1 if k > 0 else len(V) + k for k in faces[cur][-1]]  # (negative: relative)
    return np.array(V), faces


def main():
    make(sys.argv[1], sys.argv[2])


ROUTE_RGBA = (255, 140, 0, 255)         # route on the minimap
ROUTE_W, MARK_R = 7, 9
MAP_MAX_PX = 4000                       # minimap at most this big (else > 20000 px on long routes)


def _road_mask(part, view):
    """Road and gravel of a tile part file as a small greyscale image (worker process); view (x0, z0, scale, margin)
    like the minimap; returns (x, y, size, bytes) or None. Reads only the vertices of the road objects (indices
    relative to the object, make_obj.Obj)."""
    x0, z0, scale, margin = view
    tris, V, road = [], [], False
    with open(part, encoding="utf-8") as f:
        for line in f:
            c = line[0]
            if c == "o":
                road, V = line[2:].startswith(("1ROAD", "1GRAVEL")), []
            elif not road:
                continue
            elif line.startswith("v "):
                x, _, z = line.split()[1:4]
                V.append(((float(x) - x0) / scale + margin, (float(z) - z0) / scale + margin))
            elif c == "f":
                tris.append([V[len(V) + int(p.split("/")[0])] for p in line.split()[1:4]])
    if not tris:
        return None
    a = np.asarray(tris)
    lo, hi = np.floor(a.reshape(-1, 2).min(0)).astype(int), np.ceil(a.reshape(-1, 2).max(0)).astype(int) + 1
    im = Image.new("L", tuple((hi - lo).tolist()), 0)
    d = ImageDraw.Draw(im)
    for t in a - lo:
        d.polygon([tuple(p) for p in t], fill=255)
    return int(lo[0]), int(lo[1]), im.size, im.tobytes()


def make(name, title, obj=OBJ, preview=os.path.join(ROOT, "out", "check_top.png"), city="", country="", geotags=None,
         extra_description="", route=None, log=print, parts=None, bounds=None, point_to_point=False):
    """route: the generator's ENU polyline [(east, north), ...]: highlighted on the minimap.
    point_to_point: with start and finish lines from A to B (ui_track.json "run", like rally and hill climb tracks).
    city, country, geotags (lat, lon): shown by Content Manager, which also takes sun and time zone from geotags.
    parts/bounds: make_obj's tile part files and the extent (x0, z0, x1, z1) in AC coordinates: the minimap is then
    drawn from the parts' roads in several processes instead of from the whole OBJ."""
    root = os.path.join(AC, "content", "tracks", name)
    for d in ("data", "ui"):
        os.makedirs(os.path.join(root, d), exist_ok=True)
    with open(os.path.join(root, "data", "surfaces.ini"), "w", encoding="utf-8") as f:
        f.write(SURFACES)
    os.makedirs(os.path.join(root, "extension"), exist_ok=True)
    with open(os.path.join(root, "extension", "ext_config.ini"), "w", encoding="utf-8") as f:
        f.write(EXT_CONFIG)
    tex_dir = os.path.join(os.path.dirname(obj), "textures")
    if os.path.exists(os.path.join(tex_dir, "water_waves.png")):
        from scenery import water                            # (only here: needs BeamNG.Earth's path from build_tiles)
        water.write_anim(os.path.join(root, "extension"), tex_dir)

    if parts:                       # generator: tile part files, extent from the tiles (fast, little RAM)
        x0, z0, x1, z1 = bounds
    else:                           # (old way: read the whole OBJ; 43 GB of RAM and half an hour on 300 km)
        V, faces = read_obj(obj)
        x0, z0, x1, z1 = V[:, 0].min(), V[:, 2].min(), V[:, 0].max(), V[:, 2].max()
    extent = max(x1 - x0, z1 - z0)
    margin, scale = 20, max(1.0, extent / MAP_MAX_PX)  # 1 pixel per metre, coarser on long routes
    w = int((x1 - x0) / scale) + 2 * margin
    h = int((z1 - z0) / scale) + 2 * margin
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if parts:
        mask = Image.new("L", (w, h), 0)
        n = parallel.workers(len(parts))
        with parallel.pool(n) as ex:
            for r in ex.map(_road_mask, parts, [(x0, z0, scale, margin)] * len(parts),
                            chunksize=max(1, len(parts) // (4 * n))):
                if r is not None:
                    ox, oy, size, data = r
                    mask.paste(255, (ox, oy), Image.frombytes("L", size, data))
        img.paste((255, 255, 255, 255), mask=mask)
    else:
        for key in ("1ROAD", "1GRAVEL"):
            for t in faces.get(key, []):
                d.polygon([((V[i, 0] - x0) / scale + margin, (V[i, 2] - z0) / scale + margin) for i in t],
                          fill=(255, 255, 255, 255))
    if route is not None and len(route) > 1:    # ENU -> AC (x, z = -north) -> pixels like the roads
        px = [((e - x0) / scale + margin, (-n - z0) / scale + margin) for e, n in route]
        d.line(px, fill=ROUTE_RGBA, width=ROUTE_W, joint="curve")
        for (x, y), col in ((px[0], (40, 200, 60, 255)), (px[-1], (220, 40, 40, 255))):
            d.ellipse([x - MARK_R, y - MARK_R, x + MARK_R, y + MARK_R], fill=col, outline=(0, 0, 0, 255), width=2)
    img.save(os.path.join(root, "map.png"))
    with open(os.path.join(root, "data", "map.ini"), "w", encoding="utf-8") as f:
        f.write(f"[PARAMETERS]\nWIDTH={w}\nHEIGHT={h}\nMARGIN={margin}\nSCALE_FACTOR={scale}\n"
                f"X_OFFSET={-x0 + margin * scale:.3f}\nZ_OFFSET={-z0 + margin * scale:.3f}\nDRAWING_SIZE=10\nMAX_SIZE=1000\n")
    img.resize((max(1, w * 365 // max(w, h)), max(1, h * 365 // max(w, h)))).save(os.path.join(root, "ui", "outline.png"))
    if preview and os.path.exists(preview):
        Image.open(preview).convert("RGB").resize((355, 200)).save(os.path.join(root, "ui", "preview.png"))
    else:                                       # (preview from the minimap: roads white on dark)
        bg = Image.new("RGB", img.size, (40, 44, 40))
        bg.paste(img, mask=img.split()[3])
        bg.thumbnail((355, 200))
        bg.save(os.path.join(root, "ui", "preview.png"))
    ui = {"name": title, "description": ("Generated by Map2Lap (BeamNG.Earth) from open data. " + extra_description +
          " Map data © OpenStreetMap contributors, Overture Maps Foundation; elevation: Mapterhorn; land cover: "
          "© ESA WorldCover project 2021; tree heights: Meta and WRI."),
          "tags": ["map2lap", "point to point" if point_to_point else "freeroam"],
          "geotags": [f"{geotags[0]:.5f}", f"{geotags[1]:.5f}"] if geotags else [], "country": country, "city": city,
          "length": "0", "width": "", "pitboxes": "4", "run": "point-to-point" if point_to_point else "free",
          "author": "Map2Lap",
          "version": version.VERSION}         # (Content Manager shows it)
    with open(os.path.join(root, "ui", "ui_track.json"), "w", encoding="utf-8") as f:
        json.dump(ui, f, ensure_ascii=False, indent=2)
    log(f"Track folder: {root}")
    return root


if __name__ == "__main__":
    main()
