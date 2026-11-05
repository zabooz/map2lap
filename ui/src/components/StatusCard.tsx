import type {ReactNode} from "react";
import {fmtBytes, fmtDate, fmtSize, fmtTime} from "../format";
import {MAX_KM, type Selection} from "../hooks/useNewTrack";
import type {BuildStatus, Mode, Tab, Track} from "../types";
import {CodeField} from "./CodeField";
import {TrashIcon} from "./icons";
import styles from "./StatusCard.module.css";

const PHASES: Record<string, string> = {route: "Calculating route", tiles: "Building road tiles",
                                        scenery: "Terrain, trees & buildings", distant: "Distant terrain",
                                        kn5: "Writing track file", clean: "Cleaning up"};
const ORDER = Object.keys(PHASES);

const BADGES = {run: styles.run, ok: styles.ok, bad: styles.bad, warn: styles.warn, "": ""};

interface Shown {
  badge: [string, "run" | "ok" | "bad" | "warn" | ""];
  time?: string;
  body: ReactNode;
}

function Progress({status}: {status: BuildStatus}) {
  const p = status.progress ?? {phase: "route", done: 0, total: 0};
  const step = Math.max(1, ORDER.indexOf(p.phase) + 1);
  const part = p.total ? p.done / p.total : null;
  const note = p.phase === "tiles" && !p.done ? "Downloading map data for new areas …"
    : p.total ? `${p.done} / ${p.total} ${p.phase === "tiles" ? "tiles" : "parts"}` : " ";
  return (
    <>
      <div className={styles.phase}>{PHASES[p.phase] ?? p.phase}<span>step {step} of {ORDER.length}</span></div>
      <div className={`${styles.bar}${part === null ? ` ${styles.indet}` : ""}`}><i style={{width: `${part === null ? 30 : (100 * part).toFixed(1)}%`}} /></div>
      <p className="small muted">{note}</p>
    </>
  );
}

function Stat({label, value}: {label: string; value: string | number}) {
  return <div><small>{label}</small><b>{value}</b></div>;
}

const big = (title: ReactNode, note: ReactNode) => (
  <><div className={styles.big}>{title}</div><p className="small muted">{note}</p></>
);

/** A picked track's lines. */
function PickedTrack({track: t, version}: {track: Track; version: string}) {
  const was = t.version ? `Map2Lap ${t.version}` : "an earlier Map2Lap";
  const built = t.outdated ? `Built with ${was}, now ${version}.`
    : t.current_copy ? `Built with ${was}; “${t.current_copy}” is the current build.` : `Built with ${was}, up to date.`;
  return (
    <>
      <div className={`${styles.big} ell`}>{t.title}</div>
      <p className="small muted">
        {fmtSize(t)}{t.area ? "" : ` · corridor ±${Math.round(t.width ?? 0)} m`} · {t.tiles} tiles
        {t.kn5_bytes ? ` · ${fmtBytes(t.kn5_bytes)}` : ""}
      </p>
      <p className="small muted ell">{built}</p>
    </>
  );
}

/** What the card shows: a build's progress or result, the picked track, or what is selected. Pure. */
function shownOf(a: {status: BuildStatus; showResult: boolean; tab: Tab; mode: Mode; picked: Track | undefined;
                     selection: Selection | null; width: number; hasTracks: boolean; version: string; playButton: (name: string) => ReactNode}): Shown {
  const {status: s, picked: t, selection: sel} = a;
  if (s.state === "running" || s.state === "stopping") {
    return {badge: [s.state === "stopping" ? "Stopping" : "Building", "run"], time: fmtTime(s.elapsed), body: <Progress status={s} />};
  }
  if (a.showResult && s.state === "done" && s.result) {
    const r = s.result;
    return {badge: ["Done", "ok"], time: fmtTime(r.seconds), body: (
      <>
        <div className={styles.stats}>
          <Stat label="Track file" value={fmtBytes(r.kn5_bytes)} />
          <Stat label={r.area_m ? "Area" : "Length"} value={fmtSize(r)} />
          <Stat label="Build time" value={fmtTime(r.seconds)} />
          <Stat label="Tiles" value={r.tiles} />
        </div>
        <div className={styles.foot}><p className="small muted">Installed in Assetto Corsa.</p>{a.playButton(r.name)}</div>
      </>)};
  }
  if (a.showResult && s.state === "error") {
    return {badge: ["Error", "bad"], time: fmtTime(s.elapsed), body: (
      <><p className={styles.err}>{s.error || "The build failed"}</p><p className="small muted">Details in the log below.</p></>)};
  }
  if (a.showResult && s.state === "stopped") {
    return {badge: ["Stopped", "bad"], time: fmtTime(s.elapsed),
            body: big("Build stopped", "Nothing half-built was left in Assetto Corsa.")};
  }
  if (t) {
    const badge: Shown["badge"] = !t.kn5_bytes ? ["No track file", "bad"] : t.outdated ? ["Old version", "warn"]
      : [t.area ? "Area" : "Route", "ok"];
    return {badge, time: fmtDate(t.built), body: <PickedTrack track={t} version={a.version} />};
  }
  if (a.tab === "mine") {
    return {badge: ["Ready", ""], body: a.hasTracks ? big("Pick a track", "Choose one from the list to rebuild it.")
                                                    : big("No tracks yet", "Tracks you build show up here.")};
  }
  if (sel?.kind === "route") {
    return {badge: sel.ok ? ["Route", "ok"] : ["Too long", "bad"], body: big(`${sel.km.toFixed(2)} km`,
      sel.ok ? `Corridor ±${a.width} m on each side of the route` : `At most ${MAX_KM} km per track`)};
  }
  if (sel?.kind === "area") {
    return {badge: ["Area", "ok"], body: big(`${(sel.w / 1000).toFixed(2)} × ${(sel.h / 1000).toFixed(2)} km`,
      `${(sel.w * sel.h / 1e6).toFixed(1)} km² · ${sel.tiles} tiles`)};
  }
  if (sel?.kind === "msg") {
    return {badge: sel.bad ? ["Error", "bad"] : ["Route", ""], body: <p className={sel.bad ? styles.err : "muted"}>{sel.text}</p>};
  }
  return {badge: ["Ready", ""], body: a.mode === "area" ? big("Draw an area", "Press and drag on the map.")
                                                        : big("Set a route", "Click the map for the start, then the finish.")};
}

/** Play, in the card. */
export function PlayButton({title, disabled, starting, onClick}: {title: string; disabled: boolean; starting: boolean;
                                                                  onClick: () => void}) {
  return (
    <button className={styles.play} title={title} disabled={disabled} onClick={onClick}>
      {starting ? "Starting …" : "▶ Play"}
    </button>
  );
}

/** The picked track's code, with delete beside it. */
export function CardCode({code, onDelete}: {code: string; onDelete: () => void}) {
  return (
    <div id="card-code" className={styles.code}>
      <CodeField code={code} />
      <button className={styles.icon} title="Delete track" aria-label="Delete track" onClick={onDelete}><TrashIcon /></button>
    </div>
  );
}

/** The status card: one place, always the same height. footer: the picked track's code under it. */
export function StatusCard(props: Parameters<typeof shownOf>[0] & {footer: ReactNode}) {
  const {badge, time, body} = shownOf(props);
  return (
    <div className={styles.card} data-testid="status-card">
      <div className={styles.top}>
        <span className={`${styles.badge} ${BADGES[badge[1]]}`}>{badge[0]}</span>
        <span className={styles.time}>{time}</span>
      </div>
      <div className={styles.body}>{body}</div>
      {props.footer}
    </div>
  );
}
