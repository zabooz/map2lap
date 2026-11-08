# Releases and Linux

## Making a release

Before packaging a page change, run `bun install --frozen-lockfile`, `bun run check` and `bun run e2e:all` from `ui/`
(browser setup: [ui/AGENTS.md](../ui/AGENTS.md)). The browser command builds `src/web`; commit those files with the
`ui/` source. Without browser tests, `bun run build` does the build alone. The archives include `src/web` and leave `ui/`
and its dependencies out: users need no Bun.

User-imported assets live in `library/` beside the app on both systems. It is excluded even from accidentally tracked release
inputs and is created by the app when needed. Never ship that folder: the start scripts replace the folders an update contains.
The updater therefore also refuses ZIP or TAR.GZ archives with a `Map2Lap/library` entry before marking them ready to install.
Failed downloads or archive checks remove their staging files. Editor saves and app updates refuse to start while the other
is running, so the update restart cannot interrupt a Save.

Both start scripts stop on an installation copy error and keep `update/ready` and the downloaded files for retry on the
next start. Windows retries each failed robocopy operation five times, two seconds apart; codes 8 and above fail the update.
Errors stay visible, and the app starts only after every folder, top-level file and the starter itself has been copied.
The starter of the installed version applies an update: these checks protect only updates started by a version that already
contains them. An older starter, including 0.5.7, still has its original retry and error handling during its first update.

`.venv\Scripts\python.exe tools\make_release.py [--win | --linux]` builds, on Windows, both `dist\Map2Lap-<version>-win64.zip`
(python.org's embeddable Python) and `dist\Map2Lap-<version>-linux-x64.tar.gz` (python-build-standalone with the packages'
manylinux wheels), each with all packages, BeamNG.Earth and the textures. `tools/` and the tests stay out.

`.venv\Scripts\python.exe tools\test_update.py --linux` then installs them over the last published release, as a user's
"Install update" does (the old start script's own lines), and starts the result: run it before publishing.

A GitHub release `v<version>` carries both as its assets under exactly these names: the page's update check and "Install
update" look for the one of their system (`--target` of `gh release create` takes the full commit hash).

## Linux

Everything that differs between the systems is in `app/system.py`: Steam and its libraries, AC's Proton prefix (its
`Documents` with `race.ini`), Play, processes, the folder picker, free memory.

Settings detects Custom Shaders Patch locally from `dwrite.dll` and `extension/config/data_manifest.ini`, including
the user's enable override in Documents. Missing installations offer an explicit **Install CSP** button: it downloads
the recommended public archive directly from the official `acstuff.club/patch/` page, stages and checks it, then merges
its files with rollback and activates the DLL last. Existing loaders/patches are never upgraded by this action. CSP is
not bundled with Map2Lap. A failed rollback retains recovery copies in the AC folder and reports their location.
The download does not require the browser to stay open; Settings polls only local status. Builds, Play and Map2Lap
updates are refused during installation. Changing the selected AC folder does not retarget an already requested install.

Play starts `acs.exe` the way Steam does (`_v2-entry-point` of the Steam Linux Runtime the Proton names, then `proton
waitforexitandrun`, with the `STEAM_COMPAT_*` environment), with the Proton Steam last used for AC
(`compatdata/244210/config_info`). It starts Steam first and waits until it is signed in (on Linux its
`logs/connection_log.txt`). `start.sh` and `Map2Lap.desktop` are `Start Map2Lap.bat`'s counterpart.
When CSP is installed and enabled, direct Proton Play adds `dwrite=n,b` to the launched process's `WINEDLLOVERRIDES`
unless an existing explicit override already names dwrite. It preserves other DLL overrides and changes no Steam settings
or persistent Wine registry entries. Steam-launched sessions need their own loader setting; Settings shows the launch
option. File installation and loader selection do not guarantee compatibility with every CSP/Proton version.

To develop on Linux: `python3.14 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, `./start.sh` (it takes
`.venv` when there is no bundled Python).
