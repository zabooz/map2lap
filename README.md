# Map2Lap

**Real roads for Assetto Corsa.** Mark a route or circuit on the map, or draw an area, and Map2Lap builds a drivable Assetto
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
connection and an installed and enabled [Custom Shaders Patch](https://acstuff.club/patch/). Newly built tracks
use CSP extended physics. Assetto Corsa crashes when loading them without CSP. We recommend 16 GB RAM.
[Content Manager](https://acstuff.club/app/) is optional. **▶ Play** can start Assetto Corsa directly.

### On Linux

Assetto Corsa runs through Proton there, and **▶ Play** starts it the way Steam does, with the Proton chosen for it in
Steam. Before the first track:

- Start Assetto Corsa once from Steam and drive a lap. If it doesn't start, pick **GE-Proton** (installed with
  ProtonUp-Qt) under *Properties → Compatibility* in Steam. The very first start in a new Proton prefix installs .NET
  in the background, without a window, for several minutes: wait until Assetto Corsa's launcher appears.
- On GNOME, right-click `Map2Lap.desktop` → **Allow Launching** once. Or start `./start.sh` in a terminal.
- Map2Lap runs in a terminal window; closing it ends Map2Lap.

## Features

These features describe the current source tree. For a downloaded build, see its [release notes](https://github.com/zabooz/map2lap/releases).

- **Route, Circuit and Area.** Set a start and finish for a Route. For a Circuit, place pins in driving order and click
  **Close circuit** to route back to the start. Both build a corridor along the roads. An Area builds the rectangle you draw.
- **A complete world:** terrain, roads, bridges, tunnels, buildings, street furniture, guardrails, pylons, rivers and
  lakes, trees, rocks, fields – plus distant terrain up to 40 km.
- **Driving sessions.** Play offers Practice on all tracks. On a Route with start and finish gates, Hotlap times a flying
  start and Race runs once from A to B. On a Circuit, Race lets you choose the lap count. Track details show your best
  stage time or lap. Race offers AI opponents up to the available grid capacity.
- **Editor:** inspect a track in 3D, move/copy/delete objects, import models and textures, paint object groups,
  adjust tree spacing, raise terrain, edit roads and add racing kerbs. Move or redraw the AI line and mark danger zones
  to reserve passing space along either edge. Changes are kept automatically as a draft;
  Undo restores the previous step. **Save** writes the track without rebuilding, **▾** offers Save as new track,
  and **▶ Play** saves if needed before driving. Keep the retained source to restore deleted built objects after Save.
- **Controls:** The tool list shows the current shortcuts. Ctrl adds to a selection; Shift selects all matching
  objects or ground regions. Help below the tools explains the active tool and its modifiers.
- **Conditions:** preview time of day, seasons and weather, then use them for the next Play, with independent air/road
  temperatures and wind. These session controls do not change the saved track.
- **My tracks.** Search Built or Edited tracks by name and filter by Route, Circuit or Area. Built tracks offer
  **Rebuild** and **Build as copy**. To copy an Edited track with its edits, open it in the Editor and choose
  **Save as new track**.

Short routes (2–20 km) work best: Assetto Corsa loads the whole track at once.

Build files are kept by default. Under **Settings → Editor → Build files** you can turn that off or delete them to
recover disk space. The Editor uses the installed track and its retained editing data; current tools do not require kept
build files. Older tracks without ground-selection data need rebuilding to add that data. The Editor's memory limit is under
**Settings → Editor → 3D view**; when reached, some parts or textures
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

Found a broken road or bridge? Open **Report a bug** in the side rail. Include the coordinates or route metre,
and optionally a track code and screenshots. Open the ticket again to read updates or reply. To capture what the car
did at the spot, enable **Settings → Map2Lap → Testing → Track Debug app** and press **F10** while driving.
The app saves a screenshot and driving data under `Documents\Assetto Corsa\map2lap_debug`. [Track Debug files](docs/ac-reports.md)

To share build settings, copy the **Track code** from **New track** or from the selected track under **My tracks → Built**.
Paste it under **New track** to build from the same pins or area and scenery settings. Pins are routed again on the
current map. Editor edits belong to the saved track.

## Development

```powershell
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe tools\get_textures.py
& ".\Start Map2Lap.bat"        # Linux: python3.14 -m venv .venv, .venv/bin/python ..., ./start.sh
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

`bun run build` rebuilds `src/web` without browser tests. Commit it together with the `ui/` changes.
Chrome setup and test commands are in [ui/AGENTS.md](ui/AGENTS.md).

## Credits

| | Source | Licence |
|---|---|---|
| World generator | [BeamNG.Earth](https://github.com/TecnaGamer/BeamNG.Earth) by TecnaGamer | MIT |
| Map data | © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [Overture Maps Foundation](https://overturemaps.org/) | ODbL |
| Elevation | [Mapterhorn](https://mapterhorn.com/attribution), AWS Terrain Tiles | per source |
| Land cover | © ESA WorldCover project 2021, contains modified Copernicus Sentinel data | CC BY 4.0 |
| Regional SD ground colours | [EOxCloudless](https://cloudless.eox.at) by EOX IT Services GmbH, contains modified Copernicus Sentinel data 2016 & 2017 | CC BY 4.0 |
| Tree heights | Meta and World Resources Institute | CC BY 4.0 |
| Routes, place names | [OSRM](https://project-osrm.org/), [Nominatim](https://nominatim.org/) | usage policies |
| Textures | [ambientCG](https://ambientcg.com/) | CC0 |

Tracks you build contain this data; the attribution is written into each track's description.

## License

[MIT](LICENSE). BeamNG.Earth's code in `engine/`, `native/` and `tools/data/` keeps its own
[MIT License](LICENSE-BeamNG.Earth). Map2Lap is a fan project and not
affiliated with Kunos Simulazioni, BeamNG GmbH or the BeamNG.Earth project.
