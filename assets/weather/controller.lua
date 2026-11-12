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
  c.wind = ac.getInputWind()
  c.humidity = ac.getInputHumidity()
  c.pressure = ac.getInputPressure()
  c.trackState = ac.getInputTrackState()
  weatherUtils.setRainIntensity(c, true)
  -- Visual precipitation only: do not introduce water or wetness into the driving surface.
  c.rainWetness, c.rainWater = 0, 0
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
