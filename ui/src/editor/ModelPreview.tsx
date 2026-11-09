import {useEffect, useRef} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import styles from "./ModelPreview.module.css";
import {modelEnvironment, modelLight, modelPreviewScene} from "./modelLighting";

/** A static GLB preview with its native alpha materials; this canvas owns and disposes only its own decoded asset. */
export function ModelPreview({url, file, height}: {url?: string; file?: File; height?: number}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current!, renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(element.clientWidth, element.clientHeight);
    element.appendChild(renderer.domElement);
    const light = modelLight(renderer);
    const scene = modelPreviewScene(renderer), camera = new THREE.PerspectiveCamera(40, element.clientWidth / element.clientHeight, .01, 1000);
    let stopped = false;
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    const release = () => { for (const g of geometries) g.dispose(); for (const m of materials) m.dispose(); for (const t of textures) t.dispose(); };
    const source = file ? URL.createObjectURL(file) : url!;
    const observer = new ResizeObserver(() => {
      if (!element.clientWidth || !element.clientHeight) return;
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    observer.observe(element);
    void new GLTFLoader().loadAsync(source).then(gltf => {
      gltf.scene.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        geometries.add(node.geometry);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      if (stopped) { release(); return; }
      modelEnvironment(materials, light.texture);
      scene.add(gltf.scene);
      const bounds = new THREE.Box3().setFromObject(gltf.scene), middle = bounds.getCenter(new THREE.Vector3());
      const size = Math.max(...bounds.getSize(new THREE.Vector3()).toArray(), .01);
      camera.position.copy(middle).add(new THREE.Vector3(size * .3, size * .15, size * 1.8));
      camera.near = size / 1000; camera.far = size * 20; camera.updateProjectionMatrix(); camera.lookAt(middle);
      renderer.render(scene, camera);
    }).catch(() => {});
    return () => {
      stopped = true; observer.disconnect(); release(); light.dispose(); renderer.dispose(); renderer.domElement.remove();
      if (file) URL.revokeObjectURL(source);
    };
  }, [url, file]);
  return <div className={styles.preview} style={height ? {height} : undefined} ref={host} aria-label="Model preview" />;
}
