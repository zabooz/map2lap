import {useLayoutEffect, useRef, useState} from "react";
import {fmtLatLon, shortName} from "../format";
import {WIDTH_RANGE, type MapMove, type NewTrack, type Point} from "../hooks/useNewTrack";
import type {Mode, Place} from "../types";
import {CodeField} from "./CodeField";
import {CodeIcon} from "./icons";
import styles from "./NewTrackPane.module.css";
import {SearchField} from "./SearchField";
import {Seg} from "./Seg";

const MODES: readonly (readonly [Mode, string])[] = [["route", "Route"], ["area", "Area"]];

/** One field of the route: start, a stop or the finish. */
function StopRow({index, last, point, onPick, onRemove, onLeaveEmpty, autoFocus}: {
  index: number;
  last: number;
  point: Point | null;
  onPick: (p: Place) => void;
  onRemove?: () => void;
  onLeaveEmpty?: () => void;
  autoFocus?: boolean;
}) {
  const kind = index === 0 ? "Start" : index === last ? "Finish" : null;
  const what = kind ?? `Stop ${index}`;
  return (
    <div className={styles.stop}>
      <span className={`${styles.tag} ${index === 0 ? styles.start : index === last ? styles.finish : ""}`} title={what}>{kind ? kind[0] : index}</span>
      <SearchField value={point ? point.label || fmtLatLon(point.lat, point.lon) : ""} ariaLabel={what}
                   placeholder={`${what}: search a place or click the map`} onPick={onPick}
                   onLeaveEmpty={onLeaveEmpty} autoFocus={autoFocus} />
      {onRemove && <button className={styles.x} title="Remove" onClick={onRemove}>×</button>}
    </div>
  );
}

/** The route's fields; from three on the list scrolls, a new point shows at the end. */
function Stops({track, disabled}: {track: NewTrack; disabled: boolean}) {
  const {points, addingStop} = track;
  const empty = addingStop || !points.length, last = points.length + (empty ? 1 : 0) - 1;
  const box = useRef<HTMLDivElement>(null);
  const shown = useRef(0);

  useLayoutEffect(() => {
    if (box.current && (points.length > shown.current || addingStop)) box.current.scrollTop = box.current.scrollHeight;
    shown.current = points.length;
  }, [points.length, addingStop]);

  return (
    <div className="field">
      <div className="label-row"><span>Route</span></div>
      <div className={styles.stop}>
        <span className={styles.tag} title="Track code"><CodeIcon /></span>
        <CodeField code={track.code} onPaste={track.pasteCode} />
      </div>
      <div className={styles.stops} ref={box}>
        {points.map((p, i) => (
          <StopRow key={p.id} index={i} last={last} point={p} onPick={place => track.movePlace(p.id, place)}
                   onRemove={() => track.removePoint(p.id)} />
        ))}
        {empty && (
          <StopRow key="new" index={points.length} last={last} point={null} onPick={track.addPlace} autoFocus={addingStop}
                   onRemove={points.length ? () => track.setAddingStop(false) : undefined}
                   onLeaveEmpty={points.length ? () => track.setAddingStop(false) : undefined} />
        )}
      </div>
      <button className="add-stop" disabled={!points.length || addingStop} onClick={() => track.setAddingStop(true)}>
        + Add a stop
      </button>
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

/** "New track": what is built. Route and area lie on top of each other, the taller sets the height: switching doesn't jump. */
export function NewTrackPane({track, off, busy, onMove}: {track: NewTrack; off: boolean; busy: boolean;
                                                         onMove: (move: MapMove) => void}) {
  const {mode, width} = track;
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
        <div className={styles.block} hidden={mode !== "route"}>
          <Stops track={track} disabled={nothing} />
          <div className="field">
            <div className="label-row"><span>Corridor each side</span><span className="val">±{width} m</span></div>
            <input type="range" min={WIDTH_RANGE[0]} max={WIDTH_RANGE[1]} step={WIDTH_RANGE[2]} value={width}
                   aria-label="Corridor each side" onChange={e => track.setWidth(+e.target.value)} />
            <p className="small muted">The strip beside the road that is built in full: terrain, trees and buildings.
              Beyond it you see distant mountains. Wider means more scenery, but a longer build.</p>
          </div>
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
