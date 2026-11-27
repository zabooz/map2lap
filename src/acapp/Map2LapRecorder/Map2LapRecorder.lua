-- The Editor arms one Practice launch. A normal drive never starts the recorder.
local race = ac.INIConfig.raceConfig()
local token = race:get('RACE', '__MAP2LAP_RECORDING', '')
local armed = __dirname .. '/armed'
if token == '' or io.load(armed) ~= token or ac.getSim().isOnlineRace or ac.getSim().isReplayActive
    or ac.getTrackID() ~= race:get('RACE', 'TRACK', '') or (ac.getTrackLayout() or '') ~= race:get('RACE', 'CONFIG_TRACK', '') then return end
io.save(armed, '')
local started, finished, previous = false, false, nil
local crossings, entered = 0, false
local function report(message)
  ac.log('Map2Lap recorder: ' .. message)
  ui.toast(ui.Icons.Flag, message)
end
function script.update(dt)
  local car = ac.getCar(0)
  if finished then return end
  if ac.getSim().isInMainMenu then
    if not entered and ac.tryToStart then entered = ac.tryToStart(true) end
    return
  end
  entered = true
  if not car then return end
  if not ac.isAISplineRecorderPresent or not ac.isAISplineRecorderPresent() then
    finished = true
    report('Open AI on the right and click Start recording before crossing the line.')
    return
  end
  if not started then
    ac.startAISplineRecorder(false)
    started = ac.isAISplineRecorderActive()
    if started then report('Recorder armed. Cross start/finish, then drive one complete lap.') end
  end
  if not started then return end
  -- Count forward crossings only. Starting on the grid can put the car just after the line.
  if previous and previous > 0.9 and car.splinePosition < 0.1 then crossings = crossings + 1 end
  previous = car.splinePosition
  if crossings >= 2 then
    finished = true
    -- AC keeps the completed fast lap and writes it when leaving practice.
    -- Calling stopAISplineRecorder(true) here exports the beginning of the next lap.
    report('Lap complete. Exit practice to preview it in Map2Lap.')
  end
end
