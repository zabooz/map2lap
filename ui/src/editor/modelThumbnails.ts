import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {modelEnvironment, modelLight, modelPreviewScene} from "./modelLighting";
import {ModelThumbnailQueue} from "./modelThumbnailQueue";

const CACHE = "map2lap-model-thumbnails-v2";
const cacheKey = (id: string) => `/__map2lap_thumbnails/v2/${encodeURIComponent(id)}.png`;
let renderer: THREE.WebGLRenderer | undefined, light: THREE.WebGLRenderTarget | undefined;
let idle: ReturnType<typeof setTimeout> | undefined;

/** Release the single thumbnail context after browsing stops. */
function rest() {
  idle = setTimeout(() => {
    light?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
    renderer = undefined; light = undefined;
  }, 30_000);
}

/** Decode one self-contained library GLB, photograph it, and release its GPU resources. */
async function render(id: string, signal: AbortSignal): Promise<Blob> {
  clearTimeout(idle);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  try {
    const response = await fetch(`/api/library/models/${encodeURIComponent(id)}/original`, {signal});
    if (!response.ok) throw new Error("Model unavailable");
    const bytes = await response.arrayBuffer(); signal.throwIfAborted();
    const model = await new GLTFLoader().parseAsync(bytes, "");
    model.scene.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      geometries.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    signal.throwIfAborted();
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
      renderer.setSize(512, 512); light = modelLight(renderer);
    }
    modelEnvironment(materials, light!.texture);
    const scene = modelPreviewScene(renderer); scene.add(model.scene);
    const bounds = new THREE.Box3().setFromObject(model.scene), middle = bounds.getCenter(new THREE.Vector3());
    const size = Math.max(...bounds.getSize(new THREE.Vector3()).toArray(), .01);
    const camera = new THREE.PerspectiveCamera(40, 1, size / 1000, size * 20);
    camera.position.copy(middle).add(new THREE.Vector3(size * .3, size * .15, size * 1.8)); camera.lookAt(middle);
    renderer.render(scene, camera);
    // Start the canvas snapshot in the render task, before WebGL clears its drawing buffer.
    return await new Promise<Blob>((resolve, reject) => renderer!.domElement.toBlob(blob => {
      if (blob) resolve(blob); else reject(new Error("Preview unavailable"));
    }, "image/png"));
  } finally {
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) {
      texture.dispose();
      if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
    }
    renderer?.renderLists.dispose(); rest();
  }
}

/** PNGs are content-addressed by the immutable model ID; unavailable browser storage is optional. */
export const modelThumbnails = new ModelThumbnailQueue(async id => {
  const cache = await caches.open(CACHE), response = await cache.match(cacheKey(id));
  return response ? response.blob() : null;
}, render, async (id, blob) => {
  const cache = await caches.open(CACHE);
  await cache.put(cacheKey(id), new Response(blob, {headers: {"Content-Type": "image/png"}}));
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - 256))) await cache.delete(key);
});
