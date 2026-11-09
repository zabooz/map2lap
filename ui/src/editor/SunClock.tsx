import {useEffect, useState} from "react";
import styles from "./SunClock.module.css";
import {clockText} from "./sun";
import type {TrackView} from "./view";

const START = 10 * 60;          // minutes after midnight a track opens at
const LAST = 24 * 60 - 1;

/** The time of day the view shows, the track's local time as in AC; Play starts AC at it. Nothing is saved or built.
    Mounted once per track, so each opens at 10:00. */
export function SunClock({view}: {view: TrackView}) {
  const [minutes, setMinutes] = useState(START);
  useEffect(() => { view.setClock(minutes / 60); }, [view, minutes]);
  return (
    <div id="sun-clock" className={styles.clock}>
      <input type="range" min={0} max={LAST} step={1} value={minutes} aria-label="Time of day"
             onChange={e => setMinutes(Number(e.target.value))} />
      <span className={styles.time}>{clockText(minutes)}</span>
      <button type="button" disabled={minutes === START} onClick={() => setMinutes(START)}>Reset</button>
    </div>
  );
}
