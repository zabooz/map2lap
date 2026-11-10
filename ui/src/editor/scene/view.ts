// The Editor tab's 3D view of a built track (src/app/trackview.py hands out its kn5's parts). W A S D and right drag move
// over the ground, the wheel zooms towards the mouse, held it turns and tilts around the view's middle, as in a building game. Meshes
// load nearest first, so the spot in view comes first on a long track. A click picks what is under the mouse; with Move on, a press picks
// it and a drag takes it along over the ground.
import type {Hovered, Picked, MenuAt, Place, Sample, Brush, WheelKeys, Marked, MeshInfo, MaterialInfo, TrackIndex} from "../types";
import {Navigation, VIEW_M, FLY_MAX_STEP_S} from "./navigation";
import {FLOATS_PER_VERTEX, speedUpRays, meshBytes, meshUrl, modelMeshKey, fitSphere, makeGeometry} from "./geometry";
import {screenPoint, LEFT_BUTTON, LEFT_HELD, CLICK_PX} from "./pointer";
import {RoadMarkers} from "./roadMarkers";
import {GeometryPreview} from "./geometryPreview";
import {addSample} from "./strokeSamples";
import * as THREE from "three";
import {makeTexture} from "./texture";
import {oneByOne} from "./taskQueue";
import {DEFAULT_CONTROLS, type Controls} from "./controls";
import {nudgeVertices, STILL, type Nudge, type Placement} from "../tools/placing";
import type {CopyPose} from "../tools/copying";
import {groundTile, SurfaceOverlay, type SurfacePoint, type SurfaceSelection} from "./surfaces";
import {MaterialRegions} from "./materials";
import {ModelDraw} from "./modelDraw";
import {modelLight} from "./modelLighting";
import {bindLightShares, takesGroundLight} from "./lightShare";
import {NightSky} from "./nightSky";
import {SunShadows, sunLight, takeShadows} from "./sunShadows";
import {LampCones, NightGlow, isLampGlass, lampsOn} from "./nightGlow";
import {lightAt, moonDirection, MOON_COLOUR, sunDirection, sunHeight, trackPlace} from "./sun";
import {fetchBytes, fetchJson, MeshFetchError} from "./requests";
import {WeightBundles} from "./weightBundle";
import {GroundFrame, GroundLayer} from "./groundRender";
import {bindColourBlend, bindWorldColour, bindSplat, materialImages, type GroundMaterial, type ColourImage, type ColourSplat, type GroundTextureUpdate} from "./colourBlend";
import {billboardFaces, billboardOf, childrenOf, countOfSort, decodedBytes, fits, idsOfSorts, kindName, kindOf, latLonOf, nearestLast, objectAt,
        objectIndex, physicsOf, routeMetre, sortOf, spriteAt, takenAlong, tileOf} from "./inspect";

interface SplatImageEntry {
  done: Promise<THREE.Texture | null>; controller: AbortController; bytes: number; token: number;
  texture?: THREE.Texture; disposed: boolean;
}
interface SplatPending {keys: Set<string>; done: Promise<void>}

const PARALLEL = 6;                 // meshes asked for at a time
// Textures on their way or being decoded at a time. A 307 km track up to a limit of 8 GB: 6: 70 s, 12: 52 s, 24: 53 s; 4 GB without any
// limit 34 s against 23 s with 12: hundreds at once stand in the meshes' way.
const TEXTURES_AT_A_TIME = 12;
const RESORT_M = 100, RESORT_EVERY_MS = 500;    // the queue of meshes sorted again when the view moved this far, at most this often: 66,000 take a while
// The memory limit (the settings): a long track's kn5 can reach 10 GB, more than a browser tab can hold. What lies furthest
// from the view then stays out. A mesh or compressed texture counts twice: it stays here for the mouse and the ground, and
// the graphics card holds a copy. An estimate: the browser's own overhead is not counted.
const COPIES = 2;
const GROUND = /^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/;   // the meshes the view stays above: over a river's surface, not its bed
const HOVER_EVERY_MS = 60;          // how often the mouse's target is looked up: the box follows, the view stays smooth
const PICKED_COLOUR = "#ffd21f";
const MARK_EVERY_MS = 300;          // the frames of a marked sort follow meshes loading at most this often
const BOX_EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6],
                   [3, 7]];         // (a box's 12 edges by their corners' numbers: bits x 1, y 2, z 4)
// what the build lists (src/track/objectlist.py, LISTED): an older track's can't be picked yet
const IN_THE_LIST = /^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/;
const WIRE = /_wire_/;
const WIRE_REACH_PX = 6;            // a wire is thinner than a pixel from afar: the mouse this near it finds it
const FACES_PER_WIRE_SEGMENT = 8;   // (furniture.wire_mesh: two crossed ribbons, each side of each two triangles)
const NOT_MOVED = new Set(["power line"]);      // (placement.NOT_ALONE: a span goes where its poles go)
const BRUSHED = /^(1ROAD|1GRASS|1GRAVEL)_ground/;   // what a stroke goes on: the ground itself, no bridge or water, whatever else the camera keeps above
const ROAD = /^1ROAD_ground/;       // what a click marks a band on (trackband: the road is this)
const SAMPLE_EVERY_MS = 50;         // where the ring is, this often while the mouse is held: finer than a hand moves it, and it counts the time where it stands
const PREVIEW_EVERY_MS = 200;       // how often a stroke under way is asked for: at most one at a time, what is newest when it is answered goes next
const RING_POINTS = 64;

/** fn, its time to read in the browser's performance tools under name (only the last one is kept). */
function timed<T>(name: string, fn: () => T) {
  performance.clearMeasures(name);
  const started = performance.now();
  const result = fn();
  performance.measure(name, {start: started});
  return result;
}

/** The triangles of a mesh that make up an object. */
interface Piece {
  mesh: number;
  from: number;
  end: number;
}

/** The vertices of an object in one mesh as they were when it was taken up: their numbers, their floats in that order. */
interface Grabbed {
  id: string;
  mesh: number;
  numbers: Uint32Array;
  floats: Float32Array;
  modelMatrix?: THREE.Matrix4;
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

const textureTurn = oneByOne(TEXTURES_AT_A_TIME);



/** three.js in the element host, showing one track. dispose() ends it. */
export class TrackView {
  private copyVersion = 0;
  private copyLoading: AbortController | null = null;
  private copyStamp: number[] = [];
  private groundVersion = 0;
  private copyGhost: THREE.Group | null = null;
  private copyRelease: (() => void) | null = null;
  private modelGhostVersion = 0;
  private modelGhostSolid: THREE.Object3D | null = null;       // the placement ghost's model with its own materials, for a click to show at once
  private modelGhostHold: (() => () => void) | null = null;    // keeps the ghost's loaded model until the returned call
  private pendingModels = new Map<number, {root: THREE.Group; release: () => void; instance?: string; draft?: number}>();
  private pendingKey = 0;
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
  private copyFoot = new THREE.Vector3();
  private copyPose: CopyPose = {turn: 0, y: 0, scale: 1};
  private onCopyPlace: ((at: [number, number, number]) => void) | null = null;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private modelDraw = new ModelDraw(this.scene, undefined, bytes => {
    if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
    this.usedBytes += bytes; return true;
  });
  private modelTransformVersion = 0;
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
  private textures: (Promise<THREE.Texture | null> | undefined)[] = [];
  private textureBytes = new WeakMap<THREE.Texture, number>();
  private textureChanges = new Map<number, {abort: () => void; done: Promise<void>; version: string}>();
  private displayedTextures = new Map<number, string>();
  private paintFailure: string | null = null;
  private onTexturesChanged: () => void = () => {};
  private paintVersion = 0;
  private paintLoading: AbortController | null = null;
  private loadedTexture: (() => void) | null = null;
  private materials: (GroundMaterial | undefined)[] = [];
  private splatImages = new Map<string, SplatImageEntry>();
  private splatBindings = new Map<number, Set<string>>();
  private splatPending = new Map<number, SplatPending>();
  private sourceMaterials = new Map<number, MaterialInfo>();
  private groundLayers = new Map<number, GroundLayer>();
  private groundFrame: GroundFrame | null = null;
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
  private alphaOf = new Map<THREE.Texture, ImageData | null>();
  private onPick: (picked: Picked | null) => void = () => {};
  private onMenu: (at: MenuAt) => void = () => {};
  private marked: Marked | Marked[] | null = null;
  private markedLines: THREE.LineSegments | null = null;
  private markDue = false;              // (meshes loaded since the frames were drawn)
  private lastMark = 0;
  private markEvery = MARK_EVERY_MS;
  private onIndexed: (revision: string | null) => void = () => {};
  private picks = new Map<string, {box: THREE.Box3Helper; picked: Picked}>();   // (by id, as they were picked, each with its frame)
  private adding = false;               // Ctrl with the left button adds to what is picked
  private selectMode = {enabled: false, whole: false, add: false};
  private materialAreas = new Map<number, MaterialRegions>();
  private parts = new Map<string, THREE.Mesh[]>();      // a tile's billboard meshes by their base name
  private byNumber = new Map<number, THREE.Mesh>();     // the loaded meshes by number
  private objectPieces: ReturnType<typeof objectIndex> = new Map();    // the build's objects by mesh number
  private belonging: ReturnType<typeof childrenOf> = new Map();        // what belongs to which of them
  private removed = new Set<string>();                  // the ids of the objects left out, those of the sorts below too
  private removedSorts = new Set<string>();             // the sorts of trees and bushes left out
  private named: {ids: string[]; objectSorts: Set<string>} = {ids: [], objectSorts: new Set()};    // (as setRemoved was told)
  private listedOut = new Map<number, Piece[]>();       // what of the listed objects left out lies in each mesh, for one loading later
  private billboardsOut = new Map<string, string[]>();  // the trees and bushes left out by id, by the base of their meshes, the same
  private trackName = "";
  private heightsVersion = 0;           // a new number: the server hands out other meshes than a request on its way will bring
  private onViewFailed: (text: string | null) => void = () => {};
  private refreshes = oneByOne(PARALLEL);
  private brush: Brush | null = null;
  private onStroke: (samples: Sample[], turned: boolean) => void = () => {};
  private askPreview: (samples: Sample[], turned: boolean) => Promise<ArrayBuffer | string | null> = () => Promise.resolve(null);
  private onStrokeRefused: (why: string) => void = () => {};
  private onToolWheel: (keys: WheelKeys, by: number) => void = () => {};
  private ring: THREE.LineLoop | null = null;
  private stroke: {samples: Sample[]; turned: boolean; at: number; timer: ReturnType<typeof setInterval>; asked: number; asking: boolean; look: string} | null = null;
  private wheelTaken = false;           // Ctrl and Alt with the wheel are the tool's
  private marking: ((x: number, z: number) => void) | null = null;
  private onClicked: (picked: Picked | null) => void = () => {};
  private moveTool = false;             // Move is on: a press picks, a drag takes what is picked along
  private onMoved: (objects: {id: string; x: number; y: number; z: number}[]) => void = () => {};
  private placed = new Map<string, Placement>();        // how the draft places objects now (setPlaced)
  private pendingPivots = new Map<string, number[]>();   // a released drag already shown, before its canonical placement arrives
  private dragging: {ids: string[]; plane: THREE.Plane; from: THREE.Vector3; x: number; y: number; grabbed: Grabbed[]; pivots: Map<string, number[]>;
    ground: Map<string, number | null>; rises: Map<string, number>; way: THREE.Vector3} | null = null;

  constructor(host: HTMLElement) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    host.appendChild(this.renderer.domElement);
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
    this.moves(this.renderer.domElement);
    this.roadMarkers.attach(this.renderer.domElement, () => !!this.brush, event => {
      this.mouse = screenPoint(event, this.renderer.domElement);
      return this.brushAt();
    });
    this.strokes(this.renderer.domElement);
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
    this.groundFrame?.followLights();
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

  /** onPick gets what a click picked, null when nothing or when that's over. */
  setPick(onPick: (picked: Picked | null) => void) {
    this.onPick = onPick;
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

  /** What was picked is no more. */
  unpick() {
    this.forgetPicks();
    this.onPick(null);
  }

  /** Whether Ctrl with the left button adds to what is picked, or takes one out again; else it is a click like any. */
  setAdding(adding: boolean) {
    this.adding = adding;
  }

  setSelectMode(enabled: boolean, whole = false, add = false) { this.selectMode = {enabled, whole, add}; }

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

  /** The objects with these ids ("<mesh as built>#<number>"), the trees and bushes of sorts and the listed objects of objectSorts
      are left out from now on, those not named come back. A left out one's triangles shrink to a point: nothing draws or hits them,
      the others keep their numbers. What goes is what any of them takes along: a span two poles share stays out while one does. */
  setRemoved(ids: string[], sorts: string[] = [], objectSorts: string[] = []) {
    this.named = {ids, objectSorts: new Set(objectSorts)};
    const wantedSorts = new Set(sorts);
    const wanted = new Set([...ids, ...idsOfSorts(this.data?.objects ?? {}, new Set([...objectSorts, ...sorts]))]);
    const sortsChanged = sorts.length !== this.removedSorts.size || sorts.some(sort => !this.removedSorts.has(sort));
    let back = false;
    for (const id of this.removed) {
      if (!wanted.has(id)) {
        this.leaveOut(id, false);
        back = true;
      }
    }
    if (sortsChanged) {
      this.removedSorts = wantedSorts;
      for (const mesh of this.billboardMeshes()) this.restore(mesh);
      back = true;
    }
    // (what came back may have held a part of what stays out: a house back, its sign deleted by itself)
    for (const id of wanted) if (back || !this.removed.has(id)) this.leaveOut(id, true);
    // (the sorts of trees last: a tree brought back by its id may be of a sort that stays out)
    if (back && this.removedSorts.size) for (const mesh of this.billboardMeshes()) this.leaveOutSorts(mesh);
    this.removed = wanted;
    this.noteListedOut();
    if (this.marked) this.frameMarked();
    this.dirty = true;
    this.hoverDue = true;
  }

  /** The ids to leave out: those named, and the listed objects of the sorts named. */
  private wanted(named = this.named) {
    return new Set([...named.ids, ...(this.data?.model_replacements ?? []), ...idsOfSorts(this.data?.objects ?? {}, named.objectSorts), ...idsOfSorts(this.data?.objects ?? {}, this.removedSorts)]);
  }

  /** listedOut and billboardsOut for what is left out now: a whole sort of a long track is thousands of objects, too many to look
      through for each mesh that loads. */
  private noteListedOut() {
    this.listedOut = new Map();
    this.billboardsOut = new Map();
    for (const id of this.removed) {
      const base = id.slice(0, id.lastIndexOf("#"));
      if (!this.data?.objects?.[base]) {
        if (!this.billboardsOut.has(base)) this.billboardsOut.set(base, []);
        this.billboardsOut.get(base)!.push(id);
        continue;
      }
      for (const piece of this.piecesOf(id)) {
        if (!this.listedOut.has(piece.mesh)) this.listedOut.set(piece.mesh, []);
        this.listedOut.get(piece.mesh)!.push(piece);
      }
    }
  }

  /** How many objects of a listed sort the track still shows, over all of it, with these edits (the page's, as it renders: the
      view takes them only after): what the button to delete them all says. */
  countOfListed(sort: string, ids: string[], objectSorts: string[]) {
    if (!this.data) return 0;
    return countOfSort(this.data.objects, sort, takenAlong(this.wanted({ids, objectSorts: new Set(objectSorts)}), this.belonging));
  }

  private billboardMeshes() {
    return [...this.parts.values()].flat();
  }

  /** A mesh's indices as built, all it left out back. */
  private restore(mesh: THREE.Mesh) {
    const original = mesh.userData.indices as Uint16Array | undefined;
    if (!original) return;
    const index = mesh.geometry.getIndex()!;
    (index.array as Uint16Array).set(original);
    index.needsUpdate = true;
  }

  /** The billboards of a mesh part: [number, first triangle, end]. */
  private *billboardsOf(mesh: THREE.Mesh): Generator<[number, number, number]> {
    const info = mesh.userData.info as MeshInfo, faces = info.indices / 3, first = info.first_face!;
    for (let k = billboardOf(0, first); k <= billboardOf(Math.max(0, faces - 1), first); k++) {
      const [from, end] = billboardFaces(k, first, faces);
      if (from < end) yield [k, from, end];
    }
  }

  /** The sort of the billboard whose triangles start at face in mesh, by where its first triangle lies on the atlas. */
  private spriteOf(mesh: THREE.Mesh, face: number) {
    const uv = mesh.geometry.getAttribute("uv");
    const indices = (mesh.userData.indices ?? mesh.geometry.getIndex()!.array) as Uint16Array;
    const [a, b, c] = [indices[face * 3], indices[face * 3 + 1], indices[face * 3 + 2]];
    return spriteAt(this.data!.atlas, (uv.getX(a) + uv.getX(b) + uv.getX(c)) / 3, (uv.getY(a) + uv.getY(b) + uv.getY(c)) / 3);
  }

  private leaveOutSorts(mesh: THREE.Mesh) {
    if (!this.removedSorts.size || !this.data) return;
    const info = mesh.userData.info as MeshInfo;
    for (const [, from, end] of this.billboardsOf(mesh)) {
      const sprite = this.spriteOf(mesh, from);
      if (sprite && this.removedSorts.has(sprite)) this.leaveOutIn(mesh, {mesh: info.i, from, end}, true);
    }
  }

  /** How many trees or bushes of a sort are loaded. */
  countOf(sprite: string) {
    const seen = new Set<string>();
    for (const mesh of this.billboardMeshes()) {
      const info = mesh.userData.info as MeshInfo;
      for (const [k, from] of this.billboardsOf(mesh)) if (this.spriteOf(mesh, from) === sprite) seen.add(`${info.base}#${k}`);
    }
    for (const id of idsOfSorts(this.data?.objects ?? {}, new Set([sprite]))) {
      if (!this.removed.has(id) && this.shownBounds(this.piecesOf(id))) seen.add(id);
    }
    return seen.size;
  }

  /** All triangles of an object and what belongs to it that are known by now: a billboard's in the parts of its mesh loaded so
      far. */
  private piecesOf(id: string, withChildren = true): Piece[] {
    const at = id.lastIndexOf("#"), base = id.slice(0, at), number = Number(id.slice(at + 1));
    const listed = this.data?.objects?.[base]?.faces[number];
    if (listed) {
      return [...listed.map(([mesh, from, count]) => ({mesh, from, end: from + count})),
              ...(withChildren ? (this.belonging.get(id) ?? []).flatMap(child => this.piecesOf(child)) : [])];
    }
    return (this.parts.get(base) ?? []).map(part => {
      const info = part.userData.info as MeshInfo, [from, end] = billboardFaces(number, info.first_face!, info.indices / 3);
      return {mesh: info.i, from, end};
    }).filter(p => p.from < p.end);
  }

  private leaveOut(id: string, out: boolean) {
    for (const piece of this.piecesOf(id)) {
      const mesh = this.byNumber.get(piece.mesh);
      if (mesh) this.leaveOutIn(mesh, piece, out);
    }
  }

  /** A piece of an object left out of, or back in its mesh. The first change of a mesh keeps a copy of its indices. */
  private leaveOutIn(mesh: THREE.Mesh, {from, end}: Piece, out: boolean) {
    const index = mesh.geometry.getIndex()!, array = index.array as Uint16Array;
    if (!mesh.userData.indices) {
      mesh.userData.indices = array.slice();
      this.usedBytes += array.byteLength;
    }
    if (out) array.fill(0, from * 3, end * 3);
    else array.set((mesh.userData.indices as Uint16Array).subarray(from * 3, end * 3), from * 3);
    index.needsUpdate = true;
  }

  /** Show the track name; say(text) gets the progress or the fault. Returns when all is loaded (or another track was asked
      for: what the older one still says or fails with is nobody's business any more). */
  async open(name: string, say: (text: string, progress?: number | null) => void) {
    const mine = ++this.token;
    this.loading.abort();
    this.loading = new AbortController();
    const {signal} = this.loading;
    this.clear();
    this.trackName = name;
    this.onViewFailed(null);
    this.dirty = true;
    this.onHover(null);
    this.onPick(null);
    this.onIndexed(null);
    say(name ? "Reading the track …" : "", name ? null : undefined);
    if (!name) return;
    try {
      await this.load(name, mine, signal, say);
    } catch (e) {
      if (mine !== this.token) return;
      this.loadedTexture = null;
      this.loading.abort();
      say(`Could not load this track: ${(e as Error).message}`);
    }
  }

  private async load(name: string, mine: number, signal: AbortSignal, say: (text: string, progress?: number | null) => void) {
    const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(name)}/index`, signal);
    if (mine !== this.token) return;
    this.data = data;
    this.place = trackPlace(data.anchor);
    this.applyLight();
    if (data.models?.length) { this.ensureModelLight(); await this.modelDraw.sync(data.models, data.model_assets ?? {}, data.model_matrices ?? {}); }
    if (mine !== this.token) return;
    this.ensureSplatState();
    if (data.paint_errors?.length) this.onViewFailed(`Some material edits could not be shown: ${data.paint_errors.join("; ")}. Original textures are shown for affected areas. Discard all can remove these edits.`);
    this.objectPieces = objectIndex(data.objects);
    this.belonging = childrenOf(data.objects);
    this.removed = this.wanted();           // (the sorts named before the list was there; no mesh is loaded yet)
    this.noteListedOut();
    this.onIndexed(data.revision);
    this.navigation.placeCamera(data);
    this.renderer.domElement.focus({preventScroll: true});     // (W A S D work at once, not in the track's dropdown)
    // Generated geometry has its own cancellable loader. Original MeshInfos never change when a copy is added or undone.
    let queue = nearestLast<MeshInfo>(data.meshes.filter((m: MeshInfo) => !m.copy), this.camera.position.toArray());
    let sortedAt = this.camera.position.clone(), sortedWhen = performance.now();
    let total = data.meshes.length;
    let done = 0, copiedDone = 0, texturesDone = 0;
    let modelsChanged = false;
    const prepareTurn = oneByOne(2), prepared = new Map<string, Promise<void>>();
    const available = new Set<string>(data.surface_tiles ?? []);
    const tiles = new Set(data.meshes.map(m => groundTile(m.name)).filter((tile): tile is string => tile !== null && available.has(tile)));
    const neededImages = new Set(data.meshes.flatMap((m: MeshInfo) => materialImages(data.materials[m.material])));
    const textureCount = neededImages.size;
    const tasks = total + textureCount + tiles.size;
    let preparedDone = 0, meshesReady = false;
    const report = () => {
      if (mine !== this.token) return;
      const text = !meshesReady ? `Loading: ${done + copiedDone} of ${total} parts`
        : texturesDone < textureCount && !this.overLimit ? `Loading textures: ${texturesDone} of ${textureCount}`
        : `Preparing selection: ${preparedDone} of ${prepared.size} (${done + copiedDone} parts)`;
      // Task counts describe work done, not time remaining. Only the final status ends the loading indicator.
      say(text, Math.min(1, (done + copiedDone + texturesDone + preparedDone) / Math.max(1, tasks)));
    };
    this.loadedTexture = () => { texturesDone++; report(); };
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
        if (info.model && modelsChanged) { done++; report(); continue; }
        if (!fits(this.usedBytes, COPIES * meshBytes(info), this.settings.memoryGb)) {
          this.overLimit = true;
          queue.length = 0;
          return;
        }
        this.usedBytes += COPIES * meshBytes(info);
        const asked = this.heightsVersion;
        let buf: ArrayBuffer;
        try { buf = await fetchBytes(meshUrl(name, data, info), signal); }
        catch (error) {
          if (!info.model || !(error instanceof MeshFetchError) || error.status !== 409) throw error;
          if (mine !== this.token) return;
          this.usedBytes -= COPIES * meshBytes(info); modelsChanged = true; done++; report(); continue;
        }
        if (mine !== this.token) return;
        if (info.model && this.data?.draft !== data.draft) {
          this.usedBytes -= COPIES * meshBytes(info); modelsChanged = true; done++; report(); continue;
        }
        this.addMesh(name, data, info, buf);
        const tile = groundTile(info.name);
        if (tile && available.has(tile) && !prepared.has(tile)) {
          const preparation = prepareTurn(async () => {
            if (signal.aborted || mine !== this.token) return;
            await fetchBytes(`/api/editor/${encodeURIComponent(name)}/surface/prepare?mesh=${info.i}&r=${data.revision}`, signal);
            preparedDone++;
            report();
          });
          prepared.set(tile, preparation);
          // Attach a rejection handler immediately, before the source queue finishes; load reports the error below.
          void preparation.catch(() => {});
        }
        if (asked !== this.heightsVersion) void this.refresh(info.i);      // (changed on its way)
        done++;
        report();
      }
    };
    await Promise.all(Array.from({length: PARALLEL}, worker));
    await copied;
    if (mine !== this.token) return;
    if (modelsChanged) {
      const count = await this.reloadModels() ?? this.meshes.filter(m => (m.userData.info as MeshInfo).model).length;
      if (mine !== this.token) return;
      const difference = count - data.meshes.filter((m: MeshInfo) => m.model).length;
      total += difference; done += difference;
    }
    meshesReady = true;
    report();
    await Promise.all(this.textures);
    await Promise.all([...this.splatPending.values()].map(p => p.done));
    if (mine !== this.token) return;
    if (preparedDone < prepared.size) report();
    await Promise.all(prepared.values());
    if (mine !== this.token) return;
    this.loadedTexture = null;
    say(this.overLimit ? `Memory limit reached (Settings): ${done} of ${total} parts, the nearest ones` : `${total} parts loaded`);
  }

  /** The wheel: nearer to what the mouse points at or back from it, by a share of the way (ZOOM_STEP); the view keeps its direction.
      The mouse on the sky: the way the view looks, never upwards. */
  private zoomWheel(el: HTMLElement) {
    el.addEventListener("wheel", e => {
      e.preventDefault();
      // (Shift with the wheel is Smooth's: the brush has it for its way. Some browsers make it a sideways wheel: deltaX)
      const keys: WheelKeys | null = e.ctrlKey && e.altKey ? "ctrlAlt" : e.altKey ? "alt" : e.ctrlKey ? "ctrl" : e.shiftKey && this.wheelTaken ? "shift" : null;
      if ((this.brush || this.wheelTaken) && keys) {
        const notch = e.deltaY || e.deltaX;
        if (notch) this.onToolWheel(keys, notch < 0 ? 1 : -1);
        return;
      }
      this.navigation.stopRide();
      if (!this.data || this.held) return;      // (a button held: that drag goes by the camera as it was)
      this.mouse = screenPoint(e, el);
      const hit = this.hit(), {ray} = this.picker;
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
    const was = this.brush;
    this.brush = brush;
    if (!brush) {
      this.cancelStroke();
      if (this.ring) {
        this.scene.remove(this.ring);
        this.ring.geometry.dispose();
        this.ring = null;
      }
    } else {
      if (!was) this.unpick();
      this.onHover(null);
      this.placeRing(this.brushAt(), false);
    }
    this.dirty = true;
  }

  /** onStroke gets a stroke when it ends: where the ring was and for how long, and whether Shift was held when it began. askPreview gets it while it lasts,
      and answers with what it changes so far (trackedits.preview), or why it can't be: then it ends there, onStrokeRefused gets that;
      null: no answer this time. */
  setStroke(onStroke: (samples: Sample[], turned: boolean) => void, askPreview: (samples: Sample[], turned: boolean) => Promise<ArrayBuffer | string | null>,
            onStrokeRefused: (why: string) => void) {
    this.onStroke = onStroke;
    this.askPreview = askPreview;
    this.onStrokeRefused = onStrokeRefused;
  }

  /** The stroke under way is dropped, the meshes back as they were; whether there was one. */
  cancelStroke() {
    if (!this.stroke) return false;
    clearInterval(this.stroke.timer);
    this.stroke = null;
    this.takeBackPreview();
    return true;
  }

  /** ... it wasn't: they are fetched as they are. */
  dropPreview() {
    const shown = [...this.geometryPreview.changedMeshes];
    this.geometryPreview.changedMeshes.clear();
    for (const i of shown) void this.refresh(i);
  }

  /** Whether Shift, Ctrl and Alt with the wheel go to setToolWheel's: a band is marked for Smooth, or Camera is on. */
  setWheelTaken(taken: boolean) {
    this.wheelTaken = taken;
  }

  /** Move on or off; onMoved gets each object's displacement, including the change of ground height. Off cancels a drag. */
  setMove(on: boolean, onMoved: (objects: {id: string; x: number; y: number; z: number}[]) => void) {
    this.onMoved = onMoved;
    if (on === this.moveTool) return;
    this.moveTool = on;
    if (!on) {
      this.dropDrag();
      this.renderer.domElement.style.cursor = "";
    }
  }

  /** How the draft places objects now: where each one's place is, to turn and scale it around. */
  setPlaced(placed: Placement[]) {
    this.placed = new Map(placed.map(p => [p.id, p]));
    for (const [id, at] of this.pendingPivots) {
      const split = id.lastIndexOf("#"), base = this.data?.objects?.[id.slice(0, split)]?.at[Number(id.slice(split + 1))];
      const p = this.placed.get(id);
      if (base && Math.abs(base[0] + (p?.x ?? 0) - at[0]) < 0.002 && Math.abs(base[2] + (p?.z ?? 0) - at[2]) < 0.002) this.pendingPivots.delete(id);
    }
  }

  /** A drag that could not be accepted returns to the server's kept geometry, including any drag made while it was pending. */
  rejectMove(ids: string[]) {
    for (const id of ids) this.pendingPivots.delete(id);
    if (this.dragging?.ids.some(id => ids.includes(id))) this.dropDrag();
    this.refreshMeshes([]);
  }

  /** The object an object belongs to, at the top (a house for its sign and door); a tree or bush: itself. */
  private rootOf(id: string) {
    const at = id.lastIndexOf("#"), list = this.data?.objects?.[id.slice(0, at)];
    let k = Number(id.slice(at + 1));
    while (list && list.parents[k] >= 0) k = list.parents[k];
    return list ? `${id.slice(0, at)}#${k}` : id;
  }

  /** What a listed object is called, for the hover box and the notes. */
  private namesOf(id: string) {
    const at = id.lastIndexOf("#"), list = this.data!.objects[id.slice(0, at)], k = Number(id.slice(at + 1));
    return {id, kind: kindName(list.kinds[k]), sort: sortOf(list, k)};
  }

  /** Whether Move can take it: not a span of wires, which goes where its poles go. */
  canMove(id: string) {
    const at = id.lastIndexOf("#"), list = this.data?.objects?.[id.slice(0, at)];
    return !list || !NOT_MOVED.has(list.kinds[Number(id.slice(at + 1))]);
  }

  /** Where an object stands now, what it is turned and scaled around (placement.py): a listed one's place as the draft moved it; a tree's or
      bush's the middle of its foot. */
  private pivotOf(id: string) {
    const pending = this.pendingPivots.get(id);
    if (pending) return pending;
    const at = id.lastIndexOf("#"), list = this.data?.objects?.[id.slice(0, at)];
    if (list) {
      const [x, y, z] = list.at[Number(id.slice(at + 1))], p = this.placed.get(id);
      return [x + (p?.x ?? 0), y + (p?.y ?? 0), z + (p?.z ?? 0)];
    }
    const box = this.boundsOf(id), middle = box.getCenter(new THREE.Vector3());
    return [middle.x, box.min.y, middle.z];
  }

  /** The vertices the objects and what belongs to them have in the meshes loaded, as they are now. */
  private grab(ids: string[]): Grabbed[] {
    const out: Grabbed[] = [];
    for (const id of ids) {
      const byMesh = new Map<number, Set<number>>();
      for (const {mesh, from, end} of this.piecesOf(id)) {
        const part = this.byNumber.get(mesh);
        if (!part) continue;
        const indices = (part.userData.indices ?? part.geometry.getIndex()!.array) as Uint16Array;
        if (!byMesh.has(mesh)) byMesh.set(mesh, new Set());
        for (let k = from * 3; k < end * 3; k++) byMesh.get(mesh)!.add(indices[k]);
      }
      for (const [mesh, vertices] of byMesh) {
        const numbers = Uint32Array.from(vertices), array = this.vertexArray(mesh), floats = new Float32Array(numbers.length * FLOATS_PER_VERTEX);
        numbers.forEach((v, k) => floats.set(array.subarray(v * FLOATS_PER_VERTEX, (v + 1) * FLOATS_PER_VERTEX), k * FLOATS_PER_VERTEX));
        out.push({id, mesh, numbers, floats, modelMatrix: this.modelDraw.instance(id.split("#")[0])?.matrix.clone()});
      }
    }
    return out;
  }

  private vertexArray(mesh: number) {
    return (this.byNumber.get(mesh)!.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data.array as Float32Array;
  }

  /** The vertices grabbed as nudges (by id; none: as they were) move them around pivots, in the view only: the server's meshes take
      their place when its answer comes (refreshMeshes). */
  private nudgeGrabbed(grabbed: Grabbed[], pivots: Map<string, number[]>, nudges: (id: string) => Nudge) {
    for (const g of grabbed) {
      nudgeVertices(g.floats, this.vertexArray(g.mesh), g.numbers, FLOATS_PER_VERTEX, pivots.get(g.id)!, nudges(g.id));
      const m = this.byNumber.get(g.mesh)!;
      (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
      fitSphere(m.geometry, m.userData.info as MeshInfo);
      m.geometry.boundsTree?.refit();
      this.geometryPreview.changedMeshes.add(g.mesh);
      if (g.modelMatrix) {
        const n = nudges(g.id);
        const transform = new THREE.Matrix4().makeScale(n.scale, n.scale, n.scale)
          .premultiply(new THREE.Matrix4().makeRotationY(n.turn * Math.PI / 180))
          .premultiply(new THREE.Matrix4().makeTranslation(n.x, n.y, n.z));
        this.modelDraw.nudge(g.id.split("#")[0], pivots.get(g.id)!, transform, g.modelMatrix);
      }
    }
    this.reframePicks();
    this.dirty = true;
  }

  /** The objects ids turned, raised or scaled at once, each around where it stands, until the server's meshes come: a notch of the wheel.
      While they are dragged, what was taken up is nudged too: the next move of the mouse shows them as they are now, not as they were. */
  nudge(ids: string[], n: Partial<Nudge>) {
    const nudge = {...STILL, ...n}, d = this.dragging;
    if (d && ids.every(id => d.ids.includes(id))) {
      for (const g of d.grabbed) {
        if (!ids.includes(g.id)) continue;
        const out = new Float32Array(g.floats.length);
        nudgeVertices(g.floats, out, Array.from(g.numbers, (_, k) => k), FLOATS_PER_VERTEX, d.pivots.get(g.id)!, nudge);
        g.floats = out;
      }
      for (const id of ids) {
        const [x, y, z] = d.pivots.get(id)!;
        d.pivots.set(id, [x + nudge.x, y + nudge.y, z + nudge.z]);
      }
      return this.dragOn(d.grabbed);
    }
    this.nudgeGrabbed(this.grab(ids), new Map(ids.map(id => [id, this.pivotOf(id)])), () => nudge);
  }

  /** The vertices of grabbed shown as taken up and moved the way dragged so far. */
  private dragOn(grabbed: Grabbed[]) {
    const d = this.dragging!;
    for (const id of d.ids) {
      const [x, , z] = d.pivots.get(id)!, before = d.ground.get(id);
      const after = this.groundAt(x + d.way.x, z + d.way.z);
      d.rises.set(id, before != null && after != null ? after - before : 0);
    }
    this.nudgeGrabbed(grabbed, d.pivots, id => ({...STILL, x: d.way.x, y: d.rises.get(id) ?? 0, z: d.way.z}));
  }

  /** A drag under way goes back, nothing moved. */
  private dropDrag() {
    const d = this.dragging;
    this.dragging = null;
    if (d) this.nudgeGrabbed(d.grabbed, d.pivots, () => STILL);
  }

  /** The frames of what is picked round it as it stands now. */
  private reframePicks() {
    for (const [id, {box}] of this.picks) {
      const bounds = this.boundsOf(id);
      if (!bounds.isEmpty()) box.box.copy(bounds);
    }
  }

  /** With Move on, the left button pressed picks what is under the mouse (Ctrl: adds it); held and moved, it takes all that is picked along
      over the ground, keeping each one's clearance; let go, onMoved says how far. */
  private moves(el: HTMLElement) {
    el.addEventListener("pointerdown", e => {
      if (!this.moveTool || this.brush || e.button !== LEFT_BUTTON) return;
      const picked = this.pick(e, el);
      if (!picked?.id || !this.picks.has(picked.id)) return;
      const ids = [...this.picks.keys()].filter(id => this.canMove(id));
      if (!ids.includes(picked.id)) return;
      const pivots = new Map(ids.map(id => [id, this.pivotOf(id)]));
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -pivots.get(picked.id)![1]), from = new THREE.Vector3();
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      if (!this.picker.ray.intersectPlane(plane, from)) return;
      const ground = new Map(ids.map(id => { const [x, , z] = pivots.get(id)!; return [id, this.groundAt(x, z)]; }));
      this.dragging = {ids, plane, from, x: e.clientX, y: e.clientY, grabbed: this.grab(ids), pivots, ground, rises: new Map(), way: new THREE.Vector3()};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", e => {
      const d = this.dragging;
      if (!d) return;
      if (!(e.buttons & LEFT_HELD)) return this.dropDrag();
      if (!d.way.lengthSq() && Math.hypot(e.clientX - d.x, e.clientY - d.y) < CLICK_PX) return;     // (a click with a shaky hand)
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      const at = new THREE.Vector3();
      if (!this.picker.ray.intersectPlane(d.plane, at) || at.distanceTo(this.camera.position) > 2 * this.navigation.highest) return;    // (at the horizon)
      d.way.set(at.x - d.from.x, 0, at.z - d.from.z);
      el.style.cursor = "grabbing";
      this.dragOn(d.grabbed);
    });
    el.addEventListener("pointerup", e => {
      const d = this.dragging;
      if (!d || e.button !== LEFT_BUTTON) return;
      this.dragging = null;
      el.style.cursor = "grab";
      if (d.way.lengthSq()) {
        for (const id of d.ids) {
          const [x, y, z] = d.pivots.get(id)!;
          this.pendingPivots.set(id, [x + d.way.x, y + (d.rises.get(id) ?? 0), z + d.way.z]);
        }
        this.onMoved(d.ids.map(id => ({id, x: d.way.x, y: d.rises.get(id) ?? 0, z: d.way.z})));
      }
    });
    el.addEventListener("pointercancel", () => this.dropDrag());
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

  /** The ground under an object, null outside the loaded terrain: moving there preserves its current height. */
  private groundAt(x: number, z: number) {
    return this.groundAlong(new THREE.Vector3(x, VIEW_M, z), new THREE.Vector3(0, -1, 0))?.point.y ?? null;
  }

  /** The ring's place now noted, and if it is time the stroke asked for as it is. */
  private sample() {
    const s = this.stroke;
    if (!s || !this.mouse) return;
    const now = performance.now(), seconds = (now - s.at) / 1000, last = s.samples.at(-1)!;
    s.at = now;
    // (the mouse and the camera still: it stands where it stood, however the ground grows up towards the camera under the ray)
    const look = `${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;
    if (look === s.look) addSample(s.samples, last[0], last[1], seconds);
    else {
      const at = this.brushAt();
      s.look = look;
      this.placeRing(at, s.turned);
      if (at) addSample(s.samples, at.x, at.z, seconds);    // (off the ground it paints nothing, and its time doesn't count)
    }
    if (!s.asking && now - s.asked >= PREVIEW_EVERY_MS) {
      s.asking = true;
      s.asked = now;
      void this.askPreview(s.samples.map(x => [...x] as Sample), s.turned).then(answer => {
        s.asking = false;
        if (this.stroke !== s) return;      // (an answer about a stroke that is over says nothing about the next one)
        if (typeof answer === "string") {
          this.cancelStroke();
          this.onStrokeRefused(answer);
        } else if (answer) this.showPreview(answer);
      }, () => { s.asking = false; });
    }
  }

  /** onToolWheel gets the wheel over the view with the brush set or the wheel taken, and those keys held: a notch up, 1, down, -1. */
  setToolWheel(onToolWheel: (keys: WheelKeys, by: number) => void) {
    this.onToolWheel = onToolWheel;
  }

  /** The meshes by number the server now hands out otherwise (it says which: only it knows what moves with a change), its list in that
      revision: those loaded are fetched anew. The changes aren't reckoned here: there is one reckoning, the server's, which Save uses too. */
  refreshMeshes(meshes: number[]) {
    if (meshes.includes(-2)) {
      void (async () => {
        if (meshes.includes(-1)) { this.detachModelMeshes(); await this.syncCopies(); }
        await this.reloadModels();
        this.refreshMeshes(meshes.filter(i => i >= 0));
      })();
      return;
    }
    if (meshes.some(i => (this.byNumber.get(i)?.userData.info as MeshInfo | undefined)?.model)) void this.refreshModelTransforms();
    if (meshes.includes(-1)) void this.syncCopies();
    // (a preview taken over: what showed it, whether or not the server names it. One still in place goes on again over what comes: takeVertices)
    const all = new Set(this.geometryPreview.active ? meshes : [...meshes, ...this.geometryPreview.changedMeshes]);
    if (!this.geometryPreview.active) this.geometryPreview.changedMeshes.clear();
    if (!all.size) return;
    this.heightsVersion++;
    for (const i of all) if (i >= 0) void this.refresh(i);
  }

  private modelMeshes() {
    return this.meshes.filter(m => (m.userData.info as MeshInfo).model);
  }

  private dropModelMesh(mesh: THREE.Mesh) {
    const info = mesh.userData.info as MeshInfo;
    this.scene.remove(mesh); mesh.geometry.dispose();
    if (this.byNumber.get(info.i) === mesh) this.byNumber.delete(info.i);
    this.usedBytes -= COPIES * meshBytes(info) + ((mesh.userData.indices as Uint16Array | undefined)?.byteLength ?? 0);
    this.materialAreas?.delete(info.i);
    this.geometryPreview.changedMeshes.delete(info.i); this.geometryPreview.replaced(info.i);
  }

  private detachModelMeshes() {
    for (const mesh of this.modelMeshes()) this.dropModelMesh(mesh);
    this.meshes = this.meshes.filter(m => !(m.userData.info as MeshInfo).model);
  }

  /** The loaded model meshes as the index now lays them out: those made from the same thing stay under their new numbers, with what is
      left out of them; the others go. What a preview or a drag holds by number follows. Returns those that stay. */
  private keepModelMeshes(wanted: MeshInfo[]) {
    const now = new Map(wanted.map(info => [modelMeshKey(info), info]));
    const kept = new Set(this.modelMeshes().filter(mesh => now.has(modelMeshKey(mesh.userData.info as MeshInfo))));
    for (const mesh of this.modelMeshes()) {
      if (!kept.has(mesh)) this.dropModelMesh(mesh);
      else if (this.byNumber.get((mesh.userData.info as MeshInfo).i) === mesh) this.byNumber.delete((mesh.userData.info as MeshInfo).i);
    }
    const numbers = new Map<number, number>();
    for (const mesh of kept) {
      const old = mesh.userData.info as MeshInfo, info = now.get(modelMeshKey(old))!;
      mesh.userData.info = info;
      this.byNumber.set(info.i, mesh);
      if (info.i === old.i) continue;
      numbers.set(old.i, info.i);
      if (this.geometryPreview.changedMeshes.has(old.i)) mesh.userData.behind = true;
      this.geometryPreview.forget(old.i);
    }
    this.meshes = this.meshes.filter(m => !(m.userData.info as MeshInfo).model || kept.has(m));
    for (const grabbed of this.dragging?.grabbed ?? []) grabbed.mesh = numbers.get(grabbed.mesh) ?? grabbed.mesh;
    return kept;
  }

  /** Refresh the real appended model/material index while retaining the user's camera and active placement action. Only meshes not loaded
      yet are downloaded. Returns how many model meshes the index has. */
  private async reloadModels(retries = 2): Promise<number | null> {
    const mine = this.token, asked = ++this.modelTransformVersion, signal = this.loading.signal;
    let reserved = 0;
    try {
      const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/index`, signal);
      const wanted = data.meshes.filter(m => m.model), jobs = oneByOne(PARALLEL);
      const loaded = new Set(this.modelMeshes().map(m => modelMeshKey(m.userData.info as MeshInfo)));
      const added = wanted.filter(info => !loaded.has(modelMeshKey(info)));
      const buffers = await Promise.all(added.map(info => jobs(() => fetchBytes(meshUrl(this.trackName, data, info), signal))));
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      const bytes = added.reduce((sum, info) => sum + COPIES * meshBytes(info), 0);
      if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) throw new Error("The models exceed the Editor memory limit");
      this.usedBytes += bytes; reserved = bytes;
      if (data.models?.length) this.ensureModelLight();
      await this.modelDraw.sync(data.models ?? [], data.model_assets ?? {}, data.model_matrices ?? {});
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      const kept = this.keepModelMeshes(wanted);
      const previousRemoved = this.removed;
      this.data = data;
      this.objectPieces = objectIndex(data.objects); this.belonging = childrenOf(data.objects);
      this.removed = this.wanted(); this.noteListedOut();
      for (const id of previousRemoved) if (!this.removed.has(id)) this.leaveOut(id, false);
      for (const id of this.removed) if (!previousRemoved.has(id)) this.leaveOut(id, true);
      added.forEach((info, i) => this.addMesh(this.trackName, data, info, buffers[i]));
      reserved = 0;
      // (what a kept mesh was asked anew for under the old draft or number hasn't come: asked again as the index says now)
      for (const mesh of kept) if (mesh.userData.behind) void this.refresh((mesh.userData.info as MeshInfo).i);
      this.settlePending(data);
      for (const id of [...this.picks.keys()]) if (id.startsWith("instance_") && !data.objects[id.split("#")[0]]) this.dropPick(id);
      this.reframePicks(); this.onViewFailed(null); this.dirty = true; this.hoverDue = true;
      return wanted.length;
    } catch (error) {
      if (mine === this.token && asked === this.modelTransformVersion && !signal.aborted
          && error instanceof MeshFetchError && error.status === 409 && retries > 0) return this.reloadModels(retries - 1);
      if (mine === this.token && asked === this.modelTransformVersion && !signal.aborted) this.onViewFailed((error as Error).message);
      return null;
    } finally { if (reserved && mine === this.token) this.usedBytes -= reserved; }
  }

  private async refreshModelTransforms() {
    const mine = this.token, asked = ++this.modelTransformVersion, signal = this.loading.signal;
    try {
      const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/index`, signal);
      if (mine !== this.token || asked !== this.modelTransformVersion) return;
      this.modelDraw.transforms(data.model_matrices ?? {}); this.dirty = true;
    } catch (error) { if (mine === this.token && !signal.aborted) this.onViewFailed((error as Error).message); }
  }

  /** Reload only generated meshes and object ids, keeping the camera and the source track's meshes. */
  private async syncCopies(initial?: TrackIndex, retries = 2): Promise<void> {
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
      for (const mesh of replacing) {
        const info = mesh.userData.info as MeshInfo;
        this.scene.remove(mesh);
        mesh.geometry.boundsTree = undefined;
        mesh.geometry.dispose();
        this.byNumber.delete(info.i);
        this.usedBytes -= COPIES * meshBytes(info);
      }
      this.meshes = this.meshes.filter(m => !(m.userData.info as MeshInfo).copy);
      const sourceObjects = Object.fromEntries(Object.entries(this.data.objects).filter(([key]) => !key.startsWith("copy_")));
      const copyObjects = Object.fromEntries(Object.entries(data.objects).filter(([key]) => key.startsWith("copy_")));
      this.data = {...this.data, copy_revision: tag, draft: data.draft,
        meshes: [...this.data.meshes.filter(info => !info.copy), ...added], objects: {...sourceObjects, ...copyObjects}};
      // Only copied lists changed. Keep the source's piece/parent indexes, which can contain millions of entries.
      for (const [key, pieces] of this.objectPieces) if (pieces[0]?.id.startsWith("copy_")) this.objectPieces.delete(key);
      for (const [key, value] of objectIndex(copyObjects)) this.objectPieces.set(key, value);
      for (const key of this.belonging.keys()) if (key.startsWith("copy_")) this.belonging.delete(key);
      for (const [key, value] of childrenOf(copyObjects)) this.belonging.set(key, value);
      this.removed = this.wanted();
      this.noteListedOut();
      added.forEach((info, k) => {
        const bytes = COPIES * meshBytes(info);
        this.usedBytes += bytes;
        this.addMesh(this.trackName, this.data!, info, buffers[k]);
        if (heightAsked !== this.heightsVersion) void this.refresh(info.i);
      });
      for (const id of [...this.picks.keys()]) {
        const [base, k] = id.split("#");
        if (base.startsWith("copy_") && !copyObjects[base]?.faces[Number(k)]?.length) this.dropPick(id);
      }
      this.reframePicks();
      this.onViewFailed(null);
      this.dirty = true;
      this.hoverDue = true;
    } catch (e) {
      if (mine !== this.token || asked !== this.copyVersion || signal.aborted) return;
      if (e instanceof MeshFetchError && e.status === 409 && retries > 0) return this.syncCopies(undefined, retries - 1);
      this.onViewFailed((e as Error).message);
    }
  }

  /** A translucent source follows the mouse; each left click places another independent instance. */
  setCopy(source: string | null, place: ((at: [number, number, number]) => void) | null, foot?: number[]) {
    this.modelGhostVersion++;
    if (this.copyGhost) {
      this.scene.remove(this.copyGhost);
      if (!this.copyRelease) for (const child of this.copyGhost.children as THREE.Mesh[]) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.copyRelease?.(); this.copyRelease = null;
    this.copyGhost = null; this.modelGhostSolid = null; this.modelGhostHold = null;
    this.copyStamp = [];
    this.onCopyPlace = place;
    if (!source || !place) { this.dirty = true; return; }
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    const ids = [...takenAlong([source], this.belonging)].filter(id => this.canMove(id));
    for (const id of ids) for (const piece of this.piecesOf(id, false)) {
      const m = this.byNumber.get(piece.mesh);
      if (!m) continue;
      const indices = m.geometry.getIndex()!.array;
      const shown: number[] = [];
      for (let k = piece.from * 3; k < piece.end * 3; k += 3) {
        if (indices[k] !== indices[k + 1] && indices[k + 1] !== indices[k + 2] && indices[k] !== indices[k + 2]) shown.push(indices[k], indices[k + 1], indices[k + 2]);
      }
      if (!shown.length) continue;
      const part = m.geometry.clone();
      part.setIndex(shown);
      const geometry = part.toNonIndexed();
      part.dispose();
      const material = (m.material as THREE.Material).clone();
      material.visible = true;
      material.transparent = true;
      material.opacity = 0.5;
      material.depthWrite = false;
      group.add(new THREE.Mesh(geometry, material));
    }
    const box = new THREE.Box3().setFromObject(group), pivot = this.pivotOf(source);
    if (box.isEmpty()) return;
    this.copyFoot.set(foot?.[0] ?? pivot[0], foot?.[1] ?? box.min.y, foot?.[2] ?? pivot[2]);
    this.copyGhost = group;
    this.scene.add(group);
    this.followCopy();
  }

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

  /** A library preview has no draft instance yet; its decoded resources live until placement mode ends and the last model a click
      showed with them is replaced by the server's (addPending). place gets the click's ground point and that shown model's key. */
  async setModelGhost(model: {id: string; anchor: number[]; metres_per_unit: number}, place: (at: [number, number, number], pending: number | null) => void) {
    this.setCopy(null, at => place(at, this.addPending()));
    const version = this.modelGhostVersion, holder = new THREE.Scene();
    const draw = new ModelDraw(holder, undefined, bytes => {
      if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
      this.usedBytes += bytes; return true;
    }, false);
    let holders = 1;
    const letGo = () => { if (--holders === 0) draw.dispose(); };
    const ghostMaterials: THREE.Material[] = [];
    this.copyRelease = () => { for (const m of ghostMaterials) m.dispose(); letGo(); };
    const transform = new THREE.Matrix4().makeScale(model.metres_per_unit, model.metres_per_unit, model.metres_per_unit)
      .multiply(new THREE.Matrix4().makeTranslation(-model.anchor[0], -model.anchor[1], -model.anchor[2]));
    try {
      draw.setEnvironment(this.ensureModelLight(), this.reflections());
      await draw.sync([{id: "ghost", asset: model.id}], {[model.id]: {url: `/api/library/models/${model.id}/original`}}, {ghost: transform.toArray()});
      if (version !== this.modelGhostVersion) { draw.dispose(); return; }
      const root = draw.instance("ghost")!, group = new THREE.Group();
      this.modelGhostSolid = root.clone(true);
      this.modelGhostHold = () => { holders++; let held = true; return () => { if (held) { held = false; letGo(); } }; };
      // (translucent copies: the loaded materials stay solid for what a click shows; textures stay shared)
      const translucent = (original: THREE.Material) => {
        const m = original.clone(); ghostMaterials.push(m);
        m.transparent = true; m.opacity *= .5; m.depthWrite = false;
        return m;
      };
      root.traverse(node => {
        if (node instanceof THREE.Mesh) node.material = Array.isArray(node.material) ? node.material.map(translucent) : translucent(node.material);
      });
      group.matrixAutoUpdate = false; group.add(root);
      this.copyGhost = group; this.copyFoot.set(0, 0, 0); this.copyStamp = [];
      this.scene.add(group); this.followCopy();
    } catch (error) { draw.dispose(); if (version === this.modelGhostVersion) this.onViewFailed((error as Error).message); }
  }

  /** The ghost's model shown solid where the ghost stands, at once, until the server's instance is drawn (settlePending). Its key, null
      while the ghost's model loads. */
  private addPending() {
    if (!this.copyGhost || !this.modelGhostSolid || !this.modelGhostHold) return null;
    const root = new THREE.Group();
    root.matrixAutoUpdate = false; root.matrix.copy(this.copyGhost.matrix); root.userData.pendingModel = true;
    root.add(this.modelGhostSolid.clone(true));
    const key = ++this.pendingKey;
    this.pendingModels.set(key, {root, release: this.modelGhostHold()});
    this.scene.add(root); this.dirty = true;
    return key;
  }

  /** A shown model became the server's instance, added to the draft after its revision draft. */
  confirmPending(key: number, instance: string, draft: number) {
    const pending = this.pendingModels.get(key);
    if (pending) Object.assign(pending, {instance, draft});
  }

  /** A shown model that won't become an instance: refused, or the edit could not be made. */
  dropPending(key: number) {
    const pending = this.pendingModels.get(key);
    if (!pending) return;
    this.scene.remove(pending.root); pending.release(); this.pendingModels.delete(key); this.dirty = true;
  }

  private dropAllPending() {
    for (const key of [...this.pendingModels.keys()]) this.dropPending(key);
  }

  /** Shown models whose instance is drawn now go, and those a later draft no longer has (undone). An older index keeps them. */
  private settlePending(data: TrackIndex) {
    for (const [key, {instance, draft}] of this.pendingModels) {
      if (instance === undefined) continue;
      if (this.modelDraw.instance(instance) || (data.draft ?? 0) > draft! && !data.models?.some(m => m.id === instance)) this.dropPending(key);
    }
  }

  /** Extra turn, height over the ground and size for the next copies, around their foot. */
  setCopyPose(pose: CopyPose) {
    this.copyPose = {turn: pose.turn, y: pose.y, scale: pose.scale};
    this.followCopy();
  }

  private copyAt(): [number, number, number] | null {
    if (!this.mouse) return null;
    this.picker.setFromCamera(this.mouse, this.camera);
    const hit = this.groundAlong(this.picker.ray.origin, this.picker.ray.direction);
    return hit ? hit.point.toArray() as [number, number, number] : null;
  }

  private followCopy() {
    if (!this.copyGhost || !this.shown) return;
    const c = this.camera, p = c.position, q = c.quaternion;
    const stamp = [this.mouse?.x ?? Infinity, this.mouse?.y ?? Infinity, p.x, p.y, p.z, q.x, q.y, q.z, q.w, c.aspect, c.fov,
      this.copyPose.turn, this.copyPose.y, this.copyPose.scale, this.groundVersion, this.held ? 1 : 0];
    if (stamp.every((v, k) => v === this.copyStamp[k])) return;
    this.copyStamp = stamp;
    const at = this.copyAt();
    this.copyGhost.visible = !!at && !this.held;
    if (at) {
      const {turn, y, scale} = this.copyPose;
      this.copyGhost.matrix.makeTranslation(at[0], at[1] + y, at[2])
        .multiply(new THREE.Matrix4().makeRotationY(turn * Math.PI / 180))
        .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
        .multiply(new THREE.Matrix4().makeTranslation(-this.copyFoot.x, -this.copyFoot.y, -this.copyFoot.z));
      this.copyGhost.matrixWorldNeedsUpdate = true;
      performance.clearMarks("map2lap.models.ghost");
      performance.mark("map2lap.models.ghost", {detail: {visible: this.copyGhost.visible,
        matrix: this.copyGhost.matrix.clone().multiply(this.copyGhost.children[0]?.matrix ?? new THREE.Matrix4()).toArray()}});
    }
    this.dirty = true;
  }

  /** onViewFailed gets what went wrong when the view can't show a change that was made, null when that is over. */
  setViewFailed(onViewFailed: (text: string | null) => void) {
    this.onViewFailed = onViewFailed;
  }

  setTexturesChanged(onChanged: () => void) { this.onTexturesChanged = onChanged; }

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
        if (e instanceof MeshFetchError && e.status === 409 && (m.userData.info as MeshInfo).model) void this.reloadModels();
        else if (e instanceof MeshFetchError && e.status === 409 && (m.userData.info as MeshInfo).copy) void this.syncCopies();
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
    const dragged = this.dragging?.grabbed.filter(g => g.mesh === info.i) ?? [];
    if (dragged.length) this.dragOn(dragged);
    fitSphere(g, info);
    g.boundsTree?.refit();
    if (GROUND.test(info.name)) this.roadMarkers.followGround(g.boundingBox!);
    this.geometryPreview.apply(info.i);
    if (this.marked) this.markDue = true;
    this.reframePicks();
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

  /** The ring on the ground, of the brush's true size, in its colour (turned: with Shift held); hidden over what it can't paint. */
  private placeRing(at: THREE.Vector3 | null, turned: boolean) {
    if (!this.brush) return;
    if (!this.ring) {
      const points = Array.from({length: RING_POINTS}, (_, k) => {
        const angle = k / RING_POINTS * 2 * Math.PI;
        return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      });
      this.ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({depthTest: false, transparent: true}));
      this.ring.renderOrder = 10;
      this.ring.frustumCulled = false;
      this.scene.add(this.ring);
    }
    this.ring.visible = !!at;
    if (at) {
      this.ring.position.copy(at);
      this.ring.scale.setScalar(this.brush.radius);
      (this.ring.material as THREE.LineBasicMaterial).color.set(turned ? this.brush.turnedColour : this.brush.colour);
    }
    this.dirty = true;
  }

  /** The left button with the brush set: pressed on the ground a stroke starts, a move adds to it, let go it ends, a click is a stamp. */
  private strokes(el: HTMLElement) {
    el.addEventListener("pointerdown", e => {
      if (!this.brush || e.button !== LEFT_BUTTON) return;
      this.mouse = screenPoint(e, el);
      const at = this.brushAt();
      if (!at) return;
      const now = performance.now();
      this.stroke = {samples: [[at.x, at.z, 0]], turned: e.shiftKey, at: now, asked: now, asking: false,
                     look: `${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`, timer: setInterval(() => this.sample(), SAMPLE_EVERY_MS)};
      el.setPointerCapture(e.pointerId);
    });
    for (const type of ["keydown", "keyup"] as const) {     // (Alt with the wheel: alone, some browsers then go to their menu)
      el.addEventListener(type, e => {
        if ((this.brush || this.wheelTaken) && e.key === "Alt") e.preventDefault();
      });
    }
    el.addEventListener("pointermove", e => {
      if (!this.brush) return;
      this.mouse = screenPoint(e, el);
      if (!this.stroke) this.placeRing(this.brushAt(), e.shiftKey);       // (held: the samples move it)
    });
    el.addEventListener("pointerup", e => {
      if (!this.stroke || e.button !== LEFT_BUTTON) return;
      this.mouse = screenPoint(e, el);
      this.sample();
      const {samples, turned, timer} = this.stroke;
      clearInterval(timer);
      this.stroke = null;
      this.keepPreview();
      this.onStroke(samples, turned);
    });
    el.addEventListener("pointercancel", () => this.cancelStroke());
    el.addEventListener("pointerleave", () => {
      if (this.ring && !this.stroke) {
        this.ring.visible = false;
        this.dirty = true;
      }
    });
  }

  /** A press and release without moving (away and back is a drag too): the left button picks what is under the mouse, the right one picks it and asks for its
      menu (a right drag moves the view, as before). With the brush set the left button is the brush's, with Move on moves'. */
  private clicks(el: HTMLElement) {
    let from: {x: number; y: number; button: number} | null = null;
    el.addEventListener("pointerdown", e => {
      // (a press on a pin is the pin's: it is dragged, a right click takes it away)
      from = (e.button === 0 && !this.brush && !this.moveTool && this.roadMarkers.pinAt(e, el) < 0) || e.button === 2 ? {x: e.clientX, y: e.clientY, button: e.button} : null;
    });
    el.addEventListener("pointermove", e => {
      if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) >= CLICK_PX) from = null;
    });
    el.addEventListener("pointerup", e => {
      const pin = from?.button === 2 && e.button === 2 ? this.roadMarkers.pinAt(e, el) : -1;
      if (pin >= 0) this.roadMarkers.onPinTaken(pin);
      else if (from && e.button === from.button) {
        if (e.button === LEFT_BUTTON && this.onCopyPlace) {
          this.mouse = screenPoint(e, el);
          const at = this.copyAt();
          if (at) this.onCopyPlace(at);
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

  private pick(e: PointerEvent, el: HTMLElement): Picked | null {
    if (!this.data) return null;
    this.mouse = screenPoint(e, el);
    const hit = this.hit();
    const hovered = hit ? this.describe(hit) : null;
    const adding = this.adding && (e.ctrlKey || e.metaKey || this.selectMode?.enabled && this.selectMode.add) && e.button === LEFT_BUTTON;
    const whole = this.selectMode?.enabled && (e.shiftKey || this.selectMode.whole) && e.button === LEFT_BUTTON;
    const id = hovered?.id && this.moveTool ? this.rootOf(hovered.id) : hovered?.id ?? null;     // (Move takes a house with its sign and door)
    if (hovered && id && id !== hovered.id) Object.assign(hovered, this.namesOf(id));
    if (!hovered) {
      if (!adding) this.unpick();
      return null;
    }
    const info = hit?.object.userData.info as MeshInfo | undefined;
    let surface: SurfacePoint | undefined;
    if (info && hit?.uv && hovered && !id && (groundTile(hovered.object) || this.materialAreas?.has(info.i))) {
      surface = {mesh: info.i, u: hit.uv.x, v: hit.uv.y, revision: this.data.revision, whole: !!whole};
      if (!groundTile(hovered.object)) { surface.face = hit.faceIndex ?? 0; surface.object = null; }
    }
    if (adding && !id && !surface) return null;
    if (adding && id && this.picks.has(id)) return this.dropPick(id, true);
    const groups = !this.marked ? [] : Array.isArray(this.marked) ? this.marked : [this.marked];
    const keeping = e.button !== LEFT_BUTTON && !!id && (this.picks.has(id)
      || groups.some(group => (group.tree ? hovered.sprite : hovered.sort) === group.sort));
    if (!adding && !keeping) this.forgetPicks();     // A context menu on a marked member acts on the whole selection.
    const bounds = id ? this.boundsOf(id) : null;
    const foot = bounds?.getCenter(new THREE.Vector3()).setY(bounds.min.y);
    const picked: Picked = {id, afterBuild: !id && IN_THE_LIST.test(hovered.object), kind: hovered.kind, sprite: hovered.sprite,
                            sort: hovered.sort, position: (foot ? [foot.x, foot.y, foot.z] : hovered.at) as [number, number, number], left: e.button === LEFT_BUTTON,
                            road: hit && ROAD.test(hit.object.name) ? [hit.point.x, hit.point.z] as [number, number] : null, all: [],
                            adding: !!adding, keeping, whole: !!whole, surface,
                            inspection: {hovered, revision: this.data.revision,
                              texture: this.data.textures.findIndex(t => t.name === hovered.texture),
                              listed: !!id && !!this.data.objects[id.slice(0, id.lastIndexOf("#"))]}};
    if (id && bounds) this.picks.set(id, {box: this.picks.get(id)?.box ?? this.frameOf(bounds), picked});
    picked.all = this.allPicked();
    this.onPick(picked);
    return picked;
  }

  /** What can be deleted of all that is picked now. */
  private allPicked() {
    return [...this.picks.values()].map(({picked}) => ({id: picked.id!, position: picked.position}));
  }

  /** Explicit picks outside the selected whole sorts; a sort's own member needs no redundant draft entry. */
  selectedOutside(groups: Marked[]) {
    return [...this.picks.values()].filter(({picked}) => !groups.some(g => (g.tree ? picked.sprite : picked.sort) === g.sort))
      .map(({picked}) => ({id: picked.id!, position: picked.position}));
  }

  /** Snapshot every highlighted tree or bush for Replace; a mixed selection is refused as a whole. */
  replacementTargets(groups: Marked[]): string[] | null {
    if (!this.data) return null;
    const ids = new Set<string>();
    for (const [id, {picked}] of this.picks) {
      if (picked.kind !== "Tree" && picked.kind !== "Bush") return null;
      if (this.shownBounds(this.piecesOf(id))) ids.add(id);
    }
    const sprites = new Set(groups.filter(g => g.tree).map(g => g.sort));
    for (const mesh of this.billboardMeshes()) {
      const info = mesh.userData.info as MeshInfo;
      for (const [k, from, end] of this.billboardsOf(mesh)) {
        if (sprites.has(this.spriteOf(mesh, from)!) && this.shownBounds([{mesh: info.i, from, end}])) ids.add(`${info.base}#${k}`);
      }
    }
    for (const id of idsOfSorts(this.data.objects, new Set(groups.map(g => g.sort)))) {
      const at = id.lastIndexOf("#"), kind = this.data.objects[id.slice(0, at)].kinds[Number(id.slice(at + 1))];
      if (kind !== "tree" && kind !== "bush") return null;
      if (this.shownBounds(this.piecesOf(id))) ids.add(id);
    }
    return [...ids];
  }

  /** The picked one id out again: what was picked before it is what is spoken of, or nothing is left. */
  private dropPick(id: string, adding = false) {
    const removed = this.picks.get(id)!.picked;
    this.removeFrame(this.picks.get(id)!.box);
    this.picks.delete(id);
    const last = [...this.picks.values()].at(-1)?.picked ?? null;
    if (last) last.all = this.allPicked();
    const result = last ? {...last, adding, whole: false} : adding ? {...removed, id: null, kind: "", all: [], adding, whole: false, surface: undefined} : null;
    this.onPick(result);
    return result;
  }

  /** onMenu gets where a right click asks for the picked object's menu, in the view's pixels, with the view's size. */
  setMenu(onMenu: (at: MenuAt) => void) {
    this.onMenu = onMenu;
  }

  /** Every object of a sort the view shows gets a frame (listed: the build's sort; tree: an atlas image), null: none. */
  setMarked(marked: Marked | Marked[] | null) {
    this.marked = marked;
    this.frameMarked();
  }

  /** The frames of setMarked, anew: one line mesh for all, a long track's sort can be thousands. */
  private frameMarked() {
    this.markDue = false;
    if (this.markedLines) {
      this.scene.remove(this.markedLines);
      this.markedLines.geometry.dispose();
      (this.markedLines.material as THREE.Material).dispose();
      this.markedLines = null;
    }
    this.dirty = true;
    if (!this.marked || !this.data) return;
    const groups = Array.isArray(this.marked) ? this.marked : [this.marked];
    const boxes = groups.flatMap(group => group.tree ? this.treesOf(group.sort) : this.listedOf(group.sort));
    const points = new Float32Array(boxes.length * 24 * 3), corner = new THREE.Vector3();
    boxes.forEach((box, b) => {
      BOX_EDGES.forEach(([p, q], e) => {
        for (const [k, c] of [p, q].entries()) {
          corner.set(c & 1 ? box.max.x : box.min.x, c & 2 ? box.max.y : box.min.y, c & 4 ? box.max.z : box.min.z);
          corner.toArray(points, (b * 24 + e * 2 + k) * 3);
        }
      });
    });
    const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3));
    this.markedLines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: PICKED_COLOUR, depthTest: false}));
    this.markedLines.renderOrder = 1;
    this.scene.add(this.markedLines);
  }

  /** The room each listed object of a sort takes that is shown now, by its own triangles (a pole's frame not round its wires). */
  private listedOf(sort: string) {
    const boxes: THREE.Box3[] = [];
    for (const id of idsOfSorts(this.data!.objects, new Set([sort]))) {
      const at = id.lastIndexOf("#"), faces = this.data!.objects[id.slice(0, at)].faces[Number(id.slice(at + 1))];
      const box = this.shownBounds(faces.map(([mesh, from, count]) => ({mesh, from, end: from + count})));
      if (box) boxes.push(box);
    }
    return boxes;
  }

  /** The same for the trees or bushes of an atlas image that are loaded. */
  private treesOf(sprite: string) {
    const byId = new Map<string, Piece[]>();
    for (const mesh of this.billboardMeshes()) {
      const info = mesh.userData.info as MeshInfo;
      for (const [k, from, end] of this.billboardsOf(mesh)) {
        if (this.spriteOf(mesh, from) !== sprite) continue;
        const id = `${info.base}#${k}`;
        byId.set(id, [...(byId.get(id) ?? []), {mesh: info.i, from, end}]);
      }
    }
    return [...byId.values()].map(pieces => this.shownBounds(pieces)).filter(box => box !== null).concat(this.listedOf(sprite));
  }

  /** The room the pieces take that are loaded and not left out, or null. */
  private shownBounds(pieces: Piece[]) {
    const box = new THREE.Box3(), corner = new THREE.Vector3();
    for (const {mesh, from, end} of pieces) {
      const part = this.byNumber.get(mesh);
      const now = part?.geometry.getIndex()!.array as Uint16Array | undefined;
      if (!part || !now || from >= end || now[from * 3] === now[from * 3 + 1]) continue;     // (left out: shrunk to a point)
      const position = part.geometry.getAttribute("position");
      for (let k = from * 3; k < end * 3; k++) box.expandByPoint(corner.fromBufferAttribute(position, now[k]));
    }
    return box.isEmpty() ? null : box;
  }

  /** A frame around bounds. */
  private frameOf(bounds: THREE.Box3) {
    const box = new THREE.Box3Helper(bounds, new THREE.Color(PICKED_COLOUR));
    (box.material as THREE.LineBasicMaterial).depthTest = false;     // (seen through what stands before it)
    this.scene.add(box);
    this.dirty = true;
    return box;
  }

  private removeFrame(box: THREE.Box3Helper) {
    this.scene.remove(box);
    box.dispose();
    this.dirty = true;
  }

  /** Nothing is picked any more, in the view. */
  private forgetPicks() {
    for (const {box} of this.picks.values()) this.removeFrame(box);
    this.picks.clear();
  }

  /** Current dimensions from loaded object triangles, independent of the surrounding merged mesh. */
  dimensionsOf(id: string): [number, number, number] {
    const size = this.boundsOf(id).getSize(new THREE.Vector3());
    return [size.x, size.y, size.z];
  }

  /** The room an object takes, over all its triangles that are loaded. */
  private boundsOf(id: string) {
    const bounds = new THREE.Box3(), corner = new THREE.Vector3();
    for (const {mesh, from, end} of this.piecesOf(id)) {
      const part = this.byNumber.get(mesh);
      if (!part) continue;
      const position = part.geometry.getAttribute("position");
      const indices = (part.userData.indices ?? part.geometry.getIndex()!.array) as Uint16Array;
      for (let k = from * 3; k < end * 3; k++) bounds.expandByPoint(corner.fromBufferAttribute(position, indices[k]));
    }
    return bounds;
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
    if (!this.mouse || !this.data || this.brush) return;     // (the brush shows its ring instead)
    if (this.marking) {
      const at = this.brushAt();
      if (at) this.marking(at.x, at.z);
    }
    const hit = timed("map2lap.hover", () => this.hit());
    const hovered = hit ? this.describe(hit) : null;
    if (this.moveTool) this.renderer.domElement.style.cursor = hovered?.id && this.canMove(this.rootOf(hovered.id)) ? "grab" : "";
    this.onHover(hovered);
  }

  /** The first solid thing under the mouse, or a wire near it in front of that. */
  private hit() {
    this.picker.setFromCamera(this.mouse!, this.camera);
    const solid = this.picker.intersectObjects(this.meshes.filter(m => m.visible), false).find(h => this.solidAt(h));
    return this.wireNear(solid?.distance ?? Infinity) ?? solid;
  }

  /** The wire nearest the mouse within WIRE_REACH_PX and closer than limit. */
  private wireNear(limit: number): THREE.Intersection | undefined {
    const {ray} = this.picker, height = this.renderer.domElement.clientHeight || 1;
    const perM = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) / height * WIRE_REACH_PX;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), onRay = new THREE.Vector3(), onWire = new THREE.Vector3();
    let best: THREE.Intersection | undefined, bestD = limit;
    for (const mesh of this.meshes) {
      if (!mesh.visible || !WIRE.test(mesh.name)) continue;
      const sphere = mesh.geometry.boundingSphere!, along = ray.direction.dot(sphere.center.clone().sub(ray.origin));
      if (ray.distanceSqToPoint(sphere.center) > (sphere.radius + Math.max(along, 0) * perM) ** 2) continue;
      const index = mesh.geometry.getIndex()!.array, position = mesh.geometry.getAttribute("position");
      for (let f = 0; f * 3 < index.length; f += FACES_PER_WIRE_SEGMENT) {
        if (index[f * 3] === index[f * 3 + 1]) continue;       // (left out)
        a.fromBufferAttribute(position, index[f * 3]);
        b.fromBufferAttribute(position, index[f * 3 + 1]);
        const off = ray.distanceSqToSegment(a, b, onRay, onWire), d = onRay.distanceTo(ray.origin);
        if (d < bestD && off <= (d * perM) ** 2) {
          bestD = d;
          best = {distance: d, point: onWire.clone(), object: mesh, faceIndex: f} as THREE.Intersection;
        }
      }
    }
    return best;
  }

  private describe(hit: THREE.Intersection): Hovered {
    const data = this.data!, mesh = hit.object as THREE.Mesh, info = mesh.userData.info as MeshInfo;
    const material = data.materials[info.material];
    const texture = data.textures.find(t => t.name === material.texture);
    const {x, y, z} = hit.point, face = hit.faceIndex ?? 0, uv = hit.uv ? ([hit.uv.x, hit.uv.y] as [number, number]) : null;
    const isBillboard = info.first_face !== null && info.first_face !== undefined;
    const number = isBillboard ? billboardOf(face, info.first_face!) : null;
    const listed = objectAt(this.objectPieces.get(info.i), face);
    const tile = listed ? data.objects[listed.slice(0, listed.lastIndexOf("#"))] : null;
    const k = listed ? Number(listed.slice(listed.lastIndexOf("#") + 1)) : -1;
    const atlasTree = isBillboard || (!info.model && !!tile && ["tree", "bush"].includes(tile.kinds[k]));
    return {
      id: listed ?? (number !== null ? `${info.base}#${number}` : null),
      kind: listed ? kindName(tile!.kinds[k]) : kindOf(info.name),
      sprite: atlasTree && uv ? spriteAt(data.atlas, uv[0], uv[1]) : null,
      sort: listed && !atlasTree ? sortOf(tile!, k) : null,
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
    if (!pins.length) this.renderer.domElement.style.cursor = "";
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

  private frame() {                 // (drawn only when something changed)
    const now = performance.now(), seconds = Math.min(FLY_MAX_STEP_S, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.shown && this.navigation.ride) this.navigation.rideOn(seconds);
    if (this.shown && this.navigation.flying.size) this.navigation.fly(seconds);
    if (this.shown && this.navigation.zoomLeft) this.navigation.glideZoom(seconds);
    if (!this.shown) return;
    this.followCopy();
    if (this.dirty) {
      this.dirty = false;
      for (const m of this.meshes) {  // the distances AC shows each mesh at (trees, bushes, furniture go far away)
        const d = this.camera.position.distanceTo(m.geometry.boundingSphere!.center);
        m.visible = d >= m.userData.lodIn && d < m.userData.lodOut;
        const info = m.userData.info as MeshInfo;
        if (info.model) this.modelDraw.visible(info.model.instance, m.visible && !this.removed.has(info.model.instance + "#0"));
      }
      this.surfaceOverlay?.follow();
      this.roadRegionOverlay?.follow();
      this.roadInfluenceOverlay?.follow();
      this.nightSky.follow(this.camera.position);
      this.lampCones.update(this.lampGlass, this.nightGlow.on);
      const renderStarted = performance.now();
      this.sunShadows.draw(this.camera, this.navigation.height);
      try { for (const layer of this.groundLayers?.values() ?? []) layer.follow(); this.groundFrame?.render(this.camera); }
      catch (error) { const message = String((error as Error).message ?? error); if (message !== this.paintFailure) { this.paintFailure = message; this.onViewFailed(message); } }
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
    if (this.markDue && now - this.lastMark >= this.markEvery) {
      const from = performance.now();
      this.frameMarked();
      this.lastMark = now;      // (a long track's frames take long: at most a quarter of the time while meshes load)
      this.markEvery = Math.max(MARK_EVERY_MS, 4 * (performance.now() - from));
    }
  }

  private clear() {
    this.nightGlow.clear();
    this.lampGlass = [];
    this.modelTransformVersion++;
    this.modelDraw.dispose();
    for (const layer of this.groundLayers?.values() ?? []) layer.dispose();
    this.groundLayers?.clear(); this.groundFrame?.dispose(); this.groundFrame = null;
    this.paintVersion++;
    this.paintLoading?.abort();
    for (const change of this.textureChanges.values()) change.abort();
    this.textureChanges.clear();
    this.displayedTextures.clear();
    this.paintFailure = null;
    this.loadedTexture = null;
    for (const entry of this.splatImages.values()) this.disposeSplatImage(entry);
    this.splatImages.clear();
    this.splatBindings.clear();
    this.splatPending.clear();
    this.sourceMaterials.clear();
    this.surfaceOverlay?.clear();
    this.roadRegionOverlay?.clear();
    this.roadInfluenceOverlay?.clear();
    this.setCopy(null, null);
    this.dropAllPending();
    this.modelLight?.dispose(); this.modelLight = null;
    this.copyVersion++;
    this.copyLoading?.abort();
    this.navigation.stopRide();
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
    this.geometryPreview.keepPreview();
    this.geometryPreview.changedMeshes.clear();
    this.meshes = [];
    this.grounds = [];
    this.textures = [];
    this.materials = [];
    this.usedBytes = 0;
    this.overLimit = false;
    this.data = null;
    this.navigation.data = null;
    this.alphaOf.clear();
    this.parts.clear();
    this.byNumber.clear();
    this.pendingPivots.clear();
    this.materialAreas?.clear();
    this.objectPieces = new Map();
    this.belonging = new Map();
    this.forgetPicks();
  }

  private texture(name: string, data: TrackIndex, i: number) {
    let t = this.textures[i];
    if (!t) {
      const descriptor = {...data.textures[i]};
      if (descriptor.layers) { descriptor.version = ""; descriptor.size = descriptor.source_size ?? descriptor.size; }
      const reserved = COPIES * descriptor.size, mine = this.token;
      if (!fits(this.usedBytes, reserved, this.settings.memoryGb)) {
        this.overLimit = true;
        return Promise.resolve(null);     // (the mesh stays plain grey)
      }
      this.usedBytes += reserved;
      const anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const signal = this.loading.signal;
      let allocated = reserved;
      let displayedVersion = descriptor.version ?? "";
      t = textureTurn(async () => {
        let bytes: ArrayBuffer;
        try {
          bytes = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}${descriptor.version ? `&p=${descriptor.version}` : ""}`, signal);
        } catch (error) {
          if (!descriptor.version || signal.aborted || mine !== this.token) throw error;
          this.onViewFailed(`A material edit could not be shown: ${String(error)}. Its original texture is shown; you can discard the edit.`);
          displayedVersion = "";
          bytes = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}`, signal);
        }
        return makeTexture(bytes, descriptor.name, anisotropy, descriptor.linear);
      }, true) // Ordinary images and source tiles go ahead of queued masks and replacement photos.
        .then(made => {
          // (a PNG takes far more decoded than its file says; the next parts see what it really took)
          if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap && mine === this.token) {
            const extra = decodedBytes(made.image.width, made.image.height) - reserved;
            if (!fits(this.usedBytes, extra, this.settings.memoryGb)) {
              this.usedBytes -= reserved;
              this.overLimit = true;
              made.dispose();
              made.image.close();
              return null;
            }
            this.usedBytes += extra;
            allocated += extra;
          }
          if (mine === this.token) {
            this.textureBytes.set(made, allocated);
            (this.displayedTextures ??= new Map()).set(i, displayedVersion);
          }
          return made;
        }).then(made => {
          if (mine === this.token) this.loadedTexture?.();
          return made;
        });
      this.textures[i] = t;
    }
    return t;
  }

  textureVersion(i: number) { return this.displayedTextures?.get(i) ?? ""; }

  /** One acknowledged draft; immutable versions survive unrelated writes and older requests are cancelled. */
  refreshPaints(textures: GroundTextureUpdate[], paints: string[]) {
    this.paintFailure = null;
    this.paintVersion++;
    this.paintLoading?.abort();
    if (!this.data) return;
    this.ensureSplatState();
    this.data.paints = paints;
    const active = new Set(textures.filter(t => t.version).map(t => t.i));
    const updates = [...textures], explicit = new Set(textures.map(t => t.i));
    this.data.textures.forEach((t, i) => {
      if (t.version && !active.has(i) && !explicit.has(i)) updates.push({i, size: t.source_size ?? t.size, version: ""});
    });
    for (const next of updates) {
      const descriptor = this.data.textures[next.i];
      if (!descriptor) continue;
      if (next.layers || descriptor.layers) this.refreshSplat(next);
      else this.refreshTexture(next);
    }
  }

  /** Reconcile an index loaded before the draft. The requested recipe belongs to this tab, never another tab's latest edits. */
  async syncPaints(paints: string[]) {
    const data = this.data;
    if (!data || (!this.paintFailure && JSON.stringify(data.paints ?? []) === JSON.stringify(paints))) return;
    const epoch = ++this.paintVersion, mine = this.token;
    this.paintLoading?.abort();
    const controller = this.paintLoading = new AbortController();
    try {
      const answer = await fetchJson<{textures: GroundTextureUpdate[]}>(`/api/editor/${encodeURIComponent(this.trackName)}/textures`, controller.signal, {method: "POST",
        headers: {"Content-Type": "application/json"}, body: JSON.stringify({base: data.revision, paints})});
      if (controller.signal.aborted || mine !== this.token || epoch !== this.paintVersion) return;
      const active = new Set(answer.textures.map(t => t.i));
      data.textures.forEach((t, i) => { if (t.version && !active.has(i)) answer.textures.push({i, size: t.source_size ?? t.size, version: ""}); });
      this.paintFailure = null;
      this.refreshPaints(answer.textures, paints);
    } catch (e) {
      if (!controller.signal.aborted && mine === this.token) this.onViewFailed(e instanceof Error ? e.message : "Could not read ground materials");
    }
  }

  async texturesReady() {
    await Promise.all([...this.textureChanges.values()].map(t => t.done));
    await Promise.all([...(this.splatPending?.values() ?? [])].map(t => t.done));
    if (this.paintFailure) throw new Error(this.paintFailure);
  }

  private ensureSplatState() {
    this.splatImages ??= new Map(); this.splatBindings ??= new Map();
    this.splatPending ??= new Map(); this.sourceMaterials ??= new Map();
  }

  private weightBundles?: WeightBundles;

  private disposeSplatImage(entry: SplatImageEntry) {
    if (entry.disposed) return;
    entry.disposed = true; entry.controller.abort();
    if (entry.token === this.token) this.usedBytes -= entry.bytes;
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
      return i < 0 ? Promise.resolve(null) : this.texture(this.trackName, data, i);
    }
    const key = `${ref.linear ? "mask" : "colour"}:${ref.key ?? ref.url}`;
    keys.add(key);
    const found = this.splatImages.get(key);
    if (found) return found.done;
    const bytes = COPIES * (ref.size ?? 0), mine = this.token;
    if (!bytes || !fits(this.usedBytes, bytes, this.settings.memoryGb)) {
      this.overLimit = true; return Promise.resolve(null);
    }
    this.usedBytes += bytes;
    const controller = new AbortController();
    const entry: SplatImageEntry = {done: Promise.resolve(null), controller, bytes, token: mine, disposed: false};
    this.splatImages.set(key, entry);
    const signal = AbortSignal.any([controller.signal, this.loading.signal]);
    this.weightBundles ??= new WeightBundles(size => {
      if (!fits(this.usedBytes, size, this.settings.memoryGb)) return false;
      this.usedBytes += size; return true;
    }, size => { this.usedBytes -= size; });
    const bundled = ref.bundle ? this.weightBundles.acquire(ref.bundle, ref.size!, signal) : undefined;
    if (bundled === null) {
      this.splatImages.delete(key); this.disposeSplatImage(entry);
      this.overLimit = true; return Promise.resolve(null);
    }
    entry.done = textureTurn(async () => {
      if (signal.aborted) return null;
      const raw = bundled ? await bundled.read() : await fetchBytes(ref.url!, signal);
      if (signal.aborted) return null;
      return makeTexture(raw, ref.name, this.renderer.capabilities.getMaxAnisotropy(), ref.linear);
    }).then(texture => {
      if (entry.disposed || mine !== this.token) { texture?.dispose(); return null; }
      if (texture) { entry.texture = texture; this.loadedTexture?.(); }
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
    this.ensureSplatState();
    const data = this.data!, mine = this.token, keys = new Set<string>();
    const entry: SplatPending = {keys, done: Promise.resolve()};
    this.splatPending.set(k, entry);
    const current = () => mine === this.token && this.splatPending.get(k) === entry && !this.loading.signal.aborted;
    const base = this.splatTexture(layers.base, data, keys);
    void base.then(texture => { if (texture && current()) { material.map = texture; material.needsUpdate = true; this.dirty = true; } }, () => {});
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
      this.removeGround(k);
      this.splatBindings.set(k, keys);
      ready(); this.dirty = true;
    }).catch(error => {
      if (current()) {
        this.paintFailure = error instanceof Error ? error.message : "Could not load this material";
        this.onViewFailed(this.paintFailure);
      }
    }).finally(() => {
      if (this.splatPending.get(k) === entry) this.splatPending.delete(k);
      if (mine === this.token) {
        if (this.materials[k] !== material) material.dispose();
        this.pruneSplatImages();
      }
    });
  }

  private removeGround(k: number) {
    this.groundLayers?.get(k)?.dispose(); this.groundLayers?.delete(k);
    if (!this.groundLayers?.size) { this.groundFrame?.dispose(); this.groundFrame = null; }
  }

  private prepareGround(k: number, material: GroundMaterial, layers: ColourSplat, ready: () => void) {
    this.ensureSplatState(); this.groundLayers ??= new Map();
    const data = this.data!, mine = this.token, keys = new Set<string>();
    const entry: SplatPending = {keys, done: Promise.resolve()}; this.splatPending.set(k, entry);
    const current = () => mine === this.token && this.splatPending.get(k) === entry && !this.loading.signal.aborted;
    const base = this.splatTexture(layers.base, data, keys);
    // Show the source tile while regional weights and photos load; an existing displayed map stays intact.
    void base.then(texture => {
      if (texture && current() && !material.map) { material.map = texture; material.needsUpdate = true; this.dirty = true; }
    }, () => {});
    const photos = layers.images.map(ref => this.splatTexture(ref, data, keys));
    const maps = layers.images.map(ref => ref.detail ? this.splatTexture(ref.detail, data, keys) : Promise.resolve(null));
    const masks = layers.ground!.passes.map(pass => pass.weight.size ? this.splatTexture(pass.weight, data, keys) : Promise.resolve(null));
    entry.done = Promise.all([base, ...photos, ...maps, ...masks]).then(loaded => {
      if (!current()) return;
      const original = loaded[0], images = loaded.slice(1, 1 + photos.length), packed = loaded.slice(1 + photos.length, 1 + photos.length + maps.length);
      const weights = loaded.slice(1 + photos.length + maps.length);
      if (!original || images.some(p => !p) || weights.some((p, i) => layers.ground!.passes[i].weight.size && !p) || packed.some((p, i) => layers.images[i].detail && !p)) throw new Error("Not enough editor memory for these ground materials");
      const frame = this.groundFrame ?? new GroundFrame(this.renderer, this.scene,
        bytes => { if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) return false; this.usedBytes += bytes; return true; },
        bytes => { this.usedBytes -= bytes; });
      const replacement = new GroundLayer(frame, layers, original, images as THREE.Texture[], packed, weights, material.color);
      try {
        for (const mesh of this.meshes) if (mesh.userData.info.material === k) replacement.attach(mesh);
        frame.bind(material);
      } catch (error) { replacement.dispose(); if (!this.groundFrame) frame.dispose(); throw error; }
      this.groundFrame = frame;
      this.groundLayers.get(k)?.dispose(); this.groundLayers.set(k, replacement);
      this.splatBindings.set(k, keys); ready(); this.dirty = true;
    }).catch(error => { if (current()) { this.paintFailure = String(error.message ?? error); this.onViewFailed(this.paintFailure); } })
      .finally(() => {
        if (this.splatPending.get(k) === entry) this.splatPending.delete(k);
        if (mine === this.token) { if (this.materials[k] !== material) material.dispose(); this.pruneSplatImages(); }
      });
  }

  private refreshSplat(next: GroundTextureUpdate) {
    const data = this.data!, descriptor = data.textures[next.i], oldLayers = descriptor.layers;
    if (descriptor.version === next.version && this.textureVersion(next.i) === next.version && !!oldLayers === !!next.layers) return;
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
        const restored = old ? this.material(this.trackName, data, k) : null;
        for (const mesh of this.meshes) if (mesh.userData.info.material === k && restored) mesh.material = restored;
        old?.dispose();
        this.displayedTextures.set(next.i, "");
      } else if (!old) {
        data.materials[k] = {...source, splat: next.layers}; // Its eventual mesh load uses the current layout.
      } else {
        const layers = next.layers, colour = old.color.clone();
        const material: GroundMaterial = !layers.ground && layers.images.some(ref => ref.detail)
          ? new THREE.MeshStandardMaterial({color: colour, roughness: 1, metalness: 0})
          : new THREE.MeshLambertMaterial({color: colour});
        this.prepareSplat(k, material, layers, () => {
          const previous = this.materials[k];
          this.materials[k] = material; data.materials[k] = {...source, splat: layers};
          for (const mesh of this.meshes) if (mesh.userData.info.material === k) mesh.material = material;
          previous?.dispose();
          this.displayedTextures.set(next.i, next.version);
          this.onTexturesChanged?.();
        });
      }
    }
    this.pruneSplatImages(); this.dirty = true;
    if (!next.layers) this.onTexturesChanged?.();
  }

  /** Keep a texture's identity: all loaded materials and Copy previews retain their existing reference. */
  private refreshTexture(next: {i: number; size: number; version: string}) {
    const data = this.data, descriptor = data?.textures[next.i];
    if (!data || !descriptor || this.textureChanges.get(next.i)?.version === next.version) return;
    if ((descriptor.version ?? "") === next.version && (!this.textures[next.i] || this.textureVersion(next.i) === next.version)) return;
    Object.assign(descriptor, {version: next.version, size: next.size});
    this.textureChanges.get(next.i)?.abort();
    const old = this.textures[next.i];
    if (!old) return; // Still outside the memory limit or not requested: its eventual load uses the new descriptor.
    const mine = this.token, controller = new AbortController();
    let reserved = 0;
    const release = () => { if (mine === this.token) this.usedBytes -= reserved; reserved = 0; };
    const entry = {abort: () => { controller.abort(); release(); }, done: Promise.resolve(), version: next.version};
    this.textureChanges.set(next.i, entry);
    const signal = AbortSignal.any([controller.signal, this.loading.signal]);
    const current = () => !signal.aborted && mine === this.token && this.textureChanges.get(next.i) === entry;
    entry.done = (async () => {
      let made: THREE.Texture | null = null;
      try {
        const target = await old;
        if (!target || !current()) return;
        made = await textureTurn(async () => {
          if (!current()) return null;
          const needed = COPIES * next.size;
          if (!fits(this.usedBytes, needed, this.settings.memoryGb)) throw new Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");
          this.usedBytes += needed; reserved = needed;
          const bytes = await fetchBytes(`/api/editor/${encodeURIComponent(this.trackName)}/texture/${next.i}?r=${data.revision}${next.version ? `&p=${next.version}` : ""}`, signal);
          if (!current()) return null;
          return makeTexture(bytes, descriptor.name, this.renderer.capabilities.getMaxAnisotropy(), descriptor.linear);
        });
        if (!made || !current()) return;
        if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap) {
          const extra = decodedBytes(made.image.width, made.image.height) - reserved;
          if (!fits(this.usedBytes, extra, this.settings.memoryGb)) throw new Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");
          this.usedBytes += extra; reserved += extra;
        }
        const previousImage = target.image;
        this.usedBytes -= this.textureBytes.get(target) ?? 0;
        this.textureBytes.set(target, reserved); reserved = 0;
        const alpha = this.alphaOf.get(target);
        if (alpha) this.usedBytes -= alpha.data.byteLength;
        this.alphaOf.delete(target);
        target.dispose();
        target.copy(made); target.needsUpdate = true;
        for (const m of this.materials) if (m?.map === target) m.needsUpdate = true;
        if (typeof ImageBitmap !== "undefined" && previousImage instanceof ImageBitmap) previousImage.close();
        made = null; // Its bitmap is now owned by target; the temporary texture never reached the GPU.
        (this.displayedTextures ??= new Map()).set(next.i, next.version);
        this.onTexturesChanged?.();
        this.dirty = true;
      } catch (e) {
        if (current()) {
          this.paintFailure = e instanceof Error ? e.message : "Could not update ground materials";
          this.onViewFailed(this.paintFailure);
        }
      } finally {
        if (made) { made.dispose(); if (typeof ImageBitmap !== "undefined" && made.image instanceof ImageBitmap) made.image.close(); }
        release();
        if (this.textureChanges.get(next.i) === entry) this.textureChanges.delete(next.i);
      }
    })();
  }

  private material(name: string, data: TrackIndex, k: number) {
    const have = this.materials[k];
    if (have) return have;
    const d = data.materials[k], b = Math.min(1, d.bright);
    this.ensureSplatState();
    if (!this.sourceMaterials.has(k)) this.sourceMaterials.set(k, d.source ?? d);
    const m: GroundMaterial = !d.splat?.ground && d.splat?.images.some(ref => ref.detail)
      ? new THREE.MeshStandardMaterial({color: new THREE.Color(b, b, b), roughness: 1, metalness: 0})
      : new THREE.MeshLambertMaterial({color: new THREE.Color(b, b, b)});
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
        this.onTexturesChanged?.();
      });
      return m;
    }
    if (d.dual_layer) {
      const mine = this.token, layers = d.dual_layer;
      const image = (file: string | null) => {
        const index = data.textures.findIndex(t => t.name === file);
        return index < 0 ? Promise.resolve(null) : this.texture(name, data, index);
      };
      // Reserve the original tile first. Until all three images fit and arrive, show that tile unchanged.
      const base = image(layers.base), keep = image(layers.mask), detail = image(d.texture);
      void base.then(texture => {
        if (texture && mine === this.token) { m.map = texture; m.needsUpdate = true; this.dirty = true; }
      }, () => {});
      void Promise.all([base, keep, detail]).then(([original, mask, colour]) => {
        if (!original || !mask || !colour || mine !== this.token) return;
        m.map = colour;
        bindColourBlend(m, original, mask, layers.scale);
        this.dirty = true;
      }, () => {}); // The shared loader reports failed images and owns their memory and disposal.
      return m;
    }
    if (d.ambient !== undefined && d.diffuse !== undefined && !d.world_scale && !takesGroundLight(d.name)) bindLightShares(m, d.ambient, d.diffuse);
    const i = data.textures.findIndex(t => t.name === d.texture);
    if (i >= 0) {
      const mine = this.token;
      void this.texture(name, data, i).then(t => {
        if (!t || mine !== this.token) return;
        m.map = t;
        if (d.world_scale) bindWorldColour(m, d.world_scale);
        m.needsUpdate = true;
        this.dirty = true;
      }, () => {});       // (load awaits the textures and reports their failures)
    }
    return m;
  }

  private addMesh(name: string, data: TrackIndex, info: MeshInfo, buf: ArrayBuffer) {
    if (this.byNumber.has(info.i)) return;
    const m = new THREE.Mesh(makeGeometry(info, buf), info.model
      ? this.modelDraw.picking(info.model.asset, info.model.material ?? -1) : this.material(name, data, info.material));
    m.userData = {lodIn: info.lod_in, lodOut: info.lod_out, info};
    m.name = info.name;
    takeShadows(m);
    if (!info.model) {
      const material = data.materials[info.material]?.name ?? "";
      if (isLampGlass(material)) this.lampGlass.push(m);
      this.nightGlow.bind(m.material as GroundMaterial, material);
    }
    this.scene.add(m);
    try { this.groundLayers?.get(info.material)?.attach(m); }
    catch (error) { this.paintFailure = String((error as Error).message ?? error); this.onViewFailed(this.paintFailure); }
    this.meshes.push(m);
    if (info.base !== null && info.base !== undefined) {
      if (!this.parts.has(info.base)) this.parts.set(info.base, []);
      this.parts.get(info.base)!.push(m);
    }
    this.byNumber.set(info.i, m);
    // (a model is always picked as its object: it never reaches the search for a material's connected faces)
    if (!info.model && !groundTile(info.name) && info.first_face == null && (this.objectPieces.has(info.i) || /^nocol_road_edge_dirt_/.test(info.name))) {
      this.materialAreas ??= new Map();
      this.materialAreas.set(info.i, new MaterialRegions(m.geometry.getAttribute("position"),
        (m.userData.indices ?? m.geometry.getIndex()!.array) as Uint16Array, this.objectPieces.get(info.i) ?? []));
    }
    void this.surfaceOverlay?.add(m).catch(e => this.surfaceFailed(String(e.message ?? e)));
    void this.roadRegionOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
    void this.roadInfluenceOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
    this.geometryPreview.apply(info.i);
    for (const piece of this.listedOut.get(info.i) ?? []) this.leaveOutIn(m, piece, true);
    if (info.base !== null && info.base !== undefined) {
      for (const id of this.billboardsOut.get(info.base) ?? []) {
        for (const piece of this.piecesOf(id)) if (piece.mesh === info.i) this.leaveOutIn(m, piece, true);
      }
      this.leaveOutSorts(m);
    }
    if (this.marked) this.markDue = true;
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
