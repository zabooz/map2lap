"""Which code a build really runs: test tracks built fully (up to the kn5, cold, each into a temporary AC folder) under
coverage, then per module the functions that never ran. For dead code: a function a build never runs is a candidate
to delete, once checked by hand (code that runs only on a cache miss or in other countries counts as used: download
and regional code shows as never run, since the test tracks' map data is cached and in one region).

    .venv\\Scripts\\python.exe tools\\coverage.py run                      # the short test tracks: ~10 min
    .venv\\Scripts\\python.exe tools\\coverage.py run --long               # all: an hour and more
    .venv\\Scripts\\python.exe tools\\coverage.py run stausee_kreuzung_test
    .venv\\Scripts\\python.exe tools\\coverage.py report [--min 40]        # modules / functions never run
    .venv\\Scripts\\python.exe tools\\coverage.py report --module grading/planner.py   # one module, per function

Data and logs: out/coverage/ (coverage.json; build_<track>.log). The generator page (src/server.py, src/app/) is left
out of the report: a build doesn't run it.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "out", "coverage")
PAGE = ("src/app/", "src/server.py")


def run(names, long=False):
    """Build the test tracks under coverage (fresh data) and write out/coverage/coverage.json."""
    with open(os.path.join(HERE, "tools", "test_tracks.json"), encoding="utf-8") as f:
        all_ = json.load(f)
    names = names or [t for t, v in all_.items() if long or not v.get("long")]
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.startswith(".coverage") or f == "coverage.json":
            os.remove(os.path.join(OUT, f))
    rc = os.path.join(OUT, "coveragerc")
    with open(rc, "w", encoding="utf-8") as f:
        f.write("[run]\nparallel = true\nconcurrency = multiprocessing,thread\npatch = subprocess\n"
                f"source =\n    {os.path.join(HERE, 'src')}\n    {os.path.join(HERE, 'engine')}\n"
                f"omit = */tests/*\ndata_file = {os.path.join(OUT, '.coverage')}\n")
    # (cold: cached grading would skip the code that made it; sysmon: Python's low-overhead tracing)
    env = dict(os.environ, BNE_COLD="coverage", BNE_REVISIT="off", PYTHONUTF8="1", COVERAGE_CORE="sysmon")
    for t in names:
        t0 = time.time()
        with tempfile.TemporaryDirectory(prefix="map2lap_cov_") as ac, \
                open(os.path.join(OUT, f"build_{t}.log"), "w", encoding="utf-8") as log:
            p = subprocess.run([sys.executable, "-m", "coverage", "run", f"--rcfile={rc}",
                                os.path.join(HERE, "tools", "check.py"), "--build-child", t, ac],
                               cwd=HERE, env=env, stdout=log, stderr=subprocess.STDOUT)
            kn5 = os.path.join(ac, "content", "tracks", "check_" + t, "check_" + t + ".kn5")
            size = os.path.getsize(kn5) if os.path.exists(kn5) else 0
        print(f"{t}: {'built' if p.returncode == 0 and size else 'FAILED'}, kn5 {size / 1e6:.0f} MB, "
              f"{(time.time() - t0) / 60:.1f} min", flush=True)
    subprocess.run([sys.executable, "-m", "coverage", "combine", f"--rcfile={rc}", "-q"], cwd=OUT, env=env)
    subprocess.run([sys.executable, "-m", "coverage", "json", f"--rcfile={rc}", "-q", "-o",
                    os.path.join(OUT, "coverage.json")], cwd=OUT, env=env)
    print(f"Data: {os.path.relpath(os.path.join(OUT, 'coverage.json'), HERE)} (tools\\coverage.py report)")


def rows():
    """[(module, statements, statements run, [(function, statements) never run])] of coverage.json."""
    with open(os.path.join(OUT, "coverage.json"), encoding="utf-8") as f:
        files = json.load(f)["files"]
    out = []
    for path, f in files.items():
        rel = os.path.relpath(os.path.abspath(path), HERE).replace(os.sep, "/")
        if rel.startswith(PAGE):
            continue
        dead = [(name, fn["summary"]["num_statements"]) for name, fn in f.get("functions", {}).items()
                if name and fn["summary"]["num_statements"] and fn["summary"]["covered_lines"] == 0]
        out.append((rel, f["summary"]["num_statements"], f["summary"]["covered_lines"], dead, f))
    return out


def report(least=40, module=None):
    rs = rows()
    if module:
        for rel, n, c, _, f in rs:
            if rel.endswith(module):
                print(f"{rel}: {c} of {n} statements ran")
                for name, fn in f.get("functions", {}).items():
                    s = fn["summary"]
                    if name and s["num_statements"] and s["covered_lines"] < s["num_statements"]:
                        print(f"  {name:44s} {s['covered_lines']:4d}/{s['num_statements']:<4d}"
                              + ("  never" if s["covered_lines"] == 0 else ""))
        return
    never = sorted(r for r in rs if r[2] == 0)
    print(f"Modules no build imported ({len(never)}):")
    for rel, n, *_ in never:
        print(f"  {rel} ({n} statements)")
    print(f"\nFunctions never run, modules with at least {least} such statements:")
    for rel, n, c, dead, _ in sorted(rs, key=lambda r: -sum(x[1] for x in r[3])):
        k = sum(x[1] for x in dead)
        if c and k >= least:
            top = sorted(dead, key=lambda x: -x[1])
            print(f"  {rel}: {k} of {n} statements in {len(dead)} functions: "
                  + ", ".join(f"{a} ({b})" for a, b in top[:10]) + (" ..." if len(top) > 10 else ""))
    print(f"\n{sum(r[2] for r in rs)} of {sum(r[1] for r in rs)} statements ran")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("action", choices=("run", "report"))
    ap.add_argument("tracks", nargs="*", help="run: only these test tracks")
    ap.add_argument("--long", action="store_true", help="run: the long test tracks too")
    ap.add_argument("--min", type=int, default=40, help="report: modules with at least this many never-run statements")
    ap.add_argument("--module", help="report: this module's functions (a path's end, e.g. grading/planner.py)")
    a = ap.parse_args()
    if a.action == "run":
        run(a.tracks, a.long)
    else:
        report(a.min, a.module)


if __name__ == "__main__":
    sys.exit(main())
