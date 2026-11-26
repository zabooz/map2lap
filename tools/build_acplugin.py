"""Build AC's freestanding Windows x64 plugin and its release receipt with LLVM."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'native/acplugin/plugin.c'
INPUTS = (SOURCE, 'native/acplugin/green_clock.h', 'native/acplugin/route_json.h', 'tools/build_acplugin.py')
DLL = 'src/bin/map2lap.dll'
IMPORTS = {
    'kernel32': ('GetModuleHandleW', 'GetModuleFileNameW', 'CreateFileW', 'GetFileSize', 'ReadFile',
                 'CloseHandle', 'GetProcessHeap', 'HeapAlloc', 'HeapFree', 'ReadProcessMemory',
                 'GetPrivateProfileStringW', 'VirtualProtect',
                 'FlushInstructionCache', 'GetCurrentProcess'),
    'shell32': ('SHGetFolderPathW',),
}


def build(target):
    """Compile, link and check the plugin before replacing target."""
    target = Path(target)
    with tempfile.TemporaryDirectory(dir=target.parent) as tmp:
        work = Path(tmp)
        for dll, names in IMPORTS.items():
            (work / f'{dll}.def').write_text(f'LIBRARY {dll}.dll\nEXPORTS\n' + '\n'.join(names) + '\n',
                                            encoding='ascii', newline='\n')
            subprocess.run(['llvm-dlltool', '-m', 'i386:x86-64', '-d', f'{dll}.def', '-l', f'{dll}.lib'],
                           cwd=work, check=True)
        subprocess.run(['clang', '--target=x86_64-pc-windows-msvc', '-std=c11', '-O2', '-Wall', '-Wextra',
                        '-Werror', '-ffreestanding', '-c', ROOT / SOURCE, '-o', work / 'plugin.obj'], check=True)
        subprocess.run(['lld-link', '/dll', '/noentry', '/nodefaultlib', '/machine:x64', '/timestamp:0',
                        '/out:map2lap.dll', 'plugin.obj', *(f'{dll}.lib' for dll in IMPORTS)], cwd=work, check=True)
        output = work / 'map2lap.dll'
        raw = output.read_bytes().lower()
        for path in (Path.home(), ROOT, work.resolve()):
            if any(str(path).lower().encode(enc) in raw for enc in ('utf-8', 'utf-16le')):
                raise ValueError('The AC plugin contains a private build path')
        os.replace(output, target)


if __name__ == '__main__':
    argparse.ArgumentParser(description=__doc__).parse_args()
    build(ROOT / DLL)
    hashes = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in (*INPUTS, DLL)}
    (ROOT / DLL).with_suffix('.json').write_text(json.dumps(hashes, indent=2) + '\n', encoding='utf-8', newline='\n')
