"""Select one published Overture release before a build and hand it to every worker."""
from contextlib import contextmanager
import json
import os
from pathlib import Path
from queue import Empty, Queue
import re
import threading
from urllib.parse import urljoin

RELEASE = "2026-11-18.0"  # This release's complete STAC file index ships with the app.
SCHEMA = "2.0.0"
ENV = "M2L_OVERTURE_BUILD_RELEASE"
ROOT = "https://stac.overturemaps.org/"
ID = re.compile(r"20[0-9]{2}-[01][0-9]-[0-3][0-9]\.[0-9]{1,3}")


def effective():
    """Release inherited from the parent build. Standalone tools use the bundled index."""
    value = os.environ.get(ENV, "")
    return value if ID.fullmatch(value) else RELEASE


def _catalog(name):
    """Read a catalog from the official host through the map-data network policy."""
    import netfetch
    return json.loads(netfetch.default_fetcher().get(ROOT + name).body)


def _published():
    """Newest listed release whose schema this reader supports."""
    catalog = _catalog("catalog.json")
    releases = set()
    for link in catalog["links"]:
        if link.get("rel") == "child":
            path = urljoin(ROOT, link["href"]).removeprefix(ROOT)
            name, _, rest = path.partition("/")
            if ID.fullmatch(name) and rest == "catalog.json":
                releases.add(name)
    if not releases:
        raise ValueError("No release entries in Overture catalog")
    for name in sorted(releases, key=_order, reverse=True):
        info = _catalog(name + "/catalog.json")
        if info.get("release:version") == name and info.get("schema:version") == SCHEMA:
            return name
    raise RuntimeError("No published Overture release has a compatible map schema. Update Map2Lap and retry.")


def _order(name):
    """A release date followed by its numeric revision. Pure."""
    date, revision = name.split(".")
    return date, int(revision)


def _records(cache):
    return Path(cache, "overture-builds", SCHEMA)


def choose(cache):
    """Select a compatible release for this build, or use a previously successful one offline."""
    import netfetch
    answer = Queue(maxsize=1)

    def request():
        try:
            answer.put(_published())
        except (OSError, ValueError, TypeError, KeyError, AttributeError, netfetch.FetchError) as error:
            answer.put(("unavailable", str(error)))
        except RuntimeError as error:
            answer.put(error)

    threading.Thread(target=request, daemon=True).start()
    try:
        result = answer.get(timeout=5)  # A slow catalog must not hold up a build with local data.
    except Empty:
        result = ("unavailable", "catalog timed out")
    if isinstance(result, RuntimeError):
        raise result
    if isinstance(result, str):
        return result, "verified with Overture"
    previous = [p.name for p in _records(cache).glob("*") if ID.fullmatch(p.name) and p.is_file()]
    return max([RELEASE, *previous], key=_order), "using local release: " + result[1]


@contextmanager
def using(name):
    """Pin a release for this build process and the child processes it starts."""
    if not isinstance(name, str) or not ID.fullmatch(name):
        raise ValueError("Invalid Overture release in build data")
    old = os.environ.get(ENV)
    os.environ[ENV] = name
    try:
        yield name
    finally:
        if old is None:
            os.environ.pop(ENV, None)
        else:
            os.environ[ENV] = old


@contextmanager
def for_build(cache, log):
    """Report the chosen release and remember it for offline builds only after success."""
    name, reason = choose(cache)
    log(f"Overture map data: {name} ({reason})")
    with using(name):
        yield name
    try:
        folder = _records(cache)
        folder.mkdir(parents=True, exist_ok=True)
        (folder / name).touch()
    except OSError as error:
        log(f"Could not remember the Overture release for offline use: {error}")
