import type {GroundMaterial} from "./colourBlend";

// The share of the sky in a material's light, on the ground (obj_to_kn5.VALUES["grass"]): the Editor's lights are set for it.
const GROUND_AMBIENT = 0.41 / (0.41 + 0.27);
const SAME = 0.02;              // nearer than this to the ground's split, no difference shows and the material keeps a plain shader

/** A ground material (obj_to_kn5.light_values): it stays on the plain light, so that painting one, which gives it another
    shader, changes no brightness. Pure. */
export function takesGroundLight(name: string) {
  return /^(gc_|ground_)/.test(name);
}

/** How much more of the sky's and of the sun's light a material with these AC values takes than the ground, as [sky, sun];
    null when it splits the light like the ground. Pure. */
export function lightShares(ambient: number, diffuse: number): [number, number] | null {
  const sum = ambient + diffuse;
  if (sum <= 0) return null;
  const sky = ambient / sum / GROUND_AMBIENT, sun = diffuse / sum / (1 - GROUND_AMBIENT);
  return Math.abs(sky - 1) < SAME && Math.abs(sun - 1) < SAME ? null : [sky, sun];
}

/** Lets a material weigh the sky's and the sun's light as AC does: a house turned from the sun stays darker than the ground would.
    Only for materials with no other shader change of their own. */
export function bindLightShares(material: GroundMaterial, ambient: number, diffuse: number) {
  const shares = lightShares(ambient, diffuse);
  if (!shares) return;
  const [sky, sun] = shares.map(share => share.toFixed(3));
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_end>",
      `#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= ${sky};\nreflectedLight.directDiffuse *= ${sun};`);
  };
  material.customProgramCacheKey = () => `map2lap-light-share-${sky}-${sun}`;
}
