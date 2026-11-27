import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {post} from "../../api";
import {fetchAiLine, type InstalledAiLine} from "../scene/aiLineData";
import type {MarginPreview} from "../scene/aiMargins";
import type {TrackView} from "../scene/view";
import type {EditState, TrackEdits} from "../state/edits";
import styles from "./RecordLine.module.css";

function LapPreview({line}: {line: InstalledAiLine}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let west = Infinity, east = -Infinity, north = Infinity, south = -Infinity;
    for (let i = 0; i < line.count; i++) {
      west = Math.min(west, line.x[i]); east = Math.max(east, line.x[i]);
      north = Math.min(north, line.z[i]); south = Math.max(south, line.z[i]);
    }
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const scale = Math.min((w-32)/(east-west || 1), (h-32)/(south-north || 1));
    const x = (i: number) => w/2 + (line.x[i]-(east+west)/2)*scale;
    const y = (i: number) => h/2 + (line.z[i]-(north+south)/2)*scale;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = getComputedStyle(ctx.canvas).color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x(0),y(0));
    for (let i = 1; i < line.count; i++) ctx.lineTo(x(i),y(i));
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x(0), y(0), 5, 0, 2*Math.PI); ctx.fill();
  }, [line]);
  return <canvas ref={canvas} width={720} height={270} className={styles.preview}
    role="img" aria-label={'Recorded circuit with ' + line.count + ' samples'} />;
}

const text = navigator.language.toLowerCase().startsWith("de") ? {
  title:"KI-Linie einfahren", start:"Training wird gestartet…", driving:"Training läuft.",
  read:"Aufnahme wird gelesen…", empty:"In diesem Training wurde keine neue Runde für dieses Layout gespeichert.",
  discard:"Verwerfen", close:"Schließen", accept:"Übernehmen", hints:"KI-Hinweise zurücksetzen",
  moves:"Linienkorrekturen zurücksetzen", stored:"Nur gespeichert", active:"Wirkt auf der Aufnahme",
  move:"Move line", redraw:"Redraw line",
  labels:{braking:"Bremsen", corner:"Kurventempo", speedLimit:"Tempolimit", danger:"Gefahrenzone"},
  drive:"Überquere Start/Ziel und fahre eine vollständige Runde.",
  fallback:"Falls AC im Menü bleibt, klicke auf Drive. Fehlt „Recorder armed“, öffne rechts AI und klicke vor Start/Ziel auf Start recording.",
  exit:"Beende nach der Runde das Training. Die Vorschau erscheint hier.",
  installed:"Das Training verwendet den zuletzt installierten Stand des Rundkurses.",
} : {
  title:"Record AI line", start:"Starting practice…", driving:"Recording practice is open.",
  read:"Reading the recorded lap…", empty:"This practice produced no new lap for this layout.",
  discard:"Discard", close:"Close", accept:"Accept recording", hints:"Reset AI hints",
  moves:"Reset Move / Redraw corrections", stored:"Stored only", active:"Applies to recording",
  move:"Move line", redraw:"Redraw line",
  labels:{braking:"Braking", corner:"Corner speed", speedLimit:"Speed limit", danger:"Danger zone"},
  drive:"Cross start/finish and drive one complete lap.",
  fallback:"If AC stays in the menu, click Drive. If “Recorder armed” is missing, open AI in the right sidebar and click Start recording before crossing start/finish.",
  exit:"Exit practice after the lap to preview it here.",
  installed:"Practice uses the installed version of the circuit.",
};

export function RecordLine({name, edits, state, view, disabled, onAccept}: {
  name:string; edits:TrackEdits; state:EditState; view:TrackView; disabled:boolean; onAccept:()=>void;
}) {
  const url = `/api/editor/${encodeURIComponent(name)}/ai-line`;
  const store = `map2lap:recording:${name}`;
  const [token, setToken] = useState(() => sessionStorage.getItem(store));
  const [open, setOpen] = useState(!!token);
  const [key, setKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{line:InstalledAiLine; hints:MarginPreview; resetMoves:boolean} | null>(null);
  const [resetHints,setResetHints] = useState(false), [resetMoves,setResetMoves] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  useEffect(() => {
    if (!token) return;
    let current = true, timer: ReturnType<typeof setTimeout>;
    async function poll() {
      const r = await post<{status:string; key:string; message:string}>(url + "/record/" + token);
      if (!current) return;
      if (r.status === "ready" && r.key) setKey(r.key);
      else if (r.status === "starting" || r.status === "driving") {
        setMessage(r.status === "starting" ? text.start : text.driving);
        timer = setTimeout(poll, 1500);
      } else setError(r.status === "empty" && r.message?.startsWith("This practice") ? text.empty : r.error ?? r.message ?? "Could not check the recording.");
    }
    void poll();
    return () => { current = false; clearTimeout(timer); };
  }, [url,token]);
  useEffect(() => {
    if (!key) return;
    const request = new AbortController();
    async function load() {
      const line = await fetchAiLine(name, null, request.signal, key, resetMoves ? [] : state.aiCorrections);
      if (line.status !== "ready") throw new Error(line.message);
      const hints = await post<MarginPreview>(url + "/margins",
        {aiMargins:state.aiMargins, source:key, file:line.file, revision:line.revision, aiCorrections:resetMoves ? [] : state.aiCorrections});
      if (!hints.margins) throw new Error(hints.error ?? "Could not check hint positions.");
      if (!request.signal.aborted) setPreview({line, hints:hints as MarginPreview, resetMoves});
    }
    void load().catch(e => { if (!request.signal.aborted) setError(String(e.message)); });
    return () => request.abort();
  }, [url, name, key, state.aiMargins, state.aiCorrections, resetMoves]);
  const start = async () => {
    setOpen(true); setMessage(text.start); setError(""); setPreview(null);
    setResetHints(false); setResetMoves(false);
    const answer = await post<{token:string}>(url + "/record", {clock:view.clockHours(), weather:view.weatherOptions()});
    if (answer.token) { sessionStorage.setItem(store, answer.token); setToken(answer.token); }
    else setError(answer.error ?? "Practice could not start.");
  };
  const close = () => {
    setToken(null); setKey(null); setPreview(null); setOpen(false);
    sessionStorage.removeItem(store); view.focus();
  };
  const accept = () => {
    if (!key || !preview || preview.resetMoves !== resetMoves || !edits.canEdit()) return;
    edits.acceptRecording(key, resetHints, resetMoves);
    close(); onAccept();
  };
  return <><button type="button" disabled={disabled || open} onClick={() => void start()} title={text.installed}>{text.title}</button>
    {open && createPortal(<dialog ref={dialog} className={styles.dialog} aria-labelledby="record-line-title"
      onCancel={e => { e.preventDefault(); if (token || error) close(); }}>
      <h3 id="record-line-title">{text.title}</h3>
      {error ? <p role="alert">{error}</p> : preview ? <>
        <LapPreview line={preview.line}/>
        <label><input type="checkbox" checked={resetHints} onChange={e => setResetHints(e.target.checked)}/>
          {text.hints} ({state.aiMargins.length})</label>
        {!resetHints && state.aiMargins.length > 0 && <ul className={styles.zones}>{state.aiMargins.map(m =>
          <li key={m.id}>{text.labels[m.kind ?? "danger"]} · {Math.round(m.start.metre)}–{Math.round(m.end.metre)} m · {
            preview.hints.unplaced || preview.hints.margins[m.id]?.error || preview.hints.margins[m.id]?.start == null
              ? text.stored : text.active}</li>)}</ul>}
        <label><input type="checkbox" checked={resetMoves} onChange={e => setResetMoves(e.target.checked)}/>
          {text.moves} ({state.aiCorrections.length})</label>
        {!resetMoves && state.aiCorrections.length > 0 && <ul className={styles.zones}>{state.aiCorrections.map(m =>
          <li key={m.id}>{text[m.kind]} · {Math.round(m.anchor.metre)} m · {preview.line.skipped?.[m.id] ? text.stored+" · "+preview.line.skipped[m.id] : text.active}</li>)}</ul>}
      </> : <><p role="status">{key ? text.read : message}</p>
        <ol><li>{text.fallback}</li><li>{text.drive}</li><li>{text.exit}</li></ol></>}
      <div className={styles.actions}><button type="button" disabled={!token && !error} onClick={close}>{preview ? text.discard : text.close}</button>
        {preview && !error && <button type="button" className={styles.primary} disabled={disabled || preview.resetMoves !== resetMoves} onClick={accept}>{text.accept}</button>}</div>
    </dialog>, document.body)}</>;
}
