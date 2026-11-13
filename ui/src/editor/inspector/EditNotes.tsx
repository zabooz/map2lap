import type {EditState} from "../state/edits";
import styles from "./EditNotes.module.css";
import {sortName} from "../scene/inspect";
import type {Picked} from "../types";

const count = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted`;
const heightCount = (n: number) => `${n} height ${n === 1 ? "change" : "changes"}`;
const placedCount = (n: number) => `${n} ${n === 1 ? "object" : "objects"} moved`;

/** What is to be said, in a place of its own below the tools; what went wrong is a toast (editorToasts). note: of the tool on.
    markedName: of the sort all of which is marked. picked: what was clicked, sort: the sort that can be marked of it. */
export function EditNotes({state, note, markedName, picked, sort}: {
  state: EditState;
  note: string | null;
  markedName: string | null;
  picked: Picked | null;
  sort: string | null;
}) {
  const many = picked?.all.length ?? 0;
  return (
    <div id="edit-notes" className={styles.notes}>
      {note && <p id="edit-tool-note" className={styles.line}>{note}</p>}
      {state.heights.length > 0 && <p id="edit-heights" className={styles.line}>{heightCount(state.heights.length)}</p>}
      {state.placed.length > 0 && <p id="edit-placed" className={styles.line}>{placedCount(state.placed.length)}</p>}
      {state.removed.length > 0 && <p id="edit-count" className={styles.line}>{count(state.removed.length)}</p>}
      {!!state.treeSpacing?.hidden.length && <p className={styles.line}>{state.treeSpacing.hidden.length} trees thinned ({state.treeSpacing.distance} m)</p>}
      {state.copies.length + state.trees.length > 0 && <p id="edit-copies" className={styles.line}>{state.copies.length + state.trees.length}
        {state.copies.length + state.trees.length === 1 ? " copy" : " copies"}</p>}
      {state.models.length > 0 && <p className={styles.line}>{state.models.length} {state.models.length === 1 ? "model instance" : "model instances"}</p>}
      {state.paints.length > 0 && <p id="edit-paints" className={styles.line}>{state.paints.length} material {state.paints.length === 1 ? "change" : "changes"}</p>}
      {state.walls.length > 0 && <p className={styles.line}>{state.walls.length} {state.walls.length === 1 ? "wall edited" : "walls edited"}</p>}
      {state.objectSorts.length > 0 && (
        <p id="edit-sorts" className={styles.line}>All deleted: {state.objectSorts.map(sortName).join(", ")}</p>
      )}
      {markedName && <p id="edit-marked" className={styles.line}>All {markedName} marked: X or Delete deletes them all, Esc ends it.</p>}
      {many > 1 && !markedName && <p id="edit-picked" className={styles.line}>{many} objects picked: X or Delete deletes them all.</p>}
      {picked && many < 2 && !markedName && (
        <p id="edit-picked" className={styles.line}>
          {picked.kind}{sort && sortName(sort) !== picked.kind && ` · ${sortName(sort)}`}
          {!picked.id && (picked.afterBuild ? ": only a new build can delete it" : ": can't be deleted yet")}
        </p>
      )}
    </div>
  );
}
