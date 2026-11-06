import {fmtDate, fmtSize} from "../format";
import type {Track, TrackGroup} from "../types";
import styles from "./MyTracksPane.module.css";
import {Seg} from "./Seg";

const GROUPS: readonly (readonly [TrackGroup, string])[] = [["built", "Built"], ["edited", "Edited"]];

const versionTag = (t: Track) => (t.version ? `v${t.version}` : "before v0.1");

/** The list a track stands in: saved in the Editor, it is its own work and no build can replace it. Pure. */
export const groupOf = (t: Track): TrackGroup => (t.edited ? "edited" : "built");

/** "My tracks": the tracks built, or saved in the Editor; lies over the space of "New track". */
export function MyTracksPane({tracks, group, pick, onGroup, onPick}: {tracks: Track[]; group: TrackGroup; pick: string | null;
                                                                     onGroup: (group: TrackGroup) => void; onPick: (t: Track) => void}) {
  const shown = tracks.filter(t => groupOf(t) === group);
  return (
    <div className={styles.pane}>
      <Seg choices={GROUPS} value={group} onChoose={onGroup} />
      <div id="pane-mine" className={styles.list}>
        {shown.length ? shown.map(t => (
          <button key={t.name} className={`${styles.track}${t.name === pick ? ` ${styles.on}` : ""}`} onClick={() => onPick(t)}>
            <b>{t.title}</b>
            <span className={styles.when}>{fmtDate(t.saved ?? t.built)}</span>
            <small>
              {t.area ? "Area" : "Route"} {fmtSize(t)} · {t.outdated
                ? <span className={styles.old}>{versionTag(t)} – old</span> : versionTag(t)}
            </small>
          </button>
        )) : <p className="empty">{group === "edited" ? "No edited tracks yet. Save a track in the Editor." : "No tracks yet. Build one under “New track”."}</p>}
      </div>
    </div>
  );
}
