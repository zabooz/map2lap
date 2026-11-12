export const MODEL_CATEGORIES = [["tree", "Trees"], ["bush", "Bushes"], ["grass", "Grass"], ["flower", "Flowers"],
  ["plant", "Plants"], ["rock", "Rocks"], ["vehicle", "Vehicles"], ["building", "Buildings"], ["prop", "Street furniture"], ["other", "Other"]] as const;
import type {TrackCost} from "./ModelCost";

export interface PreparedModel {
  token: string; geometry: {bounds: number[][]; track_cost?: TrackCost}; warnings?: string[]; lighting_options?: string[];
}
export interface PreparedGeometry {
  geometry: PreparedModel['geometry'];
  simplification: 'original' | 'no_gain' | 'limited' | 'target_reached';
}
let modelPreparation: Promise<unknown> = Promise.resolve();

/** Queue model preparation across cancelled dialogs; finish the server's current upload before starting another. */
export function prepareModelFile(file: File, signal: AbortSignal): Promise<PreparedModel> {
  const task = modelPreparation.catch(() => {}).then(() => {
    signal.throwIfAborted();
    // The dialog discards a cancelled answer; aborting fetch could leave the server still holding its preparation lock.
    return libraryJson<PreparedModel>(`/api/library/model-imports?filename=${encodeURIComponent(file.name)}`, {
      method: "POST", headers: {"Content-Type": "application/x-map2lap-glb"}, body: file,
    });
  });
  modelPreparation = task;
  return task;
}

/** Library metadata stays small; maps are fetched only when a material is used. */
export interface MaterialSummary {
  id: string;
  name: string;
  category: string;
  tags: string[];
  repeat: [number, number];
  variation?: boolean;
  source: {format: string; size: [number, number]; alpha: boolean; bytes: number};
  prepared: {version: number; size: [number, number]; format: string; bytes: number};
}

export interface LibraryMaterial extends MaterialSummary {
  source_url: string;
  license: string;
  maps: {colour: MaterialMap; normal?: MaterialMap; roughness?: MaterialMap};
}

export type MaterialMapRole = "colour" | "normal" | "roughness";
interface MaterialMap {file: string; filename: string; sha256: string}

export interface PreparedImport {
  token: string;
  filename: string;
  source: MaterialSummary["source"];
  prepared: MaterialSummary["prepared"];
}

export const MATERIAL_CATEGORIES = [
  ["grass", "Grass"], ["asphalt", "Asphalt"], ["rock", "Rock"], ["soil", "Soil"], ["sand", "Sand"],
  ["snow", "Snow"], ["wall", "Wall"], ["wood", "Wood"], ["other", "Other"],
] as const;

export async function libraryJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json() as T & {error?: string};
  if (!response.ok) throw new Error(result.error ?? "Could not read the material library");
  return result;
}

let preparation: Promise<unknown> = Promise.resolve();

/** The server prepares one image at a time. Finish an active upload before starting another, even after a dialog closes. */
export function prepareMaterialImage(file: File, role: MaterialMapRole, signal: AbortSignal): Promise<PreparedImport> {
  const task = preparation.catch(() => {}).then(() => {
    signal.throwIfAborted();
    // Aborting fetch would release this queue before server-side preparation finishes.
    return libraryJson<PreparedImport>(`/api/library/imports?${new URLSearchParams({filename: file.name, role})}`, {
      method: "POST", headers: {"Content-Type": "application/x-map2lap-image"}, body: file,
    });
  });
  preparation = task;
  return task;
}

export const materialPreview = (id: string, staged = false) => `/api/library/${staged ? "imports" : "materials"}/${id}/preview`;

/** Suggested physical height follows width until the user supplies a separate height. Pure. */
export const repeatHeight = (width: string, size?: [number, number]) =>
  size ? String(Number((Number(width) * size[1] / size[0]).toFixed(3))) : width;

/** Colour cutouts can be stored for future models, but the current ground shader requires opaque colours. Pure. */
export const groundTextureProblem = (material: {source: {alpha: boolean}} | null, reason: string | null) =>
  material?.source.alpha ? "Ground textures require an opaque colour image." : reason;
