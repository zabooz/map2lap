import type {SurfacePoint} from "./scene/surfaces";
import type {ModelInstance} from "./state/edits";
import type {ObjectList} from "./scene/inspect";
import type {ColourLayers, ColourSplat} from "./scene/colourBlend";

/** What the mouse points at (the hover box). */
export interface Hovered {
  id: string | null;            // (a single object's, which can be deleted)
  kind: string;
  sort: string | null;          // (a listed object's or a tree's model: what deleting all of a sort goes by)
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
  treefx?: {model: string; triangles: number; height: number; width: number; foot: [number, number]};   // (a TreeFX tree's: its .bin model, its triangles at the LOD drawn, its size and foot)
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

/** The brush as it is set: its size on the ground, the colour of its ring as it is and with Shift held. marks: what a stroke where the
    ring stands would delete is framed in its colour (Delete's brush). */
export interface Brush {
  radius: number;
  colour: string;
  turnedColour: string;
  marks?: boolean;
}

/** What is held with the wheel over the view for a tool to take it. */
export type WheelKeys = "shift" | "ctrl" | "alt" | "ctrlAlt";

/** All of a sort framed: a listed one's sort or a tree's model. */
export interface Marked {
  sort: string;
}

export interface MeshInfo {
  model?: {instance: string; asset: string; primitive: number; material: number | null; at: number[]; scale: number};
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
}

export interface MaterialInfo {
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
  specular?: number;            // ksSpecular and ksSpecularEXP: its gloss (classicLight.classicGround)
  specular_exp?: number;
  splat?: ColourSplat;
  source?: MaterialInfo;
}

export interface TrackIndex {
  wall_hidden?: [number, number, number][];
  models?: ModelInstance[];
  model_assets?: Record<string, {url: string; name?: string; native_tree?: {file: string}}>;
  model_matrices?: Record<string, number[]>;
  model_replacements?: string[];
  treefx?: number;                 // how many TreeFX trees the served list holds (treeFx.ts draws them)
  paint_errors?: string[];
  paints?: string[];
  surface_tiles?: string[];
  surface_unprepared?: number;     // (tiles whose sections a first opening computes)
  draft?: number;
  copy_revision?: string;
  revision: string;             // the state of the file its numbers hold for
  meshes: MeshInfo[];
  materials: MaterialInfo[];
  textures: {name: string; size: number; source_size?: number; version?: string; linear?: boolean; layers?: ColourSplat}[];
  start: {pos: [number, number, number]; forward: [number, number, number]} | null;
  anchor: [number, number] | null;
  route: number[][];
  objects: Record<string, ObjectList>;
}

/** A TreeFX tree as drawn (scene/treeFx.ts): its model, where the draft puts it and where it stands without the draft, its turn and size. */
export interface TreeFxTree {
  model: string;
  pos: number[];
  base: number[];
  angle: number;
  size: number;
  width: number;
}

/** A TreeFX tree Copy added to the draft (trackedits "trees"): its id under a number the track never gave, its model and placement. */
export interface AddedTree {
  id: string;
  model: string;
  pos: number[];
  angle: number;
  size: number;
  width: number;
}

/** What a draft answer changed of the TreeFX trees (trackedits: tracktrees.changed): those that stand otherwise, those added gone. */
export interface TreeFxChange {
  trees: Record<string, TreeFxTree>;
  gone: string[];
}
