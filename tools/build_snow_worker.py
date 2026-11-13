"""Build the shipped snow helper for Windows and AC's Proton environment; users need no Rust compiler.

    .venv\\Scripts\\python.exe tools\\build_snow_worker.py
"""
import argparse
import getpass
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from pe_imports import orphan_imports

ROOT = Path(__file__).resolve().parents[1]


def main():
    """Build and validate one Windows executable, shared by Windows and Linux/Proton releases."""
    home = Path.home()
    rustc = home / '.cargo/bin/rustc.exe'
    env = {**os.environ, 'PATH': os.pathsep.join([str(home / '.cargo/dlltool-llvm'), str(home / '.cargo/bin'), os.environ.get('PATH', '')])}
    (ROOT / 'out').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='snow-build-', dir=ROOT / 'out') as folder:
        output = Path(folder) / 'snow-worker.exe'
        subprocess.run([str(rustc) if rustc.is_file() else 'rustc', '--edition=2021',
                        '--target', 'x86_64-pc-windows-gnu', '-O', '-C', 'panic=abort', '-C', 'strip=symbols',
                        f'--remap-path-prefix={home}=~', f'--remap-path-prefix={ROOT}=.',
                        str(ROOT / 'native/snowworker/main.rs'), '-o', str(output)], env=env, check=True)
        raw = output.read_bytes().lower()
        for private in (getpass.getuser(), str(home), str(ROOT)):
            if any(private.lower().encode(encoding) in raw for encoding in ('utf-8', 'utf-16-le')):
                raise SystemExit('The snow helper contains a private build path')
        if orphan_imports(str(output)):
            raise SystemExit('The snow helper has unbound Windows imports')
        target = ROOT / 'src/bin/snow-worker.exe'
        target.parent.mkdir(exist_ok=True)
        shutil.copyfile(output, target)
        inputs = ('native/snowworker/main.rs', 'tools/build_snow_worker.py')
        hashes = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in inputs}
        hashes['src/bin/snow-worker.exe'] = hashlib.sha256(target.read_bytes()).hexdigest()
        target.with_suffix('.json').write_text(json.dumps(hashes, indent=2) + '\n', encoding='utf-8')
        print(f'Snow helper: {target.name}, {len(raw)} bytes (Windows and Linux/Proton)')


if __name__ == '__main__':
    argparse.ArgumentParser(description=__doc__).parse_args()
    main()
