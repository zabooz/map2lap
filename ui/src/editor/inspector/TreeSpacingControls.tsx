import {useEffect, useMemo, useRef, useState, useSyncExternalStore} from "react";
import {post} from "../../api";
import {useToasts, type Posted} from "../../components/toastStore";
import type {EditState, TrackEdits, TreeSpacing} from "../state/edits";
import type {TrackObjects} from "../scene/trackObjects";
import styles from "./TreeSpacingControls.module.css";

/** Persistent thinning: selection ids survive disappearing trees, Save and reopening the track. */
export function TreeSpacingControls({name, edits, state, objects, selection, visible = true}: {
  name: string; edits: TrackEdits; state: EditState; objects: TrackObjects; selection: () => string[] | null; visible?: boolean;
}) {
  const setting = state.treeSpacing, distance = setting?.distance ?? 0;
  const [draft, setDraft] = useState(distance), [previous, setPrevious] = useState(setting);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState<Posted | null>(null);
  const [pendingScope, setPendingScope] = useState<boolean | null>(null);
  useToasts(visible && notice ? [{...notice, onDismiss: () => setNotice(null)}] : []);
  useEffect(() => {
    if (notice?.tone !== 'success') return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const countRevision = useSyncExternalStore(objects.subscribeCounts, objects.countsRevision);
  const count = useMemo(() => objects.countTrees([...state.removed.map(r => r.id), ...(setting?.hidden ?? [])], state.objectSorts),
    [objects, countRevision, state.removed, state.objectSorts, setting]);
  const alive = useRef(true), pending = useRef(false);
  if (previous !== setting) { setPrevious(setting); setDraft(distance); }
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const apply = (value: number, targets = setting?.targets ?? null) => {
    if (pending.current || !edits.canEdit()) return;
    if (value === distance && JSON.stringify(targets) === JSON.stringify(setting?.targets ?? null)) return;
    pending.current = true; setBusy(true); setPendingScope(!!targets);
    setNotice({id: "tree-spacing-toast", tone: "info", title: "Adjusting trees…", dismissible: false,
      progress: {value: null, label: "Adjusting trees"}});
    void edits.inTurn(async () => {
      try {
        edits.saveNow();
        const revision = await edits.saved(), base = edits.boundRevision();
        if (!alive.current) return;
        if (revision === null || !base || !edits.canEdit()) throw new Error("The current changes could not be kept.");
        const answer = await post<{tree_spacing: TreeSpacing}>(`/api/editor/${encodeURIComponent(name)}/tree-spacing`,
          {base, revision, distance: value, targets});
        if (!alive.current) return;
        if (answer.error || !answer.tree_spacing) throw new Error(answer.error ?? "Could not change tree spacing");
        // An Undo or another edit during preparation must not apply an old result.
        if (edits.state().save !== "saved" || edits.state().keptRevision !== revision) throw new Error("The trees changed. Try again.");
        edits.setTreeSpacing(answer.tree_spacing); edits.saveNow();
        if (await edits.saved() === null) throw new Error("The spacing change could not be kept.");
        if (alive.current) {
          const count = answer.tree_spacing.hidden.length;
          setNotice({id: "tree-spacing-toast", tone: "success", title: "Tree spacing updated",
            message: `${count} ${count === 1 ? "tree" : "trees"} thinned`,
            detail: value === 0 ? "Original spacing restored." : `Minimum spacing: ${value} m`});
        }
      } catch (failure) {
        if (alive.current) {
          setNotice({id: "tree-spacing-toast", tone: "error", title: "Could not change tree spacing",
            message: failure instanceof Error ? failure.message : "Try again."});
          setDraft(distance);
        }
      } finally {
        pending.current = false;
        if (alive.current) { setBusy(false); setPendingScope(null); }
      }
    });
  };
  const selected = selection();
  const disabled = busy || !edits.canEdit();
  const selectedScope = pendingScope ?? !!setting?.targets;
  return <section className={styles.spacing} aria-label="Tree spacing">
    <h4 className={styles.title}>Trees</h4>
    <p className={styles.hint}>Current trees: {count.toLocaleString()}</p>
    <div className={styles.scope} role="radiogroup" aria-label="Tree spacing scope">
      <label><input type="radio" name="tree-spacing-scope" checked={!selectedScope} disabled={disabled}
        onChange={() => apply(draft, null)} />All trees</label>
      <label><input type="radio" name="tree-spacing-scope" checked={selectedScope}
        disabled={disabled || (!selected?.length && !setting?.targets)}
        onChange={() => apply(draft, selected?.length ? selected : setting?.targets)} />Selection</label>
    </div>
    <label className={styles.field}>Minimum spacing: <strong>{draft === 0 ? "Original" : `${draft} m`}</strong>
      <input aria-label="Tree minimum spacing" type="range" min={0} max={100} step={.5} value={draft} disabled={disabled}
        onChange={e => setDraft(Number(e.target.value))} onPointerUp={e => apply(Number(e.currentTarget.value))}
        onKeyUp={e => apply(Number(e.currentTarget.value))} onBlur={e => apply(Number(e.currentTarget.value))} />
    </label>
    <p className={styles.hint}>Between trunks at their current positions. Release to preview. Set to 0 to restore thinned trees, even after saving. Manual deletions stay.</p>
  </section>;
}
