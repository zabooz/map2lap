import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import styles from "./ModelPreview.module.css";
import {modelEnvironment, modelLight, modelPreviewScene} from "../scene/modelLighting";

type Viewer = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera;
  controls: OrbitControls; light: ReturnType<typeof modelLight>; releaseModel: (() => void) | null};

/** A GLB preview with its native alpha materials, turned by dragging and zoomed by the wheel; this canvas owns and disposes only its own decoded asset.
    The view stays where it was turned when the url changes (another geometry level or colour of the same model keeps its bounds). */
export function ModelPreview({url, file, height}: {url?: string; file?: File; height?: number}) {
  const host = useRef<HTMLDivElement>(null);
  const turned = useRef<{position: THREE.Vector3; target: THREE.Vector3} | null>(null);
  const viewer = useRef<Viewer | null>(null);
  const [moved, setMoved] = useState(false);     // (the hint that it turns stands until it has been turned once)
  useEffect(() => {
    const element = host.current!, renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(element.clientWidth, element.clientHeight);
    element.appendChild(renderer.domElement);
    const light = modelLight(renderer);
    const scene = modelPreviewScene(renderer), camera = new THREE.PerspectiveCamera(40, element.clientWidth / element.clientHeight, .01, 1000);
    const observer = new ResizeObserver(() => {
      if (!element.clientWidth || !element.clientHeight) return;
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    observer.observe(element);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.addEventListener("change", () => {
      turned.current = {position: camera.position.clone(), target: controls.target.clone()};
      renderer.render(scene, camera);
    });
    controls.addEventListener("start", () => setMoved(true));     // (a drag or the wheel by the user: update() at loading changes it too)
    const context: Viewer = {renderer, scene, camera, controls, light, releaseModel: null};
    viewer.current = context;
    return () => {
      viewer.current = null; observer.disconnect(); controls.dispose(); context.releaseModel?.();
      light.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  // Geometry/colour changes replace the decoded asset, retaining the canvas, environment and controls.
  // Building the same WebGL context and reflection map repeatedly also stalled software-rendered imports.
  useEffect(() => {
    const context = viewer.current!;
    const {renderer, scene, camera, controls, light} = context;
    let stopped = false;
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    const source = file ? URL.createObjectURL(file) : url!;
    void new GLTFLoader().loadAsync(source).then(gltf => {
      const release = () => {
        gltf.scene.removeFromParent();
        for (const g of geometries) g.dispose();
        for (const m of materials) m.dispose();
        for (const t of textures) t.dispose();
      };
      gltf.scene.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        geometries.add(node.geometry);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      if (stopped || viewer.current !== context) { release(); return; }
      modelEnvironment(materials, light.texture);
      context.releaseModel?.(); context.releaseModel = release;
      scene.add(gltf.scene);
      const bounds = new THREE.Box3().setFromObject(gltf.scene), middle = bounds.getCenter(new THREE.Vector3());
      const size = Math.max(...bounds.getSize(new THREE.Vector3()).toArray(), .01);
      camera.position.copy(turned.current?.position ?? middle.clone().add(new THREE.Vector3(size * .3, size * .15, size * 1.8)));
      controls.target.copy(turned.current?.target ?? middle);
      controls.minDistance = size * .2; controls.maxDistance = size * 8;
      camera.near = size / 1000; camera.far = size * 20; camera.updateProjectionMatrix();
      controls.update();
      renderer.render(scene, camera);
    }).catch(() => {});
    return () => {
      stopped = true;
      if (file) URL.revokeObjectURL(source);
    };
  }, [url, file]);
  return <div className={styles.preview} style={height ? {height} : undefined} aria-label="Model preview">
    <div className={styles.canvas} ref={host} />
    {!moved && <span className={styles.hint}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Drag to turn · wheel to zoom</span>}
  </div>;
}
