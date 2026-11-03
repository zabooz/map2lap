"""One pass/fail check of the whole repo: the unit tests, each file in its own process (a crash in the native module
ends only that file), and a build of one short test track up to the kn5 (gates, distant view and kn5 have no unit
tests; measure.py --build stops before them). Failures listed in KNOWN don't fail the check; a new one does, and a
KNOWN one that passes again is reported so its entry can go.

    .venv\\Scripts\\python.exe tools\\check.py                      # unit tests and the kn5 build
    .venv\\Scripts\\python.exe tools\\check.py --fast               # unit tests only (the pre-commit hook)
    .venv\\Scripts\\python.exe tools\\check.py test_roads test_grading   # only these test files, no build

Exit code 0: passed, 1: failed. The kn5 build goes into a temporary AC folder, so nothing in AC changes; its OBJ parts
stay in out/tracks/check_<track> to compare against. It needs the map services (OSRM) like any build. A build's grading is cached (revisit.code_key): after a change to server/ the
first one runs cold, a few minutes.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
TESTS = os.path.join(HERE, "vendor", "beamng_earth", "server", "tests")
TRACK = "stausee_kreuzung_test"     # the shortest test track: a few tiles, under a minute when its grading is cached
FILE_TIMEOUT_S = 900                # s per test file: the slowest take about a minute; past this it hangs
BUILD_TIMEOUT_S = 1800

# Failures that are there on main too: a test file, class or test id (all tests under it) -> why. An entry goes once
# it passes; one starting "flaky:" fails only sometimes and is never reported as passing again.
KNOWN = {
    "test_fast": "crashes: access violation (0xc0000005) in the native module; not traced",
    "test_imagery": "crashes: access violation (0xc0000005) in the native module; not traced",
    "test_advance_sign_layout.AdvanceLayoutTest.test_atlas_is_the_bundled_font_regenerated_and_licensed":
        "fontTools is not in .venv",
    "test_bridge_clearance.MinimumBridgeClearanceTest.test_bridge_profiles_log_when_constraints_prevent_the_target":
        "the test's frame is None (AttributeError: enu_to_geodetic); not traced",
    "test_cache.LinkedCacheTest": "flaky: Windows lets only developer mode or admin make symlinks (WinError 1314)",
    "test_netfetch.TransportTest": "the fake connection takes no `context` argument, which netfetch passes",
    "test_otto_bridge.OttoBridgeTest": "expects BeamNG.Earth's original bridge limits; girders 4.16 m over the road "
                                       "instead of 6 m may be a real bug (buildings' HEADROOM_M set twice)",
    "test_overture_stac_bundle.BundleTest.test_every_layer_without_a_request":
        "requests base/land's collection.json; not traced",
    "test_us30_infrastructure.ActualUS30Test": "a cell key of its fixture is not found (KeyError); not traced",
}
# Test files that take minutes (they compute, no network): left out by --fast
SLOW = ("test_mapdata",)


def test_files(names=None, fast=False):
    """Module names of the test files in TESTS (without SLOW ones with fast), or names as given (with or without
    .py). Pure but for the listing."""
    if names:
        return [n[:-3] if n.endswith(".py") else n for n in names]
    return sorted(f[:-3] for f in os.listdir(TESTS) if f.startswith("test_") and f.endswith(".py")
                  and not (fast and f[:-3] in SLOW))


def known(tid):
    """The KNOWN key covering test id tid (a file, a class or the test itself; subtests included), or None. Pure."""
    return next((k for k in KNOWN if tid == k or tid.startswith(k + ".") or tid.startswith(k + " ")), None)


def run_child(name):
    """Run one test file here (a child process) and print its failures as a last line RESULT <json>:
    {"run": n, "bad": {test id: "fail" / "error"}}."""
    import unittest
    os.chdir(TESTS)
    sys.path.insert(0, TESTS)
    result = unittest.TestResult()
    unittest.defaultTestLoader.loadTestsFromName(name).run(result)
    bad = {t.id(): "fail" for t, _ in result.failures}
    bad.update({t.id(): "error" for t, _ in result.errors})
    bad.update({t.id(): "unexpected success" for t in result.unexpectedSuccesses})
    sys.stdout.flush()
    print("\nRESULT " + json.dumps({"run": result.testsRun, "bad": bad, "detail": {
        t.id(): text.strip().splitlines()[-1] for t, text in result.failures + result.errors}}), flush=True)


def run_file(name):
    """One test file in its own process -> (name, {"run", "bad", "detail"} or None when it crashed, output tail, s)."""
    t0 = time.perf_counter()
    try:
        p = subprocess.run([sys.executable, os.path.abspath(__file__), "--child", name], capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=FILE_TIMEOUT_S, cwd=TESTS)
        out = p.stdout + p.stderr
    except subprocess.TimeoutExpired:
        return name, None, f"timed out after {FILE_TIMEOUT_S} s", time.perf_counter() - t0
    lines = [ln for ln in p.stdout.splitlines() if ln.startswith("RESULT ")]
    res = json.loads(lines[-1][7:]) if lines else None
    tail = "" if res else f"exit code {p.returncode & 0xFFFFFFFF:#x}: " + " | ".join(out.strip().splitlines()[-3:])
    return name, res, tail, time.perf_counter() - t0


def unit_tests(names):
    """Run the test files in parallel and print what's new; -> (passed, the KNOWN keys that passed again)."""
    jobs = max(1, min(len(names), (os.cpu_count() or 2) // 2))     # (tests use the native module's threads too)
    new, healed, n_run, t0 = [], [], 0, time.perf_counter()
    with ThreadPoolExecutor(jobs) as ex:
        for name, res, tail, took in ex.map(run_file, names):
            if res is None:
                if name not in KNOWN:
                    new.append(f"{name}: crashed ({tail})")
                continue
            n_run += res["run"]
            hit = {known(tid) for tid in res["bad"]}
            new += [f"{tid}: {kind}: {res['detail'].get(tid, '')}" for tid, kind in res["bad"].items()
                    if known(tid) is None]
            healed += [k for k in KNOWN if (k == name or k.startswith(name + ".")) and k not in hit
                       and not KNOWN[k].startswith("flaky:")]
    print(f"Unit tests: {len(names)} files, {n_run} tests in {time.perf_counter() - t0:.0f} s "
          f"({len(KNOWN)} known failures in tools/check.py)")
    for line in new:
        print("  NEW  " + line)
    for k in healed:
        print(f"  passes now, remove from KNOWN: {k}")
    return not new, healed


def build_kn5(track):
    """Build test track `track` up to the kn5 into a temporary AC folder (a child process: a build's state is global);
    -> passed. Its log: out/build_check.log."""
    log_path = os.path.join(HERE, "out", "build_check.log")
    t0 = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="map2lap_check_") as ac, open(log_path, "w", encoding="utf-8") as log:
        try:
            p = subprocess.run([sys.executable, os.path.abspath(__file__), "--build-child", track, ac], stdout=log,
                               stderr=subprocess.STDOUT, timeout=BUILD_TIMEOUT_S, cwd=HERE)
            ok = p.returncode == 0
        except subprocess.TimeoutExpired:
            ok = False
        kn5 = os.path.join(ac, "content", "tracks", "check_" + track, "check_" + track + ".kn5")
        size = os.path.getsize(kn5) if os.path.exists(kn5) else 0
    ok = ok and size > 0
    print(f"kn5 build of {track}: {'passed' if ok else 'FAILED'} in {time.perf_counter() - t0:.0f} s"
          + (f", {size / 1e6:.0f} MB" if size else "") + ("" if ok else f" (log: {os.path.relpath(log_path, HERE)})"))
    if not ok:
        with open(log_path, encoding="utf-8", errors="replace") as f:
            print("  " + "\n  ".join(f.read().strip().splitlines()[-8:]))
    return ok


def build_child(track, ac):
    """Build test track `track` as "check_<track>" with AC at `ac` (a child process)."""
    sys.path.insert(0, os.path.join(HERE, "src"))
    import generator
    from track import make_track_folder
    make_track_folder.AC = ac
    with open(os.path.join(HERE, "tools", "test_tracks.json"), encoding="utf-8") as f:
        t = json.load(f)[track]
    generator.build(t["points"], t["width"], "check_" + track, t["title"])


def main():
    ap = argparse.ArgumentParser(description="unit tests and a kn5 build: pass or fail")
    ap.add_argument("files", nargs="*", help="only these test files (no build)")
    ap.add_argument("--fast", action="store_true", help="unit tests only")
    ap.add_argument("--child", help=argparse.SUPPRESS)
    ap.add_argument("--build-child", nargs=2, help=argparse.SUPPRESS)
    a = ap.parse_args()
    if a.child:
        return run_child(a.child)
    if a.build_child:
        return build_child(*a.build_child)
    ok, _ = unit_tests(test_files(a.files, a.fast))
    if not (a.fast or a.files):
        ok = build_kn5(TRACK) and ok
    print("PASSED" if ok else "FAILED")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
