# The Rust module `earthfast`

The hot loops of grading and painting, in `native/earthfast`. The repo holds the built module for both systems:
`engine/earthfast.pyd` (Windows) and `engine/earthfast.abi3.so` (Linux release). Both are abi3: any Python >= 3.10.

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
- Environment variables are read on the Python side and passed in (one place for the `BNE_*` switches, which the cache
  key hashes).
- Grading results are cached by a hash of the engine code and the module (`revisit.code_key`), so a change invalidates
  them by itself.
