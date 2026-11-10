import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {modelEnvironment} from "./modelLighting";

interface Binding {id: string; asset: string}
interface Asset {url: string; material_lighting?: string; material_colours?: string; source_url?: string}
interface Loaded {root: THREE.Group; bytes: number; geometryCpuBytes: number; geometryGpuBytes: number; textureCpuEstimate: number; textureGpuEstimate: number;
  geometries: Set<THREE.BufferGeometry>; materials: Set<THREE.Material>; textures: Set<THREE.Texture>; center: THREE.Vector3; released?: boolean}

/** Referenced triangles only: unused accessor vertices must not enlarge selection or culling bounds. */
function modelBounds(root: THREE.Group) {
  const bounds = new THREE.Box3(), point = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    const position = node.geometry.getAttribute("position"), index = node.geometry.index;
    for (let k = 0; k < (index?.count ?? position.count); k++) {
      point.fromBufferAttribute(position, index ? index.getX(k) : k).applyMatrix4(node.matrixWorld);
      bounds.expandByPoint(point);
    }
  });
  return bounds;
}

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
  return {root, bytes, geometryCpuBytes, geometryGpuBytes, textureCpuEstimate, textureGpuEstimate, geometries, materials, textures, center: modelBounds(root).getCenter(new THREE.Vector3())};
}

function release(asset: Loaded) {
  if (asset.released) return;
  asset.released = true;
  for (const geometry of asset.geometries) geometry.dispose();
  for (const material of asset.materials) material.dispose();
  for (const texture of asset.textures) { texture.dispose(); if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close(); }
}

/** Asset-owned render buffers and photos, shared by all instance clones. Picking uses the same asset buffers and logical instance matrices. */
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
  private members = new Map<string, Set<string>>();     // a batch's key: the instances with a part in it
  private keys = new Map<string, string[]>();           // an instance: each opaque part's batch key
  private slots = new Map<string, number[]>();          // an instance: each opaque part's place in its batch
  private blended = new Map<string, THREE.Mesh[]>();    // an instance: its blended parts, each drawn alone
  private batchBytes = 0;
  private dirty = new Set<string>();                    // instances moved, hidden, shown, added or gone since the last flush

  setEnvironment(texture: THREE.Texture, power = 1) {
    this.environment = texture; this.power = power;
    for (const asset of this.assets.values()) modelEnvironment(asset.materials, texture, power);
  }

  constructor(private scene: THREE.Scene, private load: (url: string) => Promise<THREE.Group> = async url => {
    const gltf = await new GLTFLoader().loadAsync(url);
    gltf.parser.associations.forEach((reference, object) => {
      if (object instanceof THREE.Material) object.userData.modelMaterial = reference?.materials ?? -1;
      if (object instanceof THREE.Mesh && reference?.meshes !== undefined) {
        object.userData.modelPrimitive = gltf.parser.json.meshes.slice(0, reference.meshes)
          .reduce((n: number, mesh: {primitives: unknown[]}) => n + mesh.primitives.length, 0) + (reference.primitives ?? 0);
      }
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

  /** A model's loaded scene before any instance shows it (a brush measures its foot); the next sync that wants it takes it over. */
  async loaded(id: string, description: Asset) {
    this.wanted.add(id);
    return (await this.asset(id, description)).root;
  }

  /** Loads still under way, or loaded for loaded(), that no sync wants any more are let go. */
  private dropUnwanted() {
    for (const [id, pending] of this.pending) void pending.then(asset => {
      if (!this.wanted.has(id) && this.pending.get(id) === pending) { this.pending.delete(id); release(asset); }
    }, () => {});
  }

  private releaseUnused() {
    for (const [id, asset] of this.assets) if (!this.wanted.has(id) && !this.held.has(id)) {
      this.assets.delete(id); release(asset); this.reserve(-asset.bytes);
    }
  }

  stats() {
    return {assets: this.assets.size, instances: this.instances.size,
      pickingGeometryBytes: 0,
      reservedBytes: this.batchBytes + [...this.assets.values()].reduce((sum, asset) => sum + asset.bytes, 0),
      instanceBufferBytes: this.batchBytes, renderBatches: this.batches.size, blendedParts: [...this.blended.values()].reduce((n, parts) => n + parts.length, 0),
      shared: [...this.assets].map(([id, asset]) => ({asset: id,
        instances: [...this.instances.values()].filter(instance => instance.asset === id).length,
        geometryCpuBytes: asset.geometryCpuBytes, geometryGpuBytes: asset.geometryGpuBytes,
        textureCpuEstimate: asset.textureCpuEstimate, textureGpuEstimate: asset.textureGpuEstimate,
        geometries: [...asset.geometries].map(g => g.uuid), materials: [...asset.materials].map(m => m.uuid), textures: [...asset.textures].map(t => t.uuid)}))};
  }

  /** Logical roots stay outside the render scene. Raycasting them uses shared triangles and the original alpha material. */
  intersections(picker: THREE.Raycaster) {
    const hits: THREE.Intersection[] = [];
    for (const {root} of this.instances.values()) {
      if (!root.visible) continue;
      root.updateMatrixWorld(true);
      picker.intersectObject(root, true, hits);
    }
    return hits.sort((a, b) => a.distance - b.distance);
  }

  /** Exact selection bounds from shared vertices, allocated only for the requested object. */
  bounds(id: string) {
    const root = this.instance(id);
    if (!root) return null;
    root.updateMatrixWorld(true);
    return modelBounds(root);
  }

  /** Distance uses the asset's local bounds and current pose, independently of server mesh numbers. */
  cull(camera: THREE.Vector3, removed: Set<string>, distance: number) {
    const center = new THREE.Vector3();
    for (const [id, instance] of this.instances) {
      center.copy(this.assets.get(instance.asset)!.center).applyMatrix4(instance.root.matrix);
      this.visible(id, camera.distanceTo(center) < distance && !removed.has(id + "#0"));
    }
  }

  transforms(matrices: Record<string, number[]>) {
    for (const [id, values] of Object.entries(matrices)) {
      const root = this.instance(id);
      if (root) { root.matrix.fromArray(values); root.matrixWorldNeedsUpdate = true; this.dirty.add(id); }
    }
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
      if (version === this.version) { this.wanted = new Set(this.assets.keys()); this.dropUnwanted(); }
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
    const before = new Map(this.instances), dirty = new Set(this.dirty), beforeMatrices = new Map([...before].map(([id, i]) => [id, i.root.matrix.clone()]));
    const wanted = new Map(bindings.map(b => [b.id, b.asset]));
    for (const [id, instance] of this.instances) if (wanted.get(id) !== instance.asset) {
      this.instances.delete(id); this.dirty.add(id);
    }
    for (const binding of bindings) {
      let instance = this.instances.get(binding.id);
      if (!instance) {
        const root = loaded.get(binding.asset)!.root.clone(true);
        root.matrixAutoUpdate = false;
        root.traverse(node => { node.receiveShadow = true; node.userData.modelInstance = binding.id; });
        instance = {asset: binding.asset, root}; this.instances.set(binding.id, instance); this.dirty.add(binding.id);
      }
      // (an index reload hands every matrix again: only an instance that moved is drawn anew)
      const matrix = new THREE.Matrix4().fromArray(matrices[binding.id]);
      if (!instance.root.matrix.equals(matrix)) { instance.root.matrix.copy(matrix); instance.root.matrixWorldNeedsUpdate = true; this.dirty.add(binding.id); }
    }
    try { this.flush(); }
    catch (error) {
      this.instances = before;
      for (const [id, matrix] of beforeMatrices) { this.instances.get(id)!.root.matrix.copy(matrix); this.instances.get(id)!.root.matrixWorldNeedsUpdate = true; }
      this.wanted = new Set([...before.values()].map(i => i.asset));
      for (const [id, asset] of additions) { this.assets.delete(id); release(asset); }
      if (bytes) this.reserve(-bytes);
      this.dirty = dirty;
      throw error;
    }
    this.releaseUnused(); this.dropUnwanted();
    if (this.report) {
      performance.clearMarks("map2lap.models.resources");
      performance.mark("map2lap.models.resources", {detail: this.stats()});
    }
  }

  visible(id: string, visible: boolean) { const instance = this.instance(id); if (instance && instance.visible !== visible) { instance.visible = visible; this.dirty.add(id); } }

  /** An instance's parts: each opaque or cutout one under its batch's key (asset, geometry, materials, 256 m cell) with its matrix,
      shrunk to a point where it is hidden, and its shown blended ones as meshes of their own. Pure but for the root's world matrices. */
  private parts(asset: string, root: THREE.Group) {
    const opaque: {key: string; part: THREE.Mesh; matrix: THREE.Matrix4}[] = [], blended: THREE.Mesh[] = [];
    root.updateMatrixWorld(true);
    const p = new THREE.Vector3().setFromMatrixPosition(root.matrix), cell = `${Math.floor(p.x / 256)},${Math.floor(p.z / 256)}`;
    root.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      let visible = root.visible;
      for (let n: THREE.Object3D | null = node; n && n !== root; n = n.parent) visible &&= n.visible;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      if (materials.some(m => m.transparent)) {
        if (!visible) return;
        const part = new THREE.Mesh(node.geometry, node.material); part.matrixAutoUpdate = false;
        part.matrix.copy(node.matrixWorld); part.receiveShadow = true; blended.push(part); return;
      }
      // (a hidden part keeps its slot as a point where it stands: no fragments, and the batch's bounds stay where its plants are)
      const matrix = visible ? node.matrixWorld.clone() : new THREE.Matrix4().makeScale(0, 0, 0).copyPosition(node.matrixWorld);
      opaque.push({key: `${asset}/${node.geometry.uuid}/${materials.map(m => m.uuid).join(",")}/${cell}`, part: node, matrix});
    });
    return {opaque, blended};
  }

  /** Submit repeated opaque/cutout parts per asset and 256 m cell; blended parts retain independent sorting. A model moved within
      its cell, hidden or shown rewrites only its own slots; a batch is built again only when instances leave or join it (one model
      moved among 20,000 plants took 51 ms when all batches were built again, 15 ms when its cell's 5,000 were). */
  flush() {
    if (!this.dirty.size) return;
    const touched = new Set<string>(), parts = new Map<string, ReturnType<ModelDraw["parts"]>>(), stay: string[] = [];
    for (const id of this.dirty) {
      const instance = this.instances.get(id), own = instance ? this.parts(instance.asset, instance.root) : {opaque: [], blended: []};
      const before = this.keys.get(id) ?? [], after = own.opaque.map(o => o.key);
      parts.set(id, own);
      if (instance && this.slots.has(id) && before.length === after.length && before.every((key, i) => key === after[i])) { stay.push(id); continue; }
      for (const key of [...before, ...after]) touched.add(key);
    }
    const members = new Map([...touched].map(key => [key, new Set(this.members.get(key))]));
    for (const [id, own] of parts) if (!stay.includes(id)) {
      for (const key of this.keys.get(id) ?? []) members.get(key)!.delete(id);
      for (const {key} of own.opaque) members.get(key)!.add(id);
    }
    const groups = new Map<string, {part: THREE.Mesh; matrices: THREE.Matrix4[]; slots: [string, number][]}>();
    for (const id of new Set([...members.values()].flatMap(ids => [...ids]))) {
      const instance = this.instances.get(id)!, own = parts.get(id) ?? this.parts(instance.asset, instance.root);
      parts.set(id, own);
      own.opaque.forEach(({key, part, matrix}, i) => {
        if (!touched.has(key)) return;
        const group = groups.get(key) ?? {part, matrices: [] as THREE.Matrix4[], slots: [] as [string, number][]};
        group.matrices.push(matrix); group.slots.push([id, i]); groups.set(key, group);
      });
    }
    // Count the CPU transform buffer and its GPU upload; shared model resources are reserved separately.
    const size = (count: number) => count * 16 * 4 * 2, had = (key: string) => this.batches.get(key)?.instanceMatrix.count ?? 0;
    const delta = [...touched].reduce((n, key) => n - size(had(key)) + (groups.has(key) ? size(Math.max(groups.get(key)!.matrices.length, had(key))) : 0), 0);
    if (delta > 0 && !this.reserve(delta)) throw new Error("The model instances exceed the Editor memory limit");
    for (const key of touched) this.rebuild(key, groups.get(key), members.get(key)!);
    const moved = new Set<THREE.InstancedMesh>();
    for (const id of stay) parts.get(id)!.opaque.forEach(({key, matrix}, i) => {
      const batch = this.batches.get(key)!; batch.setMatrixAt(this.slots.get(id)![i], matrix); moved.add(batch);
    });
    for (const batch of moved) { batch.instanceMatrix.needsUpdate = true; batch.computeBoundingSphere(); }
    for (const [id, own] of parts) if (this.dirty.has(id)) {
      for (const mesh of this.blended.get(id) ?? []) this.scene.remove(mesh);
      for (const mesh of own.blended) this.scene.add(mesh);
      if (this.instances.has(id)) { this.keys.set(id, own.opaque.map(o => o.key)); this.blended.set(id, own.blended); }
      else { this.keys.delete(id); this.blended.delete(id); this.slots.delete(id); }
    }
    if (delta < 0) this.reserve(delta);
    this.batchBytes += delta; this.dirty.clear();
  }

  /** One batch drawn anew from its group (none: it goes), in a larger buffer only when its instances outgrew the old one;
      each part's slot in it is noted for later moves. */
  private rebuild(key: string, group: {part: THREE.Mesh; matrices: THREE.Matrix4[]; slots: [string, number][]} | undefined, members: Set<string>) {
    const old = this.batches.get(key);
    if (!group || old && old.instanceMatrix.count < group.matrices.length) {
      if (old) { this.scene.remove(old); old.dispose(); }
      this.batches.delete(key); this.members.delete(key);
      if (!group) return;
    }
    let batch = this.batches.get(key);
    if (!batch) {
      batch = new THREE.InstancedMesh(group.part.geometry, group.part.material, group.matrices.length);
      batch.receiveShadow = true; batch.matrixAutoUpdate = false; batch.userData.modelBatch = true;
      this.scene.add(batch); this.batches.set(key, batch);
    }
    group.matrices.forEach((m, i) => batch.setMatrixAt(i, m)); batch.count = group.matrices.length;
    group.slots.forEach(([id, part], i) => { const slots = this.slots.get(id) ?? []; slots[part] = i; this.slots.set(id, slots); });
    batch.instanceMatrix.needsUpdate = true; batch.computeBoundingSphere();
    this.members.set(key, members);
  }

  nudge(id: string, pivot: number[], transform: THREE.Matrix4, initial?: THREE.Matrix4) {
    const root = this.instance(id);
    if (!root) return;
    if (initial) root.matrix.copy(initial);
    root.matrix.premultiply(new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]))
      .premultiply(transform).premultiply(new THREE.Matrix4().makeTranslation(...pivot as [number, number, number]));
    root.matrixWorldNeedsUpdate = true;
    this.dirty.add(id);
  }

  dispose() {
    this.version++;
    this.wanted.clear();
    for (const instance of this.instances.values()) this.scene.remove(instance.root);
    this.instances.clear();
    for (const batch of this.batches.values()) { this.scene.remove(batch); batch.dispose(); }
    for (const parts of this.blended.values()) for (const mesh of parts) this.scene.remove(mesh);
    this.batches.clear(); this.blended.clear(); this.members.clear(); this.keys.clear(); this.slots.clear(); this.dirty.clear();
    this.reserve(-this.batchBytes); this.batchBytes = 0;
    for (const asset of this.assets.values()) { release(asset); this.reserve(-asset.bytes); }
    this.assets.clear();
    this.held.clear();
    for (const pending of this.pending.values()) void pending.then(release, () => {});
    this.pending.clear();
  }
}
