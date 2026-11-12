"""Hot-reload our owned track script, with an exact-hash cleanup watcher for the existing session."""
import argparse
import ctypes
import hashlib
import json
from pathlib import Path
import subprocess
import sys

from context import MODE, MODES, RUNTIME, SCRIPT, SOURCE, STATE
KERNEL = ctypes.WinDLL('kernel32', use_last_error=True)
KERNEL.OpenProcess.argtypes = (ctypes.c_ulong, ctypes.c_int, ctypes.c_ulong)
KERNEL.OpenProcess.restype = ctypes.c_void_p
KERNEL.WaitForSingleObject.argtypes = (ctypes.c_void_p, ctypes.c_ulong)
KERNEL.CloseHandle.argtypes = (ctypes.c_void_p,)

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check ownership and source hash without changing AC')
    parser.add_argument('--cleanup', metavar='SHA256', help=argparse.SUPPRESS)
    args = parser.parse_args()
    state = json.loads(STATE.read_text())
    pid = state['pid']
    handle = KERNEL.OpenProcess(0x100000, False, pid)
    if not handle:
        raise ctypes.WinError(ctypes.get_last_error())
    if args.cleanup:
        try:
            while KERNEL.WaitForSingleObject(handle, 1000) == 258:
                pass
            expected = args.cleanup
            if SCRIPT.exists() and digest(SCRIPT.read_bytes()) == expected:
                SCRIPT.unlink()
            if MODE.exists() and MODE.read_text().strip() in MODES:
                MODE.unlink()
            (RUNTIME / 'updated-cleanup.json').write_text(json.dumps({'pid': pid, 'script_removed': not SCRIPT.exists(), 'mode_removed': not MODE.exists()}))
        finally:
            KERNEL.CloseHandle(handle)
        return
    try:
        if state['state'] != 'running' or KERNEL.WaitForSingleObject(handle, 0) != 258:
            raise RuntimeError('Owned AC test is not running')
        old = SCRIPT.read_bytes()
        manifest = json.loads((Path(state['backup']) / 'manifest.json').read_text())
        expected = manifest['written'][str(SCRIPT)]
        receipt = RUNTIME / 'updated-script.json'
        if receipt.exists():
            updated = json.loads(receipt.read_text())
            if updated.get('pid') == pid:
                expected = updated['sha256']
        if digest(old) != expected:
            raise RuntimeError('Track script changed independently')
        new = (SOURCE / 'weather.lua').read_bytes()
        new_hash = digest(new)
        if args.check:
            print(json.dumps({'pid': pid, 'owned': True, 'source_matches_installed': old == new,
                              'source_sha256': new_hash, 'runtime': str(RUNTIME)}, indent=2))
            return
        subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '--cleanup', new_hash],
                         creationflags=subprocess.CREATE_NO_WINDOW, cwd=SOURCE)
        SCRIPT.write_bytes(new)
        receipt.write_text(json.dumps({'pid': pid, 'sha256': new_hash}, indent=2))
        from snow_rust import ensure_running
        ensure_running()
        print('Updated own weather script; cleanup watcher active.', flush=True)
    finally:
        KERNEL.CloseHandle(handle)

if __name__ == '__main__':
    main()
