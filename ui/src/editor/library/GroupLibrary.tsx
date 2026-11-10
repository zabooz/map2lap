import {useEffect, useState} from "react";
import type {LibraryModel} from "./ModelLibrary";
import {libraryJson} from "./library";
import {LibraryBrowser, LibraryCard, LibraryCards, LibraryNotice, LibraryPages, LibraryPrimary, LibrarySelection} from "./LibraryBrowser";
import {ModelThumbnail} from "./ModelThumbnail";
import type {GroupEntry, ObjectGroup} from "../tools/scatter";
import type {TrackCost} from "./ModelCost";
import {MIN_SCALE, MAX_SCALE} from "../tools/placing";
import styles from "./GroupLibrary.module.css";

const PAGE_SIZE = 40;
interface Catalogue {items: LibraryModel[]; total: number; offset: number}

/** Saved groups are mixtures of library references; choosing Paint freezes a copy for this placement session. */
export function GroupLibrary({open, onChoose, onClose, onBusy}: {open: boolean;
  onChoose: (group: ObjectGroup, models: LibraryModel[]) => void; onClose: () => void; onBusy?: (busy: boolean) => void}) {
  const [groups, setGroups] = useState<ObjectGroup[]>([]), [id, setId] = useState("");
  const [name, setName] = useState(""), [entries, setEntries] = useState<GroupEntry[]>([]);
  const [models, setModels] = useState<Record<string, LibraryModel>>({}), [costs, setCosts] = useState<Record<string, TrackCost>>({});
  const [query, setQuery] = useState(""), [page, setPage] = useState(0), [revision, setRevision] = useState(0);
  const [answer, setAnswer] = useState<{key: string; value: Catalogue} | null>(null), [fault, setFault] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = JSON.stringify([query, page]), result = answer?.key === key ? answer.value : null;
  const refs = entries.map(e => e.model).join(",");
  useEffect(() => { onBusy?.(busy); }, [busy, onBusy]);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    void libraryJson<{items: ObjectGroup[]}>("/api/library/groups", {signal: abort.signal}).then(r => {
      if (!abort.signal.aborted) setGroups(r.items);
    }).catch(error => { if (!abort.signal.aborted) setFault((error as Error).message); });
    return () => abort.abort();
  }, [open, revision]);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    void libraryJson<Catalogue>(`/api/library/models?${new URLSearchParams({q: query, offset: String(page * PAGE_SIZE), limit: String(PAGE_SIZE)})}`,
      {signal: abort.signal}).then(value => {
      if (abort.signal.aborted) return; setAnswer({key, value}); setModels(old => ({...old, ...Object.fromEntries(value.items.map(m => [m.id, m]))}));
    }).catch(error => { if (!abort.signal.aborted) setFault((error as Error).message); });
    return () => abort.abort();
  }, [open, query, page, key]);
  useEffect(() => {
    if (!open || !refs) return;
    const abort = new AbortController();
    for (const model of refs.split(",")) {
      void libraryJson<TrackCost>(`/api/library/models/${model}/cost`, {signal: abort.signal})
        .then(value => { if (!abort.signal.aborted) setCosts(old => ({...old, [model]: value})); }).catch(() => {});
      void libraryJson<LibraryModel>(`/api/library/models/${model}`, {signal: abort.signal})
        .then(value => { if (!abort.signal.aborted) setModels(old => ({...old, [model]: value})); })
        .catch(() => { if (!abort.signal.aborted) setFault("An object in this group is missing. Remove its entry or choose another object."); });
    }
    return () => abort.abort();
  }, [open, refs]);
  const choose = (group?: ObjectGroup) => { setId(group?.id ?? ""); setName(group?.name ?? ""); setEntries(group?.entries.map(e => ({...e})) ?? []); setFault(null); };
  const entryChange = (model: string, change: Partial<GroupEntry>) => setEntries(old => old.map(e => e.model === model ? {...e, ...change} : e));
  const valid = !!name.trim() && name.trim().length <= 100 && entries.length > 0 && entries.length <= 32 && entries.some(e => e.weight > 0)
    && entries.every(e => Number.isFinite(e.weight) && e.weight >= 0 && e.weight <= 1000
      && Number.isFinite(e.minScale) && Number.isFinite(e.maxScale) && e.minScale >= MIN_SCALE && e.maxScale <= MAX_SCALE && e.minScale <= e.maxScale);
  const save = async (paint = false) => {
    if (!valid || busy) return;
    setBusy(true); setFault(null);
    try {
      // Recheck current references before saving, including members outside the current catalogue page.
      const resolved = await Promise.all(entries.map(e => libraryJson<LibraryModel>(`/api/library/models/${e.model}`)));
      const r = await libraryJson<{group: ObjectGroup}>("/api/library/groups", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...(id ? {id} : {}), name, entries})});
      setId(r.group.id); setRevision(v => v + 1);
      setModels(old => ({...old, ...Object.fromEntries(resolved.map(m => [m.id, m]))}));
      if (paint) onChoose(r.group, resolved);
    } catch (error) { setFault((error as Error).message); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!id || !confirm("Delete this group from the library? Already placed objects are kept.")) return;
    setBusy(true);
    try { await libraryJson(`/api/library/groups/${id}/delete`, {method: "POST", headers: {"Content-Type": "application/json"}, body: "{}"});
      choose(); setRevision(v => v + 1);
    } catch (error) { setFault((error as Error).message); } finally { setBusy(false); }
  };
  const total = entries.reduce((n, e) => n + e.weight, 0), measured = entries.length > 0 && entries.every(e => !!costs[e.model]);
  const triangles = measured ? entries.reduce((n, e) => n + costs[e.model].triangles * e.weight / total * 100, 0) : 0;
  return <LibraryBrowser title="Groups" subtitle="Mix objects, then paint them onto the ground" onImport={() => choose()} importLabel="New group" disabled={busy}
    onFiles={() => setFault("Import objects in the Objects tab, then add them to a group.")}
    filters={<>
      <select aria-label="Saved groups" value={id} disabled={busy} onChange={event => choose(groups.find(g => g.id === event.target.value))}>
        <option value="">New group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <input type="search" aria-label="Search group objects" placeholder="Search objects to add" value={query}
        onChange={event => { setQuery(event.target.value); setPage(0); }} />
    </>}
    browser={!result ? <p role="status">Loading objects…</p> : !result.items.length ? <p>No matching objects. Import objects in the Objects tab.</p>
      : <LibraryCards>{result.items.map(m => <LibraryCard key={m.id} label={`Add ${m.name}`} selected={entries.some(e => e.model === m.id)} disabled={busy || entries.length >= 32 && !entries.some(e => e.model === m.id)}
        thumbnail={<ModelThumbnail id={m.id} name={m.name} enabled={open} />} onClick={() => setEntries(old => old.some(e => e.model === m.id)
          ? old.filter(e => e.model !== m.id) : [...old, {model: m.id, weight: 1, minScale: .8, maxScale: 1.2}])} />)}</LibraryCards>}
    pages={result && <LibraryPages page={page} offset={result.offset} total={result.total} limit={PAGE_SIZE} onPage={setPage} />}
    preview={<LibrarySelection>
      <label className={styles.name}>Group name<input aria-label="Group name" value={name} maxLength={100} disabled={busy} onChange={event => setName(event.target.value)} /></label>
      {!entries.length && <p>Choose trees, bushes, grasses, rocks or other objects on the left.</p>}
      {entries.map(e => <div key={e.model} className={styles.entry}>
        <strong>{models[e.model]?.name ?? `Object ${e.model.slice(0, 8)}`}</strong>
        <label>Weight<input aria-label={`Weight ${e.model}`} type="number" min={0} max={1000} value={e.weight} disabled={busy}
          onChange={event => entryChange(e.model, {weight: event.target.valueAsNumber || 0})} /></label>
        <label>Size min %<input aria-label={`Minimum size ${e.model}`} type="number" min={MIN_SCALE * 100} max={MAX_SCALE * 100} value={Math.round(e.minScale * 100)} disabled={busy}
          onChange={event => entryChange(e.model, {minScale: (event.target.valueAsNumber || 0) / 100})} /></label>
        <label>Size max %<input aria-label={`Maximum size ${e.model}`} type="number" min={MIN_SCALE * 100} max={MAX_SCALE * 100} value={Math.round(e.maxScale * 100)} disabled={busy}
          onChange={event => entryChange(e.model, {maxScale: (event.target.valueAsNumber || 0) / 100})} /></label>
        <button type="button" disabled={busy} onClick={() => setEntries(old => old.filter(x => x.model !== e.model))}>Remove {models[e.model]?.name ?? "object"}</button>
      </div>)}
      <p>{entries.length} object types. Rotation is random; plants stay upright.</p>
      {measured && total > 0 && <p>About {Math.round(triangles).toLocaleString("en-US")} triangles per 100 plants. AC geometry grows with every plant.</p>}
      {id && <button type="button" disabled={busy} onClick={() => void remove()}>Delete group</button>}
    </LibrarySelection>}
    notices={fault && <LibraryNotice error>{fault}</LibraryNotice>}
    footer={<><div><strong>{name || "New group"}</strong><p>Weights control the mixture. Placed objects keep their own size and position.</p></div>
      <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
      <button type="button" disabled={busy || !valid} onClick={() => void save()}>Save group</button>
      <LibraryPrimary disabled={busy || !valid} onClick={() => void save(true)}>Paint group</LibraryPrimary>
    </>} />;
}
