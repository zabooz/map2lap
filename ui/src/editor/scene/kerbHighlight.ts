// A selected kerb is tinted on its actual collision geometry, across all of its mesh chunks.
import * as THREE from "three";
import type {MeshInfo} from "../types";

export class KerbHighlight {
  private id: string | null = null;
  private overlays = new Map<THREE.Mesh, THREE.Mesh>();
  private material = new THREE.MeshBasicMaterial({color: "#ffad2f", transparent: true, opacity: 0.55,
    depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1});

  constructor(private scene: THREE.Scene, private changed: () => void) {}

  /** Select all parts of one retained kerb; the source mesh keeps its own texture and pick geometry. */
  set(id: string | null, meshes: THREE.Mesh[]) {
    if (id === this.id && this.overlays.size && meshes.every(mesh => !this.matches(mesh) || this.overlays.has(mesh))) return;
    this.clear();
    this.id = id;
    for (const mesh of meshes) this.add(mesh);
  }

  /** A mesh loaded after selection joins the same highlight. */
  add(mesh: THREE.Mesh) {
    if (!this.matches(mesh) || this.overlays.has(mesh)) return;
    const overlay = new THREE.Mesh(mesh.geometry, this.material);
    overlay.name = "Kerb selection";
    overlay.renderOrder = 12;
    overlay.visible = mesh.visible;
    overlay.raycast = () => {};
    this.scene.add(overlay);
    this.overlays.set(mesh, overlay);
    this.changed();
  }

  /** Release a replaced source mesh before its geometry is disposed. */
  remove(mesh: THREE.Mesh) {
    const overlay = this.overlays.get(mesh);
    if (!overlay) return;
    this.scene.remove(overlay);
    this.overlays.delete(mesh);
    this.changed();
  }

  follow() { for (const [mesh, overlay] of this.overlays) overlay.visible = mesh.visible; }

  clear() {
    for (const mesh of this.overlays.keys()) this.remove(mesh);
    this.id = null;
  }

  dispose() { this.clear(); this.material.dispose(); }

  private matches(mesh: THREE.Mesh) { return !!this.id && (mesh.userData.info as MeshInfo | undefined)?.kerb_id === this.id; }
}
