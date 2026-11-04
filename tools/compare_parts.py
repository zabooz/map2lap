"""Whether a change left the built tracks as they were: a snapshot (sha1) of every file a build leaves in
out/tracks/<test track> (OBJ parts, textures, track.mtl, anchor.json without its code_key, ...), saved before the change and
compared after: per OBJ object where a part differs, what moved in it and where, each place by AC x, z, height and route metre,
read from the part as it was (or that only its triangles' order differs).

    .venv\\Scripts\\python.exe tools\\compare_parts.py save before             # the short test tracks as built now
    (the change, then: tools\\measure.py --all --build)
    .venv\\Scripts\\python.exe tools\\compare_parts.py compare before          # 0 differ: nothing changed
    .venv\\Scripts\\python.exe tools\\compare_parts.py save before --long      # the long ones too; or name tracks
    .venv\\Scripts\\python.exe tools\\compare_parts.py compare before a_track   # only that one of the snapshot's

Snapshots go to out/compare/<name>.json, the OBJ parts as they were to out/compare/kept (each version once, as long as a
snapshot names it). Build the tracks before saving: a snapshot holds what out/tracks has, and a track not built since an older
change compares against that older state. So compare fails on a track whose code_key isn't the engine's now, however
equal its files: measure.py --all doesn't build the long ones. That key doesn't see src/, only engine/ and the native module.
A build plans anew, and what the revisit cache keeps is keyed by the code (revisit.code_key), so "after" builds anew by itself;
for a change the key can't see (a Python or package update) set BNE_REVISIT=off for the build, and no BNGE_PLAN_RUN by
hand (AGENTS.md, Builds).
"""
import argparse
import collections
import glob
import gzip
import hashlib
import json
import os
import shutil
import sys
from concurrent.futures import ThreadPoolExecutor

import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "out", "compare")
TRACKS = os.path.join(HERE, "out", "tracks")
PLACE_M = 30.0          # m: a grid's cell, changes in touching cells are one place (a tile is 256 m: two spots on it stay two)
PLACES_SHOWN = 6        # places listed per object, the largest first
ROUTE_SAMPLES = 64      # a place's points measured against the route, at most
KEEP_THREADS = 8        # (the OBJ parts of a long track are 350 MB: zlib leaves the other threads to run)
NEW_SHOWN = 5           # a track's new files named one by one, up to this many


def tracks(names=(), long=False):
    """The test tracks to snapshot: names as given, else the short ones (and the long ones with long)."""
    with open(os.path.join(HERE, "tools", "test_tracks.json"), encoding="utf-8") as f:
        all_ = json.load(f)
    return list(names) or [t for t, v in all_.items() if long or not v.get("long")]


def objects(path):
    """{object name: sha1 of its lines} of an OBJ file ("o" blocks; the lines before the first under ""). Pure but for
    the read."""
    out, name, h = {}, "", hashlib.sha1()
    with open(path, "rb") as f:
        for line in f:
            if line.startswith(b"o "):
                out[name] = h.hexdigest()
                name, h = line[2:].strip().decode("utf-8", "replace"), hashlib.sha1()
            h.update(line)
    out[name] = h.hexdigest()
    return out


def _sha1(path):
    """The sha1 of a file, anchor.json's without its code_key: that changes with any engine change, the track need not."""
    with open(path, "rb") as f:
        data = f.read()
    if os.path.basename(path) == "anchor.json":
        anchor = json.loads(data)
        anchor.pop("code_key", None)
        data = json.dumps(anchor, sort_keys=True).encode()
    return hashlib.sha1(data).hexdigest()


def other_files(t):
    """{track/@path: {"sha1"}} of what track t's build left beside its OBJ parts."""
    root = os.path.join(TRACKS, t)
    parts = os.path.join(root, "obj", "parts")
    snap = {}
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if os.path.join(d, x) != parts]
        for fn in files:
            p = os.path.join(d, fn)
            snap[f"{t}/@{os.path.relpath(p, root).replace(os.sep, '/')}"] = {"sha1": _sha1(p)}
    return snap


def snapshot(names):
    """{track/file: {"sha1", "objects"}} of the tracks' OBJ parts, {track/@path: {"sha1"}} of the rest of their builds."""
    snap = {}
    for t in names:
        d = os.path.join(TRACKS, t, "obj", "parts")
        if not os.path.isdir(d):
            print(f"  {t}: not built (no {os.path.relpath(d, HERE)})")
            continue
        for fn in sorted(os.listdir(d)):
            p = os.path.join(d, fn)
            entry = {"sha1": _sha1(p)}
            if fn.endswith(".obj"):
                entry["objects"] = objects(p)
            snap[f"{t}/{fn}"] = entry
        snap.update(other_files(t))
    return snap


def _kept(sha1):
    """Where the part with this sha1 is kept."""
    return os.path.join(OUT, "kept", sha1 + ".gz")


def _keep_one(k, sha1):
    """The OBJ part k (track/file) as sha1 into the kept folder, unless it's there."""
    if os.path.exists(_kept(sha1)):
        return
    t, fn = k.split("/", 1)
    with open(os.path.join(TRACKS, t, "obj", "parts", fn), "rb") as src, gzip.open(_kept(sha1) + ".part", "wb", 1) as dst:
        shutil.copyfileobj(src, dst)
    os.replace(_kept(sha1) + ".part", _kept(sha1))


def keep(snap):
    """The snapshot's OBJ parts kept, then the versions no snapshot in OUT names any more dropped: a snapshot is a few MB,
    its parts 1 GB packed down."""
    os.makedirs(os.path.join(OUT, "kept"), exist_ok=True)
    todo = [(k, e["sha1"]) for k, e in snap.items() if "objects" in e]
    with ThreadPoolExecutor(KEEP_THREADS) as ex:
        list(ex.map(lambda a: _keep_one(*a), todo))
    named = {sha1 for _k, sha1 in todo}
    for path in glob.glob(os.path.join(OUT, "*.json")):
        with open(path, encoding="utf-8") as f:
            named |= {e["sha1"] for e in json.load(f).values()}
    for path in glob.glob(os.path.join(OUT, "kept", "*.gz")):
        if os.path.basename(path)[:-3] not in named:
            os.remove(path)


def compare(old, new):
    """Lines saying what differs between two snapshots, per file and, in an OBJ, per object. Pure."""
    lines = []
    for k in sorted(set(old) | set(new)):
        a, b = old.get(k), new.get(k)
        if a and b and a["sha1"] == b["sha1"]:
            continue
        if not b:
            lines.append(f"  {k}: missing now")
        elif not a:
            lines.append(f"  {k}: new")
        else:
            oa, ob = a.get("objects", {}), b.get("objects", {})
            changed = [o for o in sorted(set(oa) | set(ob)) if oa.get(o) != ob.get(o)]
            which = f"{len(changed)} object{'s' if len(changed) > 1 else ''}: {', '.join(changed[:6])}" + \
                (" ..." if len(changed) > 6 else "")
            lines.append(f"  {k}: changed" + (f" ({which})" if changed else ""))
    return lines


def folded(lines):
    """compare's lines with each track's many new files as one line: --kn5 and --install leave textures and the distant view
    beside the parts, thousands of files that say nothing about the change, and a --build clears them. Pure."""
    new = {}
    for line in lines:
        if line.endswith(": new"):
            new.setdefault(line.strip().split("/")[0], []).append(line)
    out = []
    for line in lines:
        t = line.strip().split("/")[0]
        if not line.endswith(": new") or len(new[t]) <= NEW_SHOWN:
            out.append(line)
        elif new[t][0] == line:
            out.append(f"  {t}: {len(new[t])} new files, as {line.strip()[:-5]} (--kn5 and --install leave these: compare after a --build)")
    return out


def only(old, names, new):
    """The snapshot old cut to what this comparison asks: the tracks names, and the files beside the OBJ parts only if it
    holds them (a snapshot older than that holds the parts alone); (old, new) as cut. Pure."""
    old = {k: v for k, v in old.items() if k.split("/")[0] in names}
    if not any("/@" in k for k in old):
        new = {k: v for k, v in new.items() if "/@" not in k}
    return old, new


def not_this_code(names):
    """The tracks of names whose anchor.json holds another code_key than the engine has now (or none): their files say
    nothing about it."""
    sys.path.insert(0, os.path.join(HERE, "engine"))
    import revisit
    out = []
    for t in names:
        try:
            with open(os.path.join(TRACKS, t, "tiles", "anchor.json"), encoding="utf-8") as f:
                key = json.load(f).get("code_key")
        except OSError:
            continue
        if key != revisit.code_key():
            out.append(t)
    return out


def vertices(lines):
    """{object name: (n, 3) vertices} of an OBJ's lines (bytes). Pure."""
    out, name = {}, ""
    for line in lines:
        if line.startswith(b"o "):
            name = line[2:].strip().decode("utf-8", "replace")
            out[name] = []
        elif line.startswith(b"v ") and name:
            out[name].append([float(v) for v in line.split()[1:4]])
    return {k: np.array(v, np.float64).reshape(-1, 3) for k, v in out.items()}


def triangles(lines):
    """{object name: Counter of its triangles} of an OBJ's lines (bytes): each with its material and its corners (point, UV) from
    the smallest on, as written, so the same drawing in another order gives the same. Pure."""
    objs, pts, uvs, name, mat = {}, [], [], "", b""
    for line in lines:
        if line.startswith(b"v "):
            pts.append(tuple(line.split()[1:4]))
        elif line.startswith(b"vt "):
            uvs.append(tuple(line.split()[1:3]))
        elif line.startswith(b"usemtl "):
            mat = line[7:].strip()
        elif line.startswith(b"o "):
            name = line[2:].strip().decode("utf-8", "replace")
            objs[name] = collections.Counter()
        elif line.startswith(b"f ") and name:
            c = []
            for v in line.split()[1:]:
                q = v.split(b"/")
                i, j = int(q[0]), int(q[1]) if len(q) > 1 and q[1] else 0
                c.append((pts[i if i < 0 else i - 1], uvs[j if j < 0 else j - 1] if j else ()))
            for k in range(1, len(c) - 1):
                t = [c[0], c[k], c[k + 1]]
                r = t.index(min(t))
                objs[name][(mat, tuple(t[r:] + t[:r]))] += 1
    return objs


def only_in_one(a, b):
    """The points (m, 3) of a and b (n, 3) the other doesn't hold, to the mm: where they differ, in any order. Pure."""
    def keys(pts):
        return [r.tobytes() for r in np.round(pts, 3) + 0.0]        # (+ 0.0: -0.0 is 0.0)
    ka, kb = keys(a), keys(b)
    sa, sb = set(ka), set(kb)
    return np.r_[a[[k not in sb for k in ka]].reshape(-1, 3), b[[k not in sa for k in kb]].reshape(-1, 3)]


def places(pts):
    """The points (n, 3; x, y the height, z) as groups, the largest first: touching PLACE_M cells make one. Pure."""
    cells = {}
    for i, c in enumerate(zip(*np.floor(pts[:, [0, 2]] / PLACE_M).astype(np.int64).T)):
        cells.setdefault(c, []).append(i)
    out, seen = [], set()
    for c in cells:
        if c in seen:
            continue
        seen.add(c)
        todo, got = [c], []
        while todo:
            x, z = todo.pop()
            got += cells[(x, z)]
            for n in ((x + i, z + j) for i in (-1, 0, 1) for j in (-1, 0, 1)):
                if n in cells and n not in seen:
                    seen.add(n)
                    todo.append(n)
        out.append(pts[got])
    return sorted(out, key=lambda g: (-len(g), g[:, 0].min(), g[:, 2].min()))


def route_of(track):
    """The route of a built track (n, 2; AC x, z) with its metres (n,), or None. Reads its anchor."""
    try:
        with open(os.path.join(TRACKS, track, "tiles", "anchor.json"), encoding="utf-8") as f:
            xy = np.asarray(json.load(f).get("route") or [], np.float64)
    except (OSError, ValueError):
        return None
    if len(xy) < 2:
        return None
    xz = np.c_[xy[:, 0], -xy[:, 1]]
    return xz, np.r_[0.0, np.cumsum(np.hypot(*np.diff(xz, axis=0).T))]


def on_route(route, pts):
    """(from m, to m, m off the line at the nearest) of the points (n, 3) along route (route_of's). Pure."""
    xz, s = route
    q = pts[:: max(1, len(pts) // ROUTE_SAMPLES), :][:, [0, 2]]
    a, ab = xz[:-1], np.diff(xz, axis=0)
    t = np.clip(((q[:, None] - a[None]) * ab[None]).sum(2) / np.maximum((ab * ab).sum(1), 1e-12)[None], 0.0, 1.0)
    d = np.hypot(*(a[None] + t[..., None] * ab[None] - q[:, None]).transpose(2, 0, 1))
    k = d.argmin(1)
    m = s[k] + t[np.arange(len(q)), k] * np.hypot(*ab[k].T)
    return float(m.min()), float(m.max()), float(d.min())


def place_lines(pts, route=None):
    """A line per place of the points (n, 3): AC x, z, height, how many, route metres when route (route_of's). Pure."""
    groups = places(pts) if len(pts) else []
    lines = []
    for g in groups[:PLACES_SHOWN]:
        where = ""
        if route is not None:
            m0, m1, off = on_route(route, g)
            where = f", route {m0:.0f}-{m1:.0f} m, {off:.0f} m off the line"
        lines.append(f"      at AC x {g[:, 0].min():.1f}..{g[:, 0].max():.1f}, z {g[:, 2].min():.1f}..{g[:, 2].max():.1f}, height "
                     f"{g[:, 1].min():.1f}..{g[:, 1].max():.1f}: {len(g)} points{where}")
    if len(groups) > PLACES_SHOWN:
        lines.append(f"      and {len(groups) - PLACES_SHOWN} more places")
    return lines


def triangle_points(ta, tb):
    """The corners (n, 3) of the triangles only one of ta, tb (Counters, triangles') holds. Pure."""
    corners = [c[0] for t in (ta - tb) + (tb - ta) for c in t[1]]
    return np.array([[float(v) for v in c] for c in corners], np.float64).reshape(-1, 3)


def moved(was, now, names, route=None, tris=({}, {})):
    """Per object of names, a line saying what moved from was to now ({name: (n, 3) vertices}, y the height), then its places
    (place_lines). tris: the two parts' triangles(), for an object whose vertices stayed. Pure."""
    lines = []
    for o in names:
        a, b = was.get(o), now.get(o)
        if a is None or b is None:
            lines.append(f"    {o}: {'new' if a is None else 'gone'}")
            lines += place_lines(a if b is None else b, route)
        elif len(a) != len(b):
            lines.append(f"    {o}: {len(a)} -> {len(b)} vertices")
            lines += place_lines(only_in_one(a, b), route)
        elif not len(a) or np.array_equal(a, b):
            lines.append(f"    {o}: the same vertices, its other lines differ")
            lines += place_lines(triangle_points(tris[0].get(o, collections.Counter()), tris[1].get(o, collections.Counter())), route)
        elif o in tris[0] and o in tris[1] and tris[0][o] == tris[1][o]:
            # (every triangle as written: material, corners and UVs, to the last digit, none more or less often: a move of any size
            # stays a move)
            lines.append(f"    {o}: the same triangles in another order")
        else:
            d = b - a
            at = np.abs(d).max(axis=1) > 0
            lines.append(f"    {o}: {at.sum()} of {len(a)} vertices moved, x {d[:, 0].min():+.3f}..{d[:, 0].max():+.3f}, height "
                         f"{d[:, 1].min():+.3f}..{d[:, 1].max():+.3f}, z {d[:, 2].min():+.3f}..{d[:, 2].max():+.3f} m")
            only = only_in_one(a, b)        # (where they really differ: others may only have changed places in the file)
            lines += place_lines(only if len(only) else np.r_[a[at], b[at]], route)
    return lines


def what_moved(old, new):
    """Lines saying what moved in each changed OBJ part whose old version is kept (keep)."""
    lines = []
    for k in sorted(set(old) & set(new)):
        a, b = old[k], new[k]
        if a["sha1"] == b["sha1"] or "objects" not in a or not os.path.exists(_kept(a["sha1"])):
            continue
        t, fn = k.split("/", 1)
        with gzip.open(_kept(a["sha1"]), "rb") as f:
            was_lines = f.readlines()
        with open(os.path.join(TRACKS, t, "obj", "parts", fn), "rb") as f:
            now_lines = f.readlines()
        tris = triangles(was_lines), triangles(now_lines)
        if tris[0] == tris[1]:
            lines.append(f"  {k}: the same triangles in another order")
            continue
        was, now = vertices(was_lines), vertices(now_lines)
        oa, ob = a["objects"], b["objects"]
        lines.append(f"  {k}:")
        lines += moved(was, now, [o for o in sorted(set(oa) | set(ob)) if oa.get(o) != ob.get(o) and o], route_of(t), tris)
    return lines


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("action", choices=("save", "compare"))
    ap.add_argument("name", help="the snapshot's name (out/compare/<name>.json)")
    ap.add_argument("tracks", nargs="*", help="only these test tracks (default: the short ones; compare: all of the snapshot's)")
    ap.add_argument("--long", action="store_true", help="the long test tracks too")
    a = ap.parse_args()
    path = os.path.join(OUT, a.name + ".json")
    if a.action == "save":
        snap = snapshot(tracks(a.tracks, a.long))
        os.makedirs(OUT, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(snap, f)
        keep(snap)
        print(f"{len(snap)} files saved as {os.path.relpath(path, HERE)}")
        return 0
    with open(path, encoding="utf-8") as f:
        old = json.load(f)
    names = sorted({k.split("/")[0] for k in old}) if not a.tracks else a.tracks
    old, new = only(old, names, snapshot(names))
    diff = compare(old, new)
    fresh = sum(line.endswith(": new") for line in diff)
    print(f"{len(new)} files now, {len(old)} in {a.name}, {len(diff) - fresh} differ" + (f", {fresh} new" if fresh else ""))
    print("\n".join(folded(diff) + what_moved(old, new)))
    stale = not_this_code(names)
    if stale:
        print(f"NOT BUILT WITH THIS ENGINE CODE, these compare nothing new: {', '.join(stale)}")
    return 1 if diff or stale else 0


if __name__ == "__main__":
    sys.exit(main())
