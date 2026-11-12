# The Rust module `earthfast`

The Editor's independent browser kernel is `native/editorgeometry/regions.rs`. Build it with
`.venv\Scripts\python.exe tools\build_editor_geometry.py` after installing `rustup target add wasm32-unknown-unknown`.
It has no third-party Rust dependencies. The checked-in `ui/assets/editorgeometry.wasm` is copied into `src/web` by
the UI build and runs unchanged in Windows and Linux browsers. It does not load or replace `earthfast`, and users need
neither Rust nor Bun. Its versioned ABI accepts bounded KN5 vertex/index arrays and returns connected face roots;
`regionsKernel.ts` owns allocations, and browser workers own cancellation and buffer transfer.

The hot loops of grading and painting, in `native/earthfast`. The repo holds the built module for both systems:
`engine/earthfast.pyd` (Windows) and `engine/earthfast.abi3.so` (Linux release). Both are abi3: any Python >= 3.10.

The independent FBX/OBJ reader is in `native/modelconvert`, using pinned ufbx and `Cargo.lock`. Build both runtime
executables with `.venv\Scripts\python.exe tools\build_modelconvert.py --linux`: `src/bin/modelconvert-win64.exe` and
`src/bin/modelconvert-linux-x64`. This does not rebuild earthfast or require stopping the generator page. Windows needs a
C compiler (MinGW GCC, `CC`/`AR`, or a developer-only Zig download under `out/model-converters/zig`); Linux builds through
WSL with GCC. The checked-in executables are shipped with notices, and users need neither a compiler nor Blender.

The same process optionally simplifies validated imported geometry with pinned `meshopt 0.7.0` (MIT option) and
meshoptimizer 1.3 (MIT). `--simplify <request.json> <result.json>` accepts bounded arrays for independent primitives;
GLB validation, images, scene metadata and immutable packaging stay in Python. No gltfpack executable or Python package
is shipped. Both `CC` and `CXX` are needed. The Zig fallback disables C++ exceptions/RTTI and uses libc++'s supported
verbose-abort customization to avoid linking its exception ABI into Rust's MinGW runtime. Linux uses GCC/G++ normally.
Rust, C and C++ source paths are remapped; publication checks ASCII and UTF-16 builder names/paths and Windows imports.
`cargo test --locked --manifest-path native/modelconvert/Cargo.toml` runs the converter's Rust tests.

## Rebuilding

Every change to the Rust code builds both files: a stale one gives the other system different roads (`AC_EXPORT_YIELD` and
the module's `VERSION` show which rules it has).

```powershell
.venv\Scripts\python.exe tools\build_native.py --linux     # stop the generator page first: it locks the .pyd
```

It builds the Windows module, then the Linux one in WSL (its own target folder keeps the two apart), both as `Cargo.lock`
has them (`--locked`), writes the builder's home folder as `~` into both (`--remap-path-prefix`: panic messages and debug
info carry source paths) and puts a module in place only when it names no user, every import of the Windows one is bound
(`orphan_imports`) and it imports with our grading rules.

- **Windows:** Rust `stable-x86_64-pc-windows-gnu` (no Visual Studio); `dlltool` = a copy of `llvm-ar.exe` as
  `%USERPROFILE%\.cargo\dlltool-llvm\dlltool.exe` (an `llvm-ar` called `dlltool` works as `llvm-dlltool`).
- **Linux:** WSL Ubuntu-24.04 with `build-essential` and rustup. The module needs glibc 2.35 (the distro it is built on
  sets that: Ubuntu 22.04, Debian 12 and newer).

## Changing it

- New arguments get defaults so older callers keep working, and a feature constant in the module (`m.add(...)`) that the
  Python side checks before using them.
- **No raw-dylib crates on Windows.** `windows-link` 0.2 (brought in by `libloading` 0.8.9, `parking_lot_core` 0.9.12
  and `windows-sys` 0.61, all through wgpu) imports Windows functions without an import library; with this toolchain's
  `dlltool` 13 of them (`GetSystemInfo`, `SetLastError`, `CloseHandle`, ...) ended up past another import descriptor's
  end, never filled, and every `std::thread` and `std::env` call crashed with an access violation. `Cargo.lock` keeps
  versions without it (`libloading` 0.8.6, `parking_lot` 0.12.3 with `parking_lot_core` 0.9.10, `windows-sys` 0.59);
  after a `cargo update`, `build_native.py` refuses a module with such imports (`cargo tree -i windows-link` shows who
  brought it back).
- **A native crash** (Python's faulthandler: "access violation", no C stack): `tools\crash.py` reads Windows' last error
  report of python.exe and places the faulting address in the module (section, import slot, uncovered imports).
- Environment variables are read on the Python side and passed in (one place for the `BNE_*` switches, which the cache
  key hashes).
- The revisit cache is keyed by a hash of the engine code and the module (`revisit.code_key`), so a change invalidates it
  by itself; a run's plan folder (`BNGE_PLAN_RUN`) is not: [architecture.md, Build caches](architecture.md#build-caches-and-comparisons).
