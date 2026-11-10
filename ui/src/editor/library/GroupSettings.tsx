import {useEffect, useRef, useState} from "react";
import {GroupPatch} from "./GroupPatch";
import {entriesValid, groupShares} from "./groupMix";
import type {GroupEntry} from "../tools/scatter";
import type {LibraryModel} from "./ModelLibrary";
import {MIN_SCALE, MAX_SCALE} from "../tools/placing";
import frame from "./ImportDialog.module.css";
import styles from "./GroupSettings.module.css";

const percent = (share: number) => `${Math.round(share * 100)} %`;

/** The group's settings over the library, on a copy of its objects: the patch on the left, a button per object on the right. Pointing at an object's
    button lights it up in the patch; pressing it slides its weight, sizes and random switch down. Save hands the copy back (onSave),
    Cancel, Escape or a click beside the window drop it. */
export function GroupSettings({name, entries, randomPosition, models, disabled, onSave, onClose}: {name: string; entries: GroupEntry[]; randomPosition: boolean;
  models: Record<string, LibraryModel>; disabled: boolean; onSave: (entries: GroupEntry[], randomPosition: boolean) => void; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(() => entries.map(e => ({...e}))), [open, setOpen] = useState<string | null>(null);
  const [pointed, setPointed] = useState<string | null>(null), [scattered, setScattered] = useState(randomPosition), shares = groupShares(draft);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const change = (model: string, values: Partial<GroupEntry>) => setDraft(old => old.map(e => e.model === model ? {...e, ...values} : e));
  return <dialog ref={dialog} className={frame.dialog} aria-label="Group settings"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { const r = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) onClose(); }}>
    <div className={frame.form}>
      <h2 title={name}>Group settings: <span className={frame.file}>{name || "New group"}</span></h2>
      <div className={styles.columns}>
      <GroupPatch className={styles.patch} entries={draft} models={models} randomPosition={scattered} highlight={pointed ?? open} />
      <div className={styles.objects}>
        <label className={styles.group}><input type="checkbox" role="switch" aria-label="Random position" checked={scattered} disabled={disabled}
          onChange={event => setScattered(event.target.checked)} /><span><strong>Random position</strong>{scattered ? "Scattered loosely, as in nature" : "In rows at the brush's spacing"}</span></label>
        {draft.map((e, i) => { const label = models[e.model]?.name ?? `Object ${e.model.slice(0, 8)}`, random = e.random !== false, shown = open === e.model;
          return <div key={e.model} className={styles.object} data-open={shown || undefined}
            onPointerEnter={() => setPointed(e.model)} onPointerLeave={() => setPointed(null)}
            onFocus={() => setPointed(e.model)} onBlur={() => setPointed(null)}>
            <button type="button" className={styles.head} aria-expanded={shown} onClick={() => setOpen(shown ? null : e.model)}>
              <strong>{label}</strong><span>{percent(shares[i])}</span><i aria-hidden="true" />
            </button>
            <div className={styles.drawer}><fieldset className={styles.fields} disabled={disabled || !shown} aria-label={label}>
              <label>Weight<input aria-label={`Weight ${label}`} type="number" min={0} max={1000} step={1} value={e.weight}
                onChange={event => change(e.model, {weight: event.target.valueAsNumber || 0})} /></label>
              <label className={styles.switch}><input type="checkbox" role="switch" aria-label={`Random ${label}`} checked={random}
                onChange={event => change(e.model, event.target.checked ? {random: true} : {random: false, maxScale: e.minScale})} />
                Random size and turn</label>
              {random ? <>
                <label>Size min %<input aria-label={`Minimum size ${label}`} type="number" min={MIN_SCALE * 100} max={MAX_SCALE * 100} value={Math.round(e.minScale * 100)}
                  onChange={event => change(e.model, {minScale: (event.target.valueAsNumber || 0) / 100})} /></label>
                <label>Size max %<input aria-label={`Maximum size ${label}`} type="number" min={MIN_SCALE * 100} max={MAX_SCALE * 100} value={Math.round(e.maxScale * 100)}
                  onChange={event => change(e.model, {maxScale: (event.target.valueAsNumber || 0) / 100})} /></label>
              </> : <label>Size %<input aria-label={`Size ${label}`} type="number" min={MIN_SCALE * 100} max={MAX_SCALE * 100} value={Math.round(e.minScale * 100)}
                  onChange={event => { const size = (event.target.valueAsNumber || 0) / 100; change(e.model, {minScale: size, maxScale: size}); }} /></label>}
              <button type="button" className={styles.remove} onClick={() => { setDraft(old => old.filter(x => x.model !== e.model)); setPointed(null); }}>Remove</button>
            </fieldset></div>
          </div>; })}
        {!draft.length && <p className={frame.note}>No objects left. Cancel keeps the group as it was.</p>}
      </div>
      </div>
      <div className={frame.buttons}>
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="button" className={frame.primary} disabled={disabled || !entriesValid(draft)} onClick={() => onSave(draft, scattered)}>Save</button>
      </div>
    </div>
  </dialog>;
}
