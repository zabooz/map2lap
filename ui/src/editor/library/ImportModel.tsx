import {useEffect, useRef, useState} from "react";
import {libraryJson, MODEL_CATEGORIES, prepareModelFile} from "./library";
import type {LibraryModel} from "./ModelLibrary";
import {ModelPreview} from "./ModelPreview";
import styles from "./ImportModel.module.css";
import type {PreparedModel} from "./library";
import {ModelCost} from "./ModelCost";

/** Preview the prepared model used by placement and Save; publishing it does not place it on the track. */
export function ImportModel({file, categories = ["tree", "building", "other"], onCancel, onImported, onBusy}: {
  file: File; categories?: string[]; onCancel: () => void; onImported: (model: LibraryModel) => void; onBusy: (busy: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [prepared, setPrepared] = useState<PreparedModel | null>(null), [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(() => file.name.replace(/\.(glb|fbx|obj|zip)$/i, "").replace(/[_-]+/g, " ").slice(0, 80));
  const [category, setCategory] = useState("tree"), [units, setUnits] = useState("1");
  const [collision, setCollision] = useState<"none" | "mesh">("none");
  const [materialColours, setMaterialColours] = useState("linear");
  const [materialLighting, setMaterialLighting] = useState("model");
  const [textureSide, setTextureSide] = useState(1024);
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
        body: JSON.stringify({token: prepared.token, filename: file.name, name, category, metres_per_unit: Number(units), collision,
          material_colours: materialColours, material_lighting: materialLighting, texture_side: textureSide})});
      onImported(value.model);
    } catch (fault) { setError(fault instanceof Error ? fault.message : "Could not store object"); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} className={styles.dialog} aria-label="Import object"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); if (!saving) onCancel(); }}>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); void add(); }}>
      <h2>Import object</h2><p className={styles.note}>{file.name}</p>
      {prepared && <>
        <ModelPreview url={`/api/library/model-imports/${prepared.token}/preview?${new URLSearchParams({material_colours: materialColours, material_lighting: materialLighting, texture_side: String(textureSide)})}`} height={155} />
        {prepared.geometry.track_cost && <ModelCost cost={prepared.geometry.track_cost} collision={collision} />}
        <label className={styles.field}>Texture size<select value={textureSide} disabled={saving} onChange={event => setTextureSide(Number(event.target.value))}>
          <option value={1024}>1024 px (recommended)</option><option value={2048}>2048 px</option>
        </select></label>
        <p className={styles.note}>Larger images are reduced to this size for the Editor and the track. Smaller ones stay as they are; the original file stays in the library.</p>
        <label className={styles.field}>Material colours<select value={materialColours} disabled={saving} onChange={event => setMaterialColours(event.target.value)}>
          <option value="linear">As stored in model</option><option value="srgb">sRGB (for washed-out colours)</option>
        </select></label>
        <p className={styles.note}>Choose sRGB if solid colours look too pale. The preview updates immediately; texture colours stay unchanged.</p>
        {prepared.lighting_options?.includes('matte') && <><label className={styles.field}>Surface<select value={materialLighting} disabled={saving} onChange={event => setMaterialLighting(event.target.value)}>
          <option value="model">From model</option><option value="matte">Matte colour (no reflections)</option>
        </select></label>
        <p className={styles.note}>Matte colour is for flat-colour artwork such as Kenney nature models. The preview updates immediately.</p></>}
        {prepared.warnings?.map(warning => <p key={warning} className={styles.note}>{warning}</p>)}
        <label className={styles.field}>Name<input aria-label="Model name" value={name} maxLength={80} required disabled={saving} onChange={event => setName(event.target.value)} /></label>
        <label className={styles.field}>Category<select value={category} disabled={saving} onChange={event => setCategory(event.target.value)}>
          {MODEL_CATEGORIES.filter(([id]) => categories.includes(id)).map(([id, label]) => <option value={id} key={id}>{label}</option>)}
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
