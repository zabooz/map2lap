// The Editor tab's 3D view of a built track (src/app/trackview.py hands out its kn5's parts). Left drag orbits, the wheel
// held turns the camera on the spot, the wheel zooms towards the mouse, right drag moves, W A S D fly where it looks. Meshes
// load nearest first, so the spot in view comes first on a long track.
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {DDSLoader} from "three/addons/loaders/DDSLoader.js";
import {acceleratedRaycast, estimateMemoryInBytes, MeshBVH} from "three-mesh-bvh";
import {DEFAULT_CONTROLS, type Controls} from "./controls";
import {billboardFaces, billboardOf, decodedBytes, fits, kindOf, latLonOf, physicsOf, routeMetre, spriteAt, tileOf,
        type Atlas} from "./inspect";

/** What the mouse points at (the hover box). */
export interface Hovered {
  kind: string;
  sprite: string | null;
  object: string;
  physics: string;
  material: string;
  shader: string;
  texture: string | null;
  textureBytes: number | null;
  vertices: number;
  triangles: number;
  triangle: number;
  uv: [number, number] | null;
  shownTo: number;
  billboard: {number: number; height: number | null; width: number | null; foot: [number, number] | null} | null;
  at: [number, number, number];
  tile: [number, number];
  route: {metre: number; off: number} | null;
  latLon: [number, number] | null;
  distance: number;
}

interface MeshInfo {
  i: number;
  name: string;
  material: number;
  vertices: number;
  indices: number;
  lod_in: number;
  lod_out: number;
  center: [number, number, number];
  radius: number;
  first_face: number | null;    // (the tile's billboards: triangles in its earlier parts)
}

interface MaterialInfo {
  name: string;
  shader: string;
  texture: string | null;
  bright: number;
  alpha_ref: number;
  blend: boolean;
}

interface TrackIndex {
  revision: string;             // the state of the file its numbers hold for
  meshes: MeshInfo[];
  materials: MaterialInfo[];
  textures: {name: string; size: number}[];
  start: {pos: [number, number, number]; forward: [number, number, number]} | null;
  anchor: [number, number] | null;
  route: number[][];
  atlas: Atlas;
}

const FLOATS_PER_VERTEX = 11;       // (kn5.VERTEX: position, normal, uv, tangent)
const PARALLEL = 6;                 // meshes asked for at a time
// The memory limit (the settings): a long track's kn5 can reach 10 GB, more than a browser tab can hold. What lies furthest
// from the view then stays out. A mesh or compressed texture counts twice: it stays here for the mouse and the ground, and
// the graphics card holds a copy. An estimate: the browser's own overhead is not counted.
const COPIES = 2;
const VIEW_M = 300000;              // far plane: the distant terrain reaches 40 km around a route of up to 500 km
const START_BACK_M = 45, START_UP_M = 22;   // the first view: behind and above the start
const GROUND = /^(1ROAD|1GRASS|1GRAVEL)_ground|^nocol_far/;     // the meshes the view stays above
const ABOVE_GROUND_M = 1.5;
const LOOK_RAD_PER_PX = 0.004;      // the wheel held: how far the camera turns per pixel dragged
const MIDDLE_BUTTON = 1, MIDDLE_HELD = 4;   // (a mouse event's button; its buttons)
// Flying: m/s per m above the ground, so a close look creeps and an overview crosses the track; within these limits.
const FLY_PER_M = 2.0, FLY_MIN_M_S = 24, FLY_MAX_M_S = 6000;
const FLY_MAX_STEP_S = 0.1;         // (a slow frame moves no further than this)
const FLY_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);     // (by place on the keyboard: the same on every layout)
const HOVER_EVERY_MS = 60;          // how often the mouse's target is looked up: the box follows, the view stays smooth

/** fn, its time to read in the browser's performance tools under name (only the last one is kept). */
function timed<T>(name: string, fn: () => T) {
  performance.clearMeasures(name);
  const started = performance.now();
  const result = fn();
  performance.measure(name, {start: started});
  return result;
}

/** An image's pixels, to read. (A plain canvas: not every browser has OffscreenCanvas.) */
function pixelsOf(image: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const can = canvas.getContext("2d", {willReadFrequently: true});
  can?.drawImage(image, 0, 0);
  return can ? can.getImageData(0, 0, image.width, image.height) : null;
}

/** A ground mesh made quick to hit: the ground holds most of a track's triangles (Heiligenblut: 5.3 of 6.5 million), a ray
    otherwise reads all of each tile it meets. indirect: the triangles keep their order and numbers. Its bytes. */
function speedUpRays(mesh: THREE.Mesh) {
  const started = performance.now();
  const tree = new MeshBVH(mesh.geometry, {indirect: true});
  const bytes = estimateMemoryInBytes(tree);
  mesh.geometry.boundsTree = tree;
  mesh.raycast = acceleratedRaycast;
  performance.measure("map2lap.bvh", {start: started, detail: bytes});
  return bytes;
}

const meshBytes = (m: MeshInfo) => m.vertices * FLOATS_PER_VERTEX * 4 + 4 + m.indices * 2;

/** The mesh in queue nearest to the point, taken out of it (each time anew: the view may have moved). */
function takeNearest(queue: MeshInfo[], c: THREE.Vector3) {
  let best = 0, bestD = Infinity;
  queue.forEach((m, k) => {
    const d = Math.max(0, Math.hypot(m.center[0] - c.x, m.center[1] - c.y, m.center[2] - c.z) - m.radius);
    if (d < bestD) { bestD = d; best = k; }
  });
  return queue.splice(best, 1)[0];
}

async function fetchBytes(url: string, signal: AbortSignal) {
  const r = await fetch(url, {signal});
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `${url}: ${r.status}`);
  return r.arrayBuffer();
}

/** The texture with the file name file from its bytes. */
async function makeTexture(buf: ArrayBuffer, file: string, anisotropy: number) {
  let t: THREE.Texture;
  if (/\.dds$/i.test(file)) {
    const d = new DDSLoader().parse(buf, true);
    t = new THREE.CompressedTexture(d.mipmaps as ImageData[], d.width, d.height, d.format as THREE.CompressedPixelFormat);
    t.minFilter = d.mipmapCount > 1 ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  } else {
    const bitmap = await createImageBitmap(new Blob([buf]), {imageOrientation: "none", premultiplyAlpha: "none"});
    t = new THREE.Texture(bitmap);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
  }
  t.flipY = false;                  // (kn5's uv: from the image's top left, as DirectX reads it)
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function makeGeometry(info: MeshInfo, buf: ArrayBuffer) {
  const g = new THREE.BufferGeometry();
  const v = new THREE.InterleavedBuffer(new Float32Array(buf, 0, info.vertices * FLOATS_PER_VERTEX), FLOATS_PER_VERTEX);
  g.setAttribute("position", new THREE.InterleavedBufferAttribute(v, 3, 0));
  g.setAttribute("normal", new THREE.InterleavedBufferAttribute(v, 3, 3));
  g.setAttribute("uv", new THREE.InterleavedBufferAttribute(v, 2, 6));
  const skip = info.vertices * FLOATS_PER_VERTEX * 4 + 4;
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, skip, info.indices), 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...info.center), info.radius);
  // (a ray then skips most meshes without looking at their triangles: a ground query from about 4.5 to 2.8 ms; the sphere
  // alone lets through every tile a long ray passes near)
  g.computeBoundingBox();
  return g;
}

/** three.js in the element host, showing one track. dispose() ends it. */
export class TrackView {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.5, VIEW_M);
  private controls: OrbitControls;
  private resizing: ResizeObserver;
  private down = new THREE.Raycaster();
  private dirty = true;
  private shown = false;
  private token = 0;                // a new number: another track was asked for, what still loads is dropped
  private meshes: THREE.Mesh[] = [];
  private grounds: THREE.Mesh[] = [];
  private textures: (Promise<THREE.Texture | null> | undefined)[] = [];
  private materials: (THREE.MeshLambertMaterial | undefined)[] = [];
  private usedBytes = 0;
  private overLimit = false;            // something stayed out because of the memory limit
  private loading = new AbortController();  // what is on its way for the track shown: stopped when another is asked for
  private height = 0;                   // m above the ground, from the last ground query
  private flyingNow = false;            // (fly asks the ground itself: the controls' change needs not do so again)
  private host: HTMLElement;
  private flying = new Set<string>();   // the fly keys held
  private lastFrame = 0;
  private settings = DEFAULT_CONTROLS;
  private data: TrackIndex | null = null;
  private onHover: (hovered: Hovered | null) => void = () => {};
  private mouse: THREE.Vector2 | null = null;       // where the mouse is over the view (-1 .. 1); null: not over it
  private hoverDue = false;
  private lastHover = 0;
  private picker = new THREE.Raycaster();
  private alphaOf = new Map<THREE.Texture, ImageData | null>();

  constructor(host: HTMLElement) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    host.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color("#a9cfe9");
    this.scene.add(new THREE.AmbientLight("#ffffff", 2.0));
    const sun = new THREE.DirectionalLight("#fff4e0", 1.6);
    sun.position.set(0.5, 1, 0.35);
    this.scene.add(sun);
    this.down.firstHitOnly = true;      // (the ground's height: what lies further down of the same mesh is of no interest)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.zoomToCursor = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = VIEW_M / 2;
    this.controls.mouseButtons.MIDDLE = null;   // (the wheel held is ours: lookAround)
    this.controls.addEventListener("change", () => {
      if (!this.flyingNow) this.keepAboveGround();
      this.dirty = true;
      this.hoverDue = true;
    });
    this.lookAround(this.renderer.domElement);
    this.flyKeys(this.renderer.domElement);
    this.followMouse(this.renderer.domElement);
    this.resizing = new ResizeObserver(() => this.resize());
    this.resizing.observe(host);
    this.renderer.setAnimationLoop(() => this.frame());
  }

  dispose() {
    this.token++;
    this.loading.abort();
    this.clear();
    this.resizing.disconnect();
    this.controls.dispose();
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** Its tab was opened or left. */
  show(on: boolean) {
    this.shown = on;
    if (on) this.resize();
    else this.flying.clear();
  }

  /** How the view moves from now on (the Editor settings). */
  setControls(c: Controls) {
    this.settings = c;
    this.controls.rotateSpeed = c.orbit / 100;
    this.controls.panSpeed = c.move / 100;
    this.controls.zoomSpeed = c.zoom / 100;
  }

  /** onHover gets what the mouse points at, null when nothing. */
  setHover(onHover: (hovered: Hovered | null) => void) {
    this.onHover = onHover;
  }

  /** Show the track name; say(text) gets the progress or the fault. Returns when all is loaded (or another track was asked
      for: what the older one still says or fails with is nobody's business any more). */
  async open(name: string, say: (text: string) => void) {
    const mine = ++this.token;
    this.loading.abort();
    this.loading = new AbortController();
    const {signal} = this.loading;
    this.clear();
    this.dirty = true;
    this.onHover(null);
    say(name ? "Reading the track …" : "");
    if (!name) return;
    try {
      await this.load(name, mine, signal, say);
    } catch (e) {
      if (mine !== this.token) return;
      this.loading.abort();
      say(`Could not load this track: ${(e as Error).message}`);
    }
  }

  private async load(name: string, mine: number, signal: AbortSignal, say: (text: string) => void) {
    const r = await fetch(`/api/editor/${encodeURIComponent(name)}/index`, {signal});
    const data = await r.json();
    if (mine !== this.token) return;
    if (!r.ok) {
      say(data.error || "Could not read this track");
      return;
    }
    this.data = data;
    this.placeCamera(data);
    this.renderer.domElement.focus({preventScroll: true});     // (W A S D work at once, not in the track's dropdown)
    const queue: MeshInfo[] = data.meshes.slice(), total = queue.length;
    let done = 0;
    const worker = async () => {
      while (queue.length && mine === this.token) {
        const info = takeNearest(queue, this.camera.position);
        if (!fits(this.usedBytes, COPIES * meshBytes(info), this.settings.memoryGb)) {
          this.overLimit = true;
          queue.length = 0;
          return;
        }
        this.usedBytes += COPIES * meshBytes(info);
        const buf = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/mesh/${info.i}?r=${data.revision}`, signal);
        if (mine !== this.token) return;
        this.addMesh(name, data, info, buf);
        done++;
        say(`Loading: ${done} of ${total} parts`);
      }
    };
    await Promise.all(Array.from({length: PARALLEL}, worker));
    if (mine !== this.token) return;
    await Promise.all(this.textures);
    if (mine !== this.token) return;
    say(this.overLimit ? `Memory limit reached (Settings): ${done} of ${total} parts, the nearest ones` : `${total} parts loaded`);
  }

  /** The wheel held and dragged turns the camera on the spot: its point of view stays, what it orbits around moves. */
  private lookAround(el: HTMLElement) {
    let last: {x: number; y: number} | null = null;
    el.addEventListener("mousedown", e => {     // (else the browser's scrolling by wheel starts)
      if (e.button === MIDDLE_BUTTON) e.preventDefault();
    });
    el.addEventListener("pointerdown", e => {
      if (e.button === MIDDLE_BUTTON) last = {x: e.clientX, y: e.clientY};
    });
    el.addEventListener("pointermove", e => {
      if (!last) return;
      if (!(e.buttons & MIDDLE_HELD)) {
        last = null;
        return;
      }
      const {look, invertLook} = this.settings, rad = LOOK_RAD_PER_PX * look / 100;
      this.turn((last.x - e.clientX) * rad, (last.y - e.clientY) * rad * (invertLook ? -1 : 1));
      last = {x: e.clientX, y: e.clientY};
    });
    el.addEventListener("pointerup", e => {
      if (e.button === MIDDLE_BUTTON) last = null;
    });
  }

  /** The mouse over the view; while a button is held it moves the camera, the box waits. */
  private followMouse(el: HTMLElement) {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      this.mouse = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      if (!e.buttons) this.hoverDue = true;
    });
    el.addEventListener("pointerup", () => { this.hoverDue = true; });
    el.addEventListener("pointerleave", () => {
      this.mouse = null;
      this.hoverDue = false;
      this.onHover(null);
    });
  }

  /** Whether a cut-out texture is solid at the hit's uv: its see-through parts are nothing to point at (a billboard's quad
      is far wider than its tree). A compressed one can't be read here: solid. */
  private solidAt(hit: THREE.Intersection) {
    const m = (hit.object as THREE.Mesh).material as THREE.MeshLambertMaterial;
    if (!m.alphaTest || !m.map || !hit.uv) return true;
    let pixels = this.alphaOf.get(m.map);
    if (pixels === undefined) {
      pixels = m.map.image instanceof ImageBitmap ? pixelsOf(m.map.image) : null;
      this.alphaOf.set(m.map, pixels);
      if (pixels) this.usedBytes += pixels.data.byteLength;
    }
    if (!pixels) return true;
    const x = Math.floor((hit.uv.x - Math.floor(hit.uv.x)) * pixels.width);
    const y = Math.floor((hit.uv.y - Math.floor(hit.uv.y)) * pixels.height);
    return pixels.data[(y * pixels.width + x) * 4 + 3] / 255 >= m.alphaTest;
  }

  /** What the mouse points at now, told to onHover. */
  private hover() {
    if (!this.mouse || !this.data) return;
    this.picker.setFromCamera(this.mouse, this.camera);
    const hit = timed("map2lap.hover", () => this.picker.intersectObjects(this.meshes.filter(m => m.visible), false)
      .find(h => this.solidAt(h)));
    this.onHover(hit ? this.describe(hit) : null);
  }

  private describe(hit: THREE.Intersection): Hovered {
    const data = this.data!, mesh = hit.object as THREE.Mesh, info = mesh.userData.info as MeshInfo;
    const material = data.materials[info.material];
    const texture = data.textures.find(t => t.name === material.texture);
    const {x, y, z} = hit.point, face = hit.faceIndex ?? 0, uv = hit.uv ? ([hit.uv.x, hit.uv.y] as [number, number]) : null;
    const isBillboard = info.first_face !== null && info.first_face !== undefined;
    return {
      kind: kindOf(info.name),
      sprite: isBillboard && uv ? spriteAt(data.atlas, uv[0], uv[1]) : null,
      object: info.name,
      physics: physicsOf(info.name),
      material: material.name,
      shader: material.shader,
      texture: material.texture,
      textureBytes: texture?.size ?? null,
      vertices: info.vertices,
      triangles: info.indices / 3,
      triangle: face,
      uv,
      shownTo: info.lod_out,
      billboard: isBillboard ? this.billboard(mesh, info, face) : null,
      at: [x, y, z],
      tile: tileOf(x, z),
      route: routeMetre(data.route, x, z),
      latLon: data.anchor ? latLonOf(data.anchor, x, y, z) : null,
      distance: hit.distance,
    };
  }

  /** The tree or bush a triangle belongs to, measured from its corners. Lying across two parts of a mesh (a few per tile),
      only its number is sure. */
  private billboard(mesh: THREE.Mesh, info: MeshInfo, face: number): NonNullable<Hovered["billboard"]> {
    const first = info.first_face!, number = billboardOf(face, first);
    const [from, end] = billboardFaces(number, first, info.indices / 3);
    if (end - from < 8) return {number, height: null, width: null, foot: null};
    const index = mesh.geometry.getIndex()!, position = mesh.geometry.getAttribute("position");
    const bounds = new THREE.Box3(), corner = new THREE.Vector3(), base = new THREE.Vector3();
    for (let k = from * 3; k < end * 3; k++) {
      corner.fromBufferAttribute(position, index.getX(k));
      bounds.expandByPoint(corner);
      if (k === from * 3) base.copy(corner);
    }
    corner.fromBufferAttribute(position, index.getX(from * 3 + 1));      // (a quad's second corner: trees.billboards)
    const foot = bounds.getCenter(new THREE.Vector3());
    return {number, height: bounds.max.y - bounds.min.y, width: base.distanceTo(corner), foot: [foot.x, foot.z]};
  }

  /** W A S D, while the view has the focus: typing in a field or the settings moves nothing, and a key let go elsewhere
      doesn't keep it flying. */
  private flyKeys(el: HTMLElement) {
    el.tabIndex = 0;
    el.addEventListener("pointerdown", () => el.focus({preventScroll: true}));
    el.addEventListener("keydown", e => {
      if (!FLY_KEYS.has(e.code) || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      this.flying.add(e.code);
    });
    el.addEventListener("keyup", e => this.flying.delete(e.code));
    el.addEventListener("blur", () => this.flying.clear());
  }

  /** The camera and what it orbits around moved seconds along the keys held: W, S where it looks, A, D to its side. */
  private fly(seconds: number) {
    const c = this.camera.position;
    const look = this.camera.getWorldDirection(new THREE.Vector3());
    const side = new THREE.Vector3().crossVectors(look, this.camera.up).normalize();
    const way = new THREE.Vector3();
    if (this.flying.has("KeyW")) way.add(look);
    if (this.flying.has("KeyS")) way.sub(look);
    if (this.flying.has("KeyD")) way.add(side);
    if (this.flying.has("KeyA")) way.sub(side);
    if (!way.lengthSq()) return;
    // (the height from the last frame's query: one ground query a frame, the costliest thing here)
    const speed = Math.min(FLY_MAX_M_S, Math.max(FLY_MIN_M_S, this.height * FLY_PER_M));
    way.normalize().multiplyScalar(speed * this.settings.fly / 100 * seconds);
    c.add(way);
    this.controls.target.add(way);
    const y = c.y;
    this.keepAboveGround();
    this.controls.target.y += c.y - y;      // (over a hill it rises as a whole: the view doesn't tip)
    this.flyingNow = true;
    this.controls.update();
    this.flyingNow = false;
    this.dirty = true;
  }

  /** The camera turned on the spot by yaw to the left and pitch upwards (rad). */
  private turn(yaw: number, pitch: number) {
    const look = this.controls.target.clone().sub(this.camera.position);
    const s = new THREE.Spherical().setFromVector3(look);
    s.theta += yaw;
    s.phi -= pitch;
    s.makeSafe();               // (not over the top: the view would flip)
    this.controls.target.copy(this.camera.position).add(look.setFromSpherical(s));
    this.controls.update();
  }

  private keepAboveGround() {       // (from below, the ground is not drawn: a hillside would turn into empty sky)
    const c = this.camera.position;
    this.down.set(new THREE.Vector3(c.x, c.y + VIEW_M, c.z), new THREE.Vector3(0, -1, 0));
    const hit = timed("map2lap.ground", () => this.down.intersectObjects(this.grounds, false)[0]);
    if (hit && c.y < hit.point.y + ABOVE_GROUND_M) c.y = hit.point.y + ABOVE_GROUND_M;
    this.height = hit ? c.y - hit.point.y : c.y;
  }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private frame() {                 // (drawn only when something changed)
    const now = performance.now(), seconds = Math.min(FLY_MAX_STEP_S, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.shown && this.flying.size) this.fly(seconds);
    if (!this.shown) return;
    if (this.dirty) {
      this.dirty = false;
      for (const m of this.meshes) {  // the distances AC shows each mesh at (trees, bushes, furniture go far away)
        const d = this.camera.position.distanceTo(m.geometry.boundingSphere!.center);
        m.visible = d >= m.userData.lodIn && d < m.userData.lodOut;
      }
      this.renderer.render(this.scene, this.camera);
    }
    if (this.hoverDue && now - this.lastHover >= HOVER_EVERY_MS) {
      this.hoverDue = false;
      this.lastHover = now;
      this.hover();
    }
  }

  private clear() {
    for (const m of this.meshes) {
      this.scene.remove(m);
      m.geometry.boundsTree = undefined;
      m.geometry.dispose();
    }
    for (const t of this.textures) {
      t?.then(x => {
        if (!x) return;
        const image = x.image;
        x.dispose();
        if (image instanceof ImageBitmap) image.close();    // (dispose frees the graphics card's copy only)
      }, () => {});       // (a failed texture is reported by load)
    }
    for (const m of this.materials) m?.dispose();
    this.meshes = [];
    this.grounds = [];
    this.textures = [];
    this.materials = [];
    this.usedBytes = 0;
    this.overLimit = false;
    this.data = null;
    this.alphaOf.clear();
  }

  private texture(name: string, data: TrackIndex, i: number) {
    let t = this.textures[i];
    if (!t) {
      const reserved = COPIES * data.textures[i].size, mine = this.token;
      if (!fits(this.usedBytes, reserved, this.settings.memoryGb)) {
        this.overLimit = true;
        return Promise.resolve(null);     // (the mesh stays plain grey)
      }
      this.usedBytes += reserved;
      const anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      t = fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}`, this.loading.signal)
        .then(buf => makeTexture(buf, data.textures[i].name, anisotropy))
        .then(made => {
          // (a PNG takes far more decoded than its file says; the next parts see what it really took)
          if (made.image instanceof ImageBitmap && mine === this.token) {
            const extra = decodedBytes(made.image.width, made.image.height) - reserved;
            if (!fits(this.usedBytes, extra, this.settings.memoryGb)) {
              this.usedBytes -= reserved;
              this.overLimit = true;
              made.dispose();
              made.image.close();
              return null;
            }
            this.usedBytes += extra;
          }
          return made;
        });
      this.textures[i] = t;
    }
    return t;
  }

  private material(name: string, data: TrackIndex, k: number) {
    const have = this.materials[k];
    if (have) return have;
    const d = data.materials[k], b = Math.min(1, d.bright);
    const m = new THREE.MeshLambertMaterial({color: new THREE.Color(b, b, b)});
    if (d.alpha_ref > 0) m.alphaTest = d.alpha_ref;
    if (d.blend) {
      m.transparent = true;
      m.depthWrite = false;
    }
    this.materials[k] = m;
    const i = data.textures.findIndex(t => t.name === d.texture);
    if (i >= 0) {
      const mine = this.token;
      void this.texture(name, data, i).then(t => {
        if (!t || mine !== this.token) return;
        m.map = t;
        m.needsUpdate = true;
        this.dirty = true;
      }, () => {});       // (load awaits the textures and reports their failures)
    }
    return m;
  }

  private addMesh(name: string, data: TrackIndex, info: MeshInfo, buf: ArrayBuffer) {
    const m = new THREE.Mesh(makeGeometry(info, buf), this.material(name, data, info.material));
    m.userData = {lodIn: info.lod_in, lodOut: info.lod_out, info};
    m.name = info.name;
    this.scene.add(m);
    this.meshes.push(m);
    if (GROUND.test(info.name)) {
      this.usedBytes += speedUpRays(m);
      this.grounds.push(m);
    }
    this.dirty = true;
    this.hoverDue = true;
  }

  private placeCamera(data: TrackIndex) {
    const at = new THREE.Vector3(), forward = new THREE.Vector3(0, 0, 1);
    if (data.start) {
      at.set(...data.start.pos);
      forward.set(...data.start.forward).normalize();
    } else if (data.meshes.length) {
      for (const m of data.meshes) at.add(new THREE.Vector3(...m.center));
      at.divideScalar(data.meshes.length);
    }
    this.controls.target.copy(at);
    this.camera.position.copy(at).addScaledVector(forward, -START_BACK_M).add(new THREE.Vector3(0, START_UP_M, 0));
    this.controls.update();
  }
}
