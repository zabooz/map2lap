# The Rust module `earthfast`

The hot loops of grading and painting, in `native/earthfast`. The repo holds the built module for both systems:
`engine/earthfast.pyd` (Windows) and `engine/earthfast.abi3.so` (Linux release).

## Rebuilding

Every change to the Rust code builds both files: a stale one gives the other system different roads (`AC_EXPORT_YIELD` and
the module's `VERSION` show which rules it has).

```bash
cd native/earthfast
export PATH="$HOME/.cargo/dlltool-llvm:$HOME/.cargo/bin:$PATH"
cargo build --release
cp target/release/earthfast.dll ../../engine/earthfast.pyd     # stop the generator page first: it locks the file

# Linux, in WSL (Ubuntu-24.04) in the same folder; its own target folder keeps it apart from the Windows build
CARGO_TARGET_DIR=~/earthfast-target cargo build --release --locked
cp ~/earthfast-target/release/libearthfast.so ../../engine/earthfast.abi3.so
```

`tools\build_native.py` does the Windows part and checks the new module has our grading rules.

- **Windows:** Rust `stable-x86_64-pc-windows-gnu` (no Visual Studio); `dlltool` = a copy of `llvm-ar.exe` as
  `%USERPROFILE%\.cargo\dlltool-llvm\dlltool.exe`. It is abi3 too (it links `python3.dll`): any Python >= 3.10.
- **Linux:** WSL Ubuntu 24.04 with `build-essential` and rustup. It is abi3 (any Python ≥ 3.10) and needs glibc 2.35 (the
  distro it is built on sets that: Ubuntu 22.04, Debian 12 and newer).

## Changing it

- New arguments get defaults so older callers keep working, and a feature constant in the module (`m.add(...)`) that the
  Python side checks before using them.
- Environment variables stay on the Python side: reading them with `std::env` crashed with this toolchain.
- Grading results are cached by a hash of the server code and the module (`revisit.code_key`), so a change invalidates them
  by itself.
