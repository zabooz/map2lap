"""Detect CSP locally and install the recommended public archive only on an explicit request."""
import configparser
from contextlib import contextmanager
from html.parser import HTMLParser
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import tempfile
import threading
import urllib.error
import urllib.request
import urllib.parse
import zipfile

from app import settings, system

PAGE = "https://acstuff.club/patch/"
USER_AGENT = "Map2Lap CSP installer (+https://acstuff.club/patch/)"
VERSION = re.compile(r"\d+\.\d+(?:\.\d+)?(?:-preview\d+)?")
MAX_DOWNLOAD = 256 << 20  # Current public package is 119 MiB; refuse unexpectedly large responses.
MAX_EXPANDED = 1 << 30
_lock = threading.RLock()
_job = {"path": None, "stage": "idle", "done": 0, "total": 0, "error": None}
ACTIVE = {"checking", "downloading", "installing"}


class RecoveryNeeded(OSError):
    """Rollback could not restore every file; leave staging/backup files for recovery."""


@contextmanager
def _staging(root):
    folder = Path(tempfile.mkdtemp(prefix=".map2lap-csp-", dir=root))
    keep = False
    try:
        yield folder
    except RecoveryNeeded:
        keep = True
        raise
    finally:
        if not keep:
            shutil.rmtree(folder)


def _ini(path):
    parser = configparser.ConfigParser(interpolation=None, strict=False, inline_comment_prefixes=(";", "#"))
    try:
        with Path(path).open(encoding="utf-8-sig") as f:
            parser.read_string(f.read(128 << 10))
    except FileNotFoundError:
        pass
    return parser


def inspect(ac):
    """Local installed version and effective enable setting; never contact the network or load the DLL."""
    root = Path(ac)
    result = {"status": "missing", "version": None, "build": None, "enabled": None}
    if not settings.is_ac(str(root)) or not (root / "acs.exe").is_file():
        return {**result, "status": "invalid", "message": "Choose the Assetto Corsa folder first."}
    try:
        manifest = _ini(root / "extension/config/data_manifest.ini")
        version = manifest.get("VERSION", "SHADERS_PATCH", fallback="")
        build = manifest.getint("VERSION", "SHADERS_PATCH_BUILD", fallback=0)
        loader = root / "dwrite.dll"
        if loader.is_file() and VERSION.fullmatch(version) and build > 0:
            with loader.open("rb") as f:
                known = f.read(2) == b"MZ"
            if known:
                enabled = True
                for path in (root / "extension/config/general.ini",
                             Path(system.documents(str(root))) / "Assetto Corsa/cfg/extension/general.ini"):
                    cfg = _ini(path)
                    if cfg.has_option("BASIC", "ENABLED"):
                        enabled = cfg.get("BASIC", "ENABLED").strip().lower() not in ("0", "false", "off", "no", "none", "disabled")
                return {"status": "installed", "version": version, "build": build, "enabled": enabled}
        if loader.exists() or loader.is_symlink() or version:
            return {**result, "status": "partial", "message": "Existing patch files could not be verified. Use Content Manager to repair them."}
    except (OSError, ValueError, configparser.Error):
        return {**result, "status": "partial", "message": "Could not read the existing patch. Check folder permissions or use Content Manager."}
    return result


def busy():
    with _lock:
        return _job["stage"] in ACTIVE


def status(ac):
    info = inspect(ac)
    with _lock:
        same = _job["path"] == str(Path(ac).resolve())
        job = {k: _job[k] for k in ("stage", "done", "total", "error")} if same else {"stage": "idle", "done": 0, "total": 0, "error": None}
        working = busy()
    return {**info, **job, "busy": working, "can_install": info["status"] == "missing" and not working,
            "linux": not system.WIN, "website": PAGE}


class _ReleaseLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.link, self.label, self.recommended = None, [], None

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.link, self.label = dict(attrs).get("href"), []

    def handle_data(self, data):
        if self.link is not None:
            self.label.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.link is not None:
            match = re.fullmatch(r"\?get=(\d+\.\d+(?:\.\d+)?)", self.link)
            if match and "(recommended version)" in "".join(self.label).lower():
                self.recommended = match[1]
            self.link = None


def recommended_version(html):
    """Find the explicitly recommended public release on the official download page. Pure."""
    links = _ReleaseLinks()
    links.feed(html)
    if not links.recommended:
        raise ValueError("The official site did not identify a recommended public CSP version. Try again later or use Content Manager.")
    return links.recommended


def _open(url):
    response = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": USER_AGENT}), timeout=30)
    final = urllib.parse.urlsplit(response.geturl())
    if final.scheme != "https" or final.hostname not in ("acstuff.club", "acstuff.ru"):
        response.close()
        raise ValueError("CSP download left the official HTTPS site")
    return response


def _eligible(ac):
    info = inspect(ac)
    if info["status"] != "missing":
        raise ValueError(info.get("message", "An existing CSP installation is already present; it was not changed."))
    if system.running("acs.exe") or system.running("acs_x86.exe"):
        raise ValueError("Close Assetto Corsa before installing CSP.")


def _members(archive):
    """Bounded safe file entries; no absolute/traversal/ADS names, links, duplicate targets or game executables. Pure."""
    entries, seen, total = [], set(), 0
    for item in archive.infolist():
        name = item.filename.replace("\\", "/")
        parts = PurePosixPath(name).parts
        if (not parts or name.startswith("/") or any(p in (".", "..") or ":" in p or p.endswith((".", " "))
                                                     or any(ord(c) < 32 for c in p) for p in parts)
                or stat.S_ISLNK(item.external_attr >> 16)):
            raise ValueError("Unsafe path in CSP archive")
        if item.is_dir():
            if parts[0] != "extension":
                raise ValueError("Unexpected folder in CSP archive")
            continue
        if name != "dwrite.dll" and not name.startswith("extension/"):
            raise ValueError("Unexpected file in CSP archive")
        folded = name.casefold()
        if folded in seen:
            raise ValueError("Duplicate file in CSP archive")
        seen.add(folded)
        total += item.file_size
        entries.append((item, name))
    if len(entries) > 10000 or total > MAX_EXPANDED:
        raise ValueError("CSP archive is unexpectedly large")
    if not {"dwrite.dll", "extension/config/data_manifest.ini"} <= seen:
        raise ValueError("CSP archive is incomplete")
    return entries, total


def install_archive(ac, path, expected_version, progress=lambda done, total: None):
    """Validate/stage a public archive, merge files with rollback, and activate dwrite.dll last. Preserve user Documents."""
    root = Path(ac).resolve()
    _eligible(root)
    with zipfile.ZipFile(path) as archive, _staging(root) as tmp:
        entries, total = _members(archive)
        if shutil.disk_usage(root).free < 2 * total:
            raise ValueError("Not enough free disk space to stage CSP and keep rollback copies")
        staged, backup = Path(tmp, "staged"), Path(tmp, "backup")
        for i, (item, name) in enumerate(entries):
            target = staged / name
            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(item) as source, target.open("wb") as out:
                shutil.copyfileobj(source, out, 1 << 20)  # Reading to the end also verifies the ZIP CRC.
            progress(i + 1, 2 * len(entries))
        manifest = _ini(staged / "extension/config/data_manifest.ini")
        if manifest.get("VERSION", "SHADERS_PATCH", fallback="") != expected_version:
            raise ValueError("The downloaded CSP version does not match the requested version")
        if manifest.getint("VERSION", "SHADERS_PATCH_BUILD", fallback=0) <= 0:
            raise ValueError("The downloaded CSP version has no build number")
        with (staged / "dwrite.dll").open("rb") as f:
            if f.read(2) != b"MZ":
                raise ValueError("The CSP loader is not a Windows DLL")
        _eligible(root)  # AC/Content Manager may have started while the download was running.
        plan = sorted((name for _, name in entries), key=lambda name: (name == "dwrite.dll", name))
        # Validate every real destination before changing any game file (existing links must stay inside AC).
        for name in plan:
            target = root / name
            if not target.resolve().is_relative_to(root) or target.is_symlink() or (target.exists() and not target.is_file()):
                raise ValueError("A CSP destination is not a regular file inside Assetto Corsa")
        changed, created = [], []
        try:
            for i, name in enumerate(plan):
                target, old = root / name, backup / name
                if target.is_file():
                    old.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(target, old)
                parent = target.parent
                while not parent.exists():
                    created.append(parent)
                    parent = parent.parent
                target.parent.mkdir(parents=True, exist_ok=True)
                os.replace(staged / name, target)
                changed.append(name)
                progress(len(entries) + i + 1, 2 * len(entries))
        except BaseException:
            failed = []
            for name in reversed(changed):
                old, target = backup / name, root / name
                try:
                    if old.exists():
                        os.replace(old, target)
                    else:
                        target.unlink(missing_ok=True)
                except OSError:
                    failed.append(name)
            if failed:
                raise RecoveryNeeded(f"CSP installation failed and some files could not be restored. Recovery copies remain in {backup}") from None
            for parent in sorted(set(created), key=lambda p: len(p.parts), reverse=True):
                try:
                    parent.rmdir()
                except OSError:
                    pass
            raise


def _progress(stage, done=0, total=0, error=None):
    with _lock:
        _job.update(stage=stage, done=done, total=total, error=error)


def _install(ac):
    try:
        with _open(PAGE) as response:
            page = response.read((512 << 10) + 1)
        if len(page) > 512 << 10:
            raise ValueError("The official release page is unexpectedly large")
        version = recommended_version(page.decode("utf8"))
        with tempfile.TemporaryDirectory(prefix=".map2lap-csp-download-", dir=ac) as tmp:
            package = Path(tmp, "patch.zip")
            with _open(PAGE + "?get=" + version) as response, package.open("wb") as out:
                total, done = int(response.headers.get("Content-Length") or 0), 0
                if total > MAX_DOWNLOAD:
                    raise ValueError("The CSP download is unexpectedly large")
                _progress("downloading", 0, total)
                while chunk := response.read(1 << 20):
                    done += len(chunk)
                    if done > MAX_DOWNLOAD:
                        raise ValueError("The CSP download is unexpectedly large")
                    out.write(chunk)
                    _progress("downloading", done, total)
                if total and done != total:
                    raise ValueError("The CSP download ended early")
            _progress("installing")
            install_archive(ac, package, version, lambda done, total: _progress("installing", done, total))
        _progress("done")
    except (urllib.error.URLError, TimeoutError, ConnectionError):
        _progress("error", error="Could not download CSP from the official site. Check your internet connection and try again later.")
    except Exception as error:
        _progress("error", error=f"CSP could not be installed: {error}")


def start(ac):
    """Start one requested installation in a captured AC folder; existing installs are never upgraded or replaced."""
    root = str(Path(ac).resolve())
    with _lock:
        if busy():
            raise ValueError("A CSP installation is already running")
        _eligible(root)
        _job.update(path=root, stage="checking", done=0, total=0, error=None)
        try:
            threading.Thread(target=_install, args=(root,), daemon=True).start()
        except RuntimeError as error:
            _progress("error", error="Could not start the CSP installer")
            raise ValueError("Could not start the CSP installer; try again") from error
    return status(root)


def proton_overrides(existing):
    """Add a native dwrite loader without changing explicit DLL choices or other libraries. Pure."""
    for group in existing.split(";"):
        if "dwrite" in group.split("=", 1)[0].strip().lower().split(","):
            return existing
    return ";".join(part for part in (existing, "dwrite=n,b") if part)
