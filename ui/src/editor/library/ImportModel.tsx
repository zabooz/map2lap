import {useEffect, useRef, useState} from "react";
import {libraryJson, MODEL_CATEGORIES, prepareModelFile} from "./library";
import type {LibraryModel} from "./ModelLibrary";
import {ModelPreview} from "./ModelPreview";
import styles from "./ImportModel.module.css";
import type {PreparedModel, PreparedGeometry} from "./library";
import {CostBudget, ModelCost} from "./ModelCost";

const LEVELS = [100, 75, 50, 25];     // (the server's simplification levels, from the original down: the slider's steps)
const levelName = (level: number) => level === 100 ? "Original" : `${level}%`;

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
  const [simplifyLevel, setSimplifyLevel] = useState(50);     // (half the triangles: the simplifier stops before it would show, where it cannot it says so)
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
      <h2 title={file.name}>Import object: <span className={styles.file}>{file.name}</span></h2>
      {prepared && <div className={styles.columns}><div className={styles.look}>
        <ModelPreview url={`/api/library/model-imports/${prepared.token}/preview?${looks}`} />
        {shown?.geometry.track_cost && <ModelCost cost={shown.geometry.track_cost} collision={collision} busy={selecting && !error} budget={false} />}
        <div className={styles.rows}>
          <label className={styles.field}>Name<input aria-label="Model name" value={name} maxLength={80} required disabled={saving} onChange={event => setName(event.target.value)} /></label>
          <label className={styles.field}>Category<select value={category} disabled={saving} onChange={event => setCategory(event.target.value)}>
            {MODEL_CATEGORIES.filter(([id]) => categories.includes(id)).map(([id, label]) => <option value={id} key={id}>{label}</option>)}
          </select></label>
          <label className={styles.field}>Collision<select value={collision} disabled={saving} onChange={event => setCollision(event.target.value as "none" | "mesh")}>
            <option value="none">None</option><option value="mesh">Model mesh</option>
          </select></label>
        </div>
      </div><div className={styles.settings}>
        {shown?.geometry.track_cost && <CostBudget cost={shown.geometry.track_cost} collision={collision} />}
        {prepared.warnings?.map(warning => <p key={warning} className={styles.note}>{warning}</p>)}
        <div className={styles.geometry}>
          <label htmlFor="import-geometry">Geometry: <span className={styles.level}>{levelName(simplifyLevel)}{selected?.simplification === "no_gain" ? " · no further reduction"
            : selected?.simplification === "limited" ? " · reduced as far as details allow" : ""}</span></label>
          <input id="import-geometry" type="range" min={0} max={LEVELS.length - 1} step={1} value={LEVELS.indexOf(simplifyLevel)} disabled={saving}
                 aria-label="Geometry" aria-valuetext={levelName(simplifyLevel)} onChange={event => setSimplifyLevel(LEVELS[Number(event.target.value)])} />
          <div className={styles.marks} data-marks aria-hidden="true">{LEVELS.map(level => <span key={level}>{levelName(level)}</span>)}</div>
          <p className={styles.note}>Target triangle count. Material and shading seams are kept.</p>
        </div>
        <div className={styles.rows}>
          <label className={styles.field}><span className={styles.hinted} title="Larger images are reduced to this size for the Editor and the track. Smaller ones stay as they are.">Texture size</span>
            <select value={textureSide} disabled={saving} onChange={event => setTextureSide(Number(event.target.value))}>
              <option value={1024}>1024 px (recommended)</option><option value={2048}>2048 px</option>
            </select></label>
          <label className={styles.field}><span className={styles.hinted} title="Choose sRGB if solid colours look too pale; texture colours stay unchanged.">Material colours</span>
            <select value={materialColours} disabled={saving} onChange={event => setMaterialColours(event.target.value)}>
              <option value="linear">As stored in model</option><option value="srgb">sRGB (for washed-out colours)</option>
            </select></label>
          {prepared.lighting_options?.includes('matte') && <label className={styles.field}>
            <span className={styles.hinted} title="Matte colour is for flat-colour artwork such as Kenney nature models.">Surface</span>
            <select value={materialLighting} disabled={saving} onChange={event => setMaterialLighting(event.target.value)}>
              <option value="model">From model</option><option value="matte">Matte colour (no reflections)</option>
            </select></label>}
          <label className={styles.field}>Metres per unit<input type="number" min="0.000001" step="any" required value={units} disabled={saving} onChange={event => setUnits(event.target.value)} /></label>
        </div>
      </div></div>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {(loading || saving) && <div role="status" className={styles.waiting}>{saving ? "Adding to library…" : "Preparing object…"}<progress aria-label="Importing object" /></div>}
      <div className={styles.buttons}><button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className={styles.primary} disabled={!prepared || selecting || !name.trim() || saving}>Add to library</button></div>
    </form>
  </dialog>;
}
