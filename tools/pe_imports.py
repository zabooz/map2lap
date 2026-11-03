"""A Windows DLL's (PE32+) sections and import table, read from the file: for build_native.py's check and crash.py.
Pure but for the reads."""


class Image:
    """A PE32+ file's bytes, its sections [(name, rva, size, raw offset)], size in memory and import descriptors."""

    def __init__(self, path):
        self.path = path
        self.b = open(path, "rb").read()
        nt = self.u32(0x3C)
        nsec, opt_size = self.u16(nt + 6), self.u16(nt + 20)
        opt = nt + 24
        self.size = self.u32(opt + 56)                 # (SizeOfImage)
        sec = opt + opt_size
        self.sections = [(self.b[s:s + 8].rstrip(b"\0").decode("latin1"), self.u32(s + 12), self.u32(s + 8),
                          self.u32(s + 20)) for s in range(sec, sec + 40 * nsec, 40)]
        self.imports = self._descriptors(self.u32(opt + 112 + 8))

    def u16(self, o):
        return int.from_bytes(self.b[o:o + 2], "little")

    def u32(self, o):
        return int.from_bytes(self.b[o:o + 4], "little")

    def u64(self, o):
        return int.from_bytes(self.b[o:o + 8], "little")

    def section(self, rva):
        """The name of the section rva lies in, or None."""
        return next((n for n, va, size, _ in self.sections if va <= rva < va + max(size, 1)), None)

    def off(self, rva):
        for _, va, size, raw in self.sections:
            if va <= rva < va + size:
                return raw + rva - va
        raise ValueError(f"RVA {rva:#x} outside the sections")

    def name_at(self, rva):
        """The import name of the hint/name entry at rva."""
        o = self.off(rva) + 2
        return self.b[o:o + 64].split(b"\0")[0].decode("latin1")

    def _descriptors(self, rva):
        """[(dll, IAT start, IAT end with its terminator)] of the import descriptors at rva."""
        out, d = [], self.off(rva)
        while self.u32(d + 12):
            ft, n = self.u32(d + 16), 0
            while self.u64(self.off(ft) + 8 * n):
                n += 1
            out.append((self.b[self.off(self.u32(d + 12)):].split(b"\0")[0].decode("latin1"), ft, ft + 8 * (n + 1)))
            d += 20
        return out

    def iat_slots(self):
        """[(slot rva, the import's name, its dll or None)] of every slot from the first IAT to the last: a slot no
        descriptor covers (dll None) is never filled by Windows."""
        out = []
        for a in range(min(s for _, s, _ in self.imports), max(e for _, _, e in self.imports), 8):
            v = self.u64(self.off(a))
            if v and not v >> 63:
                dll = next((n for n, s, e in self.imports if s <= a < e), None)
                out.append((a, self.name_at(v), dll))
        return out


def orphan_imports(path):
    """The names of the imports in a PE file's import address table that no import descriptor covers: Windows never
    fills their slots, so a call through one jumps to the name's own address and crashes.

    windows-link 0.2 (raw-dylib, through wgpu's libloading, parking_lot_core, windows-sys) gave earthfast.pyd 13 of them
    (GetSystemInfo, SetLastError, CloseHandle, ...) with this toolchain's dlltool: std::thread and std::env crashed.
    Cargo.lock keeps those crates at their versions before it (docs/rust.md)."""
    return [name for _, name, dll in Image(path).iat_slots() if dll is None]
