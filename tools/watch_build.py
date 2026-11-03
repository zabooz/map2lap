"""Where a build's time goes: the machine, the build's steps and what every worker is doing, every 2 s from the moment a build
starts until it has ended, then a report. Start this, then the build, on the generator page or with measure.py.

    .venv\\Scripts\\python.exe -m pip install -r requirements-dev.txt     # once: psutil and py-spy
    .venv\\Scripts\\python.exe tools\\watch_build.py                      # the next build
    .venv\\Scripts\\python.exe tools\\watch_build.py --report out\\watch\\<run>      # that run's report again

A run's folder out/watch/<date_time> holds ticks.csv (per tick the load and what the page says), stacks.jsonl (each
process's stack), log.txt (the build's lines with the time they appeared) and report.txt. The report has the steps with their
seconds and load, the time only a few workers ran while the rest waited for them, the slowest tiles, and the functions
the processes were in, for the build and per step.

py-spy reads the processes without pausing them; that costs a core or two of 32, so a watched build takes a little longer
and shows the proportions rather than the exact time. Now and then a stack can't be read: stacks_ok in ticks.csv counts
those that could. Builds side by side (measure.py --all) mix in the steps: watch one to read the steps.
"""
import argparse
import collections
import csv
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
OUT = os.path.join(HERE, "out", "watch")
TICK_S = 2.0
AFTER_S = 15.0          # s after the last build process has gone until the watch ends: a next one in a row is the same run
MAX_S = 6 * 3600.0
STACK_TIMEOUT_S = 1.8   # s for one process's stack: less than a tick
BUSY_PCT = 50.0         # a process using this much of a core in a tick is working
FEW_WORKERS = 2         # at most this many of many workers running: the rest wait for them
MANY_WORKERS = 6        # (a short track's few workers each running on their own is no wait)
STATUS = "http://127.0.0.1:8800/api/status"
LOGS = os.path.join(HERE, "out", "build_*.log")
FRAME = re.compile(r"^\s+(.+?) \((.+):(\d+)\)\s*$")
THREAD = re.compile(r'Thread \S+ \(([^)]*)\): "MainThread"\n((?:\s+.*\(.*:\d+\)\s*\n)+)')
TILE = re.compile(r"Tile (\d+)/(\d+) \((-?\d+),(-?\d+)\): ([\d.]+) s")
# (a step starts with the first line matching; in the order a build runs)
STEPS = (("route", r"Calculating route"), ("tiles", r"Building tiles"), ("scenery", r"Scenery with"),
         ("far view", r"Distant terrain: \d+ tiles"), ("track folder", r"Writing track folder"),
         ("kn5 meshes", r"Writing kn5|Meshes with"), ("DDS", r"DDS textures"), ("done", r"^Done in|installed in AC"))
# files of Python and numpy, not ours: a stack with nothing else is waiting or in a library
LIBRARY = {"threading.py", "selectors.py", "queues.py", "connection.py", "synchronize.py", "thread.py", "process.py", "spawn.py",
           "_base.py", "<string>", "subprocess.py", "socket.py", "ssl.py", "_methods.py", "fromnumeric.py", "numeric.py",
           "_function_base_impl.py", "shape_base.py", "_shape_base_impl.py", "_arraysetops_impl.py", "__init__", "runpy.py",
           "<frozen runpy>", "<frozen importlib._bootstrap>", "<frozen importlib._bootstrap_external>"}
WAITING = "(waiting for a job)"
FIELDS = ["t", "clock", "tick_s", "cpu", "cores80", "free_gb", "disk_r_mb", "disk_w_mb", "net_r_mb", "net_s_mb", "workers",
          "workers_busy", "workers_cpu", "workers_gb", "workers_waiting", "stacks_ok", "build_cpu", "server_cpu", "state",
          "last"]


def role(name, cmd):
    """"worker", "build", "server" or None of a process's name and command line. Pure."""
    name, cmd = (name or "").lower(), cmd or ""
    for r in ("worker", "build", "server"):
        if name.startswith("map2lap " + r):
            return r
    if name.startswith("python"):
        if "spawn_main" in cmd:
            return "worker"
        if "generator.py" in cmd or "--build-one" in cmd:
            return "build"
        if "server.py" in cmd:
            return "server"
    return None


def parse_stack(text):
    """A py-spy dump's main thread: {"state", "frames": [(function, file, line)], innermost first}, or None. Pure."""
    m = THREAD.search(text)
    if not m:
        return None
    frames = []
    for line in m.group(2).splitlines():
        f = FRAME.match(line)
        if f:
            frames.append((f.group(1), os.path.basename(f.group(2).replace("\\", "/")), int(f.group(3))))
    return {"state": m.group(1), "frames": frames}


def ours(frames):
    """The frames of our code, innermost first. Pure."""
    return [f for f in frames if f[1] not in LIBRARY]


def waiting(frames):
    """Whether a worker's frames are a pool's waiting for its next job. Pure."""
    return any(f[1] == "queues.py" for f in frames) and not ours(frames)


def steps(lines, start=0.0):
    """The build's steps from its log [(t, clock, text)]: [(name, t, clock, text)] in time order, each at its first line from
    start on (the page keeps showing the last build's log until the next one). Pure."""
    out = []
    for t, clock, text in lines:
        if t < start:
            continue
        for name, pat in STEPS:
            if re.search(pat, text) and not any(m[0] == name for m in out):
                out.append((name, t, clock, text))
    return sorted(out, key=lambda m: m[1])


def step_at(marks, t):
    """The step running at t among marks (steps'), "before" ahead of the first. Pure."""
    name = "before"
    for m in marks:
        if t >= m[1]:
            name = m[0]
    return name


def slowest_tiles(lines, n=8):
    """The n slowest tiles in the log [(t, clock, text)]: [(seconds, (x, y), number)], slowest first; a tile's number is when
    it finished, so the slow ones come last whatever else goes on. Pure."""
    got = []
    for _t, _clock, text in lines:
        m = TILE.search(text)
        if m:
            got.append((float(m.group(5)), (int(m.group(3)), int(m.group(4))), int(m.group(1))))
    return sorted(got, reverse=True)[:n]


def few_running(ticks, few=FEW_WORKERS, many=MANY_WORKERS):
    """How many of the ticks show many workers of which only a few run. Pure."""
    return sum(1 for r in ticks if int(r["workers"]) >= many and int(r["workers_busy"]) <= few
               and int(r["workers_waiting"]) >= int(r["workers"]) - few)


def tally(records):
    """Per step of records [(step, stack)] how the samples spread: (samples, on the stack, innermost of ours). Pure."""
    samples, incl, inner = collections.Counter(), collections.defaultdict(collections.Counter), \
        collections.defaultdict(collections.Counter)
    for step, stack in records:
        frames = [tuple(f) for f in stack["frames"]]
        samples[step] += 1
        mine = ours(frames)
        if waiting(frames):
            incl[step][WAITING] += 1
            inner[step][WAITING] += 1
        elif mine:
            for name in {f"{f[0]} ({f[1]})" for f in mine}:
                incl[step][name] += 1
            inner[step][f"{mine[0][0]} ({mine[0][1]}:{mine[0][2]})"] += 1
        else:
            inner[step][f"(library) {frames[0][0] if frames else '?'}"] += 1
    return samples, incl, inner


def report(run, tick_s=TICK_S):
    """The report of the run in folder run as text, also written to its report.txt."""
    with open(os.path.join(run, "ticks.csv"), encoding="utf-8", newline="") as f:
        ticks = list(csv.DictReader(f))
    lines = []
    with open(os.path.join(run, "log.txt"), encoding="utf-8", errors="replace") as f:
        for line in f:
            t, clock, text = line.rstrip("\n").split("\t", 2)
            lines.append((float(t), clock, text))
    seen = [float(r["t"]) for r in ticks if float(r["build_cpu"] or 0) > 0 or int(r["workers"] or 0) > 0]
    if not seen:
        text = "No build seen in this run."
    else:
        text = _report_text(run, ticks, lines, min(seen), max(seen), tick_s)
    with open(os.path.join(run, "report.txt"), "w", encoding="utf-8") as f:
        f.write(text + "\n")
    return text


def _report_text(run, ticks, lines, start, end, tick_s):
    marks = steps(lines, start - tick_s)
    rows = collections.defaultdict(list)
    for r in ticks:
        if start <= float(r["t"]) <= end:
            rows[step_at(marks, float(r["t"]))].append(r)
    total = sum(len(v) for v in rows.values()) or 1
    gaps = [float(b["t"]) - float(a["t"]) for a, b in zip(ticks, ticks[1:])]
    out = [f"{len(ticks)} ticks, one every {sum(gaps) / max(len(gaps), 1):.2f} s, the longest took {max(float(r['tick_s']) for r in ticks):.2f} s; "
           f"build seen for {end - start:.0f} s", "",
           "step           seconds  share   cpu%  cores>80 workers  busy waiting  worker GB  disk r/w MB/s  net MB/s"]
    for name in [n for n in ["before"] + [m[0] for m in marks] if n in rows]:
        v = rows[name]

        def avg(k, v=v):
            return sum(float(x[k] or 0) for x in v) / max(len(v), 1)
        out.append(f"{name:14} {len(v) * tick_s:7.0f} {100 * len(v) / total:5.1f}% {avg('cpu'):6.0f} {avg('cores80'):9.1f} {avg('workers'):7.1f} "
                   f"{avg('workers_busy'):5.1f} {avg('workers_waiting'):7.1f} {avg('workers_gb'):10.1f} "
                   f"{avg('disk_r_mb'):7.1f}/{avg('disk_w_mb'):<6.1f} {avg('net_r_mb'):7.2f}")
    few = few_running([r for r in ticks if start <= float(r["t"]) <= end])
    out += ["", f"only {FEW_WORKERS} or fewer of {MANY_WORKERS}+ workers running, the rest waiting: {few * tick_s:.0f} s"]
    out += ["", "steps:"] + [f"  {m[1]:8.1f} s  {m[2]}  {m[0]:13} {m[3][:90]}" for m in marks]
    slow = slowest_tiles([x for x in lines if x[0] >= start - tick_s])
    if slow:
        out += ["", "slowest tiles (seconds, tile, finished as number):"]
        out += [f"  {s:7.1f} s  {xy}  {n}" for s, xy, n in slow]
    records = []
    with open(os.path.join(run, "stacks.jsonl"), encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            records += [(step_at(marks, rec["t"]), g) for g in rec["p"].values()]
    samples, incl, inner = tally(records)
    n = sum(samples.values()) or 1
    all_incl = collections.Counter()
    for c in incl.values():
        all_incl.update(c)
    out += ["", f"{n} samples of workers and builds ({n * tick_s / 60:.1f} process minutes); with this function on the stack:"]
    out += [f"  {100 * v / n:5.1f} %  {v * tick_s / 60:7.1f} proc-min  {k}" for k, v in all_incl.most_common(25)]
    for name in [m[0] for m in marks]:
        if samples[name]:
            out += ["", f"--- {name}: {samples[name]} samples; innermost of our code:"]
            out += [f"  {100 * v / samples[name]:5.1f} %  {k}" for k, v in inner[name].most_common(8)]
            out += ["  on the stack:"]
            out += [f"  {100 * v / samples[name]:5.1f} %  {k}" for k, v in incl[name].most_common(10)]
    return "\n".join(out)


def _need():
    """(psutil, the py-spy program), or exit saying how to install them."""
    try:
        import psutil
    except ImportError:
        psutil = None
    spy = shutil.which("py-spy") or next(iter(glob.glob(os.path.join(os.path.dirname(sys.executable), "py-spy*"))), None)
    if psutil is None or spy is None:
        sys.exit("watch_build needs psutil and py-spy: .venv\\Scripts\\python.exe -m pip install -r requirements-dev.txt")
    return psutil, spy


def _stack(spy, pid):
    """A process's main thread now (parse_stack), or None."""
    try:
        r = subprocess.run([spy, "dump", "--nonblocking", "--pid", str(pid)], capture_output=True, text=True, errors="replace",
                           timeout=STACK_TIMEOUT_S, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except (subprocess.TimeoutExpired, OSError):
        return None
    return parse_stack(r.stdout)


class _Log:
    """The build's lines as they appear: the page's log, and the logs measure.py's builds write (out/build_<name>.log)."""

    def __init__(self, opener):
        self.opener, self.page_seen, self.sizes = opener, 0, {}
        for p in glob.glob(LOGS):       # (from now on)
            self.sizes[p] = os.path.getsize(p)

    def status(self):
        try:
            with self.opener.open(STATUS, timeout=1.0) as r:
                return json.load(r)
        except (OSError, ValueError):
            return None

    def new_lines(self, st):
        out = []
        lines = (st or {}).get("log") or []
        if len(lines) < self.page_seen:         # (a new build: the page's log starts anew)
            self.page_seen = 0
        out += lines[self.page_seen:]
        self.page_seen = len(lines)
        for p in glob.glob(LOGS):
            size = os.path.getsize(p)
            if size != self.sizes.get(p, 0):
                start = self.sizes.get(p, 0) if size > self.sizes.get(p, 0) else 0
                with open(p, "rb") as f:
                    f.seek(start)
                    data = f.read()
                end = data.rfind(b"\n") + 1     # (whole lines; the rest next time)
                out += data[:end].decode("utf-8", "replace").splitlines()
                self.sizes[p] = start + end
        return out


def watch(tick_s=TICK_S, after_s=AFTER_S, max_s=MAX_S):
    """Watch until a build has come and gone (or max_s); returns the run's folder."""
    psutil, spy = _need()
    run = os.path.join(OUT, time.strftime("%Y%m%d_%H%M%S"))
    os.makedirs(run)
    print(f"Ready, every {tick_s:g} s: start the build. ({run})", flush=True)
    psutil.cpu_percent(percpu=True)
    disk0, net0 = psutil.disk_io_counters(), psutil.net_io_counters()
    cpu0, pool, t0 = {}, ThreadPoolExecutor(16), time.time()
    log = _Log(urllib.request.build_opener(urllib.request.ProxyHandler({})))
    seen_build, ended, last, previous, next_t = False, None, "", t0, t0 + tick_s
    with open(os.path.join(run, "ticks.csv"), "w", newline="", encoding="utf-8") as cf, \
            open(os.path.join(run, "stacks.jsonl"), "w", encoding="utf-8") as sf, \
            open(os.path.join(run, "log.txt"), "w", encoding="utf-8") as lf:
        w = csv.DictWriter(cf, FIELDS)
        w.writeheader()
        try:
            while time.time() - t0 < max_s:
                tick = time.time()
                dt, previous = max(tick - previous, 1e-3), tick
                cores = psutil.cpu_percent(percpu=True)
                disk, net, mem = psutil.disk_io_counters(), psutil.net_io_counters(), psutil.virtual_memory()
                procs, cpu1 = {"worker": [], "build": [], "server": []}, {}
                for p in psutil.process_iter(["pid", "name", "cmdline"]):
                    r = role(p.info["name"], " ".join(p.info["cmdline"] or []))
                    if r:
                        try:
                            c = p.cpu_times()
                            cpu1[p.pid] = c.user + c.system
                            procs[r].append((p.pid, cpu1[p.pid], p.memory_info().rss))
                        except psutil.Error:
                            pass

                def pct(pid, c):
                    return 100.0 * (c - cpu0.get(pid, c)) / dt
                workers, builds = procs["worker"], procs["build"]
                st = log.status()
                for line in log.new_lines(st):
                    lf.write(f"{tick - t0:.1f}\t{time.strftime('%H:%M:%S')}\t{line}\n")
                    last = line
                lf.flush()
                pids = [q[0] for q in workers] + [q[0] for q in builds]
                got = list(pool.map(lambda pid: _stack(spy, pid), pids))
                sf.write(json.dumps({"t": round(tick - t0, 2), "p": {str(i): g for i, g in zip(pids, got) if g}}) + "\n")
                sf.flush()
                w.writerow({
                    "t": round(tick - t0, 2), "clock": time.strftime("%H:%M:%S"), "tick_s": round(time.time() - tick, 2),
                    "cpu": round(sum(cores) / max(len(cores), 1), 1), "cores80": sum(1 for c in cores if c >= 80.0),
                    "free_gb": round(mem.available / 2 ** 30, 1),
                    "disk_r_mb": round((disk.read_bytes - disk0.read_bytes) / 2 ** 20 / dt, 1),
                    "disk_w_mb": round((disk.write_bytes - disk0.write_bytes) / 2 ** 20 / dt, 1),
                    "net_r_mb": round((net.bytes_recv - net0.bytes_recv) / 2 ** 20 / dt, 2),
                    "net_s_mb": round((net.bytes_sent - net0.bytes_sent) / 2 ** 20 / dt, 2),
                    "workers": len(workers), "workers_busy": sum(1 for pid, c, _ in workers if pct(pid, c) > BUSY_PCT),
                    "workers_cpu": round(sum(pct(pid, c) for pid, c, _ in workers)),
                    "workers_gb": round(sum(q[2] for q in workers) / 2 ** 30, 1),
                    "workers_waiting": sum(1 for g in got[:len(workers)] if g and waiting(g["frames"])),
                    "stacks_ok": sum(1 for g in got if g),
                    "build_cpu": round(sum(pct(pid, c) for pid, c, _ in builds)),
                    "server_cpu": round(sum(pct(pid, c) for pid, c, _ in procs["server"])),
                    "state": (st or {}).get("state", "no page"), "last": last[:100]})
                cf.flush()
                cpu0, disk0, net0 = cpu1, disk, net
                if builds:
                    if not seen_build:
                        print(f"Build seen at {time.strftime('%H:%M:%S')}.", flush=True)
                    seen_build, ended = True, None
                elif seen_build and ended is None:
                    ended = tick
                if ended and tick - ended >= after_s:
                    break
                next_t = max(next_t + tick_s, time.time())
                time.sleep(max(0.0, next_t - time.time()))
        except KeyboardInterrupt:
            print("Stopped.", flush=True)
    return run


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--report", help="only the report of this run's folder")
    ap.add_argument("--interval", type=float, default=TICK_S, help="s between the samples")
    a = ap.parse_args()
    print(report(a.report or watch(a.interval), a.interval))


if __name__ == "__main__":
    main()
