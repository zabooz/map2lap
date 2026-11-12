-- Map2Lap precipitation on public CSP 0.2.11: own rain and snow, independent of RainFX.
-- One batched mesh. All particles live in one vertex buffer that Lua rewrites each frame
-- and one render.mesh call draws, instead of one render.shaderedQuad call per particle.
-- Experimental windscreen overlay enabled for this development preview.
local WINDSCREEN_ENABLED = true
local DEBUG = ac.INIConfig.trackConfig():get('MAP2LAP_WEATHER', 'DEBUG', false)
local glass, veil
local glassMs, glassOff, glassRaw = 0, false, false
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
  -- Glass diagnostics from the preview helper: normal drawing, the raw field (film red, snow green, drops blue), off.
  if nextMode == 'glass' then glassRaw, glassOff = false, false
  elseif nextMode == 'glassraw' then glassRaw, glassOff = true, false
  elseif nextMode == 'glassoff' then glassRaw, glassOff = false, true end
  if nextMode:sub(1, 5) == 'glass' then ac.log('M2L_GLASS drawing ' .. nextMode); return end
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
  if glass and not glass.ready and glass.setup then glass.ready = glass.setup() end
  if glass and glass.mesh then
    local start = os.preciseClock()
    glass.update(gameDT)
    glassMs = (os.preciseClock() - start) * 1000
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
    if glass and glass.mesh then
      ac.log('M2L_GLASS ' .. glass.status() .. string.format(' cpu_ms=%.3f drawing=%s', glassMs, tostring(not glassOff)))
    end
    heartbeat, beginCount = 0, 0
    ac.log(string.format('M2L_WIND actualKmh=%.2f vectorMs=%s type=%s', sim.windSpeedKmh, tostring(wind), tostring(ac.getConditionsSet().currentType)))
    ac.log(string.format('M2L_VISIBILITY sky=%s horizon=%s sun=%s color=%s fov=%.2f',
      tostring(sim.skyColor), tostring(sim.horizonColor), tostring(sim.lightColor), tostring(batch.values.gColor), sim.cameraFOV))
  end
end

local function drawWeather()
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
  frames = frames + 1
end

function script.draw3D()
  drawWeather()
  if glass and glass.mesh and not glassOff then glass.draw() end
end

-- Windscreen water and snow. The glass is unrolled into a 2D frame in car-local metres: X across the car, S up the
-- slanted glass from its bottom edge. Rain is a bounded list of droplets with identity on the CPU (position, radius,
-- velocity; merging through spatial bins), splatted each frame into a persistent GPU field together with their
-- trails. The field (one half-float RGBA canvas, ping-ponged) also holds the thin water film, snow deposits and slush,
-- and applies the wiper blades: the area swept between the previous and the current blade line is cleared, a ridge of
-- water and snow rides ahead of the moving blade, and what the blade carried is released where it stops or reverses.
-- The windscreen mesh is then drawn once more with a shader that shades the field's height as water or snow.
-- Nothing here needs RainFX, a custom texture layout or car-specific geometry: the glass frame and blade endpoints
-- come from the car's own meshes and node transforms.
if WINDSCREEN_ENABLED then
glass = {mesh = nil, blades = {}}
local FIELD_W, FIELD_H, DROPS = 1536, 768, 128
local function cbrt(v) return v ^ (1 / 3) end
local emptyRef = ac.emptySceneReference()

-- Car-local AABB of one mesh: its mesh-local box through the owning node's world transform and the car's inverse.
local function localBox(meshRef, w2l)
  local lo, hi = meshRef:getLocalAABB()
  local pw = meshRef:getParent():getWorldTransformationRaw()
  local mnx, mny, mnz, mxx, mxy, mxz = 1e9, 1e9, 1e9, -1e9, -1e9, -1e9
  for i = 0, 7 do
    local c = vec3(i % 2 == 0 and lo.x or hi.x, floor(i / 2) % 2 == 0 and lo.y or hi.y, i < 4 and lo.z or hi.z)
    local l = w2l:transformPoint(pw:transformPoint(c))
    mnx, mny, mnz = min(mnx, l.x), min(mny, l.y), min(mnz, l.z)
    mxx, mxy, mxz = max(mxx, l.x), max(mxy, l.y), max(mxz, l.z)
  end
  return vec3(mnx, mny, mnz), vec3(mxx, mxy, mxz)
end

-- Discovery runs from the first frame whose car transform is finite: at script load the car is not placed yet.
function glass.setup()
  local car = ac.getCar(0)
  local w2l = car.worldToLocal
  local probe = w2l:transformPoint(car.position)
  if probe.x ~= probe.x or probe.y ~= probe.y then return false end
  local eyes = car.driverEyesPosition
  local root = ac.findNodes('carRoot:0')
  local found = root:findMeshes('shader:ksWindscreen')
  local chosen, lo, hi, width = nil, nil, nil, 0
  for i = 1, #found do
    local m = found:at(i)
    local mn, mx = localBox(m, w2l)
    local cx, cz, w = (mn.x + mx.x) / 2, (mn.z + mx.z) / 2, mx.x - mn.x
    -- The windscreen: a ksWindscreen mesh ahead of the driver's eyes and centred on the car. Side and rear
    -- windows share the shader; of several front layers (inner/outer glass) the widest one is drawn.
    local front = cz > eyes.z + 0.1 and math.abs(cx) < 0.3 and w > 0.6
    if front and w > width then chosen, lo, hi, width = m, mn, mx, w end
    if front or (glass.tries or 0) % 100 == 0 then ac.log(string.format('M2L_GLASS mesh %s box=%s..%s front=%s', found:name(i), tostring(mn), tostring(mx), tostring(front))) end
  end
  if chosen then
    glass.mesh = chosen
    glass.root = root
    -- Unrolled frame: S runs up the glass from the bottom front edge (lo.y, hi.z) to the top rear edge (hi.y, lo.z).
    local dy, dz = hi.y - lo.y, hi.z - lo.z
    local len = sqrt(dy * dy + dz * dz)
    glass.ty, glass.tz = dy / len, -dz / len
    glass.sc = lo.y * glass.ty + hi.z * glass.tz
    local margin = 0.02
    glass.x0, glass.xw = lo.x - margin, hi.x - lo.x + 2 * margin
    glass.s0, glass.sw = -margin, len + 2 * margin
    ac.log(string.format('M2L_GLASS frame x0=%.3f xw=%.3f s0=%.3f sw=%.3f tangent=(%.3f, %.3f) side=%s',
      glass.x0, glass.xw, glass.s0, glass.sw, glass.ty, glass.tz, tostring(w2l:transformPoint(car.position + car.side))))
    -- A wiper chain starts at a node named after the wiper whose parent is not. Its blade is the chain's mesh
    -- farthest from the chain's pivot (arm meshes sit between); the blade's longest local axis gives its endpoints.
    -- Lower LODs park their copies away from the car: only chains whose blade lies on this glass count.
    local nodes = root:findNodes('?')
    local function onGlass(p)
      return p.x > lo.x - 0.25 and p.x < hi.x + 0.25 and p.y > lo.y - 0.25 and p.y < hi.y + 0.25 and p.z > lo.z - 0.3 and p.z < hi.z + 0.3
    end
    for i = 1, #nodes do
      local name = nodes:name(i):lower()
      if name:find('wiper') then
        local node = nodes:at(i)
        local parentName = node:getParent():name() or ''
        if not parentName:lower():find('wiper') then
          local pivot = w2l:transformPoint(node:getWorldTransformationRaw().position)
          local meshes = node:findMeshes('?')
          local best, bestDist = nil, -1
          for k = 1, #meshes do
            local m = meshes:at(k)
            local a, b = m:getLocalAABB()
            local centre = w2l:transformPoint(m:getParent():getWorldTransformationRaw():transformPoint((a + b) * 0.5))
            local dist = centre:distance(pivot)
            if dist > bestDist then best, bestDist = m, dist end
          end
          if best then
            local a, b = best:getLocalAABB()
            local ext, c = b - a, (a + b) * 0.5
            local p0, p1 = c:clone(), c:clone()
            if ext.x >= ext.y and ext.x >= ext.z then p0.x, p1.x = a.x, b.x
            elseif ext.y >= ext.z then p0.y, p1.y = a.y, b.y else p0.z, p1.z = a.z, b.z end
            local m = best:getParent():getWorldTransformationRaw()
            local e0, e1 = w2l:transformPoint(m:transformPoint(p0)), w2l:transformPoint(m:transformPoint(p1))
            local valid = onGlass(e0) and onGlass(e1)
            if valid then
              glass.blades[#glass.blades + 1] = {node = best:getParent(), a = p0, b = p1, pivot = node, ridge = 0, leaked = 0, idle = 0, active = 0}
            end
            ac.log(string.format('M2L_GLASS blade of %s: mesh %s dist=%.2f ends=%s %s used=%s', nodes:name(i), best:name(), bestDist,
              tostring(e0), tostring(e1), tostring(valid)))
          end
        end
      end
    end
    ac.log(string.format('M2L_GLASS blades=%d wiperModes=%d', #glass.blades, car.wiperModes))
  else
    -- Early frames can still have unplaced car nodes: keep looking for ten seconds before giving up.
    glass.tries = (glass.tries or 0) + 1
    if glass.tries < 600 then return false end
    ac.log('M2L_GLASS no windscreen found among ' .. #found .. ' ksWindscreen meshes')
    return true
  end
  local x0, xw, s0, sw = glass.x0, glass.xw, glass.s0, glass.sw
  glass.fieldA = ui.ExtraCanvas(vec2(FIELD_W, FIELD_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L glass A')
  glass.fieldB = ui.ExtraCanvas(vec2(FIELD_W, FIELD_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L glass B')
  glass.fieldA:clear(rgbm(0, 0, 0, 0))
  glass.fieldB:clear(rgbm(0, 0, 0, 0))
  glass.read, glass.write = glass.fieldA, glass.fieldB

  -- Droplets: bounded slots. Each has its own mobility and adhesion, so no two run alike.
  local dAlive, dX, dS, dR, dVx, dVs, dPx, dPs, dMob, dAdh = {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
  -- Age since landing and the time left of a kick: a bead that lets go runs with a weak contact line for a while.
  local dAge, dKick = {}, {}
  for i = 0, DROPS - 1 do
    dAlive[i], dX[i], dS[i], dR[i], dVx[i], dVs[i], dPx[i], dPs[i], dAge[i], dKick[i] = false, 0, 0, 0, 0, 0, 0, 0, 0, 0
    dMob[i], dAdh[i] = 0.7 + rand() * 0.6, 0.8 + rand() * 0.5
  end
  local freeCursor, spawnBudget, aliveCount = 0, 0, 0
  local function spawnDrop(x, s, r, vx, vs)
    for k = 0, DROPS - 1 do
      local i = (freeCursor + k) % DROPS
      if not dAlive[i] then
        freeCursor = i + 1
        dAlive[i], dX[i], dS[i], dR[i], dVx[i], dVs[i], dPx[i], dPs[i], dAge[i], dKick[i] = true, x, s, r, vx or 0, vs or 0, x, s, 0, 0
        return i
      end
    end
    return nil
  end
  -- Merge bins: 25 mm cells, larger than two of the biggest drops touching; a drop meets only its 3 x 3 neighbourhood.
  local CELL = 0.025
  local NX, NY = floor(xw / CELL) + 2, floor(sw / CELL) + 2
  local head, nxt = {}, {}
  for i = 0, NX * NY - 1 do head[i] = -1 end
  for i = 0, DROPS - 1 do nxt[i] = -1 end

  -- Point in triangle, either winding. Pure.
  local function inTri(px, py, ax, ay, bx, by, cx, cy)
    local s1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
    local s2 = (cx - bx) * (py - by) - (cy - by) * (px - bx)
    local s3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx)
    return (s1 >= 0 and s2 >= 0 and s3 >= 0) or (s1 <= 0 and s2 <= 0 and s3 <= 0)
  end

  -- Physical scaling, tuned for look: weight grows with r^3 and air drag with r^2 v^2, while the contact line pins
  -- a drop with a force growing with r. So gravity wins at r^2 and airflow at r v^2 against a fixed threshold.
  -- KG: a 2.7 mm bead at rest on this glass (5.4 m/s^2 along it) is just about to run. KA: at about 80 km/h a 1.5 mm
  -- bead starts to creep up the glass, at 60 km/h a 3 mm drop hangs. KV: unit excess drive moves a drop at 10 cm/s.
  local KG, KA, KV = 26000, 1.4, 0.1
  local snowOnGlass, wetUntil = 0, 0
  local rainAmount, snowRate = 0, 0

  local function releaseRidge(blade, ax, as, bx, bs, dirx, dirs)
    local v = blade.ridge
    blade.ridge = 0
    if v < 1e-10 then return end
    local n = min(5, max(1, floor(cbrt(v) / 0.0025)))
    local r = min(0.005, max(0.0012, cbrt(v / n)))
    for _ = 1, n do
      local t = 0.1 + rand() * 0.8
      spawnDrop(ax + (bx - ax) * t + dirx * 0.004, as + (bs - as) * t + dirs * 0.004, r, dirx * 0.04, dirs * 0.04)
    end
  end

  local function updateBlades(dt, w2l)
    local anyActive = false
    for _, blade in ipairs(glass.blades) do
      local m = blade.node:getWorldTransformationRaw()
      local A = w2l:transformPoint(m:transformPoint(blade.a))
      local B = w2l:transformPoint(m:transformPoint(blade.b))
      local ax, as = A.x, A.y * glass.ty + A.z * glass.tz - glass.sc
      local bx, bs = B.x, B.y * glass.ty + B.z * glass.tz - glass.sc
      if blade.ax then
        -- Motion counts from the last line that was cleared, so a blade easing slowly through the ends of its
        -- stroke still clears everything once it has crept 0.3 mm. A blade that stays put is parked: nothing is
        -- cleared and the ridge it carried lets go.
        local mx, ms = ((ax + bx) - (blade.lax + blade.lbx)) / 2, ((as + bs) - (blade.las + blade.lbs)) / 2
        local moved = sqrt(mx * mx + ms * ms)
        local stepX, stepS = ((ax + bx) - (blade.ax + blade.bx)) / 2, ((as + bs) - (blade.as + blade.bs)) / 2
        local step = sqrt(stepX * stepX + stepS * stepS)
        if moved > 0.0003 then
          local dirx, dirs = mx / moved, ms / moved
          -- Reversal: the ridge stays where the blade turned, ahead of its previous motion.
          if blade.dx and dirx * blade.dx + dirs * blade.ds < 0 then releaseRidge(blade, blade.lax, blade.las, blade.lbx, blade.lbs, blade.dx, blade.ds) end
          blade.dx, blade.ds, blade.speed, blade.idle, blade.active = dirx, dirs, step / dt, 0, 1
          anyActive = true
          -- Drops in the swept quad join the ridge riding ahead of the blade.
          for i = 0, DROPS - 1 do
            if dAlive[i] then
              local px, ps = dX[i], dS[i]
              if inTri(px, ps, blade.lax, blade.las, blade.lbx, blade.lbs, bx, bs) or inTri(px, ps, blade.lax, blade.las, bx, bs, ax, as) then
                blade.ridge = blade.ridge + dR[i] ^ 3
                dAlive[i] = false
              end
            end
          end
          -- Water escapes at the blade's outer tip while it moves.
          local leak = blade.ridge * 0.5 * dt
          blade.ridge, blade.leaked = blade.ridge - leak, blade.leaked + leak
          if blade.leaked > 0.0016 ^ 3 then
            local P = w2l:transformPoint(blade.pivot:getWorldTransformationRaw().position)
            local pxv, psv = P.x, P.y * glass.ty + P.z * glass.tz - glass.sc
            local da, db = (ax - pxv) ^ 2 + (as - psv) ^ 2, (bx - pxv) ^ 2 + (bs - psv) ^ 2
            local tx, ts = ax, as
            if db > da then tx, ts = bx, bs end
            spawnDrop(tx - dirx * 0.006, ts - dirs * 0.006, cbrt(blade.leaked), 0, 0)
            blade.leaked = 0
          end
          blade.pax, blade.pas, blade.pbx, blade.pbs = blade.lax, blade.las, blade.lbx, blade.lbs
          blade.lax, blade.las, blade.lbx, blade.lbs = ax, as, bx, bs
        else
          blade.active = 0
          if step < 0.0001 then
            blade.idle = blade.idle + dt
            if blade.idle > 0.25 and blade.ridge > 0 and blade.dx then releaseRidge(blade, ax, as, bx, bs, blade.dx, blade.ds) end
          end
        end
      else
        blade.lax, blade.las, blade.lbx, blade.lbs = ax, as, bx, bs
      end
      blade.ax, blade.as, blade.bx, blade.bs = ax, as, bx, bs
    end
    return anyActive
  end

  local function updateDrops(dt, gx, gs, airx, airs, airMag, impinge)
    -- The field holds the beads; this list holds the few big drops that run and leave trails.
    spawnBudget = min(4, spawnBudget + 2.5 * rainAmount * impinge / 6.7 * dt)
    while spawnBudget >= 1 do
      spawnBudget = spawnBudget - 1
      local r = rand()
      -- With every slot taken, the impact lands on a bead already there and grows it instead.
      local r0 = 0.0028 + r * 0.002
      local i = spawnDrop(x0 + rand() * xw, s0 + rand() * sw, r0)
      if i then dKick[i] = 1 + rand() * 2 end
    end
    for i = 0, NX * NY - 1 do head[i] = -1 end
    aliveCount = 0
    for i = 0, DROPS - 1 do
      if dAlive[i] then
        local r = dR[i]
        -- Pinned beads collect further rain; without rain they slowly dry.
        r = r + impinge * rainAmount * 0.000012 * (0.5 + rand()) * dt - 0.00004 * (1 - rainAmount) * dt
        if r < 0.0004 then
          dAlive[i] = false
        else
          local nx = gx * r * r * KG + airx * airMag * r * KA
          local ns = gs * r * r * KG + airs * airMag * r * KA
          local nm = sqrt(nx * nx + ns * ns)
          local moving = dVx[i] ~= 0 or dVs[i] ~= 0
          dAge[i] = dAge[i] + dt
          -- A pinned bead lets go now and then: the chance grows with its age and size, as impacts and vibration
          -- shake it loose. For a kick's duration its contact line holds much less, so gravity moves it.
          if not moving and dKick[i] <= 0 and rand() < dt * (0.03 + dAge[i] * 0.004 + r * 12) then
            dKick[i], dAge[i] = 0.3 + rand() * 0.6, 0
          end
          dKick[i] = dKick[i] - dt
          -- A running drop keeps running on a thinner contact line than it took to depin it.
          local thr = dAdh[i] * (dKick[i] > 0 and 0.2 or moving and 0.6 or 1)
          dPx[i], dPs[i] = dX[i], dS[i]
          if nm > thr then
            local ex = (nm - thr) / nm * KV * dMob[i]
            local vx, vs = nx * ex + (rand() - 0.5) * 0.03, ns * ex
            local v = sqrt(vx * vx + vs * vs)
            if v > 0.45 then vx, vs, v = vx * 0.45 / v, vs * 0.45 / v, 0.45 end
            dVx[i], dVs[i] = vx, vs
            local x, s = dX[i] + vx * dt, dS[i] + vs * dt
            -- The trail it leaves takes a little of its water.
            r = r - v * dt * 0.0005
            if x < x0 or x > x0 + xw or s < s0 or s > s0 + sw then dAlive[i] = false else dX[i], dS[i] = x, s end
          else
            dVx[i], dVs[i] = 0, 0
          end
          dR[i] = r
          if dAlive[i] then
            local cell = floor((dX[i] - x0) / CELL) + floor((dS[i] - s0) / CELL) * NX
            if cell >= 0 and cell < NX * NY then nxt[i], head[cell] = head[cell], i end
            aliveCount = aliveCount + 1
          end
        end
      end
    end
    -- Merging: neighbours whose beads touch become one drop of the same water volume, at the weighted position.
    for i = 0, DROPS - 1 do
      if dAlive[i] then
        local cx, cy = floor((dX[i] - x0) / CELL), floor((dS[i] - s0) / CELL)
        for oy = -1, 1 do
          for ox = -1, 1 do
            local gx2, gy2 = cx + ox, cy + oy
            if gx2 >= 0 and gx2 < NX and gy2 >= 0 and gy2 < NY then
              local j = head[gx2 + gy2 * NX]
              while j >= 0 do
                if j > i and dAlive[j] and dAlive[i] then
                  local ddx, dds = dX[j] - dX[i], dS[j] - dS[i]
                  local ri, rj = dR[i], dR[j]
                  if ddx * ddx + dds * dds < ((ri + rj) * 0.8) ^ 2 then
                    local vi, vj = ri ^ 3, rj ^ 3
                    local v = vi + vj
                    local big, small = i, j
                    if rj > ri then big, small = j, i end
                    dX[big] = (dX[i] * vi + dX[j] * vj) / v
                    dS[big] = (dS[i] * vi + dS[j] * vj) / v
                    dVx[big] = (dVx[i] * vi + dVx[j] * vj) / v
                    dVs[big] = (dVs[i] * vi + dVs[j] * vj) / v - 0.01
                    dR[big] = min(0.007, cbrt(v))
                    dAlive[small] = false
                    aliveCount = aliveCount - 1
                  end
                end
                j = nxt[j]
              end
            end
          end
        end
      end
    end
  end

  -- Shader constants: drops as float4 pairs packed in matrices (4 rows each), blades as one matrix each.
  local DMATS = DROPS / 2
  local values = {gFrame = vec4(x0, s0, 1 / xw, 1 / sw), gParams = vec4(), gAir = vec4(), gMelt = 0, gWet = 0, gBead = 0, gSnowMode = 0, gSeed = vec2(),
    gW0 = mat4x4.identity(), gW1 = mat4x4.identity()}
  local dropMats = {}
  for k = 0, DMATS - 1 do
    local m = mat4x4.identity()
    values['gD' .. k] = m
    dropMats[k] = m
  end
  local rows = {'row1', 'row2', 'row3', 'row4'}
  local function fillDropMats()
    for i = 0, DROPS - 1 do
      local m = dropMats[floor(i / 2)]
      local cur, prev = m[rows[(i % 2) * 2 + 1]], m[rows[(i % 2) * 2 + 2]]
      if dAlive[i] then
        cur:set(dX[i], dS[i], dR[i], 1)
        prev:set(dPx[i], dPs[i], dVx[i], dVs[i])
      else
        cur:set(0, 0, 0, 0)
        prev:set(0, 0, 0, 0)
      end
    end
  end
  local function fillBladeMat(m, blade, snowBand)
    if not blade or not blade.pax or blade.active == 0 then m.row4:set(0, 0, 0, 0); return end
    m.row1:set(blade.pax, blade.pas, blade.pbx, blade.pbs)
    m.row2:set(blade.ax, blade.as, blade.bx, blade.bs)
    local water = blade.ridge > 1e-11 and min(0.012, cbrt(blade.ridge) * 2.5) or 0
    m.row3:set(blade.dx, blade.ds, water, snowBand)
    m.row4:set(blade.speed, 1, 0, 0)
  end

  local dropCalls = {}
  for k = 0, DMATS - 1 do
    dropCalls[#dropCalls + 1] = string.format('  drop(gD%d[0], gD%d[1], p, hd, film);\n  drop(gD%d[2], gD%d[3], p, hd, film);', k, k, k, k)
  end
  glass.sim = {
    async = true,
    cacheKey = 31,
    blendMode = render.BlendMode.Opaque,
    textures = {txPrev = false},
    values = values,
    shader = [[
      float hash12(float2 p) { float3 p3 = frac(float3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return frac((p3.x + p3.y) * p3.z); }
      float cross2(float2 a, float2 b) { return a.x * b.y - a.y * b.x; }
      bool inTri(float2 p, float2 a, float2 b, float2 c) {
        float s1 = cross2(b - a, p - a), s2 = cross2(c - b, p - b), s3 = cross2(a - c, p - c);
        return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
      }
      // One drop: a dome of water, height in millimetres (contact angle about 60 degrees: half the radius high),
      // and the trail it left this frame between its previous and current position.
      void drop(float4 a, float4 b, float2 p, inout float h, inout float film) {
        if (a.w < 0.5) return;
        float2 q = p - a.xy;
        float d2 = dot(q, q), r2 = a.z * a.z;
        if (d2 < r2) h = max(h, a.z * 500 * sqrt(1 - d2 / r2));
        float2 e = a.xy - b.xy;
        float el = dot(e, e);
        if (el > 1e-9) {
          float t = saturate(dot(p - b.xy, e) / el);
          float dd = length(p - (b.xy + e * t));
          film = max(film, smoothstep(a.z * 0.4, a.z * 0.2, dd) * 0.35);
        }
      }
      // One blade: clears what lies between its previous and current line, leaving thin streaks and a few
      // percent of the snow, and keeps a ridge of water and snow just ahead of its current line.
      void blade(float4x4 W, float2 p, inout float film, inout float snow, inout float slush, inout float h) {
        if (W[3].y < 0.5) return;
        float2 A0 = W[0].xy, B0 = W[0].zw, A1 = W[1].xy, B1 = W[1].zw;
        if (inTri(p, A0, B0, B1) || inTri(p, A0, B1, A1)) {
          film = film * 0.1 + 0.03 * step(0.02, film + snow + slush);
          snow = 0;
          slush *= 0.05;
          h = 0;
        }
        float2 e = B1 - A1;
        float t = saturate(dot(p - A1, e) / max(1e-9, dot(e, e)));
        float2 off = p - (A1 + e * t);
        float ahead = dot(off, W[2].xy);
        // The ridge starts just ahead of the line: what lies behind it was swept this frame and stays clear.
        if (t > 0.01 && t < 0.99 && ahead > 0.0004) {
          if (W[2].z > 0 && ahead < W[2].z) h = max(h, 1.3 * (1 - ahead / W[2].z) * (0.7 + 0.3 * hash12(floor(p * 700))));
          if (W[2].w > 0 && ahead < W[2].w) snow = max(snow, 0.8 * (1 - ahead / W[2].w) * (0.6 + 0.4 * hash12(floor(p * 500))));
        }
      }
      float4 main(PS_IN pin) {
        float2 uv = pin.Tex;
        float2 p = float2(gFrame.x + uv.x / gFrame.z, gFrame.y + (1 - uv.y) / gFrame.w);
        float dt = gParams.x;
        float4 prev = txPrev.SampleLevel(samLinearSimple, uv, 0);
        // The film dries; slush drains down the glass as it turns to water.
        // Rain wets the whole glass with a film of tiny beads that bends the view; it dries slowly.
        float film = min(1, max(0, prev.r - gParams.z * dt) + gWet * dt);
        float snow = prev.g;
        float slush = txPrev.SampleLevel(samLinearSimple, uv - float2(0, gParams.y * dt * gFrame.w), 0).b;
        // Snow lands as irregular clumps 4 to 11 mm across, a bounded random number of them each frame.
        float2 cell = floor(p / 0.012);
        float add = 0;
        [unroll] for (int j = -1; j <= 1; j++) [unroll] for (int i = -1; i <= 1; i++) {
          float2 c = cell + float2(i, j);
          float hv = hash12(c + gSeed);
          if (hv < gParams.w) {
            float2 centre = (c + 0.5 + (float2(hash12(c * 1.7 + gSeed.yx), hash12(c * 2.3 + gSeed)) - 0.5) * 0.5) * 0.012;
            float R = 0.002 + 0.0035 * hash12(c * 3.1 + gSeed);
            float2 q = p - centre;
            float ang = atan2(q.y, q.x);
            float rr = R * (0.75 + 0.25 * sin(ang * 3 + hv * 40) + 0.12 * sin(ang * 7 + hv * 90));
            add += smoothstep(rr, rr * 0.45, length(q)) * (0.45 + 0.55 * hash12(c * 4.7 + gSeed));
          }
        }
        snow = min(2, snow + add);
        // Airflow above about 6 m/s along the glass strips snow, thin deposits first; heat melts it into slush.
        float strip = min(snow, max(0, gAir.z - 6) * 0.012 * dt * (snow < 0.5 ? 1 : 0.4));
        snow -= strip;
        float melted = min(snow, gMelt * dt);
        snow -= melted;
        slush = min(1, slush + melted * 0.8 + strip * 0.05);
        float toWater = slush * 0.12 * dt;
        slush -= toWater;
        film = min(1, film + toWater * 0.8);
        // Rain beads persist like snow clumps: round domes 1.5 to 3.5 mm in radius land at a bounded random rate,
        // dry slowly, and the blade clears them. Height in millimetres.
        float h = max(0, prev.a - 0.02 * dt);
        float2 bcell = floor(p / 0.008);
        [unroll] for (int bj = -1; bj <= 1; bj++) [unroll] for (int bi = -1; bi <= 1; bi++) {
          float2 c = bcell + float2(bi, bj);
          float hv = hash12(c * 1.3 + gSeed);
          if (hv < gBead) {
            float2 centre = (c + 0.5 + (float2(hash12(c * 2.1 + gSeed.yx), hash12(c * 2.9 + gSeed)) - 0.5) * 0.6) * 0.008;
            float R = 0.0015 + 0.002 * hash12(c * 3.7 + gSeed) * hash12(c * 4.3 + gSeed);
            float2 q = p - centre;
            float d2 = dot(q, q);
            if (d2 < R * R) h = max(h, R * 500 * sqrt(1 - d2 / (R * R)));
          }
        }
        float hd = 0;
        blade(gW0, p, film, snow, slush, h);
        blade(gW1, p, film, snow, slush, h);
]] .. table.concat(dropCalls, '\n') .. [[

        return float4(film, snow, gSnowMode > 0.5 ? slush : hd, h);
      }
    ]]
  }

  glass.pass = {
    mesh = glass.mesh,
    transform = 'original',
    async = true,
    cacheKey = 32,
    textures = {txField = false},
    values = {gFrame = vec4(x0, s0, 1 / xw, 1 / sw), gTangent = vec4(glass.sc, glass.ty, glass.tz, glass.sw), gScreen = vec2(1, 1), gRefract = 1, gTime = 0, gWhite = 1, gSnowMode = 0,
      gTexel = vec4(1 / FIELD_W, 1 / FIELD_H, xw / FIELD_W * 1000, sw / FIELD_H * 1000),
      gColor = rgb(0.3, 0.33, 0.37), gSnowColor = rgb(0.8, 0.82, 0.86), gRaw = 0,
      gCameraPos = vec3(), gCarPos = vec3(), gCarSide = vec3(), gCarUp = vec3(), gCarLook = vec3()},
    shader = [[
      float hash12(float2 p) { float3 p3 = frac(float3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return frac((p3.x + p3.y) * p3.z); }
      float height(float4 f) { return f.a + f.r * 0.08 + f.b + f.g * 2.2; }
      float4 main(PS_IN pin) {
        float3 d = pin.PosC + gCameraPos - gCarPos;
        float x = dot(d, gCarSide);
        float s = dot(d, gCarUp) * gTangent.y + dot(d, gCarLook) * gTangent.z - gTangent.x;
        float2 uv = float2((x - gFrame.x) * gFrame.z, 1 - (s - gFrame.y) * gFrame.w);
        float4 f = txField.Sample(samLinearSimple, uv);
        if (gRaw > 0.5) return float4(f.r, f.g, f.a * 0.5, 0.9);
        float hx = height(txField.Sample(samLinearSimple, uv + float2(gTexel.x, 0))) - height(txField.Sample(samLinearSimple, uv - float2(gTexel.x, 0)));
        float hy = height(txField.Sample(samLinearSimple, uv + float2(0, gTexel.y))) - height(txField.Sample(samLinearSimple, uv - float2(0, gTexel.y)));
        // Surface normal of the water or snow in the glass frame (X across, Y up the glass, Z out of the glass).
        float3 n = normalize(float3(-hx / (2 * gTexel.z), hy / (2 * gTexel.w), 1));
        float3 Tw = gCarUp * gTangent.y + gCarLook * gTangent.z;
        float3 Nw = gCarLook * gTangent.y - gCarUp * gTangent.z;
        float3 nW = normalize(gCarSide * n.x + Tw * n.y + Nw * n.z);
        float3 V = normalize(pin.PosC);
        float3 R = reflect(V, nW);
        // Water, without a scene sample (CSP's dynamic scene textures are not dependable in this pass): a bead
        // dims the view through its body, goes darker on its steep rim, and reflects the sky on its crest as a
        // faint crescent. The wet film greys and dims the view where the blades have not been.
        float body = saturate((f.a + (gSnowMode > 0.5 ? 0 : f.b)) * 2.5);
        // The film edge is softened over about 4 mm, so the swept fan does not end in a hard line.
        float2 e3 = gTexel.xy * 3;
        float filmSum = f.r + txField.Sample(samLinearSimple, uv + float2(e3.x, e3.y * 0.5)).r + txField.Sample(samLinearSimple, uv - float2(e3.x, e3.y * 0.5)).r
          + txField.Sample(samLinearSimple, uv + float2(-e3.x * 0.5, e3.y)).r + txField.Sample(samLinearSimple, uv + float2(e3.x * 0.5, -e3.y)).r;
        float film = saturate(filmSum * 0.2 * 1.5);
        float steep = saturate(length(n.xy) * 3);
        float spec = pow(saturate(R.y), 5) * saturate(steep * 1.5 + 0.2);
        float3 bodyColor = gColor * 0.55;
        float3 rimColor = gColor * 0.12;
        float3 specColor = gColor * 1.7;
        // Wet sheen: a carpet of tiny beads, each with a faint crest highlight, over a slight dimming.
        float2 cell = floor(float2(x, s) * 300);
        float2 inCell = frac(float2(x, s) * 300) - 0.5 - (float2(hash12(cell), hash12(cell + 7.1)) - 0.5) * 0.5;
        float speck = (1 - smoothstep(0.08, 0.22, length(inCell))) * step(0.35, hash12(cell + 3.3));
        float3 filmColor = gColor * (0.2 + 1.0 * speck * saturate(R.y + 0.3));
        float bodyA = body * 0.42;
        float rimA = steep * body * 0.32;
        float specA = spec * body * 0.6;
        float filmA = film * (0.03 + 0.18 * speck);
        float wAlpha = saturate(bodyA + rimA + specA + filmA);
        float3 wColor = (bodyColor * bodyA + rimColor * rimA + specColor * specA + filmColor * filmA) / max(wAlpha, 1e-4);
        // Snow: matte white with cheap height shading from above; slush grey and translucent.
        float snowA = saturate(f.g * 2.2);
        float slushA = gSnowMode > 0.5 ? saturate(f.b * 1.2) * 0.55 : 0;
        float lit = 0.55 + 0.45 * saturate(nW.y * 0.6 + 0.6) + 0.15 * saturate(n.y * 2);
        float3 sColor = gSnowColor * lit;
        float3 slColor = gSnowColor * 0.55 * lit;
        float3 color = wColor * wAlpha;
        float alpha = wAlpha;
        color = color * (1 - slushA) + slColor * slushA; alpha = alpha * (1 - slushA) + slushA;
        color = color * (1 - snowA) + sColor * snowA; alpha = alpha * (1 - snowA) + snowA;
        return float4(alpha > 0.001 ? color / alpha : float3(0, 0, 0), alpha);
      }
    ]]
  }

  local airVec = vec3()
  -- Called from frameBegin: airflow, drops, shader constants, field step.
  function glass.update(dt)
    dt = min(dt, 0.1)
    local car = ac.getCar(0)
    -- The car's root node, not the physics state: blade nodes and the glass mesh hang under it, so their
    -- positions stay consistent to the millimetre at speed (the physics transform lags the scene by a step).
    local rootM = glass.rootM or car.bodyTransform
    local side, up, look = rootM.row1, rootM.row2, rootM.row3
    rainAmount = mode == 'rain' and density or 0
    snowRate = mode == 'snow' and density or 0
    -- Air relative to the car, in car-local axes: wind minus the car's own motion. Driving makes airflow on its own.
    local vel = car.velocity
    airVec:set(wind):sub(vel)
    local ax = airVec.x * side.x + airVec.y * side.y + airVec.z * side.z
    local ay = airVec.x * up.x + airVec.y * up.y + airVec.z * up.z
    local az = airVec.x * look.x + airVec.y * look.y + airVec.z * look.z
    local ty, tz = glass.ty, glass.tz
    -- Glass frame: tangent T = (0, ty, tz) up the glass, outward normal N = (0, -tz, ty).
    local tanX, tanS = ax, ay * ty + az * tz
    local airMag = sqrt(tanX * tanX + tanS * tanS)
    -- Precipitation hits the glass with the air plus its fall: rain about 8 m/s, flakes about 1.2 m/s.
    local fall = mode == 'snow' and 1.2 or 8
    local impinge = max(0, -((ay - fall) * -tz + az * ty))
    -- Gravity along the glass, from the world's down axis in car-local terms.
    local gx = -9.81 * side.y
    local gs = -9.81 * (up.y * ty + look.y * tz)
    local anyActive = glass.anyActive or false
    updateDrops(dt, gx, gs, tanX, tanS, airMag, impinge)
    -- Heat: AC has no defroster control. The approximation uses engine coolant temperature as the heater supply
    -- (a warm engine warms the cabin air blown at the glass) plus ambient air above freezing.
    local heat = min(1, max(0, (car.waterTemperature - 50) / 40))
    local ambient = sim.ambientTemperature or 0
    local melt = 0.004 + 0.05 * heat + max(0, ambient) * 0.004
    -- Snow on the glass, a coarse estimate for the ridge ahead of a blade: deposits raise it, sweeps and melt lower it.
    local clumpsPerSecond = 25 * snowRate * min(impinge, 12) / 3
    snowOnGlass = max(0, min(1, snowOnGlass + clumpsPerSecond * dt * 0.01 - melt * dt - (anyActive and snowOnGlass * dt * 1.5 or 0)))
    if rainAmount > 0 or snowRate > 0 or anyActive then wetUntil = elapsed + 150 end
    glass.quiet = elapsed > wetUntil and aliveCount == 0
    local v = values
    v.gParams:set(dt, 0.02, 0.02, clumpsPerSecond * dt / ((xw / 0.012) * (sw / 0.012)))
    v.gAir:set(tanX, tanS, airMag, impinge)
    v.gMelt = melt
    v.gSnowMode = snowRate > 0 and 1 or 0
    -- Beads land at about 45 a second over the glass standing in heavy rain; 8 mm cells, 3 x 3 looked up.
    v.gBead = 45 * rainAmount * impinge / 6.7 * dt / ((xw / 0.008) * (sw / 0.008))
    -- Standing in heavy rain the glass is fully wet in about 35 s, about twice as fast when driving into it
    -- (capped: a faster build-up turns the fan's edge into a hard line between sweeps).
    v.gWet = rainAmount * min(impinge, 13) / 6.7 * 0.03
    v.gSeed:set((frames % 977) * 0.173 + 0.31, (frames % 1013) * 0.291 + 0.17)
    fillBladeMat(v.gW0, glass.blades[1], snowOnGlass * 0.014)
    fillBladeMat(v.gW1, glass.blades[2], snowOnGlass * 0.014)
    fillDropMats()
    glass.melt, glass.air, glass.impinge = melt, airMag, impinge
    -- One field step into the other canvas, before the frame's rendering starts (like CSP's own canvas updates).
    if not glass.quiet and not glassOff then
      glass.sim.textures.txPrev = glass.read
      glass.write:updateWithShader(glass.sim)
      glass.read, glass.write = glass.write, glass.read
    end
  end

  -- Called from draw3D: the glass mesh drawn once more with the field.
  function glass.draw()
    if glass.quiet then return end
    local car = ac.getCar(0)
    -- Blade lines and the glass mapping come from the scene transforms as they are drawn this frame; the field
    -- step at the next frame start uses these lines. Reading them at frame start was a frame behind the mesh.
    local rootM = glass.root:getWorldTransformationRaw()
    glass.rootM = rootM
    glass.anyActive = updateBlades(max(frameDt, 1e-4), rootM:inverse())
    local v = glass.pass.values
    v.gRaw = glassRaw and 1 or 0
    v.gTime = elapsed
    v.gSnowMode = snowRate > 0 and 1 or 0
    local size = render.getRenderTargetSize()
    v.gScreen:set(max(1, size.x), max(1, size.y))
    local horizon = sim.horizonColor
    v.gColor.r, v.gColor.g, v.gColor.b = max(0.06, horizon.r * 1.6), max(0.065, horizon.g * 1.6), max(0.07, horizon.b * 1.6)
    local sky = sim.skyColor
    local illumination = (sky.r + sky.g + sky.b + horizon.r + horizon.g + horizon.b) / 6
    local brightness = min(1, max(0.04, sqrt(max(0, illumination)) * 2.5))
    v.gSnowColor.r, v.gSnowColor.g, v.gSnowColor.b = 0.82 * brightness, 0.86 * brightness, 0.9 * brightness
    v.gCameraPos:set(sim.cameraPosition)
    local m = glass.rootM or car.bodyTransform
    v.gCarPos:set(m.row4.x, m.row4.y, m.row4.z)
    v.gCarSide:set(m.row1.x, m.row1.y, m.row1.z)
    v.gCarUp:set(m.row2.x, m.row2.y, m.row2.z)
    v.gCarLook:set(m.row3.x, m.row3.y, m.row3.z)
    glass.pass.textures.txField = glass.read
    render.setBlendMode(render.BlendMode.AlphaBlend)
    render.setCullMode(render.CullMode.None)
    render.setDepthMode(render.DepthMode.ReadOnly)
    render.mesh(glass.pass)
  end

  function glass.status()
    local b = glass.blades[1]
    return string.format('drops=%d snowEst=%.2f melt=%.3f air=%.1f impinge=%.1f quiet=%s blade=%s ridge=%.2e progress=%.2f',
      aliveCount, snowOnGlass, glass.melt or 0, glass.air or 0, glass.impinge or 0, tostring(glass.quiet),
      b and b.ax and string.format('(%.2f,%.2f)-(%.2f,%.2f) active=%d', b.ax, b.as, b.bx, b.bs, b.active) or 'none',
      b and b.ridge or 0, ac.getCar(0).wiperProgress) .. string.format(' whiteRef=%s exposure=%s mult=%s', tostring(sim.whiteReferencePoint), tostring(sim.cameraExposure), tostring(sim.exposureMultiplier))
  end
  return true
end
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
