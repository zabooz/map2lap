import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {libraryJson} from "./library";
import {ModelPreview} from "./ModelPreview";
import styles from "./ModelLibrary.module.css";

export interface LibraryModel {id: string; name: string; category: string; metres_per_unit: number; anchor: number[]; collision: "none" | "mesh"}
interface Prepared {token: string; geometry: {bounds: number[][]}}

/** Imported models stay in the library until explicitly placed or bound to the selected tree. */
export function ModelLibrary({replace, onChoose, onClose, embedded = false, onBusy}: {replace: string | null; onChoose: (model: LibraryModel, replace: boolean) => void; onClose: () => void; embedded?: boolean; onBusy?: (busy: boolean) => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<LibraryModel[]>([]), [selected, setSelected] = useState<LibraryModel | null>(null);
  const [prepared, setPrepared] = useState<Prepared | null>(null), [filename, setFilename] = useState("");
  const [name, setName] = useState(""), [units, setUnits] = useState("1"), [collision, setCollision] = useState<"none" | "mesh">("none");
  const [busy, setBusy] = useState(false), [fault, setFault] = useState<string | null>(null);
  useEffect(() => { if (embedded) return; const d = dialog.current!; d.showModal(); return () => d.close(); }, [embedded]);
  useEffect(() => { onBusy?.(busy); }, [busy, onBusy]);
  useEffect(() => {
    const controller = new AbortController();
    void libraryJson<{items: LibraryModel[]}>("/api/library/models", {signal: controller.signal})
      .then(value => setItems(value.items)).catch(() => {});
    return () => controller.abort();
  }, []);
  const upload = async (file: File) => {
    setBusy(true); setFault(null);
    try {
      const value = await libraryJson<Prepared>(`/api/library/model-imports?filename=${encodeURIComponent(file.name)}`, {
        method: "POST", headers: {"Content-Type": "application/x-map2lap-glb"}, body: file});
      setPrepared(value); setFilename(file.name); setName(file.name.replace(/\.glb$/i, ""));
    } catch (error) { setFault(error instanceof Error ? error.message : "Could not import model"); }
    finally { setBusy(false); }
  };
  const add = async () => {
    if (!prepared) return;
    setBusy(true); setFault(null);
    try {
      const value = await libraryJson<{model: LibraryModel}>("/api/library/models", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token: prepared.token, filename, name, category: "tree", metres_per_unit: Number(units), collision})});
      setItems(old => [...old.filter(m => m.id !== value.model.id), value.model]); setSelected(value.model); setPrepared(null);
    } catch (error) { setFault(error instanceof Error ? error.message : "Could not store model"); }
    finally { setBusy(false); }
  };
  const content = <>
    <h2>Models</h2>
    <label>Import GLB<input aria-label="Model file" type="file" accept=".glb" disabled={busy}
      onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} /></label>
    {prepared && <div className={styles.settings}>
      <label>Name<input aria-label="Model name" value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Metres per model unit<input type="number" min="0.000001" step="any" value={units} onChange={e => setUnits(e.target.value)} /></label>
      <label>Collision<select value={collision} onChange={e => setCollision(e.target.value as "none" | "mesh")}><option value="none">None</option><option value="mesh">Model mesh</option></select></label>
      <p>The bottom centre is the ground anchor.</p>
      <button type="button" disabled={busy || !name.trim()} onClick={() => void add()}>Add to library</button>
    </div>}
    <div className={styles.content}>
      <div className={styles.list}>{items.map(model => <button type="button" key={model.id} aria-pressed={selected?.id === model.id}
        onClick={() => setSelected(model)}>{model.name}</button>)}</div>
      <div className={styles.details}>{selected ? <><ModelPreview url={`/api/library/models/${selected.id}/original`} />
        <strong>{selected.name}</strong><p>{selected.metres_per_unit} m per unit · Collision: {selected.collision}</p></> : <p>Import or choose a model to preview it.</p>}</div>
    </div>
    {fault && <p role="alert">{fault}</p>}{busy && <p role="status">Preparing model…</p>}
    <div className={styles.actions}>
      <button type="button" disabled={busy} onClick={onClose}>Close</button>
      <button type="button" disabled={busy || !selected || !replace} onClick={() => selected && onChoose(selected, true)}>Replace selected tree</button>
      <button type="button" disabled={busy || !selected} onClick={() => selected && onChoose(selected, false)}>Place on ground</button>
    </div>
  </>;
  if (embedded) return <div className={styles.embedded}>{content}</div>;
  return createPortal(<dialog ref={dialog} className={styles.dialog} aria-label="Models" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>{content}</dialog>, document.body);
}
