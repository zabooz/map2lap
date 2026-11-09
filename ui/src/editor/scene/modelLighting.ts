import * as THREE from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";

/** Photograph imported materials without clipping bright foliage channels; leaves the main track lighting alone. */
export function modelPreviewScene(renderer: THREE.WebGLRenderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .8;
  const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, .6));
  const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(4, 8, 6); scene.add(sun);
  return scene;
}

/** Bind model-only image based light at a power (1 by day); source terrain keeps its original lighting. */
export function modelEnvironment(materials: Iterable<THREE.Material>, texture: THREE.Texture, power = 1) {
  for (const material of materials) if (material instanceof THREE.MeshStandardMaterial) {
    if (material.userData.map2lap?.lighting === "matte") {
      // Explicit flat-colour artwork uses the existing sky/sun, without a reflective room or filmic palette compression.
      material.envMapIntensity = 0;
      if (material.envMap || material.toneMapped) {
        material.envMap = null; material.toneMapped = false; material.needsUpdate = true;
      }
      continue;
    }
    material.envMapIntensity = power;
    if (material.envMap === texture) continue;      // (the clock dims it many times a second: no new shader for that)
    material.envMap = texture;
    material.needsUpdate = true;
  }
}

/** One reflection map per viewport, shared by every GLB material; the caller owns the returned target. */
export function modelLight(renderer: THREE.WebGLRenderer) {
  const generator = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  try { return generator.fromScene(room, .04); }
  finally { room.dispose(); generator.dispose(); }
}
