import type {ReactNode} from "react";
import type {EditState, TrackEdits} from "../state/edits";
import styles from "./ToolPanel.module.css";
import {thenView} from "./ToolOptions";
import type {useSave} from "../state/useSave";
import type {TrackView} from "../scene/view";
import {Help} from "./Help";
import {TOOLS, type Tool, type ToolGroup} from "./toolDefs";

/** One titled group of the sidebar's tools. */
function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <section className={styles.group}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

/** Save and Play under the track choice; the arrow opens Save options including Delete track. */
export function FileButtons({edits, view, saving, onLibrary}: {edits: TrackEdits; view: TrackView; saving: ReturnType<typeof useSave>;
                                                                  onLibrary: () => void}) {
  const then = (action: () => void) => thenView(view, action);
  return (
    <div className={`${styles.tools} ${styles.fileButtons}`}>
      <div className={styles.row}>
        <span className={styles.split}>
          <button type="button" id="edit-save" title="Write this track for Assetto Corsa (Ctrl+S)" disabled={!saving.canSave} onClick={then(() => void saving.save())}>Save</button>
          <button type="button" id="edit-save-more" aria-label="Save as new track" title="Save as new track …"
                  disabled={!edits.canEdit() || saving.busy} onClick={saving.saveAs}>▾</button>
        </span>
        <button type="button" id="edit-play" disabled={!saving.canPlay} title="Save now if needed, then choose the drive in Assetto Corsa"
                onClick={then(() => void saving.drive())}>{saving.starting ? "Starting …" : saving.busy ? "Saving …" : saving.waiting?.play ? "Waiting …" : "▶ Play"}</button>
      </div>
      <button type="button" id="edit-library" className={styles.library} title="Textures and objects: import them, paint the picked ground, place models"
              onClick={then(onLibrary)}>Library</button>
    </div>
  );
}

/** The Editor's tools, by groups: undo and redo with the tools that change nothing, those of the ground and the road, those of objects, the help of the one on; one tool at a time as in an
    image editor. tool: the one on. onTool: one was pressed. */
export function ToolPanel({aiPanel, state, edits, view, tool, onTool, onModels}: {aiPanel: ReactNode; state: EditState; edits: TrackEdits; view: TrackView; tool: Tool; onTool: (tool: Tool) => void; onModels?: () => void}) {
  const editable = edits.canEdit();
  const then = (action: () => void) => thenView(view, action);
  const shownTool = editable || TOOLS.some(t => t.tool === tool && t.free) ? tool : "select";
  const buttons = (group: ToolGroup) => (
    <div className={styles.picker}>
      {TOOLS.filter(t => t.group === group).map(t => (
        <button type="button" key={t.tool} id={t.id ?? undefined} className={shownTool === t.tool ? styles.on : ""} aria-pressed={shownTool === t.tool}
                disabled={!editable && !t.free} title={t.hint} onClick={then(() => t.library ? onModels?.() : onTool(t.tool))}>
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
      <Section title="Road">{buttons("road")}</Section>
      <Section title="AI">{buttons("ai")}{aiPanel}</Section>
      <Section title="Terrain">{buttons("terrain")}</Section>
      <Section title="Objects">{buttons("objects")}</Section>
      <Help tool={shownTool} />
    </div>
  );
}
