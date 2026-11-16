-- App-only CSP camera/screenshot API, appended temporarily to the owned Track Debug app.
-- rendering_preview.py injects local paths into the installed copy, never into shipped assets.
do
  local originalUpdate = script.update
  local folder = __FOLDER__
  local lastCommand, pendingShot = '', nil
  local age, shotAge, started = 0, 0, false
  function script.update(dt)
    if originalUpdate then originalUpdate(dt) end
    if ac.getTrackID() ~= __TRACK__ then return end
    if not started then
      ac.tryToStart(true)
      started = true
    end
    age = age + dt
    -- Session start can reset the camera after leaving the pits.
    if age < 3 then return end
    if not io.fileExists(folder .. 'ready.txt') then
      io.save(folder .. 'ready.txt', 'Camera ready; LCS=' .. tostring(ac.getSim().isLinearColorSpaceActive))
    end
    local command = io.load(folder .. 'camera.txt')
    if not command or command == '' then return end
    if command == 'quit' then ac.shutdownAssettoCorsa(); return end
    if command ~= lastCommand then
      local values = {}
      for word in command:gmatch('%S+') do
        if #values == 8 then break end
        values[#values + 1] = tonumber(word)
      end
      if #values ~= 8 then return end
      lastCommand, shotAge = command, 0
      pendingShot = command:match('shot=([%w_%-]+)')
      ac.setCurrentCamera(ac.CameraMode.Free)
      ac.setCameraPosition(vec3(values[1], values[2], values[3]))
      ac.setCameraDirection(vec3(values[4], values[5], values[6]), vec3(0, 1, 0))
      ac.setCameraFOV(values[7])
      ac.setCameraExposure(1)
      ac.setExposureMultiplier(values[8])
      ac.log('Rendering camera: ' .. command .. ' LCS=' .. tostring(ac.getSim().isLinearColorSpaceActive)
        .. ' filter=' .. tostring(ac.getPpFilter()))
    end
    shotAge = shotAge + dt
    if pendingShot and shotAge > 2 then
      local name = pendingShot
      pendingShot = nil
      ac.makeSimpleScreenshot(ac.ScreenshotFormat.PNG, function(err, data)
        if err then ac.log('Rendering screenshot error: ' .. err)
        else io.save(folder .. name .. '.png', data); ac.log('Rendering saved: ' .. name) end
      end)
    end
  end
end
