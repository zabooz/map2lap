import styles from "./Help.module.css";
import {TOOLS, type Tool} from "./ToolPanel";

const TURN_RAISE_SIZE: [string, string][] = [["Shift + wheel", "turn"], ["Ctrl + wheel", "raise"], ["Alt + wheel", "size"]];

/** Per tool, what a click, a held key or the wheel with one does: the keys its options' tooltips name too. */
const KEYS: Record<Tool, [string, string][]> = {
  select: [["Click", "pick an object or a ground surface"], ["Ctrl + click", "add to it, or take one out"], ["Shift + click", "all matching"],
           ["Left drag", "select objects in a rectangle; Add or Ctrl adds to the selection"],
           ["B with a kerb picked", "show the complete kerb range and edit its height, width or profile"],
           ["Alt", "change the picked ground's texture, or replace the picked trees"], ["X or Delete", "delete what is picked"], ["Esc", "pick nothing"]],
  camera: [["Shift + wheel", "forwards, backwards along the track"], ["Ctrl + wheel", "height"], ["Alt + wheel", "speed of Ride"], ["Home", "back to the first view"]],
  smooth: [["R with a road picked", "starts at the picked road"], ["Click", "mark road points, drag them, add branches"],
           ["Shift", "switch between Road (each mapped road's own ground) and Free (a width around the marked road, whoever's ground it is)"],
           ["Ctrl + wheel", "strength"], ["Alt + wheel", "width in Free"], ["Ctrl + Alt + wheel", "transition into the terrain"]],
  separate: [["Click twice", "A and B on the same road; both ends stay fixed"], ["Shift + wheel", "raise or lower the road's middle by 0.1 m"],
             ["Ctrl + wheel", "change maximum ramp slope by 0.5 percentage points"], ["Height", "positive raises, negative lowers; crossings keep their clearance"],
             ["Ctrl+Z", "undo the road bend"]],
  kerb: [["B", "turn Racing kerb on or off"], ["Shift", "switch between Road and Free"],
         ["Road: click twice", "first click chooses the road edge; second click marks the end"],
         ["Free: click", "points where the kerb should run, centred on them; it appears from the second click and grows with each"],
         ["Free: Backspace", "remove the last point"], ["Esc", "end the tool"],
         ["Ctrl + wheel", "width by 5 cm"], ["Alt + wheel", "physical height by 1 cm"], ["Ctrl + Alt + wheel", "flat, rounded or ribbed profile"],
         ["Click a kerb", "select its complete range to edit or delete it (Road)"],
         ["Ctrl+Z", "undo placement or an adjustment"]],
  stitch: [["N", "turn Stitch road on or off"], ["Click twice", "A and B on the same road: ground, deck or tunnel floor"],
           ["Shift + wheel", "width by 0.1 m"], ["Auto width", "the ground road's width at A and B"], ["Apply", "replace the surface between A and B"],
           ["Ctrl+Z", "undo the stitch"]],
  elevation: [["Click", "raise by its height; hold and move for more"], ["Shift", "lower instead"], ["Ctrl + wheel", "radius"], ["Alt + wheel", "height of a click"],
              ["Ctrl + Alt + wheel", "soft edge"]],
  move: [["Drag", "move the selected objects together along the ground"], ...TURN_RAISE_SIZE,
         ["Walls", "change the top in Options; both feet stay fixed"]],
  copy: [["Click", "pick the source, then place copies"], ...TURN_RAISE_SIZE],
  delete: [["Click", "delete what is under it"], ["Shift", "switch between one and the brush"], ["Click or drag with the brush", "delete everything under the ring"],
           ["Ctrl + wheel", "brush radius"]],
  model: [["Click", "place the chosen model"], ...TURN_RAISE_SIZE],
  group: [["Click or drag", "stamp or paint a mixture"], ["Shift + wheel", "brush radius"], ["Ctrl + wheel", "density"], ["Alt + wheel", "minimum spacing"]],
};

/** How the Editor is worked, then the keys of `tool`, the one on: short, and what is said holds now. */
export function Help({tool}: {tool: Tool}) {
  const on = TOOLS.find(t => t.tool === tool) ?? {label: "Groups", key: "Library"};
  return (
    <details id="edit-help" className={styles.help}>
      <summary className={styles.helpTitle}>Help</summary>
      <p className="small muted">Every tool is a button with its key on it. Shift, Ctrl and Alt change what a click or the wheel does.
        Esc ends a tool · Ctrl+Z undo · Ctrl+S save</p>
      <p className="small muted">Right-click: the menu of what is under it.</p>
      <p className="small muted">View: W A S D · right drag · wheel zooms, held it turns. All keys: Settings → Editor.</p>
      <h4 className={styles.helpTool}>{on.label} ({on.key})</h4>
      <dl className={styles.keys}>
        {KEYS[tool].map(([keys, does]) => <div key={keys}><dt>{keys}</dt><dd>{does}</dd></div>)}
      </dl>
    </details>
  );
}
