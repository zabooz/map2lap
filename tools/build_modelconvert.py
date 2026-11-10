"""Build the bundled FBX/OBJ reader for Windows and Linux, without touching earthfast or a running server.

    .venv\\Scripts\\python.exe tools\\build_modelconvert.py [--linux]
"""
import argparse
import getpass
import json
import os
from pathlib import Path
import shutil
import subprocess

from pe_imports import orphan_imports

ROOT = Path(__file__).resolve().parents[1]


def check_private(built, names=()):
    """Reject builder names/paths in UTF-8 and UTF-16 before a binary enters the release."""
    raw = built.read_bytes().lower()
    for name in (getpass.getuser(), str(Path.home()), *names):
        if any(name.lower().encode(encoding) in raw for encoding in ('utf-8', 'utf-16-le')):
            raise SystemExit('The converter still contains a private builder name or path')


def publish(built, target):
    """Publish a binary only when private builder names and unbound Windows imports are absent."""
    check_private(built)
    if target.suffix == '.exe' and orphan_imports(str(built)):
        raise SystemExit('The converter has unbound Windows imports')
    shutil.copyfile(built, target)


def licenses(crate, destination):
    """Keep the notices of the linked libraries beside both platform binaries."""
    metadata = json.loads(subprocess.check_output(['cargo', 'metadata', '--format-version=1', '--locked', '--offline'], cwd=crate))
    linked = {'ufbx', 'serde_json', 'serde_core', 'itoa', 'memchr', 'zmij', 'meshopt', 'bitflags', 'float-cmp', 'num-traits', 'thiserror'}
    texts = ['Third-party libraries linked into the Map2Lap FBX/OBJ converter.\n']
    for package in sorted(metadata['packages'], key=lambda item: item['name']):
        if package['name'] not in linked:
            continue
        folder = Path(package['manifest_path']).parent
        texts.append('\n--- ' + package['name'] + ' ' + package['version'] + ' ---\n')
        for file in sorted(folder.glob('LICENSE*')):
            if file.is_file():
                texts.append(file.read_text(encoding='utf-8'))
        for file in (folder / 'ufbx').glob('LICENSE*'):
            if file.is_file():
                texts.append(file.read_text(encoding='utf-8'))
        if package['name'] == 'meshopt':
            # meshopt's crate archive omits LICENSE files; the upstream MIT text is in its public header.
            header = (folder / 'vendor/src/meshoptimizer.h').read_text(encoding='utf-8')
            texts.append(header[header.rfind('/**'):])
            texts.append((crate / 'licenses/meshopt-MIT.txt').read_text(encoding='utf-8'))
    (destination / 'THIRD_PARTY_LICENSES.txt').write_text('\n'.join(texts), encoding='utf-8')


def main():
    """Build Windows, and optionally Linux through WSL, with private builder paths removed."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--linux', action='store_true', help='also build Linux through WSL')
    args = parser.parse_args()
    crate = ROOT / 'native/modelconvert'
    destination = ROOT / 'src/bin'
    destination.mkdir(exist_ok=True)
    env = dict(os.environ)
    env['RUSTFLAGS'] = '--remap-path-prefix=' + str(Path.home()) + '=~'
    env['CFLAGS'] = '-ffile-prefix-map=' + str(Path.home()) + '=~'
    env['CXXFLAGS'] = env['CFLAGS']
    # A developer can use MinGW's GCC, or a local Zig download, without adding a compiler to the release.
    zig = ROOT / 'out/model-converters/zig/ziglang/zig.exe'
    if not shutil.which('gcc') and zig.is_file() and 'CC' not in env:
        for name, command in [('cc', 'cc -target x86_64-windows-gnu'), ('cxx', 'c++ -target x86_64-windows-gnu'), ('ar', 'ar')]:
            wrapper = ROOT / 'out/model-converters' / (name + '.cmd')
            wrapper.write_text('@"' + str(zig) + '" ' + command + ' %*\n', encoding='utf-8')
            env[{'cc': 'CC', 'cxx': 'CXX', 'ar': 'AR'}[name]] = str(wrapper)
        env['ZIG_GLOBAL_CACHE_DIR'] = str(ROOT / 'out/model-converters/zig-cache')
        env['CRATE_CC_NO_DEFAULTS'] = '1'
        env['CFLAGS'] += ' -O2'
        # meshoptimizer uses error returns/assertions. Avoid Zig libc++ exception/RTTI objects mixing with Rust's MinGW runtime.
        env['CXXFLAGS'] += ' -O2 -fno-exceptions -fno-rtti -D_LIBCPP_VERBOSE_ABORT(...)=__builtin_abort()'
    subprocess.run(['cargo', 'build', '--release', '--locked'], cwd=crate, env=env, check=True)
    publish(crate / 'target/release/map2lap-modelconvert.exe', destination / 'modelconvert-win64.exe')
    licenses(crate, destination)
    if args.linux:
        linux_root = '/mnt/' + ROOT.drive[0].lower() + ROOT.as_posix()[2:]
        wsl_home = subprocess.check_output(['wsl', '-d', 'Ubuntu-24.04', '--exec', 'printenv', 'HOME'], text=True).strip()
        cargo = wsl_home + '/.cargo/bin/cargo'
        subprocess.run(['wsl', '-d', 'Ubuntu-24.04', '--exec', 'env',
                        'CARGO_TARGET_DIR=/tmp/map2lap-modelconvert-target',
                        'RUSTFLAGS=--remap-path-prefix=' + wsl_home + '=~ --remap-path-prefix=' + linux_root + '=~',
                        'CFLAGS=-ffile-prefix-map=' + wsl_home + '=~ -ffile-prefix-map=' + linux_root + '=~',
                        'CXXFLAGS=-ffile-prefix-map=' + wsl_home + '=~ -ffile-prefix-map=' + linux_root + '=~',
                        cargo, 'build', '--release', '--locked', '--manifest-path',
                        linux_root + '/native/modelconvert/Cargo.toml'], check=True)
        subprocess.run(['wsl', '-d', 'Ubuntu-24.04', '--exec', 'cp',
                        '/tmp/map2lap-modelconvert-target/release/map2lap-modelconvert',
                        linux_root + '/src/bin/modelconvert-linux-x64'], check=True)
        check_private(destination / 'modelconvert-linux-x64', (wsl_home, linux_root))


if __name__ == '__main__':
    main()
