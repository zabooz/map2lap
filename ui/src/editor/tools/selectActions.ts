// What the Select bar offers for what is picked, the right-click menu's actions in sight.
import type {Picked} from "../types";
import type {Tool} from "./ToolPanel";

/** Ground has its texture changed; an object is replaced, moved, copied or deleted. Smooth road and Elevation are not offered: they
    work on the ground around too, and beside a picked surface they would look as if they changed just that. */
export type SelectAction = "texture" | "replace" | "move" | "copy" | "delete";

/** Each action's button: its label, the tool whose key it shares, its tooltip. */
export const ACTIONS: Record<SelectAction, {label: string; tool?: Tool; hint: string}> = {
  texture: {label: "Change texture…", hint: "Choose a texture for the selected ground (Alt)"},
  replace: {label: "Replace…", hint: "Replace the picked trees and bushes with a model from the library (Alt)"},
  move: {label: "Transform", tool: "move", hint: "Move, turn, raise and size what is picked"},
  copy: {label: "Copy", tool: "copy", hint: "Click to place copies of what is picked"},
  delete: {label: "Delete", tool: "delete", hint: "Delete what is picked; Ctrl+Z brings it back"},
};

/** The actions for picked, in the bar's order; texture only where the ground's paint can change (not a separate mesh's area). Pure. */
export function selectActions(picked: Pick<Picked, "id" | "road" | "surface"> | null): SelectAction[] {
  if (!picked) return [];
  if (picked.id) return ["replace", "move", "copy", "delete"];
  // (a material area of a separate mesh, the road verge, has no texture to change yet; it goes by its triangles)
  return !picked.surface ? [] : picked.surface.face === undefined ? ["texture"] : ["delete"];
}

/** The action Alt does among actions, in the bar's Alt place: the ground's texture or the objects' replacement. Pure. */
export function altAction(actions: SelectAction[]): SelectAction | null {
  return actions.find(action => action === "texture" || action === "replace") ?? null;
}

/** Where Smooth road starts when it is taken up from Select (to): the picked road point is its A, so the selected road needs no
    second marking; null starts it unmarked. Pure. */
export function smoothStart(from: Tool, to: Tool, picked: Pick<Picked, "road"> | null): [number, number] | null {
  return from === "select" && to === "smooth" && picked?.road ? picked.road : null;
}
