// What the server (src/server.py) answers.
export type LatLon = [number, number];
/** [south, west, north, east] */
export type Box = [number, number, number, number];
export type Tab = "new" | "mine" | "edit";
export type Mode = "route" | "area" | "circuit";
export type TimedMode = "circuit" | "route";
export type TrackGroup = "built" | "edited";
export type TerrainCell = 1 | 2;
export interface BuildOptions {terrain_cell_m: TerrainCell; parked_cars: boolean; tree_spacing_m: number; ground_quality: "sd" | "hd";}
export interface BestLap {car: string; time_ms: number;}

export interface Track extends Partial<BuildOptions> {
  name: string;
  title: string;
  kind?: Mode;
  version?: string;
  kn5_bytes: number | null;
  build_files: boolean;
  edited?: boolean;             // saved in the Editor: never built again in its place, never old
  saved?: number | null;        // the Editor's last Save, seconds
  draft?: number;
  outdated: boolean;
  current_copy: string | null;
  area: Box | null;
  area_m: [number, number] | null;
  length_m: number;
  width: number | null;
  tiles: number;
  built: number | null;
  line: LatLon[] | null;
  points: LatLon[];
  code?: string;
  best_lap?: BestLap;
  ab_timing?: boolean;
}

export interface Progress {
  phase: string;
  done: number;
  total: number;
  step: number;
  steps: number;
}

export interface BuildResult {
  name: string;
  title?: string;
  kind?: Mode;
  ab_timing?: boolean;
  kn5_bytes: number;
  seconds: number;
  tiles: number;
  area_m: [number, number] | null;
  length_m: number;
}

export interface BuildStatus {
  state: "idle" | "running" | "stopping" | "stopped" | "done" | "error";
  log?: string[];
  result?: BuildResult | null;
  error?: string | null;
  progress?: Progress | null;
  started?: number | null;
  elapsed?: number | null;
}

export interface Settings {
  ac_path: string;
  ac_ok: boolean;
  clean: boolean;
  cores: number;
  cache_gb: number;
  car: string | null;
  debug_app: boolean;
  weather_effects: boolean;
  threads: number;
  version: string;
}

export interface Release {
  newer: boolean;
  can_install: boolean;
  version?: string;
  url?: string;
}

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface CodeContent extends Partial<BuildOptions> {
  title?: string;
  kind?: Mode;
  area?: Box;
  width?: number;
  points?: LatLon[];
}
/** Editor loading: unknown amount is null, no active load is undefined; otherwise a fraction of completed tasks. */
/** What a track's loading says. progress: undefined when done, null while how far is not known. first: its sections for selecting
    are computed now (a first opening). failed: why it could not load. limited: the memory limit cut it short. */
export interface EditorLoadStatus extends LoadAbout { text: string; progress?: number | null; }
export interface LoadAbout { first?: boolean; failed?: string; limited?: boolean; }
