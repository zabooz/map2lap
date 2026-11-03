"""The parts of a package import in one direction: each only parts listed before it in the package's `from . import`
line, at its top. A part then reads like a module on its own, and a name moved to the wrong part fails here instead of
as an ImportError in a build (or not at all: an import at a part's end hid a name read too early until it ran).

A constant lives with the code that reads it: in the part that reads it (the lowest of several), or in the package's
settings part, which holds the numbers and looks shared across it."""
import ast
import os
import re
import unittest

ENGINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PACKAGES = ("roads", "grading", "buildings")
SETTINGS = {"roads": "style", "grading": "settings", "buildings": "looks"}
CONSTANT = re.compile(r"_?[A-Z][A-Z0-9_]*$")


def order(pkg):
    """The parts of pkg as its __init__ imports them (`from . import a, b, ...`)."""
    tree = ast.parse(open(os.path.join(ENGINE, pkg, "__init__.py"), encoding="utf-8").read())
    for s in tree.body:
        if isinstance(s, ast.ImportFrom) and s.level == 1 and s.module is None:
            return [a.name for a in s.names]
    raise AssertionError(f"{pkg}/__init__.py has no `from . import` line")


def part_imports(path):
    """[(line, part, at top)] of a part's imports of its package's other parts: `from .x import ...`, `from . import x`.
    At top: before the first statement that is not an import or the docstring. Pure."""
    tree = ast.parse(open(path, encoding="utf-8").read())
    out, top = [], True
    for i, s in enumerate(tree.body):
        if isinstance(s, ast.ImportFrom) and s.level == 1:
            names = [s.module] if s.module else [a.name for a in s.names]
            out += [(s.lineno, n.split(".")[0], top) for n in names]
        elif not isinstance(s, (ast.Import, ast.ImportFrom)) and not (i == 0 and isinstance(s, ast.Expr)):
            top = False
    for n in ast.walk(tree):
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            out += [(m.lineno, (m.module or m.names[0].name).split(".")[0], False) for m in ast.walk(n)
                    if isinstance(m, ast.ImportFrom) and m.level == 1]
    return out


def constants_and_reads(path):
    """(the module-level constants a part sets, the names it reads anywhere). Pure."""
    tree = ast.parse(open(path, encoding="utf-8").read())
    consts = set()
    for s in tree.body:
        for t in (s.targets if isinstance(s, ast.Assign) else [s.target] if isinstance(s, ast.AnnAssign) else []):
            if isinstance(t, ast.Name) and CONSTANT.match(t.id):
                consts.add(t.id)
    reads = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)}
    return consts, reads


class PartOrderTest(unittest.TestCase):
    def test_constants_live_where_they_are_read(self):
        for pkg in PACKAGES:
            parts = {p: constants_and_reads(os.path.join(ENGINE, pkg, p + ".py")) for p in order(pkg)}
            for part, (consts, reads) in parts.items():
                if part == SETTINGS[pkg]:
                    continue
                for name in sorted(consts - reads):
                    readers = [p for p, (_, r) in parts.items() if name in r]
                    with self.subTest(constant=f"{pkg}/{part}.py {name}"):
                        self.assertFalse(readers, f"read only in {readers}: it lives in {readers[0] if readers else ''}"
                                                  f" (or in {SETTINGS[pkg]}.py)")


    def test_parts_import_only_earlier_parts_at_their_top(self):
        for pkg in PACKAGES:
            parts = order(pkg)
            on_disk = {f[:-3] for f in os.listdir(os.path.join(ENGINE, pkg)) if f.endswith(".py") and f != "__init__.py"}
            self.assertEqual(set(parts), on_disk, f"{pkg}: the `from . import` line names every part")
            for k, part in enumerate(parts):
                for line, other, top in part_imports(os.path.join(ENGINE, pkg, part + ".py")):
                    with self.subTest(part=f"{pkg}/{part}.py:{line}"):
                        self.assertTrue(top, f"imports .{other} below its top")
                        self.assertLess(parts.index(other), k, f"imports .{other}, listed after it")


if __name__ == "__main__":
    unittest.main()
