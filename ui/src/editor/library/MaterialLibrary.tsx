import {memo, useCallback, useEffect, useRef, useState} from "react";
import type {PaintProgress} from "../tools/usePaint";
import {createPortal} from "react-dom";
import {ImportMaterial} from "./ImportMaterial";
import {LibraryBrowser, LibraryCard, LibraryCards, LibraryFacts, LibraryNotice, LibraryPages, LibraryPrimary, LibrarySelection, webSource} from "./LibraryBrowser";
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
  const source = webSource(info?.source_url);
  return <LibrarySelection>
    <img src={materialPreview(material.id)} alt="Texture preview" />
    <strong>{material.name}</strong>
    <span>{MATERIAL_CATEGORIES.find(([id]) => id === material.category)?.[1] ?? material.category}</span>
    <span>{material.repeat.join(" × ")} m per repeat{material.source.alpha && " · Contains transparency"}</span>
    <label className={styles.variation}><input type="checkbox" checked={variation} disabled={disabled}
      onChange={e => onVariation(e.target.checked)} />Break up texture repetition</label>
    <span>Variation in the game requires CSP.</span>
    <LibraryFacts rows={[
      ["Size", `${material.source.size.join(" × ")} px original · ${material.prepared.size.join(" × ")} px prepared`],
      ["Source", source ? <a href={source} target="_blank" rel="noopener noreferrer">View source</a> : info ? "Not specified" : "…"],
      ["Licence", info ? info.license || "Not specified" : "…"],
      ...material.tags.length ? [["Tags", material.tags.join(", ")] as [string, string]] : [],
      ...info?.maps.normal ? [["Normal map", info.maps.normal.filename] as [string, string]] : [],
      ...info?.maps.roughness ? [["Roughness map", info.maps.roughness.filename] as [string, string]] : []]} />
    <button type="button" className={styles.delete} onClick={onDelete} disabled={disabled}>Delete texture</button>
  </LibrarySelection>;
}

/** What an Apply's bar says at each of its steps (usePaint's progress). */
const STEPS: Record<string, string> = {masks: "Taking the selection", preview: "Preparing the preview", loading: "Loading the preview"};

/** A modal material picker. Browsing changes no track; selection and filters survive closing it. */
export const MaterialLibrary = memo(function MaterialLibrary({open, target, reason, limitedTiles, busy, progress, error, onApply, onClose, embedded = false}: {
  open: boolean; target: string | null; reason: string | null; busy: boolean; error: string | null;
  onApply: (id: string, variation?: boolean) => Promise<boolean>; onClose: () => void; embedded?: boolean;
  limitedTiles?: number; progress?: PaintProgress | null;
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
      <input className={styles.file} ref={input} type="file" accept=".png,.jpg,.jpeg,.dds" aria-label="Texture file"
        onChange={e => { choose(e.target.files); e.target.value = ""; }} />
      <LibraryBrowser title="Textures" titleId="material-picker-title" subtitle={target ? `Selected: ${target}` : "Texture library"}
        onImport={() => input.current?.click()} disabled={blocked} onFiles={choose}
        filters={<>
          <input type="search" aria-label="Search textures" placeholder="Search textures" value={query} autoFocus
            onChange={e => { setQuery(e.target.value); setPage(0); }} />
          <select aria-label="Filter textures" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}>
            <option value="">All categories</option>{MATERIAL_CATEGORIES.map(([id, title]) => <option value={id} key={id}>{title}</option>)}
          </select>
        </>}
        browser={fault ? <p role="alert">{fault}</p> : !result ? <p role="status">Loading textures…</p>
              : !result.items.length ? <p className="muted">{query || category ? "No matching textures." : "No textures yet. Import or drop a colour image here · PNG, JPG, DDS."}</p>
              : <LibraryCards>{result.items.map(material => <LibraryCard key={material.id} label={material.name}
                selected={selected?.id === material.id} onClick={() => { setSelected(material); setVariation(null); }} disabled={blocked}
                thumbnail={<img src={materialPreview(material.id)} alt="" loading="lazy" decoding="async" />} />)}</LibraryCards>}
        preview={selected ? <MaterialDetails key={selected.id} material={selected} variation={varied}
            onVariation={setVariation} onDelete={() => void remove()} disabled={blocked} />
            : <p className="muted">Choose a texture to preview it. The track changes only when you apply it.</p>}
        pages={result && <LibraryPages page={page} offset={result.offset} total={result.total} limit={PAGE_SIZE} onPage={setPage} />}
        notices={<>{note && <LibraryNotice>{note}</LibraryNotice>}{error && <LibraryNotice error>{error}</LibraryNotice>}</>}
        footer={<>
          <div><strong>{target ? `Apply to: ${target}` : "No editable surface selected"}</strong>
            <p>{applyProblem ?? "Appearance changes only. The driving surface stays unchanged."}</p>
            {!!limitedTiles && <p>Selection is incomplete. Only the highlighted areas in {limitedTiles} tiles will change; the rest stays unchanged.</p>}
            {busy && (progress?.total
              ? <><progress aria-label="Applying material" value={progress.done} max={progress.total} />
                <p>{STEPS[progress.phase] ?? "Applying"}: {progress.done} of {progress.total}{progress.phase === "loading" ? "" : " tiles"}</p></>
              : <progress aria-label="Applying material" />)}</div>
          <button type="button" disabled={blocked} onClick={onClose}>Cancel</button>
          <LibraryPrimary disabled={!selected || !target || !!applyProblem || blocked}
            onClick={() => { if (selected) void onApply(selected.id, varied).then(applied => { if (applied) onClose(); }); }}>
            {busy ? "Applying…" : limitedTiles ? `Apply to ${limitedTiles} tiles` : "Apply"}</LibraryPrimary>
        </>} />
    {file && createPortal(<ImportMaterial file={file} onCancel={cancel} onImported={imported} />, document.body)}
  </>;
  if (embedded) return content;
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-labelledby="material-picker-title"
    onKeyDown={e => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); if (!blocked) onClose(); } }}
    onCancel={e => { e.preventDefault(); if (!blocked) onClose(); }}>{content}</dialog>, document.body);
});
