-- AC sends retired opponents to their pits on the grid. The optional Map2Lap
-- parking model supplies a separate, off-road TIME_ATTACK spawn for offline AI.
local hidden, parked = {}, {}
local hasParking
function script.update(dt)
  local sim = ac.getSim()
  local race = sim.raceSessionType == ac.SessionType.Race and not sim.isOnlineRace and not sim.isReplayActive
  for i = 1, sim.carsCount - 1 do
    local car = ac.getCar(i)
    if car then
      local retired = car.isAIControlled and car.isRetired
      if retired ~= (hidden[i] == true) then
        physics.disableCarCollisions(i, retired)
        ac.findNodes("carRoot:" .. i):setVisible(not retired)
        hidden[i] = retired
      end
      if not retired then
        parked[i] = nil
      elseif race and car.isInPit and not car.isRaceFinished and not parked[i] and physics.allowed() then
        if hasParking == nil then hasParking = ac.findNodes("M2L_DNF_PARKING"):size() == 1 end
        if hasParking then
          physics.teleportCarTo(i, 'TIME_ATTACK')
          parked[i] = true
        end
      end
    end
  end
end
