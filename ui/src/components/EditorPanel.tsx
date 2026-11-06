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
        <p id="edit-note" className="small muted">This track’s build files are gone. Deleting objects works, changing its road later will
          need them: build it again under My tracks.</p>
      )}
      <p className="small muted">Click an object, such as a tree, a parked car, a house, a sign, a fence or a power line, and press Delete to take it out, Ctrl+Z brings it back. Right-click it to
        mark all of its sort. Changes are kept by themselves; Save writes the track for Assetto Corsa, ▾ saves it as a new track.
        What was deleted can be brought back after any Save.</p>
      <p className="small muted">W A S D move, the right mouse button takes the ground along, the wheel zooms, held it turns: all keys under Settings → Editor.</p>
    </section>
  );
}
