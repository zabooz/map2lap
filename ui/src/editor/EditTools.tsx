import {useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore, type RefObject} from "react";
import {post} from "../api";
import {usePlay} from "../hooks/usePlay";
import {isCurrent, TrackEdits, type EditState, type HeightChange} from "./edits";
import styles from "./EditTools.module.css";
import {NOT_ALL, sortName} from "./inspect";
import {SaveDialog} from "./SaveDialog";
import {useBand} from "./useBand";
import type {Marked, MenuAt, Picked, Sample, TrackView} from "./view";
import {ViewMenu} from "./ViewMenu";

const count = (n: number) => `${n} ${n === 1 ? "object" : "objects"} deleted`;
const heightCount = (n: number) => `${n} height ${n === 1 ? "change" : "changes"}`;
const standingText = (n: number) => `${n} ${n === 1 ? "object stands" : "objects stand"} at the edge of it and stayed where ${n === 1 ? "it is" : "they are"}: its place lies outside.`;
const CM_TO_MM = 10;
const FIRST_BRUSH = {radius: 5, height: 5, speed: 30, soft: 25, lower: false};      // (m, cm, cm a second held, % of the radius)
const MIN_RADIUS = 3, MAX_RADIUS = 500, MIN_HEIGHT = 1, MAX_HEIGHT = 10000;     // (trackheights: its brush; 100 m)
const WHEEL_SHARE = 0.1;            // a notch of the wheel changes the brush by this share, at least a step: the same feel at 5 m and at 200 m
/** value a notch of the wheel up or down (by: 1 or -1), within those limits. Pure. */
const stepped = (value: number, by: number, step: number, least: number, most: number) =>
  Math.min(most, Math.max(least, Math.round(value + by * Math.max(step, value * WHEEL_SHARE))));
const isChanged = (s: EditState) => s.removed.length > 0 || s.sorts.length > 0 || s.objectSorts.length > 0 || s.heights.length > 0;
/** Never saved here, nothing changed: nothing to save, as a file just opened. Pure. */
const isAsBuilt = (s: EditState) => !isChanged(s) && !s.recipe;
const clock = (at: number) => new Date(at * 1000).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

/** The bars over the view for the track name: what was clicked, deleting it, the brush, saving the track, Play; undo and redo at the
    bottom; the right-click menu. Saving goes as in a word processor: the changes are kept in the background by themselves (the draft, shown
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
  const [tool, setTool] = useState<"brush" | "delete" | null>(null);    // (delete: each click deletes what is under it)
  const [brush, setBrush] = useState(FIRST_BRUSH);
  const [brushNote, setBrushNote] = useState<string | null>(null);
  const [viewFailed, setViewFailed] = useState<string | null>(null);
  const {starting, play} = usePlay();
  const editable = edits.canEdit();
  const current = isCurrent(state);
  const painting = tool === "brush" && editable;
  const deleting = tool === "delete" && editable;
  const band = useBand({name, view, edits, enabled: tool === null && editable, revision: state.keptRevision, onNote: setBrushNote});

  /** What a click picked; with "click deletes" on, gone at once. */
  const onPicked = useEffectEvent((p: Picked | null) => {
    setPicked(p);
    setMarked(null);
    if (deleting && p?.id && p.left) {
      edits.remove([{id: p.id, position: p.position}]);
      view.unpick();
    }
  });

  /** With no tool on, a click on the road marks a band: A, B, a point in between; on grass or the sky the marking goes. */
  const onClicked = useEffectEvent((p: Picked | null) => {
    if (tool !== null || !editable) return;
    if (p?.road) {
      setPicked(null);
      band.click(p.road[0], p.road[1]);
    } else if (!p?.id) band.clear();
  });

  useEffect(() => {
    view.setClicked(p => onClicked(p));
    return () => view.setClicked(() => {});
  }, [view]);

  useEffect(() => { view.setWheelTaken(band.line !== null && tool === null); }, [view, band.line, tool]);

  useEffect(() => {
    if (tool !== null) band.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (a tool taken up ends the marking; band is new each time)
  }, [tool]);

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
    view.setPick(p => onPicked(p));
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

  useEffect(() => {
    edits.setOnMeshes((meshes, revision) => view.refreshMeshes(meshes, revision));
    view.setViewFailed(setViewFailed);
    return () => {
      edits.setOnMeshes(() => {});
      view.setViewFailed(() => {});
    };
  }, [view, edits]);

  useEffect(() => { view.setBrush(painting ? {radius: brush.radius, lower: brush.lower} : null); },
            [view, painting, brush.radius, brush.lower]);

  useEffect(() => () => view.setBrush(null), [view]);

  const brushWheel = useEffectEvent((what: "radius" | "height", by: number) => {
    if (tool === null) return band.wheel(what, by);
    setBrush(b => (what === "radius" ? {...b, radius: stepped(b.radius, by, 1, MIN_RADIUS, MAX_RADIUS)}
                                     : {...b, height: stepped(b.height, by, 1, MIN_HEIGHT, MAX_HEIGHT)}));
  });

  useEffect(() => {
    view.setBrushWheel((what, by) => brushWheel(what, by));
    return () => view.setBrushWheel(() => {});
  }, [view]);

  /** What the server makes a stroke of goes by these, with where the ring was and for how long. */
  const strokeBody = (samples: Sample[], lower: boolean) => ({
    samples, base: edits.boundRevision(), radius: brush.radius, soft: brush.soft / 100,
    mm: Math.round(brush.height * CM_TO_MM) * (lower ? -1 : 1), speed: Math.round(brush.speed * CM_TO_MM)});

  /** A stroke made, as the server makes it into a height change with all of it looked at, loaded in the view or not. */
  const stroked = useEffectEvent((samples: Sample[], lower: boolean) => {
    const body = strokeBody(samples, lower);
    void edits.inTurn(async () => {
      const r = await post<{height: HeightChange; standing: number}>(`/api/editor/${encodeURIComponent(name)}/brush`, body);
      const failed = r.error || !r.height ? r.error ?? "no answer" : edits.canEdit() ? null : "this track can't be changed now";
      if (failed) {
        view.dropPreview();
        return setBrushNote(`Not changed: ${failed}`);
      }
      edits.addHeight(r.height!);
      setBrushNote(r.standing ? standingText(r.standing) : null);
    });
  });

  /** A stroke under way, as far as it has come: what it changes, or why it can't be; null: no answer this time. */
  const askPreview = useEffectEvent(async (samples: Sample[], lower: boolean) => {
    const r = await fetch(`/api/editor/${encodeURIComponent(name)}/brush/preview`,
                          {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(strokeBody(samples, lower))}).catch(() => null);
    if (!r) return null;
    if (r.ok) return r.arrayBuffer().catch(() => null);
    return String((await r.json().catch(() => null))?.error ?? r.status);
  });

  useEffect(() => {
    view.setStroke((samples, lower) => stroked(samples, lower), (samples, lower) => askPreview(samples, lower), why => setBrushNote(`Not changed: ${why}`));
    return () => view.setStroke(() => {}, () => Promise.resolve(null), () => {});
  }, [view]);

  const removable = picked?.id ? {id: picked.id, position: picked.position} : null;
  const changed = isChanged(state);
  const asBuilt = isAsBuilt(state);
  const canSave = editable && !saving.busy && !current && !asBuilt;
  const ids = state.removed.map(r => r.id);

  /** The track written as its edits say (trackcopy.save): in its place, or (copyTitle) as a new track the Editor then goes on
      with. The name it was written as, or null. */
  const write = async (copyTitle: string | null = null) => {
    setAsking(null);
    setSaving({busy: true, text: null});
    await edits.settled();
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

  /** Save: a track never saved here asks once (in its place, or a new track), then it writes at once. After the strokes on their way:
      what it goes by is the list with them in it. */
  const save = async () => {
    await edits.settled();
    const now = edits.state();
    if (!edits.canEdit() || saving.busy || isCurrent(now) || isAsBuilt(now)) return;
    if (now.recipe) void write();
    else setAsking({play: false});
  };

  /** Play: saved first if it isn't, the same way, after the strokes on their way too. */
  const drive = async () => {
    await edits.settled();
    const now = edits.state();
    if (isCurrent(now) || isAsBuilt(now)) void play(name);
    else if (!now.recipe) setAsking({play: true});
    else if (await write()) void play(name);
  };

  /** The list read again, and if it is of another build than the view shows, the track too. */
  const readAgain = async () => {
    const shown = state.heights.map(h => h.id).join();
    await edits.start();
    if (edits.viewBehind() || edits.state().heights.map(h => h.id).join() !== shown) reopen();     // (the meshes as the list it read says)
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
    if (e.key !== "Escape" && e.key !== "Enter" && (e.target as HTMLElement).tagName === "INPUT") return;      // (a tool's number keeps its own keys)
    if (e.key === "Delete") remove();
    else if (e.key === "Escape") {
      setMenu(null);
      setMarked(null);
      if (!view.cancelStroke() && !band.cancel()) setTool(null);     // (a stroke under way goes first, a marking, then the tool)
      view.focus();
    } else if (e.key === "Enter" && band.apply()) view.focus();
    else if (!control && key === "h") setTool(tool === "brush" ? null : "brush");
    else if (!control && key === "x") setTool(tool === "delete" ? null : "delete");
    else if (control && key === "z") {
      void edits.inTurn(() => (e.shiftKey ? edits.redo() : edits.undo()));
    } else if (control && key === "y") void edits.inTurn(() => edits.redo());
    else if (control && key === "s") void save();
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
          <button type="button" disabled={!changed || !editable} onClick={then(() => void edits.inTurn(() => edits.discard()))}>Discard</button>
          <button type="button" id="edit-brush" className={painting ? styles.on : ""} aria-pressed={painting} disabled={!editable}
                  title="Raise or lower the ground: click, or hold and move (H; Esc ends it)" onClick={then(() => { setTool(tool === "brush" ? null : "brush"); setBrushNote(null); })}>Elevation</button>
          <button type="button" id="edit-click-deletes" className={deleting ? styles.on : ""} aria-pressed={deleting} disabled={!editable}
                  title="Each click deletes what is under it, Ctrl+Z brings it back (X; Esc ends it)" onClick={then(() => setTool(tool === "delete" ? null : "delete"))}>Click deletes</button>
          <span className={styles.split}>
            <button type="button" id="edit-save" title="Write this track for Assetto Corsa (Ctrl+S)" disabled={!canSave} onClick={then(() => void save())}>Save</button>
            <button type="button" id="edit-save-more" aria-label="Save as new track" title="Save as new track …"
                    disabled={!editable || saving.busy} onClick={() => setAsking({play: false})}>▾</button>
          </span>
          <button type="button" id="edit-play" disabled={!canPlay} title="Save if needed, then drive it in Assetto Corsa"
                  onClick={then(() => void drive())}>{starting ? "Starting …" : "▶ Play"}</button>
          <span id="edit-saved" className={styles.state}>{savedText}</span>
          {state.save === "failed" && <span id="edit-kept" className={styles.state}>Changes not kept: trying again</span>}
        </div>
        {painting && (
          <div id="edit-brush-set" className={styles.row}>
            <button type="button" className={brush.lower ? "" : styles.on} aria-pressed={!brush.lower} title="The brush raises the ground (Shift: the other way)"
                    onClick={then(() => setBrush({...brush, lower: false}))}>Raise</button>
            <button type="button" className={brush.lower ? styles.on : ""} aria-pressed={brush.lower} title="The brush lowers the ground (Shift: the other way)"
                    onClick={then(() => setBrush({...brush, lower: true}))}>Lower</button>
            <label className={styles.number} title="How far one click moves the ground, at its middle (Alt + wheel)">Height <input type="number" min={MIN_HEIGHT} max={MAX_HEIGHT} value={brush.height}
                   onChange={e => setBrush({...brush, height: e.target.valueAsNumber || 0})} /> cm</label>
            <label className={styles.number} title="How fast the ground goes on moving while the button is held, where the ring is">Speed <input type="number" min={0} max={MAX_HEIGHT} step={5} value={brush.speed}
                   onChange={e => setBrush({...brush, speed: e.target.valueAsNumber || 0})} /> cm/s</label>
            <label className={styles.number} title="How far the brush reaches, the ring on the ground (Ctrl + wheel)">Radius <input type="number" min={MIN_RADIUS} max={MAX_RADIUS} value={brush.radius}
                   onChange={e => setBrush({...brush, radius: e.target.valueAsNumber || 0})} /> m</label>
            <label className={styles.number} title="How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge">Soft edge <input type="number" min={10} max={100} step={10} value={brush.soft}
                   onChange={e => setBrush({...brush, soft: e.target.valueAsNumber || 0})} /> %</label>
          </div>
        )}
        {band.points.length === 1 && <p id="edit-band" className={styles.line}>A is set: click B further along the road (Esc drops it).</p>}
        {band.points.length > 1 && (
          <div id="edit-band" className={styles.row}>
            {band.line && (
              <>
                <b className={styles.toolName}>Smooth</b>
                <label className={styles.number} title="From short waves only, the hills stay, up to a calm line from A to B (Alt + wheel)">Strength <input type="number" min={0} max={100} step={5} value={band.strength}
                       onChange={e => band.setStrength(e.target.valueAsNumber || 0)} /> %</label>
                <label className={styles.number} title="How wide the band is: at first the road's own (Ctrl + wheel)">Width <input type="number" min={3} max={60} value={Math.round(band.width)}
                       onChange={e => band.setWidth(e.target.valueAsNumber || null)} /> m</label>
              </>
            )}
            <span className={styles.state}>Enter takes it, Esc drops it. A click on the road adds a pin: drag it, right-click takes it away</span>
          </div>
        )}
        {brushNote && <p id="edit-brush-note" className={styles.line}>{brushNote}</p>}
        {viewFailed && (
          <p id="edit-view-failed" className={styles.line}>
            The view doesn&apos;t show the last change, it is kept all the same: {viewFailed}{" "}
            <button type="button" onClick={then(reopen)}>Load again</button>
          </p>
        )}
        {state.heights.length > 0 && <p id="edit-heights" className={styles.line}>{heightCount(state.heights.length)}</p>}
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
        <button type="button" disabled={!state.canUndo || !editable} onClick={then(() => void edits.inTurn(() => edits.undo()))}>↶ Undo</button>
        <button type="button" disabled={!state.canRedo || !editable} onClick={then(() => void edits.inTurn(() => edits.redo()))}>↷ Redo</button>
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
