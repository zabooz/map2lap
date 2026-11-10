import {useEffect, useRef, useState} from "react";
import {libraryJson, MODEL_CATEGORIES, prepareModelFile} from "./library";
import type {LibraryModel} from "./ModelLibrary";
import {ModelPreview} from "./ModelPreview";
import styles from "./ImportModel.module.css";
import type {PreparedModel, PreparedGeometry} from "./library";
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
  const [simplifyLevel, setSimplifyLevel] = useState(100);
  // Measured levels by token/level; Original is the prepared model itself. The last ready level stays shown until the next one is.
  const [levels, setLevels] = useState<Record<string, PreparedGeometry>>({});
  const [shownLevel, setShownLevel] = useState(100);
  const measured = (level: number): PreparedGeometry | null => !prepared ? null
    : level === 100 ? {geometry: prepared.geometry, simplification: "original"} : levels[`${prepared.token}/${level}`] ?? null;
  const selected = measured(simplifyLevel), selecting = !!prepared && !selected;
  const displayed = selected ? simplifyLevel : shownLevel, shown = measured(displayed);
  if (displayed !== shownLevel) setShownLevel(displayed);
  const looks = new URLSearchParams({material_colours: materialColours, material_lighting: materialLighting,
    texture_side: String(textureSide), simplify_level: String(displayed)}).toString();
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
  useEffect(() => {
    if (!prepared || simplifyLevel === 100 || levels[`${prepared.token}/${simplifyLevel}`]) return;
    const controller = new AbortController(), key = `${prepared.token}/${simplifyLevel}`;
    const query = new URLSearchParams({texture_side: String(textureSide), simplify_level: String(simplifyLevel)});
    void libraryJson<PreparedGeometry>(`/api/library/model-imports/${prepared.token}/info?${query}`, {signal: controller.signal})
      .then(value => { if (!controller.signal.aborted) { setLevels(known => ({...known, [key]: value})); setError(null); } })
      .catch((fault: Error) => { if (!controller.signal.aborted) setError(fault.message); });
    return () => controller.abort();
  }, [prepared, simplifyLevel, textureSide, levels]);
  const add = async () => {
    if (!prepared || saving || selecting) return;
    setSaving(true); setError(null);
    try {
      const value = await libraryJson<{model: LibraryModel}>("/api/library/models", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token: prepared.token, filename: file.name, name, category, metres_per_unit: Number(units), collision,
          material_colours: materialColours, material_lighting: materialLighting, texture_side: textureSide, simplify_level: simplifyLevel})});
      onImported(value.model);
    } catch (fault) { setError(fault instanceof Error ? fault.message : "Could not store object"); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} className={styles.dialog} aria-label="Import object"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); if (!saving) onCancel(); }}>
    <form className={styles.form} onSubmit={event => { event.preventDefault(); void add(); }}>
      <h2>Import object</h2><p className={styles.note}>{file.name}</p>
      {prepared && <>
        <ModelPreview url={`/api/library/model-imports/${prepared.token}/preview?${looks}`} height={155} />
        {shown?.geometry.track_cost && <ModelCost cost={shown.geometry.track_cost} collision={collision} />}
        <label className={styles.field}>Geometry<select value={simplifyLevel} disabled={saving} onChange={event => setSimplifyLevel(Number(event.target.value))}>
          <option value={100}>Original</option><option value={75}>75%</option><option value={50}>50%</option><option value={25}>25%</option>
        </select></label>
        <p className={styles.note}>Target triangle count. Preserves material and shading seams; the original file stays in the library.</p>
        <p role="status" className={styles.status}>{selecting ? (error ? "" : "Preparing selected geometry…")
          : selected?.simplification === "no_gain" ? "No further reduction possible."
          : selected?.simplification === "limited" ? "Reduced as far as possible while preserving model details." : ""}</p>
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
        <button type="submit" className={styles.primary} disabled={!prepared || selecting || !name.trim() || saving}>Add to library</button></div>
    </form>
  </dialog>;
}
