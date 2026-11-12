"""Build/start the optional snow geometry worker, or stop it; requires an owned running preview."""
import argparse
import ctypes
import json
import mmap
from pathlib import Path
import struct
import subprocess
import sys
import time

from context import COMMON_ROOT, RUNTIME, STATE

CHANNEL = 'Local\\AcTools.CSP.Limited.Map2Lap.SnowGeometry.v1'
MAGIC = 0x4D32534E

def ensure_running():
    """Start the existing development binary for this preview; retain Lua if it is unavailable."""
    try:
        result = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--no-build'], capture_output=True,
                                text=True, timeout=10, creationflags=subprocess.CREATE_NO_WINDOW)
    except (OSError, subprocess.TimeoutExpired) as error:
        print('Rust snow unavailable; Lua fallback:', error, flush=True)
        return False
    if result.returncode:
        print('Rust snow unavailable; Lua fallback:', result.stderr.strip().splitlines()[-1], flush=True)
        return False
    return True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stop', action='store_true')
    parser.add_argument('--no-build', action='store_true', help='Start the existing binary without requiring Rust')
    args = parser.parse_args()
    session = json.loads(STATE.read_text())
    receipt = RUNTIME / 'rust-snow-worker.json'
    if args.stop:
        state = json.loads(receipt.read_text())
        with mmap.mmap(-1, state['bytes'], tagname=CHANNEL, access=mmap.ACCESS_WRITE) as shared:
            magic, protocol, ac_pid = struct.unpack_from('<III', shared)
            if magic != MAGIC or protocol != 1 or ac_pid != session['pid']:
                raise RuntimeError('Snow worker ownership mismatch')
            struct.pack_into('<I', shared, 20, 1)
        print('Requested snow worker shutdown; Lua fallback remains available.')
        return
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.argtypes = (ctypes.c_ulong, ctypes.c_int, ctypes.c_ulong)
    kernel.OpenProcess.restype = ctypes.c_void_p
    kernel.WaitForSingleObject.argtypes = (ctypes.c_void_p, ctypes.c_ulong)
    kernel.CloseHandle.argtypes = (ctypes.c_void_p,)
    handle = kernel.OpenProcess(0x100000, False, session['pid'])
    if not handle or session['state'] != 'running' or kernel.WaitForSingleObject(handle, 0) != 258:
        raise RuntimeError('Owned AC preview is not running')
    kernel.CloseHandle(handle)
    if receipt.exists():
        old = json.loads(receipt.read_text())
        if old.get('ac_pid') == session['pid']:
            with mmap.mmap(-1, old['bytes'], tagname=CHANNEL, access=mmap.ACCESS_WRITE) as shared:
                if struct.unpack_from('<I', shared, 0)[0] == MAGIC and struct.unpack_from('<I', shared, 20)[0] == 0:
                    worker = kernel.OpenProcess(0x100000, False, old['pid'])
                    if worker:
                        alive = kernel.WaitForSingleObject(worker, 0) == 258
                        kernel.CloseHandle(worker)
                        if alive:
                            print('Snow worker already running.')
                            return
                    struct.pack_into('<I', shared, 20, 1)
    target = COMMON_ROOT / 'out/rust-snow'
    target.mkdir(parents=True, exist_ok=True)
    exe = target / 'snow-worker.exe'
    if not args.no_build:
        subprocess.run(['rustc', '--edition=2021', '-C', 'opt-level=3', '-C', 'panic=abort',
                    '--remap-path-prefix', str(COMMON_ROOT) + '=workspace',
                        str(Path(__file__).with_name('snow_worker.rs')), '-o', str(exe)], check=True)
    elif not exe.exists():
        raise RuntimeError('Build snow-worker.exe once with snow_rust.py before using automatic startup')
    log = target / 'worker.stdout'
    with log.open('w') as stdout, (target / 'worker.stderr').open('w') as stderr:
        process = subprocess.Popen([str(exe), str(session['pid'])], cwd=target, stdout=stdout, stderr=stderr,
                                   creationflags=subprocess.CREATE_NO_WINDOW)
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        lines = log.read_text().splitlines()
        if lines:
            state = json.loads(lines[0])
            state.update(executable=str(exe), started=time.time())
            receipt.write_text(json.dumps(state, indent=2))
            print(json.dumps(state, indent=2))
            return
        if process.poll() is not None:
            raise RuntimeError((target / 'worker.stderr').read_text())
        time.sleep(0.025)
    process.terminate()
    raise RuntimeError('Snow worker startup timed out')

if __name__ == '__main__':
    main()
