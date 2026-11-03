"""The packages roads/, grading/ and buildings/ hand out only the names their __init__ imports from their parts. Every name
the rest of the repo reads from one of them must be among those, or a build stops late with an AttributeError (for
example gates.py reading roads.box_gap after all the scenery is built)."""
import ast
import importlib
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(HERE, "..")
REPO = os.path.join(ENGINE, "..")
sys.path.insert(0, ENGINE)
sys.path.insert(0, os.path.join(REPO, "src"))
PACKAGES = ("roads", "grading", "buildings")
FOLDERS = ("src", "tools", "engine")


def python_files():
    """Paths of the repo's own .py files outside the packages' parts (they import each other directly)."""
    for folder in FOLDERS:
        for top, dirs, files in os.walk(os.path.join(REPO, folder)):
            dirs[:] = [d for d in dirs if d not in PACKAGES and d != "__pycache__"]
            yield from (os.path.join(top, f) for f in files if f.endswith(".py"))


def imported(tree):
    """Local name -> package for `import roads as roadsmod`. Pure."""
    return {a.asname or a.name: a.name for n in ast.walk(tree) if isinstance(n, ast.Import)
            for a in n.names if a.name in PACKAGES}


def aliases(tree, known):
    """Local name -> package for `import roads as roadsmod` and `roadsmod = build_tiles.roadsmod` (known: the names
    other modules import a package as). Pure."""
    out = imported(tree)
    for n in ast.walk(tree):
        if (isinstance(n, ast.Assign) and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name)
                and isinstance(n.value, ast.Attribute) and n.value.attr in known):
            out[n.targets[0].id] = known[n.value.attr]
    return out


def shadowed(tree, alias):
    """ids of the `alias.NAME` nodes inside a function that binds the alias's name to something else (railways.py:
    `roads, seen = [], set()` next to the module `roads`). Pure."""
    out = set()
    for fn in ast.walk(tree):
        if not isinstance(fn, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        local = {t.id for t in ast.walk(fn) if isinstance(t, ast.Name) and isinstance(t.ctx, ast.Store)}
        local -= {a.asname or a.name for n in ast.walk(fn) if isinstance(n, ast.Import) for a in n.names}
        out |= {id(n) for n in ast.walk(fn) if isinstance(n, ast.Attribute) and isinstance(n.value, ast.Name)
                and n.value.id in alias and n.value.id in local}
    return out


def reads(tree, known):
    """(package, name, line) for each name the module reads from a package: `alias.NAME`, `from roads import NAME` and
    `patch.object(alias, "NAME")`. Pure."""
    alias = aliases(tree, known)
    skip = shadowed(tree, alias)
    for n in ast.walk(tree):
        if isinstance(n, ast.ImportFrom) and n.level == 0 and n.module in PACKAGES:
            yield from ((n.module, a.name, n.lineno) for a in n.names if a.name != "*")
        elif (isinstance(n, ast.Attribute) and isinstance(n.ctx, ast.Load) and isinstance(n.value, ast.Name)
              and n.value.id in alias and id(n) not in skip):
            yield alias[n.value.id], n.attr, n.lineno
        elif (isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == "object"
              and len(n.args) >= 2 and isinstance(n.args[0], ast.Name) and n.args[0].id in alias
              and isinstance(n.args[1], ast.Constant)):
            yield alias[n.args[0].id], n.args[1].value, n.lineno


class PackageNamesTest(unittest.TestCase):
    def test_every_name_read_from_a_package_is_handed_out(self):
        packages = {p: importlib.import_module(p) for p in PACKAGES}
        trees = {}
        for path in python_files():
            with open(path, encoding="utf-8") as f:
                trees[path] = ast.parse(f.read())
        known = {k: v for tree in trees.values() for k, v in imported(tree).items()}
        missing = []
        for path, tree in trees.items():
            for package, name, line in reads(tree, known):
                if not hasattr(packages[package], name):
                    missing.append(f"{package}.{name} ({os.path.relpath(path, REPO)}:{line})")
        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
