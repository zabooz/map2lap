import {useEffect, useState} from "react";
import styles from "./SaveDialog.module.css";

/** A new track's title from this track's, none of taken's: "(copy)", then "(copy 2)" ... Pure. */
function copyOf(title: string, taken: string[]) {
  for (let k = 1; ; k++) {
    const copy = `${title} (copy${k > 1 ? ` ${k}` : ""})`;
    if (!taken.includes(copy)) return copy;
  }
}

/** Saving as in a word processor: write the track in its place, or as a new track beside it. The name left as it is: "(copy)" comes by
    itself; another one: a new track only. title: this track's; taken: the other tracks' titles. canOverwrite: there is something to
    write in its place. */
export function SaveDialog({title, taken, canOverwrite, onOverwrite, onSaveNew, onCancel}: {
  title: string;
  taken: string[];
  canOverwrite: boolean;
  onOverwrite: () => void;
  onSaveNew: (title: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(title);
  const wanted = name.trim(), same = wanted === title;
  const fault = !wanted ? "Give it a name." : !same && taken.includes(wanted) ? `Another track is called “${wanted}” already.` : null;
  const newTitle = same ? copyOf(title, taken) : wanted;
  const overwrites = same && canOverwrite;     // (the primary button and Enter: Overwrite while it can, Save as new track once the name is another)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div id="save-back" className={styles.back} onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <form id="save-dialog" className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="save-title"
            onSubmit={e => { e.preventDefault(); if (overwrites) onOverwrite(); else if (!fault) onSaveNew(newTitle); }}>
        <b id="save-title">Save track</b>
        <label className={styles.field}>Name
          <input id="save-name" type="text" value={name} maxLength={80} autoFocus onChange={e => setName(e.target.value)} />
        </label>
        <p id="save-taken" className={styles.note}>{fault ?? `Save as new track makes “${newTitle}”. Whatever you delete can be brought back later.`}</p>
        <div className={styles.buttons}>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" className={overwrites ? styles.primary : ""} disabled={!overwrites} onClick={onOverwrite}>Overwrite</button>
          <button type="button" className={overwrites ? "" : styles.primary} disabled={!!fault} onClick={() => onSaveNew(newTitle)}>Save as new track</button>
        </div>
      </form>
    </div>
  );
}
