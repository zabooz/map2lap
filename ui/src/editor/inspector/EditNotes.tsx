import type {EditState, TrackEdits} from "../state/edits";
import styles from "./EditNotes.module.css";
import {sortName} from "../scene/inspect";
import {thenView} from "../tools/ToolOptions";
import type {Picked} from "../types";
import type {TrackView} from "../scene/view";

const count = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted`;
const heightCount = (n: number) => `${n} height ${n === 1 ? "change" : "changes"}`;
const placedCount = (n: number) => `${n} ${n === 1 ? "object" : "objects"} moved`;

/** What is to be said, in a place of its own below the tools. note: of the tool on. viewFailed: why the view is behind. saveFailed: why a Save wrote nothing. markedName: of the sort
    all of which is marked. picked: what was clicked, sort: the sort that can be marked of it. reopen: the track loaded again. readAgain: the list read again. */
export function EditNotes({state, edits, view, note, viewFailed, saveFailed, markedName, picked, sort, reopen, readAgain}: {
  state: EditState;
  edits: TrackEdits;
  view: TrackView;
  note: string | null;
  viewFailed: string | null;
  saveFailed: string | null;
  markedName: string | null;
  picked: Picked | null;
  sort: string | null;
  reopen: () => void;
  readAgain: () => void;
}) {
  const then = (action: () => void) => thenView(view, action);
  const many = picked?.all.length ?? 0;
  return (
    <div id="edit-notes" className={styles.notes}>
      {state.save === "failed" && <p id="edit-kept" className={styles.line}>Changes not kept: trying again</p>}
      {note && <p id="edit-tool-note" className={styles.line}>{note}</p>}
      {viewFailed && (
        <p id="edit-view-failed" className={styles.line}>
          The view doesn&apos;t show the last change, it is kept all the same: {viewFailed}{" "}
          <button type="button" onClick={then(reopen)}>Load again</button>
        </p>
      )}
      {state.heights.length > 0 && <p id="edit-heights" className={styles.line}>{heightCount(state.heights.length)}</p>}
      {state.placed.length > 0 && <p id="edit-placed" className={styles.line}>{placedCount(state.placed.length)}</p>}
      {state.removed.length > 0 && <p id="edit-count" className={styles.line}>{count(state.removed.length)}</p>}
      {state.copies.length > 0 && <p id="edit-copies" className={styles.line}>{state.copies.length} {state.copies.length === 1 ? "copy" : "copies"}</p>}
      {state.models.length > 0 && <p className={styles.line}>{state.models.length} {state.models.length === 1 ? "model instance" : "model instances"}</p>}
      {state.paints.length > 0 && <p id="edit-paints" className={styles.line}>{state.paints.length} material {state.paints.length === 1 ? "change" : "changes"}</p>}
      {(state.sorts.length > 0 || state.objectSorts.length > 0) && (
        <p id="edit-sorts" className={styles.line}>All deleted: {[...state.sorts, ...state.objectSorts.map(sortName)].join(", ")}</p>
      )}
      {markedName && <p id="edit-marked" className={styles.line}>All {markedName} marked: X or Delete deletes them all, Esc ends it.</p>}
      {many > 1 && !markedName && <p id="edit-picked" className={styles.line}>{many} objects picked: X or Delete deletes them all.</p>}
      {picked && many < 2 && !markedName && (
        <p id="edit-picked" className={styles.line}>
          {picked.kind}{picked.sprite && ` · ${picked.sprite}`}{sort && sortName(sort) !== picked.kind && ` · ${sortName(sort)}`}
          {!picked.id && (picked.afterBuild ? ": only a new build can delete it" : ": can't be deleted yet")}
        </p>
      )}
      {saveFailed && <p id="edit-made" className={styles.line}>{saveFailed}</p>}
      {state.outdated > 0 && (
        <p id="edit-outdated" className={styles.line}>
          {state.outdated} older {state.outdated === 1 ? "change belongs" : "changes belong"} to an earlier build of this track and {state.outdated === 1 ? "is" : "are"} not applied.{" "}
          <button type="button" onClick={then(() => edits.discardOutdated())}>Give up</button>
        </p>
      )}
      {state.save === "stuck" && (
        <p id="edit-stuck" className={styles.line}>
          {state.error}{" "}
          <button type="button" onClick={then(readAgain)}>Read again</button>
        </p>
      )}
    </div>
  );
}
