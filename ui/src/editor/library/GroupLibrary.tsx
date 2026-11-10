import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import type {LibraryModel} from "./ModelLibrary";
import {libraryJson} from "./library";
import {LibraryBrowser, LibraryCard, LibraryCards, LibraryNotice, LibraryPages, LibraryPrimary, LibrarySelection} from "./LibraryBrowser";
import {ModelThumbnail} from "./ModelThumbnail";
import type {GroupEntry, ObjectGroup} from "../tools/scatter";
import type {TrackCost} from "./ModelCost";
import {entriesValid, groupCost, groupShares} from "./groupMix";
import {GroupPatch} from "./GroupPatch";
import {GroupSettings} from "./GroupSettings";
import styles from "./GroupLibrary.module.css";

const PAGE_SIZE = 40;
interface Catalogue {items: LibraryModel[]; total: number; offset: number}
/** A group's name and objects as the library keeps them (random on unless switched off), to see whether it changed. Pure. */
const sameShape = (name: string, entries: GroupEntry[], randomPosition?: boolean) =>
  [name.trim(), entries.map(e => ({...e, random: e.random !== false})), randomPosition !== false];

/** The saved groups to open one of: none saved, no list (New group beside it makes one). A group not saved yet leaves it on an empty,
    unselectable line. */
export function GroupPicker({groups, id, disabled, onChoose}: {groups: ObjectGroup[]; id: string; disabled: boolean; onChoose: (group: ObjectGroup) => void}) {
  if (!groups.length) return null;
  return <select aria-label="Saved groups" value={id} disabled={disabled} onChange={event => { const group = groups.find(g => g.id === event.target.value); if (group) onChoose(group); }}>
    {!id && <option value="" disabled hidden>Choose a saved group</option>}
    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
  </select>;
}

/** Saved groups are mixtures of library references; choosing Paint freezes a copy for this placement session. */
export function GroupLibrary({open, onChoose, onClose, onBusy}: {open: boolean;
  onChoose: (group: ObjectGroup, models: LibraryModel[]) => void; onClose: () => void; onBusy?: (busy: boolean) => void}) {
  const [groups, setGroups] = useState<ObjectGroup[]>([]), [id, setId] = useState("");
  const [name, setName] = useState(""), [entries, setEntries] = useState<GroupEntry[]>([]);
  const [models, setModels] = useState<Record<string, LibraryModel>>({}), [costs, setCosts] = useState<Record<string, TrackCost>>({});
  const [query, setQuery] = useState(""), [page, setPage] = useState(0), [revision, setRevision] = useState(0);
  const [answer, setAnswer] = useState<{key: string; value: Catalogue} | null>(null), [fault, setFault] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [settings, setSettings] = useState(false), [randomPosition, setRandomPosition] = useState(true);
  const key = JSON.stringify([query, page]), result = answer?.key === key ? answer.value : null;
  const refs = entries.map(e => e.model).join(",");
  const choose = (group?: ObjectGroup) => { setId(group?.id ?? ""); setName(group?.name ?? ""); setEntries(group?.entries.map(e => ({...e})) ?? []); setRandomPosition(group?.randomPosition !== false); setFault(null); };
  const blank = useRef(true);     // (nothing chosen or begun: the first saved group opens once the list comes)
  useEffect(() => { blank.current = !id && !name && !entries.length; });
  useEffect(() => { onBusy?.(busy); }, [busy, onBusy]);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    void libraryJson<{items: ObjectGroup[]}>("/api/library/groups", {signal: abort.signal}).then(r => {
      if (abort.signal.aborted) return;
      setGroups(r.items);
      if (blank.current && r.items.length) choose(r.items[0]);
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
  const valid = !!name.trim() && name.trim().length <= 100 && entriesValid(entries);
  // A saved group offers Save group only once it differs from the library's copy (its settings window saves by itself).
  const saved = groups.find(g => g.id === id), changed = !saved || JSON.stringify(sameShape(saved.name, saved.entries, saved.randomPosition)) !== JSON.stringify(sameShape(name, entries, randomPosition));
  const save = async (paint = false, list = entries, scattered = randomPosition) => {
    if (!name.trim() || !entriesValid(list) || busy) return;
    setBusy(true); setFault(null);
    try {
      // Recheck current references before saving, including members outside the current catalogue page.
      const resolved = await Promise.all(list.map(e => libraryJson<LibraryModel>(`/api/library/models/${e.model}`)));
      const r = await libraryJson<{group: ObjectGroup}>("/api/library/groups", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...(id ? {id} : {}), name, entries: list, randomPosition: scattered})});
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
  const shares = groupShares(entries), cost = groupCost(entries, costs, models);
  const nameOf = (model: string) => models[model]?.name ?? `Object ${model.slice(0, 8)}`;
  return <LibraryBrowser title="Groups" subtitle="Mix objects, then paint them onto the ground" onImport={() => choose()} importLabel="New group" disabled={busy}
    onFiles={() => setFault("Import objects in the Objects tab, then add them to a group.")}
    filters={<>
      <GroupPicker groups={groups} id={id} disabled={busy} onChoose={choose} />
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
      {entries.length && open ? <GroupPatch className={styles.patch} entries={entries} models={models} randomPosition={randomPosition} />
        : <p className={styles.empty}>Choose trees, bushes, grasses, rocks or other objects on the left.</p>}
      {entries.length > 0 && <ul className={styles.mix} aria-label="Mixture">{entries.map((e, i) =>
        <li key={e.model}><span>{nameOf(e.model)}</span><b>{Math.round(shares[i] * 100)} %</b></li>)}</ul>}
      {entries.length > 0 && <dl className={styles.cost} aria-label="Cost of the group">
        <dt>The group{cost ? `, ${cost.objects.toLocaleString("en-US")} objects` : ""}</dt><dd>{cost ? `${Math.round(cost.triangles).toLocaleString("en-US")} triangles · ${(cost.bytes / 1_000_000).toFixed(2)} MB` : "Measuring …"}</dd>
      </dl>}
      {id && <button type="button" className={styles.remove} disabled={busy} onClick={() => void remove()}>Delete group</button>}
    </LibrarySelection>}
    notices={fault && <LibraryNotice error>{fault}</LibraryNotice>}
    footer={<><div><strong>{name || "New group"}</strong></div>
      <button type="button" disabled={busy} onClick={onClose}>Cancel</button>
      <button type="button" disabled={busy || !entries.length} onClick={() => setSettings(true)}>Settings …</button>
      {changed && <button type="button" disabled={busy || !valid} onClick={() => void save()}>Save group</button>}
      <LibraryPrimary disabled={busy || !valid} onClick={() => void save(true)}>Paint group</LibraryPrimary>
      {settings && open && entries.length > 0 && createPortal(<GroupSettings name={name} entries={entries} randomPosition={randomPosition} models={models} disabled={busy}
        onSave={(list, scattered) => { setEntries(list); setRandomPosition(scattered); setSettings(false); if (id) void save(false, list, scattered); }} onClose={() => setSettings(false)} />, document.body)}
    </>} />;
}
