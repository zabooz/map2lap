// What the server (src/server.py) answers.
export type LatLon = [number, number];
/** [south, west, north, east] */
export type Box = [number, number, number, number];
export type Tab = "new" | "mine" | "edit";
export type Mode = "route" | "area";
export type TrackGroup = "built" | "edited";

export interface Track {
  name: string;
  title: string;
  version?: string;
  kn5_bytes: number | null;
  build_files: boolean;
  edited?: boolean;             // saved in the Editor: never built again in its place, never old
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
}

export interface Progress {
  phase: string;
  done: number;
  total: number;
}

export interface BuildResult {
  name: string;
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

export interface CodeContent {
  title?: string;
  area?: Box;
  width?: number;
  points?: LatLon[];
}
