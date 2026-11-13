-- Map2Lap static WeatherFX controller. Uses CSP's native sky, clouds, fog and wind.
-- Additional fog blends toward CSP Fog without changing the selected precipitation type.
local weatherUtils = require('shared/sim/weather')
local function inputConditions()
  local c = ac.ConditionsSet()
  local config = ac.INIConfig.raceConfig()
  c.currentType = ac.getInputWeatherType()
  c.upcomingType = config:get('LIGHTING', '__MAP2LAP_FOG', false) and ac.WeatherType.Fog or c.currentType
  c.transition = c.upcomingType ~= c.currentType and 0.65 or 0
  c.temperatures = ac.getInputTemperatures()
  -- Read our explicit session values past CSP's normal 0..36 C input limit, as with wind below.
  c.temperatures.ambient = math.max(-30, math.min(50, config:get('TEMPERATURE', 'AMBIENT', c.temperatures.ambient)))
  c.temperatures.road = math.max(-30, math.min(80, config:get('TEMPERATURE', 'ROAD', c.temperatures.road)))
  c.wind = ac.getInputWind()
  -- CSP's native input uses the default 35 km/h limit. Set our session's requested
  -- km/h directly on the controller conditions, without changing global CSP tweaks.
  c.wind.speedFrom = math.max(0, math.min(100, config:get('WIND', 'SPEED_KMH_MIN', c.wind.speedFrom)))
  c.wind.speedTo = math.max(0, math.min(100, config:get('WIND', 'SPEED_KMH_MAX', c.wind.speedTo)))
  c.humidity = ac.getInputHumidity()
  c.pressure = ac.getInputPressure()
  c.trackState = ac.getInputTrackState()
  weatherUtils.setRainIntensity(c, true)
  -- Our fallback is visual only. When disabled, leave CSP's own rain and surface conditions intact.
  if config:get('LIGHTING', '__MAP2LAP_WEATHER_EFFECTS', true) then
    c.rainWetness, c.rainWater = 0, 0
  end
  return c
end
local conditions = inputConditions()
local overridden = false
ac.setConditionsSet2(conditions)
ac.log(string.format('Map2Lap weather type=%d upcoming=%d fogMix=%.2f wind=%.1f direction=%.0f',
  conditions.currentType, conditions.upcomingType, conditions.transition, conditions.wind.speedFrom, conditions.wind.direction))
function script.update(dt)
  -- Retain CSP Debug compatibility for development, using the controller's supported scope.
  if weatherUtils.debugAware(conditions, 1) then
    ac.setConditionsSet2(conditions)
    overridden = true
  elseif overridden then
    conditions = inputConditions()
    ac.setConditionsSet2(conditions)
    overridden = false
  end
end
