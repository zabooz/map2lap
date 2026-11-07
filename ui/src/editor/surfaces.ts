// Painted ground selection: an overlay shares the ground's geometry, including live height edits, and owns only its masks.
import * as THREE from "three";

export interface SurfaceSelection {
  material: string;
  truncated: boolean;
  tiles: {tile: [number, number]; mask: string}[];
  meshes?: {mesh: number; faces: number[]}[];
  materials?: string[];
}

export interface SurfacePoint {
  mesh: number;
  u: number;
  v: number;
  revision: string;
  whole?: boolean;
  face?: number;
  object?: string | null;
}

const NAMES: Record<string, string> = {
  road_asphalt: "Asphalt", road_concrete: "Concrete", road_cobble: "Cobblestones", road_gravel: "Gravel", road_dirt: "Dirt road",
  gc_meadow: "Meadow", gc_lawn: "Lawn", gc_forest: "Forest ground", gc_shrub: "Shrubland", gc_rock: "Rock face", gc_scree: "Scree",
  gc_sand: "Sand", gc_snow: "Snow", gc_alpine: "Alpine ground", gc_wetland: "Wetland", gc_urban: "Urban ground", gc_residential: "Residential ground",
  gc_yard: "Yard", gc_dirt: "Bare soil", gc_orchard: "Orchard", gc_vineyard: "Vineyard", gc_garden: "Garden", gc_pitch: "Grass pitch",
  gc_clay: "Clay", gc_court: "Hard court", gc_acrylic: "Acrylic court", gc_tartan: "Running track", gc_cemetery: "Cemetery ground",
  water: "Painted water", stream_bank: "Stream bank", stream_bed: "Dry stream bed", pitch_line: "Pitch markings",
  edge_dirt: "Road verge",
};
export const surfaceName = (material: string) => /^gc_field\d*$/.test(material) ? "Field" : NAMES[material] ?? material;

export function groundTile(name: string): string | null {
  const match = /^1(?:ROAD|GRASS|GRAVEL)_ground_(-?\d+)_(-?\d+)(?:_\d+)?$/.exec(name);
  return match ? `${match[1]}_${match[2]}` : null;
}

function maskBytes(mask: string) {
  const bytes = Uint8Array.from(atob(mask.slice(0, 44)), c => c.charCodeAt(0));
  const header = new DataView(bytes.buffer);
  const width = header.getUint32(16), height = header.getUint32(20);
  if (!width || !height || width > 2048 || height > 2048) throw new Error("Invalid ground mask");
  return width * height * 4 * 2; // decoded RGBA bitmap and GPU copy; masks have no mipmaps
}

async function decodeMask(mask: string) {
  const bytes = Uint8Array.from(atob(mask), c => c.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes]), {imageOrientation: "none", premultiplyAlpha: "none"});
  const texture = new THREE.Texture(bitmap);
  texture.flipY = false;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function disposeTexture(texture: THREE.Texture) {
  (texture.image as {close?: () => void} | undefined)?.close?.();
  texture.dispose();
}

/** Owns a read-only selection's masks, with cancellable decoding and the viewer's memory budget. */
export class SurfaceOverlay {
  private version = 0;
  private masks = new Map<string, string>();
  private sources = new Set<THREE.Mesh>();
  private overlays = new Map<THREE.Mesh, THREE.Mesh>();
  private materials = new Map<string, {material: THREE.MeshBasicMaterial; bytes: number}>();
  private pending = new Map<string, Promise<void>>();
  private allocations = new Set<{bytes: number}>();
  private faces = new Map<number, number[]>();
  private faceOverlays = new Map<THREE.Mesh, {overlay: THREE.Mesh; faces: number[]; stamp: number; indexStamp: number}>();

  constructor(private scene: THREE.Scene, private changed: () => void, private reserve: (bytes: number) => boolean,
              private release: (bytes: number) => void, private decode: (mask: string) => Promise<THREE.Texture> = decodeMask) {}

  async set(selection: SurfaceSelection | null, meshes: THREE.Mesh[]) {
    this.clear();
    if (!selection) return;
    this.masks = new Map(selection.tiles.map(t => [`${t.tile[0]}_${t.tile[1]}`, t.mask]));
    this.faces = new Map((selection.meshes ?? []).map(m => [m.mesh, m.faces]));
    const version = this.version;
    // Decode only tiles with loaded ground, sequentially: each full-resolution mask needs a decoded bitmap and GPU copy.
    for (const mesh of meshes) {
      if (version !== this.version) return;
      await this.add(mesh);
    }
  }

  async add(source: THREE.Mesh) {
    const selectedFaces = this.faces.get(source.userData.info?.i);
    if (selectedFaces) { this.attachFaces(source, selectedFaces); return; }
    const key = groundTile(source.name);
    if (!key || !this.masks.has(key)) return;
    this.sources.add(source);
    const found = this.materials.get(key);
    if (found) { this.attach(source, found.material); return; }
    if (this.pending.has(key)) return this.pending.get(key);
    const version = this.version, mask = this.masks.get(key)!, bytes = maskBytes(mask);
    if (!this.reserve(bytes)) throw new Error("Not enough preview memory to highlight this surface. Increase the limit in Settings.");
    const allocation = {bytes};
    this.allocations.add(allocation);
    const promise = (async () => {
      let owned = false;
      try {
        const texture = await this.decode(mask);
        if (version !== this.version) { disposeTexture(texture); return; }
        const material = new THREE.MeshBasicMaterial({color: 0x279fff, alphaMap: texture, opacity: 0.45, transparent: true,
          side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
        this.materials.set(key, {material, bytes});
        owned = true;
        for (const mesh of this.sources) if (groundTile(mesh.name) === key) this.attach(mesh, material);
      } finally {
        if (!owned) this.free(allocation);
        if (version === this.version) this.pending.delete(key);
      }
    })();
    this.pending.set(key, promise);
    return promise;
  }

  private attach(source: THREE.Mesh, material: THREE.MeshBasicMaterial) {
    if (this.overlays.has(source)) return;
    const overlay = new THREE.Mesh(source.geometry, material);
    overlay.renderOrder = 5;
    overlay.visible = source.visible;
    this.overlays.set(source, overlay);
    this.scene.add(overlay);
    this.changed();
  }

  follow() {
    for (const [source, overlay] of this.overlays) overlay.visible = source.visible;
    for (const [source, item] of this.faceOverlays) {
      item.overlay.visible = source.visible;
      const position = source.geometry.getAttribute("position");
      const stamp = "data" in position ? position.data.version : position.version;
      if (stamp !== item.stamp) {
        for (const name of Object.keys(source.geometry.attributes)) {
          const from = source.geometry.getAttribute(name), to = item.overlay.geometry.getAttribute(name);
          for (let k = 0; k < from.count; k++) for (let c = 0; c < from.itemSize; c++) to.setComponent(k, c, from.getComponent(k, c));
          to.needsUpdate = true;
        }
        item.overlay.geometry.computeBoundingSphere();
        item.stamp = stamp;
      }
      const indices = source.geometry.getIndex()!;
      if (indices.version !== item.indexStamp) {
        const out = item.overlay.geometry.getIndex()!;
        item.faces.forEach((face, k) => { for (let c = 0; c < 3; c++) out.setX(k * 3 + c, indices.getX(face * 3 + c)); });
        out.needsUpdate = true;
        item.indexStamp = indices.version;
      }
      const material = item.overlay.material as THREE.MeshBasicMaterial;
      const original = source.material as THREE.MeshLambertMaterial;
      if (material.map !== original.map) { material.map = original.map; material.needsUpdate = true; }
    }
  }

  private attachFaces(source: THREE.Mesh, faces: number[]) {
    if (this.faceOverlays.has(source)) return;
    const bytes = ((source.userData.info?.vertices ?? source.geometry.getAttribute("position").count) * 44 + faces.length * 6) * 2;
    if (!this.reserve(bytes)) throw new Error("Not enough preview memory to highlight this material. Increase the limit in Settings.");
    const allocation = {bytes};
    this.allocations.add(allocation);
    try {
      const geometry = source.geometry.clone(), original = source.geometry.getIndex()!;
      geometry.setIndex(faces.flatMap(face => [0, 1, 2].map(c => original.getX(face * 3 + c))));
      const sourceMaterial = source.material as THREE.MeshLambertMaterial;
      const material = new THREE.MeshBasicMaterial({color: 0x279fff, map: sourceMaterial.map, alphaTest: sourceMaterial.alphaTest,
        opacity: 0.55, transparent: true, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2});
      const overlay = new THREE.Mesh(geometry, material);
      overlay.renderOrder = 5;
      this.faceOverlays.set(source, {overlay, faces, stamp: -1, indexStamp: -1});
      this.scene.add(overlay);
      this.follow();
      this.changed();
    } catch (e) { this.free(allocation); throw e; }
  }

  private free(allocation: {bytes: number}) {
    if (this.allocations.delete(allocation)) this.release(allocation.bytes);
  }

  clear() {
    this.version++;
    for (const overlay of this.overlays.values()) this.scene.remove(overlay);
    for (const {overlay} of this.faceOverlays.values()) {
      this.scene.remove(overlay);
      overlay.geometry.dispose();
      (overlay.material as THREE.Material).dispose();
    }
    for (const {material} of this.materials.values()) {
      disposeTexture(material.alphaMap!);
      material.dispose();
    }
    for (const allocation of this.allocations) this.free(allocation);
    this.overlays.clear(); this.materials.clear(); this.masks.clear(); this.sources.clear(); this.pending.clear();
    this.faces.clear(); this.faceOverlays.clear();
    this.changed();
  }
}
