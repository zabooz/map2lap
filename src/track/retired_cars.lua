-- AC parks retired opponents in their pits, which share the grid on the road.
local hidden = {}

function script.update(dt)
  for i = 1, ac.getSim().carsCount - 1 do
    local car = ac.getCar(i)
    if car then
      local retired = car.isAIControlled and car.isRetired
      if retired ~= (hidden[i] == true) then
        physics.disableCarCollisions(i, retired)
        ac.findNodes("carRoot:" .. i):setVisible(not retired)
        hidden[i] = retired
      end
    end
  end
end
