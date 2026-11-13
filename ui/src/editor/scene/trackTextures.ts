// The textures and materials of the track the view shows: the images it loads (at most TEXTURES_AT_A_TIME on their way),
// the materials of its meshes, painted ground (Apply, Undo, Save's draft) and the edited ground drawn by GroundFrame. They
// count against the view's memory limit and are dropped by clear() when another track opens.
import * as THREE from "three";
import type {MaterialInfo, TrackIndex} from "../types";
import {makeTexture} from "./texture";
import {oneByOne} from "./taskQueue";
import {COPIES, decodedBytes} from "./inspect";
import {fetchBytes, fetchJson} from "./requests";
import {WeightBundles} from "./weightBundle";
import {GroundFrame, GroundLayer} from "./groundRender";
import {bindLightShares, takesGroundLight} from "./lightShare";
import {classicGround} from "./classicLight";
import {bindSeason, seasonNumber} from "./seasons";
import type {Season} from "./weather";
import {bindColourBlend, bindWorldColour, bindSplat, type GroundMaterial, type ColourImage, type ColourSplat, type GroundTextureUpdate} from "./colourBlend";

// Textures on their way or being decoded at a time. A 307 km track up to a limit of 8 GB: 6: 70 s, 12: 52 s, 24: 53 s; 4 GB without any
// limit 34 s against 23 s with 12: hundreds at once stand in the meshes' way.
const TEXTURES_AT_A_TIME = 12;
const textureTurn = oneByOne(TEXTURES_AT_A_TIME);

interface SplatImageEntry {
  done: Promise<THREE.Texture | null>; controller: AbortController; bytes: number; token: number;
  texture?: THREE.Texture; disposed: boolean;
}
interface SplatPending {keys: Set<string>; done: Promise<void>}

/** What TrackTextures needs of the view it serves. */
export interface TextureHost {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  token(): number;                      // the track shown: a new number, what still loads for an older one is dropped
  signal(): AbortSignal;                // what is on its way for the track shown
  trackName(): string;
  data(): TrackIndex | null;            // the track's index as the view has it now
  meshes(): THREE.Mesh[];
  reserve(bytes: number): boolean;      // takes bytes of the memory limit; false: they don't fit, nothing taken
  release(bytes: number): void;
  limited(): void;                      // something stayed out because of the memory limit
  forgetAlpha(texture: THREE.Texture): void;    // the picker's copy of a texture's alpha, and its bytes, are dropped
  changed(): void;                      // the view is to be drawn again
  failed(message: string): void;        // the view shows the fault
}

/** The grey AC multiplies a ground material's colour by: the classic shaders take ksAmbient + ksDiffuse (MaterialInfo.bright),
 * painted or not. Pure. */
export function groundTint(info: MaterialInfo) {
  return Math.min(1, info.bright);
}

/** Whether a material is a generated tile's ground, drawn with its normals and gloss as AC's classic ground (classicGround),
 * painted or not (groundmaterial.is_ground). Pure. */
const isGroundTile = (name: string) => /^ground_-?\d+_-?\d+$/.test(name);

/** The textures and materials of the track a view shows. clear() drops them all. */

export class TrackTextures {
  private season = {value: 1};

  setSeason(season: Season) { this.season.value = seasonNumber(season); this.host.changed(); }
  private pool: (Promise<THREE.Texture | null> | undefined)[] = [];     // the track's textures by index, shared by its materials
  private textureBytes = new WeakMap<THREE.Texture, number>();
  private textureChanges = new Map<number, {abort: () => void; done: Promise<void>; version: string}>();
  private displayedTextures = new Map<number, string>();
  private paintFailure: string | null = null;
  private onChanged: () => void = () => {};
  private paintVersion = 0;
  private paintLoading: AbortController | null = null;
  private onLoaded: (() => void) | null = null;
  private materials: (GroundMaterial | undefined)[] = [];
  private splatImages = new Map<string, SplatImageEntry>();
  private splatBindings = new Map<number, Set<string>>();
  private splatPending = new Map<number, SplatPending>();
  private sourceMaterials = new Map<number, MaterialInfo>();
  private groundLayers = new Map<number, GroundLayer>();
  private groundFrame: GroundFrame | null = null;
  private weightBundles?: WeightBundles;
  private host: TextureHost;

  constructor(host: TextureHost) {
    this.host = host;
  }

  /** onTexturesChanged hears when a texture shown changes (Appearance's image). */
  setChanged(onTexturesChanged: () => void) { this.onChanged = onTexturesChanged; }

  /** loaded hears each texture of the track shown that has arrived (the loading count); null: no one. */
  setLoaded(loaded: (() => void) | null) { this.onLoaded = loaded; }

  /** Generated wall layouts can reuse appended texture/material slots; source slots stay shared. */
  reconcile(before: TrackIndex, after: TrackIndex) {
    this.materials.forEach((material, i) => {
      if (JSON.stringify(before.materials[i]) === JSON.stringify(after.materials[i])) return;
      material?.dispose(); this.materials[i] = undefined; this.sourceMaterials.delete(i);
    });
    this.pool.forEach((texture, i) => {
      if (before.textures[i]?.name === after.textures[i]?.name) return;
      this.pool[i] = undefined;
      this.displayedTextures.delete(i);
      void texture?.then(t => {
        if (!t) return;
        this.host.release(this.textureBytes.get(t) ?? 0); t.dispose();
        if (typeof ImageBitmap !== "undefined" && t.image instanceof ImageBitmap) t.image.close();
      }, () => {});
    });
  }

  /** When the textures asked for so far and the painted ground being prepared have arrived or failed. */
  async settled() {
    await Promise.all(this.pool);
    await Promise.all([...this.splatPending.values()].map(p => p.done));
  }

  /** Edited ground takes sun, moon and ambient as the view has them now. */
  followLights() { this.groundFrame?.followLights(); }

  /** Edited ground drawn for camera, before the scene; a fault is told once. */
  render(camera: THREE.Camera) {
    try { for (const layer of this.groundLayers.values()) layer.follow(); this.groundFrame?.render(camera); }
    catch (error) { const message = String((error as Error).message ?? error); if (message !== this.paintFailure) { this.paintFailure = message; this.host.failed(message); } }
  }

  /** A mesh just added to the scene takes the edited ground of its material. */
  attach(mesh: THREE.Mesh) {
    try { this.groundLayers.get(mesh.userData.info.material)?.attach(mesh); }
    catch (error) { this.paintFailure = String((error as Error).message ?? error); this.host.failed(this.paintFailure); }
  }

  /** All dropped: what still loads is cancelled, textures and materials are freed. */
  clear() {
    for (const layer of this.groundLayers.values()) layer.dispose();
    this.groundLayers.clear(); this.groundFrame?.dispose(); this.groundFrame = null;
    this.paintVersion++;
    this.paintLoading?.abort();
    for (const change of this.textureChanges.values()) change.abort();
    this.textureChanges.clear();
    this.displayedTextures.clear();
    this.paintFailure = null;
    this.onLoaded = null;
    for (const entry of this.splatImages.values()) this.disposeSplatImage(entry);
    this.splatImages.clear();
    this.splatBindings.clear();
    this.splatPending.clear();
    this.sourceMaterials.clear();
    for (const t of this.pool) {
      t?.then(x => {
        if (!x) return;
        const image = x.image;
        x.dispose();
        if (image instanceof ImageBitmap) image.close();    // (dispose frees the graphics card's copy only)
      }, () => {});       // (a failed texture is reported by load)
    }
    for (const m of this.materials) m?.dispose();
    this.pool = [];
    this.materials = [];
  }

  private texture(name: string, data: TrackIndex, i: number) {
    let t = this.pool[i];
    if (!t) {
      const descriptor = {...data.textures[i]};
      if (descriptor.layers) { descriptor.version = ""; descriptor.size = descriptor.source_size ?? descriptor.size; }
      const reserved = COPIES * descriptor.size, mine = this.host.token();
      if (!this.host.reserve(reserved)) {
        this.host.limited();
        return Promise.resolve(null);     // (the mesh stays plain grey)
      }
      const anisotropy = this.host.renderer.capabilities.getMaxAnisotropy();
      const signal = this.host.signal();
      let allocated = reserved;
      let displayedVersion = descriptor.version ?? "";
      t = textureTurn(async () => {
        let bytes: ArrayBuffer;
        try {
          bytes = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}${descriptor.version ? `&p=${descriptor.version}` : ""}`, signal);
        } catch (error) {
          if (!descriptor.version || signal.aborted || mine !== this.host.token()) throw error;
          this.host.failed(`A material edit could not be shown: ${String(error)}. Its original texture is shown; you can discard the edit.`);
          displayedVersion = "";
          bytes = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}`, signal);
        }
        return makeTexture(bytes, descriptor.name, anisotropy, descriptor.linear);
      }, true) // Ordinary images and source tiles go ahead of queued masks and replacement photos.
        .then(made => {
          // (a PNG takes far more decoded than its file says; the next parts see what it really took)
          if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap && mine === this.host.token()) {
            const extra = decodedBytes(made.image.width, made.image.height) - reserved;
            if (!this.host.reserve(extra)) {
              this.host.release(reserved);
              this.host.limited();
              made.dispose();
              made.image.close();
              return null;
            }
            allocated += extra;
          }
          if (mine === this.host.token()) {
            this.textureBytes.set(made, allocated);
            this.displayedTextures.set(i, displayedVersion);
          }
          return made;
        }).then(made => {
          if (mine === this.host.token()) this.onLoaded?.();
          return made;
        });
      this.pool[i] = t;
    }
    return t;
  }

  /** The version of texture i shown now ("": the track's own). */
  version(i: number) { return this.displayedTextures.get(i) ?? ""; }

  /** One acknowledged draft; immutable versions survive unrelated writes and older requests are cancelled. */
  refreshPaints(textures: GroundTextureUpdate[], paints: string[]) {
    this.paintFailure = null;
    this.paintVersion++;
    this.paintLoading?.abort();
    const data = this.host.data();
    if (!data) return;
    data.paints = paints;
    const active = new Set(textures.filter(t => t.version).map(t => t.i));
    const updates = [...textures], explicit = new Set(textures.map(t => t.i));
    data.textures.forEach((t, i) => {
      if (t.version && !active.has(i) && !explicit.has(i)) updates.push({i, size: t.source_size ?? t.size, version: ""});
    });
    for (const next of updates) {
      const descriptor = data.textures[next.i];
      if (!descriptor) continue;
      if (next.layers || descriptor.layers) this.refreshSplat(next);
      else this.refreshTexture(next);
    }
  }

  /** Reconcile an index loaded before the draft. The requested recipe belongs to this tab, never another tab's latest edits. */
  async syncPaints(paints: string[]) {
    const data = this.host.data();
    if (!data || (!this.paintFailure && JSON.stringify(data.paints ?? []) === JSON.stringify(paints))) return;
    const epoch = ++this.paintVersion, mine = this.host.token();
    this.paintLoading?.abort();
    const controller = this.paintLoading = new AbortController();
    try {
      const answer = await fetchJson<{textures: GroundTextureUpdate[]}>(`/api/editor/${encodeURIComponent(this.host.trackName())}/textures`, controller.signal, {method: "POST",
        headers: {"Content-Type": "application/json"}, body: JSON.stringify({base: data.revision, paints})});
      if (controller.signal.aborted || mine !== this.host.token() || epoch !== this.paintVersion) return;
      const active = new Set(answer.textures.map(t => t.i));
      data.textures.forEach((t, i) => { if (t.version && !active.has(i)) answer.textures.push({i, size: t.source_size ?? t.size, version: ""}); });
      this.paintFailure = null;
      this.refreshPaints(answer.textures, paints);
    } catch (e) {
      if (!controller.signal.aborted && mine === this.host.token()) this.host.failed(e instanceof Error ? e.message : "Could not read ground materials");
    }
  }

  /** Wait for the painted ground's textures; progress(done, total): how many of them are loaded. */
  async ready(progress?: (done: number, total: number) => void) {
    const counted = (loads: Promise<unknown>[]) => {
      let done = 0;
      progress?.(0, loads.length);
      return Promise.all(loads.map(load => load.then(() => progress?.(++done, loads.length))));
    };
    await counted([...this.textureChanges.values()].map(t => t.done));
    await counted([...this.splatPending.values()].map(t => t.done));
    if (this.paintFailure) throw new Error(this.paintFailure);
  }

  private disposeSplatImage(entry: SplatImageEntry) {
    if (entry.disposed) return;
    entry.disposed = true; entry.controller.abort();
    if (entry.token === this.host.token()) this.host.release(entry.bytes);
    entry.texture?.dispose();
    if (typeof ImageBitmap !== "undefined" && entry.texture?.image instanceof ImageBitmap) entry.texture.image.close();
  }

  private pruneSplatImages() {
    const needed = new Set([...this.splatBindings.values(), ...[...this.splatPending.values()].map(p => p.keys)].flatMap(k => [...k]));
    for (const [key, entry] of this.splatImages) if (!needed.has(key)) {
      this.splatImages.delete(key); this.disposeSplatImage(entry);
    }
  }

  private splatTexture(ref: ColourImage, data: TrackIndex, keys: Set<string>) {
    if (!ref.url) {
      const i = ref.i ?? data.textures.findIndex(t => t.name === ref.name);
      return i < 0 ? Promise.resolve(null) : this.texture(this.host.trackName(), data, i);
    }
    const key = `${ref.linear ? "mask" : "colour"}:${ref.key ?? ref.url}`;
    keys.add(key);
    const found = this.splatImages.get(key);
    if (found) return found.done;
    const bytes = COPIES * (ref.size ?? 0), mine = this.host.token();
    if (!bytes || !this.host.reserve(bytes)) {
      this.host.limited(); return Promise.resolve(null);
    }
    const controller = new AbortController();
    const entry: SplatImageEntry = {done: Promise.resolve(null), controller, bytes, token: mine, disposed: false};
    this.splatImages.set(key, entry);
    const signal = AbortSignal.any([controller.signal, this.host.signal()]);
    this.weightBundles ??= new WeightBundles(size => this.host.reserve(size), size => { this.host.release(size); });
    const bundled = ref.bundle ? this.weightBundles.acquire(ref.bundle, ref.size!, signal) : undefined;
    if (bundled === null) {
      this.splatImages.delete(key); this.disposeSplatImage(entry);
      this.host.limited(); return Promise.resolve(null);
    }
    entry.done = textureTurn(async () => {
      if (signal.aborted) return null;
      const raw = bundled ? await bundled.read() : await fetchBytes(ref.url!, signal);
      if (signal.aborted) return null;
      return makeTexture(raw, ref.name, this.host.renderer.capabilities.getMaxAnisotropy(), ref.linear);
    }).then(texture => {
      if (entry.disposed || mine !== this.host.token()) { texture?.dispose(); return null; }
      if (texture) { entry.texture = texture; this.onLoaded?.(); }
      return texture;
    }).catch(error => {
      if (this.splatImages.get(key) === entry) this.splatImages.delete(key);
      this.disposeSplatImage(entry);
      throw error;
    }).finally(() => bundled?.release());
    void entry.done.catch(() => {}); // Its material job reports a current failure; obsolete downloads are cancelled.
    return entry.done;
  }

  private prepareSplat(k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) {
    if (layers.ground) { this.prepareGround(k, material, layers, ready); return; }
    const data = this.host.data()!, mine = this.host.token(), keys = new Set<string>();
    const entry: SplatPending = {keys, done: Promise.resolve()};
    this.splatPending.set(k, entry);
    const current = () => mine === this.host.token() && this.splatPending.get(k) === entry && !this.host.signal().aborted;
    const base = this.splatTexture(layers.base, data, keys);
    void base.then(texture => { if (texture && current()) { material.map = texture; material.needsUpdate = true; this.host.changed(); } }, () => {});
    const mask = this.splatTexture(layers.mask, data, keys);
    const colours = layers.images.map(ref => this.splatTexture(ref, data, keys));
    const details = layers.images.map(ref => ref.detail ? this.splatTexture(ref.detail, data, keys) : Promise.resolve(null));
    this.pruneSplatImages();
    entry.done = Promise.all([base, mask, ...colours, ...details]).then(([original, keep, ...loaded]) => {
      if (!current()) return;
      const images = loaded.slice(0, colours.length), packed = loaded.slice(colours.length);
      if (!original || !keep || images.some(image => !image) || packed.some((image, i) => layers.images[i].detail && !image)) {
        throw new Error("Not enough editor memory for this material. Increase the limit and reopen the track.");
      }
      material.map = original;
      bindSplat(material, keep, images as THREE.Texture[], layers, packed);
      bindSeason(material, this.season);
      this.removeGround(k);
      this.splatBindings.set(k, keys);
      ready(); this.host.changed();
    }).catch(error => {
      if (current()) {
        this.paintFailure = error instanceof Error ? error.message : "Could not load this material";
        this.host.failed(this.paintFailure);
      }
    }).finally(() => {
      if (this.splatPending.get(k) === entry) this.splatPending.delete(k);
      if (mine === this.host.token()) {
        if (this.materials[k] !== material) material.dispose();
        this.pruneSplatImages();
      }
    });
  }

  private removeGround(k: number) {
    this.groundLayers.get(k)?.dispose(); this.groundLayers.delete(k);
    if (!this.groundLayers.size) { this.groundFrame?.dispose(); this.groundFrame = null; }
  }

  private prepareGround(k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) {
    const data = this.host.data()!, mine = this.host.token(), keys = new Set<string>();
    const entry: SplatPending = {keys, done: Promise.resolve()}; this.splatPending.set(k, entry);
    const current = () => mine === this.host.token() && this.splatPending.get(k) === entry && !this.host.signal().aborted;
    const base = this.splatTexture(layers.base, data, keys);
    // Show the source tile while regional weights and photos load; an existing displayed map stays intact.
    void base.then(texture => {
      if (texture && current() && !material.map) { material.map = texture; material.needsUpdate = true; this.host.changed(); }
    }, () => {});
    const photos = layers.images.map(ref => this.splatTexture(ref, data, keys));
    const maps = layers.images.map(ref => ref.detail ? this.splatTexture(ref.detail, data, keys) : Promise.resolve(null));
    const masks = layers.ground!.passes.map(pass => pass.weight.size ? this.splatTexture(pass.weight, data, keys) : Promise.resolve(null));
    entry.done = Promise.all([base, ...photos, ...maps, ...masks]).then(loaded => {
      if (!current()) return;
      const original = loaded[0], images = loaded.slice(1, 1 + photos.length), packed = loaded.slice(1 + photos.length, 1 + photos.length + maps.length);
      const weights = loaded.slice(1 + photos.length + maps.length);
      if (!original || images.some(p => !p) || weights.some((p, i) => layers.ground!.passes[i].weight.size && !p) || packed.some((p, i) => layers.images[i].detail && !p)) throw new Error("Not enough editor memory for these ground materials");
      const frame = this.groundFrame ?? new GroundFrame(this.host.renderer, this.host.scene,
        bytes => this.host.reserve(bytes), bytes => { this.host.release(bytes); });
      const replacement = new GroundLayer(frame, layers, original, images as THREE.Texture[], packed, weights, material);
      try {
        for (const mesh of this.host.meshes()) if (mesh.userData.info.material === k) replacement.attach(mesh);
        frame.bind(material);
        // Apply creates a fresh material, so the frame has no existing season binding to restore.
        bindSeason(material, this.season);
      } catch (error) { replacement.dispose(); if (!this.groundFrame) frame.dispose(); throw error; }
      this.groundFrame = frame;
      this.groundLayers.get(k)?.dispose(); this.groundLayers.set(k, replacement);
      this.splatBindings.set(k, keys); ready(); this.host.changed();
    }).catch(error => { if (current()) { this.paintFailure = String(error.message ?? error); this.host.failed(this.paintFailure); } })
      .finally(() => {
        if (this.splatPending.get(k) === entry) this.splatPending.delete(k);
        if (mine === this.host.token()) { if (this.materials[k] !== material) material.dispose(); this.pruneSplatImages(); }
      });
  }

  private refreshSplat(next: GroundTextureUpdate) {
    const data = this.host.data()!, descriptor = data.textures[next.i], oldLayers = descriptor.layers;
    if (descriptor.version === next.version && this.version(next.i) === next.version && !!oldLayers === !!next.layers) return;
    const indices = next.materials ?? next.layers?.materials ?? oldLayers?.materials ?? [];
    Object.assign(descriptor, {version: next.version, size: next.size, layers: next.layers});
    for (const k of indices) {
      const source = this.sourceMaterials.get(k) ?? data.materials[k].source ?? data.materials[k];
      this.sourceMaterials.set(k, source);
      const old = this.materials[k];
      if (!next.layers) {
        this.removeGround(k);
        this.splatPending.delete(k); this.splatBindings.delete(k);
        data.materials[k] = source;
        this.materials[k] = undefined;
        const restored = old ? this.material(this.host.trackName(), data, k) : null;
        for (const mesh of this.host.meshes()) if (mesh.userData.info.material === k && restored) mesh.material = restored;
        old?.dispose();
        this.displayedTextures.set(next.i, "");
      } else if (!old) {
        data.materials[k] = {...source, splat: next.layers}; // Its eventual mesh load uses the current layout.
      } else {
        const layers = next.layers, material: GroundMaterial = classicGround(source, groundTint(source));
        this.prepareSplat(k, material, layers, () => {
          const previous = this.materials[k];
          this.materials[k] = material; data.materials[k] = {...source, splat: layers};
          for (const mesh of this.host.meshes()) if (mesh.userData.info.material === k) mesh.material = material;
          previous?.dispose();
          this.displayedTextures.set(next.i, next.version);
          this.onChanged();
        });
      }
    }
    this.pruneSplatImages(); this.host.changed();
    if (!next.layers) this.onChanged();
  }

  /** Keep a texture's identity: all loaded materials and Copy previews retain their existing reference. */
  private refreshTexture(next: {i: number; size: number; version: string}) {
    const data = this.host.data(), descriptor = data?.textures[next.i];
    if (!data || !descriptor || this.textureChanges.get(next.i)?.version === next.version) return;
    if ((descriptor.version ?? "") === next.version && (!this.pool[next.i] || this.version(next.i) === next.version)) return;
    Object.assign(descriptor, {version: next.version, size: next.size});
    this.textureChanges.get(next.i)?.abort();
    const old = this.pool[next.i];
    if (!old) return; // Still outside the memory limit or not requested: its eventual load uses the new descriptor.
    const mine = this.host.token(), controller = new AbortController();
    let reserved = 0;
    const release = () => { if (mine === this.host.token()) this.host.release(reserved); reserved = 0; };
    const entry = {abort: () => { controller.abort(); release(); }, done: Promise.resolve(), version: next.version};
    this.textureChanges.set(next.i, entry);
    const signal = AbortSignal.any([controller.signal, this.host.signal()]);
    const current = () => !signal.aborted && mine === this.host.token() && this.textureChanges.get(next.i) === entry;
    entry.done = (async () => {
      let made: THREE.Texture | null = null;
      try {
        const target = await old;
        if (!target || !current()) return;
        made = await textureTurn(async () => {
          if (!current()) return null;
          const needed = COPIES * next.size;
          if (!this.host.reserve(needed)) throw new Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");
          reserved = needed;
          const bytes = await fetchBytes(`/api/editor/${encodeURIComponent(this.host.trackName())}/texture/${next.i}?r=${data.revision}${next.version ? `&p=${next.version}` : ""}`, signal);
          if (!current()) return null;
          return makeTexture(bytes, descriptor.name, this.host.renderer.capabilities.getMaxAnisotropy(), descriptor.linear);
        });
        if (!made || !current()) return;
        if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap) {
          const extra = decodedBytes(made.image.width, made.image.height) - reserved;
          if (!this.host.reserve(extra)) throw new Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");
          reserved += extra;
        }
        const previousImage = target.image;
        this.host.release(this.textureBytes.get(target) ?? 0);
        this.textureBytes.set(target, reserved); reserved = 0;
        this.host.forgetAlpha(target);
        target.dispose();
        target.copy(made); target.needsUpdate = true;
        for (const m of this.materials) if (m?.map === target) m.needsUpdate = true;
        if (typeof ImageBitmap !== "undefined" && previousImage instanceof ImageBitmap) previousImage.close();
        made = null; // Its bitmap is now owned by target; the temporary texture never reached the GPU.
        this.displayedTextures.set(next.i, next.version);
        this.onChanged();
        this.host.changed();
      } catch (e) {
        if (current()) {
          this.paintFailure = e instanceof Error ? e.message : "Could not update ground materials";
          this.host.failed(this.paintFailure);
        }
      } finally {
        if (made) { made.dispose(); if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap) made.image.close(); }
        release();
        if (this.textureChanges.get(next.i) === entry) this.textureChanges.delete(next.i);
      }
    })();
  }

  /** The material k of the track name (data its index), made once and shared by its meshes; its textures follow as they load. */
  material(name: string, data: TrackIndex, k: number) {
    const have = this.materials[k];
    if (have) return have;
    const d = data.materials[k], b = groundTint(d);
    if (!this.sourceMaterials.has(k)) this.sourceMaterials.set(k, d.source ?? d);
    const m: GroundMaterial = isGroundTile(d.name) || d.splat ? classicGround(d, b) : new THREE.MeshLambertMaterial({color: new THREE.Color(b, b, b)});
    const seasonal = isGroundTile(d.name) || !!d.splat || !!d.dual_layer;
    if (seasonal) bindSeason(m, this.season);
    if (d.alpha_ref > 0) m.alphaTest = d.alpha_ref;
    if (d.blend) {
      m.transparent = true;
      m.depthWrite = false;
    }
    this.materials[k] = m;
    if (d.splat) {
      this.prepareSplat(k, m, d.splat, () => {
        const i = d.splat!.base.i ?? data.textures.findIndex(t => t.name === d.splat!.base.name);
        if (i >= 0) this.displayedTextures.set(i, data.textures[i].version ?? "");
        this.onChanged();
      });
      return m;
    }
    if (d.dual_layer) {
      const mine = this.host.token(), layers = d.dual_layer;
      const image = (file: string | null) => {
        const index = data.textures.findIndex(t => t.name === file);
        return index < 0 ? Promise.resolve(null) : this.texture(name, data, index);
      };
      // Reserve the original tile first. Until all three images fit and arrive, show that tile unchanged.
      const base = image(layers.base), keep = image(layers.mask), detail = image(d.texture);
      void base.then(texture => {
        if (texture && mine === this.host.token()) { m.map = texture; m.needsUpdate = true; this.host.changed(); }
      }, () => {});
      void Promise.all([base, keep, detail]).then(([original, mask, colour]) => {
        if (!original || !mask || !colour || mine !== this.host.token()) return;
        m.map = colour;
        bindColourBlend(m, original, mask, layers.scale);
        if (seasonal) bindSeason(m, this.season);
        this.host.changed();
      }, () => {}); // The shared loader reports failed images and owns their memory and disposal.
      return m;
    }
    if (d.ambient !== undefined && d.diffuse !== undefined && !d.world_scale && !takesGroundLight(d.name)) bindLightShares(m, d.ambient, d.diffuse);
    if (seasonal) bindSeason(m, this.season);
    const i = data.textures.findIndex(t => t.name === d.texture);
    if (i >= 0) {
      const mine = this.host.token();
      void this.texture(name, data, i).then(t => {
        if (!t || mine !== this.host.token()) return;
        m.map = t;
        if (d.world_scale) bindWorldColour(m, d.world_scale);
        if (seasonal) bindSeason(m, this.season);
        m.needsUpdate = true;
        this.host.changed();
      }, () => {});       // (load awaits the textures and reports their failures)
    }
    return m;
  }
}
