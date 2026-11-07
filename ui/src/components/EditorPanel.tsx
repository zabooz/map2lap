import type {Ref} from "react";
import type {Track, TrackGroup} from "../types";
import styles from "./EditorPanel.module.css";
import {groupOf} from "./MyTracksPane";

const GROUPS: readonly (readonly [TrackGroup, string])[] = [["built", "Built"], ["edited", "Edited"]];

/** The Editor tab's sidebar: the track to show, what is loading (a line of its own: nothing moves), the places the 3D view's tools are drawn into (toolsRef, notesRef:
    there while the page is, hidden with the tab, as the view keeps its state), how it all works. */
export function EditorPanel({tracks, choice, status, hidden, toolsRef, notesRef, onChoose}: {tracks: Track[]; choice: string; status: string; hidden: boolean;
                                                                                             toolsRef: Ref<HTMLDivElement>; notesRef: Ref<HTMLDivElement>;
                                                                                             onChoose: (name: string) => void}) {
  return (
    <section id="editor" className="view" hidden={hidden}>
      <div className={styles.scroll}>
        <div className="field">
          <div className="label-row"><span>Track</span></div>
          <select id="edit-track" className={styles.track} aria-label="Track" value={choice} onChange={e => onChoose(e.target.value)}>
            <option value="">Choose a track</option>
            {GROUPS.map(([group, label]) => {
              const shown = tracks.filter(t => t.kn5_bytes && groupOf(t) === group);
              return shown.length > 0 && (
                <optgroup key={group} label={label}>
                  {shown.map(t => <option key={t.name} value={t.name}>{t.title || t.name}</option>)}
                </optgroup>
              );
            })}
          </select>
        </div>
        <p id="edit-status" className={`small muted ${styles.status}`}>{status}</p>
        {tracks.some(t => t.name === choice && !t.build_files && !t.edited) && (
          <p id="edit-note" className="small muted">This track’s build files are gone. Deleting objects works, changing its road later will
            need them: build it again under My tracks.</p>
        )}
        <div ref={toolsRef} />
        <details id="edit-help" className={styles.help}>
          <summary className={styles.helpTitle}>Help</summary>
          <div className={styles.helpText}>
            <p className="small muted">Select (V): click an object, such as a tree, a parked car, a house, a sign, a fence or a power line, and press X or Delete to take it out, Ctrl+Z brings it back. Shift + click adds more to it, or takes one out again. Right-click it to
              mark all of its sort, X then deletes them all. Delete (X with nothing picked): each click deletes what is under it.</p>
            <p className="small muted">Mark road (R): two clicks on the road mark a stretch of it; further clicks add pins that say which way it goes. Smooth (T, or a right click on what is marked) evens it out, marked before or after, and shows it at once: Enter takes it. Elevation (H) raises or lowers the ground, with the road and what stands on it: a click by its height, held more and more where the ring is, each one Ctrl+Z.</p>
            <p className="small muted">Changes are kept by themselves; Save writes the track for Assetto Corsa, ▾ saves it as a new track. What was deleted can be brought back after any Save.</p>
            <p className="small muted">W A S D move, the right mouse button takes the ground along, the wheel zooms, held it turns. Camera (C) goes along the track: all keys under Settings → Editor.</p>
          </div>
        </details>
      </div>
      <div className={styles.notes} ref={notesRef} />
    </section>
  );
}
