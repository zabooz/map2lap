import {memo, useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {ImportMaterial} from "./ImportMaterial";
import {groundTextureProblem, libraryJson, MATERIAL_CATEGORIES, materialPreview, type LibraryMaterial, type MaterialSummary} from "./library";
import styles from "./MaterialLibrary.module.css";

interface Page {items: MaterialSummary[]; total: number; offset: number}
const PAGE_SIZE = 40;

function MaterialDetails({material, variation, onVariation, onDelete, disabled}: {material: MaterialSummary; variation: boolean;
  onVariation: (value: boolean) => void; onDelete: () => void; disabled: boolean}) {
  const [info, setInfo] = useState<LibraryMaterial | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void libraryJson<LibraryMaterial>(`/api/library/materials/${material.id}`, {signal: controller.signal})
      .then(value => { if (!controller.signal.aborted) setInfo(value); }).catch(() => {});
    return () => controller.abort();
  }, [material.id]);
  return <div className={styles.selected}>
    <img src={materialPreview(material.id)} alt="Texture preview" />
    <strong>{material.name}</strong><span>{material.repeat.join(" × ")} m per repeat</span>
    <span>{material.source.size.join(" × ")} px original · {material.prepared.size.join(" × ")} px prepared</span>
    {material.source.alpha && <span>Contains transparency</span>}
    {!!material.tags.length && <span>{material.tags.join(", ")}</span>}
    <label className={styles.variation}><input type="checkbox" checked={variation} disabled={disabled}
      onChange={e => onVariation(e.target.checked)} />Break up texture repetition</label>
    <span>Variation in the game requires CSP.</span>
    {info?.source_url && <span>Source: {info.source_url}</span>}
    {info?.license && <span>License: {info.license}</span>}
    {info?.maps.normal && <span>Normal map: {info.maps.normal.filename}</span>}
    {info?.maps.roughness && <span>Roughness map: {info.maps.roughness.filename}</span>}
    <button type="button" className={styles.delete} onClick={onDelete} disabled={disabled}>Delete texture</button>
  </div>;
}

/** A modal material picker. Browsing changes no track; selection and filters survive closing it. */
export const MaterialLibrary = memo(function MaterialLibrary({open, target, reason, busy, error, onApply, onClose, embedded = false}: {
  open: boolean; target: string | null; reason: string | null; busy: boolean; error: string | null;
  onApply: (id: string, variation?: boolean) => Promise<boolean>; onClose: () => void; embedded?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [answer, setAnswer] = useState<{key: string; value: Page} | null>(null);
  const [failed, setFailed] = useState<{key: string; text: string} | null>(null);
  const [selected, setSelected] = useState<MaterialSummary | null>(null);
  const [variation, setVariation] = useState<boolean | null>(null);
  const [removing, setRemoving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const key = JSON.stringify([query, category, page, revision]);
  const result = answer?.key === key ? answer.value : null;
  const fault = failed?.key === key ? failed.text : null;
  const cancel = useCallback(() => setFile(null), []);
  const applyProblem = groundTextureProblem(selected, reason);
  const blocked = busy || removing;
  const varied = variation ?? selected?.variation ?? (!!selected && ["grass", "asphalt", "rock", "soil", "sand", "snow"].includes(selected.category));

  useEffect(() => {
    if (embedded) return;
    const element = dialog.current!;
    if (open) element.showModal();
    return () => element.close();
  }, [open, embedded]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const params = new URLSearchParams({q: query, category, offset: String(page * PAGE_SIZE), limit: String(PAGE_SIZE)});
    void libraryJson<Page>(`/api/library/materials?${params}`, {signal: controller.signal})
      .then(value => { if (!controller.signal.aborted) setAnswer({key, value}); })
      .catch((e: Error) => { if (!controller.signal.aborted) setFailed({key, text: e.message}); });
    return () => controller.abort();
  }, [open, query, category, page, key]);

  const choose = (files: FileList | null) => {
    if (!files?.length) return;
    if (files.length !== 1) { setNote("Choose one colour image at a time."); return; }
    if (files[0].size > 64 * 1024 * 1024) { setNote("Choose an image up to 64 MB."); return; }
    setNote(null); setFile(files[0]);
  };
  const imported = (material: LibraryMaterial, duplicate: boolean) => {
    setFile(null); setSelected(material); setVariation(null);
    setNote(duplicate ? "This texture is already in your library." : "Texture added to your library.");
    setQuery(""); setCategory(""); setPage(0); setRevision(v => v + 1);
  };
  const remove = async () => {
    if (!selected || blocked || !confirm(`Delete “${selected.name}” from your texture library?\n\nTextures already used in tracks are kept.`)) return;
    setRemoving(true);
    try {
      await libraryJson(`/api/library/materials/${selected.id}/delete`, {method: "POST",
        headers: {"Content-Type": "application/json"}, body: "{}"});
      setSelected(null); setVariation(null); setPage(0); setRevision(v => v + 1);
      setNote("Texture deleted from the library. Existing track appearances are kept.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not delete this texture");
    } finally { setRemoving(false); }
  };

  const content = <>
      <div className={styles.shell}>
        <div className={styles.heading}><div><h2 id="material-picker-title">Textures</h2>
          <p>{target ? `Selected: ${target}` : "Texture library"}</p></div>
          <button type="button" onClick={() => input.current?.click()} disabled={blocked}>Import…</button></div>
        <input className={styles.file} ref={input} type="file" accept=".png,.jpg,.jpeg,.dds" aria-label="Texture file"
          onChange={e => { choose(e.target.files); e.target.value = ""; }} />
        <div className={styles.filters}>
          <input type="search" aria-label="Search textures" placeholder="Search textures" value={query} autoFocus
            onChange={e => { setQuery(e.target.value); setPage(0); }} />
          <select aria-label="Filter textures" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
            <option value="">All categories</option>{MATERIAL_CATEGORIES.map(([id, title]) => <option value={id} key={id}>{title}</option>)}
          </select>
        </div>
        <div className={styles.content}>
          <div className={styles.browser} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!blocked) choose(e.dataTransfer.files); }}>
            {fault ? <p role="alert">{fault}</p> : !result ? <p role="status">Loading textures…</p>
              : !result.items.length ? <p className="muted">{query || category ? "No matching textures." : "No textures yet. Import or drop a colour image here · PNG, JPG, DDS."}</p>
              : <div className={styles.cards}>{result.items.map(material => <button type="button" key={material.id} aria-label={material.name}
                aria-pressed={selected?.id === material.id} className={styles.card} onClick={() => { setSelected(material); setVariation(null); }} disabled={blocked}>
                <img src={materialPreview(material.id)} alt="" loading="lazy" decoding="async" /><span>{material.name}</span>
              </button>)}</div>}
          </div>
          <div className={styles.preview}>{selected ? <MaterialDetails key={selected.id} material={selected} variation={varied}
            onVariation={setVariation} onDelete={() => void remove()} disabled={blocked} />
            : <p className="muted">Choose a texture to preview it. The track changes only when you apply it.</p>}</div>
        </div>
        {result && result.total > PAGE_SIZE && <div className={styles.pages}>
          <button type="button" disabled={!page} onClick={() => setPage(v => v - 1)}>Previous</button>
          <span>{result.offset + 1}–{Math.min(result.total, result.offset + PAGE_SIZE)} of {result.total}</span>
          <button type="button" disabled={result.offset + PAGE_SIZE >= result.total} onClick={() => setPage(v => v + 1)}>Next</button>
        </div>}
        {note && <p role="status" className={styles.note}>{note}</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <div><strong>{target ? `Apply to: ${target}` : "No editable surface selected"}</strong>
            <p>{applyProblem ?? "Appearance changes only. The driving surface stays unchanged."}</p>
            {busy && <progress aria-label="Applying material" />}</div>
          <button type="button" disabled={blocked} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primary} disabled={!selected || !target || !!applyProblem || blocked}
            onClick={() => { if (selected) void onApply(selected.id, varied).then(applied => { if (applied) onClose(); }); }}>
            {busy ? "Applying…" : "Apply"}</button>
        </div>
      </div>
    {file && createPortal(<ImportMaterial file={file} onCancel={cancel} onImported={imported} />, document.body)}
  </>;
  if (embedded) return content;
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-labelledby="material-picker-title"
    onKeyDown={e => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); if (!blocked) onClose(); } }}
    onCancel={e => { e.preventDefault(); if (!blocked) onClose(); }}>{content}</dialog>, document.body);
});
