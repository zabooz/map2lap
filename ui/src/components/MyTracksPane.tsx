import {fmtDate} from "../format";
import type {Mode, Track, TrackGroup} from "../types";
import styles from "./MyTracksPane.module.css";
import {Seg} from "./Seg";

const GROUPS: readonly (readonly [TrackGroup, string])[] = [["built", "Built"], ["edited", "Edited"]];

export type TrackFilter = "all" | Mode;
const TYPE_LABELS: Record<Mode, string> = {area: "Area", route: "Route", circuit: "Circuit"};

/** Older area tracks carry their bounds without an explicit kind. Pure. */
export const trackMode = (track: Track): Mode => track.area ? "area" : track.kind ?? "route";

const versionTag = (t: Track) => (t.version ? `v${t.version}` : "before v0.1");

/** The list a track stands in: saved in the Editor, it is its own work and no build can replace it. Pure. */
export const groupOf = (t: Track): TrackGroup => (t.edited ? "edited" : "built");

/** The built or edited tracks, with the active selection, in the sidebar's available list space. */
export function MyTracksPane({tracks, group, pick, search, filter, onFilter, onSearch, onGroup, onPick}: {
  tracks: Track[]; group: TrackGroup; pick: string | null; search: string; filter: TrackFilter; onFilter: (type: TrackFilter) => void;
  onSearch: (value: string) => void; onGroup: (group: TrackGroup) => void; onPick: (t: Track) => void;
}) {
  return (
    <div className={styles.pane}>
      <Seg choices={GROUPS} value={group} onChoose={onGroup} />
      <div className={styles.filters}>
        <input type="search" className={styles.search} data-testid="my-tracks-search" aria-label="Search tracks"
          placeholder="Search tracks" value={search} onChange={e => onSearch(e.target.value)} />
        <select aria-label="Track type" data-testid="my-tracks-type" value={filter}
          onChange={e => onFilter(e.target.value as TrackFilter)}>
          <option value="all">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div id="pane-mine" data-testid="my-tracks-list" className={styles.list}>
        {tracks.length ? tracks.map(t => (
          <button key={t.name} className={`${styles.track}${t.name === pick ? ` ${styles.on}` : ""}`} aria-pressed={t.name === pick} onClick={() => onPick(t)}>
            <b title={t.title}>{t.title}</b>
            <small>{TYPE_LABELS[trackMode(t)]} · {t.outdated
              ? <span className={styles.old}>{versionTag(t)} – old</span> : versionTag(t)}</small>
            <span className={styles.when}>{fmtDate(t.saved ?? t.built)}</span>
          </button>
        )) : <p className="empty">{search.trim() || filter !== "all" ? "No matching tracks." : group === "edited" ? "No edited tracks yet. Save a track in the Editor." : "No tracks yet. Build one under “New track”."}</p>}
      </div>
    </div>
  );
}
