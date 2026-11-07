import type {ReactNode} from "react";
import type {EditState, TrackEdits} from "./edits";
import styles from "./ToolPanel.module.css";
import {thenView} from "./ToolOptions";
import {isChanged, type useSave} from "./useSave";
import type {TrackView} from "./view";

export type Tool = "select" | "road" | "delete" | "camera" | "move" | "elevation" | "smooth";     // (what the left button does: picks, marks a band, each click deletes, picks, picks and drags, the brush, marks a band and evens it out)
export const TOOLS: {tool: Tool; group: "general" | "tools"; id: string; label: string; key: string; hint: string}[] = [
  {tool: "select", group: "general", id: "edit-select", label: "Select", key: "V", hint: "Click an object to pick it, Shift + click adds more, X or Delete takes them out; a right click marks all of its sort (V)"},
  {tool: "road", group: "general", id: "edit-road", label: "Mark road", key: "R", hint: "Two clicks on the road mark a stretch of it, for Smooth; further clicks are pins (R; Esc ends it)"},
  {tool: "delete", group: "general", id: "edit-click-deletes", label: "Delete", key: "X", hint: "Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"},
  {tool: "camera", group: "general", id: "edit-camera", label: "Camera", key: "C", hint: "Go along the track by the wheel or riding by itself, back to the first view (C; Esc ends it)"},
  {tool: "move", group: "tools", id: "edit-move", label: "Move", key: "M", hint: "Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},
  {tool: "elevation", group: "tools", id: "edit-elevation", label: "Elevation", key: "H", hint: "Raise or lower the ground: click, or hold and move (H; Esc ends it)"},
  {tool: "smooth", group: "tools", id: "edit-smooth", label: "Smooth", key: "T", hint: "Even out a marked stretch of road: mark it first or after, it shows at once, Enter takes it (T; Esc ends it)"},
];

/** One titled group of the sidebar's tools. */
function Group({title, id, children}: {title: string; id?: string; children: ReactNode}) {
  return (
    <section id={id} className={styles.group}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

/** The Editor's buttons, by groups: saving the track, undo and redo, one tool at a time as in an image editor. tool: the one on. onTool: one was pressed. */
export function ToolPanel({state, edits, view, saving, tool, onTool}: {state: EditState; edits: TrackEdits; view: TrackView; saving: ReturnType<typeof useSave>; tool: Tool; onTool: (tool: Tool) => void}) {
  const editable = edits.canEdit();
  const then = (action: () => void) => thenView(view, action);
  const free = (t: Tool) => t === "select" || t === "camera";      // (these change nothing: also on a track that can't be edited now)
  const shownTool = editable || free(tool) ? tool : "select";
  const buttons = (group: "general" | "tools") => (
    <div className={styles.picker}>
      {TOOLS.filter(t => t.group === group).map(t => (
        <button type="button" key={t.tool} id={t.id} className={shownTool === t.tool ? styles.on : ""} aria-pressed={shownTool === t.tool}
                disabled={!editable && !free(t.tool)} title={t.hint} onClick={then(() => onTool(t.tool))}>
          {t.label}<span className={styles.key} aria-hidden="true">{t.key}</span>
        </button>
      ))}
    </div>
  );
  return (
    <div id="edit-bar" className={styles.tools} data-kept={state.save}>
      <Group title="File">
        <div className={styles.row}>
          <span className={styles.split}>
            <button type="button" id="edit-save" title="Write this track for Assetto Corsa (Ctrl+S)" disabled={!saving.canSave} onClick={then(() => void saving.save())}>Save</button>
            <button type="button" id="edit-save-more" aria-label="Save as new track" title="Save as new track …"
                    disabled={!editable || saving.busy} onClick={saving.saveAs}>▾</button>
          </span>
          <button type="button" id="edit-play" disabled={!saving.canPlay} title="Save if needed, then drive it in Assetto Corsa"
                  onClick={then(() => void saving.drive())}>{saving.starting ? "Starting …" : "▶ Play"}</button>
        </div>
        <span id="edit-saved" className={styles.state}>{saving.savedText}</span>
      </Group>
      <Group title="Edit" id="edit-history">
        <div className={styles.row}>
          <button type="button" disabled={!state.canUndo || !editable} title="Ctrl+Z" onClick={then(() => void edits.inTurn(() => edits.undo()))}>↶ Undo</button>
          <button type="button" disabled={!state.canRedo || !editable} title="Ctrl+Y" onClick={then(() => void edits.inTurn(() => edits.redo()))}>↷ Redo</button>
          <button type="button" disabled={!isChanged(state) || !editable} title="All changes since the last Save go" onClick={then(() => void edits.inTurn(() => edits.discard()))}>Discard</button>
        </div>
      </Group>
      <Group title="General">{buttons("general")}</Group>
      <Group title="Tools">{buttons("tools")}</Group>
    </div>
  );
}
