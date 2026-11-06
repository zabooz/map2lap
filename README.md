# Map2Lap

**Real roads for Assetto Corsa.** Pick a route on a map – or draw an area – and Map2Lap builds a drivable Assetto
Corsa track from real-world data: lidar terrain, real roads with bridges and tunnels, buildings, water and trees, in a
comic style. The track is installed straight into Assetto Corsa.

Built on the world generator of [BeamNG.Earth](https://github.com/TecnaGamer/BeamNG.Earth) by TecnaGamer.

## Quick start

1. Download from [Releases](https://github.com/zabooz/map2lap/releases/latest) and unpack it:
   `Map2Lap-<version>-win64.zip` (Windows) or `Map2Lap-<version>-linux-x64.tar.gz` (Linux).
2. Double-click **`Start Map2Lap.bat`** (Windows) or **`Map2Lap.desktop`** (Linux) – the generator page opens in
   your browser.
3. Click a start and a finish on the map, then **Build track**. When it's done, click **▶ Play**.

**You need:** Windows 10/11 64-bit or a 64-bit Linux (glibc 2.35 or newer: Ubuntu 22.04, Fedora 36, Arch, SteamOS 3
or later), [Assetto Corsa](https://store.steampowered.com/app/244210/Assetto_Corsa/) on Steam, an internet
connection, 16 GB RAM recommended. [Content Manager](https://acstuff.club/app/) and
[Custom Shaders Patch](https://acstuff.club/patch/) are recommended (animated water needs CSP); **▶ Play** works
without them.

### On Linux

Assetto Corsa runs through Proton there, and **▶ Play** starts it the way Steam does, with the Proton chosen for it in
Steam. Before the first track:

- Start Assetto Corsa once from Steam and drive a lap. If it doesn't start, pick **GE-Proton** (installed with
  ProtonUp-Qt) under *Properties → Compatibility* in Steam. The very first start in a new Proton prefix installs .NET
  in the background, without a window, for several minutes: wait until Assetto Corsa's launcher appears.
- On GNOME, right-click `Map2Lap.desktop` → **Allow Launching** once. Or start `./start.sh` in a terminal.
- Map2Lap runs in a terminal window; closing it ends Map2Lap.

## Features

- **Route or area:** routes follow real roads (with waypoints) and build a corridor along them; areas build everything
  inside a rectangle.
- **A complete world:** terrain, roads, bridges, tunnels, buildings, street furniture, guardrails, pylons, rivers and
  lakes, trees, rocks, fields – plus distant terrain up to 40 km.
- **Timing:** routes get a start line, a finish line and START/FINISH gantries, timed like a rally stage.
- **Brush (Editor, B):** raise or lower the ground, with the road and what stands on it: a click by its height, held more and more
  where the ring is, Shift the other way, Ctrl or Alt with the wheel for its radius or height; each is one undo. Save writes it into the
  track without a build. A change that reaches a bridge, a tunnel or a railway is refused. **X:** each click deletes what is under it.
- **My tracks:** under **Built**, rebuild a track with the latest version, build a copy, delete it, or **▶ Play** it straight
  away. Tracks saved in the Editor stand under **Edited**: open them again, build a new copy from the map, delete them or play
  them; no build replaces them.
- **Editor:** inspect a built track in 3D. Move over the ground with W A S D or by dragging with the right mouse button, zoom
  with the wheel, turn and tilt by holding it. Point at a surface, tree or building to see its
  material, physics and position. Click an object, such as a tree, a parked car, a house, a sign or a fence, and press Delete to take it out of the view, Ctrl+Z brings it
back (a track built before this version: build it again for everything but trees and bushes);
right-click it to mark all of its sort (all parked cars, all benches) and delete them at once. Changes are kept by themselves;
**Save** writes the track (the first time it asks: in its place, or as a new track with a name of your choice),
**▾** saves it as a new track, and **▶ Play** saves if needed and drives it. What was deleted can be brought back after any Save.
Building the track again from the map brings back what was deleted. All keys: Settings → Editor. A Save needs room on the disk for the
track's file once more, a new track twice: tens of GB for a track of hundreds of km.

Short routes (2–20 km) work best: Assetto Corsa loads the whole track at once.

Build files are kept by default. Under **Settings → Editor → Build files** you can turn that off or delete them to
recover disk space. Viewing a track in the Editor needs only the installed track; planned editing tools will need its
build files. The Editor's memory limit is under **Settings → Editor → 3D view**; when reached, some parts or textures
stay out of the preview.

## Troubleshooting

| Problem | What to do |
|---|---|
| Windows warns about running the file | The release isn't signed: click **Run** (or *More info → Run anyway*). To stop the question, right-click the zip before unzipping → *Properties* → tick **Unblock**. |
| Windows blocks Map2Lap, or a build fails with "DLL load failed" | **Smart App Control** blocks Map2Lap's unsigned files (it does even after *Unblock*). Turn it off under *Windows Security → App & browser control → Smart App Control settings*. |
| Assetto Corsa isn't found | **Settings** → choose your `assettocorsa` folder. |
| Linux: **Browse …** opens no folder dialog | Type the path of your `assettocorsa` folder into the field (the dialog needs `zenity` or `kdialog`). |
| Linux: **▶ Play** starts nothing | Start Assetto Corsa from Steam once (see *On Linux*): when it doesn't start there either, its Proton is the problem. |
| The page doesn't open / port in use | Map2Lap is already running – use that window, or close it and start again (http://localhost:8800). |
| A build fails | See the build log. Usually the map data couldn't be downloaded: check the connection and try again. |
| A new track is missing in Content Manager | Restart Content Manager. |

Found a broken road or bridge? Please open an issue with the coordinates. Easiest: **Settings → Map2Lap → Testing → Track Debug
app**, press **F10** at the spot while driving and attach that session's folder from
`Documents\Assetto Corsa\map2lap_debug` (the marks, the drive around each, a screenshot of each, and what it takes to
build the same track again).

To share a track, copy its **track code** from the status card (under **My tracks → Built**, or under **New track** as
soon as the route is set); the other person pastes it into the same field under **New track** and builds it. A track under
**Edited** has no code: a code holds the route, not the edits.

## Development

```powershell
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe tools\get_textures.py
"Start Map2Lap.bat"            # Linux: python3.14 -m venv .venv, .venv/bin/python ..., ./start.sh
```

Assetto Corsa with CSP is found through Steam, or set it in the page's Settings. The map data cache (`cache\`, 20 GB by
default) and the textures (`assets\textures\`, CC0 from ambientCG) stay out of git. How to work in the repo:
[AGENTS.md](AGENTS.md).

The generator page's source is React and TypeScript in `ui/`; its built files in `src/web` are committed and shipped
in releases. Running Map2Lap needs no Bun. To change the page, install Bun and, from `ui/`, run:

```powershell
bun install --frozen-lockfile
bun run dev                   # http://localhost:3000; start Map2Lap on port 8800 too
bun run check                 # TypeScript, ESLint and unit tests
bun run e2e                   # builds src/web and tests the page in Chrome
```

`bun run build` rebuilds `src/web` without browser tests. Commit it together with the `ui/` changes. Browser setup and
the other browsers: [AGENTS.md](AGENTS.md#the-page).

## Credits

| | Source | Licence |
|---|---|---|
| World generator | [BeamNG.Earth](https://github.com/TecnaGamer/BeamNG.Earth) by TecnaGamer | MIT |
| Map data | © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [Overture Maps Foundation](https://overturemaps.org/) | ODbL |
| Elevation | [Mapterhorn](https://mapterhorn.com/attribution), AWS Terrain Tiles | per source |
| Land cover | © ESA WorldCover project 2021, contains modified Copernicus Sentinel data | CC BY 4.0 |
| Tree heights | Meta and World Resources Institute | CC BY 4.0 |
| Routes, place names | [OSRM](https://project-osrm.org/), [Nominatim](https://nominatim.org/) | usage policies |
| Textures | [ambientCG](https://ambientcg.com/) | CC0 |

Tracks you build contain this data; the attribution is written into each track's description.

## License

[MIT](LICENSE). BeamNG.Earth's code in `engine/`, `native/` and `tools/data/` keeps its own
[MIT License](LICENSE-BeamNG.Earth). Map2Lap is a fan project and not
affiliated with Kunos Simulazioni, BeamNG GmbH or the BeamNG.Earth project.
