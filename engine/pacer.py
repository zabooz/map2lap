"""Duty-cycle pacing for the server's background analyses.

The game's rendering is very sensitive to memory bandwidth: one numpy thread streaming large arrays made
its shadow pass 5-6x slower (3.4 -> 19 ms), a pure CPU loop changed nothing (in-game, the server frozen
for the comparison). The colour-seam and de-shadow analyses (colormatch.py, deshadow.py) are exactly that
kind of work: ~24 s per region, region after region while the player explores, and they doubled the
game's frame cost in ~15 s bursts (in-game, the cycle stopped with the server frozen). Their
results are cached per region forever, so they can take longer: a thread that calls enable(duty) sleeps
at its pace() calls whenever it has been busy for SLICE_S, so that it runs at most `duty` of the time.

pace() is a no-op on threads that did not enable pacing (the tile and block builds share some of these
functions and keep full speed).
"""
import threading
import time

CLI_DUTY = 0.25     # earthd's --background-duty default

_local = threading.local()


def idle():
    """The thread is about to wait for work: its busy time starts again at the next job."""
    if getattr(_local, "duty", None) is not None:
        _local.t0 = time.perf_counter()


# --- the foreground gate -----------------------------------------------------------------------------------------
# While the player waits for a teleport's first terrain block (built in the server process), the server's background
# loops (the place's trees, water, imagery and road plans made ahead of need) hold before their next item: they share
# the interpreter with the block's grading, which took 10.6 s of a 16.9 s Baltimore block on a Steam Deck with them
# running (1.3 s on a desktop). They never hold longer than HOLD_MAX_S.
HOLD_MAX_S = 30.0

_fg = [0]
_fg_cv = threading.Condition()


def hold(max_s=HOLD_MAX_S):
    """Wait (at most max_s) while foreground work runs. Background loops call this between items, holding no lock."""
    with _fg_cv:
        if _fg[0]:
            _fg_cv.wait_for(lambda: _fg[0] == 0, timeout=max_s)
