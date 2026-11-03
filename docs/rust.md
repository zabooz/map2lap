# The Rust module `earthfast`

The hot loops of grading and painting, in `native/earthfast`. The repo holds the built module for both systems:
`engine/earthfast.pyd` (Windows) and `engine/earthfast.abi3.so` (Linux release). Both are abi3: any Python >= 3.10.

## Rebuilding

Every change to the Rust code builds both files: a stale one gives the other system different roads (`AC_EXPORT_YIELD` and
the module's `VERSION` show which rules it has).

```powershell
.venv\Scripts\python.exe tools\build_native.py --linux     # stop the generator page first: it locks the .pyd
```

It builds the Windows module, then the Linux one in WSL (its own target folder keeps the two apart), writes the builder's
home folder as `~` into both (`--remap-path-prefix`: panic messages and debug info carry source paths) and puts a module
in place only when it names no user and imports with our grading rules.

- **Windows:** Rust `stable-x86_64-pc-windows-gnu` (no Visual Studio); `dlltool` = a copy of `llvm-ar.exe` as
  `%USERPROFILE%\.cargo\dlltool-llvm\dlltool.exe` (an `llvm-ar` called `dlltool` works as `llvm-dlltool`).
- **Linux:** WSL Ubuntu-24.04 with `build-essential` and rustup. The module needs glibc 2.35 (the distro it is built on
  sets that: Ubuntu 22.04, Debian 12 and newer).

## Changing it

- New arguments get defaults so older callers keep working, and a feature constant in the module (`m.add(...)`) that the
  Python side checks before using them.
- On Windows, the standard library's calls into the system crash the module (an access violation): reading environment
  variables (`std::env`), `std::thread` (spawn, scope, `available_parallelism`). Their imports land in the extra
  `kernel32.dll` entries the raw-dylib crates (`windows-sys` and the like, via wgpu) get from `dlltool`, which come out
  unbound. So environment variables stay on the Python side, and the threaded functions (`mesh_warp`, `tile_warp`,
  `fill_photo`: imagery only, which AC builds don't run) crash there.
- Grading results are cached by a hash of the engine code and the module (`revisit.code_key`), so a change invalidates
  them by itself.
