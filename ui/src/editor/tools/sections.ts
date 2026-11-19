// Connected surface sections a click takes whole: a railway bridge span or rail section, a sidewalk with what stands on it, a
// guardrail with its collision. The server finds the section (app/tracksurfaces.py); Select shows it, Delete removes it.
import {post} from "../../api";
import type {Removed} from "../state/edits";
import type {SurfaceSelection} from "../scene/surfaces";
import type {SurfaceCut} from "../scene/surfaceCuts";
import type {Picked} from "../types";

export const RAIL_BRIDGE = /^(?:nocol_rail_|1(?:GRAVEL|WALL)_railcol_)/;
const SIDEWALK = /^nocol_(?:walk_|guardrail_)/;

export type SectionKind = "rail" | "sidewalk" | "guardrail";

/** A found section: its highlight, its triangles and the objects standing on it (a sidewalk's). */
export interface Section {kind: SectionKind; selection: SurfaceSelection; cuts: SurfaceCut[]; objects: Removed[]}

/** The kind of section the picked mesh belongs to, null for none. Pure. */
export function sectionKind(p: Picked | null): SectionKind | null {
  const mesh = p?.inspection?.hovered.object;
  if (!mesh) return null;
  if (SIDEWALK.test(mesh)) return mesh.startsWith("nocol_guardrail_") ? "guardrail" : "sidewalk";
  return RAIL_BRIDGE.test(mesh) ? "rail" : null;
}

/** What is said about a section of each kind: while asked, none found, deleted at once, already deleted, selected, and on Select's bar. */
export const SECTION_TEXT: Record<SectionKind, {selecting: string; none: string; deleted: string; already: string; selected: string; bar: string}> = {
  rail: {selecting: "Selecting railway section…", none: "No railway section found here", deleted: "Railway section deleted. Ctrl+Z restores it.",
    already: "Railway section was already deleted.", selected: "Railway section selected. Delete removes its rails, bed and collision; Ctrl+Z restores it.",
    bar: "Railway section selected with rails, bed and collision faces."},
  sidewalk: {selecting: "Selecting sidewalk…", none: "No sidewalk section found here", deleted: "Sidewalk section deleted. Ctrl+Z restores it.",
    already: "Sidewalk section was already deleted.",
    selected: "Sidewalk section selected. Delete removes its visible and collision parts and objects; Ctrl+Z restores them.",
    bar: "Sidewalk section selected with curb, collision and objects standing on it."},
  guardrail: {selecting: "Selecting guardrail…", none: "No guardrail section found here", deleted: "Guardrail section deleted. Ctrl+Z restores it.",
    already: "Guardrail section was already deleted.", selected: "Guardrail section selected. Delete removes its visible and collision parts; Ctrl+Z restores them.",
    bar: "Guardrail section selected with its collision faces."},
};

/** The section at p of that kind, asked against the draft's base: the section, or why there is none. */
export async function findSection(name: string, base: string | null, p: Picked, kind: SectionKind): Promise<Section | {error: string}> {
  const url = `/api/editor/${encodeURIComponent(name)}/${kind === "rail" ? "railbridge" : kind}`;
  // (the railway query takes AC x, z, height; the sidewalk and guardrail ones a point as picked and the mesh)
  const body = kind === "rail" ? {base, point: [p.position[0], p.position[2], p.position[1]]}
    : {base, point: [p.position[0], p.position[1], p.position[2]], mesh: p.inspection!.hovered.object};
  const answer = await post<{selection?: SurfaceSelection; cuts?: SurfaceCut[]; objects?: Removed[]}>(url, body);
  if (answer.error || !answer.selection || !answer.cuts?.length) return {error: answer.error ?? SECTION_TEXT[kind].none};
  return {kind, selection: answer.selection, cuts: answer.cuts, objects: kind === "rail" ? [] : answer.objects ?? []};
}

/** A found section shown: selected, highlighted, then said so. current: whether its pick is still the newest; a pick that takes
    over while the highlight is drawn keeps this section's notes away. */
export async function showSection(found: Section, {current, select, highlight, note}: {current: () => boolean; select: (found: Section) => void;
  highlight: (selection: SurfaceSelection) => Promise<unknown>; note: (text: string) => void}) {
  select(found);
  await highlight(found.selection).catch(error => { if (current()) note(String(error)); });
  if (current()) note(SECTION_TEXT[found.kind].selected);
}
