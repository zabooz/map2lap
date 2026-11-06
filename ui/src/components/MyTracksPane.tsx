import {fmtDate, fmtSize} from "../format";
import type {Track} from "../types";
import styles from "./MyTracksPane.module.css";

const versionTag = (t: Track) => (t.version ? `v${t.version}` : "before v0.1");

/** "My tracks": the tracks built before; lies over the space of "New track". */
export function MyTracksPane({tracks, pick, onPick}: {tracks: Track[]; pick: string | null; onPick: (t: Track) => void}) {
  return (
    <div id="pane-mine" className={styles.pane}>
      {tracks.length ? tracks.map(t => (
        <button key={t.name} className={`${styles.track}${t.name === pick ? ` ${styles.on}` : ""}`} onClick={() => onPick(t)}>
          <b>{t.title}</b>
          <span className={styles.when}>{fmtDate(t.built)}</span>
          <small>
            {t.area ? "Area" : "Route"} {fmtSize(t)} · {t.outdated
              ? <span className={styles.old}>{versionTag(t)} – old</span> : versionTag(t)}{t.edited && " · edited"}
          </small>
        </button>
      )) : <p className="empty">No tracks yet. Build one under “New track”.</p>}
    </div>
  );
}
