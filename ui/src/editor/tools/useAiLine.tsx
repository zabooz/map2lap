import {useEffect, useRef, useState} from "react";
import {post} from "../../api";
import {BRAKE_COLOUR, EDGE_COLOUR, SPEED_COLOURS} from "../scene/aiLine";
import {fetchAiLine, type AiLineHover, type InstalledAiLine} from "../scene/aiLineData";
import type {MoveGuide} from "../scene/aiMoves";
import type {AiMove, TrackEdits} from "../state/edits";
import {MeshFetchError} from "../scene/requests";
import type {TrackView} from "../scene/view";
import type {Place} from "../types";
import type {ToolController} from "./toolHost";
import {ToolOptions} from "./ToolOptions";
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
    <span><i className={styles.brakes} style={{color: BRAKE_COLOUR}} /> Braking</span>
  </span>;
}

type AiLineAnswer = Awaited<ReturnType<typeof fetchAiLine>> | {status: "error"; message: string};

/** Check the installed revision when the tool opens, after recalculation and after Save. Visibility does not affect a transfer. */
export function useAiLine({name, view, enabled, writes, unsaved, edits, moves, editable}: {
  name: string; view: TrackView; enabled: boolean; writes: number; unsaved: boolean; edits: TrackEdits; moves: AiMove[]; editable: boolean;
}): ToolController {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const recalculate = async () => {
    setWorking(true);
    setError("");
    const result = await post(`/api/editor/${encodeURIComponent(name)}/ai-line/recalculate`);
    setError(result.error ?? "");
    setWorking(false);
    setAttempt(value => value + 1);
  };
  const known = useRef<InstalledAiLine | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{attempt: number; writes: number; answer: AiLineAnswer} | null>(null);
  const [hovered, setHovered] = useState<{lane: InstalledAiLine; hover: AiLineHover} | null>(null);
  useEffect(() => {
    if (!attempt) return;
    const request = new AbortController(), {signal} = request;
    async function read() {
      try {
        const answer = await fetchAiLine(name, known.current, signal);
        if (signal.aborted) return;
        known.current = answer.status === "ready" ? answer : null;
        view.setAiLine(known.current);
        setLoaded({attempt, writes, answer});
      } catch (error) {
        if (signal.aborted) return;
        const message = error instanceof MeshFetchError && error.status === 409 ? error.message : "The AI line could not be loaded.";
        setLoaded({attempt, writes, answer: {status: "error", message}});
      }
    }
    void read();
    return () => request.abort();
  }, [name, view, attempt, writes]);
  useEffect(() => () => view.setAiLine(null), [view]);

  const answer = loaded?.writes === writes && loaded.attempt === attempt ? loaded.answer : null;
  const lane = answer?.status === "ready" ? answer : null;
  const hover = hovered?.lane === lane ? hovered.hover : null;
  useEffect(() => {
    if (!enabled || !lane) return;
    view.showAiLine(hover => setHovered(hover && {lane, hover}));
    return () => view.showAiLine(null);
  }, [view, enabled, lane]);

  const [range, setRange] = useState(30);
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
    return view.editAiMoves(guide.data, url, moves, range, !lane,
      move => edits.addAiCorrection(move), id => edits.removeAiCorrection(id), setError);
  }, [canEdit, guide, revision, url, moves, range, lane, edits, view]);

  return {
    activate: () => { setError(""); setAttempt(value => value + 1); },
    clear: () => setHovered(null),
    options: <>
      <ToolOptions id="edit-ai-line-set" title="AI line" note={unsaved ? "Line from the last build or save" : undefined}
        actions={<>
          {canEdit && <label>Move range <input type="range" min="1" max="100" step="1" value={range}
            onChange={e => setRange(Number(e.target.value))} /> {range} m</label>}
          {answer && "canCalculate" in answer && answer.canCalculate && <button type="button" disabled={unsaved || working}
            title={unsaved ? "Save first." : undefined} onClick={() => void recalculate()}>Recalculate AI line</button>}
          {unsaved && <span>Save first.</span>}
          {answer && "validity" in answer && answer.validity === "manual" && <span>Manually replaced</span>}
          {lane?.validity === "pending" && <span>Unverified installed line</span>}
          {error && <span role="alert">{error}</span>}
          {working && <span role="status">Calculating AI line …</span>}
          {lane ? <Legend {...lane.speeds} />
          : <span role="status">{answer?.message ?? "Loading the installed AI line …"}</span>}</>} />
      {hover && <PointDetails hover={hover} />}
    </>,
  };
}
