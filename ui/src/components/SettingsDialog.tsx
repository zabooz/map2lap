import {useEffect, useState, type ReactNode} from "react";
import {get, post} from "../api";
import {DEFAULT_CONTROLS, MEMORY_RANGE, SPEED_RANGE, SPEEDS, type Controls} from "../editor/controls";
import {fmtBytes} from "../format";
import type {useRelease} from "../hooks/useRelease";
import type {useSettings} from "../hooks/useSettings";
import styles from "./SettingsDialog.module.css";

const CACHE_CAPS = [5, 10, 20, 50, 100, 0];     // GB (0: no limit)

interface Cars {
  cars: {id: string; name: string}[];
  last: string | null;
}

function Group({title, children}: {title: string; children: ReactNode}) {
  return <div className={styles.group}><h3>{title}</h3>{children}</div>;
}

function Installation({settings: s, release}: {settings: ReturnType<typeof useSettings>; release: ReturnType<typeof useRelease>}) {
  const {note} = release;
  return (
    <Group title="Installation">
      <div className={`${styles.pathRow} ${styles.verRow}`}>
        <span>Map2Lap {s.settings?.version}</span>
        <button disabled={release.working} onClick={() => void (release.installTo ? release.install() : release.check())}>
          {release.installTo ? `Install ${release.installTo}` : "Check for updates"}
        </button>
      </div>
      <p id="upd-status" className={`small ${styles.releaseNote} ${note.tone === "ok" ? styles.good : note.tone === "bad" ? styles.fault : ""}`}>
        {note.text}{note.link && <a href={note.link.url} target="_blank" rel="noopener">{note.link.text}</a>}
      </p>
      <div className="label-row"><span>Assetto Corsa folder</span></div>
      <div className={styles.pathRow}>
        <input key={s.revision} id="ac" type="text" spellCheck={false} aria-label="Assetto Corsa folder"
               defaultValue={s.settings?.ac_path}
               onBlur={e => { if (e.target.value !== s.settings?.ac_path) void s.save({ac_path: e.target.value}); }}
               onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} />
        <button onClick={() => void s.browse()}>Browse …</button>
      </div>
      <p id="ac-status" className={`small ${s.ac?.ok ? styles.good : styles.fault}`}>{s.ac?.text}</p>
    </Group>
  );
}

function Play({settings: s, onCar}: {settings: ReturnType<typeof useSettings>; onCar: () => void}) {
  const [cars, setCars] = useState<Cars | null>(null);

  useEffect(() => {             // (every installed car's ui_car.json: only when the settings open)
    let alive = true;
    get<Cars>("/api/cars").then(r => { if (alive) setCars(r); });
    return () => { alive = false; };
  }, []);

  return (
    <Group title="Play">
      <div className="label-row"><span>Car</span></div>
      <select aria-label="Car" value={cars ? s.settings?.car ?? "" : ""}
              onChange={e => { void s.save({car: e.target.value}).then(onCar); }}>
        <option value="">{cars?.last ? `Last driven (${cars.last})` : "Last driven"}</option>
        {cars?.cars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <p className="small muted">“Play” starts a practice session on your track with this car.</p>
    </Group>
  );
}

function BuildSpeed({settings: s}: {settings: ReturnType<typeof useSettings>}) {
  const [moving, setMoving] = useState<number | null>(null);
  const threads = s.settings?.threads ?? 2, pct = moving ?? s.settings?.cores ?? 50;
  // as parallel.workers: the share of the threads, at most all but one
  const n = Math.max(1, Math.min(threads - 1, Math.round(threads * pct / 100)));
  const commit = () => {
    if (moving === null) return;
    void s.save({cores: moving}).then(() => setMoving(null));
  };
  return (
    <Group title="Build speed">
      <div className="label-row"><span>CPU usage</span><span className="val">{pct} %</span></div>
      <input type="range" min={5} max={100} step={5} value={pct} aria-label="CPU usage"
             onChange={e => setMoving(+e.target.value)} onPointerUp={commit} onKeyUp={commit} />
      <p className="small muted">Up to {n} of {threads} threads at once (fewer if memory is short). Applies to the next build.</p>
    </Group>
  );
}

/** Bytes the server counts (every file: a moment) and can delete: the shown line and its deleting. */
function useStoredBytes(url: string, clearUrl: string) {
  const [bytes, setBytes] = useState<number | null>(null);
  const [line, setLine] = useState("counting …");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let alive = true;
    get<{bytes: number}>(url).then(r => {
      if (!alive) return;
      setBytes(r?.bytes ?? null);
      setLine(r ? fmtBytes(r.bytes) : "");
    });
    return () => { alive = false; };
  }, [url]);

  const clear = async (saying: string) => {
    setClearing(true);
    setLine(saying);
    const r = await post<{bytes: number}>(clearUrl);
    setClearing(false);
    setBytes(r.bytes ?? 0);
    setLine(r.error ? `✗ ${r.error}` : fmtBytes(r.bytes ?? 0));
  };

  return {bytes, line, clearing, clear};
}

function Storage({settings: s, busy}: {settings: ReturnType<typeof useSettings>; busy: boolean}) {
  const cache = useStoredBytes("/api/cache", "/api/cache/clear");
  const cap = s.settings?.cache_gb ?? 20;
  const caps = CACHE_CAPS.includes(cap) ? CACHE_CAPS : [...CACHE_CAPS, cap];
  return (
    <Group title="Storage">
      <div className="label-row"><span>Map data</span><span className="val">{cache.line}</span></div>
      <div className={styles.pathRow}>
        <select aria-label="Map data limit" value={cap} onChange={e => void s.save({cache_gb: +e.target.value})}>
          {caps.map(gb => <option key={gb} value={gb}>{gb ? `Keep up to ${gb} GB` : "No limit"}</option>)}
        </select>
        <button disabled={busy || cache.clearing} onClick={() => {
          if (confirm("Delete all downloaded map data? Builds download what they need again.")) void cache.clear("clearing …");
        }}>Clear now</button>
      </div>
      <p className="small muted">Downloaded maps are kept, so the same area builds faster next time. Above the limit the
        oldest goes first.</p>
    </Group>
  );
}

function BuildFiles({settings: s, busy}: {settings: ReturnType<typeof useSettings>; busy: boolean}) {
  const files = useStoredBytes("/api/buildfiles", "/api/buildfiles/clear");
  return (
    <Group title="Build files">
      <label className={styles.check}>
        <input type="checkbox" checked={!s.settings?.clean} onChange={e => void s.save({clean: !e.target.checked})} /> Keep build files
      </label>
      <p className="small muted">Looking at a track needs only the track itself. The editing tools, coming step by step, will
        need its build files. They take about as much disk space as the track, and hold the build’s log for bug reports.
        Applies to the next build.</p>
      <div className={`${styles.pathRow} ${styles.verRow}`}>
        <span>All build files: <span className="val">{files.line}</span></span>
        <button disabled={busy || files.clearing} onClick={() => {
          if (confirm(`Delete the build files (${fmtBytes(files.bytes ?? 0)})? Your tracks in Assetto Corsa, the map data and your settings stay. To edit a track later, build it again.`)) {
            void files.clear("deleting …");
          }
        }}>Delete</button>
      </div>
    </Group>
  );
}

/** How the 3D view moves: applies at once, kept by this browser. */
function ControlsGroup({controls, onChange}: {controls: Controls; onChange: (c: Controls) => void}) {
  const changed = JSON.stringify(controls) !== JSON.stringify(DEFAULT_CONTROLS);
  return (
    <Group title="Controls">
      {SPEEDS.map(({name, label}) => (
        <div key={name} className="field">
          <div className="label-row"><span>{label}</span><span className="val">{controls[name]} %</span></div>
          <input id={`control-${name}`} type="range" min={SPEED_RANGE[0]} max={SPEED_RANGE[1]} step={SPEED_RANGE[2]}
                 value={controls[name]} aria-label={label}
                 onChange={e => onChange({...controls, [name]: +e.target.value})} />
        </div>
      ))}
      <label className={styles.check}>
        <input id="control-invert" type="checkbox" checked={controls.invertLook}
               onChange={e => onChange({...controls, invertLook: e.target.checked})} /> Invert up and down when looking around
      </label>
      <button id="control-reset" className="add-stop" disabled={!changed} onClick={() => onChange(DEFAULT_CONTROLS)}>
        Reset to defaults
      </button>
    </Group>
  );
}

/** What the 3D view shows and how much memory it may take. */
function View3D({controls, onChange}: {controls: Controls; onChange: (c: Controls) => void}) {
  return (
    <Group title="3D view">
      <div className="field">
        <div className="label-row"><span>Memory limit</span><span className="val">{controls.memoryGb} GB</span></div>
        <input id="control-memory" type="range" min={MEMORY_RANGE[0]} max={MEMORY_RANGE[1]} step={MEMORY_RANGE[2]}
               value={controls.memoryGb} aria-label="Memory limit"
               onChange={e => onChange({...controls, memoryGb: +e.target.value})} />
      </div>
      <p className="small muted">About what the 3D view may take for a track. Above it, only the parts nearest the start load,
        some without their textures. A limit too high for this computer can crash the browser tab. Applies the next time a
        track loads.</p>
      <p className="small muted">Light and water are simpler here than in Assetto Corsa: the drive decides how a track looks.</p>
    </Group>
  );
}

function Testing({settings: s}: {settings: ReturnType<typeof useSettings>}) {
  return (
    <Group title="Testing">
      <label className={styles.check}>
        <input type="checkbox" checked={Boolean(s.settings?.debug_app)} onChange={e => void s.save({debug_app: e.target.checked})} /> Track Debug app in Assetto Corsa
      </label>
      <p className="small muted">A CSP app (in the app bar while driving): shows the metre along the route, <b>F10</b> (or
        a wheel button set in the app) marks a spot (with the drive around it and a screenshot), “Start recording” records
        the whole drive. Each session gets its own folder in Documents\Assetto Corsa\map2lap_debug – attach that folder to
        a bug report.</p>
    </Group>
  );
}

const TABS = [["general", "General"], ["map2lap", "Map2Lap"], ["editor", "Editor"]] as const;

/** Settings: the gear's popup over the page, always the same height (switching its tabs doesn't jump); closed by its ×, a
    click beside it or Esc. Mounted while open; all its tabs stay mounted (what the server counted stays). */
export function SettingsDialog({settings, release, busy, controls, onControls, onCar, onClose}: {
  settings: ReturnType<typeof useSettings>;
  release: ReturnType<typeof useRelease>;
  busy: boolean;
  controls: Controls;
  onControls: (c: Controls) => void;
  onCar: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("general");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div id="settings-back" className={styles.back} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section id="settings" className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className={styles.head}>
          <b id="settings-title">Settings</b>
          <button id="settings-close" className={styles.close} title="Close" aria-label="Close settings" onClick={onClose}>×</button>
        </div>
        <nav className={`tabs ${styles.tabs}`} role="tablist">
          {TABS.map(([id, text]) => (
            <button key={id} id={`set-${id}`} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""}
                    onClick={() => setTab(id)}>{text}</button>
          ))}
        </nav>
        <div className={styles.tab} role="tabpanel" hidden={tab !== "general"}>
          <a className={styles.bugLink} href="https://github.com/zabooz/map2lap/issues" target="_blank" rel="noopener">Found a bug?</a>
          <Installation settings={settings} release={release} />
          <Play settings={settings} onCar={onCar} />
        </div>
        <div className={styles.tab} role="tabpanel" hidden={tab !== "map2lap"}>
          <BuildSpeed settings={settings} />
          <Storage settings={settings} busy={busy} />
          <Testing settings={settings} />
        </div>
        <div className={styles.tab} role="tabpanel" hidden={tab !== "editor"}>
          <ControlsGroup controls={controls} onChange={onControls} />
          <BuildFiles settings={settings} busy={busy} />
          <View3D controls={controls} onChange={onControls} />
        </div>
      </section>
    </div>
  );
}
