"""Build a synthetic, labelled building gallery for fast roof and surface comparisons in the Editor and AC."""
import argparse
import json
import math
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / "engine"), str(ROOT / "src")]
NAME = "map2lap_building_gallery"
TITLE = "House"


def cases():
    """Labelled inputs for all roof shapes and orientation, height and footprint comparisons. Pure."""
    result = []

    def add(title, shape="gabled", footprint="rectangle", **attrs):
        result.append({"title": title, "footprint": footprint,
                       "attrs": {"class": "house", "height": 10., "num_floors": 2, "roof_shape": shape,
                                 "roof_height": 3., "facade_material": "plaster", "facade_color": "#d6c5a4",
                                 "roof_material": "tile", **attrs}})

    for shape in ("flat", "gabled", "hipped"):
        add(shape.upper(), shape)
    add("GABLED / ACROSS", roof_orientation="across")
    add("GABLED / ALONG", roof_orientation="along")
    add("RIDGE / NORTH", roof_direction=0.)
    add("RIDGE / EAST", roof_direction=90.)
    add("RIDGE / 45 DEGREES", roof_direction=45.)
    for height in (1., 3., 5.):
        add(f"ROOF RISE / {height:g} M", roof_height=height)
    add("HIPPED / ACROSS", "hipped", roof_orientation="across")
    for footprint in ("square", "long", "rotated", "L", "T"):
        add(f"FOOTPRINT / {footprint}", "flat" if footprint in ("L", "T") else "gabled", footprint)
    for shape in ("skillion", "pyramidal", "half_hipped", "mansard", "gambrel", "dome", "onion", "round",
                  "saltbox", "sawtooth", "spherical"):
        title = {"skillion": "SKILLION / PULTDACH", "pyramidal": "PYRAMIDAL / ZELTDACH",
                 "half_hipped": "HALF-HIPPED / KRUEPPELWALM", "mansard": "MANSARD / MANSARDDACH",
                 "gambrel": "GAMBREL / KNICK-SATTELDACH", "saltbox": "SALTBOX / ASYMMETRIC",
                 "round": "ROUND / TONNENDACH", "sawtooth": "SAWTOOTH / SHEDDACH",
                 "dome": "DOME / KUPPELDACH", "onion": "ONION / ZWIEBELDACH",
                 "spherical": "SPHERICAL / KUGELDACH"}.get(shape, shape.upper())
        if shape in ("onion", "spherical"):
            # A 6 m square tower makes the silhouette legible. The sphere's cap spans -60 to +90 degrees.
            rise = 6. if shape == "onion" else 3. * (1 + math.sqrt(3.) / 2)
            add(title, shape, "tower", height=9. + rise, roof_height=rise, num_floors=3)
        else:
            add(title, shape)
    for bearing in (0., 180., 45.):
        add(f"SKILLION / DOWN {bearing:g} DEG", "skillion", roof_direction=bearing)
    add("PYRAMIDAL / SQUARE", "pyramidal", "square")
    for material in ("brick", "cement_block", "clay", "concrete", "glass", "metal", "plaster", "plastic",
                     "stone", "timber_framing", "wood"):
        add("FACADE / " + material.upper(), facade_material=material, facade_color=None)
    for material in ("concrete", "copper", "eternit", "glass", "grass", "gravel", "metal", "plastic", "roof_tiles",
                     "slate", "solar_panels", "tar_paper", "thatch", "wood"):
        shape = "flat" if material in ("concrete", "grass", "gravel", "tar_paper") else "gabled"
        add("ROOF / " + material.upper(), shape, roof_material=material,
            height=7. if shape == "flat" else 10., roof_height=0. if shape == "flat" else 3.)
    add("PARTS / STONE + GLASS", "hipped", height=17., facade_material="stone", facade_color=None)
    result[-1]['parts'] = [
        {'height': 7., 'min_height': 0., 'roof_shape': 'flat', 'roof_material': 'concrete', 'scale': 1.},
        {'height': 17., 'min_height': 7., 'roof_shape': 'hipped', 'roof_height': 3.,
         'facade_material': 'glass', 'roof_material': 'copper', 'scale': .7},
    ]
    return result


def case_items(case, x, y):
    """Plan one gallery case through the normal building/part data path at local position x, y."""
    import numpy as np
    import buildings as bld
    if 'parts' not in case:
        spec = bld.plan(footprint(case['footprint']) + [x, y], case['attrs'], lat=46.6, lon=14.6)
        return [(spec, 0., 0.)]
    import geodesy
    import mapgeom
    frame = geodesy.EnuFrame(46.6, 14.6)
    ring = footprint(case['footprint'])

    def layer(name, rows):
        geometries = []
        for row in rows:
            local = ring * row.get('scale', 1.) + [16., 16.]
            local = np.vstack([local, local[0]])
            lat, lon, _ = frame.enu_to_geodetic(local[:, 0], local[:, 1], 0.)
            geometries.append((mapgeom.POLYGON, [[np.stack([lon, lat], axis=1)]]))
        features = mapgeom.build(name, np.array([f'house_{i}' for i in range(len(rows))]), geometries)
        keys = set().union(*(row.keys() for row in rows)) - {'scale'}
        for key in sorted(keys):
            values = [row.get(key) for row in rows]
            text = any(isinstance(v, str) for v in values)
            features.attrs[key] = mapgeom.text_column(values) if text else mapgeom.float_column(values)
        return features

    parent = layer('buildings', [case['attrs']])
    parts = layer('building_parts', [dict(part, building_id='house_0') for part in case['parts']])
    items = bld.tile_buildings(frame, 0., 0., 64., 64., [parent], lambda la, lo: np.zeros(np.shape(la)),
                              part_layers=[parts])
    for spec, _, _ in items:
        spec.ring += [x - 16., y - 16.]
    return items


def atlas_rows(count):
    """Power-of-two count of 128 px label rows, two labels per row. Pure."""
    return max(16, 1 << (max(1, math.ceil(count / 2)) - 1).bit_length())


def footprint(kind):
    """Counter-clockwise local footprint centred near the origin. Pure."""
    import numpy as np
    if kind == "L":
        return np.array([[-8., -4.], [8., -4.], [8., 0.], [0., 0.], [0., 8.], [-8., 8.]])
    if kind == "T":
        return np.array([[-8., -4.], [8., -4.], [8., 0.], [3., 0.], [3., 8.], [-3., 8.], [-3., 0.], [-8., 0.]])
    hx, hy = (3., 3.) if kind == "tower" else (6., 6.) if kind == "square" else (12., 3.) if kind == "long" else (8., 4.)
    ring = np.array([[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]])
    if kind == "rotated":
        a = math.radians(30)
        ring = ring @ np.array([[math.cos(a), math.sin(a)], [-math.sin(a), math.cos(a)]])
    return ring


def label_texture(folder, labels):
    """Draw one shared label atlas; each house has an input label and the actually generated roof type."""
    from PIL import Image, ImageDraw, ImageFont
    image = Image.new("RGB", (1024, atlas_rows(len(labels)) * 128), (30, 38, 43))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("DejaVuSans.ttf", 22)
    for i, label in enumerate(labels):
        x, y = (i % 2) * 512, (i // 2) * 128
        draw.rectangle((x + 3, y + 3, x + 508, y + 124), outline=(120, 158, 162), width=3)
        draw.multiline_text((x + 16, y + 15), label, font=font, fill=(242, 238, 218), spacing=8)
    image.save(folder / "labels.png")


def write_materials(path, used):
    """Write only the gallery's materials, using the production building texture generator."""
    from PIL import Image
    from track import make_obj
    textures = path.parent / "textures"
    textures.mkdir(exist_ok=True)
    made = set()
    with path.open("w") as out:
        for name in sorted(used):
            if name == "lab_labels":
                filename = "labels.png"
            elif name == "asphalt":
                filename = "asphalt.png"
                Image.new("RGB", (8, 8), (100, 106, 110)).save(textures / filename)
            else:
                tex, color = make_obj.MATERIALS[name]
                if tex and tex.startswith("@bld:"):
                    _, kind, index = tex.split(":")
                    filename = f"bld_{kind}_{index}.jpg"
                    if filename not in made:
                        made.add(filename)
                        px = next(px for k, px in make_obj.BLD_KINDS.values() if k == kind)
                        make_obj.bld_texture(kind, make_obj.BLD_PALETTES[kind][int(index)], True, px).save(
                            textures / filename, quality=90)
                elif tex and tex.startswith("@wall:"):
                    import glob
                    from scenery import facades
                    _, kind, index = tex.split(":")
                    filename = f"wall_{kind}_{index}.jpg"
                    if filename not in made:
                        made.add(filename)
                        source, contrast, tones, factor = make_obj.WALL_KINDS[kind]
                        source = glob.glob(str(Path(make_obj.TEX_SRC) / source / '*_Color.jpg'))[0]
                        with Image.open(source) as base:
                            facades.tinted(base, [v * factor for v in tones[int(index)]], contrast,
                                           make_obj.WALL_TEX_PX).save(textures / filename, quality=90)
                else:
                    filename = name + ".png"
                    Image.new("RGB", (8, 8), tuple(int(v * 255) for v in color)).save(textures / filename)
            out.write(f"newmtl {name}\nKd 1 1 1\nmap_Kd textures/{filename}\n\n")


def build(ac_root):
    """Generate the catalogue through production building meshes and the normal OBJ/KN5 writer, without map downloads."""
    import numpy as np
    import buildings as bld
    from app import mytracks, version
    from track import make_obj, make_track_folder, obj_to_kn5

    work = ROOT / "out" / "tracks" / NAME / "obj"
    work.mkdir(parents=True, exist_ok=True)
    (work / "textures").mkdir(exist_ok=True)
    obj_path = work / "track.obj"
    obj = make_obj.Obj(str(obj_path))
    used, labels, catalogue = {"asphalt", "lab_labels"}, [], []
    examples = cases()
    label_rows = atlas_rows(len(examples))
    rows = math.ceil(len(examples) / 4)
    length = rows * 36. + 45.
    ground = np.array([[-85., -35., 0.], [85., -35., 0.], [85., length, 0.], [-85., length, 0.]])
    quad = np.array([[0, 1, 2], [0, 2, 3]])
    obj.add("1ROAD_road_gallery", "asphalt", ground, ground[:, :2] / 4., quad)
    for i, case in enumerate(examples):
        x, y = (i % 4 - 1.5) * 36., (i // 4) * 36. + 20.
        ring = footprint(case["footprint"]) + [x, y]
        items = case_items(case, x, y)
        for spec, _, _ in items:
            spec.porch = False
            spec.facade_pattern = bld.FacadePattern(attic_windows=spec.roof == "skillion")
        spec = items[-1][0]
        p, uv, t, mids, materials, colors = bld.build(items)
        attic_label = " / attic windows" if spec.facade_pattern.attic_windows else ""
        label = f"{i + 1:02d}  {case['title']}\nDrawn: {spec.roof}{attic_label}\nWall {spec.height:.1f} m / roof {spec.roof_height or 0:.1f} m"
        if 'parts' in case:
            label = f"{i + 1:02d}  {case['title']}\nStone base / glass upper\nOwn copper roof / inherited stone"
        labels.append(label)
        details = {"asset": "generated-building", "footprint": ring.tolist(),
                   "parameters": {"label": case["title"], **case["attrs"], "drawn_roof": spec.roof,
                                  **({'parts': case['parts']} if 'parts' in case else {})}}
        owner = obj.listed.new("bld", x, y, 0., details=details)
        catalogue.append({**case, "position": [x, y], "drawn_roof": spec.roof, "wall_height": spec.height})
        for mid in np.unique(mids):
            source = materials[mid]
            triangles = t[mids == mid]
            if source in make_obj.BLD_KINDS:
                groups = make_obj.bld_split(p, triangles, colors, make_obj.BLD_KINDS[source][0])
            elif source in make_obj.WALL_SOURCE:
                groups = make_obj.wall_split(p, triangles, make_obj.WALL_SOURCE[source])
            else:
                groups = {make_obj.SURFACE.get(source, (None, "plaster"))[1]: triangles}
            for material, faces in groups.items():
                used.add(material)
                obj.add(f"nocol_bld_{i}_{material}", material, p, uv, faces, owners=np.full(len(faces), owner))
        # The atlas is V-up here, just like production meshes before OBJ/KN5 conversion.
        u0, u1 = (i % 2) / 2, (i % 2 + 1) / 2
        v1, v0 = 1 - (i // 2) / label_rows, 1 - (i // 2 + 1) / label_rows
        board = np.array([[x - 6., y - 10., .2], [x + 6., y - 10., .2],
                          [x + 6., y - 10., 3.2], [x - 6., y - 10., 3.2]])
        sign = obj.listed.new("signs", x, y - 10., .2, details={"label": label})
        obj.add(f"nocol_signs_gallery_{i}", "lab_labels", board, np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]),
                quad, owners=np.full(2, sign))
    obj.close()
    label_texture(work / "textures", labels)
    write_materials(work / "track.mtl", used)
    anchor = work / "anchor.json"
    anchor.write_text(json.dumps({"route": [[0., -25.], [0., length - 10.]]}))
    make_track_folder.AC = str(ac_root)
    folder = Path(make_track_folder.make(NAME, TITLE, obj=str(obj_path), preview="", parts=[str(obj_path)],
                                        bounds=(-85., -length, 85., 35.), extra_description="Synthetic building comparison gallery."))
    obj_to_kn5.convert(str(obj_path), str(folder / (NAME + ".kn5")), str(anchor))
    info = {"title": TITLE, "version": version.VERSION, "track_version": version.TRACK_VERSION,
            "points": [], "width": None, "area": None, "area_m": [170., length + 35.], "length_m": length,
            "tiles": 1, "built": time.time(), "data": {}, "gallery": True}
    mytracks.save(str(folder), info)
    (folder / "data" / "gallery.json").write_text(json.dumps(catalogue, indent=2))
    ui_path = folder / "ui" / "ui_track.json"
    ui = json.loads(ui_path.read_text())
    ui.update(description="Synthetic roof, footprint and material gallery. Signs identify roof forms and facade/roof materials. "
              "Regenerate with tools/building_gallery.py; no geographical source area.", tags=["map2lap", "test", "freeroam"])
    ui_path.write_text(json.dumps(ui, indent=2))
    print(f"{len(catalogue)} labelled buildings: {folder}")
    return folder


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ac-root", type=Path, default=ROOT / "out" / "building-gallery-ac",
                        help="AC folder to write into; default stages the gallery under out/")
    args = parser.parse_args()
    build(args.ac_root.resolve())


if __name__ == "__main__":
    main()
