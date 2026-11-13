import * as THREE from "three";
import type {Season} from "./weather";

export interface SeasonValue {value: number}
type Material = THREE.MeshLambertMaterial | THREE.MeshPhongMaterial;
interface Binding {state: SeasonValue; tree: boolean; deciduous: boolean; golden: boolean; hook: Material["onBeforeCompile"]}

/** Spring and summer retain the same green source. Pure. */
export const seasonNumber = (season: Season) => season === "autumn" ? 2 : season === "winter" ? 3 : 1;

/** Chain the existing ground/tree shader: preserve summer colour, warm foliage, hide winter leaves, snow on upper faces. */
export function bindSeason(material: Material, state: SeasonValue, tree = false, deciduous = false, golden = false) {
  const old = material.userData.m2lSeason as Binding | undefined;
  if (old?.hook === material.onBeforeCompile) {
    if (old.state !== state) { old.state = state; material.needsUpdate = true; }
    return;
  }
  const before = material.onBeforeCompile, key = material.customProgramCacheKey();
  const binding: Binding = {state, tree, deciduous, golden, hook: before};
  material.onBeforeCompile = (shader, renderer) => {
    before.call(material, shader, renderer);
    shader.uniforms.m2lSeason = binding.state;
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform float m2lSeason;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <alphatest_fragment>", `#include <alphatest_fragment>
      float m2lWood = ${tree ? "1.0" : "0.0"};
      ${tree ? `#ifdef USE_MAP
        m2lWood = step(0.5, vMapUv.x) * step(0.5, vMapUv.y);
      #endif` : ""}
      ${tree && deciduous ? "if (m2lSeason > 2.5 && m2lWood < 0.5) discard;" : ""}
      if (m2lSeason > 1.5 && m2lSeason < 2.5) {
        float m2lGreen = smoothstep(0.01, 0.13, diffuseColor.g - max(diffuseColor.r, diffuseColor.b));
        float m2lBrightness = sqrt(max(0.01, max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b))));
        vec3 m2lWarm = ${golden ? "vec3(0.68, 0.34, 0.025)" : "vec3(0.55, 0.13, 0.02)"} * m2lBrightness;
        diffuseColor.rgb = mix(diffuseColor.rgb, m2lWarm, ${tree ? (deciduous ? "1.0 - m2lWood" : "0.0") : "m2lGreen * 0.5"});
      }
    `);
    // Painted ground replaces the normal-map chunk. Apply snow after its normals, before lighting takes diffuseColor.
    shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
      if (m2lSeason > 2.5) {
        float m2lUp = inverseTransformDirection(normal, viewMatrix).y;
        float m2lSnow = smoothstep(-0.05, 0.6, m2lUp) * ${tree ? "0.85" : "0.9"};
        ${!tree ? "m2lSnow *= smoothstep(0.015, 0.16, diffuseColor.g - min(diffuseColor.r, diffuseColor.b)) * 0.85 + 0.15;" : ""}
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.9, 0.94), m2lSnow);
      }
    `);
    // Painted regional ground is already lit in its shared framebuffer; its final composite bypasses diffuseColor.
    shader.fragmentShader = shader.fragmentShader.replace("outgoingLight = m2lLinear;", `
      outgoingLight = m2lLinear;
      float m2lLevel = max(outgoingLight.r, max(outgoingLight.g, outgoingLight.b));
      float m2lVegetation = smoothstep(0.04, 0.3, (outgoingLight.g - min(outgoingLight.r, outgoingLight.b)) / max(m2lLevel, 0.0001));
      if (m2lSeason > 1.5 && m2lSeason < 2.5)
        outgoingLight = mix(outgoingLight, vec3(0.55, 0.13, 0.02) * sqrt(m2lLevel), m2lVegetation * 0.5);
      if (m2lSeason > 2.5) {
        float m2lCover = smoothstep(-0.05, 0.6, inverseTransformDirection(normal, viewMatrix).y) * (0.15 + m2lVegetation * 0.8);
        outgoingLight = mix(outgoingLight, vec3(0.86, 0.9, 0.94) * min(1.0, m2lLevel * 2.5), m2lCover);
      }
    `);
  };
  binding.hook = material.onBeforeCompile;
  material.userData.m2lSeason = binding;
  material.customProgramCacheKey = () => key + `|m2l-season-1-${tree}-${deciduous}-${golden}`;
  material.needsUpdate = true;
}

/** A winter leaf card is invisible and must not intercept selection rays. Pure. */
export function hiddenSeasonFoliage(material: THREE.Material, uv?: THREE.Vector2) {
  const binding = material.userData.m2lSeason as Binding | undefined;
  return !!(binding?.tree && binding.deciduous && binding.state.value > 2.5 && uv && (uv.x < .5 || uv.y < .5));
}

/** Reattach after a texture/ground pass replaces its own shader hook. */
export function refreshSeason(material: Material) {
  const binding = material.userData.m2lSeason as Binding | undefined;
  if (binding) bindSeason(material, binding.state, binding.tree, binding.deciduous, binding.golden);
}
