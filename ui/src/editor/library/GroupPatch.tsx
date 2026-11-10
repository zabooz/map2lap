import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import styles from "./ModelPreview.module.css";
import {modelEnvironment, modelLight, modelPreviewScene} from "../scene/modelLighting";
import {patchPlants} from "./groupMix";
import type {GroupEntry} from "../tools/scatter";
import type {LibraryModel} from "./ModelLibrary";

interface Loaded {root: THREE.Object3D; width: number; materials: Set<THREE.Material>}
interface Stage {render: () => void; fit: (box: THREE.Box3) => void; load: (model: LibraryModel) => Promise<Loaded>; patch: THREE.Group;
  glow: (model: string | null) => void}

const GROUND = 0x7d8f74;     // (a muted meadow under the patch, so the objects stand on something in both appearances)
const GLOW = new THREE.Color(0x2fd3c0), GLOW_POWER = .55;     // (the object whose row is pointed at: lit in the accent's petrol)

/** The group's mixture as a small patch of ground with its objects (groupMix.patchPlants), turned by dragging and zoomed by the wheel:
    entries the group's, models its library models by id, randomPosition the group's. Each model is loaded once while the preview stands; a changed weight or size
    sets the patch anew, the view stays where it was turned. highlight: the model whose copies light up. */
export function GroupPatch({entries, models, randomPosition = true, highlight = null, className}: {entries: GroupEntry[]; models: Record<string, LibraryModel>;
  randomPosition?: boolean; highlight?: string | null; className?: string}) {
  const host = useRef<HTMLDivElement>(null), stage = useRef<Stage | null>(null);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const element = host.current!, renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(element.clientWidth || 1, element.clientHeight || 1);
    element.appendChild(renderer.domElement);
    const light = modelLight(renderer), scene = modelPreviewScene(renderer);
    const camera = new THREE.PerspectiveCamera(40, (element.clientWidth || 1) / (element.clientHeight || 1), .01, 5000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    let turned = false;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    controls.addEventListener("start", () => { turned = true; setMoved(true); });
    const observer = new ResizeObserver(() => {
      if (!element.clientWidth || !element.clientHeight) return;
      renderer.setSize(element.clientWidth, element.clientHeight);
      camera.aspect = element.clientWidth / element.clientHeight; camera.updateProjectionMatrix(); render();
    });
    observer.observe(element);
    const patch = new THREE.Group(); scene.add(patch);
    const loaded = new Map<string, Promise<Loaded>>(), ready = new Map<string, Loaded>(), resources = new Set<{dispose: () => void}>();
    let lit: string | null = null;
    const paint = () => {
      for (const [id, {materials}] of ready) for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        const own = material.userData.ownGlow ??= {colour: material.emissive.clone(), power: material.emissiveIntensity};
        if (id === lit) { material.emissive.copy(GLOW); material.emissiveIntensity = GLOW_POWER; }
        else { material.emissive.copy(own.colour); material.emissiveIntensity = own.power; }
      }
      render();
    };
    const glow = (model: string | null) => { lit = model; paint(); };
    const load = (model: LibraryModel) => {
      let root = loaded.get(model.id);
      if (!root) {
        root = new GLTFLoader().loadAsync(`/api/library/models/${model.id}/original`).then(gltf => {
          const materials = new Set<THREE.Material>();
          gltf.scene.traverse(node => {
            if (!(node instanceof THREE.Mesh)) return;
            resources.add(node.geometry);
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
              materials.add(material); resources.add(material);
              for (const value of Object.values(material)) if (value instanceof THREE.Texture) resources.add(value);
            }
          });
          modelEnvironment(materials, light.texture);
          const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
          return {root: gltf.scene, width: Math.max(size.x, size.z) * model.metres_per_unit, materials};
        });
        void root.then(value => { ready.set(model.id, value); paint(); }, () => {});
        loaded.set(model.id, root); root.catch(() => loaded.delete(model.id));
      }
      return root;
    };
    const fit = (box: THREE.Box3) => {
      if (box.isEmpty()) { render(); return; }
      const middle = box.getCenter(new THREE.Vector3()), size = Math.max(...box.getSize(new THREE.Vector3()).toArray(), .01);
      if (!turned) {
        // (the whole patch in view from a little above, also in a narrow picture: its width then sets the distance; seen from above, a
        // wide picture's height holds the flattened round of ground, so it comes closer)
        const distance = size / 2 / Math.tan(camera.fov * Math.PI / 360) / Math.min(1, camera.aspect) * 1.15 * Math.min(1, .5 + .5 / camera.aspect);
        camera.position.copy(middle).add(new THREE.Vector3(0, .4, 1).normalize().multiplyScalar(distance));
        controls.target.copy(middle);
      }
      controls.minDistance = size * .2; controls.maxDistance = size * 8;
      camera.near = size / 1000; camera.far = size * 40; camera.updateProjectionMatrix();
      controls.update(); render();
    };
    stage.current = {render, fit, load, patch, glow};
    return () => {
      stage.current = null; observer.disconnect(); controls.dispose();
      for (const resource of resources) resource.dispose();
      patch.traverse(node => { if (node.userData.ground) { (node as THREE.Mesh).geometry.dispose(); ((node as THREE.Mesh).material as THREE.Material).dispose(); } });
      light.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  const key = JSON.stringify(entries), known = entries.filter(e => models[e.model]).map(e => e.model).join(",");
  useEffect(() => {
    const now = stage.current; if (!now) return;
    let stopped = false;
    const shown = entries.filter(e => models[e.model] && e.weight > 0);
    void Promise.all(shown.map(e => now.load(models[e.model]).then(loaded => [e.model, loaded] as const).catch(() => null))).then(pairs => {
      if (stopped || stage.current !== now) return;
      const ready = new Map(pairs.filter(p => p !== null));
      for (const child of [...now.patch.children]) {
        now.patch.remove(child);
        if (child.userData.ground) { (child as THREE.Mesh).geometry.dispose(); ((child as THREE.Mesh).material as THREE.Material).dispose(); }
      }
      const usable = shown.filter(e => ready.has(e.model));
      if (!usable.length) { now.fit(new THREE.Box3()); return; }
      const plants = patchPlants(usable, Object.fromEntries([...ready].map(([id, l]) => [id, l.width])), randomPosition);
      for (const p of plants) {
        const model = models[p.model], copy = ready.get(p.model)!.root.clone(), scale = model.metres_per_unit * p.scale;
        copy.matrixAutoUpdate = false;
        copy.matrix.makeTranslation(p.x, 0, p.z).multiply(new THREE.Matrix4().makeRotationY(p.turn * Math.PI / 180))
          .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
          .multiply(new THREE.Matrix4().makeTranslation(-model.anchor[0], -model.anchor[1], -model.anchor[2]));
        now.patch.add(copy);
      }
      const box = new THREE.Box3().setFromObject(now.patch), reach = Math.max(...plants.map(p => Math.hypot(p.x, p.z)), .5) * 1.25;
      const ground = new THREE.Mesh(new THREE.CircleGeometry(reach, 48), new THREE.MeshStandardMaterial({color: GROUND, roughness: 1}));
      ground.rotation.x = -Math.PI / 2; ground.userData.ground = true; now.patch.add(ground);
      now.fit(box.union(new THREE.Box3().setFromObject(ground)));
    });
    return () => { stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Entries by value: a new array of the same mixture sets no new patch.
  }, [key, known, randomPosition]);

  useEffect(() => { stage.current?.glow(highlight); }, [highlight]);

  return <div className={`${styles.preview} ${className ?? ""}`} aria-label="Group preview" data-highlight={highlight ?? undefined}>
    <div className={styles.canvas} ref={host} />
    {!moved && <span className={styles.hint}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Drag to turn · wheel to zoom</span>}
  </div>;
}
