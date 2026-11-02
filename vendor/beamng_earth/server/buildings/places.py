"""What a footprint is used for and what it is called."""
import numpy as np

import mapgeom

from .looks import SIGN_NAME_CHARS


def place_use(category, taxonomy):
    """The class an Overture place (its basic_category and taxonomy) gives the building it is in: "retail" (a sales
    hall), "shop" (a shopfront), "industrial" (works, a warehouse) or None (an office, a flat, a service: nothing
    about its walls). Pure."""
    category, taxonomy = str(category or ""), str(taxonomy or "")
    if taxonomy in HALL_PLACES or category in HALL_PLACES:
        return "retail"
    if category in WORKS_PLACES or taxonomy in WORKS_PLACES:
        return "industrial"
    if category in SHOP_PLACES or category.endswith("_store"):
        return "shop"
    return None


def _places_in(ring, pxy):
    """Indices of the points pxy (k, 2) inside ring (n, 2)."""
    lo, hi = ring.min(0), ring.max(0)
    return [k for k in np.flatnonzero(((pxy >= lo) & (pxy <= hi)).all(1)).tolist() if _inside(ring, pxy[k])]


def places_of(rings, pxy, near=None):
    """Per ring ((n, 2) each): the indices of the points pxy (k, 2) that belong to it: those inside it, and of those in
    none the ones within near m (PLACE_NEAR_M) of its walls, each to the nearest ring. Pure."""
    near = PLACE_NEAR_M if near is None else near
    rings = [np.asarray(r, np.float64) for r in rings]
    out = [_places_in(r, pxy) for r in rings]
    taken = {k for got in out for k in got}
    rest = [k for k in range(len(pxy)) if k not in taken]
    if not rest or near <= 0:
        return out
    q = pxy[rest]
    best = np.full(len(rest), np.inf)
    who = np.full(len(rest), -1)
    for j, r in enumerate(rings):
        lo, hi = r.min(0) - near, r.max(0) + near
        sel = np.flatnonzero(((q >= lo) & (q <= hi)).all(1))
        if not len(sel):
            continue
        a, b = r, np.roll(r, -1, 0)
        d = b - a
        p = q[sel]
        t = np.clip(((p[:, None, :] - a[None]) * d[None]).sum(2) / np.maximum((d * d).sum(1), 1e-12)[None], 0, 1)
        dist = np.hypot(*(a[None] + t[..., None] * d[None] - p[:, None, :]).transpose(2, 0, 1)).min(1)
        better = (dist <= near) & (dist < best[sel])
        best[sel[better]] = dist[better]
        who[sel[better]] = j
    for k, j in zip(rest, who):
        if j >= 0:
            out[j].append(k)
    return [sorted(got) for got in out]


def footprint_uses(rings, places=None, lands=()):
    """Per ring ((n, 2), one frame for all): the class its places (places_of: in it or at its wall) and land use give
    it, or None. places: (xy (k, 2), uses (k,) of place_use[, names, sign kinds]) of the places around (one of
    WHOLE_PUBLIC keeps the shops listed in it from making a shop front); lands: [(class, outer (m, 2), [hole (h, 2), ...])] of the land use
    areas of LAND_CLASSES. A hall needs the size of one: a works place or land use on a footprint up to a house's
    (HOUSE_MAX_M2) is a firm registered at a home or an office in the estate, a store land use under a smaller one than a
    big box (BIG_BOX_M2) an office as often as a shop. A works place on a big box's footprint wins over a shop in it
    (the works' showroom or counter); a sales hall's place, then a store land use, over the shops in it. Pure."""
    out = []
    pxy, puse = (np.asarray(places[0], np.float64).reshape(-1, 2), list(places[1])) if places else (np.zeros((0, 2)), [])
    psign = list(places[3]) if places and len(places) >= 4 else [None] * len(puse)
    for ring, mine in zip(rings, places_of(rings, pxy)):
        r = np.asarray(ring, np.float64)
        area = abs(_area2(r)) / 2
        got = {puse[k] for k in mine if puse[k] is not None}
        public = any(psign[k] in WHOLE_PUBLIC for k in mine)
        c = r[:-1].mean(0) if len(r) > 1 and np.allclose(r[0], r[-1]) else r.mean(0)
        land = None
        for cls, outer, holes in lands:
            if _inside(outer, c) and not any(_inside(h, c) for h in holes):
                land = LAND_CLASSES.get(cls)
                break
        use = None
        if "industrial" in got and area >= BIG_BOX_M2:
            use = "industrial"
        elif "retail" in got:
            use = "retail"
        elif land in ("retail", "commercial") and area >= BIG_BOX_M2:
            use = land
        elif "shop" in got and not public:
            use = "shop"
        elif area >= HOUSE_MAX_M2 and ("industrial" in got or land == "industrial"):
            use = "industrial"
        out.append(use)
    return out


def footprint_names(rings, places):
    """Per ring: the sign names (sign_name) of the businesses (a place_use) among places (xy, uses, names) inside it,
    each once, in the places' order. Pure."""
    pxy, puse, pname = np.asarray(places[0], np.float64).reshape(-1, 2), places[1], places[2]
    out = []
    for mine in places_of(rings, pxy):
        got = []
        for k in mine:
            if puse[k] is not None and pname[k] and pname[k].casefold() not in {g.casefold() for g in got}:
                got.append(pname[k])
        out.append(got)
    return out


def place_sign(category, taxonomy):
    """The sign kind an Overture place gives the building it is in (signs_for): PLACE_SIGNS by its taxonomy, then by
    its basic category, "office" for OFFICE_PLACES, else None (NO_SIGN_PLACES). Pure."""
    category, taxonomy = str(category or ""), str(taxonomy or "")
    if taxonomy in NO_SIGN_PLACES:
        return None
    return PLACE_SIGNS.get(taxonomy) or PLACE_SIGNS.get(category) or ("office" if category in OFFICE_PLACES else None)


def footprint_signs(rings, places):
    """Per ring: (sign kind, sign name or None) of each place among places (xy, uses, names[, signs]) inside it that
    has a place_sign, in the places' order. Pure."""
    if len(places) < 4:
        return [[] for _ in rings]
    pxy, pname, psign = np.asarray(places[0], np.float64).reshape(-1, 2), places[2], places[3]
    out = []
    for mine in places_of(rings, pxy):
        got = []
        for k in mine:
            if psign[k] is not None and (psign[k], pname[k]) not in got:
                got.append((psign[k], pname[k]))
        out.append(got)
    return out


def signs_for(spec, own, found, country):
    """A building's signs besides its shop bands (names_for), as (shape, text, SIGN_TINTS index): "panel" the name of
    a public building (its own, else its place's, else its kind's word in the country's language:
    shopnames.public_word), else a hotel's or guest house's, else a pharmacy's that has no shop band; "plate" each
    office's (OFFICE_PLATES; an office building's own name first); "blade" a hotel's upright "HOTEL"; "cross" or "a"
    a pharmacy's symbol (PHARMACY_CROSS, PHARMACY_A). own: the building's mapped name; found: its footprint_signs.
    The kind from the mapped class (CLASS_SIGNS) first, else from the places; none on a church, shed or barn. Only
    what the lettering can write (sign_text). Pure."""
    if spec.plain or spec.steeple or spec.cls in CHURCH_CLASSES:
        return ()
    import shopnames
    by = CLASS_SIGNS.get(spec.cls)
    own = sign_text(sign_name(own))
    kinds = {}
    for k, n in found:
        t = sign_text(n)
        got = kinds.setdefault(k, [])
        if t and t not in got:
            got.append(t)
    out = []
    public = by if by in PUBLIC_KINDS else next((k for k in PUBLIC_KINDS if k in kinds), None)
    if public:
        text = (own if by == public else None) or next(iter(kinds.get(public, ())), None) or own or \
            sign_text(shopnames.public_word(country, public))
        if text:
            out.append(("panel", text, PANEL_TINTS.get(public, PANEL_PLAIN[int(_hash01(spec.seed, "panelc")
                                                                                * len(PANEL_PLAIN))])))
    hotel = by == "hotel" or "hotel" in kinds
    if not out and (hotel or "lodging" in kinds):
        text = (own if by == "hotel" else None) or next(iter(kinds.get("hotel") or kinds.get("lodging") or ()), None)
        if text:
            out.append(("panel", text, int(_hash01(spec.seed, "panelc") * len(SIGN_TINTS))))
    if hotel:
        out.append(("blade", sign_text(shopnames.hotel_word(country)), int(_hash01(spec.seed, "bladec")
                                                                           * len(SIGN_TINTS))))
    if "pharmacy" in kinds:
        if not out and not spec.shop and kinds["pharmacy"]:
            out.append(("panel", kinds["pharmacy"][0], PANEL_PLAIN[0]))
        c = str(country or "").upper()
        if c in PHARMACY_A:
            out.append(("a", "A", 0))
        elif c in PHARMACY_CROSS:
            out.append(("cross", None, None))
    taken = {t for _, t, _ in out}
    offices = []
    for t in ([own] if by == "office" and own else []) + kinds.get("office", []):
        if t not in taken and t not in offices:
            offices.append(t)
    tint = PLATE_TINTS[int(_hash01(spec.seed, "platec") * len(PLATE_TINTS))]
    return tuple(out + [("plate", t, tint) for t in offices[:OFFICE_PLATES]])


def sign_name(name, brand=None, limit=SIGN_NAME_CHARS):
    """The name a business shows on its sign: its brand's, else its own without the branch after a dash (a listing's
    "Kärntner Sparkasse - Eberndorf"), cut after its last whole word within limit characters; None without one.
    Pure."""
    s = " ".join(str(brand or "").split()) or " ".join(str(name or "").split())
    if s.lower() in ("", "nan", "none"):
        return None
    for cut in SIGN_NAME_CUT:
        if cut in s and s.index(cut) >= 2:
            s = s[:s.index(cut)]
    if len(s) > limit:
        s = s[:limit + 1].rsplit(" ", 1)[0] if " " in s[:limit + 1] else s[:limit]
    return s.strip(" ,;:-") or None


def sign_text(value):
    """value in the lettering's glyphs (exitsigns' accents and dashes; ß as ss, ł as l), the letters it has none for left out,
    or None when that is a quarter of it or more (another script: a Tokyo shop's name drawn as a few stray Latin
    letters). Pure."""
    import exitsigns
    s = " ".join(str(value or "").replace("ß", "ss").replace("ẞ", "SS").replace("ł", "l").replace("Ł", "L").split())
    if not s:
        return None
    t = [exitsigns._text(c) for c in s]
    bad = sum(1 for c, o in zip(s, t) if o == "?" and c != "?")
    if bad * 4 >= len(s):
        return None
    return "".join(o for c, o in zip(s, t) if not (o == "?" and c != "?")).strip() or None


def names_for(spec, own, found, country):
    """The names on a building's signs, only for a business front: a shop (spec.shop) or a hall (no windows). On a
    hall its own mapped name (own: the building's name) first, then the businesses in it (found: footprint_names; a
    hall shows its firm, the shops in it are counters); on a shop building the businesses first, each on its own
    band. With none and a business class (INVENTED_CLASSES, industrial; commercial on a hall): one invented in the
    country's language (shopnames.invented); else none. Only what the lettering can write (sign_text). Pure."""
    hall = spec.windows is False and not spec.plain
    if not (spec.shop or hall):
        return ()
    own = sign_name(own)
    raw = ([own] if own and hall else []) + list(found) + ([own] if own and not hall else [])
    names = []
    for n in raw:
        t = sign_text(n)
        if t and t not in names:
            names.append(t)
    industrial = spec.cls in INDUSTRIAL_CLASSES
    if not names and (spec.cls in INVENTED_CLASSES or industrial or (hall and spec.cls == "commercial")):
        import shopnames
        t = sign_text(shopnames.invented(country, "industrial" if industrial else "retail" if hall else "shop",
                                         _hash01(spec.seed, "shopname")))
        names = [t] if t else []
    return tuple(names)


def use_data(frame, md, keys, x0, y0):
    """The places and land use areas of map cells keys for footprint_uses and footprint_names, relative to (x0, y0) in
    frame (an EnuFrame): ((xy, uses, sign names, sign kinds), lands) of the places with a place_use or a place_sign
    (Overture's, then OpenStreetMap's POIs: MapData.pois "places", osm_place), or None when the cells can't give them
    (offline without the places: the generic rules)."""
    try:
        cds = [md.cell(k, layers=("places", "land_use"), kind="demand") for k in keys]
    except Exception as e:      # (the buildings stand without them)
        log.debug("places / land use of cells %s: %s", keys, e)
        return None
    pxy, puse, pname, psign, lands, seen = [], [], [], [], [], set()
    for c in cds:
        f = c.layers.get("places")
        if f is not None and len(f):
            a = f.attrs
            first = f.coord_off[f.ring_off[f.part_off[:-1]]]
            xy = f.xy_in(frame)[first] - [x0, y0]
            for i in range(len(f)):
                cat_ = a["basic_category"][i] if "basic_category" in a else None
                tax_ = a["taxonomy"][i] if "taxonomy" in a else None
                u, s = place_use(cat_, tax_), place_sign(cat_, tax_)
                if (u is not None or s is not None) and f.ids[i] not in seen:
                    seen.add(f.ids[i])
                    pxy.append(xy[i])
                    puse.append(u)
                    psign.append(s)
                    pname.append(sign_name(a["name"][i] if "name" in a else None,
                                           a["brand_name"][i] if "brand_name" in a else None,
                                           PANEL_NAME_CHARS if u is None else SIGN_NAME_CHARS))
        f = c.layers.get("land_use")
        if f is not None and len(f):
            for i in range(len(f)):
                cls = str(f.attrs["class"][i] or "")
                if cls not in LAND_CLASSES:
                    continue
                for part in f.parts(i):
                    rs = [np.stack(mapgeom.enu_xy(f, frame, np.asarray(rg)), 1) - [x0, y0] for rg in part]
                    if rs and len(rs[0]) >= 4:
                        lands.append((cls, rs[0], rs[1:]))
    for k in keys if hasattr(md, "pois") else ():          # OSM's POIs (pois.py), at their bbox's centre
        for lo0, la0, lo1, la1, *vals in md.pois(k, "places"):
            cat_ = osm_place(dict(zip(OSM_KEYS_READ, vals[:-1])))
            use, sign = place_use(cat_, None), place_sign(cat_, None)
            name = sign_name(vals[-1], None, PANEL_NAME_CHARS if use is None else SIGN_NAME_CHARS)
            key = (round((lo0 + lo1) / 2, 6), round((la0 + la1) / 2, 6), name)
            if cat_ is None or name is None or key in seen:
                continue
            seen.add(key)
            e, n, _ = frame.geodetic_to_enu((la0 + la1) / 2, (lo0 + lo1) / 2, 0.0)
            pxy.append((float(e) - x0, float(n) - y0))
            puse.append(use)
            psign.append(sign)
            pname.append(name)
    return (np.asarray(pxy, np.float64).reshape(-1, 2), puse, pname, psign), lands


def worship_boxes(frame, md, keys, x0, y0):
    """[(x0, y0, x1, y1)] relative to (x0, y0) in frame of the Christian places of worship of map cells keys
    (MapData.pois "churches"; none offline or when the source fails)."""
    out = set()
    if not hasattr(md, "pois"):
        return []
    for k in keys:
        for lo0, la0, lo1, la1, *_ in md.pois(k, "churches"):
            e, n, _ = frame.geodetic_to_enu(np.array([la0, la1]), np.array([lo0, lo1]), 0.0)
            out.add((float(min(e)) - x0, float(min(n)) - y0, float(max(e)) - x0, float(max(n)) - y0))
    return sorted(out)


def castle_boxes(frame, md, keys, x0, y0):
    """[(x0, y0, x1, y1, "castle" or "ruins")] relative to (x0, y0) in frame of the castles, forts, town gates and
    ruins of map cells keys (MapData.pois "castles"; none offline or when the source fails)."""
    out = set()
    if not hasattr(md, "pois"):
        return []
    for k in keys:
        for lo0, la0, lo1, la1, historic, building in md.pois(k, "castles"):
            e, n, _ = frame.geodetic_to_enu(np.array([la0, la1]), np.array([lo0, lo1]), 0.0)
            kind = "ruins" if "ruins" in (historic, building) else "castle"
            out.add((float(min(e)) - x0, float(min(n)) - y0, float(max(e)) - x0, float(max(n)) - y0, kind))
    return sorted(out)


def castle_rings(rings, boxes):
    """{ring index: "castle" or "ruins"} of the rings ((n, 2), the boxes' frame) on a castle's site: the centre in a
    box (x0, y0, x1, y1, kind), or holding a point's. A ruin's own outline wins over the castle round it. Pure."""
    out = {}
    if not boxes or not rings:
        return out
    cs = np.array([np.asarray(r, np.float64).mean(0) for r in rings])
    for bx0, by0, bx1, by1, kind in boxes:
        if bx1 - bx0 < 1.0 and by1 - by0 < 1.0:     # a point
            p = ((bx0 + bx1) / 2, (by0 + by1) / 2)
            hit = [k for k in range(len(rings)) if _inside(rings[k], p)]
        else:
            hit = np.flatnonzero((cs[:, 0] >= bx0) & (cs[:, 0] <= bx1) & (cs[:, 1] >= by0) & (cs[:, 1] <= by1))
        for k in hit:
            if out.get(int(k)) != "ruins":
                out[int(k)] = kind
    return out


def church_rings(rings, boxes):
    """Indices of the rings ((n, 2), the boxes' frame) that are the churches of the boxes (x0, y0, x1, y1): a point's
    ring holds it, a box's ring is the one of the best CHURCH_IOU or more. Pure."""
    if not boxes or not rings:
        return set()
    rb = np.array([(*np.min(r, 0), *np.max(r, 0)) for r in rings], np.float64)
    out = set()
    for bx0, by0, bx1, by1 in boxes:
        hit = np.flatnonzero((rb[:, 0] <= bx1) & (rb[:, 2] >= bx0) & (rb[:, 1] <= by1) & (rb[:, 3] >= by0))
        if not len(hit):
            continue
        if bx1 - bx0 < 1.0 and by1 - by0 < 1.0:     # a point
            p = ((bx0 + bx1) / 2, (by0 + by1) / 2)
            out.update(int(k) for k in hit if _inside(rings[k], p))
            continue
        b = rb[hit]
        iw = np.clip(np.minimum(b[:, 2], bx1) - np.maximum(b[:, 0], bx0), 0, None)
        ih = np.clip(np.minimum(b[:, 3], by1) - np.maximum(b[:, 1], by0), 0, None)
        inter = iw * ih
        iou = inter / ((b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1]) + (bx1 - bx0) * (by1 - by0) - inter)
        if iou.max() >= CHURCH_IOU:
            out.add(int(hit[int(np.argmax(iou))]))
    return out


# (read inside functions only; here so that the parts can load each other)
from .looks import (
    BIG_BOX_M2, CHURCH_CLASSES, CHURCH_IOU, CLASS_SIGNS, HALL_PLACES, HOUSE_MAX_M2, INDUSTRIAL_CLASSES,
    INVENTED_CLASSES, LAND_CLASSES, NO_SIGN_PLACES, OFFICE_PLACES, OFFICE_PLATES, OSM_KEYS_READ, PANEL_NAME_CHARS,
    PANEL_PLAIN, PANEL_TINTS, PHARMACY_A, PHARMACY_CROSS, PLACE_NEAR_M, PLACE_SIGNS, PLATE_TINTS, PUBLIC_KINDS,
    SHOP_PLACES, SIGN_NAME_CUT, SIGN_TINTS, WHOLE_PUBLIC, WORKS_PLACES, log, osm_place
)  # noqa: E402
from .styles import _area2, _hash01  # noqa: E402
from .mesh import _inside  # noqa: E402
