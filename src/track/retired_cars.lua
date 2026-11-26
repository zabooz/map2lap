-- AC sends retired opponents to their pits on the grid. The optional Map2Lap
-- parking model supplies a separate, off-road TIME_ATTACK spawn for offline AI.
local hidden, parked = {}, {}
local hasParking, pointToPoint
local returned = {}
ac.onSessionStart(function ()
  if physics.allowed() then
    for i in pairs(returned) do
      if i < ac.getSim().carsCount then physics.setAINoInput(i, false) end
    end
  end
  returned = {}
end)

local function returnFinisher(i, car)
  if returned[i] or not car.isRaceFinished or car.lapCount < 1 then return end
  if pointToPoint == nil then pointToPoint = ac.findNodes('AC_AB_FINISH_L'):size() > 0 end
  if pointToPoint and physics.allowed() then
    returned[i] = true
    physics.teleportCarTo(i, ac.SpawnSet.Pits)
    physics.setAINoInput(i, true)
  end
end

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
        if race and car.isAIControlled then returnFinisher(i, car) end
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
