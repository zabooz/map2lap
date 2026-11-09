import * as THREE from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";

/** Bind model-only image based light; source terrain keeps its original lighting. */
export function modelEnvironment(materials: Iterable<THREE.Material>, texture: THREE.Texture) {
  for (const material of materials) if (material instanceof THREE.MeshStandardMaterial) {
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
