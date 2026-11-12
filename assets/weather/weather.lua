-- Map2Lap precipitation on public CSP 0.2.11: own rain and snow, independent of RainFX.
-- One batched mesh. All particles live in one vertex buffer that Lua rewrites each frame
-- and one render.mesh call draws, instead of one render.shaderedQuad call per particle.
-- Experimental windscreen overlay is retained for later work, disabled in the normal preview.
local WINDSCREEN_ENABLED = false
local DEBUG = ac.INIConfig.trackConfig():get('MAP2LAP_WEATHER', 'DEBUG', false)
local glass, veil
local sqrt, min, max, floor, sin, cos = math.sqrt, math.min, math.max, math.floor, math.sin, math.cos
local folder = ac.getFolder(ac.FolderID.CurrentTrack) .. '/extension/'
local sim = ac.getSim()
local elapsed, polling, heartbeat = 0, 0, 0
local mode = 'off'
local needsReset = true
local density = 1
local previousWeather = nil
local lastFileMode = DEBUG and (io.load(folder .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+') or nil
-- RainFX is absent, so rainIntensity stays zero even for a rainy weather type.
-- The selected weather type decides the visual fallback instead.
local nativeParticles = {
  [ac.WeatherType.LightThunderstorm] = {'rain', 0.55},
  [ac.WeatherType.Thunderstorm] = {'rain', 0.8},
  [ac.WeatherType.HeavyThunderstorm] = {'rain', 1},
  [ac.WeatherType.LightDrizzle] = {'rain', 0.15},
  [ac.WeatherType.Drizzle] = {'rain', 0.25},
  [ac.WeatherType.HeavyDrizzle] = {'rain', 0.4},
  [ac.WeatherType.LightRain] = {'rain', 0.35},
  [ac.WeatherType.Rain] = {'rain', 0.65},
  [ac.WeatherType.HeavyRain] = {'rain', 1},
  [ac.WeatherType.LightSnow] = {'snow', 0.3},
  [ac.WeatherType.Snow] = {'snow', 0.65},
  [ac.WeatherType.HeavySnow] = {'snow', 1},
}
local frames, drawn, luaMs, submitMs = 0, 0, 0, 0
local beginCount, shelteredCount, shelterMs, frameDt = 0, 0, 0, 0
local held = false
local wind = vec3()
local cameraVelocity = vec3()
local driftX, driftZ = 0, 0

local function notify()
  if not DEBUG then return end
  local weatherType = ac.getConditionsSet().currentType
  ac.setMessage(string.format('Map2Lap: %s | weather type %d | wind %.0f km/h', mode, weatherType, sim.windSpeedKmh),
    'Follows CSP weather | Ctrl+Alt+W: weather controls | R/S/0: temporary particle test (with Ctrl+Alt)', nil, 8)
end

-- Particle seeds: a deterministic set, so a reload shows the same field.
local random = 173
local function rand()
  random = random * 16807 % 2147483647
  return random / 2147483647
end
local COUNT = 8192
-- The camera-wrapped volume: 28 m wide and deep, 14 m tall, so a particle leaving one side enters the other.
local BOX, HALF, BOXY, HALFY = 28, 14, 14, 7
local px, py, pz, weight, size, phase, aspect = {}, {}, {}, {}, {}, {}, {}
for i = 0, COUNT - 1 do
  px[i], py[i], pz[i] = rand() * BOX, rand() * BOXY, rand() * BOX
  weight[i], size[i], phase[i], aspect[i] = rand(), 0.65 + rand() * 0.7, rand() * 6.283, 0.6 + rand() * 0.7
end

-- One mesh for every particle: four vertices and two triangles each. Hidden particles collapse to a point.
local vertices = ac.VertexBuffer(COUNT * 4)
local indices = ac.IndicesBuffer(COUNT * 6)
for i = 0, COUNT - 1 do
  local b = i * 4
  indices:set(i * 6 + 1, b); indices:set(i * 6 + 2, b + 1); indices:set(i * 6 + 3, b + 2)
  indices:set(i * 6 + 4, b); indices:set(i * 6 + 5, b + 2); indices:set(i * 6 + 6, b + 3)
  -- The pixel shader reads the particle id from the integer part of U and the corner from the fraction.
  for c = 0, 3 do
    local v = vertices.raw[b + c]
    local u = (c == 2 or c == 3) and 0.998 or 0
    local w = (c == 1 or c == 2) and 0.998 or 0
    v.uv.x, v.uv.y = i + u, w
    v.normal.x, v.normal.y, v.normal.z = 0, 1, 0
    -- A huge initial extent gives the mesh bounds that no camera position leaves.
    local far = (c % 2 == 0) and -50000 or 50000
    v.pos.x, v.pos.y, v.pos.z = far, far, far
  end
end
local holder = ac.findNodes('luaRoot:yes'):createNode('M2L_WEATHER', false)
local mesh = holder and holder:createMesh('M2L_PRECIPITATION', 'M2L_PRECIPITATION', vertices, indices, false, false)
if mesh then mesh:setVisible(false) end
ac.log(string.format('M2L_WEATHER mesh=%s vertices=%d', tostring(mesh ~= nil), COUNT * 4))
local identity = mat4x4.identity()
local batch = {
  mesh = mesh,
  transform = identity,
  async = true,
  cacheKey = 4,
  values = {gSnow = 0, gTime = 0, gColor = rgb(0.6, 0.65, 0.7)},
  shader = [[
    float hash(float n) { return frac(sin(n * 12.9898) * 43758.5453); }
    float4 main(PS_IN pin) {
      // U: particle id + corner. V: kind in the thousands, softness or age tenths in the hundreds,
      // alpha percent below, corner in the fraction.
      float2 t = frac(pin.Tex);
      float id = floor(pin.Tex.x);
      float packed = floor(pin.Tex.y);
      float kind = floor(packed / 1000);
      packed = fmod(packed, 1000);
      float soft = floor(packed / 100) / 9;
      float alpha = fmod(packed, 100) / 100;
      float2 q = t * 2 - 1;
      float h = hash(id);
      float shape;
      if (kind > 0.5) {
        // A splash crown standing on the road: a spike that rises and collapses within its life, with a
        // ring of spray widening around it. t.y is 0 at the ground.
        float life = soft;
        float height = sin(life * 3.14159);
        float spike = exp(-q.x * q.x * 14) * step(t.y, height) * (1 - t.y / max(height, 0.01));
        float spray = exp(-pow((abs(q.x) - 0.3 - 0.6 * life) * 5, 2)) * exp(-pow((t.y - 0.35 * height) * 4, 2)) * 0.7;
        shape = (spike + spray) * (1 - life * life) * 1.6;
      } else if (gSnow < 0.5) {
        // A streak: soft across its width, fading at both shutter endpoints, a touch brighter near the drop.
        float across = exp(-4.5 * q.x * q.x);
        float along = 1 - smoothstep(0.45, 1, abs(q.y));
        shape = across * along * (0.85 + 0.3 * saturate(-q.y));
      } else {
        // An irregular clump that turns at its own rate; near flakes are out of focus, so softer and rounder.
        float a = gTime * (0.5 + h) + h * 6.283;
        float c = cos(a), s = sin(a);
        float2 f = float2(c * q.x - s * q.y, s * q.x + c * q.y);
        float grain = sin(f.x * 11 + h * 7) * sin(f.y * 9 - h * 5) * (1 - soft);
        float r = length(f * float2(1, 1.1 + 0.2 * h)) + grain * 0.1;
        shape = exp(-lerp(3.5, 1.8, soft) * dot(f, f)) * (1 - smoothstep(lerp(0.3, 0.1, soft), 1, r));
      }
      // Drops and flakes differ in brightness: no two identical bright marks.
      return pin.ApplyFog(float4(gColor * (0.7 + 0.3 * h), shape * alpha));
    }
  ]]
}

local function setMode(nextMode)
  if nextMode == 'auto' then previousWeather = nil; return end
  -- Track scripts are isolated from global weather control; CSP's own controls set the conditions.
  if nextMode == 'fog' or nextMode == 'wind' or nextMode == 'direction' then
    ac.setAppOpen('CspDebug'); notify(); return
  end
  if nextMode ~= 'off' and nextMode ~= 'rain' and nextMode ~= 'snow' then return end
  if nextMode == mode then return end
  mode = nextMode
  needsReset = true
  if DEBUG then ac.log('M2L_WEATHER mode=' .. mode .. ' CSP=' .. ac.getPatchVersion() .. ' build=' .. ac.getPatchVersionCode()) end
  notify()
end

-- Shelter: a 7 x 7 grid of 4 m columns around the camera. Sample down from above to find the uppermost
-- covering surface, including stacked bridges. A particle below that surface is hidden. Cars are ignored.
-- This is a coarse vertical shelter mask; it does not model precipitation blowing in from the side.
local GRID, CELL = 7, 4
local roofIx, roofIz, roofY, roofBand = {}, {}, {}, {}
local roofPhysicsY, roofTrackY = {}, {}
local NO_ROOF, ROOF_REACH = -1e9, 60
for i = 0, GRID * GRID - 1 do
  roofY[i], roofPhysicsY[i], roofTrackY[i] = NO_ROOF, NO_ROOF, NO_ROOF
end
local roofCursor, trackCursor, trackPhase = 0, 0, 0
local rayOrigin, roofDirection = vec3(), vec3(0, -1, 0)
-- Physics meshes (collidable road, bridge decks, tunnel linings) answer in about 0.01 ms, the full track mesh
-- in about 0.5 ms (measured on Heiligenblut). So every frame two columns ask the physics meshes, and every
-- fourth frame one column asks the track mesh as well, which also finds non-collidable roofs and tree crowns.
local function castRoof(ix, iz, cy, method)
  -- Reach 60 m above the camera for bridge decks/roofs; end below the particle box. Taller covers remain
  -- outside this approximation. Starting at eye level would miss upper decks behind the first ceiling.
  local top = cy + ROOF_REACH
  rayOrigin:set((ix + 0.5) * CELL, top, (iz + 0.5) * CELL)
  local ray = render.createRay(rayOrigin, roofDirection, ROOF_REACH + HALFY)
  local hit = method == 'track' and ray:track(0) or ray:physics()
  local height = hit > 0 and top - hit or NO_ROOF
  -- Terrain below the eye is handled by depth testing. Treating a sloped road as a flat 4 m roof cell
  -- would hide valid splashes and nearby drops on its downhill side.
  return height > cy and height or NO_ROOF
end
local function updateShelter(cx, cy, cz)
  local baseX, baseZ = floor(cx / CELL) - 3, floor(cz / CELL) - 3
  local band = floor(cy / CELL)
  for _ = 1, 2 do
    local cell = roofCursor
    roofCursor = (roofCursor + 1) % (GRID * GRID)
    local ix, iz = baseX + cell % GRID, baseZ + floor(cell / GRID)
    local slot = (ix % GRID) * GRID + iz % GRID
    if roofIx[slot] ~= ix or roofIz[slot] ~= iz or roofBand[slot] ~= band then
      roofIx[slot], roofIz[slot], roofBand[slot] = ix, iz, band
      roofTrackY[slot] = NO_ROOF
    end
    -- Replace each channel's answer, including misses. Keeping an all-time maximum makes old roofs persist.
    roofPhysicsY[slot] = castRoof(ix, iz, cy, 'physics')
    roofY[slot] = max(roofPhysicsY[slot], roofTrackY[slot])
  end
  trackPhase = (trackPhase + 1) % 4
  if trackPhase == 0 then
    local cell = trackCursor
    trackCursor = (trackCursor + 1) % (GRID * GRID)
    local ix, iz = baseX + cell % GRID, baseZ + floor(cell / GRID)
    local slot = (ix % GRID) * GRID + iz % GRID
    if roofIx[slot] == ix and roofIz[slot] == iz and roofBand[slot] == band then
      roofTrackY[slot] = castRoof(ix, iz, cy, 'track')
      roofY[slot] = max(roofPhysicsY[slot], roofTrackY[slot])
    end
  end
end
local function sheltered(wx, wy, wz)
  local ix, iz = floor(wx / CELL), floor(wz / CELL)
  local slot = (ix % GRID) * GRID + iz % GRID
  return roofIx[slot] == ix and roofIz[slot] == iz and wy < roofY[slot]
end

local activeCount = 0
local function hide(from, to)
  for i = from, to - 1 do
    local b = i * 4
    for c = 0, 3 do
      local v = vertices.raw[b + c]
      v.pos.x, v.pos.y, v.pos.z = 0, -10000, 0
    end
  end
end

local raw = vertices.raw

-- Writes one particle's quad: centre c, half side vector s, half axis vector e, packed alpha/softness.
local function place(b, cx, cy, cz, sx, sy, sz, ex, ey, ez, aq)
  local v = raw[b]
  v.pos.x, v.pos.y, v.pos.z, v.uv.y = cx - sx - ex, cy - sy - ey, cz - sz - ez, aq
  v = raw[b + 1]
  v.pos.x, v.pos.y, v.pos.z, v.uv.y = cx - sx + ex, cy - sy + ey, cz - sz + ez, aq + 0.998
  v = raw[b + 2]
  v.pos.x, v.pos.y, v.pos.z, v.uv.y = cx + sx + ex, cy + sy + ey, cz + sz + ez, aq + 0.998
  v = raw[b + 3]
  v.pos.x, v.pos.y, v.pos.z, v.uv.y = cx + sx - ex, cy + sy - ey, cz + sz - ez, aq
end

-- Collapses one particle's quad to a point below the world.
local function drop(b, cx, cy, cz)
  for c = 0, 3 do
    local v = raw[b + c]
    v.pos.x, v.pos.y, v.pos.z = cx, cy - 10000, cz
  end
end

-- Rain and snow have their own loops: one loop with both branches ran four times slower under LuaJIT.
local function buildRain(count, cx, cy, cz, lx, ly, lz, metrePerPixel, vx, vy0, vz)
  for i = 0, count - 1 do
    local w = weight[i]
    local speed = 5.5 + w * 3.5
    -- World-phase wrapping: moving the camera reveals particles without dragging them along.
    local x = (px[i] + driftX - cx + HALF) % BOX - HALF
    local y = (py[i] - elapsed * speed - cy + HALFY) % BOXY - HALFY
    local z = (pz[i] + driftZ - cz + HALF) % BOX - HALF
    local d2 = x * x + y * y + z * z
    local b = i * 4
    local covered = sheltered(cx + x, cy + y, cz + z)
    if covered then shelteredCount = shelteredCount + 1 end
    if not covered and d2 > 2 and d2 < 225 and x * lx + y * ly + z * lz > -0.3 then
      local distance = sqrt(d2)
      local pixelMetres = metrePerPixel * distance
      local edge = min(1, (15 - distance) / 4) * min(1, (distance - 1.4) / 1.2)
      -- The streak follows the apparent velocity: fall plus wind, minus the camera's own motion.
      local vy = vy0 - speed
      -- A free camera can move with a drop; keep its zero apparent velocity finite when normalising.
      local relative = max(1e-6, sqrt(vx * vx + vy * vy + vz * vz))
      local ux, uy, uz = -vx / relative, -vy / relative, -vz / relative
      -- 16 ms of shutter smear along the apparent velocity.
      local hh = min(0.6, max(0.05, relative * 0.016)) * 0.5
      local width = (0.0025 + w * 0.003) * size[i]
      local shown = max(width, pixelMetres * 1.3)
      local hw = shown * 0.5
      -- A streak thinner than a pixel is drawn a pixel wide but fainter, so no uniform white bars appear.
      local alpha = (0.3 + w * 0.25) * edge * max(0.35, sqrt(width / shown))
      -- The side vector lies across the streak and across the view direction.
      local sx, sy, sz = uy * z - uz * y, uz * x - ux * z, ux * y - uy * x
      local sl = sqrt(sx * sx + sy * sy + sz * sz)
      if sl < 1e-6 then sx, sy, sz, sl = 1, 0, 0, 1 end
      local k = hw / sl
      place(b, cx + x, cy + y, cz + z, sx * k, sy * k, sz * k, ux * hh, uy * hh, uz * hh,
        floor(min(99, max(0, alpha * 100))))
      drawn = drawn + 1
    else
      drop(b, cx, cy, cz)
    end
  end
end

local function buildSnow(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upx, upy, upz, sdx, sdy, sdz)
  for i = 0, count - 1 do
    local w = weight[i]
    local speed = 0.45 + w * 0.85
    local ph = phase[i]
    -- Each flake sways and tumbles at its own rate.
    local x = (px[i] + driftX + sin(elapsed * (0.8 + w) + ph) * 0.18 - cx + HALF) % BOX - HALF
    local y = (py[i] - elapsed * speed - cy + HALFY) % BOXY - HALFY
    local z = (pz[i] + driftZ + cos(elapsed * 0.65 + ph) * 0.15 - cz + HALF) % BOX - HALF
    local d2 = x * x + y * y + z * z
    local b = i * 4
    local covered = sheltered(cx + x, cy + y, cz + z)
    if covered then shelteredCount = shelteredCount + 1 end
    if not covered and d2 > 2 and d2 < 225 and x * lx + y * ly + z * lz > -0.3 then
      local distance = sqrt(d2)
      local pixelMetres = metrePerPixel * distance
      local edge = min(1, (15 - distance) / 4) * min(1, (distance - 1.4) / 1.2)
      -- Flakes from 6 to 30 mm, most of them medium; the soft core needs 2.5 px, 14 px caps nearby discs.
      local width = (0.006 + w * w * 0.025) * size[i]
      local shown = min(pixelMetres * 14, max(width, pixelMetres * 2.5))
      local hw, hh = shown * 0.5, shown * aspect[i] * 0.5
      local alpha = (0.5 + w * 0.3) * edge
      -- Within about 4 m a flake is out of focus for a driver's eye.
      local soft = max(0, 1 - distance / 4)
      place(b, cx + x, cy + y, cz + z, sdx * hw, sdy * hw, sdz * hw, upx * hh, upy * hh, upz * hh,
        floor(min(99, max(0, alpha * 100))) + floor(soft * 9 + 0.5) * 100)
      drawn = drawn + 1
    else
      drop(b, cx, cy, cz)
    end
  end
end

-- Splashes: the last 256 quads of the buffer, free in rain mode (rain uses 70 percent of the budget). A drop
-- hitting the road throws up a crown for about a fifth of a second. Downward physics rays (0.01 ms each) find
-- the road within 9 m of the camera, mostly ahead of it.
local SPLASHES, SPLASH_FIRST, SPLASH_LIFE = 256, COUNT - 256, 0.22
local splashX, splashY, splashZ, splashAge = {}, {}, {}, {}
for i = 0, SPLASHES - 1 do splashX[i], splashY[i], splashZ[i], splashAge[i] = 0, 0, 0, 1e9 end
local splashBudget, splashNext = 0, 0
local rayDown = vec3(0, -1, 0)
local function updateSplashes(dt, cx, cy, cz, lx, lz, sdx, sdy, sdz)
  -- Heavy rain: 450 crowns a second in the disc, about a hundred alive at a time.
  splashBudget = min(6, splashBudget + 450 * density * dt)
  local look = sqrt(lx * lx + lz * lz)
  local fx, fz = look > 1e-3 and lx / look or 0, look > 1e-3 and lz / look or 0
  while splashBudget >= 1 do
    splashBudget = splashBudget - 1
    local angle, radius = math.random() * 6.283, 1.5 + sqrt(math.random()) * 7.5
    local x, z = cx + fx * 3 + cos(angle) * radius, cz + fz * 3 + sin(angle) * radius
    rayOrigin:set(x, cy + 2, z)
    local hit = render.createRay(rayOrigin, rayDown, 10):physics()
    if hit > 0 and not sheltered(x, cy + 2 - hit, z) then
      local i = splashNext
      splashNext = (splashNext + 1) % SPLASHES
      splashX[i], splashY[i], splashZ[i], splashAge[i] = x, cy + 2 - hit, z, 0
    end
  end
  for i = 0, SPLASHES - 1 do
    local age = splashAge[i] + dt
    splashAge[i] = age
    local b = (SPLASH_FIRST + i) * 4
    if age < SPLASH_LIFE then
      local life = age / SPLASH_LIFE
      -- A crown 4 cm wide and up to 6 cm tall; the quad stands on the road, facing the camera.
      local hw, hh = 0.02, 0.03
      place(b, splashX[i], splashY[i] + hh, splashZ[i], sdx * hw, sdy * hw, sdz * hw, 0, hh, 0,
        1000 + floor(life * 9 + 0.5) * 100 + 85)
    else
      drop(b, cx, cy, cz)
    end
  end
end

-- Rewrites the vertex buffer for this frame's camera, wind and time.
local function build()
  if needsReset then
    -- Rain splashes occupy the tail of the shared snow buffer. Clear it even when the next snow density
    -- uses fewer particles, and after off/on, so old crowns cannot remain frozen in another weather mode.
    hide(0, COUNT)
    activeCount, splashBudget, needsReset = 0, 0, false
    for i = 0, SPLASHES - 1 do splashAge[i] = 1e9 end
  end
  local snow = mode == 'snow'
  local camera, look = sim.cameraPosition, sim.cameraLook
  local cx, cy, cz = camera.x, camera.y, camera.z
  local lx, ly, lz = look.x, look.y, look.z
  local upv, sidev = sim.cameraUp, sim.cameraSide
  local count = floor(COUNT * density * (snow and 1 or 0.7))
  if count < activeCount then hide(count, activeCount) end
  activeCount = count
  local shelterStart = os.preciseClock()
  updateShelter(cx, cy, cz)
  shelterMs = (os.preciseClock() - shelterStart) * 1000
  shelteredCount = 0
  local targetHeight = max(1, render.getRenderTargetSize().y)
  local metrePerPixel = 2 * math.tan(sim.cameraFOV * math.pi / 360) / targetHeight
  local wx, wz = wind.x, wind.z
  local vcx, vcy, vcz = cameraVelocity.x, cameraVelocity.y, cameraVelocity.z
  drawn = 0
  if snow then
    buildSnow(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upv.x, upv.y, upv.z, sidev.x, sidev.y, sidev.z)
  else
    buildRain(count, cx, cy, cz, lx, ly, lz, metrePerPixel, wx - vcx, -vcy, wz - vcz)
    updateSplashes(frameDt, cx, cy, cz, lx, lz, sidev.x, sidev.y, sidev.z)
  end
end

function script.frameBegin(dt, gameDT)
  local weatherType = ac.getConditionsSet().currentType
  if weatherType ~= previousWeather then
    previousWeather = weatherType
    local spec = nativeParticles[weatherType]
    density = spec and spec[2] or 1
    setMode(spec and spec[1] or 'off')
    if DEBUG then ac.log(string.format('M2L_WEATHER automatic type=%d mode=%s density=%.2f', weatherType, mode, density)) end
  end
  elapsed, frameDt = elapsed + gameDT, gameDT
  ac.getWindVelocityTo(wind)
  if glass and glass.mesh then
    local car = ac.getCar(0)
    local offset = glass.pass.values.gFlowOffset
    -- Gravity slides beads down at rest; stronger airflow pushes them back up the slanted glass.
    -- Integrate displacement so changing speed or wind does not jump the whole pattern.
    local speed = max(0, car.speedKmh) / 3.6
    offset.y = offset.y + (-0.012 + min(0.05, max(0, speed - 10) * 0.002)) * gameDT
    offset.x = offset.x + (wind.x * car.side.x + wind.y * car.side.y + wind.z * car.side.z) * 0.001 * gameDT
  end
  cameraVelocity:set(sim.cameraPositionDelta):scale(1 / max(dt, 0.001))
  driftX, driftZ = driftX + wind.x * gameDT, driftZ + wind.z * gameDT
  polling, heartbeat, beginCount = polling + dt, heartbeat + dt, beginCount + 1
  if DEBUG then
  local modifier = ui.keyboardButtonDown(0x11) and ui.keyboardButtonDown(0x12)
  local r, s, o = ui.keyboardButtonDown(0x52), ui.keyboardButtonDown(0x53), ui.keyboardButtonDown(0x30)
  local f, w, d = ui.keyboardButtonDown(0x46), ui.keyboardButtonDown(0x57), ui.keyboardButtonDown(0x44)
  if modifier and not held then
    if r then density = 1; setMode('rain') elseif s then density = 1; setMode('snow') elseif o then setMode('off')
    elseif f then setMode('fog') elseif w then setMode('wind') elseif d then setMode('direction') end
  end
  held = modifier and (r or s or o or f or w or d)
  if polling > 0.4 then
    polling = 0
    local nextMode = (io.load(folder .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+')
    if nextMode ~= lastFileMode then
      lastFileMode = nextMode
      setMode(nextMode)
    end
  end
  end
  if mode ~= 'off' and mesh then
    local start = os.preciseClock()
    build()
    local built = os.preciseClock()
    mesh:alterVertices(vertices)
    luaMs, submitMs = (built - start) * 1000, (os.preciseClock() - built) * 1000
  else
    drawn, shelteredCount, luaMs, shelterMs, submitMs = 0, 0, 0, 0, 0
  end
  if DEBUG and heartbeat > 5 then
    -- avg_fps is frames per real second over the whole heartbeat, the number for cost comparisons.
    ac.log(string.format('M2L_WEATHER mode=%s frames=%d drawn=%d sheltered=%d build_ms=%.3f rays_ms=%.3f upload_ms=%.3f avg_fps=%.1f camera=%s',
      mode, frames, drawn, shelteredCount, luaMs, shelterMs, submitMs, beginCount / heartbeat, tostring(sim.cameraPosition)))
    heartbeat, beginCount = 0, 0
    ac.log(string.format('M2L_WIND actualKmh=%.2f vectorMs=%s type=%s', sim.windSpeedKmh, tostring(wind), tostring(ac.getConditionsSet().currentType)))
    ac.log(string.format('M2L_VISIBILITY sky=%s horizon=%s sun=%s color=%s fov=%.2f',
      tostring(sim.skyColor), tostring(sim.horizonColor), tostring(sim.lightColor), tostring(batch.values.gColor), sim.cameraFOV))
  end
end

function script.draw3D()
  if mode == 'off' or not mesh then return end
  local snow = mode == 'snow'
  render.setBlendMode(render.BlendMode.AlphaBlend)
  render.setCullMode(render.CullMode.None)
  render.setDepthMode(render.DepthMode.ReadOnly)
  batch.values.gSnow = snow and 1 or 0
  batch.values.gTime = elapsed
  local sky, horizon = sim.skyColor, sim.horizonColor
  local color = batch.values.gColor
  if snow then
    -- Scene-linear radiance, not displayed RGB: normalise the overcast level before tinting pale flakes.
    local illumination = (sky.r + sky.g + sky.b + horizon.r + horizon.g + horizon.b) / 6
    local brightness = min(1, max(0.04, sqrt(max(0, illumination)) * 2.5))
    color.r, color.g, color.b = 0.82 * brightness, 0.86 * brightness, 0.9 * brightness
  else
    -- A drop refracts the sky around it: a little brighter than the horizon, never a white bar. The floor keeps
    -- dusk rain visible; v2 vanished with raw radiance.
    local lift = 1.8
    color.r, color.g, color.b = max(0.06, horizon.r * lift), max(0.065, horizon.g * lift), max(0.07, horizon.b * lift)
  end
  -- The veil first, the particles over it: the particle volume ends where the veil begins to build up.
  -- Extinction per metre: heavy rain leaves about 1 km of visibility, heavy snow about 500 m
  -- (contrast down to 5 percent), so k = 3/1000 and 6/1000 at full density.
  veil.values.gDensity = density * (snow and 0.006 or 0.003)
  render.fullscreenPass(veil)
  render.mesh(batch)
  if glass and glass.mesh then
    local car = ac.getCar(0)
    local v = glass.pass.values
    v.gTime = elapsed
    -- Melting flakes leave fewer drops than rain.
    v.gAmount = density * (snow and 0.35 or 1)
    v.gColor.r, v.gColor.g, v.gColor.b = max(0.06, horizon.r * 1.6), max(0.065, horizon.g * 1.6), max(0.07, horizon.b * 1.6)
    v.gCameraPos:set(sim.cameraPosition)
    v.gCarPos:set(car.position)
    v.gCarSide:set(car.side)
    v.gCarUp:set(car.up)
    v.gCarLook:set(car.look)
    render.mesh(glass.pass)
  end
  frames = frames + 1
end

-- Windscreen drops: the player's ksWindscreen meshes are drawn once more with a droplet shader. The pattern
-- lives in car-local metres (PosC is camera-relative and world-oriented; the car's basis vectors turn it), so
-- it needs no car-specific UV layout or texture. This overlay does not animate wipers or clear their sweep.
if WINDSCREEN_ENABLED then
glass = {mesh = nil}
do
  local found = ac.findNodes('carRoot:0'):findMeshes('shader:ksWindscreen')
  if #found > 0 then glass.mesh = found end
  ac.log(string.format('M2L_GLASS windscreen meshes=%d', #found))
end
glass.pass = {
  mesh = glass.mesh,
  transform = 'original',
  async = true,
  cacheKey = 8,
  values = {gTime = 0, gAmount = 0, gColor = rgb(0.3, 0.33, 0.37),
    gCameraPos = vec3(), gCarPos = vec3(), gCarSide = vec3(), gCarUp = vec3(), gCarLook = vec3(), gFlowOffset = vec2()},
  shader = [[
    float hash2(float2 p) { return frac(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
    float4 main(PS_IN pin) {
      float3 d = pin.PosC + gCameraPos - gCarPos;
      // Unroll the slanted glass: height plus a share of the forward distance.
      float2 p = float2(dot(d, gCarSide), dot(d, gCarUp) + dot(d, gCarLook) * 0.35);
      float amount = saturate(gAmount);

      // Sparse beads about 1-2.6 mm across: the glass is close to the driver's eyes, so larger beads dominate.
      float x = p.x - gFlowOffset.x;
      float col = floor(x / 0.016);
      float rate = 0.55 + 1.2 * hash2(float2(col, 11.7));
      float2 ua = float2(x, p.y - gFlowOffset.y * rate) / 0.016;
      float2 ca = floor(ua), fa = frac(ua) - 0.5;
      float ha = hash2(ca), hb = hash2(ca + 7.3), hc = hash2(ca + 19.1);
      float2 oa = (float2(ha, hb) - 0.5) * 0.5;
      float ra = 0.035 + 0.045 * hc;
      float lifeA = frac(gTime * 0.04 + ha * 3.7);
      float presentA = step(hb, amount * 0.2) * smoothstep(0, 0.08, lifeA) * (1 - smoothstep(0.9, 1, lifeA));
      float da = length((fa - oa) * float2(1, 0.9)) / ra;
      float bead = (1 - smoothstep(0.7, 1, da)) * presentA;
      float shine = (1 - smoothstep(0, 0.65, length(fa - oa - float2(-0.3, 0.35) * ra) / ra)) * presentA;
      float rim = smoothstep(0.35, 0.65, da) * (1 - smoothstep(0.8, 1.05, da)) * presentA;

      // Small highlights on nearly transparent beads. Long, pale run cards looked like white paint on the glass.
      float alpha = saturate(bead * 0.18 + rim * 0.3 + shine * 0.55);
      float3 color = gColor * (0.04 + 2 * shine);
      return float4(color, alpha);
    }
  ]]
}
end

-- Beyond the particle volume rain and snow still take contrast out of the scene. A depth-aware fullscreen pass
-- adds fog-coloured extinction growing from 12 m; the sky keeps its native haze. The pass is hardware-clipped
-- nearer than 8 m, so the cockpit costs nothing.
veil = {
  async = true,
  blendMode = render.BlendMode.AlphaBlend,
  depthMode = render.DepthMode.ReadOnly,
  depth = 8,
  cacheKey = 1,
  values = {gDensity = 0, gStart = 12},
  shader = [[
    float4 main(PS_IN pin) {
      float depthValue = pin.GetDepth();
      float4 posW = mul(float4(pin.Tex, depthValue, 1), gTexToCamera);
      posW.xyz /= posW.w;
      float dist = length(posW.xyz);
      pin.PosC = normalize(posW.xyz) * 1e3;
      float t = 1 - exp(-gDensity * max(0, dist - gStart));
      clip(depthValue >= 1 ? -1 : t - 0.002);
      return float4(pin.GetFogColor(), t);
    }
  ]]
}

if DEBUG then ac.log('M2L_WEATHER batched rain/snow, shelter, veil and splashes; windscreen=' .. tostring(WINDSCREEN_ENABLED)) end
