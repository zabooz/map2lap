"""Several processes for the tile work: how many depends on the machine's cores and free RAM.

BeamNG.Earth's state (blockworker._s) is global, hence processes rather than threads; each builds it once in its
initializer. The cache copes with that (writes go through a temporary file + os.replace, pid in the name).
"""
import multiprocessing
import os
import time
from concurrent.futures import ProcessPoolExecutor

from app import system

GB_PER_WORKER = 1.5        # (measured: ~0.9 GB per process with BeamNG.Earth's state, plus headroom for big tiles)
SHARE = 1.0                # share of the logical cores (generator page: Settings, generator.py --cores)


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
    # (Not max_tasks_per_child: with it the pool hung under Python 3.12/Windows, tested. BeamNG.Earth keeps map and
    # elevation data in memory per process: on 300 km each process grew from 0.9 to 1.35 GB, which is fine.)
    # (spawn on Linux too, as on Windows: each worker starts clean and builds BeamNG.Earth's state in its initializer;
    # Linux' default fork would copy the parent's state and threads into it, and builds could differ between systems)
    return ProcessPoolExecutor(max_workers=n, initializer=initializer, initargs=initargs,
                               mp_context=multiprocessing.get_context("spawn"))
