"""Whether a change left the built tracks as they were: a snapshot (sha1) of every file in out/tracks/<test track>/obj/
parts, saved before the change and compared after, per OBJ object ("o" block) where a file differs.

    .venv\\Scripts\\python.exe tools\\compare_parts.py save before             # the short test tracks as built now
    (the change, then: tools\\measure.py --all --build)
    .venv\\Scripts\\python.exe tools\\compare_parts.py compare before          # 0 differ: nothing changed
    .venv\\Scripts\\python.exe tools\\compare_parts.py save before --long      # the long ones too; or name tracks

Snapshots go to out/compare/<name>.json. Build the tracks before saving: a snapshot holds what out/tracks has, and a
track not built since an older change compares against that older state. A build plans anew, and what the revisit cache
keeps is keyed by the code (revisit.code_key), so "after" builds anew by itself; for a change the key can't see (a Python or
package update) set BNE_REVISIT=off for the build, and no BNGE_PLAN_RUN (AGENTS.md, Builds).
"""
import argparse
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "out", "compare")


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


def snapshot(names):
    """{track/file: {"sha1", "objects"}} of the tracks' OBJ parts."""
    snap = {}
    for t in names:
        d = os.path.join(HERE, "out", "tracks", t, "obj", "parts")
        if not os.path.isdir(d):
            print(f"  {t}: not built (no {os.path.relpath(d, HERE)})")
            continue
        for fn in sorted(os.listdir(d)):
            p = os.path.join(d, fn)
            with open(p, "rb") as f:
                entry = {"sha1": hashlib.sha1(f.read()).hexdigest()}
            if fn.endswith(".obj"):
                entry["objects"] = objects(p)
            snap[f"{t}/{fn}"] = entry
    return snap


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


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("action", choices=("save", "compare"))
    ap.add_argument("name", help="the snapshot's name (out/compare/<name>.json)")
    ap.add_argument("tracks", nargs="*", help="only these test tracks (default: the short ones)")
    ap.add_argument("--long", action="store_true", help="the long test tracks too")
    a = ap.parse_args()
    path = os.path.join(OUT, a.name + ".json")
    if a.action == "save":
        snap = snapshot(tracks(a.tracks, a.long))
        os.makedirs(OUT, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(snap, f)
        print(f"{len(snap)} files saved as {os.path.relpath(path, HERE)}")
        return 0
    with open(path, encoding="utf-8") as f:
        old = json.load(f)
    names = sorted({k.split("/")[0] for k in old}) if not a.tracks else a.tracks
    new = snapshot(names)
    diff = compare(old, new)
    print(f"{len(new)} files now, {len(old)} in {a.name}, {len(diff)} differ")
    print("\n".join(diff))
    return 1 if diff else 0


if __name__ == "__main__":
    sys.exit(main())
