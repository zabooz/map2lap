import {useId, useLayoutEffect, useRef, useState} from "react";
import {fmtLatLon, shortName} from "../format";
import {type MapMove, type NewTrack, type Point} from "../hooks/useNewTrack";
import type {Mode, Place} from "../types";
import {CodeField} from "./CodeField";
import styles from "./NewTrackPane.module.css";
import {SearchField} from "./SearchField";
import {Seg} from "./Seg";

const MODES: readonly (readonly [Mode, string])[] = [["route", "Route"], ["circuit", "Circuit"], ["area", "Area"]];

/** One pin field of a route or circuit. */
function StopRow({index, last, point, onPick, onRemove, label, circuit}: {
  index: number;
  last: number;
  point: Point | null;
  onPick: (p: Place) => void;
  onRemove?: () => void;
  label?: string;
  circuit: boolean;
}) {
  const kind = index === 0 ? "Start" : !circuit && index === last ? "Finish" : null;
  const what = label ?? kind ?? (circuit ? `Pin ${index + 1}` : `Stop ${index}`);
  const tag = label ? "+" : kind ? kind[0] : circuit ? index + 1 : index;
  const style = label ? "" : kind === "Start" ? styles.start : kind === "Finish" ? styles.finish : "";
  return (
    <div className={styles.stop}>
      <span className={`${styles.tag} ${style}`} title={what}>{tag}</span>
      <SearchField value={point ? point.label || fmtLatLon(point.lat, point.lon) : ""} ariaLabel={what}
                   placeholder={circuit && label ? "Next pin: search or click the map" : `${what}: search a place or click the map`} onPick={onPick} />
      {onRemove && <button className={styles.x} title="Remove" onClick={onRemove}>×</button>}
    </div>
  );
}

/** The pin fields: up to five rows fit and a new point shows at the end. */
function Stops({track, disabled}: {track: NewTrack; disabled: boolean}) {
  const {points} = track;
  const circuit = track.mode === "circuit";
  const last = Math.max(1, points.length - 1);
  const box = useRef<HTMLDivElement>(null);
  const shown = useRef(0);

  useLayoutEffect(() => {
    if (box.current && points.length > shown.current) box.current.scrollTop = box.current.scrollHeight;
    shown.current = points.length;
  }, [points.length]);

  return (
    <div className="field">
      <div className="label-row"><span>{circuit ? "Circuit" : "Route"}</span></div>
      <div className={styles.stopList}>
        <div className={styles.stops} ref={box}>
          {points.map((p, i) => (
            <StopRow key={p.id} index={i} last={last} point={p} circuit={circuit} onPick={place => track.movePlace(p.id, place)}
                     onRemove={() => track.removePoint(p.id)} />
          ))}
          {points.length < 2 && <StopRow key={`new-${points.length}`} index={points.length} last={last} point={null}
                                        circuit={circuit} onPick={track.addPlace} label={circuit ? "Next pin" : undefined} />}
        </div>
        {(track.closing || track.circuitClosed) && <div className={`${styles.stop} ${styles.lap}`}>
          <span className={styles.tag} aria-hidden="true">↻</span>
          <span>Back to S{track.circuitClosed && track.routeKm !== undefined && ` · Lap ${track.routeKm.toFixed(1)} km`}</span>
        </div>}
      </div>
      <div className={styles.stopActions}>
        <button className="add-stop clear" disabled={disabled} onClick={track.clear}>Clear all</button>
        {circuit && <button className={`add-stop clear ${styles.closeCircuit}`}
                            disabled={disabled || points.length < 2 || !track.canCloseCircuit}
                            onClick={track.closeCircuit}>Close circuit</button>}
      </div>
    </div>
  );
}

/** "Find a place" in area mode only moves the map. */
function FindPlace({onMove}: {onMove: (move: MapMove) => void}) {
  const [place, setPlace] = useState("");
  return (
    <SearchField value={place} placeholder="Find a place" onPick={p => {
      setPlace(shortName(p.name));
      onMove({kind: "view", at: [p.lat, p.lon], zoom: 14});
    }} />
  );
}

/** "New track": the pin and area forms share the same space. */
export function NewTrackPane({track, off, busy, onMove}: {track: NewTrack; off: boolean; busy: boolean;
                                                         onMove: (move: MapMove) => void}) {
  const {mode} = track;
  const codeId = useId();
  const nothing = busy || (!track.points.length && !track.area);       // (nothing to clear: quiet)
  return (
    <div className={`${styles.pane}${off ? ` ${styles.off}` : ""}`}>
      <Seg choices={MODES} value={mode} onChoose={track.setMode} />
      <div className="field">
        <div className="label-row"><span>Track name</span></div>
        <input id="title" type="text" value={track.title} spellCheck={false} aria-label="Track name"
               onChange={e => track.setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label className="label-row" htmlFor={codeId}>Track code</label>
        <CodeField id={codeId} code={track.code} onPaste={track.pasteCode} />
      </div>
      <div className={styles.stack}>
        <div className={styles.block} hidden={mode === "area"}>
          <Stops track={track} disabled={nothing} />
        </div>
        <div className={styles.block} hidden={mode !== "area"}>
          <div className="field">
            <div className="label-row"><span>Area</span></div>
            <FindPlace onMove={onMove} />
            <p className="small muted">Everything inside the rectangle is built. The car starts on the road nearest to the
              middle.</p>
            <button className="add-stop clear" disabled={nothing} onClick={track.clear}>Clear area</button>
          </div>
        </div>
      </div>
    </div>
  );
}
