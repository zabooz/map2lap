import {useId, type ReactNode} from "react";
import {fmtBytes, fmtDate, fmtLap, fmtSize, fmtTime} from "../format";
import {MAX_KM, type Selection} from "../hooks/useNewTrack";
import type {BestLap, BuildOptions, BuildStatus, Mode, Tab, Track, TrackGroup} from "../types";
import {CodeField} from "./CodeField";
import {TrashIcon} from "./icons";
import styles from "./StatusCard.module.css";

const PHASES: Record<string, string> = {route: "Calculating route", tiles: "Building road tiles",
                                        scenery: "Terrain, trees & buildings", distant: "Distant terrain",
                                        kn5: "Writing track file", ai_line: "Generating AI line …", clean: "Cleaning up"};

const BADGES = {run: styles.run, ok: styles.ok, bad: styles.bad, warn: styles.warn, "": ""};

interface Shown {
  badge: [string, "run" | "ok" | "bad" | "warn" | ""];
  time?: string;
  body: ReactNode;
}

function Progress({status}: {status: BuildStatus}) {
  const p = status.progress;
  const part = p?.total ? p.done / p.total : null;
  const note = p?.phase === "tiles" && !p.done ? "Downloading map data for new areas …"
    : p?.total ? `${p.done} / ${p.total} ${p.phase === "tiles" ? "tiles" : "parts"}` : " ";
  return (
    <>
      <div className={styles.phase} data-testid="build-phase">
        {p ? PHASES[p.phase] ?? p.phase : "Starting build"}
        {p?.steps && <span>step {p.step} of {p.steps}</span>}
      </div>
      <div className={`${styles.bar}${part === null ? ` ${styles.indet}` : ""}`}><i style={{width: `${part === null ? 30 : (100 * part).toFixed(1)}%`}} /></div>
      <p data-testid="build-progress-note" className="small muted">{note}</p>
    </>
  );
}

function Stat({label, value}: {label: string; value: string | number}) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

const big = (title: ReactNode, note: ReactNode) => (
  <><div className={styles.big}>{title}</div><p className="small muted">{note}</p></>
);

function OptionsSummary({options}: {options: BuildOptions}) {
  return <dl className={styles.stats}>
    <Stat label="Terrain grid" value={`${options.terrain_cell_m} m`} />
    <Stat label="Ground textures" value={options.ground_quality.toUpperCase()} />
    <Stat label="Parked cars" value={options.parked_cars ? "On" : "Off"} />
    <Stat label="Tree spacing" value={options.tree_spacing_m ? `Min. ${options.tree_spacing_m} m` : "Original"} />
  </dl>;
}

function BestLapSummary({best, label}: {best?: BestLap; label: string}) {
  return <div className={styles.best}>
    <div><span>{label}</span><strong>{best ? fmtLap(best.time_ms) : "—"}</strong></div>
    {best && <p>{best.car}</p>}
  </div>;
}

function TrackTimes({stage, circuit, best}: {stage?: boolean; circuit: boolean; best?: BestLap}) {
  if (stage) return <BestLapSummary best={best} label="Best gate-to-gate time" />;
  return (circuit || best) && <BestLapSummary best={best} label="Best lap" />;
}

/** A picked track's lines. */
function PickedTrack({track: t, version}: {track: Track; version: string}) {
  const was = t.version ? `Map2Lap ${t.version}` : "an earlier Map2Lap";
  const built = t.edited ? `Built with ${was}, then edited.` : t.outdated ? `Built with ${was}, now ${version}.`
    : t.current_copy ? `Built with ${was}; “${t.current_copy}” is the current build.` : `Built with ${was}, up to date.`;
  return (
    <>
      <h2 className={styles.title}>{t.title}</h2>
      <dl className={styles.stats}>
        <Stat label={t.area ? "Dimensions" : "Length"} value={fmtSize(t)} />
        {!t.area && t.width != null && <Stat label="Corridor" value={`±${Math.round(t.width)} m`} />}
        <Stat label="Tiles" value={t.tiles} />
        {!!t.kn5_bytes && <Stat label="Track file" value={fmtBytes(t.kn5_bytes)} />}
      </dl>
      <p className="small muted">{built}</p>
      <TrackTimes stage={t.ab_timing} circuit={t.kind === "circuit"} best={t.best_lap} />
    </>
  );
}

/** What the card shows: a build's progress or result, the picked track, or what is selected. Pure. */
function shownOf(a: {status: BuildStatus; showResult: boolean; tab: Tab; mode: Mode; group: TrackGroup; picked: Track | undefined;
                     title: string; installed: Track | undefined; selection: Selection | null; width: number;
                     options: BuildOptions; hasTracks: boolean; version: string;
                     playButton: (name: string, kind?: Mode, abTiming?: boolean) => ReactNode}): Shown {
  const {status: s, picked: t, selection: sel} = a;
  const circuit = a.mode === "circuit";
  const pinMode = circuit ? "Circuit" : "Route";
  if (s.state === "running" || s.state === "stopping") {
    return {badge: [s.state === "stopping" ? "Stopping" : "Building", "run"], time: fmtTime(s.elapsed), body: <Progress status={s} />};
  }
  if (a.showResult && s.state === "done" && s.result) {
    const r = s.result;
    const abTiming = a.installed?.ab_timing ?? r.ab_timing;
    return {badge: ["Done", "ok"], time: fmtTime(r.seconds), body: (
      <>
        <h2 className={styles.title}>{a.installed?.title ?? r.title ?? r.name}</h2>
        <dl className={styles.stats}>
          <Stat label={r.area_m ? "Dimensions" : "Length"} value={fmtSize(r)} />
          {a.installed?.width != null && <Stat label="Corridor" value={`±${Math.round(a.installed.width)} m`} />}
          <Stat label="Tiles" value={r.tiles} />
          <Stat label="Track file" value={fmtBytes(r.kn5_bytes)} />
        </dl>
        <TrackTimes stage={abTiming} circuit={r.kind === "circuit"} best={a.installed?.best_lap} />
        <div className={styles.foot}><p className="small muted">Installed in Assetto Corsa.</p>{a.playButton(r.name, r.kind, abTiming)}</div>
      </>)};
  }
  if (a.showResult && s.state === "error") {
    return {badge: ["Error", "bad"], time: fmtTime(s.elapsed), body: (
      <><p className={styles.err}>{s.error || "The build failed"}</p><p data-testid="build-error-hint" className="small muted">See the Build log.</p></>)};
  }
  if (a.showResult && s.state === "stopped") {
    return {badge: ["Stopped", "bad"], time: fmtTime(s.elapsed),
            body: big("Build stopped", "Nothing half-built was left in Assetto Corsa.")};
  }
  if (t) {
    const badge: Shown["badge"] = !t.kn5_bytes ? ["No track file", "bad"] : t.edited ? ["Edited", "ok"]
      : t.outdated ? ["Old version", "warn"] : [t.area ? "Area" : t.kind === "circuit" ? "Circuit" : "Route", "ok"];
    return {badge, time: fmtDate(t.saved ?? t.built), body: <PickedTrack track={t} version={a.version} />};
  }
  if (a.tab === "mine") {
    return {badge: ["Ready", ""], body: a.hasTracks ? big("Pick a track", a.group === "edited" ? "Choose one from the list to edit it." : "Choose one from the list to rebuild it.")
      : a.group === "edited" ? big("No edited tracks yet", "Tracks you save in the Editor show up here.")
      : big("No tracks yet", "Tracks you build show up here.")};
  }
  if (sel?.kind === "route") {
    const tooLong = sel.km > MAX_KM;
    return {badge: tooLong ? ["Too long", "bad"] : [pinMode, sel.openCircuit ? "" : "ok"], body: (
      <>
        {a.title && <h2 className={styles.title}>{a.title}</h2>}
        <dl className={styles.stats}>
          <Stat label="Length" value={`${sel.km.toFixed(2)} km`} />
          <Stat label="Corridor" value={`±${a.width} m`} />
        </dl>
        {tooLong && <p className="small muted">At most {MAX_KM} km per track</p>}
        <OptionsSummary options={a.options} />
      </>)};
  }
  if (sel?.kind === "area") {
    return {badge: ["Area", "ok"], body: (
      <>
        {a.title && <h2 className={styles.title}>{a.title}</h2>}
        <dl className={styles.stats}>
          <Stat label="Dimensions" value={`${(sel.w / 1000).toFixed(2)} × ${(sel.h / 1000).toFixed(2)} km`} />
          <Stat label="Area" value={`${(sel.w * sel.h / 1e6).toFixed(1)} km²`} />
          <Stat label="Tiles" value={sel.tiles} />
        </dl>
        <OptionsSummary options={a.options} />
      </>)};
  }
  if (sel?.kind === "msg") {
    return {badge: sel.bad ? ["Error", "bad"] : [pinMode, ""], body: <p className={sel.bad ? styles.err : "muted"}>{sel.text}</p>};
  }
  const ready = a.mode === "area" ? big("Draw an area", "Press and drag on the map.")
    : circuit ? big("Set a circuit", "Click the map for the start, then add pins in driving order.")
    : big("Set a route", "Click the map for the start, then the finish.");
  return {badge: ["Ready", ""], body: ready};
}

/** Play, in the card. */
export function PlayButton({title, disabled, starting, onClick}: {title: string; disabled: boolean; starting: boolean;
                                                                  onClick: () => void}) {
  return (
    <button data-testid="play-track" className={styles.play} title={title} disabled={disabled} onClick={onClick}>
      {starting ? "Starting …" : "▶ Play"}
    </button>
  );
}

/** The picked track's code and delete action. An edited track has no code. */
export function CardCode({code, onDelete}: {code: string | null; onDelete: () => void}) {
  const id = useId();
  return (
    <div id="card-code" className={styles.code}>
      {code !== null && <><label htmlFor={id}>Track code</label><CodeField id={id} code={code} /></>}
      <button type="button" className={styles.delete} onClick={onDelete}><TrashIcon />Delete track</button>
    </div>
  );
}

/** Track details and build status. footer: the picked track's code under it. */
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
