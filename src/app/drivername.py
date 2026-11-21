"""Read the names the AC launcher uses for a local driver."""
from contextlib import closing
from pathlib import Path
import re
import sqlite3

from . import system

_PROFILE = Path("launcherdata", "Local Storage", "file__0.localstorage")
# A public, individual SteamID64 adds these high bits to the active account ID.
_STEAM_ID_BASE = 0x0110000100000000
_QUOTED = r'"(?:\\.|[^"\\])*"'


def _display(value):
    """One line suitable for AC's race.ini, from INI text or Chromium UTF-16LE storage. Pure."""
    if isinstance(value, bytes):
        try:
            value = value.decode("utf-16-le")
        except UnicodeError:
            return ""
    if not isinstance(value, str):
        return ""
    # Kunos also replaces brackets and commas when copying a profile name to race.ini.
    return " ".join(value.replace("\0", "").splitlines()).translate(str.maketrans("[],", "...")).strip()


def _ac_profile(documents):
    """Read the three driver-name fields in AC's launcher storage under its Documents folder."""
    profile = (Path(documents) / _PROFILE).absolute()
    if not profile.is_file():
        return ""
    try:
        # Immutable read-only mode also keeps SQLite from creating lock or journal files.
        with closing(sqlite3.connect(profile.as_uri() + "?mode=ro&immutable=1", uri=True)) as db:
            values = dict(db.execute("SELECT key, value FROM ItemTable WHERE key IN (?, ?, ?)",
                                     ("player.nameFirst", "player.nameLast", "player.nameNick")))
    except (OSError, sqlite3.Error):
        return ""
    full = " ".join(value for key in ("player.nameFirst", "player.nameLast") if (value := _display(values.get(key))))
    return full or _display(values.get("player.nameNick"))


def _steam_profile():
    """Read the display name of the active Steam account, even on machines with several saved logins."""
    account = system.steam_user()
    if not 0 < account < 2**32:
        return ""
    steam_id = _STEAM_ID_BASE + account
    for root in system.steam_roots():
        try:
            users = (Path(root) / "config/loginusers.vdf").read_text(encoding="utf-8-sig")
        except (OSError, UnicodeError):
            continue
        entry = re.search(rf'(?m)^\s*"{steam_id}"\s*\{{((?:[^{{}}"]|{_QUOTED})*)\}}', users)
        if entry and (name := re.search(rf'"PersonaName"\s*({_QUOTED})', entry[1], re.IGNORECASE)):
            return _display(re.sub(r'\\(["\\])', r'\1', name[1][1:-1]))
    return ""


def get(documents):
    """The driver name when race.ini has no name, from AC's Documents folder or Steam."""
    return _ac_profile(documents) or _steam_profile() or "Player"
