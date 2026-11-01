"""What differs between Windows and Linux: where Steam and AC's Documents folder are, whether a program runs, ending a
build with its worker processes, starting Steam and AC, the folder picker, free memory.

On Linux AC is the Windows game run by Proton: its Documents folder (race.ini) lies in its Proton prefix
(steamapps/compatdata/244210 of the library AC is in), and acs.exe starts through Proton's own script, the way Steam
starts games.
"""
import os
import re
import shutil
import signal
import subprocess
import time

WIN = os.name == "nt"
AC_APPID = "244210"
STEAM_DEFAULT = r"C:\Program Files (x86)\Steam" if WIN else os.path.expanduser("~/.local/share/Steam")
# Linux: where Steam installs itself (the native package, its ~/.steam links, Flatpak, Snap)
LINUX_STEAMS = ("~/.local/share/Steam", "~/.steam/steam", "~/.steam/root",
                "~/.var/app/com.valvesoftware.Steam/.local/share/Steam", "~/snap/steam/common/.local/share/Steam")
# Linux: Steam's registry file (ActiveProcess/ActiveUser, as in Windows' registry), native and Flatpak
LINUX_REGISTRY = ("~/.steam/registry.vdf", "~/.var/app/com.valvesoftware.Steam/.steam/registry.vdf")
# Popen arguments: the build runs in a process group of its own, so Stop ends it with its worker processes (kill_tree)
GROUP = {} if WIN else {"start_new_session": True}


def _unique(paths):
    """Existing folders, each once (~/.steam/steam is a link to ~/.local/share/Steam). Pure."""
    out, seen = [], set()
    for p in paths:
        real = os.path.realpath(p)
        if os.path.isdir(p) and real not in seen:
            seen.add(real)
            out.append(p)
    return out


def steam_roots():
    """Steam's folders: Windows from the registry (else the default), Linux the ones that exist."""
    if not WIN:
        return _unique(os.path.expanduser(p) for p in LINUX_STEAMS)
    steam = STEAM_DEFAULT
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as k:
            steam = os.path.normpath(winreg.QueryValueEx(k, "SteamPath")[0])
    except OSError:
        pass
    return [steam]


def steam_libraries():
    """The Steam libraries: every Steam folder and the libraries its libraryfolders.vdf lists."""
    libs = []
    for steam in steam_roots():
        libs.append(steam)
        try:
            with open(os.path.join(steam, "steamapps", "libraryfolders.vdf"), encoding="utf-8") as f:
                libs += [p.replace("\\\\", "\\") for p in re.findall(r'"path"\s+"([^"]+)"', f.read())]
        except OSError:
            pass
    return _unique(libs)


def compatdata(ac):
    """Linux: AC's Proton prefix folder (steamapps/compatdata/244210 next to steamapps/common/assettocorsa; else in
    another library, for an AC folder set by hand)."""
    near = os.path.join(os.path.dirname(os.path.dirname(os.path.normpath(ac))), "compatdata", AC_APPID)
    if os.path.isdir(near):
        return near
    for lib in steam_libraries():
        p = os.path.join(lib, "steamapps", "compatdata", AC_APPID)
        if os.path.isdir(p):
            return p
    return near


def documents(ac):
    """The Documents folder AC uses: Windows' own (also when it was moved, e.g. to OneDrive); on Linux the one in
    AC's Proton prefix."""
    if not WIN:
        return os.path.join(compatdata(ac), "pfx", "drive_c", "users", "steamuser", "Documents")
    import ctypes
    buf = ctypes.create_unicode_buffer(260)
    if ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf) == 0:     # (CSIDL_PERSONAL)
        return buf.value
    return os.path.join(os.path.expanduser("~"), "Documents")


def _processes():
    """Linux: (pid, name, command line) of every process; the name is the program's file name (Proton's processes:
    acs.exe, from their Windows path)."""
    for pid in os.listdir("/proc"):
        if not pid.isdigit():
            continue
        try:
            with open(f"/proc/{pid}/cmdline", "rb") as f:
                cmd = f.read().decode("utf-8", "replace").split("\0")
            with open(f"/proc/{pid}/comm", encoding="utf-8", errors="replace") as f:
                comm = f.read().strip()
        except OSError:
            continue
        name = re.split(r"[\\/]", cmd[0])[-1] if cmd[0] else comm
        yield int(pid), name, " ".join(cmd)


def running(exe):
    """Whether a program runs (acs.exe, steam.exe; on Linux steam.exe is Steam's own "steam")."""
    if not WIN:
        want = "steam" if exe.lower() == "steam.exe" else exe.lower()
        return any(name.lower() == want for _, name, _ in _processes())
    # (tasklist answers in the console code page, with umlauts on German Windows: cp850 output wasn't readable as
    # Python's cp1252 and the check crashed as soon as AC wasn't running)
    out = subprocess.run(["tasklist", "/FI", f"IMAGENAME eq {exe}", "/NH"], capture_output=True, text=True,
                         encoding="oem", errors="replace").stdout or ""
    return exe.lower() in out.lower()


def is_python(pid):
    """Whether process pid still runs and is a Python (a build left over from an earlier server)."""
    if not WIN:
        try:
            with open(f"/proc/{int(pid)}/cmdline", "rb") as f:
                return b"python" in f.read().lower()
        except (OSError, ValueError):
            return False
    out = subprocess.run(["tasklist", "/FI", f"PID eq {pid}", "/NH"], capture_output=True, text=True, encoding="oem",
                         errors="replace").stdout
    return str(pid) in out and "python" in out.lower()


def kill_tree(pid):
    """End process pid with the processes it started (a build started with GROUP and its workers)."""
    if WIN:
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(pid)], capture_output=True)
        return
    try:
        os.killpg(int(pid), signal.SIGKILL)
    except (OSError, ValueError):
        pass


def steam_user():
    """Signed-in Steam user (ActiveProcess/ActiveUser in the registry, on Linux in registry.vdf); 0: Steam isn't
    running or is still signing in."""
    if not WIN:
        for p in LINUX_REGISTRY:
            try:
                with open(os.path.expanduser(p), encoding="utf-8", errors="replace") as f:
                    m = re.search(r'"ActiveUser"\s+"(\d+)"', f.read())
            except OSError:
                continue
            if m and int(m.group(1)):
                return int(m.group(1))
        return 0
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam\ActiveProcess") as k:
            return int(winreg.QueryValueEx(k, "ActiveUser")[0])
    except OSError:
        return 0


def _steam_command():
    """The command that starts Steam: its exe from the registry; on Linux "steam", else Flatpak's."""
    if not WIN:
        if shutil.which("steam"):
            return ["steam"]
        if shutil.which("flatpak") and os.path.isdir(os.path.expanduser("~/.var/app/com.valvesoftware.Steam")):
            return ["flatpak", "run", "com.valvesoftware.Steam"]
        return None
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as k:
            return [winreg.QueryValueEx(k, "SteamExe")[0]]
    except OSError:
        return [os.path.join(STEAM_DEFAULT, "steam.exe")]


def _detached(cmd, **kw):
    """Start a program that outlives Map2Lap, without a console and without our output."""
    extra = {"creationflags": subprocess.DETACHED_PROCESS} if WIN else {"start_new_session": True}
    return subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                            **extra, **kw)


def ensure_steam(wait_s=90.0):
    """Start Steam if it isn't running and wait until it is signed in (acs.exe without the launcher needs it and
    doesn't start Steam itself); returns True when ready."""
    if running("steam.exe") and steam_user():
        return True
    if not running("steam.exe"):
        cmd = _steam_command()
        if not cmd:
            return False
        _detached(cmd + ["-silent"])
    end = time.time() + wait_s
    while time.time() < end:
        if running("steam.exe") and steam_user():
            time.sleep(3.0)         # (signed in; a moment more until Steam also accepts games)
            return True
        time.sleep(1.0)
    return False


def proton(ac):
    """Linux: Proton's start script that ran AC last (its prefix's config_info names Proton's files folder); None
    before AC ran once through Proton."""
    try:
        with open(os.path.join(compatdata(ac), "config_info"), encoding="utf-8", errors="replace") as f:
            lines = f.read().splitlines()
    except OSError:
        return None
    for line in lines:
        m = re.match(r"(/.*?)/(files|dist)/", line)
        if m and os.path.isfile(os.path.join(m.group(1), "proton")):
            return os.path.join(m.group(1), "proton")
    return None


def start_ac(ac):
    """Start acs.exe (the race race.ini describes; steam_appid.txt next to it: runs without the launcher). Linux:
    through the Proton that ran AC last, with the environment Steam gives it; without one, Steam starts AC (its
    launcher, or what replaced it)."""
    exe = os.path.join(ac, "acs.exe")
    if WIN:
        _detached([exe], cwd=ac)
        return
    script = proton(ac)
    if script is None:
        _detached((_steam_command() or ["steam"]) + ["-applaunch", AC_APPID])
        return
    root = (steam_roots() or [STEAM_DEFAULT])[0]
    env = {**os.environ, "STEAM_COMPAT_DATA_PATH": compatdata(ac), "STEAM_COMPAT_CLIENT_INSTALL_PATH": root,
           "SteamAppId": AC_APPID, "SteamGameId": AC_APPID}
    _detached([script, "run", exe], cwd=ac, env=env)


class NoPicker(Exception):
    """Linux without zenity and kdialog: no folder picker; the folder is typed in."""


# Windows' folder picker through PowerShell (the release's embedded Python has no tkinter); a shown, invisible topmost
# owner form puts it in front of the browser (Windows doesn't let a background process bring a window forward: with
# an owner that is never shown the picker opens behind the browser, and every later click waits for it), UTF-8 output
# keeps paths with umlauts intact
BROWSE_PS = (
    "[Console]::OutputEncoding = [Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms;"
    "$d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'Assetto Corsa folder';"
    "$d.ShowNewFolderButton = $false; if (Test-Path $env:M2L_START) { $d.SelectedPath = $env:M2L_START };"
    "$o = New-Object System.Windows.Forms.Form -Property @{TopMost = $true; ShowInTaskbar = $false; Opacity = 0;"
    " FormBorderStyle = 'None'; StartPosition = 'CenterScreen'; Width = 1; Height = 1};"
    "$o.Show(); $o.Activate();"
    "if ($d.ShowDialog($o) -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }; $o.Close()")


def browse_folder(start):
    """The system's folder picker (the page runs on the same machine): Windows' own, on Linux zenity (GNOME and most
    others) or kdialog (KDE); None: cancelled. Raises NoPicker when Linux has neither."""
    if WIN:
        cmd, kw = ["powershell", "-NoProfile", "-STA", "-Command", BROWSE_PS], {
            "env": {**os.environ, "M2L_START": start or ""}, "creationflags": subprocess.CREATE_NO_WINDOW}
    elif shutil.which("zenity"):
        cmd, kw = ["zenity", "--file-selection", "--directory", "--title=Assetto Corsa folder"] + (
            [f"--filename={start.rstrip('/')}/"] if start and os.path.isdir(start) else []), {}
    elif shutil.which("kdialog"):
        cmd, kw = ["kdialog", "--title", "Assetto Corsa folder", "--getexistingdirectory",
                   start if start and os.path.isdir(start) else os.path.expanduser("~")], {}
    else:
        raise NoPicker("No folder picker on this system (zenity or kdialog): type the folder's path in the field")
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)
    path = r.stdout.strip()
    return os.path.normpath(path) if path else None


def free_ram_gb():
    """Free memory in GB (Windows: available physical memory; Linux: MemAvailable), else None."""
    if not WIN:
        try:
            with open("/proc/meminfo", encoding="ascii") as f:
                kb = int(re.search(r"MemAvailable:\s+(\d+)", f.read()).group(1))
            return kb / 2 ** 20
        except (OSError, AttributeError):
            return None
    import ctypes
    try:
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                        ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                        ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                        ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                        ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]
        m = MEMORYSTATUSEX()
        m.dwLength = ctypes.sizeof(m)
        if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)):
            return m.ullAvailPhys / 2 ** 30
    except (AttributeError, OSError):
        pass
    return None
