"""What a build's processes did, for when two builds of the same code differ: which worker built which tile, in which order
(what a process has seen can change what it makes), each cell's plan and the hash of its file (planned here, read from this
build's other processes or from the revisit cache), each revisit.fault with who called it. A build differing once can't be
asked again afterwards: this is on hand then.

One tab-separated file per process under BNGE_TRACE (time, process, thread, event, what, detail): tools/measure.py sets it to
out/trace/<track>, tools/build_trace.py reads it. Unset, as in the app, nothing is done. About 100 KB a track; no paths in it.
"""
import hashlib
import os
import sys
import threading
import time

ENV = "BNGE_TRACE"

_lock = threading.Lock()
_file = {}                  # the folder -> this process's open file


def note(event, what, detail=""):
    """One line, when a build traces (never raises: a trace mustn't stop a build)."""
    folder = os.environ.get(ENV)
    if not folder:
        return
    line = f"{time.time():.3f}\t{os.getpid()}\t{threading.current_thread().name}\t{event}\t{what}\t{detail}\n"
    try:
        with _lock:
            f = _file.get(folder)
            if f is None:
                os.makedirs(folder, exist_ok=True)
                f = _file[folder] = open(os.path.join(folder, f"{os.getpid()}.tsv"), "a", encoding="utf-8", buffering=1)
            f.write(line)
    except OSError:
        pass


def plan(event, key, src, detail=""):
    """A cell's plan: event its origin, key the cell (z, x, y), src its file's path or a file-like copy."""
    if not os.environ.get(ENV):
        return
    try:
        if hasattr(src, "getvalue"):
            data = src.getvalue()
        else:
            with open(src, "rb") as f:
                data = f.read()
    except OSError:
        return
    note(event, "/".join(str(int(v)) for v in key), hashlib.sha1(data).hexdigest()[:16] + (f" {detail}" if detail else ""))


def fault():
    """revisit.fault was called: where from (its caller and that one's)."""
    if not os.environ.get(ENV):
        return
    frames, f = [], sys._getframe(2)
    while f is not None and len(frames) < 2:
        frames.append(f"{os.path.basename(f.f_code.co_filename)}:{f.f_lineno}")
        f = f.f_back
    note("fault", " < ".join(frames))


def read(folder):
    """[(time, process, thread, event, what, detail)] of a trace's files, by time; [] when there is none. Pure but for the
    read."""
    rows = []
    try:
        names = os.listdir(folder)
    except OSError:
        return rows
    for name in names:
        if name.endswith(".tsv"):
            with open(os.path.join(folder, name), encoding="utf-8") as f:
                rows += [tuple(line.rstrip("\n").split("\t")) for line in f]
    return sorted((r for r in rows if len(r) == 6), key=lambda r: float(r[0]))


def summary(rows):
    """What read's rows say: {"tiles": {process: [tiles in order]}, "plans": {cell: {hash: {event: count}}}, "faults": {who:
    count}}. Pure."""
    tiles, plans, faults = {}, {}, {}
    for _t, proc, _th, event, what, detail in rows:
        if event == "tile":
            tiles.setdefault(proc, []).append(what)
        elif event in ("plan_made", "plan_read", "plan_kept"):
            one = plans.setdefault(what, {}).setdefault(detail.split(" ")[0], {})
            one[event] = one.get(event, 0) + 1
        elif event == "fault":
            faults[what] = faults.get(what, 0) + 1
    return {"tiles": tiles, "plans": plans, "faults": faults}
