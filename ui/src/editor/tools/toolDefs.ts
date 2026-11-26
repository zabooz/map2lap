// The Editor's tools defined once: id, name, sidebar group, key, tooltip, help, and how each takes a left pick. ToolPanel, Help, the
// keyboard and the tool host (useToolHost) read only this. What a tool does stays in its own hook. Pure.

import type {ScalarHint} from "../state/edits";

import {hintSteps, type HintKind} from "../aiHints";
export type Tool = "select" | "delete" | "camera" | "move" | "copy" | "elevation" | "smooth" | "separate" | "bank" | "kerb" | "stitch" | "ai-move" | "ai-redraw" | "ai-margin" | "ai-corner" | "ai-braking" | "ai-speed-limit" | "model" | "group";
export type ToolGroup = "general" | "road" | "ai" | "terrain" | "objects";

/** What a click's pick means while the tool is on (useSelection). select: the pinned selection of objects, ground surfaces and
    connected sections (railway bridge, sidewalk, guardrail), Ctrl or Add adds and removes, Shift or Select all takes a whole sort;
    multi: objects only, Ctrl adds and removes (Transform drags them together); single: a pick replaces the selection (Copy takes
    it as source); delete: a left pick is deleted at once, a section with it; none: left clicks are the tool's own (points on a
    road), the pick is dropped. A right click always picks for the menu. */
export type SelectionRule = "select" | "multi" | "single" | "delete" | "none";

export interface ToolDef {
  tool: Tool;
  group: ToolGroup | null;        // its sidebar section; null: not in the sidebar (Groups comes from the Library)
  id: string | null;              // its sidebar button's id
  label: string;
  key: string | null;             // the key that takes it up; null: none
  hint: string;                   // the button's tooltip
  help: [string, string][];       // Help's keys: what a click, a held key or the wheel with one does
  selection: SelectionRule;
  hintKind?: HintKind;
  free?: boolean;                 // changes nothing: also on a track that can't be edited now
  library?: boolean;              // taking it up opens the Library; it is on once something is chosen there
}

const PICK_HINT: [string,string] = ["Click a coloured hint", "select that zone and open its tool"];
const START_HINT: [string,string] = ["Shift + click", "start a new zone inside an existing hint"];

const TURN_RAISE_SIZE: [string, string][] = [["Shift + wheel", "turn"], ["Ctrl + wheel", "raise"], ["Alt + wheel", "size"]];

function scalarTool(tool: Tool, hintKind: ScalarHint, label: string, key: string, setting: string): ToolDef {
  const steps = hintSteps(hintKind);
  return {tool, hintKind, label, group:"ai", id:`edit-${tool}`, key, selection:"none", hint:`${setting} (${key})`,
    help:[[key, `turn ${label} on or off. All AI tools show the four hint colours.`],
      ["Shift + wheel", `adjust by ${steps.shift}${steps.unit}`], ["Ctrl + wheel", `adjust by ${steps.ctrl}${steps.unit}`],
      ["Click twice", "mark a stretch of the AI band, in driving order on a Circuit"],
      ["Value", setting], PICK_HINT, START_HINT,
      ["Drag A or B", "move an endpoint"], ["Alt + wheel", "visit the next or previous zone of this type"],
      ["Esc", "discard unfinished marks"], ["X or Delete", "remove the selected zone"], ["Ctrl+Z / Ctrl+Y", "undo or redo"]]};
}

export const TOOL_DEFS: ToolDef[] = [
  {tool: "select", group: "general", id: "edit-select", label: "Select", key: "V", selection: "select", free: true,
    hint: "Click to pick a surface or object; left drag selects objects in a rectangle. Add or Ctrl adds more, Shift + click selects all matching; Alt changes the ground's texture or replaces trees; X or Delete takes them out (V)",
    help: [["Click", "pick an object or a ground surface"], ["Ctrl + click", "add to it, or take one out"], ["Shift + click", "all matching"],
      ["Left drag", "select objects in a rectangle; Add or Ctrl adds to the selection"],
      ["B with a kerb picked", "show the complete kerb range and edit its height, width or profile"],
      ["Alt", "change the picked ground's texture, or replace the picked trees"], ["X or Delete", "delete what is picked"], ["Esc", "pick nothing"]]},
  {tool: "camera", group: "general", id: "edit-camera", label: "Road camera", key: "K", selection: "multi", free: true,
    hint: "Go along the track by the wheel or riding by itself, back to the first view (K; Esc ends it)",
    help: [["Shift + wheel", "forwards, backwards along the track"], ["Ctrl + wheel", "height"], ["Alt + wheel", "speed of Ride"], ["Home", "back to the first view"]]},
  {tool: "smooth", group: "road", id: "edit-smooth", label: "Smooth road", key: "R", selection: "none",
    hint: "With a road picked it starts there. Mark road points, add branches if needed, then increase strength from 0%. Changes apply automatically; Esc ends it, Ctrl+Z undoes it (R)",
    help: [["R with a road picked", "starts at the picked road"], ["Click", "mark road points, drag them, add branches"],
      ["Shift", "switch between Road (each mapped road's own ground) and Free (a width around the marked road, whoever's ground it is)"],
      ["Ctrl + wheel", "strength"], ["Alt + wheel", "width in Free"], ["Ctrl + Alt + wheel", "transition into the terrain"]]},
  {tool: "separate", group: "road", id: "edit-separate", label: "Bend road", key: "J", selection: "none",
    hint: "Click A and B on any road; raise or lower its middle while both ends stay fixed (J)",
    help: [["Click twice", "A and B on the same road; both ends stay fixed"], ["Shift + wheel", "raise or lower the road's middle by 0.1 m"],
      ["Ctrl + wheel", "change maximum ramp slope by 0.5 percentage points"], ["Height", "positive raises, negative lowers; crossings keep their clearance"],
      ["Ctrl+Z", "undo the road bend"]]},
  {tool: "bank", group: "road", id: "edit-bank", label: "Bank road", key: "U", selection: "none",
    hint: "Click A and B on one road: A to B is banked fully, transitions are added beyond; click a highlighted banking to change it (U)",
    help: [["Click twice", "A and B on the same road: the fully banked stretch"], ["Ctrl + wheel", "banking by 0.5 percentage points"],
      ["Shift", "switch the high edge, left or right as A runs to B"], ["Alt + wheel", "how steep the transitions may be, by 0.1 percentage points"],
      ["Click a banking", "pick it to change it or drag its A and B"], ["X or Delete", "delete the picked banking"], ["Ctrl+Z", "undo the banking"]]},
  {tool: "kerb", group: "road", id: "edit-kerb", label: "Racing kerb", key: "B", selection: "none",
    hint: "Click the desired road edge, then mark the end; adjust width, physical height and profile (B)",
    help: [["B", "turn Racing kerb on or off"], ["Shift", "switch between Road and Free"],
      ["Road: click twice", "first click chooses the road edge; second click marks the end"],
      ["Free: click", "points where the kerb should run, centred on them; it appears from the second click and grows with each"],
      ["Free: Backspace", "remove the last point"], ["Esc", "end the tool"],
      ["Ctrl + wheel", "width by 5 cm"], ["Alt + wheel", "physical height by 1 cm"], ["Ctrl + Alt + wheel", "flat, rounded or ribbed profile"],
      ["Click a kerb", "select its complete range to edit or delete it (Road)"],
      ["Ctrl+Z", "undo placement or an adjustment"]]},
  {tool: "stitch", group: "road", id: "edit-stitch", label: "Stitch road", key: "N", selection: "none",
    hint: "Click A and B on one road, also on a bridge deck or tunnel floor; Apply rebuilds the driving surface between them over its whole width (N)",
    help: [["N", "turn Stitch road on or off"], ["Click twice", "A and B on the same road: ground, deck or tunnel floor"],
      ["Shift + wheel", "width by 0.1 m"], ["Auto width", "the ground road's width at A and B"], ["Apply", "replace the surface between A and B"],
      ["Ctrl+Z", "undo the stitch"]]},
  // (both AI line tools show the installed line with its speed and side limits, also on a track that can't be edited now)
  {tool: "ai-move", group: "ai", id: "edit-ai-move", label: "Move line", key: "1", selection: "none", free: true,
    hint: "Show the installed AI line with speed and side limits; drag it sideways to correct it (1)",
    help: [["1", "turn Move line on or off; it shows the installed AI line"], ["Hover over the band", "show the route metre and point data"], PICK_HINT,
      ["Drag", "move the line sideways or adjust an existing move; larger offsets blend over a longer distance"], ["Shift", "switch between Free (default) and Road"],
      ["Right-click", "remove a correction"],
      ["Save", "update an outdated line in the background"], ["Recalculate AI line", "save edits and update the line if needed"]]},
  {tool: "ai-redraw", group: "ai", id: "edit-ai-redraw", label: "Redraw line", key: "2", selection: "none", free: true,
    hint: "Draw a replacement section of the AI line: click the line, click the ground, then click the line ahead (2)",
    help: [["2", "turn Redraw line on or off; it shows the installed AI line"],
      ["Click", "the line to start, the ground to shape the curve, the line ahead in driving order to finish"],
      PICK_HINT, ["Shift + click", "start a redraw on a coloured hint"],
      ["Shift", "switch between Free (default) and Road"], ["Esc", "discard the current stroke; without one, end the tool"],
      ["Drag", "move a saved ground point"],
      ["Right-click while drawing", "take back the last point, or cancel at the start"],
      ["Click a saved stroke", "open the line between two markers to draw from the preceding marker"],
      ["Right-click a marker", "remove a ground point or delete the stroke at either endpoint"],
      ["Click after opening", "add ground points, click a remaining marker to reconnect, or click the line ahead to finish"],
      ["Save", "update an outdated line in the background"], ["Recalculate AI line", "save edits and update the line if needed"]]},
  {tool: "ai-margin", hintKind: "danger", group: "ai", id: "edit-ai-margin", label: "Danger zone", key: "3", selection: "none",
    hint: "Mark a stretch of the AI line and adjust its left or right passing margin (3)",
    help: [["3", "turn Danger zone on or off"], ["Click twice", "mark either end first on a Route, or follow driving order on a Circuit"],
      PICK_HINT, START_HINT, ["Drag A or B", "resize the selected stretch"],
      ["Shift + wheel", "adjust left by 0.05 m"], ["Ctrl + wheel", "adjust right by 0.05 m"],
      ["Alt + wheel", "select and view the next or previous stretch in driving order"],
      ["Left / Right", "Off leaves this side unset. Later values win on each side."],
      ["X or Delete", "remove the picked zone"], ["Ctrl+Z", "undo a danger zone change"]]},
  scalarTool("ai-corner", "corner", "Corner speed", "4",
    "1.00 is neutral. Try 0.85 for a slower corner. Values above 1.00 encourage the AI to corner faster."),
  scalarTool("ai-braking", "braking", "Braking", "5",
    "1.00 is neutral. Mark the braking approach. Try 0.90 for earlier braking into a downhill hairpin, or 1.10 for later braking."),
  scalarTool("ai-speed-limit", "speedLimit", "Speed limit", "6",
    "Enter a positive speed in km/h. The AI slows within the zone. Start it before the point where cars should reach the target speed."),
  {tool: "elevation", group: "terrain", id: "edit-elevation", label: "Elevation", key: "H", selection: "single",
    hint: "Raise or lower the ground: click, or hold and move (H; Esc ends it)",
    help: [["Click", "raise by its height; hold and move for more"], ["Shift", "lower instead"], ["Ctrl + wheel", "radius"], ["Alt + wheel", "height of a click"],
      ["Ctrl + Alt + wheel", "soft edge"]]},
  {tool: "move", group: "objects", id: "edit-move", label: "Transform", key: "T", selection: "multi",
    hint: "Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (T; Esc ends it)",
    help: [["Drag", "move the selected objects together along the ground"], ...TURN_RAISE_SIZE,
      ["Walls", "change the top in Options; both feet stay fixed"]]},
  {tool: "copy", group: "objects", id: "edit-copy", label: "Copy", key: "C", selection: "single",
    hint: "Pick an object, then click to place copies repeatedly (C; Esc ends it)",
    help: [["Click", "pick the source, then place copies"], ...TURN_RAISE_SIZE]},
  {tool: "delete", group: "objects", id: "edit-click-deletes", label: "Delete", key: "X", selection: "delete",
    hint: "Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)",
    help: [["Click", "delete what is under it"], ["Shift", "switch between one and the brush"], ["Click or drag with the brush", "delete everything under the ring"],
      ["Ctrl + wheel", "brush radius"]]},
  {tool: "model", group: "objects", id: "edit-insert", label: "Insert", key: "E", selection: "single", library: true,
    hint: "Open the object library to import or place a model (E)",
    help: [["Click", "place the chosen model"], ...TURN_RAISE_SIZE]},
  {tool: "group", group: null, id: null, label: "Groups", key: null, selection: "single", library: true,
    hint: "Paint a mixture of models chosen in the Library",
    help: [["Click or drag", "stamp or paint a mixture"], ["Shift + wheel", "brush radius"], ["Ctrl + wheel", "density"], ["Alt + wheel", "minimum spacing"]]},
];

/** The sidebar's tools, in its order. */
export const TOOLS = TOOL_DEFS.filter(t => t.group !== null);

/** The definition of tool. Pure. */
export const toolDef = (tool: Tool) => TOOL_DEFS.find(t => t.tool === tool)!;

/** The active tool and its shortcut as shown in its options and help. Pure. */
export const toolTitle = (def: ToolDef) => def.key ? `${def.label} (${def.key})` : def.label;

/** The tool whose key this is (case ignored), if any. Pure. */
export const toolOfKey = (key: string) => TOOL_DEFS.find(t => t.key !== null && t.key.toLowerCase() === key.toLowerCase());

/** A key the Editor itself answers, whichever tool is on; a tool's own keys (controller.key) come only after these. */
export type GlobalKey = "escape" | "undo" | "redo" | "save" | "delete" | "home" | "library" | {tool: Tool};

/** What key means to the Editor. picked: something is picked or marked, which X then deletes instead of taking up Delete;
    null: not the Editor's, a tool may take it. Pure. */
export function globalKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey">, {picked}: {picked: boolean}): GlobalKey | null {
  const control = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
  if (e.key === "Escape") return "escape";
  if (e.key === "Delete") return "delete";
  if (control) return key === "z" ? (e.shiftKey ? "redo" : "undo") : key === "y" ? "redo" : key === "s" ? "save" : null;
  if (picked && key === "x") return "delete";
  const keyed = toolOfKey(key);
  if (keyed) return keyed.library ? "library" : {tool: keyed.tool};
  return e.key === "Home" ? "home" : null;
}
