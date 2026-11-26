import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from "react";
import {aiUpdate, subscribeAiUpdates} from "../editorToasts";
import {BRIEF_TOAST_MS, useToasts} from "../../components/toastStore";
import {fetchJson} from "../scene/requests";
import {post} from "../../api";
import {EDGE_COLOUR, SPEED_COLOURS} from "../scene/aiLine";
import {fetchAiLine, type AiHintsState, type AiLineHover, type InstalledAiLine} from "../scene/aiLineData";
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
export type AiLineMode = "move" | "redraw" | "margin";
const AI_TOOLS: Tool[] = ["ai-move", "ai-redraw", "ai-margin"];

/** Move, Redraw and Side margin share a guide prepared after the editable track finishes loading. Checks the
    installed revision when one of them is taken up from another tool (not between the two), after recalculation and after Save.
    Visibility does not affect a transfer. */
export function useAiLine({name, view, mode, writes, unsaved, edits, moves, editable, routeTrack, loaded}: {
  name: string; view: TrackView; mode: AiLineMode | null; writes: number; unsaved: boolean; edits: TrackEdits; moves: AiCorrection[]; editable: boolean; routeTrack: boolean; loaded: boolean;
}) {
  const enabled = mode !== null, pen = mode === "redraw";
  const [free, setFree] = useState(true);
  const job = useSyncExternalStore(subscribeAiUpdates, () => aiUpdate(name));
  const [status, setStatus] = useState<{validity?: string; hints?: AiHintsState; canCalculate?: boolean}>({});
  const {validity, hints} = status;
  const [error, setError] = useState("");
  useToasts(enabled && error ? [{id:"edit-ai-preview", tone:"error", title:"AI line preview", duration:BRIEF_TOAST_MS, message:error,
    onDismiss:() => setError("")}] : []);
  const known = useRef<InstalledAiLine | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [externalChange, setExternalChange] = useState(0);
  const localRevision = `${writes}:${job.revision}`;
  const lastRead = useRef<string | null>(null);
  const [answer, setAnswer] = useState<AiLineAnswer | null>(null);
  const [hovered, setHovered] = useState<{lane: InstalledAiLine; hover: AiLineHover} | null>(null);
  useEffect(() => {
    if (!routeTrack && !attempt) return;
    const request = new AbortController(), {signal} = request;
    async function read() {
      try {
        if (!attempt) {
          const meta = await fetchJson<typeof status>(`/api/editor/${encodeURIComponent(name)}/ai-line`, signal);
          if (!signal.aborted) setStatus(meta);
          return;
        }
        const answer = await fetchAiLine(name, known.current, signal);
        if (signal.aborted) return;
        // On re-entry a different installed revision can also reveal a publication in another Editor.
        if (known.current && answer.revision !== known.current.revision && lastRead.current === localRevision)
          setExternalChange(value => value + 1);
        lastRead.current = localRevision;
        setStatus(answer);
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
  }, [name, view, attempt, localRevision, routeTrack]);
  useEffect(() => () => view.setAiLine(null), [view]);

  const reloadInstalled = useCallback(() => {
    known.current = null;
    view.setAiLine(null);
    setAnswer(null);
    setStatus({});
    setExternalChange(value => value + 1);
    setAttempt(value => value + 1);
  }, [view]);

  const lane = answer?.status === "ready" ? answer : null;
  const hover = hovered?.lane === lane ? hovered.hover : null;
  useEffect(() => {
    if (!enabled || !lane) return;
    view.showAiLine(mode !== "move" ? null : hover => setHovered(hover && {lane, hover}), true);
    return () => view.showAiLine(null);
  }, [view, enabled, lane, mode]);

  const editing = useRef<ReturnType<TrackView["editAiMoves"]> | null>(null);
  const [prepared, setPrepared] = useState<{revision: string; guide?: MoveGuide; error?: string} | null>(null);
  const revision = JSON.stringify([name, writes, externalChange]);
  const url = `/api/editor/${encodeURIComponent(name)}/ai-line/move-preview`;
  const request = useRef<{revision: string; promise: ReturnType<typeof post<MoveGuide>>} | null>(null);
  const canPrepare = loaded && routeTrack && editable && !!status.canCalculate;
  useEffect(() => {
    if (!canPrepare) return;
    let current = true;
    if (request.current?.revision !== revision)
      request.current = {revision, promise: post<MoveGuide>(url, {guide: true})};
    void request.current.promise.then(data => {
      if (!current) return;
      if (data.rows && data.path && data.origin && data.key && data.length && data.closed !== undefined)
        setPrepared({revision, guide: data as MoveGuide});
      else setPrepared({revision, error: data.error || "The AI line could not be prepared."});
    });
    return () => { current = false; };
  }, [canPrepare, url, revision]);
  const guide = prepared?.revision === revision ? prepared.guide : undefined;
  const preparing = routeTrack && editable && status.canCalculate !== false && prepared?.revision !== revision;
  const guideError = prepared?.revision === revision ? prepared.error : undefined;
  const canEdit = enabled && editable && !!status.canCalculate;
  const editMoves = canEdit && mode !== "margin";
  useEffect(() => {
    if (!editMoves || !guide) return;
    const session = view.editAiMoves(guide, url, moves, !lane,
      move => edits.addAiCorrection(move), id => edits.removeAiCorrection(id), setError);
    editing.current = session;
    return () => { session.dispose(); editing.current = null; };
  }, [editMoves, guide, url, moves, lane, edits, view]);
  useEffect(() => { editing.current?.setMode(pen, free); }, [pen, free, editMoves, guide, url, moves, lane, edits, view]);

  const [dismissedGuide, setDismissedGuide] = useState<string>();
  useToasts(enabled && guideError && dismissedGuide !== revision ? [{id:"edit-ai-guide", tone:"error", title:"AI line preview", duration:BRIEF_TOAST_MS,
    message:guideError, onDismiss:() => setDismissedGuide(revision)}] : []);
  const controller: ToolController = {
    toggleMode: () => { if (canEdit) setFree(value => !value); },
    // (between Move line and Redraw line the line shown stays: the session's mode switches, an unfinished stroke is discarded)
    activate: ({tool}) => { setError(""); setDismissedGuide(undefined); if (!AI_TOOLS.includes(tool)) setAttempt(value => value + 1); },
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
          {guideError && <span role="status">{guideError}</span>}
          {preparing && <span role="status">Preparing the AI line for editing …</span>}
          {answer && "validity" in answer && answer.validity === "manual" && <span>Manually replaced</span>}
          {(lane?.validity === "pending" || lane?.validity === "failed") && <span>Outdated</span>}
          {lane ? <Legend {...lane.speeds} />
          : <span role="status">{answer?.message ?? "Loading the installed AI line …"}</span>}</>} />
      {!pen && hover && <PointDetails hover={hover} />}
    </>,
  };
  const panel = (recalculate: () => void, saving: boolean) => (answer && "canCalculate" in answer ? answer.canCalculate : routeTrack) &&
    <button type="button" disabled={job.working || saving || (!unsaved && (!validity || validity === "ready") && hints?.state !== "stale" && hints?.unplaced !== "recalculate")}
      onClick={thenView(view, recalculate)}>Recalculate AI line</button>;
  return {controller, panel, lane, guide, preparing, guideError, lineMessage: !lane && answer?.message, reloadInstalled, refresh: `${localRevision}:${externalChange}`, pending: validity === "pending", working: job.working};
}
