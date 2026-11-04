"""Does the same code build the same, round after round? All test tracks built again and again with the code unchanged; after each
round every file against the first round's (and a snapshot of compare_parts, if named). What differs is saved before the next
round: the files, the round's snapshot with its OBJ parts, and each track's trace (tools/build_trace.py). A round takes minutes:
for before a merge or a release, or when a build differed once; not while debugging.

    .venv\\Scripts\\python.exe tools\\stability.py --rounds 5                  # BNE_REVISIT=off: planned anew each time
    .venv\\Scripts\\python.exe tools\\stability.py --rounds 5 --revisit        # what builds keep for each other in use
    .venv\\Scripts\\python.exe tools\\stability.py --rounds 3 --against before  # also against out/compare/before.json

Goes to out/stability/<start time>/. Stops before a round if the code changed or another build runs (cache/plans not empty): keep
engine/ and src/ as they are and build nothing else. Exit 0: all rounds alike.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path[:0] = [os.path.join(HERE, "tools"), os.path.join(HERE, "engine")]
import compare_parts as cp  # noqa: E402
import revisit  # noqa: E402

MIN_FREE_GB = 5
TRACE = os.path.join(HERE, "out", "trace")


def track_digests(snap):
    """{track: a digest of all its files} of a compare_parts snapshot. Pure."""
    out = {}
    for t in sorted({k.split("/")[0] for k in snap}):
        h = hashlib.sha1()
        for k in sorted(k for k in snap if k.split("/")[0] == t):
            h.update(f"{k}={snap[k]['sha1']}\n".encode())
        out[t] = h.hexdigest()[:12]
    return out


def versions(rounds):
    """{track: {digest: [round numbers]}} of the rounds' track_digests, in their order. Pure."""
    out = {}
    for n, digests in enumerate(rounds, 1):
        for t, d in digests.items():
            out.setdefault(t, {}).setdefault(d, []).append(n)
    return out


def _git(*a):
    return subprocess.run(["git", *a], cwd=HERE, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout


def state():
    """What must stay the same from round to round."""
    return {"head": _git("rev-parse", "HEAD").strip(), "status": _git("status", "--porcelain"), "code_key": revisit.code_key()}


def why_not(want):
    """Why no round should start now, or None."""
    if state() != want:
        return "the code or the working tree changed"
    plans = os.path.join(HERE, "cache", "plans")
    if os.path.isdir(plans) and os.listdir(plans):
        return f"another build may be running: cache/plans holds {os.listdir(plans)[:3]}"
    if shutil.disk_usage(HERE).free / 2 ** 30 < MIN_FREE_GB:
        return f"under {MIN_FREE_GB} GB free"
    return None


def build(d, env):
    """The short test tracks, then the long ones; {step: seconds}, the steps that failed."""
    times, failed = {}, []
    for flag, step in (("--all", "short"), ("--long", "long")):
        t0 = time.time()
        with open(os.path.join(d, step + ".log"), "w", encoding="utf-8") as log:
            if subprocess.run([sys.executable, os.path.join("tools", "measure.py"), flag, "--build"], cwd=HERE, env=env, stdout=log,
                              stderr=subprocess.STDOUT).returncode:
                failed.append(step)
        times[step] = round(time.time() - t0)
    return times, failed


def differs(old, snap, names):
    """(lines of what differs, what moved) of a round's snapshot against old."""
    a, b = cp.only(old, names, {k: v for k, v in snap.items() if k.split("/")[0] in names})
    return cp.compare(a, b), cp.what_moved(a, b)


def save_files(lines, d):
    """The files lines (compare_parts.compare's) name, as they lie now, under d."""
    for line in lines:
        k = line.strip().split(": ")[0]
        t, _, rest = k.partition("/")
        src = os.path.join(cp.TRACKS, t, rest[1:]) if rest.startswith("@") else os.path.join(cp.TRACKS, t, "obj", "parts", rest)
        if os.path.isfile(src):
            dst = os.path.join(d, t, rest.lstrip("@"))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)


def keep_round(snap, name):
    """The round's snapshot and OBJ parts (compare_parts.keep), as out/compare/<name>.json."""
    with open(os.path.join(cp.OUT, name + ".json"), "w", encoding="utf-8") as f:
        json.dump(snap, f)
    cp.keep(snap)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--rounds", type=int, default=5)
    ap.add_argument("--revisit", action="store_true", help="leave the revisit cache on (else BNE_REVISIT=off: planned anew each time)")
    ap.add_argument("--against", help="a compare_parts snapshot to compare each round with too")
    a = ap.parse_args()
    if os.environ.get("BNGE_PLAN_RUN"):
        sys.exit("BNGE_PLAN_RUN is set: the builds would read each other's plans")
    stamp = time.strftime("%Y%m%d_%H%M%S")
    root = os.path.join(HERE, "out", "stability", stamp)
    os.makedirs(root)
    want = state()
    env = {k: v for k, v in os.environ.items()}
    if not a.revisit:
        env["BNE_REVISIT"] = "off"
    with open(os.path.join(root, "start.json"), "w", encoding="utf-8") as f:
        json.dump({**want, "revisit": a.revisit, "rounds": a.rounds, "runtime": revisit.runtime(),
                   "env": {k: v for k, v in sorted(env.items()) if k.startswith(("BNE_", "BNGE_"))}}, f, indent=1)
    names = cp.tracks(long=True)
    against = None
    if a.against:
        with open(os.path.join(cp.OUT, a.against + ".json"), encoding="utf-8") as f:
            against = json.load(f)
    first, rounds, bad = None, [], 0
    for r in range(1, a.rounds + 1):
        why = why_not(want)
        if why:
            print(f"round {r}: stopped, {why}")
            return 2
        tag = f"r{r:02d}"
        d = os.path.join(root, tag)
        os.makedirs(d)
        times, failed = build(d, env)
        snap = cp.snapshot(names)
        rounds.append(track_digests(snap))
        shutil.copytree(TRACE, os.path.join(d, "trace"), dirs_exist_ok=True)
        lines, moved = differs(first, snap, names) if first is not None else ([], [])
        first = first or snap
        also, also_moved = differs(against, snap, names) if against else ([], [])
        if r == 1 or lines or also:
            keep_round(snap, f"stability_{stamp}_{tag}")
        if lines or also:
            save_files(lines + also, os.path.join(d, "differ"))
            with open(os.path.join(d, "compare.txt"), "w", encoding="utf-8") as f:
                f.write("\n".join(["against the first round:", *lines, *moved, "against " + str(a.against) + ":", *also, *also_moved]))
        bad += bool(lines or failed)
        print(f"{tag}: {times}, {len(snap)} files, {len(lines)} differ from the first round" +
              (f", {len(also)} from {a.against}" if against else "") + (f", FAILED: {failed}" if failed else ""), flush=True)
    with open(os.path.join(root, "versions.json"), "w", encoding="utf-8") as f:
        json.dump(versions(rounds), f, indent=1)
    for t, v in versions(rounds).items():
        print(f"  {t}: " + ("the same each round" if len(v) == 1 else f"{len(v)} versions: " + ", ".join(f"rounds {n}" for n in v.values())))
    print(f"out/stability/{stamp}, {bad} rounds differ or failed")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
