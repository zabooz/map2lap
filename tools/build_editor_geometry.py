"""Build the Editor's portable Rust/WebAssembly geometry kernel. Users need no Rust installation.

    .venv\\Scripts\\python.exe tools\\build_editor_geometry.py
"""
import getpass
import argparse
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    """Compile the Rust source and publish its wasm only after checking for private build paths."""
    (ROOT / "out").mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="editor-geometry-", dir=ROOT / "out") as folder:
        output = Path(folder) / "editorgeometry.wasm"
        subprocess.run(["rustc", "--edition=2021", "--crate-type", "cdylib", "--target", "wasm32-unknown-unknown",
                        "-O", "-C", "panic=abort", "-C", "strip=symbols",
                        f"--remap-path-prefix={Path.home()}=~", f"--remap-path-prefix={ROOT}=.",
                        str(ROOT / "native/editorgeometry/regions.rs"), "-o", str(output)], check=True)
        raw = output.read_bytes()
        for private in (getpass.getuser(), str(Path.home()), str(ROOT)):
            if private.lower().encode() in raw.lower() or private.lower().encode("utf-16-le") in raw.lower():
                raise SystemExit("The geometry kernel still contains a private build path")
        target = ROOT / "ui/assets/editorgeometry.wasm"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        print(f"Editor geometry kernel: {len(raw)} bytes (Windows and Linux browsers)")


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__).parse_args()
    main()
