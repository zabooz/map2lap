"""What the map data says about a road before any rule: OSM tag values, rule values, its level ranges as tagged,
and the per-cell facts kept for the next run (specs and levels share them)."""
import json
import math
import threading

import numpy as np

import osmtags

# Per-cell facts shared by the server's processes and kept for the next run (the revisit cache: one file per cell and
# kind, keyed by the cell, its map data versions and the code): a cell's road specs and level ranges, which every
# process that draws or grades its roads made for itself (~0.2 s a city cell each; the terrain blocks', the road
# tiles' and the AI graph's processes). Kept only when complete (revisit.faults unchanged).
_FACTS_LOCK = threading.Lock()
PASSAGE_M = 40.0        # m: a tunnel range this short between two bridge ranges is a passage through a tower
TUNNEL_GAP_M = 30.0     # m: tunnel ranges of a segment this close together are one tunnel


def _osm(feats, name, i, lo=None, hi=None):
    """OpenStreetMap's value `name` of feature i (osmtags.join's attrs column osm_<name>), or None (absent, not a number,
    outside lo..hi)."""
    col = feats.attrs.get("osm_" + name)
    if col is None:
        return None
    try:
        v = float(col[i])
    except (TypeError, ValueError):
        return None
    if not np.isfinite(v) or (lo is not None and v < lo) or (hi is not None and v > hi):
        return None
    return v


def _rule_value(table, i):
    """The value of the rule of feature i covering the largest share of it, or None."""
    if table is None or len(table.feature) == 0:
        return None
    j = table.major(i)
    return None if j < 0 else table.value[j]


def raw_level_ranges(feats, i):
    """level_ranges as the map has them, before _skew_decks (road_specs reads these: _skew_decks needs the specs)."""
    memo = feats.__dict__.setdefault("_raw_level_ranges", {})
    got = memo.get(i)
    if got is None:
        _cell_load(feats, load_only=True)
        got = memo.get(i)
        if got is None:
            got = memo[i] = _level_ranges(feats, i)
    return list(got)


def _facts_key(feats, kind, extra):
    cid = feats.__dict__.get("_bnge_cell")
    import revisit
    if cid is None or not revisit.ON or revisit.CACHE_DIR is None:
        return None
    return revisit.key("cellfacts", kind, cid, extra)


def _facts_load(feats, kind, extra):
    k = _facts_key(feats, kind, extra)
    if k is None:
        return None
    import revisit
    got = revisit.load(revisit.CACHE_DIR, "cellfacts", k)
    if got is None or "facts.json" not in got[0]:
        return None
    try:
        return json.loads(got[0]["facts.json"])
    except ValueError:
        return None


def _facts_store(feats, kind, extra, data):
    k = _facts_key(feats, kind, extra)
    if k is None:
        return
    import revisit
    revisit.store(revisit.CACHE_DIR, "cellfacts", k, {"facts.json": json.dumps(data).encode("utf-8")})


def _cell_load(feats, load_only=False):
    """Every feature's raw and lengthened level ranges into feats' memos from the shared facts. True when they are to
    be made now (not load_only and none kept: _cell_ranges makes them)."""
    st = feats.__dict__
    with _FACTS_LOCK:
        if st.get("_ranges_state") is not None:
            if load_only or st["_ranges_state"] != "loadable":
                return False
        tried = st.get("_ranges_state")
        st["_ranges_state"] = "busy"
    if tried is None:
        got = _facts_load(feats, "ranges", None)
        if got is not None and len(got.get("raw", ())) == len(feats) and len(got.get("lvl", ())) == len(feats):
            raw, lvl = st.setdefault("_raw_level_ranges", {}), st.setdefault("_level_ranges", {})
            for i in range(len(feats)):
                raw.setdefault(i, [tuple(r) for r in got["raw"][i]])
                lvl.setdefault(i, [tuple(r) for r in got["lvl"][i]])
            st["_ranges_state"] = "done"
            return False
    if load_only:
        st["_ranges_state"] = "loadable"        # (the eager build waits for level_ranges: road_specs reads the raw)
        return False
    return True


def _level_ranges(feats, i):
    """tag_level_ranges with the grade separations the map has no bridge for (gradesep.py: the cell's own, from its
    roads and its neighbours'), where no range of the map's is, and its underpasses' tunnel ranges made ground."""
    out = tag_level_ranges(feats, i)
    hook = feats.__dict__.get("_bnge_gradesep")
    extra = hook(feats).get(i) if hook is not None else None
    if not extra:
        return out
    for a, b, _k in (r for r in extra if r[2] == "ground"):       # (an underpass: its tunnel range is ground)
        cut = []
        for fa, fb, k in out:
            if k != "tunnel" or fb <= a or fa >= b:
                cut.append((fa, fb, k))
                continue
            if fa < a - 1e-5:
                cut.append((fa, a, k))
            if fb > b + 1e-5:
                cut.append((b, fb, k))
        out = cut
    add = []
    for a, b, _k in (r for r in extra if r[2] == "bridge"):
        for fa, fb, _ in out:
            if fb <= a or fa >= b:
                continue
            if fa > a:
                add.append((a, fa, "bridge"))
            a = max(a, fb)
            if a >= b:
                break
        if b - a > 1e-5:
            add.append((a, b, "bridge"))
    merged = []                                 # (touching bridge ranges joined: the map's fractions are float32s)
    for a, b, k in sorted(out + add):
        if merged and k == merged[-1][2] and a <= merged[-1][1] + 1e-5:
            merged[-1] = (merged[-1][0], max(merged[-1][1], b), k)
        else:
            merged.append((a, b, k))
    return merged


def tag_level_ranges(feats, i):
    """Feature i's off-ground ranges as the map's flags and level rules have them (level_ranges, before gradesep)."""
    got = {"flags": [], "level": []}
    for name in ("flags", "level"):
        t = feats.rules.get(name)
        if t is None or len(t.feature) == 0:
            continue
        for j in t.rows(i):
            v = t.value[j]
            if name == "flags":
                # (an avalanche gallery is a tunnel whose covered sections lie open on one side: TunnelProfiles,
                # GALLERY_KIND; flagged by OSM alone, Overture calls it a plain road)
                kind = "tunnel" if "is_tunnel" in str(v) or str(v) == osmtags.GALLERY_FLAG else \
                    "bridge" if "is_bridge" in str(v) else None
            else:
                try:
                    lv = float(v)
                except (TypeError, ValueError):
                    lv = 0.0
                kind = "bridge" if lv > 0 else "tunnel" if lv < 0 else None
            if kind is not None and t.end[j] > t.start[j]:
                got[name].append((float(t.start[j]), float(t.end[j]), kind))
    # the flags first; a level range only where no flag says otherwise (Tower Bridge: level 1 over 0.03-0.88 of its
    # segment, flags bridge / tunnel (through a tower) / bridge / tunnel / bridge: merged, tunnel winning, the whole
    # bridge was a tunnel, under water for most of it, and left out)
    out = sorted(got["flags"])
    for a, b, k in sorted(got["level"]):
        for fa, fb, _ in out[:]:
            if fb <= a or fa >= b:
                continue
            if fa > a:
                out.append((a, fa, k))
            a = max(a, fb)
            if a >= b:
                break
        if a < b:
            out.append((a, b, k))
    out.sort()
    merged = []                                 # overlapping ranges merged (a tunnel wins over a bridge); touching
    for a, b, k in out:                         # ones of the same kind joined, of different kinds kept apart
        if merged and (a < merged[-1][1] - 1e-9 or (a <= merged[-1][1] + 1e-9 and k == merged[-1][2])):
            pa, pb, pk = merged[-1]
            merged[-1] = (pa, max(pb, b), "tunnel" if "tunnel" in (pk, k) else "bridge")
        else:
            merged.append((a, b, k))
    if len(merged) >= 3:                        # a short tunnel between two bridge ranges: a passage through a
        L = _feature_length_m(feats, i)         # bridge's tower (Tower Bridge's): the bridge goes on
        for n in range(1, len(merged) - 1):
            a, b, k = merged[n]
            if k == "tunnel" and (b - a) * L < PASSAGE_M and merged[n - 1][2] == "bridge" and \
                    merged[n + 1][2] == "bridge" and abs(merged[n - 1][1] - a) < 1e-6 and abs(b - merged[n + 1][0]) < 1e-6:
                merged[n] = (a, b, "bridge")
        joined = []
        for a, b, k in merged:
            if joined and k == joined[-1][2] and a <= joined[-1][1] + 1e-9:
                joined[-1] = (joined[-1][0], b, k)
            else:
                joined.append((a, b, k))
        merged = joined
    if sum(1 for _, _, k in merged if k == "tunnel") > 1:
        # one tunnel, not several: Overture splits a tunnel's range (0.08-0.09, 0.10-0.13, 0.14-0.69 of the Fort
        # McHenry Tunnel's segment), and each gap would be a few metres of ground road inside the mountain
        L = _feature_length_m(feats, i)
        joined = []
        for a, b, k in merged:
            if joined and k == "tunnel" and joined[-1][2] == "tunnel" and (a - joined[-1][1]) * L < TUNNEL_GAP_M:
                joined[-1] = (joined[-1][0], b, "tunnel")
            else:
                joined.append((a, b, k))
        merged = joined
    return merged


def _feature_length_m(feats, i):
    """Length of feature i in metres (its rings, lon scaled by cos lat). Pure."""
    total = 0.0
    for part in feats.parts(i):
        for ring in part:
            r = np.asarray(ring, np.float64)
            if len(r) >= 2:
                c = math.cos(math.radians(float(np.mean(r[:, 1]))))
                total += float(np.hypot(np.diff(r[:, 0]) * c, np.diff(r[:, 1])).sum()) * 111320.0
    return total
