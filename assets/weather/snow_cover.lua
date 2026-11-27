-- Winter albedo pass for Map2Lap terrain and roofs. Keep CSP's seasonWinter at 0.5:
-- its coverage depends on both the surface normal and the green in the diffuse texture.
local snowWhite = [[
float4 main(PS_IN pin) {
  float3 color = txBase.Sample(samAnisotropic, pin.Tex).rgb;
  float3 normal = normalize(pin.NormalW);
  #ifdef PAINTED_GROUND
    float4 mask = txMask.Sample(samAnisotropic, pin.Tex);
    float3 layers = 0, detailNormal = 0;
    #define LAYER(C, W) { float2 uv = pin.Tex * gScale##C; \
      layers += W * txDetail##C.Sample(samAnisotropic, uv).rgb; \
      detailNormal += W * (2 * txNormal##C.Sample(samAnisotropic, uv).xyz - 1); }
    LAYER(R, mask.r)
    LAYER(G, mask.g)
    LAYER(B, mask.b)
    LAYER(A, mask.a)
    color *= layers * gMagic;
    float3 dx = ddx(pin.PosC), dy = ddy(pin.PosC);
    float2 ux = ddx(pin.Tex), uy = ddy(pin.Tex);
    float det = ux.x * uy.y - ux.y * uy.x;
    if (abs(det) > 1e-12) {
      float3 t = normalize((dx * uy.y - dy * ux.y) * sign(det));
      float3 b = normalize((dy * ux.x - dx * uy.x) * sign(det));
      normal = normalize(t * detailNormal.x + b * detailNormal.y + normal * detailNormal.z);
    }
  #endif
  float cover = saturate(0.5 * saturate(normal.y) + 20 * (2 * color.g - color.r - color.b));
  float luminance = dot(color, float3(0.2125, 0.7154, 0.0721));
  float3 stockWhite = saturate(luminance * float3(1.0, 1.1, 1.2) * (1.6 * 0.85));
  float3 newWhite = saturate(stockWhite * __SNOW_WHITE_GAIN__);
  float3 stock = lerp(color, stockWhite, cover);
  float3 gain = cover * (newWhite - stockWhite) / max(stock, 1e-5);
  return float4(1 + gain * (1 - saturate(pin.Fog)), 1);
}
]]

local batches
local function texture(mesh, slot)
  local filename = mesh:getTextureSlotFilename(1, slot)
  if not filename or filename == '' then return nil end
  -- CSP can return a resolved resource such as content/tracks/<id>::ground_0_0.dds.
  if filename:find('::', 1, true) then return filename end
  return 'track::track::' .. filename
end

local function batchFor(mesh)
  local base = texture(mesh, 'txDiffuse')
  if not base then return nil end
  local textures, values, defines = {txBase = base}, {}, {}
  if mesh:shaderName() == 'ksMultilayer_objsp_nm4'
      and not ((texture(mesh, 'txMask') or ''):match('::map2lap_detail_base%.png$')
        and (texture(mesh, 'txDetailR') or ''):match('::map2lap_detail_white%.png$')) then
    defines.PAINTED_GROUND = true
    textures.txMask = texture(mesh, 'txMask')
    values.gMagic = mesh:getMaterialPropertyValue(1, 'magicMult') or 1
    for c in ('RGBA'):gmatch('.') do
      textures['txDetail'..c] = texture(mesh, 'txDetail'..c)
      textures['txNormal'..c] = texture(mesh, 'txNormal'..c)
      local scale = mesh:getMaterialPropertyValue(1, 'mult'..c)
      values['gScale'..c] = type(scale) == 'number' and vec2(scale, scale) or scale or vec2(1, 1)
    end
  end
  local lo, hi = mesh:getStaticAABB()
  return {center = (hi + lo) * 0.5, radius = (hi - lo):length() * 0.5,
    pass = {mesh = mesh, transform = 'original', async = true, textures = textures,
      values = values, defines = defines, shader = snowWhite}}
end

local function collect()
  local result = {}
  local meshes = ac.findMeshes('?')
  local roadRegions = {}
  local paved = io.load(ac.getFolder(ac.FolderID.CurrentTrack) .. '/extension/map2lap_snow_paved.txt') or ''
  for source in paved:gmatch('%d+') do roadRegions[source] = true end
  local roofs = '__ROOF_KINDS__'
  local roofKinds = {}
  for kind in roofs:gmatch('%w+') do roofKinds[kind] = true end
  for i = 1, #meshes do
    local name = meshes:name(i)
    local region = name:match('^nocol_ground_m2l_region_(%d+)_')
    if not meshes:isPhysicsOnlyMesh(i) and (name:match('^1GRASS_ground_') or name:match('^1GRAVEL_ground_')
        or (region and not roadRegions[region])
        or roofKinds[(meshes:materialName(i) or ''):match('^([^_]+)_')]) then
      local batch = batchFor(meshes:at(i))
      if batch then result[#result + 1] = batch end
    end
  end
  return result
end

local function draw()
  if not batches then batches = collect() end
  render.setDepthMode(render.DepthMode.ReadOnlyLessEqual)
  render.setBlendMode(render.BlendMode.BlendMultiply)
  for _, batch in ipairs(batches) do
    if batch.pass.mesh:isVisible() and render.isVisible(batch.center, batch.radius, false) then
      render.setCullMode(batch.pass.mesh:cullMode())
      render.mesh(batch.pass)
    end
  end
end

function script.draw3D() draw() end
local mirror = render.on('mirror.root.transparent', draw)
