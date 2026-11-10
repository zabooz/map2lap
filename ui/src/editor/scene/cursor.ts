// The mouse pointer over the view says what a click of the tool on would do to what is under it.
import type {Tool} from "../tools/ToolPanel";

/** What is under the mouse, as far as the pointer goes by it. object: a single object (it has an id); movable: Move and Copy can
    take it (not a span of wires); road: the road's own surface, where Smooth road sets its points. */
export interface Pointed {
  object: boolean;
  movable: boolean;
  road: boolean;
}

/** The view beside the tool on. dragging: Move takes objects along; pin: the mouse is on a road pin; aiming: a brush's ring or a
    placement ghost shows where a click acts. */
export interface CursorState {
  tool: Tool;
  dragging: boolean;
  pin: boolean;
  aiming: boolean;
}

// (a red cross with a white edge, seen on dark and light ground; browsers that draw no images show the pointer)
const CROSS = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><g fill='none' stroke-linecap='round'>"
  + "<path d='M6 6l12 12M18 6L6 18' stroke='#fff' stroke-width='6'/><path d='M6 6l12 12M18 6L6 18' stroke='#e5484d' stroke-width='3'/></g></svg>";
export const DELETE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(CROSS)}") 12 12, pointer`;

/** The CSS cursor for state over pointed (null: sky, or nothing loaded); "" is the arrow. Pure. */
export function cursorFor(state: CursorState, pointed: Pointed | null): string {
  if (state.dragging) return "grabbing";
  if (state.pin) return "grab";
  if (state.aiming) return "crosshair";
  if (!pointed) return "";
  switch (state.tool) {
    case "select": return pointed.object ? "pointer" : "";
    case "move": return pointed.movable ? "grab" : "";
    case "copy": return pointed.movable ? "copy" : "";
    case "delete": return pointed.object ? DELETE_CURSOR : "";
    case "smooth": return pointed.road ? "crosshair" : "";
    default: return "";
  }
}
