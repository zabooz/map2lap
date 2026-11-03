"""Build the Rust module earthfast (Rust stable-x86_64-pc-windows-gnu) and put it in place as engine/earthfast.pyd.

    .venv\\Scripts\\python.exe tools\\build_native.py

Stop the generator page first: it locks the file. The Linux build (.so) is made in WSL, see AGENTS.md.
"""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))     # (the project folder)
NATIVE = os.path.join(HERE, "native", "earthfast")
ENGINE = os.path.join(HERE, "engine")
CARGO_BIN = os.path.join(os.path.expanduser("~"), ".cargo", "bin")
DLLTOOL = os.path.join(os.path.expanduser("~"), ".cargo", "dlltool-llvm")     # (copy of llvm-ar.exe, docs/rust.md)


def build_native():
    """Build earthfast and check that the new module has our grading rules (AC_EXPORT_YIELD)."""
    env = dict(os.environ, PATH=os.pathsep.join([DLLTOOL, CARGO_BIN, os.environ.get("PATH", "")]))
    print("Building earthfast (Rust) ...", flush=True)
    cargo = os.path.join(CARGO_BIN, "cargo.exe")
    r = subprocess.run([cargo if os.path.exists(cargo) else "cargo", "build", "--release"], cwd=NATIVE, env=env,
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(f"cargo build failed:\n{r.stdout[-3000:]}{r.stderr[-3000:]}")
    shutil.copyfile(os.path.join(NATIVE, "target", "release", "earthfast.dll"), os.path.join(ENGINE, "earthfast.pyd"))
    r = subprocess.run([sys.executable, "-c", "import earthfast; print(earthfast.VERSION, "
                        "getattr(earthfast, 'AC_EXPORT_YIELD', 0))"], cwd=ENGINE, capture_output=True, text=True)
    got = r.stdout.split()
    if r.returncode or len(got) != 2 or got[1] == "0":
        raise SystemExit(f"The new earthfast.pyd lacks our grading rules (AC_EXPORT_YIELD):\n{r.stdout}{r.stderr}")
    print(f"earthfast {got[0]} built.")


if __name__ == "__main__":
    sys.exit(build_native())
