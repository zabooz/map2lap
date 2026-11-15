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
    for outline in ('rectangle', 'L'):
        add('ROOF EQUIPMENT / ' + outline.upper(), 'flat', outline, height=7., roof_height=0.,
            roof_material='concrete', seed_id='house-roof-equipment-0')
        result[-1]['scale'] = 2.
    for title, kind, outline, shape, material in (
        ('GARAGE / PLASTER DEFAULT', 'garage', 'tower', 'flat', None),
        ('GARAGES / ROW', 'garages', 'long', 'flat', None),
        ('STABLE / GATE + SMALL WINDOWS', 'stable', 'rectangle', 'gabled', None),
        ('BARN / GATE + VENTS', 'barn', 'rectangle', 'gabled', None),
        ('GARAGE / MAPPED WOOD', 'garage', 'tower', 'gabled', 'wood'),
    ):
        add(title, shape, outline, **{'class': kind, 'height': 4. if shape == 'flat' else 7., 'num_floors': 1,
                                     'roof_height': 0. if shape == 'flat' else 2., 'facade_material': material,
                                     'facade_color': None})
    for kind, floors, height, outline in (
        ('retail', 2, 7., 'rectangle'), ('commercial', 2, 7., 'rectangle'),
        ('supermarket', 1, 6., 'bigbox'), ('shop', 2, 7., 'rectangle'),
        ('kiosk', 1, 3., 'tower'), ('office', 5, 17., 'rectangle'),
        ('hotel', 4, 14., 'rectangle'), ('restaurant', 1, 4., 'rectangle'),
        ('civic', 3, 10., 'rectangle'), ('cafe', 1, 4., 'rectangle'),
        ('fast_food', 1, 4., 'rectangle'), ('industrial', 1, 8., 'bigbox'),
        ('warehouse', 1, 8., 'bigbox'), ('manufacture', 1, 8., 'bigbox'),
        ('factory', 2, 10., 'bigbox'), ('hangar', 1, 10., 'bigbox'),
    ):
        add('CLASS / ' + kind.upper(), 'flat', outline,
            **{'class': kind, 'height': height, 'num_floors': floors, 'roof_height': 0.,
               'facade_material': None, 'facade_color': None, 'roof_material': None,
               'name': 'Lab ' + kind.replace('_', ' ').title(), 'seed_id': 'lab-class-' + kind})
        result[-1]['group'] = 'business'
    for kind, floors, height, outline in (
        ('house', 2, 8.5, 'rectangle'), ('detached', 2, 8.5, 'rectangle'),
        ('semidetached_house', 2, 8.5, 'rectangle'), ('bungalow', 1, 5., 'rectangle'),
        ('residential', 3, 11., 'rectangle'), ('apartments', 5, 17., 'rectangle'),
        ('terrace', 3, 11., 'rectangle'), ('dormitory', 4, 14., 'rectangle'),
        ('farm', 2, 8.5, 'rectangle'), ('cabin', 1, 4., 'tower'),
        ('static_caravan', 1, 3., 'caravan'),
    ):
        add('CLASS / ' + kind.upper(), None, outline,
            **{'class': kind, 'height': height, 'num_floors': floors, 'roof_height': None,
               'facade_material': None, 'facade_color': None, 'roof_material': None,
               'seed_id': 'lab-class-' + kind})
        result[-1]['group'] = 'housing'
        if kind == 'semidetached_house':
            # The whole pair is one outline here; separate mapped halves are covered by planner tests.
            result[-1]['attrs']['building:flats'] = 2
            result[-1]['title'] = 'CLASS / SEMIDETACHED_HOUSE / PAIR'
    for group, entries in (
        ('parking', (('carport', 1, 3., 'tower'), ('parking', 3, 9., 'bigbox'),
                     ('parking_garage', 3, 9., 'bigbox'))),
        ('agriculture', (('farm_auxiliary', 1, 6., 'rectangle'), ('cowshed', 1, 6., 'rectangle'),
                         ('agricultural', 1, 6., 'rectangle'))),
        ('outbuildings', (('shed', 1, 3., 'tower'), ('hut', 1, 4., 'tower'), ('shelter', 1, 3., 'tower'),
                         ('roof', 1, 3., 'tower'), ('greenhouse', 1, 4., 'rectangle'),
                         ('service', 1, 4., 'tower'), ('toilets', 1, 3., 'tower'))),
        ('storage', (('silo', 1, 18., 'silo'), ('grain_silo', 1, 18., 'silo'),
                     ('storage_tank', 1, 8., 'tank'))),
        ('religious', (('church', 1, 12., 'rectangle'), ('chapel', 1, 7., 'square'),
                       ('cathedral', 1, 20., 'bigbox'))),
        ('public', (('fire_station', 2, 9.5, 'firehall'), ('police', 3, 10., 'rectangle'),
                    ('school', 3, 10., 'rectangle'), ('kindergarten', 1, 4., 'rectangle'),
                    ('hospital', 5, 17., 'bigbox'), ('post_office', 2, 7., 'rectangle'),
                    ('library', 3, 10., 'rectangle'), ('train_station', 2, 8., 'rectangle'),
                    ('townhall', 3, 11., 'rectangle'), ('government', 4, 14., 'rectangle'),
                    ('public', 3, 10., 'rectangle'), ('university', 4, 14., 'rectangle'),
                    ('college', 3, 10., 'rectangle'))),
        ('fallback', (('yes', 2, 8.5, 'rectangle'), ('transportation', 2, 8.5, 'rectangle'),
                      (None, 2, 8.5, 'rectangle'), ('unknown_building', 2, 8.5, 'rectangle'))),
    ):
        for kind, floors, height, outline in entries:
            label = kind.upper() if kind is not None else 'MISSING CLASS'
            shape = 'flat' if kind in ('parking', 'parking_garage') else None
            add('CLASS / ' + label, shape, outline,
                **{'class': kind, 'height': height, 'num_floors': floors,
                   'roof_height': 0. if shape == 'flat' else None, 'facade_material': None,
                   'facade_color': None, 'roof_material': None, 'seed_id': 'lab-class-' + str(kind),
                   'name': 'Lab ' + label.replace('_', ' ').title()})
            result[-1]['group'] = group
            if kind is None:
                del result[-1]['attrs']['class']
    return result


def case_position(index):
    """Keep the original exhibits fixed; wider class rows leave room for full-size commercial halls. Pure."""
    if index < 65:
        return (index % 4 - 1.5) * 36., (index // 4) * 36. + 20.
    return ((index - 65) % 4 - 1.5) * 50., 632. + ((index - 65) // 4) * 50.


def prepare_case(items):
    """Add lab attic demonstrations without replacing production class-specific facade dimensions."""
    from dataclasses import replace
    import buildings as bld
    for spec, _, _ in items:
        spec.porch = False
        pattern = spec.facade_pattern or bld.FacadePattern()
        spec.facade_pattern = replace(pattern, attic_windows=pattern.attic_windows or spec.roof == 'skillion')


def case_props(case, items, x, y):
    """Apply production names, signs and entrance selection to the class examples beside a synthetic street."""
    if not case.get('group'):
        return []
    import numpy as np
    import buildings as bld
    ring = footprint(case['footprint']) * case.get('scale', 1.) + [x, y]
    for spec, _, _ in items:
        spec.names = bld.names_for(spec, case['attrs'].get('name'), (), 'AT')
        spec.plates = bld.signs_for(spec, case['attrs'].get('name'), (), 'AT')
    road_y = float(ring[:, 1].min()) - 8.
    return bld.doors(items, [(np.array([[x - 30., road_y], [x + 30., road_y]]), 3., 'service', False)], 0., 0.)


def case_items(case, x, y):
    """Plan one gallery case through the normal building/part data path at local position x, y."""
    import numpy as np
    import buildings as bld
    if 'parts' not in case:
        spec = bld.plan(footprint(case['footprint']) * case.get('scale', 1.) + [x, y], case['attrs'], lat=46.6, lon=14.6)
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
    if kind in ('silo', 'tank'):
        angle = np.arange(24) * 2 * np.pi / 24
        return np.c_[np.cos(angle), np.sin(angle)] * (3. if kind == 'silo' else 6.)
    if kind == "L":
        return np.array([[-8., -4.], [8., -4.], [8., 0.], [0., 0.], [0., 8.], [-8., 8.]])
    if kind == "T":
        return np.array([[-8., -4.], [8., -4.], [8., 0.], [3., 0.], [3., 8.], [-3., 8.], [-3., 0.], [-8., 0.]])
    hx, hy = {'bigbox': (20., 16.), 'firehall': (13., 8.), 'caravan': (5., 2.), 'tower': (3., 3.),
              'square': (6., 6.), 'long': (12., 3.)}.get(kind, (8., 4.))
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
                if tex == '@props':
                    from scenery import propsmesh
                    filename = 'props.png'
                    if filename not in made:
                        made.add(filename)
                        propsmesh.make_atlas(str(textures / filename))
                elif tex == '@letters':
                    filename = name + '.png'
                    alpha = Image.open(Path(make_obj.ROADSIDE) / 'sign_letters_o.data.png').convert('L')
                    rgb = Image.new('RGB', alpha.size, tuple(int(v * 255) for v in make_obj.SIGN_LETTERS[name]))
                    Image.merge('RGBA', (*rgb.split(), alpha)).save(textures / filename)
                elif tex and tex.startswith("@bld:"):
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
    length = max(case_position(i)[1] for i in range(len(examples))) + 45.
    ground = np.array([[-110., -35., 0.], [110., -35., 0.], [110., length, 0.], [-110., length, 0.]])
    quad = np.array([[0, 1, 2], [0, 2, 3]])
    obj.add("1ROAD_road_gallery", "asphalt", ground, ground[:, :2] / 4., quad)
    for i, case in enumerate(examples):
        x, y = case_position(i)
        ring = footprint(case["footprint"]) * case.get('scale', 1.) + [x, y]
        items = case_items(case, x, y)
        prepare_case(items)
        props = case_props(case, items, x, y)
        spec = items[-1][0]
        p, uv, t, mids, materials, colors = bld.build(items)
        attic_label = " / attic windows" if spec.facade_pattern.attic_windows else ""
        label = f"{i + 1:02d}  {case['title']}\nDrawn: {spec.roof}{attic_label}\nWall {spec.height:.1f} m / roof {spec.roof_height or 0:.1f} m"
        if 'parts' in case:
            label = f"{i + 1:02d}  {case['title']}\nStone base / glass upper\nOwn copper roof / inherited stone"
        if case.get('group'):
            label = f"{i + 1:02d}  {case['title']}\n{spec.floors} floors / wall {spec.height:g} m\nMaterial: generator default"
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
        if props:
            from scenery import propsmesh
            groups = list(dict.fromkeys(row[0] for row in props))
            rows = [[groups.index(row[0]), *row[1:]] for row in props]
            marks = []
            solid, deco, glass, _ = propsmesh.build(groups, rows, marks=marks)
            owners = make_obj._props_listed(obj.listed, groups, rows, marks, solid, deco, glass, {0: owner})
            for part, mesh, vertex in zip(('solid', 'deco', 'glass'), (solid, deco, glass), owners):
                if mesh is not None:
                    used.add('props')
                    obj.add(f'nocol_lab_props_{i}_{part}', 'props', *mesh, owners=vertex[mesh[2][:, 0]])
        # The atlas is V-up here, just like production meshes before OBJ/KN5 conversion.
        u0, u1 = (i % 2) / 2, (i % 2 + 1) / 2
        v1, v0 = 1 - (i // 2) / label_rows, 1 - (i // 2 + 1) / label_rows
        board_y = float(ring[:, 1].min()) - 6. if case.get('group') else y - 10.
        board = np.array([[x - 6., board_y, .2], [x + 6., board_y, .2],
                          [x + 6., board_y, 3.2], [x - 6., board_y, 3.2]])
        sign = obj.listed.new("signs", x, board_y, .2, details={"label": label})
        obj.add(f"nocol_signs_gallery_{i}", "lab_labels", board, np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]),
                quad, owners=np.full(2, sign))
    obj.close()
    label_texture(work / "textures", labels)
    write_materials(work / "track.mtl", used)
    anchor = work / "anchor.json"
    anchor.write_text(json.dumps({"route": [[0., -25.], [0., length - 10.]]}))
    make_track_folder.AC = str(ac_root)
    folder = Path(make_track_folder.make(NAME, TITLE, obj=str(obj_path), preview="", parts=[str(obj_path)],
                                        bounds=(-110., -length, 110., 35.), extra_description="Synthetic building comparison gallery."))
    obj_to_kn5.convert(str(obj_path), str(folder / (NAME + ".kn5")), str(anchor))
    info = {"title": TITLE, "version": version.VERSION, "track_version": version.TRACK_VERSION,
            "points": [], "width": None, "area": None, "area_m": [220., length + 35.], "length_m": length,
            "tiles": 1, "built": time.time(), "data": {}, "gallery": True}
    mytracks.save(str(folder), info)
    (folder / "data" / "gallery.json").write_text(json.dumps(catalogue, indent=2))
    ui_path = folder / "ui" / "ui_track.json"
    ui = json.loads(ui_path.read_text())
    ui.update(description="Synthetic roof, material and building-class gallery, including homes, shops, offices and industry. "
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
