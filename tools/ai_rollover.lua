-- Included only in the temporary measurement script made by ai_race --rollover-ai.
local target = __TARGET__
local triggered, recovered, sampleAt = false, false, 0
local previousAngle, previousPosition
local function rollOpponent(dt, sim, elapsed)
  if sim.raceSessionType ~= ac.SessionType.Race or not physics.allowed() then return end
  local car = ac.getCar(target)
  if not car or not car.isAIControlled then return end
  if not triggered then
    -- Clear the grid before rolling; the separate parking script owns actual pit transports.
    if sim.timeToSessionStart > -2000 or car.speedKmh < 20 or car.isInPit or car.isRetired then return end
    triggered = elapsed
    physics.setCarVelocity(target, vec3(0, 0, 0))
    emit(string.format('M2L_ROLL,start,%.4f,%d', elapsed, target))
  end
  if car.isRetired or car.isInPit or (previousPosition and car.position:distance(previousPosition) > 10) then
    recovered = true
  end
  previousPosition = car.position:clone()
  if not recovered and elapsed - triggered < 25 and dt > 0 then
    local angle = math.atan2(car.side.y, car.up.y)
    local delta = angle - (previousAngle or angle)
    local rate = math.atan2(math.sin(delta), math.cos(delta)) / dt
    previousAngle = angle
    local errorAngle = math.atan2(math.sin(math.pi - angle), math.cos(math.pi - angle))
    -- A couple around the longitudinal axis aligns the roof with the road. Limit acceleration
    -- and damp roll speed so a light car cannot keep tumbling past the target orientation.
    local accel = math.clamp(16 * errorAngle - 8 * rate, -30, 30)
    local lever = car.aabbSize.x / 2
    -- addForce applies one 3 ms physics step per call. Scale the impulse to the render dt.
    local force = car.mass * lever * accel * dt * 333 / 2
    physics.addForce(target, vec3(lever, 0, 0), true, vec3(0, force, 0), true)
    physics.addForce(target, vec3(-lever, 0, 0), true, vec3(0, -force, 0), true)
  end
  if elapsed >= sampleAt then
    sampleAt = elapsed + 0.10
    local loads = 0
    for w = 0, 3 do if car.wheels[w].load > 0 then loads = loads + 1 end end
    emit(string.format('M2L_ROLL,state,%.4f,%d,%.3f,%d,%d,%d,%.1f,%.2f,%.2f,%.2f',
      elapsed, target, car.up.y, loads, car.isRetired and 1 or 0, car.isInPit and 1 or 0,
      car.speedKmh, car.position.x, car.position.y, car.position.z))
  end
end
