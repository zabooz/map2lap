// How the 3D view moves: the Editor settings' sliders. No three.js here: the settings load before the 3D view does.

export interface Controls {
  fly: number;          // % of the fastest: W A S D
  look: number;         // the wheel held
  zoom: number;         // the wheel
  invertLook: boolean;  // the wheel held: dragging up looks down
  memoryGb: number;     // what the 3D view may take for a track, about (view.ts counts it)
}

export type SpeedName = "fly" | "look" | "zoom";

export const NORMAL_SPEED = 50;    // the slider's value that means the view's speeds as view.ts has them

// Memory: 8 GB hold a track of about 4 GB (each mesh and texture counts about twice: view.ts). A browser tab's own limit is
// not known here and differs per machine: a setting too high for the machine ends in a crashed tab, so it is the user's call.
export const DEFAULT_CONTROLS: Controls = {fly: NORMAL_SPEED, look: NORMAL_SPEED, zoom: NORMAL_SPEED, invertLook: false, memoryGb: 8};
export const SPEED_RANGE = [10, 100, 10] as const;     // % from, to, step: a fifth of the normal speed for a close look, twice across a track
export const MEMORY_RANGE = [1, 32, 1] as const;       // GB from, to, step
export const SPEEDS: {name: SpeedName; label: string}[] = [
  {name: "fly", label: "Move (W A S D)"},
  {name: "look", label: "Turn and tilt (hold the wheel)"},
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
