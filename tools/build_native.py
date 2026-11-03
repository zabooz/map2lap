"""Build the Rust module earthfast and put it in place: engine/earthfast.pyd (Rust stable-x86_64-pc-windows-gnu) and,
with --linux, engine/earthfast.abi3.so (in WSL, Ubuntu-24.04: docs/rust.md).

    .venv\\Scripts\\python.exe tools\\build_native.py [--linux]

Stop the generator page first: it locks the file. The builder's home folder is written as ~ into the module's paths
(--remap-path-prefix: panic messages and debug info carry the source files' paths), and a module that still names the
user is not put in place.
"""
import getpass
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
NATIVE = os.path.join(HERE, "native", "earthfast")
ENGINE = os.path.join(HERE, "engine")
HOME = os.path.expanduser("~")
CARGO_BIN = os.path.join(HOME, ".cargo", "bin")
DLLTOOL = os.path.join(HOME, ".cargo", "dlltool-llvm")     # (copy of llvm-ar.exe, docs/rust.md)
WSL = ["wsl", "-d", "Ubuntu-24.04", "--exec"]     # (--exec: no shell of its own expands the script first)


def names_user(path, users):
    """How often the file at path names one of users (any case). Pure but for the read."""
    data = open(path, "rb").read().lower()
    return sum(data.count(u.lower().encode()) for u in users if u)


def orphan_imports(path):
    """The names of the imports in a PE file's import address table that no import descriptor covers: Windows never
    fills their slots, so a call through one jumps to the name's own address and crashes. Pure but for the read.

    windows-link 0.2 (raw-dylib, through wgpu's libloading, parking_lot_core, windows-sys) gave earthfast.pyd 13 of them
    (GetSystemInfo, SetLastError, CloseHandle, ...) with this toolchain's dlltool: std::thread and std::env crashed.
    Cargo.lock keeps those crates at their versions before it."""
    b = open(path, "rb").read()
    u16 = lambda o: int.from_bytes(b[o:o + 2], "little")
    u32 = lambda o: int.from_bytes(b[o:o + 4], "little")
    u64 = lambda o: int.from_bytes(b[o:o + 8], "little")
    nt = u32(0x3C)
    nsec, opt_size = u16(nt + 6), u16(nt + 20)
    sec = nt + 24 + opt_size
    sections = [(u32(s + 12), u32(s + 8), u32(s + 20)) for s in range(sec, sec + 40 * nsec, 40)]  # (rva, size, raw)

    def off(rva):
        for va, size, raw in sections:
            if va <= rva < va + size:
                return raw + rva - va
        raise ValueError(f"RVA {rva:#x} outside the sections")

    spans, d = [], off(u32(nt + 24 + 112 + 8))
    while u32(d + 12):
        ft, n = u32(d + 16), 0
        while u64(off(u32(d + 16)) + 8 * n):
            n += 1
        spans.append((ft, ft + 8 * (n + 1)))       # (with its terminator)
        d += 20
    out = []
    for a in range(min(s for s, _ in spans), max(e for _, e in spans), 8):
        v = u64(off(a))
        if v and not v >> 63 and not any(s <= a < e for s, e in spans):
            name = b[off(v) + 2:off(v) + 66].split(b"\0")[0]
            out.append(name.decode("latin1"))
    return out


def check(built, dest, users, probe=True):
    """built copied to dest once it names none of users, every import is bound (Windows) and (probe) it imports with
    our grading rules."""
    n = names_user(built, users)
    if n:
        raise SystemExit(f"{os.path.basename(built)} still names the user {n} times: not put in place")
    orphans = orphan_imports(built) if built.endswith(".dll") else []
    if orphans:
        raise SystemExit(f"{os.path.basename(built)} has imports no descriptor covers (they would crash when called): "
                         f"{', '.join(orphans)}. Not put in place: see orphan_imports")
    shutil.copyfile(built, dest)
    if not probe:
        return
    r = subprocess.run([sys.executable, "-c", "import earthfast; print(earthfast.VERSION, "
                        "getattr(earthfast, 'AC_EXPORT_YIELD', 0))"], cwd=ENGINE, capture_output=True, text=True)
    got = r.stdout.split()
    if r.returncode or len(got) != 2 or got[1] == "0":
        raise SystemExit(f"The new earthfast.pyd lacks our grading rules (AC_EXPORT_YIELD):\n{r.stdout}{r.stderr}")
    print(f"earthfast {got[0]} built.")


def build_windows():
    """cargo build of earthfast.dll with the home folder remapped, as engine/earthfast.pyd."""
    flags = f"{os.environ.get('RUSTFLAGS', '')} --remap-path-prefix={HOME}=~".strip()
    env = dict(os.environ, PATH=os.pathsep.join([DLLTOOL, CARGO_BIN, os.environ.get("PATH", "")]), RUSTFLAGS=flags)
    print("Building earthfast (Rust, Windows) ...", flush=True)
    cargo = os.path.join(CARGO_BIN, "cargo.exe")
    r = subprocess.run([cargo if os.path.exists(cargo) else "cargo", "build", "--release", "--locked"], cwd=NATIVE,
                       env=env, capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(f"cargo build failed:\n{r.stdout[-3000:]}{r.stderr[-3000:]}")
    check(os.path.join(NATIVE, "target", "release", "earthfast.dll"), os.path.join(ENGINE, "earthfast.pyd"),
          [getpass.getuser()])


def build_linux():
    """The same in WSL (its own target folder keeps it apart), as engine/earthfast.abi3.so: WSL's home and the
    Windows home it sees the project under (/mnt/c/Users/...) remapped."""
    wsl_user = subprocess.run(WSL + ["whoami"], capture_output=True, text=True).stdout.strip()
    drive, rest = os.path.splitdrive(HOME)
    mnt_home = f"/mnt/{drive[0].lower()}{rest.replace(os.sep, '/')}"
    mnt_native = f"/mnt/{NATIVE[0].lower()}{os.path.splitdrive(NATIVE)[1].replace(os.sep, '/')}"
    script = (f'export PATH="$HOME/.cargo/bin:$PATH" RUSTFLAGS="--remap-path-prefix=$HOME=~ '
              f'--remap-path-prefix={mnt_home}=~" CARGO_TARGET_DIR="$HOME/earthfast-target" && '
              f'cd "{mnt_native}" && cargo build --release --locked && '
              f'cp "$CARGO_TARGET_DIR/release/libearthfast.so" "{mnt_native}/target/libearthfast.so"')
    print("Building earthfast (Rust, Linux in WSL) ...", flush=True)
    r = subprocess.run(WSL + ["bash", "-lc", script], capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(f"cargo build (WSL) failed:\n{r.stdout[-3000:]}{r.stderr[-3000:]}")
    check(os.path.join(NATIVE, "target", "libearthfast.so"), os.path.join(ENGINE, "earthfast.abi3.so"),
          [getpass.getuser(), re.sub(r"\W", "", wsl_user)], probe=False)
    print("earthfast.abi3.so built.")


if __name__ == "__main__":
    build_windows()
    if "--linux" in sys.argv:
        build_linux()
