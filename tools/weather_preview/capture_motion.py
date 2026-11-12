"""Record bounded, same-draw glass depth, scene and motion metadata from the owned AC preview."""
import argparse
import ctypes
import json
import mmap
import struct
import time

from context import MODE, RUNTIME, STATE

CHANNEL = 'Local\\AcTools.CSP.Limited.Map2Lap.GlassCapture.v1'
MAGIC = 0x4D324C43
META = 65536
DEPTH = 8388608
VIEW = 4194304
SIZE = 32 + META + DEPTH + VIEW


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seconds', type=float, default=6)
    parser.add_argument('--hz', type=float, default=10)
    args = parser.parse_args()
    if not 0 < args.seconds <= 20 or not 0 < args.hz <= 20:
        parser.error('Capture is bounded to 20 seconds and 20 samples/second')
    state = json.loads(STATE.read_text())
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.argtypes = (ctypes.c_ulong, ctypes.c_int, ctypes.c_ulong)
    kernel.OpenProcess.restype = ctypes.c_void_p
    kernel.WaitForSingleObject.argtypes = (ctypes.c_void_p, ctypes.c_ulong)
    kernel.CloseHandle.argtypes = (ctypes.c_void_p,)
    handle = kernel.OpenProcess(0x100000, False, state['pid'])
    if state['state'] != 'running' or not handle:
        raise RuntimeError('No owned AC preview')
    destination = RUNTIME / ('motion-' + time.strftime('%Y%m%d-%H%M%S'))
    destination.mkdir()
    old_mode = MODE.read_bytes()
    count = 0
    started = time.monotonic()
    try:
        with mmap.mmap(-1, SIZE, tagname=CHANNEL, access=mmap.ACCESS_WRITE) as shared:
            struct.pack_into('<8I', shared, 0, MAGIC, 1, 0, 0, 0, 0, 0, 0)
            MODE.write_text('glasscapture', encoding='utf-8')
            with (destination / 'frames.jsonl').open('w') as metadata:
                while time.monotonic() - started < args.seconds + 3:
                    if kernel.WaitForSingleObject(handle, 0) != 258:
                        break
                    request = count + 1
                    struct.pack_into('<I', shared, 8, request)
                    deadline = time.monotonic() + 2
                    while struct.unpack_from('<I', shared, 12)[0] != request:
                        if time.monotonic() > deadline:
                            raise RuntimeError('No complete capture from Lua; inspect CSP log')
                        time.sleep(0.005)
                    _, _, _, _, depth_size, view_size, meta_size, error = struct.unpack_from('<8I', shared)
                    if error:
                        raise RuntimeError('Lua capture failed; inspect CSP log')
                    if not (0 < depth_size <= DEPTH and 0 < view_size <= VIEW and 0 < meta_size <= META):
                        raise RuntimeError('Invalid capture lengths')
                    record = json.loads(shared[32:32 + meta_size])
                    record['sequence'] = request
                    metadata.write(json.dumps(record) + '\n')
                    metadata.flush()
                    (destination / f'{request:04d}-depth.dds').write_bytes(shared[32 + META:32 + META + depth_size])
                    offset = 32 + META + DEPTH
                    (destination / f'{request:04d}-view.dds').write_bytes(shared[offset:offset + view_size])
                    count += 1
                    if count >= round(args.seconds * args.hz):
                        break
                    time.sleep(1 / args.hz)
            struct.pack_into('<I', shared, 4, 0)
    finally:
        # Only restore our command; preserve a mode the user chose during capture.
        if MODE.exists() and MODE.read_text().strip() == 'glasscapture':
            MODE.write_bytes(old_mode)
        kernel.CloseHandle(handle)
        (destination / 'capture.json').write_text(json.dumps({
            'ac_pid': state['pid'], 'frames': count, 'requested_hz': args.hz,
            'purpose': 'motion evidence; not a performance measurement',
            'view': 'same-draw HDR scene copy, diagnostic tone mapping; not final AC tonemapping',
        }, indent=2))
        print(destination)


if __name__ == '__main__':
    main()
