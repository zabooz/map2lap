import {useLayoutEffect, useRef, useState} from "react";
import {fmtLatLon, shortName} from "../format";
import {type MapMove, type NewTrack, type Point} from "../hooks/useNewTrack";
import type {Mode, Place} from "../types";
import {CodeField} from "./CodeField";
import {CodeIcon} from "./icons";
import styles from "./NewTrackPane.module.css";
import {SearchField} from "./SearchField";
import {Seg} from "./Seg";

const MODES: readonly (readonly [Mode, string])[] = [["route", "Route"], ["area", "Area"], ["circuit", "Circuit"]];

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

/** The pin fields; from three on the list scrolls, a new point shows at the end. */
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
      <div className={styles.stop}>
        <span className={styles.tag} title="Track code"><CodeIcon /></span>
        <CodeField code={track.code} onPaste={track.pasteCode} />
      </div>
      <div className={styles.stopList}>
        <div className={styles.stops} ref={box}>
          {points.map((p, i) => (
            <StopRow key={p.id} index={i} last={last} point={p} circuit={circuit} onPick={place => track.movePlace(p.id, place)}
                     onRemove={() => track.removePoint(p.id)} />
          ))}
          <StopRow key={`new-${points.length}`} index={points.length} last={last} point={null} circuit={circuit} onPick={track.addPlace}
                   label={circuit ? "Next pin" : points.length >= 2 ? "Next stop" : undefined} />
        </div>
        {circuit && points.length >= 2 && <div className={`${styles.stop} ${styles.lap}`}>
          <span className={styles.tag} aria-hidden="true">↻</span>
          <span>Back to S{track.routeKm !== undefined && ` · Lap ${track.routeKm.toFixed(1)} km`}</span>
        </div>}
      </div>
      <button className="add-stop clear" disabled={disabled} onClick={track.clear}>Clear all</button>
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

/** "New track": the pin and area forms share the same space above the status card. */
export function NewTrackPane({track, off, busy, onMove}: {track: NewTrack; off: boolean; busy: boolean;
                                                         onMove: (move: MapMove) => void}) {
  const {mode} = track;
  const nothing = busy || (!track.points.length && !track.area);       // (nothing to clear: quiet)
  return (
    <div className={`${styles.pane}${off ? ` ${styles.off}` : ""}`}>
      <Seg choices={MODES} value={mode} onChoose={track.setMode} />
      <div className="field">
        <div className="label-row"><span>Track name</span></div>
        <input id="title" type="text" value={track.title} spellCheck={false} aria-label="Track name"
               onChange={e => track.setTitle(e.target.value)} />
      </div>
      <div className={styles.stack}>
        <div className={styles.block} hidden={mode === "area"}>
          <Stops track={track} disabled={nothing} />
        </div>
        <div className={styles.block} hidden={mode !== "area"}>
          <div className="field">
            <div className="label-row"><span>Area</span></div>
            <CodeField code={track.code} onPaste={track.pasteCode} />
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
