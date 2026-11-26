import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {aiUpdate, subscribeAiUpdates} from "../editorToasts";
import {BRIEF_TOAST_MS, useToasts} from "../../components/toastStore";
import {fetchJson} from "../scene/requests";
import {post} from "../../api";
import {EDGE_COLOUR, SPEED_COLOURS} from "../scene/aiLine";
import {fetchAiLine, type AiLineHover, type InstalledAiLine} from "../scene/aiLineData";
import type {MoveGuide} from "../scene/aiGuide";
import type {AiCorrection, TrackEdits} from "../state/edits";
import {MeshFetchError} from "../scene/requests";
import type {TrackView} from "../scene/view";
import type {Place} from "../types";
import type {ToolController} from "./toolHost";
import type {Tool} from "./toolDefs";
import {thenView, ToolChoice, ToolOptions} from "./ToolOptions";
import styles from "./AiLine.module.css";

const value = (n: number, digits = 3) => Number(n.toFixed(digits)).toString();
const speed = (metresPerSecond: number) => `${value(metresPerSecond * 3.6, 1)} km/h`;
const vector = (xyz: Place) => xyz.map(n => value(n)).join(", ");

function PointDetails({hover: {point: p, metre}}: {hover: AiLineHover}) {
  const rows = [
    ["Route metre", metre === null ? "—" : `${value(metre, 1)} m`], ["Speed", speed(p.speed)],
    ["ID", p.id], ["AC x, y, z", `${vector(p.position)} m`], ["Line distance", `${value(p.distance)} m`],
    ["Gas", value(p.gas, 6)], ["Brake", value(p.brake, 6)], ["Lateral acceleration", `${value(p.lat_g)} g`],
    ["Radius", `${value(p.radius)} m`], ["Side left", `${value(p.left)} m`], ["Side right", `${value(p.right)} m`],
    ["Camber", `${value(p.camber)} rad`], ["Direction", value(p.direction)], ["Normal", vector(p.normal)],
    ["Segment length", `${value(p.segment_length)} m`], ["Forward", vector(p.forward)],
    ["Tag", value(p.tag)], ["Grade", value(p.grade)],
  ];
  return <section className={styles.point} aria-label="AI line point">
    <dl>{rows.map(([label, data]) => <div key={label}><dt>{label}</dt><dd>{data}</dd></div>)}</dl>
  </section>;
}

function Legend({slow, fast}: {slow: number; fast: number}) {
  return <span className={styles.legend}>
    {slow === fast ? <span><i style={{background: SPEED_COLOURS[1]}} />{speed(fast)}</span>
      : <span>{value(slow * 3.6, 1)} <i className={styles.ramp} style={{background: `linear-gradient(to right, ${SPEED_COLOURS.join(", ")})`}} /> {speed(fast)}</span>}
    <span><i style={{background: EDGE_COLOUR}} /> Side limits</span>
  </span>;
}

type AiLineAnswer = Awaited<ReturnType<typeof fetchAiLine>> | {status: "error"; message: string};

/** The AI line tools: which one is on. */
export type AiLineMode = "move" | "redraw";
const AI_TOOLS: Tool[] = ["ai-move", "ai-redraw"];

/** Move line and Redraw line, two tools over one installed line: either one shows it. mode: the one on, null: neither. Checks the
    installed revision when one of them is taken up from another tool (not between the two), after recalculation and after Save.
    Visibility does not affect a transfer. */
export function useAiLine({name, view, mode, writes, unsaved, edits, moves, editable, routeTrack}: {
  name: string; view: TrackView; mode: AiLineMode | null; writes: number; unsaved: boolean; edits: TrackEdits; moves: AiCorrection[]; editable: boolean; routeTrack: boolean;
}) {
  const enabled = mode !== null, pen = mode === "redraw";
  const [free, setFree] = useState(true);
  const job = useSyncExternalStore(subscribeAiUpdates, () => aiUpdate(name));
  const [validity, setValidity] = useState<string>();
  const [error, setError] = useState("");
  useToasts(enabled && error ? [{id:"edit-ai-preview", tone:"error", title:"AI line preview", duration:BRIEF_TOAST_MS, message:error,
    onDismiss:() => setError("")}] : []);
  const known = useRef<InstalledAiLine | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [answer, setAnswer] = useState<AiLineAnswer | null>(null);
  const [hovered, setHovered] = useState<{lane: InstalledAiLine; hover: AiLineHover} | null>(null);
  useEffect(() => {
    if (!routeTrack && !attempt) return;
    const request = new AbortController(), {signal} = request;
    async function read() {
      try {
        if (!attempt) {
          const meta = await fetchJson<{validity?: string}>(`/api/editor/${encodeURIComponent(name)}/ai-line`, signal);
          if (!signal.aborted) setValidity(meta.validity);
          return;
        }
        const answer = await fetchAiLine(name, known.current, signal);
        if (signal.aborted) return;
        setValidity(answer.validity);
        known.current = answer.status === "ready" ? answer : null;
        view.setAiLine(known.current);
        setAnswer(answer);
      } catch (error) {
        if (signal.aborted) return;
        const message = error instanceof MeshFetchError && error.status === 409 ? error.message : "The AI line could not be loaded.";
        setAnswer({status: "error", message});
      }
    }
    void read();
    return () => request.abort();
  }, [name, view, attempt, writes, job.revision, routeTrack]);
  useEffect(() => () => view.setAiLine(null), [view]);

  const lane = answer?.status === "ready" ? answer : null;
  const hover = hovered?.lane === lane ? hovered.hover : null;
  useEffect(() => {
    if (!enabled || !lane) return;
    view.showAiLine(pen ? null : hover => setHovered(hover && {lane, hover}), true);
    return () => view.showAiLine(null);
  }, [view, enabled, lane, pen]);

  const editing = useRef<ReturnType<TrackView["editAiMoves"]> | null>(null);
  const [guide, setGuide] = useState<{data: MoveGuide; revision: string} | null>(null);
  const revision = JSON.stringify([name, writes, attempt]);
  const url = `/api/editor/${encodeURIComponent(name)}/ai-line/move-preview`;
  const canEdit = enabled && editable && answer && "canCalculate" in answer && answer.canCalculate;
  useEffect(() => {
    if (!canEdit) return;
    let current = true;
    void post<MoveGuide>(url, {guide: true}).then(data => {
      if (!current) return;
      if (data.rows && data.path && data.origin && data.key && data.length && data.closed !== undefined)
        setGuide({data: data as MoveGuide, revision});
      else if (data.error) setError(data.error);
    });
    return () => { current = false; };
  }, [canEdit, url, revision]);
  useEffect(() => {
    if (!canEdit || guide?.revision !== revision) return;
    const session = view.editAiMoves(guide.data, url, moves, !lane,
      move => edits.addAiCorrection(move), id => edits.removeAiCorrection(id), setError);
    editing.current = session;
    return () => { session.dispose(); editing.current = null; };
  }, [canEdit, guide, revision, url, moves, lane, edits, view]);
  useEffect(() => { editing.current?.setMode(pen, free); }, [pen, free, canEdit, guide, revision, url, moves, lane, edits, view]);

  const controller: ToolController = {
    toggleMode: () => { if (canEdit) setFree(value => !value); },
    // (between Move line and Redraw line the line shown stays: the session's mode switches, an unfinished stroke is discarded)
    activate: ({tool}) => { setError(""); if (!AI_TOOLS.includes(tool)) setAttempt(value => value + 1); },
    clear: () => setHovered(null),
    options: <>
      <ToolOptions id="edit-ai-line-set" title={pen ? "Redraw line" : "Move line"} note={unsaved ? "Line from the last build or save" : undefined}
        options={canEdit ? {
          shift: <span>
            <ToolChoice label="Road" on={!free} hint="Stay on the selected road" onClick={thenView(view, () => setFree(false))} />
            <ToolChoice label="Free" on={free} hint="Allow driveable surfaces off the road" onClick={thenView(view, () => setFree(true))} />
          </span>,
        } : undefined}
        actions={<>
          {answer && "validity" in answer && answer.validity === "manual" && <span>Manually replaced</span>}
          {(lane?.validity === "pending" || lane?.validity === "failed") && <span>Outdated</span>}
          {lane ? <Legend {...lane.speeds} />
          : <span role="status">{answer?.message ?? "Loading the installed AI line …"}</span>}</>} />
      {!pen && hover && <PointDetails hover={hover} />}
    </>,
  };
  const panel = (recalculate: () => void, saving: boolean) => (answer && "canCalculate" in answer ? answer.canCalculate : routeTrack) &&
    <button type="button" disabled={job.working || saving || (!unsaved && (!validity || validity === "ready"))}
      onClick={thenView(view, recalculate)}>Recalculate AI line</button>;
  return {controller, panel, pending: validity === "pending", working: job.working};
}
