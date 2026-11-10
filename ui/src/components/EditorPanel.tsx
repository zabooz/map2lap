import type {Ref} from "react";
import type {EditorLoadStatus, Track, TrackGroup} from "../types";
import styles from "./EditorPanel.module.css";
import {groupOf} from "./MyTracksPane";

const GROUPS: readonly (readonly [TrackGroup, string])[] = [["built", "Built"], ["edited", "Edited"]];

/** The Editor tab's sidebar: File with the track to show, what is loading (a line of its own: nothing moves; its bar is a toast) and its Save and Play, the places the 3D view's buttons
    are drawn into (fileRef, toolsRef with the help, notesRef: there while the page is, hidden with the tab, as the view keeps its state). */
export function EditorPanel({tracks, choice, status, hidden, fileRef, savedRef, toolsRef, notesRef, onChoose}: {tracks: Track[]; choice: string; status: EditorLoadStatus; hidden: boolean;
                                                                                                      fileRef: Ref<HTMLDivElement>; toolsRef: Ref<HTMLDivElement>;
                                                                                                      savedRef: Ref<HTMLSpanElement>;
                                                                                                      notesRef: Ref<HTMLDivElement>; onChoose: (name: string) => void}) {
  return (
    <section id="editor" className="view" hidden={hidden}>
      <div className={styles.scroll}>
        <section className={styles.file}>
          <h3 className={styles.title}>File</h3>
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
          <div className={`small muted ${styles.status}`}>
            <span id="edit-status">{status.text}</span>
            <span id="edit-saved" ref={savedRef} />
          </div>
          {tracks.some(t => t.name === choice && !t.build_files && !t.edited) && (
            <p id="edit-note" className="small muted">This track’s build files are gone. Deleting objects works, changing its road later will
              need them: build it again under My tracks.</p>
          )}
          <div ref={fileRef} />
        </section>
        <div ref={toolsRef} />
      </div>
      <div className={styles.notes} ref={notesRef} />
    </section>
  );
}
