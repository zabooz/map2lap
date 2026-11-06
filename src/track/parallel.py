"""Several processes for the tile work: how many depends on the machine's cores and free RAM.

BeamNG.Earth's state (blockworker._s) is global, hence processes rather than threads; each builds it once in its
initializer. The cache copes with that (writes go through a temporary file + os.replace, pid in the name).
"""
import multiprocessing
import os
import random
import time
from concurrent.futures import ProcessPoolExecutor

from app import named, system

GB_PER_WORKER = 2.0        # (measured on a 307 km track of 2433 tiles, 31 workers: at most 55 GB together, 1.78 GB each; ~0.9 GB on a short one)
SHARE = 1.0                # share of the logical cores (generator page: Settings, generator.py --cores)
ORDER_ENV = "BNGE_TILE_ORDER"       # the order a build hands out its tiles, to test that it doesn't matter (tile_order)


def workers(jobs=None):
    """Processes: all logical cores but one (the machine stays usable) or the share SHARE of them, at most as many as
    free RAM allows, and no more than there are jobs."""
    cpu = os.cpu_count() or 2
    n = min(61 if system.WIN else cpu, max(1, cpu - 1), max(1, round(cpu * SHARE)))   # (61: the pool's Windows limit)
    ram = system.free_ram_gb()
    if ram is not None:
        n = min(n, max(1, int(ram / GB_PER_WORKER)))
    if jobs is not None:
        n = min(n, max(1, jobs))
    return n


def tile_order(tiles, how):
    """tiles [(tx, ty)] in the order how: None or forward as they are, reverse, shuffle:<seed>, first:<tx>,<ty>, last:<tx>,<ty>.
    A track must come out the same in any of them (tools/stability.py). Pure."""
    tiles = list(tiles)
    kind, _, arg = (how or "forward").partition(":")
    if kind == "forward":
        return tiles
    if kind == "reverse":
        return tiles[::-1]
    if kind == "shuffle":
        random.Random(int(arg)).shuffle(tiles)
        return tiles
    if kind in ("first", "last"):
        one = tuple(int(v) for v in arg.split(","))
        if one not in tiles:
            raise ValueError(f"tile {arg} is not in this track")
        rest = [t for t in tiles if t != one]
        return [one] + rest if kind == "first" else rest + [one]
    raise ValueError(f"no such tile order: {how}")


LOCK_WAITS = (0.05, 0.2, 0.5, 1.0, 2.0)      # s between the attempts of retry_locked (~3.8 s in all)


def retry_locked(fn):
    """fn(), and again on PermissionError: on Windows a cache file is locked for a moment while another process
    replaces it (os.replace) or the virus scanner checks it. BeamNG.Earth only retries writing
    (staging.replace_cached), not reading; with 31 processes it hit a tree cell (cache/vegetation/*.npz)."""
    for wait in LOCK_WAITS + (None,):
        try:
            return fn()
        except PermissionError:
            if wait is None:
                raise
            time.sleep(wait)


def pool(n, initializer=None, initargs=()):
    # (Not max_tasks_per_child: with it the pool hung under Python 3.12/Windows, tested; 3.14 untried. BeamNG.Earth
    # keeps map and elevation data in memory per process: on 300 km each process grows from 0.9 to about 1.8 GB (GB_PER_WORKER), which is
    # fine.)
    # (spawn on Linux too, as on Windows: each worker starts clean and builds BeamNG.Earth's state in its initializer;
    # Linux' default fork would copy the parent's state and threads into it, and builds could differ between systems)
    ctx = multiprocessing.get_context("spawn")
    named.use_for_workers(ctx)
    return ProcessPoolExecutor(max_workers=n, initializer=initializer, initargs=initargs, mp_context=ctx)
