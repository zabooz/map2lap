import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {post} from "../../api";
import {serverEdit} from "../state/serverEdit";
import {useToasts, type Posted} from "../../components/toastStore";
import type {CarDensity, EditState, TrackEdits, TreeSpacing} from "../state/edits";
import type {TrackObjects} from "../scene/trackObjects";
import styles from "./SceneryControls.module.css";

/** Reversible thinning of the current selection, or all trees/cars when none of that kind are selected. */
export function SceneryControls({kind, name, edits, state, objects, selection, visible = true}: {
  kind: "trees" | "cars"; name: string; edits: TrackEdits; state: EditState; objects: TrackObjects;
  selection: () => string[]; visible?: boolean;
}) {
  const trees = kind === "trees", title = trees ? "Trees" : "Cars";
  const setting = trees ? state.treeSpacing : state.carDensity;
  const value = trees ? state.treeSpacing?.distance ?? 0 : state.carDensity?.percent ?? 100;
  const [draft, setDraft] = useState(value), [previous, setPrevious] = useState(setting);
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState<Posted | null>(null);
  const alive = useRef(true), pending = useRef(false);
  if (previous !== setting) { setPrevious(setting); setDraft(value); }
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useToasts(visible && notice ? [{...notice, onDismiss: () => setNotice(null)}] : []);
  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useSyncExternalStore(objects.subscribeCounts, objects.countsRevision);
  const selected = selection(), targets = selected.length ? selected : null;
  const removed = [...state.removed.map(r => r.id), ...(state.treeSpacing?.hidden ?? []), ...(state.carDensity?.hidden ?? [])];
  const hidden = new Set(removed);
  const count = targets ? targets.filter(id => !hidden.has(id)).length : trees
    ? objects.countTrees(removed, state.objectSorts) : objects.countOfListed("car", removed, state.objectSorts);
  const original = trees ? objects.countTrees([], []) : objects.countOfListed("car", [], []);
  const toastId = trees ? "tree-spacing-toast" : "car-density-toast";
  const operation = trees ? "tree spacing" : "car density";
  const apply = (next: number) => {
    if (pending.current || !edits.canEdit()) return;
    if (next === value && JSON.stringify(targets) === JSON.stringify(setting?.targets ?? null)) return;
    pending.current = true; setBusy(true);
    setNotice({id: toastId, tone: "info", title: `Adjusting ${kind}…`, dismissible: false,
      progress: {value: null, label: `Adjusting ${kind}`}});
    void serverEdit(edits, {
      ask: (base, revision) => post<{tree_spacing?: TreeSpacing; car_density?: CarDensity}>(
        `/api/editor/${encodeURIComponent(name)}/${trees ? "tree-spacing" : "car-density"}`,
        {base, revision, targets, ...(trees ? {distance: next} : {percent: next})}),
      put: (answer, revision) => {
        const result = trees ? answer.tree_spacing : answer.car_density;
        if (!result) return `Could not change ${operation}`;
        if (edits.state().save !== "saved" || edits.state().keptRevision !== revision) return `The ${kind} changed. Try again.`;
        if (trees) edits.setTreeSpacing(answer.tree_spacing!); else edits.setCarDensity(answer.car_density!);
        return true;
      },
      wanted: () => alive.current, failure: `Could not change ${operation}`, unkept: "The change could not be kept."})
      .then(outcome => {
        pending.current = false;
        if (!alive.current) return;
        setBusy(false);
        if (outcome.state === "applied") {
          const hidden = (trees ? outcome.answer.tree_spacing : outcome.answer.car_density)!.hidden.length;
          setNotice({id: toastId, tone: "success", title: trees ? "Tree spacing updated" : "Car density updated",
            message: `${hidden} ${trees ? hidden === 1 ? "tree" : "trees" : hidden === 1 ? "car" : "cars"} thinned`});
        } else if (outcome.state !== "cancelled") {
          setNotice({id: toastId, tone: "error", title: `Could not change ${operation}`, message: outcome.message});
          setDraft(value);
        }
      });
  };
  return <section className={styles.controls} aria-label={trees ? "Tree spacing" : "Car density"}>
    <h4 className={styles.title}>{title}: {count.toLocaleString()}{targets ? " (selected)" : ""}</h4>
    <label className={styles.field}>{trees ? "Minimum spacing" : "Density"}: <strong>{trees ? draft === 0 ? "Original" : `${draft} m` : `${draft} %`}</strong>
      <input aria-label={trees ? "Tree minimum spacing" : "Parked car density"} type="range" min={0} max={100} step={trees ? .5 : 1}
        value={draft} disabled={busy || !edits.canEdit() || !original}
        onChange={e => setDraft(Number(e.target.value))} onPointerUp={e => apply(Number(e.currentTarget.value))}
        onKeyUp={e => apply(Number(e.currentTarget.value))} onBlur={e => apply(Number(e.currentTarget.value))} />
    </label>
    <p className={styles.hint}>{trees
      ? "Between trunks. 0 restores thinned trees."
      : original ? "100% restores thinned cars."
      : "No editable parked cars in this track."}</p>
  </section>;
}
