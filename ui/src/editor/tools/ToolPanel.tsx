import type {ReactNode} from "react";
import type {EditState, TrackEdits} from "../state/edits";
import {hasUnsavedChanges} from "../state/edits";
import styles from "./ToolPanel.module.css";
import {thenView} from "./ToolOptions";
import type {useSave} from "../state/useSave";
import type {TrackView} from "../scene/view";
import {Help} from "./Help";

export type Tool = "select" | "delete" | "camera" | "move" | "copy" | "elevation" | "smooth" | "model" | "group";
type Group = "general" | "terrain" | "objects";
export const TOOLS: {tool: Tool; group: Group; id: string; label: string; key: string; hint: string}[] = [
  {tool: "select", group: "general", id: "edit-select", label: "Select", key: "V", hint: "Click a ground surface or object to pick it, Ctrl + click adds more, Shift + click selects all matching; Alt changes the ground's texture or replaces trees; X or Delete takes them out (V)"},
  {tool: "camera", group: "general", id: "edit-camera", label: "Road camera", key: "K", hint: "Go along the track by the wheel or riding by itself, back to the first view (K; Esc ends it)"},
  {tool: "smooth", group: "terrain", id: "edit-smooth", label: "Smooth road", key: "T", hint: "With a road picked it starts there. Mark road points, add branches if needed, then increase strength from 0%. Changes apply automatically; Esc ends it, Ctrl+Z undoes it (T)"},
  {tool: "elevation", group: "terrain", id: "edit-elevation", label: "Elevation", key: "H", hint: "Raise or lower the ground: click, or hold and move (H; Esc ends it)"},
  {tool: "move", group: "objects", id: "edit-move", label: "Transform", key: "M", hint: "Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},
  {tool: "copy", group: "objects", id: "edit-copy", label: "Copy", key: "C", hint: "Pick an object, then click to place copies repeatedly (C; Esc ends it)"},
  {tool: "delete", group: "objects", id: "edit-click-deletes", label: "Delete", key: "X", hint: "Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"},
  {tool: "model", group: "objects", id: "edit-insert", label: "Insert", key: "I", hint: "Open the object library to import or place a model (I)"},
];

/** One titled group of the sidebar's tools. */
function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <section className={styles.group}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

/** Save, Play, Delete track and Revert to saved under the track's choice in the sidebar's File, the library of textures and objects apart below them. onLibrary,
    onDelete: they were pressed (the track's deletion asks first). */
export function FileButtons({state, edits, view, saving, onLibrary, onDelete}: {state: EditState; edits: TrackEdits; view: TrackView; saving: ReturnType<typeof useSave>;
                                                                  onLibrary: () => void; onDelete: () => void}) {
  const then = (action: () => void) => thenView(view, action);
  return (
    <div className={`${styles.tools} ${styles.fileButtons}`}>
      <div className={styles.row}>
        <span className={styles.split}>
          <button type="button" id="edit-save" title="Write this track for Assetto Corsa (Ctrl+S)" disabled={!saving.canSave} onClick={then(() => void saving.save())}>Save</button>
          <button type="button" id="edit-save-more" aria-label="Save as new track" title="Save as new track …"
                  disabled={!edits.canEdit() || saving.busy} onClick={saving.saveAs}>▾</button>
        </span>
        <button type="button" id="edit-play" disabled={!saving.canPlay} title="Save if needed, then drive it in Assetto Corsa"
                onClick={then(() => void saving.drive())}>{saving.starting ? "Starting …" : saving.waiting?.play ? "Waiting …" : "▶ Play"}</button>
      </div>
      <div className={styles.row}>
        <button type="button" id="edit-delete-track" className={styles.danger} disabled={saving.busy}
                title="Delete this track from Assetto Corsa" onClick={then(onDelete)}>Delete track</button>
        <button type="button" disabled={!hasUnsavedChanges(state) || !edits.canEdit() || saving.busy}
                title="Return to the last Save; Undo brings the changes back" onClick={then(() => {
                  if (confirm("Revert to the last Save?\n\nYour saved edits are kept. Undo brings the discarded changes back.")) {
                    void edits.inTurn(() => edits.discard());
                  }
                })}>Revert to saved</button>
      </div>
      <button type="button" id="edit-library" className={styles.library} title="Textures and objects: import them, paint the picked ground, place models"
              onClick={then(onLibrary)}>Library</button>
    </div>
  );
}

/** The Editor's tools, by groups: undo and redo with the tools that change nothing, those of the ground and the road, those of objects, the help of the one on; one tool at a time as in an
    image editor. tool: the one on. onTool: one was pressed. */
export function ToolPanel({state, edits, view, tool, onTool, onModels}: {state: EditState; edits: TrackEdits; view: TrackView; tool: Tool; onTool: (tool: Tool) => void; onModels?: () => void}) {
  const editable = edits.canEdit();
  const then = (action: () => void) => thenView(view, action);
  const free = (t: Tool) => t === "select" || t === "camera";      // (these change nothing: also on a track that can't be edited now)
  const shownTool = editable || free(tool) ? tool : "select";
  const buttons = (group: Group) => (
    <div className={styles.picker}>
      {TOOLS.filter(t => t.group === group).map(t => (
        <button type="button" key={t.tool} id={t.id} className={shownTool === t.tool ? styles.on : ""} aria-pressed={shownTool === t.tool}
                disabled={!editable && !free(t.tool)} title={t.hint} onClick={then(() => t.tool === "model" ? onModels?.() : onTool(t.tool))}>
          {t.label}<span className={styles.key} aria-hidden="true">{t.key}</span>
        </button>
      ))}
    </div>
  );
  return (
    <div id="edit-bar" className={styles.tools} data-kept={state.save}>
      <Section title="General">
        <div id="edit-history" className={styles.row}>
          <button type="button" disabled={!state.canUndo || !editable} title="Ctrl+Z" onClick={then(() => void edits.inTurn(() => edits.undo()))}>↶ Undo</button>
          <button type="button" disabled={!state.canRedo || !editable} title="Ctrl+Shift+Z" onClick={then(() => void edits.inTurn(() => edits.redo()))}>↷ Redo</button>
        </div>
        {buttons("general")}
      </Section>
      <Section title="Terrain">{buttons("terrain")}</Section>
      <Section title="Objects">{buttons("objects")}</Section>
      <Help tool={shownTool} />
    </div>
  );
}
