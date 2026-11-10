import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {modelEnvironment} from "./modelLighting";

interface Binding {id: string; asset: string}
interface Asset {url: string; material_lighting?: string; material_colours?: string; source_url?: string}
interface Loaded {root: THREE.Group; bytes: number; geometryCpuBytes: number; geometryGpuBytes: number; textureCpuEstimate: number; textureGpuEstimate: number;
  geometries: Set<THREE.BufferGeometry>; materials: Set<THREE.Material>; textures: Set<THREE.Texture>; picking: Map<number, THREE.Material>; released?: boolean}

function resources(root: THREE.Group): Loaded {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  let geometryCpuBytes = 0, geometryGpuBytes = 0, textureCpuEstimate = 0, textureGpuEstimate = 0;
  const arrays = new Set<ArrayBufferLike>();
  const uploads = new Set<THREE.BufferAttribute | THREE.InterleavedBuffer>();
  for (const geometry of geometries) for (const attribute of [...Object.values(geometry.attributes), geometry.index]) {
    if (!attribute) continue;
    const array = attribute instanceof THREE.InterleavedBufferAttribute ? attribute.data.array : attribute.array;
    if (!arrays.has(array.buffer)) { arrays.add(array.buffer); geometryCpuBytes += array.buffer.byteLength; }
    const upload = attribute instanceof THREE.InterleavedBufferAttribute ? attribute.data : attribute;
    if (!uploads.has(upload)) { uploads.add(upload); geometryGpuBytes += upload.array.byteLength; }
  }
  for (const texture of textures) {
    const image = texture.image as {width?: number; height?: number} | undefined;
    if (image?.width && image?.height) {
      textureCpuEstimate += image.width * image.height * 4;
      textureGpuEstimate += Math.ceil(image.width * image.height * 4 * (texture.generateMipmaps ? 4 / 3 : 1));
    }
  }
  const bytes = geometryCpuBytes + geometryGpuBytes + textureCpuEstimate + textureGpuEstimate;
  return {root, bytes, geometryCpuBytes, geometryGpuBytes, textureCpuEstimate, textureGpuEstimate, geometries, materials, textures, picking: new Map()};
}

function release(asset: Loaded) {
  if (asset.released) return;
  asset.released = true;
  for (const geometry of asset.geometries) geometry.dispose();
  for (const material of asset.materials) material.dispose();
  for (const material of asset.picking.values()) material.dispose();
  for (const texture of asset.textures) { texture.dispose(); if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close(); }
}

/** Asset-owned render buffers and photos, shared by all instance clones. CPU picking meshes belong to the ordinary editor. */
export class ModelDraw {
  private assets = new Map<string, Loaded>();
  private pending = new Map<string, Promise<Loaded>>();
  private instances = new Map<string, {asset: string; root: THREE.Group}>();
  private version = 0;
  private wanted = new Set<string>();
  private held = new Map<string, number>();
  private environment: THREE.Texture | null = null;
  private power = 1;
  private batches = new Map<string, THREE.InstancedMesh>();
  private blended: THREE.Mesh[] = [];
  private batchBytes = 0;
  private changed = true;

  setEnvironment(texture: THREE.Texture, power = 1) {
    this.environment = texture; this.power = power;
    for (const asset of this.assets.values()) modelEnvironment(asset.materials, texture, power);
  }

  constructor(private scene: THREE.Scene, private load: (url: string) => Promise<THREE.Group> = async url => {
    const gltf = await new GLTFLoader().loadAsync(url);
    gltf.parser.associations.forEach((reference, object) => {
      if (object instanceof THREE.Material) object.userData.modelMaterial = reference?.materials ?? -1;
    });
    return gltf.scene;
  },
              private reserve: (bytes: number) => boolean = () => true,
              private report = true) {}

  instance(id: string) { return this.instances.get(id)?.root; }

  /** Hold a Copy source's shared images even when Revert removes its binding. Release is idempotent. */
  hold(instance: string) {
    const id = this.instances.get(instance)?.asset;
    if (!id) return () => {};
    this.held.set(id, (this.held.get(id) ?? 0) + 1);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      const count = (this.held.get(id) ?? 1) - 1;
      if (count) this.held.set(id, count); else this.held.delete(id);
      this.releaseUnused();
    };
  }

  private releaseUnused() {
    for (const [id, asset] of this.assets) if (!this.wanted.has(id) && !this.held.has(id)) {
      this.assets.delete(id); release(asset); this.reserve(-asset.bytes);
    }
  }

  stats() {
    return {assets: this.assets.size, instances: this.instances.size,
      reservedBytes: this.batchBytes + [...this.assets.values()].reduce((sum, asset) => sum + asset.bytes, 0),
      instanceBufferBytes: this.batchBytes, renderBatches: this.batches.size, blendedParts: this.blended.length,
      shared: [...this.assets].map(([id, asset]) => ({asset: id,
        instances: [...this.instances.values()].filter(instance => instance.asset === id).length,
        geometryCpuBytes: asset.geometryCpuBytes, geometryGpuBytes: asset.geometryGpuBytes,
        textureCpuEstimate: asset.textureCpuEstimate, textureGpuEstimate: asset.textureGpuEstimate,
        geometries: [...asset.geometries].map(g => g.uuid), materials: [...asset.materials].map(m => m.uuid), textures: [...asset.textures].map(t => t.uuid)}))};
  }

  picking(asset: string, index: number): THREE.Material {
    const loaded = this.assets.get(asset)!;
    let material = loaded.picking.get(index);
    if (!material) {
      const original = [...loaded.materials].find(m => (m.userData.modelMaterial ?? -1) === index) ?? [...loaded.materials][0];
      material = original.clone(); material.visible = false; loaded.picking.set(index, material);
    }
    return material;
  }

  transforms(matrices: Record<string, number[]>) {
    for (const [id, values] of Object.entries(matrices)) {
      const root = this.instance(id);
      if (root) { root.matrix.fromArray(values); root.matrixWorldNeedsUpdate = true; }
    }
    this.changed = true;
  }

  private async asset(id: string, description: Asset) {
    const active = this.assets.get(id);
    if (active) return active;
    let pending = this.pending.get(id);
    if (!pending) {
      pending = this.load(description.url).then(resources).then(asset => {
        // Earlier Map2Lap Kenney palette packages predate the explicit matte flag. Their retained provenance
        // selects the same material response without rewriting a saved GLB, draft binding or object pose.
        const matte = description.material_lighting === "matte" || (description.material_lighting === undefined
          && description.material_colours === "srgb" && description.source_url === "https://kenney.nl/assets/nature-kit");
        if (matte) for (const material of asset.materials) if (material instanceof THREE.MeshStandardMaterial) {
          material.userData.map2lap = {...material.userData.map2lap, lighting: "matte"};
        }
        if (this.environment) modelEnvironment(asset.materials, this.environment, this.power);
        const own = this.pending.get(id) === pending;
        if (!own || !this.wanted.has(id)) {
          if (own) this.pending.delete(id);
          release(asset);
        }
        return asset;
      }).catch(error => { if (this.pending.get(id) === pending) this.pending.delete(id); throw error; });
      this.pending.set(id, pending);
    }
    return pending;
  }

  async sync(bindings: Binding[], descriptions: Record<string, Asset>, matrices: Record<string, number[]>) {
    const version = ++this.version, ids = new Set(bindings.map(b => b.asset));
    this.wanted = ids;
    let loaded: Map<string, Loaded>;
    try {
      loaded = new Map(await Promise.all([...ids].map(async id => [id, await this.asset(id, descriptions[id])] as const)));
    } catch (error) {
      if (version === this.version) {
        this.wanted = new Set(this.assets.keys());
        for (const [id, pending] of this.pending) void pending.then(asset => {
          if (!this.wanted.has(id) && this.pending.get(id) === pending) { this.pending.delete(id); release(asset); }
        }, () => {});
      }
      throw error;
    }
    if (version !== this.version) return;
    const additions = [...loaded].filter(([id]) => !this.assets.has(id));
    const bytes = additions.reduce((sum, [, asset]) => sum + asset.bytes, 0);
    if (bytes > 0 && !this.reserve(bytes)) {
      for (const [id, asset] of additions) { this.pending.delete(id); release(asset); }
      throw new Error("The models exceed the Editor memory limit");
    }
    for (const [id, asset] of additions) { this.assets.set(id, asset); this.pending.delete(id); }
    const before = new Map(this.instances), beforeMatrices = new Map([...before].map(([id, i]) => [id, i.root.matrix.clone()]));
    const wanted = new Map(bindings.map(b => [b.id, b.asset]));
    for (const [id, instance] of this.instances) if (wanted.get(id) !== instance.asset) {
      this.instances.delete(id);
    }
    for (const binding of bindings) {
      let instance = this.instances.get(binding.id);
      if (!instance) {
        const root = loaded.get(binding.asset)!.root.clone(true);
        root.matrixAutoUpdate = false;
        root.traverse(node => { node.receiveShadow = true; });
        instance = {asset: binding.asset, root}; this.instances.set(binding.id, instance);
      }
      instance.root.matrix.fromArray(matrices[binding.id]); instance.root.matrixWorldNeedsUpdate = true;
    }
    this.changed = true;
    try { this.flush(); }
    catch (error) {
      this.instances = before;
      for (const [id, matrix] of beforeMatrices) { this.instances.get(id)!.root.matrix.copy(matrix); this.instances.get(id)!.root.matrixWorldNeedsUpdate = true; }
      this.wanted = new Set([...before.values()].map(i => i.asset));
      for (const [id, asset] of additions) { this.assets.delete(id); release(asset); }
      if (bytes) this.reserve(-bytes);
      this.changed = false;
      throw error;
    }
    this.releaseUnused();
    if (this.report) {
      performance.clearMarks("map2lap.models.resources");
      performance.mark("map2lap.models.resources", {detail: this.stats()});
    }
  }

  visible(id: string, visible: boolean) { const instance = this.instance(id); if (instance && instance.visible !== visible) { instance.visible = visible; this.changed = true; } }

  /** Submit repeated opaque/cutout parts per asset and 256 m cell; blended parts retain independent sorting. */
  flush() {
    if (!this.changed) return;
    const groups = new Map<string, {part: THREE.Mesh; matrices: THREE.Matrix4[]; capacity: number}>(), blended: THREE.Mesh[] = [];
    for (const {asset, root} of this.instances.values()) {
      root.updateMatrixWorld(true);
      root.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return;
        let visible = root.visible;
        for (let p: THREE.Object3D | null = node; p && p !== root; p = p.parent) visible &&= p.visible;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        if (materials.some(m => m.transparent)) {
          if (!visible) return;
          const part = new THREE.Mesh(node.geometry, node.material); part.matrixAutoUpdate = false;
          part.matrix.copy(node.matrixWorld); part.receiveShadow = true; blended.push(part); return;
        }
        const p = new THREE.Vector3().setFromMatrixPosition(root.matrix);
        const key = `${asset}/${node.geometry.uuid}/${materials.map(m => m.uuid).join(",")}/${Math.floor(p.x / 256)},${Math.floor(p.z / 256)}`;
        const group = groups.get(key) ?? {part: node, matrices: [] as THREE.Matrix4[], capacity: 0};
        group.capacity++; if (visible) group.matrices.push(node.matrixWorld.clone()); groups.set(key, group);
      });
    }
    const bytes = [...groups].reduce((n, [key, g]) => n + Math.max(g.capacity, this.batches.get(key)?.instanceMatrix.count ?? 0) * 16 * 4 * 2, 0);
    // Count the CPU transform buffer and its GPU upload; shared model resources are reserved separately.
    const delta = bytes - this.batchBytes;
    if (delta > 0 && !this.reserve(delta)) throw new Error("The model instances exceed the Editor memory limit");
    const next = new Map<string, THREE.InstancedMesh>();
    for (const [key, {part, matrices, capacity}] of groups) {
      let batch = this.batches.get(key);
      if (!batch || batch.instanceMatrix.count < capacity) {
        batch = new THREE.InstancedMesh(part.geometry, part.material, capacity);
        batch.receiveShadow = true; batch.matrixAutoUpdate = false; batch.userData.modelBatch = true;
      }
      matrices.forEach((m, i) => batch!.setMatrixAt(i, m)); batch.count = matrices.length;
      batch.instanceMatrix.needsUpdate = true; batch.computeBoundingSphere();
      next.set(key, batch);
    }
    for (const [key, batch] of this.batches) if (next.get(key) !== batch) { this.scene.remove(batch); batch.dispose(); }
    for (const batch of next.values()) if (!batch.parent) this.scene.add(batch);
    for (const mesh of this.blended) this.scene.remove(mesh);
    for (const mesh of blended) this.scene.add(mesh);
    this.batches = next; this.blended = blended;
    if (delta < 0) this.reserve(delta);
    this.batchBytes = bytes; this.changed = false;
  }

  nudge(id: string, pivot: number[], transform: THREE.Matrix4, initial?: THREE.Matrix4) {
    const root = this.instance(id);
    if (!root) return;
    if (initial) root.matrix.copy(initial);
    root.matrix.premultiply(new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]))
      .premultiply(transform).premultiply(new THREE.Matrix4().makeTranslation(...pivot as [number, number, number]));
    root.matrixWorldNeedsUpdate = true;
    this.changed = true;
  }

  dispose() {
    this.version++;
    this.wanted.clear();
    for (const instance of this.instances.values()) this.scene.remove(instance.root);
    this.instances.clear();
    for (const batch of this.batches.values()) { this.scene.remove(batch); batch.dispose(); }
    for (const mesh of this.blended) this.scene.remove(mesh);
    this.batches.clear(); this.blended = [];
    this.reserve(-this.batchBytes); this.batchBytes = 0; this.changed = true;
    for (const asset of this.assets.values()) { release(asset); this.reserve(-asset.bytes); }
    this.assets.clear();
    this.held.clear();
    for (const pending of this.pending.values()) void pending.then(release, () => {});
    this.pending.clear();
  }
}
