"""Whether a change left the built tracks as they were: a snapshot (sha1) of every file a build leaves in
out/tracks/<test track> (OBJ parts, textures, track.mtl, anchor.json without its code_key, ...), saved before the change and
compared after: per OBJ object where a part differs, and what moved in it, read from the part as it was (or that only its
triangles' order differs).

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


def moved(was, now, names):
    """Per object of names, a line saying what moved from was to now ({name: (n, 3) vertices}, y the height). Pure."""
    lines = []
    for o in names:
        a, b = was.get(o), now.get(o)
        if a is None or b is None:
            lines.append(f"    {o}: {'new' if a is None else 'gone'}")
        elif len(a) != len(b):
            lines.append(f"    {o}: {len(a)} -> {len(b)} vertices")
        elif not len(a) or np.array_equal(a, b):
            lines.append(f"    {o}: the same vertices, its other lines differ")
        else:
            d = b - a
            at = np.abs(d).max(axis=1) > 0
            lines.append(f"    {o}: {at.sum()} of {len(a)} vertices moved, x {d[:, 0].min():+.3f}..{d[:, 0].max():+.3f}, height "
                         f"{d[:, 1].min():+.3f}..{d[:, 1].max():+.3f}, z {d[:, 2].min():+.3f}..{d[:, 2].max():+.3f} m, at AC x "
                         f"{a[at, 0].min():.1f}..{a[at, 0].max():.1f}, z {a[at, 2].min():.1f}..{a[at, 2].max():.1f}, height "
                         f"{a[at, 1].min():.1f}..{a[at, 1].max():.1f}")
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
        if triangles(was_lines) == triangles(now_lines):
            lines.append(f"  {k}: the same triangles in another order")
            continue
        was, now = vertices(was_lines), vertices(now_lines)
        oa, ob = a["objects"], b["objects"]
        lines.append(f"  {k}:")
        lines += moved(was, now, [o for o in sorted(set(oa) | set(ob)) if oa.get(o) != ob.get(o) and o])
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
