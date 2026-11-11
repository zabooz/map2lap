import {useEffect, useRef, useState} from "react";
import {libraryJson, MATERIAL_CATEGORIES, materialPreview, prepareMaterialImage, repeatHeight, type LibraryMaterial, type PreparedImport} from "./library";
import styles from "./ImportMaterial.module.css";
import frame from "./ImportDialog.module.css";

type ExtraRole = "normal" | "roughness";
interface ExtraMap {file: File; prepared?: PreparedImport; error?: string}
const EXTRA_MAPS = [["normal", "Normal map"], ["roughness", "Roughness map"]] as const;
/** What each map does, shown under its field, and what the surface is without it. */
export const MAP_HELP: Record<"colour" | ExtraRole, string> = {
  colour: "Colour: the colour and pattern of the surface.",
  normal: "Small bumps in the light; changes neither the geometry nor the driving. Without one, the surface adds no bumps.",
  roughness: "Light is rough and matte, dark smooth and shiny. Without one, the surface is rough.",
};

/** A portable material, previewed before importing copies, in the object import's look (ImportDialog.module.css). Native modal focus
    keeps typing out of Editor shortcuts. */
export function ImportMaterial({file, onCancel, onImported}: {file: File; onCancel: () => void;
  onImported: (material: LibraryMaterial, duplicate: boolean) => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [prepared, setPrepared] = useState<PreparedImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(() => file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 80));
  const [category, setCategory] = useState(() => /grass|meadow|lawn/i.test(file.name) ? "grass" : /asphalt/i.test(file.name) ? "asphalt" : "other");
  const [width, setWidth] = useState("2");
  const [height, setHeight] = useState<string | null>(null);
  const [variation, setVariation] = useState<boolean | null>(null);
  const natural = ["grass", "asphalt", "rock", "soil", "sand", "snow"].includes(category);
  const [source, setSource] = useState("");
  const [license, setLicense] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [maps, setMaps] = useState<Partial<Record<ExtraRole, ExtraMap>>>({});
  const mapRequests = useRef<Partial<Record<ExtraRole, AbortController>>>({});
  const mapInputs = useRef<Partial<Record<ExtraRole, HTMLInputElement>>>({});
  const defaultHeight = repeatHeight(width, prepared?.source.size);
  const mapsReady = Object.values(maps).every(map => !map || !!map.prepared);

  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    return () => el.close();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void prepareMaterialImage(file, "colour", controller.signal)
      .then(result => { if (!controller.signal.aborted) setPrepared(result); })
      .catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [file]);

  useEffect(() => {
    const requests = mapRequests.current;
    return () => { for (const request of Object.values(requests)) request?.abort(); };
  }, []);

  const chooseMap = (role: ExtraRole, file?: File) => {
    mapRequests.current[role]?.abort();
    setMaps(previous => ({...previous, [role]: file ? {file} : undefined}));
    if (!file) {
      const input = mapInputs.current[role];
      if (input) input.value = "";
      return;
    }
    const controller = new AbortController();
    mapRequests.current[role] = controller;
    void prepareMaterialImage(file, role, controller.signal).then(result => {
      if (!controller.signal.aborted) setMaps(previous => ({...previous, [role]: {file, prepared: result}}));
    }).catch((e: Error) => {
      if (!controller.signal.aborted) setMaps(previous => ({...previous, [role]: {file, error: e.message}}));
    });
  };

  const submit = async () => {
    if (!prepared || !mapsReady || saving) return;
    setSaving(true);
    setError(null);
    try {
      const result = await libraryJson<{material: LibraryMaterial; duplicate: boolean}>("/api/library/materials", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({token: prepared.token, filename: file.name,
          name, category, repeat: [Number(width), Number(height ?? defaultHeight)], variation: variation ?? natural, source, license,
          maps: Object.fromEntries(EXTRA_MAPS.flatMap(([role]) => maps[role]?.prepared
            ? [[role, {token: maps[role].prepared.token, filename: maps[role].file.name}]] : [])),
          tags: tags.split(",").map(t => t.trim()).filter(Boolean)}),
      });
      onImported(result.material, result.duplicate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import this material");
      setSaving(false);
    }
  };

  return <dialog ref={dialog} className={frame.dialog} aria-label="Import texture"
    onCancel={e => { e.preventDefault(); if (!saving) onCancel(); }}
    onClick={e => { const r = e.currentTarget.getBoundingClientRect();
      if (e.target === e.currentTarget && !saving && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) onCancel(); }}>
    <form className={frame.form} onSubmit={e => { e.preventDefault(); void submit(); }}>
      <h2 title={file.name}>Import texture: <span className={frame.file}>{file.name}</span></h2>
      {!prepared && !error && <div role="status" className={frame.waiting}>Preparing image…<progress aria-label="Preparing material" /></div>}
      {prepared && <div className={frame.columns}><div className={frame.look}>
        <img className={styles.preview} src={materialPreview(prepared.token, true)} alt="Texture preview" />
        <p className={frame.note}>{prepared.source.size.join(" × ")} px original · {prepared.prepared.size.join(" × ")} px prepared
          {prepared.source.alpha && " · Contains transparency"}</p>
        <p className={frame.note}>{MAP_HELP.colour}</p>
        <div className={frame.rows}>
          <label className={frame.field}>Name<input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={80} required autoFocus disabled={saving} /></label>
          <label className={frame.field}>Category<select value={category} onChange={e => setCategory(e.target.value)} disabled={saving}>
            {MATERIAL_CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          <div className={frame.field}><span className={frame.hinted} title="The ground one texture repeat covers, in metres.">Repeat (m)</span>
            <span className={styles.repeat}>
              <input type="number" aria-label="Width (m)" min="0.01" max="10000" step="any" value={width} onChange={e => setWidth(e.target.value)} required disabled={saving} />
              ×
              <input type="number" aria-label="Height (m)" min="0.01" max="10000" step="any" value={height ?? defaultHeight} onChange={e => setHeight(e.target.value)} required disabled={saving} />
            </span></div>
        </div>
      </div><div className={frame.settings}>
        {EXTRA_MAPS.map(([role, label]) => <div key={role} className={styles.map}>
          <label className={frame.field}><span className={frame.hinted} title={role === "normal" ? "Optional. Normal: +Y. The original file is kept."
            : "Optional. Black is smooth, white is rough. The original file is kept."}>{label}</span>
            <input type="file" accept=".png,.jpg,.jpeg,.dds" aria-label={`${label} (optional)`}
              ref={input => { mapInputs.current[role] = input ?? undefined; }} disabled={saving}
              onChange={e => { const file = e.target.files?.[0]; if (file) chooseMap(role, file); }} /></label>
          <p className={frame.note}>Optional. {MAP_HELP[role]}</p>
          {maps[role] && <p className={styles.mapState}>
            {maps[role].error ? <span role="alert" className={frame.error}>{label}: {maps[role].error}</span>
              : !maps[role].prepared ? <span role="status">Preparing {label.toLowerCase()}…</span>
                : <span>{maps[role].prepared.source.size.join(" × ")} px original · Ready</span>}
            <button type="button" onClick={() => chooseMap(role)} disabled={saving}>Remove {label.toLowerCase()}</button>
          </p>}
        </div>)}
        <label className={styles.variation} title="Variation in the game requires CSP. Leave it off for regular patterns such as tiles or brickwork.">
          <input type="checkbox" checked={variation ?? natural} onChange={e => setVariation(e.target.checked)} disabled={saving} />
          <span className={frame.hinted}>Break up texture repetition</span></label>
        <div className={frame.rows}>
          <label className={frame.field}><span className={frame.hinted} title="Comma separated">Tags</span>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} maxLength={800} disabled={saving} /></label>
          <label className={frame.field}>Source URL<input type="url" value={source} onChange={e => setSource(e.target.value)} maxLength={500} disabled={saving} /></label>
          <label className={frame.field}>License<input type="text" value={license} onChange={e => setLicense(e.target.value)} maxLength={200} disabled={saving} /></label>
        </div>
      </div></div>}
      {error && <p role="alert" className={frame.error}>{error}</p>}
      {saving && <div role="status" className={frame.waiting}>Adding to library…<progress aria-label="Importing material" /></div>}
      <div className={frame.buttons}><button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className={frame.primary} disabled={!prepared || !mapsReady || saving}>Add to library</button></div>
    </form>
  </dialog>;
}
