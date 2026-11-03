# Releases and Linux

## Making a release

`.venv\Scripts\python.exe tools\make_release.py [--win | --linux]` builds, on Windows, both `dist\Map2Lap-<version>-win64.zip`
(python.org's embeddable Python) and `dist\Map2Lap-<version>-linux-x64.tar.gz` (python-build-standalone with the packages'
manylinux wheels), each with all packages, BeamNG.Earth and the textures. `tools/` and the tests stay out.

A GitHub release `v<version>` carries both as its assets under exactly these names: the page's update check and "Install
update" look for the one of their system (`--target` of `gh release create` takes the full commit hash).

## Linux

Everything that differs between the systems is in `app/system.py`: Steam and its libraries, AC's Proton prefix (its
`Documents` with `race.ini`), Play, processes, the folder picker, free memory.

Play starts `acs.exe` the way Steam does (`_v2-entry-point` of the Steam Linux Runtime the Proton names, then `proton
waitforexitandrun`, with the `STEAM_COMPAT_*` environment), with the Proton Steam last used for AC
(`compatdata/244210/config_info`). It starts Steam first and waits until it is signed in (on Linux its
`logs/connection_log.txt`). `start.sh` and `Map2Lap.desktop` are `Start Map2Lap.bat`'s counterpart.

To develop on Linux: `python3.12 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, `./start.sh` (it takes
`.venv` when there is no bundled Python).
