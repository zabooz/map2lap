import {useEffect, useRef, useState} from "react";
import {libraryJson, MODEL_CATEGORIES, prepareModelFile} from "./library";
import type {LibraryModel} from "./ModelLibrary";
import {ModelPreview} from "./ModelPreview";
import styles from "./ImportModel.module.css";

interface Prepared {token: string; geometry: {bounds: number[][]}; warnings?: string[]}

/** Preview the prepared model used by placement and Save; publishing it does not place it on the track. */
export function ImportModel({file, onCancel, onImported, onBusy}: {
  file: File; onCancel: () => void; onImported: (model: LibraryModel) => void; onBusy: (busy: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [prepared, setPrepared] = useState<Prepared | null>(null), [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(() => file.name.replace(/\.(glb|fbx|obj|zip)$/i, "").replace(/[_-]+/g, " ").slice(0, 80));
  const [category, setCategory] = useState("tree"), [units, setUnits] = useState("1");
  const [collision, setCollision] = useState<"none" | "mesh">("none");
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  useEffect(() => { onBusy(loading || saving); return () => onBusy(false); }, [loading, saving, onBusy]);
  useEffect(() => {
    const controller = new AbortController();
    void prepareModelFile(file, controller.signal).then(value => { if (!controller.signal.aborted) setPrepared(value); })
      .catch((fault: Error) => { if (!controller.signal.aborted) setError(fault.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [file]);
  const add = async () => {
    if (!prepared || saving) return;
    setSaving(true); setError(null);
    try {
      const value = await libraryJson<{model: LibraryModel}>("/api/library/models", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token: prepared.token, filename: file.name, name, category, metres_per_unit: Number(units), collision})});
      onImported(value.model);
    } catch (fault) { setError(fault instanceof Error ? fault.message : "Could not store object"); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} className={styles.dialog} aria-label="Import object"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); if (!saving) onCancel(); }}>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); void add(); }}>
      <h2>Import object</h2><p className={styles.note}>{file.name}</p>
      {prepared && <>
        <ModelPreview url={`/api/library/model-imports/${prepared.token}/preview`} height={155} />
        {prepared.warnings?.map(warning => <p key={warning} className={styles.note}>{warning}</p>)}
        <label className={styles.field}>Name<input aria-label="Model name" value={name} maxLength={80} required disabled={saving} onChange={event => setName(event.target.value)} /></label>
        <label className={styles.field}>Category<select value={category} disabled={saving} onChange={event => setCategory(event.target.value)}>
          {MODEL_CATEGORIES.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
        </select></label>
        <label className={styles.field}>Metres per model unit<input type="number" min="0.000001" step="any" required value={units} disabled={saving} onChange={event => setUnits(event.target.value)} /></label>
        <label className={styles.field}>Collision<select value={collision} disabled={saving} onChange={event => setCollision(event.target.value as "none" | "mesh")}>
          <option value="none">None</option><option value="mesh">Model mesh</option>
        </select></label>
        <p className={styles.note}>The bottom centre is the ground anchor. Importing adds the object to your library.</p>
      </>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {(loading || saving) && <div role="status" className={styles.waiting}>{saving ? "Adding to library…" : "Preparing object…"}<progress aria-label="Importing object" /></div>}
      <div className={styles.buttons}><button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className={styles.primary} disabled={!prepared || !name.trim() || saving}>Add to library</button></div>
    </form>
  </dialog>;
}
