import {useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore, type RefObject} from "react";
import {post} from "../api";
import {usePlay} from "../hooks/usePlay";
import {isCurrent, TrackEdits} from "./edits";
import styles from "./EditTools.module.css";
import {NOT_ALL, sortName} from "./inspect";
import {SaveDialog} from "./SaveDialog";
import type {Marked, MenuAt, Picked, TrackView} from "./view";
import {ViewMenu} from "./ViewMenu";

const count = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted`;
const clock = (at: number) => new Date(at * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

/** The bars over the view for the track name: what was clicked, deleting it, saving the track, Play; undo and redo at the bottom; the
    right-click menu. Saving goes as in a word processor: the changes are kept in the background by themselves (the draft, shown
    only when that fails), Save writes the track at once, ▾ asks again (in its place or as a new track); Play saves first. Its keys
    count while the focus is in scene: Delete, Esc, Ctrl+Z, Ctrl+Y or Ctrl+Shift+Z, Ctrl+S. Mounted anew per track and build (a key
    in EditorScene). title: the track's; taken: the other tracks' titles. onSaved: the track is saved as name (a copy: another one). */
export function EditTools({name, title, taken, view, scene, reopen, onSaved}: {
  name: string;
  title: string;
  taken: string[];
  view: TrackView;
  scene: RefObject<HTMLDivElement | null>;
  reopen: () => void;
  onSaved: (name: string) => void;
}) {
  const [edits] = useState(() => new TrackEdits(name));
  const state = useSyncExternalStore(edits.subscribe, edits.state);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [menu, setMenu] = useState<MenuAt | null>(null);
  const [marked, setMarked] = useState<Marked | null>(null);
  const [asking, setAsking] = useState<{play: boolean} | null>(null);     // (play: AC starts once it is saved)
  const [saving, setSaving] = useState<{busy: boolean; text: string | null}>({busy: false, text: null});
  const {starting, play} = usePlay();
  const editable = edits.canEdit();
  const current = isCurrent(state);

  useEffect(() => {
    void edits.start();
    const leaving = () => edits.saveNow(true);
    window.addEventListener("pagehide", leaving);
    return () => {
      window.removeEventListener("pagehide", leaving);
      edits.stop();
    };
  }, [edits]);

  useEffect(() => {
    view.setPick(p => {
      setPicked(p);
      setMarked(null);
    });
    view.setMenu(setMenu);
    view.setIndexed(revision => edits.bind(revision));
    return () => {
      view.setPick(() => {});
      view.setMenu(() => {});
      view.setIndexed(() => {});
    };
  }, [view, edits]);

  useEffect(() => { view.setRemoved(state.removed.map(r => r.id), state.sorts, state.objectSorts); },
            [view, state.removed, state.sorts, state.objectSorts]);

  useEffect(() => {
    view.setMarked(marked);
    return () => view.setMarked(null);
  }, [view, marked]);

  const removable = picked?.id ? {id: picked.id, position: picked.position} : null;
  const changed = state.removed.length > 0 || state.sorts.length > 0 || state.objectSorts.length > 0;
  const asBuilt = !changed && !state.recipe;        // (never saved here, nothing changed: nothing to save, as a file just opened)
  const canSave = editable && !saving.busy && !current && !asBuilt;
  const ids = state.removed.map(r => r.id);

  /** The track written as its edits say (trackcopy.save): in its place, or (copyTitle) as a new track the Editor then goes on
      with. The name it was written as, or null. */
  const write = async (copyTitle: string | null = null) => {
    setAsking(null);
    setSaving({busy: true, text: null});
    edits.hold(true);
    edits.saveNow();
    const revision = await edits.saved();
    if (revision === null) {
      edits.hold(false);
      setSaving({busy: false, text: "Not saved: the changes could not be kept. Nothing was written."});
      return null;
    }
    const r = await post<{name: string; title: string}>(`/api/editor/${encodeURIComponent(name)}/save`,
                                                       {copy: copyTitle !== null, title: copyTitle, revision});
    edits.hold(false);
    if (r.error || !r.name) {
      setSaving({busy: false, text: `Not saved: ${r.error ?? "no answer"}`});
      return null;
    }
    setSaving({busy: false, text: null});       // (a copy: the Editor shows it now, its name in the track field)
    if (copyTitle !== null) edits.handOver(r.name);
    else edits.markSaved();
    onSaved(r.name);
    return r.name;
  };

  /** What the dialog chose, then AC if Play asked for it. */
  const chosen = async (copyTitle: string | null) => {
    view.focus();
    const then = asking?.play, saved = await write(copyTitle);
    if (saved && then) void play(saved);
  };

  /** Save: a track never saved here asks once (in its place, or a new track), then it writes at once. */
  const save = () => {
    if (!canSave) return;
    if (state.recipe) void write();
    else setAsking({play: false});
  };

  /** Play: saved first if it isn't, the same way. */
  const drive = async () => {
    if (current || asBuilt) void play(name);
    else if (!state.recipe) setAsking({play: true});
    else if (await write()) void play(name);
  };

  /** The list read again, and if it is of another build than the view shows, the track too. */
  const readAgain = async () => {
    await edits.start();
    if (edits.viewBehind()) reopen();
  };

  /** After a button: the keys go back to the view. */
  const then = (action: () => void) => () => {
    action();
    view.focus();
  };
  const sort = picked?.id && picked.sort && !NOT_ALL.has(picked.sort) ? picked.sort : null;
  const tree = picked?.id && picked.sprite ? picked.sprite : null;
  const markLabel = !menu ? null : sort ? `Mark all ${sortName(sort)} (${view.countOfListed(sort, ids, state.objectSorts)})`
    : tree ? `Mark all ${tree} (loaded: ${view.countOf(tree)})` : null;
  const markedName = marked && (marked.tree ? marked.sort : sortName(marked.sort));

  const remove = () => {
    if (!editable) return;
    if (marked) {               // (all of the marked sort, as a rule)
      if (marked.tree) edits.removeSort(marked.sort);
      else edits.removeObjectSort(marked.sort);
      setMarked(null);
      view.unpick();
    } else if (removable) {
      edits.remove([removable]);
      view.unpick();
    }
  };
  const closeMenu = useCallback(() => setMenu(null), []);
  const cancelSave = useCallback(() => {
    setAsking(null);
    view.focus();
  }, [view]);

  // (an effect event: Delete pressed right after a click reaches what that click picked, not the list of keys before it)
  const keys = useEffectEvent((e: KeyboardEvent) => {
    const control = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (asking) {               // (the dialog's name field keeps its own keys; Ctrl+S isn't the browser's)
      if (control && key === "s") e.preventDefault();
      return;
    }
    if (e.key === "Delete") remove();
    else if (e.key === "Escape") {
      setMenu(null);
      setMarked(null);
    } else if (control && key === "z") {
      if (e.shiftKey) edits.redo();
      else edits.undo();
    } else if (control && key === "y") edits.redo();
    else if (control && key === "s") save();
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    const on = scene.current!, listen = (e: KeyboardEvent) => keys(e);
    on.addEventListener("keydown", listen);
    return () => on.removeEventListener("keydown", listen);
  }, [scene]);

  const savedText = saving.busy ? "Saving …" : current ? `Saved ${clock(state.recipe!.at)}` : asBuilt ? "" : "Not saved";
  const canPlay = !starting && !saving.busy && state.save !== "loading" && (current || asBuilt || canSave);

  return (
    <>
      <div id="edit-bar" className={styles.bar} data-kept={state.save}>
        <div className={styles.row}>
          <button type="button" disabled={(!removable && !marked) || !editable} onClick={then(remove)}>Delete</button>
          <button type="button" disabled={!changed || !editable} onClick={then(() => edits.discard())}>Discard</button>
          <span className={styles.split}>
            <button type="button" id="edit-save" title="Write this track for Assetto Corsa (Ctrl+S)" disabled={!canSave} onClick={then(save)}>Save</button>
            <button type="button" id="edit-save-more" aria-label="Save as new track" title="Save as new track …"
                    disabled={!editable || saving.busy} onClick={() => setAsking({play: false})}>▾</button>
          </span>
          <button type="button" id="edit-play" disabled={!canPlay} title="Save if needed, then drive it in Assetto Corsa"
                  onClick={then(() => void drive())}>{starting ? "Starting …" : "▶ Play"}</button>
          <span id="edit-saved" className={styles.state}>{savedText}</span>
          {state.save === "failed" && <span id="edit-kept" className={styles.state}>Changes not kept: trying again</span>}
        </div>
        {state.removed.length > 0 && <p id="edit-count" className={styles.line}>{count(state.removed.length)}</p>}
        {(state.sorts.length > 0 || state.objectSorts.length > 0) && (
          <p id="edit-sorts" className={styles.line}>All deleted: {[...state.sorts, ...state.objectSorts.map(sortName)].join(", ")}</p>
        )}
        {marked && <p id="edit-marked" className={styles.line}>All {markedName} marked: Delete deletes them all, Esc ends it.</p>}
        {picked && !marked && (
          <p id="edit-picked" className={styles.line}>
            {picked.kind}{picked.sprite && ` · ${picked.sprite}`}{sort && sortName(sort) !== picked.kind && ` · ${sortName(sort)}`}
            {!picked.id && (picked.afterBuild ? ": only a new build can delete it" : ": can't be deleted yet")}
          </p>
        )}
        {saving.text && <p id="edit-made" className={styles.line}>{saving.text}</p>}
        {state.outdated > 0 && (
          <p id="edit-outdated" className={styles.line}>
            {state.outdated} older {state.outdated === 1 ? "change belongs" : "changes belong"} to an earlier build of this track and {state.outdated === 1 ? "is" : "are"} not applied.{" "}
            <button type="button" onClick={then(() => edits.discardOutdated())}>Give up</button>
          </p>
        )}
        {state.save === "stuck" && (
          <p id="edit-stuck" className={styles.line}>
            {state.error}{" "}
            <button type="button" onClick={then(() => void readAgain())}>Read again</button>
          </p>
        )}
      </div>
      <div id="edit-history" className={styles.history}>
        <button type="button" disabled={!state.canUndo || !editable} onClick={then(() => edits.undo())}>↶ Undo</button>
        <button type="button" disabled={!state.canRedo || !editable} onClick={then(() => edits.redo())}>↷ Redo</button>
        <button type="button" title="Back to the first view, behind the start" onClick={then(() => view.home())}>⌂ Start</button>
      </div>
      {menu && (
        <ViewMenu at={menu} mark={editable ? markLabel : null} canDelete={!!removable && editable} onClose={closeMenu}
                  onMark={() => { setMarked(sort ? {sort, tree: false} : {sort: tree!, tree: true}); view.focus(); }}
                  onDelete={() => { remove(); view.focus(); }} />
      )}
      {asking && <SaveDialog title={title} taken={taken} canOverwrite={canSave} onOverwrite={() => void chosen(null)}
                             onSaveNew={t => void chosen(t)} onCancel={cancelSave} />}
    </>
  );
}
