-- Track Debug (Map2Lap): position along the track's route, a mark key, and a drive recording.
-- The route comes from the track's data/map2lap_route.txt (written by generator.py: "anchor <lat> <lon>", then one
-- "<x> <z>" per line in AC coordinates; older builds: ac_export_route.txt), the build's versions from data/map2lap.json.
-- Output, one folder per session: Documents/Assetto Corsa/map2lap_debug/<track>_<time>/
--   info.txt         track, when and with which Map2Lap it was built, its track code and map data, CSP and app version
--   map2lap.json, map2lap_route.txt   the track's own (its settings, the route as built): tools/from_debug.py builds
--                    the same track from the folder
--   marks.csv        one row per mark (the mark key, F10 by default, or "Mark")
--   mark_NN.csv      the drive around mark NN: the BEFORE_S before it (always recorded in the background) and AFTER_S after
--   mark_NN.jpg      a screenshot taken with the mark (the app window shows the mark's number and the versions)
--   drive.csv        "Start recording" until "Stop recording", 50 Hz

-- the mark key: F10 until the window's key button binds another one (a wheel button too; CSP keeps it in controls.ini)
local markKey = ac.ControlButton('map2lap/Track Debug mark', { keyboard = { key = ui.KeyIndex.F10 } })
local SAMPLE_S = 0.02            -- s between two recorded rows
local FLUSH_S = 2.0              -- s between two saves of drive.csv
local BEFORE_S = 15.0            -- s of drive before a mark kept with it
local AFTER_S = 5.0              -- s of drive after a mark kept with it
local APP_VERSION = '1.3'
local DRIVE_HEAD = 'time_s,route_m,off_m,x,y,z,speed_kmh,acc_vert_g,acc_side_g,acc_long_g,susp_fl,susp_fr,susp_rl,susp_rr\n'
local MARKS_HEAD = 'mark,time_s,route_m,off_m,x,y,z,lat,lon,speed_kmh\n'

local route, cum, anchor = nil, nil, nil
local build = nil                -- {version, track_version, built, code, overture, osm} of data/map2lap.json, or false
local lastIdx = 1
local recording = false
local unsaved, recorded = {}, 0  -- rows of drive.csv not yet written, rows written
local ring, ringAt, RING = {}, 0, math.ceil(BEFORE_S / SAMPLE_S) + 1   -- {time, row}: the last BEFORE_S
local marks, open = {}, {}       -- marks.csv rows; marks still collecting their AFTER_S
local lastMark = nil             -- {k, s}: the window shows it (and so the screenshot)
local shot, shotErr = nil, nil   -- mark whose screenshot is taken next frame (after the window shows its number)
local session = nil
local outDir = ac.getFolder(ac.FolderID.ACDocuments) .. '/map2lap_debug'
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

local function loadBuild()
  local txt = io.load(ac.getTrackDataFilename('map2lap.json'))
  if not txt then return false end
  local built = tonumber(txt:match('"built"%s*:%s*([%d%.]+)'))
  return { version = txt:match('"version"%s*:%s*"([^"]+)"') or '?',
           track_version = txt:match('"track_version"%s*:%s*"([^"]+)"') or '?',
           built = built and os.date('%Y-%m-%d %H:%M', math.floor(built)) or '?',
           code = txt:match('"code"%s*:%s*"([^"]+)"'),
           overture = txt:match('"overture"%s*:%s*"([^"]+)"'), osm = txt:match('"osm"%s*:%s*"([^"]+)"') }
end

local function buildText()
  if not build then return 'not built by Map2Lap (no data/map2lap.json)' end
  return string.format('built %s with Map2Lap %s (track version %s)', build.built, build.version, build.track_version)
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

local function folder()
  if not session then
    session = outDir .. '/' .. ac.getTrackID() .. '_' .. os.date('%Y%m%d_%H%M%S')
    io.createDir(outDir)
    io.createDir(session)
    io.save(session .. '/info.txt', string.format('track %s\n%s\ncode %s\nmap data: Overture %s, OSM tags %s\n' ..
      'CSP %s\nTrack Debug %s\n', ac.getTrackID(), buildText(), build and build.code or '-',
      build and build.overture or '?', build and build.osm or '?', ac.getPatchVersion() or '?', APP_VERSION))
    for _, name in ipairs({ 'map2lap.json', 'map2lap_route.txt' }) do      -- (to build the same track: from_debug.py)
      local data = io.load(ac.getTrackDataFilename(name))
      if data then io.save(session .. '/' .. name, data) end
    end
  end
  return session
end

local function append(path, head, lines)
  local new = not io.fileExists(path)
  local f = io.open(path, 'a')
  if not f then return end
  if new then f:write(head) end
  f:write(table.concat(lines))
  f:close()
end

local function flushDrive()
  if #unsaved == 0 then return end
  append(folder() .. '/drive.csv', DRIVE_HEAD, unsaved)
  recorded = recorded + #unsaved
  unsaved = {}
end

local function closeMark(m)
  io.save(string.format('%s/mark_%02d.csv', folder(), m.k), DRIVE_HEAD .. table.concat(m.rows))
end

local function mark(car)
  local p, k = car.position, #marks + 1
  marks[k] = string.format('%d,%.2f,%.1f,%.1f,%.2f,%.2f,%.2f,%.7f,%.7f,%.1f\n', k, clock, now.s or -1, now.off or -1,
    p.x, p.y, p.z, now.lat or 0, now.lon or 0, car.speedKmh)
  io.save(folder() .. '/marks.csv', MARKS_HEAD .. table.concat(marks))
  local before = {}            -- (the ring, oldest first)
  for i = 1, RING do
    local r = ring[(ringAt + i - 1) % RING + 1]
    if r and r[1] >= clock - BEFORE_S then before[#before + 1] = r[2] end
  end
  open[#open + 1] = { k = k, untilT = clock + AFTER_S, rows = before }
  closeMark(open[#open])       -- (saved now as well: the part before it survives quitting AC right after the mark)
  lastMark = { k = k, s = now.s or -1 }
  shot = k
end

function script.update(dt)
  if route == nil and not loadRoute() then route = false end
  if build == nil then build = loadBuild() end
  local car = ac.getCar(0)
  if not car then return end
  clock = clock + dt
  local p = car.position
  if route then now.s, now.off = project(p.x, p.z) end
  now.lat, now.lon = latlon(p.x, p.z)

  if shot then                 -- (a frame after the mark: the window shows its number in the screenshot)
    local k = shot
    shot = nil
    ac.makeScreenshot(string.format('%s/mark_%02d.jpg', folder(), k), ac.ScreenshotFormat.JPG, function(err)
      if err then shotErr = string.format('Screenshot %d failed: %s', k, tostring(err)) end
    end)
  end
  if markKey:pressed() then mark(car) end

  sinceSample = sinceSample + dt
  if sinceSample >= SAMPLE_S then
    sinceSample = math.min(sinceSample - SAMPLE_S, SAMPLE_S)   -- (50 Hz on average at any frame rate)
    local w = car.wheels
    local a = car.acceleration     -- (G: x sideways, y vertical, z along; separately: impact or bump)
    local row = string.format('%.3f,%.2f,%.2f,%.3f,%.3f,%.3f,%.1f,%.3f,%.3f,%.3f,%.4f,%.4f,%.4f,%.4f\n',
      clock, now.s or -1, now.off or -1, p.x, p.y, p.z, car.speedKmh, a.y, a.x, a.z,
      w[0].suspensionTravel, w[1].suspensionTravel, w[2].suspensionTravel, w[3].suspensionTravel)
    ringAt = ringAt % RING + 1
    ring[ringAt] = { clock, row }
    for i = #open, 1, -1 do
      local m = open[i]
      m.rows[#m.rows + 1] = row
      if clock >= m.untilT then
        closeMark(m)
        table.remove(open, i)
      end
    end
    if recording then unsaved[#unsaved + 1] = row end
  end
  if recording then
    sinceFlush = sinceFlush + dt
    if sinceFlush >= FLUSH_S then
      sinceFlush = 0
      flushDrive()
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
  if build ~= nil then ui.textColored(buildText(), rgbm(0.7, 0.7, 0.7, 1)) end
  ui.separator()
  ui.text('Mark key:')
  ui.sameLine()
  markKey:control()
  if lastMark then ui.text(string.format('Last: mark %d at %.0f m', lastMark.k, lastMark.s)) end
  if #open > 0 then
    ui.textColored(string.format('Mark %d: recording %.0f s more ...', open[#open].k,
      math.max(0, open[#open].untilT - clock)), rgbm(1, 0.8, 0.3, 1))
  end
  if shotErr then ui.textColored(shotErr, rgbm(1, 0.5, 0.3, 1)) end
  if ui.button('Mark') and car then mark(car) end
  ui.sameLine()
  if ui.button(recording and 'Stop recording' or 'Start recording') then
    recording = not recording
    if not recording then flushDrive() end
  end
  if recording then
    ui.textColored(string.format('Recording ... %d rows', recorded + #unsaved), rgbm(1, 0.3, 0.3, 1))
  end
  if session then ui.text('Files: Documents/Assetto Corsa/map2lap_debug/' .. session:match('[^/]+$')) end
end
