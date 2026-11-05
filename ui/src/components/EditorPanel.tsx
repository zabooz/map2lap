import type {Track} from "../types";
import styles from "./EditorPanel.module.css";

/** The Editor tab's sidebar: the track to show, what is loading (a line of its own: nothing moves), how the view moves. */
export function EditorPanel({tracks, choice, status, onChoose}: {tracks: Track[]; choice: string; status: string;
                                                                 onChoose: (name: string) => void}) {
  return (
    <section id="editor" className="view">
      <div className="field">
        <div className="label-row"><span>Track</span></div>
        <select id="edit-track" className={styles.track} aria-label="Track" value={choice} onChange={e => onChoose(e.target.value)}>
          <option value="">Choose a track</option>
          {tracks.filter(t => t.kn5_bytes).map(t => <option key={t.name} value={t.name}>{t.title || t.name}</option>)}
        </select>
      </div>
      <p id="edit-status" className={`small muted ${styles.status}`}>{status}</p>
      {tracks.some(t => t.name === choice && !t.build_files) && (
        <p id="edit-note" className="small muted">This track’s build files are gone. You can look at it, but editing it will
          need them: build it again under My tracks.</p>
      )}
      <p className="small muted">W A S D fly where you look, hold the wheel and drag to look around on the spot. Left drag
        orbits the view, right drag moves it, the wheel zooms towards the mouse.</p>
    </section>
  );
}
