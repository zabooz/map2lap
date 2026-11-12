-- Temporary Heiligenblut proof: ordinary CSP 0.2.11 drawing, independent of RainFX.
local root = ac.getFolder(ac.FolderID.CurrentTrack) .. '/extension/'
local sim = ac.getSim()
local particles = {}
local elapsed, polling, heartbeat = 0, 0, 0
local mode = 'off'
local density = 1
local previousWeather = nil
local lastFileMode = (io.load(root .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+')
-- RainFX is absent in this proof, so rainIntensity stays zero even for a rainy weather type.
-- Use the selected weather type for this visual fallback instead.
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
local frames, drawn, cpu = 0, 0, 0
local held = false
local wind = vec3()
local cameraVelocity = vec3()
local driftX, driftZ = 0, 0
local function notify()
  local weatherType = ac.getConditionsSet().currentType
  ac.setMessage(string.format('Map2Lap: %s | weather type %d | wind %.0f km/h', mode, weatherType, sim.windSpeedKmh),
    'Follows CSP weather | Ctrl+Alt+W: weather controls | R/S/0: temporary particle test (with Ctrl+Alt)', nil, 8)
end
local random = 173
local function rand()
  random = random * 16807 % 2147483647
  return random / 2147483647
end
for i = 1, 1100 do
  particles[i] = {x = rand() * 28, y = rand() * 14, z = rand() * 28,
    size = 0.65 + rand() * 0.7, phase = rand() * 6.283, weight = rand(), aspect = 0.6 + rand() * 0.7}
end
local quad = {
  async = true,
  pos = vec3(), width = 0.004, height = 0.1, up = vec3(0, 1, 0),
  values = {gSnow = 0, gAlpha = 0.2, gPhase = 0, gSoftness = 0, gColor = rgb(0.6, 0.65, 0.7)},
  shader = [[
    float4 main(PS_IN pin) {
      float2 q = pin.Tex * 2 - 1;
      // A tapered translucent streak, soft across its width and both shutter endpoints.
      float taper = lerp(0.6, 1, pin.Tex.y);
      float rain = exp(-5 * q.x * q.x / taper) * (1 - smoothstep(0.3, 1, abs(q.y)));
      // Small irregular clumps with a soft core; each flake turns and tumbles independently.
      float c = cos(gPhase), s = sin(gPhase);
      float2 f = float2(c*q.x-s*q.y, s*q.x+c*q.y);
      float grain = sin(f.x*11+gPhase)*sin(f.y*9-gPhase);
      float radius = length(f*float2(1, 1.15)) + grain*0.09;
      float snow = exp(-lerp(2.1, 4.5, gSoftness)*dot(f,f)) * (1-smoothstep(0.35, 1, radius));
      float alpha = lerp(rain, snow, gSnow) * gAlpha;
      return pin.ApplyFog(float4(gColor, alpha));
    }
  ]]
}

local function setMode(nextMode)
  if nextMode == 'auto' then previousWeather = nil; return end
  -- Track scripts are isolated from global weather control. The proof uses CSP's own controls.
  if nextMode == 'fog' or nextMode == 'wind' or nextMode == 'direction' then
    ac.setAppOpen('CspDebug'); notify(); return
  end
  if nextMode ~= 'off' and nextMode ~= 'rain' and nextMode ~= 'snow' then return end
  if nextMode == mode then return end
  mode = nextMode
  ac.log('M2L_WEATHER mode=' .. mode .. ' CSP=' .. ac.getPatchVersion() .. ' build=' .. ac.getPatchVersionCode())
  notify()
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
  cameraVelocity:set(sim.cameraPositionDelta):scale(1 / math.max(dt, 0.001))
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
    local nextMode = (io.load(root .. 'map2lap_weather_probe_mode.txt') or ''):match('%a+')
    if nextMode ~= lastFileMode then
      lastFileMode = nextMode
      setMode(nextMode)
    end
  end
  if heartbeat > 5 then
    heartbeat = 0
    ac.log(string.format('M2L_WEATHER frames=%d drawn=%d lua_ms=%.3f camera=%s', frames, drawn, cpu * 1000, tostring(sim.cameraPosition)))
    ac.log(string.format('M2L_WIND actualKmh=%.2f vectorMs=%s type=%s', sim.windSpeedKmh, tostring(wind), tostring(ac.getConditionsSet().currentType)))
    ac.log(string.format('M2L_VISIBILITY sky=%s horizon=%s sun=%s color=%s fov=%.2f width=%.4f height=%.4f alpha=%.3f',
      tostring(sim.skyColor), tostring(sim.horizonColor), tostring(sim.lightColor), tostring(quad.values.gColor),
      sim.cameraFOV, quad.width, quad.height, quad.values.gAlpha))
  end
end

function script.draw3D()
  if mode == 'off' then return end
  local start = os.clock()
  local snow = mode == 'snow'
  local camera, look = sim.cameraPosition, sim.cameraLook
  render.setBlendMode(render.BlendMode.AlphaBlend)
  render.setCullMode(render.CullMode.None)
  render.setDepthMode(render.DepthMode.ReadOnly)
  quad.values.gSnow = snow and 1 or 0
  local count = math.floor((snow and 700 or 1100) * density)
  local sky, horizon, light = sim.skyColor, sim.horizonColor, sim.lightColor
  -- These are scene-linear radiance values, not displayed RGB. Normalise their level before tinting
  -- pale precipitation: raw overcast radiance (0.04, 0.08, 0.14 here) made subpixel flakes disappear.
  local illumination = (sky.r+sky.g+sky.b+horizon.r+horizon.g+horizon.b)/6
  local brightness = math.min(1, math.max(0.04, math.sqrt(math.max(0, illumination))*2.5))
  local color = quad.values.gColor
  color.r, color.g, color.b = 0.82*brightness, 0.86*brightness, 0.9*brightness
  local targetHeight = math.max(1, render.getRenderTargetSize().y)
  local metrePerPixelAtUnitDistance = 2*math.tan(sim.cameraFOV*math.pi/360)/targetHeight
  drawn = 0
  for i = 1, count do
    local p = particles[i]
    local speed = snow and (0.45 + p.weight*0.85) or (5.5 + p.weight*3.5)
    local flutter = snow and math.sin(elapsed*(0.8+p.weight)+p.phase) or 0
    -- World-phase wrapping: moving the camera reveals particles without dragging them with it.
    local x = (p.x + driftX + flutter*0.18 - camera.x + 14) % 28 - 14
    local y = (p.y - elapsed * speed - camera.y + 7) % 14 - 7
    local z = (p.z + driftZ + (snow and math.cos(elapsed*0.65+p.phase)*0.15 or 0) - camera.z + 14) % 28 - 14
    local distance2 = x*x + y*y + z*z
    if distance2 > 6.25 and distance2 < 225 and x*look.x + y*look.y + z*look.z > 0 then
      quad.pos:set(camera.x + x, camera.y + y, camera.z + z)
      local distance = math.sqrt(distance2)
      local pixelMetres = metrePerPixelAtUnitDistance * distance
      local edge = math.min(1, (15-distance)/4) * math.min(1, (distance-2.5)/1.5)
      if snow then
        -- Mostly millimetre flakes, with a few larger clumps; no large solid discs nearby.
        quad.width = (0.008 + p.weight^3*0.02) * p.size
        -- The soft sprite core is smaller than its card: 4 px cards preserve a visible flake core
        -- under MSAA, while a 7 px ceiling avoids the large nearby discs of the first proof.
        quad.width = math.min(pixelMetres*7, math.max(quad.width, pixelMetres*4))
        quad.height = quad.width * p.aspect
        quad.up:set(0, 1, 0)
        quad.values.gPhase = p.phase + elapsed*(0.45+p.weight)
        quad.values.gSoftness = math.max(0, 1-distance/6)
        quad.values.gAlpha = (0.55+p.weight*0.25) * edge
      else
        local vx, vy, vz = wind.x-cameraVelocity.x, -speed-cameraVelocity.y, wind.z-cameraVelocity.z
        local relativeSpeed = math.sqrt(vx*vx+vy*vy+vz*vz)
        quad.up:set(-vx, -vy, -vz):normalize()
        quad.width = (0.0025 + p.weight*0.003) * p.size
        quad.width = math.min(pixelMetres*2.5, math.max(quad.width, pixelMetres*1.5))
        -- An 8 ms shutter smear follows the apparent velocity, including camera movement.
        quad.height = math.min(0.32, math.max(0.045, relativeSpeed*0.008))
        quad.values.gAlpha = (0.25+p.weight*0.2) * edge
      end
      if render.shaderedQuad(quad) then drawn = drawn + 1 end
    end
  end
  frames = frames + 1
  cpu = os.clock() - start
end

ac.log('M2L_WEATHER look=v3: visible filtered sprite cores and normalised sky lighting')
