// The Editor tab's 3D view of a built track (src/app/trackview.py hands out its kn5's parts). W A S D and right drag move
// over the ground, the wheel zooms towards the mouse, held it turns and tilts around the view's middle, as in a building game. Meshes
// load nearest first, so the spot in view comes first on a long track. A click picks what is under the mouse; with Move on, a press picks
// it and a drag takes it along over the ground.
import type {Hovered, Picked, MenuAt, Place, Brush, WheelKeys, MeshInfo, TrackIndex} from "../types";
import type {LoadAbout} from "../../types";

/** What loading says: its text, how far (undefined: done, null: not known) and about it (a first opening, why it failed). */
export type Say = (text: string, progress?: number | null, about?: LoadAbout) => void;
import {Navigation, VIEW_M, FLY_MAX_STEP_S} from "./navigation";
import {FLOATS_PER_VERTEX, speedUpRays, meshBytes, meshUrl, fitSphere, makeGeometry} from "./geometry";
import {screenPoint, LEFT_BUTTON, CLICK_PX} from "./pointer";
import {RoadMarkers} from "./roadMarkers";
import {GeometryPreview} from "./geometryPreview";
import * as THREE from "three";
import {makeTexture} from "./texture";
import {oneByOne} from "./taskQueue";
import {DEFAULT_CONTROLS, type Controls} from "./controls";
import type {Tool} from "../tools/ToolPanel";
import {cursorFor, type Pointed} from "./cursor";
import {GRID_POINTS, gridHeight} from "../tools/groundGrid";
import {groundTile, SurfaceOverlay, type SurfacePoint, type SurfaceSelection} from "./surfaces";
import {MaterialRegions} from "./materials";
import {ModelDraw} from "./modelDraw";
import {TreeFxDraw, mergeChanges, type TreeFxChange, type TreeFxModel, type TreeFxTrees} from "./treeFx";
import {GroupDraw, type GroupPlant} from "./groupDraw";
import type {LibraryModel} from "../library/ModelLibrary";
import {modelLight} from "./modelLighting";
import {NightSky} from "./nightSky";
import {SunShadows, sunLight, takeShadows} from "./sunShadows";
import {LampCones, NightGlow, isLampGlass, lampsOn} from "./nightGlow";
import {lightAt, moonDirection, MOON_COLOUR, sunDirection, sunHeight, trackPlace} from "./sun";
import {fetchBytes, fetchJson, MeshFetchError} from "./requests";
import {materialImages, type GroundMaterial} from "./colourBlend";
import {TrackTextures} from "./trackTextures";
import {TrackObjects} from "./trackObjects";
import {ViewBrush} from "./brush";
import {PlacementGhost} from "./ghost";
import {ObjectMover} from "./mover";
import {Pointing} from "./pointing";
import {Selection, ROAD} from "./selection";
import {COPIES, fits, nearestLast} from "./inspect";

const PARALLEL = 6;                 // meshes asked for at a time
const PREPARE_BATCH = 32;           // ground tiles whose selection one request prepares at most (a pool of the cores, surfaceindex.prepare)
const RESORT_M = 100, RESORT_EVERY_MS = 500;    // the queue of meshes sorted again when the view moved this far, at most this often: 66,000 take a while
const GROUND = /^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/;   // the meshes the view stays above: over a river's surface, not its bed
const HOVER_EVERY_MS = 60;          // how often the mouse's target is looked up: the box follows, the view stays smooth
const BRUSHED = /^(1ROAD|1GRASS|1GRAVEL)_ground/;   // what a stroke goes on: the ground itself, no bridge or water, whatever else the camera keeps above
const FOOT_RING = 8;                // points round a plant's foot: the lowest side of a slope lies within 22.5° of one, so at most 8 % of its drop is missed

/** fn, its time to read in the browser's performance tools under name (only the last one is kept). */
function timed<T>(name: string, fn: () => T) {
  performance.clearMeasures(name);
  const started = performance.now();
  const result = fn();
  performance.measure(name, {start: started});
  return result;
}



/** three.js in the element host, showing one track. dispose() ends it. */
export class TrackView {
  private copyVersion = 0;
  private copyLoading: AbortController | null = null;
  private loadedCopyRevision: string | null = null;   // the geometry committed to the scene, not just an index received
  private groundVersion = 0;
  private modelLight: THREE.WebGLRenderTarget | null = null;
  private ambient = new THREE.AmbientLight();
  private sun = sunLight();
  private sunShadows: SunShadows;
  private nightGlow = new NightGlow(file => this.glowImage(file), () => { this.dirty = true; });
  private lampCones: LampCones;
  private lampGlass: THREE.Mesh[] = [];
  private moon = new THREE.DirectionalLight(MOON_COLOUR);
  private nightSky = new NightSky();
  private place = trackPlace(null);                     // where the open track lies: its sun
  private clock = 10;                                   // the hour shown (setClock)
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private modelDraw = new ModelDraw(this.scene, undefined, bytes => {
    if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
    this.usedBytes += bytes; return true;
  });
  private modelTransformVersion = 0;
  private treeFx = new TreeFxDraw(this.scene, {
    trees: () => fetchJson<TreeFxTrees>(this.treeUrl(""), this.loading.signal),
    model: name => fetchJson<TreeFxModel>(this.treeUrl(`/${name}`), this.loading.signal),
    texture: async (name, file) => {
      const texture = await makeTexture(await fetchBytes(this.treeUrl(`/${name}/${file}`), this.loading.signal), file, this.renderer.capabilities.getMaxAnisotropy());
      texture.name = file;
      return texture;
    },
  }, bytes => {
    if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
    this.usedBytes += bytes; return true;
  });
  private surfaceOverlay: SurfaceOverlay | null = null;
  private roadRegionOverlay: SurfaceOverlay | null = null;
  private roadInfluenceOverlay: SurfaceOverlay | null = null;
  private surfaceFailed: (message: string) => void = () => {};
  private geometryPreview = new GeometryPreview(i => this.byNumber.get(i), () => { this.dirty = true; });
  private camera = new THREE.PerspectiveCamera(55, 1, 0.5, VIEW_M);
  private roadMarkers = new RoadMarkers(this.scene, this.camera, (x, z) => this.groundAt(x, z), () => { this.dirty = true; });
  private navigation = new Navigation(this.camera, (origin, direction) => this.groundAlong(origin, direction), () => this.moved());
  private resizing: ResizeObserver;
  private down = new THREE.Raycaster();
  private dirty = true;
  private shown = false;
  private token = 0;                // a new number: another track was asked for, what still loads is dropped
  private meshes: THREE.Mesh[] = [];
  private grounds: THREE.Mesh[] = [];
  readonly textures: TrackTextures;      // the track's textures and materials, painted ground with them
  readonly objects: TrackObjects;        // the track's objects: their triangles, what belongs to which, what is left out
  readonly selection: Selection;         // what is picked and the frames of a marked sort
  readonly brush: ViewBrush;             // the ring, strokes and their preview, Delete's frames
  readonly ghost: PlacementGhost;        // what Copy and Insert would place, under the mouse, and what they placed until it is drawn
  readonly mover: ObjectMover;           // Move: what is picked dragged over the ground, turned, raised and sized
  private pointing: Pointing;           // what lies under the mouse
  private usedBytes = 0;
  private overLimit = false;            // something stayed out because of the memory limit
  private loading = new AbortController();  // what is on its way for the track shown: stopped when another is asked for
  private host: HTMLElement;
  private lastFrame = 0;
  private settings = DEFAULT_CONTROLS;
  private data: TrackIndex | null = null;
  private onHover: (hovered: Hovered | null) => void = () => {};
  private mouse: THREE.Vector2 | null = null;       // where the mouse is over the view (-1 .. 1); null: not over it
  private held = 0;                     // the mouse buttons down, as its last event over the view said
  private hoverDue = false;
  private lastHover = 0;
  private picker = new THREE.Raycaster();
  private onMenu: (at: MenuAt) => void = () => {};
  private onIndexed: (revision: string | null) => void = () => {};
  private materialAreas = new Map<number, MaterialRegions>();
  private byNumber = new Map<number, THREE.Mesh>();     // the loaded meshes by number
  private trackName = "";
  private heightsVersion = 0;           // a new number: the server hands out other meshes than a request on its way will bring
  private onViewFailed: (text: string | null) => void = () => {};
  private refreshes = oneByOne(PARALLEL);
  private onToolWheel: (keys: WheelKeys, by: number) => void = () => {};
  private wheelTaken = false;           // Ctrl and Alt with the wheel are the tool's
  private marking: ((x: number, z: number) => void) | null = null;
  private onClicked: (picked: Picked | null) => void = () => {};
  private cursorTool: Tool = "select";  // (the tool the pointer speaks for, and what it last pointed at)
  private pointed: Pointed | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    host.appendChild(this.renderer.domElement);
    this.textures = new TrackTextures({
      renderer: this.renderer, scene: this.scene,
      token: () => this.token, signal: () => this.loading.signal, trackName: () => this.trackName, data: () => this.data, meshes: () => this.meshes,
      reserve: bytes => { if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) return false; this.usedBytes += bytes; return true; },
      release: bytes => { this.usedBytes -= bytes; },
      limited: () => { this.overLimit = true; },
      forgetAlpha: texture => this.pointing.forget(texture),
      changed: () => { this.dirty = true; },
      failed: message => this.onViewFailed(message),
    });
    this.objects = new TrackObjects({
      data: () => this.data, mesh: i => this.byNumber.get(i), loaded: () => this.byNumber.values(),
      modelBounds: base => this.modelDraw.bounds(base), trees: () => this.treeFx,
      take: bytes => { this.usedBytes += bytes; },
      changed: () => { this.dirty = true; this.hoverDue = true; },
      removedChanged: () => { this.leaveOutTrees(); this.selection.reframeMarked(); this.dirty = true; this.hoverDue = true; },
    });
    this.selection = new Selection({
      scene: this.scene, objects: this.objects, data: () => this.data, moveTool: () => this.mover.on,
      materialArea: i => this.materialAreas.has(i), changed: () => { this.dirty = true; },
    });
    this.brush = new ViewBrush({
      scene: this.scene, objects: this.objects, data: () => this.data,
      point: e => { this.mouse = screenPoint(e, this.renderer.domElement); },
      ground: () => this.brushAt(),
      look: () => this.mouse && `${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,
      wheelTaken: () => this.wheelTaken, pivotOf: id => this.mover.pivotOf(id), trees: () => this.treeFx,
      showPreview: bytes => this.showPreview(bytes), keepPreview: () => this.keepPreview(), takeBackPreview: () => this.takeBackPreview(),
      changed: () => { this.dirty = true; },
    });
    this.ghost = new PlacementGhost({
      scene: this.scene, objects: this.objects, models: () => this.modelDraw, trees: () => this.treeFx, mesh: i => this.byNumber.get(i),
      canMove: id => this.mover.canMove(id), pivotOf: id => this.mover.pivotOf(id), ground: () => this.copyAt(),
      look: () => {
        const c = this.camera, p = c.position, q = c.quaternion;
        return [this.mouse?.x ?? Infinity, this.mouse?.y ?? Infinity, p.x, p.y, p.z, q.x, q.y, q.z, q.w, c.aspect, c.fov, this.groundVersion, this.held ? 1 : 0];
      },
      shown: () => this.shown, held: () => !!this.held,
      modelLight: () => this.ensureModelLight(), reflections: () => this.reflections(),
      reserve: bytes => { if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) return false; this.usedBytes += bytes; return true; },
      release: bytes => { this.usedBytes -= bytes; },
      failed: message => this.onViewFailed(message), changed: () => { this.dirty = true; }, placingChanged: () => this.applyCursor(),
    });
    this.mover = new ObjectMover({
      camera: this.camera, objects: this.objects, selection: this.selection, models: () => this.modelDraw, trees: () => this.treeFx, data: () => this.data,
      mesh: i => this.byNumber.get(i), pick: (e, el, point) => this.pick(e, el, point), groundAt: (x, z) => this.groundAt(x, z),
      groundAlong: (origin, direction) => this.groundAlong(origin, direction)?.point ?? null,
      farthest: () => 2 * this.navigation.highest, busy: () => !!this.brush.current,
      meshChanged: i => { this.geometryPreview.changedMeshes.add(i); },
      reloadKept: ids => {
        if (ids.some(id => id.startsWith("instance_"))) void this.refreshModelTransforms();
        this.treeFx.forget(ids); this.selection.reframe(); this.dirty = true;
        this.refreshMeshes([]);
      },
      cursorChanged: () => this.applyCursor(), changed: () => { this.dirty = true; },
    });
    this.pointing = new Pointing({
      camera: this.camera, objects: this.objects, data: () => this.data, meshes: () => this.meshes, models: () => this.modelDraw,
      trees: () => this.treeFx, height: () => this.renderer.domElement.clientHeight, take: bytes => { this.usedBytes += bytes; }, release: bytes => { this.usedBytes -= bytes; },
    });
    this.scene.add(this.ambient, this.sun, this.moon, this.nightSky.group);
    this.sunShadows = new SunShadows(this.renderer, this.scene, this.sun);
    this.lampCones = new LampCones(this.scene);
    this.applyLight();
    this.down.firstHitOnly = true;      // (the ground's height: what lies further down of the same mesh is of no interest)
    this.navigation.turnAround(this.renderer.domElement);
    this.navigation.grabGround(this.renderer.domElement);
    this.zoomWheel(this.renderer.domElement);
    this.navigation.flyKeys(this.renderer.domElement);
    this.followMouse(this.renderer.domElement);
    this.clicks(this.renderer.domElement);
    this.mover.attach(this.renderer.domElement);
    this.roadMarkers.attach(this.renderer.domElement, () => !!this.brush.current, () => this.applyCursor(), event => {
      this.mouse = screenPoint(event, this.renderer.domElement);
      return this.brushAt();
    });
    this.brush.attach(this.renderer.domElement);
    this.resizing = new ResizeObserver(() => this.resize());
    this.resizing.observe(host);
    this.renderer.setAnimationLoop(() => this.frame());
  }

  dispose() {
    this.token++;
    this.loading.abort();
    this.clear();
    this.modelLight?.dispose();
    this.nightSky.dispose();
    this.sun.dispose();
    this.lampCones.dispose();
    this.roadMarkers.dispose();
    this.resizing.disconnect();
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** The hour of the day (local, 0..24) the view shows. Nothing of the track changes and nothing is saved. */
  setClock(hours: number) {
    this.clock = hours;
    this.applyLight();
  }

  /** The hour shown: Play starts AC at it. */
  clockHours() { return this.clock; }

  /** Sun, ambient, sky and reflections from the place and the clock, the same values for all that is drawn. */
  private applyLight() {
    const light = lightAt(sunHeight(this.place, this.clock));
    this.scene.background = new THREE.Color(light.sky);
    this.ambient.color.set(light.ambientColour); this.ambient.intensity = light.ambient;
    this.sun.color.set(light.sunColour); this.sun.intensity = light.sun;
    this.sun.position.fromArray(sunDirection(this.place, this.clock));
    const moon = moonDirection(this.place, this.clock);
    this.moon.intensity = light.moon; this.moon.position.fromArray(moon);
    this.nightSky.set(moon, light.night);
    this.nightGlow.set(lampsOn(sunHeight(this.place, this.clock)));
    this.textures.followLights();
    if (this.modelLight) this.modelDraw.setEnvironment(this.modelLight.texture, this.reflections());
    this.dirty = true;
  }

  /** A window mask of the track, null for a track built before them. */
  private async glowImage(file: string) {
    const answer = await fetch(`/api/editor/${encodeURIComponent(this.trackName)}/glow/${file}`);
    return answer.status === 200 ? makeTexture(await answer.arrayBuffer(), file, this.renderer.capabilities.getMaxAnisotropy(), true) : null;
  }

  /** The power of the models' reflections: they fade with the sky's light, full by day. */
  private reflections() { return this.ambient.intensity / lightAt(90).ambient; }

  /** Its tab was opened or left. */
  show(on: boolean) {
    this.shown = on;
    if (on) this.resize();
    else {
      this.navigation.flying.clear();
      this.navigation.zoomLeft = 0;
    }
  }

  /** How the view moves from now on (the Editor settings). */
  setControls(c: Controls) {
    this.settings = c;
    this.navigation.settings = c;
  }

  /** onHover gets what the mouse points at, null when nothing. */
  setHover(onHover: (hovered: Hovered | null) => void) {
    this.onHover = onHover;
  }

  /** A painted ground region, highlighted independently of deletable objects. Null releases all mask memory. */
  async setSurface(selection: SurfaceSelection | null, failed: (message: string) => void = () => {}) {
    this.surfaceFailed = failed;
    if (!selection) { this.surfaceOverlay?.clear(); return; }
    this.surfaceOverlay ??= new SurfaceOverlay(this.scene, () => { this.dirty = true; }, bytes => {
      if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
      this.usedBytes += bytes;
      return true;
    }, bytes => { this.usedBytes -= bytes; });
    await this.surfaceOverlay.set(selection, this.meshes);
  }

  /** Smooth road uses the painted footprint in orange; its softer terrain transition is a separate small mask. */
  async setRoadRegion(selection: SurfaceSelection | null) {
    if (!selection) { this.roadRegionOverlay?.clear(); return; }
    this.roadRegionOverlay ??= this.makeRoadOverlay();
    await this.roadRegionOverlay.set(selection, this.meshes);
  }

  async setRoadInfluence(selection: SurfaceSelection | null) {
    if (!selection) { this.roadInfluenceOverlay?.clear(); return; }
    this.roadInfluenceOverlay ??= this.makeRoadOverlay();
    await this.roadInfluenceOverlay.set(selection, this.meshes);
  }

  private makeRoadOverlay() {
    return new SurfaceOverlay(this.scene, () => { this.dirty = true; }, bytes => {
      if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
      this.usedBytes += bytes; return true;
    }, bytes => { this.usedBytes -= bytes; }, undefined, 0xf39c35, .42);
  }

  /** onIndexed gets the state of the track file shown as soon as it is known, null when none is. */
  setIndexed(onIndexed: (revision: string | null) => void) {
    this.onIndexed = onIndexed;
    onIndexed(this.data?.revision ?? null);
  }

  /** The keys to the view. */
  focus() {
    this.renderer.domElement.focus({preventScroll: true});
  }

  /** Material regions were identified as their meshes loaded; no topology search belongs to a click. */
  materialSelection(point: SurfacePoint): SurfaceSelection {
    const source = this.byNumber.get(point.mesh), region = this.materialAreas.get(point.mesh);
    if (!source || !region || point.face === undefined || !this.data) throw new Error("This material is no longer loaded");
    const info = source.userData.info as MeshInfo;
    const meshes: {mesh: number; faces: number[]}[] = [];
    for (const [number, areas] of this.materialAreas) {
      const mesh = this.byNumber.get(number);
      if (!mesh || (mesh.userData.info as MeshInfo).material !== info.material || (!point.whole && number !== point.mesh)) continue;
      const faces = point.whole ? areas.facesOfOwner(point.object ?? null) : areas.faces(point.face);
      if (faces.length) meshes.push({mesh: number, faces});
    }
    return {material: this.data.materials[info.material].name, truncated: false, tiles: [], meshes};
  }

  /** Show the track name; say(text) gets the progress or the fault. Returns when all is loaded (or another track was asked
      for: what the older one still says or fails with is nobody's business any more). */
  async open(name: string, say: Say) {
    const mine = ++this.token;
    this.loading.abort();
    this.loading = new AbortController();
    const {signal} = this.loading;
    this.clear();
    this.trackName = name;
    this.onViewFailed(null);
    this.dirty = true;
    this.onHover(null);
    this.selection.unpick();
    this.onIndexed(null);
    say(name ? "Reading the track …" : "", name ? null : undefined);
    if (!name) return;
    try {
      await this.load(name, mine, signal, say);
    } catch (e) {
      if (mine !== this.token) return;
      this.textures.setLoaded(null);
      this.loading.abort();
      say(`Could not load this track: ${(e as Error).message}`, undefined, {failed: (e as Error).message});
    }
  }

  private async load(name: string, mine: number, signal: AbortSignal, say: Say) {
    const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(name)}/index`, signal);
    if (mine !== this.token) return;
    this.data = data;
    this.place = trackPlace(data.anchor);
    this.applyLight();
    if (data.models?.length) { this.ensureModelLight(); await this.modelDraw.sync(data.models, data.model_assets ?? {}, data.model_matrices ?? {}); }
    if (mine !== this.token) return;
    if (data.paint_errors?.length) this.onViewFailed(`Some material edits could not be shown: ${data.paint_errors.join("; ")}. Original textures are shown for affected areas. Revert to saved removes them while they are unsaved.`);
    this.objects.index(data.objects);
    this.objects.rewant();                  // (the sorts named before the list was there; no mesh is loaded yet)
    if (data.treefx) void this.loadTrees();
    this.onIndexed(data.revision);
    this.navigation.placeCamera(data);
    this.renderer.domElement.focus({preventScroll: true});     // (W A S D work at once, not in the track's dropdown)
    // Generated geometry has its own cancellable loader. Original MeshInfos never change when a copy is added or undone.
    let queue = nearestLast<MeshInfo>(data.meshes.filter((m: MeshInfo) => !m.copy && !m.model), this.camera.position.toArray());
    let sortedAt = this.camera.position.clone(), sortedWhen = performance.now();
    const total = data.meshes.filter(m => !m.model).length;
    let done = 0, copiedDone = 0, texturesDone = 0;
    // Ground tiles whose selection sections are prepared: one request at a time takes those loaded since the last, at most
    // PREPARE_BATCH; the server makes several on several processes (surfaceindex.prepare)
    const prepared = new Set<string>(), waiting: MeshInfo[] = [], preparing: Promise<void>[] = [];
    let sending = false;
    const prepareWaiting = async () => {
      sending = true;
      try {
        while (waiting.length && !signal.aborted && mine === this.token) {
          const batch = waiting.splice(0, PREPARE_BATCH);
          await fetchBytes(`/api/editor/${encodeURIComponent(name)}/surface/prepare?${batch.map(m => `mesh=${m.i}`).join("&")}&r=${data.revision}`, signal);
          preparedDone += batch.length;
          report();
        }
      } finally { sending = false; }
    };
    const available = new Set<string>(data.surface_tiles ?? []);
    const tiles = new Set(data.meshes.map(m => groundTile(m.name)).filter((tile): tile is string => tile !== null && available.has(tile)));
    const neededImages = new Set(data.meshes.filter(m => !m.model).flatMap((m: MeshInfo) => materialImages(data.materials[m.material])));
    const textureCount = neededImages.size;
    const tasks = total + textureCount + tiles.size;
    let preparedDone = 0, meshesReady = false;
    const first = (data.surface_unprepared ?? 0) > 0;      // (its sections for selecting are computed now, once: surfaceindex)
    const report = () => {
      if (mine !== this.token) return;
      const text = !meshesReady ? `Loading: ${done + copiedDone} of ${total} parts`
        : texturesDone < textureCount && !this.overLimit ? `Loading textures: ${texturesDone} of ${textureCount}`
        : `Preparing selection: ${preparedDone} of ${prepared.size} (${done + copiedDone} parts)`;
      // Task counts describe work done, not time remaining. Only the final status ends the loading indicator.
      say(text, Math.min(1, (done + copiedDone + texturesDone + preparedDone) / Math.max(1, tasks)), {first});
    };
    this.textures.setLoaded(() => { texturesDone++; report(); });
    const copied = data.meshes.some((m: MeshInfo) => m.copy) ? this.syncCopies(data).then(() => {
      copiedDone = data.meshes.filter((m: MeshInfo) => m.copy).length;
      report();
    }) : Promise.resolve();
    report();
    const worker = async () => {
      while (queue.length && mine === this.token) {
        if (performance.now() - sortedWhen > RESORT_EVERY_MS && sortedAt.distanceTo(this.camera.position) > RESORT_M) {
          queue = nearestLast<MeshInfo>(queue, this.camera.position.toArray());
          sortedAt = this.camera.position.clone();
          sortedWhen = performance.now();
        }
        const info = queue.pop()!;
        if (this.byNumber.has(info.i)) continue;
        if (!fits(this.usedBytes, COPIES * meshBytes(info), this.settings.memoryGb)) {
          this.overLimit = true;
          queue.length = 0;
          return;
        }
        this.usedBytes += COPIES * meshBytes(info);
        const asked = this.heightsVersion;
        const buf = await fetchBytes(meshUrl(name, data, info), signal);
        if (mine !== this.token) return;
        this.addMesh(name, data, info, buf);
        const tile = groundTile(info.name);
        if (tile && available.has(tile) && !prepared.has(tile)) {
          prepared.add(tile);
          waiting.push(info);
          if (!sending) {
            const preparation = prepareWaiting();
            preparing.push(preparation);
            // Attach a rejection handler immediately, before the source queue finishes; load reports the error below.
            void preparation.catch(() => {});
          }
        }
        if (asked !== this.heightsVersion) void this.refresh(info.i);      // (changed on its way)
        done++;
        report();
      }
    };
    await Promise.all(Array.from({length: PARALLEL}, worker));
    await copied;
    if (mine !== this.token) return;
    meshesReady = true;
    report();
    await this.textures.settled();
    if (mine !== this.token) return;
    if (preparedDone < prepared.size) report();
    await Promise.all(preparing);
    if (mine !== this.token) return;
    this.textures.setLoaded(null);
    say(this.overLimit ? `Memory limit reached (Settings): ${done} of ${total} parts, the nearest ones` : `${total} parts loaded`, undefined,
      {limited: this.overLimit});
  }

  /** The wheel: nearer to what the mouse points at or back from it, by a share of the way (ZOOM_STEP); the view keeps its direction.
      The mouse on the sky: the way the view looks, never upwards. */
  private zoomWheel(el: HTMLElement) {
    el.addEventListener("wheel", e => {
      e.preventDefault();
      // (Shift with the wheel is Smooth's: the brush has it for its way. Some browsers make it a sideways wheel: deltaX)
      const keys: WheelKeys | null = e.ctrlKey && e.altKey ? "ctrlAlt" : e.altKey ? "alt" : e.ctrlKey ? "ctrl" : e.shiftKey && this.wheelTaken ? "shift" : null;
      if ((this.brush.current || this.wheelTaken) && keys) {
        const notch = e.deltaY || e.deltaX;
        if (notch) this.onToolWheel(keys, notch < 0 ? 1 : -1);
        return;
      }
      this.navigation.stopRide();
      if (!this.data || this.held) return;      // (a button held: that drag goes by the camera as it was)
      this.mouse = screenPoint(e, el);
      const hit = this.pointing.hit(this.mouse), {ray} = this.pointing;
      this.navigation.zoomAt(e, hit, ray.direction);
    }, {passive: false});
  }

  /** The mouse over the view; while a button is held it moves the camera, the box waits. */
  private followMouse(el: HTMLElement) {
    el.addEventListener("pointermove", e => {
      this.mouse = screenPoint(e, el);
      this.held = e.buttons;
      if (!e.buttons) this.hoverDue = true;
    });
    el.addEventListener("pointerdown", e => { this.held = e.buttons; });
    el.addEventListener("pointerup", e => {
      this.held = e.buttons;
      this.hoverDue = true;
    });
    el.addEventListener("pointerleave", () => {
      this.mouse = null;
      this.hoverDue = false;
      this.onHover(null);
    });
  }

  /** The brush set, or none: while it is, the left button paints instead of picking. */
  setBrush(brush: Brush | null) {
    const was = this.brush.current;
    this.brush.set(brush);
    if (brush) {
      if (!was) this.selection.unpick();
      this.onHover(null);
    }
    this.applyCursor();
    this.dirty = true;
  }

  /** A stroke's preview (ViewBrush.setStroke) was kept, but the change it showed wasn't made: the meshes fetched as they are. */
  dropPreview() {
    const shown = [...this.geometryPreview.changedMeshes];
    this.geometryPreview.changedMeshes.clear();
    for (const i of shown) void this.refresh(i);
  }

  /** Whether Shift, Ctrl and Alt with the wheel go to setToolWheel's: a band is marked for Smooth, or Camera is on. */
  setWheelTaken(taken: boolean) {
    this.wheelTaken = taken;
  }

  /** The tool on, for the mouse pointer: it says what a click of it would do to what is under the mouse (cursor.ts). */
  setCursorTool(tool: Tool) {
    this.cursorTool = tool;
    this.applyCursor();
  }

  private applyCursor() {
    this.renderer.domElement.style.cursor = cursorFor({tool: this.cursorTool, dragging: this.mover.draggingNow, pin: this.roadMarkers.overPin,
      aiming: !!this.brush.current || this.ghost.placing}, this.pointed);
  }

  /** onClicked gets what the left button clicked, null for nothing there: picked already, and what a marking goes by. */
  setClicked(onClicked: (picked: Picked | null) => void) {
    this.onClicked = onClicked;
  }

  /** While a band is being marked: marking gets where the mouse is on the road, as often as the hover box would. */
  setMarking(marking: ((x: number, z: number) => void) | null) {
    this.marking = marking;
  }

  /** The height of the ground at x, z, or the last one known. */
  heightOfGround(x: number, z: number) {
    return this.groundAt(x, z) ?? this.navigation.lastGround;
  }

  /** A plant's foot at x, z on loaded terrain only, at the lowest ground within reach m of it (its foot's reach), so it floats
      nowhere on a slope or at a cliff edge; its uphill side sinks in. Bridges, water and missing terrain are not planting surfaces:
      under its middle that is no place, under a point of its ring that point is left out. */
  plantGround(x: number, z: number, reach = 0): [number, number, number] | null {
    const ground = (px: number, pz: number) => {
      const hit = this.groundAlong(new THREE.Vector3(px, VIEW_M, pz), new THREE.Vector3(0, -1, 0));
      return hit && BRUSHED.test(hit.object.name) ? hit.point.y : null;
    };
    let y = ground(x, z);
    if (y === null) return null;
    for (let i = 0; reach > 0 && i < FOOT_RING; i++) {
      const a = i * 2 * Math.PI / FOOT_RING, at = ground(x + reach * Math.cos(a), z + reach * Math.sin(a));
      if (at !== null) y = Math.min(y, at);
    }
    return [x, y, z];
  }

  /** The ground under a ring of radius round x, z, cheaply (groundGrid): nine points looked up, the heights between them interpolated;
      fallback where a point has no ground. */
  ringGround(x: number, z: number, radius: number, fallback: number) {
    return gridHeight(GRID_POINTS.map(([u, v]) => this.plantGround(x + u * radius, z + v * radius)?.[1] ?? null), x, z, radius, fallback);
  }

  private groupDraw: GroupDraw | null = null;
  private groups() {
    return this.groupDraw ??= new GroupDraw(this.scene, bytes => {
      if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
      this.usedBytes += bytes; return true;
    });
  }
  /** Each model's foot reach in m at size 1 (plantFoot), measured once on its loaded scene. */
  async groupFeet(models: LibraryModel[]): Promise<Record<string, number>> {
    const groups = this.groups();
    return Object.fromEntries(await Promise.all(models.map(async m => [m.id, await groups.foot(m) * m.metres_per_unit] as const)));
  }
  async showGroup(key: string, plants: GroupPlant[], models: LibraryModel[]) {
    const groups = this.groups();
    groups.environment(this.ensureModelLight(), this.reflections());
    await groups.show(key, plants, models); this.dirty = true;
    performance.clearMarks("map2lap.groups.preview");
    performance.mark("map2lap.groups.preview", {detail: {key, count: plants.length}});
  }
  async dropGroup(key: string) { await this.groupDraw?.drop(key); this.dirty = true; }
  confirmGroup(key: string, ids: string[], draft: number) { this.groupDraw?.confirm(key, ids, draft); }

  /** The ground under an object, null outside the loaded terrain: moving there preserves its current height. */
  private groundAt(x: number, z: number) {
    return this.groundAlong(new THREE.Vector3(x, VIEW_M, z), new THREE.Vector3(0, -1, 0))?.point.y ?? null;
  }

  /** onToolWheel gets the wheel over the view with the brush set or the wheel taken, and those keys held: a notch up, 1, down, -1. */
  setToolWheel(onToolWheel: (keys: WheelKeys, by: number) => void) {
    this.onToolWheel = onToolWheel;
  }

  /** The meshes by number the server now hands out otherwise (it says which: only it knows what moves with a change), its list in that
      revision: those loaded are fetched anew. The changes aren't reckoned here: there is one reckoning, the server's, which Save uses too. */
  refreshMeshes(meshes: number[], more = false, trees: TreeFxChange | null = null) {
    // (the TreeFX trees an answer changed, taken only once no other change is on its way: an older answer would set back what Move
    // shows of a later notch of the wheel)
    if (trees) this.treeChanges = mergeChanges(this.treeChanges, trees);
    if (this.treeChanges && !more) { const change = this.treeChanges; this.treeChanges = null; void this.applyTrees(change); }
    if (meshes.includes(-2)) {
      void (async () => {
        await this.reloadModels();
        this.refreshMeshes(meshes.filter(i => i >= 0));
      })();
      return;
    }
    if (meshes.some(i => this.data?.meshes.find(m => m.i === i)?.model)) void this.refreshModelTransforms();
    if (meshes.includes(-1)) void this.syncCopies();
    // (a preview taken over: what showed it, whether or not the server names it. One still in place goes on again over what comes: takeVertices)
    const all = new Set(this.geometryPreview.active ? meshes : [...meshes, ...this.geometryPreview.changedMeshes]);
    if (!this.geometryPreview.active) this.geometryPreview.changedMeshes.clear();
    if (!all.size) return;
    this.heightsVersion++;
    for (const i of all) if (i >= 0) void this.refresh(i);
  }

  /** Commit model bindings/matrices and the preceding copy layout together; models need no per-instance buffers. */
  private async reloadModels(): Promise<number | null> {
    const mine = this.token, asked = ++this.modelTransformVersion, signal = this.loading.signal;
    ++this.copyVersion; this.copyLoading?.abort();
    try {
      const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/index`, signal);
      const copiesChanged = this.loadedCopyRevision !== (data.copy_revision ?? "");
      const copies = copiesChanged ? data.meshes.filter(info => info.copy) : [];
      const jobs = oneByOne(PARALLEL);
      const oldCopies = copiesChanged ? this.meshes.filter(m => (m.userData.info as MeshInfo).copy)
        .reduce((sum, m) => sum + COPIES * meshBytes(m.userData.info as MeshInfo), 0) : 0;
      const copyBytes = copies.reduce((sum, info) => sum + COPIES * meshBytes(info), 0);
      if (!fits(this.usedBytes - oldCopies, copyBytes, this.settings.memoryGb)) throw new Error("The copies exceed the Editor memory limit");
      const copyBuffers = await Promise.all(copies.map(info => jobs(() => fetchBytes(meshUrl(this.trackName, data, info), signal))));
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      if (data.models?.length) this.ensureModelLight();
      await this.modelDraw.sync(data.models ?? [], data.model_assets ?? {}, data.model_matrices ?? {});
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      // Models own no numbered scene meshes. Copies can take their former numbers without displacing an instance.
      if (copiesChanged && (copies.length || oldCopies)) this.applyCopies(data, copyBuffers, this.heightsVersion);
      this.data = data;
      this.objects.index(data.objects);
      this.objects.rewant(true);
      this.settlePending(data);
      this.loadedCopyRevision = data.copy_revision ?? "";
      this.selection.dropGone(id => id.startsWith("instance_") && !data.objects[id.split("#")[0]]);
      this.selection.reframe(); this.onViewFailed(null); this.dirty = true; this.hoverDue = true;
      return data.models?.length ?? 0;
    } catch (error) {
      if (mine === this.token && asked === this.modelTransformVersion && !signal.aborted) this.onViewFailed((error as Error).message);
      return null;
    }
  }

  private async refreshModelTransforms() {
    const mine = this.token, asked = ++this.modelTransformVersion, signal = this.loading.signal;
    try {
      const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/index`, signal);
      if (mine !== this.token || asked !== this.modelTransformVersion) return;
      this.modelDraw.transforms(data.model_matrices ?? {});
      this.mover.followModels();
      this.selection.reframe(); this.dirty = true; this.hoverDue = true;
    } catch (error) { if (mine === this.token && !signal.aborted) this.onViewFailed((error as Error).message); }
  }

  /** Reload only generated meshes and object ids, keeping the camera and the source track's meshes. */
  private async syncCopies(initial?: TrackIndex, retries = 2): Promise<void> {
    if (this.data?.models?.length || initial?.models?.length) { await this.reloadModels(); return; }
    ++this.modelTransformVersion;
    const mine = this.token, asked = ++this.copyVersion;
    this.copyLoading?.abort();
    this.copyLoading = new AbortController();
    const signal = AbortSignal.any([this.loading.signal, this.copyLoading.signal]);
    try {
      let data = initial;
      if (!data) {
        data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/copies`, signal);
      }
      if (mine !== this.token || asked !== this.copyVersion) return;
      if (data.revision !== this.data?.revision) throw new Error("The track changed");
      if (this.loadedCopyRevision === (data.copy_revision ?? "")) {
        this.data = {...this.data, draft: data.draft};
        this.settlePending(data); this.onViewFailed(null);
        return;
      }
      const added = data.meshes.filter(info => info.copy);
      const replacing = this.meshes.filter(m => (m.userData.info as MeshInfo).copy);
      const wasBytes = replacing.reduce((sum, m) => sum + COPIES * meshBytes(m.userData.info as MeshInfo), 0);
      const newBytes = added.reduce((sum, info) => sum + COPIES * meshBytes(info), 0);
      if (!fits(this.usedBytes - wasBytes, newBytes, this.settings.memoryGb)) throw new Error("The copies exceed the Editor memory limit");
      const heightAsked = this.heightsVersion, jobs = oneByOne(PARALLEL), revision = data.revision, tag = data.copy_revision ?? "";
      const buffers = await Promise.all(added.map(info => jobs(() => {
        signal.throwIfAborted();
        return fetchBytes(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${info.i}?r=${revision}&c=${tag}`, signal);
      })));
      if (mine !== this.token || asked !== this.copyVersion) return;
      if (!fits(this.usedBytes - wasBytes, newBytes, this.settings.memoryGb)) throw new Error("The copies exceed the Editor memory limit");
      this.applyCopies(data, buffers, heightAsked);
      this.loadedCopyRevision = data.copy_revision ?? "";
      this.onViewFailed(null);
    } catch (e) {
      if (mine !== this.token || asked !== this.copyVersion || signal.aborted) return;
      if (e instanceof MeshFetchError && e.status === 409 && retries > 0) return this.syncCopies(undefined, retries - 1);
      this.onViewFailed((e as Error).message);
    }
  }

  /** Atomically replace generated copy geometry within the same layout as the model meshes. */
  private applyCopies(data: TrackIndex, buffers: ArrayBuffer[], heightAsked: number) {
    const current = this.data!;
    const added = data.meshes.filter(info => info.copy), tag = data.copy_revision ?? "";
    for (const mesh of this.meshes.filter(m => (m.userData.info as MeshInfo).copy)) {
      const info = mesh.userData.info as MeshInfo;
      this.scene.remove(mesh);
      mesh.geometry.boundsTree = undefined;
      mesh.geometry.dispose();
      if (this.byNumber.get(info.i) === mesh) this.byNumber.delete(info.i);
      this.usedBytes -= COPIES * meshBytes(info);
    }
    this.meshes = this.meshes.filter(m => !(m.userData.info as MeshInfo).copy);
    const sourceObjects = Object.fromEntries(Object.entries(current.objects).filter(([key]) => !key.startsWith("copy_")));
    const copyObjects = Object.fromEntries(Object.entries(data.objects).filter(([key]) => key.startsWith("copy_")));
    this.data = {...current, copy_revision: tag, draft: data.draft,
      meshes: [...current.meshes.filter(info => !info.copy), ...added], objects: {...sourceObjects, ...copyObjects}};
    this.objects.indexCopies(copyObjects);
    this.objects.rewant();
    added.forEach((info, k) => {
      const bytes = COPIES * meshBytes(info);
      this.usedBytes += bytes;
      this.addMesh(this.trackName, this.data!, info, buffers[k]);
      if (heightAsked !== this.heightsVersion) void this.refresh(info.i);
    });
    this.selection.dropGone(id => {
      const [base, k] = id.split("#");
      return base.startsWith("copy_") && !copyObjects[base]?.faces[Number(k)]?.length;
    });
    this.selection.reframe();
    this.settlePending(data);
    this.dirty = true;
    this.hoverDue = true;
  }

  private treeChanges: TreeFxChange | null = null;      // what answers changed of the TreeFX trees, to take once the draft's changes are answered

  /** A TreeFX request's URL: the trees, a model or its image. */
  private treeUrl(rest: string) { return `/api/editor/${encodeURIComponent(this.trackName)}/treefx${rest}`; }

  /** The TreeFX trees as the server hands them out now (trackview.treefx), with what the draft leaves out. Only the last answer counts. */
  private async loadTrees() {
    const mine = this.token;
    try {
      await this.treeFx.load();
      if (mine !== this.token) return;
      this.leaveOutTrees();
      this.mover.followTrees();
      this.selection.reframe(); this.selection.reframeMarked();
      this.dirty = true; this.hoverDue = true;
    } catch (error) {
      if (mine === this.token && !this.loading.signal.aborted) this.onViewFailed((error as Error).message);
    }
  }

  /** What a draft answer changed of the TreeFX trees (refreshMeshes). */
  private async applyTrees(change: TreeFxChange) {
    const mine = this.token;
    try {
      await this.treeFx.apply(change);
      if (mine !== this.token) return;
      this.ghost.settleTrees(id => !!this.treeFx.tree(id), change.gone);
      this.leaveOutTrees();
      this.mover.followTrees();
      this.selection.reframe(); this.selection.reframeMarked();
      this.dirty = true; this.hoverDue = true;
    } catch (error) {
      if (mine === this.token && !this.loading.signal.aborted) this.onViewFailed((error as Error).message);
    }
  }

  /** The TreeFX trees the draft leaves out, and those Delete's brush has taken while its stroke runs. */
  private leaveOutTrees() {
    const gone = this.brush.goneNow;
    this.treesGone = gone;
    const removed = gone.size ? new Set([...this.objects.removed, ...gone]) : this.objects.removed;
    if (this.treeFx.leaveOut(removed, this.objects.removedObjectSorts)) this.dirty = true;
  }
  private treesGone: ReadonlySet<string> = new Set();      // (Delete's brush's gone, as leaveOutTrees last took it)

  private ensureModelLight() {
    if (!this.modelLight) {
      const target = modelLight(this.renderer);
      const bytes = target.width * target.height * 8; // RGBA16F, shared once per viewport.
      if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) { target.dispose(); throw new Error("The model lighting exceeds the Editor memory limit"); }
      this.modelLight = target; this.usedBytes += bytes;
    }
    this.modelDraw.setEnvironment(this.modelLight.texture, this.reflections());
    return this.modelLight.texture;
  }

  /** What Groups and the ghost showed before the draft had it goes once data draws it, or once a later draft no longer has it. */
  private settlePending(data: TrackIndex) {
    if (this.groupDraw) void this.groupDraw.settle(data.draft ?? 0, new Set(data.models?.map(m => m.id)), id => !!this.modelDraw.instance(id))
      .then(() => { this.dirty = true; }).catch(error => this.onViewFailed((error as Error).message));
    this.ghost.settle(data, this.meshes.some(m => (m.userData.info as MeshInfo).copy));
  }

  /** The ground under the mouse, whatever it is (Copy places on bridges and water too), or null. */
  private copyAt(): [number, number, number] | null {
    if (!this.mouse) return null;
    this.picker.setFromCamera(this.mouse, this.camera);
    const hit = this.groundAlong(this.picker.ray.origin, this.picker.ray.direction);
    return hit ? hit.point.toArray() as [number, number, number] : null;
  }

  /** onViewFailed gets what went wrong when the view can't show a change that was made, null when that is over. */
  setViewFailed(onViewFailed: (text: string | null) => void) {
    this.onViewFailed = onViewFailed;
  }

  /** Mesh number i fetched again, as the server hands it out now. Only the last answer per mesh counts. */
  private async refresh(i: number) {
    const mine = this.token, {signal} = this.loading, m = this.byNumber.get(i);
    if (!m || !this.data) return;
    const asked = m.userData.asked = (m.userData.asked ?? 0) + 1;
    m.userData.behind = true;
    try {
      const buf = await this.refreshes(() => fetchBytes(meshUrl(this.trackName, this.data!, m.userData.info as MeshInfo), signal));
      if (mine === this.token && m.userData.asked === asked && this.byNumber.get(i) === m) { this.takeVertices(m, buf); m.userData.behind = false; }
    } catch (e) {
      // (another track was asked for: nothing to say. Else the picture is behind what is kept: it mustn't look as if it were up to date)
      if (mine === this.token && !signal.aborted && m.userData.asked === asked && this.byNumber.get(i) === m) {
        if (e instanceof MeshFetchError && e.status === 409 && (m.userData.info as MeshInfo).copy) void this.syncCopies();
        else this.onViewFailed((e as Error).message);
      }
    }
  }

  /** The mesh's vertices from bytes as a mesh is handed out; its triangles stay, with what is left out of them. */
  private takeVertices(m: THREE.Mesh, buf: ArrayBuffer) {
    const g = m.geometry, info = m.userData.info as MeshInfo;
    if (GROUND.test(info.name)) this.groundVersion++;
    const data = (g.getAttribute("position") as THREE.InterleavedBufferAttribute).data;
    data.array.set(new Float32Array(buf, 0, info.vertices * FLOATS_PER_VERTEX));
    data.needsUpdate = true;
    this.geometryPreview.replaced(info.i);       // (what it covered is no more: what lies under it is what just came)
    // (what is being dragged stays where the mouse has it: the server's mesh has it where it was taken up)
    this.mover.followMesh(info.i);
    fitSphere(g, info);
    g.boundsTree?.refit();
    if (GROUND.test(info.name)) this.roadMarkers.followGround(g.boundingBox!);
    this.geometryPreview.apply(info.i);
    this.selection.markLater();
    this.selection.reframe();
    this.dirty = true;
    this.hoverDue = true;
  }

  /** The ground under the mouse if a stroke can go on it, else null. */
  private brushAt() {
    if (!this.mouse || !this.data) return null;
    this.picker.setFromCamera(this.mouse, this.camera);
    const {ray} = this.picker, hit = this.groundAlong(ray.origin, ray.direction);
    return hit && BRUSHED.test(hit.object.name) ? hit.point : null;
  }

  /** A press and release without moving (away and back is a drag too): the left button picks what is under the mouse, the right one picks it and asks for its
      menu (a right drag moves the view, as before). With the brush set the left button is the brush's, with Move on moves'. */
  private clicks(el: HTMLElement) {
    let from: {x: number; y: number; button: number} | null = null;
    el.addEventListener("pointerdown", e => {
      // (a press on a pin is the pin's: it is dragged, a right click takes it away)
      from = (e.button === 0 && !this.brush.current && !this.mover.on && this.roadMarkers.pinAt(e, el) < 0) || e.button === 2 ? {x: e.clientX, y: e.clientY, button: e.button} : null;
    });
    el.addEventListener("pointermove", e => {
      if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) >= CLICK_PX) from = null;
    });
    el.addEventListener("pointerup", e => {
      const pin = from?.button === 2 && e.button === 2 ? this.roadMarkers.pinAt(e, el) : -1;
      if (pin >= 0) this.roadMarkers.onPinTaken(pin);
      else if (from && e.button === from.button) {
        if (e.button === LEFT_BUTTON && this.ghost.placing) {
          this.mouse = screenPoint(e, el);
          this.ghost.place();
          from = null;
          return;
        }
        const picked = this.pick(e, el), r = el.getBoundingClientRect();
        if (e.button === 2 && picked) this.onMenu({x: e.clientX - r.left, y: e.clientY - r.top, width: r.width, height: r.height});
        if (e.button === LEFT_BUTTON) this.onClicked(picked);
      }
      from = null;
    });
    el.addEventListener("contextmenu", e => e.preventDefault());
  }

  /** Imported models beyond their distance or left out hidden: by the draft, or by Delete's brush under way (showGone), whose models
      would otherwise stand until the draft answers. */
  private cullModels() {
    const gone = this.brush.goneNow;
    const out = gone.size ? new Set([...this.objects.removed, ...gone]) : this.objects.removed;
    this.modelDraw.cull(this.camera.position, out, this.data?.meshes.find(m => m.model)?.lod_out ?? 1000);
  }

  /** What a click picks (Selection.pick) of what is under the mouse at e. */
  private pick(e: PointerEvent, el: HTMLElement, point?: THREE.Vector3): Picked | null {
    if (!this.data) return null;
    this.mouse = screenPoint(e, el);
    const hit = this.pointing.hit(this.mouse);
    if (hit && point) point.copy(hit.point);
    return this.selection.pick(e, hit, hit ? this.pointing.describe(hit) : null);
  }

  /** onMenu gets where a right click asks for the picked object's menu, in the view's pixels, with the view's size. */
  setMenu(onMenu: (at: MenuAt) => void) {
    this.onMenu = onMenu;
  }

  /** Current dimensions from loaded object triangles, independent of the surrounding merged mesh. */
  dimensionsOf(id: string): [number, number, number] {
    const size = this.objects.boundsOf(id).getSize(new THREE.Vector3());
    return [size.x, size.y, size.z];
  }

  /** What the mouse points at now, told to onHover. */
  private hover() {
    if (!this.mouse || !this.data || this.brush.current) return;     // (the brush shows its ring instead)
    if (this.marking) {
      const at = this.brushAt();
      if (at) this.marking(at.x, at.z);
    }
    const mouse = this.mouse, hit = timed("map2lap.hover", () => this.pointing.hit(mouse));
    const hovered = hit ? this.pointing.describe(hit) : null;
    const taking = this.cursorTool === "move" || this.cursorTool === "copy";
    this.pointed = hit && hovered ? {object: !!hovered.id, road: ROAD.test(hit.object.name),
      movable: taking && !!hovered.id && this.mover.canMove(this.mover.on ? this.objects.rootOf(hovered.id) : hovered.id)} : null;
    this.applyCursor();
    this.onHover(hovered);
  }

  /** The first ground a ray meets. */
  private groundAlong(origin: THREE.Vector3, direction: THREE.Vector3) {
    this.down.set(origin, direction);
    return timed("map2lap.ground", () => this.down.intersectObjects(this.grounds, false)[0]);
  }

  /** The camera was moved: what is shown and what the mouse points at are to be looked at again. */
  private moved() {
    this.camera.updateMatrixWorld();
    this.dirty = true;
    this.hoverDue = true;
  }

  home() { this.navigation.home(); }
  setRide(speed: number, height: number) { this.navigation.setRide(speed, height); }
  setRideWatch(onMoving: (moving: boolean) => void, onMetre: (metre: number | null) => void) { this.navigation.setRideWatch(onMoving, onMetre); }
  tellRideMetre() { this.navigation.tellRideMetre(); }
  rideBy(metres: number) { return this.navigation.rideBy(metres); }
  toggleRide() { return this.navigation.toggleRide(); }
  stopRide() { this.navigation.stopRide(); }

  drawBand(line: Place[] | null, width: number) { this.roadMarkers.drawBand(line, width); }
  drawPins(pins: Place[]) {
    this.roadMarkers.drawPins(pins);
    this.applyCursor();
  }
  setPinned(moved: (pin: number, x: number, z: number) => void, taken: (pin: number) => void) { this.roadMarkers.setPinned(moved, taken); }

  takeBackPreview() { this.geometryPreview.takeBackPreview(); }
  keepPreview() { this.geometryPreview.keepPreview(); }
  showPreview(bytes: ArrayBuffer) { this.geometryPreview.showPreview(bytes); }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private modelFailure: string | null = null;
  /** The models' instance batches brought up to date; a refusal (the memory limit) is told once and the last batches stay drawn. */
  private flushModels() {
    try { this.modelDraw.flush(); this.modelFailure = null; }
    catch (error) { const message = String((error as Error).message ?? error); if (message !== this.modelFailure) { this.modelFailure = message; this.onViewFailed(message); } }
  }

  private frame() {                 // (drawn only when something changed)
    const now = performance.now(), seconds = Math.min(FLY_MAX_STEP_S, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.shown && this.navigation.ride) this.navigation.rideOn(seconds);
    if (this.shown && this.navigation.flying.size) this.navigation.fly(seconds);
    if (this.shown && this.navigation.zoomLeft) this.navigation.glideZoom(seconds);
    if (!this.shown) return;
    this.ghost.follow();
    if (this.dirty) {
      this.dirty = false;
      for (const m of this.meshes) {  // AC's distances for objects; ground stays closed when viewing the track from high above
        const d = this.camera.position.distanceTo(m.geometry.boundingSphere!.center);
        m.visible = d >= m.userData.lodIn && (GROUND.test(m.name) || d < m.userData.lodOut);
      }
      this.cullModels();
      if (this.brush.goneNow !== this.treesGone) this.leaveOutTrees();
      this.treeFx.follow(this.camera.position);
      this.surfaceOverlay?.follow();
      this.flushModels();
      this.roadRegionOverlay?.follow();
      this.roadInfluenceOverlay?.follow();
      this.nightSky.follow(this.camera.position);
      this.lampCones.update(this.lampGlass, this.nightGlow.on);
      const renderStarted = performance.now();
      this.sunShadows.draw(this.camera, this.navigation.height);
      this.textures.render(this.camera);
      this.renderer.render(this.scene, this.camera);
      if (this.data?.models?.length) {
        performance.clearMarks("map2lap.models.frame");
        performance.mark("map2lap.models.frame", {detail: {sceneCalls: this.renderer.info.render.calls,
          sceneTriangles: this.renderer.info.render.triangles, uploadedGeometries: this.renderer.info.memory.geometries,
          uploadedTextures: this.renderer.info.memory.textures, reservedViewBytes: this.usedBytes,
          cpuRenderMs: performance.now() - renderStarted}});
      }
    }
    if (this.hoverDue && now - this.lastHover >= HOVER_EVERY_MS) {
      this.hoverDue = false;
      this.lastHover = now;
      this.hover();
    }
    this.selection.follow(now);
  }

  private clear() {
    this.nightGlow.clear();
    this.lampGlass = [];
    this.modelTransformVersion++;
    this.modelDraw.dispose();
    this.treeFx.dispose(); this.treeChanges = null;
    this.groupDraw?.dispose(); this.groupDraw = null;
    this.textures.clear();
    this.surfaceOverlay?.clear();
    this.roadRegionOverlay?.clear();
    this.roadInfluenceOverlay?.clear();
    this.ghost.setCopy(null, null);
    this.ghost.dropAll();
    this.modelLight?.dispose(); this.modelLight = null;
    this.copyVersion++;
    this.copyLoading?.abort();
    this.loadedCopyRevision = null;
    this.navigation.stopRide();
    for (const m of this.meshes) {
      this.scene.remove(m);
      m.geometry.boundsTree = undefined;
      m.geometry.dispose();
    }
    this.geometryPreview.keepPreview();
    this.geometryPreview.changedMeshes.clear();
    this.meshes = [];
    this.grounds = [];
    this.usedBytes = 0;
    this.overLimit = false;
    this.data = null;
    this.navigation.data = null;
    this.pointing.clear();
    this.byNumber.clear();
    this.mover.clear();
    this.materialAreas?.clear();
    this.objects.clear();
    this.selection.forget();
  }

  private addMesh(name: string, data: TrackIndex, info: MeshInfo, buf: ArrayBuffer) {
    if (this.byNumber.has(info.i)) return;
    const m = new THREE.Mesh(makeGeometry(info, buf), this.textures.material(name, data, info.material));
    m.userData = {lodIn: info.lod_in, lodOut: info.lod_out, info};
    m.name = info.name;
    takeShadows(m);
    if (!info.model) {
      const material = data.materials[info.material]?.name ?? "";
      if (isLampGlass(material)) this.lampGlass.push(m);
      this.nightGlow.bind(m.material as GroundMaterial, material);
    }
    this.scene.add(m);
    this.textures.attach(m);
    this.meshes.push(m);
    this.byNumber.set(info.i, m);
    // (a model is always picked as its object: it never reaches the search for a material's connected faces)
    if (!info.model && !groundTile(info.name) && (this.objects.holds(info.i) || /^nocol_road_edge_dirt_/.test(info.name))) {
      this.materialAreas ??= new Map();
      this.materialAreas.set(info.i, new MaterialRegions(m.geometry.getAttribute("position"),
        (m.userData.indices ?? m.geometry.getIndex()!.array) as Uint16Array, this.objects.piecesIn(info.i) ?? []));
    }
    void this.surfaceOverlay?.add(m).catch(e => this.surfaceFailed(String(e.message ?? e)));
    void this.roadRegionOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
    void this.roadInfluenceOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
    this.geometryPreview.apply(info.i);
    this.objects.hideIn(m);
    this.selection.markLater();
    if (GROUND.test(info.name)) {
      this.groundVersion++;
      this.usedBytes += speedUpRays(m);
      this.grounds.push(m);
      const box = m.geometry.boundingBox!, c = this.camera.position;
      if (c.x >= box.min.x && c.x <= box.max.x && c.z >= box.min.z && c.z <= box.max.z) this.navigation.settle();    // (it may have got below it)
    }
    this.dirty = true;
    this.hoverDue = true;
  }

}
