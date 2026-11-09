// The Editor tab's 3D view of a built track (src/app/trackview.py hands out its kn5's parts). W A S D and right drag move
// over the ground, the wheel zooms towards the mouse, held it turns and tilts around the view's middle, as in a building game. Meshes
// load nearest first, so the spot in view comes first on a long track. A click picks what is under the mouse; with Move on, a press picks
// it and a drag takes it along over the ground.
import * as THREE from "three";
import {DDSLoader} from "three/addons/loaders/DDSLoader.js";
import {acceleratedRaycast, MeshBVH} from "three-mesh-bvh";
import {DEFAULT_CONTROLS, NORMAL_SPEED, type Controls} from "./controls";
import {nudgeVertices, STILL, type Nudge, type Placement} from "./placing";
import type {CopyPose} from "./copying";
import {groundTile, SurfaceOverlay, type SurfacePoint, type SurfaceSelection} from "./surfaces";
import {MaterialRegions} from "./materials";
import {ModelDraw} from "./modelDraw";
import {modelLight} from "./modelLighting";
import {bindLightShares, takesGroundLight} from "./lightShare";
import {NightSky} from "./nightSky";
import {lightAt, moonDirection, MOON_COLOUR, sunDirection, sunHeight, trackPlace} from "./sun";
import type {ModelInstance} from "./edits";
import {fetchBytes, fetchJson, MeshFetchError} from "./requests";
import {WeightBundles} from "./weightBundle";
import {GroundFrame, GroundLayer} from "./groundRender";
import {bindColourBlend, bindWorldColour, bindSplat, materialImages, type GroundMaterial, type ColourLayers, type ColourImage, type ColourSplat, type GroundTextureUpdate} from "./colourBlend";
import {placeOnRoute, routeMetres} from "./ride";
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
  all: {id: string; position: [number, number, number]}[];      // (what can be deleted of all that is picked now, this one and those Ctrl added to it)
  surface?: SurfacePoint;
  adding?: boolean;
  keeping?: boolean;           // a context click on the current object selection retains its marked groups
  whole?: boolean;
  inspection?: {hovered: Hovered; revision: string; texture: number | null; listed: boolean};
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

/** The brush as it is set: its size on the ground, the colour of its ring as it is and with Shift held. */
export interface Brush {
  radius: number;
  colour: string;
  turnedColour: string;
}

/** What is held with the wheel over the view for a tool to take it. */
export type WheelKeys = "shift" | "ctrl" | "alt" | "ctrlAlt";

/** All of a sort framed: a listed one's sort, or (tree) an atlas image. */
export interface Marked {
  sort: string;
  tree: boolean;
}

interface MeshInfo {
  model?: {instance: string; asset: string; primitive: number; material: number | null};
  copy?: boolean;
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

interface SplatImageEntry {
  done: Promise<THREE.Texture | null>; controller: AbortController; bytes: number; token: number;
  texture?: THREE.Texture; disposed: boolean;
}
interface SplatPending {keys: Set<string>; done: Promise<void>}

interface MaterialInfo {
  name: string;
  shader: string;
  texture: string | null;
  bright: number;
  ambient?: number;             // ksAmbient and ksDiffuse apart: how much of the sky's and of the sun's light it takes
  diffuse?: number;
  alpha_ref: number;
  blend: boolean;
  dual_layer?: ColourLayers;
  world_scale?: [number, number];
  splat?: ColourSplat;
  source?: MaterialInfo;
}

interface TrackIndex {
  models?: ModelInstance[];
  model_assets?: Record<string, {url: string}>;
  model_matrices?: Record<string, number[]>;
  model_replacements?: string[];
  paint_errors?: string[];
  paints?: string[];
  surface_tiles?: string[];
  draft?: number;
  copy_revision?: string;
  revision: string;             // the state of the file its numbers hold for
  meshes: MeshInfo[];
  materials: MaterialInfo[];
  textures: {name: string; size: number; source_size?: number; version?: string; linear?: boolean; layers?: ColourSplat}[];
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
const RIDE_AHEAD_M = 30, RIDE_TURN_S = 0.6;     // the ride looks at the route this far ahead and turns towards it this slowly: through a bend, not with each of its corners
const RIDE_TILT = 0.12;             // down from level by this share: the road ahead in the picture, and still the horizon
const RIDE_GLIDE_S = 0.15, RIDE_GLIDE_DONE_M = 0.05;      // a notch of the wheel along the route glides there this fast: no jump, and it can be followed
const RIDE_SETTLED = 1e-6, RIDE_SETTLED_M = 0.01;         // (its look, in the square of a unit vector's way, and its height: come to rest, under what can be seen)
const RIDE_TELL_EVERY_MS = 100;     // how often the page hears how far it is: a number to read, not to re-render with each frame
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
const LEFT_BUTTON = 0, LEFT_HELD = 1;
const NOT_MOVED = new Set(["power line"]);      // (placement.NOT_ALONE: a span goes where its poles go)
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

/** Generated mesh numbers are bound to their model draft or copy layout; source mesh numbers follow the KN5. Pure. */
function meshUrl(name: string, data: TrackIndex, info: MeshInfo) {
  return `/api/editor/${encodeURIComponent(name)}/mesh/${info.i}?r=${data.revision}`
    + (info.model ? `&d=${data.draft ?? 0}` : info.copy ? `&c=${data.copy_revision ?? ""}` : "");
}

/** Where a mouse event lies on el, each way from -1 to 1. Pure. */
function screenPoint(e: MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
}

/** Run at most most jobs; priority jobs take the next free slot before ordinary queued work. */
export function oneByOne(most: number) {
  const waiting: (() => void)[] = [], priorityWaiting: (() => void)[] = [];
  let running = 0;
  return async <T>(job: () => Promise<T>, priority = false) => {
    if (running >= most) await new Promise<void>(ok => (priority ? priorityWaiting : waiting).push(ok));
    else running++;
    try {
      return await job();
    } finally {
      const next = priorityWaiting.shift() ?? waiting.shift();
      // Transfer the occupied slot directly: a new arrival cannot take it before the queued job resumes.
      if (next) next(); else running--;
    }
  };
}

const textureTurn = oneByOne(TEXTURES_AT_A_TIME);

/** The texture with the file name file from its bytes. */
async function makeTexture(buf: ArrayBuffer, file: string, anisotropy: number, linear = false) {
  let t: THREE.Texture;
  if (/\.r16$/i.test(file)) {
    const header = new DataView(buf);
    if (header.getUint32(0, true) !== 0x5747324d) throw new Error("Invalid regional ground atlas");
    const width = header.getUint32(4, true), height = header.getUint32(8, true);
    if (!width || !height || buf.byteLength !== 12 + width * height * 2) throw new Error("Invalid regional ground dimensions");
    t = new THREE.DataTexture(new Uint16Array(buf, 12), width, height, THREE.RedFormat, THREE.HalfFloatType);
    t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
  } else if (/\.dds$/i.test(file)) {
    const d = new DDSLoader().parse(buf, true);
    if (d.format === THREE.RGBAFormat) {
      t = new THREE.DataTexture(d.mipmaps[0].data, d.width, d.height, THREE.RGBAFormat);
      t.mipmaps = d.mipmaps as ImageData[];
      t.generateMipmaps = false;
    } else {
      t = new THREE.CompressedTexture(d.mipmaps as ImageData[], d.width, d.height, d.format as THREE.CompressedPixelFormat);
    }
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
  t.colorSpace = linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
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
  private copyVersion = 0;
  private copyLoading: AbortController | null = null;
  private copyStamp: number[] = [];
  private groundVersion = 0;
  private copyGhost: THREE.Group | null = null;
  private copyRelease: (() => void) | null = null;
  private modelGhostVersion = 0;
  private modelLight: THREE.WebGLRenderTarget | null = null;
  private ambient = new THREE.AmbientLight();
  private sun = new THREE.DirectionalLight();
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
  private camera = new THREE.PerspectiveCamera(55, 1, 0.5, VIEW_M);
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
  private height = 0;                   // m above the ground, from the last ground query
  private clearance = START_UP_M;       // m above the ground it was left at: moving keeps to it
  private highest = HIGHEST_MIN_M;      // m above the ground it can go
  private area = trackArea([]);         // where the middle of its view can lie, x and z
  private lastGround = 0;               // the height of the last ground found under it: where none is, that counts as the ground
  private zoomLeft = 0;                 // notches of the wheel still to glide, towards zoomAim
  private zoomAim = new THREE.Vector3();
  private host: HTMLElement;
  private flying = new Set<string>();   // the fly keys held
  private ride: {metre: number; metres: number[]; left: number; moving: boolean} | null = null;    // the camera on the route: how far it is, the metres still to glide, whether it rides by itself
  private rideSpeed = 0;                // m a second
  private rideHeight = 0;               // m above the ground
  private rideTold = 0;                 // when the page last heard how far it is
  private onRideMoving: (moving: boolean) => void = () => {};
  private onRideMetre: (metre: number | null) => void = () => {};
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
    this.applyLight();
    this.down.firstHitOnly = true;      // (the ground's height: what lies further down of the same mesh is of no interest)
    this.turnAround(this.renderer.domElement);
    this.grabGround(this.renderer.domElement);
    this.zoomWheel(this.renderer.domElement);
    this.flyKeys(this.renderer.domElement);
    this.followMouse(this.renderer.domElement);
    this.clicks(this.renderer.domElement);
    this.moves(this.renderer.domElement);
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
    this.modelLight?.dispose();
    this.nightSky.dispose();
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
    this.groundFrame?.followLights();
    if (this.modelLight) this.modelDraw.setEnvironment(this.modelLight.texture, this.reflections());
    this.dirty = true;
  }

  /** The power of the models' reflections: they fade with the sky's light, full by day. */
  private reflections() { return this.ambient.intensity / lightAt(90).ambient; }

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
    this.placeCamera(data);
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
      // (Shift with the wheel is Smooth's: the brush has it for its way. Some browsers make it a sideways wheel: deltaX)
      const keys: WheelKeys | null = e.ctrlKey && e.altKey ? "ctrlAlt" : e.altKey ? "alt" : e.ctrlKey ? "ctrl" : e.shiftKey && this.wheelTaken ? "shift" : null;
      if ((this.brush || this.wheelTaken) && keys) {
        const notch = e.deltaY || e.deltaX;
        if (notch) this.onToolWheel(keys, notch < 0 ? 1 : -1);
        return;
      }
      this.stopRide();
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
      this.previewed.add(g.mesh);
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
      if (!this.picker.ray.intersectPlane(d.plane, at) || at.distanceTo(this.camera.position) > 2 * this.highest) return;    // (at the horizon)
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
    return this.groundAt(x, z) ?? this.lastGround;
  }

  /** The ground under an object, null outside the loaded terrain: moving there preserves its current height. */
  private groundAt(x: number, z: number) {
    return this.groundAlong(new THREE.Vector3(x, VIEW_M, z), new THREE.Vector3(0, -1, 0))?.point.y ?? null;
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
    const all = new Set(this.previewShown.size ? meshes : [...meshes, ...this.previewed]);
    if (!this.previewShown.size) this.previewed.clear();
    if (!all.size) return;
    this.heightsVersion++;
    for (const i of all) if (i >= 0) void this.refresh(i);
  }

  private detachModelMeshes() {
    for (const mesh of this.meshes.filter(m => (m.userData.info as MeshInfo).model)) {
      const info = mesh.userData.info as MeshInfo;
      this.scene.remove(mesh); mesh.geometry.dispose();
      if (this.byNumber.get(info.i) === mesh) this.byNumber.delete(info.i);
      this.usedBytes -= COPIES * meshBytes(info); this.materialAreas?.delete(info.i);
      this.previewed.delete(info.i); this.underPreview.delete(info.i);
    }
    this.meshes = this.meshes.filter(m => !(m.userData.info as MeshInfo).model);
  }

  /** Refresh the real appended model/material index while retaining the user's camera and active placement action. */
  private async reloadModels(retries = 2): Promise<number | null> {
    const mine = this.token, asked = ++this.modelTransformVersion, signal = this.loading.signal;
    let reserved = 0;
    try {
      const data = await fetchJson<TrackIndex>(`/api/editor/${encodeURIComponent(this.trackName)}/index`, signal);
      const added = data.meshes.filter(m => m.model), jobs = oneByOne(PARALLEL);
      const buffers = await Promise.all(added.map(info => jobs(() => fetchBytes(meshUrl(this.trackName, data, info), signal))));
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      const bytes = added.reduce((sum, info) => sum + COPIES * meshBytes(info), 0);
      if (!fits(this.usedBytes, bytes, this.settings.memoryGb)) throw new Error("The models exceed the Editor memory limit");
      this.usedBytes += bytes; reserved = bytes;
      if (data.models?.length) this.ensureModelLight();
      await this.modelDraw.sync(data.models ?? [], data.model_assets ?? {}, data.model_matrices ?? {});
      if (mine !== this.token || asked !== this.modelTransformVersion) return null;
      this.detachModelMeshes();
      const previousRemoved = this.removed;
      this.data = data;
      this.objectPieces = objectIndex(data.objects); this.belonging = childrenOf(data.objects);
      this.removed = this.wanted(); this.noteListedOut();
      for (const id of previousRemoved) if (!this.removed.has(id)) this.leaveOut(id, false);
      for (const id of this.removed) if (!previousRemoved.has(id)) this.leaveOut(id, true);
      added.forEach((info, i) => this.addMesh(this.trackName, data, info, buffers[i]));
      reserved = 0;
      for (const id of [...this.picks.keys()]) if (id.startsWith("instance_") && !data.objects[id.split("#")[0]]) this.dropPick(id);
      this.reframePicks(); this.onViewFailed(null); this.dirty = true; this.hoverDue = true;
      return added.length;
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
    this.copyGhost = null;
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

  /** A library preview has no draft instance yet; its decoded resources live only until placement mode ends. */
  async setModelGhost(model: {id: string; anchor: number[]; metres_per_unit: number}, place: (at: [number, number, number]) => void) {
    this.setCopy(null, place);
    const version = this.modelGhostVersion, holder = new THREE.Scene();
    const draw = new ModelDraw(holder, undefined, bytes => {
      if (bytes > 0 && !fits(this.usedBytes, bytes, this.settings.memoryGb)) return false;
      this.usedBytes += bytes; return true;
    }, false);
    this.copyRelease = () => draw.dispose();
    const transform = new THREE.Matrix4().makeScale(model.metres_per_unit, model.metres_per_unit, model.metres_per_unit)
      .multiply(new THREE.Matrix4().makeTranslation(-model.anchor[0], -model.anchor[1], -model.anchor[2]));
    try {
      draw.setEnvironment(this.ensureModelLight(), this.reflections());
      await draw.sync([{id: "ghost", asset: model.id}], {[model.id]: {url: `/api/library/models/${model.id}/original`}}, {ghost: transform.toArray()});
      if (version !== this.modelGhostVersion) { draw.dispose(); return; }
      const root = draw.instance("ghost")!, group = new THREE.Group();
      root.traverse(node => { if (node instanceof THREE.Mesh) for (const m of Array.isArray(node.material) ? node.material : [node.material]) {
        m.transparent = true; m.opacity *= .5; m.depthWrite = false;
      } });
      group.matrixAutoUpdate = false; group.add(root);
      this.copyGhost = group; this.copyFoot.set(0, 0, 0); this.copyStamp = [];
      this.scene.add(group); this.followCopy();
    } catch (error) { draw.dispose(); if (version === this.modelGhostVersion) this.onViewFailed((error as Error).message); }
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
    try {
      const buf = await this.refreshes(() => fetchBytes(meshUrl(this.trackName, this.data!, m.userData.info as MeshInfo), signal));
      if (mine === this.token && m.userData.asked === asked && this.byNumber.get(i) === m) this.takeVertices(m, buf);
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
    this.underPreview.delete(info.i);       // (what it covered is no more: what lies under it is what just came)
    // (what is being dragged stays where the mouse has it: the server's mesh has it where it was taken up)
    const dragged = this.dragging?.grabbed.filter(g => g.mesh === info.i) ?? [];
    if (dragged.length) this.dragOn(dragged);
    fitSphere(g, info);
    g.boundsTree?.refit();
    if (GROUND.test(info.name)) this.followRoadPins(g.boundingBox!);
    this.laidOver(info.i);
    if (this.marked) this.markDue = true;
    this.reframePicks();
    this.dirty = true;
    this.hoverDue = true;
  }

  private followRoadPins(bounds: THREE.Box3) {
    if (!this.pins?.length || !this.pinMarks) return;
    const positions = this.pinMarks.geometry.getAttribute("position");
    for (const [k, pin] of this.pins.entries()) {
      if (pin[0] < bounds.min.x || pin[0] > bounds.max.x || pin[2] < bounds.min.z || pin[2] > bounds.max.z) continue;
      const height = this.groundAt(pin[0], pin[2]);
      if (height === null) continue;
      pin[1] = height;
      positions.setY(k, height + BAND_UP_M);
      positions.needsUpdate = true;
    }
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
      from = (e.button === 0 && !this.brush && !this.moveTool && this.pinAt(e, el) < 0) || e.button === 2 ? {x: e.clientX, y: e.clientY, button: e.button} : null;
    });
    el.addEventListener("pointermove", e => {
      if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) >= CLICK_PX) from = null;
    });
    el.addEventListener("pointerup", e => {
      const pin = from?.button === 2 && e.button === 2 ? this.pinAt(e, el) : -1;
      if (pin >= 0) this.onPinTaken(pin);
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

  /** W A S D, while the view has the focus: typing in a field or the settings moves nothing, and a key let go elsewhere
      doesn't keep it moving. */
  private flyKeys(el: HTMLElement) {
    el.tabIndex = 0;
    el.addEventListener("pointerdown", e => {
      el.focus({preventScroll: true});
      if (e.button !== LEFT_BUTTON) this.stopRide();     // (the right button and the wheel held move the camera: a click can be made on the way)
    });
    el.addEventListener("keydown", e => {
      if (!FLY_KEYS.has(e.code) || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      this.stopRide();
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
    this.ride = null;
    this.onRideMoving(false);
    this.placeCamera(this.data);
    this.moved();
    this.tellRideMetre();
  }

  /** How the camera goes along the route: in m a second when it rides by itself, m above the ground. */
  setRide(speed: number, height: number) {
    this.rideSpeed = speed;
    this.rideHeight = height;
  }

  /** onMoving gets whether it rides by itself now, onMetre how far along the route it or the place nearest it is, null: there is no route. */
  setRideWatch(onMoving: (moving: boolean) => void, onMetre: (metre: number | null) => void) {
    this.onRideMoving = onMoving;
    this.onRideMetre = onMetre;
  }

  /** Tells the metre of the place on the route nearest the camera. */
  tellRideMetre() {
    const c = this.camera.position;
    this.onRideMetre(routeMetre(this.data?.route ?? [], c.x, c.z)?.metre ?? null);
  }

  /** The way the camera looks at metre of the route: at the route ahead, at its end the way it came, a little down. */
  private rideLook(metre: number, metres: number[]) {
    const route = this.data!.route, [x, z] = placeOnRoute(route, metres, metre), [ax, az] = placeOnRoute(route, metres, metre + RIDE_AHEAD_M);
    const [bx, bz] = placeOnRoute(route, metres, metre - RIDE_AHEAD_M);
    const way = ax !== x || az !== z ? new THREE.Vector3(ax - x, 0, az - z) : new THREE.Vector3(x - bx, 0, z - bz);
    return way.normalize().setY(-RIDE_TILT).normalize();
  }

  /** The camera on the route, put at the place nearest it if it isn't, or null if there is none to go along (an area has none). */
  private onRoute() {
    if (this.ride) return this.ride;
    const route = this.data?.route ?? [], c = this.camera.position;
    const metres = routeMetres(route), metre = routeMetre(route, c.x, c.z)?.metre;
    if (metre === undefined || !metres[metres.length - 1]) return null;
    this.flying.clear();
    this.zoomLeft = 0;
    this.ride = {metre, metres, left: 0, moving: false};
    [c.x, c.z] = placeOnRoute(route, metres, metre);
    const ground = this.groundBelow();
    if (ground !== null) this.lastGround = ground;
    c.y = this.lastGround + this.rideHeight;
    this.keepHeight(ground);
    this.camera.lookAt(c.clone().add(this.rideLook(metre, metres)));
    this.moved();
    this.onRideMetre(metre);
    return this.ride;
  }

  /** The camera that many metres further along the route, gliding there; whether there is a route. */
  rideBy(metres: number) {
    const ride = this.onRoute();
    if (ride) ride.left += metres;
    return !!ride;
  }

  /** It rides by itself from where it is, from the start again if that is the route's end, or stops doing so, on the route; whether there is a route. */
  toggleRide() {
    const ride = this.onRoute();
    if (!ride) return false;
    if (!ride.moving && ride.metre >= ride.metres[ride.metres.length - 1]) ride.metre = 0;
    ride.moving = !ride.moving;
    this.onRideMoving(ride.moving);
    return true;
  }

  /** The camera is off the route, if it was on it: it stays where it is, at that height. */
  stopRide() {
    if (!this.ride) return;
    this.ride = null;
    this.clearance = this.height;
    this.onRideMoving(false);
    this.tellRideMetre();
  }

  /** The camera seconds further along the route, over hills as the keys do, its look coming round to the route ahead. Standing and settled nothing is asked of the ground. */
  private rideOn(seconds: number) {
    const ride = this.ride!, {metres} = ride, end = metres[metres.length - 1], c = this.camera.position, now = performance.now();
    const glide = Math.abs(ride.left) < RIDE_GLIDE_DONE_M ? ride.left : ride.left * (1 - Math.exp(-seconds / RIDE_GLIDE_S));
    const was = ride.metre;
    ride.left -= glide;
    ride.metre = THREE.MathUtils.clamp(was + glide + (ride.moving ? this.rideSpeed * seconds : 0), 0, end);
    if (ride.metre <= 0 || ride.metre >= end) ride.left = 0;
    if (ride.moving && ride.metre >= end) {
      ride.moving = false;
      this.onRideMoving(false);
    }
    const look = this.camera.getWorldDirection(new THREE.Vector3()), wanted = this.rideLook(ride.metre, metres);
    const going = ride.metre !== was, turning = look.distanceToSquared(wanted) > RIDE_SETTLED, rising = Math.abs(c.y - this.lastGround - this.rideHeight) > RIDE_SETTLED_M;
    if (!going && !turning && !rising) return;
    if (going || rising) {
      [c.x, c.z] = placeOnRoute(this.data!.route, metres, ride.metre);
      const ground = this.groundBelow();
      if (ground !== null) c.y += (ground + this.rideHeight - c.y) * (1 - Math.exp(-seconds / FOLLOW_GROUND_S));
      this.keepHeight(ground);
    }
    this.camera.lookAt(c.clone().add(look.lerp(wanted, 1 - Math.exp(-seconds / RIDE_TURN_S))));
    this.moved();
    if (now - this.rideTold >= RIDE_TELL_EVERY_MS || !ride.left && !ride.moving) {     // (often enough to read, and the place it comes to rest at)
      this.rideTold = now;
      this.onRideMetre(ride.metre);
    }
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
    if (this.shown && this.ride) this.rideOn(seconds);
    if (this.shown && this.flying.size) this.fly(seconds);
    if (this.shown && this.zoomLeft) this.glideZoom(seconds);
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
      const renderStarted = performance.now();
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
    this.modelLight?.dispose(); this.modelLight = null;
    this.copyVersion++;
    this.copyLoading?.abort();
    this.stopRide();
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
    this.scene.add(m);
    try { this.groundLayers?.get(info.material)?.attach(m); }
    catch (error) { this.paintFailure = String((error as Error).message ?? error); this.onViewFailed(this.paintFailure); }
    this.meshes.push(m);
    if (info.base !== null && info.base !== undefined) {
      if (!this.parts.has(info.base)) this.parts.set(info.base, []);
      this.parts.get(info.base)!.push(m);
    }
    this.byNumber.set(info.i, m);
    if (!groundTile(info.name) && info.first_face == null && (this.objectPieces.has(info.i) || /^nocol_road_edge_dirt_/.test(info.name))) {
      this.materialAreas ??= new Map();
      this.materialAreas.set(info.i, new MaterialRegions(m.geometry.getAttribute("position"),
        (m.userData.indices ?? m.geometry.getIndex()!.array) as Uint16Array, this.objectPieces.get(info.i) ?? []));
    }
    void this.surfaceOverlay?.add(m).catch(e => this.surfaceFailed(String(e.message ?? e)));
    void this.roadRegionOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
    void this.roadInfluenceOverlay?.add(m).catch(e => this.onViewFailed(String(e.message ?? e)));
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
      this.groundVersion++;
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
