"""Whether an update installs: the last published release (GitHub) unpacked, this version's archive (dist/, from
tools/make_release.py) installed over it with the old release's own start script lines (the old script runs the
install), then the new bundled Python started there: Map2Lap's version, Python, the Rust module, the generator, the old
folders dropped (updater.drop_old), settings.json kept.

    .venv\\Scripts\\python.exe tools\\make_release.py
    .venv\\Scripts\\python.exe tools\\test_update.py              # Windows
    .venv\\Scripts\\python.exe tools\\test_update.py --linux      # and Linux in WSL (Ubuntu-24.04)
    .venv\\Scripts\\python.exe tools\\test_update.py --from v0.5.4

Nothing is installed anywhere else: it all happens in a temporary folder (in WSL's own file system for Linux). The
published archives are downloaded once into dist/ and checked against GitHub's SHA-256.
"""
import argparse
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, "src"))
from app import version  # noqa: E402

import make_release  # noqa: E402

WSL = ["wsl", "-d", "Ubuntu-24.04", "--exec"]
PUBLISHED = os.path.join(make_release.DIST, "published")
MARK = '{"test_update": 1}'
# run by the new bundled Python in the updated folder (its cwd): what a user's start would meet
PROBE = """import json, os, sys
root = os.getcwd()
engine = os.path.join(root, "engine")
sys.path[:0] = [engine, os.path.join(root, "src")]
from app import updater, version
dropped = updater.drop_old(root)
os.chdir(engine)
import earthfast, generator
print("PROBE " + json.dumps({"version": version.VERSION, "python": sys.version.split()[0],
                             "earthfast": earthfast.VERSION, "dropped": dropped, "folders": sorted(os.listdir(root)),
                             "settings": open(os.path.join(root, "settings.json"), encoding="utf-8").read().strip()}))
"""


def published(tag):
    """The GitHub release tag (None: the latest): {"version", "assets": {name: (url, sha256 or None)}}."""
    url = version.LATEST_URL if tag is None else version.LATEST_URL.replace("/latest", f"/tags/{tag}")
    req = urllib.request.Request(url, headers={"User-Agent": version.USER_AGENT,
                                              "Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        rel = json.load(r)
    return {"version": rel["tag_name"].lstrip("v"), "assets": {
        a["name"]: (a["browser_download_url"], (a.get("digest") or "").removeprefix("sha256:") or None)
        for a in rel["assets"]}}


def asset(rel, suffix):
    """The local path of rel's archive ending in suffix, downloaded once into dist/published/ (apart from dist/'s own
    archives: a published one can have the same name) and checked against its SHA-256."""
    name = next((n for n in rel["assets"] if n.endswith(suffix)), None)
    if name is None:
        raise SystemExit(f"Release {rel['version']} has no *{suffix}")
    url, sha = rel["assets"][name]
    path = os.path.join(PUBLISHED, name)
    if not os.path.exists(path):
        os.makedirs(PUBLISHED, exist_ok=True)
        print(f"Downloading {name} ...", flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": version.USER_AGENT})
        with urllib.request.urlopen(req, timeout=300) as r, open(path + ".part", "wb") as f:
            shutil.copyfileobj(r, f)
        os.replace(path + ".part", path)
    if sha:
        with open(path, "rb") as f:
            if hashlib.file_digest(f, "sha256").hexdigest() != sha:
                os.remove(path)
                raise SystemExit(f"{name}: wrong SHA-256, deleted (run again)")
    return path


def ours(suffix):
    """This version's archive in dist/ (tools/make_release.py builds it)."""
    p = os.path.join(make_release.DIST, f"{make_release.NAME}-{version.VERSION}-{suffix}")
    if not os.path.isfile(p):
        raise SystemExit(f"{os.path.relpath(p, HERE)} is missing: run tools\\make_release.py first")
    return p


def block(text, start, end):
    """The lines of text from the one starting with start (stripped) to the first one after it that is end
    (stripped), both included. Pure."""
    lines = text.splitlines()
    a = next(i for i, ln in enumerate(lines) if ln.strip().startswith(start))
    b = next(i for i in range(a + 1, len(lines)) if lines[i].strip() == end)
    return lines[a:b + 1]


def verdict(probe, old, what):
    """Lines saying what is right or wrong about the probe's answer (None: the new Python didn't start), and ok."""
    if probe is None:
        return [f"{what}: FAILED: the new bundled Python did not start Map2Lap"], False
    checks = [
        ("Map2Lap " + probe["version"], probe["version"] == version.VERSION),
        ("Python " + probe["python"], probe["python"] == platform.python_version()),
        (f"earthfast {probe['earthfast']} and the generator import", True),
        ("settings.json kept", probe["settings"] == MARK),
        ("old folders gone" + (f" ({', '.join(probe['dropped'])} dropped)" if probe["dropped"] else ""),
         "vendor" not in probe["folders"]),
    ]
    ok = all(c for _, c in checks)
    return [f"{what}: {old} -> {version.VERSION}: {'passed' if ok else 'FAILED'}"] + \
        [f"  {'ok ' if c else 'BAD'} {t}" for t, c in checks], ok


def parse(out):
    line = next((ln for ln in out.splitlines() if ln.startswith("PROBE ")), None)
    return json.loads(line[6:]) if line else None


def windows(rel):
    old_zip, new_zip = asset(rel, "-win64.zip"), ours("win64.zip")
    with tempfile.TemporaryDirectory(prefix="map2lap_update_") as tmp:
        root = os.path.join(tmp, make_release.NAME)
        with zipfile.ZipFile(old_zip) as z:
            z.extractall(tmp)
        with open(os.path.join(root, "settings.json"), "w", encoding="utf-8") as f:
            f.write(MARK)
        os.makedirs(os.path.join(root, "update"))
        with zipfile.ZipFile(new_zip) as z:
            z.extractall(os.path.join(root, "update"))
        open(os.path.join(root, "update", "ready"), "w").close()
        with open(os.path.join(root, "Start Map2Lap.bat"), encoding="utf-8", errors="replace") as f:
            lines = block(f.read(), 'if exist "update\\ready" (', ")")
        lines = [ln.replace('"%~nx0"', '"Start Map2Lap.bat"').replace(" & goto run", "") for ln in lines]
        with open(os.path.join(tmp, "install.bat"), "w", encoding="utf-8") as f:
            f.write("@echo off\r\n" + f'cd /d "{root}"\r\n' + "\r\n".join(lines) + "\r\n")
        with open(os.path.join(tmp, "probe.py"), "w", encoding="utf-8") as f:
            f.write(PROBE)
        subprocess.run(["cmd", "/c", os.path.join(tmp, "install.bat")], capture_output=True)
        r = subprocess.run([os.path.join(root, "python", "python.exe"), os.path.join(tmp, "probe.py")], cwd=root,
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        lines, ok = verdict(parse(r.stdout), rel["version"], "Windows")
        if not ok:
            lines.append("  " + "\n  ".join((r.stdout + r.stderr).strip().splitlines()[-6:]))
    print("\n".join(lines))
    return ok


def wsl_path(p):
    drive, rest = os.path.splitdrive(os.path.abspath(p))
    return f"/mnt/{drive[0].lower()}{rest.replace(os.sep, '/')}"


def linux(rel):
    old_tar, new_tar = asset(rel, "-linux-x64.tar.gz"), ours("linux-x64.tar.gz")
    with tempfile.TemporaryDirectory(prefix="map2lap_update_", dir=make_release.DIST) as tmp:
        with open(os.path.join(tmp, "probe.py"), "w", encoding="utf-8") as f:
            f.write(PROBE)
        # (WSL's own file system: the archive's symlinks and execute bits as on a Linux machine)
        script = "\n".join([
            "set -e", 'T=$(mktemp -d)', 'cd "$T"', f'tar xzf "{wsl_path(old_tar)}"', f"cd {make_release.NAME}",
            f"printf '%s' '{MARK}' > settings.json", "mkdir update", f'tar xzf "{wsl_path(new_tar)}" -C update',
            "touch update/ready"])
        start =subprocess.run(WSL + ["tar", "xzOf", wsl_path(old_tar), f"{make_release.NAME}/start.sh"],
                               capture_output=True, text=True).stdout
        install = "\n".join(block(start, "if [ -f update/ready ]; then", "fi"))
        script += "\n" + install + f'\npython/bin/python3 "{wsl_path(os.path.join(tmp, "probe.py"))}"\n'
        script += 'cd / && rm -rf "$T"\n'
        with open(os.path.join(tmp, "update.sh"), "w", newline="\n") as f:
            f.write(script)
        r = subprocess.run(WSL + ["bash", wsl_path(os.path.join(tmp, "update.sh"))], capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
    lines, ok = verdict(parse(r.stdout), rel["version"], "Linux")
    if not ok:
        lines.append("  " + "\n  ".join((r.stdout + r.stderr).strip().splitlines()[-6:]))
    print("\n".join(lines))
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--linux", action="store_true", help="Linux too (WSL)")
    ap.add_argument("--from", dest="tag", help="the published release to update from (default: the latest)")
    a = ap.parse_args()
    rel = published(a.tag)
    ok = windows(rel)
    if a.linux:
        ok = linux(rel) and ok
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
