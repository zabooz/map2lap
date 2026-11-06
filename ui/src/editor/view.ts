// The Editor tab's 3D view of a built track (src/app/trackview.py hands out its kn5's parts). W A S D and right drag move
// over the ground, the wheel zooms towards the mouse, held it turns and tilts around the view's middle, as in a building game. Meshes
// load nearest first, so the spot in view comes first on a long track. A click picks what is under the mouse.
import * as THREE from "three";
import {DDSLoader} from "three/addons/loaders/DDSLoader.js";
import {acceleratedRaycast, MeshBVH} from "three-mesh-bvh";
import {DEFAULT_CONTROLS, NORMAL_SPEED, type Controls} from "./controls";
import {billboardFaces, billboardOf, childrenOf, countOfSort, decodedBytes, fits, idsOfSorts, kindName, kindOf, latLonOf, nearestLast, objectAt, trackArea,
        objectIndex, physicsOf, routeMetre, sortOf, spriteAt, takenAlong, tileOf, type Atlas, type ObjectList} from "./inspect";

/** What the mouse points at (the hover box). */
export interface Hovered {
  id: string | null;            // (a single object's, which can be deleted)
  kind: string;
  sprite: string | null;
  sort: string | null;          // (a listed object's: what deleting all of a sort goes by)
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

/** What a click picked. id: what deleting it goes by, null for what can't be deleted. afterBuild: it can be, once the track is
    built again: its build wrote no list of objects yet. */
export interface Picked {
  id: string | null;
  afterBuild: boolean;
  kind: string;
  sprite: string | null;
  sort: string | null;
  position: [number, number, number];
  left: boolean;                // (by the left button, not for a menu)
  road: [number, number] | null;    // (AC x, z, if it is the road itself: asphalt, with nothing on it)
}

/** Where a right click asks for its menu: in the view's pixels, with the view's size. */
export interface MenuAt {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A place in the world: AC x, height, AC z. */
export type Place = [number, number, number];

/** Where the brush's ring was: AC x, AC z, seconds since the sample before. */
export type Sample = [number, number, number];

/** The brush as it is set: its size on the ground, and which way it goes unless Shift turns it round. */
export interface Brush {
  radius: number;
  lower: boolean;
}

/** All of a sort framed: a listed one's sort, or (tree) an atlas image. */
export interface Marked {
  sort: string;
  tree: boolean;
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
  base: string | null;          // (the tile's billboards: the mesh's name without its part's number)
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
  objects: Record<string, ObjectList>;
}

const FLOATS_PER_VERTEX = 11;       // (kn5.VERTEX: position, normal, uv, tangent)
const PARALLEL = 6;                 // meshes asked for at a time
// Textures on their way or being decoded at a time. A 307 km track up to a limit of 8 GB: 6: 70 s, 12: 52 s, 24: 53 s; 4 GB without any
// limit 34 s against 23 s with 12: hundreds at once stand in the meshes' way.
const TEXTURES_AT_A_TIME = 12;
const RESORT_M = 100, RESORT_EVERY_MS = 500;    // the queue of meshes sorted again when the view moved this far, at most this often: 66,000 take a while
const FETCH_TRIES = 3, FETCH_WAIT_MS = 500;     // one part of 66,000 cut off on its way doesn't end the loading of a long track
// The memory limit (the settings): a long track's kn5 can reach 10 GB, more than a browser tab can hold. What lies furthest
// from the view then stays out. A mesh or compressed texture counts twice: it stays here for the mouse and the ground, and
// the graphics card holds a copy. An estimate: the browser's own overhead is not counted.
const COPIES = 2;
const VIEW_M = 300000;              // far plane: the distant terrain reaches 40 km around a route of up to 500 km
const START_BACK_M = 45, START_UP_M = 22;   // the first view: behind and above the start
const GROUND = /^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/;   // the meshes the view stays above: over a river's surface, not its bed
const FAR = /^nocol_far/;
const ABOVE_GROUND_M = 1.5;
const LOOK_RAD_PER_PX = 0.004;      // the wheel held: how far the view turns per pixel dragged
const LOOK_DOWN_MIN_RAD = 0.02;     // the view stays this far below the horizon and this far from straight down (there it would flip)
const TURN_REACH = 10;              // the wheel held turns around the ground in the view's middle, at most this many times the height away
const TURN_REACH_MIN_M = 200;       // (flat over a plain that is many km: the camera would sweep across the country)
const AREA_MARGIN_M = 1000;         // how far beyond the track's meshes the view's middle goes (the camera can stand further out, to look back)
const MIDDLE_BUTTON = 1, MIDDLE_HELD = 4, RIGHT_BUTTON = 2, RIGHT_HELD = 2;     // (a mouse event's button; its buttons)
// The wheel: one notch goes this share of the way to what the mouse points at, so it feels the same from 10 m and from 10 km.
const ZOOM_STEP = 0.15;
const NOTCH_PX = 100, NOTCH_LINES = 3, MOST_NOTCHES = 3;    // (a notch's deltaY in pixels, in lines; one event of a fast wheel at most)
const NEAREST_M = 1;                // the wheel goes no nearer than this
const ZOOM_REACH = 5;               // a notch counts from at most this many times the height: terrain far off at the horizon is no km's jump
const ZOOM_EASE_S = 0.1;            // a notch glides: most of its way within this time, the view doesn't jump
const ZOOM_DONE = 0.002;            // (notches left that no eye sees)
const HIGHEST_MIN_M = 1000;         // the highest the camera goes: the track as a whole in view, at least this
const HIGHEST_MAX_M = 80000;        // ... at most this: the distant terrain, shown up to about 100 km (obj_to_kn5.VIEW), stays in sight
// Moving: m/s per m above the ground, so a close look creeps and an overview crosses the track; within these limits.
const FLY_PER_M = 2.0, FLY_MIN_M_S = 24, FLY_MAX_M_S = 6000;
const FLY_MAX_STEP_S = 0.1;         // (a slow frame moves no further than this)
const FOLLOW_GROUND_S = 0.3;        // moving, the camera's height follows the ground this slowly: hills pass under it, no bumps
const FLY_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);     // (by place on the keyboard: the same on every layout)
const HOVER_EVERY_MS = 60;          // how often the mouse's target is looked up: the box follows, the view stays smooth
const CLICK_PX = 4;                 // a press and release this near each other is a click, not a drag of the view
const PICKED_COLOUR = "#ffd21f";
const MARK_EVERY_MS = 300;          // the frames of a marked sort follow meshes loading at most this often
const BOX_EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6],
                   [3, 7]];         // (a box's 12 edges by their corners' numbers: bits x 1, y 2, z 4)
// what the build lists (src/track/objectlist.py, LISTED): an older track's can't be picked yet
const IN_THE_LIST = /^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/;
const WIRE = /_wire_/;
const WIRE_REACH_PX = 6;            // a wire is thinner than a pixel from afar: the mouse this near it finds it
const FACES_PER_WIRE_SEGMENT = 8;   // (furniture.wire_mesh: two crossed ribbons, each side of each two triangles)
const LEFT_BUTTON = 0;
const BRUSHED = /^(1ROAD|1GRASS|1GRAVEL)_ground/;   // what a stroke goes on: the ground itself, no bridge or water, whatever else the camera keeps above
const ROAD = /^1ROAD_ground/;       // what a click marks a band on (trackband: the road is this)
const BAND_COLOUR = "#27d3c3";
const BAND_UP_M = 0.3;              // (the band's lines over the road)
const PIN_PX = 14;                  // a band's pin on the screen, and how near the mouse has to be to take it
const MARK_M = 1.5;                 // (the cross at A, until there is a band)
const SAMPLE_EVERY_MS = 50;         // where the ring is, this often while the mouse is held: finer than a hand moves it, and it counts the time where it stands
const SAME_PLACE_M = 0.25;          // a sample this near the last one counts as standing there: a long hold on one spot stays one sample
const MOST_SAMPLES = 5000;          // (trackheights.MAX_STROKE_POINTS)
const PREVIEW_EVERY_MS = 200;       // how often a stroke under way is asked for: at most one at a time, what is newest when it is answered goes next
const FIELDS_PER_CHANGE = 4;        // (trackedits.preview: y and the normal)
const RING_POINTS = 64;
const RAISE_COLOUR = "#ff8a1f", LOWER_COLOUR = "#2f8bff";

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

/** An image's pixels, to read. (A plain canvas: not every browser has OffscreenCanvas.) */
function pixelsOf(image: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const can = canvas.getContext("2d", {willReadFrequently: true});
  can?.drawImage(image, 0, 0);
  return can ? can.getImageData(0, 0, image.width, image.height) : null;
}

/** What a MeshBVH holds itself (estimateMemoryInBytes walks on into its geometry, counted already: 3.2 GB too much on a 300 km track). */
export function bvhBytes(tree: MeshBVH) {
  const {roots, indirectBuffer} = MeshBVH.serialize(tree, {cloneBuffers: false});
  return roots.reduce((bytes, root) => bytes + root.byteLength, indirectBuffer?.byteLength ?? 0);
}

/** A ground mesh made quick to hit: the ground holds most of a track's triangles (Heiligenblut: 5.3 of 6.5 million), a ray
    otherwise reads all of each tile it meets. indirect: the triangles keep their order and numbers. Its bytes. */
function speedUpRays(mesh: THREE.Mesh) {
  const started = performance.now();
  const tree = new MeshBVH(mesh.geometry, {indirect: true});
  const bytes = bvhBytes(tree);
  mesh.geometry.boundsTree = tree;
  mesh.raycast = acceleratedRaycast;
  performance.measure("map2lap.bvh", {start: started, detail: bytes});
  return bytes;
}

const meshBytes = (m: MeshInfo) => m.vertices * FLOATS_PER_VERTEX * 4 + 4 + m.indices * 2;

/** Where a mouse event lies on el, each way from -1 to 1. Pure. */
function screenPoint(e: MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
}

/** The bytes at url. A connection lost is tried again; what the server refuses is not. */
async function fetchBytes(url: string, signal: AbortSignal, tries = FETCH_TRIES): Promise<ArrayBuffer> {
  let r: Response;
  try {
    r = await fetch(url, {signal});
    if (r.ok) return await r.arrayBuffer();
  } catch (e) {
    if (signal.aborted || tries <= 1) throw e;
    await new Promise(ok => setTimeout(ok, FETCH_WAIT_MS));
    return fetchBytes(url, signal, tries - 1);
  }
  throw new Error((await r.json().catch(() => null))?.error ?? `${url}: ${r.status}`);
}

/** Jobs through this run at most most at a time, the others wait their turn. */
function oneByOne(most: number) {
  const waiting: (() => void)[] = [];
  let running = 0;
  return async <T>(job: () => Promise<T>) => {
    if (running >= most) await new Promise<void>(ok => waiting.push(ok));
    running++;
    try {
      return await job();
    } finally {
      running--;
      waiting.shift()?.();
    }
  };
}

const textureTurn = oneByOne(TEXTURES_AT_A_TIME);

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

/** A stroke's samples with the ring at x, z for seconds more: on a way from the last place, or standing there, which goes on one sample. Pure but for samples. */
export function addSample(samples: Sample[], x: number, z: number, seconds: number) {
  const last = samples.at(-1)!, before = samples.at(-2);
  if (samples.length >= MOST_SAMPLES) last[2] += seconds;     // (minutes of moving: the rest of its time where it got to)
  else if (Math.hypot(x - last[0], z - last[1]) >= SAME_PLACE_M) samples.push([x, z, seconds]);
  else if (before && before[0] === last[0] && before[1] === last[1]) last[2] += seconds;
  else samples.push([last[0], last[1], seconds]);
}

/** The band's lines as flat x, y, z pairs: its two edges along line, its ends across, a little over the road. Pure. */
export function bandLines(line: Place[], width: number) {
  const out: number[] = [], half = width / 2;
  const side = (k: number) => {
    const a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)], l = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1;
    return [(b[2] - a[2]) / l * half, (a[0] - b[0]) / l * half];
  };
  const left = (k: number) => { const [dx, dz] = side(k); return [line[k][0] + dx, line[k][1] + BAND_UP_M, line[k][2] + dz]; };
  const right = (k: number) => { const [dx, dz] = side(k); return [line[k][0] - dx, line[k][1] + BAND_UP_M, line[k][2] - dz]; };
  for (let k = 0; k + 1 < line.length; k++) out.push(...left(k), ...left(k + 1), ...right(k), ...right(k + 1));
  out.push(...left(0), ...right(0), ...left(line.length - 1), ...right(line.length - 1));
  return out;
}

/** A cross at a place, as flat x, y, z pairs. Pure. */
function crossLines([x, y, z]: Place) {
  const up = y + BAND_UP_M;
  return [x - MARK_M, up, z, x + MARK_M, up, z, x, up, z - MARK_M, x, up, z + MARK_M];
}

/** How far from centre a sphere has to reach to hold a box: to its farthest corner, not only to its two named ones. Pure. */
export function reachOfBox(centre: readonly number[], low: readonly number[], high: readonly number[]) {
  return Math.hypot(...centre.map((c, axis) => Math.max(Math.abs(low[axis] - c), Math.abs(high[axis] - c))));
}

/** The geometry's sphere from its box, around the centre the file says, never smaller than the file says: a height change can move a mesh past it. */
function fitSphere(g: THREE.BufferGeometry, info: MeshInfo) {
  g.computeBoundingBox();
  const box = g.boundingBox!;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...info.center),
                                      Math.max(info.radius, reachOfBox(info.center, box.min.toArray(), box.max.toArray())));
}

function makeGeometry(info: MeshInfo, buf: ArrayBuffer) {
  const g = new THREE.BufferGeometry();
  const v = new THREE.InterleavedBuffer(new Float32Array(buf, 0, info.vertices * FLOATS_PER_VERTEX), FLOATS_PER_VERTEX);
  g.setAttribute("position", new THREE.InterleavedBufferAttribute(v, 3, 0));
  g.setAttribute("normal", new THREE.InterleavedBufferAttribute(v, 3, 3));
  g.setAttribute("uv", new THREE.InterleavedBufferAttribute(v, 2, 6));
  const skip = info.vertices * FLOATS_PER_VERTEX * 4 + 4;
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, skip, info.indices), 1));
  // (a ray then skips most meshes without looking at their triangles: a ground query from about 4.5 to 2.8 ms; the sphere
  // alone lets through every tile a long ray passes near)
  fitSphere(g, info);
  return g;
}

/** three.js in the element host, showing one track. dispose() ends it. */
export class TrackView {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.5, VIEW_M);
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
  private clearance = START_UP_M;       // m above the ground it was left at: moving keeps to it
  private highest = HIGHEST_MIN_M;      // m above the ground it can go
  private area = trackArea([]);         // where the middle of its view can lie, x and z
  private lastGround = 0;               // the height of the last ground found under it: where none is, that counts as the ground
  private zoomLeft = 0;                 // notches of the wheel still to glide, towards zoomAim
  private zoomAim = new THREE.Vector3();
  private host: HTMLElement;
  private flying = new Set<string>();   // the fly keys held
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
  private marked: Marked | null = null;
  private markedLines: THREE.LineSegments | null = null;
  private markDue = false;              // (meshes loaded since the frames were drawn)
  private lastMark = 0;
  private markEvery = MARK_EVERY_MS;
  private onIndexed: (revision: string | null) => void = () => {};
  private pickedBox: THREE.Box3Helper | null = null;
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
  private draft = 0;                    // the draft's revision on the server
  private refreshes = oneByOne(PARALLEL);
  private brush: Brush | null = null;
  private onStroke: (samples: Sample[], lower: boolean) => void = () => {};
  private askPreview: (samples: Sample[], lower: boolean) => Promise<ArrayBuffer | string | null> = () => Promise.resolve(null);
  private onStrokeRefused: (why: string) => void = () => {};
  private onBrushWheel: (what: "radius" | "height", by: number) => void = () => {};
  private ring: THREE.LineLoop | null = null;
  private stroke: {samples: Sample[]; lower: boolean; at: number; timer: ReturnType<typeof setInterval>; asked: number; asking: boolean; look: string} | null = null;
  private previewed = new Set<number>();    // the meshes that show a preview: fetched anew when it is taken over
  private underPreview = new Map<number, Map<number, [number, number, number, number]>>();  // per such mesh what its vertices were: y and normal
  private previewShown = new Map<number, {numbers: Uint32Array; values: Float32Array}>();   // the preview in place, per mesh: it goes on again over what is fetched
  private wheelTaken = false;           // Ctrl and Alt with the wheel are the tool's
  private marking: ((x: number, z: number) => void) | null = null;
  private pins: Place[] = [];
  private pinMarks: THREE.Points | null = null;
  private pinTexture: THREE.CanvasTexture | null = null;
  private dragged: {pin: number; x: number; y: number; from: Place} | null = null;
  private onPinMoved: (pin: number, x: number, z: number) => void = () => {};
  private onPinTaken: (pin: number) => void = () => {};
  private onClicked: (picked: Picked | null) => void = () => {};
  private band: THREE.LineSegments | null = null;

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
    this.turnAround(this.renderer.domElement);
    this.grabGround(this.renderer.domElement);
    this.zoomWheel(this.renderer.domElement);
    this.flyKeys(this.renderer.domElement);
    this.followMouse(this.renderer.domElement);
    this.clicks(this.renderer.domElement);
    this.dragPins(this.renderer.domElement);
    this.strokes(this.renderer.domElement);
    this.resizing = new ResizeObserver(() => this.resize());
    this.resizing.observe(host);
    this.renderer.setAnimationLoop(() => this.frame());
  }

  dispose() {
    this.token++;
    this.loading.abort();
    this.clear();
    this.resizing.disconnect();
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** Its tab was opened or left. */
  show(on: boolean) {
    this.shown = on;
    if (on) this.resize();
    else {
      this.flying.clear();
      this.zoomLeft = 0;
    }
  }

  /** How the view moves from now on (the Editor settings). */
  setControls(c: Controls) {
    this.settings = c;
  }

  /** onHover gets what the mouse points at, null when nothing. */
  setHover(onHover: (hovered: Hovered | null) => void) {
    this.onHover = onHover;
  }

  /** onPick gets what a click picked, null when nothing or when that's over. */
  setPick(onPick: (picked: Picked | null) => void) {
    this.onPick = onPick;
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
    this.mark(null);
    this.onPick(null);
  }

  /** The objects with these ids ("<mesh as built>#<number>"), the trees and bushes of sorts and the listed objects of objectSorts
      are left out from now on, those not named come back. A left out one's triangles shrink to a point: nothing draws or hits them,
      the others keep their numbers. What goes is what any of them takes along: a span two poles share stays out while one does. */
  setRemoved(ids: string[], sorts: string[] = [], objectSorts: string[] = []) {
    this.named = {ids, objectSorts: new Set(objectSorts)};
    const wanted = this.wanted(), wantedSorts = new Set(sorts);
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
    return new Set([...named.ids, ...idsOfSorts(this.data?.objects ?? {}, named.objectSorts)]);
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
    return seen.size;
  }

  /** All triangles of an object and what belongs to it that are known by now: a billboard's in the parts of its mesh loaded so
      far. */
  private piecesOf(id: string): Piece[] {
    const at = id.lastIndexOf("#"), base = id.slice(0, at), number = Number(id.slice(at + 1));
    const listed = this.data?.objects?.[base]?.faces[number];
    if (listed) {
      return [...listed.map(([mesh, from, count]) => ({mesh, from, end: from + count})),
              ...(this.belonging.get(id) ?? []).flatMap(child => this.piecesOf(child))];
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
  async open(name: string, say: (text: string) => void) {
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
    this.objectPieces = objectIndex(data.objects);
    this.belonging = childrenOf(data.objects);
    this.removed = this.wanted();           // (the sorts named before the list was there; no mesh is loaded yet)
    this.noteListedOut();
    this.onIndexed(data.revision);
    this.placeCamera(data);
    this.renderer.domElement.focus({preventScroll: true});     // (W A S D work at once, not in the track's dropdown)
    let queue = nearestLast<MeshInfo>(data.meshes, this.camera.position.toArray());
    let sortedAt = this.camera.position.clone(), sortedWhen = performance.now();
    const total = queue.length;
    let done = 0;
    const worker = async () => {
      while (queue.length && mine === this.token) {
        if (performance.now() - sortedWhen > RESORT_EVERY_MS && sortedAt.distanceTo(this.camera.position) > RESORT_M) {
          queue = nearestLast<MeshInfo>(queue, this.camera.position.toArray());
          sortedAt = this.camera.position.clone();
          sortedWhen = performance.now();
        }
        const info = queue.pop()!;
        if (!fits(this.usedBytes, COPIES * meshBytes(info), this.settings.memoryGb)) {
          this.overLimit = true;
          queue.length = 0;
          return;
        }
        this.usedBytes += COPIES * meshBytes(info);
        const asked = this.heightsVersion;
        const buf = await fetchBytes(`/api/editor/${encodeURIComponent(name)}/mesh/${info.i}?r=${data.revision}&d=${this.draft}`, signal);
        if (mine !== this.token) return;
        this.addMesh(name, data, info, buf);
        if (asked !== this.heightsVersion) void this.refresh(info.i);      // (changed on its way)
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

  /** The wheel held and dragged turns and tilts the view around the ground in its middle, which stays there. Its point is found
      anew each time, so nothing old is kept that could lie far off. */
  private turnAround(el: HTMLElement) {
    let last: {x: number; y: number} | null = null, pivot = new THREE.Vector3(), reach = 0;
    el.addEventListener("mousedown", e => {     // (else the browser's scrolling by wheel starts)
      if (e.button === MIDDLE_BUTTON) e.preventDefault();
    });
    el.addEventListener("pointerdown", e => {
      if (e.button !== MIDDLE_BUTTON) return;
      this.zoomLeft = 0;
      last = {x: e.clientX, y: e.clientY};
      const c = this.camera.position, look = this.camera.getWorldDirection(new THREE.Vector3());
      reach = Math.max(NEAREST_M, Math.min(this.reachOfLook(), this.groundAlong(c, look)?.distance ?? this.wayDown(look)));
      pivot = c.clone().addScaledVector(look, reach);
      this.intoArea(pivot);
    });
    el.addEventListener("pointermove", e => {
      if (!last) return;
      if (!(e.buttons & MIDDLE_HELD)) {
        last = null;
        return;
      }
      const {look, invertLook} = this.settings, rad = LOOK_RAD_PER_PX * look / NORMAL_SPEED;
      this.turn(pivot, reach, (last.x - e.clientX) * rad, (last.y - e.clientY) * rad * (invertLook ? -1 : 1));
      last = {x: e.clientX, y: e.clientY};
    });
    el.addEventListener("pointerup", e => {
      if (e.button === MIDDLE_BUTTON) last = null;
    });
  }

  /** Right drag: the ground under the mouse stays under it. The right click for the menu is clicks'. */
  private grabGround(el: HTMLElement) {
    let plane: THREE.Plane | null = null;
    const at = new THREE.Vector3(), grabbed = new THREE.Vector3();
    el.addEventListener("pointerdown", e => {
      if (e.button !== RIGHT_BUTTON) return;
      this.zoomLeft = 0;
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      const {ray} = this.picker, height = this.groundAlong(ray.origin, ray.direction)?.point.y ?? this.lastGround;
      plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -height);
      if (!ray.intersectPlane(plane, grabbed)) plane = null;      // (the sky: nothing to take along)
    });
    const follow = (e: PointerEvent, on: THREE.Plane) => {
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      if (!this.picker.ray.intersectPlane(on, at) || at.distanceTo(this.camera.position) > 2 * this.highest) return;   // (at the horizon)
      this.camera.position.x += grabbed.x - at.x;
      this.camera.position.z += grabbed.z - at.z;
      this.settle();
      this.clearance = this.height;
      this.moved();
    };
    el.addEventListener("pointermove", e => {
      if (!plane) return;
      if (e.buttons & RIGHT_HELD) follow(e, plane);
      else plane = null;
    });
    el.addEventListener("pointerup", e => {
      if (e.button !== RIGHT_BUTTON) return;
      if (plane) follow(e, plane);      // (where it was let go: a browser under load merges the last moves into this)
      plane = null;
    });
  }

  /** The wheel: nearer to what the mouse points at or back from it, by a share of the way (ZOOM_STEP); the view keeps its direction.
      The mouse on the sky: the way the view looks, never upwards. */
  private zoomWheel(el: HTMLElement) {
    el.addEventListener("wheel", e => {
      e.preventDefault();
      if ((this.brush || this.wheelTaken) && (e.ctrlKey || e.altKey)) {
        if (e.deltaY) this.onBrushWheel(e.altKey ? "height" : "radius", e.deltaY < 0 ? 1 : -1);
        return;
      }
      if (!this.data || this.held) return;      // (a button held: that drag goes by the camera as it was)
      this.mouse = screenPoint(e, el);
      const hit = this.hit(), {ray} = this.picker, c = this.camera.position;
      const direction = hit || ray.direction.y < 0 ? ray.direction : this.camera.getWorldDirection(new THREE.Vector3());
      const way = Math.min(hit?.distance ?? this.wayDown(direction), Math.max(this.height, NEAREST_M) * ZOOM_REACH);
      this.zoomAim.copy(c).addScaledVector(direction, Math.max(way, NEAREST_M));
      const px = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY / NOTCH_LINES * NOTCH_PX : e.deltaY;
      this.zoomLeft += THREE.MathUtils.clamp(px / NOTCH_PX, -MOST_NOTCHES, MOST_NOTCHES) * this.settings.zoom / NORMAL_SPEED;
    }, {passive: false});
  }

  /** The part of the notches left that falls into seconds, along the line to what they aim at: that stays under the mouse. */
  private glideZoom(seconds: number) {
    if (this.zoomLeft > 0 && this.height >= this.highest) {      // (at the top: on, it would only slide sideways)
      this.zoomLeft = 0;
      return;
    }
    let notches = this.zoomLeft * (1 - Math.exp(-seconds / ZOOM_EASE_S));
    if (Math.abs(this.zoomLeft - notches) < ZOOM_DONE) notches = this.zoomLeft;
    this.zoomLeft -= notches;
    const c = this.camera.position, way = c.distanceTo(this.zoomAim);
    if (!way) return;
    const left = Math.max(Math.min(way, NEAREST_M), way * (1 - ZOOM_STEP) ** -notches);
    c.lerpVectors(this.zoomAim, c, left / way);
    this.settle();
    this.clearance = this.height;
    this.moved();
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

  /** onStroke gets a stroke when it ends: where the ring was and for how long, and whether it lowers. askPreview gets it while it lasts,
      and answers with what it changes so far (trackedits.preview), or why it can't be: then it ends there, onStrokeRefused gets that;
      null: no answer this time. */
  setStroke(onStroke: (samples: Sample[], lower: boolean) => void, askPreview: (samples: Sample[], lower: boolean) => Promise<ArrayBuffer | string | null>,
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

  /** The vertices a preview changed as they were. It can show less than the one before, so nothing of that may stay. */
  takeBackPreview() {
    for (const [i, vertices] of this.underPreview) {
      const m = this.byNumber.get(i);
      if (!m) continue;
      const data = (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data, array = data.array;
      for (const [number, was] of vertices) {
        const v = number * FLOATS_PER_VERTEX;
        array[v + 1] = was[0];
        array[v + 3] = was[1];
        array[v + 4] = was[2];
        array[v + 5] = was[3];
      }
      data.needsUpdate = true;
      fitSphere(m.geometry, m.userData.info as MeshInfo);
      m.geometry.boundsTree?.refit();
      this.previewed.delete(i);
      this.dirty = true;
    }
    this.underPreview.clear();
    this.previewShown.clear();
  }

  /** What a preview shows stays until the server hands out the meshes: it is being taken over. */
  keepPreview() {
    this.underPreview.clear();
    this.previewShown.clear();
  }

  /** ... it wasn't: they are fetched as they are. */
  dropPreview() {
    const shown = [...this.previewed];
    this.previewed.clear();
    for (const i of shown) void this.refresh(i);
  }

  /** Whether Ctrl and Alt with the wheel go to setBrushWheel's: a band is marked. */
  setWheelTaken(taken: boolean) {
    this.wheelTaken = taken;
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
    return this.groundAlong(new THREE.Vector3(x, VIEW_M, z), new THREE.Vector3(0, -1, 0))?.point.y ?? this.lastGround;
  }

  /** The band along line, its width in m on the road; one place: a cross, null: none. */
  drawBand(line: Place[] | null, width: number) {
    if (this.band) {
      this.scene.remove(this.band);
      this.band.geometry.dispose();
      (this.band.material as THREE.Material).dispose();
      this.band = null;
    }
    this.dirty = true;
    if (!line?.length) return;
    const lines = line.length === 1 ? crossLines(line[0]) : bandLines(line, width);
    this.band = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lines, 3)),
                                       new THREE.LineBasicMaterial({color: BAND_COLOUR, depthTest: false, transparent: true}));
    this.band.renderOrder = 10;
    this.band.frustumCulled = false;
    this.scene.add(this.band);
  }

  /** The pins of a band where they are, as round marks of one size whatever the distance; each can be dragged and taken away (setPinned). None: []. */
  drawPins(pins: Place[]) {
    this.pins = pins;
    this.dragged = null;
    if (this.pinMarks) {
      this.scene.remove(this.pinMarks);
      this.pinMarks.geometry.dispose();
      (this.pinMarks.material as THREE.Material).dispose();
      this.pinMarks = null;
    }
    this.dirty = true;
    if (!pins.length) {
      this.renderer.domElement.style.cursor = "";      // (none left to say it over)
      return;
    }
    this.pinMarks = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pins.flatMap(([x, y, z]) => [x, y + BAND_UP_M, z]), 3)),
                                     new THREE.PointsMaterial({color: BAND_COLOUR, size: PIN_PX, sizeAttenuation: false, map: this.pinImage(), alphaTest: 0.5, depthTest: false, transparent: true}));
    this.pinMarks.renderOrder = 11;
    this.pinMarks.frustumCulled = false;
    this.scene.add(this.pinMarks);
  }

  /** A round mark with a light middle, made once. */
  private pinImage() {
    if (this.pinTexture) return this.pinTexture;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(16, 16, 15, 0, 2 * Math.PI);
    c.fill();
    this.pinTexture = new THREE.CanvasTexture(canvas);
    return this.pinTexture;
  }

  /** moved gets a pin's number and where it was dragged to, taken the number of one a right click took away. */
  setPinned(moved: (pin: number, x: number, z: number) => void, taken: (pin: number) => void) {
    this.onPinMoved = moved;
    this.onPinTaken = taken;
  }

  /** The number of the pin under the mouse, -1: none. */
  private pinAt(e: MouseEvent, el: HTMLElement) {
    const r = el.getBoundingClientRect(), at = new THREE.Vector3();
    let best = -1, least = PIN_PX;
    this.pins.forEach(([x, y, z], k) => {
      at.set(x, y + BAND_UP_M, z).project(this.camera);
      const apart = Math.hypot((at.x + 1) / 2 * r.width + r.left - e.clientX, (1 - at.y) / 2 * r.height + r.top - e.clientY);
      if (at.z < 1 && apart < least) {
        least = apart;
        best = k;
      }
    });
    return best;
  }

  /** A pin held no more without a place to go: back where it was, as the page has it. */
  private dropDragged() {
    const held = this.dragged;
    this.dragged = null;
    if (!held || !this.pinMarks) return;
    this.pins[held.pin] = held.from;
    const [x, y, z] = held.from;
    (this.pinMarks.geometry.getAttribute("position") as THREE.BufferAttribute).setXYZ(held.pin, x, y + BAND_UP_M, z).needsUpdate = true;
    this.dirty = true;
  }

  /** The left button on a pin takes it along over the ground; let go, it says where. Under the mouse the pointer says that it can. */
  private dragPins(el: HTMLElement) {
    el.addEventListener("pointerdown", e => {
      if (e.button !== LEFT_BUTTON || this.brush) return;
      const pin = this.pinAt(e, el);
      if (pin < 0) return;
      this.dragged = {pin, x: e.clientX, y: e.clientY, from: this.pins[pin]};
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", e => {
      if (!this.dragged) {
        if (this.pins.length) el.style.cursor = this.pinAt(e, el) >= 0 ? "grab" : "";
        return;
      }
      this.mouse = screenPoint(e, el);
      const at = this.brushAt();
      if (!at || !this.pinMarks) return;
      this.pins[this.dragged.pin] = [at.x, at.y, at.z];
      (this.pinMarks.geometry.getAttribute("position") as THREE.BufferAttribute).setXYZ(this.dragged.pin, at.x, at.y + BAND_UP_M, at.z).needsUpdate = true;
      this.dirty = true;
    });
    el.addEventListener("pointerup", e => {
      const held = this.dragged;
      if (!held || e.button !== LEFT_BUTTON) return;
      if (Math.hypot(e.clientX - held.x, e.clientY - held.y) < CLICK_PX) return this.dropDragged();     // (a click with a shaky hand)
      this.dragged = null;
      this.onPinMoved(held.pin, this.pins[held.pin][0], this.pins[held.pin][2]);
    });
    el.addEventListener("pointercancel", () => this.dropDragged());
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
      this.placeRing(at, s.lower !== this.brush?.lower);
      if (at) addSample(s.samples, at.x, at.z, seconds);    // (off the ground it paints nothing, and its time doesn't count)
    }
    if (!s.asking && now - s.asked >= PREVIEW_EVERY_MS) {
      s.asking = true;
      s.asked = now;
      void this.askPreview(s.samples.map(x => [...x] as Sample), s.lower).then(answer => {
        s.asking = false;
        if (this.stroke !== s) return;      // (an answer about a stroke that is over says nothing about the next one)
        if (typeof answer === "string") {
          this.cancelStroke();
          this.onStrokeRefused(answer);
        } else if (answer) this.showPreview(answer);
      }, () => { s.asking = false; });
    }
  }

  /** What trackedits.preview answered into the meshes loaded, on the vertices it names, instead of the preview before. */
  showPreview(buf: ArrayBuffer) {
    this.takeBackPreview();
    const head = new Uint32Array(buf);
    let word = 1;
    for (let mesh = 0; mesh < head[0]; mesh++) {
      const i = head[word], count = head[word + 1];
      this.previewShown.set(i, {numbers: head.subarray(word + 2, word + 2 + count),
                                values: new Float32Array(buf, (word + 2 + count) * 4, count * FIELDS_PER_CHANGE)});
      word += 2 + count + count * FIELDS_PER_CHANGE;
      this.laidOver(i);
    }
    this.dirty = true;
  }

  /** The preview in place, on mesh number i if it is loaded, noting what it covers. */
  private laidOver(i: number) {
    const shown = this.previewShown.get(i), m = this.byNumber.get(i);
    if (!shown || !m) return;
    const {numbers, values} = shown;
    const data = (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data, array = data.array;
    const under = new Map<number, [number, number, number, number]>();
    this.underPreview.set(i, under);
    for (let k = 0; k < numbers.length; k++) {
      const v = numbers[k] * FLOATS_PER_VERTEX, c = k * FIELDS_PER_CHANGE;
      under.set(numbers[k], [array[v + 1], array[v + 3], array[v + 4], array[v + 5]]);
      array[v + 1] = values[c];
      array[v + 3] = values[c + 1];
      array[v + 4] = values[c + 2];
      array[v + 5] = values[c + 3];
    }
    data.needsUpdate = true;
    fitSphere(m.geometry, m.userData.info as MeshInfo);
    m.geometry.boundsTree?.refit();
    this.previewed.add(i);
  }

  /** onBrushWheel gets the wheel over the view with the brush set and Ctrl (its radius) or Alt (its height) held: a notch up, 1, down, -1. */
  setBrushWheel(onBrushWheel: (what: "radius" | "height", by: number) => void) {
    this.onBrushWheel = onBrushWheel;
  }

  /** The meshes by number the server now hands out otherwise (it says which: only it knows what moves with a change), its list in that
      revision: those loaded are fetched anew. The changes aren't reckoned here: there is one reckoning, the server's, which Save uses too. */
  refreshMeshes(meshes: number[], revision: number) {
    this.draft = revision;
    // (a preview taken over: what showed it, whether or not the server names it. One still in place goes on again over what comes: takeVertices)
    const all = new Set(this.previewShown.size ? meshes : [...meshes, ...this.previewed]);
    if (!this.previewShown.size) this.previewed.clear();
    if (!all.size) return;
    this.heightsVersion++;
    for (const i of all) void this.refresh(i);
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
    try {
      const buf = await this.refreshes(() => fetchBytes(
        `/api/editor/${encodeURIComponent(this.trackName)}/mesh/${i}?r=${this.data!.revision}&d=${this.draft}`, signal));
      if (mine === this.token && m.userData.asked === asked) this.takeVertices(m, buf);
    } catch (e) {
      // (another track was asked for: nothing to say. Else the picture is behind what is kept: it mustn't look as if it were up to date)
      if (mine === this.token && !signal.aborted && m.userData.asked === asked) this.onViewFailed((e as Error).message);
    }
  }

  /** The mesh's vertices from bytes as a mesh is handed out; its triangles stay, with what is left out of them. */
  private takeVertices(m: THREE.Mesh, buf: ArrayBuffer) {
    const g = m.geometry, info = m.userData.info as MeshInfo;
    const data = (g.getAttribute("position") as THREE.InterleavedBufferAttribute).data;
    data.array.set(new Float32Array(buf, 0, info.vertices * FLOATS_PER_VERTEX));
    data.needsUpdate = true;
    this.underPreview.delete(info.i);       // (what it covered is no more: what lies under it is what just came)
    fitSphere(g, info);
    g.boundsTree?.refit();
    this.laidOver(info.i);
    if (this.marked) this.markDue = true;
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

  /** The ring on the ground, of the brush's true size, in the colour of the way it goes; hidden over what it can't paint. */
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
      (this.ring.material as THREE.LineBasicMaterial).color.set(this.brush.lower !== turned ? LOWER_COLOUR : RAISE_COLOUR);
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
      this.stroke = {samples: [[at.x, at.z, 0]], lower: this.brush.lower !== e.shiftKey, at: now, asked: now, asking: false,
                     look: `${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`, timer: setInterval(() => this.sample(), SAMPLE_EVERY_MS)};
      el.setPointerCapture(e.pointerId);
    });
    for (const type of ["keydown", "keyup"] as const) {     // (Alt with the wheel: alone, some browsers then go to their menu)
      el.addEventListener(type, e => {
        if (this.brush && e.key === "Alt") e.preventDefault();
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
      const {samples, lower, timer} = this.stroke;
      clearInterval(timer);
      this.stroke = null;
      this.keepPreview();
      this.onStroke(samples, lower);
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
      menu (a right drag moves the view, as before). With the brush set the left button is the brush's. */
  private clicks(el: HTMLElement) {
    let from: {x: number; y: number; button: number} | null = null;
    el.addEventListener("pointerdown", e => {
      // (a press on a pin is the pin's: it is dragged, a right click takes it away)
      from = (e.button === 0 && !this.brush && this.pinAt(e, el) < 0) || e.button === 2 ? {x: e.clientX, y: e.clientY, button: e.button} : null;
    });
    el.addEventListener("pointermove", e => {
      if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) >= CLICK_PX) from = null;
    });
    el.addEventListener("pointerup", e => {
      const pin = from?.button === 2 && e.button === 2 ? this.pinAt(e, el) : -1;
      if (pin >= 0) this.onPinTaken(pin);
      else if (from && e.button === from.button) {
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
    if (!hovered) {
      this.unpick();
      return null;
    }
    const bounds = hovered.id ? this.boundsOf(hovered.id) : null;
    this.mark(bounds);
    const foot = bounds?.getCenter(new THREE.Vector3()).setY(bounds.min.y);
    const picked = {id: hovered.id, afterBuild: !hovered.id && IN_THE_LIST.test(hovered.object), kind: hovered.kind, sprite: hovered.sprite,
                    sort: hovered.sort, position: (foot ? [foot.x, foot.y, foot.z] : hovered.at) as [number, number, number], left: e.button === LEFT_BUTTON,
                    road: hit && ROAD.test(hit.object.name) ? [hit.point.x, hit.point.z] as [number, number] : null};
    this.onPick(picked);
    return picked;
  }

  /** onMenu gets where a right click asks for the picked object's menu, in the view's pixels, with the view's size. */
  setMenu(onMenu: (at: MenuAt) => void) {
    this.onMenu = onMenu;
  }

  /** Every object of a sort the view shows gets a frame (listed: the build's sort; tree: an atlas image), null: none. */
  setMarked(marked: Marked | null) {
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
    const boxes = this.marked.tree ? this.treesOf(this.marked.sort) : this.listedOf(this.marked.sort);
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
    return [...byId.values()].map(pieces => this.shownBounds(pieces)).filter(box => box !== null);
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

  /** A frame around bounds, none for null. */
  private mark(bounds: THREE.Box3 | null) {
    if (this.pickedBox) {
      this.scene.remove(this.pickedBox);
      this.pickedBox.dispose();
      this.pickedBox = null;
    }
    if (bounds) {
      this.pickedBox = new THREE.Box3Helper(bounds, new THREE.Color(PICKED_COLOUR));
      (this.pickedBox.material as THREE.LineBasicMaterial).depthTest = false;     // (seen through what stands before it)
      this.scene.add(this.pickedBox);
    }
    this.dirty = true;
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
    this.onHover(hit ? this.describe(hit) : null);
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
    return {
      id: number !== null ? `${info.base}#${number}` : listed,
      kind: listed ? kindName(tile!.kinds[k]) : kindOf(info.name),
      sprite: isBillboard && uv ? spriteAt(data.atlas, uv[0], uv[1]) : null,
      sort: listed ? sortOf(tile!, k) : null,
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
      doesn't keep it moving. */
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

  /** The camera moved seconds along the keys held, level however it looks: W, S the way it looks, A, D to its side. Its height over the
      ground stays, hills pass under it. */
  private fly(seconds: number) {
    const c = this.camera.position;
    const look = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const side = new THREE.Vector3().crossVectors(look, this.camera.up).normalize();
    const way = new THREE.Vector3();
    if (this.flying.has("KeyW")) way.add(look);
    if (this.flying.has("KeyS")) way.sub(look);
    if (this.flying.has("KeyD")) way.add(side);
    if (this.flying.has("KeyA")) way.sub(side);
    if (!way.lengthSq()) return;
    // (the height from the last frame's query: one ground query a frame, the costliest thing here)
    const speed = Math.min(FLY_MAX_M_S, Math.max(FLY_MIN_M_S, this.height * FLY_PER_M));
    c.add(way.normalize().multiplyScalar(speed * this.settings.fly / NORMAL_SPEED * seconds));
    this.keepInArea();
    const ground = this.groundBelow();
    if (ground !== null) c.y += (ground + this.clearance - c.y) * (1 - Math.exp(-seconds / FOLLOW_GROUND_S));
    this.settle(ground);
    this.moved();
  }

  /** The camera reach away from pivot, its view turned by yaw to the left and tilted by pitch upwards (rad). It may stand beyond the
      area (pivot lies in it); where a height limit keeps it from going all the way the view still turns, pivot then off its middle. */
  private turn(pivot: THREE.Vector3, reach: number, yaw: number, pitch: number) {
    const look = this.camera.getWorldDirection(new THREE.Vector3());
    const s = new THREE.Spherical().setFromVector3(look);
    s.theta += yaw;
    s.phi = THREE.MathUtils.clamp(s.phi - pitch, Math.PI / 2 + LOOK_DOWN_MIN_RAD, Math.PI - LOOK_DOWN_MIN_RAD);
    look.setFromSpherical(s);
    const c = this.camera.position;
    c.copy(pivot).addScaledVector(look, -reach);
    this.keepHeight(this.groundBelow());
    this.clearance = this.height;
    this.camera.lookAt(c.clone().add(look));
    this.moved();
  }

  /** The first ground a ray meets. */
  private groundAlong(origin: THREE.Vector3, direction: THREE.Vector3) {
    this.down.set(origin, direction);
    return timed("map2lap.ground", () => this.down.intersectObjects(this.grounds, false)[0]);
  }

  /** The height of the ground under the camera, null while none is loaded there. */
  private groundBelow() {
    const c = this.camera.position;
    return this.groundAlong(new THREE.Vector3(c.x, c.y + VIEW_M, c.z), new THREE.Vector3(0, -1, 0))?.point.y ?? null;
  }

  /** How far along direction, which goes down, the height of the last ground lies. */
  private wayDown(direction: THREE.Vector3) {
    return Math.max(this.camera.position.y - this.lastGround, 0) / -direction.y;
  }

  /** How far ahead the point counts that the view turns around: at a flat look over a plain that is many km. */
  private reachOfLook() {
    return Math.max(TURN_REACH_MIN_M, this.height * TURN_REACH);
  }

  /** point moved into the area, x and z. */
  private intoArea(point: THREE.Vector3) {
    const {minX, maxX, minZ, maxZ} = this.area;
    point.x = THREE.MathUtils.clamp(point.x, minX - AREA_MARGIN_M, maxX + AREA_MARGIN_M);
    point.z = THREE.MathUtils.clamp(point.z, minZ - AREA_MARGIN_M, maxZ + AREA_MARGIN_M);
  }

  /** The camera moved as far as the middle of its view lies beyond the area: that is what can't leave, not the camera, which may have
      to stand beyond it to look back at the track. */
  private keepInArea() {
    const c = this.camera.position, look = this.camera.getWorldDirection(new THREE.Vector3());
    const middle = c.clone().addScaledVector(look, Math.min(this.wayDown(look), this.reachOfLook())), within = middle.clone();
    this.intoArea(within);
    c.x += within.x - middle.x;
    c.z += within.z - middle.z;
  }

  /** The camera within the area and its heights over the ground, known or looked up. */
  private settle(known?: number | null) {
    this.keepInArea();
    this.keepHeight(known === undefined ? this.groundBelow() : known);
  }

  /** The camera within its heights over the ground (from below, the ground is not drawn: a hillside would turn into empty sky). */
  private keepHeight(ground: number | null) {
    if (ground !== null) this.lastGround = ground;
    const c = this.camera.position;
    c.y = THREE.MathUtils.clamp(c.y, this.lastGround + ABOVE_GROUND_M, this.lastGround + this.highest);
    this.height = c.y - this.lastGround;
  }

  /** Back to the first view, behind the start. */
  home() {
    if (!this.data) return;
    this.placeCamera(this.data);
    this.moved();
  }

  /** The camera was moved: what is shown and what the mouse points at are to be looked at again. */
  private moved() {
    this.camera.updateMatrixWorld();
    this.dirty = true;
    this.hoverDue = true;
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
    if (this.shown && this.zoomLeft) this.glideZoom(seconds);
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
    if (this.markDue && now - this.lastMark >= this.markEvery) {
      const from = performance.now();
      this.frameMarked();
      this.lastMark = now;      // (a long track's frames take long: at most a quarter of the time while meshes load)
      this.markEvery = Math.max(MARK_EVERY_MS, 4 * (performance.now() - from));
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
    this.parts.clear();
    this.byNumber.clear();
    this.objectPieces = new Map();
    this.belonging = new Map();
    this.mark(null);
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
      const signal = this.loading.signal;
      t = textureTurn(() => fetchBytes(`/api/editor/${encodeURIComponent(name)}/texture/${i}?r=${data.revision}`, signal)
        .then(buf => makeTexture(buf, data.textures[i].name, anisotropy)))
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
    if (info.base !== null && info.base !== undefined) {
      if (!this.parts.has(info.base)) this.parts.set(info.base, []);
      this.parts.get(info.base)!.push(m);
    }
    this.byNumber.set(info.i, m);
    this.laidOver(info.i);
    for (const piece of this.listedOut.get(info.i) ?? []) this.leaveOutIn(m, piece, true);
    if (info.base !== null && info.base !== undefined) {
      for (const id of this.billboardsOut.get(info.base) ?? []) {
        for (const piece of this.piecesOf(id)) if (piece.mesh === info.i) this.leaveOutIn(m, piece, true);
      }
      this.leaveOutSorts(m);
    }
    if (this.marked) this.markDue = true;
    if (GROUND.test(info.name)) {
      this.usedBytes += speedUpRays(m);
      this.grounds.push(m);
      const box = m.geometry.boundingBox!, c = this.camera.position;
      if (c.x >= box.min.x && c.x <= box.max.x && c.z >= box.min.z && c.z <= box.max.z) this.settle();    // (it may have got below it)
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
    this.camera.position.copy(at).addScaledVector(forward, -START_BACK_M).add(new THREE.Vector3(0, START_UP_M, 0));
    this.camera.lookAt(at);
    this.camera.updateMatrixWorld();
    this.clearance = this.height = START_UP_M;
    this.lastGround = at.y;
    this.zoomLeft = 0;
    this.area = trackArea(data.meshes.filter(m => !FAR.test(m.name)));
    const {minX, maxX, minZ, maxZ} = this.area;
    this.highest = Math.min(HIGHEST_MAX_M, Math.max(HIGHEST_MIN_M, maxX - minX, maxZ - minZ));
  }
}
