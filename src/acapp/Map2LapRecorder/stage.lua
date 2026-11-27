-- Capture the wheel contact centre through two finite timing gates, in driving order.
return function(prefix, report)
  local gates = {}
  for line in io.load(prefix .. '.gates'):gmatch('[^\r\n]+') do
    local v = {}
    for n in line:gmatch('%S+') do v[#v+1] = tonumber(n) end
    gates[#gates+1] = v
  end
  local previous, last, samples
  local function crossed(a, b, left, right)
    local dx, dz = right[1]-left[1], right[3]-left[3]
    local forward = (b.x-a.x)*left[4] + (b.z-a.z)*left[6]
    if forward <= 0 then return false end
    local t = ((left[1]-a.x)*left[4] + (left[3]-a.z)*left[6])/forward
    if t < 0 or t > 1 then return false end
    local p = a + (b-a)*t
    local u = ((p.x-left[1])*dx + (p.z-left[3])*dz)/(dx*dx + dz*dz)
    -- KN5 timing markers sit 0.15 m above the floor. Match Map2Lap's 2.5 m road-level tolerance.
    return u >= 0 and u <= 1 and math.abs(p.y-(left[2]+u*(right[2]-left[2])-.15)) < 2.5
  end
  local function row(p, car)
    return string.format('%.5f %.5f %.5f %.4f %.4f %.4f %.4f', p.x,p.y,p.z,car.speedKmh/3.6,car.gas,car.brake,car.acceleration.x)
  end
  return function(car, dt)
    local p = (car.wheels[0].contactPoint + car.wheels[1].contactPoint
             + car.wheels[2].contactPoint + car.wheels[3].contactPoint)*.25
    if previous then
      -- A pit reset can jump across both gates in one frame. Allow one car length
      -- of suspension or frame jitter in addition to travel at the reported speed.
      if p:distance(previous) > 5 + dt*car.speedKmh/3.6*2 then
        samples = nil
      elseif crossed(previous,p,gates[1],gates[2]) then
        samples = {row(previous,car), row(p,car)}
        last = p
        report('Start A crossed. Drive through finish B.')
      elseif samples then
        if crossed(previous,p,gates[3],gates[4]) then
          samples[#samples+1] = row(previous,car)
          samples[#samples+1] = row(p,car)
          if io.save(prefix .. '.drive', table.concat(samples,'\n'), true) then
            report('Finish B crossed. Exit practice to preview the recording.')
          else
            report('Could not save this drive. Check write access to the Map2LapRecorder app folder.')
          end
          return true
        elseif p:distance(last) >= 1.5 then  -- Same spacing as the open AC racing spline.
          samples[#samples+1] = row(p,car)
          last = p
        end
      end
    end
    previous = p
    return false
  end
end
