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
  maps: {colour: {file: string; filename: string; sha256: string}};
}

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

export const materialPreview = (id: string, staged = false) => `/api/library/${staged ? "imports" : "materials"}/${id}/preview`;

/** Suggested physical height follows width until the user supplies a separate height. Pure. */
export const repeatHeight = (width: string, size?: [number, number]) =>
  size ? String(Number((Number(width) * size[1] / size[0]).toFixed(3))) : width;

/** Colour cutouts can be stored for future models, but the current ground shader requires opaque colours. Pure. */
export const groundTextureProblem = (material: {source: {alpha: boolean}} | null, reason: string | null) =>
  material?.source.alpha ? "Ground textures require an opaque colour image." : reason;
