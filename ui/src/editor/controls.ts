// How the 3D view moves: the Editor settings' sliders. No three.js here: the settings load before the 3D view does.

export interface Controls {
  fly: number;          // % of the normal speed: W A S D
  look: number;         // the wheel held
  orbit: number;        // left drag
  move: number;         // right drag
  zoom: number;         // the wheel
  invertLook: boolean;  // the wheel held: dragging up looks down
  memoryGb: number;     // what the 3D view may take for a track, about (view.ts counts it)
}

export type SpeedName = "fly" | "look" | "orbit" | "move" | "zoom";

// Memory: 4 GB hold a track of about 2 GB (each mesh and texture counts about twice: view.ts). A browser tab's own limit is
// not known here and differs per machine: a setting too high for the machine ends in a crashed tab, so it is the user's call.
export const DEFAULT_CONTROLS: Controls = {fly: 100, look: 100, orbit: 100, move: 100, zoom: 100, invertLook: false, memoryGb: 4};
export const SPEED_RANGE = [10, 500, 10] as const;     // % from, to, step: a tenth for a close look, five times across a track
export const MEMORY_RANGE = [1, 32, 1] as const;       // GB from, to, step
export const SPEEDS: {name: SpeedName; label: string}[] = [
  {name: "fly", label: "Fly (W A S D)"},
  {name: "look", label: "Look around (hold the wheel)"},
  {name: "orbit", label: "Orbit (left drag)"},
  {name: "move", label: "Move (right drag)"},
  {name: "zoom", label: "Zoom (wheel)"},
];

/** The controls stored as text: what is missing, broken or out of range takes its default. Pure. */
export function parseControls(text: string | null): Controls {
  let got: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(text ?? "{}");
    if (parsed && typeof parsed === "object") got = parsed;
  } catch { /* (broken: the defaults) */ }
  const out = {...DEFAULT_CONTROLS};
  for (const {name} of SPEEDS) {
    const v = got[name];
    if (typeof v === "number" && Number.isFinite(v)) out[name] = Math.min(SPEED_RANGE[1], Math.max(SPEED_RANGE[0], v));
  }
  if (typeof got.invertLook === "boolean") out.invertLook = got.invertLook;
  const memory = got.memoryGb;
  if (typeof memory === "number" && Number.isFinite(memory)) out.memoryGb = Math.min(MEMORY_RANGE[1], Math.max(MEMORY_RANGE[0], memory));
  return out;
}
