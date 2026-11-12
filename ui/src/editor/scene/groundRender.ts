import * as THREE from "three";
import {SunLight} from "three/addons/lights/SunLight.js";
import {tangentFrame, variationShader, type ColourSplat, type GroundPass, type GroundMaterial} from "./colourBlend";
import {layerGloss} from "./classicLight";
import {refreshSeason} from "./seasons";

function fitRegion(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute("position"), indices = geometry.getIndex()!;
  const box = new THREE.Box3(), point = new THREE.Vector3();
  for (let i = 0; i < indices.count; i++) box.expandByPoint(point.fromBufferAttribute(positions, indices.getX(i)));
  geometry.boundingBox = box; geometry.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
}

function regionGeometry(source: THREE.BufferGeometry, kept: number[]) {
  const geometry = new THREE.BufferGeometry();
  for (const [key, attribute] of Object.entries(source.attributes)) geometry.setAttribute(key, attribute);
  geometry.setIndex(kept); fitRegion(geometry);
  return geometry;
}

interface RegionNode {
  bounds: number[];
  kept?: number[];
  children?: [RegionNode, RegionNode];
}

/** Region bounds in whole-tile UVs as they cut the ground: open where they meet the tile's edge (tracknative._cuts). The
 * ground piece ends there itself, its UVs need not: a build's 4-place UVs end up to 1.3 cm past the tile, a wall step lifts
 * them past it on purpose. Not Infinity: GLSL ES need not keep it in a uniform; 1e30 lies past any tile's UVs. Pure. */
export function regionCut(bounds: number[]) {
  return [bounds[0] > 0 ? bounds[0] : -1e30, bounds[1] > 0 ? bounds[1] : -1e30,
    bounds[2] < 1 ? bounds[2] : 1e30, bounds[3] < 1 ? bounds[3] : 1e30];
}

/** Build a balanced UV-box hierarchy for arbitrary, overlapping region bounds. Pure. */
function regionTree(regions: RegionNode[]): RegionNode {
  if (regions.length === 1) return regions[0];
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const region of regions) {
    bounds[0] = Math.min(bounds[0], region.bounds[0]); bounds[1] = Math.min(bounds[1], region.bounds[1]);
    bounds[2] = Math.max(bounds[2], region.bounds[2]); bounds[3] = Math.max(bounds[3], region.bounds[3]);
  }
  const axis = bounds[2] - bounds[0] >= bounds[3] - bounds[1] ? 0 : 1;
  regions.sort((a, b) => (a.bounds[axis] + a.bounds[axis + 2]) - (b.bounds[axis] + b.bounds[axis + 2]));
  const middle = Math.floor(regions.length / 2);
  return {bounds, children: [regionTree(regions.slice(0, middle)), regionTree(regions.slice(middle))]};
}

/** Assign source triangles once through UV bounds; yield owned indices with borrowed vertices. scale: what the mesh UVs are
 * scaled by (ColourSplat.uv_scale); bounds cover the whole tile. Pure. */
export function* groundRegionGeometries(source: THREE.BufferGeometry, bounds: number[][], origin: number[], scale = 1) {
  const regions = new Map<string, RegionNode>();
  for (const box of bounds) if (!regions.has(box.join(","))) regions.set(box.join(","), {bounds: regionCut(box), kept: []});
  if (!regions.size) return;
  const root = regionTree([...regions.values()]), stack: RegionNode[] = [];
  const indices = source.getIndex()!, uv = source.getAttribute("uv");
  for (let i = 0; i < indices.count; i += 3) {
    const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
    const x = (k: number) => uv.getX(k) / scale - origin[0], y = (k: number) => uv.getY(k) / scale - origin[1] + 1;
    const ax = x(a), bx = x(b), cx = x(c), ay = y(a), by = y(b), cy = y(c);
    const minX = Math.min(ax, bx, cx), maxX = Math.max(ax, bx, cx), minY = Math.min(ay, by, cy), maxY = Math.max(ay, by, cy);
    stack.push(root);
    while (stack.length) {
      const node = stack.pop()!, box = node.bounds;
      // Strict UV-box overlap is intentional: touching edges have no fragments in this draw.
      if (maxX <= box[0] || minX >= box[2] || maxY <= box[1] || minY >= box[3]) continue;
      if (node.children) stack.push(...node.children);
      else node.kept!.push(a, b, c);
    }
  }
  for (const [key, region] of regions) {
    const geometry = regionGeometry(source, region.kept!);
    region.kept = []; // Release temporary lists as each index buffer is budgeted by the caller.
    yield [key, geometry] as const;
  }
}

/** Only UV-intersecting triangles are submitted; edge fragments retain exact world-UV clipping. Pure. */
export function groundRegionGeometry(source: THREE.BufferGeometry, bounds: number[], origin: number[], scale = 1) {
  return groundRegionGeometries(source, [bounds], origin, scale).next().value![1];
}

function disposeRegion(geometry: THREE.BufferGeometry) {
  // Vertex buffers belong to the source mesh. Only this draw's index buffer is owned here.
  for (const key of Object.keys(geometry.attributes)) geometry.deleteAttribute(key);
  geometry.dispose();
}

/** Linear accumulation belongs only to edited ground; the ordinary scene keeps its existing framebuffer and AA. */
export class GroundFrame {
  readonly scene = new THREE.Scene();
  private target: THREE.WebGLRenderTarget | null = null;
  private bytes = 0;
  private indexBytes = 0;
  private materials = new Set<GroundMaterial>();
  private viewport = new THREE.Vector2();
  private lights: [THREE.Light, THREE.Light][] = [];
  constructor(private renderer: THREE.WebGLRenderer, lights: THREE.Scene,
    private reserve: (bytes: number) => boolean, private release: (bytes: number) => void) {
    for (const child of lights.children) if (child instanceof THREE.Light) {
      const copy = child.clone();     // (a light has one parent: this scene needs its own, the values stay the view's)
      if (child instanceof SunLight) (copy as SunLight).shadow = child.shadow;   // one map for both scenes (SunShadows)
      this.scene.add(copy); this.lights.push([child, copy]);
    }
  }
  /** Take over the view's lights as they are now. */
  followLights() {
    for (const [source, copy] of this.lights) {
      copy.color.copy(source.color); copy.intensity = source.intensity; copy.position.copy(source.position);
    }
  }
  bind(material: GroundMaterial) {
    this.ensure();
    if (!this.materials.has(material)) {
      this.materials.add(material);
      const disposed = () => { this.materials.delete(material); material.removeEventListener("dispose", disposed); };
      material.addEventListener("dispose", disposed);
    }
    material.map = this.target!.texture;
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>",
        "#include <map_pars_fragment>\nuniform vec2 m2lViewport;");
      shader.uniforms.m2lViewport = {value: this.viewport};
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
        vec4 m2lLit = texture2D(map, gl_FragCoord.xy / m2lViewport);
        vec3 m2lLinear = m2lLit.rgb / max(m2lLit.a, 0.000001);
      `);
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>",
        "outgoingLight = m2lLinear;\n#include <opaque_fragment>");
    };
    material.customProgramCacheKey = () => "map2lap-ground-screen-1"; material.needsUpdate = true;
    refreshSeason(material);
  }
  reserveIndices(bytes: number) {
    // Regional index arrays remain on the CPU and have their own GPU copy. Source vertex buffers are borrowed.
    if (!this.reserve(bytes * 2)) throw new Error("Not enough editor memory for regional ground indices");
    this.indexBytes += bytes * 2;
  }
  releaseIndices(bytes: number) { this.indexBytes -= bytes * 2; this.release(bytes * 2); }
  ensure() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.viewport.copy(size);
    if (this.target?.width === size.x && this.target.height === size.y) return;
    const samples = Math.min(4, this.renderer.capabilities.maxSamples);
    // RGBA16F colour + depth storage, multisample colour/depth and resolved colour; allocation bound, not measured VRAM.
    const bytes = size.x * size.y * (12 * samples + 12);
    if (!this.reserve(bytes)) throw new Error("Not enough editor memory for the ground framebuffer");
    const target = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType, depthBuffer: true, samples});
    target.texture.colorSpace = THREE.LinearSRGBColorSpace;
    this.target?.dispose(); this.release(this.bytes);
    this.target = target; this.bytes = bytes;
    for (const material of this.materials) { material.map = target.texture; material.needsUpdate = true; }
  }
  render(camera: THREE.Camera) {
    this.ensure();
    const start = performance.now();
    const previous = this.renderer.getRenderTarget(), colour = this.renderer.getClearColor(new THREE.Color()), alpha = this.renderer.getClearAlpha();
    try {
      this.renderer.setRenderTarget(this.target); this.renderer.setClearColor(0, 0);
      this.renderer.render(this.scene, camera);
      performance.clearMeasures("map2lap.ground.draw");
      performance.measure("map2lap.ground.draw", {start, detail: {calls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles, framebufferBytes: this.bytes, regionalIndexCpuBytes: this.indexBytes / 2,
        regionalIndexGpuBytes: this.indexBytes / 2, samples: this.target!.samples}});
    } finally { this.renderer.setRenderTarget(previous); this.renderer.setClearColor(colour, alpha); }
  }
  dispose() { this.target?.dispose(); this.target = null; this.materials.clear(); this.release(this.bytes); this.bytes = 0; }
}

function weights(pass: GroundPass) {
  return `
    uniform sampler2D m2lWeight;
    uniform vec4 m2lFrames[${pass.frames.length}];
    uniform vec2 m2lSources[${pass.frames.length}];
    uniform float m2lConstants[${pass.frames.length}];
    uniform vec2 m2lSize;
    float m2lAt(vec2 uv, float level) {
      if (level < ${pass.first}.0 || level > ${pass.first + pass.frames.length - 1}.0) return 0.0;
      int k = int(level) - ${pass.first};
      if (m2lConstants[k] >= 0.0) return m2lConstants[k];
      vec2 at = uv * max(vec2(1.0), floor(m2lSize / exp2(level))) - 0.5;
      ivec2 p = ivec2(floor(at) - m2lSources[k] + m2lFrames[k].xy);
      vec2 f = fract(at);
      return mix(mix(texelFetch(m2lWeight,p,0).r,texelFetch(m2lWeight,p+ivec2(1,0),0).r,f.x),
                 mix(texelFetch(m2lWeight,p+ivec2(0,1),0).r,texelFetch(m2lWeight,p+ivec2(1,1),0).r,f.x),f.y);
    }
  `;
}

/** One pass of a regional tile: its layer's colour times its weight, added, in the light of the tile's classic ground material
 * (source: its colour, ksSpecular and ksSpecularEXP as classicLight.classicGround gives them). The tile image (image -1) is
 * flat at the material's whole gloss; a photo's normals come from its detail map, its gloss is one less its roughness. Pure. */
function passMaterial(layers: ColourSplat, pass: GroundPass, photo: THREE.Texture, data: THREE.Texture | null, weight: THREE.Texture | null,
  source: GroundMaterial) {
  const ref = layers.images[pass.image], mapped = !!data;
  const material = new THREE.MeshPhongMaterial({map: photo, color: source.color,
    ...(source instanceof THREE.MeshPhongMaterial ? {specular: source.specular, shininess: source.shininess} : {specular: 0})});
  const gloss = pass.image < 0 ? 1 : layerGloss(ref?.properties);
  material.transparent = true; material.depthWrite = false; material.blending = THREE.CustomBlending;
  material.blendEquation = THREE.AddEquation; material.blendSrc = material.blendDst = THREE.OneFactor;
  material.polygonOffset = true; material.polygonOffsetFactor = -1; material.polygonOffsetUnits = -1;
  const scale = ref?.scale ?? [1, 1], origin = layers.ground!.uv_origin;
  const phase = scale.map((value, k) => ((layers.origin[k] + origin[k]) * value) % (ref?.variation ? 20 : 1));
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, {m2lWeight: {value: weight}, m2lSize: {value: new THREE.Vector2(...layers.ground!.dimensions)},
      m2lFrames: {value: pass.frames.map(f => new THREE.Vector4(...f.atlas))}, m2lSources: {value: pass.frames.map(f => new THREE.Vector2(...f.source))},
      m2lConstants: {value: pass.frames.map(f => f.constant ?? -1)},
      m2lScale: {value: new THREE.Vector2(...scale)}, m2lPhase: {value: new THREE.Vector2(...phase)},
      m2lUVOrigin: {value: new THREE.Vector2(...origin)}, m2lUVScale: {value: layers.uv_scale ?? 1}, m2lBounds: {value: new THREE.Vector4(...regionCut(pass.bounds))},
      m2lData: {value: data}, m2lNoiseFrequency: {value: 1.6},
      m2lProperties: {value: new THREE.Vector3(ref?.properties?.normal_scale ?? 1, ref?.properties?.roughness ?? 1, ref?.properties?.roughness_offset ?? 0)}});
    // m2lRaw samples the original tile at its mesh UV (less whole repeats); m2lLocal is the whole tile's UV, which weights
    // and bounds cover.
    shader.vertexShader = shader.vertexShader.replace("#include <common>",
      "#include <common>\nuniform vec2 m2lUVOrigin; uniform float m2lUVScale; varying vec2 m2lLocal, m2lRaw;")
      .replace("#include <uv_vertex>",
        "#include <uv_vertex>\nm2lRaw = uv - m2lUVOrigin; m2lLocal = uv / m2lUVScale - m2lUVOrigin;");
    if (ref?.variation) shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 m2lWorldXZ;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nm2lWorldXZ = (modelMatrix * vec4(transformed,1.0)).xz;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>", `#include <map_pars_fragment>
      varying vec2 m2lLocal, m2lRaw; uniform vec2 m2lScale, m2lPhase; uniform vec3 m2lProperties; uniform vec4 m2lBounds;
      uniform sampler2D m2lData; ${weights(pass)} ${mapped ? tangentFrame : ""} ${ref?.variation ? variationShader : ""}
    `).replace("#include <map_fragment>", `
      vec2 m2lUV = vec2(m2lLocal.x, m2lLocal.y + 1.0);
      vec2 m2lDx = dFdx(m2lUV) * m2lSize, m2lDy = dFdy(m2lUV) * m2lSize;
      float m2lLOD = clamp(log2(max(length(m2lDx),length(m2lDy))),0.0,log2(max(m2lSize.x,m2lSize.y)));
      vec2 m2lEdge = clamp(m2lUV, 0.0, 1.0);    // (ground past the tile's edge takes the edge's weights: regionCut)
      float m2lMass = mix(m2lAt(m2lEdge,floor(m2lLOD)),m2lAt(m2lEdge,ceil(m2lLOD)),fract(m2lLOD));
      vec2 m2lPhotoUV = ${pass.image < 0 ? "m2lRaw" : "m2lLocal * m2lScale + m2lPhase"};
      diffuseColor *= ${ref?.variation ? "m2lVary" : "texture2D"}(map,m2lPhotoUV);
      ${mapped ? `vec4 m2lPacked = ${ref?.variation ? "m2lVaryData(map,m2lData," : "texture2D(m2lData,"}m2lPhotoUV);` : ""}
    `);
    shader.fragmentShader = shader.fragmentShader.replace("#include <specularmap_fragment>", mapped
      ? "float specularStrength = 1.0 - clamp(m2lProperties.z + m2lPacked.a * m2lProperties.y, 0.0, 1.0);"
      : `float specularStrength = ${gloss.toFixed(8)};`);
    if (mapped) shader.fragmentShader = shader.fragmentShader.replace("#include <normal_fragment_maps>", `vec3 m2lN = m2lPacked.xyz * 2.0 - 1.0; m2lN.xy *= m2lProperties.x;
        normal = normalize(m2lTangentFrame(-vViewPosition, normal, m2lLocal) * normalize(m2lN));`);
    shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
      if (any(lessThan(m2lUV,m2lBounds.xy)) || any(greaterThanEqual(m2lUV,m2lBounds.zw))) discard;
      outgoingLight *= m2lMass; diffuseColor.a = m2lMass;
      #include <opaque_fragment>
    `);
  };
  // (a flat layer's gloss is written into the shader, so it is part of the program)
  material.customProgramCacheKey = () => `ground-pass-2-${mapped}-${ref?.variation}-${pass.first}-${pass.frames.length}-${pass.image < 0}-${mapped ? "" : gloss.toFixed(8)}`;
  return material;
}

/** Render-only children stay outside the Editor's source meshes, picking IDs and collision. */
export class GroundLayer {
  private sources = new Map<THREE.Mesh, THREE.Mesh>();
  private materials: THREE.Material[];
  private depth = new THREE.MeshBasicMaterial({color: 0});
  /** source: the tile's ground material, whose colour and gloss its passes take. */
  constructor(private frame: GroundFrame, private layers: ColourSplat, base: THREE.Texture,
    photos: THREE.Texture[], data: (THREE.Texture | null)[], masks: (THREE.Texture | null)[], source: GroundMaterial) {
    this.depth.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", "#include <opaque_fragment>\ngl_FragColor = vec4(0.0);"); };
    this.materials = layers.ground!.passes.map((pass, i) => passMaterial(layers, pass, pass.image < 0 ? base : photos[pass.image], data[pass.image] ?? null, masks[i], source));
  }
  attach(source: THREE.Mesh) {
    if (this.sources.has(source)) return;
    const depth = this.makeSource(source);
    this.frame.scene.add(depth); this.sources.set(source, depth);
  }
  private makeSource(source: THREE.Mesh) {
    const depth = new THREE.Mesh(source.geometry, this.depth);
    depth.matrixAutoUpdate = false;
    const regions = new Map<string, THREE.BufferGeometry>();
    let bytes = 0;
    try {
      for (const [key, geometry] of groundRegionGeometries(source.geometry,
        this.layers.ground!.passes.map(pass => pass.bounds), this.layers.ground!.uv_origin, this.layers.uv_scale ?? 1)) {
        regions.set(key, geometry);
        const size = geometry.getIndex()!.array.byteLength;
        this.frame.reserveIndices(size); bytes += size;
      }
      for (let i = 0; i < this.materials.length; i++) {
        const pass = this.layers.ground!.passes[i], key = pass.bounds.join(",");
        const geometry = regions.get(key)!;
        if (geometry.getIndex()!.count) {
          const passMesh = new THREE.Mesh(geometry, this.materials[i]);
          passMesh.receiveShadow = true;
          depth.add(passMesh);
        }
      }
    } catch (error) {
      for (const geometry of regions.values()) disposeRegion(geometry);
      this.frame.releaseIndices(bytes); throw error;
    }
    depth.userData.indexBytes = bytes;
    depth.userData.regions = regions;
    depth.userData.sourceGeometry = source.geometry;
    depth.userData.sourceUV = source.geometry.getAttribute("uv");
    depth.userData.sourceIndex = source.geometry.getIndex();
    depth.userData.indexStamp = source.geometry.getIndex()!.version;
    return depth;
  }
  private disposeSource(depth: THREE.Mesh) {
    this.frame.scene.remove(depth);
    for (const geometry of (depth.userData.regions as Map<string, THREE.BufferGeometry>).values()) disposeRegion(geometry);
    this.frame.releaseIndices(depth.userData.indexBytes);
  }
  follow() {
    for (const [source, original] of [...this.sources]) {
      let depth = original;
      if (depth.userData.sourceGeometry !== source.geometry || depth.userData.sourceUV !== source.geometry.getAttribute("uv")
          || depth.userData.sourceIndex !== source.geometry.getIndex() || depth.userData.indexStamp !== source.geometry.getIndex()!.version) {
        const replacement = this.makeSource(source);
        this.disposeSource(depth); this.frame.scene.add(replacement); this.sources.set(source, replacement); depth = replacement;
      }
      depth.visible = source.visible; depth.geometry = source.geometry;
      depth.matrix.copy(source.matrixWorld); depth.matrixWorld.copy(source.matrixWorld);
      const position = source.geometry.getAttribute("position"), stamp = "data" in position ? position.data.version : position.version;
      if (stamp !== depth.userData.stamp || position !== depth.userData.sourcePosition) {
        for (const geometry of (depth.userData.regions as Map<string, THREE.BufferGeometry>).values()) {
          for (const [key, attribute] of Object.entries(source.geometry.attributes)) geometry.setAttribute(key, attribute);
          fitRegion(geometry);
        }
        depth.userData.stamp = stamp;
        depth.userData.sourcePosition = position;
      }
    }
  }
  dispose() {
    for (const mesh of this.sources.values()) this.disposeSource(mesh);
    this.sources.clear(); for (const m of this.materials) m.dispose(); this.depth.dispose();
  }
}
