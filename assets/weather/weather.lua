-- Map2Lap precipitation on public CSP 0.2.11: own rain and snow, independent of RainFX.
-- One batched mesh. All particles live in one vertex buffer that Lua rewrites each frame
-- and one render.mesh call draws, instead of one render.shaderedQuad call per particle.
-- Experimental windscreen overlay enabled for this development preview.
local WINDSCREEN_ENABLED = true
local DEBUG = ac.INIConfig.trackConfig():get('MAP2LAP_WEATHER', 'DEBUG', false)
local glass, veil, mirrorWeather, rustSnow
local glassMs, glassOff, glassRaw, glassRed = 0, false, false, false
local sqrt, min, max, floor, sin, cos = math.sqrt, math.min, math.max, math.floor, math.sin, math.cos
local folder = ac.getFolder(ac.FolderID.CurrentTrack) .. '/extension/'
local sim = ac.getSim()
local elapsed, polling, heartbeat = 0, 0, 0
local mode = 'off'
local needsReset = true
local density = 1
local previousWeather = nil
local lastFileMode = DEBUG and (io.load(folder .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+') or nil
glassRed = lastFileMode == 'glassred'
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
-- Reserve bounded storage for heavy snow; rain and snow tiers choose their own active counts below.
local BASE_COUNT, COUNT = 8192, 14057
local function snowScale()
  if density > 0.65 then return 1.584, 1.716 end
  local scale = density > 0.3 and 1.15 or 1
  return scale, scale
end
local function rainScale()
  return density > 0.65 and 1.5 or density > 0.35 and 1.2 or 1
end
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
  if nextMode == 'glasscapture' then
    if DEBUG and glass then glass.captureRequested = true end
    return
  end
  if nextMode == 'auto' then previousWeather = nil; return end
  if nextMode == 'rainrust' or nextMode == 'rainlua' then
    if DEBUG then ac.log('M2L_RAIN_ENGINE librain only; legacy selection ignored') end
    if DEBUG then ac.log('M2L_RAIN_ENGINE selected=' .. nextMode) end
    return
  end
  if nextMode == 'snowrust' or nextMode == 'snowlua' then
    if rustSnow then
      rustSnow.enabled, rustSnow.hasResult = nextMode == 'snowrust', false
      if DEBUG then ac.log('M2L_SNOW_ENGINE selected=' .. nextMode) end
    end
    return
  end
  -- Track scripts are isolated from global weather control; CSP's own controls set the conditions.
  if nextMode == 'fog' or nextMode == 'wind' or nextMode == 'direction' then
    ac.setAppOpen('CspDebug'); notify(); return
  end
  -- Glass diagnostics from the preview helper: normal drawing, the raw field (film red, snow green, drops blue), off.
  if nextMode == 'glassred' then glassRaw, glassOff, glassRed = false, false, true
  elseif nextMode == 'glass' then glassRaw, glassOff, glassRed = false, false, false
  elseif nextMode == 'glassraw' then glassRaw, glassOff, glassRed = true, false, false
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
local function buildRain(count, cx, cy, cz, lx, ly, lz, metrePerPixel, vx, vy0, vz, scale)
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
      local hh = min(0.6, max(0.05, relative * 0.016)) * 0.5 * scale
      local width = (0.0025 + w * 0.003) * size[i] * scale
      local shown = max(width, pixelMetres * 1.3 * scale)
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

local function buildSnow(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upx, upy, upz, sdx, sdy, sdz, scale)
  if rustSnow and rustSnow.build(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upx, upy, upz, sdx, sdy, sdz, scale) then return end
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
      local width = (0.006 + w * w * 0.025) * size[i] * scale
      local shown = min(pixelMetres * 14 * scale, max(width, pixelMetres * 2.5 * scale))
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

-- Optional external snow-geometry worker. All rendering, shelter rays and glass effects stay in CSP.
-- One request at a time keeps its output stable while Lua consumes it; no blocking wait on the render thread.
-- The previous Lua loop is the immediate fallback for a missing/stopped worker or a result older than 50 ms.
rustSnow = {enabled = ac.INIConfig.trackConfig():get('MAP2LAP_WEATHER', 'RUST_SNOW', true) and (not DEBUG or lastFileMode ~= 'snowlua'),
  hasResult = false, used = 0, fresh = 0, fallback = 0, workerUs = 0}
local function connectSnowWorker()
  local ok, mapping = pcall(ac.writeMemoryMappedFile, 'AcTools.CSP.Limited.Map2Lap.SnowGeometry.v1', [[
    uint32_t magic; uint32_t protocol; uint32_t ac_pid; uint32_t request; uint32_t response; uint32_t shutdown;
    uint32_t count; uint32_t drawn; uint32_t sheltered; uint32_t pad; double worker_us;
    double params[20]; int32_t roof_ix[49]; int32_t roof_iz[49]; double roof_y[49];
    double seeds[16383][7]; float vertices[16383][16];
  ]])
  if not ok then
    if DEBUG then ac.log('M2L_SNOW_ENGINE connect failed: ' .. tostring(mapping)) end
    return nil
  end
  return mapping
end
function rustSnow.build(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upx, upy, upz, sdx, sdy, sdz, scale)
  local r = rustSnow
  if not r.enabled then return false end
  if not r.mapping then r.mapping = connectSnowWorker() end
  local m = r.mapping
  if not m or m.magic ~= 0x4d32534e or m.protocol ~= 1 or m.shutdown ~= 0 or COUNT > 16383 then
    r.hasResult, r.seeded, r.pending = false, false, false
    r.fallback = r.fallback + 1
    return false
  end
  if r.seq and m.request < r.seq then r.seeded, r.pending, r.hasResult = false, false, false end
  if not r.seeded then
    if m.response ~= m.request then r.fallback = r.fallback + 1; return false end
    for i = 0, COUNT - 1 do
      local s = m.seeds[i]
      s[0], s[1], s[2], s[3], s[4], s[5], s[6] = px[i], py[i], pz[i], weight[i], size[i], phase[i], aspect[i]
    end
    r.seq, r.pending, r.seeded = m.request, false, true
    if DEBUG then ac.log('M2L_SNOW_ENGINE connected bytes=' .. ffi.sizeof(m[0]) .. ' seeds=' .. COUNT) end
  end
  local now = os.preciseClock()
  if r.pending and m.response == r.seq then
    r.pending = false
    if m.count == count and now - r.posted < 0.05 then
      for i = 0, count - 1 do
        local o, b = m.vertices[i], i * 4
        for c = 0, 3 do
          local v, k = raw[b + c], c * 4
          v.pos.x, v.pos.y, v.pos.z, v.uv.y = o[k], o[k + 1], o[k + 2], o[k + 3]
        end
      end
      r.drawn, r.sheltered, r.workerUs, r.resultTime = m.drawn, m.sheltered, m.worker_us, now
      r.hasResult, r.fresh = true, r.fresh + 1
    else
      r.hasResult = false
    end
  end
  if r.hasResult and now - r.resultTime > 0.05 then r.hasResult = false end
  if not r.pending then
    local p = m.params
    p[0], p[1], p[2], p[3], p[4], p[5] = elapsed, driftX, driftZ, cx, cy, cz
    p[6], p[7], p[8], p[9] = lx, ly, lz, metrePerPixel
    p[10], p[11], p[12], p[13], p[14], p[15], p[16] = upx, upy, upz, sdx, sdy, sdz, scale
    for i = 0, 48 do
      m.roof_ix[i], m.roof_iz[i], m.roof_y[i] = roofIx[i] or -2147483648, roofIz[i] or -2147483648, roofY[i]
    end
    m.count = count
    r.seq = r.seq + 1
    r.posted, r.pending = now, true
    m.request = r.seq
  end
  if r.hasResult then
    drawn, shelteredCount = r.drawn, r.sheltered
    r.used = r.used + 1
    return true
  end
  r.fallback = r.fallback + 1
  return false
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
  local scale, amount = 1, 1
  if snow then scale, amount = snowScale() else scale = rainScale(); amount = scale end
  local count = floor(BASE_COUNT * density * (snow and amount or 0.7 * amount))
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
    buildSnow(count, cx, cy, cz, lx, ly, lz, metrePerPixel, upv.x, upv.y, upv.z, sidev.x, sidev.y, sidev.z, scale)
  else
    buildRain(count, cx, cy, cz, lx, ly, lz, metrePerPixel, wx - vcx, -vcy, wz - vcz, scale)
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
  if mirrorWeather then mirrorWeather.update() end
  if DEBUG and heartbeat > 5 then
    -- avg_fps is frames per real second over the whole heartbeat, the number for cost comparisons.
    ac.log(string.format('M2L_WEATHER mode=%s frames=%d drawn=%d sheltered=%d build_ms=%.3f rays_ms=%.3f upload_ms=%.3f avg_fps=%.1f camera=%s',
      mode, frames, drawn, shelteredCount, luaMs, shelterMs, submitMs, beginCount / heartbeat, tostring(sim.cameraPosition)))
    if glass and glass.mesh then
      ac.log('M2L_GLASS ' .. glass.status() .. string.format(' cpu_ms=%.3f drawing=%s', glassMs, tostring(not glassOff)))
    end
    if rustSnow and mode == 'snow' then
      ac.log(string.format('M2L_SNOW_ENGINE rust=%s used=%d fresh=%d fallback=%d worker_ms=%.3f',
        tostring(rustSnow.enabled), rustSnow.used, rustSnow.fresh, rustSnow.fallback, rustSnow.workerUs / 1000))
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

-- Mirrors have their own render pass; draw3D and the front-culled main particle buffer cannot supply it.
-- Reuse the precipitation shader, seeds, wind and clock with at most 5,272 quads, updated once per frame for all
-- mirrors. No extra collision rays, distance veil, glass redraw or reflection-cubemap rendering.
mirrorWeather = {active = false}
function mirrorWeather.update()
  mirrorWeather.active = mode == 'snow' or mode == 'rain'
  if not mirrorWeather.active then return end
  local snow = mode == 'snow'
  local budget = 5272
  if not mirrorWeather.mesh then
    local vb, ib = ac.VertexBuffer(budget * 4), ac.IndicesBuffer(budget * 6)
    for i = 0, budget - 1 do
      local b = i * 4
      ib:set(i * 6 + 1, b); ib:set(i * 6 + 2, b + 1); ib:set(i * 6 + 3, b + 2)
      ib:set(i * 6 + 4, b); ib:set(i * 6 + 5, b + 2); ib:set(i * 6 + 6, b + 3)
      for c = 0, 3 do
        local v = vb.raw[b + c]
        v.pos:set((c % 2 == 0) and -50000 or 50000, (c % 2 == 0) and -50000 or 50000, 0)
        v.normal:set(0, 1, 0)
      end
    end
    mirrorWeather.holder = ac.findNodes('luaRoot:yes'):createNode('M2L_MIRROR_WEATHER', false)
    mirrorWeather.mesh = mirrorWeather.holder:createMesh('M2L_MIRROR_WEATHER', 'M2L_MIRROR_WEATHER', vb, ib, false, false)
    mirrorWeather.mesh:setVisible(false)
    mirrorWeather.vertices, mirrorWeather.indices = vb, ib
    mirrorWeather.pass = {mesh = mirrorWeather.mesh, transform = identity, async = true, cacheKey = 4,
      shader = batch.shader, values = {gSnow = 1, gTime = 0, gColor = rgb()}}
  end
  local car = ac.getCar(0)
  local centre, side = car.position, car.side
  local cx, cy, cz = centre.x, centre.y + 1.2, centre.z
  local scale, amount = 1, 0.7
  if snow then scale, amount = snowScale() else scale = rainScale(); amount = 0.7 * scale end
  -- Both precipitation types follow native strength. Preserve the accepted snow size/count boosts;
  -- rain starts from its 70% budget with medium/heavy boosts and fast fall, without snow flutter/softness.
  local count = floor(3072 * density * amount)
  local mr = mirrorWeather.vertices.raw
  local velocity = car.velocity
  local vx, vy, vz = wind.x - velocity.x, -velocity.y, wind.z - velocity.z
  for i = 0, budget - 1 do
    -- 11 and the fixed power-of-two seed pool are coprime: enlarged render budgets cannot duplicate flakes.
    local seed = i * 11 % BASE_COUNT
    local w, ph = weight[seed], phase[seed]
    local fall = snow and (0.45 + w * 0.85) or (5.5 + w * 3.5)
    local flutterX = snow and sin(elapsed * (0.8 + w) + ph) * 0.18 or 0
    local flutterZ = snow and cos(elapsed * 0.65 + ph) * 0.15 or 0
    local x = (px[seed] + driftX + flutterX - cx + HALF) % BOX - HALF
    local y = (py[seed] - elapsed * fall - cy + HALFY) % BOXY - HALFY
    local z = (pz[seed] + driftZ + flutterZ - cz + HALF) % BOX - HALF
    local d2 = x * x + y * y + z * z
    local visible = i < count and d2 > 2 and d2 < 225 and not sheltered(cx + x, cy + y, cz + z)
    local dist = sqrt(max(1e-6, d2))
    local width = min(0.06, max((0.006 + w * w * 0.025) * size[seed], dist * 0.004)) * scale
    local hw, hh = width * 0.5, width * aspect[seed] * 0.5
    local edge = min(1, (15 - dist) / 4) * min(1, (dist - 1.4) / 1.2)
    local alpha = (0.5 + w * 0.3) * edge
    local sx, sy, sz, ex, ey, ez = side.x, side.y, side.z, 0, 1, 0
    if not snow then
      local relativeY = vy - fall
      local speed = max(1e-6, sqrt(vx * vx + relativeY * relativeY + vz * vz))
      ex, ey, ez = -vx / speed, -relativeY / speed, -vz / speed
      sx, sy, sz = ey * z - ez * y, ez * x - ex * z, ex * y - ey * x
      local length = sqrt(sx * sx + sy * sy + sz * sz)
      if length < 1e-6 then sx, sy, sz, length = side.x, side.y, side.z, 1 end
      sx, sy, sz = sx / length, sy / length, sz / length
      local physicalWidth = (0.0025 + w * 0.003) * size[seed]
      width = max(physicalWidth, min(0.03, dist * 0.002)) * scale
      hw, hh = width * 0.5, min(0.6, max(0.05, speed * 0.016)) * 0.5 * scale
      alpha = (0.3 + w * 0.25) * edge * max(0.35, sqrt(physicalWidth * scale / width))
    end
    local packed = floor(min(99, max(0, alpha * 100)))
    if snow then packed = packed + floor(max(0, 1 - dist / 4) * 9 + 0.5) * 100 end
    for c = 0, 3 do
      local v = mr[i * 4 + c]
      local u = (c == 2 or c == 3) and 0.998 or 0
      local t = (c == 1 or c == 2) and 0.998 or 0
      v.uv:set(seed + u, packed + t)
      if visible then
        local across, vertical = (u > 0 and 1 or -1) * hw, (t > 0 and 1 or -1) * hh
        v.pos:set(cx + x + sx * across + ex * vertical, cy + y + sy * across + ey * vertical, cz + z + sz * across + ez * vertical)
      else
        v.pos:set(cx, cy - 10000, cz)
      end
    end
  end
  mirrorWeather.mesh:alterVertices(mirrorWeather.vertices)
end

mirrorWeather.listener = render.on('mirror.root.transparent', function()
  if not mirrorWeather.active or not mirrorWeather.pass then return end
  local v = mirrorWeather.pass.values
  v.gTime = elapsed
  v.gSnow = mode == 'snow' and 1 or 0
  local sky, horizon = sim.skyColor, sim.horizonColor
  if mode == 'snow' then
    local brightness = min(1, max(0.04, sqrt(max(0, (sky.r + sky.g + sky.b + horizon.r + horizon.g + horizon.b) / 6)) * 2.5))
    v.gColor:set(0.82 * brightness, 0.86 * brightness, 0.9 * brightness)
  else
    v.gColor:set(max(0.06, horizon.r * 1.8), max(0.065, horizon.g * 1.8), max(0.07, horizon.b * 1.8))
  end
  render.setBlendMode(render.BlendMode.AlphaBlend)
  render.setCullMode(render.CullMode.None)
  render.setDepthMode(render.DepthMode.ReadOnly)
  render.mesh(mirrorWeather.pass)
end)

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
glass = {mesh = nil, blades = {}, sides = {}}
local FIELD_W, FIELD_H = 1536, 768
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
  local root = ac.findNodes('carRoot:0')
  local rootPose = root:getWorldTransformationRaw()
  if not rootPose then return false end
  -- Geometry discovery, surface sampling, blades and shading MUST use the same model origin.
  -- car.worldToLocal can refer to the physics/CoG frame (46 cm along Z on the preview BMW after reset),
  -- while carRoot is the rendered model frame. Mixing them shifted the wipe below the visible glass.
  local w2l = rootPose:inverse()
  local probe = w2l:transformPoint(car.position)
  if probe.x ~= probe.x or probe.y ~= probe.y then return false end
  local eyes = car.driverEyesPosition
  local found = root:findMeshes('shader:ksWindscreen')
  local chosen, lo, hi, width = nil, nil, nil, 0
  local sideCandidates = {}
  for i = 1, #found do
    local m = found:at(i)
    local mn, mx = localBox(m, w2l)
    local cx, cz, w = (mn.x + mx.x) / 2, (mn.z + mx.z) / 2, mx.x - mn.x
    -- The windscreen: a ksWindscreen mesh ahead of the driver's eyes and centred on the car. Side and rear
    -- windows share the shader; of several front layers (inner/outer glass) the widest one is drawn.
    local front = cz > eyes.z + 0.1 and math.abs(cx) < 0.3 and w > 0.6
    if front and w > width then chosen, lo, hi, width = m, mn, mx, w end
    -- Side panes are tall, long along the car and offset from its centre. Keep the largest pane per side,
    -- avoiding duplicate inner/outer layers and rear glass. Discovery stays a one-off scene traversal.
    local area = (mx.y - mn.y) * (mx.z - mn.z)
    if not front and math.abs(cx) > 0.35 and w < 0.4 and mx.y - mn.y > 0.2 and mx.z - mn.z > 0.35 then
      local sign = cx > 0 and 1 or -1
      local old = sideCandidates[sign]
      if not old or area > old.area then sideCandidates[sign] = {mesh = m, lo = mn, hi = mx, sign = sign, area = area} end
    end
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
  for _, side in pairs(sideCandidates) do
    local mn, mx = side.lo, side.hi
    local dx, dy = mx.x - mn.x, mx.y - mn.y
    local len = sqrt(dx * dx + dy * dy)
    side.ty, side.tx = dy / len, -side.sign * dx / len
    side.sc = mn.y * side.ty + (side.sign > 0 and mx.x or mn.x) * side.tx
    side.x0, side.xw, side.s0, side.sw = mn.z - 0.02, mx.z - mn.z + 0.04, -0.02, len + 0.04
    side.step, side.activeUntil, side.gustBudget = 0, 0, 0
    side.random = side.sign > 0 and 17311 or 65357
    glass.sides[#glass.sides + 1] = side
  end
  if DEBUG then ac.log('M2L_GLASS side panes=' .. #glass.sides) end

  -- Sample the car's actual triangles once, in the SAME X/S coordinates used by the field and blades.
  -- N is depth normal to that chart. Its derivatives let Rust project gravity/vehicle airflow onto the
  -- curved surface instead of steering water along a single flat plane or toward a screen-space point.
  local function sampleSurface(pane, front, number)
    local vb, ib = pane.mesh:getVertices(), pane.mesh:getIndices()
    if not vb or not ib then return nil end
    local transform = pane.mesh:getParent():getWorldTransformationRaw()
    local points, triangles = {}, {}
    for i = 0, #vb - 1 do
      local q = w2l:transformPoint(transform:transformPoint(vb.raw[i].pos))
      if front then
        points[i] = {q.x, q.y * pane.ty + q.z * pane.tz - pane.sc, -q.y * pane.tz + q.z * pane.ty}
      else
        points[i] = {q.z, q.x * pane.tx + q.y * pane.ty - pane.sc, pane.sign * (q.x * pane.ty - q.y * pane.tx)}
      end
      -- This is a private buffer copy. Bake the Rust X/S chart into the coating's vertex UVs once;
      -- the car's original mesh/material/UVs are never changed. Rendering then needs no camera-to-pane inversion.
      vb.raw[i].uv:set((points[i][1] - pane.x0) / pane.xw, 1 - (points[i][2] - pane.s0) / pane.sw)
    end
    pane.coatingHolder = ac.findNodes('luaRoot:yes'):createNode('M2L_PANE_UV_' .. number, false)
    if pane.coatingHolder then
      pane.coatingMesh = pane.coatingHolder:createMesh('M2L_PANE_UV_' .. number, 'M2L_PANE_UV', vb, ib, false, false)
      if pane.coatingMesh then
        pane.coatingMesh:setVisible(false)
        pane.coatingTransform = mat4x4.identity()
        if DEBUG then ac.log('M2L_RAIN_UV pane=' .. number .. ' fixed vertices=' .. #vb) end
      end
    end
    for i = 0, #ib - 3, 3 do
      local a, b, c = points[tonumber(ib.raw[i])], points[tonumber(ib.raw[i + 1])], points[tonumber(ib.raw[i + 2])]
      if a and b and c then
        local ux, us, vx, vs = b[1] - a[1], b[2] - a[2], c[1] - a[1], c[2] - a[2]
        local det = ux * vs - vx * us
        if math.abs(det) > 1e-10 then
          local hx = ((b[3] - a[3]) * vs - (c[3] - a[3]) * us) / det
          local hs = (ux * (c[3] - a[3]) - vx * (b[3] - a[3])) / det
          triangles[#triangles + 1] = {a = a, ux = ux, us = us, vx = vx, vs = vs, det = det,
            hx = hx, hs = hs, cx = (a[1] + b[1] + c[1]) / 3, cs = (a[2] + b[2] + c[2]) / 3}
        end
      end
    end
    if #triangles == 0 then return nil end
    pane.chartTriangles = triangles
    local grid, coverage = {}, {}
    pane.surfacePoints = {}
    for j = 0, 8 do
      for i = 0, 16 do
        local x, s = pane.x0 + pane.xw * i / 16, pane.s0 + pane.sw * j / 8
        local selected, nearest, outer = nil, 1e30, -1e30
        for _, t in ipairs(triangles) do
          local dx, ds = x - t.a[1], s - t.a[2]
          local b = (dx * t.vs - t.vx * ds) / t.det
          local c = (t.ux * ds - dx * t.us) / t.det
          if b >= -1e-5 and c >= -1e-5 and b + c <= 1.00001 then
            local n = t.a[3] + t.hx * dx + t.hs * ds
            if n > outer then selected, outer = t, n end
          elseif outer == -1e30 then
            local distance = (x - t.cx) ^ 2 + (s - t.cs) ^ 2
            if distance < nearest then selected, nearest = t, distance end
          end
        end
        grid[i + j * 17] = {selected.hx, selected.hs}
        coverage[i + j * 17] = outer ~= -1e30
        pane.surfacePoints[i+j*17] = {x,s,selected.a[3]+selected.hx*(x-selected.a[1])+selected.hs*(s-selected.a[2])}
      end
    end
    if DEBUG then
      ac.log(string.format('M2L_RAIN_SURFACE pane=%d vertices=%d triangles=%d hxLeft=%.4f hxCentre=%.4f hxRight=%.4f',
        number, #vb, #triangles, grid[68][1], grid[76][1], grid[84][1]))
      if front then
        for j = 0, 8 do
          local samples = {}
          for i = 0, 16 do
            local k = i+j*17
            samples[#samples+1] = string.format('%s%.3f,%.3f', coverage[k] and '' or '*',grid[k][1],grid[k][2])
          end
          ac.log('M2L_SURFACE_ROW ' .. j .. ' ' .. table.concat(samples,';'))
        end
      end
    end
    return grid
  end
  local panes = {glass}
  for _, pane in ipairs(glass.sides) do panes[#panes + 1] = pane end
  for i, pane in ipairs(panes) do
    local ok, surface = pcall(sampleSurface, pane, i == 1, i)
    if ok then pane.surface = surface
    elseif DEBUG then ac.log('M2L_RAIN_SURFACE unavailable: ' .. tostring(surface)) end
  end
  glass.fieldA = ui.ExtraCanvas(vec2(FIELD_W, FIELD_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L glass A')
  glass.fieldB = ui.ExtraCanvas(vec2(FIELD_W, FIELD_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L glass B')
  glass.fieldA:clear(rgbm(0, 0, 0, 0))
  glass.fieldB:clear(rgbm(0, 0, 0, 0))
  glass.read, glass.write = glass.fieldA, glass.fieldB

  local snowOnGlass, wetUntil = 0, 0
  local rainAmount, snowRate = 0, 0
  local function updateBlades(dt, w2l)
    -- A parked blade vibrates with the engine/body. Only a changing native wiper phase can sweep or push
    -- snow: scene-transform jitter alone otherwise draws a false ridge when the driver revs the engine.
    if glass.bladeTime == elapsed then return glass.anyActive or false end
    glass.bladeTime = elapsed
    local progress = ac.getCar(0).wiperProgress
    local phaseMoved = glass.bladeProgress ~= nil and math.abs(progress - glass.bladeProgress) > 1e-6
    glass.bladeProgress = progress
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
        if phaseMoved and moved > 0.0003 then
          local dirx, dirs = mx / moved, ms / moved
          blade.dx, blade.ds, blade.speed, blade.idle, blade.active = dirx, dirs, step / dt, 0, 1
          anyActive = true
          blade.pax, blade.pas, blade.pbx, blade.pbs = blade.lax, blade.las, blade.lbx, blade.lbs
          blade.lax, blade.las, blade.lbx, blade.lbs = ax, as, bx, bs
        else
          blade.active = 0
          if not phaseMoved then
            -- Track the parked pose without accumulating vibration into a later sweep.
            blade.lax, blade.las, blade.lbx, blade.lbs = ax, as, bx, bs
          end
          if not phaseMoved or step < 0.0001 then
            blade.idle = blade.idle + dt
          end
        end
      else
        blade.lax, blade.las, blade.lbx, blade.lbs = ax, as, bx, bs
      end
      blade.ax, blade.as, blade.bx, blade.bs = ax, as, bx, bs
    end
    return anyActive
  end

  -- Snow and thaw own this field. Liquid rain is exclusively the librain pipeline.
  local values = {gFrame = vec4(x0,s0,1/xw,1/sw),gParams=vec4(),gAir=vec4(),
    gMelt=0,gSnowMode=0,gSeed=vec2(),gLandingStep=0,
    gW0=mat4x4.identity(),gW1=mat4x4.identity()}
  local rows = {'row1','row2','row3','row4'}
  local function fillBladeMat(m, blade, snowBand)
    if not blade or not blade.pax or blade.active == 0 then m.row4:set(0, 0, 0, 0); return end
    m.row1:set(blade.pax, blade.pas, blade.pbx, blade.pbs)
    m.row2:set(blade.ax, blade.as, blade.bx, blade.bs)
    m.row3:set(blade.dx, blade.ds, 0, snowBand)
    m.row4:set(blade.speed, 1, 0, 0)
  end


  -- Librain particle path. Depth is independent of the accepted snow field.
  -- Fixed X/S chart: U increases to car +X, V increases DOWN the pane. All lengths below are metres.
  -- No camera input participates in this update. Ambient wind and driving airflow have separate gains.
  local lr = {debt = 0, tick = 0, ambientGain = 0, vehicleGain = 1}
  glass.librain = lr
  function lr.capture()
    if not DEBUG or not glass.captureRequested then return end
    if not lr.captureMap then
      lr.captureMap = ac.writeMemoryMappedFile('AcTools.CSP.Limited.Map2Lap.GlassCapture.v1', [[
        uint32_t magic; uint32_t enabled; uint32_t request; uint32_t response;
        uint32_t depth_bytes; uint32_t view_bytes; uint32_t meta_bytes; uint32_t error;
        char meta[65536]; char depth[8388608]; char view[4194304];
      ]])
    end
    local m = lr.captureMap
    if m.magic ~= 0x4d324c43 or m.enabled ~= 1 or m.request == m.response then return end
    local ok, err = pcall(function()
      if not lr.captureView then
        lr.captureView = ui.ExtraCanvas(vec2(960,540),1)
        lr.capturePass = {async = true, cacheKey = 205, blendMode = render.BlendMode.Opaque,
          textures = {txSource = 'dynamic::hdr'}, shader = [[
            float4 main(PS_IN pin) {
              float3 c=max(0,txSource.SampleLevel(samLinearSimple,pin.Tex,0).rgb);
              return float4(pow(c/(1+c),1/2.2),1);
            }
          ]]}
      end
      if not lr.captureView:updateSceneWithShader(lr.capturePass) then return end
      local depth, view = lr.read:encode(), lr.captureView:encode()
      if not depth or not view then error('Canvas encode returned no DDS data') end
      local blades = {}
      for _, b in ipairs(glass.blades) do
        blades[#blades+1] = {b.ax,b.as,b.bx,b.bs,b.active,b.pax,b.pas,b.pbx,b.pbs}
      end
      local v = lr.sim.values
      local particles=lr.captureParticles or {}
      -- Diagnostic projection of the SAME particle identities. Never fed back into movement.
      local projected={}
      local root=glass.root:getWorldTransformationRaw()
      local size=render.getRenderTargetSize()
      local function project(u,v)
        local x,s=glass.x0+u*glass.xw,glass.s0+v*glass.xw
        local n=-1e30
        for _,t in ipairs(glass.chartTriangles) do
          local dx,ds=x-t.a[1],s-t.a[2]
          local det=t.ux*t.vs-t.us*t.vx
          local a,b=(dx*t.vs-ds*t.vx)/det,(t.ux*ds-t.us*dx)/det
          if a>=0 and b>=0 and a+b<=1 then n=max(n,t.a[3]+t.hx*dx+t.hs*ds) end
        end
        if n==-1e30 then return nil end
        local p=vec3(x,glass.ty*(s+glass.sc)-glass.tz*n,glass.tz*(s+glass.sc)+glass.ty*n)
        local q=ui.projectPoint(root:transformPoint(p),false)
        return q and {q.x/size.x,q.y/size.y} or nil
      end
      for _,p in ipairs(particles) do
        local a,b=project(p[2],p[3]),project(p[2]+p[4]*0.2,p[3]+p[5]*0.2)
        if a and b then projected[#projected+1]={p[1],a[1],a[2],b[1],b[2]} end
      end
      local meta = JSON.stringify({time=elapsed, tick=lr.tick, frame=frames, rain=v.gRain,
        phase=ac.getCar(0).wiperProgress, blades=blades, surface=glass.surface,
        gravity={v.gGravity3.x,v.gGravity3.y,v.gGravity3.z},
        air={v.gAir3.x,v.gAir3.y,v.gAir3.z}, chart={glass.x0,glass.s0,glass.xw,glass.sw},
        camera={sim.cameraPosition.x,sim.cameraPosition.y,sim.cameraPosition.z},particles=particles,
        projected=projected,backend="librain-particles-v4"})
      if #depth>8388608 or #view>4194304 or #meta>65536 then error('Capture buffer capacity exceeded') end
      m.depth,m.view,m.meta = depth,view,meta
      m.depth_bytes,m.view_bytes,m.meta_bytes,m.error = #depth,#view,#meta,0
      m.response = m.request
    end)
    if not ok then
      m.error,m.response=1,m.request
      ac.log('M2L_CAPTURE failed: '..tostring(err))
    end
  end
  lr.diagnostic = {async = true, cacheKey = 203, blendMode = render.BlendMode.AlphaBlend,
    depthMode = render.DepthMode.Off,
    textures = {txDepth = false}, values = {gPanel = vec2(320,180)}, shader = [[
      float4 main(PS_IN pin) {
        float2 uv = (pin.PosH.xy-float2(16,16))/gPanel;
        clip(min(min(uv.x,uv.y),min(1-uv.x,1-uv.y)));
        float depth = txDepth.SampleLevel(samLinearSimple,uv,0).r;
        float2 grid = abs(frac(uv*8)-0.5);
        float gridShade = max(grid.x,grid.y) > 0.49 ? 0.15 : 0;
        return float4(depth > 0.025 ? float3(1,0,0) : float3(gridShade,gridShade,gridShade),1);
      }
    ]]}
  lr.width = 1024
  lr.height = math.max(128, math.floor(lr.width * sw / xw + 0.5))
  lr.a = ui.ExtraCanvas(vec2(lr.width, lr.height), 1, render.TextureFormat.R16G16B16A16.Float)
  lr.b = ui.ExtraCanvas(vec2(lr.width, lr.height), 1, render.TextureFormat.R16G16B16A16.Float)
  lr.a:clear(rgbm(0, 0, 0, 0)); lr.b:clear(rgbm(0, 0, 0, 0))
  lr.read, lr.write = lr.a, lr.b
  lr.mask = ui.ExtraCanvas(vec2(lr.width,lr.height),1)
  lr.mask:clear(rgbm(0,0,0,0))
  lr.mask:update(function()
    for _,t in ipairs(glass.chartTriangles or {}) do
      local function uv(x,s) return vec2((x-glass.x0)/glass.xw*lr.width,(1-(s-glass.s0)/glass.sw)*lr.height) end
      ui.drawTriangleFilled(uv(t.a[1],t.a[2]),uv(t.a[1]+t.ux,t.a[2]+t.us),
        uv(t.a[1]+t.vx,t.a[2]+t.vs),rgbm(1,1,1,1))
    end
  end)
  lr.norm = ui.ExtraCanvas(vec2(lr.width, lr.height), 1, render.TextureFormat.R16G16B16A16.Float)
  lr.norm:clear(rgbm(0.5, 0.5, 0, 1))
  lr.normalPass = {async = true, cacheKey = 202, blendMode = render.BlendMode.Opaque,
    textures = {txDepth = false}, values = {gStep = vec2(1/lr.width, 1/lr.height)}, shader = [[
    // CDDL-1.0; Copyright 2018 Saso Kiselkov. All rights reserved.
    // Adapted from librain rain_stage2.frag; full notice below, license in third_party/librain/COPYING.txt.
    // Liquid COMPUTE_VARIANT: weighted depth differences and upstream atan compression.
    float depth(float2 uv) { return txDepth.SampleLevel(samLinearSimple, saturate(uv), 0).r; }
    float4 main(PS_IN pin) {
      float dx = 0.67*(depth(pin.Tex-float2(gStep.x,0))-depth(pin.Tex+float2(gStep.x,0)))
        +0.33*(depth(pin.Tex-float2(2*gStep.x,0))-depth(pin.Tex+float2(2*gStep.x,0)));
      float dy = 0.67*(depth(pin.Tex-float2(0,gStep.y))-depth(pin.Tex+float2(0,gStep.y)))
        +0.33*(depth(pin.Tex-float2(0,2*gStep.y))-depth(pin.Tex+float2(0,2*gStep.y)));
      return float4(saturate(float2(atan(dx),atan(dy))/1.57079632679+0.5),0,1);
    }
  ]]}
  -- CDDL HEADER START
  -- This file and its contents are supplied under the Common Development and
  -- Distribution License (CDDL), version 1.0. Use only in accordance with that
  -- license. See third_party/librain/COPYING.txt or http://www.illumos.org/license/CDDL.
  -- CDDL HEADER END
  -- Copyright 2018, 2019 Saso Kiselkov. All rights reserved.
  -- Adapted droplets.glsl/droplets.vert/droplets.frag: a nine-triangle fan with
  -- alpha 1 at its centre and 0 at its outline. One cached stamp preserves that
  -- interpolation; per-drop affine transforms come from the persistent worker.
  lr.sim = {values={gGravity3=vec3(),gAir3=vec3(),gWind=0,gRain=0,
    gW0=mat4x4.identity(),gW1=mat4x4.identity()}}
  lr.stamp=ui.ExtraCanvas(vec2(512,256),1)
  lr.stampPass={async=true,cacheKey=211,blendMode=render.BlendMode.Opaque,shader=[[
    float cross2(float2 a,float2 b) { return a.x*b.y-a.y*b.x; }
    float2 ring(int i) {
      float a=6.28318530718*i/9;
      float x=sin(a), y=cos(a)-0.6;
      if(i==1 || i==8) x*=1.25;
      if(i>=3 && i<=6) x*=0.75;
      if(i==4 || i==5) y=cos(a)-0.72;
      return float2(x,y);
    }
    float4 main(PS_IN pin) {
      if(pin.Tex.x>=0.5) {
        // tails.frag: quantity times linear distance from centre of the line.
        return float4(1,0,0,saturate(1-abs(pin.Tex.x*4-3))*(1-pin.Tex.y));
      }
      float2 p=float2(pin.Tex.x*2,pin.Tex.y)*4-2;
      float alpha=0;
      [unroll] for(int i=0;i<9;i++) {
        float2 a=ring(i), b=ring((i+1)%9);
        float det=cross2(a,b);
        float u=cross2(p,b)/det, v=cross2(a,p)/det;
        if(u>=0 && v>=0 && u+v<=1) alpha=max(alpha,1-u-v);
      }
      return float4(1,0,0,alpha);
    }
  ]]}
  lr.raster=ui.ExtraCanvas(vec2(lr.width,lr.height),1,render.TextureFormat.R16G16B16A16.Float)
  lr.depthPass={async=true,cacheKey=212,blendMode=render.BlendMode.Opaque,
    textures={txRaster=lr.raster,txGlassMask=lr.mask},
    values={gFrame=vec4(x0,s0,xw,sw),gW0=mat4x4.identity(),gW1=mat4x4.identity()},shader=[[
      bool swept(float2 p,float4x4 W) {
        if(W[3].y<0.5) return false;
        float2 d=p-W[0].xy; float r=length(d);
        float a=atan2(d.x,d.y);
        a+=floor((W[1].x-a)/6.28318530718+0.5)*6.28318530718;
        return r>=W[0].z && r<=W[0].w*1.02 && a>=W[1].y && a<=W[1].z;
      }
      float4 main(PS_IN pin) {
        float2 p=float2(gFrame.x+pin.Tex.x*gFrame.z,gFrame.y+(1-pin.Tex.y)*gFrame.w);
        if(txGlassMask.SampleLevel(samLinearSimple,pin.Tex,0).r<0.5
            || swept(p,gW0) || swept(p,gW1)) return 0;
        return float4(saturate(txRaster.SampleLevel(samLinearSimple,pin.Tex,0).r),0,0,1);
      }
    ]]}
  local function connectLibrain()
    return ac.writeMemoryMappedFile('AcTools.CSP.Limited.Map2Lap.Librain.v4', [[
      uint32_t magic; uint32_t protocol; uint32_t ac_pid; uint32_t request; uint32_t response; uint32_t shutdown;
      uint32_t count[3]; uint32_t pad;
      double params[3][16]; double blades[2][12]; double stats[3][4];
      float drops[3][4096][10]; float tails[3][256][48][4]; float surface[3][153][2];
    ]])
  end
  local function paintLibrain(m)
    if not lr.stampReady then lr.stampReady=lr.stamp:updateWithShader(lr.stampPass) end
    if not lr.stampReady then return false end
    lr.raster:clear(rgbm(0,0,0,0))
    lr.raster:update(function()
      local a,b,c,d=vec2(),vec2(),vec2(),vec2()
      local ua,ub,uc,ud=vec2(),vec2(),vec2(),vec2()
      local color=rgbm(1,1,1,1)
      local function point(out,x,y) out:set(x*lr.width,lr.height-y*lr.width) end
      -- librain paints heads first and streamer segments second with alpha blending.
      for i=0,min(4096,tonumber(m.count[0]))-1 do
        local q=m.drops[0][i]
        local sx,sy=q[4]*(1-0.2*q[5]),q[4]*(1+q[5])
        local ax,ay=q[3]*sx,-q[2]*sx
        local bx,by=q[2]*sy,q[3]*sy
        point(a,q[0]-2*ax-2*bx,q[1]-2*ay-2*by)
        point(b,q[0]+2*ax-2*bx,q[1]+2*ay-2*by)
        point(c,q[0]+2*ax+2*bx,q[1]+2*ay+2*by)
        point(d,q[0]-2*ax+2*bx,q[1]-2*ay+2*by)
        ua:set(0,0);ub:set(0.5,0);uc:set(0.5,1);ud:set(0,1)
        ui.drawImageQuad(lr.stamp,a,b,c,d,color,ua,ub,uc,ud)
      end
      for i=0,255 do
        local tail=m.tails[0][i]
        for j=0,46 do
          local p,q=tail[j],tail[j+1]
          local dx,dy=q[0]-p[0],q[1]-p[1]
          local length=sqrt(dx*dx+dy*dy)
          if p[3]>0 and q[3]>0 and length>1e-7 and p[2]>0 then
            local nx,ny=-dy/length*10/2048,dx/length*10/2048
            point(a,p[0]-nx*p[2],p[1]-ny*p[2]);point(b,p[0]+nx*p[2],p[1]+ny*p[2])
            point(c,q[0]+nx*q[2],q[1]+ny*q[2]);point(d,q[0]-nx*q[2],q[1]-ny*q[2])
            ua:set(0.5,1-p[2]);ub:set(1,1-p[2]);uc:set(1,1-q[2]);ud:set(0.5,1-q[2])
            ui.drawImageQuad(lr.stamp,a,b,c,d,color,ua,ub,uc,ud)
          end
        end
      end
    end)
    if not lr.write:updateWithShader(lr.depthPass) then return false end
    lr.read,lr.write=lr.write,lr.read
    lr.normalPass.textures.txDepth=lr.read
    lr.norm:updateWithShader(lr.normalPass)
    if glass.captureRequested and lr.captureMap and lr.captureMap.enabled==1 then
      lr.captureParticles={}
      for i=0,min(128,tonumber(m.count[0]))-1 do
        local q=m.drops[0][i]
        lr.captureParticles[#lr.captureParticles+1]={q[7],q[0],q[1],q[8],q[9],q[4],q[5]}
      end
    end
    glass.rainCount=tonumber(m.count[0])
    lr.tick=lr.tick+1
    return true
  end
  -- CDDL-1.0; Copyright 2018 Saso Kiselkov. All rights reserved.
  -- librain.c wiper_setup_prog() radial geometry with a consumed sweep interval.
  -- Persist all crossed angles until a GPU tick succeeds: a faster render cadence must
  -- not drop intermediate sweeps. Reversal before a tick is covered by the interval too.
  lr.wipers = {}
  local function updateLibrainWiper(index, matrix)
    local blade = glass.blades[index]
    if not blade or not blade.ax then matrix.row4:set(0,0,0,0); return end
    local state = lr.wipers[index] or {}
    lr.wipers[index] = state
    local inverse = glass.root:getWorldTransformationRaw():inverse()
    local pivot = inverse:transformPoint(blade.pivot:getWorldTransformationRaw().position)
    local px, ps = pivot.x, pivot.y*glass.ty+pivot.z*glass.tz-glass.sc
    local ax, as = blade.ax-px, blade.as-ps
    local bx, bs = blade.bx-px, blade.bs-ps
    local ra, rb = sqrt(ax*ax+as*as), sqrt(bx*bx+bs*bs)
    local angle = ra > rb and math.atan2(ax,as) or math.atan2(bx,bs)
    local phase = ac.getCar(0).wiperProgress
    if state.now then
      angle = angle + math.floor((state.now-angle)/(2*math.pi)+0.5)*2*math.pi
      if phase ~= state.phase and math.abs(angle-state.now) > 1e-7 then
        state.lo = min(state.lo or state.now,state.now,angle)
        state.hi = max(state.hi or state.now,state.now,angle)
        state.direction = angle > state.now and 1 or -1
      end
    end
    state.now, state.phase = angle, phase
    matrix.row1:set(px,ps,min(ra,rb),max(ra,rb))
    matrix.row2:set(angle,state.lo or angle,state.hi or angle,0)
    matrix.row3:set(state.direction or 0,0,0,0)
    matrix.row4:set(0,state.lo and 1 or 0,0,0)
  end
  local function consumeLibrainSweeps()
    for _, state in pairs(lr.wipers) do state.lo, state.hi = nil, nil end
    lr.sim.values.gW0.row4:set(0,0,0,0)
    lr.sim.values.gW1.row4:set(0,0,0,0)
  end
  function lr.update(dt, gx, gs, driveX, driveS, weatherX, weatherS, rain, gn, driveN, weatherN)
    local v=lr.sim.values
    v.gGravity3:set(gx,gs,gn)
    v.gAir3:set(driveX*lr.vehicleGain+weatherX*lr.ambientGain,
      driveS*lr.vehicleGain+weatherS*lr.ambientGain,driveN*lr.vehicleGain+weatherN*lr.ambientGain)
    v.gRain=rain; v.gWind=min(1,v.gAir3:length()/100)
    updateLibrainWiper(1,v.gW0);updateLibrainWiper(2,v.gW1)
    lr.debt=min(0.1,lr.debt+dt)
    if not lr.mapping then
      local ok,m=pcall(connectLibrain)
      if ok then lr.mapping=m end
    end
    local m=lr.mapping
    if not m or m.magic~=0x4d32524e or m.protocol~=4 or m.shutdown~=0 then
      lr.pending,lr.initialized=false,false
      return -- Never fall back to a second liquid simulation.
    end
    if lr.seq and m.request<lr.seq then lr.pending,lr.initialized=false,false end
    if lr.pending and m.response==lr.seq then
      if not paintLibrain(m) then return end
      lr.pending=false
      if not lr.announced then
        lr.announced=true
        ac.log('M2L_LIBRAIN particle worker connected bytes='..ffi.sizeof(m[0])..' protocol=4')
      end
    end
    if lr.pending or m.request~=m.response or lr.debt<1/60 then return end
    local p=m.params[0]
    p[0],p[1],p[2],p[3],p[4],p[5]=lr.debt,x0,xw,s0,sw,rain
    p[6],p[7],p[8]=gx,gs,gn
    p[9],p[10],p[11]=v.gAir3.x,v.gAir3.y,v.gAir3.z
    p[12],p[13],p[14],p[15]=lr.initialized and 0 or 1,math.abs(gn)/9.81,lr.ambientGain,0
    if not lr.initialized then
      for k=0,152 do
        local h=glass.surface and glass.surface[k] or {0,0}
        m.surface[0][k][0],m.surface[0][k][1]=h[1],h[2]
      end
      -- Side resources are not activated before front-glass visual acceptance.
      for pane=1,2 do for k=0,15 do m.params[pane][k]=0 end end
    end
    for k=0,1 do
      local W=k==0 and v.gW0 or v.gW1
      local o=m.blades[k]
      o[0],o[1],o[2],o[3]=W.row1.x,W.row1.y,W.row1.z,W.row1.w
      o[4],o[5],o[6],o[7],o[8]=W.row2.x,W.row2.y,W.row2.z,W.row3.x,W.row4.y
      o[9],o[10],o[11]=0,0,0
      local target=k==0 and lr.depthPass.values.gW0 or lr.depthPass.values.gW1
      target.row1:set(W.row1);target.row2:set(W.row2);target.row3:set(W.row3);target.row4:set(W.row4)
    end
    consumeLibrainSweeps()
    lr.seq,lr.debt,lr.initialized=m.request+1,0,true
    lr.pending=true
    m.request=lr.seq
  end

  glass.sim = {
    async = true,
    cacheKey = 70,
    blendMode = render.BlendMode.Opaque,
    textures = {txPrev = false},
    values = values,
    shader = [[
      float hash12(float2 p) { float3 p3 = frac(float3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return frac((p3.x + p3.y) * p3.z); }
      // Landing probabilities are much smaller than the float hash's rounding step. Its frequent exact zeros
      // made light, medium and heavy snow land almost equally often. Keep 24 random bits for this decision.
      float landingRandom(int2 cell, uint stream) {
        uint h = uint(cell.x) * 1597334677u ^ uint(cell.y) * 3812015801u ^ uint(gLandingStep) * 2798796415u ^ stream * 747796405u;
        h ^= h >> 16; h *= 2146121005u;
        h ^= h >> 15; h *= 2221713035u;
        h ^= h >> 16;
        return float(h >> 8) * (1.0 / 16777216.0);
      }
      float cross2(float2 a, float2 b) { return a.x * b.y - a.y * b.x; }
      bool inTri(float2 p, float2 a, float2 b, float2 c) {
        float s1 = cross2(b - a, p - a), s2 = cross2(c - b, p - b), s3 = cross2(a - c, p - c);
        return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0);
      }
      #ifndef M2L_SIDE_GLASS
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
        float len2 = dot(e, e);
        if (len2 < 1e-9) return;
        float len = sqrt(len2);
        float t = dot(p - A1, e) / len2;
        float2 off = p - (A1 + e * t);
        float normalMotion = cross2(e, W[2].xy) / len;
        // Width is measured perpendicular to the blade. Projecting onto its motion instead made nearly
        // parallel motion/jitter stretch a millimetre ridge into a large white patch across the glass.
        float ahead = cross2(e, off) / len * sign(normalMotion);
        // The ridge starts just ahead of the line: what lies behind it was swept this frame and stays clear.
        if (abs(normalMotion) > 0.05 && t > 0.01 && t < 0.99 && ahead > 0.0004) {
          if (W[2].z > 0 && ahead < W[2].z) {
            h = max(h, 1.3 * (1 - ahead / W[2].z) * (0.7 + 0.3 * hash12(floor(p * 700))));
            // A connected wet band stays at the stroke limits after the live ridge changes direction.
            film = max(film, 0.8 * (1 - ahead / W[2].z));
          }
          if (W[2].w > 0 && ahead < W[2].w) snow = max(snow, 0.8 * (1 - ahead / W[2].w) * (0.6 + 0.4 * hash12(floor(p * 500))));
        }
      }
      #endif
      float4 main(PS_IN pin) {
        float2 uv = pin.Tex;
        float2 p = float2(gFrame.x + uv.x / gFrame.z, gFrame.y + (1 - uv.y) / gFrame.w);
        float dt = gParams.x;
        float4 prev = txPrev.SampleLevel(samLinearSimple, uv, 0);
        #ifdef M2L_SIDE_GLASS
        // Only liquid water moves along the pane; adhered snow and slush retain their stationary field.
        float2 waterFrom = uv - gRainFlow * dt;
        prev.a = txPrev.SampleLevel(samLinearSimple, saturate(waterFrom), 0).a;
        prev.a *= (waterFrom.x >= 0 && waterFrom.x <= 1 && waterFrom.y >= 0 && waterFrom.y <= 1) ? 1 : 0;
        // Clumps adhere in place. Gusts tear off small patches instead of smearing the entire field.
        [unroll] for (int g = 0; g < 4; g++) {
          float4 gust = gGusts[g];
          float2 delta = p - gust.xy;
          if (gust.z > 0 && dot(delta, delta) < gust.z * gust.z) prev.gb = 0;
        }
        #endif
        // Sticky slush stays at the deposit and melts locally into the thin water film. Transporting all slush
        // down the glass at a fixed speed made every melting flake paint a growing, bright vertical stripe.
        // Retained snow melt dries slowly; rain does not deposit into this field.
        float film = max(0,prev.r-gParams.z*dt);
        float snow = prev.g;
        float slush = prev.b;
        // Cells only accelerate the neighbour lookup. Land anywhere inside each cell, including its edges,
        // so old deposits can join across cell boundaries without leaving a visible lattice of empty gaps.
        float2 cell = floor(p / 0.012);
        float add = 0;
        [unroll] for (int j = -1; j <= 1; j++) [unroll] for (int i = -1; i <= 1; i++) {
          float2 c = cell + float2(i, j);
          int2 id = int2(c);
          float hv = landingRandom(id, 0u);
          if (hv < gParams.w) {
            // Shape streams are independent of the rare-event decision: accepted hv values are all near
            // zero and cannot supply a useful rotation or silhouette. Elliptical stretching preserves area.
            float2 centre = (c + float2(landingRandom(id, 1u), landingRandom(id, 2u))) * 0.012;
            float R = 0.002 + 0.0035 * landingRandom(id, 3u);
            float2 q = p - centre;
            float rotation = landingRandom(id, 4u) * 6.283185;
            float cr = cos(rotation), sr = sin(rotation);
            float stretch = lerp(0.7, 1.4, landingRandom(id, 5u));
            q = float2(cr * q.x - sr * q.y, sr * q.x + cr * q.y) * float2(stretch, 1 / stretch);
            float ang = atan2(q.y, q.x);
            float lobes = 2 + floor(landingRandom(id, 6u) * 4);
            float phase = landingRandom(id, 7u) * 6.283185;
            float rr = R * (0.75 + 0.25 * sin(ang * lobes + phase) + 0.12 * sin(ang * (lobes + 2) - phase * 1.7));
            add += smoothstep(rr, rr * 0.45, length(q)) * (0.45 + 0.55 * landingRandom(id, 8u));
          }
        }
        snow = min(2, snow + add);
        // Airflow above about 6 m/s along the glass strips snow, thin deposits first; heat melts it into slush.
        #ifdef M2L_SIDE_GLASS
        float strip = 0;
        #else
        float strip = min(snow, max(0, gAir.z - 6) * 0.012 * dt * (snow < 0.5 ? 1 : 0.4));
        #endif
        snow -= strip;
        float melted = min(snow, gMelt * dt);
        snow -= melted;
        slush = min(1, slush + melted * 0.8 + strip * 0.05);
        float toWater = slush * 0.12 * dt;
        slush -= toWater;
        film = min(1, film + toWater * 0.8);
        float h = 0; // Snow/thaw height is carried in G/B; no second rain depth field.
        #ifdef M2L_SIDE_GLASS
        return float4(film, snow, slush, h);
        #else
        blade(gW0, p, film, snow, slush, h);
        blade(gW1, p, film, snow, slush, h);
        return float4(film, snow, slush, h);
        #endif
      }
    ]]
  }

  glass.pass = {
    mesh = glass.mesh,
    transform = 'original',
    async = true,
    cacheKey = 71,
    textures = {txField = false, txSceneCopy = false, txLibrain = false, txLibrainNormal = false},
    values = {gFrame = vec4(x0, s0, 1 / xw, 1 / sw), gTangent = vec4(glass.sc, glass.ty, glass.tz, glass.sw), gScreen = vec2(1, 1), gRefract = 0, gTime = 0, gWhite = 1, gSnowMode = 0, gSideGlass = 0, gDebugDrops = 0, gPaneUV = 0, gLibrain = 0, gLibrainBlur = 0,
      gTexel = vec4(1 / FIELD_W, 1 / FIELD_H, xw / FIELD_W * 1000, sw / FIELD_H * 1000),
      gColor = rgb(0.3, 0.33, 0.37), gSnowColor = rgb(0.8, 0.82, 0.86), gRaw = 0,
      gCameraPos = vec3(), gCarPos = vec3(), gCarSide = vec3(), gCarUp = vec3(), gCarLook = vec3(),
      gRidge0 = mat4x4.identity(), gRidge1 = mat4x4.identity()},
    shader = [[
      float height(float4 f) { return f.a + f.r * 0.08 + f.b + f.g * 2.2; }
      float4 main(PS_IN pin) {
        float3 across = gSideGlass == 0 ? gCarSide : gCarLook;
        float3 slope = gSideGlass == 0 ? gCarLook : gCarSide;
        float x, s;
        float2 uv;
        if (gPaneUV > 0.5) {
          // Rain chart fixed in the car mesh. Camera position, direction and screen centre cannot alter it.
          uv = pin.Tex;
          x = gFrame.x + uv.x / gFrame.z;
          s = gFrame.y + (1 - uv.y) / gFrame.w;
        } else {
          // Retain the accepted snow path and the compatibility fallback for unavailable mesh buffers.
          float3 d = pin.PosC + gCameraPos - gCarPos;
          x = dot(d, across);
          s = dot(d, gCarUp) * gTangent.y + dot(d, slope) * gTangent.z - gTangent.x;
          uv = float2((x - gFrame.x) * gFrame.z, 1 - (s - gFrame.y) * gFrame.w);
        }
        float4 retainedSnow = txField.SampleLevel(samLinearSimple,uv,0);
        if (gLibrain > 0.5 && retainedSnow.g+retainedSnow.b < 0.001) {
          float depth = txLibrain.SampleLevel(samLinearSimple, uv, 0).r;
          // Solid red shows only the actual retained depth, including the leading wiper edge.
          if (gDebugDrops > 0.5) return float4(1, 0, 0, depth > 0.025 ? 1 : 0);
          // CDDL-1.0; Copyright 2018 Saso Kiselkov. All rights reserved.
          // ws_rain.frag: depth normals displace a separate scene copy, then darken slightly.
          if (gRefract < 0.5 || depth <= 0.001) return 0;
          float2 normal = 2 * txLibrainNormal.SampleLevel(samLinearSimple,uv,0).xy - 1;
          float2 displacement = normal * gScreen.yx/10;
          if (gLibrainBlur < 0.5) {
            float3 refracted = txSceneCopy.SampleLevel(samLinearSimple,
              saturate((pin.PosH.xy+displacement)/gScreen),0).rgb;
            float darkening = length(displacement)/(max(gScreen.x,gScreen.y)/10)/2;
            return float4(refracted*(1-darkening*darkening),1);
          }
          // ws_smudge.frag: blur the completed refracted screen image with the same depth.
          float2 centre = pin.PosH.xy;
          float depthRatio = depth;
          float3 colour = 0;
          [unroll] for (int y = -2; y <= 2; y++) {
            [unroll] for (int x = -2; x <= 2; x++) {
              float wx = x == 0 ? 0.4 : (abs(x) == 1 ? 0.2 : 0.1);
              float wy = y == 0 ? 0.4 : (abs(y) == 1 ? 0.2 : 0.1);
              colour += txSceneCopy.SampleLevel(samLinearSimple,
                saturate((centre + depthRatio*float2(x,y))/gScreen),0).rgb * wx*wy;
            }
          }
          return float4(colour,1);
        }
        float4 f = txField.Sample(samLinearSimple, uv);
        if (gRaw > 0.5) return float4(f.r, f.g, f.a * 0.5, 0.9);
        // Diagnostic: show the actual water footprint, independent of lenses, sky glints or background blur.
        if (gDebugDrops > 0.5 && gSnowMode < 0.5 && f.a > 0.025) return float4(1, 0, 0, 1);
        float hx = height(txField.Sample(samLinearSimple, uv + float2(gTexel.x, 0))) - height(txField.Sample(samLinearSimple, uv - float2(gTexel.x, 0)));
        float hy = height(txField.Sample(samLinearSimple, uv + float2(0, gTexel.y))) - height(txField.Sample(samLinearSimple, uv - float2(0, gTexel.y)));
        // Surface normal of the water or snow in the glass frame (X across, Y up the glass, Z out of the glass).
        float3 n = normalize(float3(-hx / (2 * gTexel.z), hy / (2 * gTexel.w), 1));
        float3 Tw = gCarUp * gTangent.y + slope * gTangent.z;
        float3 Nw = gSideGlass == 0 ? gCarLook * gTangent.y - gCarUp * gTangent.z
          : (gCarSide * gTangent.y - gCarUp * gTangent.z) * gSideGlass;
        float3 nW = normalize(across * n.x + Tw * n.y + Nw * n.z);
        float3 V = normalize(pin.PosC);
        float3 R = reflect(V, nW);
        // A separate HDR copy supplies rain refraction below; these subdued contact/reflection terms also
        // provide a fallback if that copy is unavailable. Snow keeps its existing height shading.
        float body = saturate((f.a + (gSnowMode > 0.5 ? 0 : f.b)) * 2.5);
        // The film edge is softened over about 4 mm, so the swept fan does not end in a hard line.
        float2 e3 = gTexel.xy * 3;
        float filmSum = f.r + txField.Sample(samLinearSimple, uv + float2(e3.x, e3.y * 0.5)).r + txField.Sample(samLinearSimple, uv - float2(e3.x, e3.y * 0.5)).r
          + txField.Sample(samLinearSimple, uv + float2(-e3.x * 0.5, e3.y)).r + txField.Sample(samLinearSimple, uv + float2(e3.x * 0.5, -e3.y)).r;
        float film = saturate(filmSum * 0.2 * 1.5);
        float steep = saturate(length(n.xy) * 3);
        float spec = pow(saturate(R.y), 8) * saturate(steep * 1.5 + 0.2);
        // Side panes have a smaller, oblique view of the beads: give liquid stronger edge contrast and
        // a clearer crest highlight, while retaining the accepted windscreen and matte snow shading.
        float sideWater = gSideGlass == 0 ? 0 : 1;
        float3 bodyColor = gColor * lerp(0.3, 0.24, sideWater);
        float3 rimColor = gColor * lerp(0.08, 0.045, sideWater);
        float3 specColor = gColor * lerp(1.6, 2.0, sideWater);
        // The thin film has a calm sheen. Actual deposited beads supply highlights; an extra procedural
        // grid of identical micro-beads made the whole wet pane look regularly dotted even after wiping.
        float3 filmColor = gColor * 0.2;
        float bodyA = body * lerp(0.26, 0.38, sideWater);
        float rimA = steep * body * lerp(0.45, 0.68, sideWater);
        float specA = spec * body * lerp(0.45, 0.72, sideWater);
        float filmA = film * 0.04;
        float waterWeight = bodyA + rimA + specA + filmA;
        float wAlpha = saturate(waterWeight);
        // A wet unwiped pane can have both a lens and a full film. Normalize their colour by the actual
        // weights, not clamped alpha: dividing 1.24 parts of colour by 1 made unwiped beads glow too brightly.
        float colorWeight = wAlpha;
        float3 wColor = (bodyColor * bodyA + rimColor * rimA + specColor * specA + filmColor * filmA) / max(colorWeight, 1e-4);
        // Snow: matte white with cheap height shading from above; slush grey and translucent.
        // Side deposits start fading as soon as they thaw, instead of staying clipped white then vanishing.
        float snowA = gSideGlass == 0 ? saturate(f.g * 2.2) : 1 - exp(-f.g * 2.2);
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

  -- Side snow uses independent fields at at most 30 Hz, without front-wiper bindings.
  -- Liquid side resources are deferred until front-glass acceptance.
  local SIDE_W, SIDE_H = 512, 256
  local sideClock = 0
  local function sideRand(side)
    side.random = side.random * 16807 % 2147483647
    return side.random / 2147483647
  end
  local function updateSides(dt, ax, ay, az, melt, snowFlux, driveX, driveY, driveZ)
    sideClock = sideClock + dt
    if sideClock < 1 / 30 or glassOff then return end
    local step = min(sideClock, 0.1)
    sideClock = 0
    for i, side in ipairs(glass.sides) do
      if snowRate > 0 then side.activeUntil = elapsed + 6000 end
      side.active = elapsed < side.activeUntil
      if side.active then
        if not side.read then
          side.read = ui.ExtraCanvas(vec2(SIDE_W, SIDE_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L side glass ' .. i .. ' A')
          side.write = ui.ExtraCanvas(vec2(SIDE_W, SIDE_H), 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L side glass ' .. i .. ' B')
          side.read:clear(rgbm(0, 0, 0, 0)); side.write:clear(rgbm(0, 0, 0, 0))
          -- Separate cache/binding instances from the windscreen, and include the side define in the source
          -- identity itself. A side pass must never inherit the front field or its animated wiper constants.
          side.sim = {async = true, cacheKey = 80 + i, blendMode = render.BlendMode.Opaque,
            textures = {txPrev = false}, shader = '#define M2L_SIDE_GLASS 1\n' .. glass.sim.shader,
            values = {gFrame = vec4(side.x0, side.s0, 1 / side.xw, 1 / side.sw), gParams = vec4(), gAir = vec4(),
              gMelt = 0, gRainFlow = vec2(), gLandingStep = 0, gGusts = mat4x4.identity()}}
          local pv = {}
          for k, value in pairs(glass.pass.values) do pv[k] = value end
          pv.gFrame = vec4(side.x0, side.s0, 1 / side.xw, 1 / side.sw)
          pv.gTangent = vec4(side.sc, side.ty, side.tx, side.sw)
          pv.gTexel = vec4(1 / SIDE_W, 1 / SIDE_H, side.xw / SIDE_W * 1000, side.sw / SIDE_H * 1000)
          pv.gSideGlass, pv.gSnowMode = side.sign, 1
          pv.gCameraPos, pv.gCarPos, pv.gCarSide, pv.gCarUp, pv.gCarLook = vec3(), vec3(), vec3(), vec3(), vec3()
          pv.gColor, pv.gSnowColor = rgb(), rgb()
          side.parent = side.mesh:getParent()
          side.drawTransform = mat4x4.identity()
          side.pass = {mesh = side.mesh, transform = side.drawTransform, async = true, cacheKey = 60 + i,
            textures = {txField = false, txSceneCopy = false, txLibrain = false, txLibrainNormal = false}, values = pv, shader = '// Independent side pane ' .. i .. '\n' .. glass.pass.shader}
        end
        local tangent = ax * side.tx + ay * side.ty
        local normal = side.sign * (ax * side.ty - (ay - 1.2) * side.tx)
        -- Snow flutter reaches near-vertical glass too; windward panes catch more. Area scaling and 20%
        -- of the frontal flux slow the build-up, without shortening the life of snow already on the pane.
        local landings = snowFlux * 0.20 * (side.xw * side.sw / (xw * sw)) * min(2, max(0.5, -normal))
        local sv = side.sim.values
        sv.gParams:set(step, 0, 0.005, landings * step / ((side.xw / 0.012) * (side.sw / 0.012)))
        -- Relative headwind runs toward the rear; gravity drains liquid down the sloped side pane.
        local driveTangent = driveX * side.tx + driveY * side.ty
        local waterU = min(0.12, max(-0.12, driveZ * math.abs(driveZ) * 0.0002))
        local waterS = min(0.04, max(-0.04, driveTangent * math.abs(driveTangent) * 0.0002 - 0.003))
        sv.gRainFlow:set(waterU / side.xw, -waterS / side.sw)
        sv.gAir:set(az, tangent, sqrt(az * az + tangent * tangent), max(0, -normal))
        -- Cold side glass retains settled clumps during snowfall: at rest they can only accumulate, with
        -- no random disappearance. When snow stops, slow thaw resumes; moving air tears patches off.
        sv.gMelt = snowRate > 0 and 0 or melt * 0.1
        -- Above about 15 km/h of tangential airflow, occasional gusts detach centimetre-sized groups.
        -- Faster airflow raises their frequency; parked panes retain their accepted slow accumulation.
        local airSpeed = sqrt(az * az + tangent * tangent)
        side.gustBudget = min(4, side.gustBudget + min(90, max(0, airSpeed - 4) * 1.6) * step)
        local gusts = floor(side.gustBudget)
        side.gustBudget = side.gustBudget - gusts
        for g = 1, 4 do
          local row = sv.gGusts[rows[g]]
          if g <= gusts then
            row:set(side.x0 + sideRand(side) * side.xw, side.s0 + sideRand(side) * side.sw, 0.018 + sideRand(side) * 0.022, 0)
          else
            row:set(0, 0, 0, 0)
          end
        end
        side.step = side.step + 1
        sv.gLandingStep = (side.step + i * 4000000) % 16777216
        side.sim.textures.txPrev = side.read
        if side.write:updateWithShader(side.sim) then
          side.read, side.write = side.write, side.read
        end
      end
    end
  end

  local airVec = vec3()
  -- Called from frameBegin: airflow, drops, shader constants, field step.
  function glass.update(dt)
    dt = min(dt, 0.1)
    local car = ac.getCar(0)
    -- The car's root node, not the physics state: blade nodes and the glass mesh hang under it, so their
    -- positions stay consistent to the millimetre at speed (the physics transform lags the scene by a step).
    local rootM = glass.root:getWorldTransformationRaw()
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
    -- Liquid on glass responds to VEHICLE airflow only. The user keeps weather wind for precipitation,
    -- but it must not lift the glass droplets while the car is stationary.
    local driveX = -(vel.x * side.x + vel.y * side.y + vel.z * side.z)
    local driveY = -(vel.x * up.x + vel.y * up.y + vel.z * up.z)
    local driveZ = -(vel.x * look.x + vel.y * look.y + vel.z * look.z)
    local driveS = driveY * ty + driveZ * tz
    local driveMag = sqrt(driveX * driveX + driveS * driveS)
    if not glassOff then
      local gn = -9.81*(-up.y*tz+look.y*ty)
      local driveN = -driveY*tz+driveZ*ty
      lr.update(dt, gx, gs, driveX, driveS, ax-driveX, tanS-driveS, rainAmount,
        gn, driveN, -ay*tz+az*ty-driveN)
    end
    -- Heat: AC has no defroster control. The approximation uses engine coolant temperature as the heater supply
    -- (a warm engine warms the cabin air blown at the glass) plus ambient air above freezing.
    local heat = min(1, max(0, (car.waterTemperature - 50) / 40))
    local ambient = sim.ambientTemperature or 0
    local melt = 0.004 + 0.05 * heat + max(0, ambient) * 0.004
    -- Snow on the glass, a coarse estimate for the ridge ahead of a blade: deposits raise it, sweeps and melt lower it.
    local snowImpact = snowRate * min(impinge, 12)
    -- User-tuned visual flux: about 150/450/700 millimetre clumps per second at rest in light/medium/heavy.
    -- Stronger tiers add increasingly more clumps between identical wipes.
    -- Scale with incoming normal velocity; this tunes glass deposits without changing falling snow outside.
    local snowFlux = snowRate * (snowRate > 0.65 and 700 or snowRate > 0.3 and (450 / 0.65) or (150 / 0.3))
    local clumpsPerSecond = snowFlux * min(impinge, 12)
    -- The ridge estimate follows incoming flux, independently of how many visual clumps represent it.
    snowOnGlass = max(0, min(1, snowOnGlass + snowImpact * dt / 12 - melt * dt - (anyActive and snowOnGlass * dt * 1.5 or 0)))
    if rainAmount > 0 or snowRate > 0 or anyActive then wetUntil = elapsed + 150 end
    glass.quiet = elapsed > wetUntil and (glass.rainCount or 0) == 0
    local v = values
    v.gParams:set(dt, 0, 0.02, clumpsPerSecond * dt / ((xw / 0.012) * (sw / 0.012)))
    v.gAir:set(tanX, tanS, airMag, impinge)
    v.gMelt = melt
    v.gSnowMode = snowRate > 0 and 1 or 0
    -- Nominal rain landing probability over 8 mm cells, with a 3 x 3 neighbour lookup.
    -- Standing in heavy rain the glass is fully wet in about 35 s, about twice as fast when driving into it
    -- (capped: a faster build-up turns the fan's edge into a hard line between sweeps).
    v.gSeed:set((frames % 977) * 0.173 + 0.31, (frames % 1013) * 0.291 + 0.17)
    v.gLandingStep = frames % 16777216
    fillBladeMat(v.gW0, glass.blades[1], snowOnGlass * 0.014)
    fillBladeMat(v.gW1, glass.blades[2], snowOnGlass * 0.014)
    glass.melt, glass.air, glass.impinge = melt, airMag, impinge
    -- One field step into the other canvas, before the frame's rendering starts (like CSP's own canvas updates).
    if not glass.quiet and not glassOff then
      glass.sim.textures.txPrev = glass.read
      glass.write:updateWithShader(glass.sim)
      glass.read, glass.write = glass.write, glass.read
    end
    updateSides(dt, ax, ay, az, melt, snowFlux, driveX, driveY, driveZ)
  end

  -- Called from draw3D: the glass mesh drawn once more with the field.
  function glass.draw()
    if glass.quiet then
      local sideActive = false
      for _, side in ipairs(glass.sides) do sideActive = sideActive or side.active end
      if not sideActive then return end
    end
    local car = ac.getCar(0)
    -- Blade lines and the glass mapping come from the scene transforms as they are drawn this frame; the field
    -- step at the next frame start uses these lines. Reading them at frame start was a frame behind the mesh.
    local rootM = glass.root:getWorldTransformationRaw()
    glass.rootM = rootM
    glass.anyActive = updateBlades(max(frameDt, 1e-4), rootM:inverse())
    local v = glass.pass.values
    v.gRidge0:set(values.gW0); v.gRidge1:set(values.gW1)
    v.gLibrain = snowRate == 0 and 1 or 0
    glass.pass.textures.txLibrain = lr.read
    glass.pass.textures.txLibrainNormal = lr.norm
    v.gRaw = glassRaw and 1 or 0
    v.gDebugDrops = glassRed and 1 or 0
    v.gTime = elapsed
    v.gSnowMode = snowRate > 0 and 1 or 0
    local fixedPane = snowRate == 0 and glass.coatingMesh ~= nil
    v.gPaneUV = fixedPane and 1 or 0
    glass.pass.mesh = fixedPane and glass.coatingMesh or glass.mesh
    if fixedPane then
      glass.coatingTransform:set(glass.mesh:getParent():getWorldTransformationRaw())
      glass.pass.transform = glass.coatingTransform
    else
      glass.pass.transform = 'original'
    end
    local size = render.getRenderTargetSize()
    v.gScreen:set(max(1, size.x), max(1, size.y))
    v.gRefract = 0
    if snowRate == 0 then
      local r = lr
      if not r.scene or r.scene:size().x ~= size.x or r.scene:size().y ~= size.y then
        if r.scene then r.scene:dispose() end
        if lr.smudgeScene then lr.smudgeScene:dispose() end
        r.scene = ui.ExtraCanvas(size, 1, render.TextureFormat.R16G16B16A16.Float):setName('M2L rain background')
        lr.smudgeScene = ui.ExtraCanvas(size,1,render.TextureFormat.R16G16B16A16.Float):setName('M2L refracted glass')
        r.scenePass = {async = true, cacheKey = 94, blendMode = render.BlendMode.Opaque,
          textures = {txSource = 'dynamic::hdr'}, shader = [[
            float4 main(PS_IN pin) {
              float3 c = txSource.SampleLevel(samLinearSimple, pin.Tex, 0).rgb;
              return float4(c, dot(c, c) > 1e-10 ? 1 : 0);
            }
          ]]}
      end
      -- Switch to an offscreen target for the copy, avoiding the old direct HDR read/write alias.
      if r.scene:updateSceneWithShader(r.scenePass) then
        v.gRefract = 1
      end
      glass.pass.textures.txSceneCopy = r.scene
    end
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
    if not glass.quiet then
      v.gLibrainBlur = 0
      render.mesh(glass.pass)
      if not glassRed and v.gLibrain > 0.5 and v.gRefract > 0.5
          and lr.smudgeScene:updateSceneWithShader(lr.scenePass) then
        -- Offscreen copies set opaque blending. Restore glass state before returning
        -- to the scene, including transparent dry pixels in the smudge pass.
        render.setBlendMode(render.BlendMode.AlphaBlend)
        render.setCullMode(render.CullMode.None)
        render.setDepthMode(render.DepthMode.ReadOnly)
        glass.pass.textures.txSceneCopy = lr.smudgeScene
        v.gLibrainBlur = 1
        render.mesh(glass.pass)
        v.gLibrainBlur = 0
        glass.pass.textures.txSceneCopy = lr.scene
      end
    end
    for _, side in ipairs(glass.sides) do
      if side.active and side.pass then
        local pv = side.pass.values
        pv.gLibrain = 0 -- Side snow never samples the front liquid resources.
        pv.gRaw = glassRaw and 1 or 0
        pv.gDebugDrops = v.gDebugDrops
        local fixedSide = snowRate == 0 and side.coatingMesh ~= nil
        pv.gPaneUV = fixedSide and 1 or 0
        side.pass.mesh = fixedSide and side.coatingMesh or side.mesh
        pv.gSnowMode, pv.gRefract = v.gSnowMode, v.gRefract
        pv.gScreen:set(v.gScreen)
        pv.gCameraPos:set(v.gCameraPos); pv.gCarPos:set(v.gCarPos)
        pv.gCarSide:set(v.gCarSide); pv.gCarUp:set(v.gCarUp); pv.gCarLook:set(v.gCarLook)
        pv.gColor:set(v.gColor); pv.gSnowColor:set(v.gSnowColor)
        side.pass.textures.txField = side.read
        side.pass.textures.txSceneCopy = lr.scene or false
        -- Coat the outer surface, 4 mm beyond the original pane, so the inner door/window trim occludes
        -- its edge. Reusing the inner glass position made clumps appear pasted onto the cabin side.
        local sm = side.drawTransform:set(side.parent:getWorldTransformationRaw())
        local offset = 0.004 * side.sign
        sm.row4.x = sm.row4.x + (m.row1.x * side.ty - m.row2.x * side.tx) * offset
        sm.row4.y = sm.row4.y + (m.row1.y * side.ty - m.row2.y * side.tx) * offset
        sm.row4.z = sm.row4.z + (m.row1.z * side.ty - m.row2.z * side.tx) * offset
        render.mesh(side.pass)
      end
    end
    if glassRed and snowRate == 0 then
      lr.diagnostic.values.gPanel:set(320,320*sw/xw)
      lr.diagnostic.textures.txDepth = lr.read
      render.fullscreenPass(lr.diagnostic)
    end
    lr.capture()
  end

  function glass.status()
    local b = glass.blades[1]
    return string.format('drops=%d snowEst=%.2f melt=%.3f air=%.1f impinge=%.1f quiet=%s blade=%s ridge=%.2e progress=%.2f',
      glass.rainCount or 0, snowOnGlass, glass.melt or 0, glass.air or 0, glass.impinge or 0, tostring(glass.quiet),
      b and b.ax and string.format('(%.2f,%.2f)-(%.2f,%.2f) active=%d', b.ax, b.as, b.bx, b.bs, b.active) or 'none',
      b and b.ridge or 0, ac.getCar(0).wiperProgress) .. string.format(' librainParticles drive=%.6f ambientGain=%.1f ticks=%d', lr.sim.values.gWind, lr.ambientGain, lr.tick) .. string.format(' snowDensity=%.2f landingsPerSecond=%.1f whiteRef=%s exposure=%s mult=%s', snowRate,
        values.gParams.w / max(values.gParams.x, 1e-6) * ((xw / 0.012) * (sw / 0.012)), tostring(sim.whiteReferencePoint), tostring(sim.cameraExposure), tostring(sim.exposureMultiplier))
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

