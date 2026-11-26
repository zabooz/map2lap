"""One calculation per installed track. Only the server publishes worker output."""
from concurrent.futures import Future
from contextlib import contextmanager
from weakref import WeakValueDictionary
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading

from app import mytracks, named
from app.paths import SRC
from track import aihints, ailinestate, fastlane, objectlist, route_race


class Track:
    def __init__(self):
        self.condition = threading.Condition()
        self.revision = 0
        self.writing = False
        self.work = None
        self.phase = None


_tracks = WeakValueDictionary()
_registry_lock = threading.Lock()


def track(model):
    """Share a coordinator while any reader, writer or worker holds this installed track."""
    key = Path(model).parent.resolve()
    with _registry_lock:
        slot = _tracks.get(key)
        if slot is None:
            _tracks[key] = slot = Track()
        return slot


@contextmanager
def changing(model, *, drain=False):
    """Invalidate work before a Save or Rebuild replaces the installed model."""
    slot = track(model)
    with slot.condition:
        slot.condition.wait_for(lambda: not slot.writing)
        slot.writing = True
        slot.revision += 1
        if drain:
            slot.condition.wait_for(lambda: slot.work is None)
    try:
        yield
    finally:
        with slot.condition:
            slot.writing = False
            slot.condition.notify_all()


def compute(model, circuit, target):
    """Run the numerical calculation outside the server interpreter."""
    command = [named.exe("worker"), "-m", "app.ailanejobs", str(model), str(int(circuit)), str(target)]
    result = subprocess.run(command, cwd=SRC, env={**named.child_env(), "PYTHONIOENCODING": "utf-8"},
                            capture_output=True, text=True, encoding="utf-8")
    if result.returncode:
        raise ValueError(f"AI line worker exited with code {result.returncode}")
    return json.loads(result.stdout)


def _worker(model, circuit, target):
    key = None
    try:
        inputs = fastlane.lane_inputs(model, circuit, lambda line: None)
        key = ailinestate.fingerprint(inputs, circuit)
        skipped = fastlane.calculate(model, inputs, circuit, target, lambda line: None)
        return {"inputs": key, "skipped": skipped}
    except ailinestate.ERRORS as error:
        return {"inputs": key, "message": ailinestate.reason(error)}


def _failed(message):
    return {"status": "failed", "message": message}


def _calculate(model, circuit, slot, revision, original, key):
    # Same filesystem as the installed track for os.replace; outside the folder a Save may swap.
    with tempfile.TemporaryDirectory(dir=model.parent.parent, prefix=".map2lap_lane_") as temporary:
        target = Path(temporary) / "fast_lane.ai"
        answer = compute(model, circuit, target)
        with slot.condition:
            if revision[0] != slot.revision or revision[1] != objectlist.state_of(model):
                return None
            slot.phase = "Installing AI line …"
            current = ailinestate.input_key(model, circuit)
            if current != key:
                return None
            state = ailinestate.status(model.parent, key)
            if state != original:
                return state if state["status"] == "manual" else None
            if answer["inputs"] != key:
                return _failed(answer.get("message", "The worker read different track inputs. Please retry."))
            if route_race.ac_running():
                return _failed("Close Assetto Corsa before replacing the AI line.")
            if message := answer.get("message"):
                if original["status"] not in ("ready", "manual"):
                    ailinestate.mark_outdated(model.parent, key, message)
                return _failed(message)
            ailinestate.publish(model.parent, key, target, answer.get("skipped"), circuit=circuit)
            return ailinestate.status(model.parent, key)


def ensure(model, circuit, *, force=False, retry=False, saved_inputs=None):
    """Check the installed inputs, sharing an in-flight calculation with all waiters."""
    model = Path(model)
    slot = track(model)
    while True:
        with slot.condition:
            slot.condition.wait_for(lambda: not slot.writing)
            future = slot.work
            if future is None:
                slot.phase = "Checking AI line inputs …"
                try:
                    try:
                        key = ailinestate.input_key(model, circuit)
                    except ailinestate.ERRORS as error:
                        message = ailinestate.reason(error)
                        if model.is_file() and not route_race.ac_running():
                            ailinestate.mark_outdated(model.parent, None, message)
                        return _failed(message)
                    if saved_inputs is not None and key != saved_inputs:
                        return {"status": "superseded"}
                    original = ailinestate.status(model.parent, key)
                    requested = original["status"] == "pending" or (retry and original["status"] in ("manual", "failed"))
                    if not (force or requested):
                        return original
                    if route_race.ac_running():
                        return _failed("Close Assetto Corsa before calculating the AI line.")
                    revision = slot.revision, objectlist.state_of(model)
                except ailinestate.ERRORS as error:
                    return _failed(ailinestate.reason(error))
                finally:
                    slot.phase = None
                slot.work = Future()
                slot.phase = "Calculating AI line …"
        if future is not None:
            result = future.result()
            if saved_inputs is not None and result is not None and result.get("inputs", saved_inputs) != saved_inputs:
                continue
        else:
            result = _failed("AI line worker stopped unexpectedly.")
            try:
                result = _calculate(model, circuit, slot, revision, original, key)
            except ailinestate.ERRORS as error:
                result = _failed(ailinestate.reason(error))
            finally:
                with slot.condition:
                    slot.work.set_result(result)
                    slot.work = slot.phase = None
                    slot.condition.notify_all()
        if result is not None:
            return result
        with slot.condition:
            slot.condition.wait_for(lambda: not slot.writing)
            info = mytracks.load(model.parent)
            if info and (info.get("area") or mytracks.is_circuit(model.parent) != circuit):
                return _failed("Track type changed. Reopen the track and try again.")


def race(model, circuit, choice, launch):
    """Prepare this exact installed revision before handing a Race to AC."""
    slot = track(model)
    force = choice.get("recalculate") is True
    while True:
        state = ensure(model, circuit, force=force)
        force = False
        if state["status"] == "failed":
            return 409, {"lane": "failed", "error": state["message"]}
        if state["status"] == "manual":
            token = state["inputs"] + "." + state["lane"]
            if choice.get("useInstalled") != token:
                return 409, {"lane": "manual", "token": token, "error": "The installed AI line was replaced by hand."}
            try:
                fastlane.read_lane(model.parent / fastlane.FILE)
            except ailinestate.ERRORS as error:
                return 409, {"lane": "failed", "error": ailinestate.reason(error)}
        with slot.condition:
            if slot.writing or slot.work:
                continue
            try:
                if ailinestate.inspect(model, circuit) != state:
                    continue
                # A manually accepted lane or a pre-hints build can reach Race without a new publication.
                if (state["status"] == "manual" or not (model.parent / aihints.FILE).is_file()) and not route_race.ac_running():
                    aihints.sync(model.parent, circuit)
            except ailinestate.ERRORS as error:
                return 409, {"lane": "failed", "error": ailinestate.reason(error)}
            return launch()


if __name__ == "__main__":
    print(json.dumps(_worker(Path(sys.argv[1]), bool(int(sys.argv[2])), Path(sys.argv[3]))))
