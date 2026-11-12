-- Map2Lap precipitation on public CSP 0.2.11: own rain and snow, independent of RainFX.
-- v4: one batched mesh. All particles live in one vertex buffer that Lua rewrites each frame
-- and one render.mesh call draws, instead of one render.shaderedQuad call per particle.
local folder = ac.getFolder(ac.FolderID.CurrentTrack) .. '/extension/'
local sim = ac.getSim()
local elapsed, polling, heartbeat = 0, 0, 0
local mode = 'off'
local density = 1
local previousWeather = nil
local lastFileMode = (io.load(folder .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+')
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
local beginCount, shelteredCount, shelterMs = 0, 0, 0
local held = false
local wind = vec3()
local cameraVelocity = vec3()
local driftX, driftZ = 0, 0

local function notify()
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
      // U: particle id + corner. V: softness tenths in the hundreds, alpha percent below, corner in the fraction.
      float2 t = frac(pin.Tex);
      float id = floor(pin.Tex.x);
      float packed = floor(pin.Tex.y);
      float soft = floor(packed / 100) / 9;
      float alpha = fmod(packed, 100) / 100;
      float2 q = t * 2 - 1;
      float h = hash(id);
      float shape;
      if (gSnow < 0.5) {
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
  ac.log('M2L_WEATHER mode=' .. mode .. ' CSP=' .. ac.getPatchVersion() .. ' build=' .. ac.getPatchVersionCode())
  notify()
end

-- Shelter: a 7 x 7 grid of 4 m columns around the camera. Two upward rays per frame refresh one column each,
-- so the whole box is rechecked about six times a second. A particle below a column's roof is not drawn:
-- rain stops under a bridge or in a tunnel instead of falling through the ceiling. Cars are ignored.
local GRID, CELL = 7, 4
local floor, max = math.floor, math.max
local roofIx, roofIz, roofY = {}, {}, {}
for i = 0, GRID * GRID - 1 do roofIx[i], roofIz[i], roofY[i] = nil, nil, -1 end
local roofCursor, trackCursor, trackPhase = 0, 0, 0
local rayOrigin, rayUp = vec3(), vec3(0, 1, 0)
-- Physics meshes (collidable road, bridge decks, tunnel linings) answer in about 0.01 ms, the full track mesh
-- in about 0.5 ms (measured on Heiligenblut). So every frame two columns ask the physics meshes, and every
-- fourth frame one column asks the track mesh as well, which also finds non-collidable roofs and tree crowns.
local function castRoof(ix, iz, cy, method)
  -- From a little below eye level, so a tunnel ceiling or bridge deck above the road is found.
  rayOrigin:set((ix + 0.5) * CELL, cy - 1, (iz + 0.5) * CELL)
  local ray = render.createRay(rayOrigin, rayUp, 60)
  local hit = method == 'track' and ray:track(0) or ray:physics()
  return hit > 0 and cy - 1 + hit or -1e9
end
local function updateShelter(cx, cy, cz)
  local baseX, baseZ = floor(cx / CELL) - 3, floor(cz / CELL) - 3
  for _ = 1, 2 do
    local cell = roofCursor
    roofCursor = (roofCursor + 1) % (GRID * GRID)
    local ix, iz = baseX + cell % GRID, baseZ + floor(cell / GRID)
    local slot = (ix % GRID) * GRID + iz % GRID
    local roof = castRoof(ix, iz, cy, 'physics')
    -- A fresh column forgets the old track answer; a known column keeps the higher of the two roofs.
    if roofIx[slot] ~= ix or roofIz[slot] ~= iz then roofIx[slot], roofIz[slot], roofY[slot] = ix, iz, roof
    else roofY[slot] = max(roofY[slot], roof) end
  end
  trackPhase = (trackPhase + 1) % 4
  if trackPhase == 0 then
    local cell = trackCursor
    trackCursor = (trackCursor + 1) % (GRID * GRID)
    local ix, iz = baseX + cell % GRID, baseZ + floor(cell / GRID)
    local slot = (ix % GRID) * GRID + iz % GRID
    if roofIx[slot] == ix and roofIz[slot] == iz then
      roofY[slot] = max(roofY[slot], castRoof(ix, iz, cy, 'track'))
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

local sqrt, min, max, floor, sin, cos = math.sqrt, math.min, math.max, math.floor, math.sin, math.cos
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
      local relative = sqrt(vx * vx + vy * vy + vz * vz)
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

-- Rewrites the vertex buffer for this frame's camera, wind and time.
local function build()
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
  end
end

function script.frameBegin(dt, gameDT)
  local weatherType = ac.getConditionsSet().currentType
  if weatherType ~= previousWeather then
    previousWeather = weatherType
    local spec = nativeParticles[weatherType]
    density = spec and spec[2] or 1
    setMode(spec and spec[1] or 'off')
    ac.log(string.format('M2L_WEATHER automatic type=%d mode=%s density=%.2f', weatherType, mode, density))
  end
  elapsed = elapsed + gameDT
  ac.getWindVelocityTo(wind)
  cameraVelocity:set(sim.cameraPositionDelta):scale(1 / max(dt, 0.001))
  driftX, driftZ = driftX + wind.x * gameDT, driftZ + wind.z * gameDT
  polling, heartbeat, beginCount = polling + dt, heartbeat + dt, beginCount + 1
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
  if mode ~= 'off' and mesh then
    local start = os.preciseClock()
    build()
    local built = os.preciseClock()
    mesh:alterVertices(vertices)
    luaMs, submitMs = (built - start) * 1000, (os.preciseClock() - built) * 1000
  end
  if heartbeat > 5 then
    -- avg_fps is frames per real second over the whole heartbeat, the number for cost comparisons.
    ac.log(string.format('M2L_WEATHER mode=%s frames=%d drawn=%d sheltered=%d build_ms=%.3f rays_ms=%.3f upload_ms=%.3f avg_fps=%.1f camera=%s',
      mode, frames, drawn, shelteredCount, luaMs, shelterMs, submitMs, beginCount / heartbeat, tostring(sim.cameraPosition)))
    heartbeat, beginCount = 0, 0
    -- Diagnostic: cost of one upward ray per method, and the roof grid relative to the camera.
    local c = sim.cameraPosition
    rayOrigin:set(c.x, c.y - 1, c.z)
    local t0 = os.preciseClock()
    local a = render.createRay(rayOrigin, rayUp, 60):track(0)
    local t1 = os.preciseClock()
    local b = render.createRay(rayOrigin, rayUp, 60):track(1)
    local t2 = os.preciseClock()
    local p = render.createRay(rayOrigin, rayUp, 60):physics()
    local t3 = os.preciseClock()
    local roofs = {}
    for slot = 0, GRID * GRID - 1 do
      if roofY[slot] > -1e8 then roofs[#roofs + 1] = string.format('%d,%d:%+.0f', roofIx[slot] - floor(c.x / CELL), roofIz[slot] - floor(c.z / CELL), roofY[slot] - c.y) end
    end
    ac.log(string.format('M2L_SHELTER track0=%.3fms(%.1f) track1=%.3fms(%.1f) physics=%.3fms(%.1f) roofs=%d [%s]',
      (t1 - t0) * 1000, a, (t2 - t1) * 1000, b, (t3 - t2) * 1000, p, #roofs, table.concat(roofs, ' ')))
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
  render.mesh(batch)
  frames = frames + 1
end

ac.log('M2L_WEATHER look=v4: one batched mesh for every particle')
