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
local COUNT = 4096
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
      float2 t = frac(pin.Tex);
      float id = floor(pin.Tex.x);
      float alpha = floor(pin.Tex.y) / 100;
      float2 q = t * 2 - 1;
      float h = hash(id);
      float shape;
      if (gSnow < 0.5) {
        // A streak: soft across its width, fading at both shutter endpoints, a touch brighter near the drop.
        float across = exp(-4.5 * q.x * q.x);
        float along = 1 - smoothstep(0.45, 1, abs(q.y));
        shape = across * along * (0.85 + 0.3 * saturate(-q.y));
      } else {
        // An irregular clump with a soft core that turns at its own rate.
        float a = gTime * (0.5 + h) + h * 6.283;
        float c = cos(a), s = sin(a);
        float2 f = float2(c * q.x - s * q.y, s * q.x + c * q.y);
        float grain = sin(f.x * 11 + h * 7) * sin(f.y * 9 - h * 5);
        float r = length(f * float2(1, 1.15)) + grain * 0.09;
        shape = exp(-3 * dot(f, f)) * (1 - smoothstep(0.35, 1, r));
      }
      return pin.ApplyFog(float4(gColor, shape * alpha));
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

-- Rewrites the vertex buffer for this frame's camera, wind and time.
local function build()
  local snow = mode == 'snow'
  local camera, look = sim.cameraPosition, sim.cameraLook
  local cx, cy, cz = camera.x, camera.y, camera.z
  local lx, ly, lz = look.x, look.y, look.z
  local upv, sidev = sim.cameraUp, sim.cameraSide
  local count = floor(COUNT * density * (snow and 0.6 or 1))
  if count < activeCount then hide(count, activeCount) end
  activeCount = count
  local targetHeight = max(1, render.getRenderTargetSize().y)
  local metrePerPixel = 2 * math.tan(sim.cameraFOV * math.pi / 360) / targetHeight
  local wx, wz = wind.x, wind.z
  local vcx, vcy, vcz = cameraVelocity.x, cameraVelocity.y, cameraVelocity.z
  drawn = 0
  for i = 0, count - 1 do
    local w = weight[i]
    local speed = snow and (0.45 + w * 0.85) or (5.5 + w * 3.5)
    local flutter = snow and sin(elapsed * (0.8 + w) + phase[i]) or 0
    -- World-phase wrapping: moving the camera reveals particles without dragging them along.
    local x = (px[i] + driftX + flutter * 0.18 - cx + HALF) % BOX - HALF
    local y = (py[i] - elapsed * speed - cy + HALFY) % BOXY - HALFY
    local z = (pz[i] + driftZ + (snow and cos(elapsed * 0.65 + phase[i]) * 0.15 or 0) - cz + HALF) % BOX - HALF
    local d2 = x * x + y * y + z * z
    local b = i * 4
    if d2 > 2 and d2 < 225 and x * lx + y * ly + z * lz > -0.3 then
      local distance = sqrt(d2)
      local pixelMetres = metrePerPixel * distance
      local edge = min(1, (15 - distance) / 4) * min(1, (distance - 1.4) / 1.2)
      local hw, hh, ux, uy, uz, alpha
      if snow then
        -- Mostly millimetre flakes with a few larger clumps; the soft core needs 3 px, 8 px caps nearby discs.
        local width = (0.008 + w * w * w * 0.02) * size[i]
        local shown = min(pixelMetres * 8, max(width, pixelMetres * 3))
        hw, hh = shown * 0.5, shown * aspect[i] * 0.5
        alpha = (0.55 + w * 0.25) * edge
        local sx, sy, sz = sidev.x * hw, sidev.y * hw, sidev.z * hw
        local ex, ey, ez = upv.x * hh, upv.y * hh, upv.z * hh
        local v = vertices.raw[b]
        v.pos.x, v.pos.y, v.pos.z = cx + x - sx - ex, cy + y - sy - ey, cz + z - sz - ez
        v = vertices.raw[b + 1]
        v.pos.x, v.pos.y, v.pos.z = cx + x - sx + ex, cy + y - sy + ey, cz + z - sz + ez
        v = vertices.raw[b + 2]
        v.pos.x, v.pos.y, v.pos.z = cx + x + sx + ex, cy + y + sy + ey, cz + z + sz + ez
        v = vertices.raw[b + 3]
        v.pos.x, v.pos.y, v.pos.z = cx + x + sx - ex, cy + y + sy - ey, cz + z + sz - ez
      else
        -- The streak follows the apparent velocity: fall plus wind, minus the camera's own motion.
        local vx, vy, vz = wx - vcx, -speed - vcy, wz - vcz
        local relative = sqrt(vx * vx + vy * vy + vz * vz)
        ux, uy, uz = -vx / relative, -vy / relative, -vz / relative
        -- 16 ms of shutter smear along the apparent velocity.
        hh = min(0.6, max(0.05, relative * 0.016)) * 0.5
        local width = (0.0025 + w * 0.003) * size[i]
        local shown = max(width, pixelMetres * 1.3)
        hw = shown * 0.5
        -- A streak thinner than a pixel is drawn a pixel wide but fainter, so no uniform white bars appear.
        alpha = (0.3 + w * 0.25) * edge * max(0.35, sqrt(width / shown))
        -- The side vector lies across the streak and across the view direction.
        local sx, sy, sz = uy * z - uz * y, uz * x - ux * z, ux * y - uy * x
        local sl = sqrt(sx * sx + sy * sy + sz * sz)
        if sl < 1e-6 then sx, sy, sz, sl = 1, 0, 0, 1 end
        sx, sy, sz = sx / sl * hw, sy / sl * hw, sz / sl * hw
        local ex, ey, ez = ux * hh, uy * hh, uz * hh
        local v = vertices.raw[b]
        v.pos.x, v.pos.y, v.pos.z = cx + x - sx - ex, cy + y - sy - ey, cz + z - sz - ez
        v = vertices.raw[b + 1]
        v.pos.x, v.pos.y, v.pos.z = cx + x - sx + ex, cy + y - sy + ey, cz + z - sz + ez
        v = vertices.raw[b + 2]
        v.pos.x, v.pos.y, v.pos.z = cx + x + sx + ex, cy + y + sy + ey, cz + z + sz + ez
        v = vertices.raw[b + 3]
        v.pos.x, v.pos.y, v.pos.z = cx + x + sx - ex, cy + y + sy - ey, cz + z + sz - ez
      end
      local aq = floor(min(99, max(0, alpha * 100)))
      vertices.raw[b].uv.y = aq
      vertices.raw[b + 1].uv.y = aq + 0.998
      vertices.raw[b + 2].uv.y = aq + 0.998
      vertices.raw[b + 3].uv.y = aq
      drawn = drawn + 1
    else
      local v = vertices.raw[b]
      v.pos.x, v.pos.y, v.pos.z = cx, cy - 10000, cz
      v = vertices.raw[b + 1]
      v.pos.x, v.pos.y, v.pos.z = cx, cy - 10000, cz
      v = vertices.raw[b + 2]
      v.pos.x, v.pos.y, v.pos.z = cx, cy - 10000, cz
      v = vertices.raw[b + 3]
      v.pos.x, v.pos.y, v.pos.z = cx, cy - 10000, cz
    end
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
  polling, heartbeat = polling + dt, heartbeat + dt
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
    heartbeat = 0
    ac.log(string.format('M2L_WEATHER frames=%d drawn=%d build_ms=%.3f upload_ms=%.3f fps=%.1f camera=%s',
      frames, drawn, luaMs, submitMs, sim.fps, tostring(sim.cameraPosition)))
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
  -- Scene-linear radiance, not displayed RGB: normalise the overcast level before tinting pale precipitation.
  local illumination = (sky.r + sky.g + sky.b + horizon.r + horizon.g + horizon.b) / 6
  local brightness = min(1, max(0.04, sqrt(max(0, illumination)) * 2.5))
  local color = batch.values.gColor
  color.r, color.g, color.b = 0.82 * brightness, 0.86 * brightness, 0.9 * brightness
  render.mesh(batch)
  frames = frames + 1
end

ac.log('M2L_WEATHER look=v4: one batched mesh for every particle')
