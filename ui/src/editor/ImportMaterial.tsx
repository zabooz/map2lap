import {useEffect, useRef, useState} from "react";
import {libraryJson, MATERIAL_CATEGORIES, materialPreview, repeatHeight, type LibraryMaterial, type PreparedImport} from "./library";
import styles from "./ImportMaterial.module.css";

/** One image, previewed before importing a copy. Native modal focus keeps typing out of the Editor's shortcuts. */
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
  const defaultHeight = repeatHeight(width, prepared?.source.size);

  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    return () => el.close();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void libraryJson<PreparedImport>(`/api/library/imports?${new URLSearchParams({filename: file.name})}`, {
      method: "POST", headers: {"Content-Type": "application/x-map2lap-image"}, body: file, signal: controller.signal,
    }).then(result => { if (!controller.signal.aborted) setPrepared(result); })
      .catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [file]);

  const submit = async () => {
    if (!prepared || saving) return;
    setSaving(true);
    setError(null);
    try {
      const result = await libraryJson<{material: LibraryMaterial; duplicate: boolean}>("/api/library/materials", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({token: prepared.token, filename: file.name,
          name, category, repeat: [Number(width), Number(height ?? defaultHeight)], variation: variation ?? natural, source, license,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean)}),
      });
      onImported(result.material, result.duplicate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import this material");
      setSaving(false);
    }
  };

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="import-material-title"
    onCancel={e => { e.preventDefault(); if (!saving) onCancel(); }}
    onClick={e => { const r = e.currentTarget.getBoundingClientRect();
      if (e.target === e.currentTarget && !saving && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) onCancel(); }}>
    <form className={styles.form} onSubmit={e => { e.preventDefault(); void submit(); }}>
      <h2 id="import-material-title">Import texture</h2>
      <p className={styles.note}>{file.name} · The original image is kept in your library.</p>
      {!prepared && !error && <div role="status" className={styles.waiting}>Preparing image…<progress aria-label="Preparing material" /></div>}
      {prepared && <>
        <img className={styles.preview} src={materialPreview(prepared.token, true)} alt="Texture preview" />
        <p className={styles.note}>Original: {prepared.source.size.join(" × ")} px. Prepared: {prepared.prepared.size.join(" × ")} px.
          {prepared.source.alpha && " Contains transparency."}</p>
        <label className={styles.field}>Name<input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={80} required autoFocus disabled={saving} /></label>
        <label className={styles.field}>Category<select value={category} onChange={e => setCategory(e.target.value)} disabled={saving}>
          {MATERIAL_CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <fieldset className={styles.repeat}><legend>One texture repeat covers</legend>
          <label className={styles.field}>Width (m)<input type="number" min="0.01" max="10000" step="any" value={width} onChange={e => setWidth(e.target.value)} required disabled={saving} /></label>
          <label className={styles.field}>Height (m)<input type="number" min="0.01" max="10000" step="any" value={height ?? defaultHeight} onChange={e => setHeight(e.target.value)} required disabled={saving} /></label>
        </fieldset>
        <label className={styles.variation}><input type="checkbox" checked={variation ?? natural}
          onChange={e => setVariation(e.target.checked)} disabled={saving} />Break up texture repetition</label>
        <p className={styles.note}>Variation in the game requires CSP. Leave it off for regular patterns such as tiles or brickwork.</p>
        <details className={styles.more}><summary>Tags and source</summary>
          <label className={styles.field}>Tags (comma separated)<input type="text" value={tags} onChange={e => setTags(e.target.value)} maxLength={800} disabled={saving} /></label>
          <label className={styles.field}>Source URL<input type="url" value={source} onChange={e => setSource(e.target.value)} maxLength={500} disabled={saving} /></label>
          <label className={styles.field}>License<input type="text" value={license} onChange={e => setLicense(e.target.value)} maxLength={200} disabled={saving} /></label>
        </details>
      </>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {saving && <div role="status" className={styles.waiting}>Adding to library…<progress aria-label="Importing material" /></div>}
      <div className={styles.buttons}><button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className={styles.primary} disabled={!prepared || saving}>Add to library</button></div>
    </form>
  </dialog>;
}
