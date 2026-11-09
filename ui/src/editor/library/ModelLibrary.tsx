import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {libraryJson, MODEL_CATEGORIES} from "./library";
import {ImportModel} from "./ImportModel";
import {LibraryBrowser, LibraryCard, LibraryCards, LibraryNotice, LibraryPages, LibraryPrimary, LibrarySelection} from "./LibraryBrowser";
import {ModelThumbnail} from "./ModelThumbnail";
import {ModelDetails, modelName} from "./ModelDetails";
import styles from "./ModelLibrary.module.css";

export interface LibraryModel {id: string; name: string; category: string; metres_per_unit: number; anchor: number[]; collision: "none" | "mesh";
  creator?: string; source_url?: string; license?: string; tags?: string[]}
interface Page {items: LibraryModel[]; total: number; offset: number; categories?: string[]}
const PAGE_SIZE = 40;

/** Imported models stay in the library until explicitly placed or bound to the selected tree. */
export function ModelLibrary({replace, onChoose, onClose, embedded = false, open = true, onBusy}: {replace: number; onChoose: (model: LibraryModel, replace: boolean) => void; onClose: () => void; embedded?: boolean; open?: boolean; onBusy?: (busy: boolean) => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<LibraryModel | null>(null), [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState(""), [category, setCategory] = useState(""), [page, setPage] = useState(0), [revision, setRevision] = useState(0);
  const [answer, setAnswer] = useState<{key: string; value: Page} | null>(null);
  const [failed, setFailed] = useState<{key: string; text: string} | null>(null);
  const [busy, setBusy] = useState(false), [note, setNote] = useState<string | null>(null);
  const key = JSON.stringify([query, category, page, revision]);
  const result = answer?.key === key ? answer.value : null, fault = failed?.key === key ? failed.text : null;
  const categories = answer?.value.categories ?? ["tree", "building", "other"];
  useEffect(() => { if (embedded) return; const d = dialog.current!; if (open) d.showModal(); return () => d.close(); }, [embedded, open]);
  useEffect(() => { onBusy?.(busy); }, [busy, onBusy]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const params = new URLSearchParams({q: query, category, offset: String(page * PAGE_SIZE), limit: String(PAGE_SIZE)});
    void libraryJson<Page>(`/api/library/models?${params}`, {signal: controller.signal})
      .then(value => { if (!controller.signal.aborted) setAnswer({key, value}); })
      .catch((error: Error) => { if (!controller.signal.aborted) setFailed({key, text: error.message}); });
    return () => controller.abort();
  }, [open, query, category, page, key]);
  const choose = (files: FileList | null) => {
    if (!files?.length) return;
    if (files.length !== 1) { setNote("Choose one object at a time."); return; }
    if (!/\.(glb|fbx|obj|zip)$/i.test(files[0].name)) { setNote("Choose a GLB, FBX, OBJ or model ZIP."); return; }
    if (files[0].size > 128 * 1024 * 1024) { setNote("Choose a model up to 128 MB."); return; }
    setNote(null); setFile(files[0]);
  };
  const imported = (model: LibraryModel) => {
    setFile(null); setSelected(model); setQuery(""); setCategory(""); setPage(0); setRevision(value => value + 1);
    setNote("Object added to your library.");
  };
  const content = <>
    <input className={styles.file} ref={input} aria-label="Model file" type="file" accept=".glb,.fbx,.obj,.zip" disabled={busy}
      onChange={event => { choose(event.target.files); event.target.value = ""; }} />
    <LibraryBrowser title="Objects" subtitle={replace ? `Selected: ${replace} ${replace === 1 ? "tree" : "trees"}` : "Object library"}
      onImport={() => input.current?.click()} disabled={busy} onFiles={choose}
      filters={<>
        <input type="search" aria-label="Search objects" placeholder="Search objects" value={query} autoFocus onChange={event => { setQuery(event.target.value); setPage(0); }} />
        <select aria-label="Filter objects" value={category} onChange={event => { setCategory(event.target.value); setPage(0); }}>
          <option value="">All categories</option>{MODEL_CATEGORIES.filter(([id]) => categories.includes(id)).map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </>}
      browser={fault ? <p role="alert">{fault}</p> : !result ? <p role="status">Loading objects…</p>
        : !result.items.length ? <p className="muted">{query || category ? "No matching objects." : "Import GLB, FBX or OBJ. Include companion textures and MTL files in a ZIP with one model."}</p>
        : <LibraryCards>{result.items.map(model => <LibraryCard key={model.id} label={modelName(model)} selected={selected?.id === model.id}
          disabled={busy} onClick={() => setSelected(model)} thumbnail={<ModelThumbnail id={model.id} name={modelName(model)} enabled={open} />} />)}</LibraryCards>}
      preview={selected ? <LibrarySelection><ModelThumbnail key={selected.id} id={selected.id} name={modelName(selected)} enabled={open} preview />
        <ModelDetails model={selected} />
      </LibrarySelection> : <p className="muted">Choose an object to preview it. The track changes only when you place or replace it.</p>}
      pages={result && <LibraryPages page={page} offset={result.offset} total={result.total} limit={PAGE_SIZE} onPage={setPage} />}
      notices={note && <LibraryNotice>{note}</LibraryNotice>}
      footer={<>
        <div><strong>{replace ? `Replace ${replace} selected ${replace === 1 ? "tree" : "trees"}` : "Place an object on the ground"}</strong>
          <p>{replace ? "Positions and tree heights are kept; the new model retains its proportions." : "Choose an object, then click the ground to place it."}</p></div>
        <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
        {replace > 0 && <button type="button" disabled={busy || !selected} onClick={() => selected && onChoose(selected, true)}>{replace > 1 ? `Replace ${replace} selected trees` : "Replace selected tree"}</button>}
        <LibraryPrimary disabled={busy || !selected} onClick={() => selected && onChoose(selected, false)}>Place on ground</LibraryPrimary>
      </>} />
    {file && createPortal(<ImportModel file={file} categories={categories} onCancel={() => setFile(null)} onImported={imported} onBusy={setBusy} />, document.body)}
  </>;
  if (embedded) return content;
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-label="Models" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>{content}</dialog>, document.body);
}
