import * as THREE from "three";

export interface ColourLayers {base: string; mask: string; scale: number}
export interface ColourImage {name: string; i?: number; key?: string; url?: string; size?: number; linear?: boolean}
export interface ColourPhoto extends ColourImage {scale: [number, number]; channel?: number; asset?: string; variation?: boolean}
export interface ColourSplat {base: ColourImage; mask: ColourImage; images: ColourPhoto[]; origin: [number, number]; materials?: number[]}
export interface GroundTextureUpdate {i: number; size: number; version: string; layers?: ColourSplat; materials?: number[]}
interface MaterialImages {texture: string | null; dual_layer?: ColourLayers; splat?: ColourSplat}

/** Texture names used by a material, including its original tile and keep mask. Pure. */
export function materialImages(material?: MaterialImages): string[] {
  if (!material) return [];
  if (material.splat) return [...new Set([material.splat.base.name, material.splat.mask.name, ...material.splat.images.map(p => p.name)])];
  return [...new Set([material.texture, material.dual_layer?.base, material.dual_layer?.mask].filter((name): name is string => !!name))];
}

/** The native UV-space four-layer material: the original tile in A, up to three independent repeating colours in RGB. */
export function bindSplat(material: THREE.MeshLambertMaterial, keep: THREE.Texture, images: THREE.Texture[], layers: ColourSplat) {
  const channels = layers.images.map((p, i) => "rgb"[p.channel ?? i]);
  const varied = layers.images.some(p => p.variation);
  material.onBeforeCompile = shader => {
    if (varied) {
      // CSP's nm4 procedural reference converts its noise multiplier to cells using a factor of 32.
      // Omitting it leaves 20 m cells: a 2 m photo then repeats ten times before the field changes cell.
      shader.uniforms.m2lNoiseFrequency = {value: 32 * 0.05};
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 m2lWorldXZ;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nm2lWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;");
    }
    Object.assign(shader.uniforms, {m2lKeep: {value: keep}, m2lOrigin: {value: new THREE.Vector2(...layers.origin)}});
    for (let i = 0; i < images.length; i++) {
      shader.uniforms[`m2lPhoto${i}`] = {value: images[i]};
      shader.uniforms[`m2lScale${i}`] = {value: new THREE.Vector2(...layers.images[i].scale)};
    }
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>", `
      #include <map_pars_fragment>
      uniform sampler2D m2lKeep;
      uniform vec2 m2lOrigin;
      ${varied ? variationShader : ""}
      ${images.map((_p, i) => `uniform sampler2D m2lPhoto${i}; uniform vec2 m2lScale${i};`).join("\n")}
    `).replace("#include <map_fragment>", `
      #ifdef USE_MAP
        vec4 m2lWeights = texture2D(m2lKeep, vMapUv);
        vec3 m2lColour = texture2D(map, vMapUv).rgb * m2lWeights.a;
        ${images.map((_p, i) => `m2lColour += ${layers.images[i].variation ? "m2lVary" : "texture2D"}(m2lPhoto${i}, (vMapUv + m2lOrigin) * m2lScale${i}).rgb * m2lWeights.${channels[i]};`).join("\n")}
        diffuseColor *= vec4(m2lColour, 1.0);
      #endif
    `);
  };
  material.customProgramCacheKey = () => "map2lap-splat-3-" + channels.map((c, i) => c + Number(!!layers.images[i].variation)).join("");
  material.needsUpdate = true;
}

// CSP's nm4 shaders blend two translated samples using a spatial noise field. The browser uses its own deterministic
// value-noise field at the nm4 procedural reference frequency; CSP supplies its internal txNoise.
// Masks and the original A layer never pass through it.
const variationShader = `
  varying vec2 m2lWorldXZ;
  uniform float m2lNoiseFrequency;
  float m2lHash(vec2 p) { return fract(sin(dot(p, vec2(0.317, 0.819))) * 43758.5453); }
  float m2lNoise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    return mix(mix(m2lHash(cell), m2lHash(cell + vec2(1.0, 0.0)), f.x),
               mix(m2lHash(cell + vec2(0.0, 1.0)), m2lHash(cell + vec2(1.0)), f.x), f.y);
  }
  vec4 m2lVary(sampler2D photo, vec2 uv) {
    float l = m2lNoise(m2lWorldXZ * m2lNoiseFrequency) * 8.0;
    float i = floor(l), f = fract(l);
    vec2 dx = dFdx(uv), dy = dFdy(uv);
    vec4 a = textureGrad(photo, uv + sin(vec2(3.0, 7.0) * i), dx, dy);
    vec4 b = textureGrad(photo, uv + sin(vec2(3.0, 7.0) * (i + 1.0)), dx, dy);
    return mix(a, b, smoothstep(0.2, 0.8, f - 0.1 * dot(a - b, vec4(1.0))));
  }
`;

/** Blend the scaled map with the original tile using its keep mask; textures remain owned by TrackView's shared pool. */
export function bindColourBlend(material: THREE.MeshLambertMaterial, base: THREE.Texture, keep: THREE.Texture, scale: number) {
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, {m2lBase: {value: base}, m2lKeep: {value: keep}, m2lScale: {value: scale}});
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_pars_fragment>", `
      #include <map_pars_fragment>
      uniform sampler2D m2lBase;
      uniform sampler2D m2lKeep;
      uniform float m2lScale;
    `).replace("#include <map_fragment>", `
      #ifdef USE_MAP
        vec4 m2lDetail = texture2D(map, vMapUv * m2lScale);
        vec4 m2lOriginal = texture2D(m2lBase, vMapUv);
        float m2lWeight = texture2D(m2lKeep, vMapUv).r;
        diffuseColor *= vec4(mix(m2lDetail.rgb, m2lOriginal.rgb, m2lWeight), 1.0);
      #endif
    `);
  };
  // Scale and images are uniforms; all colour blends can share a compiled program.
  material.customProgramCacheKey = () => "map2lap-colour-blend-1";
  material.needsUpdate = true;
}

/** A fully replaced bridge/road strip uses the same world X/Z sampling as AC's ksMultilayer. */
export function bindWorldColour(material: THREE.MeshLambertMaterial, scale: [number, number]) {
  material.onBeforeCompile = shader => {
    shader.uniforms.m2lScale = {value: new THREE.Vector2(...scale)};
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 m2lPosition;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nm2lPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>",
      "#include <common>\nvarying vec3 m2lPosition;\nuniform vec2 m2lScale;")
      .replace("#include <map_fragment>", `
        #ifdef USE_MAP
          diffuseColor *= texture2D(map, m2lPosition.xz * m2lScale);
        #endif
      `);
  };
  material.customProgramCacheKey = () => "map2lap-world-colour-1";
  material.needsUpdate = true;
}
