-- Track Debug (Map2Lap): position along the track's route, a mark key, and a drive recording.
-- The route comes from the track's data/map2lap_route.txt (written by generator.py: "anchor <lat> <lon>", then one
-- "<x> <z>" per line in AC coordinates; older builds: ac_export_route.txt). Output:
-- Documents/Assetto Corsa/map2lap_debug/<track>_<time>_marks.csv (marks) and ..._drive.csv (recording, 50 Hz).

local MARK_KEY = ui.KeyIndex.F10
local SAMPLE_S = 0.02            -- s between two recorded rows
local FLUSH_S = 2.0              -- s between two saves

local route, cum, anchor = nil, nil, nil
local lastIdx = 1
local recording = false
local rows, marks = {}, {}
local outDir = ac.getFolder(ac.FolderID.ACDocuments) .. '/map2lap_debug'
local stem = nil
local sinceSample, sinceFlush, clock = 0, 0, 0
local now = { s = nil, off = nil, lat = nil, lon = nil }

local function loadRoute()
  local txt = io.load(ac.getTrackDataFilename('map2lap_route.txt')) or io.load(ac.getTrackDataFilename('ac_export_route.txt'))
  if not txt then return false end
  route = {}
  for line in txt:gmatch('[^\r\n]+') do
    local la, lo = line:match('^anchor%s+(%S+)%s+(%S+)')
    if la then
      anchor = { lat = tonumber(la), lon = tonumber(lo) }
    else
      local x, z = line:match('^(%S+)%s+(%S+)$')
      if x then route[#route + 1] = { tonumber(x), tonumber(z) } end
    end
  end
  cum = { 0 }
  for i = 2, #route do
    local dx, dz = route[i][1] - route[i - 1][1], route[i][2] - route[i - 1][2]
    cum[i] = cum[i - 1] + math.sqrt(dx * dx + dz * dz)
  end
  return #route > 1
end

-- metres along the route and distance from it (nearest segment: first near the last one, else all)
local function project(x, z)
  local best, bi, bt = math.huge, 1, 0
  local function seg(i)
    local ax, az, bx, bz = route[i][1], route[i][2], route[i + 1][1], route[i + 1][2]
    local dx, dz = bx - ax, bz - az
    local l2 = dx * dx + dz * dz
    local t = 0
    if l2 > 0 then t = math.max(0, math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) end
    local px, pz = ax + dx * t, az + dz * t
    local d = (x - px) ^ 2 + (z - pz) ^ 2
    if d < best then best, bi, bt = d, i, t end
  end
  for i = math.max(1, lastIdx - 60), math.min(#route - 1, lastIdx + 60) do seg(i) end
  if best > 900 then for i = 1, #route - 1 do seg(i) end end
  lastIdx = bi
  return cum[bi] + bt * (cum[bi + 1] - cum[bi]), math.sqrt(best)
end

local function latlon(x, z)        -- (ENU: east = x, north = -z; accurate enough for a few km)
  if not anchor then return nil, nil end
  local lat = anchor.lat + (-z) / 111320
  local lon = anchor.lon + x / (111320 * math.cos(math.rad(anchor.lat)))
  return lat, lon
end

local function fileStem()
  if not stem then
    io.createDir(outDir)
    stem = outDir .. '/' .. ac.getTrackID() .. '_' .. os.date('%Y%m%d_%H%M%S')
  end
  return stem
end

local function saveMarks()
  io.save(fileStem() .. '_marks.csv', 'time_s,route_m,off_m,x,y,z,lat,lon,speed_kmh\n' .. table.concat(marks))
end

local function saveDrive()
  io.save(fileStem() .. '_drive.csv',
    'time_s,route_m,off_m,x,y,z,speed_kmh,acc_vert_g,acc_side_g,acc_long_g,susp_fl,susp_fr,susp_rl,susp_rr\n' ..
    table.concat(rows))
end

function script.update(dt)
  if route == nil and not loadRoute() then route = false end
  local car = ac.getCar(0)
  if not car then return end
  clock = clock + dt
  local p = car.position
  if route then now.s, now.off = project(p.x, p.z) end
  now.lat, now.lon = latlon(p.x, p.z)

  if ac.isKeyPressed(MARK_KEY) then
    marks[#marks + 1] = string.format('%.2f,%.1f,%.1f,%.2f,%.2f,%.2f,%.7f,%.7f,%.1f\n', clock, now.s or -1,
      now.off or -1, p.x, p.y, p.z, now.lat or 0, now.lon or 0, car.speedKmh)
    saveMarks()
  end

  if recording then
    sinceSample, sinceFlush = sinceSample + dt, sinceFlush + dt
    if sinceSample >= SAMPLE_S then
      sinceSample = 0
      local w = car.wheels
      local a = car.acceleration     -- (G: x sideways, y vertical, z along; separately: impact or bump)
      rows[#rows + 1] = string.format('%.3f,%.2f,%.2f,%.3f,%.3f,%.3f,%.1f,%.3f,%.3f,%.3f,%.4f,%.4f,%.4f,%.4f\n',
        clock, now.s or -1, now.off or -1, p.x, p.y, p.z, car.speedKmh, a.y, a.x, a.z,
        w[0].suspensionTravel, w[1].suspensionTravel, w[2].suspensionTravel, w[3].suspensionTravel)
    end
    if sinceFlush >= FLUSH_S then
      sinceFlush = 0
      saveDrive()
    end
  end
end

function windowMain(dt)
  local car = ac.getCar(0)
  if route == false then
    ui.textColored('No map2lap_route.txt for this track', rgbm(1, 0.5, 0.3, 1))
  elseif now.s then
    ui.text(string.format('Route: %.0f m   (%.1f m off the line)', now.s, now.off))
  end
  if car then
    local p = car.position
    ui.text(string.format('AC x %.1f  z %.1f  height %.1f', p.x, p.z, p.y))
    ui.text(string.format('Tile %d, %d', math.floor(p.x / 256), math.floor(-p.z / 256)))
    local a = car.acceleration
    ui.text(string.format('G vertical %+.2f   side %+.2f   long %+.2f', a.y, a.x, a.z))
  end
  if now.lat then ui.text(string.format('Lat/Lon %.6f, %.6f', now.lat, now.lon)) end
  ui.separator()
  ui.text(string.format('F10 = mark this spot   (%d marked)', #marks))
  if ui.button('Mark') and car then
    local p = car.position
    marks[#marks + 1] = string.format('%.2f,%.1f,%.1f,%.2f,%.2f,%.2f,%.7f,%.7f,%.1f\n', clock, now.s or -1,
      now.off or -1, p.x, p.y, p.z, now.lat or 0, now.lon or 0, car.speedKmh)
    saveMarks()
  end
  ui.sameLine()
  if ui.button(recording and 'Stop recording' or 'Start recording') then
    recording = not recording
    if not recording then saveDrive() end
  end
  if recording then ui.textColored(string.format('Recording ... %d rows', #rows), rgbm(1, 0.3, 0.3, 1)) end
  if stem then ui.text('Files: Documents/Assetto Corsa/map2lap_debug') end
end
