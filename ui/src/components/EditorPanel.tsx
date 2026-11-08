import type {Ref} from "react";
import type {EditorLoadStatus, Track, TrackGroup} from "../types";
import styles from "./EditorPanel.module.css";
import {groupOf} from "./MyTracksPane";

const GROUPS: readonly (readonly [TrackGroup, string])[] = [["built", "Built"], ["edited", "Edited"]];

/** The Editor tab's sidebar: File with the track to show, what is loading (a line of its own: nothing moves) and its Save and Play, the places the 3D view's buttons
    are drawn into (fileRef, toolsRef, notesRef: there while the page is, hidden with the tab, as the view keeps its state), how it all works. */
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
            {typeof status.progress === "number" && <span>{Math.floor(status.progress * 100)}%</span>}
            <span id="edit-saved" ref={savedRef} />
          </div>
          <div className={styles.progressSlot}>
            <progress className={styles.progress} aria-label="Loading track" aria-describedby="edit-status" max={1}
                      value={status.progress ?? undefined} hidden={status.progress === undefined} />
          </div>
          {tracks.some(t => t.name === choice && !t.build_files && !t.edited) && (
            <p id="edit-note" className="small muted">This track’s build files are gone. Deleting objects works, changing its road later will
              need them: build it again under My tracks.</p>
          )}
          <div ref={fileRef} />
        </section>
        <div ref={toolsRef} />
        <details id="edit-help" className={styles.help}>
          <summary className={styles.helpTitle}>Help</summary>
          <div className={styles.helpText}>
            <p className="small muted">Select (V): click an object, such as a tree, a parked car, a house, a sign, a fence or a power line, and press X or Delete to take it out, Ctrl+Z brings it back. Ctrl + click adds more to it, or takes one out again. Right-click it to
              mark all of its sort, or Shift + click to select all matching. X then deletes them all. Delete (X with nothing picked): each click deletes what is under it.</p>
            <p className="small muted">Click ground to select a surface, such as asphalt, meadow, rock or the road verge. Roads stop at mapped branches; Shift + click selects all matching prepared areas, including separate ones; Ctrl adds to the selection. Select all and Add are also in the Select bar. Esc clears the highlight. Ground selection is prepared while loading and needs a track built with surface data. Edit or click Appearance to change a painted ground texture; its driving physics stay unchanged. Separate meshes such as the road verge cannot have their textures changed yet.</p>
            <p className="small muted">Smooth road (T, also in the road's right-click menu) includes Mark road: click road points to bound a region, then add or drag points for side-road branches. Orange shows the roads; faint orange shows the terrain transition. Strength starts at 0%, so marking changes nothing. Increase strength to smooth automatically; 0% restores this operation's starting surface. Transition controls the minimum soft edge into terrain, not the road width. Esc ends the tool and Ctrl+Z undoes the change. Mark road in its bar starts a new region at 0%. Elevation (H) raises or lowers the ground, with the road and what stands on it: a click by its height, held more and more where the ring is, each one Ctrl+Z.</p>
            <p className="small muted">Move (M, or Move in the right-click menu): drag a house, a tree or street furniture to where it should stand; Shift, Ctrl and Alt with the wheel turn, raise and size what is picked. A house takes its sign and door along, a pole its wires; dragging follows the terrain and keeps its height above the ground.</p>
            <p className="small muted">Copy (C): pick an object, then click to place copies repeatedly; Esc ends it. Duplicate in the right-click menu starts Copy with that object. A house takes its sign and door, a copied pole has no wires.</p>
            <p className="small muted">Changes are kept by themselves; Save writes the track for Assetto Corsa, ▾ saves it as a new track. What was deleted can be brought back after any Save.</p>
            <p className="small muted">W A S D move, the right mouse button takes the ground along, the wheel zooms, held it turns. Camera (K) goes along the track: all keys under Settings → Editor.</p>
          </div>
        </details>
      </div>
      <div className={styles.notes} ref={notesRef} />
    </section>
  );
}
