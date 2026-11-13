# Editor light, weather and seasons

Start with [Editor data flow and Save](editor.md). These controls affect the preview and the next AC session;
tree spacing in the same Properties tab is a persistent edit, described in [editor-tools.md](editor-tools.md#tree-spacing).
The shipped snow helper and fallback are described in [rust.md](rust.md).

## Light and the time of day

The clock in the Inspector's Properties tab (`SunClock`) shows the track's local time, 10:00 when a track opens. Nothing is saved or built; Play from
the Editor starts AC at that hour (`server.sun_angle`). `TrackView.setClock` sets sun, ambient, sky and the placed models' reflections together (`applyLight`); edited ground has
its own scene and takes the same values over (`GroundFrame.followLights`).

The sun stands where CSP has it with no date set in a session: the equinox's path, the same all year, from the track's anchor and
its time zone (`sun.ts`). The zone comes from the coordinates, offline; a date set in Content
Manager gives AC the real sun of that day, the Editor doesn't follow it. Materials keep their colours; other than ground they weigh
the sky's and the sun's light by their ksAmbient and ksDiffuse (`lightShare.ts`). Ground stays on the plain light, as painting it
replaces its shader.

Houses throw the sun's shadow (`sunShadows.ts`, by the mesh name `_bld`); ground, objects, plants and placed models take it, nothing
else throws one, so the view shows less than AC does (hills, bridges, poles, cars). The map is drawn once per drawn frame, by a render
of the main scene that sees no mesh (three.js draws maps only inside a render, and edited ground, drawn first, has no houses); edited
ground shares it (`GroundFrame`). It reaches from the camera 200 m deep, more the higher the camera is. In a shadow the sky's light
falls to 70 %, in three.js's own light chunks, so all materials agree.

At night, when CSP's lamps come on, windows and lamp glass glow (`nightGlow.ts`): facades through the masks in the track's `extension`
folder, fetched only then (a track built before has none and stays dark), and a see-through cone hangs under each lamp in one draw,
placed from the glass as it stands, so that it follows a lamp moved or deleted. No light falls on the road in the view; Play shows it.

At night a weak full moon stands across the sky from the sun (`moonDirection`) and lights the track from one side; its disc and
the stars are `NightSky`. It is the Editor's own: AC's midnight is black outside the headlights, which the Editor doesn't have.

## Weather

Properties groups Time of day and Season under Time and date; Conditions contains weather, temperatures, wind and fog;
Vegetation contains Trees. Season offers Spring, Summer, Autumn and Winter, defaulting to
Summer. Spring and Summer use the original green foliage. Autumn warms deciduous foliage; Winter hides its leaf cards
and adds snow to upper surfaces in the Editor. Broadleaf, birch and larch retain their original meshes with permanent
branches added inside the crowns; baobab uses its existing branches. Evergreen and tropical foliage stays in place.
Snow weather always uses Winter scenery, temporarily disabling the Season selector while retaining the previous choice.
The season changes the Editor immediately and applies to AC on the next Play, without Save or a track rebuild.
Ground season effects also cover replacement Library textures, including the saved regional ground copies.

Dry offers Clear, Partly cloudy and Overcast; Rain and Snow offer Light,
Moderate and Heavy. Heavy Rain uses CSP's Heavy Thunderstorm preset, including its native lightning. Heavy Snow already
has the base weather's strongest fog. Additional fog blends toward CSP Fog while retaining the selected precipitation type.
Snow also offers Snow on windscreen, enabled by default. Turning it off prevents snow deposits on the front windscreen
in the next AC session; outdoor snowfall and side-window snow retain the selected intensity.
Wind direction is a compass bearing (where it comes from), with Random before 0 degrees; 360 is also north. Wind speed is
0–100 km/h, with Random before 0. Random is resolved once for each Play. Air temperature (-30–50 °C) and road temperature
(-30–80 °C) are independent sliders, initially 20 °C and 26 °C. Play writes both to the session. The Map2Lap controller
reads these temperatures and wind speed directly, without changing CSP's global experimental limits.

These controls are session-only like the clock: no draft change, Save or Undo entry. A track opens with dry, clear weather,
random wind direction and speed. `weatherPreview.ts` gives a small GPU particle field, approximate lighting and distance fog;
AC uses CSP's actual sky, clouds, light and wind. Weather and the clock travel together through Save-as-new-track followed
by Play. Wind-only and temperature-only changes leave the editor's lighting/reflection maps alone.

`app/weather.py` validates the settings and writes the session. It installs an owned Map2Lap controller alongside CSP's
controllers, without changing the stock ones. Generated and saved tracks include `assets/weather/weather.lua` as a
track-local script through an owned include; Play also prepares older tracks. The asset is shipped in releases independently
of CSP, which remains a separate installation. Debug controls and mode-file polling are enabled only by the developer
preview helper. `app/seasons.py` prepares recognized Map2Lap TreeFX atlases before AC loads, including native Library aliases,
and adds native CSP winter conditions for trees and winter/autumn conditions for ground. Native autumn tint on TreeFX is
zero: deciduous atlases already provide autumn colours, and evergreen needles retain their green. Geometry is shared across seasons; immutable Library
snapshots and custom tree files remain untouched. CSP supplies winter snow shading on trees and terrain in AC.
Settings > Map2Lap > Weather has a persistent **Map2Lap weather effects** switch, on by default. It applies on the next
Play: off removes only Map2Lap's owned effect include and skips its snow helper, allowing CSP's own effects. Weather,
time, temperatures and seasons still reach the session; unrelated track scripts and global CSP settings stay intact.
With the switch on, the controller keeps water/wetness at zero for the visual effects. With it off, native CSP rain/surface
conditions pass through. Air and road temperatures are ordinary AC session conditions.
