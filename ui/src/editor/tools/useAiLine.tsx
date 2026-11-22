import {useEffect, useMemo, useState} from "react";
import {BRAKE_COLOUR, EDGE_COLOUR, SPEED_COLOURS, laneSpeedRange, type AiLineAnswer, type AiLineHover} from "../scene/aiLine";
import {fetchJson} from "../scene/requests";
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

/** Load the installed spline when taken up and after the current track is written. Options and hover stay over the view. */
export function useAiLine({name, view, enabled, savedAt, unsaved}: {
  name: string; view: TrackView; enabled: boolean; savedAt: number | null; unsaved: boolean;
}): ToolController {
  const [loaded, setLoaded] = useState<{savedAt: number | null; answer: AiLineAnswer} | null>(null);
  const [hovered, setHovered] = useState<{savedAt: number | null; hover: AiLineHover} | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const request = new AbortController(), {signal} = request;
    async function read() {
      const answer = await fetchJson<AiLineAnswer>(`/api/editor/${encodeURIComponent(name)}/ai-line`, signal)
        .catch((): AiLineAnswer => ({status: "invalid", message: "The AI line could not be loaded."}));
      if (signal.aborted) return;
      if (answer.status === "ready") view.setAiLine(answer, hover => setHovered(hover && {savedAt, hover}));
      setLoaded({savedAt, answer});
    }
    void read();
    return () => { request.abort(); view.setAiLine(null); };
  }, [name, view, enabled, savedAt]);

  const answer = loaded?.savedAt === savedAt ? loaded.answer : null;
  const hover = hovered?.savedAt === savedAt ? hovered.hover : null;
  const speeds = useMemo(() => answer?.status === "ready" ? laneSpeedRange(answer.points) : null, [answer]);
  return {
    clear: () => { setLoaded(null); setHovered(null); },
    options: <>
      <ToolOptions id="edit-ai-line-set" title="AI line" note={unsaved ? "Linie vom letzten Build/Save" : undefined}
        actions={speeds ? <Legend {...speeds} />
          : <span role="status">{answer && "message" in answer ? answer.message : "Loading the installed AI line …"}</span>} />
      {hover && <PointDetails hover={hover} />}
    </>,
  };
}
